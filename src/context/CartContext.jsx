import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDocs,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [declaredResults, setDeclaredResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Subscriptions ---
  useEffect(() => {
    if (!user) {
      setPurchasedTickets([]);
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Combined Subscription for Tickets and Notifications to avoid multiple listeners
    const unsubscribeTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
      const allTickets = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      // Admin sees everything; User sees only their own
      const visibleTickets = user.role === 'admin' 
        ? allTickets 
        : allTickets.filter(t => t.userId === user.uid);
        
      const sortedTickets = [...visibleTickets].sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
        return timeB - timeA;
      });
      setPurchasedTickets(sortedTickets);
    });

    const unsubscribeResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const allResults = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      // 1. Sort by newest first
      const sorted = allResults.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
        if (timeB !== timeA) return timeB - timeA;
        return String(b.id).localeCompare(String(a.id)); 
      });

      // 2. Deduplicate: Only keep the latest declaration for each unique draw/market slot
      const uniqueResults = [];
      const seenSlots = new Set();

      sorted.forEach(res => {
        // Use a composite key of date and draw time to ensure corrections work across different days
        const slotKey = `${res.date}_${res.draw}`;
        if (!seenSlots.has(slotKey)) {
          uniqueResults.push(res);
          seenSlots.add(slotKey);
        }
      });

      setDeclaredResults(uniqueResults);
    });

    const unsubscribeNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const allNotifs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      // Admin sees everything; User sees only their own
      const visibleNotifs = user.role === 'admin'
        ? allNotifs
        : allNotifs.filter(n => n.userId === user.uid);

      const sortedNotifs = visibleNotifs.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
        return timeB - timeA;
      });
      setNotifications(sortedNotifs);
    });

    setLoading(false);
    return () => {
      unsubscribeTickets();
      unsubscribeResults();
      unsubscribeNotifs();
    };
  }, [user]);

  const [lastAnnouncement, setLastAnnouncement] = useState(null);
  const ticketsRef = useRef([]);
  useEffect(() => { ticketsRef.current = purchasedTickets; }, [purchasedTickets]);

  const processingResults = React.useRef(new Set());

  // Sync Engine: Triggers Payouts and Announcements when new results arrive
  useEffect(() => {
    if (!declaredResults || declaredResults.length === 0 || !user) return;
    
    // 📣 1. BROADCAST LATEST ANNOUNCEMENT
    const latestResult = declaredResults[0];
    if (latestResult.digits && latestResult.number) {
      setLastAnnouncement({
        message: `RESULT DECLARED: ${latestResult.brand} (${latestResult.draw})`,
        ticker: `WINNING NUMBER FOR ${latestResult.draw}: ${latestResult.number}`,
        draw: latestResult.draw,
        number: latestResult.number
      });
    }

    // 💰 2. SCAN & PROCESS UNPROCESSED PAYOUTS
    const processAudit = async () => {
      if (!user?.uid || declaredResults.length === 0 || purchasedTickets.length === 0) return;

      const userTickets = purchasedTickets.filter(t => t.userId === user.uid);

      for (const res of declaredResults) {
        if (!res?.id || !res?.digits || processingResults.current.has(res.id)) continue;
        
        const resDraw = String(res.draw || "").trim();
        const resDate = String(res.date || "").trim();
        const ticketsToAudit = userTickets.filter(t => 
          String(t.draw || "").trim() === resDraw && 
          String(t.purchaseDate || "").trim() === resDate &&
          t.processedBy !== res.id
        );

        if (ticketsToAudit.length === 0) continue;

        // Lock this result to prevent duplicate processing in the same lifecycle
        processingResults.current.add(res.id);

        const winningCombos = {
          '1D_A': String(res.digits.A || ''), '1D_B': String(res.digits.B || ''), '1D_C': String(res.digits.C || ''),
          '2D_AB': `${res.digits.A || ''}${res.digits.B || ''}`, 
          '2D_BC': `${res.digits.B || ''}${res.digits.C || ''}`, 
          '2D_AC': `${res.digits.A || ''}${res.digits.C || ''}`,
          '3D_ABC': `${res.digits.A || ''}${res.digits.B || ''}${res.digits.C || ''}`,
          '4D_XABC': `${res.digits.X || ''}${res.digits.A || ''}${res.digits.B || ''}${res.digits.C || ''}`
        };

        const batch = writeBatch(db);
        let balanceAdj = 0;
        let anyChanges = false;

        ticketsToAudit.forEach(ticket => {
          if (!ticket.id) return;
          try {
            // Reverse old win ONLY IF it was from a DIFFERENT result ID
            if (ticket.status === 'Won' && ticket.prize && ticket.processedBy !== res.id) {
              const oldVal = parseInt(ticket.prize.replace(/[^\d]/g, '')) || 0;
              balanceAdj -= oldVal;
            }

            let isWinner = false;
            let winAmt = 0;
            const ticketNum = String(ticket.num || '');

            const ticketPriceKey = String(Math.floor(Number(ticket.price || 0)));

            if (ticket.type === '4D') {
              // 4D Tiered Cascading Logic: XABC -> ABC -> BC -> C
              const tierPrizes = res.prizes?.['4D']?.[ticketPriceKey] || {};
              if (ticketNum === winningCombos['4D_XABC']) {
                isWinner = true;
                winAmt = Number(tierPrizes.XABC || 0);
              } else if (ticketNum.slice(-3) === winningCombos['3D_ABC']) {
                isWinner = true;
                winAmt = Number(tierPrizes.ABC || 0);
              } else if (ticketNum.slice(-2) === winningCombos['2D_BC']) {
                isWinner = true;
                winAmt = Number(tierPrizes.BC || 0);
              } else if (ticketNum.slice(-1) === winningCombos['1D_C']) {
                isWinner = true;
                winAmt = Number(tierPrizes.C || 0);
              }
            } else if (ticket.type === '3D') {
              // 3D Tiered Cascading Logic: ABC -> BC -> C
              const tierPrizes = res.prizes?.['3D']?.[ticketPriceKey] || {};
              if (ticketNum === winningCombos['3D_ABC']) {
                isWinner = true;
                winAmt = Number(tierPrizes.ABC || 0);
              } else if (ticketNum.slice(-2) === winningCombos['2D_BC']) {
                isWinner = true;
                winAmt = Number(tierPrizes.BC || 0);
              } else if (ticketNum.slice(-1) === winningCombos['1D_C']) {
                isWinner = true;
                winAmt = Number(tierPrizes.C || 0);
              }
            } else {
              // Standard 1D/2D Positional Logic (Non-tiered)
              const lookupKey = `${ticket.type}_${ticket.pos}`;
              const targetNum = String(winningCombos[lookupKey] || '');
              isWinner = ticketNum === targetNum;
              if (isWinner) {
                winAmt = Number(res.prizes?.[ticket.type]?.[ticket.pos] || 0);
              }
            }
            
            const ticketRef = doc(db, 'tickets', String(ticket.id));
            if (isWinner) {
              const totalPayout = winAmt * Number(ticket.qty || 1);
              balanceAdj += totalPayout;
              batch.update(ticketRef, { 
                status: 'Won', prize: `₹ ${totalPayout}`, 
                processedBy: res.id, payoutDate: serverTimestamp() 
              });
            } else {
              batch.update(ticketRef, { status: 'Closed', prize: '₹ 0', processedBy: res.id });
            }
            anyChanges = true;
          } catch (err) { console.error("Sync error:", err); }
        });

        if (balanceAdj !== 0) {
          batch.update(doc(db, 'users', user.uid), { balance: increment(balanceAdj) });
          addNotification({ 
            userId: user.uid, 
            title: balanceAdj > 0 ? '🏆 WINNER!' : '⚠️ ADJUSTMENT', 
            message: `Result for ${resDraw} processed. Balance adjusted by ₹ ${balanceAdj}.`, 
            type: 'info' 
          });
        }

        if (anyChanges) {
          try { 
            await batch.commit(); 
            console.log(`✅ Audit Complete for: ${resDraw}`); 
          }
          catch (e) { 
            console.error(`❌ Sync failed`, e); 
            processingResults.current.delete(res.id); // Unlock on failure
          }
        } else {
          processingResults.current.delete(res.id);
        }
      }
    };
    processAudit();
  }, [declaredResults, purchasedTickets, user]);

  const addToCart = (entry) => setCart((prev) => [...prev, { ...entry, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]);
  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  const confirmPurchase = async (isPrepaid = false) => {
    if (cart.length === 0 || !user) return;
    
    const totalCost = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // If not prepaid, check balance
    if (!isPrepaid && user.balance < totalCost) {
      alert("Insufficient Balance!");
      return;
    }

    try {
      const txId = `TX${Math.floor(100000 + Math.random() * 900000)}`;
      const batch = writeBatch(db);

      const now = new Date();
      const purchaseDate = now.toISOString().split('T')[0];
      const purchaseTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      cart.forEach(item => {
        const ticketRef = doc(collection(db, 'tickets'));
        batch.set(ticketRef, {
          ...item,
          userId: user.uid,
          userName: user.name,
          purchaseId: txId,
          purchaseDate: purchaseDate,
          purchaseTime: purchaseTime,
          status: 'Active',
          paidVia: isPrepaid ? 'UPI' : 'Wallet',
          prize: '-',
          timestamp: serverTimestamp()
        });
      });

      // Deduct balance ONLY if NOT prepaid
      if (!isPrepaid) {
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, { balance: increment(-totalCost) });
      }

      await batch.commit();
      clearCart();
      addNotification({ 
        userId: user.uid,
        title: 'Confirmation', 
        message: `Receipt ${txId} generated successfully.`, 
        type: 'success' 
      });
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Transaction failed!");
    }
  };

  const addNotification = async (notif) => {
    await addDoc(collection(db, 'notifications'), {
      ...notif,
      timestamp: serverTimestamp(),
      read: false
    });
  };

  const markAllRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
      if (!n.read) {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      }
    });
    await batch.commit();
  };

  const addResult = async (data) => {
    const { X, A, B, C } = data.digits;
    const fullNum = `${X}${A}${B}${C}`;
    
    // Explicitly normalize everything to strings for the DB
    const normalizedDigits = {
      X: String(X),
      A: String(A),
      B: String(B),
      C: String(C)
    };

    await addDoc(collection(db, 'results'), {
      ...data,
      digits: normalizedDigits,
      number: fullNum,
      timestamp: serverTimestamp()
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const refreshTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ticketsQuery = user.role === 'admin' 
        ? collection(db, 'tickets')
        : query(collection(db, 'tickets'), where('userId', '==', user.uid));
        
      const snapshot = await getDocs(ticketsQuery);
      const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedTickets = [...tickets].sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
        return timeB - timeA;
      });
      setPurchasedTickets(sortedTickets);
    } catch (error) {
      console.error("Manual refresh error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, clearCart, confirmPurchase,
      cartTotal, purchasedTickets, declaredResults, addResult, lastAnnouncement,
      notifications, markAllRead, addNotification, loading, refreshTickets
    }}>
      {children}
    </CartContext.Provider>
  );
};


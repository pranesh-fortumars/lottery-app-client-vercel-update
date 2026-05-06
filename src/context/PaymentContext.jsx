import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [activePayment, setActivePayment] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState({ mode: 'auto', manualAccountId: 1 });
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      upiId: 'smserode143-4@okicici',
      bankName: 'Canara Bank 3970',
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('upi://pay?pa=smserode143-4@okicici&pn=Admin&cu=INR')}`
    },
    {
      id: 2,
      upiId: '9842180627-2@ybl',
      bankName: 'PhonePe UPI',
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('upi://pay?pa=9842180627-2@ybl&pn=Admin&cu=INR')}`
    }
  ]);

  // Synchronize with Firestore Settings
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'payment'), (snapshot) => {
      if (snapshot.exists()) {
        setPaymentConfig(snapshot.data());
      } else {
        // Initialize if doesn't exist
        setDoc(doc(db, 'settings', 'payment'), { mode: 'auto', manualAccountId: 1 });
      }
    });

    return () => unsubscribe();
  }, []);

  const calculateAutoAccount = () => {
    const baseDate = new Date('2024-01-01T00:00:00Z').getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
    const rotationIndex = Math.floor(diffDays / 2) % accounts.length;
    return accounts[rotationIndex];
  };

  useEffect(() => {
    const updateActiveAccount = () => {
      if (paymentConfig.mode === 'manual') {
        const manualAcc = accounts.find(a => a.id === paymentConfig.manualAccountId) || accounts[0];
        setActivePayment(manualAcc);
      } else {
        setActivePayment(calculateAutoAccount());
      }
    };

    updateActiveAccount();
    // Refresh every 30 mins for auto-rotation
    const interval = setInterval(updateActiveAccount, 1800000);
    return () => clearInterval(interval);
  }, [paymentConfig, accounts]);

  const setPaymentMode = async (mode) => {
    try {
      await setDoc(doc(db, 'settings', 'payment'), { ...paymentConfig, mode }, { merge: true });
      return true;
    } catch (error) {
      console.error("Mode switch failed:", error);
      return false;
    }
  };

  const setManualAccount = async (accountId) => {
    try {
      await setDoc(doc(db, 'settings', 'payment'), { mode: 'manual', manualAccountId: accountId }, { merge: true });
      return true;
    } catch (error) {
      console.error("Manual account set failed:", error);
      return false;
    }
  };

  return (
    <PaymentContext.Provider value={{ 
      activePayment, 
      accounts, 
      paymentConfig, 
      setPaymentMode, 
      setManualAccount 
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

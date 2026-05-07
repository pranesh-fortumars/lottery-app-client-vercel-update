import * as React from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData
          });
        } else {
          // If no doc exists (fallback), set basic user info
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user',
            name: firebaseUser.displayName || 'User',
            balance: 0
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, additionalData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Save additional user data to Firestore
      const userData = {
        name: additionalData.name || '',
        mobile: additionalData.mobile || '',
        referral: additionalData.referral || '',
        role: 'user',
        balance: 1000, // Initial balance
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      // Special Auto-Provisioning for Default Mock Accounts
      const isDefaultAdmin = email === 'admin@lottery.com' && password === 'admin123';
      const isDefaultUser = email === 'user@lottery.com' && password === 'user123';

      if (isDefaultAdmin || isDefaultUser) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          console.log(`Auto-provisioning default ${isDefaultAdmin ? 'admin' : 'user'} account...`);
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              name: isDefaultAdmin ? 'Super Admin' : 'Test User',
              mobile: isDefaultAdmin ? '0000000000' : '9999999999',
              role: isDefaultAdmin ? 'admin' : 'user',
              balance: isDefaultAdmin ? 999999 : 5000,
              status: 'Active',
              createdAt: new Date().toISOString()
            });
            return { success: true };
          } catch (signupError) {
            // If creation fails because user already exists but password was wrong, fall through to wrong password error
            if (signupError.code !== 'auth/email-already-in-use') {
              console.error("Default account setup failed:", signupError);
              return { success: false, message: "Setup failed. Please try again or use Signup." };
            }
          }
        }
      }
      
      console.error("Login error:", error);
      let message = "Invalid ID or Password. Please try again.";
      if (error.code === 'auth/network-request-failed') message = "Network error. Check your connection.";
      
      return { success: false, message: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: error.message };
    }
  };

  const updateBalance = async (amount) => {
    if (!user) return;
    const newBalance = (user.balance || 0) + amount;
    const updatedUser = { ...user, balance: newBalance };
    
    try {
      await setDoc(doc(db, 'users', user.uid), { balance: newBalance }, { merge: true });
      setUser(updatedUser);
    } catch (error) {
      console.error("Update balance error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateBalance, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


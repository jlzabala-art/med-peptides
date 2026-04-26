import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch the user's profile from Firestore
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            setUserProfile({ approved: false });
          }
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
          setUserProfile({ approved: false });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync with Zoho SalesIQ
  useEffect(() => {
    if (user && window.$zoho?.salesiq) {
      const name = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ') || user.displayName || 'Researcher';
      const email = user.email || '';
      
      try {
        window.$zoho.salesiq.visitor.name(name);
        window.$zoho.salesiq.visitor.email(email);
      } catch (e) {
        console.warn('SalesIQ sync failed:', e);
      }
    }
  }, [user, userProfile]);

  const isVerified = userProfile?.approved === true || userProfile?.isVerified === true;
  const allowedRoles = ['verified_medical', 'clinic', 'pharmacy', 'distributor', 'researcher'];
  const userRole = (userProfile?.role || userProfile?.userType || 'guest').toLowerCase();
  
  const isProfessional = user !== null && (isVerified || allowedRoles.some(role => userRole.includes(role)));
  const isAdmin = user !== null && userProfile?.role === 'admin';
  
  // Dev-only session diagnostic (stripped from production builds)
  useEffect(() => {
    if (!user || import.meta.env.PROD) return;
    console.log('[AuthContext] Session Hydrated:', {
      uid: user.uid,
      role: userRole,
      isVerified,
      isProfessional,
      sessionLoaded: !loading,
    });
  }, [user, userProfile, isProfessional, isVerified, loading, userRole]);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Fetch profile immediately after login
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
    }
    return cred;
  };

  const register = async (email, password, fullName, institution, userType) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    await updateProfile(cred.user, { displayName: fullName });
    // Split fullName into firstName / lastName for the canonical schema
    const nameParts = (fullName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    // Create Firestore profile (pending approval)
    const profile = {
      firstName,
      lastName,
      email,
      institution: institution || '',
      userType: userType || '',
      phone: '',
      shippingStreet: '',
      shippingCity: '',
      shippingZip: '',
      shippingCountry: '',
      billingStreet: '',
      billingCity: '',
      billingZip: '',
      billingCountry: '',
      taxId: '',
      approved: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    setUserProfile(profile);
    return cred;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    
    // Check if profile exists, if not create a basic one
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const nameParts = (cred.user.displayName || '').trim().split(' ');
      const profile = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: cred.user.email,
        institution: '',
        userType: '',
        phone: '',
        shippingStreet: '',
        shippingCity: '',
        shippingZip: '',
        shippingCountry: '',
        billingStreet: '',
        billingCity: '',
        billingZip: '',
        billingCountry: '',
        taxId: '',
        approved: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, profile);
      setUserProfile(profile);
    } else {
      setUserProfile(docSnap.data());
    }
    
    return cred;
  };

  const updateProfileData = async (data) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, data, { merge: true });
    // Update local state
    setUserProfile(prev => ({ ...prev, ...data }));
    // Sync displayName from firstName + lastName
    const first = data.firstName ?? user._profile?.firstName ?? '';
    const last = data.lastName ?? user._profile?.lastName ?? '';
    const displayName = [first, last].filter(Boolean).join(' ');
    if (displayName) {
      await updateProfile(user, { displayName });
    }
  };

  const value = {
    user,
    userProfile,
    isProfessional,
    isVerified,
    isAdmin,
    loading,
    login,
    register,
    logout,
    resetPassword,
    loginWithGoogle,
    updateProfileData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

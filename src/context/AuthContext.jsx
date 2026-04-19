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
      const name = userProfile?.fullName || user.displayName || 'Researcher';
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
  
  // Debugging logs for Testing 4 logic
  useEffect(() => {
    if (user) {
      console.log('[AuthContext] Session Hydrated:', {
        uid: user.uid,
        role: userRole,
        isVerified,
        isProfessional,
        sessionLoaded: !loading
      });
      
      if (!isProfessional && !loading) {
        console.warn('ACCESS_DENIED_DIAGNOSTIC:', {
          reason: !userProfile ? 'session_not_loaded' : (!isVerified ? 'not_verified' : 'missing_role'),
          role: userRole,
          isVerified
        });
      }
    }
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
    // Create Firestore profile (pending approval)
    const profile = {
      fullName,
      email,
      institution: institution || '',
      userType: userType || '',
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
      const profile = {
        fullName: cred.user.displayName || '',
        email: cred.user.email,
        institution: '',
        userType: '',
        approved: false, // Professional access still needs manual approval
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
    // If name changed, update firebase auth profile
    if (data.fullName) {
      await updateProfile(user, { displayName: data.fullName });
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

"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, storage } from '../firebase';




import { setAnalyticsUserId, setUserProperties, setAnalyticsUserRole } from '../hooks/useAnalytics';
import { setInsightsUserToken } from '../services/algoliaInsights';
import { getActiveTenantForResolution } from '../utils/resolvePrice';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      userProfile: null,
      activeRole: 'guest',
      isAdmin: false,
      isProfessional: false,
      isClinicAdmin: false,
      loading: false,
      permissions: {},
      tenant: null,
      logout: async () => {},
      login: async () => {},
      register: async () => {},
    };
  }
  return ctx;
}

export const ADMIN_EMAILS = [
  'jose@mediluxem.com',
  'kasia@mediluxem.com',
  'jose@mediluxeme.com',
  'kasia@mediluxeme.com',
  'business@mediluxeme.com',
  'admin@regenpept.test',
  'jlzabala@gmail.com'
];

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    canRecommend: true,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: true
  },
  clinic: {
    canRecommend: true,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: false
  },
  doctor: {
    canRecommend: true,
    canBulkOrder: false,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: true
  },
  wholesaler: {
    canRecommend: false,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: false
  },
  sales_agent: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: true
  },
  staff: {
    canRecommend: false,
    canBulkOrder: true,
    customSynthesis: false,
    clinicalLogs: true,
    manageStaff: false,
    trackCommission: false
  },
  patient: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: false
  },
  guest: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: false
  }
};

export function AuthProvider({ children, serverUser = null }) {
  const [user, setUser] = useState(serverUser);
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('regenpept_userProfile');
        return cached ? JSON.parse(cached) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  // If we have a serverUser (session cookie via middleware) AND a cached profile,
  // we can completely skip the global loading screen and start rendering instantly.
  const [loading, setLoading] = useState(!(serverUser && userProfile));
  const [manualActiveRole, setManualActiveRole] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('activeRole') : null));
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [isMfaEnrolled, setIsMfaEnrolled] = useState(serverUser ? serverUser.mfaEnrolled : false);

  // Sync role permissions in real-time from Firestore /settings/permissions
  useEffect(() => {
    if (!auth.currentUser) return;
    const docRef = doc(db, 'settings', 'permissions');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setRolePermissions(docSnap.data());
      }
    }, (err) => {
      console.warn('Could not listen to custom role permissions:', err);
    });
    return unsubscribe;
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // Safety timeout: if Firebase Auth doesn't respond in 8s, stop loading
    // so the app can show the login screen instead of hanging forever.
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId);
      setUser(firebaseUser);
      if (firebaseUser) {
        // Sincronizar token con el servidor de Next.js (Edge Middleware)
        try {
          const token = await firebaseUser.getIdToken();
          await fetch('/api/login', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          console.error('Failed to sync auth token to server', e);
        }

        setIsMfaEnrolled(firebaseUser.multiFactor?.enrolledFactors?.length > 0);
        setAnalyticsUserId(firebaseUser.uid);
        setInsightsUserToken(firebaseUser.uid);
        // Fetch the user's profile from Firestore
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);

          const docSnap = await getDoc(docRef);
          const userEmail = (firebaseUser.email || '').toLowerCase().trim();
          const isKnownAdmin = ADMIN_EMAILS.includes(userEmail);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (isKnownAdmin && (data.role !== 'admin' || !data.approved)) {
              data.role = 'admin';
              data.approved = true;
              data.professionalStatus = 'approved';
            }
            setUserProfile(data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('regenpept_userProfile', JSON.stringify(data));
            }

            // Set User Properties for GA4
            const gaRole = data.role === 'admin' ? 'admin'
              : (data.approved === true || data.isVerified === true) ? 'professional'
              : 'guest';
            setUserProperties({
              user_type: data.userType || 'guest',
              is_verified: data.approved === true || data.isVerified === true ? 'true' : 'false',
            });
            // Segment by role in GA4 user properties
            setAnalyticsUserRole(gaRole, firebaseUser.uid);
          } else {
            // Auth user exists but no Firestore doc yet
            const fallbackProfile = isKnownAdmin
              ? { approved: true, role: 'admin', professionalStatus: 'approved', email: userEmail, userType: 'admin' }
              : { approved: false, role: 'pending' };
            setUserProfile(fallbackProfile);
            setUserProperties({ user_type: fallbackProfile.role, is_verified: fallbackProfile.approved ? 'true' : 'false' });
            setAnalyticsUserRole(isKnownAdmin ? 'admin' : 'guest', firebaseUser.uid);
          }
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
          const userEmail = (firebaseUser.email || '').toLowerCase().trim();
          const isKnownAdmin = ADMIN_EMAILS.includes(userEmail);
          const fallbackProfile = isKnownAdmin
            ? { approved: true, role: 'admin', professionalStatus: 'approved', email: userEmail, userType: 'admin' }
            : { approved: false, role: 'pending' };
          setUserProfile(fallbackProfile);
          setAnalyticsUserRole(isKnownAdmin ? 'admin' : 'guest', firebaseUser.uid);
        }
      } else {
        // Sincronizar logout con el servidor
        try {
          await fetch('/api/logout');
        } catch (e) {
          console.error('Failed to clear auth token from server', e);
        }

        setUserProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('regenpept_userProfile');
        }
        setIsMfaEnrolled(false);
        setAnalyticsUserId(null); // Clear on logout
        setAnalyticsUserRole('guest', null); // Reset to guest role
        setInsightsUserToken(null);
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

  const baseRole = (ADMIN_EMAILS.includes(user?.email?.toLowerCase()) ? 'admin' : (userProfile?.role || 'guest')).toLowerCase();

  // Synchronously compute the activeRole to prevent route-guard race conditions
  const activeRole = useMemo(() => {
    if (!userProfile && !user) return 'guest';
    const stored = manualActiveRole;
    if (stored) {
      const canKeep = baseRole === 'admin' ||
                      (baseRole === 'clinic' && ['clinic', 'doctor', 'staff', 'guest'].includes(stored)) ||
                      (baseRole === 'compounding_pharmacy' && ['compounding_pharmacy', 'clinic', 'doctor', 'staff', 'guest'].includes(stored)) ||
                      (baseRole === 'wholesaler' && ['wholesaler', 'guest'].includes(stored)) ||
                      (baseRole === 'supplier' && ['supplier', 'guest'].includes(stored)) ||
                      (stored === baseRole);
      if (canKeep) return stored;
    }
    return baseRole;
  }, [userProfile, user, manualActiveRole, baseRole]);

  const switchActiveRole = (newRole) => {
    const allowed = baseRole === 'admin' ||
                    (baseRole === 'clinic' && ['clinic', 'doctor', 'staff', 'guest'].includes(newRole)) ||
                    (baseRole === 'compounding_pharmacy' && ['compounding_pharmacy', 'clinic', 'doctor', 'staff', 'guest'].includes(newRole)) ||
                    (baseRole === 'wholesaler' && ['wholesaler', 'guest'].includes(newRole)) ||
                    (baseRole === 'supplier' && ['supplier', 'guest'].includes(newRole));
    if (allowed) {
      setManualActiveRole(newRole);
      sessionStorage.setItem('activeRole', newRole);
    } else {
      console.warn(`User role '${baseRole}' not permitted to switch to '${newRole}'`);
    }
  };

  const activePermissions = useMemo(() => {
    const defaultPerms = rolePermissions[activeRole] || rolePermissions.guest || DEFAULT_ROLE_PERMISSIONS.guest;
    return {
      ...defaultPerms,
      ...(userProfile?.permissionsOverride || {})
    };
  }, [activeRole, rolePermissions, userProfile?.permissionsOverride]);

  const isVerified = userProfile?.approved === true || userProfile?.isVerified === true;
  const allowedRoles = ['verified_medical', 'clinic', 'staff', 'pharmacy', 'distributor', 'researcher', 'professional', 'doctor', 'medical_director', 'wholesaler', 'compounding_pharmacy', 'supplier'];
  const userRole = activeRole;
  
  // ── B2B Portal Role Helpers ───────────────────────────────────────────────
  // isPatient: user registered as a patient in the supervised purchasing portal
  const isPatient = user !== null && activeRole === 'patient';

  // isPhysician: user registered as a doctor or medical director
  const isPhysician = user !== null && (activeRole === 'doctor' || activeRole === 'medical_director');

  // isStaff: user registered as assistant/nurse/staff
  const isStaff = user !== null && activeRole === 'staff';

  // isProfessional: user must be logged in AND verified/approved OR be admin or doctor
  const isProfessional =
    user !== null &&
    (
      isVerified ||
      allowedRoles.includes(userRole) ||
      activeRole === 'admin'
    );

  // isProfessionalPending: submitted application but not yet approved
  const isProfessionalPending =
    user !== null &&
    (
      userProfile?.role.endsWith('_pending') ||
      userProfile?.role === 'professional_pending' ||
      userProfile?.professionalStatus === 'pending_review'
    );

  const isAdmin =
    user !== null &&
    (userProfile?.role === 'admin' || ADMIN_EMAILS.includes(user.email?.toLowerCase()));
  
  // Dev-only session diagnostic (stripped from production builds)
  useEffect(() => {
    if (!user || process.env.NODE_ENV === 'production') return;
    console.log('[AuthContext] Session Hydrated:', {
      uid: user.uid,
      role: userRole,
      baseRole,
      isVerified,
      isProfessional,
      activePermissions,
      sessionLoaded: !loading,
    });
  }, [user, userProfile, isProfessional, isVerified, loading, userRole, baseRole, activePermissions]);

  const login = async (email, password) => {
    const safeEmail = email ? email.trim().toLowerCase() : email;
    const cred = await signInWithEmailAndPassword(auth, safeEmail, password);
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    let profile = null;
    const isAdmin = ADMIN_EMAILS.includes(safeEmail);

    if (docSnap.exists()) {
      profile = docSnap.data();
      if (isAdmin && (profile.role !== 'admin' || !profile.approved)) {
        profile = {
          ...profile,
          role: 'admin',
          approved: true,
          professionalStatus: 'approved'
        };
        try {
          await updateDoc(docRef, { role: 'admin', approved: true, professionalStatus: 'approved' });
        } catch (e) {
          console.warn('[AuthContext] Could not update profile to admin:', e);
        }
      }
      setUserProfile(profile);
    } else if (isAdmin) {
      profile = {
        email: safeEmail,
        role: 'admin',
        approved: true,
        professionalStatus: 'approved',
        userType: 'admin',
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(docRef, profile);
      } catch (e) {
        console.warn('[AuthContext] Could not create admin profile:', e);
      }
      setUserProfile(profile);
    }
    setManualActiveRole(null);
    sessionStorage.removeItem('activeRole');
    return { cred, profile };
  };

  // Note: The `register` function has been refactored out to `src/hooks/useRegistration.js`
  // for better modularity and separation of concerns.

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setManualActiveRole(null);
    sessionStorage.removeItem('activeRole');
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    
    // Check if profile exists, if not create a basic one
    const userEmail = (cred.user.email || '').toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    let profile = null;

    if (!docSnap.exists()) {
      const nameParts = (cred.user.displayName || '').trim().split(' ');
      profile = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userEmail,
        institution: '',
        userType: isAdmin ? 'admin' : '',
        role: isAdmin ? 'admin' : 'pending',
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
        approved: isAdmin ? true : false,
        professionalStatus: isAdmin ? 'approved' : 'pending_review',
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(docRef, profile);
      } catch (e) {
        console.warn('[AuthContext] Could not set profile doc:', e);
      }
      setUserProfile(profile);
    } else {
      profile = docSnap.data();
      if (isAdmin && (profile.role !== 'admin' || !profile.approved)) {
        profile = {
          ...profile,
          role: 'admin',
          approved: true,
          professionalStatus: 'approved'
        };
        try {
          await updateDoc(docRef, { role: 'admin', approved: true, professionalStatus: 'approved' });
        } catch (e) {
          console.warn('[AuthContext] Could not update profile doc to admin:', e);
        }
      }
      setUserProfile(profile);
    }
    
    return { cred, profile };
  };

  const linkPassword = async (newPassword) => {
    if (!auth.currentUser) throw new Error('No user is currently authenticated.');
    const currentUser = auth.currentUser;
    const userEmail = currentUser.email;
    if (!userEmail) throw new Error('User does not have an associated email address.');

    let linked = false;

    // Check if the user already has a password provider linked
    const hasPasswordProvider = currentUser.providerData?.some(
      (p) => p.providerId === 'password'
    );

    if (hasPasswordProvider) {
      try {
        await updatePassword(currentUser, newPassword);
        linked = true;
      } catch (err) {
        console.warn('[linkPassword] updatePassword failed, trying server API fallback:', err);
      }
    } else {
      try {
        const credential = EmailAuthProvider.credential(userEmail, newPassword);
        await linkWithCredential(currentUser, credential);
        linked = true;
      } catch (err) {
        console.warn('[linkPassword] linkWithCredential failed, trying server API fallback:', err);
      }
    }

    // If client-side linking/update failed or needed fresh credentials, use our server API
    if (!linked) {
      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch('/api/auth/set-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ password: newPassword })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to link password via server');
        }
        linked = true;
      } catch (apiErr) {
        console.error('[linkPassword] Server API fallback also failed:', apiErr);
        throw apiErr;
      }
    }

    return true;
  };

  const updateProfileData = async (data) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, data, { merge: true });
    // Update local state
    setUserProfile(prev => ({ ...prev, ...data }));
    // Sync displayName from firstName + lastName
    const first = data.firstName ?? userProfile?.firstName ?? '';
    const last = data.lastName ?? userProfile?.lastName ?? '';
    const displayName = [first, last].filter(Boolean).join(' ');
    if (displayName) {
      await updateProfile(user, { displayName });
    }
  };

  const value = useMemo(() => ({
    user,
    userProfile,
    userRole,
    isProfessional,
    isProfessionalPending,
    isVerified,
    isAdmin,
    isMfaEnrolled,
    // ── B2B Portal roles ──
    isPatient,
    isPhysician,
    isStaff,
    loading,
    login,
    logout,
    resetPassword,
    linkPassword,
    loginWithGoogle,
    updateProfileData,
    activeRole,
    baseRole,
    switchActiveRole,
    activePermissions
  }), [
    user, 
    userProfile, 
    userRole, 
    isProfessional, 
    isProfessionalPending, 
    isVerified, 
    isAdmin,
    isMfaEnrolled,
    isPatient,
    isPhysician,
    isStaff,
    loading,
    activeRole,
    baseRole,
    activePermissions
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

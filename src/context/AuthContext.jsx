/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db } from '../firebase';
import { setAnalyticsUserId, setUserProperties, setAnalyticsUserRole } from '../hooks/useAnalytics';
import { getActiveTenantForResolution } from '../utils/resolvePrice';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export const ADMIN_EMAILS = ['jose@mediluxem.com', 'kasia@mediluxem.com', 'jose@mediluxeme.com', 'kasia@mediluxeme.com'];

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualActiveRole, setManualActiveRole] = useState(() => sessionStorage.getItem('activeRole'));
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);

  // Sync role permissions in real-time from Firestore /settings/permissions
  useEffect(() => {
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setAnalyticsUserId(firebaseUser.uid);
        // Fetch the user's profile from Firestore
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);

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
            // Auth user exists but no Firestore doc yet — treat as pending
            setUserProfile({ approved: false, role: 'pending' });
            setUserProperties({ user_type: 'pending', is_verified: 'false' });
            setAnalyticsUserRole('guest', firebaseUser.uid);
          }
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
          setUserProfile({ approved: false, role: 'pending' });
          setAnalyticsUserRole('guest', firebaseUser.uid);
        }
      } else {
        setUserProfile(null);
        setAnalyticsUserId(null); // Clear on logout
        setAnalyticsUserRole('guest', null); // Reset to guest role
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
  const allowedRoles = ['verified_medical', 'clinic', 'staff', 'pharmacy', 'distributor', 'researcher', 'professional', 'doctor', 'wholesaler', 'compounding_pharmacy', 'supplier'];
  const userRole = activeRole;
  
  // ── B2B Portal Role Helpers ───────────────────────────────────────────────
  // isPatient: user registered as a patient in the supervised purchasing portal
  const isPatient = user !== null && activeRole === 'patient';

  // isPhysician: user registered as a doctor/supervising professional
  const isPhysician = user !== null && activeRole === 'doctor';

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
    if (!user || import.meta.env.PROD) return;
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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    let profile = null;
    if (docSnap.exists()) {
      profile = docSnap.data();
      setUserProfile(profile);
    }
    setManualActiveRole(null);
    sessionStorage.removeItem('activeRole');
    return { cred, profile };
  };

  /**
   * register — creates a Firebase Auth user + Firestore profile.
   * @param {string} accountType
   *   'customer'     → role: 'guest',               professionalStatus: 'not_requested'
   *   'professional' → role: 'professional_pending', professionalStatus: 'pending_review'
   *   'patient'      → role: 'patient'              (B2B supervised portal)
   *   'doctor'       → role: 'doctor'               (B2B supervising professional)
   */
  const register = async (email, password, fullName, institution, userType, accountType = 'professional', extraFields = {}, goals = []) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    await updateProfile(cred.user, { displayName: fullName });
    // Split fullName into firstName / lastName for the canonical schema
    const nameParts = (fullName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const isCustomer = accountType === 'customer';
    const isPatientAccount = accountType === 'patient';
    const isPhysicianAccount = accountType === 'doctor';

    // ── Check Invitations for Roles ──────────────────────────────────────────
    let invitationRoles = [];
    let invitationId = null;
    let assignedManagerId = null;
    try {
      // First check by direct inviteId from URL
      if (extraFields.inviteId) {
        const invDocRef = doc(db, 'invitations', extraFields.inviteId);
        const invSnap = await getDoc(invDocRef);
        if (invSnap.exists() && invSnap.data().status === 'pending') {
          const invData = invSnap.data();
          if (invData.role) invitationRoles = [invData.role];
          if (invData.roles) invitationRoles = invData.roles;
          assignedManagerId = invData.createdBy || null;
          invitationId = invSnap.id;
        }
      }
      
      // Fallback: check by email
      if (!invitationId) {
        const invQ = query(
          collection(db, 'invitations'),
          where('email', '==', email.trim().toLowerCase()),
          where('status', '==', 'pending')
        );
        const invSnapDocs = await getDocs(invQ);
        if (!invSnapDocs.empty) {
          const invDoc = invSnapDocs.docs[0];
          const invData = invDoc.data();
          if (invData.role) invitationRoles = [invData.role];
          if (invData.roles && invData.roles.length > 0) {
            invitationRoles = invData.roles;
          }
          assignedManagerId = invData.createdBy || null;
          invitationId = invDoc.id;
        }
      }
    } catch (err) {
      console.warn('Could not check invitations:', err);
    }

    // ── Determine role ────────────────────────────────────────────────────────
    let role = 'professional_pending';
    let professionalStatus = 'pending_review';
    
    if (invitationRoles.length > 0) {
      role = invitationRoles[0]; // Set primary role to the first in array
      professionalStatus = 'approved'; // Pre-approved via invitation
    } else if (isCustomer) {
      role = 'guest';
      professionalStatus = 'not_requested';
    } else if (isPatientAccount) {
      role = 'patient';
      professionalStatus = 'not_requested';
    } else if (isPhysicianAccount) {
      role = 'doctor';
      professionalStatus = 'pending_review';
    } else if (['wholesaler', 'clinic', 'sales_agent', 'staff'].includes(accountType)) {
      role = `${accountType}_pending`;
      professionalStatus = 'pending_review';
    }

    const assignedRoles = invitationRoles.length > 0 ? invitationRoles : [role];

    // ── B2B Auto-Linking for Physician Invitations ──
    let initialPhysicianIds = [];
    if (role === 'patient' || role === 'guest') {
      try {
        const relsQ = query(
          collection(db, 'doctor_patient_relationships'),
          where('patientEmail', '==', email.trim().toLowerCase()),
          where('status', '==', 'pending')
        );
        const relSnap = await getDocs(relsQ);
        if (!relSnap.empty) {
          await Promise.all(relSnap.docs.map(async (relDoc) => {
            const relData = relDoc.data();
            const relId = relDoc.id;
            // Update relationship doc with new patient's UID and activate
            await updateDoc(doc(db, 'doctor_patient_relationships', relId), {
              patientId: cred.user.uid,
              status: 'active',
              activatedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            // Update doctor's profile to add this patient
            const doctorRef = doc(db, 'users', relData.doctorId);
            await updateDoc(doctorRef, { assignedPatientIds: arrayUnion(cred.user.uid) });
            // Add to doctor UIDs
            initialPhysicianIds.push(relData.doctorId);
          }));
        }
      } catch (err) {
        console.error('[B2B Auto-Link] failed:', err);
      }
    }

    const baseRoleKey = role.replace('_pending', '');
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[baseRoleKey] || DEFAULT_ROLE_PERMISSIONS.guest;

    const activeTenant = getActiveTenantForResolution();

    // Create Firestore profile
    const profile = {
      firstName,
      lastName,
      email,
      institution: institution || '',
      userType: (isCustomer || isPatientAccount) ? '' : (userType || ''),
      role,
      roles: assignedRoles, // NEW: multiple roles array
      professionalStatus,
      permissions: defaultPermissions,
      goals: goals || [],
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
      approved: (isPatientAccount || invitationRoles.length > 0) ? true : false,
      createdAt: new Date().toISOString(),
      // B2B Portal — relationship arrays (managed by assignment engine)
      assignedPhysicianIds: initialPhysicianIds,    // for patients: list of supervising doctor UIDs
      assignedPatientIds: [],                 // for doctors:  list of supervised patient UIDs
      // Tenant attribution B2B franchise
      assignedTenantId: activeTenant?.id || null,
      tenantId: activeTenant?.id || null,
      ownerType: activeTenant ? 'wholesaler' : null,
      ownerId: activeTenant ? (activeTenant.slug || activeTenant.id) : null,
      sourceDomain: activeTenant ? window.location.hostname : null,
      sourceTerritory: activeTenant?.territoryGeoIds?.[0] || null,
      attributionLocked: activeTenant ? true : false,
      // Account Manager Assignment (from invitation)
      ...(assignedManagerId && { assignedAccountManagerId: assignedManagerId }),
      // Professional-only extra fields (country, licenseId, intendedUse)
      ...(!isCustomer && !isPatientAccount ? { ...extraFields, inviteId: undefined } : {}),
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);

    // If there was an invitation, mark it as accepted securely via Cloud Function
    if (invitationId) {
      try {
        const functions = getFunctions();
        const acceptInv = httpsCallable(functions, 'acceptInvitation');
        await acceptInv({ inviteId: invitationId });
      } catch (e) {
        console.warn('Failed to call acceptInvitation cloud function:', e);
        // Fallback to client-side write if function isn't deployed yet or fails
        try {
          await updateDoc(doc(db, 'invitations', invitationId), {
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            userId: cred.user.uid
          });
        } catch (fallbackErr) {
          console.warn('Fallback invitation update failed:', fallbackErr);
        }
      }
    }
    
    // Fetch fresh profile in case Cloud Function updated roles/manager
    const freshProfileSnap = await getDoc(doc(db, 'users', cred.user.uid));
    setUserProfile(freshProfileSnap.exists() ? freshProfileSnap.data() : profile);
    
    return cred;
  };

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
    const cred = await signInWithPopup(auth, provider);
    
    // Check if profile exists, if not create a basic one
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    let profile = null;
    if (!docSnap.exists()) {
      const nameParts = (cred.user.displayName || '').trim().split(' ');
      profile = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: cred.user.email,
        institution: '',
        userType: '',
        role: 'pending',
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
      profile = docSnap.data();
      setUserProfile(profile);
    }
    
    return { cred, profile };
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
    // ── B2B Portal roles ──
    isPatient,
    isPhysician,
    isStaff,
    loading,
    login,
    register,
    logout,
    resetPassword,
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

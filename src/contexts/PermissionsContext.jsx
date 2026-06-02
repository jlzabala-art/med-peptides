import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from "../context/AuthContext";

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

// Fallback in case Firestore document doesn't exist yet
const DEFAULT_PERMISSIONS = {
  admin: {
    canRecommend: true,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: true,
    canAccessAdminDashboard: true,
    canAccessPhysicianDashboard: true,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
    canAccessCustomSynthesis: true,
  },
  doctor: {
    canRecommend: true,
    canAccessPhysicianDashboard: true,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
  }
};

export const PermissionsProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingPermissions(false);
      return;
    }

    const docRef = doc(db, 'settings', 'permissions');
    
    // Subscribe to real-time permission changes
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        setPermissions(docSnap.data());
      } else {
        // Initialize if doesn't exist
        try {
          await setDoc(docRef, DEFAULT_PERMISSIONS);
          setPermissions(DEFAULT_PERMISSIONS);
        } catch (err) {
          console.warn("Could not write default permissions, using local memory.", err);
        }
      }
      setLoadingPermissions(false);
    }, (error) => {
      console.error("Error fetching permissions:", error);
      setLoadingPermissions(false);
    });

    return () => unsubscribe();
  }, [user]);

  const hasPermission = (permissionKey) => {
    if (user?.email === 'jose@mediluxeme.com') return true;
    
    const role = profile?.role || 'user';
    if (role === 'admin') return true;

    if (!permissions || !permissions[role]) return false;
    return permissions[role][permissionKey] === true;
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, loadingPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

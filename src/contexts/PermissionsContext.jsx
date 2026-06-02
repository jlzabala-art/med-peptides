import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

// Fallback in case Firestore document doesn't exist yet
const DEFAULT_PERMISSIONS = {
  // 'tabId': ['allowedRole1', 'allowedRole2', ...]
  // '*' means all authenticated roles (that have access to admin panel)
  'dashboard': ['*'],
  'my-profile': ['*'],
  'messages': ['*'],
  'calendar': ['*'],

  // Sales & Support
  'leads': ['agency', 'support', 'wholeseller'],
  'orders': ['agency', 'support', 'wholeseller', 'logistics'],
  'bulk-orders': ['wholeseller'],
  
  // Medical/Clinical
  'doctors': ['support', 'agency'],
  'patients': ['doctor', 'support'],
  'clinical-ai': ['doctor', 'support'],
  'protocols': ['doctor', 'support', 'agency'],
  
  // Inventory / Products
  'products': ['support', 'agency', 'wholeseller'],
  'stock': ['logistics', 'support'],
  'variants': ['logistics'],
  'shipping': ['logistics', 'support', 'agency', 'wholeseller'],
  
  // Catalogs
  'catalogs': ['agency', 'wholeseller'],
  
  // By default, if a tab isn't listed, only 'admin' has access.
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

    const docRef = doc(db, 'system', 'role_permissions');
    
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

  const hasPermission = (tabId) => {
    const role = profile?.role || 'user';
    if (role === 'admin') return true;

    const allowedRoles = permissions[tabId];
    if (!allowedRoles) return false;

    if (allowedRoles.includes('*')) return true;
    return allowedRoles.includes(role);
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, loadingPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

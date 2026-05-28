/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const { isAdmin } = useAuth();
  const [adminData, setAdminData] = useState(null);

  // Here we would load global Admin data (e.g. system metrics)
  // isolated from the rest of the application
  useEffect(() => {
    if (isAdmin) {
      // Placeholder for admin data fetching
      setAdminData({ loaded: true });
    }
  }, [isAdmin]);

  return (
    <AdminContext.Provider value={{ adminData }}>
      {children}
    </AdminContext.Provider>
  );
}

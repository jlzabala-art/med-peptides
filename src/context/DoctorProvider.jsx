import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DoctorContext = createContext();

export function useDoctor() {
  return useContext(DoctorContext);
}

export function DoctorProvider({ children }) {
  const { isPhysician } = useAuth();
  const [patients, setPatients] = useState([]);

  // Load doctor-specific data (e.g. patients list) when needed
  useEffect(() => {
    if (isPhysician) {
      // Placeholder for doctor data fetching
    }
  }, [isPhysician]);

  return (
    <DoctorContext.Provider value={{ patients, setPatients }}>
      {children}
    </DoctorContext.Provider>
  );
}

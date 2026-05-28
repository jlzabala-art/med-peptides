import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PhysicianContext = createContext();

export function usePhysician() {
  return useContext(PhysicianContext);
}

export function PhysicianProvider({ children }) {
  const { isPhysician } = useAuth();
  const [patients, setPatients] = useState([]);

  // Load physician-specific data (e.g., patients list) when needed
  useEffect(() => {
    if (isPhysician) {
      // TODO: fetch physician data here
    }
  }, [isPhysician]);

  return (
    <PhysicianContext.Provider value={{ patients, setPatients }}>
      {children}
    </PhysicianContext.Provider>
  );
}

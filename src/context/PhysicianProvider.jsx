import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import userRepository from '../repositories/userRepository';

const PhysicianContext = createContext();

export function usePhysician() {
  return useContext(PhysicianContext);
}

export function PhysicianProvider({ children }) {
  const { isPhysician, authUser } = useAuth();
  const [patients, setPatients] = useState([]);

  // Load physician-specific data (e.g., patients list) when needed
  useEffect(() => {
    async function loadPatients() {
      if (isPhysician && authUser?.uid) {
        try {
          const docs = await userRepository.getPatientsByDoctor(authUser.uid);
          setPatients(docs);
        } catch (error) {
          console.error("Error fetching physician patients:", error);
        }
      } else {
        setPatients([]);
      }
    }
    
    loadPatients();
  }, [isPhysician, authUser]);

  return (
    <PhysicianContext.Provider value={{ patients, setPatients }}>
      {children}
    </PhysicianContext.Provider>
  );
}

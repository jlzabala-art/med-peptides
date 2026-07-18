'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase';

const ClinicalContext = createContext({});

export function ClinicalProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    async function loadClinicalData() {
      try {
        setLoading(true);
        // Pre-fetch basic clinical data to be shared across tabs
        const patientsSnap = await getDocs(query(collection(db, 'patients'), limit(100)));
        const protocolsSnap = await getDocs(query(collection(db, 'protocols'), limit(100)));
        
        setPatients(patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setProtocols(protocolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to load clinical data", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadClinicalData();
  }, []);

  return (
    <ClinicalContext.Provider value={{
      patients,
      protocols,
      loading,
      selectedPatientId,
      setSelectedPatientId
    }}>
      {children}
    </ClinicalContext.Provider>
  );
}

export function useClinical() {
  return useContext(ClinicalContext);
}

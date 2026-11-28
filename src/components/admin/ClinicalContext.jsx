'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import patientRepository from '@/repositories/patientRepository';
import { getAllProtocols } from '@/repositories/protocolRepository';

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
        const [patientsPage, protocolList] = await Promise.all([
          patientRepository.getPatientsPage({ pageSize: 100 }),
          getAllProtocols(),
        ]);

        setPatients(Array.isArray(patientsPage?.patients) ? patientsPage.patients : []);
        setProtocols(Array.isArray(protocolList) ? protocolList : []);
      } catch (err) {
        console.error('Failed to load clinical data', err);
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

"use client";
import React from 'react';
import UniversalPrescriptionsTable from '../shared/UniversalPrescriptionsTable';

export default function PatientPrescriptionsTab({ patientId }) {
  if (!patientId) return null;

  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)' }}>
      <UniversalPrescriptionsTable 
        patientId={patientId} 
        viewMode="patient" 
        readOnly={true}
        title="Mis Recetas"
        subtitle="Aquí puedes consultar todas tus recetas médicas e indicaciones clínicas."
      />
    </div>
  );
}

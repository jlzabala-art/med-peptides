"use client";
import React from 'react';
import UniversalPrescriptionsTable from '../shared/UniversalPrescriptionsTable';

export default function DoctorPrescriptionsTab({ doctorId }) {
  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)' }}>
      <UniversalPrescriptionsTable 
        doctorId={doctorId} 
        viewMode="doctor" 
        title="My Prescriptions"
        subtitle="Manage and track the prescriptions you have issued to your patients."
      />
    </div>
  );
}

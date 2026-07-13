"use client";
import React from 'react';
import UniversalPatientsTable from '../shared/UniversalPatientsTable';

export default function DoctorPatientsTab({ doctorId }) {
  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)' }}>
      <UniversalPatientsTable 
        doctorId={doctorId} 
        viewMode="doctor" 
        title="My Patients"
        subtitle="Manage and track your assigned patients."
        readOnly={false}
      />
    </div>
  );
}

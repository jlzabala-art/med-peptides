"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import UniversalPatientsTable from '../../../components/shared/UniversalPatientsTable';
import PageHeader from '../../../components/ui/PageHeader';
import { Users } from '@/lib/icons';

export default function MedicalPatientsPage() {
  const { userProfile } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <PageHeader 
        title="Patient Directory" 
        subtitle="Manage your patients, review health records, and create prescriptions."
        icon={Users}
      />
      <UniversalPatientsTable 
        doctorId={userProfile?.uid} 
        viewMode="doctor" 
        title="My Patients"
        subtitle="Centralized database for managing your assigned patients."
        readOnly={false}
      />
    </div>
  );
}


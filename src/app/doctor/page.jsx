'use client';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorContext } from '../../templates/DoctorDashboard';
import DoctorOverviewTab from '../../components/doctor/DoctorOverviewTab';

export default function DoctorRootPage() {
  const { doctorId, doctorMeta, sharedPatients } = useContext(DoctorContext) || {};
  const router = useRouter();
  
  return (
    <DoctorOverviewTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
      onNavigate={(id) => router.push(`/doctor/${id === 'overview' ? '' : id}`)}
    />
  );
}

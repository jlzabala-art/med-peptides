'use client';
import React, { useContext } from 'react';
import DashboardEngine from '../../engine/DashboardEngine';
import { PatientContext } from '../../templates/PatientHome';

export default function PatientRootPage() {
  const { userProfile, uid, name } = useContext(PatientContext) || {};
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <DashboardEngine role="patient" dataContext={{ userProfile, uid, name }} />
    </div>
  );
}

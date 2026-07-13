"use client";
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import UniversalPatientsTable from '../shared/UniversalPatientsTable';

export default function ManagerClientsTab() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div style={{ padding: '0', minHeight: 'calc(100vh - 150px)' }}>
      <UniversalPatientsTable 
        accountManagerId={currentUser.uid} 
        viewMode="manager" 
        title="My Clients"
        subtitle="Manage and track your assigned clinic clients."
        readOnly={false}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { useAdminRoleSimulation } from '@/hooks/admin/useAdminRoleSimulation';
import { Eye, X, AlertTriangle, ShieldCheck } from '@/lib/icons';

export default function ImpersonationBanner() {
  const { isSimulating, simulatedRole, impersonatedUser, exitImpersonation } = useAdminRoleSimulation();

  if (!isSimulating) return null;

  return (
    <div style={{
      backgroundColor: '#ea580c',
      color: '#ffffff',
      padding: '0.4rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.8rem',
      fontWeight: 600,
      position: 'sticky',
      top: 0,
      zIndex: 10000,
      boxShadow: '0 2px 10px rgba(234, 88, 12, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Eye size={16} />
        <span>
          {impersonatedUser ? (
            <>
              Simulating User Session: <strong>{impersonatedUser.displayName || impersonatedUser.name || impersonatedUser.email}</strong> ({impersonatedUser.role?.toUpperCase() || 'USER'}) · <em>Viewing pricing and patient records as this account</em>
            </>
          ) : (
            <>
              Simulating Role View: <strong>{simulatedRole?.toUpperCase()}</strong> · <em>RBAC Preview Mode</em>
            </>
          )}
        </span>
      </div>

      <button
        onClick={exitImpersonation}
        style={{
          backgroundColor: '#ffffff',
          color: '#ea580c',
          border: 'none',
          borderRadius: '6px',
          padding: '2px 10px',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}
      >
        <X size={13} /> Exit Simulation
      </button>
    </div>
  );
}

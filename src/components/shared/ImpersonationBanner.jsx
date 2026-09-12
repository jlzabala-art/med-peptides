'use client';

import React, { useEffect, useState } from 'react';
import { useAdminRoleSimulation } from '@/hooks/admin/useAdminRoleSimulation';
import { useAuth } from '@/context/AuthContext';
import { Eye, X, ShieldAlert, LogOut } from '@/lib/icons';
import { normalizeRole, ROLE_METADATA } from '@/constants/roles';

export default function ImpersonationBanner() {
  const { isSimulating, simulatedRole, impersonatedUser, exitImpersonation } = useAdminRoleSimulation();
  const { user, switchActiveRole } = useAuth();
  const [sessionImpersonating, setSessionImpersonating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSessionImp = sessionStorage.getItem('isImpersonating') === 'true';
      setSessionImpersonating(isSessionImp);
    }
  }, [user]);

  const active = isSimulating || sessionImpersonating;
  if (!active) return null;

  const handleExit = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isImpersonating');
    }
    exitImpersonation();
    if (switchActiveRole) {
      switchActiveRole('admin');
    }
  };

  const canonicalRoleKey = normalizeRole(simulatedRole);
  const roleLabel = ROLE_METADATA[canonicalRoleKey]?.label || simulatedRole?.toUpperCase() || 'PREVIEW';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: '#ea580c',
        color: '#ffffff',
        padding: '0.45rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.82rem',
        fontWeight: 600,
        position: 'sticky',
        top: 0,
        zIndex: 10000,
        boxShadow: '0 2px 10px rgba(234, 88, 12, 0.35)',
        letterSpacing: '0.01em',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Eye size={17} style={{ flexShrink: 0 }} />
        <span>
          {impersonatedUser ? (
            <>
              Simulating User Session: <strong>{impersonatedUser.displayName || impersonatedUser.name || impersonatedUser.email}</strong> ({impersonatedUser.role?.toUpperCase() || 'USER'}) · <em>Viewing pricing and patient records as this account</em>
            </>
          ) : (
            <>
              Simulating Role View: <strong>{roleLabel}</strong> · <em>RBAC Preview Mode (Scoped Permissions)</em>
            </>
          )}
        </span>
      </div>

      <button
        onClick={handleExit}
        type="button"
        style={{
          backgroundColor: '#ffffff',
          color: '#ea580c',
          border: 'none',
          borderRadius: '6px',
          padding: '4px 12px',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff7ed'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
      >
        <X size={14} /> Exit Preview
      </button>
    </div>
  );
}

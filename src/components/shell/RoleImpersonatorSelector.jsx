"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { X } from '@/lib/icons';

/**
 * RoleImpersonatorSelector (Option 1 Standard)
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Tool (Rule #14) for UX preview & verification.
 * 
 * - In standard Admin View: Renders nothing in the header (zero clutter; switching
 *   is accessible via User Profile menu).
 * - In Active Simulation: Renders a high-visibility badge indicating the simulated
 *   role with a quick 1-click Exit (✕) button.
 */
export default function RoleImpersonatorSelector() {
  const { userRole, isImpersonating, setImpersonatedRole } = useAuth();
  const { is } = useRoleAccess();
  const [currentRole, setCurrentRole] = useState(userRole || 'admin');

  useEffect(() => {
    if (userRole) setCurrentRole(userRole);
  }, [userRole]);

  // Only render when an active simulation is in progress
  if (!isImpersonating || currentRole === 'admin') return null;

  const roles = [
    { id: 'admin', label: 'Admin View', color: '#003666', icon: '🏛️' },
    { id: 'doctor', label: 'Doctor View', color: '#0d9488', icon: '🩺' },
    { id: 'patient', label: 'Patient View', color: '#7c3aed', icon: '👤' },
    { id: 'wholesaler', label: 'Wholesaler View', color: '#c2410c', icon: '🏢' },
    { id: 'clinic', label: 'Clinic View', color: '#16a34a', icon: '🏥' },
  ];

  const activeRoleData = roles.find((r) => r.id === currentRole) || {
    id: currentRole,
    label: `${currentRole} View`,
    color: '#6366f1',
    icon: '🎭',
  };

  const handleExitSimulation = () => {
    setCurrentRole('admin');
    if (setImpersonatedRole) {
      setImpersonatedRole(null);
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        backgroundColor: `${activeRoleData.color}18`,
        border: `1.5px solid ${activeRoleData.color}50`,
        fontSize: '0.75rem',
        fontWeight: 700,
        color: activeRoleData.color,
        letterSpacing: '0.01em',
        animation: 'fadeIn 0.2s ease',
      }}
      title="Active UX Simulation — click ✕ to return to Admin View"
    >
      <span>{activeRoleData.icon}</span>
      <span>Simulating: {activeRoleData.label}</span>
      <button
        onClick={handleExitSimulation}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 2px',
          marginLeft: '4px',
          color: activeRoleData.color,
          fontWeight: 800,
          fontSize: '0.85rem',
          display: 'inline-flex',
          alignItems: 'center',
          opacity: 0.8,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
        title="Exit Simulation"
      >
        ✕
      </button>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';


import { signOut } from 'firebase/auth';
import * as fb from '../../../firebase';
const auth = fb?.auth;
import { useAuth } from '../../../context/AuthContext';
import { AlertTriangle, LogOut } from '@/lib/icons';

export default function ImpersonationBanner() {
  const { user } = useAuth();
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // Check if the current window/tab is in impersonation mode
    const impersonating = sessionStorage.getItem('isImpersonating') === 'true';
    setIsImpersonating(impersonating);
  }, [user]);

  if (!isImpersonating || !user) return null;

  const handleEndImpersonation = async () => {
    sessionStorage.removeItem('isImpersonating');
    await signOut(auth);
    window.close(); // Try to close the impersonation tab
    // Fallback if window.close() is blocked by browser
    window.location.href = '/'; 
  };

  return (
    <div style={{
      backgroundColor: 'var(--danger)',
      color: 'white',
      padding: '0.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      zIndex: 9999,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={16} />
        <span>⚠️ Estás navegando como: {user.fullName || user.email}</span>
      </div>
      <button 
        onClick={handleEndImpersonation}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      >
        <LogOut size={14} />
        Terminar Sesión Simulada
      </button>
    </div>
  );
}
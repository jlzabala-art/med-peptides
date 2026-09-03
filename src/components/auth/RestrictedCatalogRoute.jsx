"use client";
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from '@/lib/icons';

export default function RestrictedCatalogRoute({ catalogName, children }) {
  const { userProfile, activeRole } = useAuth();

  // Admins always have access
  if (activeRole === 'admin') {
    return children;
  }

  // Check if the user has specific catalog restrictions
  const allowedCatalogs = userProfile?.allowedCatalogs;
  if (allowedCatalogs && Array.isArray(allowedCatalogs)) {
    if (!allowedCatalogs.includes(catalogName)) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', textAlign: 'center', padding: '2rem'
        }}>
          <ShieldAlert size={64} style={{ color: 'var(--accent-color, #ff4b4b)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-color, #111)' }}>
            Restricted Access
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-color-light, #666)', maxWidth: '500px', lineHeight: 1.6 }}>
            Your account does not have permissions to access the <strong>{catalogName}</strong> catalog. 
            Please contact your account manager to request access.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary"
            style={{ marginTop: '2rem' }}
          >
            Go Back
          </button>
        </div>
      );
    }
  }

  return children;
}
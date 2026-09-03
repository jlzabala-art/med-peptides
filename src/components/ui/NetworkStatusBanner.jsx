"use client";

import React, { useState, useEffect } from 'react';
import { CloudOff, CheckCircle2 } from '@/lib/icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function NetworkStatusBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.45rem 1.1rem',
        borderRadius: '30px',
        fontSize: '0.82rem',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: !isOnline ? 'rgba(245, 158, 11, 0.95)' : 'rgba(22, 163, 74, 0.95)',
        color: '#ffffff',
      }}
    >
      {!isOnline ? (
        <>
          <CloudOff size={16} />
          <span>Sin conexión — Operando en modo offline</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={16} />
          <span>Conexión reestablecida ✓ Sincronizado</span>
        </>
      )}
    </div>
  );
}

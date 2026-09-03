"use client";

import React, { useEffect, useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { X, BellRing } from 'lucide-react';

export default function PushNotificationPrompt() {
  const { permission, requestPermission } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if we haven't asked yet and the browser supports it
    if (permission === 'default') {
      const dismissed = localStorage.getItem('pushPromptDismissed');
      if (!dismissed) {
        // Small delay so it's not too aggressive
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [permission]);

  if (!visible || permission !== 'default') return null;

  const handleDismiss = () => {
    localStorage.setItem('pushPromptDismissed', 'true');
    setVisible(false);
  };

  const handleEnable = async () => {
    await requestPermission();
    setVisible(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: 'var(--bg-surface, #ffffff)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      maxWidth: '340px',
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start'
    }}>
      <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '50%' }}>
        <BellRing size={20} color="#2563eb" />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Enable Notifications
        </h4>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Get instantly notified about your prescriptions, orders, and appointments.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleEnable}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Allow
          </button>
          <button
            onClick={handleDismiss}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Not Now
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

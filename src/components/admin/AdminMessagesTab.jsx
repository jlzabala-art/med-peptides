'use client';
import React from 'react';
import MessagingApp from '../shared/MessagingApp';
import { useAuth } from '../../context/AuthContext';

export default function AdminMessagesTab() {
  // AuthContext exposes `user` and `userRole`, not `currentUser` / `role`
  const { user, userRole } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#202124' }}>Communications Hub</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: '#5f6368', fontSize: '0.9rem' }}>
          Manage conversations with doctors, patients, and partners.
        </p>
      </div>

      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
        <MessagingApp
          currentUser={{
            uid: user.uid,
            displayName: user.displayName || 'Admin',
            role: userRole || 'admin',
          }}
        />
      </div>
    </div>
  );
}

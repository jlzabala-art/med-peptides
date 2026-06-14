import React from 'react';
import MessagingApp from '../shared/MessagingApp';
import { useAuth } from '../../context/AuthContext';

export default function ManagerMessagesTab() {
  const { currentUser, role } = useAuth(); // Assume role is managed somewhere globally

  if (!currentUser) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#202124' }}>Communications Hub</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: '#5f6368', fontSize: '0.9rem' }}>
          Manage transactions and assist doctors and patients.
        </p>
      </div>
      
      <div style={{ flex: 1 }}>
        <MessagingApp currentUser={{ uid: currentUser.uid, displayName: currentUser.displayName || 'Account Manager', role: role || 'account_manager' }} />
      </div>
    </div>
  );
}

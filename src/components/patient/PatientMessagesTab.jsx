import React from 'react';
import MessagingApp from '../shared/MessagingApp';
import { useUser } from '../../context/UserContext';

export default function PatientMessagesTab() {
  const { user } = useUser();

  if (!user) return <div>Loading messages...</div>;

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#202124' }}>Messages</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: '#5f6368', fontSize: '0.9rem' }}>
          Communicate with your doctor and account manager.
        </p>
      </div>
      
      <div style={{ flex: 1 }}>
        <MessagingApp currentUser={{ uid: user.uid, displayName: user.name, role: 'patient' }} />
      </div>
    </div>
  );
}

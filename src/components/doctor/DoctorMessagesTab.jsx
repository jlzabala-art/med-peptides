import React from 'react';
import MessagingApp from '../shared/MessagingApp';
import { useDoctor } from '../../context/DoctorProvider';

export default function DoctorMessagesTab() {
  const { doctorData } = useDoctor();

  if (!doctorData) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#202124' }}>Communications</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: '#5f6368', fontSize: '0.9rem' }}>
          Connect with your patients and your dedicated account manager.
        </p>
      </div>
      
      <div style={{ flex: 1 }}>
        <MessagingApp currentUser={{ uid: doctorData.id, displayName: `Dr. ${doctorData.lastName || 'Doctor'}`, role: 'doctor' }} />
      </div>
    </div>
  );
}

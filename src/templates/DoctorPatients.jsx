import React from 'react';
import { useAuth } from '../context/AuthContext';
import PhysicianPatientsTab from '../components/doctor/DoctorPatientsTab';

export default function DoctorPatients() {
  const { user, userProfile } = useAuth();
  
  const doctorId = user?.uid;
  const doctorName = userProfile?.firstName
    ? `Dr. ${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : (user?.displayName || 'Physician');
  const doctorMeta = { doctorName, specialty: userProfile?.specialty || '' };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', padding: '1.5rem', border: '1px solid #dadce0', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)' }}>
      {doctorId ? (
        <PhysicianPatientsTab 
          doctorId={doctorId}
          doctorMeta={doctorMeta}
        />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>
          No se ha detectado una sesión activa de médico.
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Stethoscope, MessageSquare } from 'lucide-react';

export default function MyMedicalTeamWidget() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [team, setTeam] = useState([]);

  useEffect(() => {
    async function fetchTeam() {
      if (!user?.uid) return;
      const q = query(collection(db, 'doctor_patient_relationships'), where('patientId', '==', user.uid), where('status', '==', 'active'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeam(list);
    }
    fetchTeam();
  }, [user]);

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Stethoscope size={18} color="var(--primary)" /> {t('patient.medical_team.title')}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {team.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{t('patient.medical_team.empty')}</p>
        ) : (
          team.map(member => (
            <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--color-bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,54,102,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {member.doctorName ? member.doctorName.charAt(0) : 'D'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Dr. {member.doctorName || t('patient.medical_team.treating_physician')}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t('patient.medical_team.treating_physician')}</div>
                </div>
              </div>
              <button style={{ padding: '0.5rem', background: '#eff6ff', color: 'var(--color-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <MessageSquare size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

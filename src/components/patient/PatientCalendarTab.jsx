"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;
import DosingCalendar from '../../features/prescriptions/DosingCalendar';

export default function PatientCalendarTab({ patientUid }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrescriptions() {
      if (!patientUid) return;
      try {
        const q = query(
          collection(db, 'prescriptions'),
          where('patient.uid', '==', patientUid)
        );
        const snap = await getDocs(q);
        const activeRxs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(rx => rx.status !== 'cancelled' && rx.status !== 'completed'); // Only show active/ordered rx schedules
        setPrescriptions(activeRxs);
      } catch (err) {
        console.error('Error loading patient prescriptions for calendar:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrescriptions();
  }, [patientUid]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading calendar...
      </div>
    );
  }

  // We map the patient's active prescriptions to the DosingCalendar
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,54,102,0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
          My Treatment Schedule
        </h3>
        {prescriptions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            You do not have any active treatment schedules yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {prescriptions.map(rx => (
              <div key={rx.id}>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  Prescription from {rx.doctorName || 'Doctor'} 
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-tertiary)', marginLeft: '0.5rem' }}>
                    ({new Date(rx.createdAt?.toDate?.() || Date.now()).toLocaleDateString()})
                  </span>
                </h4>
                <DosingCalendar 
                  selectedItems={rx.items || []} 
                  prescription={rx} 
                  readOnly={true} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

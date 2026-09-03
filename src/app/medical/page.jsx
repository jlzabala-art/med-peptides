"use client";

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDoctorPatients } from '../../hooks/data/useDoctorPatients';
import { useDoctorPrescriptions } from '../../hooks/data/useDoctorPrescriptions';
import { Users, ClipboardList, Brain, Calendar } from '@/lib/icons';

export default function MedicalOverviewPage() {
  const { userProfile } = useAuth();
  
  // We use our new hooks to load quick stats. 
  // For dashboard stats, we don't strictly need to load ALL of them, but we fetch the first page.
  const { patients, loading: loadingPatients } = useDoctorPatients({ doctorId: userProfile?.uid, pageSize: 5 });
  const { prescriptions, loading: loadingRx } = useDoctorPrescriptions({ doctorId: userProfile?.uid, pageSize: 5 });

  const stats = [
    { label: 'Active Patients', value: loadingPatients ? '...' : patients.length, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Recent Prescriptions', value: loadingRx ? '...' : prescriptions.length, icon: ClipboardList, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Upcoming Appointments', value: '3', icon: Calendar, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Atlas Insights', value: '2 New', icon: Brain, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Welcome, Dr. {userProfile?.lastName || userProfile?.firstName || 'Physician'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Here is your clinical overview for today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: stat.bg, 
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={28} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
              <div style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2 }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Recent Patients */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--primary)" /> Recent Patients
            </h2>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ padding: '1rem' }}>
            {loadingPatients ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
              </div>
            ) : patients.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No patients assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {patients.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: 'var(--bg-app)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {p.firstName?.[0] || 'P'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.firstName} {p.lastName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={20} color="var(--primary)" /> Recent Prescriptions
            </h2>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ padding: '1rem' }}>
            {loadingRx ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
              </div>
            ) : prescriptions.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No recent prescriptions.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {prescriptions.map(rx => (
                  <div key={rx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', background: 'var(--bg-app)' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{rx.patientName || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(rx.createdAt?.toDate?.() ?? 0).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#ecfdf5', color: '#10b981' }}>
                      {rx.status || 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

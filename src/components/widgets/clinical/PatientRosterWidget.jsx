import React from 'react';
import { Users, UserPlus, ChevronRight } from '@/lib/icons';
import BaseWidget from '../core/BaseWidget';

export default function PatientRosterWidget(props) {
  const { role = 'doctor' } = props;

  // Mock data for UI preview
  const patients = [
    { id: '1', name: 'Sarah Al-Maktoum', lastVisit: '2 days ago', status: 'Active Protocol' },
    { id: '2', name: 'Dr. Alexander Klein', lastVisit: '1 week ago', status: 'Under Review' },
    { id: '3', name: 'Fatima Zahra', lastVisit: '3 weeks ago', status: 'Active Protocol' },
  ];

  return (
    <BaseWidget 
      title={role === 'admin' ? "Global Patient Directory" : "Active Patient Roster"} 
      icon={Users} 
      {...props}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search patient..." 
            style={{
              width: '100%',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#003666',
            color: '#ffffff',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <UserPlus size={14} />
          <span>Add</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {patients.map(patient => (
          <div 
            key={patient.id} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e40af',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              >
                {patient.name.charAt(0)}
              </div>
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>{patient.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{patient.lastVisit}</span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#94a3b8' }}></span>
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>{patient.status}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </div>
        ))}
      </div>
    </BaseWidget>
  );
}

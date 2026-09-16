import React from 'react';
import { Activity, Clock } from '@/lib/icons';
import BaseWidget from '../core/BaseWidget';

export default function ClinicalHistoryWidget(props) {
  const { role = 'doctor' } = props;

  const logs = [
    { id: '1', date: '12 May, 2026', time: '10:30 AM', action: 'Prescription Signed', detail: 'BPC-157 / TB-500 Compound transmitted to pharmacy', user: 'Dr. Hanieh Erdmann' },
    { id: '2', date: '05 May, 2026', time: '14:15 PM', action: 'SOAP Consultation', detail: 'Patient reported joint mobility improvement and hair density increase', user: 'Dr. Hanieh Erdmann' },
    { id: '3', date: '28 Apr, 2026', time: '09:00 AM', action: 'Lab Panel Reviewed', detail: 'IGF-1 & hormonal baseline confirmed within clinical target range', user: 'Dr. Hanieh Erdmann' },
  ];

  return (
    <BaseWidget 
      title={role === 'patient' ? "My Clinical History" : "Clinical Activity Log"} 
      icon={Activity} 
      {...props}
    >
      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
        {logs.map((log) => (
          <div key={log.id} style={{ position: 'relative' }}>
            {/* Timeline Dot */}
            <div style={{ position: 'absolute', left: '-31px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#003666', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #bfdbfe' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.85rem', fontWeight: 800 }}>{log.action}</h4>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.74rem', color: '#64748b', gap: '4px' }}>
                <Clock size={12} />
                <span>{log.date}</span>
              </div>
            </div>
            
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>{log.detail}</p>
            
            {role !== 'patient' && (
              <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>By: {log.user}</p>
            )}
          </div>
        ))}
      </div>
    </BaseWidget>
  );
}

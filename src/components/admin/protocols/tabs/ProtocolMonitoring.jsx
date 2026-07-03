import React from 'react';
import { Activity, HeartPulse, AlertCircle } from '@/lib/icons';
import ClinicalProgressTracker from '../ClinicalProgressTracker';

export default function ProtocolMonitoring({ protocol, onUpdate }) {
  
  const milestonesCount = protocol?.phases?.reduce((acc, phase) => acc + (phase.items?.length || 0), 0) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header & KPI Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HeartPulse size={24} color="var(--primary)" /> Patient Monitoring & Tracking
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Track expected clinical outcomes, required patient check-ins, and potential side-effects throughout the protocol lifecycle.
          </p>
        </div>
      </div>

      {/* Mini KPIs for Monitoring */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #fecaca' }}>
          <div style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Clinical Milestones</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} /> {milestonesCount} Check-ins
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #fef08a' }}>
          <div style={{ color: '#a16207', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Adverse Events</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#713f12', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={24} /> Log
          </div>
        </div>
      </div>

      {/* Embedded Deep Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
             <HeartPulse size={18} color="var(--primary)" /> Progress Tracker
          </h4>
          <ClinicalProgressTracker protocol={protocol} />
        </div>
      </div>
      
    </div>
  );
}

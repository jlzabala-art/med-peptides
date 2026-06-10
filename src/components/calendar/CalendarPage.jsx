import React from 'react';
import RegeneraCalendar from './RegeneraCalendar';
import { Card } from '../ui';
import './CalendarCloud.css'; 

export default function CalendarPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-section)', paddingBottom: '5rem' }}>
      
      {/* Row 1: Clinical Schedule Description */}
      <div>
        <h1 className="atlas-h1">Clinical Schedule</h1>
        <p className="atlas-helper-text" style={{ fontSize: '0.875rem' }}>
          Manage prescriptions, protocols, and patient consultations.
        </p>
      </div>
      
      {/* Row 2: KPI Cards */}
      <div className="cal-dashboard-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-card)' }}>
        
        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-secondary)' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <span className="atlas-label">Today's Prescriptions</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cal-color-text-primary)' }}>12</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cal-color-primary)', fontWeight: 600 }}>+8% vs yesterday</div>
        </div>

        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-secondary)' }}>
            <span style={{ fontSize: '1.2rem' }}>📞</span>
            <span className="atlas-label">Pending Follow-ups</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cal-color-text-primary)' }}>4</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cal-color-text-muted)' }}>Action required</div>
        </div>

        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-secondary)' }}>
            <span style={{ fontSize: '1.2rem' }}>🧬</span>
            <span className="atlas-label">Tests Due</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cal-color-text-primary)' }}>7</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cat-order)', fontWeight: 600 }}>3 High Priority</div>
        </div>

      </div>

      {/* Row 3-6: Calendar Component */}
      <div className="atlas-card" style={{ padding: 0, overflow: 'hidden' }}>
        <RegeneraCalendar />
      </div>
    </div>
  );
}

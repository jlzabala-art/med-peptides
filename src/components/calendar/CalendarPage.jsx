import React, { useState } from 'react';
import RegeneraCalendar from './RegeneraCalendar';
import { Card } from '../ui';
import './CalendarCloud.css'; 

export default function CalendarPage({ defaultViewMode = 'all' }) {
  const [viewMode, setViewMode] = useState(defaultViewMode); // 'all', 'clinical', 'logistics'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-section)', paddingBottom: '5rem' }}>
      
      {/* Header and Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="atlas-h1">Smart Schedule</h1>
          <p className="atlas-helper-text" style={{ fontSize: '0.875rem' }}>
            Manage prescriptions, protocols, patient consultations, and shipments.
          </p>
        </div>

        <div style={{ display: 'flex', background: 'var(--cal-bg-surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--cal-border)' }}>
          <button 
            onClick={() => setViewMode('all')}
            style={{ padding: '6px 16px', border: 'none', background: viewMode === 'all' ? 'var(--cal-color-primary)' : 'transparent', color: viewMode === 'all' ? '#fff' : 'var(--cal-color-text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
          >
            All Events
          </button>
          <button 
            onClick={() => setViewMode('clinical')}
            style={{ padding: '6px 16px', border: 'none', background: viewMode === 'clinical' ? 'var(--cal-color-primary)' : 'transparent', color: viewMode === 'clinical' ? '#fff' : 'var(--cal-color-text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
          >
            Clinical
          </button>
          <button 
            onClick={() => setViewMode('logistics')}
            style={{ padding: '6px 16px', border: 'none', background: viewMode === 'logistics' ? 'var(--cal-color-primary)' : 'transparent', color: viewMode === 'logistics' ? '#fff' : 'var(--cal-color-text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
          >
            Logistics
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="cal-dashboard-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-card)' }}>
        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-secondary)' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <span className="atlas-label">Today's Active Protocols</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cal-color-text-primary)' }}>12</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cal-color-primary)', fontWeight: 600 }}>+2 vs yesterday</div>
        </div>

        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-secondary)' }}>
            <span style={{ fontSize: '1.2rem' }}>📞</span>
            <span className="atlas-label">Pending Consults</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cal-color-text-primary)' }}>4</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cal-color-text-muted)' }}>Action required</div>
        </div>

        <div className="atlas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-secondary)' }}>
            <span style={{ fontSize: '1.2rem' }}>📦</span>
            <span className="atlas-label">Pending Shipments</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cal-color-text-primary)' }}>7</div>
          <div style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 600 }}>3 High Priority</div>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="atlas-card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <RegeneraCalendar viewMode={viewMode} />
      </div>
    </div>
  );
}

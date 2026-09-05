"use client";

import React, { useState } from 'react';
import RegeneraCalendar from './RegeneraCalendar';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import './CalendarCloud.css';

export default function CalendarPage({ defaultViewMode = 'all' }) {
  const [viewMode, setViewMode] = useState(defaultViewMode); // 'all', 'clinical', 'logistics'
  const { role, is } = useRoleAccess();

  // Role-specific 4 KPI Cards configuration (AGENTS.md Rule #22)
  const getRoleKpis = () => {
    if (is('patient')) {
      return [
        { icon: '💊', label: "Today's Dose", value: '1 Pending', sub: 'BPC-157 500mcg AM', color: 'var(--cal-color-primary)' },
        { icon: '🔥', label: 'Adherence Streak', value: '96%', sub: '28 days consistent', color: '#16a34a' },
        { icon: '🩺', label: 'Next Consultation', value: 'Oct 12', sub: 'Dr. Martinez (Virtual)', color: '#2563eb' },
        { icon: '🧪', label: 'Refill Days Left', value: '14 Days', sub: 'Active Vial (5ml)', color: '#d97706' },
      ];
    }

    if (is('doctor') || is('clinic')) {
      return [
        { icon: '📋', label: 'Active Patient Dosing', value: '18', sub: '+3 new this week', color: 'var(--cal-color-primary)' },
        { icon: '📝', label: 'Pending Approvals', value: '3', sub: 'Rx review needed', color: '#dc2626' },
        { icon: '📞', label: "Today's Consultations", value: '5', sub: '2 virtual, 3 in-person', color: '#2563eb' },
        { icon: '🧬', label: 'Lab Results Pending', value: '2', sub: 'Action required', color: '#d97706' },
      ];
    }

    if (is('supplier') || is('wholesaler')) {
      return [
        { icon: '📦', label: 'Pending PO Deliveries', value: '6', sub: 'Batches in transit', color: '#2563eb' },
        { icon: '🚚', label: 'Dispatches Today', value: '3', sub: 'FedEx Express', color: '#16a34a' },
        { icon: '🏭', label: 'Stock Arrivals', value: '2', sub: 'Scheduled for Friday', color: 'var(--cal-color-primary)' },
        { icon: '✅', label: 'COA Quality Audits', value: '4 Passed', sub: '100% Purity verified', color: '#16a34a' },
      ];
    }

    if (is('account_manager') || is('staff')) {
      return [
        { icon: '🏥', label: 'Clinic Restocks Due', value: '8', sub: 'Restock window open', color: '#d97706' },
        { icon: '📜', label: 'RFQ Deadlines', value: '3', sub: 'Pending response', color: '#dc2626' },
        { icon: '📞', label: 'Scheduled Calls', value: '6', sub: 'Account review today', color: '#2563eb' },
        { icon: '🔄', label: 'Active Reorders', value: '11', sub: 'Processing', color: 'var(--cal-color-primary)' },
      ];
    }

    // Default / Admin view
    return [
      { icon: '📋', label: "Today's Active Protocols", value: '12', sub: '+2 vs yesterday', color: 'var(--cal-color-primary)' },
      { icon: '📞', label: 'Pending Consults', value: '4', sub: 'Action required', color: '#dc2626' },
      { icon: '📦', label: 'Pending Shipments', value: '7', sub: '3 High Priority', color: '#d97706' },
      { icon: '🔄', label: 'Prescriptions Due', value: '9', sub: 'Auto-refill queued', color: '#16a34a' },
    ];
  };

  const kpiList = getRoleKpis();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-section)', paddingBottom: '5rem' }}>
      
      {/* Header and Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="atlas-h1" style={{ margin: 0 }}>Smart Schedule</h1>
            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', fontWeight: 600, border: '1px solid #bfdbfe', textTransform: 'uppercase' }}>
              Scope: {role || 'Admin'}
            </span>
          </div>
          <p className="atlas-helper-text" style={{ fontSize: '0.875rem' }}>
            Manage prescriptions, protocols, patient consultations, and shipments.
          </p>
        </div>

        {!is('patient') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

            <button
              onClick={() => window.dispatchEvent(new Event('open-calendar-modal'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                backgroundColor: 'var(--cal-color-primary, #003666)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 54, 102, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Schedule Event
            </button>
          </div>
        )}
      </div>
      
      {/* 4 KPI Cards (AGENTS.md Rule #22) */}
      <div className="cal-dashboard-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-card)' }}>
        {kpiList.map((kpi, idx) => (
          <div key={idx} className="atlas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cal-color-text-secondary)' }}>
              <span style={{ fontSize: '1.2rem' }}>{kpi.icon}</span>
              <span className="atlas-label">{kpi.label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cal-color-text-primary)' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: 600 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Calendar Component */}
      <div className="atlas-card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <RegeneraCalendar viewMode={viewMode} />
      </div>
    </div>
  );
}


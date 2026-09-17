'use client';

import React from 'react';
import Send from 'lucide-react/dist/esm/icons/send';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Users from 'lucide-react/dist/esm/icons/users';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { MetricCard } from '../../ui';

export default function DoctorKpiMetricsGrid({
  isLoading,
  active = 0,
  drafts = 0,
  fulfilled = 0,
  totalPatients = 0,
  isSimulatingDrErdmann,
  onNavigate,
  t = (key, def) => def || key,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* ⚠️ PENDING DRAFTS ALERT BANNER */}
      {drafts > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)' }}>
          <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.92rem' }}>
              {drafts === 1 
                ? t('doctor.overview.drafts_banner', { count: drafts, defaultValue: 'You have 1 draft prescription awaiting signature' }) 
                : t('doctor.overview.drafts_banner_plural', { count: drafts, defaultValue: `You have ${drafts} draft prescriptions awaiting signature` })}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '2px' }}>
              {t('doctor.overview.drafts_banner_desc', 'Review and sign to transmit to compounding pharmacy.')}
            </div>
          </div>
          <button
            onClick={() => onNavigate?.('prescriptions')}
            style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '7px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          >
            {t('doctor.overview.complete', 'Review Drafts')} <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 🧭 GCP SCOPE INDICATOR & PRESET VIEW FILTER BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Clinical Scope:
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003666', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
            🏥 {isSimulatingDrErdmann ? 'Bedaya Polyclinic (Isolated Practice)' : 'Assigned Practice Cohort'}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            {totalPatients} patient under care • {active} in dispensing
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => onNavigate?.('prescriptions')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>View Prescriptions →</span>
          </button>
        </div>
      </div>

      {/* 📈 RESPONSIVE KPI METRIC CARDS GRID (2x2 on Mobile, 4x1 on Desktop) */}
      <div
        className="dashboard-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        <MetricCard 
          title={t('doctor.overview.stats_active', 'Active Prescriptions')} 
          value={isLoading ? '…' : active} 
          subtitle={t('doctor.overview.stats_active_sub', 'Currently in dispensing')} 
          icon={Send} 
          color="#003666" 
          onClick={() => onNavigate?.('prescriptions')} 
        />
        <MetricCard 
          title={t('doctor.overview.stats_drafts', 'Draft Prescriptions')} 
          value={isLoading ? '…' : drafts} 
          subtitle={t('doctor.overview.stats_drafts_sub', 'Awaiting signature')} 
          icon={Clock} 
          color="#d97706" 
          alert={drafts > 0} 
          onClick={() => onNavigate?.('prescriptions')} 
        />
        <MetricCard 
          title={t('doctor.overview.stats_fulfilled', 'Fulfilled Orders')} 
          value={isLoading ? '…' : fulfilled} 
          subtitle={t('doctor.overview.stats_fulfilled_sub', 'Delivered to patients')} 
          icon={CheckCircle2} 
          color="#16a34a" 
          onClick={() => onNavigate?.('prescriptions')} 
        />
        <MetricCard 
          title={t('doctor.overview.stats_patients', 'Active Patients')} 
          value={isLoading ? '…' : (totalPatients || '—')} 
          subtitle={t('doctor.overview.stats_patients_sub', 'Under clinical care')} 
          icon={Users} 
          color="#7c3aed" 
          onClick={() => onNavigate?.('patients')} 
        />
      </div>
    </div>
  );
}

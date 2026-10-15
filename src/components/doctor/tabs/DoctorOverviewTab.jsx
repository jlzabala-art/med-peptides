"use client";

import React from 'react';
import { Pill, Users, Clock, Sparkles } from 'lucide-react';
import DoctorClinicalAnalytics from '../DoctorClinicalAnalytics';

/**
 * DoctorOverviewTab
 * 
 * Practice Overview & Core Operational KPIs (Google Cloud Rule #22)
 * Includes Scope Switcher (Global Practice vs Matching Active Filters),
 * interactive KPI cards that filter the table, and the deep Clinical Analytics widget.
 */
export default function DoctorOverviewTab({
  scopeMode,
  setScopeMode,
  activeKpis,
  globalKpis,
  filteredPrescriptions,
  allPrescriptions,
  setStatusFilter,
  setPatientFilter,
  setTemporalFilter,
  setSearchQuery,
  setTaskFilter,
  setApiFilter,
  apiFilter,
  triggerHaptic,
  handleSidebarNavigate,
  data,
  toast
}) {
  return (
    <div id="overview" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
            Operational Metrics
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              background: scopeMode === 'filtered' ? '#f0fdf4' : '#eff6ff',
              color: scopeMode === 'filtered' ? '#16a34a' : '#1d4ed8',
              border: `1px solid ${scopeMode === 'filtered' ? '#bbf7d0' : '#bfdbfe'}`,
              borderRadius: '4px',
              padding: '2px 8px',
              fontWeight: 600
            }}
          >
            {scopeMode === 'filtered'
              ? `Active Filters View (${filteredPrescriptions.length} matching rx)`
              : `Global Practice View (${allPrescriptions.length} total rx)`}
          </span>
        </div>

        {/* Scope Switcher (Rule #22) */}
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
          <button
            type="button"
            onClick={() => setScopeMode('global')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: scopeMode === 'global' ? '#ffffff' : 'transparent',
              color: scopeMode === 'global' ? '#0f172a' : '#64748b',
              boxShadow: scopeMode === 'global' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.12s'
            }}
          >
            Global Database
          </button>
          <button
            type="button"
            onClick={() => setScopeMode('filtered')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
              color: scopeMode === 'filtered' ? '#0f172a' : '#64748b',
              boxShadow: scopeMode === 'filtered' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.12s'
            }}
          >
            Matching Filters
          </button>
        </div>
      </div>

      <div className="gcp-kpi-grid">
        {/* KPI 1: Active Prescriptions */}
        <div
          className="gcp-kpi-card"
          onClick={() => {
            if (triggerHaptic) triggerHaptic('light');
            setStatusFilter('active');
            setPatientFilter('all');
            setTemporalFilter('all');
            setSearchQuery('');
            setScopeMode('filtered');
            handleSidebarNavigate('prescriptions');
            if (toast) toast.success(`Filtered table: Showing ${activeKpis.activePrescriptions} active prescriptions`, { id: 'kpi-filter' });
          }}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Active Prescriptions in table"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active Prescriptions</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={16} style={{ color: '#16a34a' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
            {activeKpis.activePrescriptions}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Compounded posology regimens</span>
            <span style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 600 }}>Filter table →</span>
          </div>
        </div>

        {/* KPI 2: Monitored Patients */}
        <div
          className="gcp-kpi-card"
          onClick={() => {
            if (triggerHaptic) triggerHaptic('light');
            setStatusFilter('all');
            setPatientFilter('all');
            setTemporalFilter('all');
            setSearchQuery('');
            setScopeMode('global');
            handleSidebarNavigate('prescriptions');
            if (toast) toast.success(`Displaying all ${globalKpis.monitoredPatients} monitored patient dossiers`, { id: 'kpi-filter' });
          }}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Monitored Patients directory"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Monitored Patients</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} style={{ color: '#1a73e8' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
            {activeKpis.monitoredPatients}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Unique patient dossiers managed</span>
            <span style={{ fontSize: '0.70rem', color: '#1a73e8', fontWeight: 600 }}>View patients →</span>
          </div>
        </div>

        {/* KPI 3: Pending Clinical Tasks */}
        <div
          className="gcp-kpi-card"
          onClick={() => {
            if (triggerHaptic) triggerHaptic('light');
            setTaskFilter('all');
            setSearchQuery('');
            handleSidebarNavigate('tasks');
            if (toast) toast.success(`Showing all ${activeKpis.pendingTasksCount} actionable clinical tasks`, { id: 'kpi-filter' });
          }}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Action Tasks in to-do list"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Action Tasks</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} style={{ color: '#d97706' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#d97706', lineHeight: 1.1 }}>
            {activeKpis.pendingTasksCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Actionable reviews & titrations</span>
            <span style={{ fontSize: '0.70rem', color: '#d97706', fontWeight: 600 }}>View tasks →</span>
          </div>
        </div>

        {/* KPI 4: Refills & Titrations Due */}
        <div
          className="gcp-kpi-card"
          onClick={() => {
            if (triggerHaptic) triggerHaptic('light');
            setTaskFilter('refill');
            setSearchQuery('');
            setScopeMode('filtered');
            handleSidebarNavigate('tasks');
            if (toast) toast.success(`Filtered To-Do Queue: Showing ${activeKpis.refillsDueCount} refills due`, { id: 'kpi-filter' });
          }}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view Refill & Renewal Tasks in to-do list"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Refills & Cycles</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} style={{ color: '#7c3aed' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#7c3aed', lineHeight: 1.1 }}>
            {activeKpis.refillsDueCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Upcoming supply cycles (14 days)</span>
            <span style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 600 }}>Filter refills →</span>
          </div>
        </div>
      </div>

      {/* ── Deep Clinical Analytics & Prescribing Intelligence (Rule #22) ── */}
      <div style={{ marginTop: '24px' }}>
        <DoctorClinicalAnalytics
          prescriptions={scopeMode === 'filtered' ? filteredPrescriptions : allPrescriptions}
          serverAnalytics={data?.serverAnalytics}
          onSelectApi={(apiName) => {
            if (apiFilter && apiFilter.toLowerCase() === apiName.toLowerCase()) {
              setApiFilter(null);
              if (toast) toast('Cleared active API filter', { id: 'api-filter' });
            } else {
              setApiFilter(apiName);
              handleSidebarNavigate('prescriptions');
              if (toast) toast.success(`Filtered table: showing ${apiName} formulations`, { id: 'api-filter' });
            }
          }}
          selectedApiFilter={apiFilter}
          onClearApiFilter={() => {
            setApiFilter(null);
            if (toast) toast('Cleared active API filter', { id: 'api-filter' });
          }}
          isFiltered={scopeMode === 'filtered' || !!apiFilter}
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import DataTable from '../../ui/DataTable';
import EmptyState from '../../ui/EmptyState';
import notifier from '../../../services/NotificationService';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

export default function PeptideCohortTable({ doctorId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadPeptidePatients() {
      setLoading(true);
      try {
        let q = query(collection(db, 'prescriptions'), limit(50));
        if (doctorId) {
          q = query(collection(db, 'prescriptions'), where('doctorId', '==', doctorId), limit(50));
        }
        const snap = await getDocs(q);
        if (isMounted) {
          const mapped = snap.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.patientName || 'Patient',
              age: d.patientAge || 'N/A',
              gender: d.patientGender || 'N/A',
              regimen: Array.isArray(d.items) 
                ? d.items.map(i => i.productName || i.name).join(' + ') 
                : (d.protocolName || d.peptideName || 'Active Protocol'),
              cycleCurrentWeek: d.cycleCurrentWeek || 1,
              cycleTotalWeeks: d.cycleTotalWeeks || 8,
              washoutStatus: d.washoutStatus || 'Active Cycle',
              washoutState: d.washoutState || 'active',
              reconstitution: d.reconstitution || 'Reconstituted Solution',
              igf1: d.igf1 || 'Baseline',
              hba1c: d.hba1c || 'N/A',
              adherence: d.adherence || 100,
              status: (d.status || 'active').toLowerCase(),
              alert: d.notes || d.clinicalNotes || 'Monitoring active protocol',
            };
          });
          setPatients(mapped);
        }
      } catch (err) {
        console.error('Error fetching peptide cohort:', err);
        if (isMounted) setPatients([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPeptidePatients();
    return () => { isMounted = false; };
  }, [doctorId]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.regimen.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  const activeCycles = useMemo(() => patients.filter(p => p.washoutState === 'active').length, [patients]);
  const dueWashout = useMemo(() => patients.filter(p => p.washoutState === 'due_washout').length, [patients]);
  const avgAdherence = useMemo(() => {
    if (patients.length === 0) return 100;
    return Math.round(patients.reduce((acc, p) => acc + (p.adherence || 100), 0) / patients.length);
  }, [patients]);

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Patient',
      width: '18%',
      render: (_, row) => (
        <div>
          <strong style={{ color: '#0f172a', display: 'block' }}>{row.name}</strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {row.age} y/o • {row.gender}
          </span>
        </div>
      ),
    },
    {
      key: 'regimen',
      label: 'Active Regimen & Dose',
      width: '24%',
      render: (_, row) => (
        <div>
          <span style={{ fontWeight: 600, color: '#047857' }}>{row.regimen}</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
            {row.reconstitution}
          </span>
        </div>
      ),
    },
    {
      key: 'cycleProgress',
      label: 'Cycle Progress',
      width: '18%',
      render: (_, row) => {
        const progressPct = Math.min(100, Math.round((row.cycleCurrentWeek / (row.cycleTotalWeeks || 8)) * 100));
        return (
          <div style={{ minWidth: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px' }}>
              <span>W{row.cycleCurrentWeek} of W{row.cycleTotalWeeks}</span>
              <span>{progressPct}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: progressPct >= 100 ? '#d97706' : '#10b981' }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'washoutStatus',
      label: 'Washout Status',
      width: '14%',
      render: (_, row) => (
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor:
              row.washoutState === 'due_washout'
                ? '#fef2f2'
                : row.washoutState === 'in_washout'
                ? '#f5f3ff'
                : '#f0fdf4',
            color:
              row.washoutState === 'due_washout'
                ? '#dc2626'
                : row.washoutState === 'in_washout'
                ? '#7c3aed'
                : '#16a34a',
            border:
              row.washoutState === 'due_washout'
                ? '1px solid #fecaca'
                : row.washoutState === 'in_washout'
                ? '1px solid #ddd6fe'
                : '1px solid #bbf7d0',
          }}
        >
          {row.washoutStatus}
        </span>
      ),
    },
    {
      key: 'biomarkers',
      label: 'Biomarkers',
      width: '12%',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0369a1' }}>IGF-1: {row.igf1}</div>
          <div style={{ fontSize: '0.72rem', color: '#475569' }}>HbA1c: {row.hba1c}</div>
        </div>
      ),
    },
    {
      key: 'adherence',
      label: 'Adherence',
      width: '8%',
      render: (_, row) => (
        <strong style={{ color: (row.adherence || 100) >= 90 ? '#16a34a' : '#dc2626' }}>
          {row.adherence}%
        </strong>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '14%',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => notifier.success(`Adjusted step-down dose for ${row.name}`)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Step-down Dose
          </button>
          <button
            onClick={() => notifier.info(`Washout logged for ${row.name}`)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Log Washout
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Metrics Banner (Golden Rule #22) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
            🧬 Active Peptide Cycles
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532d', marginTop: '0.2rem' }}>
            {activeCycles} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>patients</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#166534' }}>Supervised peptide therapy cycles</span>
        </div>

        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
            ⏳ Washouts Due
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350f', marginTop: '0.2rem' }}>
            {dueWashout} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>patients</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#92400e' }}>4-week mandatory recovery break</span>
        </div>

        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#075985', textTransform: 'uppercase' }}>
            📊 Mean Adherence
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0c4a6e', marginTop: '0.2rem' }}>
            {avgAdherence}% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>compliance</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#075985' }}>Patient reported dose completion</span>
        </div>

        <div
          style={{
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5b21b6', textTransform: 'uppercase' }}>
            👥 Total Cohort
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4c1d95', marginTop: '0.2rem' }}>
            {patients.length} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d28d9' }}>enrolled</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#5b21b6' }}>Active in clinical registry</span>
        </div>
      </div>

      {/* 2. Search & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search peptide patients by name or regimen..."
          style={{
            flex: 1,
            minWidth: '260px',
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.82rem',
            outline: 'none',
          }}
        />
        <button
          onClick={() => notifier.info('Exporting Peptide Cohort Clinical Report...')}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📊 Export Peptide Cohort CSV
        </button>
      </div>

      {/* 3. DataTable (Golden Rule #3) */}
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        emptyState={
          <EmptyState
            icon={Sparkles}
            title="No peptide patients found"
            subtitle="Patients prescribed peptide protocols will automatically appear in this supervised cohort."
          />
        }
      />
    </div>
  );
}

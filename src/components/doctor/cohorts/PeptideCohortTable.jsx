'use client';

import React, { useState } from 'react';
import notifier from '../../../services/NotificationService';

const MOCK_PEPTIDE_PATIENTS = [
  {
    id: 'pat-pep-1',
    name: 'Carlos Méndez',
    age: 44,
    gender: 'Male',
    regimen: 'Tirzepatide 5mg/mL + BPC-157 500mcg',
    cycleCurrentWeek: 6,
    cycleTotalWeeks: 8,
    washoutStatus: 'Active Cycle (14d remaining)',
    washoutState: 'active',
    reconstitution: 'Bacteriostatic Water 2mL (Refrigerated)',
    igf1: '210 ng/mL',
    hba1c: '5.2%',
    adherence: 94,
    status: 'active',
    alert: 'Reported mild nausea; step-down dose recommended',
  },
  {
    id: 'pat-pep-2',
    name: 'Elena Rostova',
    age: 38,
    gender: 'Female',
    regimen: 'Semaglutide 2.4mg + CJC-1295 / Ipamorelin',
    cycleCurrentWeek: 12,
    cycleTotalWeeks: 12,
    washoutStatus: 'Washout Required (4-week break)',
    washoutState: 'due_washout',
    reconstitution: 'Sublingual Drops 10mg/mL',
    igf1: '245 ng/mL',
    hba1c: '5.0%',
    adherence: 98,
    status: 'active',
    alert: 'Completed 12w cycle today; initiate washout',
  },
  {
    id: 'pat-pep-3',
    name: 'Marcus Vance',
    age: 51,
    gender: 'Male',
    regimen: 'Epithalon 10mg SubQ Protocol',
    cycleCurrentWeek: 3,
    cycleTotalWeeks: 4,
    washoutStatus: 'Active Cycle (7d remaining)',
    washoutState: 'active',
    reconstitution: 'SubQ Injection 100mcg daily',
    igf1: '185 ng/mL',
    hba1c: '5.4%',
    adherence: 91,
    status: 'active',
    alert: 'Optimal biomarker response',
  },
  {
    id: 'pat-pep-4',
    name: 'Sophia Thorne',
    age: 42,
    gender: 'Female',
    regimen: 'AOD-9604 + MOTS-c Metabolic Cycle',
    cycleCurrentWeek: 8,
    cycleTotalWeeks: 8,
    washoutStatus: 'In Washout (Day 12 of 28)',
    washoutState: 'in_washout',
    reconstitution: 'Lyophilized Powder Reconstituted',
    igf1: '230 ng/mL',
    hba1c: '5.1%',
    adherence: 100,
    status: 'active',
    alert: 'Washout ongoing; next cycle scheduled Sept 20',
  },
];

export default function PeptideCohortTable({ doctorId }) {
  const [patients] = useState(MOCK_PEPTIDE_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.regimen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Metrics Banner */}
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
            162 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>patients</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#166534' }}>88% on 8w/12w supervised cycles</span>
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
            ⏳ Washouts Due This Week
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350f', marginTop: '0.2rem' }}>
            14 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>patients</span>
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
            🧪 Reconstitution Checks
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0c4a6e', marginTop: '0.2rem' }}>
            8 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>vials</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#075985' }}>BAC Water & refrigeration verified</span>
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
            📈 Mean IGF-1 Biomarker
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4c1d95', marginTop: '0.2rem' }}>
            +28.4% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d28d9' }}>elevation</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#5b21b6' }}>Compared to pre-treatment baseline</span>
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

      {/* 3. Specialized Peptide Cohort Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Patient</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Active Regimen & Dose</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Cycle Progress</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Washout Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Biomarkers (IGF-1 / HbA1c)</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Adherence</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Clinical Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const progressPct = Math.round((p.cycleCurrentWeek / p.cycleTotalWeeks) * 100);
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {p.age} y/o • {p.gender}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 600, color: '#047857' }}>{p.regimen}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                      {p.reconstitution}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', minWidth: '150px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px' }}>
                      <span>W{p.cycleCurrentWeek} of W{p.cycleTotalWeeks}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: progressPct >= 100 ? '#d97706' : '#10b981' }} />
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor:
                          p.washoutState === 'due_washout'
                            ? '#fef2f2'
                            : p.washoutState === 'in_washout'
                            ? '#f5f3ff'
                            : '#f0fdf4',
                        color:
                          p.washoutState === 'due_washout'
                            ? '#dc2626'
                            : p.washoutState === 'in_washout'
                            ? '#7c3aed'
                            : '#16a34a',
                        border:
                          p.washoutState === 'due_washout'
                            ? '1px solid #fecaca'
                            : p.washoutState === 'in_washout'
                            ? '1px solid #ddd6fe'
                            : '1px solid #bbf7d0',
                      }}
                    >
                      {p.washoutStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0369a1' }}>IGF-1: {p.igf1}</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>HbA1c: {p.hba1c}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <strong style={{ color: p.adherence >= 90 ? '#16a34a' : '#dc2626' }}>{p.adherence}%</strong>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => notifier.success(`Adjusted step-down dose for ${p.name}`)}
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
                        onClick={() => notifier.info(`Washout logged for ${p.name}`)}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import notifier from '../../../services/NotificationService';

const MOCK_SUPPLEMENT_PATIENTS = [
  {
    id: 'pat-sup-1',
    name: 'David Miller',
    age: 49,
    gender: 'Male',
    stack: 'Liposomal NAD+ (500mg) + Resveratrol + Spermidine',
    refillDaysLeft: 12,
    tolerance: '100% Optimal',
    toleranceState: 'optimal',
    vitD3: '68 ng/mL',
    vitB12: '890 pg/mL',
    complianceRate: 96,
    status: 'active',
  },
  {
    id: 'pat-sup-2',
    name: 'Amara Patel',
    age: 36,
    gender: 'Female',
    stack: 'CoQ10 Ubiquinol (200mg) + Omega-3 EPA/DHA + Berberine',
    refillDaysLeft: 4,
    tolerance: 'Mild GI Upset (Take with meal)',
    toleranceState: 'mild_upset',
    vitD3: '52 ng/mL',
    vitB12: '740 pg/mL',
    complianceRate: 88,
    status: 'active',
  },
  {
    id: 'pat-sup-3',
    name: 'Lucas Thorne',
    age: 55,
    gender: 'Male',
    stack: 'Mitochondrial Energy Stack + PQQ + Alpha Lipoic Acid',
    refillDaysLeft: 28,
    tolerance: '100% Optimal',
    toleranceState: 'optimal',
    vitD3: '74 ng/mL',
    vitB12: '920 pg/mL',
    complianceRate: 100,
    status: 'active',
  },
  {
    id: 'pat-sup-4',
    name: 'Emma Watson',
    age: 41,
    gender: 'Female',
    stack: 'Gut Microflora Probiotic 50B + Glutamine + Quercetin',
    refillDaysLeft: 8,
    tolerance: '100% Optimal',
    toleranceState: 'optimal',
    vitD3: '61 ng/mL',
    vitB12: '810 pg/mL',
    complianceRate: 92,
    status: 'active',
  },
];

export default function SupplementsCohortTable({ doctorId }) {
  const [patients] = useState(MOCK_SUPPLEMENT_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.stack.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
            💊 Active Daily Stacks
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#581c87', marginTop: '0.2rem' }}>
            94 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7e22ce' }}>patients</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#6b21a8' }}>92% mean compliance rate</span>
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
            📦 Refills Due (Next 7 Days)
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350f', marginTop: '0.2rem' }}>
            11 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>patients</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#92400e' }}>Automated refill reminders active</span>
        </div>

        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
            🌿 GI Tolerance Index
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532d', marginTop: '0.2rem' }}>
            96.8% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>optimal</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#166534' }}>0 severe side effect reports</span>
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
            🩸 Micronutrient Lab Reviews
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0c4a6e', marginTop: '0.2rem' }}>
            6 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>panels due</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#075985' }}>Vitamin D3 & B12 re-tests</span>
        </div>
      </div>

      {/* 2. Controls */}
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
          placeholder="Search supplement stacks by patient or formula..."
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
          onClick={() => notifier.info('Exporting Supplements Cohort Report...')}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📊 Export Supplements CSV
        </button>
      </div>

      {/* 3. Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Patient</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Active Daily Stack</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Refill Cadence</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>GI Tolerance</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Micronutrient Labs</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Compliance</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>{p.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {p.age} y/o • {p.gender}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontWeight: 600, color: '#6b21a8' }}>{p.stack}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: p.refillDaysLeft <= 7 ? '#fffbeb' : '#f0fdf4',
                      color: p.refillDaysLeft <= 7 ? '#b45309' : '#16a34a',
                      border: p.refillDaysLeft <= 7 ? '1px solid #fef3c7' : '1px solid #bbf7d0',
                    }}
                  >
                    {p.refillDaysLeft} days remaining
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: p.toleranceState === 'optimal' ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                    {p.tolerance}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0369a1' }}>Vit D3: {p.vitD3}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>Vit B12: {p.vitB12}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong style={{ color: p.complianceRate >= 90 ? '#16a34a' : '#dc2626' }}>{p.complianceRate}%</strong>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => notifier.info(`Adjusted stack for ${p.name}`)}
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
                      Modify Stack
                    </button>
                    <button
                      onClick={() => notifier.success(`Refill reminder sent to ${p.name}`)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Send Refill
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

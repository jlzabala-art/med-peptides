'use client';

import React, { useState } from 'react';
import notifier from '../../../services/NotificationService';

const MOCK_GENOMICS_PATIENTS = [
  {
    id: 'pat-gen-1',
    name: 'Isabella Rossi',
    age: 37,
    gender: 'Female',
    testType: 'Fagron TrichoTest & Nutrigenetics',
    kitId: 'FAG-89421',
    testStatus: 'Report Ready (PDF)',
    testState: 'ready',
    snpProfile: ['MTHFR C677T (TT)', 'ApoE ε3/ε4', 'SOD2 High Risk'],
    compoundedRx: 'Custom Topical Hair & Methyl-B12 Solution',
    bioAgeDelta: '-6 yrs (Bio Age 31 vs 37)',
    safetyIndex: '100% Safe (0 Contraindications)',
    status: 'active',
  },
  {
    id: 'pat-gen-2',
    name: 'Henrik Lindqvist',
    age: 52,
    gender: 'Male',
    testType: 'Fagron Longevity & Telomere DNA Panel',
    kitId: 'FAG-91204',
    testStatus: 'Lab Processing (Fagron Lab)',
    testState: 'in_lab',
    snpProfile: ['MTHFR A1298C', 'GSTP1 Detox Reduced'],
    compoundedRx: 'Pending Report Evaluation',
    bioAgeDelta: 'Evaluating...',
    safetyIndex: 'Pending Lab Panel',
    status: 'active',
  },
  {
    id: 'pat-gen-3',
    name: 'Clara Dupont',
    age: 45,
    gender: 'Female',
    testType: 'Fagron AcneTest & Dermal Precision',
    kitId: 'FAG-78219',
    testStatus: 'Report Ready (PDF)',
    testState: 'ready',
    snpProfile: ['IL-6 Inflammatory High', 'CYP1B1 Altered'],
    compoundedRx: 'Customized Anti-Inflammatory Dermal Serum',
    bioAgeDelta: '-3 yrs (Bio Age 42 vs 45)',
    safetyIndex: '100% Safe (0 Contraindications)',
    status: 'active',
  },
];

export default function GenomicsCohortTable({ doctorId }) {
  const [patients] = useState(MOCK_GENOMICS_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kitId.toLowerCase().includes(searchTerm.toLowerCase())
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
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
            🧪 DNA Reports Ready
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.2rem' }}>
            48 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>reports</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#1e40af' }}>Fagron Genomics DNA panels verified</span>
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
            🔬 Swabs In Fagron Lab
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350f', marginTop: '0.2rem' }}>
            9 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>kits</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#92400e' }}>Est. completion: 4-6 business days</span>
        </div>

        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
            🧬 High Risk MTHFR / ApoE SNPs
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7f1d1d', marginTop: '0.2rem' }}>
            16 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>actionable</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#991b1b' }}>Methylation & lipid pathway flags</span>
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
            💊 Fagron Custom Compounded Rx
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4c1d95', marginTop: '0.2rem' }}>
            32 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d28d9' }}>prescriptions</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#5b21b6' }}>100% personalized API formulas</span>
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
          placeholder="Search Fagron Genomics patients by name, kit ID, or test type..."
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
          onClick={() => notifier.info('Exporting Fagron Genomics Cohort Report...')}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📊 Export Fagron Genomics CSV
        </button>
      </div>

      {/* 3. Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Patient & Kit ID</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Genomic Test & Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Actionable SNP Profile</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Fagron Compounded Rx</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Epigenetic Age Delta</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Genomic Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>{p.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                    Kit: {p.kitId}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.testType}</span>
                  <div style={{ marginTop: '3px' }}>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: p.testState === 'ready' ? '#eff6ff' : '#fffbeb',
                        color: p.testState === 'ready' ? '#1d4ed8' : '#b45309',
                        border: p.testState === 'ready' ? '1px solid #bfdbfe' : '1px solid #fef3c7',
                      }}
                    >
                      {p.testStatus}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {p.snpProfile.map((snp) => (
                      <span
                        key={snp}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#fef2f2',
                          color: '#991b1b',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          border: '1px solid #fecaca',
                        }}
                      >
                        {snp}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontWeight: 600, color: '#5b21b6' }}>{p.compoundedRx}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong style={{ color: p.testState === 'ready' ? '#16a34a' : '#64748b' }}>{p.bioAgeDelta}</strong>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => notifier.success(`Downloading DNA Report PDF for ${p.name}...`)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      📄 Download Report (PDF)
                    </button>
                    <button
                      onClick={() => notifier.info(`Opening Fagron Precision Rx Builder for ${p.name}...`)}
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
                      💊 Fagron Rx Builder
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

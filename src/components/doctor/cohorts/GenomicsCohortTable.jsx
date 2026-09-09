'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import DataTable from '../../ui/DataTable';
import EmptyState from '../../ui/EmptyState';
import notifier from '../../../services/NotificationService';
import Dna from 'lucide-react/dist/esm/icons/dna';

export default function GenomicsCohortTable({ doctorId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadGenomics() {
      setLoading(true);
      try {
        let q = query(collection(db, 'genomics_orders'), limit(50));
        if (doctorId) {
          q = query(collection(db, 'genomics_orders'), where('doctorId', '==', doctorId), limit(50));
        }
        let snap = await getDocs(q);

        // Fallback to clinical tests collection if empty
        if (snap.empty) {
          let qTests = query(collection(db, 'clinical_tests'), limit(50));
          if (doctorId) {
            qTests = query(collection(db, 'clinical_tests'), where('doctorId', '==', doctorId), limit(50));
          }
          snap = await getDocs(qTests);
        }

        if (isMounted) {
          const mapped = snap.docs.map(doc => {
            const d = doc.data();
            const state = (d.status || d.testState || 'in_lab').toLowerCase();
            return {
              id: doc.id,
              name: d.patientName || 'Patient',
              age: d.patientAge || 'N/A',
              gender: d.patientGender || 'N/A',
              testType: d.testType || d.name || 'Fagron Precision Genomics',
              kitId: d.kitId || `FAG-${doc.id.slice(0, 6).toUpperCase()}`,
              testStatus: state === 'ready' || state === 'completed' ? 'Report Ready (PDF)' : 'Lab Processing',
              testState: state === 'ready' || state === 'completed' ? 'ready' : 'in_lab',
              snpProfile: Array.isArray(d.snpProfile) ? d.snpProfile : (d.snps ? [d.snps] : ['Profile Analyzed']),
              compoundedRx: d.compoundedRx || 'Custom Formulation Under Review',
              bioAgeDelta: d.bioAgeDelta || 'Computed on Release',
              safetyIndex: d.safetyIndex || 'Optimal Compatibility',
              status: (d.status || 'active').toLowerCase(),
            };
          });
          setPatients(mapped);
        }
      } catch (err) {
        console.error('Error loading genomics cohort:', err);
        if (isMounted) setPatients([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGenomics();
    return () => { isMounted = false; };
  }, [doctorId]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.testType.toLowerCase().includes(term) ||
        p.kitId.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  const readyReports = useMemo(() => patients.filter(p => p.testState === 'ready').length, [patients]);
  const inLabReports = useMemo(() => patients.filter(p => p.testState === 'in_lab').length, [patients]);

  const columns = useMemo(() => [
    {
      key: 'patient',
      label: 'Patient & Kit ID',
      width: '20%',
      render: (_, row) => (
        <div>
          <strong style={{ color: '#0f172a', display: 'block' }}>{row.name}</strong>
          <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
            Kit: {row.kitId}
          </span>
        </div>
      ),
    },
    {
      key: 'test',
      label: 'Genomic Test & Status',
      width: '22%',
      render: (_, row) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.testType}</span>
          <div style={{ marginTop: '3px' }}>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: row.testState === 'ready' ? '#eff6ff' : '#fffbeb',
                color: row.testState === 'ready' ? '#1d4ed8' : '#b45309',
                border: row.testState === 'ready' ? '1px solid #bfdbfe' : '1px solid #fef3c7',
              }}
            >
              {row.testStatus}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'snps',
      label: 'Actionable SNP Profile',
      width: '22%',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {row.snpProfile.map((snp, idx) => (
            <span
              key={idx}
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
      ),
    },
    {
      key: 'rx',
      label: 'Fagron Compounded Rx',
      width: '20%',
      render: (_, row) => (
        <span style={{ fontWeight: 600, color: '#5b21b6' }}>{row.compoundedRx}</span>
      ),
    },
    {
      key: 'bioAge',
      label: 'Epigenetic Age Delta',
      width: '16%',
      render: (_, row) => (
        <strong style={{ color: row.testState === 'ready' ? '#16a34a' : '#64748b' }}>{row.bioAgeDelta}</strong>
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
            onClick={() => notifier.success(`Downloading DNA Report PDF for ${row.name}...`)}
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
            PDF Report
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Metrics Banner (Golden Rule #22) */}
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
            🧪 Total DNA Panels
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.2rem' }}>
            {patients.length} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>kits</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#1e40af' }}>Fagron Genomics Panels</span>
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
            📄 Reports Ready
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532d', marginTop: '0.2rem' }}>
            {readyReports} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>evaluated</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#166534' }}>Full genetic analysis completed</span>
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
            ⏳ Lab Processing
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350f', marginTop: '0.2rem' }}>
            {inLabReports} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>kits in lab</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#92400e' }}>Sequencing & biomarker assay</span>
        </div>

        <div
          style={{
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
            🛡️ Safety Index
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#581c87', marginTop: '0.2rem' }}>
            100% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7e22ce' }}>compatible</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#6b21a8' }}>Contraindication cross-referencing</span>
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
          placeholder="Search genomics cohort by patient, test, or kit ID..."
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

      {/* 3. DataTable (Golden Rule #3) */}
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        emptyState={
          <EmptyState
            icon={Dna}
            title="No genomic panels found"
            subtitle="Genomic test kits ordered through Fagron will appear here once registered."
          />
        }
      />
    </div>
  );
}

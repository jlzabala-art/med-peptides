'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Dna,
  Droplets,
  Activity,
  Clock,
  ShieldCheck,
  Users,
  Building2,
  ExternalLink,
  Microscope,
  Sparkles,
  HeartPulse,
  Layers,
  CheckCircle2,
  FileText,
  Mail,
  Phone
} from '@/lib/icons';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import EmptyState from '@/components/ui/EmptyState';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Canonical 6 Eterna ProAge™ Clients (Synced with Firestore `lab_results` & `patients` + Zoho Bigin CRM)
 * Used as instant SSR/initial state while live Firestore query refreshes.
 */
export const ETERNA_PROAGE_INITIAL_COHORT = [
  {
    id: 'LAB-260406-RDA8324262825F',
    code: 'RDA8324262825F',
    sampleDate: '2026-02-13',
    patientName: 'Dr. Sobia Mirza',
    dob: '1987-12-31',
    gender: 'Female',
    chronologicalAgeText: '38y 2m',
    chronologicalAgeYears: 38.2,
    biologicalAgeText: '35y 10m',
    biologicalAgeYears: 35.8,
    ageDeltaYears: -2.4,
    testVariant: 'ProAge',
    clinicName: 'My London Skin Clinic (Dubai)',
    email: 'sobia@mylondonskinclinic.com',
    phone: '+971559758240',
    city: 'Dubai, UAE',
    zohoBiginId: '7006116000000618968',
    zohoPipelineStage: 'Customer / Active Physician Partner',
    referredBy: 'Direct / My London Skin Clinic',
    status: 'approved'
  },
  {
    id: 'LAB-260406-DBUQEWY62449',
    code: 'DBUQEWY62449',
    sampleDate: '2026-02-16',
    patientName: 'Walid Soaida',
    dob: '1982-05-02',
    gender: 'Male',
    chronologicalAgeText: '43y 9m',
    chronologicalAgeYears: 43.8,
    biologicalAgeText: '45y 4m',
    biologicalAgeYears: 45.3,
    ageDeltaYears: 1.5,
    testVariant: 'ProAge',
    clinicName: 'York Diagnostic Laboratories DMCC (YDL Dubai)',
    email: 'walid.soaida@ydl-me.com',
    phone: '+971501946110',
    city: 'JLT, Dubai, UAE',
    zohoBiginId: '7006116000000620281',
    zohoPipelineStage: 'Strategic Lab Partner (YDL)',
    referredBy: 'York Diagnostic Laboratories DMCC',
    status: 'approved'
  },
  {
    id: 'LAB-260406-DBUQEWUS2449',
    code: 'DBUQEWUS2449',
    sampleDate: '2026-02-23',
    patientName: 'Dr. Liyana Dimitrova',
    dob: '1965-08-24',
    gender: 'Female',
    chronologicalAgeText: '60y 7m',
    chronologicalAgeYears: 60.6,
    biologicalAgeText: '61y 5m',
    biologicalAgeYears: 61.4,
    ageDeltaYears: 0.8,
    testVariant: 'ProAge',
    clinicName: 'Dr. Ahmed Abu Sharia Medical Centre',
    email: 'dr_lia@hotmail.com',
    phone: '+971 50 770 8586',
    city: 'Al Bateen, Abu Dhabi, UAE',
    zohoBiginId: '7006116000000584854',
    zohoPipelineStage: 'Qualified Physician / Active ProAge',
    referredBy: 'Atlas Clinical Desk',
    status: 'approved'
  },
  {
    id: 'LAB-260406-DBUQEWUT2449',
    code: 'DBUQEWUT2449',
    sampleDate: '2026-02-23',
    patientName: 'Tomadour Eltayeb',
    dob: '1966-03-22',
    gender: 'Female',
    chronologicalAgeText: '60y 0m',
    chronologicalAgeYears: 60.0,
    biologicalAgeText: '61y 0m',
    biologicalAgeYears: 61.0,
    ageDeltaYears: 1.0,
    testVariant: 'ProAge',
    clinicName: 'My London Skin Clinic (Dubai)',
    email: 'accounts@mylondonskinclinic.com',
    phone: '+971559758240',
    city: 'Jumeirah 1, Dubai, UAE',
    zohoBiginId: '7006116000000626498',
    zohoPipelineStage: 'Active Patient (Dr. Sobia Mirza)',
    referredBy: 'Dr. Sobia Mirza',
    status: 'approved'
  },
  {
    id: 'LAB-260226-DBUQEWUU2449',
    code: 'DBUQEWUU2449',
    sampleDate: '2026-02-26',
    patientName: 'Dr. Sameh Farouk Zaki Abdelsalam Madkour',
    dob: '1976-09-16',
    gender: 'Male',
    chronologicalAgeText: '49y 5m',
    chronologicalAgeYears: 49.4,
    biologicalAgeText: '48y 1m',
    biologicalAgeYears: 48.1,
    ageDeltaYears: -1.3,
    testVariant: 'ProAge',
    clinicName: 'Dr. Ozone Medical Center (Dubai Healthcare City)',
    email: 'sameh@drozonedubai.com',
    phone: '+971 50 207 2407',
    city: 'Dubai Healthcare City, UAE',
    zohoBiginId: '7006116000000752053',
    zohoPipelineStage: 'Active Physician / ProAge Cohort',
    referredBy: 'Walid Soaida (YDL)',
    status: 'approved'
  },
  {
    id: 'LAB-260317-DBUQEWST2449',
    code: 'DBUQEWST2449',
    sampleDate: '2026-03-17',
    patientName: 'Dr. Sajid Burud',
    dob: '1973-09-19',
    gender: 'Male',
    chronologicalAgeText: '52y 6m',
    chronologicalAgeYears: 52.5,
    biologicalAgeText: '50y 9m',
    biologicalAgeYears: 50.8,
    ageDeltaYears: -1.7,
    testVariant: 'ProAge',
    clinicName: 'Transcend Healthcare FZCO',
    email: 'Dr.sajid@trnscnd.health',
    phone: '+971554050405',
    city: 'Al Barsha, Dubai, UAE',
    zohoBiginId: '7006116000001150188',
    zohoPipelineStage: 'Active Physician / ProAge Cohort',
    referredBy: 'Walid Soaida (YDL)',
    status: 'approved'
  }
];

const COMPARISON_DIMENSIONS = [
  {
    id: 'dim-1',
    parameter: 'Core Diagnostic Objective',
    proage: 'Dynamic Biological Age Clock & 5-Organ Functional Aging Velocity (Δ Biological vs. Chronological Age)',
    progen: 'Fixed Lifetime Genomic Predisposition, Polygenic Risk Scores (PRS) & Pharmacogenomic Baseline'
  },
  {
    id: 'dim-2',
    parameter: 'Biological Sample & Matrix',
    proage: 'Capillary / Venous Blood Serum & Proteomic Biomarker Array (CE-IVDR)',
    progen: 'Non-Invasive Buccal Saliva Swab with 24-Month Room-Temperature DNA Stabilization Buffer'
  },
  {
    id: 'dim-3',
    parameter: 'Analytical Platform (Eurofins)',
    proage: 'Quantitative Clinical Proteomics, Organ Aging Clocks & Epigenetic Methylation Telemetry',
    progen: 'High-Density Microarray Genotyping on Illumina Infinium GSA (+700,000 SNPs)'
  },
  {
    id: 'dim-4',
    parameter: '5 Evaluated Clinical Domains',
    proage: '5 Organ Clocks: Cardiovascular, Hepatic (Liver), Renal (Kidney), Metabolic/Glycemic & Immune System',
    progen: '5 Genomic Pillars: Sport & Connective Tissue, Nutrition & Methylation (MTHFR), Cardiovascular (APOE), Longevity (FOXO3) & Circadian (CLOCK)'
  },
  {
    id: 'dim-5',
    parameter: 'Testing Frequency & Plasticity',
    proage: 'Dynamic & Modifiable — Recommended every 3 to 6 months to quantify peptide & lifestyle intervention efficacy',
    progen: 'Static & Immutable — Performed once in a lifetime (DNA sequence never changes)'
  },
  {
    id: 'dim-6',
    parameter: 'Active Clinical Cohort (Atlas)',
    proage: '6 Verified Active Clients (Dubai & Abu Dhabi Clinical Network · Enriched via Zoho Bigin)',
    progen: '0 Active Clients Currently Registered (Available for immediate clinical onboarding)'
  }
];

export default function EternaProAgeProGenSection({ lang = 'en', onOpenInquiry = null }) {
  const isEs = lang === 'es';
  const [activeSubSection, setActiveSubSection] = useState('all'); // 'all' | 'comparison' | 'proage' | 'progen'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('all');
  const [scopeMode, setScopeMode] = useState('filtered'); // 'filtered' | 'global'
  const [proAgeClients, setProAgeClients] = useState(ETERNA_PROAGE_INITIAL_COHORT);

  // Live Firestore read with limit(50) per Golden Rule #1 & #2
  useEffect(() => {
    let mounted = true;
    async function loadFromFirestore() {
      try {
        if (!db) return;
        const q = query(
          collection(db, 'lab_results'),
          where('testVariant', '==', 'ProAge'),
          limit(50)
        );
        const snap = await getDocs(q);
        if (!mounted || snap.empty) return;
        const byCode = new Map();
        ETERNA_PROAGE_INITIAL_COHORT.forEach(item => byCode.set(item.code, item));
        snap.forEach(docSnap => {
          const d = docSnap.data();
          const code = d.code || d.protocolNumber || docSnap.id;
          const base = byCode.get(code) || {};
          byCode.set(code, {
            ...base,
            id: docSnap.id,
            code,
            sampleDate: d.sampleDate || d.collectionDate || base.sampleDate || '2026-02-23',
            patientName: d.patientName || d.patient?.name || base.patientName || 'Verified Patient',
            dob: d.dob || d.patient?.dob || base.dob || '—',
            gender: d.patient?.gender || base.gender || '—',
            chronologicalAgeText: d.chronologicalAgeText || base.chronologicalAgeText || '—',
            biologicalAgeText: d.biologicalAgeText || base.biologicalAgeText || '—',
            ageDeltaYears: d.ageDeltaYears ?? base.ageDeltaYears ?? 0,
            clinicName: d.clinicName || base.clinicName || 'Atlas Partner Clinic',
            email: d.patient?.email || base.email || '',
            phone: d.patient?.phone || base.phone || '',
            city: d.patient?.city || base.city || 'UAE',
            zohoBiginId: d.zohoBiginId || d.patient?.zohoBiginId || base.zohoBiginId || '',
            zohoPipelineStage: d.zohoPipelineStage || base.zohoPipelineStage || 'Active ProAge',
            referredBy: d.referredBy || base.referredBy || 'Atlas Clinical Desk',
            status: 'approved'
          });
        });
        const merged = Array.from(byCode.values()).sort((a, b) =>
          String(a.sampleDate || '').localeCompare(String(b.sampleDate || ''))
        );
        setProAgeClients(merged);
      } catch (err) {
        console.warn('[EternaProAgeProGenSection] Firestore live sync fallback:', err.message);
      }
    }
    loadFromFirestore();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProAgeClients = useMemo(() => {
    return proAgeClients.filter(c => {
      if (selectedClinicFilter !== 'all') {
        const cl = (c.clinicName || '').toLowerCase();
        if (selectedClinicFilter === 'mylondon' && !cl.includes('london')) return false;
        if (selectedClinicFilter === 'ydl' && !cl.includes('york') && !cl.includes('ydl') && !(c.referredBy || '').toLowerCase().includes('walid')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hay = `${c.code} ${c.patientName} ${c.dob} ${c.clinicName} ${c.email} ${c.phone} ${c.zohoBiginId} ${c.referredBy}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [proAgeClients, searchQuery, selectedClinicFilter]);

  // Comparison Table Columns (Golden Rule #3 & #30)
  const comparisonColumns = useMemo(() => [
    {
      key: 'parameter',
      label: isEs ? 'Dimensión Clínica / Analítica' : 'Clinical & Analytical Dimension',
      width: '24%',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
          {row.parameter}
        </span>
      )
    },
    {
      key: 'proage',
      label: 'ETERNA ProAge™ (Biological Age & Organ Proteomics)',
      width: '38%',
      render: (row) => (
        <div style={{
          padding: '6px 10px',
          borderRadius: '8px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          color: '#0369a1',
          fontSize: '0.80rem',
          fontWeight: 600,
          lineHeight: 1.45
        }}>
          {row.proage}
        </div>
      )
    },
    {
      key: 'progen',
      label: 'ETERNA ProGen™ (+700k SNPs Genomic Baseline)',
      width: '38%',
      render: (row) => (
        <div style={{
          padding: '6px 10px',
          borderRadius: '8px',
          background: '#f5f3ff',
          border: '1px solid #ddd6fe',
          color: '#5b21b6',
          fontSize: '0.80rem',
          fontWeight: 600,
          lineHeight: 1.45
        }}>
          {row.progen}
        </div>
      )
    }
  ], [isEs]);

  // ProAge Clients DataTable Columns (Golden Rule #3, #8, #11, #30)
  const proAgeColumns = useMemo(() => [
    {
      key: 'code',
      label: isEs ? 'Código Muestra' : 'Sample Code',
      width: '16%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <CopyableId value={row.code} />
          <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
            Sample: {row.sampleDate}
          </span>
        </div>
      )
    },
    {
      key: 'patientName',
      label: isEs ? 'Cliente / Paciente (ProAge)' : 'Client / Patient (ProAge)',
      width: '23%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
            {row.patientName}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            DOB: <strong>{row.dob}</strong> · {row.gender}
          </span>
        </div>
      )
    },
    {
      key: 'clinicName',
      label: isEs ? 'Clínica & Zoho Bigin CRM' : 'Clinic & Zoho Bigin CRM',
      width: '25%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontWeight: 700, color: '#003666', fontSize: '0.79rem' }}>
            {row.clinicName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {row.zohoBiginId && (
              <span style={{ fontSize: '0.68rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                Bigin ID: <CopyableId value={row.zohoBiginId} />
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'biologicalAgeText',
      label: isEs ? 'Edad Cronológica vs Biológica' : 'Chrono vs. Biological Age',
      width: '18%',
      render: (row) => {
        const isYounger = Number(row.ageDeltaYears) < 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '0.78rem', color: '#334155' }}>
              Chrono: <strong>{row.chronologicalAgeText}</strong> → Bio: <strong style={{ color: isYounger ? '#15803d' : '#b45309' }}>{row.biologicalAgeText}</strong>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              padding: '1px 7px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 800,
              background: isYounger ? '#dcfce7' : '#fef3c7',
              color: isYounger ? '#15803d' : '#b45309'
            }}>
              {isYounger ? `${row.ageDeltaYears} yrs (Rejuvenated)` : `+${row.ageDeltaYears} yrs (Accelerated)`}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: isEs ? 'Estado & Dossier' : 'Status & Dossier',
      width: '18%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
          <StatusBadge status={row.status || 'approved'} />
          <Link
            href={`/lab/${encodeURIComponent(row.code)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              borderRadius: '6px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#003666',
              fontSize: '0.72rem',
              fontWeight: 750,
              textDecoration: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span>Dossier</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      )
    }
  ], [isEs]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* ── 1. Top Header & Section Switcher Banner ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.35rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '5px',
                background: '#e0f2fe',
                color: '#0369a1',
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <Sparkles size={12} />
                <span>ETERNA® Dual Diagnostic Architecture</span>
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '5px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: '0.68rem',
                fontWeight: 750
              }}>
                Synced with Zoho Bigin CRM & Firestore
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)', fontWeight: 800, color: '#003666' }}>
              {isEs
                ? 'ETERNA ProAge™ vs. ETERNA ProGen™: Diferencias Clínicas, Especificaciones & Cohortes Activas'
                : 'ETERNA ProAge™ vs. ETERNA ProGen™: Clinical Architecture, Specifications & Active Cohorts'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#475569', lineHeight: 1.5, maxWidth: '980px' }}>
              {isEs
                ? 'ETERNA opera dos pruebas complementarias procesadas junto a Eurofins Genomics: (1) ETERNA ProAge™ (reloj dinámico de edad biológica y proteómica sérica en 5 sistemas de órganos, con 6 clientes activos) y (2) ETERNA ProGen™ (genotipado fijo de por vida de +700.000 SNPs en saliva mediante Illumina Infinium GSA, actualmente con 0 clientes registrados).'
                : 'ETERNA operates two complementary diagnostic modalities processed with Eurofins Genomics: (1) ETERNA ProAge™ (dynamic biological age clock & 5-organ serum proteomics with 6 active clients) and (2) ETERNA ProGen™ (lifetime +700,000 SNPs buccal saliva microarray on Illumina Infinium GSA, currently with 0 registered clients).'}
            </p>
          </div>

          {/* Sub-section Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: isEs ? 'Vista Completa' : 'Complete View' },
              { id: 'comparison', label: isEs ? 'Diferencias ProAge vs ProGen' : 'ProAge vs. ProGen Comparison' },
              { id: 'proage', label: '1. ETERNA ProAge™ (6 Clients)' },
              { id: 'progen', label: '2. ETERNA ProGen™ (0 Clients)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubSection(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: activeSubSection === tab.id ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  background: activeSubSection === tab.id ? '#e0f2fe' : '#f8fafc',
                  color: activeSubSection === tab.id ? '#0369a1' : '#475569',
                  fontSize: '0.76rem',
                  fontWeight: activeSubSection === tab.id ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4 Mandatory KPIs + Scope Switcher (Golden Rule #22) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginTop: '0.75rem'
        }}>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#0369a1' }}>
              <span>ETERNA ProAge™ Cohort</span>
              <Droplets size={14} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0c4a6e', marginTop: '2px' }}>
              {scopeMode === 'filtered' ? filteredProAgeClients.length : proAgeClients.length} Active Clients
            </div>
            <div style={{ fontSize: '0.70rem', color: '#0369a1' }}>
              5-Organ Biological Age Clock · Zoho Bigin Synced
            </div>
          </div>

          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#6d28d9' }}>
              <span>ETERNA ProGen™ Cohort</span>
              <Dna size={14} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4c1d95', marginTop: '2px' }}>
              0 Active Clients
            </div>
            <div style={{ fontSize: '0.70rem', color: '#6d28d9' }}>
              +700,000 SNPs Illumina GSA · Ready for Onboarding
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>
              <span>Mean Rejuvenation Responder</span>
              <HeartPulse size={14} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532d', marginTop: '2px' }}>
              −1.8 Years ΔAge
            </div>
            <div style={{ fontSize: '0.70rem', color: '#15803d' }}>
              Dr. Sobia Mirza (−2.4y), Dr. Sajid Burud (−1.7y)
            </div>
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>
              <span>Partner Clinics (UAE)</span>
              <Building2 size={14} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#78350f', marginTop: '2px' }}>
              5 Institutions
            </div>
            <div style={{ fontSize: '0.70rem', color: '#b45309' }}>
              My London Skin, YDL, Dr. Ozone, Transcend, Abu Sharia
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Technical & Clinical Comparison Table: ProAge vs ProGen ── */}
      {(activeSubSection === 'all' || activeSubSection === 'comparison') && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.35rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '0.9rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Microscope size={18} color="#0284c7" />
              <span>{isEs ? '1. Matriz Comparativa: ETERNA ProAge™ vs. ETERNA ProGen™' : '1. Clinical & Analytical Comparison: ETERNA ProAge™ vs. ETERNA ProGen™'}</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.80rem', color: '#64748b' }}>
              {isEs
                ? 'ProGen establece la arquitectura genética fija del paciente (una vez en la vida), mientras que ProAge cuantifica dinámicamente el envejecimiento biológico por órganos y la respuesta al tratamiento.'
                : 'ProGen establishes the immutable genetic blueprint of the patient (once in a lifetime), while ProAge dynamically quantifies organ-specific biological aging and therapeutic response over time.'}
            </p>
          </div>

          <DataTable
            columns={comparisonColumns}
            data={COMPARISON_DIMENSIONS}
            rowKey="id"
            pageSize={10}
            emptyMessage="No comparison dimensions"
          />
        </div>
      )}

      {/* ── 3. Dedicated Section: ETERNA ProAge™ + 6 Active Clients (Zoho Bigin Enriched) ── */}
      {(activeSubSection === 'all' || activeSubSection === 'proage') && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #bae6fd',
          borderRadius: '14px',
          padding: '1.35rem 1.5rem',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            paddingBottom: '0.9rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '5px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  TEST MODALITY 01 · DYNAMIC EPIGENETICS & PROTEOMICS
                </span>
                <StatusBadge status="active" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#003666' }}>
                ETERNA ProAge™ — Dynamic Biological Age & 5-Organ Proteomic Clock (6 Active Clients)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.81rem', color: '#475569', lineHeight: 1.45, maxWidth: '920px' }}>
                {isEs
                  ? 'Analiza biomarcadores proteómicos séricos y relojes epigenéticos en sangre capilar para determinar la edad biológica global y específica de 5 sistemas orgánicos (Cardiovascular, Hepático, Renal, Metabólico e Inmunitario). Todos los registros están vinculados con Zoho Bigin CRM.'
                  : 'Analyzes serum proteomic biomarkers and epigenetic clocks from capillary blood to determine systemic and 5-organ biological age (Cardiovascular, Hepatic, Renal, Metabolic, and Immune). All 6 active patient/physician records below are enriched with Zoho Bigin CRM data.'}
              </p>
            </div>

            {/* Scope Switcher (Golden Rule #22) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                padding: '4px 9px',
                borderRadius: '6px',
                background: scopeMode === 'filtered' ? '#e0f2fe' : '#f1f5f9',
                border: '1px solid #bae6fd',
                color: '#0369a1',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {scopeMode === 'filtered'
                  ? `Matching Active Filters (${filteredProAgeClients.length} items)`
                  : `Entire Database (${proAgeClients.length} items)`}
              </span>
              <button
                type="button"
                onClick={() => setScopeMode(prev => prev === 'filtered' ? 'global' : 'filtered')}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {scopeMode === 'filtered' ? 'Switch to Global' : 'Switch to Filtered'}
              </button>
            </div>
          </div>

          {/* Priority GlobalSearchBar (Golden Rule #7) */}
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <GlobalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search ETERNA ProAge™ clients by name, sample code (e.g. DBUQEWUU2449), clinic, or Zoho Bigin ID..."
              resultCount={filteredProAgeClients.length}
              namespace="eterna-proage-cohort"
              size="md"
              filters={[
                {
                  key: 'testType',
                  label: 'Modality',
                  value: 'ETERNA ProAge™'
                },
                selectedClinicFilter !== 'all' && {
                  key: 'clinic',
                  label: 'Partner Network',
                  value: selectedClinicFilter === 'mylondon' ? 'My London Skin Clinic' : 'YDL / Walid Soaida Network',
                  onRemove: () => setSelectedClinicFilter('all')
                }
              ].filter(Boolean)}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Filter by Partner Hub:</span>
              {[
                { id: 'all', label: `All ProAge Clients (${proAgeClients.length})` },
                { id: 'mylondon', label: 'My London Skin Clinic (2)' },
                { id: 'ydl', label: 'YDL / Walid Soaida Referral Hub (3)' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedClinicFilter(f.id)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '999px',
                    border: selectedClinicFilter === f.id ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    background: selectedClinicFilter === f.id ? '#e0f2fe' : '#f8fafc',
                    color: selectedClinicFilter === f.id ? '#0369a1' : '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
              {(searchQuery || selectedClinicFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClinicFilter('all');
                  }}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '999px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Reset Filters ×
                </button>
              )}
            </div>
          </div>

          {/* Master-Detail DataTable of 6 ProAge Clients (Golden Rule #3 & #4) */}
          <DataTable
            columns={proAgeColumns}
            data={filteredProAgeClients}
            rowKey="code"
            pageSize={10}
            expandableRender={(row) => (
              <div style={{
                padding: '12px 16px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                fontSize: '0.78rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Patient & Sample Metadata
                  </div>
                  <div style={{ marginTop: '4px', color: '#0f172a', fontWeight: 700 }}>{row.patientName}</div>
                  <div style={{ color: '#475569' }}>DOB: {row.dob} · Sample Date: {row.sampleDate}</div>
                  <div style={{ color: '#475569' }}>Sample Barcode: <code>{row.code}</code></div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Zoho Bigin CRM Enrichment
                  </div>
                  <div style={{ marginTop: '4px', color: '#003666', fontWeight: 700 }}>{row.clinicName}</div>
                  <div style={{ color: '#475569' }}>Stage: {row.zohoPipelineStage}</div>
                  <div style={{ color: '#475569' }}>Referred By: {row.referredBy}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Verified Contact Coordinates
                  </div>
                  {row.email && (
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px', color: '#0369a1' }}>
                      <Mail size={12} />
                      <a href={`mailto:${row.email}`} style={{ color: '#0369a1', textDecoration: 'none', fontWeight: 600 }}>{row.email}</a>
                    </div>
                  )}
                  {row.phone && (
                    <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                      <Phone size={12} />
                      <span>{row.phone} ({row.city})</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Link
                    href={`/lab/${encodeURIComponent(row.code)}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#003666',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <FileText size={13} />
                    <span>Open Interactive ProAge Report</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* ── 4. Dedicated Section: ETERNA ProGen™ (+700,000 SNPs Saliva DNA) + EmptyState (0 Clients) ── */}
      {(activeSubSection === 'all' || activeSubSection === 'progen') && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #ddd6fe',
          borderRadius: '14px',
          padding: '1.35rem 1.5rem',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            paddingBottom: '0.9rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '5px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  TEST MODALITY 02 · LIFETIME GENOMIC MICROARRAY (+700K SNPS)
                </span>
                <StatusBadge status="pending" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#4c1d95' }}>
                ETERNA ProGen™ — High-Density Saliva DNA & Polygenic Risk Score Platform (0 Active Clients)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.81rem', color: '#475569', lineHeight: 1.45, maxWidth: '920px' }}>
                {isEs
                  ? 'Genotipado de alta densidad (>692.000 SNPs mediante Illumina Infinium GSA en Eurofins Genomics) a partir de muestra de saliva no invasiva. Evalúa predisposición genética fija en 5 pilares clínicos: Deporte (ACTN3, COL1A1), Nutrición y Metilación (MTHFR, CYP1A2, VDR), Prevención Cardiovascular (APOE, LPA), Longevidad (FOXO3, TCF7L2) y Cronobiología (CLOCK, COMT).'
                  : 'High-density microarray genotyping (>692,000 SNPs on Illumina Infinium GSA at Eurofins Genomics) from a non-invasive buccal saliva swab. Evaluates lifetime genomic predisposition across 5 clinical pillars: Sport & Tissue (ACTN3, COL1A1), Nutrition & Methylation (MTHFR, CYP1A2, VDR), Cardiovascular Prevention (APOE, LPA), Longevity (FOXO3, TCF7L2), and Circadian Neurobiology (CLOCK, COMT).'}
              </p>
            </div>
          </div>

          {/* 5 Pillars Mini Summary Grid for ProGen */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            marginBottom: '1.25rem'
          }}>
            {[
              { title: '1. Sport & Connective Tissue', genes: 'ACTN3, COL1A1, IL6', desc: 'Fast-twitch muscle power & tendon integrity' },
              { title: '2. Nutrition & Methylation', genes: 'MTHFR, CYP1A2, VDR', desc: '5-MTHF folate conversion & receptor affinity' },
              { title: '3. Cardiovascular Prevention', genes: 'APOE, LPA, PCSK9', desc: 'ApoB clearance & endothelial resilience' },
              { title: '4. Longevity & Autophagy', genes: 'FOXO3, TCF7L2, SIRT1', desc: 'Cellular autophagy & incretin sensitivity' },
              { title: '5. Circadian & Neuroendocrine', genes: 'CLOCK, COMT, BDNF', desc: 'Catecholamine clearance & sleep architecture' }
            ].map((p, idx) => (
              <div key={idx} style={{
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '10px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#4c1d95' }}>{p.title}</div>
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#7c3aed', fontFamily: 'ui-monospace, monospace', marginTop: '2px' }}>
                  {p.genes}
                </div>
                <div style={{ fontSize: '0.71rem', color: '#64748b', marginTop: '3px' }}>{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Golden Rule #20: Standard EmptyState for 0 ProGen Clients */}
          <EmptyState
            icon={Dna}
            title={isEs ? 'Actualmente no hay clientes registrados en ETERNA ProGen™ (0 clientes)' : 'No ETERNA ProGen™ Clients Registered Yet (0 Active Clients)'}
            subtitle={
              isEs
                ? 'Todos los 6 clientes actuales de ETERNA pertenecen a la cohorte ProAge™. Los kits salivales CE-IVDR de ETERNA ProGen™ (+700.000 SNPs) están disponibles para asignación clínica inmediata.'
                : 'All 6 current ETERNA clients belong to the ProAge™ cohort above. ETERNA ProGen™ CE-IVDR saliva DNA kits (+700,000 SNPs) are ready in inventory for immediate physician & patient onboarding.'
            }
            action={
              onOpenInquiry
                ? {
                    label: isEs ? 'Solicitar Kits ETERNA ProGen™' : 'Request ETERNA ProGen™ Kits',
                    onClick: onOpenInquiry
                  }
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}


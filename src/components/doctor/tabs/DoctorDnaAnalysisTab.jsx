"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Dna,
  RotateCw,
  ArrowUpRight,
  Download,
  Utensils,
  ShieldCheck,
  Sparkles,
  Search,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
  Pill,
  MessageSquare,
  Check
} from 'lucide-react';
import DataTable from '../../ui/DataTable';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import CopyableId from '../../ui/CopyableId';
import StatusBadge from '../../ui/StatusBadge';
import GcpKpiRow from '../ui/GcpKpiRow';
import { evaluateNutrigenomicProfile } from '@/data/genomics/clinicalNutrigenomicEngine';
import { triangulateGenotypePhenotype, resolveTargetMagistralTemplate } from '@/data/genomics/biomarkerTriangulationEngine';
import { detectDnaTestFamily, resolveNonNutrigenomicDnaProfile } from '@/utils/clinical/dnaProfileResolver';
import CompoundedRxCustomizerDrawer from '../dna/CompoundedRxCustomizerDrawer';

/**
 * DoctorDnaAnalysisTab
 *
 * Dedicated Clinical Genomics & DNA Intelligence Tab for Physicians
 * Features:
 * - 4 GCP-style Top KPIs (Total Sequenced, CE-IVD Microarrays, Actionable Pharmacogenomics, Active Protocols)
 * - Scope Indicator (Unfiltered Database vs Active Filter View)
 * - CE-IVD Certified Microarray (Illumina GSA-24 BeadChip, 700k+ SNPs) & qPCR Assays
 * - Master-Detail Expandable Row with 5 Clinical Genomic Axes Gauges
 * - Ancestral Metabolic Heritage & Dietary Compatibility Insight
 * - 1-Click Patient DNA Portal, Clinical Rx Dossier (59p), and 7-Day Meal Plan (59p)
 */
export default function DoctorDnaAnalysisTab({
  dnaResults = [],
  slug = '',
  handleRefresh,
  isSwitchingDoctor = false,
  onUploadPdf = null,
  activePatientFilter = 'all',
  onNavigateToRx = null
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all'); // 'all' | 'fagron' | '24genomics' | 'eterna'
  const [selectedAssay, setSelectedAssay] = useState('all');
  const [timeRange, setTimeRange] = useState('all'); // 'all' | '30d' | '90d'
  const [prescribingId, setPrescribingId] = useState(null);
  const [createdRx, setCreatedRx] = useState({});
  const [copiedWhatsAppId, setCopiedWhatsAppId] = useState(null);
  const [kpiScope, setKpiScope] = useState('active');
  const [drawerData, setDrawerData] = useState({
    isOpen: false,
    row: null,
    profile: null,
    formulation: null
  });

  const handleOpenCustomizer = (row, profile) => {
    const resolved = resolveTargetMagistralTemplate({
      genomicProfile: profile,
      labResults: row.labResults || []
    });
    setDrawerData({
      isOpen: true,
      row,
      profile,
      formulation: resolved
    });
  };

  const handleCreateCompoundedPrescription = async (row, profile) => {
    const sampleKey = row.sampleId || row.code;
    setPrescribingId(sampleKey);
    try {
      const resolved = resolveTargetMagistralTemplate({
        genomicProfile: profile,
        labResults: row.labResults || []
      });

      const res = await fetch('/api/prescriptions/create-compounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: slug || 'dr-sajid-burud',
          doctorName: row.doctorName || 'Dr. Sajid Burud',
          doctorLicense: 'DHA-00132881',
          clinicName: row.clinicName || 'Transcend Healthcare',
          clinicAddress: 'Jumeirah, Dubai, UAE',
          doctorSpecialty: 'Integrative & Regenerative Medicine',
          patient: {
            name: row.patientName || 'Ms. Wafa Burud',
            id: row.patient?.id || `pt-${sampleKey}`,
            dob: row.patient?.dob || '1988-04-12',
            gender: row.patient?.gender || 'Female'
          },
          treatmentTitle: resolved.title || 'Atlas Precision Nutrigenomic Regimen (3-Capsule Magistral)',
          formulationBlocks: resolved.formulationBlocks,
          formulaSummary: resolved.summaryRationale,
          nutrigenomicProfile: {
            sampleId: sampleKey,
            genotypes: profile?.genotypesEvaluated || {},
            templateId: resolved.templateId,
            score: 85
          }
        })
      });
      const data = await res.json();
      if (data.success && (data.rxCode || data.prescription)) {
        const code = data.rxCode || data.prescription?.code;
        setCreatedRx(prev => ({ ...prev, [sampleKey]: { code, id: data.id } }));
      }
    } catch (err) {
      console.error('Failed to create compounded prescription:', err);
    } finally {
      setPrescribingId(null);
    }
  };

  const handleCopyWhatsAppSummary = (row, _profile, nonNutriProfile = null) => {
    const sampleKey = row.sampleId || row.code;
    const patient = row.patientName || 'Patient';
    const doc = row.doctorName || 'Dr. Sajid Burud';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://regenpept.com';
    const portalUrl = `${origin}/patient/dna-report?patient=${encodeURIComponent(patient)}&sample=${encodeURIComponent(sampleKey)}&doctor=${encodeURIComponent(doc)}&clinic=Transcend+Healthcare`;

    const text = nonNutriProfile
      ? nonNutriProfile.whatsappSummary(patient, doc, portalUrl)
      : `🧬 *24Genetics Clinical DNA Intelligence* · Atlas Health Services
👤 *Patient:* ${patient} (Specimen #${sampleKey})
👨‍⚕️ *Physician:* ${doc} · Transcend Healthcare

*Clinical Summary & Immediate Dietary Action Plan:*
• 🥛 *Lactose & Dairy (MCM6 GG):* Severe adult hypolactasia detected. Complete cow dairy exclusion required. Non-bovine calcium shield protocol initiated.
• ⚡ *Methylation Vitality (MTHFR GG):* Normal wild-type methylation. Avoid synthetic folic acid; leafy green dietary folate is optimal.
• 🍚 *Glycemic Sensitivity (FTO / IRS1):* Elevated postprandial glucose sensitivity. Apply 1-2-3 Plate Sequencing (Vegetables → Protein → Complex Carbs).
• ☕ *Caffeine Anxiety (ADORA2A TT):* Slow caffeine clearance. Strictly cut off caffeine after 11:00 AM to preserve deep sleep architecture.

🌐 *Interactive Patient Portal:* ${portalUrl}
💊 *Status:* 3-Capsule Personalized Magistral Compound ready for pharmacy dispensing.`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsAppId(sampleKey);
    setTimeout(() => setCopiedWhatsAppId(null), 3500);
  };

  const ASSAY_OPTIONS = useMemo(() => ({
    all: [
      { id: 'all', label: 'All DNA & Genomic Panels' },
      { id: 'tricho', label: 'Fagron TrichoTest™ (Alopecia)' },
      { id: 'telo', label: 'Fagron TeloTest™ (Biological Age)' },
      { id: 'nutrigen', label: 'Fagron NutriGen™ (Metabolism)' },
      { id: 'acne', label: 'Fagron AcneTest™' },
      { id: 'derma', label: 'Fagron Dermagen™' },
      { id: 'obesi', label: 'Fagron ObesiGen™' },
      { id: 'skin-hair', label: '24Genomics · Skin & Hair' },
      { id: 'nutrition', label: '24Genomics · Nutrition' },
      { id: 'health', label: '24Genomics · Health & Wellness' },
      { id: 'pharma', label: '24Genomics · Pharmacogenetics' },
      { id: 'sports', label: '24Genomics · Sports' },
      { id: 'ancestry', label: '24Genomics · Ancestry' },
      { id: 'personality', label: '24Genomics · Personality' },
      { id: 'eterna', label: 'Eterna™ Epigenetic / Proteomic' },
    ],
    fagron: [
      { id: 'all', label: 'All Fagron Genomics Panels' },
      { id: 'tricho', label: 'TrichoTest™ (Hair & Alopecia)' },
      { id: 'telo', label: 'TeloTest™ (Telomere Age)' },
      { id: 'nutrigen', label: 'NutriGen™ (Nutrigenetics)' },
      { id: 'acne', label: 'AcneTest™' },
      { id: 'derma', label: 'Dermagen™' },
      { id: 'obesi', label: 'ObesiGen™' },
    ],
    '24genomics': [
      { id: 'all', label: 'All 24Genomics Panels' },
      { id: 'skin-hair', label: 'Skin & Hair' },
      { id: 'nutrition', label: 'Nutrition' },
      { id: 'health', label: 'Health & Wellness' },
      { id: 'pharma', label: 'Pharmacogenetics' },
      { id: 'sports', label: 'Sports' },
      { id: 'ancestry', label: 'Ancestry' },
      { id: 'personality', label: 'Personality' },
    ],
    eterna: [
      { id: 'all', label: 'All Eterna™ Assays' },
      { id: 'eterna', label: 'Eterna™ Epigenetic / Proteomic Aging' },
    ],
  }), []);

  const getPlatformBucket = (row) => {
    const text = `${row.testName || ''} ${row.testType || ''} ${row.biomarker || ''} ${row.laboratory?.name || ''}`.toLowerCase();
    if (text.includes('eterna') || text.includes('proteom')) return 'eterna';
    if (
      text.includes('24gen') ||
      text.includes('illumina') ||
      text.includes('skin & hair') ||
      text.includes('ancestry') ||
      text.includes('personality')
    ) {
      return '24genomics';
    }
    if (
      text.includes('fagron') ||
      text.includes('tricho') ||
      text.includes('telo') ||
      text.includes('nutrigen') ||
      text.includes('acne') ||
      text.includes('dermagen') ||
      text.includes('obesigen')
    ) {
      return 'fagron';
    }
    return 'fagron';
  };

  const platformCounts = useMemo(() => {
    const counts = { all: dnaResults.length, fagron: 0, '24genomics': 0, eterna: 0 };
    for (const row of dnaResults) {
      const b = getPlatformBucket(row);
      counts[b] = (counts[b] || 0) + 1;
    }
    return counts;
  }, [dnaResults]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    const nowMs = Date.now();
    const maxAgeDays = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : null;

    return dnaResults.filter((row) => {
      if (activePatientFilter && activePatientFilter !== 'all') {
        const ptName = String(row.patientName || row.patient?.name || '').toLowerCase();
        if (!ptName.includes(String(activePatientFilter).toLowerCase())) return false;
      }
      const text = `${row.patientName || row.patient?.name || ''} ${row.code || ''} ${row.sampleId || ''} ${row.testName || ''} ${row.testType || ''} ${row.biomarker || ''} ${row.laboratory?.name || ''}`.toLowerCase();
      const matchQuery = !filterQuery || text.includes(filterQuery.toLowerCase());
      if (!matchQuery) return false;

      if (selectedPlatform !== 'all' && getPlatformBucket(row) !== selectedPlatform) {
        return false;
      }

      if (selectedAssay !== 'all') {
        if (selectedAssay === 'skin-hair') {
          if (!text.includes('skin') && !text.includes('hair')) return false;
        } else if (!text.includes(selectedAssay)) {
          return false;
        }
      }

      if (maxAgeDays) {
        const rawDate = row.analysisDate || row.date;
        if (rawDate) {
          const parsed = new Date(rawDate).getTime();
          if (Number.isFinite(parsed) && nowMs - parsed > maxAgeDays * 86400000) {
            return false;
          }
        }
      }
      return true;
    });
  }, [dnaResults, filterQuery, selectedPlatform, selectedAssay, timeRange, activePatientFilter]);

  const kpiMetrics = useMemo(() => {
    const source = kpiScope === 'active' ? filteredData : dnaResults;
    const families = new Set();
    let fagronCount = 0;
    let linkedRxCount = 0;

    for (const row of source) {
      const family = detectDnaTestFamily(row);
      families.add(family);
      if (getPlatformBucket(row) === 'fagron') fagronCount += 1;
      if (row.reportUrl || row.pdfReportUrl) linkedRxCount += 1;
    }

    const total = source.length;
    const fagronPct = total > 0 ? Math.round((fagronCount / total) * 100) : 0;

    return {
      total,
      fagronCount,
      fagronPct,
      panelCount: families.size,
      linkedRxCount,
    };
  }, [kpiScope, filteredData, dnaResults]);

  // Columns definition following strict GCP styling & DataTable Golden Rules
  const columns = useMemo(() => [
    {
      key: 'code',
      header: 'Patient / Specimen ID',
      width: '22%',
      sortable: true,
      render: (_val, row) => {
        const patientDisplay = row.patientName || row.patient?.name || 'Clinical Patient';
        const rawCode = row.sampleId || row.code || row.protocolNumber || '';
        const sampleCode = rawCode && rawCode !== '—' ? rawCode : '';
        const specimenType = row.sampleType || 'Saliva CE-IVD (2.0 mL)';
        const dateStr = row.analysisDate || row.date || '2026-11-13';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
              {patientDisplay}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', fontSize: '0.70rem', color: '#5f6368' }}>
              {sampleCode ? <CopyableId value={sampleCode} iconOnly={false} /> : null}
              <span>{specimenType}</span>
              <span>•</span>
              <span>{dateStr.slice(0, 10)}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'testName',
      header: 'Genomic Assay & Technology',
      width: '28%',
      sortable: true,
      render: (_val, row) => {
        const tName = String(row.testName || row.biomarker || 'Genomic Profile');
        const isNutrigen = tName.toLowerCase().includes('nutri') || tName.toLowerCase().includes('24gen');
        const isTelo = tName.toLowerCase().includes('telo');
        const isTricho = tName.toLowerCase().includes('tricho');

        const title = isNutrigen
          ? '24Genetics Nutrition 2.0 (CE-IVD)'
          : isTelo
          ? 'Fagron TeloTest™ · Biological Age DNA'
          : isTricho
          ? 'Fagron TrichoTest™ · Pharmacogenomics'
          : tName;

        const platform = isNutrigen
          ? 'Illumina Infinium GSA-24 BeadChip'
          : isTelo
          ? 'Absolute qPCR (T/S Ratio)'
          : isTricho
          ? 'DNA Microarray Pharmacogenetics'
          : 'Genomic Sequencing Platform';

        const lab = isNutrigen
          ? '24Genetics Central Clinical Lab'
          : isTelo || isTricho
          ? 'Fagron Genomics Barcelona'
          : 'Accredited Molecular Genetics Lab';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 650, color: '#202124' }}>
                {title}
              </span>
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: '#1a73e8',
                  backgroundColor: '#e8f0fe',
                  border: '1px solid #d2e3fc',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                CE-IVD
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#5f6368', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 500, color: '#137333' }}>{lab}</span>
              <span>•</span>
              <span>{platform}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'findings',
      header: 'Clinical Findings & Key SNPs',
      width: '24%',
      sortable: true,
      render: (_val, row) => {
        const score = Number(row.value) || 85;
        const unitLabel = row.unit ? `${score} ${row.unit}` : `${score} Score`;
        const family = detectDnaTestFamily(row);
        const nonNutri = family !== 'nutrigenomics' ? resolveNonNutrigenomicDnaProfile(row, family) : null;
        const profileLabel = row.testType || (nonNutri ? nonNutri.testLabel : 'Nutrigenomic Profile');
        const badges = nonNutri
          ? nonNutri.badges
          : [
              { label: 'MCM6 GG (Lactose)', tone: 'danger' },
              { label: 'ADORA2A TT (Caffeine)', tone: 'warn' },
              { label: 'MTHFR GG (Methylation)', tone: 'success' },
            ];
        const summaryPathways = badges.map((b) => String(b.label || '').split('(')[0].trim()).filter(Boolean).join(' · ');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 650, color: '#202124' }}>
                {profileLabel}
              </span>
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  color: '#137333',
                  backgroundColor: '#e6f4ea',
                  border: '1px solid #ceead6',
                  padding: '1px 6px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                {unitLabel}
              </span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', lineHeight: 1.35 }}>
              {summaryPathways}
            </div>
          </div>
        );
      }
    },
    {
      key: 'analysisDate',
      header: 'Date & Status',
      width: '12%',
      sortable: true,
      render: (_val, row) => {
        const dateStr = String(row.analysisDate || row.date || '—').slice(0, 10);
        const gender = row.patient?.gender || '';
        const age = row.patient?.age ? `${row.patient.age} yrs` : '';
        const demographics = [gender, age].filter(Boolean).join(' · ');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
            <StatusBadge status={row.status || 'ready'} />
            <span style={{ fontSize: '0.70rem', color: '#5f6368', fontFamily: 'monospace' }}>
              {dateStr}
            </span>
            {demographics && (
              <span style={{ fontSize: '0.68rem', color: '#70757a' }}>{demographics}</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Clinical Actions',
      width: '14%',
      render: (_val, row) => {
        const portalUrl = row.reportUrl || `/patient/dna-report?patient=${encodeURIComponent(row.patientName || 'Patient')}&sample=${encodeURIComponent(row.sampleId || row.code || '')}`;
        const rxPdfUrl = row.pdfReportUrl || (getPlatformBucket(row) === '24genomics'
          ? `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(row.patientName || 'Patient')}&sample=${encodeURIComponent(row.sampleId || row.code || '')}`
          : null);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Link
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Clinical Dossier / DNA Portal"
              className="gcp-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                backgroundColor: '#ffffff',
                color: '#1a73e8',
                fontSize: '0.72rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Portal</span>
              <ArrowUpRight size={12} />
            </Link>

            {onNavigateToRx && (
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToRx(row.sampleId || row.code || row.patientName || '');
                }}
                title="View linked prescription in Prescriptions tab"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#3c4043',
                  fontSize: '0.70rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Rx →</span>
              </button>
            )}

            {rxPdfUrl && (
              <a
                href={rxPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                title="Download Clinical Report PDF"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 7px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#5f6368',
                  fontSize: '0.70rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <Download size={12} />
                <span style={{ marginLeft: '3px' }}>PDF</span>
              </a>
            )}
          </div>
        );
      }
    }
  ], []);

  return (
    <section
      id="dna_analysis"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* ── Scope Switcher & Filter Indicator (Golden Rule #22) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e8eaed'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
          <span style={{ color: '#5f6368', fontWeight: 600 }}>KPI Analytics Scope:</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: kpiScope === 'active' ? '#e8f0fe' : '#e6f4ea',
              color: kpiScope === 'active' ? '#1a73e8' : '#137333',
              border: kpiScope === 'active' ? '1px solid #d2e3fc' : '1px solid #ceead6',
              fontWeight: 700,
              fontSize: '0.68rem'
            }}
          >
            {kpiScope === 'active'
              ? `Matching Active Filters (${filteredData.length} specimens)`
              : `Entire Practice (${dnaResults.length} unfiltered)`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setKpiScope('active')}
            style={{
              padding: '3px 10px',
              fontSize: '0.70rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: kpiScope === 'active' ? '1px solid #1a73e8' : '1px solid #dadce0',
              backgroundColor: kpiScope === 'active' ? '#e8f0fe' : '#ffffff',
              color: kpiScope === 'active' ? '#1a73e8' : '#5f6368',
              cursor: 'pointer'
            }}
          >
            Filtered View ({filteredData.length})
          </button>
          <button
            type="button"
            onClick={() => setKpiScope('all')}
            style={{
              padding: '3px 10px',
              fontSize: '0.70rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: kpiScope === 'all' ? '1px solid #1a73e8' : '1px solid #dadce0',
              backgroundColor: kpiScope === 'all' ? '#e8f0fe' : '#ffffff',
              color: kpiScope === 'all' ? '#1a73e8' : '#5f6368',
              cursor: 'pointer'
            }}
          >
            Entire Practice ({dnaResults.length})
          </button>
        </div>
      </div>

      {/* ── 4 Top Google Cloud Style KPI Cards (Unified GcpKpiRow - Golden Rule #22) ── */}
      <GcpKpiRow
        items={[
          {
            id: 'sequenced',
            label: 'Sequenced Patients',
            value: kpiMetrics.total,
            badge: kpiScope === 'active' ? 'In View' : 'Entire Practice',
            badgeColor: '#137333',
            badgeBg: '#e6f4ea',
            subtitle: 'CE-IVD pharmacogenomic & DNA assays'
          },
          {
            id: 'fagron',
            label: 'Fagron Genomics',
            value: kpiMetrics.fagronCount,
            valueColor: '#1a73e8',
            badge: `${kpiMetrics.fagronPct}% Share`,
            badgeColor: '#1a73e8',
            badgeBg: '#e8f0fe',
            subtitle: 'TrichoTest™, TeloTest™ & NutriGen™'
          },
          {
            id: 'panels',
            label: 'Active Assay Panels',
            value: kpiMetrics.panelCount,
            badge: 'Multi-Panel',
            badgeColor: '#b06000',
            badgeBg: '#fef7e0',
            subtitle: 'Distinct diagnostic modalities'
          },
          {
            id: 'linked-rx',
            label: 'Linked Prescriptions',
            value: kpiMetrics.linkedRxCount,
            valueColor: '#137333',
            badge: 'Rx Matched',
            badgeColor: '#137333',
            badgeBg: '#e6f4ea',
            subtitle: 'Compounded regimens & dossiers'
          }
        ]}
      />

      {/* ── Main Data Card with Unified Search, Chips & Table ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
          overflow: 'hidden'
        }}
      >
        {dnaResults.length === 0 ? (
          <div
            style={{
              padding: '28px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              background: '#f8fafc'
            }}
          >
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              Upload TrichoTest™ or Genomic Report PDF — AI Auto-Links to Patient
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '520px', lineHeight: 1.45 }}>
              No DNA microarray reports are linked yet. Upload a patient&apos;s TrichoTest™ or 24Genomics PDF and Atlas AI will extract SNPs and attach it to their profile automatically.
            </div>
            {onUploadPdf && (
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={onUploadPdf}
                style={{ fontSize: '0.78rem', padding: '8px 16px', marginTop: '4px' }}
              >
                <Sparkles size={14} />
                <span>Upload DNA / TrichoTest™ PDF</span>
              </button>
            )}
          </div>
        ) : (
        <>
        {/* ── Google Cloud UX Search & Unified Filter Toolbar (Golden Rule #7 & #24) ── */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
              <GlobalSearchBar
                size="lg"
                value={filterQuery}
                onChange={setFilterQuery}
                placeholder="Search by patient name, specimen ID, SNP (SULT1A1, MTHFR), or assay..."
                resultCount={filteredData.length}
                namespace={`dna-analysis-${slug || 'default'}`}
              />
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh DNA Analysis Data"
              className="gcp-btn-secondary"
              style={{
                height: '40px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <RotateCw size={14} className={isSwitchingDoctor ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All DNA Assays', count: platformCounts.all },
                { id: 'fagron', label: 'Fagron Genomics', count: platformCounts.fagron },
                { id: '24genomics', label: '24Genomics', count: platformCounts['24genomics'] },
                { id: 'eterna', label: 'Eterna™', count: platformCounts.eterna },
              ]
                .filter((p) => p.id === 'all' || p.count > 0 || selectedPlatform === p.id)
                .map((plat) => {
                  const isSelected = selectedPlatform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(plat.id);
                        setSelectedAssay('all');
                      }}
                      style={{
                        height: '30px',
                        padding: '0 11px',
                        borderRadius: '16px',
                        fontSize: '0.74rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #1a73e8' : '1px solid #dadce0',
                        backgroundColor: isSelected ? '#e8f0fe' : '#ffffff',
                        color: isSelected ? '#1a73e8' : '#3c4043',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>{plat.label}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({plat.count})</span>
                    </button>
                  );
                })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                id={`dna-assay-select-${slug}`}
                aria-label="Filter by specific assay"
                value={selectedAssay}
                onChange={(e) => setSelectedAssay(e.target.value)}
                style={{
                  height: '30px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  backgroundColor: '#ffffff',
                  color: '#202124',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  maxWidth: '220px',
                }}
              >
                {(ASSAY_OPTIONS[selectedPlatform] || ASSAY_OPTIONS.all).map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                id={`dna-time-select-${slug}`}
                aria-label="Filter by timeframe"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  height: '30px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  backgroundColor: '#ffffff',
                  color: '#202124',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>

              {(selectedPlatform !== 'all' || selectedAssay !== 'all' || timeRange !== 'all' || filterQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlatform('all');
                    setSelectedAssay('all');
                    setTimeRange('all');
                    setFilterQuery('');
                  }}
                  style={{
                    height: '30px',
                    padding: '0 10px',
                    borderRadius: '15px',
                    border: '1px solid #dadce0',
                    backgroundColor: '#ffffff',
                    color: '#1a73e8',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── DataTable with Master-Detail Expandable Render (Golden Rule #3 & #4) ── */}
        <DataTable
          columns={columns}
          data={filteredData}
          keyField="id"
          tableId={`doctor-dna-analysis-${slug}`}
          pagination={true}
          initialRowsPerPage={10}
          alwaysShowPagination={false}
          emptyTitle="No DNA Analysis Records Found"
          emptyDescription="No genomic sequencing or DNA microarray reports match your active search or filters."
          expandableRender={(row) => {
            const portalUrl = row.reportUrl || `/patient/dna-report?patient=${encodeURIComponent(row.patientName || 'Patient')}&sample=${encodeURIComponent(row.sampleId || row.code || '')}`;
            const rxPdfUrl = row.pdfReportUrl || `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(row.patientName || 'Patient')}&sample=${encodeURIComponent(row.sampleId || row.code || '')}`;
            const mealPdfUrl = row.mealPlanPdfUrl || `/api/reports/24genomics-mealplan-pdf?patient=${encodeURIComponent(row.patientName || 'Patient')}&sample=${encodeURIComponent(row.sampleId || row.code || '')}`;

            const family = detectDnaTestFamily(row);
            const nonNutri = family !== 'nutrigenomics' ? resolveNonNutrigenomicDnaProfile(row, family) : null;

            const profile = nonNutri
              ? null
              : evaluateNutrigenomicProfile({
                  sampleCode: row.sampleId || row.code,
                  patientName: row.patientName,
                  doctor: row.doctorName,
                  clinic: row.clinicName
                });
            const triangulation = nonNutri
              ? {
                  compositeScore: Number(row.value) || 88,
                  highPriorityCount: nonNutri.convergenceItems.length,
                  interactions: nonNutri.convergenceItems,
                }
              : triangulateGenotypePhenotype({
                  genomicProfile: profile,
                  labResults: dnaResults
                });
            const axes = nonNutri ? nonNutri.axes : (profile.fiveClinicalAxes || []);
            const ancestral = nonNutri ? {} : (profile.ancestralMetabolicProfile || {});

            return (
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '18px 20px',
                  borderTop: '1px solid #dadce0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Header in Expandable */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      CLINICAL GENOMIC AUDIT & MULTIDISCIPLINARY TRANSLATION
                    </span>
                    <div style={{ fontSize: '0.96rem', fontWeight: 600, color: '#202124', marginTop: '2px' }}>
                      {nonNutri ? nonNutri.headerSubtitle : `5 Clinical Genomic Axes Overview · Specimen ${row.sampleId || row.code}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyWhatsAppSummary(row, profile, nonNutri)}
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: copiedWhatsAppId === (row.sampleId || row.code) ? '#137333' : '#1e8e3e',
                        background: copiedWhatsAppId === (row.sampleId || row.code) ? '#e6f4ea' : '#f6fdf7',
                        border: '1px solid #ceead6',
                        padding: '5px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {copiedWhatsAppId === (row.sampleId || row.code) ? <Check size={13} /> : <MessageSquare size={13} />}
                      <span>{copiedWhatsAppId === (row.sampleId || row.code) ? 'WhatsApp Copied ✓' : 'Copy WhatsApp Clinical Brief'}</span>
                    </button>

                    <Link
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 500,
                        color: '#1a73e8',
                        background: '#e8f0fe',
                        border: '1px solid #d2e3fc',
                        padding: '5px 12px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>Interactive Patient Portal</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* 5 Clinical Axes Linear Rows (Rule #70 · Google Cloud Console List UX) */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}
                >
                  {axes.map((ax, axIdx) => {
                    const accent = ax.badgeColor || '#1a73e8';
                    return (
                      <div
                        key={ax.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                          padding: '10px 14px',
                          borderLeft: `3px solid ${accent}`,
                          borderBottom: axIdx < axes.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', minWidth: 0, flex: '1 1 320px' }}>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: '#5f6368',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px 7px',
                              textTransform: 'uppercase',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Axis {ax.number}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#202124' }}>
                            {ax.titleEn?.split('(')[0]?.trim()}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
                            · Genes: <strong style={{ fontWeight: 600, color: '#3c4043' }}>{ax.keyGenes}</strong>
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            color: accent,
                            background: '#f8fafc',
                            border: `1px solid ${accent}33`,
                            borderRadius: '999px',
                            padding: '2px 9px',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {ax.riskLevel}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Domain-specific synthesis (Trichology / Longevity / Dermatology vs Nutrigenomics Ancestry) */}
                {nonNutri ? (
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #dadce0',
                      borderLeft: '4px solid #1a73e8',
                      borderRadius: '4px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Sparkles size={14} style={{ color: '#1a73e8' }} />
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {nonNutri.synthesisTitle}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#3c4043', lineHeight: 1.55 }}>
                      {nonNutri.synthesisText}
                    </p>
                  </div>
                ) : ancestral.clinicalSynthesisEn && (
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #dadce0',
                      borderLeft: '4px solid #1a73e8',
                      borderRadius: '4px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Sparkles size={14} style={{ color: '#1a73e8' }} />
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Ancestral Metabolic Compatibility ({ancestral.primaryRegion || 'South Asia'} · Haplogroup {ancestral.maternalHaplogroup})
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#3c4043', lineHeight: 1.55 }}>
                      {ancestral.clinicalSynthesisEn}
                    </p>
                  </div>
                )}

                {/* Genotype × Active Phenotype Convergence (Golden Rule #4 & GCP Style) */}
                {triangulation.interactions?.length > 0 && (
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: '6px',
                      padding: '14px 16px',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} style={{ color: '#1a73e8' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          Genotype × Phenotype Convergence Matrix (DNA vs Lab Blood/DBS)
                        </span>
                      </div>
                      <span style={{ fontSize: '0.70rem', color: '#137333', backgroundColor: '#e6f4ea', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        Convergence Index: {triangulation.compositeScore}/100 · {triangulation.highPriorityCount} Active Targets
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: triangulation.interactions.length % 2 === 0 ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: '8px' }}>
                      {triangulation.interactions.map(item => {
                        const isHigh = item.convergenceLevel === 'CONFIRMED_HIGH' || item.convergenceLevel === 'HIGH_PRIORITY' || item.convergenceLevel === 'ACTION_REQUIRED';
                        return (
                          <div
                            key={item.id}
                            style={{
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #dadce0',
                              borderLeft: `3px solid ${isHigh ? '#c5221f' : '#137333'}`,
                              borderRadius: '4px',
                              padding: '10px 12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                                {item.axis}
                              </span>
                              <span style={{ fontSize: '0.64rem', fontWeight: 700, color: isHigh ? '#c5221f' : '#137333', backgroundColor: isHigh ? '#fce8e6' : '#e6f4ea', padding: '1px 5px', borderRadius: '3px' }}>
                                {item.convergenceLevel}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124', marginTop: '3px' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.70rem', color: '#70757a', marginTop: '2px' }}>
                              DNA: <strong>{item.geneticMarker}</strong> · State: {item.phenotypeStatus}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#3c4043', marginTop: '4px', lineHeight: 1.4 }}>
                              <strong>Clinical Action:</strong> {item.clinicalActionEn}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1-Click Compounded Prescription Action & Status */}
                {createdRx[row.sampleId || row.code] ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      backgroundColor: '#e6f4ea',
                      border: '1px solid #ceead6',
                      borderRadius: '4px',
                      padding: '8px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} style={{ color: '#137333' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#137333' }}>
                        Compounded Prescription Created ({createdRx[row.sampleId || row.code].code || 'RX-CMP-VERIFIED'})
                      </span>
                    </div>
                    <Link
                      href={`/rx/${createdRx[row.sampleId || row.code].code}`}
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#137333',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Open Formulations & Sign</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenCustomizer(row, profile)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '4px',
                        backgroundColor: '#1a73e8',
                        border: '1px solid #1557b0',
                        color: '#ffffff',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(60,64,67,0.15)'
                      }}
                    >
                      <SlidersHorizontal size={14} />
                      <span>Review &amp; Customize Magistral Formula</span>
                    </button>

                    <button
                      type="button"
                      disabled={prescribingId === (row.sampleId || row.code)}
                      onClick={() => handleCreateCompoundedPrescription(row, profile)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #dadce0',
                        color: '#3c4043',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: prescribingId === (row.sampleId || row.code) ? 'not-allowed' : 'pointer',
                        opacity: prescribingId === (row.sampleId || row.code) ? 0.7 : 1
                      }}
                    >
                      <Pill size={14} color="#1a73e8" />
                      <span>
                        {prescribingId === (row.sampleId || row.code)
                          ? 'Generating...'
                          : 'Quick 1-Click Issue'}
                      </span>
                    </button>
                    <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>
                      Auto-calibrates Morning, Midday &amp; Evening capsules for MCM6, FTO and active NAD+.
                    </span>
                  </div>
                )}

                {/* Direct Action Dossier Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                  <a
                    href={rxPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #dadce0',
                      color: '#202124',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      textDecoration: 'none'
                    }}
                  >
                    <Download size={13} />
                    <span>Download Clinical Rx Dossier (59p PDF)</span>
                  </a>

                  <a
                    href={mealPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#f6fafe',
                      border: '1px solid #d2e3fc',
                      color: '#1a73e8',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      textDecoration: 'none'
                    }}
                  >
                    <Utensils size={13} />
                    <span>Download 7-Day Precision Meal Plan (59p PDF)</span>
                  </a>
                </div>
              </div>
            );
          }}
        />
        </>
        )}
      </div>

      {/* Interactive Compounded Prescription Customizer Drawer (Rule #4 & #25) */}
      <CompoundedRxCustomizerDrawer
        isOpen={drawerData.isOpen}
        onClose={() => setDrawerData(prev => ({ ...prev, isOpen: false }))}
        patientData={{
          name: drawerData.row?.patientName || 'Ms. Wafa Burud',
          id: drawerData.row?.patient?.id || `pt-${drawerData.row?.sampleId || drawerData.row?.code}`,
          sampleId: drawerData.row?.sampleId || drawerData.row?.code || 'G000943568',
          dob: drawerData.row?.patient?.dob,
          gender: drawerData.row?.patient?.gender
        }}
        doctorData={{
          id: slug || 'dr-sajid-burud',
          name: drawerData.row?.doctorName || 'Dr. Sajid Burud',
          license: 'DHA-00132881',
          clinic: drawerData.row?.clinicName || 'Transcend Healthcare'
        }}
        initialFormulation={drawerData.formulation}
        onSuccess={(data) => {
          const key = drawerData.row?.sampleId || drawerData.row?.code;
          setCreatedRx(prev => ({ ...prev, [key]: { code: data.rxCode, id: data.id } }));
        }}
      />
    </section>
  );
}

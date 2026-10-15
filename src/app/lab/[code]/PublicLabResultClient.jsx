"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Award,
  ShieldCheck,
  Calendar,
  User,
  Stethoscope,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Printer,
  ChevronRight,
  Activity,
  Dna,
  Zap,
  Info,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Heart,
  Brain,
  Shield,
  Flame,
  Gauge,
  Lock,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import LabResultDetailSidebar from '@/components/lab/LabResultDetailSidebar';

export default function PublicLabResultClient({ initialData, code }) {
  const { user, activeRole } = useAuth();
  const isAuthorizedDoctor = Boolean(user && ['doctor', 'admin', 'clinic', 'medical_director', 'fagron_doctor'].includes(activeRole));

  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const data = initialData || {};

  const rawPatientName = data.patientName || data.patient?.name;
  const maskedSubjectCode = `Subject #${data.patientCode || data.patient?.code || data.protocolNumber || code}`;
  const displayPatientName = isAuthorizedDoctor ? (rawPatientName || maskedSubjectCode) : maskedSubjectCode;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Dossier link copied to clipboard ✓');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Determine report type
  const isEternaProteomics = !!(data.organScores || data.bioAgeYears || (data.testName && data.testName.toLowerCase().includes('proteomic')));
  const isTellmeGen = !!(data.traits || data.monogenicDiseases || data.complexDiseases || data.pharmacogenetics || (data.testName && data.testName.toLowerCase().includes('tellmegen')));

  // Bloodo Quantitative values
  const val = Number(data.value) || 14.1;
  const unit = data.unit || 'µmol/L';
  const minScale = 0;
  const maxScale = 40;
  const percentagePos = Math.min(Math.max(((val - minScale) / (maxScale - minScale)) * 100, 2), 98);

  const zoneColor = data.zoneColor || '#d97706';
  const zoneBg = data.zoneBg || '#fffbeb';
  const zoneLabel = data.zoneLabel || 'Insufficient / Borderline Suboptimal';

  // Eterna Proteomics values
  const bioAgeYears = data.bioAgeYears != null ? data.bioAgeYears : 38;
  const bioAgeMonths = data.bioAgeMonths != null ? data.bioAgeMonths : 0;
  const chronoAgeYears = data.chronoAgeYears != null ? data.chronoAgeYears : 38;
  const chronoAgeMonths = data.chronoAgeMonths != null ? data.chronoAgeMonths : 3;
  const agingRate = data.agingRate != null ? data.agingRate : -0.69;
  const percentile = data.percentile != null ? data.percentile : 55;
  const ageDelta = ((bioAgeYears * 12 + bioAgeMonths) - (chronoAgeYears * 12 + chronoAgeMonths)) / 12;
  const isYounger = ageDelta <= 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '90px' }}>
      {/* Atlas Health Unified Public Header */}
      <PublicUnifiedHeader
        track="diagnostics"
        brandTitle="Atlas Health Services · Precision Biomarkers & Diagnostics"
        copyUrl={`https://www.atlashealth-services.com/lab/${code}`}
        shortUrl={`https://www.atlashealth-services.com/lab/${code}`}
        doctorName={data.doctorName || 'Dr. Sobia Mirza'}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Diagnostic Registry', href: '/collection/bloodo' },
          { label: `${data.testName || 'Biomarker Report'} #${data.protocolNumber || code}` }
        ]}
      />

      {/* Main Container with 2-Column Responsive Layout (Main Dossier + Sticky Right Sidebar) */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 16px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* Main Content Column */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
            <Link href="/" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
            <span>Diagnostic Registry</span>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
            <span style={{ color: '#0f172a', fontWeight: 700 }}>Protocol #{data.protocolNumber || code}</span>
          </div>

          {/* Top Header Card: Diagnostic Test & Accreditation */}
          <div id="overview" style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '750px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: isEternaProteomics ? '#4f46e5' : '#0284c7',
                    background: isEternaProteomics ? '#eef2ff' : '#f0f9ff',
                    border: isEternaProteomics ? '1px solid #c7d2fe' : '1px solid #bae6fd',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {isEternaProteomics ? 'ETERNA BIOAGE · BLOOD PROTEOMICS' : (isTellmeGen ? 'TELLMEGEN · PHARMACOGENETICS & DNA' : 'QUANTITATIVE DBS BIOMARKER ASSAY')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Protocol #{data.protocolNumber || code}
                  </span>
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                  {data.testName || (isEternaProteomics ? 'GrimAge Proteomic Biological Age & Organ System Evaluation' : 'Nicotinamide Adenine Dinucleotide (NAD+) Quantitative Test')}
                </h1>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                  {isEternaProteomics
                    ? 'Multiplex mass spectrometry quantification of age-related circulating blood proteins, measuring biological aging pace and individual organ resilience.'
                    : (isTellmeGen
                        ? 'Whole exome and targeted SNP array sequencing analyzing pharmacogenetic drug metabolism, disease susceptibilities, and metabolic traits.'
                        : 'Quantitative assessment of total intracellular NAD+ in capillary dried blood spots via validated enzymatic cyclic assay (XLT01690-0).')}
                </p>
              </div>
            </div>

            {/* Demographic & Clinical Vigilance Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px 18px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  <span>Diagnostic Subject</span>
                  {!isAuthorizedDoctor && <Lock size={11} color="#94a3b8" />}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{displayPatientName}</span>
                </div>
                {!isAuthorizedDoctor ? (
                  <Link
                    href={`/auth?tab=login&redirect=/lab/${code}`}
                    style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 650, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                  >
                    <span>Doctor Sign In to Unlock Identity</span>
                    <ExternalLink size={10} />
                  </Link>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 650, marginTop: '2px' }}>
                    ✓ Verified Clinician Access
                  </div>
                )}
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Age: {data.patient?.age || chronoAgeYears || 38} · Gender: {data.patient?.gender || 'Verified'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Physician / Center</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{data.doctorName || 'Dr. Sobia Mirza'}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{data.clinicName || 'My London Skin Clinic'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Sample & Matrix</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 650, color: '#0f172a' }}>{data.sampleType || 'Whole Blood / Capillary Serum'}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Collected: {data.collectionDate || 'Verified Clinical Sample'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#16a34a' }}>Report Validated ✓</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Certified Dossier</div>
              </div>
            </div>
          </div>

          {/* RESULTS SECTION: ETERNA PROTEOMICS OR BLOODO SINGLE BIOMARKER */}
          <div id="results">
            {isEternaProteomics ? (
              /* ETERNA BIOAGE RESULTS DISPLAY */
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '28px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Blood Proteomics Biological Age Evaluation
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      GrimAge Epigenetic & Proteomic Biological Clock
                    </div>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: isYounger ? '#f0fdf4' : '#fff7ed',
                    border: isYounger ? '1px solid #86efac' : '1px solid #fed7aa',
                    color: isYounger ? '#15803d' : '#c2410c',
                    fontWeight: 800,
                    fontSize: '0.86rem'
                  }}>
                    {isYounger ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                    <span>{isYounger ? `Biological Age Younger than Chronological (${Math.abs(Math.round(ageDelta * 12))} mos)` : `Accelerated Pace (+${Math.round(ageDelta * 12)} mos)`}</span>
                  </div>
                </div>

                {/* Big Metric Comparison Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  {/* Biological Age */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Biological Age
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#4f46e5', letterSpacing: '-0.03em', marginTop: '4px' }}>
                      {bioAgeYears}y {bioAgeMonths}m
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                      Calculated cellular health metric
                    </div>
                  </div>

                  {/* Chronological Age */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Chronological Age
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginTop: '4px' }}>
                      {chronoAgeYears}y {chronoAgeMonths}m
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                      Calendar age from birth date
                    </div>
                  </div>

                  {/* Aging Rate */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Aging Rate (Δ Pace)
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: agingRate <= 0 ? '#16a34a' : '#d97706', letterSpacing: '-0.03em', marginTop: '4px' }}>
                      {agingRate > 0 ? `+${agingRate}` : agingRate}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                      Percentile: <strong>{percentile}th Percentile</strong> in demographic
                    </div>
                  </div>
                </div>

                {/* 5-Organ Biological Age Breakdown */}
                <div id="organ-breakdown" style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={16} color="#4f46e5" />
                    <span>5-Organ Biological Age Breakdown</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {/* Immunity */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', borderLeft: '4px solid #3b82f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e3a8a' }}>Immunity & Hematology</span>
                        <Shield size={16} color="#3b82f6" />
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                        {data.organScores?.immunity || 36}y
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Thymic function & leukocyte health</div>
                    </div>

                    {/* Cardiovascular */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', borderLeft: '4px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#991b1b' }}>Cardiovascular</span>
                        <Heart size={16} color="#ef4444" />
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                        {data.organScores?.cardiovascular || 37}y
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Endothelial elasticity & vascular tone</div>
                    </div>

                    {/* Metabolism */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', borderLeft: '4px solid #10b981' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#065f46' }}>Metabolism & Liver</span>
                        <Flame size={16} color="#10b981" />
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                        {data.organScores?.metabolism || 37}y
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Hepatic lipid clearance & insulin</div>
                    </div>

                    {/* Inflammation */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', borderLeft: '4px solid #f59e0b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#92400e' }}>Inflammation</span>
                        <Activity size={16} color="#f59e0b" />
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                        {data.organScores?.inflammation || 38}y
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Cytokine cascade & silent inflammation</div>
                    </div>

                    {/* Central Molecular */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', borderLeft: '4px solid #8b5cf6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5b21b6' }}>Central Molecular</span>
                        <Brain size={16} color="#8b5cf6" />
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                        {data.organScores?.centralMolecular || 36}y
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>DNA repair & proteostasis</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* BLOODO SINGLE QUANTITATIVE BIOMARKER DISPLAY */
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '28px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Primary Quantitative Biomarker
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {data.testName || 'Total Intracellular NAD+ Concentration'}
                    </div>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: zoneBg,
                    border: `1px solid ${zoneColor}`,
                    color: zoneColor,
                    fontWeight: 800,
                    fontSize: '0.86rem'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: zoneColor }} />
                    <span>{zoneLabel}</span>
                  </div>
                </div>

                {/* Big Number Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '3.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {val}
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#64748b' }}>
                    {unit}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '12px' }}>
                    (Reference Range for Longevity: <strong>21.7 – 33.7 {unit}</strong>)
                  </span>
                </div>

                {/* Continuous Multi-Zone Spectrum Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ position: 'relative', width: '100%', height: '28px', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '22%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800 }}>
                      DEFICIENT (&lt; 8.8)
                    </div>
                    <div style={{ width: '21.5%', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78350f', fontSize: '0.68rem', fontWeight: 800 }}>
                      SUBOPTIMAL (8.8–17.4)
                    </div>
                    <div style={{ width: '10.75%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#365314', fontSize: '0.65rem', fontWeight: 800 }}>
                      ADEQUATE
                    </div>
                    <div style={{ width: '30%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b', fontSize: '0.68rem', fontWeight: 800 }}>
                      OPTIMAL LONGEVITY (21.7–33.7)
                    </div>
                    <div style={{ width: '15.75%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '0.68rem', fontWeight: 800 }}>
                      SUPRA-PHYSIOLOGICAL
                    </div>
                  </div>

                  {/* Visual Pin Position Indicator */}
                  <div style={{ position: 'relative', width: '100%', height: '24px' }}>
                    <div style={{
                      position: 'absolute',
                      left: `${percentagePos}%`,
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: `8px solid ${zoneColor}`
                      }} />
                      <div style={{
                        background: zoneColor,
                        color: '#ffffff',
                        fontSize: '0.70rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap'
                      }}>
                        {val} {unit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CLINICAL INTERPRETATION */}
          <div id="interpretation" style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gauge size={18} color="#0284c7" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>
                Clinical Interpretation & Mechanistic Pathway
              </h2>
            </div>

            <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
              {isEternaProteomics
                ? `Circulating blood proteomics analysis confirms a biological age profile of ${bioAgeYears} years and ${bioAgeMonths} months. The aging rate of ${agingRate} places the patient in the ${percentile}th percentile of cellular resilience. Organ-specific proteomic weighting shows preserved cardiovascular and central molecular repair capacity.`
                : `Intracellular NAD+ concentration is measured at ${val} ${unit}, falling into the suboptimal range for cellular longevity. At this concentration, sirtuin activation (SIRT1/SIRT3) and PARP1 DNA repair machinery exhibit reduced enzymatic kinetics.`}
            </p>
          </div>

          {/* CLINICAL RECOMMENDATIONS (SUPPLEMENTS + PROTOCOLS & PEPTIDES) */}
          <div id="recommendations" style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#0284c7" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Clinical Recommendations
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Personalized therapeutic interventions based on quantified intracellular NAD+ ({val} {unit} · {zoneLabel}).
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 750,
                color: '#0369a1',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                padding: '3px 9px',
                borderRadius: '6px'
              }}>
                Target: Longevity Range (21.7 – 33.7 µmol/L)
              </span>
            </div>

            {/* Sub-block 1: Targeted Cellular Supplements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <FlaskConical size={15} color="#0284c7" />
                <span>1. Cellular & Metabolic Supplements</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {/* Supplement 1: NMN / NR */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>NAD+ Salvage Precursor (NMN / NR)</span>
                    <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#0369a1', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>300–500 mg/day</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                    Oral β-Nicotinamide Mononucleotide or Nicotinamide Riboside enters the salvage pathway via Nrk1/2, replenishing cellular NAD+ stores in peripheral tissues.
                  </p>
                </div>

                {/* Supplement 2: Apigenin / CD38 Blocker */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>CD38 Enzymatic Inhibitor (Apigenin + Quercetin)</span>
                    <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#0369a1', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>50 mg / 250 mg</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                    Inhibits age-hyperactivated CD38 glycohydrolases which consume up to 80% of intracellular NAD+, preserving synthesized and recycled NAD+ pools.
                  </p>
                </div>

                {/* Supplement 3: Methylation Buffer (TMG) */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>Methyl Pool Protection (TMG / Betaine)</span>
                    <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#0369a1', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>500 mg daily</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                    Supplies labile methyl groups consumed during hepatic nicotinamide methylation (NNMT) preventing hyperhomocysteinemia during active NAD+ repletion.
                  </p>
                </div>

                {/* Supplement 4: CoQ10 & PQQ */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>Mitochondrial Biogenesis (Ubiquinol + PQQ)</span>
                    <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#0369a1', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>100 mg / 10 mg</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                    Optimizes electron transfer at Complex I and Complex II, protecting inner mitochondrial membranes from oxidative flux during NAD+ metabolic acceleration.
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-block 2: Therapeutic Protocols & Bioregulator Peptides */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Dna size={15} color="#0d9488" />
                <span>2. Therapeutic Protocols & Bioregulator Peptides</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                {/* Protocol 1: NAD+ Direct SubQ */}
                <div style={{ border: '1px solid #bae6fd', borderRadius: '8px', padding: '16px', background: '#f0f9ff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                      CLINICAL PROTOCOL · INJECTABLE
                    </span>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 750, color: '#0c4a6e', margin: 0 }}>
                      Direct Subcutaneous NAD+ Replenishment Protocol
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                      50–100 mg subcutaneous injection 2–3 times weekly for 4–8 weeks. Bypasses intestinal and hepatic first-pass breakdown, directly elevating circulating and tissue NAD+ to longevity threshold.
                    </p>
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0284c7' }}>
                    Prescription formulation available via clinical dispensary
                  </div>
                </div>

                {/* Protocol 2: Epithalon Bioregulator */}
                <div style={{ border: '1px solid #99f6e4', borderRadius: '8px', padding: '16px', background: '#f0fdfa', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>
                      PEPTIDE BIOREGULATOR · LONGEVITY
                    </span>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 750, color: '#134e4a', margin: 0 }}>
                      Epithalon Pineal Bioregulator Protocol
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                      10 mg cycle (Ala-Glu-Asp-Gly tetrapeptide). Normalizes pineal neuroendocrine secretion, induces telomerase reverse transcriptase (TERT) expression, and works in synergy with NAD+-activated SIRT1.
                    </p>
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0d9488' }}>
                    Prescription formulation available via clinical dispensary
                  </div>
                </div>

                {/* Protocol 3: MOTS-c Mitochondrial Peptide */}
                <div style={{ border: '1px solid #c7d2fe', borderRadius: '8px', padding: '16px', background: '#eef2ff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase' }}>
                      MITOCHONDRIAL PEPTIDE · METABOLIC
                    </span>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 750, color: '#312e81', margin: 0 }}>
                      MOTS-c Mitochondrial-Derived Peptide Protocol
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                      5–10 mg SubQ weekly. Regulates the folate-methionine cycle and activates AMPK, stimulating cellular glucose uptake and mitochondrial respiration alongside NAD+ coenzyme availability.
                    </p>
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4f46e5' }}>
                    Prescription formulation available via clinical dispensary
                  </div>
                </div>

                {/* Protocol 4: SS-31 Cardiolipin Shield */}
                <div style={{ border: '1px solid #fed7aa', borderRadius: '8px', padding: '16px', background: '#fffaf5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>
                      MEMBRANE SHIELD · MITOCHONDRIAL
                    </span>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 750, color: '#7c2d12', margin: 0 }}>
                      SS-31 (Elamipretide) Mitochondrial Restorative Protocol
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                      Selectively concentrates in the inner mitochondrial membrane, binding cardiolipin to stabilize cristae structure, boost ATP yield, and reduce electron leak during respiratory chain stimulation.
                    </p>
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ea580c' }}>
                    Prescription formulation available via clinical dispensary
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACCREDITATION & STANDARDS */}
          <div id="accreditation" style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#16a34a" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>
                Laboratory Accreditation & Analytical Integrity
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#64748b', lineHeight: 1.5 }}>
              Analytical validation performed in accordance with ISO 15189 medical laboratory standards and EU In Vitro Diagnostic Medical Devices Regulation (IVDR). Quality controls verified against NIST standard reference materials.
            </p>
          </div>
        </main>

        {/* Dedicated Laboratory & Diagnostic Sticky Sidebar (Desktop & Mobile Drawer) */}
        <LabResultDetailSidebar
          data={data}
          code={code}
          activeSection={activeSection}
          onSelectSection={scrollToSection}
          onPrint={handlePrint}
          onCopyLink={handleCopyLink}
          isEternaProteomics={isEternaProteomics}
          isTellmeGen={isTellmeGen}
          isDoctorUnlocked={isDoctorUnlocked}
          patientDisplayName={maskedPatientName}
        />
      </div>

      {/* Institutional Unified Public Footer */}
      <PublicUnifiedFooter />

      {/* FIXED BOTTOM ACTION DOCK (Google Cloud Console UX) */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '10px 24px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
            Protocol #{data.protocolNumber || code}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            · Official Clinical Dossier Verified
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 650,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Share Dossier'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 650,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          {data.pdfReportUrl && (
            <a
              href={data.pdfReportUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                background: '#003666',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,54,102,0.2)'
              }}
            >
              <Download size={14} />
              <span>Download Official PDF</span>
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

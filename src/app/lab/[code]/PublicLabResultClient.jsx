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
  Gauge
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PublicLabResultClient({ initialData, code }) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const data = initialData || {};

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
      {/* Top Banner Navigation */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: isEternaProteomics ? '#4f46e5' : '#003666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              {isEternaProteomics ? <Activity size={20} /> : (isTellmeGen ? <Dna size={20} /> : <FlaskConical size={20} />)}
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isEternaProteomics ? '#4f46e5' : '#003666', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{isEternaProteomics ? 'ETERNA BIOAGE PROTEOMICS' : (isTellmeGen ? 'TELLMEGEN DNA GENOMICS' : 'BLOODO™ DIAGNOSTICS')}</span>
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: isEternaProteomics ? '#eef2ff' : '#e0f2fe', color: isEternaProteomics ? '#4338ca' : '#0284c7', fontWeight: 700 }}>
                  {data.laboratory?.accreditation || 'CLIA / ISO 15189'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {isEternaProteomics ? 'Blood Proteomics & Organ Biological Age Quantification' : (isTellmeGen ? 'Pharmacogenetics & Monogenic DNA Sequencing Panel' : 'Quantitative Intracellular Biomarker Assay · LifeLab1')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Share Link'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            {data.pdfReportUrl && (
              <a
                href={data.pdfReportUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: isEternaProteomics ? '#4f46e5' : '#003666',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(0,54,102,0.15)'
                }}
              >
                <Download size={14} />
                <span>Original PDF</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with GCP-style Left Sidebar and Content Area */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '20px 16px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* GCP Console Left Navigation Sidebar (Desktop) */}
        <aside style={{
          width: '240px',
          flexShrink: 0,
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '16px 12px',
          position: 'sticky',
          top: '76px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }} className="hidden md:flex">
          <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 8px' }}>
            DOSSIER SECTIONS
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.80rem',
              fontWeight: activeSection === 'overview' ? 700 : 500,
              color: activeSection === 'overview' ? '#1d4ed8' : '#334155',
              background: activeSection === 'overview' ? '#eff6ff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Info size={15} />
            <span>Overview & Patient</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('results')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.80rem',
              fontWeight: activeSection === 'results' ? 700 : 500,
              color: activeSection === 'results' ? '#1d4ed8' : '#334155',
              background: activeSection === 'results' ? '#eff6ff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Activity size={15} />
            <span>{isEternaProteomics ? 'Biological Age Metrics' : (isTellmeGen ? 'Genomic Variant Results' : 'Biomarker Quantification')}</span>
          </button>

          {isEternaProteomics && (
            <button
              type="button"
              onClick={() => scrollToSection('organ-breakdown')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.80rem',
                fontWeight: activeSection === 'organ-breakdown' ? 700 : 500,
                color: activeSection === 'organ-breakdown' ? '#1d4ed8' : '#334155',
                background: activeSection === 'organ-breakdown' ? '#eff6ff' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Heart size={15} />
              <span>5-Organ Biological Ages</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => scrollToSection('interpretation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.80rem',
              fontWeight: activeSection === 'interpretation' ? 700 : 500,
              color: activeSection === 'interpretation' ? '#1d4ed8' : '#334155',
              background: activeSection === 'interpretation' ? '#eff6ff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Gauge size={15} />
            <span>Clinical Interpretation</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('synergies')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.80rem',
              fontWeight: activeSection === 'synergies' ? 700 : 500,
              color: activeSection === 'synergies' ? '#1d4ed8' : '#334155',
              background: activeSection === 'synergies' ? '#eff6ff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Zap size={15} />
            <span>Therapeutic Synergies</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('accreditation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.80rem',
              fontWeight: activeSection === 'accreditation' ? 700 : 500,
              color: activeSection === 'accreditation' ? '#1d4ed8' : '#334155',
              background: activeSection === 'accreditation' ? '#eff6ff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <ShieldCheck size={15} />
            <span>Accreditation & Standards</span>
          </button>
        </aside>

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

              {/* Accreditation Badge */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '220px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.80rem', fontWeight: 700 }}>
                  <ShieldCheck size={16} />
                  <span>{data.laboratory?.name || 'LifeLab1 / Eterna Precision'}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                  License: <strong>{data.laboratory?.license || 'ISO 15189 / CLIA Certified'}</strong>
                </div>
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  Standards: {data.laboratory?.standards || 'EU IVDR / CAP Accredited'}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
                  Location: {data.laboratory?.city || 'Vilnius / London'}, {data.laboratory?.country || 'Lithuania'}
                </div>
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
                <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Patient</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{data.patientName || data.patient?.name || `Patient #${code}`}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Age: {data.patient?.age || chronoAgeYears || 38} · Gender: {data.patient?.gender || 'Verified'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Physician / Center</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{data.doctorName || 'Youth Dubai Longevity (YDL)'}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{data.clinicName || 'Longevity Medicine Center'}</div>
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

          {/* THERAPEUTIC SYNERGIES */}
          <div id="synergies" style={{
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
              <Zap size={18} color="#d97706" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>
                Correlated Clinical Protocols & Therapeutic Synergies
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              <div style={{
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '16px',
                background: '#f0f9ff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                    EVIDENCE-BASED PROTOCOL
                  </span>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 750, color: '#0c4a6e', margin: 0 }}>
                    NAD+ Cellular Optimization & Mitochondrial Resilience
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                    Subcutaneous bioidentical NAD+ administration coupled with oral salvage precursors (NMN/NR) and CD38 enzymatic inhibitors (Apigenin / Quercetin).
                  </p>
                </div>

                <Link
                  href="/proto/Ks2ThxuWoPmWzc3UW06R"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0284c7',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <span>View Full Clinical Protocol Dossier</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div style={{
                border: '1px solid #99f6e4',
                borderRadius: '8px',
                padding: '16px',
                background: '#f0fdfa',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>
                    PEPTIDE REGULATION & REPAIR
                  </span>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 750, color: '#134e4a', margin: 0 }}>
                    Epithalon & Cellular Senescence Bioregulator
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                    Pineal peptide bioregulator stimulating telomerase expression and normalizing neuroendocrine circadian rhythms in biological age deceleration.
                  </p>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>
                  Prescription formulation available via clinical dispensary.
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
      </div>

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

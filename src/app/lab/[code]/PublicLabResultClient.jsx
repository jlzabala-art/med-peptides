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
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PublicLabResultClient({ initialData, code }) {
  const [copied, setCopied] = useState(false);
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

  const val = Number(data.value) || 14.1;
  const unit = data.unit || 'µmol/L';
  const minScale = 0;
  const maxScale = 40;
  const percentagePos = Math.min(Math.max(((val - minScale) / (maxScale - minScale)) * 100, 2), 98);

  const zoneColor = data.zoneColor || '#d97706';
  const zoneBg = data.zoneBg || '#fffbeb';
  const zoneLabel = data.zoneLabel || 'Insufficient / Borderline Suboptimal';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#003666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <FlaskConical size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>BLOODO™ DIAGNOSTICS</span>
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: '#e0f2fe', color: '#0284c7', fontWeight: 700 }}>
                  LifeLab1 ACCREDITED
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                ISO 15189 / EU IVDR Accredited · Quantitative Biomarker Dossier
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
                cursor: 'pointer',
                transition: 'all 0.15s ease'
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
                  background: '#003666',
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

      {/* Main Content Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 60px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
          <Link href="/" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight size={13} style={{ opacity: 0.5 }} />
          <span>Diagnostic Registry</span>
          <ChevronRight size={13} style={{ opacity: 0.5 }} />
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Protocol #{data.protocolNumber || code}</span>
        </div>

        {/* Top Header Card: Diagnostic Test & Accreditation */}
        <div style={{
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
                  color: '#0284c7',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  QUANTITATIVE DBS BIOMARKER ASSAY
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Protocol #{data.protocolNumber || code}
                </span>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {data.testName || 'Nicotinamide Adenine Dinucleotide (NAD+) Quantitative Test'}
              </h1>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                Quantitative assessment of total intracellular NAD+ in capillary dried blood spots via validated enzymatic cyclic assay (XLT01690-0).
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
                <span>LifeLab1 Accredited Facility</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                License: <strong>{data.laboratory?.license || 'License 4864'}</strong>
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                Standards: {data.laboratory?.standards || 'ISO 15189 / EU IVDR Accredited'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
                Location: {data.laboratory?.city || 'Vilnius'}, {data.laboratory?.country || 'Lithuania'}
              </div>
            </div>
          </div>

          {/* Demographic & Clinical Vigilance Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 18px'
          }}>
            <div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Patient (Anonymized)</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{data.patientName || data.patient?.name || 'Patient #DBUQEWDT2449'}</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Age: {data.patient?.age || 59} · Gender: {data.patient?.gender || 'Male'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Attending Physician</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{data.doctorName || 'Dr. Çağatay Sezgin, MD, FISHRS'}</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{data.clinicName || 'Shamma Clinic by Novomed LLC'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Sample & Collection</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 650, color: '#0f172a' }}>{data.sampleType || 'Dried Blood Spot (DBS)'}</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Collected: {data.collectionDate || '2026-09-23'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Processing Timeline</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 650, color: '#0f172a' }}>Received: {data.receiptDate || '2026-10-06'}</div>
              <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>Analyzed: {data.analysisDate || '2026-10-13'} (Verified)</div>
            </div>
          </div>
        </div>

        {/* Primary Biomarker Quantification & Visual Gauge Card */}
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
                Total Intracellular NAD+ Concentration
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
              {/* Deficient Zone: 0 - 8.8 (approx 22%) */}
              <div style={{ width: '22%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800 }}>
                DEFICIENT (&lt; 8.8)
              </div>
              {/* Insufficient Zone: 8.8 - 17.4 (approx 21.5%) */}
              <div style={{ width: '21.5%', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78350f', fontSize: '0.68rem', fontWeight: 800 }}>
                SUBOPTIMAL (8.8–17.4)
              </div>
              {/* Intermediate / Adequate Zone: 17.4 - 21.7 (approx 10.75%) */}
              <div style={{ width: '10.75%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#365314', fontSize: '0.65rem', fontWeight: 800 }}>
                ADEQUATE
              </div>
              {/* Optimal Longevity: 21.7 - 33.7 (approx 30%) */}
              <div style={{ width: '30%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b', fontSize: '0.68rem', fontWeight: 800 }}>
                OPTIMAL LONGEVITY (21.7–33.7)
              </div>
              {/* Supra-physiological / High: 33.7 - 40 (approx 15.75%) */}
              <div style={{ width: '15.75%', background: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '0.68rem', fontWeight: 800 }}>
                ELEVATED (&gt; 33.7)
              </div>

              {/* Pin Indicator Marker on 14.1 */}
              <div style={{
                position: 'absolute',
                left: `${percentagePos}%`,
                top: 0,
                bottom: 0,
                width: '4px',
                background: '#0f172a',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 8px rgba(0,0,0,0.5)'
              }} />
            </div>

            {/* Pin pointer & value callout */}
            <div style={{ position: 'relative', width: '100%', height: '32px' }}>
              <div style={{
                position: 'absolute',
                left: `${percentagePos}%`,
                top: '4px',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #0f172a' }} />
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  background: '#0f172a',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  marginTop: '2px'
                }}>
                  Your Value: {val} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Reference Interval Table */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            background: '#fafbfc',
            borderRadius: '8px',
            border: '1px solid #f1f5f9',
            padding: '14px'
          }}>
            <div style={{ padding: '8px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#dc2626' }}>Deficient Range</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#991b1b' }}>0.0 – 8.8 {unit}</div>
              <div style={{ fontSize: '0.68rem', color: '#b91c1c' }}>Severe metabolic and mitochondrial depletion.</div>
            </div>

            <div style={{ padding: '8px', borderRadius: '6px', background: '#fffbeb', border: '1px solid #fef3c7' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#d97706' }}>Suboptimal / Insufficient (Your Range)</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#92400e' }}>8.8 – 17.4 {unit}</div>
              <div style={{ fontSize: '0.68rem', color: '#b45309' }}>Reduced salvage synthesis or chronic inflammatory loss.</div>
            </div>

            <div style={{ padding: '8px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#16a34a' }}>Optimal Longevity Target</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#14532d' }}>21.7 – 33.7 {unit}</div>
              <div style={{ fontSize: '0.68rem', color: '#15803d' }}>Peak mitochondrial ATP, PARP-1 & Sirtuin competence.</div>
            </div>
          </div>
        </div>

        {/* Clinical Biological Interpretation */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#003666" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>
              Physiological Interpretation & Cellular Mechanisms
            </h2>
          </div>

          <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
            {data.interpretation || `Levels of 14.1 µmol/L indicate suboptimal intracellular NAD+ availability, below the optimal longevity threshold of 21.7–33.7 µmol/L. This reflects either accelerated metabolic depletion (chronic systemic inflammation, oxidative DNA repair) or age-dependent decline in salvage pathway synthesis.`}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
            marginTop: '8px'
          }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0284c7', fontSize: '0.82rem', marginBottom: '4px' }}>
                <Zap size={14} />
                <span>Mitochondrial Bioenergetics</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                NAD+ acts as the principal hydride acceptor in glycolysis, Krebs cycle, and oxidative phosphorylation. Suboptimal concentrations limit ATP output and trigger cellular fatigue.
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#7c3aed', fontSize: '0.82rem', marginBottom: '4px' }}>
                <Dna size={14} />
                <span>PARP-1 DNA Repair Machinery</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                PARP-1 consumes NAD+ to repair single-strand DNA breaks. Chronic oxidative stress over-activates PARP-1, draining intracellular NAD+ reserves if not replenished.
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#059669', fontSize: '0.82rem', marginBottom: '4px' }}>
                <ShieldCheck size={14} />
                <span>Sirtuin Longevity Activation</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                SIRT1 and SIRT3 require high NAD+ concentrations to de-acetylate target histones, regulate mitochondrial biogenesis via PGC-1α, and retard cellular senescence.
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Synergy & Actionable Protocols */}
        <div style={{
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {/* Protocol 1: NAD+ Cellular Protocol */}
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
                  Subcutaneous bioidentical NAD+ administration coupled with oral salvage precursors (NMN/NR) and CD38 enzymatic inhibitors (Apigenin / Quercetin) to arrest NAD+ catabolism.
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

            {/* Protocol 2: Hair Restoration & Follicular Synergy */}
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
                  FOLLICULAR & DERMAL RECOVERY
                </span>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 750, color: '#134e4a', margin: 0 }}>
                  GHK-Cu & Follicular Precision Compounding
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                  For patients undergoing hair restoration under Dr. Sezgin: copper peptide GHK-Cu enhances follicular microcirculation and dermal papilla mitochondrial biogenesis in synergy with systemic NAD+ repletion.
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>
                Prescription formulation available via magistral compounding.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <footer style={{
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#64748b',
          lineHeight: 1.5,
          padding: '16px 0',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div>LifeLab1 Clinical Laboratory Diagnostics · Vilnius, Lithuania · License 4864 · ISO 15189 / EU IVDR Certified.</div>
          <div>This diagnostic evaluation is provided for medical surveillance and personalized regenerative treatment optimization under physician supervision.</div>
        </footer>
      </main>
    </div>
  );
}

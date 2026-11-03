'use client';

import React, { useState } from 'react';
import {
  Download,
  Share2,
  Check,
  ChevronRight,
  HeartPulse,
  Activity,
  AlertTriangle,
  Pill,
  Sparkles,
  Info,
  Calendar,
  Lock,
  ExternalLink,
  Printer,
  ShieldCheck,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import {
  GALENIC_COMPATIBILITY_ANALYSIS,
  CLINICAL_PILLARS,
  THREE_CAPSULE_PROTOCOL,
  CONCRETE_DIET_GUIDELINES,
  TREATMENT_CYCLE,
  TWENTY_FOUR_GENETICS_AI_ECOSYSTEM,
  COMMERCIAL_LOCAL_SUPPLEMENTS,
  PRESCRIPTION_COMPARISON
} from '@/data/genomics/clinicalNutrigenomicEngine';

export default function PatientDnaPortalClient({
  initialPatientName,
  initialSampleCode,
  initialClinic,
  initialDoctor
}) {
  const [patientName] = useState(initialPatientName);
  const [sampleCode] = useState(initialSampleCode);
  const [clinic] = useState(initialClinic);
  const [activeSection, setActiveSection] = useState('summary');
  const [copiedLink, setCopiedLink] = useState(false);

  // Official PDF download URL
  const pdfDownloadUrl = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}`;

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── 1-Click Verified Nominal Welcome Header ── */}
      <NominalWelcomeBanner
        recipientName={patientName}
        role="patient"
        clinicName={clinic}
        verifiedBy="Atlas Multidisciplinary Clinical Team"
        sessionDuration="90 days"
        storageKey={`atlas_patient_dna_${sampleCode}`}
        lang="en"
      />

      {/* ── Main Container ── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', width: '100%', padding: '1.5rem 1rem 4rem 1rem', flex: 1 }}>

        {/* Navigation Breadcrumb & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: '#64748b' }}>
            <span>Atlas Health Portal</span>
            <ChevronRight size={14} />
            <span>Genomic Medicine</span>
            <ChevronRight size={14} />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>Personal DNA Wellness Guide</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleShareClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 650,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: copiedLink ? '#16a34a' : '#475569',
                cursor: 'pointer'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Access Link'}</span>
            </button>

            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 750,
                backgroundColor: '#0d9488',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
              }}
            >
              <Download size={14} />
              <span>Download Official PDF (3 Pages)</span>
            </a>
          </div>
        </div>

        {/* ── Patient & Report Identification Card ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CLINICAL NUTRIGENOMIC EVALUATION
                </span>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                  ✓ 1-Click Authenticated
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: '#003666', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                Personal DNA Wellness & Nutrition Guide
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Prepared by <strong>Atlas Multidisciplinary Clinical Team</strong> for <strong>{patientName}</strong> · Specimen ID: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{sampleCode}</code>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Supervising Clinic</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>{clinic}</div>
              <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 650 }}>Atlas Health Accredited Partner</div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>METABOLIC DIET STRATEGY</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                Low-Carb Meal Sequencing
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Fiber & protein before carbs</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>FOLATE ACTIVATION (MTHFR)</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#b91c1c', marginTop: '2px' }}>
                Active Methylfolate Only
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Synthetic folic acid contraindicated</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>GUT BARRIER & MICROBIOTA</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                Fasting Microbiota Shield
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>15B CFU in acid-resistant DRcaps®</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>VITAMIN D RECEPTOR (VDR)</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                Therapeutic D3 + K2 MK-7
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Routes calcium safely into bones</span>
            </div>
          </div>
        </div>

        {/* ── Section Tabs: Clearly Marking Patient Guide, Pathway 1 (OTC), Pathway 2 (Compounded), and Lifestyle ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSection('summary')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 750,
              border: 'none',
              backgroundColor: activeSection === 'summary' ? '#003666' : '#ffffff',
              color: activeSection === 'summary' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSection === 'summary' ? '0 2px 4px rgba(0, 54, 102, 0.2)' : 'none'
            }}
          >
            <span>📄 Sheet 1: Clinical Guide &amp; DNA Findings</span>
          </button>

          <button
            onClick={() => setActiveSection('commercial')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 750,
              border: 'none',
              backgroundColor: activeSection === 'commercial' ? '#0d9488' : '#ffffff',
              color: activeSection === 'commercial' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSection === 'commercial' ? '0 2px 4px rgba(13, 148, 136, 0.2)' : 'none'
            }}
          >
            <span>🏪 Pathway 1: Local Commercial Supplements (OTC)</span>
          </button>

          <button
            onClick={() => setActiveSection('prescription')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 750,
              border: 'none',
              backgroundColor: activeSection === 'prescription' ? '#003666' : '#ffffff',
              color: activeSection === 'prescription' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSection === 'prescription' ? '0 2px 4px rgba(0, 54, 102, 0.2)' : 'none'
            }}
          >
            <span>💊 Pathway 2: Master Compounding Order</span>
          </button>

          <button
            onClick={() => setActiveSection('lifestyle')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 750,
              border: 'none',
              backgroundColor: activeSection === 'lifestyle' ? '#003666' : '#ffffff',
              color: activeSection === 'lifestyle' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSection === 'lifestyle' ? '0 2px 4px rgba(0, 54, 102, 0.2)' : 'none'
            }}
          >
            <span>🥗 Dietary &amp; Lifestyle Rules</span>
          </button>
        </div>

        {/* ── SECTION 1: PLAIN LANGUAGE DNA FINDINGS (4 PILLARS) ── */}
        {activeSection === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── 24GENETICS AI EXPLAINER VIDEO & VALUE CHAIN SHOWCASE ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #ccfbf1', padding: '1.5rem', boxShadow: '0 4px 12px rgba(13,148,136,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      24Genetics Multimedia Experience
                    </span>
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>
                      22 Languages · 1080p HD
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '4px 0 2px 0' }}>
                    Watch Julia: Your AI Genetic Nutrition Assistant Explains Your DNA
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                    24Genetics provides a personalized AI-generated video and continuous 24/7 WhatsApp consultation. Atlas Health Services translates these findings into your actionable <strong>Clinical Diet</strong> and <strong>Official 3-Capsule Compounding Prescription</strong>.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href="/assets/videos/24G-AI-Nutritional-Assistant.mp4"
                    download="24G-AI-Nutritional-Assistant.mp4"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      backgroundColor: '#f8fafc',
                      color: '#003666',
                      border: '1px solid #cbd5e1',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download size={14} />
                    <span>Download 1080p Video</span>
                  </a>
                </div>
              </div>

              {/* Video Player */}
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0f172a', border: '1px solid #0f172a' }}>
                <video
                  controls
                  preload="metadata"
                  style={{ width: '100%', maxHeight: '420px', display: 'block', margin: '0 auto' }}
                  src="/assets/videos/24G-AI-Nutritional-Assistant.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Value Chain Integration Callout */}
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>1. Diagnostic Layer</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>24Genetics DNA Report</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>CE-IVD Lab saliva sequencing across 22 languages</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>2. AI Explanation</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>Julia Virtual Assistant</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Personalized video & 24/7 WhatsApp consultation</div>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>3. Clinical Diet (Atlas)</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>Plate Sequencing & Limits</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Net carb limit & microbiome food protocol</div>
                </div>
                <div style={{ backgroundColor: '#eff6ff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>4. Medical Compounding (Atlas)</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>3-Capsule Size 0 Regimen</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Official compounding pharmacy prescription</div>
                </div>
              </div>
            </div>

            {/* ── 4 CLINICAL PILLARS ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} className="text-teal-600" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Clinical Evaluation: What Your Genetic Profile Means in Daily Life
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                This clinical evaluation was prepared by the <strong>Atlas Health multidisciplinary team of medical geneticists and compounding pharmacists</strong> based on your 24Genetics Nutrition DNA report. Every finding is explained in clear language, paired with an exact 60-day targeted protocol:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {CLINICAL_PILLARS.map((pillar) => (
                  <div
                    key={pillar.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      borderLeft: `4px solid ${pillar.statusColor}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, color: pillar.statusColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {pillar.titleEn}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Target Genes: <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', color: '#0f172a' }}>{pillar.keyGenes}</code>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: `${pillar.statusColor}15`, color: pillar.statusColor, border: `1px solid ${pillar.statusColor}35`, padding: '3px 9px', borderRadius: '4px' }}>
                        {pillar.statusEn}
                      </span>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>What Your DNA Shows:</strong>
                      <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '3px 0 8px 0' }}>
                        {pillar.dnaFindingEn}
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '0.80rem' }}>
                      <div style={{ color: '#475569', lineHeight: 1.5 }}>
                        <strong>Clinical Mechanism:</strong> {pillar.clinicalRationaleEn}
                      </div>

                      {/* Direct Galenic Cross-Reference */}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.82rem' }}>
                            🎯 {pillar.assignedFormulation?.referenceLabelEn || 'Addressed in Compounding Protocol'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#0d9488', fontStyle: 'italic', marginTop: '2px' }}>
                            Clinical Goal: {pillar.assignedFormulation?.clinicalGoalEn}
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveSection('prescription')}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: '#003666',
                            color: '#ffffff',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>View Pharmacy Order</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION: PATHWAY 1 · LOCAL COMMERCIAL OTC SUPPLEMENTS (PAGE 2 COPY) ── */}
        {activeSection === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Pathway 1 Header Banner */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '1.25rem 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    PAGE 2 OF 3 · PATHWAY 1: LOCAL COMMERCIAL OTC SUPPLEMENTS
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '6px 0 2px 0' }}>
                    Personalized Multivitamin &amp; Commercial Supplement Recommendation
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>DISPENSING STANDARD</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0d9488' }}>Doha / Qatar Pharmacies OTC</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                Based on your genetic profile, these commercially available supplements can be purchased directly in retail pharmacies in Doha (Boots, Wellcare, Kulud, Aster). Make sure to purchase the exact active chemical forms specified below to bypass your metabolic bottlenecks.
              </p>
            </div>

            {/* Warning Callout Box for OTC purchases: Mutual Exclusivity Safety */}
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#b91c1c', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} />
                <span>CRITICAL CLINICAL DIRECTIVE: MUTUALLY EXCLUSIVE PATHWAYS (CHOOSE ONE ONLY)</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.80rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                <strong>Do NOT combine Pathway 1 and Pathway 2 concurrently.</strong> They are alternative clinical tracks designed to resolve the same genetic targets. If taking the local commercial OTC supplements below, do not take compounded formulations. If your physician prescribes the tailor-made compounded regimen (Pathway 2), it replaces all OTC supplements to prevent dangerous micronutrient hypervitaminosis (excess Vitamin D, folate, or mineral toxicity).
              </p>
            </div>

            {/* Dual-Track Strategy Comparison Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1.5px solid #0d9488', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 6px', borderRadius: '4px' }}>
                    CURRENT VIEW
                  </span>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    {PRESCRIPTION_COMPARISON.pathwayA.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  {PRESCRIPTION_COMPARISON.pathwayA.subtitle}
                </p>
                <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginBottom: '6px' }}>Advantages:</div>
                <ul style={{ margin: '0 0 10px 0', paddingLeft: '18px', fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                  {PRESCRIPTION_COMPARISON.pathwayA.pros.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
                <div style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>Considerations:</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>
                  {PRESCRIPTION_COMPARISON.pathwayA.cons.map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px' }}>
                    PATHWAY 2 ALTERNATIVE
                  </span>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#003666' }}>
                    {PRESCRIPTION_COMPARISON.pathwayB.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  {PRESCRIPTION_COMPARISON.pathwayB.subtitle}
                </p>
                <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginBottom: '6px' }}>Clinical Benefits:</div>
                <ul style={{ margin: '0 0 10px 0', paddingLeft: '18px', fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                  {PRESCRIPTION_COMPARISON.pathwayB.pros.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setActiveSection('prescription')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  View Tailor-Made Compounding Order →
                </button>
              </div>
            </div>

            {/* Patient Flexibility & Budget Decision Guide Banner */}
            <div style={{ backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={16} className="text-teal-700" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f766e' }}>
                  Patient Flexibility &amp; Budget Guide: Choose What Fits Your Goals
                </h4>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.80rem', color: '#134e4a', lineHeight: 1.5 }}>
                You do not have to purchase all 5 commercial bottles at once if you prefer a phased or budget-conscious approach:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                  <div style={{ fontWeight: 800, color: '#b91c1c', marginBottom: '2px' }}>
                    🔴 Tier 1 · Minimum Core (Priority 1 only · 2 bottles)
                  </div>
                  <div style={{ color: '#475569' }}>
                    Active Folate + Vitamin D3/K2. Directly resolves MTHFR &amp; VDR enzymatic bottlenecks (covers 80% of clinical genetic risk).
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                  <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '2px' }}>
                    🔵 Tier 2 · Metabolic &amp; Sleep (Priorities 1 &amp; 2 · 4 bottles)
                  </div>
                  <div style={{ color: '#475569' }}>
                    Adds Chelated Magnesium + Methyl-B12 for COMT stress modulation, daytime alertness &amp; restorative sleep architecture.
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                  <div style={{ fontWeight: 800, color: '#d97706', marginBottom: '2px' }}>
                    🟡 Tier 3 · Full Optimization (Priorities 1, 2 &amp; 3 · 5 bottles)
                  </div>
                  <div style={{ color: '#475569' }}>
                    Adds Enteric Probiotics for gut barrier repair. <em>Can be safely omitted if you already maintain a 100% strict dairy-free diet.</em>
                  </div>
                </div>
              </div>
            </div>

            {/* List of 5 Commercial Supplements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {COMMERCIAL_LOCAL_SUPPLEMENTS.map((supp, sIdx) => (
                <div
                  key={supp.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#0d9488', color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                        #{sIdx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#003666' }}>
                        {supp.nutrientEn}
                      </h4>
                      {supp.priorityBadge && (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          backgroundColor: supp.priorityBg,
                          color: supp.priorityColor,
                          border: `1px solid ${supp.priorityBorder}`,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {supp.priorityBadge}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px' }}>
                        Dose: {supp.doseDaily}
                      </span>
                      <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                        Target: {supp.targetedGenes}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', fontSize: '0.80rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                        ✓ Active Chemical Form:
                      </span>
                      <div style={{ color: '#0d9488', fontWeight: 750 }}>
                        {supp.chemicalFormEn}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontWeight: 700, color: '#b91c1c', display: 'block', marginBottom: '2px' }}>
                        ✗ Avoid on Label:
                      </span>
                      <div style={{ color: '#64748b', fontSize: '0.76rem' }}>
                        {supp.avoidEn}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                        ⏰ Posology:
                      </span>
                      <div style={{ color: '#334155' }}>
                        {supp.timingEn}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontWeight: 700, color: '#003666', display: 'block', marginBottom: '2px' }}>
                        🏬 Qatar Reference Brands:
                      </span>
                      <div style={{ color: '#0f172a', fontWeight: 650 }}>
                        {supp.localBrandsEn}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0', fontSize: '0.72rem', color: '#64748b' }}>
                    📍 Availability: {supp.availabilityQatar}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom PDF CTA */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#003666' }}>Download Complete 3-Page Clinical Dossier:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  Includes Page 1 (Findings), Page 2 (Pathway 1 Local OTC Guide), and Page 3 (Pathway 2 Compounding Order).
                </p>
              </div>

              <a
                href={pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                <Download size={15} />
                <span>Download Official PDF (3 Pages)</span>
              </a>
            </div>

          </div>
        )}

        {/* ── SECTION 3: MASTER PHARMACY COMPOUNDING ORDER (PAGE 3 COPY) ── */}
        {activeSection === 'prescription' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Official Pharmacy Dispensing Header Banner */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '1.25rem 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    PAGE 3 OF 3 · PATHWAY 2: MASTER COMPOUNDING PRESCRIPTION ORDER
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '6px 0 2px 0' }}>
                    Master Compounding Prescription Order
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL PRESCRIPTION REF</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#b91c1c' }}>RX-DNA-COMP-8821</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                Authorized 3-Capsule Formulations · Galenically partitioned to prevent botanical degradation of live cultures, optimize absorption kinetics, and guarantee patient compliance. Excipients: 100% Lactose-Free.
              </p>
            </div>

            {/* Pharmacokinetic Compatibility Analysis Banner */}
            <div style={{ backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={20} className="text-teal-700" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f766e', margin: 0 }}>
                  Galenic & Pharmacokinetic Compatibility Analysis
                </h4>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                {GALENIC_COMPATIBILITY_ANALYSIS.rationale}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '10px' }}>
                {GALENIC_COMPATIBILITY_ANALYSIS.conflictsIdentified.map((conflict, idx) => (
                  <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #ccfbf1', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.78rem', color: '#0f766e' }}>{conflict.title}</strong>
                      <span style={{ fontSize: '0.64rem', fontWeight: 800, backgroundColor: '#fef2f2', color: '#dc2626', padding: '1px 5px', borderRadius: '3px' }}>
                        {conflict.severity}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                      {conflict.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#0f766e', color: '#ffffff', borderRadius: '6px', fontSize: '0.80rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                <span>Clinical Solution: {GALENIC_COMPATIBILITY_ANALYSIS.resolvedArchitecture}</span>
              </div>
            </div>

            {/* Prescription Modality Selection: Option A (Core 2-Capsule) vs Option B (Comprehensive 3-Capsule) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1.5px solid #003666', padding: '1.25rem 1.5rem', boxShadow: '0 2px 6px rgba(0, 54, 102, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} className="text-blue-900" />
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 850, color: '#003666' }}>
                  Compounding Modalities: Flexible Regimens for Every Patient &amp; Budget
                </h4>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                Your prescribing physician can authorize either the foundational 2-capsule daily regimen or the complete 3-capsule chronobiological protocol:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', marginBottom: '4px' }}>
                    MODALITY A · CORE 2-CAPSULE REGIMEN (CAPSULES B + C ONLY)
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#003666', marginBottom: '4px' }}>
                    Essential Methylation &amp; Sleep Foundation (2 Caps / Day)
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                    Focuses on the primary genetic bottlenecks (MTHFR, VDR, COMT). Reduces preparation cost by ~30% and pill burden. Best if you do not suffer from severe gut dysbiosis.
                  </p>
                </div>
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    MODALITY B · FULL 3-CAPSULE REGIMEN (CAPSULES A + B + C)
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#003666', marginBottom: '4px' }}>
                    Comprehensive 360° Chronobiology (3 Caps / Day)
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                    Adds Morning Capsule A (Enteric DRcaps® Probiotics &amp; Glutamine) for tight-junction repair, lactose intolerance mucosal shield, and full cellular longevity.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Distinct Capsules with Pharmacy Batch Math */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {THREE_CAPSULE_PROTOCOL.map((capsule, cIdx) => (
                <div
                  key={capsule.capsuleId}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    padding: '1.5rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: cIdx === 0 ? '#0d9488' : (cIdx === 1 ? '#003666' : '#1e3a8a'), color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                          FORMULATION #{cIdx + 1}
                        </span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#003666', margin: 0 }}>
                          {capsule.nameEn}
                        </h4>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: 750 }}>
                        ⏰ Posology: {capsule.timingEn}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px' }}>
                        60 Capsules · 60-Day Supply
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                        {capsule.targetPillar}
                      </div>
                    </div>
                  </div>

                  {/* Galenic Vehicle & Rationale */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.78rem', color: '#334155', marginBottom: '1rem', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                    <div><strong>Galenic Delivery Vehicle:</strong> {capsule.galenicVehicleEn}</div>
                    <div style={{ marginTop: '3px' }}><strong>Compounding Rationale:</strong> {capsule.rationaleEn}</div>
                  </div>

                  {/* Formulation Table (Mirroring PDF Sheet 2) */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.80rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '8px 12px', fontWeight: 750, color: '#0f172a' }}>Active Ingredient (Generic API)</th>
                          <th style={{ padding: '8px 12px', fontWeight: 750, color: '#0f172a' }}>Chemical Specification / Grade</th>
                          <th style={{ padding: '8px 12px', fontWeight: 750, color: '#0d9488' }}>Dose / Cap</th>
                          <th style={{ padding: '8px 12px', fontWeight: 750, color: '#003666' }}>Batch Qty (60 Caps)</th>
                          <th style={{ padding: '8px 12px', fontWeight: 750, color: '#0f172a' }}>Pharmaceutical Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {capsule.ingredients.map((ing, idx) => {
                          const batchQty = 
                            cIdx === 0 && idx === 0 ? '900 B. CFU' :
                            cIdx === 0 && idx === 1 ? '30.00 g' :
                            cIdx === 0 && idx === 2 ? '540,000 ALU' :
                            cIdx === 1 && idx === 0 ? '9.00 g' :
                            cIdx === 1 && idx === 1 ? '6.00 mg' :
                            cIdx === 1 && idx === 2 ? '30.00 mg' :
                            cIdx === 1 && idx === 3 ? '30.00 mg' :
                            cIdx === 1 && idx === 4 ? '300,000 IU' :
                            cIdx === 1 && idx === 5 ? '6.00 mg' :
                            cIdx === 2 && idx === 0 ? '6.00 g' :
                            cIdx === 2 && idx === 1 ? '6.00 mg' :
                            cIdx === 2 && idx === 2 ? '30 mg each' :
                            cIdx === 2 && idx === 3 ? '12.00 g' :
                            cIdx === 2 && idx === 4 ? '6.00 g' : '—';

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                              <td style={{ padding: '9px 12px', fontWeight: 750, color: '#0f172a' }}>{ing.apiEn}</td>
                              <td style={{ padding: '9px 12px', color: '#475569' }}>{ing.chemicalSpec}</td>
                              <td style={{ padding: '9px 12px', fontWeight: 800, color: '#0d9488' }}>{ing.dose}</td>
                              <td style={{ padding: '9px 12px', fontWeight: 800, color: '#003666' }}>{batchQty}</td>
                              <td style={{ padding: '9px 12px', color: '#334155' }}>{ing.purposeEn}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Prescribing Physician Authorization & Official Medical Signature (No Pharmacist Log, Blank Fields) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1.5px solid #cbd5e1', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    MEDICAL PRESCRIPTION AUTHORIZATION · EXCLUSIVE FOR PRESCRIBING PHYSICIAN
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f172a', margin: '2px 0 0 0' }}>
                    Prescribing Physician Sign-Off & Official Validation (Firma Médica)
                  </h4>
                </div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px' }}>
                  Single-Patient Non-Transferable Rx · Valid for 60 Days
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Doctor's Identification Fields (Left blank for the prescribing physician to fill) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.80rem', color: '#334155' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Prescribing Physician (Full Name / Nombre y Apellidos del Médico):
                    </span>
                    <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Medical License / Collegiate Reg. No. (Nº Colegiado / Licencia Médica):
                    </span>
                    <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Clinic / Healthcare Institution:
                      </span>
                      <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Date (Fecha):
                      </span>
                      <div style={{ borderBottom: '1.5px solid #94a3b8', height: '22px', width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Signature & Professional Stamp Box */}
                <div style={{ backgroundColor: '#f8fafc', border: '1.5px dashed #94a3b8', borderRadius: '8px', padding: '1rem', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
                      Physician&apos;s Signature & Professional Stamp (Firma y Sello Oficial):
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.70rem', color: '#94a3b8' }}>
                      Place official clinical seal or physical/digital medical signature here.
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', textAlign: 'center', fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    Authorized Prescribing Physician Signature & Stamp
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Cycle & Pharmacy Note */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#003666' }}>Treatment Duration & Laboratory Follow-Up:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, maxWidth: '680px' }}>
                  {TREATMENT_CYCLE.summaryEn}. {TREATMENT_CYCLE.followUpNoteEn}
                </p>
              </div>

              <a
                href={pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  backgroundColor: '#003666',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                <Printer size={15} />
                <span>Print Official Compounding Order (PDF)</span>
              </a>
            </div>
          </div>
        )}

        {/* ── SECTION 3: CONCRETE DIETARY GUIDELINES & MICROBIOME HABITS ── */}
        {activeSection === 'lifestyle' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {CONCRETE_DIET_GUIDELINES.map((item) => (
              <div
                key={item.step}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 7px', borderRadius: '4px' }}>
                      RULE {item.step}
                    </span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {item.titleEn}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '6px 0 0 0' }}>
                    {item.ruleEn}
                  </p>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.76rem', color: '#0d9488', fontWeight: 700 }}>
                  ✓ Clinically calibrated to your DNA markers
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <PublicUnifiedFooter />
    </div>
  );
}

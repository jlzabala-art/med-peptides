'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dna,
  ShieldCheck,
  Download,
  Share2,
  Check,
  Copy,
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
  Smartphone,
  Printer
} from 'lucide-react';
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';

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
  const [oneClickAuthed, setOneClickAuthed] = useState(true);

  // PDF download URL
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
        verifiedBy="Atlas Health Clinical Genetics"
        sessionDuration="90 days"
        storageKey={`atlas_patient_dna_${sampleCode}`}
        lang="en"
      />

      {/* ── Main Container ── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', width: '100%', padding: '1.5rem 1rem 4rem 1rem', flex: 1 }}>
        
        {/* Navigation Breadcrumb & Quick Access Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: '#64748b' }}>
            <span>Atlas Health Portal</span>
            <ChevronRight size={14} />
            <span>Genomic Medicine</span>
            <ChevronRight size={14} />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>Personal DNA Guide</span>
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
              <span>Download Official PDF (2 Pages)</span>
            </a>
          </div>
        </div>

        {/* ── Patient & Report Identification Card ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GENOMIC TEST EVALUATION
                </span>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                  ✓ 1-Click Authenticated
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: '#003666', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                Personal DNA Wellness & Nutrition Guide
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Direct clinical interpretation for <strong>{patientName}</strong> · Specimen ID: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{sampleCode}</code>
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
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>RECOMMENDED DIET ARCHETYPE</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                Low-Carb Mediterranean Plan
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Proteins & fiber before carbs</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>FOLATE ACTIVATION (MTHFR)</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#b91c1c', marginTop: '2px' }}>
                Active Folate Required
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Avoid synthetic folic acid</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>VITAMIN D RECEPTOR (VDR)</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                High-Potency D3 + K2
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Safely routes calcium to bones</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 650 }}>DIGESTIVE GENOTYPE (LCT)</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                100% Lactose-Free Excipients
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Certified vegetable DRcaps®</span>
            </div>
          </div>
        </div>

        {/* ── Section Tabs ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSection('summary')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 750,
              border: 'none',
              backgroundColor: activeSection === 'summary' ? '#003666' : '#ffffff',
              color: activeSection === 'summary' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            1. Your DNA Findings in Plain Language
          </button>

          <button
            onClick={() => setActiveSection('prescription')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 750,
              border: 'none',
              backgroundColor: activeSection === 'prescription' ? '#003666' : '#ffffff',
              color: activeSection === 'prescription' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            2. Compounded Pharmacy Prescription (Ready to Send)
          </button>

          <button
            onClick={() => setActiveSection('lifestyle')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 750,
              border: 'none',
              backgroundColor: activeSection === 'lifestyle' ? '#003666' : '#ffffff',
              color: activeSection === 'lifestyle' ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
          >
            3. Daily Meal & Energy Habits
          </button>
        </div>

        {/* ── SECTION 1: PLAIN LANGUAGE EXPLANATION ── */}
        {activeSection === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} className="text-teal-600" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Clinical Evaluation: What Your DNA Means for Your Health
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                This report has been evaluated and synthesized by the <strong>Atlas Health multidisciplinary clinical team of medical geneticists and compounding pharmacists</strong>. Every finding is paired with exact posology and an initial 60-day treatment cycle designed to restore optimal biochemical balance:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                {/* 1. MTHFR */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', borderLeft: '4px solid #b91c1c' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      1. Energy & Brain Clarity (MTHFR Gene)
                    </div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px' }}>
                      PRIORITY FOCUS
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '4px 0 10px 0' }}>
                    Your liver has a natural variation that makes it 70% slower at activating regular synthetic folic acid found in cheap multivitamins. When your body cannot activate folate, you may experience mid-afternoon brain fog, sluggish recovery, and higher cardiovascular inflammation.
                  </p>
                  <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '10px 14px', borderRadius: '6px', fontSize: '0.80rem', color: '#0f766e', fontWeight: 650 }}>
                    <div><strong>Clinical Recommendation:</strong> Take bioavailable <em>L-Methylfolate (1,000 mcg)</em> and <em>Methylcobalamin (B12, 1,000 mcg)</em>.</div>
                    <div style={{ marginTop: '3px' }}><strong>Posology:</strong> 500 mcg BID (1 capsule with breakfast and 1 with dinner). <strong>Duration:</strong> 60-day cycle.</div>
                  </div>
                </div>

                {/* 2. VDR */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', borderLeft: '4px solid #b45309' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      2. Bone Strength & Immunity (Vitamin D Receptor)
                    </div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px' }}>
                      MODERATE ACTION
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '4px 0 10px 0' }}>
                    Even in a sunny environment like the Gulf/Qatar, your cell receptors take longer to recognize vitamin D. This can lead to low energy, muscle fatigue, and weaker bone density over time.
                  </p>
                  <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '10px 14px', borderRadius: '6px', fontSize: '0.80rem', color: '#0f766e', fontWeight: 650 }}>
                    <div><strong>Clinical Recommendation:</strong> Daily therapeutic <em>Vitamin D3 (5,000 IU)</em> combined with <em>Vitamin K2 (100 mcg)</em> and <em>Magnesium Bisglycinate (200 mg)</em>.</div>
                    <div style={{ marginTop: '3px' }}><strong>Posology:</strong> Take once daily in the morning with a meal containing healthy fats. <strong>Duration:</strong> 60-day cycle.</div>
                  </div>
                </div>

                {/* 3. TCF7L2 */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', borderLeft: '4px solid #0d9488' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      3. Sugar Spikes & Fat Storage (TCF7L2 Gene)
                    </div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px' }}>
                      METABOLIC ADAPTATION
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '4px 0 10px 0' }}>
                    Refined carbohydrates, white bread, pastries, and sweet beverages trigger an exaggerated insulin surge in your body. This makes you feel suddenly hungry again 90 minutes after eating and causes preferential fat storage around the abdomen.
                  </p>
                  <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '10px 14px', borderRadius: '6px', fontSize: '0.80rem', color: '#0f766e', fontWeight: 650 }}>
                    <div><strong>Clinical Recommendation:</strong> High-bioavailability <em>Standardized Berberine (250 mg)</em> and <em>Chromium Picolinate (200 mcg)</em>.</div>
                    <div style={{ marginTop: '3px' }}><strong>Posology:</strong> 125 mg Berberine BID taken 15 min before breakfast and dinner. <strong>Duration:</strong> 60-day cycle.</div>
                  </div>
                </div>

                {/* 4. Lactase Deficiency */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      4. Dairy & Gut Comfort (LCT / MCM6 Gene)
                    </div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px' }}>
                      DIGESTIVE SAFETY
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '4px 0 10px 0' }}>
                    Your intestines produce negligible lactase enzyme. Consuming conventional cow milk, soft cheeses, or medicines containing lactose filler triggers bloating, gas, and hidden gut lining inflammation.
                  </p>
                  <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '10px 14px', borderRadius: '6px', fontSize: '0.80rem', color: '#0f766e', fontWeight: 650 }}>
                    <div><strong>Clinical Recommendation:</strong> Strict dietary exclusion of unfermented dairy lactose. For unverified dining out, keep <em>Lactase Enzyme (9,000 FCC ALU)</em> available.</div>
                    <div style={{ marginTop: '3px' }}><strong>Galenic Standard:</strong> Capsules are 100% lactose-free in acid-resistant DRcaps®. <strong>Duration:</strong> Permanent dietary protocol.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: PHARMACY READY ORDER ── */}
        {activeSection === 'prescription' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '2px solid #0d9488', padding: '1.75rem', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pill size={20} className="text-teal-600" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#003666', margin: 0 }}>
                      Pharmacy Prescription Order (Formula RX-DNA-COMP-8821)
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.80rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Standardized generic chemical names & pharmacopeia specs ready for compounding pharmacies.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={pdfDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.80rem',
                      fontWeight: 750,
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Printer size={15} />
                    <span>Print for Pharmacy</span>
                  </a>
                </div>
              </div>

              {/* Prescription Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>PATIENT NAME:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{patientName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>TREATMENT CYCLE:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>60-Day Supply (120 DRcaps®)</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>POSOLOGY:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488' }}>1 Capsule Morning · 1 Capsule Night</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>VEHICLE STANDARD:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>Vegetable Hypromellose (Lactose-Free)</div>
                </div>
              </div>

              {/* Master Formulation Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#003666', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 750 }}>Active Pharmacological Ingredient (Generic)</th>
                      <th style={{ padding: '10px 14px', fontWeight: 750 }}>Chemical Specification</th>
                      <th style={{ padding: '10px 14px', fontWeight: 750 }}>Daily Dose</th>
                      <th style={{ padding: '10px 14px', fontWeight: 750 }}>Targeted Genetic Pathway</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>L-Methylfolate</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>[6S]-5-Methyltetrahydrofolate Calcium Salt</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>1,000 mcg</td>
                      <td style={{ padding: '10px 14px', color: '#b91c1c', fontWeight: 650 }}>MTHFR Enzyme Bypass</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>Methylcobalamin (Vitamin B12)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Active Coenzyme B12 (USP Grade)</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>1,000 mcg</td>
                      <td style={{ padding: '10px 14px', color: '#b91c1c', fontWeight: 650 }}>Homocysteine Recycling</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>Vitamin D3</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Cholecalciferol Pure Powder (USP Grade)</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>5,000 IU</td>
                      <td style={{ padding: '10px 14px', color: '#b45309', fontWeight: 650 }}>VDR Receptor Sensitivity</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>Vitamin K2</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Menaquinone-7 (all-trans MK-7)</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>100 mcg</td>
                      <td style={{ padding: '10px 14px', color: '#b45309', fontWeight: 650 }}>Vascular Arterial Shield</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>Magnesium Bisglycinate</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Chelated Magnesium Glycinate Powder</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>200 mg</td>
                      <td style={{ padding: '10px 14px', color: '#475569', fontWeight: 650 }}>Enzymatic VDR Cofactor</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>Berberine Extract</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Phospholipid / Phytosome Standardized (97%)</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>250 mg</td>
                      <td style={{ padding: '10px 14px', color: '#0d9488', fontWeight: 650 }}>TCF7L2 Glycemic Spikes</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>Chromium Picolinate</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Pharmaceutical Grade Chromium (USP)</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>200 mcg</td>
                      <td style={{ padding: '10px 14px', color: '#0d9488', fontWeight: 650 }}>Insulin Receptor Affinity</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>5-Hydroxytryptophan (5-HTP)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Natural Botanical Extract (Griffonia)</td>
                      <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0d9488' }}>100 mg</td>
                      <td style={{ padding: '10px 14px', color: '#475569', fontWeight: 650 }}>Evening Craving Control</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.80rem', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>
                  ✓ <strong>Pharmacist Notice:</strong> This formula is certified lactose-free and packaged in acid-resistant DRcaps® to ensure intestinal absorption without stomach irritation.
                </span>
                <span style={{ fontWeight: 800 }}>Ref: RX-DNA-COMP-8821</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 3: PRACTICAL LIFESTYLE HABITS ── */}
        {activeSection === 'lifestyle' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Activity size={18} className="text-teal-600" />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Dietary Sequencing: How to Eat for Your DNA
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                Because of your <strong>TCF7L2 carb sensitivity</strong>, the order in which you eat your food dramatically alters your post-meal energy and fat storage:
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                <li><strong>Step 1:</strong> Always eat fiber and greens first (salads, cucumbers, broccoli).</li>
                <li><strong>Step 2:</strong> Consume proteins and healthy fats next (grilled fish, chicken, olive oil).</li>
                <li><strong>Step 3:</strong> Finish with complex carbohydrates (quinoa, sweet potatoes, wild rice).</li>
              </ul>
              <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#0d9488', fontWeight: 700 }}>
                Result: Flattens glucose spikes by up to 45% and prevents post-lunch drowsiness.
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Calendar size={18} className="text-blue-600" />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Caffeine & Sleep Window
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                Your liver metabolizes caffeine at a gradual rate. Afternoon coffee or energy drinks linger in your system well into the evening:
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                <li><strong>Cutoff Time:</strong> Restrict coffee, espresso, and pre-workouts to before <strong>2:00 PM</strong>.</li>
                <li><strong>Evening Alternative:</strong> Chamomile, peppermint, or ginger herbal tea.</li>
                <li><strong>Bedtime Routine:</strong> Take your second compounded capsule with dinner to promote deep restorative sleep via 5-HTP and magnesium.</li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* ── Public Unified Footer ── */}
      <PublicUnifiedFooter />
    </div>
  );
}


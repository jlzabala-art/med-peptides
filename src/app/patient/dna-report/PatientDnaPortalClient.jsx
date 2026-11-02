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
  TREATMENT_CYCLE
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

        {/* ── Section Tabs: Clearly Marking Sheet 1 (Patient) vs Sheet 2 (Pharmacy) ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSection('summary')}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
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
            <span>📄 Sheet 1: Patient Guide (Hoja del Paciente)</span>
          </button>

          <button
            onClick={() => setActiveSection('prescription')}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
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
            <span>💊 Sheet 2: Pharmacy Compounding Order (Hoja Farmacéutico)</span>
          </button>

          <button
            onClick={() => setActiveSection('lifestyle')}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
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
            <span>🥗 Dietary & Lifestyle Rules</span>
          </button>
        </div>

        {/* ── SECTION 1: PLAIN LANGUAGE DNA FINDINGS (4 PILLARS) ── */}
        {activeSection === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} className="text-teal-600" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Clinical Evaluation: What Your Genetic Profile Means in Daily Life
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                This clinical evaluation was prepared by the <strong>Atlas Health multidisciplinary team of medical geneticists and compounding pharmacists</strong>. Every finding is explained in clear, accessible language, paired with an exact 60-day targeted protocol:
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
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>Addressed In:</span>
                        {pillar.assignedCapsules.map((cap) => (
                          <span key={cap} style={{ backgroundColor: '#003666', color: '#ffffff', padding: '2px 7px', borderRadius: '3px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: MASTER PHARMACY COMPOUNDING ORDER (PAGE 2 COPY) ── */}
        {activeSection === 'prescription' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Official Pharmacy Dispensing Header Banner */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '1.25rem 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    PAGE 2 OF 2 · PHARMACY DISPENSING COPY (COPIA PARA LA FARMACIA)
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

            {/* Prescribing Medical Authority & Pharmacist Dispensing Log */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '1rem' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
                    CLINICAL GENETICS PRESCRIBING AUTHORITY
                  </span>
                  <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    Atlas Health Clinical Genetics & Compounding Pharmacy Council
                  </div>
                  <div style={{ fontSize: '0.80rem', color: '#0d9488', fontWeight: 650, marginTop: '2px' }}>
                    Accredited Partner: {clinic}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Registration: QA-MOH-GEN-2026 · European CE-IVD Validated Protocol
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                    Prescription Validity: 60 Days from Issue · Non-Transferable Single Patient Rx
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
                    COMPOUNDING PHARMACIST DISPENSING & BATCH LOG
                  </span>
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
                    <div><strong>Dispensing Pharmacy:</strong> <span style={{ color: '#94a3b8' }}>__________________________________________</span></div>
                    <div><strong>Compounding Pharmacist:</strong> <span style={{ color: '#94a3b8' }}>__________________ Reg #: ____________</span></div>
                    <div><strong>Batch Lot #:</strong> <span style={{ color: '#94a3b8' }}>_____________</span> <strong>Compounded Date:</strong> <span style={{ color: '#94a3b8' }}>___/___/2026</span></div>
                    <div><strong>Beyond-Use Date (BUD):</strong> +60 Days from Compounding</div>
                    <div><strong>Pharmacist Signature & Stamp:</strong> <span style={{ color: '#94a3b8' }}>___________________________</span></div>
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

'use client';

import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Utensils,
  Clock,
  Sun,
  Moon,
  MessageSquare,
  ListChecks,
  ShoppingBag,
  Leaf,
  Flame,
  Zap
} from 'lucide-react';
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import {
  evaluateNutrigenomicProfile,
  DEFAULT_HOSSAM_GENOTYPES,
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
  const [activeSection, setActiveSection] = useState('mealplan');
  const [selectedModality, setSelectedModality] = useState('modalityB');
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic Clinical Rules Engine Inference
  const clinicalProfile = useMemo(() => {
    return evaluateNutrigenomicProfile({
      patientName,
      sampleCode,
      clinic
    });
  }, [patientName, sampleCode, clinic]);

  const [selectedDay, setSelectedDay] = useState(1);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState({});
  const [foodTrafficFilter, setFoodTrafficFilter] = useState('all');

  const toggleGroceryItem = (itemKey) => {
    setCheckedGroceryItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Official PDF download URLs (Synchronized with interactive modality selection)
  const pdfDownloadUrl = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&modality=${selectedModality}&includeOriginal=true`;
  const pdfDownloadUrlLight = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&modality=${selectedModality}&full=false`;

  const mealPlanPdfUrl = `/api/reports/24genomics-mealplan-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&includeOriginal=true`;
  const mealPlanPdfUrlLight = `/api/reports/24genomics-mealplan-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&full=false`;

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleWhatsAppShare = (lang = 'en') => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      const text = lang === 'es'
        ? `Hola ${patientName}, aquí tienes tu Dossier Genómico Personalizado: ${url}\n\nBasado estrictamente en tu secuenciación de 24Genetics, el equipo clínico de Atlas ha desarrollado las hojas ejecutivas iniciales con tu plan nutricional y suplementación. Al ser un equipo local basado en UAE, cuentan con plena flexibilidad para realizar cualquier adaptación a medida de tus requerimientos.`
        : `Hello ${patientName}, here is your Personalized Genomic Dossier: ${url}\n\nBased directly on your 24Genetics sequencing report, the Atlas clinical team has developed the executive opening guides for your meal plan and targeted supplementation. As a local UAE-based team, Atlas offers complete flexibility to make tailored adaptations according to your specific requirements.`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
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
            <span style={{ color: '#0d9488', fontWeight: 700 }}>Personal DNA Wellness &amp; Meal Guide</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => handleWhatsAppShare('en')}
              title="Share personalized generic message via WhatsApp (without validation claims)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '6px',
                color: '#15803d',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </button>

            <a
              href={mealPlanPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Download full 59-page dossier including executive meal plan guide, 24h routine, grocery list, and complete original 24Genetics report"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 750,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
              }}
            >
              <Utensils size={14} />
              <span>Meal Plan Dossier (59 Pgs)</span>
            </a>

            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Download full 59-page clinical dossier including 3-page prescription protocol and complete original 24Genetics report"
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
              <span>Clinical Rx Dossier (59 Pgs)</span>
            </a>

            {/* Light WhatsApp PDF Links */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', paddingRight: '2px' }}>WhatsApp (Light):</span>
              <a
                href={mealPlanPdfUrlLight}
                target="_blank"
                rel="noopener noreferrer"
                title="Download 2-page executive summary only (lightweight, ideal for WhatsApp/mobile)"
                style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textDecoration: 'none', padding: '3px 6px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
              >
                Diet (2p)
              </a>
              <a
                href={pdfDownloadUrlLight}
                target="_blank"
                rel="noopener noreferrer"
                title="Download 3-page clinical Rx only (lightweight, ideal for WhatsApp/mobile)"
                style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', textDecoration: 'none', padding: '3px 6px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
              >
                Rx (3p)
              </a>
            </div>
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
            onClick={() => setActiveSection('mealplan')}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 800,
              border: 'none',
              backgroundColor: activeSection === 'mealplan' ? '#0284c7' : '#ffffff',
              color: activeSection === 'mealplan' ? '#ffffff' : '#0369a1',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSection === 'mealplan' ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
              borderWidth: activeSection === 'mealplan' ? '0px' : '1px',
              borderStyle: 'solid',
              borderColor: '#bae6fd'
            }}
          >
            <Utensils size={15} />
            <span>🥗 Clinical Nutritionist Plan (Food-First &amp; Precision Diet)</span>
          </button>

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

        {/* ── SECTION 0: CLINICAL NUTRITIONIST & FOOD-FIRST PRECISION DOSSIER ── */}
        {activeSection === 'mealplan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Welcome Banner */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #bae6fd', padding: '1.75rem', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '3px 9px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      Clinical Nutritionist Edition
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: '4px' }}>
                      ✓ Precision Food-First Strategy
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '4px' }}>
                      ⚡ 5 Genomic Axes Evaluated
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#003666', margin: '4px 0 6px 0' }}>
                    Personalized Genomic Nutrition &amp; Food-First Strategy
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.90rem', color: '#475569', lineHeight: 1.6, maxWidth: '820px' }}>
                    Translating genetic polymorphisms (MC4R, MTHFR, IRS1, ZPR1/CYP4F2, MCM6, ADORA2A) into food medicine, plate sequencing, satiety thresholds, and circadian chronobiology — empowering clinical nutritionists and patients beyond mere pill prescriptions.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                  <a
                    href={mealPlanPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      fontSize: '0.84rem',
                      fontWeight: 750,
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      boxShadow: '0 3px 8px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    <Utensils size={16} />
                    <span>Download Full Dossier (59 Pgs: Guide + 24Genetics)</span>
                  </a>

                  <a
                    href={mealPlanPdfUrlLight}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      textDecoration: 'underline',
                      paddingLeft: '4px'
                    }}
                  >
                    ⚡ Download 4-Page Executive Clinical Guide (Light · Kitchen / Clinic Print)
                  </a>
                </div>
              </div>

              {/* 5 Clinical Genomic Axes Scorecards */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    THE 5 CLINICAL GENOMIC AXES (RULES ENGINE EVALUATION)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Specimen: <strong>{sampleCode}</strong> · Patient: <strong>{patientName}</strong>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {clinicalProfile.fiveClinicalAxes.map((axis) => (
                    <div
                      key={axis.id}
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: `1.5px solid ${axis.badgeBg === '#fce8e6' ? '#fecaca' : '#e2e8f0'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
                            Axis {axis.number} · {axis.titleEn}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: axis.badgeColor,
                              backgroundColor: axis.badgeBg,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              border: `1px solid ${axis.badgeColor}33`
                            }}
                          >
                            {axis.riskLevel} ({axis.score}/100)
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 650, marginBottom: '6px' }}>
                          Genes: {axis.keyGenes}
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                          {axis.clinicalFindingEn}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                        {axis.proteinTargetEn && (
                          <div style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: 700, marginBottom: '4px' }}>
                            🎯 <strong>Target:</strong> {axis.proteinTargetEn}
                          </div>
                        )}
                        {axis.emotionalEatingProtocolEn && (
                          <div style={{ fontSize: '0.73rem', color: '#7c2d12', lineHeight: 1.4 }}>
                            🧠 <strong>Dopamine Swaps:</strong> {axis.emotionalEatingProtocolEn}
                          </div>
                        )}
                        {axis.criticalWarningEn && (
                          <div style={{ fontSize: '0.73rem', color: '#991b1b', fontWeight: 750, lineHeight: 1.4 }}>
                            ⚠️ {axis.criticalWarningEn}
                          </div>
                        )}
                        {axis.criticalToxicityAlertEn && (
                          <div style={{ fontSize: '0.73rem', color: '#991b1b', fontWeight: 750, lineHeight: 1.4 }}>
                            🚫 {axis.criticalToxicityAlertEn}
                          </div>
                        )}
                        {axis.caffeineCutoffEn && (
                          <div style={{ fontSize: '0.73rem', color: '#92400e', fontWeight: 750, lineHeight: 1.4 }}>
                            ☕ {axis.caffeineCutoffEn}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── The 3-Step Genetic Plate Sequencing Protocol ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #99f6e4', padding: '1.75rem', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '3px 9px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  Biochemical Eating Order
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488' }}>
                  ⚡ Blunts glucose spikes by up to 45%
                </span>
              </div>
              <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 6px 0' }}>
                {clinicalProfile.plateSequencing.titleEn}
              </h3>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                {clinicalProfile.plateSequencing.impactEn}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {clinicalProfile.plateSequencing.steps.map((st) => (
                  <div key={st.step} style={{ backgroundColor: '#f0fdfa', border: '1px solid #5eead4', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 850 }}>
                        {st.step}
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#0f766e' }}>{st.titleEn}</strong>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.80rem', color: '#134e4a', lineHeight: 1.5 }}>
                      <strong>Examples:</strong> {st.examplesEn}
                    </p>
                    <div style={{ fontSize: '0.74rem', color: '#0f766e', borderTop: '1px solid #ccfbf1', paddingTop: '6px' }}>
                      <em>Biochemical rationale:</em> {st.rationaleEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Food Traffic Light Matrix (Superfoods vs Caution vs Strict Exclusions) ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    FOOD AS MEDICINE MATRIX
                  </span>
                  <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                    Personalized Food Traffic Light
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Categorized by functional impact on your genetic variants. Hand this directly to your clinical nutritionist or catering chef.
                  </p>
                </div>

                {/* Filter chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'green', label: '🟢 Superfoods (8)' },
                    { id: 'yellow', label: '🟡 Caution (4)' },
                    { id: 'red', label: '🔴 Strict Exclusions (5)' }
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      onClick={() => setFoodTrafficFilter(flt.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.76rem',
                        fontWeight: 750,
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: foodTrafficFilter === flt.id ? '#0284c7' : '#cbd5e1',
                        backgroundColor: foodTrafficFilter === flt.id ? '#e0f2fe' : '#ffffff',
                        color: foodTrafficFilter === flt.id ? '#0369a1' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {flt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Traffic Light Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Green Superfoods */}
                {(foodTrafficFilter === 'all' || foodTrafficFilter === 'green') && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🟢</span>
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#166534', fontWeight: 850, display: 'block' }}>
                          MEDICINE SUPERFOODS (Always Include)
                        </strong>
                        <span style={{ fontSize: '0.70rem', color: '#15803d' }}>Genetically targeted therapeutic food allies</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {clinicalProfile.foodTrafficLight.greenSuperfoods.map((food, idx) => (
                        <div key={idx} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#14532d' }}>{food.name}</strong>
                            <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '3px' }}>
                              {food.geneTarget}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                            <em>Active:</em> {food.activeCompound}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '4px', lineHeight: 1.4 }}>
                            {food.benefitEn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yellow Caution */}
                {(foodTrafficFilter === 'all' || foodTrafficFilter === 'yellow') && (
                  <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🟡</span>
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#92400e', fontWeight: 850, display: 'block' }}>
                          CONSUME WITH CAUTION (Portion &amp; Time Rules)
                        </strong>
                        <span style={{ fontSize: '0.70rem', color: '#b45309' }}>Requires specific timing or culinary preparation</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {clinicalProfile.foodTrafficLight.yellowCaution.map((item, idx) => (
                        <div key={idx} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fef08a' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#78350f' }}>{item.name}</strong>
                            <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '3px' }}>
                              {item.geneTarget}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#92400e', marginTop: '4px', lineHeight: 1.4 }}>
                            <strong>Rule:</strong> {item.conditionEn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Strict Exclusions */}
                {(foodTrafficFilter === 'all' || foodTrafficFilter === 'red') && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🔴</span>
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#991b1b', fontWeight: 850, display: 'block' }}>
                          STRICT EXCLUSIONS (Genetically Harmful)
                        </strong>
                        <span style={{ fontSize: '0.70rem', color: '#dc2626' }}>Strictly contraindicate or eliminate from diet</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {clinicalProfile.foodTrafficLight.redStrictExclusions.map((item, idx) => (
                        <div key={idx} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#7f1d1d' }}>{item.name}</strong>
                            <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '3px' }}>
                              {item.geneTarget}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '4px', lineHeight: 1.4 }}>
                            <strong>Hazard:</strong> {item.hazardEn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Circadian Chrono-Nutrition (24h Routine Timeline) ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CIRCADIAN CHRONOBIOLOGY TIMELINE
                </span>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                  Your 24-Hour Metabolic Routine
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Aligning your nutrient intake with the biological clock (CLOCK gene) to synchronize cortisol, leptin, and insulin sensitivity.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {clinicalProfile.circadianChronoSchedule.map((phase, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: phase.time.includes('11:00 AM') ? '#fef2f2' : phase.time.includes('05:30') ? '#fffbeb' : '#f8fafc',
                      border: `1.5px solid ${phase.time.includes('11:00 AM') ? '#fecaca' : phase.time.includes('05:30') ? '#fde68a' : '#cbd5e1'}`,
                      borderRadius: '10px',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7' }}>
                        {phase.time}
                      </span>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#ffffff', color: '#475569', padding: '2px 6px', borderRadius: '3px', border: '1px solid #e2e8f0' }}>
                        {phase.target}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                      {phase.phaseEn}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                      {phase.actionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 7-Day Precision Meal Plan (Interactive Day-by-Day Selector) ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #bae6fd', padding: '1.75rem', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    CLINICAL DIETARY PRESCRIPTION
                  </span>
                  <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                    7-Day Precision Meal Plan
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Gastronomic recipes tailored to Doha / GCC ingredients, optimized for insulin stabilization, methylation, and satiety.
                  </p>
                </div>

                {/* Day selector pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {clinicalProfile.sevenDayMealPlan.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDay(d.day)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.80rem',
                        fontWeight: 800,
                        border: '1px solid',
                        borderColor: selectedDay === d.day ? '#0284c7' : '#cbd5e1',
                        backgroundColor: selectedDay === d.day ? '#0284c7' : '#ffffff',
                        color: selectedDay === d.day ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        boxShadow: selectedDay === d.day ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none'
                      }}
                    >
                      {d.dayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Day Card */}
              {(() => {
                const dayPlan = clinicalProfile.sevenDayMealPlan.find(d => d.day === selectedDay) || clinicalProfile.sevenDayMealPlan[0];
                return (
                  <div style={{ backgroundColor: '#f0f9ff', border: '1.5px solid #7dd3fc', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                          Day {dayPlan.day} · {dayPlan.dayName}
                        </span>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#003666', margin: '2px 0 0 0' }}>
                          {dayPlan.themeEn}
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                        Plate Sequencing Enforced
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                      {/* Breakfast */}
                      <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 800, fontSize: '0.80rem', marginBottom: '4px' }}>
                          <Sun size={15} />
                          <span>Breakfast (High Protein Ignition)</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
                          {dayPlan.breakfast}
                        </p>
                      </div>

                      {/* Lunch */}
                      <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 800, fontSize: '0.80rem', marginBottom: '4px' }}>
                          <Utensils size={15} />
                          <span>Lunch (Peak Digestion &amp; Sequencing)</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
                          {dayPlan.lunch}
                        </p>
                      </div>

                      {/* PM Snack */}
                      <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 800, fontSize: '0.80rem', marginBottom: '4px' }}>
                          <Flame size={15} />
                          <span>PM Snack (Dopamine Anti-Craving)</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
                          {dayPlan.snack}
                        </p>
                      </div>

                      {/* Dinner */}
                      <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: 800, fontSize: '0.80rem', marginBottom: '4px' }}>
                          <Moon size={15} />
                          <span>Dinner (Light Cellular Repair)</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
                          {dayPlan.dinner}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #bae6fd', fontSize: '0.76rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🫖 <strong>Bedtime Restorative Infusion:</strong> {dayPlan.bedtimeTea}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── Minimal Targeted Co-Factors (Food-First Complement) ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  TARGETED CO-FACTORS (SUPPORTING CAST, NOT LEAD ACTOR)
                </span>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                  Minimal Targeted Co-Factors
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Only 3 precision cofactors that genetic polymorphisms prevent your cells from rapidly generating from diet alone.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {clinicalProfile.minimalTargetedCoFactors.map((co, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '3px' }}>
                          Cofactor {idx + 1}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 750, color: '#0d9488' }}>
                          {co.dose}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {co.nutrient}
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: 650, marginBottom: '6px' }}>
                        🥗 <strong>Food Synergy:</strong> {co.foodSynergy}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                        {co.rationaleEn}
                      </p>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#64748b' }}>
                      ⏰ <strong>Timing:</strong> {co.timing}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Interactive Supermarket Grocery Checklist (GCC / Doha) ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #ccfbf1', padding: '1.75rem', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      Mobile-Ready Shopping Guide
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488' }}>
                      🛒 Monoprix, Lulu &amp; Carrefour Qatar Ready
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                    Patient Supermarket Grocery Checklist
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Tap each item on your phone as you place it into your supermarket shopping cart.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 750, color: '#0f766e' }}>
                  ✓ {Object.values(checkedGroceryItems).filter(Boolean).length} items checked
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {clinicalProfile.supermarketGroceryList.map((cat, cIdx) => (
                  <div key={cIdx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                      <strong style={{ fontSize: '0.86rem', color: '#003666', fontWeight: 850 }}>
                        {cat.category}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {cat.items.map((item, iIdx) => {
                        const key = `${cIdx}_${iIdx}`;
                        const isChecked = !!checkedGroceryItems[key];
                        return (
                          <label
                            key={iIdx}
                            onClick={() => toggleGroceryItem(key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.80rem',
                              color: isChecked ? '#94a3b8' : '#334155',
                              textDecoration: isChecked ? 'line-through' : 'none',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              backgroundColor: isChecked ? '#f1f5f9' : 'transparent',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Clinical Nutritionist Consultation Guide ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CLINICAL PROTOCOL FOR PRACTITIONERS
                </span>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                  Nutritionist Consultation Directives &amp; Action Plan
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Directives to validate genetic findings during patient consultation and guide the 8-week phased intervention.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {/* Screening questions */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 850, color: '#003666', margin: '0 0 10px 0' }}>
                    🔍 Key Intake Screening Questions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {clinicalProfile.nutritionistConsultationDirectives.intakeQuestions.map((q, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, borderLeft: '3px solid #0284c7', paddingLeft: '8px' }}>
                        <div style={{ fontWeight: 750, color: '#0f172a' }}>{idx + 1}. &quot;{q.questionEn}&quot;</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                          Rationale: {q.rationale}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8-Week roadmap */}
                <div style={{ backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 850, color: '#0f766e', margin: '0 0 10px 0' }}>
                    📅 8-Week Phased Intervention Roadmap
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {clinicalProfile.nutritionistConsultationDirectives.actionPlanPhases.map((ph, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', color: '#134e4a', lineHeight: 1.5, borderLeft: '3px solid #0d9488', paddingLeft: '8px' }}>
                        <div style={{ fontWeight: 800, color: '#0f766e' }}>{ph.phase}</div>
                        <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '2px' }}>
                          {ph.milestone}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

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
                        ✓ Quality Standard:
                      </span>
                      <div style={{ color: '#0f172a', fontWeight: 650 }}>
                        Certified Pharmaceutical Grade (cGMP)
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
                <strong style={{ fontSize: '0.88rem', color: '#003666' }}>Clinical Genomic Prescription Dossier:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  Includes 3-Page Clinical Rx Guide plus the complete unedited 55-page certified 24Genetics laboratory report.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
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
                  <span>Download Full Clinical Dossier (59 Pgs)</span>
                </a>

                <a
                  href={pdfDownloadUrlLight}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#0d9488',
                    textDecoration: 'underline',
                    paddingLeft: '4px'
                  }}
                >
                  ⚡ Download Executive 3-Page Rx Only (Light)
                </a>
              </div>
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
                {/* Modality A Radio Card */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedModality('modalityA')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedModality('modalityA'); } }}
                  style={{
                    backgroundColor: selectedModality === 'modalityA' ? '#f0fdfa' : '#ffffff',
                    border: selectedModality === 'modalityA' ? '2px solid #0d9488' : '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedModality === 'modalityA' ? '0 4px 12px rgba(13, 148, 136, 0.15)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>
                      MODALITY A · CORE 2-CAPSULE REGIMEN
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: selectedModality === 'modalityA' ? '#0d9488' : '#f1f5f9',
                      color: selectedModality === 'modalityA' ? '#ffffff' : '#64748b'
                    }}>
                      {selectedModality === 'modalityA' ? '✓ SELECTED DIRECTIVE' : 'CLICK TO SELECT'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666', marginBottom: '4px' }}>
                    Essential Methylation &amp; Sleep Foundation (2 Caps / Day: B + C)
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                    Focuses on the primary genetic bottlenecks (MTHFR, VDR, COMT). Reduces preparation cost by ~30% and pill burden. Best if you do not suffer from severe gut dysbiosis.
                  </p>
                </div>

                {/* Modality B Radio Card */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedModality('modalityB')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedModality('modalityB'); } }}
                  style={{
                    backgroundColor: selectedModality === 'modalityB' ? '#eff6ff' : '#ffffff',
                    border: selectedModality === 'modalityB' ? '2px solid #1d4ed8' : '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedModality === 'modalityB' ? '0 4px 12px rgba(29, 78, 216, 0.15)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                      MODALITY B · FULL 3-CAPSULE REGIMEN
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: selectedModality === 'modalityB' ? '#1d4ed8' : '#f1f5f9',
                      color: selectedModality === 'modalityB' ? '#ffffff' : '#64748b'
                    }}>
                      {selectedModality === 'modalityB' ? '✓ SELECTED DIRECTIVE' : 'CLICK TO SELECT'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666', marginBottom: '4px' }}>
                    Comprehensive 360° Chronobiology (3 Caps / Day: A + B + C)
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                    Adds Morning Capsule A (Enteric DRcaps® Probiotics &amp; Glutamine) for tight-junction repair, lactose intolerance mucosal shield, and full cellular longevity.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Distinct Capsules with Pharmacy Batch Math */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {THREE_CAPSULE_PROTOCOL.map((capsule, cIdx) => {
                const isCapsuleMuted = selectedModality === 'modalityA' && cIdx === 0;
                const isCapsuleActiveA = selectedModality === 'modalityA' && (cIdx === 1 || cIdx === 2);
                const isCapsuleActiveB = selectedModality === 'modalityB';

                return (
                <div
                  key={capsule.capsuleId}
                  style={{
                    backgroundColor: isCapsuleMuted ? '#f8fafc' : '#ffffff',
                    borderRadius: '10px',
                    border: isCapsuleMuted
                      ? '1.5px dashed #cbd5e1'
                      : isCapsuleActiveA
                        ? '2px solid #0d9488'
                        : '2px solid #1d4ed8',
                    padding: '1.5rem',
                    opacity: isCapsuleMuted ? 0.55 : 1,
                    filter: isCapsuleMuted ? 'grayscale(0.5)' : 'none',
                    transition: 'all 0.25s ease',
                    boxShadow: isCapsuleMuted
                      ? 'none'
                      : '0 4px 12px rgba(0, 54, 102, 0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: isCapsuleMuted ? '#94a3b8' : (cIdx === 0 ? '#0d9488' : (cIdx === 1 ? '#003666' : '#1e3a8a')),
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          FORMULATION #{cIdx + 1}
                        </span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 850, color: isCapsuleMuted ? '#64748b' : '#003666', margin: 0 }}>
                          {capsule.nameEn}
                        </h4>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: isCapsuleMuted ? '#94a3b8' : '#0d9488', fontWeight: 750 }}>
                        ⏰ Posology: {capsule.timingEn}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 800,
                        backgroundColor: isCapsuleMuted ? '#f1f5f9' : (selectedModality === 'modalityA' ? '#f0fdfa' : '#eff6ff'),
                        color: isCapsuleMuted ? '#64748b' : (selectedModality === 'modalityA' ? '#0f766e' : '#1d4ed8'),
                        border: isCapsuleMuted ? '1px solid #cbd5e1' : (selectedModality === 'modalityA' ? '1px solid #99f6e4' : '1px solid #bfdbfe'),
                        padding: '3px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        {isCapsuleMuted
                          ? '⚪ Muted in Modality A (Core 2-Capsule)'
                          : selectedModality === 'modalityA'
                            ? '✓ Included in Modality A (2-Capsule Core)'
                            : '✓ Included in Modality B (3-Capsule Full)'}
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
              );
            })}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
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
                  <span>Print Full Compounding Dossier (59 Pgs)</span>
                </a>

                <a
                  href={pdfDownloadUrlLight}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#003666',
                    textDecoration: 'underline',
                    paddingLeft: '4px'
                  }}
                >
                  ⚡ Print Executive Order Only (3 Pages · Fast)
                </a>
              </div>
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

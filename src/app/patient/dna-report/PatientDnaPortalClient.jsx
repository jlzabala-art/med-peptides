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
  CheckCircle2,
  Utensils,
  Clock,
  Sun,
  Moon,
  MessageSquare
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
  const [activeSection, setActiveSection] = useState('mealplan');
  const [selectedModality, setSelectedModality] = useState('modalityB');
  const [copiedLink, setCopiedLink] = useState(false);

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
              title="Download full 58-page dossier including executive meal plan guide, 24h routine, and complete original 24Genetics report"
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
              <span>Meal Plan Dossier (58 Pgs)</span>
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
            <span>🥗 Patient Meal Plan &amp; Daily Routine (Easy Guide)</span>
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

        {/* ── SECTION 0: PATIENT MEAL PLAN & EASY SUPPLEMENT ROUTINE ── */}
        {activeSection === 'mealplan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Welcome Banner */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #bae6fd', padding: '1.75rem', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '3px 9px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      Meal Plan &amp; Daily Routine Edition
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: '4px' }}>
                      ✓ Simplified for Daily Life
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#003666', margin: '4px 0 6px 0' }}>
                    Your Personalized Meal Plan &amp; Supplement Routine
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.90rem', color: '#475569', lineHeight: 1.6, maxWidth: '780px' }}>
                    How to customize your catering meal subscription, pick your dishes, and take your supplements in total sync with your day—without confusing medical jargon.
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
                    <span>Download Full Dossier (58 Pgs: Guide + 24Genetics)</span>
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
                    ⚡ Download 2-Page Executive Guide Only (Light · Kitchen Print)
                  </a>
                </div>
              </div>

              {/* 4 Plain-English DNA Findings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#003666', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <Sparkles size={14} color="#0284c7" />
                    <span>Energy &amp; Mental Focus</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                    Your cells require active B-vitamins (Methylfolate) for non-stop daily stamina. Avoid white flour fortified with synthetic folic acid.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#003666', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <AlertTriangle size={14} color="#b45309" />
                    <span>Lactose Sensitivity</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                    Your genetics show low lactase enzyme. Select 100% dairy-free meals in your meal plan to eliminate bloating and sluggishness.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#003666', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <Sun size={14} color="#d97706" />
                    <span>Vitamin D + Healthy Fats</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                    Your Vitamin D receptors need support. Always take your Vitamin D with breakfast fats (eggs, avocado, olive oil) for real absorption.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#003666', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <Coffee size={14} color="#78350f" />
                    <span>Slow Caffeine Clearance</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                    Your liver metabolizes caffeine slowly. Drink your last coffee before 2:00 PM to protect nighttime restorative deep sleep.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Meal Plan Traffic Light (What to order in catering) ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CATERING MENU SELECTION GUIDE
                </span>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                  Your Meal Plan Traffic Light
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Show this list to your meal prep provider or use it when selecting your weekly dishes in the app.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
                {/* Green Card */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>🟢</span>
                    <strong style={{ fontSize: '0.92rem', color: '#166534', fontWeight: 850 }}>
                      ALWAYS ORDER (DNA Favorites)
                    </strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#14532d', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Lean &amp; Marine Proteins:</strong> Wild salmon, sea bass, lean poultry, grass-fed beef, pastured eggs.</li>
                    <li><strong>Dark Greens:</strong> Spinach, arugula, kale, broccoli, zucchini, asparagus.</li>
                    <li><strong>Healthy Fats:</strong> Extra virgin olive oil, avocado, chia seeds, walnuts, pumpkin seeds.</li>
                    <li><strong>Prebiotic Carbs:</strong> Quinoa, basmati rice, sweet potatoes, cooked &amp; cooled potatoes.</li>
                  </ul>
                </div>

                {/* Yellow Card */}
                <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>🟡</span>
                    <strong style={{ fontSize: '0.92rem', color: '#92400e', fontWeight: 850 }}>
                      ENJOY IN MODERATION (Portion Control)
                    </strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Carbohydrate Cap:</strong> Keep net carbs under 40g per meal to avoid post-lunch sleepiness and glucose spikes.</li>
                    <li><strong>Soaked Legumes:</strong> Lentils, chickpeas, edamame (well-soaked to reduce lectins).</li>
                    <li><strong>Low-Glycemic Fruits:</strong> Blueberries, blackberries, raspberries, green apples.</li>
                    <li><strong>Red Meat:</strong> Cap at 2–3 times per week maximum.</li>
                  </ul>
                </div>

                {/* Red Card */}
                <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔴</span>
                    <strong style={{ fontSize: '0.92rem', color: '#991b1b', fontWeight: 850 }}>
                      EXCLUDE FROM YOUR CATERING
                    </strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Dairy &amp; Creams:</strong> Cow&apos;s milk, heavy cream, parmesan/cheddar cheeses, creamy bechamel sauces.</li>
                    <li><strong>Industrial Seed Oils:</strong> Refined soybean, corn, sunflower, and commercial palm oil.</li>
                    <li><strong>Refined Grains:</strong> White baguette, pastries, commercial wraps, sweetened cereals.</li>
                    <li><strong>Liquid Sugars:</strong> Commercial boxed fruit juices, soft drinks, flavored energy drinks.</li>
                  </ul>
                </div>
              </div>

              {/* The Golden Plate Sequencing Rule Box */}
              <div style={{ marginTop: '1.5rem', backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '2rem' }}>💡</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#0f766e', display: 'block', marginBottom: '2px' }}>
                    The Golden Plate Sequencing Rule (Eat in This Exact Order):
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#134e4a', lineHeight: 1.5 }}>
                    <strong>1º Vegetables &amp; Fiber first</strong>  →  <strong>2º Protein &amp; Fats second</strong>  →  <strong>3º Rice or Potatoes LAST.</strong>
                    <br />
                    <em>Why it matters:</em> This creates a protective fiber mesh in your stomach, lowering blood sugar spikes by up to 45% and eliminating post-lunch sluggishness.
                  </p>
                </div>
              </div>
            </div>

            {/* ── 24-Hour Routine with Your Meals ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  DAILY CHRONOBIOLOGY TIMELINE
                </span>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                  Your 24-Hour Routine: Synchronized With Your Meals
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  No complicated alarms. Just pair each nutrient with the right meal of your day.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                {/* Morning */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 800, fontSize: '0.82rem', marginBottom: '6px' }}>
                    <Sun size={16} />
                    <span>1. Upon Waking (Empty Stomach)</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Probiotic Gut Shield
                  </h4>
                  <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.5, marginBottom: '8px' }}>
                    Drink a full glass of room-temperature water. Take <strong>Capsule A (Probiotic DRcaps®)</strong>.
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                    <em>Why:</em> Live cultures travel through an empty stomach without acid interference to repair your gut flora.
                  </div>
                </div>

                {/* Breakfast */}
                <div style={{ backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 800, fontSize: '0.82rem', marginBottom: '6px' }}>
                    <Utensils size={16} />
                    <span>2. With Your Breakfast</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Energy &amp; Vitamin D3/K2
                  </h4>
                  <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.5, marginBottom: '8px' }}>
                    Take <strong>Capsule B (Active Folate + B-Complex + D3/K2)</strong> with your meal.
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#0f766e', borderTop: '1px solid #ccfbf1', paddingTop: '6px' }}>
                    <em>Why:</em> Must be taken with dietary fats (eggs, olive oil, avocado) so your body can absorb Vitamin D.
                  </div>
                </div>

                {/* Lunch / Dinner */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 800, fontSize: '0.82rem', marginBottom: '6px' }}>
                    <Clock size={16} />
                    <span>3. With Main Lunch / Dinner</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Plate Sequencing &amp; Hydration
                  </h4>
                  <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.5, marginBottom: '8px' }}>
                    Follow the 1-2-3 plate order. Optional: 1 glass of water with fiber sachet (Psyllium).
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                    <em>Why:</em> Keeps your glucose curve flat and eliminates the 3:00 PM energy slump.
                  </div>
                </div>

                {/* Bedtime */}
                <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: 800, fontSize: '0.82rem', marginBottom: '6px' }}>
                    <Moon size={16} />
                    <span>4. 30–60 Min Before Bed</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Deep Sleep &amp; Muscle Reset
                  </h4>
                  <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.5, marginBottom: '8px' }}>
                    Take <strong>Capsule C (2 capsules of Magnesium + Theanine)</strong> with water.
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#1d4ed8', borderTop: '1px solid #dbeafe', paddingTop: '6px' }}>
                    <em>Why:</em> Shuts off racing thoughts, relaxes neuromuscular tension, and promotes restorative REM sleep.
                  </div>
                </div>
              </div>
            </div>

            {/* ── Simplified 3-Tier Budget Decision Packs ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  FLEXIBLE PATIENT BUDGET TIERS
                </span>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                  Choose Your Supplement Pack (Buy Only What You Need)
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  You do not need to buy all 5 bottles. Pick the tier that best matches your health goals and budget.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
                {/* Pack 1 */}
                <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      2 BOTTLES · MINIMUM BASE
                    </span>
                    <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#0f172a', margin: '8px 0 4px 0' }}>
                      Pack 1: Essential Core
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: 700, margin: '0 0 10px 0' }}>
                      Covers 80% of Core Genetic Risk
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.80rem', color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>☀️ <strong>Vitamin D3 + K2 (4,000 IU)</strong></li>
                      <li>⚡ <strong>Active Folate (L-5-MTHF 800 mcg)</strong></li>
                    </ul>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                    <em>Ideal for:</em> Starting your personalized routine with the two highest-impact nutrients without extra cost.
                  </div>
                </div>

                {/* Pack 2 (Recommended) */}
                <div style={{ backgroundColor: '#f0fdfa', border: '2px solid #0d9488', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.12)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#0d9488', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        ⭐ MOST POPULAR · 4 BOTTLES
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#003666', margin: '8px 0 4px 0' }}>
                      Pack 2: Performance &amp; Deep Sleep
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#0f766e', fontWeight: 700, margin: '0 0 10px 0' }}>
                      Daytime Energy + Restful Recovery
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.80rem', color: '#134e4a', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>☀️ <strong>Vitamin D3 + K2</strong> &amp; ⚡ <strong>Active Folate</strong></li>
                      <li>🌙 <strong>Chelated Magnesium + Theanine</strong> (Bedtime)</li>
                      <li>🔋 <strong>Methylated B-Complex (B12 + B6)</strong></li>
                    </ul>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #ccfbf1', fontSize: '0.75rem', color: '#0f766e' }}>
                    <em>Ideal for:</em> Busy professionals with high cognitive demand, stress, or trouble falling asleep.
                  </div>
                </div>

                {/* Pack 3 */}
                <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      5 BOTTLES · COMPLETE OPTIMIZATION
                    </span>
                    <h4 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#0f172a', margin: '8px 0 4px 0' }}>
                      Pack 3: Total Digestion
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700, margin: '0 0 10px 0' }}>
                      Complete Microbiome &amp; Mucosal Defense
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.80rem', color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>All 4 nutrients from Pack 2</li>
                      <li>🛡️ <strong>Targeted Enteric Probiotics (LGG + BB-12)</strong></li>
                    </ul>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                    <em>Ideal for:</em> Anyone experiencing bloating, gas, food sensitivities, or lactose discomfort.
                  </div>
                </div>
              </div>
            </div>

            {/* ── Two Shopping Options: Local Doha Pharmacy vs All-In-One Compounding ── */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  HOW DO YOU PREFER TO TAKE IT?
                </span>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
                  Choose Your Preferred Shopping Format
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {/* Local Pharmacy */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏪</span>
                    <strong style={{ fontSize: '1.0rem', color: '#0f172a' }}>Option A: Local Doha Pharmacies (OTC Bottles)</strong>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                    Buy commercial pharmaceutical-grade bottles at local pharmacies. You take 4 to 6 pills daily from multiple separate containers.
                  </p>
                  <button
                    onClick={() => setActiveSection('commercial')}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      color: '#0d9488',
                      border: '1px solid #0d9488',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    View Active Chemical Forms Guide →
                  </button>
                </div>

                {/* Custom Compounding */}
                <div style={{ backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>💊</span>
                    <strong style={{ fontSize: '1.0rem', color: '#003666' }}>Option B: Custom &quot;All-in-One&quot; Compounding (Recommended)</strong>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#134e4a', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                    Our partner compounding pharmacy combines all your pure active nutrients into just 3 synchronized daily capsules labeled with your name. 100% lactose-free, zero filler bottles in your kitchen.
                  </p>
                  <button
                    onClick={() => setActiveSection('prescription')}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      backgroundColor: '#003666',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    View Official Compounding Order →
                  </button>
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

'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Share2,
  Check,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  Utensils,
  Pill,
  Sparkles,
  ExternalLink,
  Printer,
  Calendar,
  ListChecks,
  ShoppingBag,
  HeartPulse,
  Activity,
  ArrowRight
} from 'lucide-react';
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import {
  evaluateNutrigenomicProfile,
  THREE_CAPSULE_PROTOCOL,
  TREATMENT_CYCLE,
  GALENIC_COMPATIBILITY_ANALYSIS,
  CLINICAL_PILLARS,
  PRESCRIPTION_COMPARISON
} from '@/data/genomics/clinicalNutrigenomicEngine';

// Modular Subcomponents
import DnaReportRoadmap from '@/components/patient/dna/DnaReportRoadmap';
import DnaPrioritiesSection from '@/components/patient/dna/DnaPrioritiesSection';
import DnaFoodMatrixSection from '@/components/patient/dna/DnaFoodMatrixSection';
import DnaWeeklyMealPlan from '@/components/patient/dna/DnaWeeklyMealPlan';
import DnaGroceryChecklist from '@/components/patient/dna/DnaGroceryChecklist';
import DnaCompoundingPrescription from '@/components/patient/dna/DnaCompoundingPrescription';
import DnaLocalPharmacyOptionA from '@/components/patient/dna/DnaLocalPharmacyOptionA';
import DnaDownloadsSection from '@/components/patient/dna/DnaDownloadsSection';

const CHAPTERS = [
  { id: 'priorities', label: '1. DNA Priorities', icon: '🧬', subtitle: 'Metabolism & 5 Clinical Axes' },
  { id: 'foods', label: '2. 17 Food Families', icon: '🥗', subtitle: '116 Foods Classified (🟢🟡🔴)' },
  { id: 'mealplan', label: '3. 7-Day Meal Plan', icon: '📅', subtitle: 'Daily Menus & 24h Routine' },
  { id: 'grocery', label: '4. Grocery Checklist', icon: '🛒', subtitle: 'Monoprix / Lulu Qatar Ready' },
  { id: 'prescription', label: '5. Pharmacy Prescription', icon: '💊', subtitle: 'Compounded vs Local OTC' },
  { id: 'downloads', label: '6. Official PDF Dossiers', icon: '📥', subtitle: '59-Page CE-IVD Documents' }
];

export default function PatientDnaPortalClient({
  initialPatientName,
  initialSampleCode,
  initialClinic,
  initialDoctor,
  initialProfile
}) {
  const [patientName] = useState(initialPatientName || 'Hossam Ahmed');
  const [sampleCode] = useState(initialSampleCode || '24G-QA-90421');
  const [clinic] = useState(initialClinic || 'Ryhanh Medical Company · Doha');
  const [activeChapter, setActiveChapter] = useState('priorities');
  const [prescriptionModality, setPrescriptionModality] = useState('modalityB'); // 'modalityB' (Compounded) | 'modalityA' (Local)
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic Clinical Profile Inference (Fast RSC Handoff - Golden Rule #21)
  const clinicalProfile = useMemo(() => {
    if (
      initialProfile &&
      (initialProfile.patient?.name === patientName || initialProfile.patientName === patientName) &&
      (initialProfile.patient?.sampleCode === sampleCode || initialProfile.sampleCode === sampleCode)
    ) {
      return initialProfile;
    }
    return evaluateNutrigenomicProfile({
      patientName,
      sampleCode,
      clinic,
      doctor: initialDoctor
    });
  }, [patientName, sampleCode, clinic, initialProfile, initialDoctor]);

  // LocalStorage-backed Grocery Checklist
  const groceryStorageKey = `atlas_grocery_${sampleCode || 'default'}`;
  const [checkedGroceryItems, setCheckedGroceryItems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(`atlas_grocery_${sampleCode || 'default'}`);
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore storage errors
      }
    }
    return {};
  });

  const toggleGroceryItem = (itemKey) => {
    setCheckedGroceryItems((prev) => {
      const next = {
        ...prev,
        [itemKey]: !prev[itemKey]
      };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(groceryStorageKey, JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
      }
      return next;
    });
  };

  const resetGroceryChecklist = () => {
    setCheckedGroceryItems({});
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(groceryStorageKey);
      } catch {
        // Ignore storage errors
      }
    }
  };

  // Official PDF download URLs
  const pdfDownloadUrl = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&modality=${prescriptionModality}&includeOriginal=true`;
  const pdfDownloadUrlLight = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&modality=${prescriptionModality}&full=false`;
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
      const text =
        lang === 'es'
          ? `Hola ${patientName}, aquí tienes tu Dossier Genómico Personalizado: ${url}\n\nBasado estrictamente en tu secuenciación de 24Genetics, el equipo clínico de Atlas ha desarrollado las hojas ejecutivas iniciales con tu plan nutricional y suplementación. Al ser un equipo local basado en UAE, cuentan con plena flexibilidad para realizar cualquier adaptación a medida de tus requerimientos.`
          : `Hello ${patientName}, here is your Personalized Genomic Dossier: ${url}\n\nBased directly on your 24Genetics sequencing report, the Atlas clinical team has developed the executive opening guides for your meal plan and targeted supplementation. As a local UAE-based team, Atlas offers complete flexibility to make tailored adaptations according to your specific requirements.`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleChefWhatsAppShare = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const lightPdfFullUrl = `${origin}${mealPlanPdfUrlLight}`;
      const text =
        `👨‍🍳 *7-Day Personalized Menu & Kitchen Guide for ${patientName}*\n\n` +
        `*3 Simple Kitchen Rules for Every Meal:*\n` +
        `1️⃣ *1-2-3 Plate Order:* Serve leafy greens/vegetables first -> protein (fish/poultry/eggs) second -> complex carbs (quinoa/sweet potato/lentils) last.\n` +
        `2️⃣ *Cooking Oils:* Cook exclusively with Extra Virgin Olive Oil (EVOO), Avocado Oil, or Grass-Fed Ghee (no sunflower/corn/canola seed oils).\n` +
        `3️⃣ *Dairy & Flour:* 100% cow-lactose-free (use goat/sheep feta, aged Parmigiano, or almond/coconut milk) and avoid refined white bread/flour.\n\n` +
        `📄 *Download 5-Page Printable Menu & 17-Family Food List (PDF):*\n${lightPdfFullUrl}`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── 1-Click Verified Nominal Welcome Header (Single Clean Clinical Header) ── */}
      <NominalWelcomeBanner
        recipientName={patientName}
        role="patient"
        clinicName={clinic}
        verifiedBy="Atlas Multidisciplinary Clinical Team"
        sessionDuration="90 days"
        storageKey={`atlas_patient_dna_${sampleCode}`}
        lang="en"
      />

      {/* ── Top Clinical Navigation Bar ── */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '10px 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Brand & Patient Identification */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#003666',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '-0.03em'
              }}
            >
              A
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ATLAS HEALTH SERVICES · PRECISION GENOMICS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 850, color: '#0f172a' }}>{patientName}</span>
                <span style={{ fontSize: '0.70rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', fontWeight: 650 }}>
                  #{sampleCode}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleShareClick}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.76rem',
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
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.76rem',
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 13px',
                fontSize: '0.76rem',
                fontWeight: 750,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              <Utensils size={14} />
              <span>Meal Plan (59p)</span>
            </a>

            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 13px',
                fontSize: '0.76rem',
                fontWeight: 750,
                backgroundColor: '#0d9488',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              <Download size={14} />
              <span>Clinical Rx (59p)</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Mobile Horizontal Pill Carousel (Sticky Under Header on Mobile) ── */}
      <div className="dna-mobile-pill-bar">
        {CHAPTERS.map((ch) => {
          const isActive = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChapter(ch.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: isActive ? 800 : 600,
                border: '1px solid',
                borderColor: isActive ? '#003666' : '#e2e8f0',
                backgroundColor: isActive ? '#003666' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: isActive ? '0 2px 6px rgba(0, 54, 102, 0.2)' : 'none'
              }}
            >
              <span>{ch.icon}</span>
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Master Layout (2-Column Grid on Laptop / 1-Column on Mobile) ── */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          width: '100%',
          padding: '1.25rem 1.25rem 5rem 1.25rem',
          flex: 1
        }}
      >
        <div className="dna-portal-grid">
          {/* ── Left Sidebar (Laptop / Desktop >= 1024px) ── */}
          <aside className="dna-desktop-sidebar">
            {/* Patient Clinical Profile Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 7px', borderRadius: '4px' }}>
                  CE-IVD CERTIFIED
                </span>
                <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 750 }}>✓ Active</span>
              </div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '1.05rem', fontWeight: 850, color: '#003666' }}>
                {patientName}
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '8px' }}>
                Specimen ID: <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', color: '#0f172a' }}>{sampleCode}</code>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <strong>Clinic:</strong> {clinic}
              </div>
            </div>

            {/* Vertical Chapter Navigation */}
            <nav
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Report Chapters
              </div>

              {CHAPTERS.map((ch) => {
                const isActive = activeChapter === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChapter(ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#003666' : 'transparent',
                      color: isActive ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{ch.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 800 : 650 }}>
                          {ch.label}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: isActive ? '#93c5fd' : '#64748b', marginTop: '1px' }}>
                          {ch.subtitle}
                        </div>
                      </div>
                    </div>
                    {isActive && <ChevronRight size={16} color="#93c5fd" />}
                  </button>
                );
              })}
            </nav>

            {/* Sticky Sidebar Quick Actions */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                marginTop: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Action Links
              </div>
              <button
                type="button"
                onClick={handleChefWhatsAppShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #86efac',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={15} />
                <span>Send Menu to Chef (WA)</span>
              </button>

              <a
                href={mealPlanPdfUrlLight}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  border: '1px solid #bae6fd',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  textDecoration: 'none'
                }}
              >
                <Printer size={15} />
                <span>Print Kitchen Guide (5p)</span>
              </a>
            </div>
          </aside>

          {/* ── Main Content Canvas (Renders Active Chapter) ── */}
          <main style={{ minWidth: 0 }}>
            {/* Top 15-Second Executive Roadmap */}
            <DnaReportRoadmap
              onSelectSection={(sec) => {
                if (sec === 'mealplan') setActiveChapter('priorities');
                if (sec === 'prescription') setActiveChapter('prescription');
              }}
              onSetFoodViewMode={() => setActiveChapter('foods')}
            />

            {/* Chapter 1: DNA Priorities & Plate Sequencing */}
            {activeChapter === 'priorities' && (
              <DnaPrioritiesSection
                clinicalProfile={clinicalProfile}
                patientName={patientName}
                sampleCode={sampleCode}
              />
            )}

            {/* Chapter 2: Complete Food List & 17-Family Matrix */}
            {activeChapter === 'foods' && (
              <DnaFoodMatrixSection
                clinicalProfile={clinicalProfile}
                initialViewMode="fagron_matrix"
              />
            )}

            {/* Chapter 3: 7-Day Precision Meal Plan & 24h Routine */}
            {activeChapter === 'mealplan' && (
              <DnaWeeklyMealPlan
                clinicalProfile={clinicalProfile}
                onShareChefWhatsApp={handleChefWhatsAppShare}
              />
            )}

            {/* Chapter 4: Supermarket Grocery Checklist */}
            {activeChapter === 'grocery' && (
              <DnaGroceryChecklist
                supermarketGroceryList={clinicalProfile.supermarketGroceryList || []}
                checkedGroceryItems={checkedGroceryItems}
                onToggleItem={toggleGroceryItem}
                onResetList={resetGroceryChecklist}
              />
            )}

            {/* Chapter 5: Pharmacy Prescription (Compounded vs Local OTC) */}
            {activeChapter === 'prescription' && (
              <div>
                {/* Modality Selector Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setPrescriptionModality('modalityB')}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      border: 'none',
                      backgroundColor: prescriptionModality === 'modalityB' ? '#003666' : '#ffffff',
                      color: prescriptionModality === 'modalityB' ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: prescriptionModality === 'modalityB' ? '0 2px 6px rgba(0, 54, 102, 0.2)' : 'none',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: prescriptionModality === 'modalityB' ? '#003666' : '#cbd5e1'
                    }}
                  >
                    💊 Option B: 3-Capsule Custom Pharmacy Order (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrescriptionModality('modalityA')}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      border: 'none',
                      backgroundColor: prescriptionModality === 'modalityA' ? '#0d9488' : '#ffffff',
                      color: prescriptionModality === 'modalityA' ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: prescriptionModality === 'modalityA' ? '0 2px 6px rgba(13, 148, 136, 0.2)' : 'none',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: prescriptionModality === 'modalityA' ? '#0d9488' : '#cbd5e1'
                    }}
                  >
                    🏪 Option A: Local Retail Pharmacy Supplements
                  </button>
                </div>

                {prescriptionModality === 'modalityB' ? (
                  <DnaCompoundingPrescription
                    threeCapsuleProtocol={THREE_CAPSULE_PROTOCOL}
                    treatmentCycle={TREATMENT_CYCLE}
                    onSwitchToOptionA={() => setPrescriptionModality('modalityA')}
                  />
                ) : (
                  <DnaLocalPharmacyOptionA
                    onSwitchToOptionB={() => setPrescriptionModality('modalityB')}
                  />
                )}
              </div>
            )}

            {/* Chapter 6: Official PDF Dossiers & Downloads */}
            {activeChapter === 'downloads' && (
              <DnaDownloadsSection
                mealPlanPdfUrl={mealPlanPdfUrl}
                pdfDownloadUrl={pdfDownloadUrl}
                mealPlanPdfUrlLight={mealPlanPdfUrlLight}
                pdfDownloadUrlLight={pdfDownloadUrlLight}
                patientName={patientName}
                sampleCode={sampleCode}
              />
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar (Fixed to thumb area on phones) ── */}
      <div className="dna-mobile-bottom-bar">
        <button
          type="button"
          onClick={handleChefWhatsAppShare}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '11px 12px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.78rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <MessageSquare size={16} />
          <span>WhatsApp to Chef</span>
        </button>

        <a
          href={mealPlanPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '11px 12px',
            backgroundColor: '#003666',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.78rem',
            textDecoration: 'none',
            textAlign: 'center'
          }}
        >
          <Download size={16} />
          <span>Download PDF (59p)</span>
        </a>
      </div>

      {/* ── Responsive CSS Rules ── */}
      <style jsx>{`
        .dna-portal-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .dna-desktop-sidebar {
          display: none;
        }
        .dna-mobile-pill-bar {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          padding: 10px 1rem;
          position: sticky;
          top: 60px;
          z-index: 35;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          -webkit-overflow-scrolling: touch;
        }
        .dna-mobile-bottom-bar {
          display: flex;
          gap: 10px;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 1rem;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
          z-index: 50;
        }

        @media (min-width: 1024px) {
          .dna-portal-grid {
            grid-template-columns: 280px minmax(0, 1fr);
            gap: 1.75rem;
            align-items: start;
          }
          .dna-desktop-sidebar {
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 76px;
            max-height: calc(100vh - 90px);
            overflow-y: auto;
          }
          .dna-mobile-pill-bar {
            display: none;
          }
          .dna-mobile-bottom-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

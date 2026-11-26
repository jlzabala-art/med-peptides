'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import MobileConnectedStepper from '@/components/ui/MobileConnectedStepper';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Layers,
  CheckCircle2,
  Printer,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Calculator,
  Clock,
  MessageCircle,
  ExternalLink,
  Activity,
  QrCode,
  FileText,
  Stethoscope,
} from '@/lib/icons';

const ACTIVATION_STEPS = [
  {
    id: 'step1',
    timeEn: 'Min 0–5',
    timeEs: 'Min 0–5',
    titleEn: 'Clinic Profile & Currency',
    titleEs: 'Alta de Clínica y Divisa',
    descEn: 'Register your clinic profile and unlock direct B2B clinic pricing in EUR, USD, or AED with Pack ×10 institutional tiers.',
    descEs: 'Activa tu perfil de clínica y desbloquea tarifas directas B2B en EUR, USD o AED con ahorro institucional Pack ×10.',
  },
  {
    id: 'step2',
    timeEn: 'Min 5–10',
    timeEs: 'Min 5–10',
    titleEn: 'Select Protocols & Guides',
    titleEs: 'Selección de Protocolos',
    descEn: 'Access interactive trocar pellet guides, U-100 reconstitution tables, click-dial pen matrices, and PubMed-cited Atlas AI.',
    descEs: 'Accede a guías visuales de trócar/pellets, tablas U-100, dosificación por clics en plumas y Atlas AI con citas PubMed.',
  },
  {
    id: 'step3',
    timeEn: 'Min 10–15',
    timeEs: 'Min 10–15',
    titleEn: 'Issue Digital Rx + Patient QR',
    titleEs: 'Prescripción + QR Paciente',
    descEn: 'Every prescription generates a private patient QR dosing guide (zero commercial pricing shown) with automated BUD refill alerts.',
    descEs: 'Cada receta genera una guía QR privada para el paciente (sin precios) con avisos automáticos de caducidad (BUD) y reposición.',
  },
  {
    id: 'step4',
    timeEn: 'Ongoing',
    timeEs: 'Continuo',
    titleEn: 'Automated Follow-Up & Supply',
    titleEs: 'Seguimiento y Suministro',
    descEn: 'EU GMP cold-chain fulfillment, CoA traceability per batch, and recurring patient adherence without manual WhatsApp chasing.',
    descEs: 'Suministro EU GMP con cadena de frío, CoA por lote y adherencia recurrente del paciente sin seguimiento manual.',
  },
];

export default function DoctorShowcaseClient({
  initialLang = 'en',
  initialClinic = '',
  initialCurrency = 'EUR',
}) {
  const workspace = usePublicWorkspace();
  const [localLang, setLocalLang] = useState(initialLang === 'es' ? 'es' : 'en');
  const lang = workspace?.hydrated ? (workspace?.lang || localLang) : localLang;
  const isEs = lang === 'es';

  const [currency, setCurrency] = useState(
    ['EUR', 'USD', 'AED'].includes(initialCurrency) ? initialCurrency : 'EUR'
  );
  const [clinicName, setClinicName] = useState(initialClinic);
  const [customClinicDraft, setCustomClinicDraft] = useState(initialClinic);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Interactive Clinic Impact & Retention Simulator
  const [activePatients, setActivePatients] = useState(40);
  const [formulasPerPatient, setFormulasPerPatient] = useState(2);

  const sim = useMemo(() => {
    const monthlyRx = activePatients * formulasPerPatient;
    // Avg 8 min saved per Rx on manual dosing sheets, WhatsApp clarifications & reconstitution math
    const hoursSavedMonthly = Math.round((monthlyRx * 8) / 60);
    // Conservative +22% refill retention via automated BUD/QR reminders
    const extraRefillsQuarterly = Math.round(monthlyRx * 3 * 0.22);
    return { monthlyRx, hoursSavedMonthly, extraRefillsQuarterly };
  }, [activePatients, formulasPerPatient]);

  const buildShareUrl = (targetClinic = clinicName) => {
    const base = 'https://www.atlashealth-services.com/partners/doctors';
    const params = new URLSearchParams();
    params.set('lang', isEs ? 'es' : 'en');
    params.set('cur', currency);
    if (targetClinic.trim()) {
      params.set('clinic', targetClinic.trim());
    }
    return `${base}?${params.toString()}`;
  };

  const handleCopyShareLink = async (targetClinic = clinicName) => {
    const url = buildShareUrl(targetClinic);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      toast.success(isEs ? 'Enlace para clínica copiado ✓' : 'Clinic link copied ✓');
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Could not copy link');
    }
  };

  const handleLangSwitch = (nextLang) => {
    setLocalLang(nextLang);
    if (workspace?.setLang) workspace.setLang(nextLang);
  };

  const whatsappHref = useMemo(() => {
    const msg = isEs
      ? `Hola equipo de Atlas Health Services, soy médico/clínica${clinicName ? ` (${clinicName})` : ''} y me gustaría activar acceso profesional y tarifas B2B.`
      : `Hello Atlas Health Services team, I am a physician/clinic${clinicName ? ` (${clinicName})` : ''} interested in activating professional B2B access.`;
    return `https://wa.me/971553561058?text=${encodeURIComponent(msg)}`;
  }, [isEs, clinicName]);

  const mobileStepperItems = ACTIVATION_STEPS.map((s) => ({
    id: s.id,
    kicker: isEs ? s.timeEs : s.timeEn,
    label: isEs ? s.titleEs : s.titleEn,
  }));

  return (
    <div className="atlas-page-bg" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .doc-shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem 5rem;
          box-sizing: border-box;
        }
        .doc-hero {
          background: linear-gradient(135deg, #042f2e 0%, #0d9488 65%, #0f766e 100%);
          color: #ffffff;
          border-radius: 14px;
          padding: 2rem 2.25rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 18px rgba(13, 148, 136, 0.16);
        }
        .doc-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .doc-card {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 12px;
          padding: 1.25rem 1.4rem;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.06);
        }
        .doc-two-col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 1.5rem;
        }
        .doc-three-col {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .doc-four-col {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .doc-mobile-detail {
          display: none;
        }
        .doc-slider {
          width: 100%;
          accent-color: #0d9488;
          cursor: pointer;
        }
        @media (max-width: 900px) {
          .doc-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .doc-two-col,
          .doc-three-col {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 768px) {
          .doc-shell {
            padding: 0.9rem 0.85rem 5.5rem;
            overflow-x: hidden;
          }
          .doc-hero {
            padding: 1.35rem 1.15rem;
          }
          .doc-four-col {
            display: none;
          }
          .doc-mobile-detail {
            display: block;
          }
        }
        @media print {
          .no-print { display: none !important; }
          .doc-shell { padding: 0 !important; max-width: 100% !important; }
          .doc-hero { break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .doc-card { break-inside: avoid; box-shadow: none !important; }
          .doc-four-col { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; }
          .doc-mobile-detail { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <PublicUnifiedHeader
          brandHref="/"
          loginRedirect="/partners/doctors"
          hideCurrencySelector={true}
          hideAccountManager={true}
          breadcrumb={[
            { label: 'Atlas B2B', href: '/' },
            { label: isEs ? 'Portal para Médicos y Clínicas' : 'Physician & Clinic Hub' },
          ]}
        />
      </div>

      <main className="doc-shell">
        {/* ── TOP ACTION BAR (Monochrome GCP Standard) ── */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleLangSwitch('es')}
              className="gcp-btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderColor: isEs ? '#0d9488' : '#dadce0',
                color: isEs ? '#0f766e' : '#5f6368',
                background: isEs ? '#f0fdfa' : '#ffffff',
              }}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => handleLangSwitch('en')}
              className="gcp-btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderColor: !isEs ? '#0d9488' : '#dadce0',
                color: !isEs ? '#0f766e' : '#5f6368',
                background: !isEs ? '#f0fdfa' : '#ffffff',
              }}
            >
              EN
            </button>
            <span style={{ width: '1px', height: '20px', background: '#dadce0', margin: '0 4px' }} />
            {['EUR', 'USD', 'AED'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className="gcp-btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  borderColor: currency === c ? '#0d9488' : '#dadce0',
                  color: currency === c ? '#0f766e' : '#5f6368',
                  background: currency === c ? '#f0fdfa' : '#ffffff',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <Printer size={14} />
              <span>{isEs ? 'Descargar Dossier PDF' : 'Download Dossier PDF'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopyShareLink()}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              {copiedUrl ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />}
              <span>{copiedUrl ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <MessageCircle size={14} />
              <span>{isEs ? 'Solicitar Acceso Médico' : 'Request Physician Access'}</span>
            </a>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="doc-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
            <Stethoscope size={13} />
            <span>
              {clinicName
                ? `ATLAS HEALTH SERVICES × ${clinicName.toUpperCase()}`
                : (isEs ? 'ATLAS HEALTH SERVICES · PLATAFORMA PARA MÉDICOS Y CLÍNICAS' : 'ATLAS HEALTH SERVICES · PHYSICIAN & CLINIC OPERATING SYSTEM')}
            </span>
          </div>

          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.45rem, 3vw, 2.15rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#ffffff' }}>
            {clinicName
              ? (isEs
                  ? `Potencia ${clinicName} con suministro EU GMP, guías clínicas y seguimiento QR al paciente`
                  : `Power ${clinicName} with EU GMP supply, interactive clinical guides & patient QR follow-up`)
              : (isEs
                  ? 'Suministro clínico EU GMP, guías interactivas y adherencia del paciente en una sola plataforma'
                  : 'EU GMP Clinical Supply, Interactive Dosing Guides & Patient Adherence in One Platform')}
          </h1>

          <p style={{ margin: '0 0 18px', fontSize: '0.95rem', lineHeight: 1.55, color: 'rgba(240, 253, 250, 0.92)', maxWidth: '780px' }}>
            {isEs
              ? 'Ahorra horas de consulta cada semana, elimina errores de reconstitución y dosificación, y fideliza a tus pacientes con guías QR privadas (sin precios comerciales) y recordatorios automáticos de renovación.'
              : 'Save hours of clinical admin every week, eliminate reconstitution and dosing errors, and retain patients with private QR dosing guides (zero commercial pricing) and automated refill reminders.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(isEs
              ? ['Pellets EU GMP y Trócares', 'Péptidos 10R y Plumas 3 mL', 'Genómica y Diagnóstico Capilar', 'Guía QR Privada para Paciente']
              : ['EU GMP Pellets & Trocars', '10R Peptides & 3 mL Pens', 'Genomics & Capillary DBS', 'Private Patient QR Guide']
            ).map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={13} color="#99f6e4" />
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── 4 GCP KPI CARDS (Rule #22) ── */}
        <section className="doc-kpi-grid">
          <div className="doc-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Tarifas Activas' : 'Clinical Schedules'}
              </span>
              <Layers size={15} color="#0d9488" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>16+</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'BHRT, Pellets, Péptidos, Fillers, ADN' : 'BHRT, Pellets, Peptides, Fillers, DNA'}
            </div>
          </div>

          <div className="doc-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Privacidad Paciente' : 'Patient Privacy'}
              </span>
              <ShieldCheck size={15} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>0%</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'Exposición de precios B2B en guías QR' : 'B2B price exposure on patient QR guides'}
            </div>
          </div>

          <div className="doc-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Respaldo Científico' : 'Scientific Backing'}
              </span>
              <Activity size={15} color="#1a73e8" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>PubMed</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'Atlas AI + citas indexadas por molécula' : 'Atlas AI + indexed PMID citations'}
            </div>
          </div>

          <div className="doc-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Activación Clínica' : 'Clinic Activation'}
              </span>
              <Clock size={15} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>15 min</div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {isEs ? 'Sin instalaciones ni integraciones IT' : 'Zero software installs or IT setup'}
            </div>
          </div>
        </section>

        {/* ── SIMULATOR + PATIENT QR VALUE ── */}
        <section className="doc-two-col">
          <div className="doc-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Calculator size={18} color="#0d9488" />
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Simulador de Ahorro de Tiempo y Retención' : 'Clinic Time-Saved & Retention Simulator'}
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '0.80rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs
                ? 'Estima el impacto mensual de automatizar guías de dosificación QR, reconstitución y avisos de caducidad (BUD).'
                : 'Estimate monthly impact from automated QR dosing guides, reconstitution tables, and BUD refill reminders.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  <span>{isEs ? 'Pacientes activos / mes en protocolos' : 'Active protocol patients / month'}</span>
                  <span style={{ color: '#0f766e' }}>{activePatients}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={activePatients}
                  onChange={(e) => setActivePatients(Number(e.target.value))}
                  className="doc-slider"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  <span>{isEs ? 'Fórmulas / productos por paciente' : 'Formulas / products per patient'}</span>
                  <span style={{ color: '#0f766e' }}>{formulasPerPatient}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={formulasPerPatient}
                  onChange={(e) => setFormulasPerPatient(Number(e.target.value))}
                  className="doc-slider"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '10px', padding: '12px' }}>
              <div>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>
                  {isEs ? 'Guías QR / Mes' : 'Monthly QR Rx'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#042f2e', marginTop: '2px' }}>
                  {sim.monthlyRx}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>
                  {isEs ? 'Horas Ahorradas' : 'Hours Saved/Mo'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                  ~{sim.hoursSavedMonthly}h
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>
                  {isEs ? 'Reposiciones +BUD' : 'Extra Refills/Q'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                  +{sim.extraRefillsQuarterly}
                </div>
              </div>
            </div>
          </div>

          <div className="doc-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <QrCode size={18} color="#003666" />
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Experiencia Clínica Premium para tu Paciente' : 'Premium Clinical Experience for Your Patients'}
              </h2>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '0.80rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs
                ? 'Cada vial, pluma o fórmula magistral incluye acceso móvil inmediato con instrucciones exactas, sin exponer jamás tu margen ni proveedores.'
                : 'Every vial, pen, or compounded formula links to a mobile dosing card with exact instructions, never exposing clinic pricing or suppliers.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  icon: QrCode,
                  color: '#0d9488',
                  titleEn: 'Exact Dose Card Locked to Prescription',
                  titleEs: 'Guía de Dosis Exacta Bloqueada a Receta',
                  descEn: 'Shows exact sprays, clicks, or U-100 units, storage temperature (2–8 °C), and step-by-step administration.',
                  descEs: 'Muestra pulsaciones, clics o unidades U-100 exactas, conservación (2–8 °C) y técnica paso a paso.',
                },
                {
                  icon: FileText,
                  color: '#1a73e8',
                  titleEn: 'Automated Beyond-Use Date (BUD) Reminders',
                  titleEs: 'Recordatorio Automático de Caducidad (BUD)',
                  descEn: 'Patients save their WhatsApp/email (with country & typo validation) and request refills right on schedule.',
                  descEs: 'El paciente guarda su WhatsApp/email (con validación anti-error) y solicita reposición en fecha.',
                },
                {
                  icon: Sparkles,
                  color: '#7c3aed',
                  titleEn: 'Atlas AI Clinical Co-Pilot',
                  titleEs: 'Co-Piloto Clínico Atlas AI',
                  descEn: 'Instant answers on half-lives, synergies, contraindications, and peer-reviewed PubMed studies.',
                  descEs: 'Respuestas inmediatas sobre vidas medias, sinergias, contraindicaciones y estudios indexados en PubMed.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.titleEn}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Icon size={17} color={item.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        {isEs ? item.titleEs : item.titleEn}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4, marginTop: '2px' }}>
                        {isEs ? item.descEs : item.descEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3 LIVE DEMOS WITHOUT LOGIN ── */}
        <section className="doc-card no-print" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={17} color="#0d9488" />
            <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Prueba las herramientas clínicas en vivo (sin registro)' : 'Try Live Clinical Tools (No Login Required)'}
            </h2>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#475569' }}>
            {isEs
              ? 'Explora directamente los recursos que utilizan nuestras clínicas asociadas cada día.'
              : 'Explore the clinical guides and B2B schedules our partner clinics use daily.'}
          </p>

          <div className="doc-three-col">
            {[
              {
                href: `/guides/hormone-pellets-implantation?lang=${isEs ? 'es' : 'en'}`,
                badgeEn: 'SURGICAL GUIDE',
                badgeEs: 'GUÍA QUIRÚRGICA',
                titleEn: 'Hormone Pellet Trocar Guide (6 Steps)',
                titleEs: 'Guía de Implantación de Pellets (6 Pasos)',
                descEn: 'Interactive trocar simulator, titration calculator, pre-op checklist, and PubMed clinical references.',
                descEs: 'Simulador visual de trócar, calculadora de titulación, checklist pre-op y bibliografía PubMed.',
              },
              {
                href: `/pricing/pellets?lang=${isEs ? 'es' : 'en'}&cur=${currency}`,
                badgeEn: 'EU GMP FORMULARY',
                badgeEs: 'FORMULARIO EU GMP',
                titleEn: 'Bioidentical Hormone Pellets & Kits',
                titleEs: 'Pellets Hormonales y Kits Trócar',
                descEn: '41 clinical SKUs with female/male profile filters, EUR/USD/AED pricing, and Pack ×10 volume savings.',
                descEs: '41 referencias con filtros femenino/masculino, precios EUR/USD/AED y ahorro Pack ×10.',
              },
              {
                href: `/guides/peptide-reconstitution-dosing?lang=${isEs ? 'es' : 'en'}`,
                badgeEn: 'DOSING REFERENCE',
                badgeEs: 'REFERENCIA DOSIS',
                titleEn: 'Peptide Reconstitution & Click-Dial Pens',
                titleEs: 'Reconstitución de Péptidos y Plumas',
                descEn: 'U-100 insulin syringe unit math, bacteriostatic water tables, and 3 mL click-dial pen equivalents.',
                descEs: 'Cálculo exacto en unidades U-100, tablas de agua BAC y equivalencias por clics en plumas 3 mL.',
              },
            ].map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <span style={{ display: 'inline-block', fontSize: '0.66rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '2px 8px', borderRadius: '999px', marginBottom: '8px' }}>
                    {isEs ? demo.badgeEs : demo.badgeEn}
                  </span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    {isEs ? demo.titleEs : demo.titleEn}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                    {isEs ? demo.descEs : demo.descEn}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: 700, color: '#0d9488' }}>
                  <span>{isEs ? 'Abrir herramienta' : 'Open tool'}</span>
                  <ExternalLink size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 15-MINUTE CLINIC ACTIVATION STEPPER ── */}
        <section className="doc-card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.15rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={17} color="#0d9488" />
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Cómo activar tu clínica en 15 minutos' : 'How to Activate Your Clinic in 15 Minutes'}
              </h2>
            </div>
          </div>

          <MobileConnectedStepper
            steps={mobileStepperItems}
            activeIndex={activeStep}
            onSelect={setActiveStep}
            isEs={isEs}
            ariaLabel={isEs ? 'Pasos de activación clínica' : 'Clinic activation steps'}
          />

          <div className="doc-mobile-detail" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f766e', marginBottom: '6px' }}>
              {isEs ? ACTIVATION_STEPS[activeStep].titleEs : ACTIVATION_STEPS[activeStep].titleEn}
            </div>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
              {isEs ? ACTIVATION_STEPS[activeStep].descEs : ACTIVATION_STEPS[activeStep].descEn}
            </p>
          </div>

          <div className="doc-four-col" style={{ padding: '1.25rem 1.4rem' }}>
            {ACTIVATION_STEPS.map((s, idx) => (
              <div key={s.id} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                    {isEs ? s.timeEs : s.timeEn}
                  </span>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0d9488', color: '#fff', fontSize: '0.70rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {isEs ? s.titleEs : s.titleEn}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>
                  {isEs ? s.descEs : s.descEn}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PERSONALIZE LINK FOR A CLINIC ── */}
        <section className="doc-card no-print" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: '1 1 280px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                {isEs ? 'Personalizar enlace para un médico o clínica' : 'Personalize link for a specific clinic or physician'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                {isEs
                  ? 'Escribe el nombre de la clínica para generar su presentación co-branded en 1 clic.'
                  : 'Enter a clinic name to generate a co-branded presentation link in 1 click.'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 320px' }}>
              <input
                type="text"
                value={customClinicDraft}
                onChange={(e) => setCustomClinicDraft(e.target.value)}
                placeholder={isEs ? 'Ej. Clínica Longevidad Madrid...' : 'e.g. Longevity Clinic Dubai...'}
                style={{
                  flex: '1 1 180px',
                  minHeight: '38px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  color: '#0f172a',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setClinicName(customClinicDraft.trim());
                  handleCopyShareLink(customClinicDraft.trim());
                }}
                className="gcp-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
              >
                <Copy size={13} />
                <span>{isEs ? 'Aplicar y Copiar URL' : 'Apply & Copy URL'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          className="doc-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            borderLeft: '4px solid #0d9488',
          }}
        >
          <div>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f766e' }}>
              {isEs ? '¿Quieres activar el acceso B2B para tu clínica?' : 'Ready to activate B2B clinic access?'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '3px' }}>
              {isEs
                ? 'Te damos alta inmediata con acceso a tarifas clínicas, guías interactivas y soporte médico directo.'
                : 'Get immediate onboarding with clinic tariffs, interactive guides, and direct clinical liaison.'}
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="mailto:info@atlashealth-services.com?subject=Clinic%20Access%20%E2%80%94%20Atlas%20Health%20Services"
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.80rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <span>info@atlashealth-services.com</span>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.80rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <span>{isEs ? 'Activar Acceso' : 'Activate Access'}</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </section>
      </main>

      <div className="no-print">
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}

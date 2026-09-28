"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Building2, 
  Stethoscope, 
  User, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  FileText, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Activity, 
  FlaskConical, 
  Droplets, 
  CheckCircle2, 
  Eye, 
  ArrowLeft,
  Info,
  Maximize2,
  Sparkles,
  Award
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';

// Defensive CSS to guarantee no storefront headers, navigation, or shopping carts leak into public verification page
const PUBLIC_RX_STYLES = `
  header.site-header,
  nav.site-nav,
  .cart-icon-wrapper,
  .cart-drawer,
  .auth-buttons,
  .region-bar,
  .guest-mode-banner,
  .price-transparency-section,
  .compare-tray,
  .bottom-tab-bar,
  [class*="CompareBar"],
  [class*="GuestMode"],
  [class*="RegionBar"],
  [class*="PriceTransparency"] {
    display: none !important;
  }
`;

export default function PublicPrescriptionClient({ rx }) {
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState(0);

  const isEs = lang === 'es';

  const rxId = rx.id || rx.prescriptionNumber || 'RX-PRESCRIPTION';
  const posology = rx.structuredPosology || {};
  const patient = rx.patient || {};
  const patientName = patient.name || rx.patientName || (isEs ? 'Paciente' : 'Patient');
  const patientAlias = rx.patientAlias || patient.alias ? ` (${rx.patientAlias || patient.alias})` : '';
  const doctorName = rx.doctorName || 'Dr. Hanieh Erdmann';
  const clinic = rx.clinic || 'Mediluxe Health Solutions (Dubai, UAE)';
  const doctorAddress = rx.doctorOfficeAddress || 'Index Tower 5709, Dubai (+971 50 354 6123)';
  const doctorPhone = rx.doctorPhone || '+971 50 354 6123';
  const doctorLicense = rx.doctorLicense || 'DHA-00013060-006';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';
  const publicUrl = `${baseUrl}/rx/${rxId}`;

  // Localized clinical steps (English default)
  const steps = isEs ? (posology.applicationSteps || [
    {
      step: 1,
      title: 'Preparación del Cuero Cabelludo',
      timing: '21:30 - 22:00 (Noche)',
      instruction: 'Asegurarse de que el cuero cabelludo esté completamente limpio y seco. No aplicar sobre cabello húmedo para evitar la dilución del vehículo lipídico TrichoSol™. Separar el cabello en rayas cada 1-2 cm sobre las áreas con menor densidad.'
    },
    {
      step: 2,
      title: 'Dosificación de Precisión (1.0 ml)',
      timing: 'Dosis Diaria Exacta',
      instruction: 'Extraer exactamente 1.0 ml con la pipeta graduada. Dosis superiores saturan los receptores foliculares sin aportar beneficio clínico adicional.'
    },
    {
      step: 3,
      title: 'Aplicación Gota a Gota en Raíz',
      timing: 'Contacto Dérmico',
      instruction: 'Depositar las gotas directamente en contacto con la piel del cuero cabelludo (no sobre el tallo del cabello), distribuyendo uniformemente.'
    },
    {
      step: 4,
      title: 'Masaje de Microcirculación',
      timing: '60 - 90 Segundos',
      instruction: 'Efectuar un masaje circular suave con la yema de los dedos para activar el flujo vascular y optimizar la penetración transdérmica liposomal.'
    },
    {
      step: 5,
      title: 'Tiempo de Acción Nocturno',
      timing: '6 a 8 Horas Continuas',
      instruction: 'Dejar actuar durante el descanso nocturno. Dejar secar al aire sin usar calor directo de secador. Lavar las manos con agua y jabón tras aplicar.'
    },
    {
      step: 6,
      title: 'Higiene Matutina',
      timing: 'A la mañana siguiente',
      instruction: 'Lavar el cabello a la mañana siguiente con un champú neutro suave (pH 5.5 sin sulfatos agresivos).'
    }
  ]) : [
    {
      step: 1,
      title: 'Scalp Preparation',
      timing: '21:30 - 22:00 (Bedtime)',
      instruction: 'Ensure the scalp is completely clean and dry before application. Do not apply on damp hair to prevent dilution of the TrichoSol™ lipid carrier. Part hair every 1-2 cm across areas of reduced density.'
    },
    {
      step: 2,
      title: 'Precision Dosing (1.0 ml)',
      timing: 'Exact Daily Dose',
      instruction: 'Draw exactly 1.0 ml using the calibrated pipette. Doses beyond 1.0 ml saturate follicular receptors without delivering additional clinical efficacy.'
    },
    {
      step: 3,
      title: 'Targeted Droplet Root Contact',
      timing: 'Direct Dermal Contact',
      instruction: 'Apply droplets directly onto the scalp surface (avoiding hair shafts), distributing evenly across targeted follicular zones.'
    },
    {
      step: 4,
      title: 'Microcirculation Stimulation',
      timing: '60 - 90 Seconds',
      instruction: 'Perform gentle circular fingertip massage to stimulate vascular capillary perfusion and optimize liposomal transdermal penetration.'
    },
    {
      step: 5,
      title: 'Nighttime Absorption Window',
      timing: '6 to 8 Continuous Hours',
      instruction: 'Leave formula on throughout nighttime rest. Allow to air-dry without direct hairdryer heat. Wash hands thoroughly with soap and water after application.'
    },
    {
      step: 6,
      title: 'Morning Hygiene Protocol',
      timing: 'Following Morning',
      instruction: 'Cleanse hair the following morning using a gentle physiological shampoo (pH 5.5, free of harsh aggressive sulfates).'
    }
  ];

  // Localized clinical milestones (English default)
  const timeline = isEs ? (posology.timeline || [
    {
      phase: 'Semanas 1 - 3',
      title: 'Fase de Adaptación & Estabilización',
      badge: 'Mes 1',
      description: 'Frenado de la caída telógena activa. Posible leve caída transitoria (shedding fisiológico) al expulsar cabellos viejos para dar paso a la fase anágena.'
    },
    {
      phase: 'Semanas 4 - 8',
      title: 'Activación Anágena & Proliferación',
      badge: 'Mes 2',
      description: 'Reactivación celular de la papila dérmica por IGrantine-F1™ y control androgénico por 17-α-Estradiol. Reducción notoria de caída en lavado.'
    },
    {
      phase: 'Semanas 9 - 12',
      title: 'Engrosamiento, Densidad & Consolidación',
      badge: 'Mes 3',
      description: 'Incremento del calibre folicular y mayor cobertura visual. Finalización de los 3 frascos (300 ml). Revisión clínica con la Dra. Hanieh Erdmann.'
    }
  ]) : [
    {
      phase: 'Weeks 1 - 3',
      title: 'Adaptation & Follicular Stabilization',
      badge: 'Month 1',
      description: 'Cessation of active telogen shedding. Potential transient physiological shedding as miniaturized telogen hairs make way for synchronized anagen emergence.'
    },
    {
      phase: 'Weeks 4 - 8',
      title: 'Anagen Activation & Cellular Proliferation',
      badge: 'Month 2',
      description: 'Dermal papilla reactivation via IGrantine-F1™ and androgenic pathway control by 17-α-Estradiol. Marked reduction of hairs shed during washing.'
    },
    {
      phase: 'Weeks 9 - 12',
      title: 'Shaft Thickening, Density & Consolidation',
      badge: 'Month 3',
      description: 'Measurable caliber increase in hair shafts and visible density coverage. Completion of the 3-bottle course (300 ml). Follow-up clinical review with Dr. Hanieh Erdmann.'
    }
  ];

  // Localized active ingredients (English default)
  const actives = isEs ? (posology.activesSynergy || [
    {
      name: 'Latanoprost Fagron 0.005%',
      role: 'Análogo de Prostaglandina F2α',
      action: 'Prolonga la duración de la fase anágena de crecimiento y reactiva folículos miniaturizados en reposo telógeno.'
    },
    {
      name: '17-α-Estradiol 0.05%',
      role: 'Modulador Estrogénico Folicular',
      action: 'Inhibe localmente la enzima 5-alfa reductasa y activa la aromatasa sin absorción hormonal sistémica detectable.'
    },
    {
      name: 'IGrantine-F1™ 0.5%',
      role: 'Complejo de Péptidos Biomiméticos',
      action: 'Estimula la vía Wnt/β-Catenina y la síntesis de factores de crecimiento endotelial (VEGF) en la papila dérmica.'
    },
    {
      name: 'TrichoSol™ (Fagron)',
      role: 'Vehículo Lipídico Patentado',
      action: 'Formulación 100% libre de alcohol y propilenglicol. Evita irritación o dermatitis y maximiza la biodisponibilidad folicular.'
    }
  ]) : [
    {
      name: 'Latanoprost Fagron 0.005%',
      role: 'Prostaglandin F2α Analogue',
      action: 'Prolongs the duration of the anagen growth cycle and reactivates dormant miniaturized hair follicles.'
    },
    {
      name: '17-α-Estradiol 0.05%',
      role: 'Follicular Estrogen Modulator',
      action: 'Locally inhibits the 5-alpha reductase enzyme and activates aromatase without detectable systemic hormone absorption.'
    },
    {
      name: 'IGrantine-F1™ 0.5%',
      role: 'Biomimetic Peptide Complex',
      action: 'Stimulates the canonical Wnt/β-Catenin signaling pathway and synthesizes Vascular Endothelial Growth Factor (VEGF) in dermal papillae.'
    },
    {
      name: 'TrichoSol™ (Fagron)',
      role: 'Patented Liposomal Vehicle',
      action: '100% alcohol and propylene glycol-free formulation. Prevents contact dermatitis and maximizes targeted follicular bioavailability.'
    }
  ];

  const docs = rx.documents || rx.attachedDocuments || [];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      triggerHaptic('copy');
      setCopied(true);
      toast.success(isEs ? 'Enlace oficial copiado ✓' : 'Official prescription link copied ✓');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Failed to copy link');
    }
  };

  const handleDownloadQrPng = () => {
    try {
      const svg = document.getElementById(`public-qr-${rxId}`);
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_PRESCRIPTION_${rxId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      toast.success(isEs ? 'Código QR descargado ✓' : 'QR Code downloaded ✓');
    } catch (err) {
      console.warn('[PublicPrescriptionClient] Download error:', err);
    }
  };

  // WhatsApp share message: clean English format by default
  const shareTextWhatsApp = encodeURIComponent(
    isEs
      ? `*Atlas Health — Ficha Técnica y Posología Médica*\n` +
        `📋 *Prescripción:* ${rxId}\n` +
        `👤 *Paciente:* ${patientName}${patientAlias}\n` +
        `🩺 *Médica Prescriptora:* ${doctorName}\n` +
        `🧪 *Fórmula:* Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% en TrichoSol™ (3x 100ml)\n` +
        `🕒 *Posología:* 1.0 ml tópico diario antes de acostarse sobre cuero cabelludo seco. Dejar actuar toda la noche.\n\n` +
        `🔗 *Ver Ficha Digital Completa & Verificación:* ${publicUrl}`
      : `*Med-Peptides — Official Clinical Prescription & Posology*\n` +
        `📋 *Prescription Ref:* ${rxId}\n` +
        `👤 *Patient:* ${patientName}${patientAlias}\n` +
        `🩺 *Prescribing Physician:* ${doctorName} (${clinic})\n` +
        `🧪 *Formula:* Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% in TrichoSol™ (3x 100ml)\n` +
        `🕒 *Dosage:* 1.0 ml topical daily at bedtime to dry scalp. Leave on overnight.\n\n` +
        `🔗 *Verified Clinical Record & Dosage Guide:* ${publicUrl}`
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      paddingBottom: '4rem'
    }}>
      <style dangerouslySetInnerHTML={{ __html: PUBLIC_RX_STYLES }} />

      {/* ── Public Unified Header (GCP Standard with Login, Lang, Clinical AI) ───── */}
      <PublicUnifiedHeader 
        track="protocols"
        lang={lang}
        onLangChange={(newLang) => setLang(newLang)}
        copyUrl={publicUrl}
        shortUrl={publicUrl}
        loginRedirect={publicUrl}
        breadcrumb={[
          { label: 'Clinical Intelligence', href: '/c/CAT-MU9L9GBN' },
          { label: isEs ? 'Prescripciones Médicas' : 'Verified Prescriptions' },
          { label: rxId }
        ]}
        anchorTabs={[
          { id: 'formula-card', label: isEs ? 'Fórmula' : 'Formula & Actives' },
          { id: 'posology-card', label: isEs ? 'Posología' : 'Posology Protocol' },
          { id: 'milestones-card', label: isEs ? 'Evolución' : 'Clinical Milestones' },
          { id: 'qr-card', label: isEs ? 'Verificación QR' : 'QR Verification' },
          ...(docs.length > 0 ? [{ id: 'docs-card', label: isEs ? 'Documentos' : 'Attached Records' }] : [])
        ]}
      />

      {/* ── Top Clinical Verification Bar ───────────────────────────────────────── */}
      <div style={{
        background: '#003666',
        color: '#ffffff',
        padding: '0.65rem 1.5rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} color="#4ade80" />
          <span>
            {isEs 
              ? 'Ficha Técnica Oficial Verificada & Dossier Clínico Digital'
              : 'Official Verified Clinical Specification & Digital Medical Dossier'}
          </span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ color: '#bae6fd' }}>{clinic}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#93c5fd' }}>Ref: {rxId}</span>
          <span style={{
            background: 'rgba(74, 222, 128, 0.2)',
            color: '#4ade80',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            {isEs ? 'Activa & Dispensada ✓' : 'Active & Dispensed ✓'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '1.5rem 1rem' }}>
        
        {/* ── Master Header Card ─────────────────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            
            {/* Clinic & Doctor Info */}
            <div style={{ display: 'flex', gap: '1rem', minWidth: 280 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #003666, #0284c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 54, 102, 0.2)'
              }}>
                <Stethoscope size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {clinic}
                </div>
                <h1 style={{ margin: '0.2rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {doctorName}
                </h1>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {rx.doctorTitle || (isEs ? 'Médica Consultora Dermatología' : 'Physician Consultant Dermatology')} · Lic. {doctorLicense}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  📍 {doctorAddress}
                </div>
              </div>
            </div>

            {/* Patient Card & Verification */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              minWidth: 260
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isEs ? 'Paciente Registrado' : 'Registered Patient'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {patientName} {patientAlias}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', display: 'flex', gap: '0.75rem' }}>
                <span>PIN: <strong>{patient.pin || '11774'}</strong></span>
                <span>·</span>
                <span>{isEs ? 'F. Nac:' : 'DOB:'} <strong>{patient.dob || '15/06/1984'}</strong></span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
                {patient.maskedPhone || '+971 54 *** **80'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Formula & Ingredients Card ───────────────────────────────────── */}
        <div id="formula-card" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <FlaskConical size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Fórmula Magistral Personalizada en TrichoSol™' : 'Custom Compounded Formula in TrichoSol™'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Recomendada tras Análisis Genético & Tricológico Fagron TrichoTest'
                    : 'Recommended Following Fagron TrichoTest Genetic & Trichological Assessment'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {isEs ? 'N3 = 3 Meses (3x 100ml)' : 'N3 = 3-Month Cycle (3x 100ml)'}
              </span>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {isEs ? 'Vehículo Sin Alcohol' : 'Alcohol-Free Lipid Vehicle'}
              </span>
            </div>
          </div>

          {/* Actives Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            {actives.map((act, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  {act.role}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  {act.name}
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                  {act.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Enhanced Posology & Step-by-Step Guide ───────────────────────────────── */}
        <div id="posology-card" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Protocolo de Posología & Guía de Aplicación' : 'Posology Protocol & Administration Guide'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  {isEs ? 'Instrucciones detalladas de administración diaria para el paciente' : 'Detailed daily patient administration instructions'}
                </p>
              </div>
            </div>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              {isEs ? '1.0 ml Nocturno Diario' : '1.0 ml Nightly Daily'}
            </div>
          </div>

          {/* Steps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {steps.map((st, sIdx) => (
              <div 
                key={sIdx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {st.step}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                    {st.timing}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  {st.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                  {st.instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Timeline & QR Sharing Split ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Biological Milestones */}
          <div id="milestones-card" style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Activity size={20} color="#0d9488" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Evolución & Cronograma de Resultados (90 Días)' : 'Clinical Evolution & Results Timeline (90 Days)'}
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {timeline.map((tm, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f766e' }}>
                      {tm.phase} — {tm.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ffffff', background: '#0d9488', padding: '1px 6px', borderRadius: '4px' }}>
                      {tm.badge}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#134e4a', lineHeight: 1.45 }}>
                    {tm.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code & Direct WhatsApp Share */}
          <div id="qr-card" style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <ShieldCheck size={18} color="#16a34a" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isEs ? 'Código QR & Enlace de Paciente' : 'QR Code & Patient Access Portal'}
                </h4>
              </div>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                {isEs 
                  ? 'Escanee con su móvil para acceder inmediatamente a este expediente y las recetas firmadas'
                  : 'Scan with your smartphone camera to access this verified clinical record and digital prescription'}
              </p>
            </div>

            {/* Interactive QR Code */}
            <div 
              onClick={() => setShowQrModal(true)}
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: '#ffffff',
                border: '2px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={isEs ? 'Click para ampliar el código QR' : 'Click to enlarge QR code'}
            >
              <QRCodeSVG 
                id={`public-qr-${rxId}`}
                value={publicUrl}
                size={140}
                level="H"
                includeMargin={false}
              />
              <div style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                background: 'rgba(15,23,42,0.7)',
                borderRadius: '4px',
                padding: '3px',
                display: 'flex'
              }}>
                <Maximize2 size={12} color="#ffffff" />
              </div>
            </div>

            {/* Share Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    background: copied ? '#f0fdf4' : '#ffffff',
                    border: `1px solid ${copied ? '#86efac' : '#cbd5e1'}`,
                    color: copied ? '#15803d' : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
                  <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar URL' : 'Copy URL')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} />
                  <span>{isEs ? 'Bajar QR' : 'Save QR'}</span>
                </button>
              </div>

              {/* WhatsApp Share Button */}
              <a
                href={`https://wa.me/?text=${shareTextWhatsApp}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.7rem 1.25rem',
                  borderRadius: '10px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                  transition: 'opacity 0.15s'
                }}
              >
                <Share2 size={16} />
                <span>{isEs ? 'Compartir por WhatsApp' : 'Share via WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Official Attached Documents Tabs & Preview ──────────────────────────── */}
        {docs.length > 0 && (
          <div id="docs-card" style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {isEs ? `Documentos Oficiales Adjuntos (${docs.length})` : `Official Attached Clinical Documents (${docs.length})`}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    {isEs ? 'Previsualización de la receta médica oficial y la ficha de formulación Fagron' : 'Preview official signed prescription pad and Fagron compounding records'}
                  </p>
                </div>
              </div>

              {/* Document Selector Pills */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {docs.map((d, dIdx) => (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => setActiveDocTab(dIdx)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: activeDocTab === dIdx ? '1px solid #6366f1' : '1px solid #cbd5e1',
                      background: activeDocTab === dIdx ? '#eff6ff' : '#ffffff',
                      color: activeDocTab === dIdx ? '#4f46e5' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {d.category === 'signed_rx' 
                      ? (isEs ? '📄 Receta Bedaya Pad' : '📄 Bedaya Signed Pad') 
                      : (isEs ? '🖼️ Plantilla Fagron' : '🖼️ Fagron Formulation')}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Document Viewer */}
            {docs[activeDocTab] && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      {docs[activeDocTab].title || docs[activeDocTab].name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      {docs[activeDocTab].uploadedBy || (isEs ? 'Documento clínico verificado' : 'Verified clinical document')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(docs[activeDocTab])}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: '#6366f1',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Maximize2 size={13} />
                      <span>{isEs ? 'Pantalla Completa' : 'Full Screen'}</span>
                    </button>

                    {docs[activeDocTab].url && (
                      <a
                        href={docs[activeDocTab].url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={13} />
                        <span>{isEs ? 'Descargar' : 'Download'}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Inline Embedded Preview */}
                <div style={{
                  height: 480,
                  width: '100%',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1'
                }}>
                  {docs[activeDocTab].type?.includes('pdf') || docs[activeDocTab].url?.endsWith('.pdf') ? (
                    <iframe 
                      src={`${docs[activeDocTab].url}#toolbar=0&navpanes=0`} 
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="PDF Preview"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                      <img 
                        src={docs[activeDocTab].url} 
                        alt="Document Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '2rem' }}>
          Med-Peptides Clinical Intelligence Platform · Confidential Medical Prescription Verification · DHA Regulated L.L.C.
        </div>
      </div>

      {/* Lightbox QR Modal */}
      {showQrModal && (
        <div 
          onClick={() => setShowQrModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
              {isEs ? 'Código QR de Prescripción' : 'Prescription QR Code'}
            </h3>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
              {rxId} · {patientName}
            </p>
            
            <div style={{
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              display: 'inline-block',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
              <QRCodeSVG 
                value={publicUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleDownloadQrPng}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Descargar PNG' : 'Download PNG'}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Full Modal */}
      {previewDoc && (
        <DocumentPreviewModal 
          url={previewDoc.url}
          name={previewDoc.title || previewDoc.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

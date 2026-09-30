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
  Award,
  Phone,
  Printer
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PrescriptionDetailSidebar from '@/components/prescription/PrescriptionDetailSidebar';
import { detectFagronGenomicsTest } from '@/data/fagronGenomicsTests';
import GenomicsPrescriptionGuidanceCard from '@/components/prescription/GenomicsPrescriptionGuidanceCard';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import '@/styles/publicDesignSystem.css';
import './publicPrescriptionMobile.css';

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

export default function PublicPrescriptionClient({ rx, embedded = false, onBackToIntake = null }) {
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState(0);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);

  const isEs = lang === 'es';

  const rxId = rx.id || rx.prescriptionNumber || 'RX-PRESCRIPTION';
  const posology = rx.structuredPosology || {};
  const patient = rx.patient || {};
  const patientName = patient.name || rx.patientName || (isEs ? 'Paciente' : 'Patient');
  const patientAlias = rx.patientAlias || patient.alias ? ` (${rx.patientAlias || patient.alias})` : '';
  const doctorName = rx.doctor?.name || rx.doctorName || (isEs ? 'Dr. Miguel Ángel López Aranda' : 'Dr. Miguel Angel Lopez Aranda');
  const clinic = rx.doctor?.clinic || rx.clinicName || (rx.clinic && !rx.clinic.includes('Mediluxe') ? rx.clinic : (isEs ? 'Centro Médico & Farmacia Magistral' : 'Licensed Clinical Practice'));
  const doctorSpecialty = rx.doctor?.specialty || rx.doctorTitle || (isEs ? 'Médico Colegiado' : 'Physician Specialist');
  const doctorAddress = rx.doctor?.address || rx.doctorOfficeAddress || rx.clinicAddress || '';
  const doctorPhone = rx.doctor?.phone || rx.doctorPhone || '';
  const doctorLicense = rx.doctor?.license || rx.doctorLicense || rx.doctorLicenseNumber || (rx.doctor?.licenseNumber || '');

  // Pharmacogenomic test correlation (e.g. Fagron Genomics TrichoTest™)
  const genomicsData = detectFagronGenomicsTest(rx);
  const docs = rx.documents || rx.attachedDocuments || [];

  const tocSections = [
    { id: 'formula-card', label: isEs ? 'Fórmula Magistral' : 'Compounded Formula' },
    ...(genomicsData ? [{ id: 'genomics-card', label: isEs ? 'Guía Genómica' : 'Genomics Guidance' }] : []),
    { id: 'posology-card', label: isEs ? 'Pauta de Posología' : 'Posology Protocol' },
    { id: 'milestones-card', label: isEs ? 'Evolución Clínica' : 'Clinical Milestones' },
    { id: 'qr-card', label: isEs ? 'Portal del Paciente' : 'Patient Mobile Portal' },
    ...(docs.length > 0 ? [{ id: 'docs-card', label: isEs ? 'Documentos' : 'Attached Records' }] : [])
  ];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';
  const publicUrl = `${baseUrl}/rx/${rxId}`;

  // Localized clinical steps (English default)
  const steps = isEs ? (posology.applicationSteps || [
    {
      step: 1,
      title: 'Preparación del Cuero Cabelludo',
      timing: '21:30 - 22:00 (Noche)',
      badge: 'Cuero Cabelludo Seco',
      instruction: 'Asegurarse de que el cuero cabelludo esté completamente limpio y seco antes de la aplicación. No aplicar sobre cabello húmedo para evitar la dilución del vehículo lipídico TrichoSol™. Separar el cabello en rayas cada 1-2 cm sobre las áreas con menor densidad.'
    },
    {
      step: 2,
      title: 'Dosificación de Precisión & Calibración',
      timing: 'Dosis Diaria Exacta',
      badge: 'Pipeta Graduada 1.0 mL',
      instruction: 'Extraer exactamente 1.0 ml con la pipeta graduada. Dosis superiores saturan los receptores foliculares sin aportar beneficio clínico adicional.'
    },
    {
      step: 3,
      title: 'Aplicación Gota a Gota en Raíz',
      timing: 'Contacto Dérmico Directo',
      badge: 'Piel Capilar (No Tallo)',
      instruction: 'Depositar las gotas directamente en contacto con la piel del cuero cabelludo (evitando los tallos del cabello), distribuyendo uniformemente en coronilla, zona frontal y sienes.'
    },
    {
      step: 4,
      title: 'Masaje de Microcirculación & Perfusión',
      timing: '60 - 90 Segundos',
      badge: 'Activación Vascular',
      instruction: 'Efectuar un masaje circular suave con la yema de los dedos para activar el flujo vascular capilar y optimizar la penetración transdérmica liposomal.'
    },
    {
      step: 5,
      title: 'Tiempo de Absorción Liposomal Nocturno',
      timing: '6 a 8 Horas Continuas',
      badge: 'Secado al Aire (Sin Calor)',
      instruction: 'Dejar actuar la fórmula durante el descanso nocturno. Permitir el secado natural al aire sin usar calor directo de secador. No aclarar para asegurar la captación celular. Lavar las manos con agua y jabón tras aplicar.'
    },
    {
      step: 6,
      title: 'Protocolo de Higiene Matutina',
      timing: 'A la Mañana Siguiente',
      badge: 'Champú Fisiológico pH 5.5',
      instruction: 'Lavar el cabello a la mañana siguiente con un champú neutro suave (pH 5.5 sin sulfatos agresivos).'
    }
  ]) : [
    {
      step: 1,
      title: 'Scalp Preparation',
      timing: '21:30 - 22:00 (Bedtime)',
      badge: 'Dry Scalp Only',
      instruction: 'Ensure the scalp is completely clean and dry before application. Do not apply on damp hair to prevent dilution of the TrichoSol™ lipid carrier. Part hair every 1-2 cm across areas of reduced density.'
    },
    {
      step: 2,
      title: 'Precision Dosing & Dropper Calibration',
      timing: 'Exact Daily Dose',
      badge: '1.0 mL Calibrated Mark',
      instruction: 'Draw exactly 1.0 mL using the calibrated dropper pipette. Doses beyond 1.0 mL saturate follicular receptors without delivering additional clinical efficacy.'
    },
    {
      step: 3,
      title: 'Targeted Droplet Root Contact',
      timing: 'Direct Dermal Contact',
      badge: 'Root Skin Surface',
      instruction: 'Apply droplets directly onto the scalp skin surface (avoiding hair shafts), distributing evenly across targeted follicular zones (crown, frontal hairline, and temporal areas).'
    },
    {
      step: 4,
      title: 'Microcirculation Perfusion Massage',
      timing: '60 - 90 Seconds',
      badge: 'Capillary Perfusion',
      instruction: 'Perform gentle circular fingertip massage for 60 to 90 seconds to stimulate vascular capillary perfusion and optimize liposomal transdermal penetration.'
    },
    {
      step: 5,
      title: 'Nighttime Liposomal Absorption Window',
      timing: '6 to 8 Continuous Hours',
      badge: 'Overnight Air-Dry',
      instruction: 'Leave formula on throughout nighttime rest. Allow to air-dry naturally without direct hairdryer heat. Do not rinse overnight to ensure complete intracellular uptake. Wash hands thoroughly with soap and water after application.'
    },
    {
      step: 6,
      title: 'Morning Hygiene Protocol',
      timing: 'Following Morning',
      badge: 'pH 5.5 Gentle Cleanse',
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

  // Clinical Prescription APIs & Compounded Formulation (One API per line standard)
  const rawLines = rx.prescriptionLines || rx.items || rx.compounds || [];

  const prescriptionApis = React.useMemo(() => {
    if (Array.isArray(rawLines) && rawLines.length > 0) {
      return rawLines.map((line, idx) => {
        const isVehicle = Boolean(
          line.isVehicleOrBase || 
          line._isVehicleOrBase ||
          line.isVehicle ||
          line.dosageForm?.toLowerCase().includes('vehicle') ||
          (line.productName || line.name || '').toLowerCase().includes('trichosol') ||
          (line.productName || line.name || '').toLowerCase().includes('trichooil') ||
          (line.productName || line.name || '').toLowerCase().includes('pentravan')
        );

        const name = line.productName || line.activeIngredient || line.name || (isEs ? `Componente ${idx + 1}` : `Compound Item ${idx + 1}`);
        const dosage = line.dosage || line.dose || line.strength || line.concentration || '—';
        const tag = isVehicle ? (isEs ? 'VEHÍCULO' : 'VEHICLE') : `API ${idx + 1}`;
        
        const role = line.role || (isVehicle 
          ? (isEs ? 'Vehículo Magistral Liposomal' : 'Liposomal Compounding Vehicle')
          : (isEs ? 'Principio Activo Farmacogenómico' : 'Pharmacogenomic Active Ingredient'));
          
        const indication = line.indication || (isVehicle
          ? (isEs ? 'Base de Aplicación Transdérmica' : 'Targeted Dermal Carrier')
          : (isEs ? 'Tratamiento Folicular Personalizado' : 'Personalized Follicular Therapy'));

        const action = line.instructions || line.action || (isVehicle
          ? (isEs ? 'Vehículo lipídico 100% libre de alcohol. Optimiza la absorción folicular y evita dermatitis por contacto.' : 'Alcohol-free hydrophilic lipid vehicle engineered for continuous follicular uptake without irritation.')
          : (isEs ? `Tratamiento formulado a medida según el perfil clínico y farmacogenómico del paciente.` : `Custom compounded active ingredient calibrated to the patient's individual clinical profile.`));

        const rationale = line.rationale || (rx.treatmentProgram 
          ? (isEs ? `Prescrito bajo protocolo: ${rx.treatmentProgram}` : `Prescribed under program: ${rx.treatmentProgram}`)
          : (rx.fagron?.testName ? (isEs ? `Selección TrichoTest™ para respuesta folicular óptima` : `TrichoTest™ recommended formulation`) : null));

        return {
          id: line.id || `api-${idx + 1}`,
          tag,
          isVehicle,
          name,
          dosage,
          role,
          indication,
          action,
          rationale
        };
      });
    }

    // Fallback static demo if no lines are present
    return isEs ? [
      {
        id: 'api-1',
        tag: 'API 1',
        name: 'Minoxidil Fagron',
        dosage: '4 %',
        role: 'Vasodilatador & Estimulador Folicular',
        indication: 'Inductor Folicular de Fase Anágena',
        action: 'Prolonga la duración de la fase anágena de crecimiento y reactiva folículos miniaturizados en reposo telógeno.',
        rationale: 'Recomendación TrichoTest: Alta afinidad y respuesta del receptor folicular.'
      },
      {
        id: 'api-2',
        tag: 'API 2',
        name: 'Espironolactona',
        dosage: '1 %',
        role: 'Antiandrógeno Tópico Folicular',
        indication: 'Inhibidor del Receptor Androgénico',
        action: 'Bloquea localmente los receptores androgénicos de la papila dérmica sin absorción sistémica detectable.',
        rationale: 'Recomendación TrichoTest: Control de la sensibilidad androgénica folicular.'
      },
      {
        id: 'api-3',
        tag: 'API 3',
        name: 'Arginina',
        dosage: '1.5 %',
        role: 'Aminoácido Precursor de Óxido Nítrico',
        indication: 'Microcirculación & Perfusión Folicular',
        action: 'Mejora la vascularización periférica de la raíz folicular y estimula la síntesis proteica del bulbo.',
        rationale: 'Optimización de microcirculación capilar y proliferación de queratinocitos.'
      },
      {
        id: 'veh-1',
        tag: 'VEHÍCULO',
        isVehicle: true,
        name: 'TrichoSol™ (Fagron)',
        dosage: '100 mL',
        role: 'Vehículo Liposomal Hidrofílico Patentado',
        indication: 'Base Lipídica 100% Libre de Alcohol',
        action: 'Formulación 100% libre de alcohol y propilenglicol. Evita irritación o dermatitis y maximiza la biodisponibilidad y penetración transdérmica folicular.',
        rationale: 'Vehículo biocompatible de liberación sostenida patentado por Fagron.'
      }
    ] : [
      {
        id: 'api-1',
        tag: 'API 1',
        name: 'Minoxidil Fagron',
        dosage: '4 %',
        role: 'Vasodilator & Follicular Stimulator',
        indication: 'Follicular Anagen Phase Inducer',
        action: 'Prolongs the duration of the anagen growth cycle and reactivates dormant miniaturized hair follicles.',
        rationale: 'Fagron TrichoTest Correlation: High follicular receptor responsiveness.'
      },
      {
        id: 'api-2',
        tag: 'API 2',
        name: 'Spironolactone',
        dosage: '1 %',
        role: 'Topical Androgen Receptor Blocker',
        indication: 'Local Androgenic Modulation',
        action: 'Locally blocks androgen receptors in the dermal papilla without detectable systemic hormone absorption.',
        rationale: 'Fagron TrichoTest Correlation: Targeted reduction of sensitivity in dermal papilla.'
      },
      {
        id: 'api-3',
        tag: 'API 3',
        name: 'Arginine',
        dosage: '1.5 %',
        role: 'Nitric Oxide Precursor Amino Acid',
        indication: 'Microvascular Follicular Perfusion',
        action: 'Enhances peripheral follicular vascular supply and nourishes the dermal bulb.',
        rationale: 'Follicular micro-vascularization and matrix keratinocyte proliferation.'
      },
      {
        id: 'veh-1',
        tag: 'VEHICLE',
        isVehicle: true,
        name: 'TrichoSol™ (Fagron)',
        dosage: '100 mL',
        role: 'Patented Liposomal Vehicle',
        indication: '100% Alcohol & Propylene Glycol-Free',
        action: '100% alcohol and propylene glycol-free hydrophilic lipid carrier. Prevents contact dermatitis and maximizes targeted follicular bioavailability.',
        rationale: 'Patented Fagron phytocomplex carrier engineered for continuous follicular uptake.'
      }
    ];
  }, [rawLines, isEs, rx.treatmentProgram, rx.fagron?.testName]);

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
      ? `*Atlas Services — Ficha Técnica y Posología Médica*\n` +
        `📋 *Prescripción:* ${rxId}\n` +
        `👤 *Paciente:* ${patientName}${patientAlias}\n` +
        `🩺 *Médica Prescriptora:* ${doctorName}\n` +
        `🧪 *Fórmula:* Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% en TrichoSol™ (3x 100ml)\n` +
        (genomicsData ? `🧬 *Guía Genómica:* Formulada según recomendaciones de ${genomicsData.test.shortName}.\n` : '') +
        `🕒 *Posología:* 1.0 ml tópico diario antes de acostarse sobre cuero cabelludo seco. Dejar actuar toda la noche.\n\n` +
        `🔗 *Ver Ficha y Posología Digital:* ${publicUrl}`
      : `*Atlas Services — Medical Prescription & Posology Regimen*\n` +
        `📋 *Prescription Ref:* ${rxId}\n` +
        `👤 *Patient:* ${patientName}${patientAlias}\n` +
        `🩺 *Prescribing Physician:* ${doctorName} (${clinic})\n` +
        `🧪 *Formula:* Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% in TrichoSol™ (3x 100ml)\n` +
        (genomicsData ? `🧬 *Genomics Guidance:* Formulated based on ${genomicsData.test.shortName} recommendations.\n` : '') +
        `🕒 *Dosage:* 1.0 ml topical daily at bedtime to dry scalp. Leave on overnight.\n\n` +
        `🔗 *Digital Prescription & Dosage Regimen:* ${publicUrl}`
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
      {!embedded && (
        <PublicUnifiedHeader 
          track="protocols"
          lang={lang}
          onLangChange={(newLang) => setLang(newLang)}
          copyUrl={publicUrl}
          shortUrl={publicUrl}
          loginRedirect={publicUrl}
          hideTier2={true}
          inquiryContextType="prescription"
          inquiryEntity={{
            name: `Prescription ${rxId}`,
            rxId,
            code: rxId,
            patientName,
            doctorName,
            clinic,
            formula: 'Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% in TrichoSol™ (3x 100ml)',
            dosage: '1.0 ml Once Daily at Night on Dry Scalp',
            category: 'prescription',
            genomicsTest: genomicsData?.test?.shortName || null
          }}
          breadcrumb={[
            { label: 'Clinical Intelligence', href: '/c/CAT-MU9L9GBN' },
            { label: isEs ? 'Prescripciones Médicas' : 'Prescription Dossier' },
            { label: rxId }
          ]}
        />
      )}

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div className="pds-content-with-sidebar">
          <div className="pds-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* ── Master Header Card ─────────────────────────────────────────────────── */}
            <div className="rx-card" style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.75rem',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              marginBottom: '0.25rem'
            }}>
              <div className="rx-master-header-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                
                {/* Prescribing Doctor Clinical Prominence */}
                <div className="rx-doctor-col" style={{ display: 'flex', gap: '1rem', minWidth: 280 }}>
                  <div className="rx-doctor-avatar" style={{
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
                  <div className="rx-doctor-meta">
                    <div className="rx-doctor-badge" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isEs ? 'Médica Prescriptora · Licencia DHA' : 'Prescribing Physician · DHA Licensed'}
                    </div>
                    <h1 className="rx-doctor-name" style={{ margin: '0.2rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                      {doctorName}
                    </h1>
                    <div className="rx-doctor-sub" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {doctorSpecialty} · Lic. {doctorLicense}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      📍 {doctorAddress}
                    </div>
                  </div>
                </div>

                {/* Patient Identity Card */}
                <div className="rx-patient-box" style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  minWidth: 260
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isEs ? 'Paciente Registrado' : 'Registered Patient'}
                    </div>
                    <span 
                      onClick={() => {
                        navigator.clipboard?.writeText(rxId);
                        toast.success(isEs ? 'Referencia copiada ✓' : 'Reference copied ✓');
                      }}
                      style={{ 
                        fontSize: '0.68rem', 
                        fontFamily: 'monospace', 
                        color: '#0369a1', 
                        background: '#e0f2fe', 
                        padding: '2px 7px', 
                        borderRadius: '4px', 
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title={isEs ? 'Copiar referencia' : 'Copy reference'}
                    >
                      Ref: {rxId}
                      <Copy size={11} />
                    </span>
                  </div>
                  <div className="rx-patient-name" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
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

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      window.print();
                    }}
                    className="rx-print-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.42rem 0.8rem',
                      borderRadius: '8px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease'
                    }}
                    title={isEs ? 'Imprimir o Guardar en PDF' : 'Print or Save as PDF'}
                  >
                    <Printer size={13} color="#003666" />
                    <span>{isEs ? 'Imprimir / Guardar PDF' : 'Print / Save PDF'}</span>
                  </button>
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
                  {rx.treatmentType || (isEs ? 'Fórmula Magistral Personalizada' : 'Custom Compounded Formula')}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  {rx.treatmentProgram || rx.fagron?.testName || (isEs 
                    ? 'Recomendada tras Análisis Genético & Evaluación Médica' 
                    : 'Recommended Following Clinical & Genetic Assessment')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {rx.volume && (
                <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {rx.volume}
                </span>
              )}
              {rx.duration && (
                <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {rx.duration}
                </span>
              )}
              {rx.fagron?.boxId && (
                <span style={{ background: '#fdf4ff', color: '#9333ea', border: '1px solid #f0abfc', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  Muestra: {rx.fagron.boxId}
                </span>
              )}
              <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {isEs ? 'Vehículo Sin Alcohol' : 'Alcohol-Free Vehicle'}
              </span>
            </div>
          </div>

          {/* Active Pharmaceutical Ingredients — One API per line standard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {prescriptionApis.map((api) => (
              <div 
                key={api.id}
                style={{
                  background: api.isVehicle ? '#f8fafc' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: api.isVehicle ? '4px solid #64748b' : '4px solid #0284c7',
                  borderRadius: '12px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      padding: '3px 8px', 
                      borderRadius: '4px', 
                      background: api.isVehicle ? '#e2e8f0' : '#e0f2fe', 
                      color: api.isVehicle ? '#334155' : '#0369a1' 
                    }}>
                      {api.tag}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {api.name}
                    </span>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      color: '#0284c7', 
                      background: '#f0f9ff', 
                      border: '1px solid #bae6fd', 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      fontFamily: 'monospace' 
                    }}>
                      {api.dosage}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                    {api.role} · <span style={{ color: '#0369a1', fontWeight: 700 }}>{api.indication}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                  {api.action}
                </div>

                {api.rationale && (
                  <div style={{ 
                    fontSize: '0.72rem', 
                    color: '#047857', 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '6px', 
                    padding: '4px 10px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    width: 'fit-content' 
                  }}>
                    <span>🧬</span>
                    <span>{api.rationale}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Pharmacogenomic Clinical Guidance Card (Fagron Genomics) ───────────── */}
        {genomicsData && (
          <GenomicsPrescriptionGuidanceCard
            genomicsData={genomicsData}
            lang={lang}
          />
        )}

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
              {rx.posology ? (isEs ? 'Pauta Médica Personalizada' : 'Custom Physician Regimen') : (isEs ? '1.0 ml Nocturno Diario' : '1.0 ml Nightly Daily')}
            </div>
          </div>

          {/* Prominent Physician Prescribed Direction Callout */}
          {rx.posology && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderLeft: '4px solid #0284c7',
              borderRadius: '12px',
              padding: '1.1rem 1.35rem',
              marginBottom: '1.25rem',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#0369a1', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                <Stethoscope size={15} />
                <span>{isEs ? 'Instrucciones Específicas del Médico Prescriptor:' : 'Prescribing Physician Clinical Directions:'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.96rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.55 }}>
                "{rx.posology}"
              </p>
            </div>
          )}

          {/* Unified Clinical Posology Pathway (100% Full-Width Rows, Zero Empty Spaces) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', marginBottom: '1.25rem' }}>
            {steps.map((st) => (
              <div 
                key={st.step}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #0284c7',
                  borderRadius: '12px',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  boxSizing: 'border-box'
                }}
              >
                {/* Header row: Step number circle + Title on left, timing & key badges on right */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {st.step}
                    </div>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {st.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#0369a1',
                      background: '#e0f2fe',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {st.timing}
                    </span>
                    {st.badge && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#047857',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        {st.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Instruction full-width text */}
                <p style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  paddingLeft: '36px'
                }}>
                  {st.instruction}
                </p>
              </div>
            ))}
          </div>

          {/* Vehicle Formulation Specifications Banner (100% Full-Width) */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#047857',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#064e3b' }}>
                  {isEs ? 'Vehículo Liposomal TrichoSol™ Patentado (Fagron)' : 'Patented TrichoSol™ Liposomal Phytocomplex Vehicle (Fagron)'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#047857' }}>
                  {isEs 
                    ? '100% Libre de alcohol y propilenglicol · Cero residuo graso · Óptima tolerancia cutánea'
                    : '100% Alcohol-free & propylene glycol-free · Non-greasy finish · Superior scalp tolerance & intracellular uptake'}
                </div>
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}>
              {isEs ? 'Ciclo Completo: 90 Días (3x 100 mL)' : 'Full Cycle: 90 Days (3x 100 mL)'}
            </div>
          </div>
        </div>

        {/* ── Biological Milestones & Evolution (90 Days) ────────────────────────── */}
        <div id="milestones-card" className="rx-card" style={{
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
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Activity size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Evolución Clínica & Cronograma de Resultados' : 'Clinical Evolution & Results Timeline'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  {isEs ? 'Hitos biológicos esperados durante el ciclo de tratamiento de 90 días' : 'Expected biological milestones across the 90-day treatment cycle'}
                </p>
              </div>
            </div>

            <span style={{ 
              background: '#f0fdfa', 
              color: '#0f766e', 
              border: '1px solid #99f6e4', 
              padding: '4px 12px', 
              borderRadius: '8px', 
              fontSize: '0.78rem', 
              fontWeight: 800 
            }}>
              {isEs ? 'Ciclo Completo: 90 Días' : 'Full Cycle: 90 Days'}
            </span>
          </div>

          {/* Sequential Milestone Cards (Full-Width GCP Modular Flow, One Below the Other) */}
          <div className="rx-milestones-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            width: '100%'
          }}>
            {timeline.map((tm, idx) => (
              <div 
                key={idx}
                className="rx-milestone-item"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #0d9488',
                  borderRadius: '12px',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
                  boxSizing: 'border-box',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
              >
                <div className="rx-milestone-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
                  <div className="rx-milestone-title-wrap" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                    <span className="rx-milestone-phase-badge" style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 800, 
                      color: '#0f766e', 
                      background: '#ccfbf1', 
                      border: '1px solid #99f6e4', 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.04em' 
                    }}>
                      {tm.phase}
                    </span>
                    <span className="rx-milestone-title" style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                      {tm.title}
                    </span>
                  </div>
                  <span className="rx-milestone-month-badge" style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    color: '#ffffff', 
                    background: '#0d9488', 
                    padding: '4px 10px', 
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)'
                  }}>
                    {tm.badge}
                  </span>
                </div>

                <p className="rx-milestone-desc" style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                  {tm.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Patient Mobile Access Portal (Private Patient Dossier) ──────────────── */}
        <div id="qr-card" style={{
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
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Portal de Acceso Móvil del Paciente' : 'Patient Mobile Access Portal'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  {isEs 
                    ? 'Acceda confidencialmente a su pauta posológica personalizada y guía de administración' 
                    : 'Confidential mobile access to your personalized posology regimen and daily administration guide'}
                </p>
              </div>
            </div>

            <span style={{ 
              background: '#e0f2fe', 
              color: '#0369a1', 
              border: '1px solid #bae6fd', 
              padding: '4px 12px', 
              borderRadius: '8px', 
              fontSize: '0.78rem', 
              fontWeight: 800,
              fontFamily: 'monospace'
            }}>
              Ref: {rxId}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2.5rem', 
            flexWrap: 'wrap',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.75rem'
          }}>
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
                position: 'relative',
                flexShrink: 0
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

            {/* Action Buttons & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 260, maxWidth: 420 }}>
              <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.55 }}>
                {isEs 
                  ? 'Guarde o comparta este acceso para consultar la pauta médica diaria desde cualquier smartphone sin necesidad de instalar aplicaciones.' 
                  : 'Bookmark or share this access link to review your daily posology protocol and trichological progress anytime from any mobile device.'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0.65rem',
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
                    gap: '6px',
                    padding: '0.65rem',
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
                  padding: '0.65rem',
                  borderRadius: '8px',
                  background: '#25d366',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
                }}
              >
                <Share2 size={14} />
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
                      {docs[activeDocTab].uploadedBy || (isEs ? 'Expediente médico confidencial' : 'Confidential clinical record')}
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

            {/* Standardized Institutional Footer with Reference */}
            <footer style={{
              marginTop: '2.5rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.5rem',
              paddingBottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.76rem'
              }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Ref:</span>
                <span style={{ color: '#0f172a', fontWeight: 800, fontFamily: 'monospace' }}>{rxId}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                Atlas Services Clinical Intelligence Platform · Confidential Patient Prescription Dossier
              </div>
            </footer>
          </div>

          {/* Persistent Sticky Prescription Sidebar (Desktop Sticky + Mobile Drawer) */}
          <PrescriptionDetailSidebar
            sections={tocSections}
            rxId={rxId}
            doctorName={doctorName}
            doctorTitle={doctorSpecialty}
            doctorLicense={doctorLicense}
            doctorOffice={doctorAddress}
            doctorPhone={doctorPhone}
            publicUrl={publicUrl}
            onOpenPdf={handleDownloadQrPng}
            lang={lang}
          />
        </div>
      </div>

      {/* Unified Persistent Sticky Bottom Action Bar (GCP Standard) */}
      {!embedded && (
        <PublicStickyActionBar
          title={`Rx: ${rxId}`}
          subtitle={`${patientName} • ${doctorName}`}
          badge={isEs ? 'Prescripción Médica' : 'Medical Prescription'}
          badgeType="protocol"
          inquireLabel={isEs ? 'Consultar Prescripción' : 'Inquire Prescription'}
          onInquire={() => setIsInquiryDrawerOpen(true)}
          showClinicalAI={true}
          showSections={true}
          sectionsCount={tocSections.length}
          onOpenSections={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-rx-sections'));
            }
          }}
          lang={lang}
        />
      )}

      {/* Context-Aware Prescription Clinical Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="prescription"
        initialEntity={{
          name: `Prescription ${rxId} — ${patientName}`,
          rxId,
          code: rxId,
          patientName,
          doctorName,
          clinic,
          formula: 'Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% in TrichoSol™ (3x 100ml)',
          dosage: '1.0 ml Once Daily at Night on Dry Scalp',
          category: 'Prescription Dossier'
        }}
        lang={lang}
      />

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

      {/* ── Prescription Dedicated Clinical AI Research Copilot ── */}
      <PublicAtlasAIDrawer
        contextType="prescription"
        contextAnchor={{
          name: `Prescription ${rxId}`,
          rxId,
          code: rxId,
          doctorName,
          clinic,
          patientName,
          formula: 'Latanoprost 0.005% + 17-α-Estradiol 0.05% + IGrantine-F1™ 0.5% in TrichoSol™ (3x 100ml)',
          dosage: '1.0 ml Once Daily at Night on Dry Scalp',
          category: 'prescription',
          genomicsTest: genomicsData?.test?.shortName || null,
          slug: rxId.toLowerCase()
        }}
        storageKey={`rx_${rxId}`}
        hideFloatingTrigger={true}
        lang={lang}
      />
    </div>
  );
}

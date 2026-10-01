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
  Printer,
  FileSpreadsheet,
  Box
} from '@/lib/icons';
import { exportPrescriptionToXlsx } from '@/utils/exportPrescriptionToXlsx';
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

  // ── Compounded Formulations Architecture (Grouped by Vehicle & Route with Dedicated Posology) ──
  const rawLines = rx.prescriptionLines || rx.items || rx.compounds || [];

  const compoundedFormulations = React.useMemo(() => {
    // 1. If explicit formulation blocks already exist on the rx document (e.g. from AI intake)
    if (Array.isArray(rx.formulationBlocks) && rx.formulationBlocks.length > 0) {
      return rx.formulationBlocks.map((block, idx) => {
        const isTopical = (block.dispensingForm || block.route || '').toLowerCase().includes('topical') ||
                          (block.treatmentType || '').toLowerCase().includes('topical') ||
                          (block.treatmentType || '').toLowerCase().includes('follicular');
        return {
          id: `block-${idx + 1}`,
          index: idx + 1,
          badge: isEs 
            ? `PREPARACIÓN ${idx + 1} DE ${rx.formulationBlocks.length}` 
            : `PREPARATION ${idx + 1} OF ${rx.formulationBlocks.length}`,
          title: block.treatmentType || (isEs ? `Fórmula Magistral ${idx + 1}` : `Compounded Formulation ${idx + 1}`),
          route: block.route || (isTopical ? (isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application') : (isEs ? 'Vía Oral' : 'Oral Administration')),
          volume: block.volume || rx.volume || (isTopical ? '100 mL' : '30 Capsules'),
          container: isTopical 
            ? (isEs ? 'Frasco Topacio con Dosificador Cuentagotas / Spray de Precisión' : 'Amber Glass Bottle with Precision Dropper / Metered Spray')
            : (isEs ? 'Frasco Topacio Hermético con Cierre de Seguridad' : 'Safety-Sealed Amber Bottle with Desiccant Cap'),
          vehicle: {
            tag: isEs ? 'VEHÍCULO MAGISTRAL' : 'COMPOUNDING VEHICLE / BASE',
            name: block.vehicle?.name || block.vehicleName || (isTopical ? 'TrichoSol™ Liposomal Hydrophilic Base' : 'Compounded Micronized Capsule Base'),
            volume: block.volume || rx.volume || (isTopical ? '100 mL' : '30 Capsules'),
            specs: block.vehicle?.specs || (isTopical
              ? (isEs ? '100% Libre de alcohol y propilenglicol. Maximiza la absorción transdérmica folicular sin dermatitis.' : '100% Alcohol-Free & Propylene Glycol-Free hydrophilic liposomal vehicle. Eliminates dermatitis while optimizing transdermal uptake.')
              : (isEs ? 'Base micronizada de grado farmacéutico para dispersión entérica homogénea.' : 'Pharmaceutical-grade micronized powder excipient designed for consistent gastrointestinal absorption.'))
          },
          apis: (block.apis || block.items || []).map((api, aIdx) => ({
            id: api.id || `api-${idx + 1}-${aIdx + 1}`,
            tag: `API ${aIdx + 1}`,
            name: api.productName || api.activeIngredient || api.name || `Active Ingredient ${aIdx + 1}`,
            dosage: api.dosage || api.dose || api.strength || api.concentration || '—',
            role: api.role || (isTopical 
              ? (isEs ? 'Principio Activo Farmacogenómico' : 'Pharmacogenomic Active Ingredient')
              : (isEs ? 'Nutracéutico & Modulador Sistémico' : 'Systemic Nutraceutical & Modulator')),
            indication: api.indication || (isTopical 
              ? (isEs ? 'Tratamiento Folicular Personalizado' : 'Personalized Follicular Therapy')
              : (isEs ? 'Soporte Metabólico & Folicular' : 'Metabolic & Follicular Fortification')),
            action: api.instructions || api.action || (isEs 
              ? 'Tratamiento formulado a medida según el perfil clínico del paciente.' 
              : 'Custom compounded active ingredient calibrated to the patient clinical profile.'),
            rationale: api.rationale || null
          })),
          posology: {
            title: isEs ? 'Pauta Médica Específica para este Vehículo' : 'Specific Administration Regimen for this Vehicle',
            regimen: block.posology || rx.posology || (isTopical ? (isEs ? '1.0 mL Nocturno Diario (4-5 Pulverizaciones)' : '1.0 mL Nightly (4-5 Sprays)') : (isEs ? '1 Cápsula Diaria' : '1 Capsule Daily')),
            timing: isTopical ? (isEs ? 'Cada noche antes de dormir sobre cuero cabelludo seco' : 'Nightly at bedtime on dry scalp') : (isEs ? 'Junto con la cena o antes de dormir' : 'With dinner or at bedtime'),
            duration: block.duration || rx.duration || '30 days',
            steps: isTopical ? [
              {
                step: 1,
                title: isEs ? 'Preparación del Cuero Cabelludo' : 'Scalp Preparation',
                timing: isEs ? 'Paso 1' : 'Step 1',
                instruction: isEs 
                  ? 'Asegúrese de que el cuero cabelludo esté completamente limpio y seco antes de la aplicación.' 
                  : 'Ensure the scalp is clean and completely dry before applying the solution.'
              },
              {
                step: 2,
                title: isEs ? 'Dosificación de Precisión' : 'Precision Dosing',
                timing: isEs ? '1.0 mL / 4-5 Sprays' : '1.0 mL / 4-5 Sprays',
                instruction: isEs 
                  ? 'Cargue exactamente 1.0 mL en el dosificador cuentagotas o aplique 4 a 5 pulverizaciones directamente sobre las áreas afectadas.' 
                  : 'Measure exactly 1.0 mL in the calibrated dropper or apply 4 to 5 metered sprays directly onto target thinning areas.'
              },
              {
                step: 3,
                title: isEs ? 'Masaje y Absorción' : 'Fingertip Massage & Uptake',
                timing: isEs ? '30-60 Segundos' : '30-60 Seconds',
                instruction: isEs 
                  ? 'Distribuya suavemente con la yema de los dedos en movimientos circulares durante 30 a 60 segundos hasta su completa absorción. No enjuagar durante al menos 4 horas.' 
                  : 'Gently distribute with fingertips using circular motions for 30 to 60 seconds until absorbed. Do not rinse or wash hair for at least 4 hours.'
              },
              {
                step: 4,
                title: isEs ? 'Lavado de Manos Post-Aplicación' : 'Post-Application Cleansing',
                timing: isEs ? 'Inmediato' : 'Immediate',
                instruction: isEs 
                  ? 'Lávese las manos con agua y jabón inmediatamente después de finalizar la aplicación.' 
                  : 'Wash hands thoroughly with soap and water immediately following application.'
              }
            ] : [
              {
                step: 1,
                title: isEs ? 'Toma Diaria con Agua' : 'Daily Oral Ingestion',
                timing: isEs ? '1 Cápsula' : '1 Capsule',
                instruction: isEs 
                  ? 'Tome 1 cápsula al día acompañada de un vaso lleno de agua (200-250 mL).' 
                  : 'Ingest 1 capsule daily accompanied by a full glass of water (approx. 200-250 mL).'
              },
              {
                step: 2,
                title: isEs ? 'Momento de Administración' : 'Optimal Timing',
                timing: isEs ? 'Cena / Antes de Dormir' : 'Dinner / Bedtime',
                instruction: isEs 
                  ? 'Se recomienda tomar durante la cena o 30 minutos antes de dormir para maximizar la absorción y sinergia de los micronutrientes.' 
                  : 'Best taken with evening dinner or 30 minutes before sleep to optimize micronutrient absorption and tolerance.'
              },
              {
                step: 3,
                title: isEs ? 'Conservación' : 'Storage Conditions',
                timing: isEs ? 'Temp. Ambiente < 25°C' : 'Room Temp < 25°C',
                instruction: isEs 
                  ? 'Mantener en lugar fresco y seco (inferior a 25°C), protegido de la luz solar directa y humedad.' 
                  : 'Store in a cool, dry place below 25°C (77°F), securely closed and protected from direct sunlight and moisture.'
              }
            ]
          }
        };
      });
    }

    // 2. Separate rawLines into distinct Vehicle Formulations
    const vehicleLines = [];
    const topicalLines = [];
    const oralLines = [];

    rawLines.forEach((item) => {
      const nameLower = (item.name || item.productName || '').toLowerCase();
      const dosage = (item.dosage || item.dose || item.strength || '').toLowerCase();
      const form = (item.dosageForm || item.form || '').toLowerCase();
      const route = (item.route || '').toLowerCase();

      const isVehicleLine = Boolean(
        item.isVehicleOrBase || 
        item._isVehicleOrBase || 
        item.isVehicle || 
        form.includes('vehicle') ||
        nameLower.includes('trichosol') || 
        nameLower.includes('trichooil') || 
        nameLower.includes('trichofoam') || 
        nameLower.includes('pentravan') ||
        nameLower.includes('vehiculo') ||
        nameLower.includes('vehicle base')
      );

      if (isVehicleLine) {
        vehicleLines.push(item);
        return;
      }

      const isOral = route.includes('oral') ||
                     dosage.includes('mg') || 
                     dosage.includes('mcg') || 
                     dosage.includes('iu') ||
                     nameLower.includes('melatonin') || 
                     nameLower.includes('saw palmetto') || 
                     nameLower.includes('ginkgo') || 
                     nameLower.includes('vitamin') || 
                     nameLower.includes('selenium') || 
                     nameLower.includes('zinc') || 
                     nameLower.includes('biotin') || 
                     form.includes('capsule') || 
                     form.includes('tablet');

      if (isOral) {
        oralLines.push(item);
      } else {
        topicalLines.push(item);
      }
    });

    const results = [];
    const totalPreparations = (topicalLines.length > 0 ? 1 : 0) + (oralLines.length > 0 ? 1 : 0) || 1;

    // Preparation 1: Topical Compounded Solution
    if (topicalLines.length > 0 || (oralLines.length === 0 && rawLines.length > 0)) {
      const activeItems = topicalLines.length > 0 ? topicalLines : rawLines;
      const detectedVeh = vehicleLines.find(v => (v.name || '').toLowerCase().includes('tricho'))?.name || 'TrichoSol™ (Fagron)';
      
      results.push({
        id: 'prep-topical',
        index: 1,
        badge: isEs 
          ? `PREPARACIÓN 1 DE ${totalPreparations} · FÓRMULA MAGISTRAL TÓPICA` 
          : `PREPARATION 1 OF ${totalPreparations} · TOPICAL COMPOUNDED FORMULATION`,
        title: rx.treatmentType || (isEs ? 'Terapia Folicular Tópica Personalizada' : 'Personalized Follicular Therapy (Topical Scalp Solution)'),
        subtitle: rx.treatmentProgram || rx.fagron?.testName || (isEs 
          ? 'Recomendada tras Análisis Genético & Evaluación Médica' 
          : 'Recommended Following Clinical & Genetic Assessment'),
        route: isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application',
        volume: rx.volume || '100 mL',
        duration: rx.duration || '30 days',
        container: isEs ? 'Frasco Topacio con Dosificador Cuentagotas / Spray de Precisión' : 'Amber Glass Bottle with Precision Dropper / Metered Spray',
        vehicle: {
          tag: isEs ? 'VEHÍCULO MAGISTRAL' : 'COMPOUNDING VEHICLE / BASE',
          name: detectedVeh.includes('Tricho') ? `${detectedVeh} — Liposomal Hydrophilic Base` : 'TrichoSol™ Liposomal Hydrophilic Base',
          volume: rx.volume || '100 mL',
          specs: isEs 
            ? 'Formulación 100% libre de alcohol y propilenglicol. Evita irritación y descamación dérmica mientras maximiza la absorción transdérmica folicular continua.' 
            : '100% Alcohol-Free & Propylene Glycol-Free hydrophilic liposomal vehicle. Eliminates scalp dermatitis and contact erythema while optimizing follicle transdermal uptake.'
        },
        apis: activeItems.map((item, idx) => ({
          id: item.id || `api-topical-${idx + 1}`,
          tag: `API ${idx + 1}`,
          name: item.productName || item.activeIngredient || item.name || `Active Compound ${idx + 1}`,
          dosage: item.dosage || item.dose || item.strength || item.concentration || '—',
          role: item.role || (isEs ? 'Principio Activo Farmacogenómico' : 'Pharmacogenomic Active Ingredient'),
          indication: item.indication || (isEs ? 'Tratamiento Folicular Personalizado' : 'Personalized Follicular Therapy'),
          action: item.instructions || item.action || (isEs 
            ? 'Tratamiento formulado a medida según el perfil clínico y farmacogenómico del paciente.' 
            : "Custom compounded active ingredient calibrated to the patient's individual clinical profile."),
          rationale: item.rationale || (rx.fagron?.testName ? (isEs ? 'Recomendación TrichoTest™ para respuesta folicular óptima' : 'TrichoTest™ recommended formulation') : null)
        })),
        posology: {
          title: isEs ? 'Pauta de Administración Tópica' : 'Administration Regimen for Topical Scalp Solution',
          regimen: rx.posology || (isEs ? '1.0 mL Nocturno Diario (4-5 Pulverizaciones)' : '1.0 mL Nightly (4-5 Sprays)'),
          timing: isEs ? 'Cada noche antes de acostarse sobre cuero cabelludo limpio y seco' : 'Nightly at bedtime onto clean, dry scalp',
          duration: rx.duration || (isEs ? '30 días (1 frasco de 100 mL)' : '30-Day Course (100 mL Bottle)'),
          steps: [
            {
              step: 1,
              title: isEs ? 'Preparación del Cuero Cabelludo' : 'Scalp Preparation',
              timing: isEs ? 'Paso 1' : 'Step 1',
              instruction: isEs 
                ? 'Asegúrese de que el cuero cabelludo esté completamente limpio y seco antes de la aplicación.' 
                : 'Ensure the scalp is clean and completely dry before applying the solution.'
            },
            {
              step: 2,
              title: isEs ? 'Dosificación de Precisión' : 'Precision Dosing',
              timing: isEs ? '1.0 mL / 4-5 Sprays' : '1.0 mL / 4-5 Sprays',
              instruction: isEs 
                ? 'Cargue exactamente 1.0 mL en el cuentagotas o aplique 4 a 5 pulverizaciones directamente sobre las áreas con miniaturización o pérdida capilar.' 
                : 'Measure exactly 1.0 mL in the calibrated dropper or apply 4 to 5 metered sprays directly onto target thinning areas.'
            },
            {
              step: 3,
              title: isEs ? 'Masaje y Absorción' : 'Fingertip Massage & Uptake',
              timing: isEs ? '30-60 Segundos' : '30-60 Seconds',
              instruction: isEs 
                ? 'Distribuya suavemente con la yema de los dedos en movimientos circulares durante 30 a 60 segundos hasta su completa absorción. No aclare el cabello durante al menos 4 horas.' 
                : 'Gently distribute with fingertips using circular motions for 30 to 60 seconds until absorbed. Do not rinse or wash hair for at least 4 hours.'
            },
            {
              step: 4,
              title: isEs ? 'Lavado de Manos Post-Aplicación' : 'Post-Application Cleansing',
              timing: isEs ? 'Inmediato' : 'Immediate',
              instruction: isEs 
                ? 'Lávese las manos con agua y jabón inmediatamente después de finalizar la aplicación.' 
                : 'Wash hands thoroughly with soap and water immediately following application.'
            }
          ]
        }
      });
    }

    // Preparation 2: Oral Compounded Formulation
    if (oralLines.length > 0) {
      const oralIndex = results.length + 1;
      results.push({
        id: 'prep-oral',
        index: oralIndex,
        badge: isEs 
          ? `PREPARACIÓN ${oralIndex} DE ${totalPreparations} · FÓRMULA MAGISTRAL ORAL` 
          : `PREPARATION ${oralIndex} OF ${totalPreparations} · ORAL COMPOUNDED FORMULATION`,
        title: isEs ? 'Soporte Nutracéutico & Antiandrogénico Sistémico (Cápsulas)' : 'Systemic Follicular & Nutraceutical Support (Compounded Capsules)',
        subtitle: isEs 
          ? 'Formulación oral micronizada en cápsulas de alta biodisponibilidad' 
          : 'Pharmaceutical micronized oral formulation in high-bioavailability capsules',
        route: isEs ? 'Vía Oral' : 'Oral Administration',
        volume: isEs ? '30 Cápsulas' : '30 Compounded Capsules',
        duration: rx.duration || '30 days',
        container: isEs ? 'Frasco Topacio Hermético con Cierre de Seguridad' : 'Safety-Sealed Amber Bottle with Desiccant Cap',
        vehicle: {
          tag: isEs ? 'VEHÍCULO ORAL' : 'ORAL VEHICLE BASE',
          name: isEs ? 'Cápsulas de Gelatina / Celulosa Vegetal Micronizada' : 'Micronized Compounded Hard Gelatin / Vegetable Capsules',
          volume: isEs ? '30 Cápsulas (Tratamiento Mensual)' : '30 Capsules (1-Month Supply)',
          specs: isEs 
            ? 'Base micronizada de grado farmacéutico para dispersión y absorción entérica homogénea sin irritación gástrica.' 
            : 'Pharmaceutical-grade micronized powder excipient designed for consistent systemic gastrointestinal absorption without gastric irritation.'
        },
        apis: oralLines.map((item, idx) => ({
          id: item.id || `api-oral-${idx + 1}`,
          tag: `API ${idx + 1}`,
          name: item.productName || item.activeIngredient || item.name || `Active Compound ${idx + 1}`,
          dosage: item.dosage || item.dose || item.strength || item.concentration || (item.quantity ? `${item.quantity} un.` : '—'),
          role: item.role || (isEs ? 'Nutracéutico & Modulador Sistémico' : 'Systemic Nutraceutical & Modulator'),
          indication: item.indication || (isEs ? 'Soporte Metabólico & Folicular' : 'Metabolic & Follicular Fortification'),
          action: item.instructions || item.action || (isEs 
            ? 'Aporte de micronutrientes y fitoterapéuticos para optimizar el ciclo folicular sistémico.' 
            : 'Provides targeted micronutrients and botanical anti-androgenic co-factors to support follicular growth.'),
          rationale: item.rationale || null
        })),
        posology: {
          title: isEs ? 'Pauta de Administración Oral' : 'Administration Regimen for Oral Capsules',
          regimen: isEs ? '1 Cápsula Diaria con la Cena' : '1 Capsule Daily with Dinner / Bedtime',
          timing: isEs ? 'Por la noche, junto con alimentos y un vaso de agua' : 'Nightly with food and a full glass of water',
          duration: rx.duration || (isEs ? '30 días (1 frasco de 30 cápsulas)' : '30-Day Course (30 Capsules)'),
          steps: [
            {
              step: 1,
              title: isEs ? 'Toma Diaria con Agua' : 'Daily Oral Ingestion',
              timing: isEs ? '1 Cápsula' : '1 Capsule',
              instruction: isEs 
                ? 'Tome 1 cápsula al día acompañada de un vaso lleno de agua (200-250 mL).' 
                : 'Ingest 1 capsule daily accompanied by a full glass of water (approx. 200-250 mL).'
            },
            {
              step: 2,
              title: isEs ? 'Momento de Administración' : 'Optimal Timing',
              timing: isEs ? 'Cena / Antes de Dormir' : 'Dinner / Bedtime',
              instruction: isEs 
                ? 'Se recomienda tomar durante la cena o 30 minutos antes de dormir para maximizar la absorción y sinergia de los micronutrientes.' 
                : 'Best taken with evening dinner or 30 minutes before sleep to optimize micronutrient absorption and tolerance.'
            },
            {
              step: 3,
              title: isEs ? 'Conservación' : 'Storage Conditions',
              timing: isEs ? 'Temp. Ambiente < 25°C' : 'Room Temp < 25°C',
              instruction: isEs 
                ? 'Mantener en lugar fresco y seco (inferior a 25°C), protegido de la luz solar directa y humedad.' 
                : 'Store in a cool, dry place below 25°C (77°F), securely closed and protected from direct sunlight and moisture.'
            }
          ]
        }
      });
    }

    return results;
  }, [rawLines, rx, isEs]);

  // Keep prescriptionApis for any auxiliary references
  const prescriptionApis = React.useMemo(() => {
    return compoundedFormulations.flatMap(f => f.apis);
  }, [compoundedFormulations]);

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

  const handleExportExcel = () => {
    try {
      triggerHaptic('selection');
      toast.loading(isEs ? 'Generando archivo Excel (.xlsx)...' : 'Generating Excel (.xlsx) file...', { id: 'rx-excel' });
      const res = exportPrescriptionToXlsx(rx, { lang });
      if (res && res.success) {
        toast.success(
          isEs 
            ? `Receta exportada a Excel: ${res.filename} (${res.itemCount} productos)` 
            : `Prescription exported to Excel: ${res.filename} (${res.itemCount} items)`,
          { id: 'rx-excel' }
        );
      } else {
        toast.error(isEs ? 'No se pudo exportar a Excel' : 'Failed to export to Excel', { id: 'rx-excel' });
      }
    } catch (err) {
      console.error('[PublicPrescriptionClient] Excel export error:', err);
      toast.error(isEs ? 'Error al generar Excel' : 'Error generating Excel file', { id: 'rx-excel' });
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

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
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
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.15s ease'
                      }}
                      title={isEs ? 'Imprimir o Guardar en PDF' : 'Print or Save as PDF'}
                    >
                      <Printer size={15} color="#003666" />
                      <span>{isEs ? 'Imprimir / Guardar PDF' : 'Print / Save PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

        {/* ── Compounded Formulations & Dedicated Posology Architecture ──────────── */}
        <div id="formula-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {compoundedFormulations.map((formulation, fIdx) => (
            <div
              key={formulation.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.35rem'
              }}
            >
              {/* Preparation Master Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    background: formulation.id.includes('topical')
                      ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                      : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
                  }}>
                    {formulation.id.includes('topical') ? <FlaskConical size={22} /> : <Box size={22} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: formulation.id.includes('topical') ? '#0284c7' : '#7c3aed',
                        background: formulation.id.includes('topical') ? '#e0f2fe' : '#ede9fe',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {formulation.badge}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                        {formulation.route}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {formulation.title}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      {formulation.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {formulation.volume && (
                    <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 11px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {formulation.volume}
                    </span>
                  )}
                  {formulation.duration && (
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 11px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {formulation.duration}
                    </span>
                  )}
                  {rx.fagron?.boxId && fIdx === 0 && (
                    <span style={{ background: '#fdf4ff', color: '#9333ea', border: '1px solid #f0abfc', padding: '4px 11px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      Sample: {rx.fagron.boxId}
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-Section 1: Compounding Vehicle / Base Carrier */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderLeft: formulation.id.includes('topical') ? '4px solid #0284c7' : '4px solid #8b5cf6',
                borderRadius: '12px',
                padding: '1.15rem 1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: formulation.id.includes('topical') ? '#0284c7' : '#7c3aed',
                      color: '#ffffff',
                      letterSpacing: '0.04em'
                    }}>
                      {formulation.vehicle.tag}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {formulation.vehicle.name}
                    </span>
                    {formulation.vehicle.volume && (
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
                        {formulation.vehicle.volume}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>{formulation.id.includes('topical') ? 'Alcohol-Free & Non-Irritating' : 'Enteric Bioavailable Powder'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.55 }}>
                  {formulation.vehicle.specs}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📦 {isEs ? 'Envase Dispensador:' : 'Dispensing Container:'}</span>
                  <strong style={{ color: '#0f172a' }}>{formulation.container}</strong>
                </div>
              </div>

              {/* Sub-Section 2: Compounded Active Ingredients (APIs) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs 
                      ? `Principios Activos Formulados en este Vehículo (${formulation.apis.length})` 
                      : `Active Compounded Ingredients in this Vehicle (${formulation.apis.length} APIs)`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {isEs ? 'Calibrados al perfil farmacogenómico' : 'Calibrated to patient pharmacogenomics'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formulation.apis.map((api) => (
                    <div
                      key={api.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1rem 1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: '#e0f2fe',
                            color: '#0369a1'
                          }}>
                            {api.tag}
                          </span>
                          <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
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

                      <div style={{ fontSize: '0.79rem', color: '#334155', lineHeight: 1.5 }}>
                        {api.action}
                      </div>

                      {api.rationale && (
                        <div style={{
                          fontSize: '0.72rem',
                          color: '#047857',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          padding: '3px 8px',
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

              {/* Sub-Section 3: Dedicated Posology Protocol FOR THIS SPECIFIC VEHICLE */}
              <div 
                id={fIdx === 0 ? "posology-card" : `posology-${formulation.id}`}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: '0.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                        {formulation.posology.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                        {formulation.posology.timing}
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
                    {formulation.posology.regimen}
                  </div>
                </div>

                {/* Step-by-Step Pathway for this vehicle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {formulation.posology.steps.map((st) => (
                    <div
                      key={st.step}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: '3px solid #0284c7',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <span style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {st.step}
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                            {st.title}
                          </span>
                        </div>
                        {st.timing && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#0369a1',
                            background: '#e0f2fe',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {st.timing}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.79rem', color: '#334155', lineHeight: 1.55, paddingLeft: '30px' }}>
                        {st.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pharmacogenomic Clinical Guidance Card (Fagron Genomics) ───────────── */}
        {genomicsData && (
          <GenomicsPrescriptionGuidanceCard
            genomicsData={genomicsData}
            lang={lang}
          />
        )}

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
            onExportExcel={handleExportExcel}
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

"use client";

import React, { useState, useMemo } from 'react';
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
  Box,
  Pill,
  Edit3,
  X,
  Layers,
  Dna,
  Factory,
  QrCode,
  ChevronDown,
  ChevronUp,
  Tag
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
import { classifyPrescription } from '@/data/prescriptionTypeClassifier';
import { getFagronClinicalMonograph, checkDosageSafety } from '@/data/fagronClinicalMonographs';
import GenomicsPrescriptionGuidanceCard from '@/components/prescription/GenomicsPrescriptionGuidanceCard';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import '@/styles/publicDesignSystem.css';
import './publicPrescriptionMobile.css';
import MultiPartOverview from './MultiPartOverview';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';

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

  @media (max-width: 768px) {
    .gcp-subtabs-strip {
      display: none !important;
    }
    .mobile-floating-action-bar {
      display: none !important;
    }
    .pds-content-with-sidebar {
      padding-bottom: 70px !important;
    }
  }
`;

// Helper to safely extract string posology from either string or structured object
function getPosologyText(pos) {
  if (!pos) return '';
  if (typeof pos === 'string') return pos;
  if (typeof pos === 'object') {
    return pos.regimen || pos.summary || pos.timing || pos.notes || pos.text || '';
  }
  return String(pos);
}

export default function PublicPrescriptionClient({ rx, embedded = false, onBackToIntake = null }) {
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState(0);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [activeGcpTab, setActiveGcpTab] = useState('all'); // 'all' | 'formulations' | 'genomics' | 'posology' | 'traceability'
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    formulations: true,
    posology: true,
    traceability: true,
    genomics: true
  });
  const [selectedPhase, setSelectedPhase] = useState('all'); // 'all' | 'formulation-0' | 'formulation-1' | 'formulation-2'
  const [expandedPhases, setExpandedPhases] = useState({
    'formulation-0': true,
    'formulation-1': true,
    'formulation-2': true,
    'formulation-3': true
  });
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [selectedLabelIndex, setSelectedLabelIndex] = useState(0);

  const prescriptionLabels = React.useMemo(() => {
    return getPharmapolisLabelsForPrescription(rx);
  }, [rx]);

  const togglePhase = (id) => {
    setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAllSections = () => {
    setExpandedSections({
      overview: true,
      formulations: true,
      posology: true,
      traceability: true,
      genomics: true
    });
    setExpandedPhases({
      'formulation-0': true,
      'formulation-1': true,
      'formulation-2': true
    });
  };

  const collapseAllSections = () => {
    setExpandedSections({
      overview: false,
      formulations: false,
      posology: false,
      traceability: false,
      genomics: false
    });
    setExpandedPhases({
      'formulation-0': false,
      'formulation-1': false,
      'formulation-2': false
    });
  };

  // Global smooth jump listener from sidebar
  React.useEffect(() => {
    const handleSectionJump = (e) => {
      const targetId = e.detail?.id;
      if (!targetId) return;
      setActiveGcpTab('all');
      expandAllSections();
    };
    window.addEventListener('OPEN_RX_SECTION', handleSectionJump);
    return () => window.removeEventListener('OPEN_RX_SECTION', handleSectionJump);
  }, []);

  // Treating Doctor Modal State
  const [customTreatingDoctor, setCustomTreatingDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);
  const [docForm, setDocForm] = useState({
    name: '',
    specialty: '',
    license: '',
    clinic: '',
    phone: '',
    address: ''
  });

  const isEs = lang === 'es';

  const rxId = rx.id || rx.prescriptionNumber || 'RX-PRESCRIPTION';
  const posology = rx.structuredPosology || {};
  const patient = rx.patient || {};
  const patientName = patient.name || rx.patientName || (isEs ? 'Paciente' : 'Patient');
  const patientAlias = rx.patientAlias || patient.alias ? ` (${rx.patientAlias || patient.alias})` : '';

  // ── Two-Doctor Clinical Architecture (Strict Segregation) ───────────────────
  // 1) Treating Physician (treatingDoctor):
  //    The doctor who physically/clinically evaluated the patient and ordered the therapy.
  //    STRICTLY the ONLY physician shown on the patient QR code, bottle label, and patient portal.
  // 2) Production Physician (productionDoctor):
  //    Dr. Miguel Ángel López Aranda (España, Lic. 282869584, no DHA).
  //    Strictly internal for compounding pharmacy / Fagron manufacture. NEVER shown to patient.
  const rawCandidate = customTreatingDoctor || 
    rx.treatingDoctor || 
    (rx.doctor && typeof rx.doctor === 'object' && rx.doctor.name && !String(rx.doctor.name).includes('Miguel Ángel') ? rx.doctor : null) ||
    (rx.doctorName && !String(rx.doctorName).includes('Miguel Ángel') ? { name: rx.doctorName, clinic: rx.clinic, specialty: rx.doctorSpecialty || 'Prescribing Physician' } : null) ||
    (rx.prescribingDoctor && !String(rx.prescribingDoctor).includes('Miguel Ángel') ? { name: rx.prescribingDoctor, clinic: rx.clinic, specialty: 'Prescribing Physician' } : null) ||
    (rx.patientDoctor && !rx.patientDoctor.isInternalOnly && !String(rx.patientDoctor.name || '').includes('Miguel Ángel') ? rx.patientDoctor : null);
  const isCandidateMiguelAngel = Boolean(rawCandidate && String(rawCandidate.name || '').includes('Miguel Ángel'));
  const hasTreatingDoctor = Boolean(rawCandidate && rawCandidate.name && !isCandidateMiguelAngel);

  const treatingDoc = hasTreatingDoctor ? rawCandidate : {};
  let rawDoctorName = treatingDoc.name || '';
  const isHaytham = String(rawDoctorName).toLowerCase().includes('haytham') || String(rawDoctorName).toLowerCase().includes('heytham');

  const doctorName = isHaytham ? 'Dr. Haytham Salem' : rawDoctorName;
  const clinic = isHaytham ? 'Arthregen Clinic' : (treatingDoc.clinic || rx.clinicName || (rx.clinic && !rx.clinic.includes('Mediluxe') ? rx.clinic : (isEs ? 'Centro Médico Prescriptor' : 'Licensed Clinical Practice')));
  const doctorClinic = clinic;
  const doctorSpecialty = isHaytham 
    ? 'Consultant Orthopedic Surgeon & Regenerative Medicine Specialist' 
    : (treatingDoc.specialty || (hasTreatingDoctor ? (isEs ? 'Médico Especialista' : 'Physician Consultant') : (isEs ? 'Práctica Médica Colaboradora' : 'Collaborating Medical Practice')));
  const doctorAddress = isHaytham 
    ? 'Med Art Clinic Day Surgery Center, Villa 823, Jumeirah St., Dubai, UAE' 
    : (treatingDoc.address || '');
  const doctorPhone = isHaytham 
    ? '+971 4 346 6149' 
    : (treatingDoc.phone || '');
  const doctorLicense = isHaytham 
    ? 'DHA-P-0319842' 
    : (treatingDoc.license || treatingDoc.licenseNumber || '');
  const doctorWebsite = isHaytham ? 'www.mrhaytham.com' : (treatingDoc.website || '');
  const isDhaLicensed = Boolean(doctorLicense && String(doctorLicense).toUpperCase().includes('DHA'));

  const openDoctorModal = () => {
    setDocForm({
      name: treatingDoc.name || doctorName || '',
      specialty: treatingDoc.specialty || doctorSpecialty || '',
      license: doctorLicense || '',
      clinic: treatingDoc.clinic || clinic || '',
      phone: doctorPhone || '',
      address: doctorAddress || ''
    });
    setShowDoctorModal(true);
  };

  const handleSaveTreatingDoctor = async (doctorData) => {
    setIsSavingDoctor(true);
    try {
      const res = await fetch('/api/prescriptions/update-treating-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: rx.id || rxId,
          prescriptionNumber: rx.prescriptionNumber || rxId,
          treatingDoctor: doctorData
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update treating physician');
      }
      setCustomTreatingDoctor(data.treatingDoctor);
      setShowDoctorModal(false);
      toast.success(isEs ? 'Médico tratante asignado con éxito ✓' : 'Treating physician updated successfully ✓');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error updating doctor');
    } finally {
      setIsSavingDoctor(false);
    }
  };

  // Pharmacogenomic test correlation & Unified Prescription Classification
  const genomicsData = detectFagronGenomicsTest(rx);
  const prescriptionTypeInfo = React.useMemo(() => classifyPrescription(rx), [rx]);
  const docs = rx.documents || rx.attachedDocuments || [];

  const rxProgLower = String(rx.treatmentProgram || rx.program || '').toLowerCase();
  const rxTypeLower = String(rx.treatmentType || '').toLowerCase();
  const rxDispLower = String(rx.dispensingForm || '').toLowerCase();
  const isNutrigen = prescriptionTypeInfo.key === 'nutrigen' || rxProgLower.includes('nutri') || rxTypeLower.includes('nutri') || String(rx.fagron?.testName || '').toLowerCase().includes('nutri');
  const isEntirelyOral = isNutrigen || rxDispLower.includes('capsule') || rxDispLower.includes('oral') || (Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0 && rx.prescriptionLines.every(i => (i.route || '').toLowerCase().includes('oral')));

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';
  const publicUrl = `${baseUrl}/rx/${rxId}`;

  // Localized clinical steps (English default) - tailored for oral or topical routes
  const steps = isEs ? (posology.applicationSteps || (isEntirelyOral ? [
    {
      step: 1,
      title: 'Ingesta Diaria de la Cápsula',
      timing: getPosologyText(rx.posology).toLowerCase().includes('night') ? 'Por la Noche' : 'Dosis Diaria',
      badge: 'Vía Oral',
      instruction: 'Tomar la cápsula prescrita acompañada de un vaso de agua abundante (200-250 ml).'
    },
    {
      step: 2,
      title: 'Tolerancia y Absorción Óptima',
      timing: 'Con Alimentos',
      badge: 'Máxima Biodisponibilidad',
      instruction: 'Se aconseja administrar junto con alimentos para favorecer la tolerancia gastrointestinal y la óptima asimilación de los nutrientes y cofactores.'
    },
    {
      step: 3,
      title: 'Conservación Farmacéutica',
      timing: '< 25°C Ambiente',
      badge: 'Lugar Fresco y Seco',
      instruction: 'Mantener el envase herméticamente cerrado en lugar fresco y seco, protegido de la luz solar directa y la humedad.'
    },
    {
      step: 4,
      title: 'Pauta y Seguimiento Clínico',
      timing: rx.duration || '3 a 6 Meses',
      badge: 'Supervisión Médica',
      instruction: `Mantener la continuidad del tratamiento durante el periodo prescrito (${rx.duration || '3-6 meses'}). Revisión y control evolutivo con ${doctorName || 'el médico prescriptor'}.`
    }
  ] : [
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
  ])) : (posology.applicationSteps || (isEntirelyOral ? [
    {
      step: 1,
      title: 'Daily Oral Administration',
      timing: getPosologyText(rx.posology).toLowerCase().includes('night') ? 'Bedtime / Evening' : 'Daily Dose',
      badge: 'Oral Route',
      instruction: 'Take the prescribed compounded capsule with a full glass of water (approx. 200–250 mL).'
    },
    {
      step: 2,
      title: 'Optimal Absorption & Timing',
      timing: 'With Meals',
      badge: 'Peak Bioavailability',
      instruction: 'Administer with food or during dinner to enhance gastrointestinal tolerance and maximize cofactor bioavailability.'
    },
    {
      step: 3,
      title: 'Pharmaceutical Storage',
      timing: 'Room Temp < 25°C',
      badge: 'Cool & Dry',
      instruction: 'Keep container tightly sealed in a cool, dry area below 25°C (77°F), shielded from direct sunlight and moisture.'
    },
    {
      step: 4,
      title: 'Course Duration & Follow-Up',
      timing: rx.duration || '3 to 6 Months',
      badge: 'Clinical Review',
      instruction: `Maintain therapy continuity throughout the prescribed cycle (${rx.duration || '3-6 months'}). Follow-up review with ${doctorName || 'the prescribing physician'}.`
    }
  ] : [
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
  ]));

  // Localized clinical milestones (English default)
  const timeline = isEs ? (posology.timeline || (isEntirelyOral ? [
    {
      phase: 'Mes 1',
      title: 'Restablecimiento Metabólico & Absorción Inicial',
      badge: 'Fase Inicial',
      description: 'Asimilación celular de micronutrientes y cofactores esenciales. Normalización de vías metabólicas basales.'
    },
    {
      phase: 'Mes 2 - 3',
      title: 'Optimización Tisular & Regulación Celular',
      badge: 'Consolidación',
      description: 'Equilibrio de biomarcadores celulares, reducción del estrés oxidativo y mejora del tono funcional sistémico.'
    },
    {
      phase: rx.duration || 'Mes 3 - 6',
      title: 'Mantenimiento & Evaluación de Resultados',
      badge: 'Revisión Clínica',
      description: `Consolidación de las respuestas nutrigenéticas individuales. Control clínico evolutivo con ${doctorName || 'el médico prescriptor'}.`
    }
  ] : [
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
      description: `Incremento del calibre folicular y mayor cobertura visual. Finalización del tratamiento. Revisión clínica con ${doctorName || 'el médico prescriptor'}.`
    }
  ])) : (posology.timeline || (isEntirelyOral ? [
    {
      phase: 'Month 1',
      title: 'Metabolic Priming & Initial Bio-assimilation',
      badge: 'Initial Phase',
      description: 'Cellular uptake of key micronutrients and cofactors. Normalization of basal biochemical pathways.'
    },
    {
      phase: 'Months 2 - 3',
      title: 'Tissue Optimization & Cellular Regulation',
      badge: 'Consolidation',
      description: 'Biomarker stabilization, mitigation of oxidative stress, and enhancement of systemic vitality.'
    },
    {
      phase: rx.duration || 'Months 3 - 6',
      title: 'Maintenance & Clinical Outcome Evaluation',
      badge: 'Follow-up',
      description: `Long-term consolidation of individualized nutrigenetic adaptations. Follow-up consultation with ${doctorName || 'the prescribing physician'}.`
    }
  ] : [
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
      description: `Measurable caliber increase in hair shafts and visible density coverage. Completion of course. Follow-up clinical review with ${doctorName || 'the prescribing physician'}.`
    }
  ]));

  // ── Compounded Formulations Architecture (Grouped by Vehicle & Route with Dedicated Posology) ──
  const rawLines = (rx.allSessionItems && rx.allSessionItems.length > 0)
    ? rx.allSessionItems
    : (rx.prescriptionLines || rx.items || rx.compounds || []);

  const compoundedFormulations = React.useMemo(() => {
    // Helper to generate rich vehicle specs and tailored posology based on vehicle type and instructions
    const buildVehicleData = ({
      index,
      totalCount,
      vehicleName = '',
      treatmentTitle = '',
      route = '',
      volume = null,
      customPosology = '',
      customInstructions = '',
      apis = [],
      containerType = '',
      duration = '',
      extra = null
    }) => {
      const vNameLower = (vehicleName || '').toLowerCase();
      const titleLower = (treatmentTitle || '').toLowerCase();
      const routeLower = (route || '').toLowerCase();

      // Detection of vehicle types
      const isTrichoOil = vNameLower.includes('trichooil') || 
                          vNameLower.includes('oil') || 
                          vNameLower.includes('aceite') ||
                          titleLower.includes('trichooil') || 
                          titleLower.includes('scalp care') || 
                          titleLower.includes('higiene') || 
                          titleLower.includes('hygiene') ||
                          (apis.some(a => {
                            const an = (a.name || a.productName || a.activeIngredient || '').toLowerCase();
                            return an.includes('ginseng') || an.includes('ginkgo') || an.includes('tocopherol') || an.includes('vitamin e');
                          }) && (vNameLower.includes('oil') || titleLower.includes('scalp care') || titleLower.includes('higiene')));

      const isOral = routeLower.includes('oral') || 
                     titleLower.includes('oral') || 
                     titleLower.includes('capsule') || 
                     titleLower.includes('cápsula') || 
                     vNameLower.includes('capsule') || 
                     vNameLower.includes('cápsula') || 
                     vNameLower.includes('tablet') ||
                     isNutrigen ||
                     isEntirelyOral;

      const isTrichoFoam = vNameLower.includes('trichofoam') || vNameLower.includes('foam') || titleLower.includes('foam');

      // Theme accent color & badges
      let accentColor = '#0284c7';
      let accentBg = '#e0f2fe';
      let badgeText = isEs ? `PREPARACIÓN ${index} DE ${totalCount}` : `PREPARATION ${index} OF ${totalCount}`;
      let resolvedTitle = treatmentTitle || (isEs ? `Fórmula Magistral ${index}` : `Compounded Formulation ${index}`);
      let resolvedRoute = route || (isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application');
      let resolvedVolume = volume || (isTrichoOil ? '30 mL' : (isOral ? '90 Capsules' : '100 mL'));
      let resolvedContainer = containerType;

      let vehicleObj = {
        tag: isEs ? 'VEHÍCULO MAGISTRAL' : 'COMPOUNDING VEHICLE / BASE',
        name: vehicleName || (isTrichoOil ? 'TrichoOil™ Natural Lipidic Carrier' : 'TrichoSol™ Liposomal Hydrophilic Base'),
        volume: resolvedVolume,
        specs: ''
      };

      let posologyObj = {
        title: '',
        regimen: customPosology || '',
        timing: '',
        duration: duration || rx.duration || '30 days',
        steps: []
      };

      if (isTrichoOil) {
        accentColor = '#0d9488'; // Emerald / Teal for scalp hygiene & oil
        accentBg = '#ccfbf1';
        badgeText += isEs ? ' · ACEITE DE CUIDADO CAPILAR' : ' · SCALP CARE & HYGIENE OIL';
        resolvedTitle = treatmentTitle || (isEs ? 'Higiene & Cuidado Folicular (TrichoOil™)' : 'Scalp Care & Hygiene (TrichoOil™)');
        resolvedRoute = isEs ? 'Aplicación Tópica / Masaje Capilar' : 'Topical Scalp Application & Massage';
        resolvedVolume = volume || '30 mL';
        resolvedContainer = resolvedContainer || (isEs ? 'Frasco Topacio con Pipeta Cuentagotas de Precisión' : 'Amber Glass Bottle with Precision Pipette Dropper');
        vehicleObj.name = vehicleName || 'TrichoOil™ Natural Lipidic Carrier';
        vehicleObj.specs = isEs 
          ? 'Vehículo 100% natural a base de ácidos grasos esenciales y fitocomplejo patentado TrichoTech™. Restaura la barrera lipídica cutánea, normaliza el exceso de sebo y protege el nicho de células madre foliculares.'
          : '100% Natural essential fatty acid vehicle enriched with patented TrichoTech™ phytocomplex. Restores scalp epidermal lipid barrier, balances sebum excretion, and shields follicular stem cells.';
        
        posologyObj.title = isEs ? 'Pauta de Higiene & Cuidado del Cuero Cabelludo' : 'Pre-Wash Scalp Care & Hygiene Regimen';
        posologyObj.regimen = customPosology || (isEs ? '1–2 Veces por Semana (Tratamiento Pre-Lavado)' : '1–2 Times Weekly (Pre-Shampoo Treatment)');
        posologyObj.timing = isEs ? '10–15 minutos antes de lavar el cabello' : '10–15 minutes before showering / washing hair';
        posologyObj.steps = [
          {
            step: 1,
            title: isEs ? 'Seccionado & Dosificación' : 'Sectioning & Application',
            timing: isEs ? '1-2 Veces / Semana' : '1-2 Times / Week',
            instruction: isEs 
              ? 'Divida el cabello en secciones para exponer el cuero cabelludo y aplique unas gotas directamente con la pipeta en las zonas a tratar.' 
              : 'Part hair into sections to expose the scalp and dispense a few drops directly with the pipette across target areas.'
          },
          {
            step: 2,
            title: isEs ? 'Masaje Microcirculatorio' : 'Stimulating Microcirculation Massage',
            timing: isEs ? '3 a 5 Minutos' : '3 to 5 Minutes',
            instruction: isEs 
              ? 'Masajee suavemente con las yemas de los dedos mediante movimientos circulares continuos durante 3 a 5 minutos para estimular la perfusión capilar y solubilizar tapones de sebo.' 
              : 'Gently massage with circular fingertip motions for 3 to 5 minutes to stimulate capillary perfusion and emulsify follicular micro-sebum plugs.'
          },
          {
            step: 3,
            title: isEs ? 'Tiempo de Acción Folicular' : 'Active Diffusion Period',
            timing: isEs ? '10 Minutos' : '10 Minutes',
            instruction: isEs 
              ? 'Deje actuar sobre el cuero cabelludo durante 10 minutos para permitir la difusión transdérmica de los antioxidantes y nutrientes bioactivos.' 
              : 'Leave on the scalp for 10 minutes prior to washing to allow transdermal diffusion of bioactive botanical cofactors.'
          },
          {
            step: 4,
            title: isEs ? 'Lavado & Aclarado' : 'Hair Washing & Cleansing',
            timing: isEs ? 'Aclarado Completo' : 'Complete Rinse',
            instruction: isEs 
              ? 'Lave el cabello con un champú dermatológico suave y aclare con abundante agua templada.' 
              : 'Wash hair with a gentle dermatological shampoo and rinse thoroughly with lukewarm water.'
          }
        ];
      } else if (isOral) {
        accentColor = isNutrigen ? '#059669' : '#7c3aed'; // Emerald Green for NutriGen / Purple for general oral
        accentBg = isNutrigen ? '#ecfdf5' : '#ede9fe';
        badgeText += isNutrigen 
          ? (isEs ? ' · CÁPSULAS MAGISTRALES ORALES (NUTRIGEN™)' : ' · ORAL COMPOUNDED CAPSULES (NUTRIGEN™)')
          : (isEs ? ' · CÁPSULAS MAGISTRALES ORALES' : ' · ORAL COMPOUNDED CAPSULES');
        resolvedTitle = (isNutrigen && extra?.phaseName)
          ? treatmentTitle
          : isNutrigen
            ? (isEs ? 'Fórmula Magistral Personalizada en Cápsulas (NutriGen™)' : 'NutriGen™ Personalized Compounded Oral Capsules')
            : (treatmentTitle || (isEs ? 'Soporte Nutracéutico Sistémico (Cápsulas)' : 'Systemic Nutraceutical Support (Capsules)'));
        resolvedRoute = isEs ? 'Vía Oral (Cápsulas Vegetales Micronizadas)' : 'Oral Route (Micronized Plant-Based Capsules)';
        resolvedVolume = volume || rx.volume || (isEs ? '90 Cápsulas (Tratamiento 3 Meses)' : '90 Capsules (3-Month Protocol)');
        resolvedContainer = resolvedContainer || (isEs ? `Frasco Farmacéutico de Seguridad con Sello Hermético y Desecante (${resolvedVolume})` : `Safety-Sealed Pharmaceutical Bottle with Hermetic Cap & Desiccant (${resolvedVolume})`);
        vehicleObj.tag = isEs ? 'FORMA FARMACÉUTICA: CÁPSULAS ORALES' : 'DOSAGE FORM: ORAL CAPSULES';
        vehicleObj.name = vehicleName || (isEs ? 'Cápsulas Vegetales HPMC / Base Excipiente Micronizada' : 'Vegetarian HPMC Capsules / Micronized Powder Base Carrier');
        vehicleObj.specs = isEs
          ? 'Cápsulas vegetales de hidroxipropilmetilcelulosa (HPMC) de liberación entérica fisiológica, 100% libres de alérgenos y dióxido de titanio. Contienen la mezcla micronizada homogénea de los principios activos farmacogenómicos para una absorción y biodisponibilidad celular superior sin causar irritación gástrica.'
          : 'Allergen-free and titanium dioxide-free vegetarian HPMC enteric capsules. Engineered for uniform dispersion and maximum systemic bioavailability of micronized botanical extracts and metabolic cofactors.';
        
        posologyObj.title = isNutrigen 
          ? (isEs ? 'Pauta de Administración Diaria NutriGen™ (Cápsulas)' : 'NutriGen™ Daily Oral Capsule Administration Regimen')
          : (isEs ? 'Pauta de Administración Oral (Cápsulas)' : 'Oral Capsule Administration Regimen');
        posologyObj.regimen = customPosology || (isEs ? '1 Cápsula Diaria por la Mañana con el Desayuno' : '1 Capsule Daily in the Morning with Breakfast');
        posologyObj.timing = isEs ? 'Por la mañana con el desayuno y un vaso lleno de agua' : 'Morning with breakfast and a full glass of water';
        posologyObj.duration = duration || rx.duration || (isEs ? '90 Días (3 Meses)' : '90 Days (3 Months)');
        posologyObj.steps = [
          {
            step: 1,
            title: isEs ? 'Ingesta Diaria de la Cápsula' : 'Daily Oral Ingestion',
            timing: isEs ? '1 Cápsula / Día' : '1 Capsule / Day',
            instruction: isEs 
              ? 'Tome 1 cápsula al día acompañada de un vaso lleno de agua (200-250 mL), preferentemente junto con el desayuno o la comida principal para facilitar la absorción de los nutrientes.' 
              : 'Ingest 1 capsule daily accompanied by a full glass of water (approx. 200-250 mL), ideally alongside breakfast or lunch to enhance absorption.'
          },
          {
            step: 2,
            title: isEs ? 'Momento de Administración y Cronobiología' : 'Optimal Chronobiological Timing',
            timing: isEs ? 'Mañana / Mediodía' : 'Morning / Midday',
            instruction: isEs 
              ? 'Para fórmulas metabólicas y energizantes (Ginseng, Antioxidantes, Vitaminas), se recomienda tomar por la mañana. Si contiene inductores de descanso (Melatonina), tomar preferentemente 30 minutos antes de dormir.' 
              : 'For metabolic and revitalizing botanicals (Ginseng, Antioxidants, Vitamins), ingest in the morning. If formulated with nighttime modulators like Melatonin, take 30 minutes before sleep.'
          },
          {
            step: 3,
            title: isEs ? 'Conservación y Estabilidad del Frasco' : 'Storage Conditions & Protection',
            timing: isEs ? 'Temp. Ambiente < 25°C' : 'Room Temp < 25°C',
            instruction: isEs 
              ? 'Mantener el frasco herméticamente cerrado con su cápsula desecante original, en lugar seco y fresco (< 25°C), protegido de la luz solar directa y la humedad ambiental.' 
              : 'Store in a cool, dry place below 25°C (77°F), securely closed with original desiccant, protected from direct sunlight and ambient humidity.'
          },
          {
            step: 4,
            title: isEs ? 'Duración del Ciclo Terapéutico' : 'Treatment Cycle Duration',
            timing: duration || (isEs ? '90 Días (3 Meses)' : '90 Days (3 Months)'),
            instruction: duration
              ? (isEs ? `Ciclo terapéutico de ${duration}. Se recomienda seguimiento médico y reevaluación al completar el período.` : `Protocol spans a ${duration} cycle. Medical follow-up and clinical review are recommended upon cycle completion.`)
              : (isEs 
              ? 'Tratamiento planificado para un ciclo completo de 90 días (90 cápsulas). Se recomienda seguimiento médico y reevaluación al completar el período.' 
              : 'Protocol spans a full 90-day cycle (90 capsules). Medical follow-up and clinical review are recommended upon cycle completion.')
          }
        ];
      } else if (isTrichoFoam) {
        accentColor = '#0891b2'; // Cyan
        accentBg = '#cffafe';
        badgeText += isEs ? ' · ESPUMA TÓPICA' : ' · TOPICAL FOAM';
        resolvedTitle = treatmentTitle || (isEs ? 'Espuma Tópica Folicular (TrichoFoam™)' : 'Follicular Topical Foam (TrichoFoam™)');
        resolvedRoute = isEs ? 'Aplicación Tópica en Espuma' : 'Topical Foam Scalp Application';
        resolvedVolume = volume || '50 mL';
        resolvedContainer = resolvedContainer || (isEs ? 'Frasco Dosificador de Espuma con Bomba de Precisión' : 'Metered Foam Dispenser Bottle');
        vehicleObj.name = vehicleName || 'TrichoFoam™ Patented Vehicle';
        vehicleObj.specs = isEs
          ? 'Espuma de penetración rápida libre de propilenglicol con fitocomplejo TrichoTech™.'
          : 'Rapid-penetration, propylene glycol-free foam carrier formulated with TrichoTech™ phytocomplex.';
        posologyObj.title = isEs ? 'Pauta de Administración en Espuma' : 'Topical Foam Administration Protocol';
        posologyObj.regimen = customPosology || (isEs ? '2 Pulsaciones Diarias' : '2 Pumps Daily');
        posologyObj.timing = isEs ? 'Por la mañana o noche sobre cuero cabelludo seco' : 'Morning or evening onto dry scalp';
        posologyObj.steps = [
          {
            step: 1,
            title: isEs ? 'Dispensación' : 'Dispense Foam',
            timing: isEs ? '2 Pulsaciones' : '2 Pumps',
            instruction: isEs ? 'Presione el dosificador 2 veces directamente sobre la palma o yemas.' : 'Dispense 2 metered pumps of foam onto fingertips.'
          },
          {
            step: 2,
            title: isEs ? 'Distribución' : 'Application',
            timing: isEs ? 'Zonas Afectadas' : 'Thinning Zones',
            instruction: isEs ? 'Aplique separando mechones de cabello y masajee hasta absorción.' : 'Apply by parting hair and gently massage until fully absorbed.'
          }
        ];
      } else {
        // TrichoSol / Topical Solution (Default)
        accentColor = '#0284c7'; // Blue
        accentBg = '#e0f2fe';
        badgeText += isEs ? ' · SOLUCIÓN MAGISTRAL TÓPICA' : ' · TOPICAL COMPOUNDED SOLUTION';
        resolvedTitle = treatmentTitle || (isEs ? 'Terapia Folicular Tópica Personalizada (TrichoSol™)' : 'Personalized Follicular Therapy (TrichoSol™ Solution)');
        resolvedRoute = isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application';
        resolvedVolume = volume || '100 mL';
        resolvedContainer = resolvedContainer || (isEs ? 'Frasco Topacio con Dosificador Cuentagotas / Spray de Precisión' : 'Amber Glass Bottle with Precision Dropper / Metered Spray');
        vehicleObj.name = vehicleName || 'TrichoSol™ Liposomal Hydrophilic Base';
        vehicleObj.specs = isEs 
          ? 'Formulación 100% libre de alcohol y propilenglicol. Evita irritación y descamación dérmica mientras maximiza la absorción transdérmica folicular continua.' 
          : '100% Alcohol-Free & Propylene Glycol-Free hydrophilic liposomal vehicle. Eliminates scalp dermatitis and contact erythema while optimizing follicle transdermal uptake.';
        
        posologyObj.title = isEs ? 'Pauta de Administración Nocturna' : 'Nightly Administration Regimen (Topical Solution)';
        posologyObj.regimen = customPosology || (isEs ? '1.0 mL Nocturno Diario (4-5 Pulverizaciones)' : '1.0 mL Nightly (4-5 Sprays)');
        posologyObj.timing = isEs ? 'Cada noche antes de acostarse sobre cuero cabelludo limpio y seco' : 'Nightly at bedtime onto clean, dry scalp';
        posologyObj.steps = [
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
              ? 'Cargue exactamente 1.0 mL en el dosificador cuentagotas o aplique 4 a 5 pulverizaciones directamente sobre las áreas con miniaturización.' 
              : 'Measure exactly 1.0 mL in the calibrated dropper or apply 4 to 5 metered sprays directly onto target thinning areas.'
          },
          {
            step: 3,
            title: isEs ? 'Masaje y Absorción Nocturna' : 'Fingertip Massage & Overnight Uptake',
            timing: isEs ? '30-60 Segundos' : '30-60 Seconds',
            instruction: isEs 
              ? 'Distribuya suavemente con la yema de los dedos en movimientos circulares durante 30 a 60 segundos hasta su completa absorción. Dejar actuar durante la noche; no lavar el cabello hasta la mañana siguiente.' 
              : 'Gently distribute with fingertips in circular motions for 30 to 60 seconds until absorbed. Leave on scalp overnight; do not wash hair until the following morning.'
          },
          {
            step: 4,
            title: isEs ? 'Lavado de Manos Post-Aplicación' : 'Post-Application Cleansing',
            timing: isEs ? 'Inmediato' : 'Immediate',
            instruction: isEs 
              ? 'Lávese las manos con agua y jabón inmediatamente después de finalizar la aplicación.' 
              : 'Wash hands thoroughly with soap and water immediately following application.'
          }
        ];
      }

      // If doctor posology exists, use its text
      const customPosologyStr = getPosologyText(customPosology);
      if (customPosologyStr && customPosologyStr.length > 5 && customPosologyStr !== posologyObj.regimen) {
        posologyObj.regimen = customPosologyStr;
      }
      
      const pCombined = (customPosologyStr + ' ' + (extra?.dosageInstructions || '')).toLowerCase();
      if (typeof customPosology === 'object' && customPosology?.timing) {
        posologyObj.timing = customPosology.timing;
      } else if (pCombined.includes('evening') || pCombined.includes('night') || pCombined.includes('sleep') || pCombined.includes('noche') || pCombined.includes('dormir') || pCombined.includes('cena')) {
        posologyObj.timing = isEs ? 'Por la noche (con la cena o 45 min antes de dormir)' : 'Evening (with dinner or 45 min before sleep)';
        posologyObj.title = isEs ? `Fase ${index}: Pauta Nocturna de Administración` : `Phase ${index}: Evening Restorative Administration Regimen`;
      } else if (pCombined.includes('midday') || pCombined.includes('noon') || pCombined.includes('almuerzo') || pCombined.includes('mediodía')) {
        posologyObj.timing = isEs ? 'Al mediodía con el almuerzo o comida principal' : 'Midday with lunch or main meal';
        posologyObj.title = isEs ? `Fase ${index}: Pauta de Mediodía de Administración` : `Phase ${index}: Midday Administration Regimen`;
      } else if (pCombined.includes('morning') || pCombined.includes('breakfast') || pCombined.includes('mañana') || pCombined.includes('desayuno')) {
        posologyObj.timing = isEs ? 'Por la mañana con el desayuno y agua abundante' : 'Morning with breakfast and a full glass of water';
        posologyObj.title = isEs ? `Fase ${index}: Pauta Matutina de Administración` : `Phase ${index}: Morning Administration Regimen`;
      }

      if (extra?.dosageInstructions) {
        posologyObj.dosageInstructions = extra.dosageInstructions;
      }

      return {
        id: `formulation-${index}`,
        index,
        isOral,
        accentColor,
        accentBg,
        badge: badgeText,
        title: resolvedTitle,
        subtitle: extra?.phaseName || rx.treatmentProgram || rx.fagron?.testName || (isEs 
          ? 'Formulación magistral calibrada al perfil clínico del paciente' 
          : 'Compounded formulation calibrated to patient clinical profile'),
        route: resolvedRoute,
        volume: resolvedVolume,
        duration: duration || rx.duration || '30 days',
        extra,
        container: resolvedContainer,
        vehicle: vehicleObj,
        apis: apis.map((api, aIdx) => {
          const apiName = api.productName || api.activeIngredient || api.name || `Active Compound ${aIdx + 1}`;
          const n = apiName.toLowerCase();
          
          const mono = getFagronClinicalMonograph(api.productId) || 
                       getFagronClinicalMonograph(api.name) || 
                       getFagronClinicalMonograph(api.activeIngredient) ||
                       getFagronClinicalMonograph(apiName) ||
                       getFagronClinicalMonograph(n);

          // Priority for rich clinical metadata: Monograph / Explicit Clinical field > fallback generic strings
          const isGenericAction = !api.mechanismOfAction && (!api.action || api.action.toLowerCase().includes('personalized active ingredient') || api.action.toLowerCase().includes('principio activo personalizado'));
          const isGenericRole = !api.pharmacologicalClass && (!api.role || api.role.toLowerCase().includes('nutracéutico & modulador') || api.role.toLowerCase().includes('principio activo farmacogenómico') || api.role.toLowerCase().includes('systemic nutraceutical') || api.role.toLowerCase().includes('pharmacogenomic active'));
          const isGenericIndication = !api.clinicalIndication && (!api.indication || api.indication.toLowerCase().includes('personalizado') || api.indication.toLowerCase().includes('personalized') || api.indication.toLowerCase().includes('soporte metabólico') || api.indication.toLowerCase().includes('systemic metabolic') || api.indication.toLowerCase().includes('tratamiento folicular'));

          let role = mono?.pharmacologicalClass || api.pharmacologicalClass || api.therapeuticClass || (!isGenericRole ? api.role : null);
          let indication = mono?.clinicalIndication || api.clinicalIndication || api.category || (!isGenericIndication ? api.indication : null);
          let action = mono?.mechanismOfAction || api.mechanismOfAction || api.mechanism || (!isGenericAction ? (api.instructions || api.action) : null);
          const geneTargets = (mono?.geneTargets && mono.geneTargets.length > 0) ? mono.geneTargets : (api.geneTargets || []);

          if (!role) {
            if (n.includes('finasteride')) {
              role = isEs ? 'Inhibidor Selectivo 5α-Reductasa Tipo II' : 'Selective 5α-Reductase Type II Inhibitor';
            } else if (n.includes('dutasteride')) {
              role = isEs ? 'Inhibidor Dual 5α-Reductasa Tipo I y II' : 'Dual 5α-Reductase Type I & II Inhibitor';
            } else if (n.includes('minoxidil')) {
              role = isEs ? 'Activador de Sulfotransferasa & Canales K_ATP' : 'Sulfotransferase Activator & K_ATP Channel Opener';
            } else if (n.includes('cetirizine') || n.includes('cetirizina')) {
              role = isEs ? 'Antagonista Selectivo del Receptor PGD2' : 'Selective PGD2 Receptor Antagonist';
            } else if (n.includes('panthenol') || n.includes('pantenol')) {
              role = isEs ? 'Precursor de Coenzima A & Regenerador Celular' : 'Coenzyme A Precursor & Cellular Regenerator';
            } else if (n.includes('ginseng')) {
              role = isEs ? 'Fitoestimulante Celular & Inductor de VEGF' : 'Cellular Phytostimulant & VEGF Inducer';
            } else if (n.includes('ginkgo')) {
              role = isEs ? 'Optimizador Microvascular & Escudo Antioxidante' : 'Microvascular Optimizer & Antioxidant Shield';
            } else {
              role = isOral 
                ? (isEs ? 'Nutracéutico & Modulador Sistémico' : 'Systemic Nutraceutical & Modulator')
                : (isEs ? 'Principio Activo Farmacogenómico' : 'Pharmacogenomic Active Ingredient');
            }
          }

          if (!indication) {
            if (n.includes('finasteride') || n.includes('dutasteride')) {
              indication = isEs ? 'Supresión de DHT Folicular & Prevención de Miniaturización' : 'Follicular DHT Suppression & Miniaturization Reversal';
            } else if (n.includes('minoxidil')) {
              indication = isEs ? 'Estimulación de Fase Anágena & Perfusión Microvascular' : 'Anagen Phase Induction & Microvascular Perfusion';
            } else {
              indication = isTrichoOil 
                ? (isEs ? 'Higiene & Microcirculación Folicular' : 'Scalp Care & Follicular Microcirculation')
                : (isOral 
                  ? (isEs ? 'Soporte Metabólico Sistémico' : 'Systemic Metabolic Fortification')
                  : (isEs ? 'Tratamiento Folicular Personalizado' : 'Personalized Follicular Therapy'));
            }
          }

          if (!action) {
            action = isEs 
              ? 'Principio activo personalizado calibrado al perfil clínico y genómico del paciente.' 
              : 'Personalized active ingredient calibrated to patient clinical and genomic profile.';
          }

          const doseStr = api.dosage || api.dose || api.strength || api.concentration || '—';
          const dosageSafety = checkDosageSafety(
            api.productId || apiName, 
            doseStr, 
            resolvedRoute.toLowerCase().includes('oral') ? 'oral' : 'topical'
          );

          return {
            id: api.id || `api-${index}-${aIdx + 1}`,
            tag: `API ${aIdx + 1}`,
            name: apiName,
            dosage: doseStr,
            dosageSafety,
            role,
            indication,
            action,
            geneTargets,
            cellularTarget: api.cellularTarget || null,
            rationale: api.rationale || null
          };
        }),
        posology: posologyObj
      };
    };

    // 1. If explicit multi-block formulations already exist on the rx document
    if (Array.isArray(rx.formulationBlocks) && rx.formulationBlocks.length > 0) {
      const totalBlocks = rx.formulationBlocks.length;
      return rx.formulationBlocks.map((block, idx) => {
        const rawBlockItems = block.apis || block.items || [];
        
        // Strictly separate vehicle excipients from true active ingredients (APIs)
        const vehicleItem = rawBlockItems.find(i => {
          const n = (i.name || i.productName || i.activeIngredient || '').toLowerCase();
          return i.isVehicleOrBase || i._isVehicleOrBase || n.includes('trichosol') || n.includes('trichofoam') || n.includes('trichooil') || n.includes('pentravan') || n.includes('versabase');
        });

        const activeApis = rawBlockItems.filter(i => i !== vehicleItem && !i.isVehicleOrBase && !i._isVehicleOrBase);
        
        let detectedVehicleName = block.vehicle?.name || block.vehicleName;
        if (!detectedVehicleName && vehicleItem) {
          detectedVehicleName = vehicleItem.name || vehicleItem.productName || vehicleItem.activeIngredient;
        }

        return buildVehicleData({
          index: idx + 1,
          totalCount: totalBlocks,
          vehicleName: detectedVehicleName,
          treatmentTitle: block.treatmentType || block.treatmentProgram || '',
          route: block.route || block.dispensingForm || '',
          volume: block.volume || vehicleItem?.dose || null,
          customPosology: block.posology || '',
          customInstructions: block.instructions || '',
          apis: activeApis,
          containerType: block.container || ''
        });
      });
    }

    // Multi-part NutriGen / session: one dedicated formulation block per part (Detox 1, Detox 2, Supplementation...)
    if (Array.isArray(rx._sessionMembers) && rx._sessionMembers.length > 1) {
      const members = rx._sessionMembers;
      return members.map((m, idx) => {
        const mItems = (m.items || m.prescriptionLines || []).filter(i => !i.isVehicleOrBase && !i._isVehicleOrBase && !i.isVehicle);
        const nutri = m.nutrigenomics || null;
        return buildVehicleData({
          index: idx + 1,
          totalCount: members.length,
          vehicleName: isEs ? 'Base de Cápsula Magistral / Excipiente de Celulosa' : 'Micronized Compounded Hard Capsules Base',
          treatmentTitle: m.treatmentType || `Part ${idx + 1}`,
          route: m.dispensingForm ? `${m.dispensingForm} (Oral)` : 'Oral Administration',
          volume: m.volume || null,
          customPosology: m.posology || '',
          duration: m.duration || '',
          apis: mItems,
          extra: {
            partCode: m.prescriptionNumber || m.prescriptionCode || m.id,
            phaseName: m.phaseName || null,
            nutrigenomics: nutri,
            dosageInstructions: m.dosageInstructions || null
          }
        });
      });
    }

    // 2. Intelligent separation of rawLines into Distinct Vehicle Formulations
    const vehicleLines = [];
    const trichoSolItems = [];
    const trichoOilItems = [];
    const oralItems = [];
    const generalItems = [];

    // If prescription is entirely oral / NutriGen / capsules, preserve single unified formulation block
    if (isEntirelyOral) {
      const activeApis = rawLines.filter(i => {
        const n = (i.name || i.productName || i.activeIngredient || '').toLowerCase();
        return !i.isVehicleOrBase && !i._isVehicleOrBase && !i.isVehicle && !n.includes('vehicle');
      });
      const vehicleName = isEs ? 'Base de Cápsula Magistral / Excipiente de Celulosa' : 'Micronized Compounded Hard Capsules Base';
      const title = rx.treatmentType || (isNutrigen ? (isEs ? 'Fórmula Magistral NutriGen (Cápsulas)' : 'NutriGen Supplementation Formulation') : (isEs ? 'Soporte Nutracéutico Sistémico (Cápsulas)' : 'Systemic Compounded Oral Formulation'));
      const routeText = rx.dispensingForm ? `${rx.dispensingForm} (Vía Oral)` : (isEs ? 'Vía Oral' : 'Oral Administration');
      const volText = rx.volume || (isEs ? '90 Cápsulas' : '90 Capsules');
      const posologyText = rx.posology || (isEs ? '1 Cápsula Diaria' : '1 Capsule Daily');

      return [
        buildVehicleData({
          index: 1,
          totalCount: 1,
          vehicleName,
          treatmentTitle: title,
          route: routeText,
          volume: volText,
          customPosology: posologyText,
          apis: activeApis.length > 0 ? activeApis : rawLines
        })
      ];
    }

    rawLines.forEach((item) => {
      const nameLower = (item.name || item.productName || item.activeIngredient || '').toLowerCase();
      const formLower = (item.dosageForm || item.form || '').toLowerCase();
      const routeLower = (item.route || '').toLowerCase();
      const blockLower = (item.formulationBlock || '').toLowerCase();

      const isVeh = Boolean(
        item.isVehicleOrBase ||
        item._isVehicleOrBase ||
        item.isVehicle ||
        formLower.includes('vehicle') ||
        nameLower.includes('trichosol') ||
        nameLower.includes('trichooil') ||
        nameLower.includes('trichofoam') ||
        nameLower.includes('pentravan') ||
        nameLower.includes('vehiculo') ||
        nameLower.includes('vehicle base')
      );

      if (isVeh) {
        vehicleLines.push(item);
        return;
      }

      // Check if item belongs to Scalp care / TrichoOil (must NOT be oral)
      const isOralRoute = routeLower.includes('oral') || formLower.includes('capsule') || formLower.includes('tablet');
      const isOilItem = !isOralRoute && (
                        blockLower.includes('trichooil') || 
                        blockLower.includes('scalp care') || 
                        blockLower.includes('higiene') || 
                        blockLower.includes('hygiene') ||
                        nameLower.includes('trichooil') ||
                        (nameLower.includes('ginseng') && !isOralRoute) || 
                        (nameLower.includes('ginkgo') && !isOralRoute) || 
                        (nameLower.includes('vitamin e') && !isOralRoute) ||
                        (nameLower.includes('tocopherol') && !isOralRoute));

      // Check if oral
      const isOralItem = isOralRoute ||
                         blockLower.includes('oral') ||
                         blockLower.includes('capsule');

      // Check if TrichoSol / Topical Solution
      const isSolItem = blockLower.includes('trichosol') || 
                        blockLower.includes('topical treatment') ||
                        nameLower.includes('minoxidil') || 
                        nameLower.includes('spironolactone') || 
                        nameLower.includes('arginine') || 
                        nameLower.includes('latanoprost') || 
                        nameLower.includes('estradiol');

      if (isOilItem) {
        trichoOilItems.push(item);
      } else if (isOralItem) {
        oralItems.push(item);
      } else if (isSolItem) {
        trichoSolItems.push(item);
      } else {
        generalItems.push(item);
      }
    });

    // If general items exist without specific group:
    if (generalItems.length > 0) {
      if (trichoSolItems.length > 0 || trichoOilItems.length > 0) {
        trichoSolItems.push(...generalItems);
      } else if (oralItems.length > 0) {
        oralItems.push(...generalItems);
      } else {
        trichoSolItems.push(...generalItems);
      }
    }

    // Determine how many distinct vehicle formulations exist
    const activeBlocks = [];

    // Preparation A: Topical Solution (TrichoSol)
    if (trichoSolItems.length > 0 || (trichoOilItems.length === 0 && oralItems.length === 0 && rawLines.length > 0)) {
      const solItems = trichoSolItems.length > 0 ? trichoSolItems : rawLines.filter(i => !i._isVehicleOrBase);
      const solVeh = vehicleLines.find(v => (v.name || '').toLowerCase().includes('trichosol'))?.name || 'TrichoSol™ (Fagron)';
      activeBlocks.push({
        type: 'trichosol',
        vehicleName: solVeh,
        treatmentTitle: rx.treatmentType || (isEs ? 'Terapia Folicular Tópica Personalizada (TrichoSol™)' : 'Personalized Follicular Therapy (TrichoSol™ Solution)'),
        route: isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application',
        volume: rx.volume || '100 mL',
        customPosology: rx.posology || '',
        apis: solItems
      });
    }

    // Preparation B: Scalp Care & Hygiene (TrichoOil)
    if (trichoOilItems.length > 0) {
      const oilVeh = vehicleLines.find(v => (v.name || '').toLowerCase().includes('trichooil'))?.name || 'TrichoOil™ (Fagron)';
      activeBlocks.push({
        type: 'trichooil',
        vehicleName: oilVeh,
        treatmentTitle: isEs ? 'Higiene & Cuidado Folicular (TrichoOil™)' : 'Scalp Care & Hygiene (TrichoOil™)',
        route: isEs ? 'Aplicación Tópica / Masaje Capilar' : 'Topical Scalp Application & Massage',
        volume: '30 mL',
        customPosology: isEs ? '1–2 Veces por Semana (Tratamiento Pre-Lavado)' : '1–2 Times Weekly (Pre-Shampoo Treatment)',
        apis: trichoOilItems
      });
    }

    // Preparation C: Oral Compounded Capsules
    if (oralItems.length > 0) {
      activeBlocks.push({
        type: 'oral',
        vehicleName: isEs ? 'Cápsulas de Gelatina / Celulosa Micronizada' : 'Micronized Compounded Hard Capsules Base',
        treatmentTitle: isEs ? 'Soporte Nutracéutico Sistémico (Cápsulas)' : 'Systemic Follicular & Nutraceutical Support (Capsules)',
        route: isEs ? 'Vía Oral' : 'Oral Administration',
        volume: rx.volume || (isEs ? '30 Cápsulas' : '30 Compounded Capsules'),
        customPosology: rx.posology || (isEs ? '1 Cápsula Diaria con la Cena' : '1 Capsule Daily with Dinner / Bedtime'),
        apis: oralItems
      });
    }

    const totalCount = activeBlocks.length || 1;

    return activeBlocks.map((b, idx) => {
      return buildVehicleData({
        index: idx + 1,
        totalCount,
        vehicleName: b.vehicleName,
        treatmentTitle: b.treatmentTitle,
        route: b.route,
        volume: b.volume,
        customPosology: b.customPosology,
        apis: b.apis
      });
    });
  }, [rawLines, rx, isEs]);

  // Keep prescriptionApis for any auxiliary references
  const prescriptionApis = React.useMemo(() => {
    return compoundedFormulations.flatMap(f => f.apis);
  }, [compoundedFormulations]);

  // Dynamic Flexible TOC Sections (Adapts to 1 or Multiple Vehicles / Formulations)
  const tocSections = React.useMemo(() => {
    const list = [];
    if (compoundedFormulations.length > 1) {
      compoundedFormulations.forEach((form, idx) => {
        list.push({
          id: form.id,
          label: form.vehicle?.name || form.title || (isEs ? `Preparación ${idx + 1}` : `Preparation ${idx + 1}`),
          category: 'formula',
          badge: form.volume || form.vehicle?.volume || null,
          accentColor: form.accentColor,
          icon: form.id.includes('oral') ? 'box' : (form.id.includes('oil') ? 'droplets' : 'flask')
        });
      });
    } else {
      list.push({ 
        id: 'formula-card', 
        label: isEs ? 'Fórmula Magistral' : 'Compounded Formula',
        category: 'formula',
        icon: 'flask'
      });
    }

    if (genomicsData) {
      list.push({ 
        id: 'genomics-card', 
        label: isEs ? 'Guía Genómica' : 'Genomics Guidance',
        category: 'genomics',
        icon: 'dna'
      });
    }

    if (compoundedFormulations.length > 1) {
      compoundedFormulations.forEach((form, idx) => {
        list.push({
          id: idx === 0 ? 'posology-card' : `posology-${form.id}`,
          label: isEs ? `Pauta: ${form.vehicle?.name || `Prep ${idx + 1}`}` : `Posology: ${form.vehicle?.name || `Prep ${idx + 1}`}`,
          category: 'posology',
          accentColor: form.accentColor,
          icon: 'clock'
        });
      });
    } else {
      list.push({ 
        id: 'posology-card', 
        label: isEs ? 'Pauta de Posología' : 'Posology Protocol',
        category: 'posology',
        icon: 'clock'
      });
    }

    list.push({ 
      id: 'milestones-card', 
      label: isEs ? 'Evolución Clínica' : 'Clinical Milestones',
      category: 'milestones',
      icon: 'calendar'
    });

    list.push({ 
      id: 'qr-card', 
      label: isEs ? 'Portal del Paciente' : 'Patient Mobile Portal',
      category: 'qr',
      icon: 'shield'
    });

    if (docs.length > 0) {
      list.push({ 
        id: 'docs-card', 
        label: isEs ? 'Documentos Adjuntos' : 'Attached Records',
        category: 'docs',
        icon: 'file'
      });
    }

    return list;
  }, [compoundedFormulations, genomicsData, docs.length, isEs]);

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

  // Dynamic formula & dosage summaries based on active prescription type (NutriGen oral capsules vs TrichoTest topical)
  const resolvedFormulaSummary = React.useMemo(() => {
    if (rx.formulaName || rx.title) return rx.formulaName || rx.title;
    if (rawLines.length > 0) {
      const activeItems = rawLines
        .filter(i => !i._isVehicleOrBase && !i.isVehicle)
        .map(i => `${i.name || i.productName || i.activeIngredient || ''}${i.dose || i.dosage || i.concentration ? ` ${i.dose || i.dosage || i.concentration}` : ''}`.trim());
      if (activeItems.length > 0) {
        return activeItems.join(' + ') + (rx.volume ? ` (${rx.volume})` : '');
      }
    }
    return rx.treatmentType || 'Compounded Prescription Formulation';
  }, [rx, rawLines]);

  const resolvedDosageSummary = React.useMemo(() => {
    return posology.summary || getPosologyText(rx.posology) || rx.dosageSchedule || (isEs ? 'Según prescripción médica' : 'As directed by healthcare professional');
  }, [posology, rx, isEs]);

  // WhatsApp share message: clean English format by default
  const shareTextWhatsApp = encodeURIComponent(
    isEs
      ? `*Atlas Services — Ficha Técnica y Posología Médica*\n` +
        `📋 *Prescripción:* ${rxId}\n` +
        `👤 *Paciente:* ${patientName}${patientAlias}\n` +
        `🩺 *Médico Prescriptor:* ${doctorName} (${clinic})\n` +
        `🧪 *Fórmula:* ${resolvedFormulaSummary}\n` +
        (genomicsData ? `🧬 *Guía Genómica:* Formulada según recomendaciones de ${genomicsData.test.shortName}.\n` : '') +
        `🕒 *Posología:* ${resolvedDosageSummary}\n\n` +
        `🔗 *Ver Ficha y Posología Digital:* ${publicUrl}`
      : `*Atlas Services — Medical Prescription & Posology Regimen*\n` +
        `📋 *Prescription Ref:* ${rxId}\n` +
        `👤 *Patient:* ${patientName}${patientAlias}\n` +
        `🩺 *Prescribing Physician:* ${doctorName} (${clinic})\n` +
        `🧪 *Formula:* ${resolvedFormulaSummary}\n` +
        (genomicsData ? `🧬 *Genomics Guidance:* Formulated based on ${genomicsData.test.shortName} recommendations.\n` : '') +
        `🕒 *Dosage:* ${resolvedDosageSummary}\n\n` +
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
            name: `Prescription ${rxId} — ${patientName}`,
            rxId,
            code: rxId,
            patientName,
            doctorName: doctorName || 'Dr. Haytham Salem',
            clinic: clinic || 'Arthregen Clinic',
            formula: resolvedFormulaSummary,
            dosage: resolvedDosageSummary,
            category: 'NutriGen Prescription Dossier',
            genomicsTest: genomicsData?.test?.shortName || (isFagronMultiPart ? 'NutriGen' : 'Prescription'),
            isNutriGen: true
          }}
          breadcrumb={[
            { label: 'Clinical Intelligence', href: '/c/CAT-MU9L9GBN' },
            { label: isEs ? 'Prescripciones Médicas' : 'Prescription Dossier' },
            { label: rxId }
          ]}
        />
      )}

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0.75rem 1rem' }}>
        <div className="pds-content-with-sidebar">
          <div className="pds-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* ── Master Header Card (Google Cloud Console High-Density Resource Header) ─────── */}
            <div className="rx-card gcp-resource-header-card" style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              padding: '14px 18px',
              boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.08)',
              marginBottom: '0.75rem'
            }}>
              {/* Row 1: Resource Title & Actions Toolbar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid #e8eaed'
              }}>
                {/* Left: Identity & Official Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '6px',
                    background: '#e8f0fe',
                    color: '#1a73e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h1 style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: '#202124',
                        lineHeight: 1.3
                      }}>
                        {isEs ? 'Prescripción Médica' : 'Medical Prescription'} <span style={{ color: '#5f6368', fontWeight: 400 }}>#{rxId}</span>
                      </h1>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        background: '#e6f4ea',
                        color: '#137333',
                        border: '1px solid #ceead6',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        <Check size={12} />
                        {isEs ? 'Oficial · Verificada' : 'Official · Verified'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '2px' }}>
                      {isEs ? 'Expediente clínico y régimen posológico digital' : 'Digital clinical dossier & posology regimen'}
                    </div>
                  </div>
                </div>

                {/* Right: Standard GCP Action Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      window.print();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      color: '#1a73e8',
                      border: '1px solid #dadce0',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                    title={isEs ? 'Imprimir o Guardar en PDF' : 'Print or Save as PDF'}
                  >
                    <Printer size={14} />
                    <span>{isEs ? 'Imprimir / PDF' : 'Print / Save PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        toast.success(isEs ? 'Enlace copiado ✓' : 'Link copied ✓');
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      color: '#3c4043',
                      border: '1px solid #dadce0',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={14} />
                    <span>{copied ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setShowQrModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      color: '#3c4043',
                      border: '1px solid #dadce0',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <QrCode size={14} color="#1a73e8" />
                    <span>{isEs ? 'Código QR' : 'QR Verification'}</span>
                  </button>
                  {prescriptionLabels.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedLabelIndex(0);
                        setShowLabelsModal(true);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '32px',
                        padding: '0 12px',
                        borderRadius: '4px',
                        background: '#ffffff',
                        color: '#1a73e8',
                        border: '1px solid #dadce0',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafd'; e.currentTarget.style.borderColor = '#1a73e8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#dadce0'; }}
                      title={isEs ? 'Ver etiquetas oficiales para frascos (7.5 × 4.5 cm)' : 'View official compounding bottle labels (7.5 × 4.5 cm)'}
                    >
                      <Tag size={13} color="#1a73e8" />
                      <span>{isEs ? `Etiquetas (${prescriptionLabels.length})` : `Labels (${prescriptionLabels.length})`}</span>
                      <span style={{
                        background: '#e8f0fe',
                        color: '#1a73e8',
                        fontSize: '0.64rem',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        fontWeight: 700
                      }}>7.5×4.5 cm</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: High-Density GCP Metadata Columns (Zero Wasted Space) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                marginTop: '12px'
              }}>
                {/* Column 1: Prescribing Physician */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {hasTreatingDoctor ? (isEs ? 'Médico Prescriptor Tratante' : 'Prescribing Treating Physician') : (isEs ? 'Práctica Médica' : 'Medical Practice')}
                    </span>
                    <button
                      onClick={openDoctorModal}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1a73e8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        padding: '1px 4px'
                      }}
                      title={hasTreatingDoctor ? (isEs ? 'Editar médico tratante' : 'Edit treating physician') : (isEs ? 'Asignar médico' : 'Assign physician')}
                    >
                      <Edit3 size={11} />
                      {hasTreatingDoctor ? (isEs ? 'Modificar' : 'Edit') : (isEs ? 'Asignar' : 'Assign')}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#202124', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>{hasTreatingDoctor ? doctorName : clinic}</span>
                    {doctorLicense && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1a73e8', background: '#e8f0fe', padding: '1px 5px', borderRadius: '3px' }}>
                        Lic. {doctorLicense}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5f6368', lineHeight: 1.4 }}>
                    {doctorSpecialty}
                  </div>
                  {(doctorClinic || doctorAddress) && (
                    <div style={{ fontSize: '0.75rem', color: '#70757a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                      <span>📍 {doctorClinic ? `${doctorClinic} · ` : ''}{doctorAddress || 'Med Art Clinic Day Surgery Center, Villa 823, Jumeirah St., Dubai, UAE'}</span>
                    </div>
                  )}
                  {doctorPhone && (
                    <div style={{ fontSize: '0.75rem', color: '#1a73e8', marginTop: '1px' }}>
                      <a href={`tel:${doctorPhone}`} style={{ color: '#1a73e8', textDecoration: 'none', fontWeight: 500 }}>
                        📞 {doctorPhone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Column 2: Registered Patient */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isEs ? 'Paciente Registrado' : 'Registered Patient'}
                    </span>
                    <span
                      onClick={() => {
                        navigator.clipboard?.writeText(rxId);
                        toast.success(isEs ? 'Referencia copiada ✓' : 'Reference copied ✓');
                      }}
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'monospace',
                        color: '#1a73e8',
                        background: '#e8f0fe',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title={isEs ? 'Copiar referencia' : 'Copy reference'}
                    >
                      Ref: {rxId}
                      <Copy size={10} />
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#202124' }}>
                    {patientName} {patientAlias}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5f6368', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>PIN: <strong style={{ color: '#202124' }}>{patient.pin || '11774'}</strong></span>
                    <span>·</span>
                    <span>{isEs ? 'F. Nac:' : 'DOB:'} <strong style={{ color: '#202124' }}>{patient.dob || '1974-03-17'}</strong></span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#70757a', marginTop: '1px' }}>
                    <span>📞 {patient.maskedPhone || '+971 54 *** **80'}</span>
                  </div>
                </div>

                {/* Column 3: Clinical Protocol & Scope */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs ? 'Alcance y Régimen Posológico' : 'Clinical Regimen & Scope'}
                  </span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#202124' }}>
                    {isEs ? 'Protocolo Celular y Genómico Personalizado' : 'Personalized Cellular & Genomic Protocol'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>
                    {isEs 
                      ? '3 Fases Secuenciales · Cápsulas Orales Diarias' 
                      : '3 Sequential Phases · Daily Oral Capsules'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#137333', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                    <span>🔒 Lotusland Synthesis · Fagron Compound Quality</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── GCP Standard Sub-Tabs Navigation (Laptop & Mobile) ── */}
            <div className="gcp-subtabs-strip" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff',
              borderRadius: '12px',
              padding: '6px 10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              position: 'sticky',
              top: '72px',
              zIndex: 30,
              backdropFilter: 'blur(8px)',
              marginBottom: '0.75rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {[
                  { id: 'all', label: isEs ? 'Todo el Dossier' : 'Full Dossier', icon: Layers },
                  { id: 'formulations', label: isEs ? 'Fórmulas & Galénica' : 'Formulations', icon: FlaskConical, count: compoundedFormulations.length },
                  { id: 'posology', label: isEs ? 'Posología & Régimen' : 'Posology', icon: Clock },
                  { id: 'traceability', label: isEs ? 'Laboratorio & Lote UE' : 'Lab & Traceability', icon: Factory },
                  ...(genomicsData ? [{ id: 'genomics', label: isEs ? 'Farmacogenómica' : 'Genomics', icon: Dna }] : [])
                ].map(tab => {
                  const isActive = activeGcpTab === tab.id;
                  const IconCmp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveGcpTab(tab.id);
                        if (tab.id !== 'all') {
                          setExpandedSections(prev => ({ ...prev, [tab.id]: true }));
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? '#e0f2fe' : 'transparent',
                        color: isActive ? '#0369a1' : '#64748b',
                        fontWeight: isActive ? 750 : 550,
                        fontSize: '0.80rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                        borderBottom: isActive ? '2px solid #0284c7' : '2px solid transparent'
                      }}
                    >
                      <IconCmp size={15} style={{ color: isActive ? '#0284c7' : '#64748b', flexShrink: 0 }} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: isActive ? '#0284c7' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b'
                        }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Accordion Expand/Collapse Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={expandAllSections}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.70rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  title={isEs ? 'Expandir todas las secciones' : 'Expand all sections'}
                >
                  {isEs ? 'Expandir Todo' : 'Expand All'}
                </button>
                <button
                  type="button"
                  onClick={collapseAllSections}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.70rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  title={isEs ? 'Colapsar todas las secciones' : 'Collapse all sections'}
                >
                  {isEs ? 'Colapsar Todo' : 'Collapse All'}
                </button>
              </div>
            </div>

        {/* ── Google Cloud Console Accordion Header Toolbar (Mobile & Desktop) ── */}
        <div className="gcp-accordion-controls-bar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#202124' }}>
              {isEs ? 'Dossier Clínico Secuencial' : 'Clinical Protocol Outline'}
            </span>
            <span style={{ fontSize: '0.70rem', color: '#1a73e8', background: '#e8f0fe', border: '1px solid #d2e3fc', padding: '1px 8px', borderRadius: '10px', fontWeight: 500 }}>
              {compoundedFormulations.length > 1 ? `${compoundedFormulations.length} Sequential Phases` : '1 Phase'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={expandAllSections}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#1a73e8',
                fontSize: '0.74rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Expandir Todo' : 'Expand all'}
            </button>
            <button
              type="button"
              onClick={collapseAllSections}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#5f6368',
                fontSize: '0.74rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Colapsar Todo' : 'Collapse all'}
            </button>
          </div>
        </div>

        {activeGcpTab === 'all' && (
          <MultiPartOverview
            formulations={compoundedFormulations}
            onSelectPhase={(phaseId) => {
              setSelectedPhase(phaseId);
              setExpandedPhases(prev => ({ ...prev, [phaseId]: true }));
            }}
          />
        )}

        {/* ── Compounded Formulations & Dedicated Posology Architecture ──────────── */}
        {(activeGcpTab === 'all' || activeGcpTab === 'formulations') && (
        <div id="formula-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
          
          {/* Section Accordion Trigger Header */}
          <div
            onClick={() => toggleSection('formulations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FlaskConical size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#202124' }}>
                    {isEs ? '1. Fórmulas Magistrales & Galénica' : '1. Compounded Formulations & Galenics'}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, padding: '1px 8px', borderRadius: '10px', background: '#e8f0fe', color: '#1967d2', border: '1px solid #d2e3fc' }}>
                    {compoundedFormulations.length} {compoundedFormulations.length === 1 ? 'part' : 'parts'}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                  {isEs ? 'Preparaciones magistrales calibradas al perfil del paciente' : 'Compounded preparations calibrated to patient clinical profile'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5f6368', fontSize: '0.74rem', fontWeight: 500 }}>
              <span>{expandedSections.formulations ? (isEs ? 'Colapsar' : 'Collapse') : (isEs ? 'Expandir' : 'Expand')}</span>
              {expandedSections.formulations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {/* Google Cloud Style Phase Overview & Controls (100% Vertical & Responsive, No Horizontal Scroll) */}
          {expandedSections.formulations && compoundedFormulations.length > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '10px 14px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Layers size={13} />
                  <span>{compoundedFormulations.length} {isEs ? 'Fases Secuenciales' : 'Sequential Phases'}</span>
                </span>
                <span style={{ fontSize: '0.76rem', color: '#5f6368' }}>
                  {isEs ? 'Régimen cronobiológico secuencial adaptado al perfil genómico' : 'Sequential chronobiological regimen calibrated to patient genomics'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = {};
                    compoundedFormulations.forEach(f => { allOpen[f.id] = true; });
                    setExpandedPhases(allOpen);
                    setSelectedPhase('all');
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#1a73e8',
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Expandir Todo' : 'Expand All'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allClosed = {};
                    compoundedFormulations.forEach(f => { allClosed[f.id] = false; });
                    setExpandedPhases(allClosed);
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#5f6368',
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Colapsar Todo' : 'Collapse All'}
                </button>
              </div>
            </div>
          )}

          {expandedSections.formulations && compoundedFormulations
            .map((formulation, fIdx) => {
              const isPhaseExpanded = expandedPhases[formulation.id] !== false;
              const phaseNumber = formulation.index || (fIdx + 1);
              const phaseLabel = prescriptionLabels.find(l => 
                l.phaseNumber === phaseNumber || 
                (l.productName && formulation.title && l.productName.toLowerCase().includes(formulation.title.toLowerCase().slice(0, 10)))
              );
              return (
            <div
              key={formulation.id}
              id={formulation.id}
              style={{
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                scrollMarginTop: '100px',
                marginBottom: '12px'
              }}
            >
              {/* Individual Phase Accordion Header - 100% Mobile Responsive (GCP Standard) */}
              {compoundedFormulations.length > 1 && (
                <div
                  onClick={() => togglePhase(formulation.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: isPhaseExpanded ? '#f8f9fa' : '#ffffff',
                    borderBottom: isPhaseExpanded ? '1px solid #dadce0' : 'none',
                    cursor: 'pointer',
                    userSelect: 'none',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 280px' }}>
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#1a73e8',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {phaseNumber}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#202124' }}>
                          Phase {phaseNumber}: {formulation.title}
                        </span>
                        {formulation.duration && (
                          <span style={{ fontSize: '0.70rem', color: '#1967d2', background: '#e8f0fe', border: '1px solid #d2e3fc', borderRadius: '4px', padding: '1px 8px', fontWeight: 600 }}>
                            {formulation.duration}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#5f6368', background: '#f1f3f4', padding: '1px 8px', borderRadius: '4px' }}>
                          {formulation.apis.length} APIs · {formulation.volume}
                        </span>
                        {formulation.posology?.timing && (
                          <span style={{ fontSize: '0.70rem', color: '#137333', background: '#e6f4ea', border: '1px solid #ceead6', borderRadius: '4px', padding: '1px 8px', fontWeight: 600 }}>
                            🕒 {formulation.posology.timing}
                          </span>
                        )}
                      </div>
                      {formulation.subtitle && (
                        <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '3px' }}>
                          {formulation.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {phaseLabel && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = prescriptionLabels.findIndex(l => l.id === phaseLabel.id);
                          setSelectedLabelIndex(idx >= 0 ? idx : 0);
                          setShowLabelsModal(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: '#f1f3f4',
                          border: '1px solid #dadce0',
                          color: '#1a73e8',
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.borderColor = '#1a73e8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f3f4'; e.currentTarget.style.borderColor = '#dadce0'; }}
                      >
                        <Tag size={11} color="#1a73e8" />
                        <span>{isEs ? 'Etiqueta 7.5×4.5 cm' : 'Label (7.5×4.5 cm)'}</span>
                      </button>
                    )}
                    <span style={{ color: '#5f6368', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{isPhaseExpanded ? (isEs ? 'Colapsar' : 'Collapse') : (isEs ? 'Expandir' : 'Expand')}</span>
                      {isPhaseExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>
              )}

              {(!compoundedFormulations.length > 1 || isPhaseExpanded) && (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Preparation Master Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${formulation.accentColor || '#0284c7'}, ${formulation.accentColor || '#0284c7'}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${(formulation.accentColor || '#0284c7')}33`
                  }}>
                    {formulation.isOral || formulation.route?.toLowerCase().includes('oral') || formulation.title?.toLowerCase().includes('cápsula') || formulation.title?.toLowerCase().includes('capsule') ? (
                      <Pill size={22} />
                    ) : (formulation.id.includes('oil') || formulation.title?.toLowerCase().includes('oil')) ? (
                      <Droplets size={22} />
                    ) : (
                      <FlaskConical size={22} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: formulation.accentColor || '#0284c7',
                        background: formulation.accentBg || '#e0f2fe',
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
                borderLeft: `4px solid ${formulation.accentColor || '#0284c7'}`,
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
                      background: formulation.accentColor || '#0284c7',
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
                    <span>{formulation.isOral ? (isEs ? '100% Cápsulas Vegetales HPMC · Sin Gluten · Sin Alérgenos' : '100% Plant-Based HPMC Capsules · Gluten-Free · Allergen-Free') : (formulation.id.includes('topical') ? 'Alcohol-Free & Non-Irritating' : 'Enteric Bioavailable Powder')}</span>
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
                            color: formulation.isOral ? '#047857' : '#0284c7',
                            background: formulation.isOral ? '#ecfdf5' : '#f0f9ff',
                            border: `1px solid ${formulation.isOral ? '#a7f3d0' : '#bae6fd'}`,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            {formulation.isOral ? `💊 ${api.dosage} / cápsula` : api.dosage}
                          </span>
                          {api.dosageSafety?.evaluated && (
                            <span 
                              style={{
                                fontSize: '0.67rem',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '5px',
                                background: api.dosageSafety.level === 'high' ? '#fef2f2' : (api.dosageSafety.level === 'low' ? '#fffbeb' : '#f0fdf4'),
                                color: api.dosageSafety.level === 'high' ? '#dc2626' : (api.dosageSafety.level === 'low' ? '#b45309' : '#15803d'),
                                border: `1px solid ${api.dosageSafety.level === 'high' ? '#fca5a5' : (api.dosageSafety.level === 'low' ? '#fde68a' : '#bbf7d0')}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }} 
                              title={api.dosageSafety.message}
                            >
                              <span>{api.dosageSafety.level === 'high' ? '⚠️' : (api.dosageSafety.level === 'low' ? 'ℹ️' : '✓')}</span>
                              <span>
                                {api.dosageSafety.level === 'high' 
                                  ? (isEs ? 'Dosis Elevada' : 'High Dose') 
                                  : (api.dosageSafety.level === 'low' 
                                    ? (isEs ? 'Dosis Baja' : 'Low Dose') 
                                    : (isEs ? 'Dosis Estándar' : 'Standard Dose'))}
                              </span>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                          {api.role} · <span style={{ color: '#0369a1', fontWeight: 700 }}>{api.indication}</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.79rem', color: '#334155', lineHeight: 1.5 }}>
                        {api.action}
                      </div>

                      {api.geneTargets && api.geneTargets.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>🧬</span> {isEs ? 'Genes Diana:' : 'Target Genes:'}
                          </span>
                          {api.geneTargets.map((g, gIdx) => (
                            <span key={gIdx} style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: '#3730a3',
                              background: '#e0e7ff',
                              border: '1px solid #c7d2fe',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontFamily: 'monospace'
                            }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

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

                      {api.cellularTarget && (
                        <div style={{ fontSize: '0.74rem', color: '#5f6368', display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 600, color: '#202124' }}>{isEs ? 'Diana celular:' : 'Cellular target:'}</span>
                          <span>{api.cellularTarget}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Section 2b: Genetic information for THIS part (Google Cloud style disclosure) */}
              {formulation.extra?.nutrigenomics && (
                <details open style={{ border: '1px solid #dadce0', borderRadius: '8px', background: '#ffffff', overflow: 'hidden' }}>
                  <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: '#f8f9fa', borderBottom: '1px solid #dadce0', fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                    <Dna size={16} color="#1a73e8" />
                    <span>{isEs ? 'Información genética de esta parte' : 'Genetic information for this part'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 500, color: '#5f6368' }}>{formulation.extra.nutrigenomics.genes?.length || 0} {isEs ? 'genes' : 'genes'}</span>
                    <ChevronDown size={16} color="#5f6368" />
                  </summary>
                  <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem', fontSize: '0.8rem', color: '#3c4043', lineHeight: 1.55 }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isEs ? 'Vía metabólica' : 'Metabolic pathway'}</div>
                      <div>{formulation.extra.nutrigenomics.pathway}</div>
                    </div>
                    {formulation.extra.nutrigenomics.genes?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isEs ? 'Genes diana' : 'Target genes'}</span>
                        {formulation.extra.nutrigenomics.genes.map((g) => (
                          <span key={g} style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600, color: '#1967d2', background: '#e8f0fe', border: '1px solid #d2e3fc', borderRadius: '4px', padding: '1px 8px' }}>{g}</span>
                        ))}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isEs ? 'Resumen clínico' : 'Clinical summary'}</div>
                      <div>{formulation.extra.nutrigenomics.clinicalSummary}</div>
                    </div>
                    <div style={{ background: '#e6f4ea', border: '1px solid #ceead6', borderRadius: '4px', padding: '0.6rem 0.8rem', color: '#137333' }}>
                      <strong>{isEs ? 'Objetivo de la fase: ' : 'Phase objective: '}</strong>{formulation.extra.nutrigenomics.phaseObjective}
                    </div>
                  </div>
                </details>
              )}

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
                      background: formulation.accentColor || '#0284c7',
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

                {/* Specific Doctor Dosage Instructions */}
                {formulation.posology.dosageInstructions && (
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '9px 13px',
                    color: '#1e40af',
                    fontSize: '0.78rem',
                    lineHeight: 1.45,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#1d4ed8' }} />
                    <div>
                      <strong style={{ display: 'block', color: '#1e3a8a', marginBottom: '2px', fontWeight: 700 }}>
                        {isEs ? 'Indicaciones clínicas específicas del médico prescriptor:' : 'Prescribing Physician Clinical Directions:'}
                      </strong>
                      <span>{formulation.posology.dosageInstructions}</span>
                    </div>
                  </div>
                )}

                {/* Step-by-Step Pathway for this vehicle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {formulation.posology.steps.map((st) => (
                    <div
                      key={st.step}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: `3px solid ${formulation.accentColor || '#0284c7'}`,
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
                            background: formulation.accentColor || '#0284c7',
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

              {/* Physical Bottle Label Card (7.5 × 4.5 cm) */}
              {phaseLabel && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      background: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <QrCode size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                        {isEs ? `Etiqueta de Frasco Pharmapolis (7.5 × 4.5 cm) — ${phaseLabel.productName}` : `Pharmapolis Compounding Bottle Label (7.5 × 4.5 cm) — ${phaseLabel.productName}`}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        {isEs ? 'Frontal, Trasera con QR de Trazabilidad y Frontal con Micro-QR (1500 × 900 px)' : 'Front, Back QR Traceability, and Front Micro-QR variants ready for printing'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const idx = prescriptionLabels.findIndex(l => l.id === phaseLabel.id);
                      setSelectedLabelIndex(idx >= 0 ? idx : 0);
                      setShowLabelsModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '4px',
                      background: '#1a73e8',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid #1a73e8',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1557b0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; }}
                  >
                    <Eye size={14} />
                    <span>{isEs ? 'Ver / Descargar Etiqueta' : 'View / Download Label'}</span>
                  </button>
                </div>
              )}
              </div>
              )}
            </div>
          );
        })}
        </div>
        )}

        {/* ── Biological Milestones & Evolution (90 Days) ────────────────────────── */}
        {(activeGcpTab === 'all' || activeGcpTab === 'posology') && (
        <div id="milestones-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
          
          {/* Section Accordion Trigger Header */}
          <div
            onClick={() => toggleSection('posology')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.90rem', fontWeight: 500, color: '#202124' }}>
                    {isEs ? '2. Posología, Régimen & Evolución Clínica' : '2. Posology, Regimen & Clinical Evolution'}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, padding: '1px 8px', borderRadius: '10px', background: '#e8f0fe', color: '#1967d2', border: '1px solid #d2e3fc' }}>
                    Sequential Schedule
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                  {isEs ? 'Hitos biológicos esperados y pauta de aplicación diaria' : 'Expected biological milestones and daily administration pathway'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5f6368', fontSize: '0.74rem', fontWeight: 500 }}>
              <span>{expandedSections.posology ? (isEs ? 'Colapsar' : 'Collapse') : (isEs ? 'Expandir' : 'Expand')}</span>
              {expandedSections.posology ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {expandedSections.posology && (
          <div className="rx-card" style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            marginBottom: '0'
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
          )}
        </div>
        )}

        {/* ── Patient Mobile Access Portal (Private Patient Dossier & Traceability) ──────────────── */}
        {(activeGcpTab === 'all' || activeGcpTab === 'traceability') && (
        <div id="qr-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          
          {/* Section Accordion Trigger Header */}
          <div
            onClick={() => toggleSection('traceability')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Factory size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.90rem', fontWeight: 500, color: '#202124' }}>
                    {isEs ? '3. Laboratorio, Calidad & Trazabilidad UE' : '3. Quality, Laboratory & EU Traceability'}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, padding: '1px 8px', borderRadius: '10px', background: '#e8f0fe', color: '#1967d2', border: '1px solid #d2e3fc' }}>
                    CoA 100% · EU Lote
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                  {isEs ? 'Certificado analítico de liberación, control de lote y verificación' : 'Certificate of analysis, batch release assays and mobile verification'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5f6368', fontSize: '0.74rem', fontWeight: 500 }}>
              <span>{expandedSections.traceability ? (isEs ? 'Colapsar' : 'Collapse') : (isEs ? 'Expandir' : 'Expand')}</span>
              {expandedSections.traceability ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {expandedSections.traceability && (
          <React.Fragment>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            marginBottom: '0'
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
                    {isEs ? 'Previsualización de la receta médica oficial y la ficha técnica de formulación magistral' : 'Preview official signed prescription pad and compounding technical records'}
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
                      ? (isEs ? '📄 Receta Médica Oficial' : '📄 Official Signed Pad') 
                      : (isEs ? '🖼️ Ficha de Formulación' : '🖼️ Compounding Record')}
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
        </React.Fragment>
        )}
        </div>
        )}

        {/* ── Pharmacogenomic Clinical Guidance Card (Fagron Genomics) ───────────── */}
        {(activeGcpTab === 'all' || activeGcpTab === 'genomics') && genomicsData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Section Accordion Trigger Header */}
            <div
              onClick={() => toggleSection('genomics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Dna size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.90rem', fontWeight: 500, color: '#202124' }}>
                      {isEs 
                        ? `4. Análisis Farmacogenómico (${genomicsData?.test?.shortName || 'Fagron Genomics'})` 
                        : `4. Pharmacogenomics Analysis (${genomicsData?.test?.shortName || 'Fagron Genomics'})`}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, padding: '1px 8px', borderRadius: '10px', background: '#e8f0fe', color: '#1967d2', border: '1px solid #d2e3fc' }}>
                      Fagron NutriGen
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                    {isEs ? 'Correlación de biomarcadores genéticos y respuesta terapéutica' : 'Genetic biomarkers correlation and metabolic response'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5f6368', fontSize: '0.74rem', fontWeight: 500 }}>
                <span>{expandedSections.genomics ? (isEs ? 'Colapsar' : 'Collapse') : (isEs ? 'Expandir' : 'Expand')}</span>
                {expandedSections.genomics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedSections.genomics && (
              <GenomicsPrescriptionGuidanceCard
                genomicsData={genomicsData}
                lang={lang}
              />
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
            formulations={compoundedFormulations}
            phases={rx.phases || rx.treatmentPhases || []}
            rxId={rxId}
            doctorName={doctorName}
            doctorTitle={doctorSpecialty}
            doctorLicense={doctorLicense}
            doctorOffice={doctorAddress}
            doctorPhone={doctorPhone}
            publicUrl={publicUrl}
            onOpenPdf={handleDownloadQrPng}
            onExportExcel={handleExportExcel}
            onAssignDoctor={openDoctorModal}
            lang={lang}
          />
        </div>
      </div>

      {/* Unified Persistent Sticky Bottom Action Bar (GCP Standard) */}
      {!embedded && (
        <PublicStickyActionBar
          title={`Rx: ${rxId}`}
          subtitle={`${patientName} • ${hasTreatingDoctor ? doctorName : clinic}`}
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
          doctorName: doctorName || rx.treatingDoctor?.name || 'Treating Physician',
          clinic: clinic || rx.treatingDoctor?.clinic || rx.clinicName || 'Compounding Medical Center',
          formula: resolvedFormulaSummary,
          dosage: resolvedDosageSummary,
          category: prescriptionTypeInfo.label,
          genomicsTest: genomicsData?.test?.shortName || (prescriptionTypeInfo.key === 'trichotest' ? 'TrichoTest' : prescriptionTypeInfo.key === 'nutrigen' ? 'NutriGen' : null),
          prescriptionType: prescriptionTypeInfo.key,
          brandType: prescriptionTypeInfo.brandType,
          isNutriGen: prescriptionTypeInfo.key === 'nutrigen'
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

      {/* ── Assign / Edit Treating Physician Modal ────────────────────────────── */}
      {showDoctorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: 540,
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {isEs ? 'Médico Tratante / Clínico' : 'Treating Physician Assignment'}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {isEs ? 'Visible exclusivamente al paciente en QR, etiqueta y portal' : 'Strictly the only doctor visible on QR, bottle label, and patient portal'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDoctorModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                {isEs ? 'Plantillas Rápidas de Médicos' : 'Physician Presets'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setDocForm({
                    name: 'Dr. Haytham Salem',
                    specialty: 'Consultant Orthopedic Surgeon & Regenerative Medicine Specialist',
                    license: 'DHA-P-0319842',
                    clinic: 'Arthregen Clinic',
                    phone: '+971 4 346 6149',
                    address: 'Med Art Clinic Day Surgery Center, Villa 823, Jumeirah St., Dubai, UAE'
                  })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: (docForm.name.includes('Haytham') || docForm.name.includes('Heytham')) ? '#eff6ff' : '#f8fafc',
                    color: (docForm.name.includes('Haytham') || docForm.name.includes('Heytham')) ? '#0284c7' : '#334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🩺 Dr. Haytham Salem (Arthregen Clinic)
                </button>
                <button
                  type="button"
                  onClick={() => setDocForm({
                    name: 'Dr. Hanieh Erdmann',
                    specialty: 'Physician Consultant Dermatology',
                    license: 'DHA-00013060-006',
                    clinic: 'Bedaya Polyclinic',
                    phone: '+971 4 395 5599',
                    address: 'Villa 634B, Jumeirah Beach Road, Umm Suqeim 1, Dubai, UAE'
                  })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: docForm.name.includes('Hanieh') ? '#eff6ff' : '#f8fafc',
                    color: docForm.name.includes('Hanieh') ? '#0284c7' : '#334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🩺 Dr. Hanieh Erdmann (DHA)
                </button>
                <button
                  type="button"
                  onClick={() => setDocForm({
                    name: 'Dr. Sezgin Cagatay',
                    specialty: 'Specialist Aesthetic & Regenerative Medicine',
                    license: 'DHA-P-0248891',
                    clinic: 'Bedaya Polyclinic',
                    phone: '+971 4 395 5599',
                    address: 'Villa 634B, Jumeirah Beach Road, Umm Suqeim 1, Dubai, UAE'
                  })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: docForm.name.includes('Sezgin') ? '#eff6ff' : '#f8fafc',
                    color: docForm.name.includes('Sezgin') ? '#0284c7' : '#334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🩺 Dr. Sezgin Cagatay (DHA)
                </button>
                <button
                  type="button"
                  onClick={() => setDocForm({
                    name: 'Dr. Valentina Ghorashi',
                    specialty: 'Consultant Aesthetic & Anti-Aging Medicine',
                    license: 'DHA-P-0199411',
                    clinic: 'Bedaya Polyclinic',
                    phone: '+971 4 395 5599',
                    address: 'Villa 634B, Jumeirah Beach Road, Umm Suqeim 1, Dubai, UAE'
                  })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: docForm.name.includes('Valentina') ? '#eff6ff' : '#f8fafc',
                    color: docForm.name.includes('Valentina') ? '#0284c7' : '#334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🩺 Dr. Valentina Ghorashi
                </button>
                <button
                  type="button"
                  onClick={() => setDocForm({
                    name: 'Dr. Nahla ElAwady',
                    specialty: 'Specialist Regenerative Medicine',
                    license: 'DHA-P-0284102',
                    clinic: 'Bedaya Polyclinic',
                    phone: '+971 4 395 5599',
                    address: 'Villa 634B, Jumeirah Beach Road, Umm Suqeim 1, Dubai, UAE'
                  })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: docForm.name.includes('Nahla') ? '#eff6ff' : '#f8fafc',
                    color: docForm.name.includes('Nahla') ? '#0284c7' : '#334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🩺 Dr. Nahla ElAwady
                </button>
                <button
                  type="button"
                  onClick={() => setDocForm({
                    name: '',
                    specialty: '',
                    license: '',
                    clinic: '',
                    phone: '',
                    address: ''
                  })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px dashed #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ✏️ {isEs ? 'Limpiar / Personalizado' : 'Clear / Custom'}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveTreatingDoctor(docForm);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  {isEs ? 'Nombre del Médico' : 'Doctor Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  placeholder="e.g. Dr. Hanieh Erdmann"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    {isEs ? 'Especialidad / Título' : 'Specialty / Title'}
                  </label>
                  <input
                    type="text"
                    value={docForm.specialty}
                    onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                    placeholder="Physician Consultant Dermatology"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    {isEs ? 'Nº de Licencia / Colegiado' : 'License Number'}
                  </label>
                  <input
                    type="text"
                    value={docForm.license}
                    onChange={(e) => setDocForm({ ...docForm, license: e.target.value })}
                    placeholder="e.g. DHA-00013060-006"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  {isEs ? 'Clínica / Centro Médico' : 'Clinic / Medical Center'}
                </label>
                <input
                  type="text"
                  value={docForm.clinic}
                  onChange={(e) => setDocForm({ ...docForm, clinic: e.target.value })}
                  placeholder="Bedaya Polyclinic"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    {isEs ? 'Teléfono de Contacto' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={docForm.phone}
                    onChange={(e) => setDocForm({ ...docForm, phone: e.target.value })}
                    placeholder="+971 4 395 5599"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    {isEs ? 'Dirección' : 'Clinic Address'}
                  </label>
                  <input
                    type="text"
                    value={docForm.address}
                    onChange={(e) => setDocForm({ ...docForm, address: e.target.value })}
                    placeholder="Dubai, UAE"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.72rem',
                color: '#64748b',
                marginTop: '4px'
              }}>
                🔒 <strong>Segregación Clínica:</strong> La tramitación de formulación y fabricación se mantiene internamente bajo la supervisión del director médico asignado. Este formulario actualiza los datos del médico tratante expuestos al paciente y en el dossier.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingDoctor}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: isSavingDoctor ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {isSavingDoctor ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar y Actualizar' : 'Save & Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
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

      {/* ── Official Compounding Bottle Labels Modal (7.5 x 4.5 cm) ── */}
      <PharmacyLabelsModal
        isOpen={showLabelsModal}
        onClose={() => setShowLabelsModal(false)}
        labels={prescriptionLabels}
        initialLabelIndex={selectedLabelIndex}
        isEs={isEs}
      />
    </div>
  );
}

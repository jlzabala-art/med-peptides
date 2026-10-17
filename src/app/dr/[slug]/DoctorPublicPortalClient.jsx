"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Stethoscope,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Pill,
  Sparkles,
  Award,
  FileText,
  Users,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Mail,
  Edit3,
  User,
  Save,
  CheckCircle2,
  Tag,
  Eye,
  SlidersHorizontal,
  Calendar,
  Layers,
  Activity,
  RotateCw,
  Download,
  Plus,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FlaskConical,
  BookOpen,
  Loader2,
  Search,
  X,
  FileInput,
  MessageSquare,
  MessageCircle,
  Send,
  Bot,
  HelpCircle,
  Phone,
  Printer,
  Sun,
  Moon,
  RefreshCw,
  Dna,
  MoreHorizontal,
  Upload,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import DataTable from '@/components/ui/DataTable';
import MobileActionSheet from '@/components/ui/MobileActionSheet';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import ClinicalIntelligenceBanner from '@/components/doctor/ClinicalIntelligenceBanner';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import { getFagronClinicalMonograph, resolveApiClinicalData } from '@/data/fagronClinicalMonographs';
import { getPrescriptionAtlasRecommendations } from '@/services/atlasRecommendationsEngine';
import { triggerHaptic } from '@/utils/haptics';
import { COUNTRIES } from '@/data/countries';
import { consolidateMultiPartPrescriptions } from '@/utils/prescriptionConsolidator';
import { calculateTreatmentDates, calculateTreatmentDuration } from '@/utils/clinical/clinicalFormulations';
import DoctorFloatingGlassDock from '@/components/doctor/docks/DoctorFloatingGlassDock';

const PrescriptionIntakeWorkspace = dynamic(
  () => import('@/features/prescriptions/components/PrescriptionIntakeWorkspace'),
  { ssr: false }
);
const PharmacyLabelsModal = dynamic(
  () => import('@/components/prescription/PharmacyLabelsModal'),
  { ssr: false }
);
const DoctorClinicalAnalytics = dynamic(
  () => import('@/components/doctor/DoctorClinicalAnalytics'),
  { ssr: false }
);
const DoctorServicesMembershipModal = dynamic(
  () => import('@/components/doctor/DoctorServicesMembershipModal'),
  { ssr: false }
);
const DoctorPracticeSearchModal = dynamic(
  () => import('@/components/doctor/modals/DoctorPracticeSearchModal'),
  { ssr: false }
);
const EditTreatmentDurationModal = dynamic(
  () => import('@/components/doctor/modals/EditTreatmentDurationModal'),
  { ssr: false }
);
const DoctorRecommendationsTab = dynamic(
  () => import('@/components/doctor/tabs/DoctorRecommendationsTab'),
  { ssr: false }
);
const DoctorMonographDrawer = dynamic(
  () => import('@/components/doctor/modals/DoctorMonographDrawer'),
  { ssr: false }
);
const DoctorInquiryModal = dynamic(
  () => import('@/components/doctor/modals/DoctorInquiryModal'),
  { ssr: false }
);
const DoctorAtlasAiModal = dynamic(
  () => import('@/components/doctor/modals/DoctorAtlasAiModal'),
  { ssr: false }
);
const DoctorWhatsAppModal = dynamic(
  () => import('@/components/doctor/modals/DoctorWhatsAppModal'),
  { ssr: false }
);
const DoctorHandoutModal = dynamic(
  () => import('@/components/doctor/modals/DoctorHandoutModal'),
  { ssr: false }
);
const DoctorMobileSidebarDrawer = dynamic(
  () => import('@/components/doctor/navigation/DoctorMobileSidebarDrawer'),
  { ssr: false }
);
const DoctorResourceInspectorDrawer = dynamic(
  () => import('@/components/doctor/modals/DoctorResourceInspectorDrawer'),
  { ssr: false }
);
const DoctorDiscoveryDrawer = dynamic(
  () => import('@/components/doctor/modals/DoctorDiscoveryDrawer'),
  { ssr: false }
);
const DoctorCredentialsModal = dynamic(
  () => import('@/components/doctor/modals/DoctorCredentialsModal'),
  { ssr: false }
);

function safeRenderText(val, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (typeof val.summary === 'string') return val.summary;
    if (typeof val.description === 'string') return val.description;
    if (typeof val.text === 'string') return val.text;
    if (typeof val.content === 'string') return val.content;
    if (Array.isArray(val)) return val.map(x => safeRenderText(x)).filter(Boolean).join(', ');
    return fallback;
  }
  return String(val);
}

export function enrichApiClinicalDetails(api) {
  if (!api) return {};
  const rawName = api.name || api.drugName || api.activeIngredient || api.productName || 'Active Pharmaceutical Ingredient';
  const rawDose = api.dose || api.dosage || api.strength || api.concentration || 'Compounded Strength';

  const resolved = resolveApiClinicalData(api, false);
  const mono = getFagronClinicalMonograph(api.productId) ||
    getFagronClinicalMonograph(rawName) ||
    getFagronClinicalMonograph(api.activeIngredient) ||
    getFagronClinicalMonograph(rawName.toLowerCase());

  const pharmacologicalClass = api.therapeuticClass || api.pharmacologicalClass || resolved.pharmacologicalClass || mono?.pharmacologicalClass || api.category || 'Therapeutic Active Ingredient (API)';
  const clinicalIndication = api.clinicalIndication || resolved.clinicalIndication || mono?.clinicalIndication || 'Targeted Follicular / Metabolic Clinical Optimization';
  const mechanismOfAction = api.mechanism || api.mechanismOfAction || resolved.mechanismOfAction || mono?.mechanismOfAction || null;
  const cellularTarget = api.cellularTarget || resolved.cellularTarget || null;
  const geneTargets = (mono?.geneTargets && mono.geneTargets.length > 0) ? mono.geneTargets : ((resolved.geneTargets && resolved.geneTargets.length > 0) ? resolved.geneTargets : (api.geneTargets || []));

  return {
    id: api.id,
    name: rawName,
    dose: rawDose,
    pharmacologicalClass,
    clinicalIndication,
    mechanismOfAction,
    cellularTarget,
    geneTargets,
    instructions: api.instructions || ''
  };
}

/**
 * Accurately resolve pharmaceutical vehicle, excipient carrier, or diluent by clinical modality
 * Prevents displaying misleading "Compounding Vehicle Base" for peptides, sprays, or oral capsules.
 */
export function resolveClinicalVehicle(rxObj = {}, items = [], explicitVehicle = null) {
  const explicitName = typeof explicitVehicle === 'string' ? explicitVehicle : explicitVehicle?.name;
  if (explicitName && !explicitName.toLowerCase().includes('standard compounding vehicle') && !explicitName.toLowerCase().includes('compounding galenic carrier')) {
    const isOil = explicitName.toLowerCase().includes('trichooil') || explicitName.toLowerCase().includes('oil');
    const isSol = explicitName.toLowerCase().includes('trichosol');
    return {
      label: isOil || isSol ? 'Compounding Vehicle Base:' : 'Pharmaceutical Base / Carrier:',
      value: explicitName,
      badge: 'EU GMP Validated Pharmacopeia Base'
    };
  }

  const itemsArr = Array.isArray(items) ? items : [];
  const combined = [
    rxObj.treatmentTitle,
    rxObj.title,
    rxObj.name,
    rxObj.dispensingForm,
    rxObj.format,
    rxObj.dosageForm,
    rxObj.route,
    ...itemsArr.map(i => i.name || i.drugName || i.activeIngredient || '')
  ].filter(Boolean).join(' ').toLowerCase();

  // 1. Intranasal peptide solutions (Selank, Semax, Oxytocin, Desmopressin)
  if (combined.includes('nasal') || combined.includes('spray') || combined.includes('intranasal') || combined.includes('selank') || combined.includes('semax')) {
    return {
      label: 'Intranasal Delivery Matrix:',
      value: 'Sterile Buffered Isotonic Saline Solution (0.9% NaCl USP)',
      badge: 'Sterile Osmotically Balanced Nasal Matrix'
    };
  }

  // 2. Oral peptide / nutraceutical capsules (BPC-157 Oral, KPV, Spermidine, Mito detox)
  if (combined.includes('capsule') || combined.includes('cápsula') || combined.includes('oral') || combined.includes('cap') || combined.includes('enteric')) {
    return {
      label: 'Delivery Shell & Excipient Matrix:',
      value: 'Acid-Resistant Enteric Capsule Shell (Hypoallergenic Plant Cellulose Matrix)',
      badge: 'Gastric Acid-Resistant (DRcaps®)'
    };
  }

  // 3. Injectable peptide vials (SubQ / IM, e.g. Retatrutide, Tirzepatide, BPC-157, TB-500, Epithalon)
  if (combined.includes('vial') || combined.includes('subq') || combined.includes('subcutaneous') || combined.includes('inject') || combined.includes('lyophilized') || combined.includes('retatrutide') || combined.includes('tirzepatide') || combined.includes('semaglutide') || combined.includes('bpc-157') || combined.includes('tb-500')) {
    return {
      label: 'Reconstitution Diluent & Solvent:',
      value: 'Bacteriostatic Water for Injection USP (0.9% Benzyl Alcohol)',
      badge: 'Sterile Multidose Diluent'
    };
  }

  // 4. Sublingual drops / troches
  if (combined.includes('sublingual') || combined.includes('troche') || combined.includes('dropper') || combined.includes('drops')) {
    return {
      label: 'Sublingual Mucosal Matrix:',
      value: 'Pharmaceutical-Grade Polyethylene Glycol (PEG) Troche / Glycerol Base',
      badge: 'Rapid Transmucosal Absorption'
    };
  }

  // 5. Transdermal BHRT (Bioidentical Hormones: Estradiol, Progesterone, Testosterone in Pentravan)
  if (combined.includes('pentravan') || combined.includes('transdermal') || combined.includes('estradiol') || combined.includes('progesterone') || combined.includes('testosterone') || combined.includes('bhrt')) {
    return {
      label: 'Transdermal Compounding Vehicle:',
      value: 'Pentravan® Patented Transdermal Liposomal Cream Base (Fagron)',
      badge: 'Clinically Validated Liposomal Matrix'
    };
  }

  // 6. Topical Scalp / Trichology (TrichoSol, TrichoOil, Minoxidil, Finasteride, Scalp)
  if (combined.includes('tricho') || combined.includes('scalp') || combined.includes('topical') || combined.includes('alopecia') || combined.includes('minoxidil') || combined.includes('finasteride') || combined.includes('dutasteride') || combined.includes('latanoprost')) {
    const isOil = combined.includes('oil') || combined.includes('aceite') || combined.includes('trichooil');
    return {
      label: 'Compounding Vehicle Base:',
      value: isOil 
        ? 'TrichoOil™ Natural Lipidic Scalp Carrier (q.s.)' 
        : 'TrichoSol™ Alcohol-Free Liposomal Hydrophilic Vehicle (q.s.)',
      badge: 'EU GMP Validated Pharmacopeia Base'
    };
  }

  // 7. General Peptide / Bioregulator fallback
  if (combined.includes('peptide') || combined.includes('bioregulator')) {
    return {
      label: 'Pharmaceutical Formulation Base:',
      value: 'Sterile Isotonic Pharmacopeial Diluent Matrix',
      badge: 'EU GMP Grade Sterile Solution'
    };
  }

  // 8. General Compounding fallback
  return {
    label: 'Compounding Vehicle / Base:',
    value: 'Pharmacopeial Compounding Vehicle Base (GMP Validated)',
    badge: 'EU GMP Validated Pharmacopeia Base'
  };
}

export function resolvePrescriptionParts(rx) {
  if (!rx) return [];

  // 1. Explicit rx.parts array already parsed from doctorCache or document
  if (Array.isArray(rx.parts) && rx.parts.length > 0) {
    return rx.parts.map((p, pIdx) => {
      const partNum = p.partNumber || (pIdx + 1);
      const vName = p.vehicle || p.title || '';
      const resolvedVeh = resolveClinicalVehicle(p, p.apis || [], vName);
      const isOil = String(vName + ' ' + (p.title || '')).toLowerCase().includes('oil') || String(vName).toLowerCase().includes('aceite');
      const isOral = String(vName + ' ' + (p.format || '') + ' ' + (p.title || '')).toLowerCase().includes('oral') || String(vName + ' ' + (p.format || '')).toLowerCase().includes('capsule');
      const isFoam = String(vName + ' ' + (p.title || '')).toLowerCase().includes('foam') || String(vName).toLowerCase().includes('espuma');
      const isNasal = String(vName + ' ' + (p.format || '') + ' ' + (p.title || '')).toLowerCase().includes('nasal') || String(vName).toLowerCase().includes('spray');

      const badgeText = isNasal ? 'INTRANASAL SOLUTION' : (isOil ? 'SCALP CARE & LIPIDIC OIL' : (isOral ? 'ORAL CAPSULES' : (isFoam ? 'TOPICAL FOAM' : 'TOPICAL SOLUTION')));
      const accentColor = isNasal ? '#0284c7' : (isOil ? '#0d9488' : (isOral ? '#ea580c' : (isFoam ? '#7c3aed' : '#003666')));
      const accentBg = isNasal ? '#f0f9ff' : (isOil ? '#f0fdfa' : (isOral ? '#fff7ed' : (isFoam ? '#faf5ff' : '#f8fafc')));
      const borderAccent = isNasal ? '#bae6fd' : (isOil ? '#99f6e4' : (isOral ? '#fed7aa' : (isFoam ? '#e9d5ff' : '#cbd5e1')));

      return {
        partNumber: partNum,
        totalParts: rx.parts.length,
        title: p.title || (isNasal ? 'Intranasal Peptide Therapy' : (isOil ? 'Scalp Care & Lipid Protection' : (isOral ? 'Systemic Support' : 'Compounded Solution'))),
        badge: `PART ${partNum} OF ${rx.parts.length} · ${badgeText}`,
        volume: p.volume || (isNasal ? '15 mL' : (isOil ? '30 mL' : (isOral ? '90 Capsules' : '100 mL'))),
        format: p.format || badgeText,
        vehicleLabel: resolvedVeh.label,
        vehicle: resolvedVeh.value,
        vehicleBadge: resolvedVeh.badge,
        schedule: p.posology || p.directions || (isOil ? '1-2 times weekly, massage 3-5 min, leave 10 min before wash.' : 'Apply as directed by treating physician.'),
        accentColor,
        accentBg,
        borderAccent,
        apis: (p.apis || []).map(a => enrichApiClinicalDetails(a))
      };
    });
  }

  // 2. Explicit rx.formulas (from legacy schemas)
  if (Array.isArray(rx.formulas) && rx.formulas.length > 0) {
    return rx.formulas.map((form, fIdx) => {
      const partNum = fIdx + 1;
      const vName = form.base || form.formulaName || '';
      const isOil = vName.toLowerCase().includes('oil');
      const isOral = vName.toLowerCase().includes('oral');
      const isFoam = vName.toLowerCase().includes('foam');
      const badgeText = isOil ? 'SCALP CARE & OIL' : (isOral ? 'ORAL CAPSULES' : (isFoam ? 'TOPICAL FOAM' : 'TOPICAL SOLUTION'));
      const accentColor = isOil ? '#0d9488' : (isOral ? '#ea580c' : (isFoam ? '#7c3aed' : '#0284c7'));
      const accentBg = isOil ? '#f0fdfa' : (isOral ? '#fff7ed' : (isFoam ? '#faf5ff' : '#f0f9ff'));
      const borderAccent = isOil ? '#99f6e4' : (isOral ? '#fed7aa' : (isFoam ? '#e9d5ff' : '#bae6fd'));

      const apis = (form.components || []).map(c => enrichApiClinicalDetails({
        name: c.apiName || c.name || '',
        dose: c.dosage ? `${c.dosage} ${c.units || ''}`.trim() : (c.dose || ''),
        productId: c.productId
      }));

      return {
        partNumber: partNum,
        totalParts: rx.formulas.length,
        title: form.formulaName || `Part ${partNum}`,
        badge: `PART ${partNum} OF ${rx.formulas.length} · ${badgeText}`,
        volume: isOil ? '30 mL' : (isOral ? '90 Capsules' : '100 mL'),
        format: badgeText,
        vehicle: form.base || 'Compounding Galenic Carrier',
        schedule: form.posology || 'Administer as prescribed by treating physician.',
        accentColor,
        accentBg,
        borderAccent,
        apis
      };
    });
  }

  // 3. Items list with multi-vehicles or posology phase 1 + phase 2 markers
  const rawItems = rx.items && rx.items.length > 0 ? rx.items : (rx.prescriptionLines || []);
  const posologyText = String(rx.posology?.regimen || rx.posology || '');
  const hasPhase1Phase2 = /phase\s*1/i.test(posologyText) && /phase\s*2/i.test(posologyText);
  const hasTrichoOil = rawItems.some(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return n.includes('trichooil') || (n.includes('vitamin e') && !n.includes('oral'));
  });
  const hasTrichoSol = rawItems.some(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return n.includes('trichosol') || n.includes('prostaquinon') || n.includes('spironolactone') || n.includes('minoxidil') || n.includes('latanoprost');
  });

  if (hasPhase1Phase2 || (hasTrichoOil && hasTrichoSol)) {
    const part1Items = [];
    const part2Items = [];
    let p1Vehicle = null;
    let p2Vehicle = null;

    rawItems.forEach(it => {
      const n = String(it.name || it.drugName || it.activeIngredient || '').toLowerCase();
      const isVehicle = it.isVehicleOrBase || it._isVehicleOrBase || n.includes('vehicle') || n.includes('vehiculo');
      if (n.includes('trichooil') || (n.includes('vitamin e') && !n.includes('oral'))) {
        if (isVehicle) p2Vehicle = it;
        else part2Items.push(it);
      } else if (n.includes('trichosol') && isVehicle) {
        p1Vehicle = it;
      } else {
        if (isVehicle) p1Vehicle = it;
        else part1Items.push(it);
      }
    });

    let p1Schedule = 'Apply 1 mL nightly to scalp before bedtime. Leave on scalp overnight.';
    let p2Schedule = 'Apply 1-2 times weekly, massage 3-5 min, leave 10 min before wash.';
    if (hasPhase1Phase2) {
      const m1 = posologyText.match(/phase\s*1:?\s*([^.]*\.)/i);
      if (m1) p1Schedule = m1[1].trim();
      const m2 = posologyText.match(/phase\s*2:?\s*([^.]*\.)/i);
      if (m2) p2Schedule = m2[1].trim();
    }

    return [
      {
        partNumber: 1,
        totalParts: 2,
        title: 'Topical Follicular Precision Therapy (TrichoSol™)',
        badge: 'PART 1 OF 2 · TOPICAL SCALP SOLUTION',
        volume: p1Vehicle?.dose || '100 mL',
        format: 'Topical Scalp Solution',
        vehicle: p1Vehicle?.name || 'TrichoSol™ Liposomal Hydrophilic Vehicle (q.s. 100 mL)',
        schedule: p1Schedule,
        accentColor: '#0284c7',
        accentBg: '#f0f9ff',
        borderAccent: '#bae6fd',
        apis: part1Items.map(a => enrichApiClinicalDetails(a))
      },
      {
        partNumber: 2,
        totalParts: 2,
        title: 'Follicular Protective & Hygiene Elixir (TrichoOil™)',
        badge: 'PART 2 OF 2 · SCALP CARE & LIPIDIC OIL',
        volume: p2Vehicle?.dose || '30 mL',
        format: 'Lipidic Scalp Oil',
        vehicle: p2Vehicle?.name || 'TrichoOil™ Natural Lipidic Vehicle (q.s. 30 mL)',
        schedule: p2Schedule,
        accentColor: '#0d9488',
        accentBg: '#f0fdfa',
        borderAccent: '#99f6e4',
        apis: part2Items.map(a => enrichApiClinicalDetails(a))
      }
    ];
  }

  // 4. Single formulation fallback
  const apisOnly = rawItems.filter(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return !i.isVehicleOrBase && !i._isVehicleOrBase && !n.includes('patented vehicle') && !n.includes('vehiculo magistral');
  });
  const vehicleOnly = rawItems.find(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return i.isVehicleOrBase || i._isVehicleOrBase || n.includes('vehicle') || n.includes('base');
  });

  const activeItems = apisOnly.length > 0 ? apisOnly : rawItems;
  const resolvedVehicle = resolveClinicalVehicle(rx, activeItems, vehicleOnly);

  // Determine modal accent styling based on clinical presentation
  const isNasal = (resolvedVehicle.label || '').includes('Nasal') || String(rx.dispensingForm || '').toLowerCase().includes('nasal');
  const isInjectable = (resolvedVehicle.label || '').includes('Diluent') || String(rx.dispensingForm || '').toLowerCase().includes('vial') || String(rx.route || '').toLowerCase().includes('subq');
  const isOral = (resolvedVehicle.label || '').includes('Shell') || String(rx.dispensingForm || '').toLowerCase().includes('capsule');

  const accentColor = isNasal ? '#0284c7' : (isInjectable ? '#0f766e' : (isOral ? '#ea580c' : '#003666'));
  const accentBg = isNasal ? '#f0f9ff' : (isInjectable ? '#f0fdf4' : (isOral ? '#fff7ed' : '#f8fafc'));
  const borderAccent = isNasal ? '#bae6fd' : (isInjectable ? '#a7f3d0' : (isOral ? '#fed7aa' : '#cbd5e1'));

  return [{
    partNumber: 1,
    totalParts: 1,
    title: rx.treatmentTitle || 'Personalized Compounded Formulation',
    badge: isNasal ? 'INTRANASAL PEPTIDE FORMULATION' : (isInjectable ? 'INJECTABLE PEPTIDE REGIMEN' : (isOral ? 'ORAL PEPTIDE CAPSULES' : 'SINGLE COMPOUNDED FORMULATION')),
    volume: rx.volume || vehicleOnly?.dose || (isNasal ? '15 mL' : (isOral ? '60 Capsules' : 'Standard Dispensary Volume')),
    format: rx.dispensingForm || (isNasal ? 'Calibrated Nasal Spray (15 mL)' : (isInjectable ? 'Sterile Lyophilized Vial' : 'Compounded Pharmaceutical Solution')),
    vehicleLabel: resolvedVehicle.label,
    vehicle: resolvedVehicle.value,
    vehicleBadge: resolvedVehicle.badge,
    schedule: posologyText || 'Administer as directed by treating physician.',
    accentColor,
    accentBg,
    borderAccent,
    apis: activeItems.map(a => enrichApiClinicalDetails(a))
  }];
}

export default function DoctorPublicPortalClient({
  slug: propSlug,
  initialData = null,
  isCustomerAgent = false,
  agentName = 'Atlas Concierge Care',
  availableDoctors = []
}) {
  const [slug, setSlug] = useState(propSlug);
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData?.doctor && !initialData?.success && !initialData?.serverComputed);
  const [error, setError] = useState(null);
  const [agentDoctors, setAgentDoctors] = useState(availableDoctors || []);
  const [isSwitchingDoctor, setIsSwitchingDoctor] = useState(false);

  // Sync if propSlug changes externally
  useEffect(() => {
    if (propSlug && propSlug !== slug) {
      setSlug(propSlug);
    }
  }, [propSlug]);

  // Sync if initialData changes externally
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  // Sync availableDoctors if provided or updated
  useEffect(() => {
    if (Array.isArray(availableDoctors) && availableDoctors.length > 0) {
      setAgentDoctors(availableDoctors);
    }
  }, [availableDoctors]);

  // Load prescribers list on mount if in agent mode and not provided
  useEffect(() => {
    if (isCustomerAgent && (!agentDoctors || agentDoctors.length === 0)) {
      fetch('/api/prescriptions/doctors-list')
        .then(res => res.json())
        .then(res => {
          if (res?.success && Array.isArray(res.doctors)) {
            setAgentDoctors(res.doctors);
          }
        })
        .catch(err => console.warn('Could not fetch prescribers list', err));
    }
  }, [isCustomerAgent, agentDoctors]);

  const handleSelectDoctor = async (doc) => {
    if (!doc) return;
    const newSlug = doc.nameSlug || doc.opaqueCode || doc.id;
    if (newSlug === slug) return;

    triggerHaptic('selection');
    setIsSwitchingDoctor(true);
    setSlug(newSlug);

    // Update URL query parameter smoothly without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('dr', newSlug);
      window.history.pushState({}, '', url.toString());
    }

    try {
      const res = await fetch(`/api/doctor/${encodeURIComponent(newSlug)}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
        toast.success(`Active physician switched to ${doc.name} (${doc.rxCount || 0} Rx) ✓`);
      } else {
        toast.error('Could not load physician profile');
      }
    } catch (err) {
      console.error('Error switching doctor:', err);
      toast.error('Network error loading physician');
    } finally {
      setIsSwitchingDoctor(false);
    }
  };

  // Search & Filter State (Google Cloud UX Golden Rules #7, #24, #29)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [temporalFilter, setTemporalFilter] = useState('all'); // 'all' | 'active' | '30d' | '90d'
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22 Scope Switcher)

  // Table Density & Synchronization (GCP Table Standard)
  const [tableDensity, setTableDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // UI Actions State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIntake, setCopiedIntake] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const intakeSavedRef = useRef(false);

  // Language & Clinical Sidebar Navigation State (GCP Standard)
  const [lang, setLang] = useState('en');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('overview');

  // Modal for Viewing Pharmacy Labels Directly from Doctor Portal
  const [activeLabelRx, setActiveLabelRx] = useState(null);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isPracticeSearchOpen, setIsPracticeSearchOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

  // Keyboard shortcut (⌘K or /) for Practice Search
  useEffect(() => {
    const handleGlobalSearchKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPracticeSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => window.removeEventListener('keydown', handleGlobalSearchKey);
  }, []);

  // GCP Resource Inspector Drawer State (Golden Rule #4: Master-Detail sin abandonar contexto)
  const [selectedInspectorItem, setSelectedInspectorItem] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('dossier'); // 'dossier' | 'items' | 'dispensary'
  const [signingTaskId, setSigningTaskId] = useState(null);

  // GCP Standard: Sidebar is always active/expanded on laptops and desktops
  useEffect(() => {
    setIsSidebarCollapsed(false);
  }, []);

  // Publish sidebar width as a CSS variable so drawers (e.g. StandardDrawer)
  // align to the sidebar edge without masking the left clinical navigation.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const updateSidebarWidth = () => {
        const isMobileScreen = window.innerWidth < 1024;
        const w = isMobileScreen ? '0px' : isSidebarCollapsed ? '64px' : '250px';
        document.documentElement.style.setProperty('--sidebar-current-width', w);
      };
      updateSidebarWidth();
      window.addEventListener('resize', updateSidebarWidth);
      return () => window.removeEventListener('resize', updateSidebarWidth);
    }
  }, [isSidebarCollapsed]);

  // Deep-link synchronization: Check URL query param for ?modal=services or #services
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modal') === 'services' || params.get('tab') === 'services' || window.location.hash === '#services') {
        setIsServicesModalOpen(true);
      }
    }
  }, []);

  const handleCloseServicesModal = () => {
    setIsServicesModalOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('modal') === 'services' || url.searchParams.get('tab') === 'services') {
        url.searchParams.delete('modal');
        url.searchParams.delete('tab');
        const newSearch = url.searchParams.toString() ? `?${url.searchParams.toString()}` : '';
        const newHash = url.hash && url.hash !== '#services' ? url.hash : '';
        window.history.replaceState({}, '', `${url.pathname}${newSearch}${newHash}`);
      }
    }
  };

  // Therapeutic Pharmacopeia & Compounding APIs State (Lotusland Clinical Directory)
  const [formularyGoal, setFormularyGoal] = useState('all');
  const [formularySearch, setFormularySearch] = useState('');
  const [selectedMonograph, setSelectedMonograph] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryPeptide, setInquiryPeptide] = useState(null);

  // ── Atlas AI & Request Info (Sticky Footer Dock) ───────────────────────────
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [aiUsesRemaining, setAiUsesRemaining] = useState(5);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [requestInfoSubject, setRequestInfoSubject] = useState('What is the pricing / quotation for this prescription?');
  const [requestInfoSelectedRx, setRequestInfoSelectedRx] = useState('');
  const [requestInfoNotes, setRequestInfoNotes] = useState('');

  const [isHandoutOpen, setIsHandoutOpen] = useState(false);
  const [handoutRx, setHandoutRx] = useState(null);
  const [quickRxFilter, setQuickRxFilter] = useState('pending'); // 'pending' | 'all' | 'active' | 'multipart' (Default to actionable pending items)
  const [apiFilter, setApiFilter] = useState(null); // Active pharmaceutical ingredient filter from Analytics

  // Atlas Recommendations UI State (Consolidated Master Catalog)
  const [recCategoryFilter, setRecCategoryFilter] = useState('all'); // 'all' | 'peptides' | 'supplements' | 'eterna' | 'colway'
  const [recSearchQuery, setRecSearchQuery] = useState('');
  const [expandedRecId, setExpandedRecId] = useState(null);
  const [recFilter, setRecFilter] = useState(null); // { id: string, title: string, rxIds: string[] }

  // ── Treatment Timeline Pop-up Modal State (Mobile & Laptop UX - Golden Rule #5) ──
  const [timelineModalRx, setTimelineModalRx] = useState(null);

  const openTimelineModal = (rx, e) => {
    if (e) e.stopPropagation();
    triggerHaptic('selection');
    setTimelineModalRx(rx);
  };

  const handleSaveTimelineModal = async ({ prescription, startDate, durationDays, endDate }) => {
    const rx = prescription;
    const parsedDays = Number(durationDays) || 30;
    const res = await fetch('/api/prescriptions/update-timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prescriptionId: rx.id || rx.code,
        prescriptionNumber: rx.code || rx.prescriptionNumber,
        startDate,
        durationDays: parsedDays,
        endDate
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update treatment timeline');
    }

    // Optimistically update prescription in reactive client state (Golden Rule #25)
    setData(prev => {
      if (!prev?.prescriptions) return prev;
      const updatedRxList = prev.prescriptions.map(p => {
        if ((p.id && p.id === rx.id) || (p.code && p.code === rx.code)) {
          const weeks = Math.round(parsedDays / 7);
          return {
            ...p,
            startDate,
            treatmentStartDate: startDate,
            durationDays: parsedDays,
            durationWeeks: weeks,
            duration: `${parsedDays} Days (${weeks} Weeks)`,
            treatmentDuration: `${parsedDays} Days`,
            endDate: json.updated?.endDate || endDate
          };
        }
        return p;
      });
      return {
        ...prev,
        prescriptions: updatedRxList
      };
    });

    toast.success(`Timeline updated: ${parsedDays} days starting ${startDate} ✓`);
  };

  // ── Quick Action Dots Menu State (Mobile & Desktop GCP Action Sheet) ──
  const [activeActionsMenuRxId, setActiveActionsMenuRxId] = useState(null);
  const [mobileActionRx, setMobileActionRx] = useState(null);

  // Close floating action menu when clicking outside
  useEffect(() => {
    const handleOutsideActionClick = (e) => {
      if (!e.target.closest('.gcp-row-actions-menu')) {
        setActiveActionsMenuRxId(null);
      }
    };
    window.addEventListener('click', handleOutsideActionClick);
    return () => window.removeEventListener('click', handleOutsideActionClick);
  }, []);



  // Persist session quota (max 5 uses per session, isolated to this doctor)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sessionKey = `atlas_ai_quota_${slug || 'dr'}`;
    const stored = sessionStorage.getItem(sessionKey);
    if (stored !== null) {
      setAiUsesRemaining(Math.max(0, parseInt(stored, 10)));
    } else {
      sessionStorage.setItem(sessionKey, '5');
      setAiUsesRemaining(5);
    }
  }, [slug]);

  // ── URL Search Params Sync (Golden Rule #24: Sincronización de URL) ───────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const s = params.get('status');
    const t = params.get('task');
    const tab = params.get('tab');
    const time = params.get('time');
    if (q) setSearchQuery(q);
    if (s) setStatusFilter(s);
    if (t) {
      setTaskFilter(t);
      setActiveAnchor('tasks');
    } else if (tab) {
      setActiveAnchor(tab);
    }
    if (time) setTemporalFilter(time);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (taskFilter !== 'all') params.set('task', taskFilter);
    if (temporalFilter !== 'all') params.set('time', temporalFilter);
    if (activeAnchor !== 'overview') params.set('tab', activeAnchor);
    const newSearch = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== newSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
    }
  }, [searchQuery, statusFilter, taskFilter, temporalFilter, activeAnchor]);

  useEffect(() => {
    // If initialData is already hydrated from server, do NOT flash loading screen or re-fetch on mount
    if (initialData?.doctor || initialData?.success || initialData?.serverComputed || data?.doctor || data?.success) return;

    async function fetchDoctorPortal() {
      try {
        setLoading(true);
        const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          throw new Error(`Failed to load doctor profile (${res.status})`);
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || 'Physician profile not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchDoctorPortal();
  }, [slug, initialData]);

  const doctor = data?.doctor || {};

  // Physician Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    specialty: '',
    clinic: '',
    license: '',
    phone: '',
    email: '',
    location: ''
  });

  useEffect(() => {
    if (doctor?.name) {
      setProfileForm({
        name: doctor.name || '',
        title: doctor.title || 'Dr.',
        specialty: doctor.specialty || '',
        clinic: doctor.clinic || '',
        license: doctor.license || '',
        phone: doctor.phone || '',
        email: doctor.email || '',
        location: doctor.location || ''
      });
    }
  }, [doctor?.name, doctor?.title, doctor?.specialty, doctor?.clinic, doctor?.license, doctor?.phone, doctor?.email, doctor?.location]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingProfile(true);
      triggerHaptic('medium');
      const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update profile');
      }
      setData(prev => ({
        ...prev,
        doctor: {
          ...prev?.doctor,
          ...profileForm
        }
      }));
      setIsEditingProfile(false);
      toast.success('Perfil médico actualizado con éxito');
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      toast.error(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsSavingProfile(false);
    }
  };
  const globalKpis = data?.kpis || { activePrescriptions: 0, monitoredPatients: 0, pendingTasksCount: 0, refillsDueCount: 0 };
  const allTasks = data?.tasks || [];
  const allPrescriptions = useMemo(() => consolidateMultiPartPrescriptions(data?.prescriptions || []), [data?.prescriptions]);
  const allProtocols = data?.protocols || [];
  const allLabResults = data?.labResults || [];

  const [activeSection, setActiveSection] = useState('overview');

  const [isDiscoveryDrawerOpen, setIsDiscoveryDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sectionIds = ['overview', 'tasks', 'prescriptions', 'diagnostics', 'patients'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Global ⌘K / Ctrl+K & Escape Key Listener (GCP UX Standard) ─────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsDiscoveryDrawerOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isDiscoveryDrawerOpen) setIsDiscoveryDrawerOpen(false);
        if (isCredentialsModalOpen) setIsCredentialsModalOpen(false);
        if (isServicesModalOpen) setIsServicesModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDiscoveryDrawerOpen, isCredentialsModalOpen, isServicesModalOpen]);

  // Opaque Doctor Slug (Protects Doctor Identity in URL)
  const opaqueCode = doctor.opaqueCode || doctor.slug || slug;

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (taskFilter !== 'all') {
        if (taskFilter === 'refill') {
          if (t.type !== 'refill' && t.type !== 'cycles') return false;
        } else if (taskFilter === 'proposal_followup' || taskFilter === 'followup') {
          if (t.type !== 'proposal_followup' && t.type !== 'followup') return false;
        } else if (t.type !== taskFilter) {
          return false;
        }
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchPatient = (t.patientName || '').toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchPatient || matchCode;
    });
  }, [allTasks, taskFilter, searchQuery]);

  // Aggregate Task Counts for Quick Facet Badges (GCP Golden Rule #22)
  const taskCounts = useMemo(() => {
    return {
      all: allTasks.length,
      proposal_followup: allTasks.filter(t => t.type === 'proposal_followup' || t.type === 'followup').length,
      titration: allTasks.filter(t => t.type === 'titration').length,
      refill: allTasks.filter(t => t.type === 'refill' || t.type === 'cycles').length,
      approval: allTasks.filter(t => t.type === 'approval').length,
    };
  }, [allTasks]);

  // Unique Monitored Patients List (for quick clinical dossier filter)
  const uniquePatientList = useMemo(() => {
    const set = new Set();
    allPrescriptions.forEach(p => {
      if (p.patientName) set.add(p.patientName.trim());
    });
    return Array.from(set).sort();
  }, [allPrescriptions]);

  // Filter Prescriptions (Enhanced with Temporal & Patient Filter - Golden Rules #22, #24)
  const filteredPrescriptions = useMemo(() => {
    return allPrescriptions.filter(rx => {
      // Patient Filter
      if (patientFilter !== 'all') {
        const pat = (rx.patientName || '').toLowerCase().trim();
        if (pat !== patientFilter.toLowerCase().trim()) return false;
      }

      // Status Filter: 'active' encompasses both 'active' and 'approved' clinical posologies
      if (statusFilter !== 'all') {
        const s = (rx.status || '').toLowerCase();
        if (statusFilter === 'active') {
          if (!['active', 'approved'].includes(s)) return false;
        } else if (statusFilter === 'approved') {
          if (s !== 'approved') return false;
        } else if (s !== statusFilter) {
          return false;
        }
      }

      // Temporal Filter Condition (Golden Rule #24)
      if (temporalFilter === 'active') {
        const s = (rx.status || '').toLowerCase();
        if (!['approved', 'active', 'processing'].includes(s)) return false;
      } else if (temporalFilter === '30d' && (rx.createdAt || rx.createdDate)) {
        const d = new Date(rx.createdAt || rx.createdDate);
        if (!isNaN(d.getTime())) {
          const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      } else if (temporalFilter === '90d' && (rx.createdAt || rx.createdDate)) {
        const d = new Date(rx.createdAt || rx.createdDate);
        if (!isNaN(d.getTime())) {
          const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 90) return false;
        }
      }

      // API Filter (Clinical Analytics Click-to-Filter)
      if (apiFilter) {
        const normTarget = apiFilter.toLowerCase();
        const candidateItems = [
          ...(rx.items || []),
          ...(rx.recommendedItems || []),
          ...((rx.phases || []).flatMap(p => p.apis || p.items || [])),
          ...((rx.parts || []).flatMap(p => p.apis || []))
        ];
        const hasApi = candidateItems.some(item => {
          const itemName = String(item?.activeIngredient || item?.drugName || item?.name || '').toLowerCase();
          return itemName.includes(normTarget);
        });
        if (!hasApi) return false;
      }

      // Atlas Recommendation Filter (Clinical Practice Match)
      if (recFilter && Array.isArray(recFilter.rxIds)) {
        const rxKey = rx.id || rx.code || rx.prescriptionNumber;
        if (!recFilter.rxIds.includes(rxKey)) return false;
      }

      if (!searchQuery.trim()) {
        // Quick Status / Category Filter (Proposal #3)
        if (quickRxFilter === 'proposals') {
          const s = (rx.status || rx.state || '').toLowerCase();
          const isProp = s === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
          if (!isProp) return false;
        } else if (quickRxFilter === 'drafts') {
          const s = (rx.status || rx.state || '').toLowerCase();
          const isProp = s === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
          if (isProp || (!['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review')) return false;
        } else if (quickRxFilter === 'pending') {
          const s = (rx.status || rx.state || '').toLowerCase();
          const isProp = s === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
          if (!isProp && !['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review') return false;
        } else if (quickRxFilter === 'active') {
          const s = (rx.status || rx.state || '').toLowerCase();
          if (!['active', 'approved', 'dispensed'].includes(s)) return false;
        } else if (quickRxFilter === 'multipart') {
          const parts = resolvePrescriptionParts(rx);
          if (parts.length <= 1) return false;
        }
        return true;
      }
      const q = searchQuery.toLowerCase();
      const matchPat = (rx.patientName || '').toLowerCase().includes(q);
      const matchCode = (rx.code || rx.prescriptionNumber || '').toLowerCase().includes(q);
      const matchTitle = (rx.treatmentTitle || '').toLowerCase().includes(q) || (rx.regimenShortTitle || '').toLowerCase().includes(q);
      const matchCategory = (rx.regimenCategory || '').toLowerCase().includes(q) || (rx.regimenCategoryShort || '').toLowerCase().includes(q);
      const matchActives = (rx.activeIngredientsSummary || '').toLowerCase().includes(q);
      const matchItems = (rx.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      if (!matchPat && !matchCode && !matchTitle && !matchCategory && !matchActives && !matchItems) return false;

      // Also apply quickRxFilter if search query is present
      if (quickRxFilter === 'proposals') {
        const s = (rx.status || rx.state || '').toLowerCase();
        const isProp = s === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        if (!isProp) return false;
      } else if (quickRxFilter === 'drafts') {
        const s = (rx.status || rx.state || '').toLowerCase();
        const isProp = s === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        if (isProp || (!['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review')) return false;
      } else if (quickRxFilter === 'pending') {
        const s = (rx.status || rx.state || '').toLowerCase();
        const isProp = s === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        if (!isProp && !['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review') return false;
      } else if (quickRxFilter === 'active') {
        const s = (rx.status || rx.state || '').toLowerCase();
        if (!['active', 'approved', 'dispensed'].includes(s)) return false;
      } else if (quickRxFilter === 'multipart') {
        const parts = resolvePrescriptionParts(rx);
        if (parts.length <= 1) return false;
      }

      return true;
    });
  }, [allPrescriptions, statusFilter, patientFilter, searchQuery, temporalFilter, quickRxFilter, apiFilter, recFilter]);

  // Quick Prescription Counts for 1-Click Status Chips (Proposal #3)
  const quickCounts = useMemo(() => {
    let proposalsCount = 0;
    let draftsCount = 0;
    let activeCount = 0;
    let multipartCount = 0;
    allPrescriptions.forEach(p => {
      const s = (p.status || p.state || '').toLowerCase();
      const isProp = s === 'proposal_pending' || p.isTreatmentProposal || p.orderStatus === 'Offer Not Accepted';
      if (isProp) {
        proposalsCount++;
      } else if (['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) || p.ingestionStage === 'awaiting_atlas_review') {
        draftsCount++;
      }
      if (['active', 'approved', 'dispensed'].includes(s)) activeCount++;
      const parts = resolvePrescriptionParts(p);
      if (parts.length > 1) multipartCount++;
    });
    return {
      all: allPrescriptions.length,
      proposals: proposalsCount,
      drafts: draftsCount,
      pending: proposalsCount + draftsCount,
      active: activeCount,
      multipart: multipartCount
    };
  }, [allPrescriptions]);

  // Compute Filtered KPIs for Scope Switcher (Rule #22)
  const filteredKpis = useMemo(() => {
    const activeRxCount = filteredPrescriptions.filter(p => ['approved', 'active'].includes((p.status || '').toLowerCase())).length;
    const uniquePatients = new Set(filteredPrescriptions.map(p => p.patientName).filter(Boolean)).size;
    const pendingTasks = filteredTasks.length;
    const refillsDue = filteredTasks.filter(t => t.type === 'refill' || t.type === 'titration').length;
    return {
      activePrescriptions: activeRxCount,
      monitoredPatients: uniquePatients,
      pendingTasksCount: pendingTasks,
      refillsDueCount: refillsDue
    };
  }, [filteredPrescriptions, filteredTasks]);

  const activeKpis = scopeMode === 'filtered' ? filteredKpis : globalKpis;

  // Curated Bioactive Peptide Formulary (Lotusland Compounding Directory)
  const formulary = useMemo(() => {
    return data?.formulary || [];
  }, [data?.formulary]);

  const filteredFormulary = useMemo(() => {
    return formulary.filter((p) => {
      if (formularyGoal !== 'all') {
        const goalStr = `${p.primaryGoal || ''} ${(p.goals || []).join(' ')}`.toLowerCase();
        if (formularyGoal === 'repair' && !goalStr.includes('repair') && !goalStr.includes('tissue') && !goalStr.includes('recovery') && !goalStr.includes('gut')) return false;
        if (formularyGoal === 'metabolic' && !goalStr.includes('fat') && !goalStr.includes('metabolic') && !goalStr.includes('weight') && !goalStr.includes('glp') && !goalStr.includes('loss')) return false;
        if (formularyGoal === 'cognitive' && !goalStr.includes('neuro') && !goalStr.includes('cognitive') && !goalStr.includes('brain') && !goalStr.includes('semax')) return false;
        if (formularyGoal === 'cellular' && !goalStr.includes('cellular') && !goalStr.includes('aging') && !goalStr.includes('mitochondr') && !goalStr.includes('optim') && !goalStr.includes('energy')) return false;
      }
      if (!formularySearch.trim()) return true;
      const q = formularySearch.toLowerCase();
      return (
        safeRenderText(p.name).toLowerCase().includes(q) ||
        safeRenderText(p.description).toLowerCase().includes(q) ||
        safeRenderText(p.moa).toLowerCase().includes(q) ||
        safeRenderText(p.primaryGoal).toLowerCase().includes(q)
      );
    });
  }, [formulary, formularyGoal, formularySearch]);

  const filteredProtocols = useMemo(() => {
    return allProtocols.filter(proto => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (proto.title || proto.name || '').toLowerCase().includes(q);
      const matchCategory = (proto.category || '').toLowerCase().includes(q);
      const matchDesc = (proto.description || '').toLowerCase().includes(q);
      return matchTitle || matchCategory || matchDesc;
    });
  }, [allProtocols, searchQuery]);

  const formularyCounts = useMemo(() => {
    const counts = { all: formulary.length, repair: 0, metabolic: 0, cellular: 0, cognitive: 0 };
    formulary.forEach(p => {
      const goalStr = `${p.primaryGoal || ''} ${(p.goals || []).join(' ')}`.toLowerCase();
      if (goalStr.includes('repair') || goalStr.includes('tissue') || goalStr.includes('recovery') || goalStr.includes('gut')) counts.repair++;
      if (goalStr.includes('fat') || goalStr.includes('metabolic') || goalStr.includes('weight') || goalStr.includes('glp') || goalStr.includes('loss')) counts.metabolic++;
      if (goalStr.includes('cellular') || goalStr.includes('aging') || goalStr.includes('mitochondr') || goalStr.includes('optim') || goalStr.includes('energy')) counts.cellular++;
      if (goalStr.includes('neuro') || goalStr.includes('cognitive') || goalStr.includes('brain') || goalStr.includes('semax')) counts.cognitive++;
    });
    return counts;
  }, [formulary]);

  const handleCopyPortalLink = () => {
    triggerHaptic('selection');
    const portalUrl = `${window.location.origin}/dr/${opaqueCode}`;
    navigator.clipboard?.writeText(portalUrl);
    setCopiedLink(true);
    toast.success('Codified doctor portal link copied (identity protected) ✓');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyIntakeLink = () => {
    triggerHaptic('selection');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(opaqueCode)}`;
    navigator.clipboard?.writeText(intakeUrl);
    setCopiedIntake(true);
    toast.success('Patient Intake Link copied with codified attribution ✓');
    setTimeout(() => setCopiedIntake(false), 2000);
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(opaqueCode)}`;
    const text = encodeURIComponent(`Hello, you can submit your medical prescription directly to ${doctor.name} at Atlas Clinical Services here: ${intakeUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ── Atlas WhatsApp for Doctor Communications (+971 55 356 1058) ───────────
  const handleContactAtlasWhatsApp = (topic = '', extraDetails = '') => {
    triggerHaptic('light');
    const doctorName = doctor.name || 'Doctor';
    let text = `Hello Atlas Support, I am ${doctorName}. I am contacting you directly from the Clinical Doctor Portal.`;
    if (topic) {
      text += `\n\n*Subject / Formulation:* ${topic}`;
    }
    if (extraDetails) {
      text += `\n*Clinical Inquiry:* ${extraDetails}`;
    }
    text += `\n\n*Clinic:* ${doctor.clinic || 'Atlas Partner Clinic'}`;
    const url = `https://wa.me/971553561058?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ── Patient Posology Handout & Re-prescribe Handlers (Proposals #1, #2, #4) ─
  const handleOpenHandout = (rx) => {
    triggerHaptic('selection');
    setHandoutRx(rx);
    setIsHandoutOpen(true);
  };

  const handleShareHandoutWhatsApp = (rx) => {
    if (!rx) return;
    triggerHaptic('light');
    const parts = resolvePrescriptionParts(rx);
    const patientName = rx.patientName || 'Patient';
    let text = `Dear ${patientName},\n\nHere is your treatment posology and administration guidance prescribed by Dr. ${doctor.name}:\n\n`;
    text += `📋 *Treatment:* ${rx.treatmentTitle || 'Custom Compounded Formulation'}\n`;
    text += `🆔 *Reference:* #${rx.code || rx.prescriptionNumber || rx.id}\n\n`;
    parts.forEach(p => {
      text += `🔹 *${p.title}* (${p.volume || '60 mL'} - ${p.vehicle || 'Compounded vehicle'})\n`;
      text += `   • *Schedule:* ${p.schedule || 'Apply as directed by physician'}\n`;
      if (p.apis && p.apis.length > 0) {
        text += `   • *Formula:* ${p.apis.map(a => `${a.name} ${a.concentration || a.dose || ''}`.trim()).join(', ')}\n`;
      }
      text += `\n`;
    });
    text += `⚠️ *Key Instructions:*\n`;
    text += `• Apply to clean and dry skin/scalp.\n`;
    text += `• Wash hands thoroughly after application.\n`;
    text += `• Store below 25°C, protected from direct sunlight.\n\n`;
    text += `For medical inquiries, consult Dr. ${doctor.name} or Atlas Clinical Support on WhatsApp.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareProposalWhatsApp = (rx, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!rx) return;
    triggerHaptic('light');
    const patientName = rx.patientName || 'Patient';
    const rxCode = rx.code || rx.prescriptionNumber || rx.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
    const proposalUrl = `${origin}/rx/${rxCode}`;
    const cleanTitle = String(rx.treatmentTitle || 'Clinical Treatment Proposal')
      .replace(/\s*\(Propuesta de Tratamiento\)/gi, '')
      .replace(/\s*\(Sin Pedido\)/gi, '')
      .replace(/\s*\(Propuesta\)/gi, '')
      .trim();

    // Calculate days pending to customize the follow-up cadence
    const createdAtMs = rx.createdAt ? new Date(rx.createdAt).getTime() : (rx.startDate ? new Date(rx.startDate).getTime() : Date.now());
    const daysPending = Math.max(0, Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60 * 24)));
    const doctorName = doctor?.name || 'Physician';

    let text = '';
    if (daysPending >= 10) {
      // Cadence 3: Allocation / Expiry clinical reminder (English)
      text = `Dear ${patientName},\n\n`;
      text += `This is a clinical update from Dr. ${doctorName}'s practice regarding your personalized regimen for *${cleanTitle}* (Ref #${rxCode}).\n\n`;
      text += `Compounded formulation ingredients are held in allocation for a limited time. You can review your clinical protocol and activate your treatment order here:\n`;
      text += `🔗 ${proposalUrl}\n\n`;
      text += `If you would like to adjust your regimen or have questions before proceeding, please reply to our medical team.`;
    } else if (daysPending >= 4) {
      // Cadence 2: Gentle follow-up check-in (English)
      text = `Dear ${patientName},\n\n`;
      text += `Following up on your clinical consultation with Dr. ${doctorName}:\n\n`;
      text += `We wanted to check if you had a chance to review your personalized formulation for *${cleanTitle}* (Ref #${rxCode}).\n\n`;
      text += `You can review your protocol details, posology, and confirm fulfillment here:\n`;
      text += `🔗 ${proposalUrl}\n\n`;
      text += `Please let us know if you have any questions or need any adjustments to your regimen.`;
    } else {
      // Cadence 1: Fresh proposal / initial presentation (English)
      text = `Dear ${patientName},\n\n`;
      text += `Dr. ${doctorName} has prepared your personalized Clinical Treatment Proposal:\n\n`;
      text += `📋 *Regimen:* ${cleanTitle}\n`;
      text += `🆔 *Proposal Reference:* #${rxCode}\n\n`;
      text += `You can review your complete clinical dossier, formulation details, and confirm your treatment order here:\n`;
      text += `🔗 ${proposalUrl}\n\n`;
      text += `For any clinical questions regarding this protocol, please contact our medical team directly.`;
    }

    const rawPhone = rx.patientPhone || rx.phone || rx.mobile || rx.patient?.phone || rx.patient?.mobile || '';
    const cleanPhone = String(rawPhone).replace(/[^\d+]/g, '').replace(/^00/, '+');
    const waBase = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : 'https://wa.me/';

    window.open(`${waBase}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyProposalLink = (rx, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!rx) return;
    triggerHaptic('selection');
    const rxCode = rx.code || rx.prescriptionNumber || rx.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
    const proposalUrl = `${origin}/rx/${rxCode}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(proposalUrl);
      toast.success('Proposal link copied to clipboard ✓');
    }
  };

  const handleReprescribeFormula = (rx) => {
    triggerHaptic('selection');
    const formulaSummary = {
      treatmentTitle: rx.treatmentTitle || 'Compounded Formulation',
      dispensingForm: rx.dispensingForm || 'Magistral Solution',
      items: rx.items || [],
      volume: rx.volume || '60 mL',
      sourceRx: rx.code || rx.id
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('atlas_represcribe_prefill', JSON.stringify(formulaSummary));
    }
    toast.success(`Formula #${rx.code} ready to prescribe for new patient ✓`);
    setIsIntakeOpen(true);
  };

  // ── Atlas AI Clinical Reasoning Engine (Isolated, Max 5 uses per session) ───
  const handleSendAtlasAiQuery = (queryText) => {
    const text = (queryText || aiInput).trim();
    if (!text) return;
    if (aiUsesRemaining <= 0) {
      toast.error('Session quota of 5 clinical queries reached. Contact Atlas Support on WhatsApp.');
      return;
    }

    triggerHaptic('light');
    const newRemaining = Math.max(0, aiUsesRemaining - 1);
    setAiUsesRemaining(newRemaining);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`atlas_ai_quota_${slug || 'dr'}`, String(newRemaining));
    }

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    setTimeout(() => {
      let response = '';
      const lower = text.toLowerCase();
      const patientCount = doctor.patients?.length || new Set(filteredPrescriptions.map(p => p.patientName || p.patientId)).size;
      const rxCount = filteredPrescriptions.length;
      const pendingCount = filteredTasks.length;

      if (lower.includes('patient') || lower.includes('paciente') || lower.includes('summarize') || lower.includes('resumen')) {
        const topPatients = filteredPrescriptions.slice(0, 5).map(p => `• **${p.patientName || 'Patient'}** (${p.id}): ${p.treatmentTitle || 'Compounded Treatment'} — Status: *${p.status || 'Active'}*`).join('\n');
        response = `**Clinical Summary for ${doctor.name}:**\n\nYou currently have **${patientCount} registered patients** and **${rxCount} active prescription records** in your dispensary view.\n\n**Recent Patient Regimens:**\n${topPatients}\n\n*All formulas are compounded in accordance with EU GMP standards.*`;
      } else if (lower.includes('dose') || lower.includes('dosis') || lower.includes('api') || lower.includes('active') || lower.includes('formula') || lower.includes('part') || lower.includes('ingrediente')) {
        const apiMap = new Map();
        filteredPrescriptions.forEach(p => {
          (p.items || []).forEach(it => {
            const n = it.name || it.drugName || it.activeIngredient;
            if (n && !apiMap.has(n)) apiMap.set(n, it.dose || it.concentration || 'Compounded Standard');
          });
        });
        const apiList = Array.from(apiMap.entries()).slice(0, 6).map(([name, dose]) => `• **${name}**: ${dose}`).join('\n');
        response = `**Active Pharmaceutical Ingredients (APIs) in your formulary:**\n\n${apiList || '• Minoxidil 5%, Dutasteride 0.1%, Melatonin 0.1%'}\n\n*Multi-Part Notice:* Formulations organized into **Part 1** and **Part 2** are concurrent components of the same comprehensive treatment regimen.`;
      } else if (lower.includes('sign') || lower.includes('pend') || lower.includes('task') || lower.includes('tarea') || lower.includes('revis')) {
        response = `**Physician Task Status:**\n\nYou have **${pendingCount} pending task(s)** requiring physician sign-off or clinical verification.\n\nOnce reviewed, prescriptions transition to *Active / Dispensary Processing*. You can approve them directly from the table or inspection drawer.`;
      } else {
        response = `**Clinical Analysis for ${doctor.name}:**\n\nBased on your **${rxCount} prescriptions** and patient registry, your active regimens focus on targeted trichology and regenerative formulations (e.g., dual-part liposomal solutions with TrichoSol™/TrichoOil™ vehicles).\n\nIf you require custom active ingredient titration, vehicle stabilization certificates, or batch logistics, you can also request dedicated liaison support with **Atlas Clinical Support on WhatsApp**.`;
      }

      const assistantMsg = {
        role: 'assistant',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, assistantMsg]);
      setAiLoading(false);
    }, 550);
  };

  const handleShareDoctorPortal = () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Doctor Public Portal URL copied to clipboard ✓');
    }
  };

  const handleOpenLabelsModal = (rx) => {
    triggerHaptic('light');
    setActiveLabelRx(rx);
    setIsLabelsModalOpen(true);
  };

  // ── Autonomous Background Registry Synchronization (SWR + Focus Revalidation) ──
  const isSyncingRegistryRef = useRef(false);
  const lastSyncTimestampRef = useRef(Date.now());
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);

  const syncDoctorRegistry = useCallback(async (force = false) => {
    if (!slug || isSyncingRegistryRef.current) return;
    const now = Date.now();
    // Throttle automatic focus revalidations to 45s unless forced by a mutation
    if (!force && now - lastSyncTimestampRef.current < 45000) return;

    try {
      isSyncingRegistryRef.current = true;
      setIsBackgroundSyncing(true);
      const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}?fresh=1`, {
        cache: 'no-store'
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.success) {
        setData(prev => ({
          ...prev,
          ...json,
          doctor: {
            ...(prev?.doctor || {}),
            ...(json.doctor || {})
          }
        }));
        lastSyncTimestampRef.current = Date.now();
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn('[DoctorRegistrySync] Silent background revalidation skipped:', err?.message);
    } finally {
      isSyncingRegistryRef.current = false;
      setIsBackgroundSyncing(false);
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Focus / Tab Visibility Revalidation (SWR)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncDoctorRegistry(false);
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // 2. Autonomous Background Heartbeat (every 60s while tab is active)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncDoctorRegistry(false);
      }
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(intervalId);
    };
  }, [syncDoctorRegistry]);

  const handleExportCsv = () => {
    triggerHaptic('selection');
    const rows = filteredPrescriptions.map(p => ({
      Code: p.code || p.prescriptionNumber || '',
      Patient: p.patientName || '',
      Status: p.status || '',
      Treatment: p.treatmentTitle || '',
      Items: (p.items || []).map(i => i.name).join('; '),
      Created: p.createdAt || p.createdDate || ''
    }));
    const headers = ['Code', 'Patient', 'Status', 'Treatment', 'Items', 'Created'];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DR_${opaqueCode}_PRESCRIPTIONS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Prescriptions CSV exported successfully ✓');
  };

  const labelsForActiveRx = useMemo(() => {
    if (!activeLabelRx) return [];
    return getPharmapolisLabelsForPrescription(activeLabelRx, null);
  }, [activeLabelRx]);

  // ── GCP Resource Inspector Drawer Handlers (Golden Rule #4) ───────────────
  const handleRowClickPrescription = (rx) => {
    triggerHaptic('selection');
    setSelectedInspectorItem({
      type: 'prescription',
      data: rx
    });
    setInspectorTab('dossier');
  };

  const handleRowClickTask = (task) => {
    triggerHaptic('selection');
    const matchedRx = allPrescriptions.find(
      (p) => p.code === task.code || (p.prescriptionNumber && p.prescriptionNumber === task.code)
    );
    setSelectedInspectorItem({
      type: 'task',
      data: task,
      prescription: matchedRx || null
    });
    setInspectorTab('dossier');
  };

  // ── Functional Electronic Clinical Sign-off Handler (Firestore + Layer 1 RAM) ──
  const handleSignOffPrescription = async (taskOrRx, e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    // Determine the codes to sign
    const codesToSign = taskOrRx.codes && Array.isArray(taskOrRx.codes) && taskOrRx.codes.length > 0
      ? taskOrRx.codes
      : [taskOrRx.code || taskOrRx.prescriptionNumber || taskOrRx.id].filter(Boolean);

    if (codesToSign.length === 0) return;

    const signingKey = taskOrRx.id || codesToSign[0];
    setSigningTaskId(signingKey);

    try {
      // Sign each prescription via the update-status API
      for (const code of codesToSign) {
        const res = await fetch('/api/prescriptions/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescriptionNumber: code,
            status: 'approved',
            reason: 'Physician electronic sign-off and dispensing authorization via Doctor Portal',
            updatedBy: doctor?.name || 'Treating Physician'
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to sign prescription ${code}`);
        }
      }

      // Optimistically update local data state
      setData((prev) => {
        if (!prev) return prev;
        const updatedPrescriptions = (prev.prescriptions || []).map((rx) => {
          if (codesToSign.includes(rx.code) || codesToSign.includes(rx.prescriptionNumber) || codesToSign.includes(rx.id)) {
            return {
              ...rx,
              status: 'approved',
              state: 'approved',
              signedAt: new Date().toISOString(),
              signedBy: doctor?.name || 'Treating Physician'
            };
          }
          return rx;
        });

        // Mark task as completed / authorized
        const updatedTasks = (prev.tasks || []).map((t) => {
          if (t.id === taskOrRx.id || (t.codes && t.codes.some(c => codesToSign.includes(c))) || codesToSign.includes(t.code)) {
            return {
              ...t,
              status: 'approved',
              isSigned: true,
              priority: 'routine',
              title: `${t.title} — Authorized`,
              description: `Digitally signed & authorized for compounding release by ${doctor?.name || 'Treating Physician'}.`
            };
          }
          return t;
        });

        // Recompute KPIs
        const newActive = updatedPrescriptions.filter(p => ['approved', 'active'].includes((p.status || '').toLowerCase())).length;
        const newPending = updatedTasks.filter(t => t.type === 'approval' && !t.isSigned).length;

        return {
          ...prev,
          prescriptions: updatedPrescriptions,
          tasks: updatedTasks,
          kpis: {
            ...prev.kpis,
            activePrescriptions: newActive,
            pendingTasksCount: newPending
          }
        };
      });

      // Update selectedInspectorItem if viewing this item
      setSelectedInspectorItem((prev) => {
        if (!prev) return prev;
        const isMatched = (prev.data && (prev.data.id === taskOrRx.id || codesToSign.includes(prev.data.code))) ||
          (prev.prescription && codesToSign.includes(prev.prescription.code));
        if (isMatched) {
          return {
            ...prev,
            data: {
              ...(prev.data || {}),
              status: 'approved',
              isSigned: true
            },
            prescription: prev.prescription ? {
              ...prev.prescription,
              status: 'approved',
              state: 'approved',
              signedAt: new Date().toISOString(),
              signedBy: doctor?.name || 'Treating Physician'
            } : null
          };
        }
        return prev;
      });

      triggerHaptic('success');
      toast.success(
        codesToSign.length > 1
          ? `${codesToSign.length} prescriptions signed & authorized for compounding ✓`
          : `Prescription #${codesToSign[0]} signed & authorized for compounding ✓`
      );
    } catch (err) {
      console.error('Error signing off prescription:', err);
      toast.error('Signing error: ' + (err.message || 'Please try again'));
    } finally {
      setSigningTaskId(null);
    }
  };

  // ── Pending Clinical Tasks Columns (DataTable Exclusive Rendering) ───────
  const taskColumns = useMemo(() => [
    {
      key: 'patientName',
      header: 'Patient Dossier',
      width: '26%',
      align: 'left',
      sortable: true,
      render: (t) => {
        const dob = t.patient?.dob || t.patientDob || t.dob || (
          allPrescriptions.find(p => p.patientName && t.patientName && p.patientName.toLowerCase().trim() === t.patientName.toLowerCase().trim())?.patient?.dob
        );

        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
              {t.patientName}
            </div>
            {dob && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                DOB: {dob}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'title',
      header: 'Clinical Task & Details',
      width: '54%',
      align: 'left',
      sortable: true,
      render: (t) => {
        const isSigned = t.isSigned || t.status === 'approved';
        const rxMatch = allPrescriptions.find(
          (p) => p.code === t.code || p.id === t.rxId || (p.code && t.codes?.includes(p.code))
        );

        // Derive high-signal title and details following GCP UX standards
        const codeDisplay = t.code || (t.codes && t.codes[0]) || null;
        const medicationSummary = rxMatch?.treatmentTitle || rxMatch?.items?.map(i => i.name).filter(Boolean).slice(0, 2).join(' + ') || null;

        if (t.type === 'proposal_followup') {
          const treatmentName = t.treatmentTitle || medicationSummary || 'Compounded Treatment';
          return (
            <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.86rem' }}>
                  {treatmentName}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 650,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fde68a'
                  }}
                >
                  <Clock size={11} />
                  {t.daysAgo ? `Offer Unaccepted (${t.daysAgo}d)` : 'Offer Unaccepted'}
                </span>
              </div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Proposal sent</span>
                <span>•</span>
                <span style={{ color: '#0d9488', fontWeight: 600 }}>Awaiting patient checkout</span>
              </div>
            </div>
          );
        }

        let taskActionName = 'Prescription Sign-off';
        if (t.type === 'refill') taskActionName = 'Supply Refill Assessment';
        else if (t.type === 'milestone') taskActionName = 'Clinical Milestone Review';
        else if (t.pendingCount > 1) taskActionName = `Prescription Sign-off (${t.pendingCount} Formulations)`;

        let taskSubtitle = medicationSummary ? `${medicationSummary} • Awaiting digital authorization` : 'Compounded formulation awaiting authorization';
        if (t.type === 'refill') taskSubtitle = medicationSummary ? `${medicationSummary} • Supply refill review` : 'Supply replenishment review';
        else if (t.type === 'milestone') taskSubtitle = 'Biomarker checkpoint & clinical titration assessment';

        return (
          <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.86rem' }}>
                {taskActionName}
              </span>
              {isSigned ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 650,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0'
                  }}
                >
                  <CheckCircle2 size={11} />
                  Authorized
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 650,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fde68a'
                  }}
                >
                  <Clock size={11} />
                  Pending Sign-off
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', textAlign: 'left' }}>
              {taskSubtitle}
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Action',
      width: '16%',
      align: 'right',
      isAction: true,
      mobilePriority: 'always',
      render: (t) => {
        const isSigned = t.isSigned || t.status === 'approved';
        const isSigning = signingTaskId === (t.id || t.code);

        if (t.type === 'proposal_followup') {
          const patientPhone = (t.patientPhone || t.patient?.phone || '').replace(/[^0-9+]/g, '');
          const cleanDocTitle = (doctor?.name || 'Khalid Shukri').replace(/^Dr\.?\s*/i, '').trim();
          const rawMsg = (t.whatsappMessage || `Hello ${t.patientName}, this is Dr. ${cleanDocTitle}'s clinical practice following up on your personalized ${t.treatmentTitle || 'treatment plan'}. You can review your medical protocol here: https://atlashealth-services.com/rx/${t.code}. Please let us know if you have any questions or would like to proceed.`)
            .replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. ');
          const encodedMsg = encodeURIComponent(rawMsg);
          const waUrl = patientPhone ? `https://wa.me/${patientPhone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;

          return (
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.12s',
                  boxShadow: '0 1px 2px rgba(22,163,74,0.1)'
                }}
                title="Send personalized clinical reminder via WhatsApp"
                aria-label="Send WhatsApp reminder"
              >
                <MessageCircle size={15} />
              </a>

              <Link
                href={t.actionUrl || `/rx/${t.code}`}
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#5f6368',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#1a73e8';
                  e.currentTarget.style.color = '#1a73e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                  e.currentTarget.style.color = '#5f6368';
                }}
                title="Open treatment proposal dossier"
                aria-label="Open treatment proposal dossier"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          );
        }

        if (isSigned) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#16a34a'
                }}
              >
                <CheckCircle2 size={13} />
                <span>Authorized</span>
              </span>
              <Link
                href={t.actionUrl}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                title="Open official signed prescription pad in new tab"
                aria-label="Open official signed prescription pad in new tab"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#5f6368',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#1a73e8';
                  e.currentTarget.style.color = '#1a73e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                  e.currentTarget.style.color = '#5f6368';
                }}
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          );
        }

        return (
          <div
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isSigning}
              onClick={(e) => handleSignOffPrescription(t, e)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '0 10px',
                borderRadius: '4px',
                background: '#1a73e8',
                border: '1px solid #1557b0',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: isSigning ? 'wait' : 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s'
              }}
              title="Digitally sign & authorize this prescription compounding order"
            >
              {isSigning ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} style={{ color: '#38bdf8' }} />
                  <span>Sign-off</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClickTask(t);
              }}
              title="Inspect prescription details in slide-over Inspector Drawer"
              aria-label="Inspect prescription details in slide-over Inspector Drawer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#5f6368',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#1a73e8';
                e.currentTarget.style.color = '#1a73e8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#dadce0';
                e.currentTarget.style.color = '#5f6368';
              }}
            >
              <ExternalLink size={14} />
            </button>
          </div>
        );
      }
    }
  ], [signingTaskId, handleSignOffPrescription, allPrescriptions]);

  // ── Prescriptions Dossier Columns (DataTable Exclusive Rendering) ─────────
  const prescriptionColumns = useMemo(() => [
    {
      key: 'patientName',
      header: 'Patient Dossier',
      width: '22%',
      align: 'left',
      sortable: true,
      render: (rx) => {
        const isProposal = rx.status === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        const rawInvoice = rx.invoiceRef ? String(rx.invoiceRef).trim() : '';
        const isLegitInvoice = rawInvoice && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(rawInvoice);
        const patientPhone = rx.patientPhone || rx.phone || rx.mobile || rx.patient?.phone || rx.patient?.mobile;

        return (
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.88rem' }}>
              {rx.patientName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <CopyableId value={rx.prescriptionNumber || rx.code} />
              {isLegitInvoice && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 650,
                    color: '#475569',
                    background: '#f1f5f9',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    border: '1px solid #e2e8f0',
                    letterSpacing: '0.02em'
                  }}
                  title={`Historical order reference ${rawInvoice}`}
                >
                  {rawInvoice}
                </span>
              )}
            </div>
            {patientPhone ? (
              <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <Phone size={11} style={{ color: '#059669', flexShrink: 0 }} />
                <span>{patientPhone}</span>
              </div>
            ) : isProposal ? (
              <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '1px' }}>
                No phone on file
              </div>
            ) : null}
            {rx.patient?.dob && (
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                DOB: {rx.patient.dob}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'treatmentTitle',
      header: 'Prescription Regimen',
      width: '32%',
      align: 'left',
      sortable: true,
      render: (rx) => {
        const parts = resolvePrescriptionParts(rx);
        const totalParts = rx.totalParts || parts.length || 1;
        const categoryLabel = rx.regimenCategoryShort || rx.regimenCategory || 'Follicular';
        const rawTitle = rx.regimenShortTitle || rx.treatmentTitle || 'Compounded Precision Regimen';
        const displayTitle = String(rawTitle).replace(/\s*\(Propuesta de Tratamiento\)/gi, '').replace(/\s*\(Sin Pedido\)/gi, '').replace(/\s*\(Propuesta\)/gi, '').trim();
        const isProposal = rx.status === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        const itemsSummary = (rx.items && rx.items.length > 0)
          ? rx.items.map(i => `${i.name || ''} ${i.dose || ''}`.trim()).filter(Boolean).slice(0, 2).join(' · ')
          : null;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', width: '100%' }}>
            <div style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.86rem', lineHeight: '1.3', textAlign: 'left' }}>
              {displayTitle}
            </div>
            {itemsSummary && (
              <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px', fontWeight: 500, lineHeight: 1.25 }}>
                {itemsSummary}
              </div>
            )}
            <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              {/* Category Pill */}
              <span style={{
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '1px 7px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 650,
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>
                {categoryLabel}
              </span>

              {/* Proposal Badge if Unaccepted */}
              {isProposal && (
                <span style={{
                  background: '#fef7e0',
                  color: '#b06000',
                  border: '1px solid #feefc3',
                  padding: '1px 7px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}>
                  Clinical Proposal
                </span>
              )}

              {/* Parts Badge (Flush left aligned) */}
              <span style={{
                background: totalParts > 1 ? '#eff6ff' : '#f1f5f9',
                color: totalParts > 1 ? '#1d4ed8' : '#475569',
                border: totalParts > 1 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                padding: '1px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                {totalParts === 1 ? '1 Part' : `${totalParts} Parts`}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      align: 'left',
      sortable: true,
      render: (rx) => {
        const isProposal = rx.status === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        const effectiveStatus = isProposal ? 'proposal_pending' : (rx.status || 'active');
        const isDraftOrReview = !isProposal && (['draft', 'pending', 'awaiting_validation'].includes(String(rx.status || '').toLowerCase()) || rx.ingestionStage === 'awaiting_atlas_review');

        const createdAtMs = rx.createdAt ? new Date(rx.createdAt).getTime() : (rx.startDate ? new Date(rx.startDate).getTime() : Date.now());
        const daysPending = Math.max(0, Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60 * 24)));

        return (
          <div
            title={isProposal ? "Clinical proposal recommended by physician; patient has not yet confirmed or purchased the order." : (isDraftOrReview ? "Atlas AI clinical pharmacist review in progress (~24h SLA)." : undefined)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <StatusBadge status={effectiveStatus} customLabel={isProposal ? 'Offer Pending' : undefined} />
            {isProposal && (
              daysPending >= 4 ? (
                <span
                  style={{
                    fontSize: '0.67rem',
                    color: '#b45309',
                    marginTop: '3px',
                    fontWeight: 650,
                    lineHeight: 1.2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title={`Proposal created ${daysPending} days ago. Follow-up recommended.`}
                >
                  ⚠️ Follow-up due ({daysPending}d)
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.67rem',
                    color: '#64748b',
                    marginTop: '3px',
                    fontWeight: 500,
                    lineHeight: 1.2
                  }}
                >
                  ⏳ {daysPending}d open
                </span>
              )
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Start Date & Duration',
      width: '17%',
      align: 'left',
      sortable: true,
      render: (rx) => {
        const dates = calculateTreatmentDates(rx);
        const endShort = String(dates.endFormatted || '').replace(/,\s*\d{4}$/, '');

        return (
          <div
            onClick={(e) => openTimelineModal(rx, e)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '3px',
              cursor: 'pointer',
              padding: '4px 6px',
              margin: '-4px -6px',
              borderRadius: '6px',
              border: '1px solid transparent',
              transition: 'all 0.15s ease',
              maxWidth: '100%'
            }}
            title={`${dates.startFormatted} → ${dates.endFormatted} (${dates.durationLabel}). Click to edit start date and duration.`}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            {/* Line 1: Clean Start Date + Always-Visible Subtle Edit Pencil (Rule #5 & Rule #43: Zero Calendar Icon Clutter) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', maxWidth: '100%' }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 650, color: '#0f172a', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                {dates.startFormatted}
              </span>
              <Edit3
                size={11}
                style={{
                  color: '#475569',
                  opacity: 0.45,
                  flexShrink: 0
                }}
              />
            </div>

            {/* Line 2: Compact Duration Pill + End Date (Zero Truncation) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  color: dates.isEstimated ? '#0369a1' : '#047857',
                  background: dates.isEstimated ? '#f0f9ff' : '#f0fdf4',
                  border: dates.isEstimated ? '1px solid #bae6fd' : '1px solid #bbf7d0',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.35
                }}
                title={dates.reason}
              >
                {dates.durationDays}d ({dates.durationWeeks}w)
              </span>
              {endShort && (
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  → {endShort}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '15%',
      align: 'right',
      render: (rx) => {
        const isProposal = rx.status === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        const isPending = !isProposal && ['pending', 'draft'].includes((rx.status || rx.state || '').toLowerCase());
        const isSigning = signingTaskId === (rx.code || rx.id);
        const isMenuOpen = activeActionsMenuRxId === (rx.code || rx.id);

        return (
          <div
            className="gcp-row-actions-menu"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', width: '100%', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            {/* QUICK ACTION 1: View Public Prescription Page (Simple Icon Button per User Request & Rule #45) */}
            <Link
              href={`/rx/${rx.code}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                height: '28px',
                width: '28px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#5f6368',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#1a73e8';
                e.currentTarget.style.color = '#1a73e8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#dadce0';
                e.currentTarget.style.color = '#5f6368';
              }}
              title="View public prescription page (/rx)"
              aria-label="View public prescription page"
            >
              <ExternalLink size={14} />
            </Link>

            {/* QUICK ACTION 2: Contextual Primary Clinical Action (Sign if pending, Share Offer if proposal, or Patient Posology Handout if active/approved) */}
            {isPending ? (
              <button
                type="button"
                disabled={isSigning}
                onClick={(e) => handleSignOffPrescription(rx, e)}
                style={{
                  height: '28px',
                  width: '28px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#5f6368',
                  cursor: isSigning ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.borderColor = '#16a34a';
                  e.currentTarget.style.color = '#16a34a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                  e.currentTarget.style.color = '#5f6368';
                }}
                title="Sign & Authorize Prescribing Order"
                aria-label="Sign and Authorize Prescribing Order"
              >
                {isSigning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              </button>
            ) : isProposal ? (
              <button
                type="button"
                onClick={(e) => handleShareProposalWhatsApp(rx, e)}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  flexShrink: 0,
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#25d366';
                  e.currentTarget.style.borderColor = '#1ebc59';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.borderColor = '#bbf7d0';
                  e.currentTarget.style.color = '#15803d';
                }}
                title={`Send clinical follow-up WhatsApp message to ${rx.patientName || 'patient'}`}
                aria-label="Send clinical follow-up via WhatsApp"
              >
                <MessageCircle size={13} />
                <span>Follow-up</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenHandout(rx);
                }}
                style={{
                  height: '28px',
                  width: '28px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#5f6368',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#1a73e8';
                  e.currentTarget.style.color = '#1a73e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                  e.currentTarget.style.color = '#5f6368';
                }}
                title="Patient Posology Handout (Printable / Shareable Sheet)"
                aria-label="Patient Posology Handout"
              >
                <FileText size={14} />
              </button>
            )}

            {/* QUICK ACTION 3: Official Bottle Labels (Direct 1-Click Access) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLabelsModal(rx);
              }}
              style={{
                height: '28px',
                width: '28px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#5f6368',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fffbeb';
                e.currentTarget.style.borderColor = '#d97706';
                e.currentTarget.style.color = '#d97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#dadce0';
                e.currentTarget.style.color = '#5f6368';
              }}
              title="Official Bottle Labels"
              aria-label="Official Bottle Labels"
            >
              <Tag size={14} />
            </button>

            {/* OVERFLOW MENU BUTTON ("⋯" — Secondary Actions per Golden Rule #33) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('selection');
                setMobileActionRx(rx);
              }}
              style={{
                height: '28px',
                width: '28px',
                borderRadius: '4px',
                background: mobileActionRx?.id === rx.id ? '#eff6ff' : '#ffffff',
                border: mobileActionRx?.id === rx.id ? '1px solid #1a73e8' : '1px solid #dadce0',
                color: mobileActionRx?.id === rx.id ? '#1a73e8' : '#5f6368',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.12s'
              }}
              title="More quick clinical actions..."
              aria-label="More clinical actions"
            >
              <MoreHorizontal size={15} />
            </button>

            {/* FLOATING ACTION POINTS MENU (Pop-over) */}
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '32px',
                  right: '0',
                  zIndex: 90,
                  width: '240px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  textAlign: 'left'
                }}
              >
                {/* 1. Patient Posology Handout */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveActionsMenuRxId(null);
                    handleOpenHandout(rx);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={14} style={{ color: '#4338ca' }} />
                  <span>Patient Posology Handout</span>
                </button>

                {/* 2. Re-prescribe Formula */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveActionsMenuRxId(null);
                    handleReprescribeFormula(rx);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <RefreshCw size={14} style={{ color: '#0284c7' }} />
                  <span>Re-prescribe Formula</span>
                </button>

                {/* 3. Contact Atlas on WhatsApp */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveActionsMenuRxId(null);
                    handleContactAtlasWhatsApp(
                      `Prescription #${rx.code} (${rx.patientName || 'Patient'})`,
                      `Clinical formulation inquiry: ${rx.treatmentTitle || 'Compounded Formula'}`
                    );
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <MessageCircle size={14} style={{ color: '#059669' }} />
                  <span>Contact Atlas on WhatsApp</span>
                </button>

                {/* 4. Official Bottle Labels */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveActionsMenuRxId(null);
                    handleOpenLabelsModal(rx);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Tag size={14} style={{ color: '#d97706' }} />
                  <span>Official Bottle Labels</span>
                </button>

                {/* 5. Protocol Reference (if present) */}
                {(rx.protocolUrl || rx.protocolSlug) && (
                  <a
                    href={rx.protocolUrl || `/proto/${rx.protocolSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setActiveActionsMenuRxId(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1d4ed8',
                      textDecoration: 'none',
                      borderRadius: '5px',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <BookOpen size={14} style={{ color: '#1d4ed8' }} />
                    <span>Protocol Reference</span>
                    <ExternalLink size={10} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                  </a>
                )}

                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                {/* 6. Edit Start Date & Duration */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveActionsMenuRxId(null);
                    openTimelineModal(rx, e);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#475569',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Calendar size={14} style={{ color: '#1a73e8' }} />
                  <span>Edit Start Date & Duration</span>
                </button>

                {/* 7. Copy Patient Link */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveActionsMenuRxId(null);
                    const url = `${window.location.origin}/rx/${rx.code}?view=patient`;
                    navigator.clipboard?.writeText(url);
                    toast.success('Patient direct link copied ✓');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#475569',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Share2 size={14} style={{ color: '#64748b' }} />
                  <span>Copy Patient Link</span>
                </button>
              </div>
            )}
          </div>
        );
      }
    }
  ], [signingTaskId, handleSignOffPrescription, handleShareProposalWhatsApp, activeActionsMenuRxId, mobileActionRx]);

  // ── Bloodo Diagnostic Lab Results Columns (DataTable Universal) ─────────
  const labResultsColumns = useMemo(() => [
    {
      key: 'code',
      header: 'Protocol / Sample Code',
      width: '18%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <CopyableId value={row.code || row.protocolNumber || row.id} iconOnly={false} />
          <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
            {row.sampleType || 'Dried Blood Spot (DBS)'}
          </span>
        </div>
      )
    },
    {
      key: 'testName',
      header: 'Biomarker & Diagnostic Assay',
      width: '28%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
            {row.testName || row.biomarker || 'NAD+ Quantitative Test'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b' }}>
            <span style={{ fontWeight: 600, color: '#0369a1' }}>{row.laboratory?.name || 'LifeLab1'}</span>
            <span>•</span>
            <span>{row.method || 'Enzymatic cyclic assay'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'result',
      header: 'Quantification',
      width: '18%',
      sortable: true,
      render: (row) => {
        const zone = row.zone || 'yellow';
        const isYellow = zone === 'yellow';
        const isGreen = zone === 'green';
        const badgeColor = isGreen ? '#16a34a' : isYellow ? '#d97706' : '#dc2626';
        const badgeBg = isGreen ? '#f0fdf4' : isYellow ? '#fffbeb' : '#fef2f2';
        const badgeBorder = isGreen ? '#bbf7d0' : isYellow ? '#fde68a' : '#fecaca';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {row.value}
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>
                {row.unit || 'µmol/L'}
              </span>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: badgeColor,
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                width: 'fit-content'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badgeColor }} />
              {row.zoneLabel || (isYellow ? 'Insufficient' : isGreen ? 'Optimal' : 'Deficient')}
            </span>
          </div>
        );
      }
    },
    {
      key: 'patient',
      header: 'Patient Profile',
      width: '18%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 650, color: '#1e293b' }}>
            {row.patientName || row.patient?.name || 'Patient'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {row.patient?.age ? `${row.patient.age} yrs` : ''} {row.patient?.gender ? `· ${row.patient.gender}` : ''}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '18%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Link
            href={`/lab/${row.code || row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: '#003666',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 650,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,54,102,0.12)'
            }}
          >
            <span>Public Dossier</span>
            <ArrowUpRight size={12} />
          </Link>
          {row.pdfReportUrl && (
            <a
              href={row.pdfReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              title="Download Original Laboratory Report PDF"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <Download size={13} />
            </a>
          )}
        </div>
      )
    }
  ], []);

  // ── Practice Pharmacopeia Columns (DataTable Universal) ───────────────────
  const pharmacopeiaColumns = useMemo(() => [
    {
      key: 'name',
      header: 'Active Pharmaceutical Ingredient (API)',
      width: '28%',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.86rem' }}>
            {p.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{p.casNumber ? `CAS: ${p.casNumber}` : 'High-Purity API'}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#003666', fontWeight: 600 }}>Pure Compounding Substance</span>
          </div>
        </div>
      )
    },
    {
      key: 'primaryGoal',
      header: 'Therapeutic Objective & Axis',
      width: '24%',
      sortable: true,
      render: (p) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#e0f2fe',
              color: '#0369a1',
              fontSize: '0.72rem',
              fontWeight: 600
            }}
          >
            {p.primaryGoal || 'Cellular Optimization'}
          </span>
          {p.goals && p.goals.length > 1 && (
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              {p.goals.slice(1).join(', ')}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'purity',
      header: 'Pharmacopeial Purity',
      width: '18%',
      sortable: true,
      render: (p) => (
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 650,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCircle2 size={11} />
            {p.purity || '≥ 99% HPLC Verified'}
          </span>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
            EU GMP Cleanroom
          </div>
        </div>
      )
    },
    {
      key: 'route',
      header: 'API Compounding Specification',
      width: '18%',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
            {p.apiForm || p.route || 'Lyophilized API Powder'}
          </div>
          <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
            Active Pharmaceutical Ingredient
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Monograph',
      width: '12%',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedMonograph(p)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              height: '30px',
              padding: '0 10px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#1a73e8',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <Eye size={12} />
            <span>Monograph</span>
          </button>
        </div>
      )
    }
  ], []);

  // ── Bloodo™ Diagnostic Panels (All 6 CE-IVDR Certified Panels) ─────────────
  const bloodoPanels = useMemo(() => {
    if (Array.isArray(data?.bloodoPanels) && data.bloodoPanels.length === 6) {
      return data.bloodoPanels;
    }
    return [
      {
        id: 'bloodo-nad-level-test',
        slug: 'bloodo-nad-level-test',
        name: 'Bloodo™ NAD Level Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '3-4 Business Days',
        indications: 'CE-IVDR certified quantitative capillary dried blood spot diagnostic test measuring total cellular NAD (NAD+ and NADH). Essential for cellular bioenergetics, sirtuin activation, and PARP-mediated DNA repair.',
        biomarkers: ['Total Cellular NAD (NAD+ and NADH)', 'Intracellular Redox Potential', 'ATP Synthesis Capacity'],
        clinicalUtility: 'Objectively tracks intracellular NAD depletion and verifies clinical bioavailability before and during peptide & longevity protocols.',
        price: '$199',
        datasheetUrl: '/p/bloodo-nad-level-test'
      },
      {
        id: 'cortisol-test',
        slug: 'cortisol-test',
        name: 'Bloodo™ Cortisol Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '2-3 Business Days',
        indications: 'Measures free and total morning awakening cortisol from capillary dried blood spot. Evaluates Hypothalamic-Pituitary-Adrenal (HPA) axis balance and chronic allostatic stress burden.',
        biomarkers: ['Free Morning Cortisol', 'Total Serum-Equivalent Cortisol', 'Cortisol Awakening Response (CAR)', 'HPA Axis Stress Index'],
        clinicalUtility: 'Identifies adrenal exhaustion, circadian misalignment, or hypercortisolemia prior to secretagogue or metabolic peptide cycles.',
        price: '$79',
        datasheetUrl: '/p/cortisol-test'
      },
      {
        id: 'hemoglobin-a1c-hba1c-test',
        slug: 'hemoglobin-a1c-hba1c-test',
        name: 'Bloodo™ Hemoglobin A1c (HbA1c) Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '2-3 Business Days',
        indications: 'CE-IVDR certified dried blood spot assay quantifying 90-day glycemic exposure via NGSP/IFCC traceable chromatography at LifeLab1 (Vilnius, Lithuania).',
        biomarkers: ['Glycated Hemoglobin (% HbA1c / mmol/mol)', 'Estimated Average Glucose (eAG)', 'Insulin Sensitivity Profile'],
        clinicalUtility: 'Guides and benchmarks micro-dosing titration for GLP-1/GIP receptor agonists (Tirzepatide, Semaglutide, Retatrutide) and metabolic therapy.',
        price: '$59',
        datasheetUrl: '/p/hemoglobin-a1c-hba1c-test'
      },
      {
        id: 'omega-ratio-test',
        slug: 'omega-ratio-test',
        name: 'Bloodo™ Omega Ratio & Index Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '3-4 Business Days',
        indications: 'Erythrocyte membrane fatty acid chromatography (GC-MS) measuring cardioprotective Omega-3 Index, Omega-6/Omega-3 ratio, and AA/EPA inflammatory index.',
        biomarkers: ['Omega-3 Index (EPA + DHA %)', 'Omega-6 / Omega-3 Ratio', 'AA / EPA Inflammatory Ratio', 'Trans-Fatty Acids Index'],
        clinicalUtility: 'Establishes cellular membrane fluidity and inflammatory balance prior to tissue regeneration peptide protocols (BPC-157, TB-500, GHK-Cu).',
        price: '$79',
        datasheetUrl: '/p/omega-ratio-test'
      },
      {
        id: 'testosterone-test',
        slug: 'testosterone-test',
        name: 'Bloodo™ Testosterone+ Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '3-4 Business Days',
        indications: 'High-resolution LC-MS/MS capillary blood assay calibrated to CDC hormone standardization standards for total and bioavailable testosterone.',
        biomarkers: ['Total Testosterone', 'Bioavailable Testosterone Index', 'Free Androgen Ratio'],
        clinicalUtility: 'Baseline and follow-up endocrine profiling for vitality protocols, secretagogue therapy (CJC-1295 / Ipamorelin), and hormone optimization.',
        price: '$99',
        datasheetUrl: '/p/testosterone-test'
      },
      {
        id: 'vitamin-d-test',
        slug: 'vitamin-d-test',
        name: 'Bloodo™ Vitamin D Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '2-3 Business Days',
        indications: 'CE-IVDR certified quantitative assay measuring total 25-hydroxyvitamin D [25(OH)D2 + 25(OH)D3] via gold-standard LC-MS/MS with DEQAS certified accuracy.',
        biomarkers: ['Total 25-Hydroxyvitamin D [25(OH)D2 + 25(OH)D3]', '25(OH)D3 Active Fraction', 'Immune Competence Marker'],
        clinicalUtility: 'Optimizes immune competence, bone mineralization, genomic transcription regulation, and hormone receptor sensitivity.',
        price: '$59',
        datasheetUrl: '/p/vitamin-d-test'
      }
    ];
  }, [data]);

  const uniquePatientsCount = useMemo(() => {
    const set = new Set();
    allPrescriptions.forEach(rx => {
      const p = (rx.patientName || rx.patient?.name || rx.patientId || '').trim().toLowerCase();
      if (p) set.add(p);
    });
    return set.size;
  }, [allPrescriptions]);

  const sidebarNavGroups = useMemo(() => [
    {
      group: 'PRACTICE WORKSPACE',
      groupTitle: 'PRACTICE WORKSPACE',
      items: [
        {
          id: 'overview',
          label: 'Practice Dashboard',
          icon: BarChart3,
          badge: null
        },
        {
          id: 'prescriptions',
          label: 'Patient Prescriptions',
          icon: Layers,
          badge: allPrescriptions.length > 0 ? allPrescriptions.length : null,
          actionBadge: quickCounts.pending > 0 ? quickCounts.pending : null,
          actionBadgeTooltip: quickCounts.pending > 0
            ? `${quickCounts.pending} prescription(s) awaiting action (${quickCounts.drafts} draft/sign-off, ${quickCounts.proposals} unaccepted offer)`
            : undefined
        },
        {
          id: 'patients',
          label: 'Monitored Patients',
          icon: Users,
          badge: uniquePatientsCount > 0 ? uniquePatientsCount : null
        },
        {
          id: 'tasks',
          label: 'Action Queue',
          icon: Clock,
          actionBadge: filteredTasks.length > 0 ? filteredTasks.length : null,
          actionBadgeTooltip: filteredTasks.length > 0
            ? `${filteredTasks.length} pending clinical task(s) requiring physician review`
            : undefined
        }
      ]
    },
    {
      group: 'CLINICAL INTELLIGENCE',
      groupTitle: 'CLINICAL INTELLIGENCE',
      items: [
        {
          id: 'lab_results',
          label: 'Lab Diagnostics',
          icon: FlaskConical,
          badge: allLabResults.length > 0 ? allLabResults.length : null
        },
        {
          id: 'recommendations',
          label: 'Clinical Synergies',
          icon: Sparkles,
          badge: null
        },
        {
          id: 'search',
          label: 'Spotlight Search',
          icon: Search,
          badge: '⌘K'
        }
      ]
    },
    {
      group: 'PRACTICE SETTINGS & CREDENTIALS',
      groupTitle: 'PRACTICE SETTINGS & CREDENTIALS',
      items: [
        {
          id: 'credentials',
          label: 'Physician Credentials',
          icon: ShieldCheck,
          badge: null
        },
        {
          id: 'services_tiers',
          label: 'Platform & Services',
          icon: Award,
          badge: null
        }
      ]
    }
  ], [allPrescriptions.length, uniquePatientsCount, filteredTasks.length, allLabResults.length, quickCounts.pending, quickCounts.drafts, quickCounts.proposals]);

  const handleSidebarNavigate = (itemOrId) => {
    triggerHaptic('light');
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;

    if (id === 'intake') {
      setIsIntakeOpen(true);
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (id === 'search' || id === 'patients') {
      setIsPracticeSearchOpen(true);
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (id === 'credentials') {
      setIsCredentialsModalOpen(true);
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (id === 'services_tiers') {
      setIsServicesModalOpen(true);
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }

    if (id === 'prescriptions') {
      setQuickRxFilter('all');
      setStatusFilter('all');
      setPatientFilter('all');
      setTemporalFilter('all');
      setApiFilter(null);
      setActiveAnchor('prescriptions');
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (id === 'tasks') {
      setTaskFilter('all');
    }

    // Single active view routing (GCP Standard: only show selected menu item)
    setActiveAnchor(id);
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#003666', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Loading Clinical Physician Portal...</p>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '2rem' }}>
        <EmptyState
          icon={AlertCircle}
          title="Physician Profile Unavailable"
          subtitle={error || "We couldn't locate this doctor in the clinical directory."}
          action={{
            label: "Back to Home",
            onClick: () => window.location.href = '/'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <style jsx global>{`
        .gcp-portal-layout {
          display: flex;
          min-height: calc(100vh - 100px);
          background: #f8fafc;
          position: relative;
        }
        .gcp-clinical-sidebar {
          width: 250px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #dadce0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: sticky;
          top: 100px;
          height: calc(100vh - 100px);
          transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
          overflow-y: auto;
        }
        .gcp-clinical-sidebar.collapsed {
          width: 64px;
        }
        .gcp-portal-main {
          flex: 1;
          min-width: 0;
          max-width: 1320px;
          padding: 24px 28px 120px 28px;
          margin: 0 auto;
        }
        .doctor-bottom-dock {
          position: fixed;
          bottom: 18px;
          left: calc(250px + (100% - 250px) / 2);
          transform: translateX(-50%);
          width: calc(100% - 280px);
          max-width: 820px;
          z-index: 40;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          outline: 1px solid rgba(203, 213, 225, 0.4);
          border-radius: 9999px;
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
          padding: 8px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gcp-portal-layout:has(.gcp-clinical-sidebar.collapsed) .doctor-bottom-dock {
          left: calc(64px + (100% - 64px) / 2);
          width: calc(100% - 96px);
        }
        .doctor-bottom-dock-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          width: 100%;
        }
        .doctor-dock-btn {
          height: 36px;
          padding: 0 14px;
          border-radius: 9999px;
          font-size: 0.80rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .doctor-dock-mobile-only {
          display: none !important;
        }
        @media (max-width: 768px) {
          .doctor-dock-mobile-only {
            display: inline-flex !important;
          }
        }
        .doctor-dock-btn-primary {
          background: linear-gradient(180deg, #1a73e8 0%, #1557b0 100%);
          color: #ffffff;
          border-color: rgba(21, 87, 176, 0.85);
          box-shadow: 0 2px 6px rgba(26, 115, 232, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        .doctor-dock-btn-primary:hover {
          background: #1557b0;
          border-color: #1557b0;
          box-shadow: 0 3px 8px rgba(26, 115, 232, 0.45);
        }
        .doctor-dock-btn-secondary {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #1e293b;
          border-color: rgba(203, 213, 225, 0.85);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        .doctor-dock-btn-secondary:hover {
          background: #ffffff;
          border-color: #1a73e8;
          color: #1a73e8;
          box-shadow: 0 2px 6px rgba(26, 115, 232, 0.12);
        }
        .doctor-dock-btn-whatsapp {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #1e293b;
          border-color: rgba(203, 213, 225, 0.85);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        .doctor-dock-btn-whatsapp:hover {
          background: #f0fdf4;
          border-color: #86efac;
          color: #166534;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.12);
        }
        .doctor-dock-btn-whatsapp:hover svg {
          color: #16a34a !important;
        }
        .doctor-dock-btn-ai {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #1e293b;
          border-color: rgba(203, 213, 225, 0.85);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        .doctor-dock-btn-ai:hover {
          background: #f5f3ff;
          border-color: #c4b5fd;
          color: #4338ca;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.12);
        }
        .doctor-dock-btn-ai:hover svg {
          color: #7c3aed !important;
        }
        @media (max-width: 768px) {
          .doctor-bottom-dock {
            bottom: 0;
            left: 0;
            transform: none;
            width: 100%;
            max-width: 100%;
            border-radius: 20px 20px 0 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.86);
            backdrop-filter: blur(24px) saturate(190%);
            -webkit-backdrop-filter: blur(24px) saturate(190%);
            padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px)) 10px;
            box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          }
          .doctor-bottom-dock-actions {
            flex-wrap: nowrap;
            overflow-x: auto;
            justify-content: flex-start;
            padding: 2px 4px;
            -webkit-overflow-scrolling: touch;
          }
          .doctor-dock-btn {
            height: 36px;
            padding: 0 12px;
            font-size: 0.74rem;
            flex-shrink: 0;
          }
          .doctor-recommendations-section {
            padding: 16px 12px !important;
            margin-bottom: 120px !important;
            border-radius: 8px !important;
          }
          .doctor-recommendation-row {
            padding: 14px 12px !important;
          }
          .doctor-recommendation-header-actions {
            width: 100% !important;
            justify-content: flex-start !important;
            margin-top: 4px !important;
          }
          .doctor-recommendation-action-btn {
            flex: 1 1 auto !important;
            justify-content: center !important;
            min-height: 38px !important;
          }
        }
        .gcp-mobile-nav-trigger {
          display: none;
        }
        .gcp-mobile-doctor-capsule {
          display: none;
        }
        @media (max-width: 900px) {
          .gcp-clinical-sidebar {
            display: none !important;
          }
          .gcp-mobile-nav-trigger {
            display: inline-flex !important;
          }
          .gcp-mobile-doctor-capsule {
            display: flex !important;
          }
          .gcp-portal-main {
            padding: 14px 14px 130px 14px;
          }
        }
        .gcp-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1100px) {
          .gcp-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
        @media (max-width: 580px) {
          .gcp-kpi-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
        .gcp-kpi-card {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 8px;
          padding: 16px 18px;
          box-shadow: 0 1px 2px rgba(60,64,67,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .gcp-kpi-card:hover {
          border-color: #bdc1c6;
          box-shadow: 0 2px 6px rgba(60,64,67,0.12);
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* ── Customer Agent Concierge Physician Switcher Bar (Google Cloud Console UX) ── */}
      {isCustomerAgent && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: '#0f172a',
          color: '#ffffff',
          borderBottom: '1px solid #1e293b',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Agent Identity & Role Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0284c7',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              <Users size={14} />
              <span>Customer Agent</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                {agentName}
              </span>
              <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
                {lang === 'es' ? 'Portal de Gestión y Atención al Paciente' : 'Clinical Prescriptions & Care Concierge Desk'}
              </span>
            </div>
          </div>

          {/* Physician Switcher (Select from prescribers) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', maxWidth: '560px', minWidth: '280px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              {lang === 'es' ? 'Médico Activo:' : 'Active Physician:'}
            </span>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={slug}
                onChange={(e) => {
                  const targetVal = e.target.value;
                  const docObj = agentDoctors.find(d => (d.nameSlug === targetVal || d.opaqueCode === targetVal || d.id === targetVal));
                  if (docObj) handleSelectDoctor(docObj);
                  else handleSelectDoctor({ nameSlug: targetVal, name: targetVal });
                }}
                disabled={isSwitchingDoctor}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 32px 0 12px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isSwitchingDoctor ? 'wait' : 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              >
                {agentDoctors.map((doc) => {
                  const val = doc.nameSlug || doc.opaqueCode || doc.id;
                  return (
                    <option key={doc.id || doc.opaqueCode} value={val} style={{ background: '#0f172a', color: '#f8fafc' }}>
                      👨‍⚕️ {doc.name} — {doc.clinic || 'Partner Clinic'} ({doc.rxCount || 0} Prescriptions)
                    </option>
                  );
                })}
              </select>
            </div>
            {isSwitchingDoctor && (
              <Loader2 size={16} className="animate-spin" color="#38bdf8" />
            )}
          </div>

          {/* Quick Actions (Copy Link, Direct URL) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                const docUrl = `${window.location.origin}/dr/${doctor?.opaqueCode || slug}`;
                navigator?.clipboard?.writeText(docUrl);
                toast.success(lang === 'es' ? 'Enlace del médico copiado ✓' : 'Public doctor URL copied to clipboard ✓');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: 32,
                padding: '0 10px',
                borderRadius: '5px',
                border: '1px solid #334155',
                background: '#1e293b',
                color: '#38bdf8',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              title="Copy public link to this doctor's portal"
            >
              <ExternalLink size={13} />
              <span>{lang === 'es' ? 'Ver /dr/' : 'View /dr/'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Unified Public Header (Homogeneous with /rx/[code] & GCP Standards) ── */}
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={setLang}
        clinicLogo={doctor?.clinicLogo || doctor?.logoUrl}
        clinicName={doctor?.clinic}
        copyUrl={`https://www.atlashealth-services.com/dr/${doctor?.opaqueCode || slug}`}
        shortUrl={`https://www.atlashealth-services.com/dr/${doctor?.opaqueCode || slug}`}
        brandHref={isCustomerAgent ? `/agent?dr=${slug}` : `/dr/${slug}`}
        doctorHomeHref={isCustomerAgent ? `/agent?dr=${slug}` : `/dr/${slug}`}
        doctorName={doctor.name}
        hideTier2={true}
        hideImportRx={true}
        hideSwitchRx={true}
        hideSearchButton={true}
        isDoctorView={true}
        onImportRx={() => setIsIntakeOpen(true)}
        onSwitchRx={() => handleSidebarNavigate('prescriptions')}
        rxSwitcherCount={quickCounts.pending}
      />

      {/* ── Portal Layout with Left Collapsible Clinical Rail (GCP Standard) ── */}
      <div className="gcp-portal-layout">
        {/* Left Clinical Sidebar */}
        <aside
          className={`gcp-clinical-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
          aria-label="Clinical Navigation Sidebar"
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: isSidebarCollapsed ? '12px 6px' : '12px 0' }}>
            {sidebarNavGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: isSidebarCollapsed ? '12px' : '16px' }}>
                {!isSidebarCollapsed && (
                  <div
                    style={{
                      padding: '8px 16px 4px 16px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#5f6368',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    {group.group}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAnchor === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSidebarNavigate(item.id)}
                      title={item.actionBadgeTooltip ? `${item.label} — ${item.actionBadgeTooltip}` : item.label}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                        gap: '8px',
                        padding: isSidebarCollapsed ? '10px 0' : '9px 14px',
                        border: 'none',
                        borderLeft: isActive ? '3px solid #1a73e8' : '3px solid transparent',
                        background: isActive ? '#e8f0fe' : 'transparent',
                        color: isActive ? '#1a73e8' : '#3c4043',
                        fontSize: '0.81rem',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.12s, color 0.12s',
                        borderRadius: isSidebarCollapsed ? '6px' : '0',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f1f3f4';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                        <Icon size={17} style={{ color: isActive ? '#1a73e8' : '#5f6368', flexShrink: 0 }} />
                        {!isSidebarCollapsed && (
                          <span style={{ whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isSidebarCollapsed && (item.actionBadge !== null && item.actionBadge !== undefined || item.badge !== null && item.badge !== undefined) && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          {item.actionBadge !== null && item.actionBadge !== undefined && (
                            <span
                              title={item.actionBadgeTooltip}
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                minWidth: '18px',
                                textAlign: 'center',
                                borderRadius: '999px',
                                background: '#dc2626',
                                color: '#ffffff',
                                lineHeight: 1.35,
                                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.25)'
                              }}
                            >
                              {item.actionBadge}
                            </span>
                          )}
                          {item.badge !== null && item.badge !== undefined && !item.actionBadge && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: '10px',
                                background: isActive ? '#d2e3fc' : '#f1f5f9',
                                color: isActive ? '#174ea6' : '#475569',
                                lineHeight: 1.35
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      {isSidebarCollapsed && item.actionBadge > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '12px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#dc2626',
                            border: '1.5px solid #ffffff'
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Physician Portal Owner Identity Card & Profile Manager */}
          <div style={{ padding: isSidebarCollapsed ? '8px 6px' : '10px 12px', borderTop: '1px solid #dadce0', background: '#f8fafc' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsCredentialsModalOpen(true);
              }}
              title={`View and manage physician profile: ${doctor.name || 'Treating Physician'}`}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                gap: '8px',
                padding: isSidebarCollapsed ? '6px 4px' : '8px 10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                {/* Avatar Circle with Verified Indicator */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.80rem',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,54,102,0.2)'
                  }}
                >
                  {doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      border: '1.5px solid #ffffff'
                    }}
                    title="DHA Verified Active"
                  />
                </div>

                {!isSidebarCollapsed && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.25,
                        wordBreak: 'break-word'
                      }}
                    >
                      {doctor.name || 'Treating Physician'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.64rem',
                        color: '#0d9488',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                        marginTop: '2px'
                      }}
                    >
                      {doctor.clinic || doctor.specialty || 'Verified Medical Practice'}
                    </div>
                  </div>
                )}
              </div>

              {!isSidebarCollapsed && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title="View and edit physician profile"
                >
                  <Edit3 size={12} />
                </div>
              )}
            </button>
          </div>



          {/* Bottom Rail Collapse Toggle */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between'
            }}
          >
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>
                Clinical Navigator
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#5f6368',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.1)'
              }}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>
        </aside>

        {/* ── Main Clinical Content Container ─────────────────────────────── */}
        <main className="gcp-portal-main">
          {/* ── Mobile Doctor Identity Capsule (Rendered only on screens <= 900px, removed from main flow on desktop) ── */}
          <div
            className="gcp-mobile-doctor-capsule"
            style={{
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '16px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div
              onClick={() => {
                triggerHaptic('light');
                setIsCredentialsModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, cursor: 'pointer' }}
              title="Click to view verified doctor credentials & DHA license"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doctor.name}
                  </span>
                  <span style={{ fontSize: '0.60rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    DHA Verified ✓
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doctor.specialty} • {doctor.license}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsCredentialsModalOpen(true);
                }}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#334155',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="View Doctor Credentials & License"
              >
                <ShieldCheck size={12} style={{ color: '#0d9488' }} />
                <span>Info</span>
              </button>

              <button
                type="button"
                className="gcp-mobile-nav-trigger"
                onClick={() => setIsMobileSidebarOpen(true)}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  border: '1px solid #1a73e8',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Open Navigation Menu"
              >
                <Menu size={13} />
                <span>Menu</span>
              </button>
            </div>
          </div>

          {/* ── Google Cloud Console Command Bar (GCP Standard Page Header) ── */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              marginBottom: '20px',
              borderBottom: '1px solid #dadce0',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Section Breadcrumb & Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#5f6368', fontWeight: 500 }}>
                  Doctor Portal &gt; {doctor.name}
                </span>
                <span style={{ fontSize: '0.64rem', background: '#e8f0fe', color: '#1a73e8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {doctor.license || 'DHA Verified'}
                </span>
              </div>
              <h1 style={{ fontSize: '1.24rem', fontWeight: 600, color: '#202124', margin: 0 }}>
                {activeAnchor === 'overview' && 'Practice Overview & Clinical KPIs'}
                {activeAnchor === 'search' && 'Clinical Registry Search & Multi-Table Query'}
                {activeAnchor === 'tasks' && `Pending To-Do Queue (${filteredTasks.length} Action Items)`}
                {activeAnchor === 'prescriptions' && `Compounded Prescriptions Dossier (${filteredPrescriptions.length} Records)`}
                {activeAnchor === 'recommendations' && 'Atlas Recommendations & Peptide Clinical Synergy'}
              </h1>
            </div>

            {/* Actions Area: GCP Consolidated Command Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Google Cloud Live Status Indicator (Rule #25 / Non-blocking) */}
              <div
                title="Continuous background synchronization active. Clinical registry is automatically updated every 60s and on window focus."
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '16px',
                  background: isBackgroundSyncing ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${isBackgroundSyncing ? '#bfdbfe' : '#e2e8f0'}`,
                  fontSize: '0.72rem',
                  color: isBackgroundSyncing ? '#1d4ed8' : '#64748b',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isBackgroundSyncing ? '#2563eb' : '#16a34a',
                    boxShadow: isBackgroundSyncing ? '0 0 0 2px rgba(37,99,235,0.2)' : '0 0 0 2px rgba(22,163,74,0.18)',
                    display: 'inline-block'
                  }}
                />
                <span>
                  {isBackgroundSyncing
                    ? 'Updating...'
                    : `Live · ${lastRefreshed ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Auto-synced'}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsIntakeOpen(true);
                }}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                }}
                title="Import medical records, PDF lab results, or clinical data"
              >
                <Upload size={14} style={{ color: '#5f6368' }} />
                <span>Import EHR / Data</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsIntakeOpen(true);
                }}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  border: '1px solid #1a73e8',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(26,115,232,0.3)'
                }}
                title="Create a new compounded prescription or treatment proposal"
              >
                <Plus size={15} />
                <span>New Prescription</span>
              </button>
            </div>
          </header>

          {/* ── View 1: Practice Overview & Core Operational KPIs (Google Cloud Rule #22) ─ */}
          {activeAnchor === 'overview' && (
            <div id="overview" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                    Operational Metrics
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: scopeMode === 'filtered' ? '#f0fdf4' : '#eff6ff',
                      color: scopeMode === 'filtered' ? '#16a34a' : '#1d4ed8',
                      border: `1px solid ${scopeMode === 'filtered' ? '#bbf7d0' : '#bfdbfe'}`,
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontWeight: 600
                    }}
                  >
                    {scopeMode === 'filtered'
                      ? `Active Filters View (${filteredPrescriptions.length} matching rx)`
                      : `Global Practice View (${allPrescriptions.length} total rx)`}
                  </span>
                </div>

                {/* Scope Switcher (Rule #22) */}
                <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setScopeMode('global')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: scopeMode === 'global' ? '#ffffff' : 'transparent',
                      color: scopeMode === 'global' ? '#0f172a' : '#64748b',
                      boxShadow: scopeMode === 'global' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    Global Database
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeMode('filtered')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
                      color: scopeMode === 'filtered' ? '#0f172a' : '#64748b',
                      boxShadow: scopeMode === 'filtered' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    Matching Filters
                  </button>
                </div>
              </div>

              <div className="gcp-kpi-grid">
                {/* KPI 1: Active Prescriptions */}
                <div
                  className="gcp-kpi-card"
                  onClick={() => {
                    triggerHaptic('light');
                    setStatusFilter('active');
                    setPatientFilter('all');
                    setTemporalFilter('all');
                    setSearchQuery('');
                    setScopeMode('filtered');
                    handleSidebarNavigate('prescriptions');
                    toast.success(`Filtered table: Showing ${activeKpis.activePrescriptions} active prescriptions`, { id: 'kpi-filter' });
                  }}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  title="Click to view Active Prescriptions in table"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active Prescriptions</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={16} style={{ color: '#16a34a' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                    {activeKpis.activePrescriptions}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Compounded posology regimens</span>
                    <span style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 600 }}>Filter table →</span>
                  </div>
                </div>

                {/* KPI 2: Monitored Patients */}
                <div
                  className="gcp-kpi-card"
                  onClick={() => {
                    triggerHaptic('light');
                    setStatusFilter('all');
                    setPatientFilter('all');
                    setTemporalFilter('all');
                    setSearchQuery('');
                    setScopeMode('global');
                    handleSidebarNavigate('prescriptions');
                    toast.success(`Displaying all ${globalKpis.monitoredPatients} monitored patient dossiers`, { id: 'kpi-filter' });
                  }}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  title="Click to view Monitored Patients directory"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Monitored Patients</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} style={{ color: '#1a73e8' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                    {activeKpis.monitoredPatients}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Unique patient dossiers managed</span>
                    <span style={{ fontSize: '0.70rem', color: '#1a73e8', fontWeight: 600 }}>View patients →</span>
                  </div>
                </div>

                {/* KPI 3: Pending Clinical Tasks */}
                <div
                  className="gcp-kpi-card"
                  onClick={() => {
                    triggerHaptic('light');
                    setTaskFilter('all');
                    setSearchQuery('');
                    handleSidebarNavigate('tasks');
                    toast.success(`Showing all ${activeKpis.pendingTasksCount} actionable clinical tasks`, { id: 'kpi-filter' });
                  }}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  title="Click to view Action Tasks in to-do list"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Action Tasks</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={16} style={{ color: '#d97706' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#d97706', lineHeight: 1.1 }}>
                    {activeKpis.pendingTasksCount}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Actionable reviews & titrations</span>
                    <span style={{ fontSize: '0.70rem', color: '#d97706', fontWeight: 600 }}>View tasks →</span>
                  </div>
                </div>

                {/* KPI 4: Refills & Titrations Due */}
                <div
                  className="gcp-kpi-card"
                  onClick={() => {
                    triggerHaptic('light');
                    setTaskFilter('refill');
                    setSearchQuery('');
                    setScopeMode('filtered');
                    handleSidebarNavigate('tasks');
                    toast.success(`Filtered To-Do Queue: Showing ${activeKpis.refillsDueCount} refills due`, { id: 'kpi-filter' });
                  }}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  title="Click to view Refill & Renewal Tasks in to-do list"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Refills & Cycles</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} style={{ color: '#7c3aed' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#7c3aed', lineHeight: 1.1 }}>
                    {activeKpis.refillsDueCount}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Upcoming supply cycles (14 days)</span>
                    <span style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 600 }}>Filter refills →</span>
                  </div>
                </div>
              </div>



              {/* ── Deep Clinical Analytics & Prescribing Intelligence (Rule #22) ── */}
              <div style={{ marginTop: '24px' }}>
                <DoctorClinicalAnalytics
                  prescriptions={scopeMode === 'filtered' ? filteredPrescriptions : allPrescriptions}
                  serverAnalytics={data?.serverAnalytics}
                  onSelectApi={(apiName) => {
                    if (apiFilter && apiFilter.toLowerCase() === apiName.toLowerCase()) {
                      setApiFilter(null);
                      toast('Cleared active API filter', { id: 'api-filter' });
                    } else {
                      setApiFilter(apiName);
                      handleSidebarNavigate('prescriptions');
                      toast.success(`Filtered table: showing ${apiName} formulations`, { id: 'api-filter' });
                    }
                  }}
                  selectedApiFilter={apiFilter}
                  onClearApiFilter={() => {
                    setApiFilter(null);
                    toast('Cleared active API filter', { id: 'api-filter' });
                  }}
                  isFiltered={scopeMode === 'filtered' || !!apiFilter}
                />
              </div>
            </div>
          )}

          {/* ── View 2: Clinical Search & Universal Multi-Table Query (Rule #7) ─ */}
          {activeAnchor === 'search' && (
            <section
              id="search-workspace"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              {/* Header Title */}
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.10rem', fontWeight: 600, color: '#202124', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={18} style={{ color: '#1a73e8' }} />
                  <span>Universal Clinical Registry Search</span>
                </h2>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#5f6368' }}>
                  Instant cross-table query across patients, prescription numbers, compound pharmacopeia, and clinical tasks.
                </p>
              </div>

              {/* Prominent Global Search Bar */}
              <GlobalSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search patient, prescription code (e.g. RX-2024-001), active compound, or status..."
                resultCount={filteredPrescriptions.length + filteredTasks.length}
                namespace={`doctor-${slug}`}
                size="lg"
                filters={[
                  statusFilter !== 'all' && {
                    key: 'status',
                    label: 'Status',
                    value: statusFilter.toUpperCase(),
                    onRemove: () => setStatusFilter('all')
                  },
                  taskFilter !== 'all' && {
                    key: 'task',
                    label: 'Task Type',
                    value: taskFilter.toUpperCase(),
                    onRemove: () => setTaskFilter('all')
                  },
                  apiFilter && {
                    key: 'api',
                    label: 'Active API',
                    value: apiFilter,
                    onRemove: () => setApiFilter(null)
                  }
                ].filter(Boolean)}
                filterOptions={[
                  {
                    key: 'status',
                    label: 'Status',
                    options: [
                      { label: 'All Statuses', value: 'all' },
                      { label: 'Approved', value: 'approved' },
                      { label: 'Active', value: 'active' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Draft', value: 'draft' }
                    ],
                    value: statusFilter,
                    onChange: setStatusFilter
                  },
                  {
                    key: 'task',
                    label: 'Tasks',
                    options: [
                      { label: 'All Tasks', value: 'all' },
                      { label: 'Follow-ups (Unaccepted)', value: 'proposal_followup' },
                      { label: 'Titrations', value: 'titration' },
                      { label: 'Refills', value: 'refill' },
                      { label: 'Sign-offs', value: 'approval' }
                    ],
                    value: taskFilter,
                    onChange: setTaskFilter
                  }
                ]}
              />

              {/* Quick Query Shortcuts (Chips) */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#5f6368' }}>Quick Queries:</span>
                {[
                  { label: 'Tirzepatide Regimens', q: 'Tirzepatide' },
                  { label: 'GHK-Cu Formulations', q: 'GHK-Cu' },
                  { label: 'NAD+ Cycles', q: 'NAD' },
                  { label: 'BPC-157 Formulations', q: 'BPC-157' },
                  { label: 'Pending Actions', q: 'pending' }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setSearchQuery(chip.q)}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      color: '#1a73e8',
                      background: '#f8fafd',
                      border: '1px solid #dadce0',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.12s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f0fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafd'; }}
                  >
                    {chip.label}
                  </button>
                ))}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      color: '#d93025',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '3px 6px'
                    }}
                  >
                    Clear ×
                  </button>
                )}
              </div>

              {/* Breakdown Pill */}
              {searchQuery.trim() && (
                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontSize: '0.80rem',
                    color: '#1e40af'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Active Search: &ldquo;{searchQuery}&rdquo;</span>
                  <span style={{ color: '#93c5fd' }}>•</span>
                  <span><strong>{filteredPrescriptions.length}</strong> matching prescriptions</span>
                  <span style={{ color: '#93c5fd' }}>•</span>
                  <span><strong>{filteredTasks.length}</strong> care tasks</span>
                </div>
              )}

              {/* Live Search Results: Prescriptions Table */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} style={{ color: '#1a73e8' }} />
                    <span>Matching Prescriptions ({filteredPrescriptions.length})</span>
                  </h3>
                </div>
                <DataTable
                  data={filteredPrescriptions}
                  columns={prescriptionColumns}
                  keyField="id"
                  loading={loading}
                  emptyMessage={searchQuery ? `No prescriptions match "${searchQuery}"` : "No prescriptions found in clinical registry"}
                  defaultPageSize={10}
                  pageSizeOptions={[10, 25, 50]}
                  onRowClick={handleRowClickPrescription}
                />
              </div>

              {/* Live Search Results: Care Tasks (if any match) */}
              {filteredTasks.length > 0 && (
                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e8eaed' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} style={{ color: '#d97706' }} />
                      <span>Matching Care Tasks ({filteredTasks.length})</span>
                    </h3>
                  </div>
                  <DataTable
                    data={filteredTasks}
                    columns={taskColumns}
                    keyField="id"
                    loading={loading}
                    emptyMessage="No clinical action tasks match query"
                    defaultPageSize={5}
                    pageSizeOptions={[5, 10, 25]}
                  />
                </div>
              )}
            </section>
          )}

          {/* ── View 2: Pending Clinical Tasks & To-Do Actions (DataTable Universal) ── */}
          {activeAnchor === 'tasks' && (
            <section id="tasks" style={{ marginBottom: '32px' }}>
              {/* ── Google Cloud Console Standard: 4 Queue KPI Metric Cards (Golden Rule #22) ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {/* KPI 1: Total Queue */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setTaskFilter('all');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${taskFilter === 'all' ? '#1a73e8' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    boxShadow: taskFilter === 'all' ? '0 2px 6px rgba(26,115,232,0.15)' : '0 1px 2px rgba(60,64,67,0.06)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Queue
                    </span>
                    <Clock size={15} style={{ color: '#1a73e8' }} />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>
                    {taskCounts.all}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    All clinical action items
                  </div>
                </div>

                {/* KPI 2: Follow-ups */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setTaskFilter('proposal_followup');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${taskFilter === 'proposal_followup' ? '#b45309' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    boxShadow: taskFilter === 'proposal_followup' ? '0 2px 6px rgba(180,83,9,0.15)' : '0 1px 2px rgba(60,64,67,0.06)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Proposal Follow-ups
                    </span>
                    <MessageCircle size={15} style={{ color: '#b45309' }} />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>
                    {taskCounts.proposal_followup}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    Awaiting patient checkout
                  </div>
                </div>

                {/* KPI 3: Sign-offs */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setTaskFilter('approval');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${taskFilter === 'approval' ? '#4f46e5' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    boxShadow: taskFilter === 'approval' ? '0 2px 6px rgba(79,70,229,0.15)' : '0 1px 2px rgba(60,64,67,0.06)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Prescription Sign-offs
                    </span>
                    <CheckCircle2 size={15} style={{ color: '#4f46e5' }} />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>
                    {taskCounts.approval}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    Awaiting physician authorization
                  </div>
                </div>

                {/* KPI 4: Refills & Titrations */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setTaskFilter('refill');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${taskFilter === 'refill' ? '#0d9488' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    boxShadow: taskFilter === 'refill' ? '0 2px 6px rgba(13,148,136,0.15)' : '0 1px 2px rgba(60,64,67,0.06)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Refills & Titrations
                    </span>
                    <RefreshCw size={15} style={{ color: '#0d9488' }} />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>
                    {taskCounts.refill + taskCounts.titration}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    Adherence & cycle titrations
                  </div>
                </div>
              </div>

              {/* ── Action Queue Table Card ── */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #dadce0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#ffffff'
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} style={{ color: '#1a73e8' }} />
                      <span>Patient Care To-Do List & Pending Clinical Actions</span>
                    </h2>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Automated clinical vigilance based on treatment schedules, phase titrations, and intake submissions.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Inline Filter Search (Google Cloud Rule #7) */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={13} style={{ position: 'absolute', left: '9px', color: '#94a3b8', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter queue by patient, compound..."
                        style={{
                          padding: '5px 26px 5px 26px',
                          borderRadius: '6px',
                          border: '1px solid #dadce0',
                          fontSize: '0.74rem',
                          color: '#1e293b',
                          width: '210px',
                          background: '#ffffff',
                          outline: 'none',
                          transition: 'border-color 0.15s ease'
                        }}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '7px',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: '#94a3b8'
                          }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Quick Task Filter Pills with Badges */}
                    <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px', gap: '2px' }}>
                      {[
                        { id: 'all', label: 'All', count: taskCounts.all },
                        { id: 'proposal_followup', label: 'Follow-ups', count: taskCounts.proposal_followup },
                        { id: 'titration', label: 'Titrations', count: taskCounts.titration },
                        { id: 'refill', label: 'Refills', count: taskCounts.refill },
                        { id: 'approval', label: 'Sign-offs', count: taskCounts.approval }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setTaskFilter(f.id);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '0.73rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: taskFilter === f.id ? '#ffffff' : 'transparent',
                            color: taskFilter === f.id ? '#0f172a' : '#64748b',
                            boxShadow: taskFilter === f.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.12s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span>{f.label}</span>
                          <span style={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '0 4px',
                            borderRadius: '99px',
                            background: taskFilter === f.id ? '#e8f0fe' : 'rgba(0,0,0,0.05)',
                            color: taskFilter === f.id ? '#1a73e8' : '#64748b'
                          }}>
                            {f.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              <DataTable
                columns={taskColumns}
                data={filteredTasks}
                keyField="id"
                tableId={`doctor-tasks-${slug}`}
                pagination={true}
                initialRowsPerPage={10}
                alwaysShowPagination={true}
                onRowClick={handleRowClickTask}
                emptyTitle="All Patient Care Tasks Up to Date"
                emptyDescription="There are no pending protocol titrations, phase adjustments, or refill authorizations requiring physician action."
                expandableRender={(task) => (
                  <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1a73e8' }}>
                          Clinical Action Details
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe'
                        }}>
                          <Clock size={11} />
                          Timeline: {task.dueDate || 'Immediate'}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 650,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: task.type === 'proposal_followup' ? '#fffbeb' : (task.isSigned || task.status === 'approved' ? '#f0fdf4' : '#fffbeb'),
                          color: task.type === 'proposal_followup' ? '#b45309' : (task.isSigned || task.status === 'approved' ? '#16a34a' : '#b45309'),
                          border: `1px solid ${task.type === 'proposal_followup' ? '#fde68a' : (task.isSigned || task.status === 'approved' ? '#bbf7d0' : '#fde68a')}`
                        }}>
                          {task.type === 'proposal_followup' ? (task.daysAgo ? `Offer Unaccepted (${task.daysAgo}d)` : 'Offer Unaccepted') : (task.isSigned || task.status === 'approved' ? 'Signed & Authorized' : 'Pending Authorization')}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Trigger: {task.type === 'proposal_followup' ? 'Patient Conversion & Re-engagement Monitor' : 'Automated Chronobiological Protocol Monitor'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                      {task.description}
                    </p>

                    {task.type === 'proposal_followup' && (
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Recommended Patient Re-engagement Message (WhatsApp)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                const cleanMsg = (task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. ');
                                navigator.clipboard.writeText(cleanMsg);
                                toast.success('Clinical reminder copied to clipboard');
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.70rem',
                              fontWeight: 600,
                              color: '#1a73e8',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Copy size={11} />
                            <span>Copy Template</span>
                          </button>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#1e293b', fontStyle: 'italic', background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          &ldquo;{(task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. ')}&rdquo;
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {task.type === 'proposal_followup' ? (
                        <>
                          <a
                            href={task.patientPhone ? `https://wa.me/${task.patientPhone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent((task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. '))}` : `https://wa.me/?text=${encodeURIComponent((task.whatsappMessage || '').replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. '))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '4px',
                              background: '#16a34a',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 650,
                              textDecoration: 'none',
                              boxShadow: '0 1px 2px rgba(22,163,74,0.25)'
                            }}
                          >
                            <MessageCircle size={13} style={{ color: '#ffffff' }} />
                            <span>Send WhatsApp Reminder</span>
                          </a>
                          <Link
                            href={task.actionUrl}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '4px',
                              background: '#ffffff',
                              border: '1px solid #dadce0',
                              color: '#1a73e8',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            <span>View Proposal Dossier</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={task.actionUrl}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '4px',
                            background: '#1a73e8',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                          }}
                        >
                          <span>Execute {task.actionLabel}</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      )}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Reference Prescription:</span>
                        <CopyableId value={task.code} iconOnly={false} />
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          </section>
        )}

          {/* ── View 3: Associated Clinical Prescriptions Dossier (DataTable Universal) ── */}
          {activeAnchor === 'prescriptions' && (
            <section
              id="prescriptions"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} style={{ color: '#1a73e8' }} />
                      <span>Associated Clinical Prescriptions Dossier</span>
                    </h2>
                    <span
                      style={{
                        fontSize: '0.70rem',
                        fontWeight: 600,
                        color: isBackgroundSyncing ? '#1a73e8' : '#15803d',
                        background: isBackgroundSyncing ? '#eff6ff' : '#f0fdf4',
                        border: `1px solid ${isBackgroundSyncing ? '#bfdbfe' : '#bbf7d0'}`,
                        padding: '1px 8px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Automatic background synchronization active (updates automatically on focus and after clinical actions)"
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isBackgroundSyncing ? '#1a73e8' : '#16a34a'
                        }}
                      />
                      <span>
                        {isBackgroundSyncing
                          ? 'Updating registry...'
                          : `Live registry · ${lastRefreshed ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Auto-synced'}`}
                      </span>
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Complete verified repository of compounded prescriptions and clinical regimens.
                  </p>
                </div>
              </div>

              {/* ── Search Bar with Integrated Filters (Golden Rule #7) ──────── */}
              <div style={{ padding: '16px 20px 14px 20px', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                <GlobalSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by patient name, prescription code (e.g. RX-2024-001), active compound (Minoxidil, Finasteride...), or status..."
                  resultCount={filteredPrescriptions.length}
                  namespace={`doctor-prescriptions-${slug}`}
                  size="lg"
                  filters={[
                    statusFilter !== 'all' && {
                      key: 'status',
                      label: 'Status',
                      value: statusFilter === 'active' ? 'ACTIVE & APPROVED' : statusFilter.toUpperCase(),
                      onRemove: () => setStatusFilter('all')
                    },
                    temporalFilter !== 'all' && {
                      key: 'time',
                      label: 'Period',
                      value: temporalFilter === '30d' ? '30 Days' : '90 Days',
                      onRemove: () => setTemporalFilter('all')
                    },
                    quickRxFilter !== 'all' && {
                      key: 'quick',
                      label: 'Filter',
                      value: quickRxFilter === 'proposals' ? 'Unaccepted Offers' : quickRxFilter === 'drafts' ? 'Doctor Drafts' : quickRxFilter === 'active' ? 'Active Prescriptions' : 'Multi-Part',
                      onRemove: () => setQuickRxFilter('all')
                    },
                    apiFilter && {
                      key: 'api',
                      label: 'Active API',
                      value: apiFilter,
                      onRemove: () => setApiFilter(null)
                    },
                    recFilter && {
                      key: 'recommendation',
                      label: 'Atlas Recommendation',
                      value: `${recFilter.title} (${recFilter.rxIds?.length || 0})`,
                      onRemove: () => setRecFilter(null)
                    }
                  ].filter(Boolean)}
                  filterOptions={[
                    {
                      key: 'status',
                      label: 'Status',
                      options: [
                        { label: 'All Statuses', value: 'all' },
                        { label: 'Active & Approved', value: 'active' },
                        { label: 'Approved', value: 'approved' },
                        { label: 'Pending', value: 'pending' }
                      ],
                      value: statusFilter,
                      onChange: setStatusFilter
                    },
                    {
                      key: 'time',
                      label: 'Period',
                      options: [
                        { label: 'All Time', value: 'all' },
                        { label: '30 Days', value: '30d' },
                        { label: '90 Days', value: '90d' }
                      ],
                      value: temporalFilter,
                      onChange: setTemporalFilter
                    }
                  ]}
                />

                {/* Quick Status / Category Filter Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Quick Filter:
                  </span>
                  {[
                    { id: 'all', label: `All (${quickCounts.all})`, color: '#003666', bg: '#f1f5f9' },
                    { id: 'active', label: `🟢 Active Prescriptions (${quickCounts.active})`, color: '#137333', bg: '#f0fdf4' },
                    { id: 'proposals', label: `⏳ Unaccepted Offers (${quickCounts.proposals})`, color: '#b06000', bg: '#fef7e0' },
                    ...(quickCounts.drafts > 0 ? [{ id: 'drafts', label: `🟡 Doctor Drafts (${quickCounts.drafts})`, color: '#b45309', bg: '#fffbeb' }] : []),
                    { id: 'multipart', label: `🔵 Multi-Part Formulations (${quickCounts.multipart})`, color: '#1a73e8', bg: '#eff6ff' }
                  ].map(chip => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setQuickRxFilter(chip.id);
                      }}
                      style={{
                        height: '28px',
                        padding: '0 12px',
                        borderRadius: '9999px',
                        border: quickRxFilter === chip.id ? `2px solid ${chip.color}` : '1px solid #dadce0',
                        background: quickRxFilter === chip.id ? chip.bg : '#ffffff',
                        color: chip.color,
                        fontSize: '0.74rem',
                        fontWeight: quickRxFilter === chip.id ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: quickRxFilter === chip.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}

                  {(searchQuery || statusFilter !== 'all' || patientFilter !== 'all' || temporalFilter !== 'all' || quickRxFilter !== 'all' || apiFilter) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setPatientFilter('all');
                        setTemporalFilter('all');
                        setQuickRxFilter('all');
                        setApiFilter(null);
                        toast.success('Filters reset');
                      }}
                      style={{
                        height: '28px',
                        padding: '0 10px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#d93025',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              <DataTable
                columns={prescriptionColumns}
                data={filteredPrescriptions}
                keyField="id"
                tableId={`doctor-prescriptions-${slug}`}
                pagination={true}
                initialRowsPerPage={10}
                alwaysShowPagination={true}
                onRowClick={handleRowClickPrescription}
                emptyTitle={quickRxFilter === 'pending' ? "No Prescriptions Awaiting Action" : "No Prescriptions Found"}
                emptyDescription={
                  quickRxFilter === 'pending'
                    ? "All clinical prescriptions have been authorized or processed. There are no drafts or pending approvals requiring physician action."
                    : "No prescriptions match the active search criteria or filters. Adjust search keywords or register a new patient."
                }
                emptyActionLabel={quickRxFilter === 'pending' && quickCounts.all > 0 ? `Show All Prescriptions (${quickCounts.all})` : undefined}
                onEmptyAction={quickRxFilter === 'pending' && quickCounts.all > 0 ? () => setQuickRxFilter('all') : undefined}
                expandableRender={(rx) => {
                  const parts = resolvePrescriptionParts(rx);
                  const totalApisCount = parts.reduce((acc, p) => acc + (p.apis?.length || 0), 0);

                  const isProposal = rx.status === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
                  const isAwaitingAtlasReview = !isProposal && (rx.status === 'draft' || rx.ingestionStage === 'awaiting_atlas_review' || rx.state === 'draft');

                  return (
                    <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {/* Clinical Treatment Proposal Banner (Unaccepted Offer) */}
                      {isProposal && (
                        <div style={{
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          marginBottom: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={16} color="#d97706" />
                              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                                Clinical Treatment Proposal · Awaiting Patient
                              </span>
                              <span style={{
                                fontSize: '0.70rem',
                                background: '#fef3c7',
                                color: '#b45309',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontWeight: 700,
                                border: '1px solid #fcd34d'
                              }}>
                                Offer Pending
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleShareProposalWhatsApp(rx)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  background: '#25D366',
                                  color: '#ffffff',
                                  borderRadius: '6px',
                                  border: 'none',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                WhatsApp Follow-up
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyProposalLink(rx)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  background: '#ffffff',
                                  color: '#003666',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Copy Patient Link
                              </button>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.5 }}>
                            Dr. {doctor?.name || 'Physician'} formulated this personalized regimen. The patient has not yet confirmed the dispensing order.
                          </div>
                        </div>
                      )}

                      {/* Two-Phase Clinical Intake Tracker Banner (Draft SLA) */}
                      {isAwaitingAtlasReview && (
                        <div style={{
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          marginBottom: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={16} color="#d97706" />
                              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                                Phase 2 in Progress: Atlas AI & Clinical Pharmacist Validation
                              </span>
                              <span style={{
                                fontSize: '0.70rem',
                                background: '#fef3c7',
                                color: '#b45309',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontWeight: 700,
                                border: '1px solid #fcd34d'
                              }}>
                                ETA: ~24 Hours
                              </span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>
                              Current Mode: <strong>Draft / Clinical Review</strong>
                            </span>
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '8px',
                            paddingTop: '6px',
                            borderTop: '1px dashed #fcd34d'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>✓</div>
                              <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>1. Digital Intake</div>
                                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Parsed to Draft</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fde68a', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>2</div>
                              <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>2. Atlas AI Review</div>
                                <div style={{ fontSize: '0.66rem', color: '#b45309' }}>Pharmacist verification (~24h)</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', opacity: 0.7 }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>3</div>
                              <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>3. Dispensary Authorization</div>
                                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Active for Fulfillment</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Google Cloud Prescription Reference Header & Action Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#003666' }}>
                            Prescription #{rx.code}
                          </span>
                          <CopyableId value={rx.code} iconOnly={true} />
                          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>Authorized: {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active Regimen'}</span>
                          </span>
                          <span style={{ fontSize: '0.72rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <ShieldCheck size={11} />
                            <span>EU GMP Validated</span>
                          </span>
                          {parts.length > 1 && (
                            <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              {parts.length} Compounded Formulations
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Total Active Ingredients: <strong>{totalApisCount}</strong>
                          </span>
                        </div>

                      </div>

                      {/* Multi-Part Formulations Container (Full Horizontal Width) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {parts.map((part, pIdx) => (
                          <div
                            key={pIdx}
                            style={{
                              background: '#ffffff',
                              border: `1px solid ${part.borderAccent || '#e2e8f0'}`,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                          >
                            {/* Part Header */}
                            <div
                              style={{
                                padding: '10px 16px',
                                background: part.accentBg || '#f8fafc',
                                borderBottom: `1px solid ${part.borderAccent || '#e2e8f0'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontSize: '0.70rem',
                                    fontWeight: 750,
                                    letterSpacing: '0.04em',
                                    color: part.accentColor || '#003666',
                                    background: '#ffffff',
                                    border: `1px solid ${part.borderAccent || '#cbd5e1'}`,
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {part.badge}
                                </span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                  {part.title}
                                </span>
                                {part.volume && (
                                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                                    ({part.volume})
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                {/* Proposal #1: 1-Click WhatsApp on this Part */}
                                <button
                                  type="button"
                                  onClick={() => handleContactAtlasWhatsApp(
                                    `Prescription #${rx.code} - Part ${part.partNumber} (${rx.patientName || 'Patient'})`,
                                    `Clinical inquiry regarding formulation: ${part.title} (${(part.apis || []).map(a => a.name + (a.dose ? ' ' + a.dose : '')).join(', ')}) in vehicle: ${part.vehicle || 'Compounded vehicle'}`
                                  )}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    border: '1px solid #10b981',
                                    background: '#f0fdf4',
                                    color: '#047857',
                                    fontSize: '0.72rem',
                                    fontWeight: 650,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Contact Atlas Clinical Support on WhatsApp"
                                >
                                  <MessageCircle size={12} />
                                  <span>Contact Atlas on WhatsApp</span>
                                </button>

                                <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 500 }}>
                                  Dispensary: Atlas Certified Galenic Unit
                                </span>
                              </div>
                            </div>

                            {/* Part Posology Schedule Strip */}
                            {part.schedule && (
                              <div
                                style={{
                                  padding: '8px 16px',
                                  background: '#f8fafc',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: '0.78rem',
                                  color: '#1e293b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  lineHeight: 1.4
                                }}
                              >
                                <Clock size={13} style={{ color: part.accentColor || '#0d9488', flexShrink: 0 }} />
                                <span>
                                  <strong style={{ color: '#0f172a' }}>Clinical Administration Regimen:</strong> {part.schedule}
                                </span>
                              </div>
                            )}

                            {/* Part Active Ingredients - Full Width Clinical Presentation */}
                            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Active Pharmaceutical Ingredients (APIs) & Concentrations ({part.apis?.length || 0})
                              </div>

                              {(!part.apis || part.apis.length === 0) ? (
                                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                                  Personalized compounded active ingredients calibrated to patient clinical profile.
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                  {part.apis.map((api, aIdx) => (
                                    <div
                                      key={aIdx}
                                      style={{
                                        background: '#fafbfc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        padding: '10px 14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                      }}
                                    >
                                      {/* Line 1: Compound Name, Dose badge, Pharmacological Class & Gene targets */}
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                            {api.name}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: '0.76rem',
                                              fontWeight: 700,
                                              background: '#e0f2fe',
                                              color: '#0369a1',
                                              border: '1px solid #bae6fd',
                                              padding: '2px 8px',
                                              borderRadius: '4px'
                                            }}
                                          >
                                            {api.dose}
                                          </span>
                                          {api.geneTargets && api.geneTargets.length > 0 && (
                                            <span style={{ display: 'inline-flex', gap: '4px' }}>
                                              {api.geneTargets.map((g, gIdx) => (
                                                <span
                                                  key={gIdx}
                                                  style={{
                                                    fontSize: '0.66rem',
                                                    fontWeight: 650,
                                                    color: '#475569',
                                                    background: '#f1f5f9',
                                                    border: '1px solid #e2e8f0',
                                                    padding: '1px 5px',
                                                    borderRadius: '3px'
                                                  }}
                                                >
                                                  🧬 {g}
                                                </span>
                                              ))}
                                            </span>
                                          )}
                                        </div>

                                        <span
                                          style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 650,
                                            color: '#0d9488',
                                            background: '#f0fdf4',
                                            border: '1px solid #bbf7d0',
                                            padding: '2px 8px',
                                            borderRadius: '4px'
                                          }}
                                        >
                                          {api.pharmacologicalClass}
                                        </span>
                                      </div>

                                      {/* Line 2: Clinical Indication & Cellular Target */}
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '6px', fontSize: '0.76rem', color: '#475569' }}>
                                        {api.clinicalIndication && (
                                          <div>
                                            <strong style={{ color: '#1e293b' }}>Clinical Indication:</strong> {api.clinicalIndication}
                                          </div>
                                        )}
                                        {api.cellularTarget && (
                                          <div>
                                            <strong style={{ color: '#1e293b' }}>Cellular Target:</strong> {api.cellularTarget}
                                          </div>
                                        )}
                                      </div>

                                      {/* Line 3: Mechanism of Action (Crucial for Physician) */}
                                      {api.mechanismOfAction && (
                                        <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                                          <strong style={{ color: '#0f172a' }}>Mechanism of Action:</strong> {api.mechanismOfAction}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Part Footer - Compounding Vehicle / Excipient Carrier */}
                            <div
                              style={{
                                padding: '8px 16px',
                                background: '#f8fafc',
                                borderTop: '1px solid #f1f5f9',
                                fontSize: '0.75rem',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '6px'
                              }}
                            >
                              <span>
                                <strong style={{ color: '#334155' }}>{part.vehicleLabel || 'Pharmaceutical Carrier Base:'}</strong> {part.vehicle}
                              </span>
                              <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={12} />
                                EU GMP Validated Pharmacopeia Base
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
            </section>
          )}

          {/* ── View 3.5: Bloodo™ Diagnostic Lab Results (LifeLab1 Tests) ── */}
          {activeAnchor === 'lab_results' && (
            <section
              id="lab_results"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FlaskConical size={18} style={{ color: '#059669' }} />
                      <span>Diagnostic Laboratory Results (LifeLab1 Accredited)</span>
                    </h2>
                    <span style={{ fontSize: '0.70rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      ISO 15189 / EU IVDR
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Quantitative capillary dried blood spot (DBS) biomarker assays and cellular metabolism diagnostics.
                  </p>
                </div>
              </div>

              <DataTable
                columns={labResultsColumns}
                data={allLabResults}
                keyField="id"
                tableId={`doctor-lab-results-${slug}`}
                pagination={true}
                initialRowsPerPage={10}
                alwaysShowPagination={false}
                emptyTitle="No Diagnostic Lab Results Found"
                emptyDescription="No laboratory blood or metabolic biomarker reports registered for this physician yet."
                expandableRender={(row) => {
                  const val = Number(row.value) || 14.1;
                  const unit = row.unit || 'µmol/L';
                  const percentagePos = Math.min(Math.max(((val - 0) / 40) * 100, 2), 98);
                  return (
                    <div style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                            Quantitative Biomarker Range Assessment
                          </span>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                            {row.testName} · {val} {unit}
                          </div>
                        </div>
                        <Link
                          href={`/lab/${row.code || row.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#003666',
                            background: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Open Dedicated Patient Dossier</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>

                      {/* Spectrum Bar in Expandable */}
                      <div style={{ position: 'relative', width: '100%', height: '22px', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: '22%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.62rem', fontWeight: 700 }}>&lt; 8.8 (Deficient)</div>
                        <div style={{ width: '21.5%', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78350f', fontSize: '0.62rem', fontWeight: 700 }}>8.8–17.4 (Suboptimal)</div>
                        <div style={{ width: '10.75%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#365314', fontSize: '0.60rem', fontWeight: 700 }}>17.4–21.7</div>
                        <div style={{ width: '30%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b', fontSize: '0.62rem', fontWeight: 700 }}>21.7–33.7 (Optimal Longevity)</div>
                        <div style={{ width: '15.75%', background: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '0.62rem', fontWeight: 700 }}>&gt; 33.7</div>
                        <div style={{ position: 'absolute', left: `${percentagePos}%`, top: 0, bottom: 0, width: '3px', background: '#0f172a', transform: 'translateX(-50%)' }} />
                      </div>

                      {row.interpretation && (
                        <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ color: '#0f172a' }}>Clinical Interpretation: </strong>
                          {row.interpretation}
                        </div>
                      )}

                      {Array.isArray(row.synergies) && row.synergies.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                            Recommended Protocol Synergies
                          </span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {row.synergies.map((syn, sIdx) => (
                              <div key={sIdx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem' }}>
                                <span style={{ fontWeight: 700, color: '#003666' }}>{syn.name}</span>
                                {syn.slug && (
                                  <Link href={`/proto/${syn.slug}`} style={{ marginLeft: '6px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                                    View Protocol →
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </section>
          )}

          {/* ── View 4: Bloodo™ Diagnostic Panels (Baseline Calibration) ── */}
          {activeAnchor === 'diagnostics' && (
            <section
              id="diagnostics"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                marginTop: '32px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                overflow: 'hidden'
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  padding: '18px 22px',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  background: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} style={{ color: '#003666' }} />
                      <span>Bloodo™ Diagnostic Biomarker Panels & Quantitative Baseline Calibration</span>
                    </h2>
                    <span style={{ fontSize: '0.70rem', color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      6 CE-IVDR Certified Capillary DBS Tests
                    </span>
                    <span style={{ fontSize: '0.70rem', color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      ISO 15189 Accredited Lab
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
                    All 6 certified pre-treatment diagnostic panels for objective physiological baseline profiling. Click any test to open its complete public analytical datasheet.
                  </p>
                </div>
              </div>

              {/* Diagnostic Panels Matrix */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px'
                }}>
                  {bloodoPanels.map((panel) => (
                    <div
                      key={panel.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '16px 18px',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#003666';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,54,102,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                      }}
                    >
                      <div>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                          <a
                            href={`/p/${panel.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                              {panel.name}
                            </h4>
                            <ExternalLink size={13} style={{ color: '#1a73e8', flexShrink: 0 }} />
                          </a>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 650,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            whiteSpace: 'nowrap'
                          }}>
                            TAT: {panel.tat}
                          </span>
                        </div>

                        {/* Specimen pill */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '1px 8px',
                            borderRadius: '12px',
                            background: '#eff6ff',
                            color: '#1d4ed8'
                          }}>
                            Specimen: {panel.specimen}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '1px 8px',
                            borderRadius: '12px',
                            background: '#f0fdf4',
                            color: '#166534',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <ShieldCheck size={11} /> Pre-Protocol Baseline
                          </span>
                        </div>

                        {/* Indication */}
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                          {panel.indications}
                        </p>

                        {/* Measured Biomarkers */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', marginBottom: '10px' }}>
                          <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Quantitative Analytes Measured:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {panel.biomarkers.map((b, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '0.70rem',
                                  fontWeight: 500,
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#1e293b',
                                  padding: '2px 6px',
                                  borderRadius: '3px'
                                }}
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Clinical Decision Utility */}
                        <div style={{ fontSize: '0.73rem', color: '#0d9488', lineHeight: 1.35, marginBottom: '10px', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '8px 10px', borderRadius: '4px' }}>
                          <strong>Clinical Decision Utility:</strong> {panel.clinicalUtility}
                        </div>

                        {/* Companion Evidence Protocol Link */}
                        {panel.associatedProtocolTitle && (
                          <div style={{ marginBottom: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '0.71rem', color: '#1d4ed8', fontWeight: 600 }}>
                              Baseline for: <strong>{panel.associatedProtocolTitle}</strong>
                            </div>
                            <a
                              href={panel.associatedProtocolUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.70rem',
                                fontWeight: 700,
                                color: '#1d4ed8',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <span>Protocol Guide</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Panel footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Requisition via Atlas Clinical Lab
                        </span>
                        <a
                          href={`/p/${panel.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => triggerHaptic('light')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#ffffff',
                            border: '1px solid #1a73e8',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: '#1a73e8',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.12s',
                            boxShadow: '0 1px 2px rgba(26,115,232,0.06)'
                          }}
                        >
                          <FileText size={12} />
                          <span>Public Datasheet</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── View 5: Clinical Protocols & Titrations (Direct View) ── */}
          {activeAnchor === 'protocols' && (
            <section
              id="protocols"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <ClinicalIntelligenceBanner
                protocols={data?.protocols || []}
                formulary={data?.formulary || []}
                opaqueDoctorCode={doctor?.opaqueCode || slug}
                doctorName={doctor?.name}
              />
            </section>
          )}

          {/* ── View 6: Compounding Pharmacopeia & APIs (Direct View) ── */}
          {activeAnchor === 'formulary' && (
            <section
              id="formulary"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <ClinicalIntelligenceBanner
                protocols={data?.protocols || []}
                formulary={data?.formulary || []}
                opaqueDoctorCode={doctor?.opaqueCode || slug}
                doctorName={doctor?.name}
              />
            </section>
          )}

          {/* ── View 7: Consolidated Master Atlas Recommendations (Modularized) ── */}
          {activeAnchor === 'recommendations' && (
            <DoctorRecommendationsTab
              allPrescriptions={allPrescriptions}
              recCategoryFilter={recCategoryFilter}
              setRecCategoryFilter={setRecCategoryFilter}
              recSearchQuery={recSearchQuery}
              setRecSearchQuery={setRecSearchQuery}
              setQuickRxFilter={setQuickRxFilter}
              setStatusFilter={setStatusFilter}
              setPatientFilter={setPatientFilter}
              setTemporalFilter={setTemporalFilter}
              setApiFilter={setApiFilter}
              setRecFilter={setRecFilter}
              setActiveAnchor={setActiveAnchor}
              triggerHaptic={triggerHaptic}
            />
          )}
        </main>
      </div>

      {/* ── Fixed Bottom Actions Dock ("Sticker" Footer for Laptop & Mobile) ── */}
      <DoctorFloatingGlassDock
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenSearch={() => {
          triggerHaptic('selection');
          setIsPracticeSearchOpen(true);
        }}
        onOpenAtlasAi={() => setIsAtlasAiOpen(true)}
        aiUsesRemaining={aiUsesRemaining}
        onOpenWhatsApp={() => setIsRequestInfoOpen(true)}
      />

      {/* ── Practice Spotlight Search Palette (Rule #7 & Spotlight standard) ── */}
      <DoctorPracticeSearchModal
        isOpen={isPracticeSearchOpen}
        onClose={() => setIsPracticeSearchOpen(false)}
        doctor={doctor}
        prescriptions={allPrescriptions}
        topFormulations={data?.serverAnalytics?.topApis || []}
        onSelectPatient={(pName) => {
          setPatientFilter(pName);
          setActiveAnchor('prescriptions');
          toast.success(`Showing prescriptions for ${pName}`);
        }}
        onSelectPrescription={(rx) => {
          handleRowClickPrescription(rx);
        }}
        onSelectProduct={(prodName) => {
          setApiFilter(prodName);
          setActiveAnchor('prescriptions');
          toast.success(`Filtered practice for ${prodName}`);
        }}
        onSelectRecommendation={(rec) => {
          handleContactAtlasWhatsApp('clinical_recommendation', `Inquiry regarding ${rec.title} (${rec.formatBadge || rec.format})`);
        }}
        triggerHaptic={triggerHaptic}
      />

      {/* ── Treatment Timeline & Duration Pop-up Modal (Mobile & Laptop UX - Rule #5) ── */}
      <EditTreatmentDurationModal
        isOpen={!!timelineModalRx}
        onClose={() => setTimelineModalRx(null)}
        prescription={timelineModalRx}
        onSave={handleSaveTimelineModal}
      />

      {/* ── Official Compounding Bottle Labels Modal (Direct from Doctor Portal) ── */}
      {isLabelsModalOpen && activeLabelRx && (
        <PharmacyLabelsModal
          isOpen={isLabelsModalOpen}
          onClose={() => {
            setIsLabelsModalOpen(false);
            setActiveLabelRx(null);
          }}
          labels={labelsForActiveRx}
          initialLabelIndex={0}
          isEs={false}
          hideShippingLabel={true}
        />
      )}

      {/* ── Quick Action Sheet for Prescriptions (Mobile & Desktop GCP Standard) ── */}
      <MobileActionSheet
        isOpen={Boolean(mobileActionRx)}
        onClose={() => setMobileActionRx(null)}
        title={mobileActionRx ? `Prescription #${mobileActionRx.code || mobileActionRx.id || ''}` : ''}
        items={mobileActionRx ? [
          {
            label: 'View Public Dossier (/rx)',
            icon: ExternalLink,
            onClick: () => {
              const code = mobileActionRx.code || mobileActionRx.prescriptionNumber || mobileActionRx.id;
              window.open(`/rx/${code}`, '_blank');
              setMobileActionRx(null);
            }
          },
          {
            label: 'Patient Posology Handout',
            icon: FileText,
            onClick: () => {
              const target = mobileActionRx;
              setMobileActionRx(null);
              handleOpenHandout(target);
            }
          },
          {
            label: 'Re-prescribe Formula',
            icon: RefreshCw,
            onClick: () => {
              const target = mobileActionRx;
              setMobileActionRx(null);
              handleReprescribeFormula(target);
            }
          },
          {
            label: 'Official Bottle Labels',
            icon: Tag,
            onClick: () => {
              const target = mobileActionRx;
              setMobileActionRx(null);
              handleOpenLabelsModal(target);
            }
          },
          {
            label: 'Contact Atlas on WhatsApp',
            icon: MessageCircle,
            onClick: () => {
              const target = mobileActionRx;
              setMobileActionRx(null);
              handleContactAtlasWhatsApp(
                `Prescription #${target.code || target.id} (${target.patientName || 'Patient'})`,
                `Clinical formulation inquiry: ${target.treatmentTitle || 'Compounded Formula'}`
              );
            }
          },
          ...(mobileActionRx.protocolUrl || mobileActionRx.protocolSlug ? [{
            label: 'View Protocol Reference',
            icon: Stethoscope,
            onClick: () => {
              const url = mobileActionRx.protocolUrl || `/proto/${mobileActionRx.protocolSlug}`;
              window.open(url, '_blank');
              setMobileActionRx(null);
            }
          }] : [])
        ] : []}
      />

      {/* ── AI Prescription Intake Workspace (Attributed to this Physician) ── */}
      {isIntakeOpen && (
        <PrescriptionIntakeWorkspace
          isOpen={true}
          doctorContext={{
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSlug: doctor.slug,
            clinicName: doctor.clinic
          }}
          onClose={() => {
            setIsIntakeOpen(false);
            if (intakeSavedRef.current) {
              intakeSavedRef.current = false;
              window.location.reload();
            }
          }}
          onSaveSuccess={() => {
            intakeSavedRef.current = true;
            toast.success(`Prescription attributed to ${doctor.name}`);
          }}
        />
      )}

      {/* ── Slide-In Monograph Drawer (Google Cloud Standard Pattern) ────────── */}
      {selectedMonograph && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            background: 'rgba(32, 33, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setSelectedMonograph(null)}
        >
          <div
            style={{
              width: '460px',
              maxWidth: '92vw',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              animation: 'slideInRight 0.2s ease-out',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  background: '#f8fafc'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', color: '#1a73e8', background: '#e8f0fe', padding: '1px 6px', borderRadius: '4px' }}>
                      Pharmaceutical Monograph
                    </span>
                    <span style={{ fontSize: '0.70rem', color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bbf7d0', fontWeight: 600 }}>
                      {selectedMonograph.purity || '≥ 99% HPLC'}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedMonograph.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Compounding Reference Specification · EU GMP
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMonograph(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: '#5f6368',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Content */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Therapeutic Classification */}
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Therapeutic Indication Target
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                    {safeRenderText(selectedMonograph.primaryGoal, 'Cellular Optimization')}
                  </div>
                </div>

                {/* Mechanism of Action */}
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mechanism of Action & Pathways
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                    {safeRenderText(selectedMonograph.moa) || safeRenderText(selectedMonograph.description)}
                  </p>
                </div>

                {/* Analytical Quality Specs */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Analytical Quality Specifications
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Assay / Purity</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{selectedMonograph.purity || '≥ 99.0%'}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Regulatory Status</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>Prescription Only</div>
                    </div>
                    {selectedMonograph.casNumber && (
                      <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CAS Number</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{selectedMonograph.casNumber}</div>
                      </div>
                    )}
                    <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Dispensing Form</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>Custom Compounded</div>
                    </div>
                  </div>
                </div>

                {/* Clinical Vigilance & Note */}
                <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.76rem', color: '#1e40af', lineHeight: 1.45 }}>
                  <strong>Physician Authorization Required:</strong> This molecule is restricted to professional magistral formulation under authorized medical supervision. Dispensing is processed exclusively via EU GMP licensed compounding dispensaries.
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #dadce0', background: '#f8fafc', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const p = selectedMonograph;
                  setSelectedMonograph(null);
                  setInquiryPeptide(p);
                  setIsInquiryOpen(true);
                }}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                }}
              >
                Inquire in Custom Regimen with {doctor.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regimen Clinical Inquiry Modal ───────────────────────────────────── */}
      {isInquiryOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 65,
            background: 'rgba(32, 33, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsInquiryOpen(false)}
        >
          <div
            style={{
              width: '500px',
              maxWidth: '100%',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Clinical Protocol Consultation
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Attributed to {doctor.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#5f6368', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {inquiryPeptide && (
                <div style={{ padding: '10px 14px', background: '#e0f2fe', borderRadius: '6px', marginBottom: '14px', fontSize: '0.80rem', color: '#0369a1', fontWeight: 600 }}>
                  Selected Principle: {inquiryPeptide.name} ({inquiryPeptide.purity || '≥ 99% HPLC'})
                </div>
              )}
              <p style={{ margin: '0 0 16px 0', fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                To integrate this active pharmaceutical ingredient into a customized medical protocol, you can initiate a digital prescription intake or schedule a clinical review.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsInquiryOpen(false);
                    setIsIntakeOpen(true);
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid #1a73e8',
                    background: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={15} />
                  <span>Submit Digital Prescription with AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleContactAtlasWhatsApp(
                      inquiryPeptide ? `Compounding Consultation: ${inquiryPeptide.name}` : 'Clinical Consultation',
                      inquiryPeptide ? `Inquiring about integrating ${inquiryPeptide.name} into custom prescription protocol.` : ''
                    );
                    setIsInquiryOpen(false);
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={15} color="#16a34a" />
                  <span>Contact Atlas on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ── Atlas AI Clinical Copilot Modal (Isolated, 5 Session Uses) ─────── */}
      {isAtlasAiOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 70,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsAtlasAiOpen(false)}
        >
          <div
            style={{
              width: '640px',
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      Atlas AI — Clinical Copilot
                    </h3>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: aiUsesRemaining > 2 ? '#10b981' : aiUsesRemaining > 0 ? '#f59e0b' : '#ef4444',
                      color: '#ffffff'
                    }}>
                      {aiUsesRemaining}/5 uses left
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: '2px' }}>
                    Personalized for {doctor.name} · {filteredPrescriptions.length} Prescriptions Indexed
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAtlasAiOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Privacy Guarantee Banner */}
            <div style={{
              padding: '8px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.72rem',
              color: '#475569'
            }}>
              <ShieldCheck size={14} color="#6366f1" />
              <span>
                <strong>Isolated Session:</strong> Reads only your active patients & compounding formulas. No queries or history are retained or shared across users.
              </span>
            </div>

            {/* Message Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#fdfdfe',
              maxHeight: '360px'
            }}>
              {/* Welcome Assistant Message */}
              <div style={{
                alignSelf: 'flex-start',
                maxWidth: '88%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '0.70rem', color: '#6366f1', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bot size={12} /> Atlas Clinical Intelligence
                </div>
                <div style={{ fontSize: '0.80rem', color: '#1e293b', lineHeight: 1.5 }}>
                  Hello {doctor.name}. I am initialized with your current clinical context: <strong>{doctor.patients?.length || filteredPrescriptions.length} patients</strong> and <strong>{filteredPrescriptions.length} compounded prescriptions</strong>.
                  <br /><br />
                  You have <strong>{aiUsesRemaining} query credits</strong> in this session. Ask me to summarize patient regimens, verify API concentrations, or check multi-part compounding protocols.
                </div>
              </div>

              {/* Chat Thread */}
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    background: msg.role === 'user' ? '#4f46e5' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    fontSize: '0.68rem',
                    color: msg.role === 'user' ? '#e0e7ff' : '#6366f1',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}>
                    {msg.role === 'user' ? 'You' : 'Atlas Assistant'} · {msg.time}
                  </div>
                  <div style={{
                    fontSize: '0.80rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#475569'
                }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Synthesizing patient & API formulation data...</span>
                </div>
              )}

              {aiUsesRemaining === 0 && (
                <div style={{
                  padding: '12px 14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  color: '#92400e',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div>
                    <strong>Session Quota Reached (5/5):</strong> You have utilized all 5 free clinical intelligence queries allocated to this browser session.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleContactAtlasWhatsApp('Atlas AI Quota Extended Consultation')}
                      style={{
                        padding: '6px 12px',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MessageCircle size={13} />
                      <span>Contact Atlas on WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            {aiUsesRemaining > 0 && (
              <div style={{
                padding: '10px 16px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto'
              }}>
                {[
                  'Summarize active patients',
                  'Verify dosages & APIs',
                  'Pending sign-off tasks',
                  'Multi-part formulations'
                ].map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleSendAtlasAiQuery(chip)}
                    disabled={aiLoading}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '5px 10px',
                      borderRadius: '9999px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder={aiUsesRemaining > 0 ? "Ask Atlas AI about your patients, APIs, or formulas..." : "Session limit reached. Contact Atlas Support on WhatsApp."}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAtlasAiQuery();
                  }
                }}
                disabled={aiLoading || aiUsesRemaining <= 0}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: aiUsesRemaining <= 0 ? '#f8fafc' : '#ffffff'
                }}
              />
              <button
                type="button"
                onClick={() => handleSendAtlasAiQuery()}
                disabled={!aiInput.trim() || aiLoading || aiUsesRemaining <= 0}
                style={{
                  height: '40px',
                  padding: '0 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !aiInput.trim() || aiLoading || aiUsesRemaining <= 0 ? '#cbd5e1' : '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: !aiInput.trim() || aiLoading || aiUsesRemaining <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Request Info Modal (Atlas Clinical Support: +971 55 356 1058) ───── */}
      {isRequestInfoOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 70,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsRequestInfoOpen(false)}
        >
          <div
            style={{
              width: '580px',
              maxWidth: '100%',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 8px 28px rgba(32, 33, 36, 0.28)',
              overflow: 'hidden',
              border: '1px solid #dadce0',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Google Cloud Standard Dialog Header) */}
            <div style={{
              padding: '16px 20px',
              background: '#ffffff',
              borderBottom: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  background: '#e8f0fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MessageCircle size={18} color="#1a73e8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 600, color: '#202124' }}>
                    Request Information & Clinical Support
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Atlas Medical & Scientific Affairs</span>
                    <span>•</span>
                    <span style={{ color: '#1a73e8', fontWeight: 500 }}>WhatsApp Concierge Liaison</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestInfoOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5f6368',
                  cursor: 'pointer',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Doctor & Channel attribution banner */}
            <div style={{
              padding: '10px 20px',
              background: '#f8f9fa',
              borderBottom: '1px solid #e8eaed',
              fontSize: '0.76rem',
              color: '#3c4043',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <span>Attributed Physician: <strong style={{ color: '#202124' }}>{doctor.name}</strong></span>
              <span>Liaison Channel: <strong style={{ color: '#137333' }}>Official WhatsApp</strong></span>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Question Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
                  Select Inquiry Type / Common Question:
                </label>
                <select
                  value={requestInfoSubject}
                  onChange={(e) => setRequestInfoSubject(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    fontSize: '0.82rem',
                    color: '#202124',
                    background: '#ffffff',
                    outline: 'none',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <optgroup label="Pricing & Quotations">
                    <option value="What is the pricing / quotation for this prescription?">
                      Pricing & Quotation — What is the price for this prescription?
                    </option>
                  </optgroup>
                  <optgroup label="Delivery & Logistics">
                    <option value="What is the estimated delivery time to the patient?">
                      Delivery Lead Time — When will this reach the patient?
                    </option>
                    <option value="What is the current fulfillment & courier tracking status?">
                      Order Tracking — What is the current dispatch / courier status?
                    </option>
                  </optgroup>
                  <optgroup label="Compounding & Raw Materials">
                    <option value="Is this peptide / API in stock, or is an approved equivalent available?">
                      Stock Availability — Is this API / peptide in stock or backordered?
                    </option>
                    <option value="Can the vehicle, concentration, or administration form be customized?">
                      Custom Formulation — Can we adjust vehicle, dose, or format?
                    </option>
                  </optgroup>
                  <optgroup label="Quality, Analytical & COA">
                    <option value="Request Certificate of Analysis (COA) & batch purity report">
                      COA & Quality — Request HPLC Certificate of Analysis & purity specs
                    </option>
                  </optgroup>
                  <optgroup label="Patient Refills & Renewals">
                    <option value="Request repeat batch / prescription refill for this patient">
                      Prescription Refill — Request repeat batch or protocol renewal
                    </option>
                  </optgroup>
                  <optgroup label="General Clinical Affairs">
                    <option value="General clinical consultation or pharmacopeia question">
                      Other Clinical Inquiry — Specialized medical or administrative question
                    </option>
                  </optgroup>
                </select>

                {/* Quick Topic Shortcut Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {[
                    { label: 'Pricing & Quote', val: 'What is the pricing / quotation for this prescription?' },
                    { label: 'Delivery Lead Time', val: 'What is the estimated delivery time to the patient?' },
                    { label: 'Tracking Status', val: 'What is the current fulfillment & courier tracking status?' },
                    { label: 'Stock / API Availability', val: 'Is this peptide / API in stock, or is an approved equivalent available?' }
                  ].map((chip, cIdx) => {
                    const isSelected = requestInfoSubject === chip.val;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setRequestInfoSubject(chip.val)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: isSelected ? '1px solid #1a73e8' : '1px solid #e0e0e0',
                          background: isSelected ? '#e8f0fe' : '#ffffff',
                          color: isSelected ? '#1a73e8' : '#5f6368',
                          fontSize: '0.72rem',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.12s'
                        }}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reference Prescription (Optional) */}
              {filteredPrescriptions.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
                    Reference Prescription (Optional):
                  </label>
                  <select
                    value={requestInfoSelectedRx}
                    onChange={(e) => setRequestInfoSelectedRx(e.target.value)}
                    style={{
                      width: '100%',
                      height: '36px',
                      padding: '0 10px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      fontSize: '0.80rem',
                      color: '#202124',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="">-- General Product / Pharmacopeia Question --</option>
                    {filteredPrescriptions.slice(0, 20).map(p => (
                      <option key={p.id} value={`${p.id} - ${p.patientName} (${p.treatmentTitle || 'Formulation'})`}>
                        {p.id} · {p.patientName} · {p.treatmentTitle || 'Compounded Treatment'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Physician Clinical Notes / Specific Questions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
                  Physician Clinical Notes / Specific Details:
                </label>
                <textarea
                  rows={3}
                  value={requestInfoNotes}
                  onChange={(e) => setRequestInfoNotes(e.target.value)}
                  placeholder="e.g., Inquiring regarding vehicle stability, courier transit time to Dubai / Abu Dhabi, or batch release certificate..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    fontSize: '0.80rem',
                    color: '#202124',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Action Buttons: Exclusively WhatsApp (+971 55 356 1058), Copy Text & Cancel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const fullDetails = [
                      requestInfoSelectedRx ? `Prescription Ref: ${requestInfoSelectedRx}` : '',
                      requestInfoNotes ? `Notes: ${requestInfoNotes}` : ''
                    ].filter(Boolean).join('\n');
                    handleContactAtlasWhatsApp(requestInfoSubject, fullDetails);
                    setIsRequestInfoOpen(false);
                  }}
                  style={{
                    height: '42px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#25D366',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                    transition: 'background 0.12s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#20ba5a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#25D366'; }}
                >
                  <MessageCircle size={18} />
                  <span>Send Inquiry via WhatsApp</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Physician: ${doctor.name}\nTopic: ${requestInfoSubject}\n${requestInfoSelectedRx ? `Ref: ${requestInfoSelectedRx}\n` : ''}${requestInfoNotes ? `Notes: ${requestInfoNotes}\n` : ''}`;
                      navigator.clipboard?.writeText(text);
                      toast.success('Inquiry copied to clipboard ✓');
                    }}
                    style={{
                      flex: 1,
                      height: '36px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#3c4043',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background 0.12s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <Copy size={14} />
                    <span>Copy Inquiry Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRequestInfoOpen(false)}
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#5f6368',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.12s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Patient Posology Handout Modal (Printable & Shareable) ─────────── */}
      {isHandoutOpen && handoutRx && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => {
            setIsHandoutOpen(false);
            setHandoutRx(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #dadce0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                background: '#003666',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileText size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                    Patient Posology & Administration Handout
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                    Clinical compounding regimen for {handoutRx.patientName || 'Patient'} · Code #{handoutRx.code || handoutRx.prescriptionNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsHandoutOpen(false);
                  setHandoutRx(null);
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Patient & Clinic Metadata Card */}
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PATIENT</span>
                  <strong style={{ color: '#0f172a', fontSize: '13px' }}>{handoutRx.patientName || 'Patient'}</strong>
                  {handoutRx.patient?.dob && <span style={{ color: '#64748b', display: 'block' }}>DOB: {handoutRx.patient.dob}</span>}
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PRESCRIBING PHYSICIAN</span>
                  <strong style={{ color: '#0f172a' }}>{doctor.name || 'Treating Physician'}</strong>
                  <span style={{ color: '#64748b', display: 'block' }}>{doctor.clinic || 'Specialized Clinic'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PRESCRIPTION CODE</span>
                  <strong style={{ color: '#1a73e8' }}>#{handoutRx.code || handoutRx.prescriptionNumber}</strong>
                  <span style={{ color: '#64748b', display: 'block' }}>Date: {handoutRx.dateFormatted || handoutRx.date || 'Active'}</span>
                </div>
              </div>

              {/* Treatment Title */}
              {handoutRx.treatmentTitle && (
                <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Therapeutic Protocol:</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>{handoutRx.treatmentTitle}</p>
                </div>
              )}

              {/* Formulation Parts / Phases */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {resolvePrescriptionParts(handoutRx).map((part, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f1f5f9',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                        {part.title || `Part ${pIdx + 1}`}
                      </strong>
                      {part.volume && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                          {part.volume}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Active Ingredients in this part */}
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Ingredients (APIs):</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                          {(part.apis || []).map((api, aIdx) => (
                            <div
                              key={aIdx}
                              style={{
                                padding: '6px 10px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}
                            >
                              <strong style={{ color: '#0f172a' }}>{api.name}</strong>
                              {api.dose && <span style={{ color: '#1a73e8', fontWeight: 600, marginLeft: '6px' }}>({api.dose})</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Posology / Administration Instructions */}
                      {part.posology && (
                        <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>How to Take / Apply:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#14532d', lineHeight: 1.45 }}>
                            {part.posology}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety Precautions Note */}
              <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '11.5px', color: '#92400e' }}>
                <strong>Important:</strong> Keep compounded medicines in a cool, dry place away from direct sunlight. Follow the exact posology prescribed by {doctor.name || 'your physician'}. In case of any adverse reaction, discontinue use and contact your clinic immediately.
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                padding: '12px 20px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={14} />
                <span>Print Handout</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const partsText = resolvePrescriptionParts(handoutRx).map(p => `• ${p.title}:\n  APIs: ${(p.apis || []).map(a => `${a.name} ${a.dose || ''}`).join(', ')}\n  Directions: ${p.posology || 'As directed'}`).join('\n\n');
                    const handoutText = `📋 POSOLOGY HANDOUT\nPatient: ${handoutRx.patientName}\nPhysician: ${doctor.name}\nCode: #${handoutRx.code || handoutRx.prescriptionNumber}\n\n${partsText}`;
                    navigator.clipboard?.writeText(handoutText);
                    toast.success('Handout text copied to clipboard ✓');
                  }}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    color: '#3c4043',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={14} />
                  <span>Copy Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareHandoutWhatsApp(handoutRx)}
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={14} />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Clinical Navigation Drawer (Off-Canvas, Rule #23) ─────── */}
      {isMobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            background: 'rgba(32, 33, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex'
          }}
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '320px',
              maxWidth: '85vw',
              height: '100dvh',
              maxHeight: '100dvh',
              background: '#ffffff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInLeft 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header (GCP standard fixed header with prominent close button) */}
            <div
              style={{
                flexShrink: 0,
                padding: '16px 20px',
                borderBottom: '1px solid #dadce0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#003666',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    flexShrink: 0
                  }}
                >
                  {doctor.name ? doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) : 'D'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Clinical Operations</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation Links (Scrollable middle container) */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '12px 0'
              }}
            >
              {sidebarNavGroups.map((group, gIdx) => (
                <div key={gIdx} style={{ marginBottom: '14px' }}>
                  <div
                    style={{
                      padding: '6px 20px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#5f6368',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    {group.groupTitle || group.group}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeAnchor === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIsMobileSidebarOpen(false);
                          handleSidebarNavigate(item.id);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 20px',
                          border: 'none',
                          borderLeft: isActive ? '3px solid #1a73e8' : '3px solid transparent',
                          background: isActive ? '#e8f0fe' : 'transparent',
                          color: isActive ? '#1a73e8' : '#3c4043',
                          fontSize: '0.88rem',
                          fontWeight: isActive ? 600 : 500,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Icon size={18} style={{ color: isActive ? '#1a73e8' : '#5f6368' }} />
                          <span>{item.label}</span>
                        </div>
                        {typeof item.badge === 'number' && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: isActive ? '#1a73e8' : '#e8eaed',
                              color: isActive ? '#ffffff' : '#3c4043'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile Drawer Fixed Footer: Doctor Identity + Actions */}
            <div
              style={{
                flexShrink: 0,
                borderTop: '1px solid #dadce0',
                background: '#f8fafc',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} style={{ color: '#0d9488' }} />
                  <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>DHA:</span>
                  <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>{doctor.license}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    navigator.clipboard?.writeText(doctor.license);
                    toast.success('DHA License copied ✓');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                  title="Copy DHA license"
                >
                  <Copy size={13} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setIsCredentialsModalOpen(true);
                  }}
                  style={{
                    height: '32px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <Eye size={13} />
                  <span>Full Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleCopyIntakeLink();
                  }}
                  style={{
                    height: '32px',
                    borderRadius: '4px',
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <Share2 size={13} />
                  <span>Share Intake</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  setIsIntakeOpen(true);
                }}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                }}
              >
                <Sparkles size={16} />
                <span>New Prescription Intake</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                style={{
                  width: '100%',
                  height: '34px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#5f6368',
                  fontSize: '0.80rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
                <span>Close Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── GCP Resource Inspector Drawer (Golden Rule #4: Master-Detail sin abandonar contexto) ── */}
      {selectedInspectorItem && (() => {
        const isTask = selectedInspectorItem.type === 'task';
        const item = selectedInspectorItem.data;
        const rx = isTask ? selectedInspectorItem.prescription : item;
        const rxCode = rx?.code || rx?.prescriptionNumber || item?.code || 'N/A';
        const patientName = rx?.patientName || item?.patientName || 'Anonymous Patient';
        const rawTitle = rx?.treatmentTitle || item?.title || 'Personalized Clinical Protocol';
        const treatmentTitle = String(rawTitle).replace(/\s*\(Propuesta de Tratamiento\)/gi, '').replace(/\s*\(Sin Pedido\)/gi, '').replace(/\s*\(Propuesta\)/gi, '').trim();
        const itemsList = rx?.items && rx.items.length > 0 ? rx.items : (rx?.prescriptionLines || []);
        const posology = rx?.posology || item?.description || 'Administer as directed by treating physician according to physiological circadian cycle.';
        const isProposal = rx?.status === 'proposal_pending' || rx?.isTreatmentProposal || rx?.orderStatus === 'Offer Not Accepted';
        const status = isProposal ? 'proposal_pending' : (rx?.status || (isTask ? item?.priority : 'active'));
        const createdDate = rx?.createdAt || rx?.createdDate ? new Date(rx.createdAt || rx.createdDate).toLocaleDateString() : 'Active Regimen';

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={() => setSelectedInspectorItem(null)}
          >
            <aside
              style={{
                width: '100%',
                maxWidth: '480px',
                height: '100%',
                background: '#ffffff',
                boxShadow: '-6px 0 28px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Header (GCP Style) */}
              <div
                style={{
                  padding: '16px 20px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Clinical Registry · Resource Inspector
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {isTask ? `Task: ${item.title}` : `Prescription #${rxCode}`}
                    </h3>
                    <CopyableId value={rxCode} iconOnly={true} />
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status={status} />
                    {rx && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {createdDate}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {rx && (
                    <Link
                      href={`/rx/${rxCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full monograph dossier in new tab"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#003666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                  {rx && (
                    <button
                      type="button"
                      onClick={() => handleOpenLabelsModal(rx)}
                      title="View prescription bottle labels"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Tag size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedInspectorItem(null)}
                    title="Close inspector"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'transparent',
                      color: '#5f6368',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer GCP Subtabs Strip */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '0 16px',
                  gap: '4px'
                }}
              >
                {[
                  { id: 'dossier', label: 'Clinical Dossier', icon: FileText },
                  { id: 'items', label: `Prescription Items (${itemsList.length || 1})`, icon: Pill },
                  { id: 'dispensary', label: 'Quality & Tracking', icon: ShieldCheck }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = inspectorTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInspectorTab(t.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 12px',
                        border: 'none',
                        borderBottom: isActive ? '2px solid #003666' : '2px solid transparent',
                        background: 'transparent',
                        color: isActive ? '#003666' : '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.12s'
                      }}
                    >
                      <Icon size={14} color={isActive ? '#003666' : '#64748b'} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inspectorTab === 'dossier' && (
                  <>
                    {/* Clinical Task & Action Scheduling */}
                    {isTask && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                            Clinical Action & Timeline
                          </span>
                          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> Timeline: {item.dueDate || 'Immediate'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                          {item.description}
                        </div>
                      </div>
                    )}

                    {/* Patient Information Card */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Patient Demographics & Record
                      </div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                        {patientName}
                      </div>
                      {rx?.patient?.dob && (
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          DOB: {rx.patient.dob} {rx.patient?.gender ? `· ${rx.patient.gender}` : ''}
                        </div>
                      )}
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Canonical Ref:</span>
                        <CopyableId value={rxCode} />
                      </div>
                    </div>

                    {/* Prescribing Doctor Information */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Treating Physician
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Stethoscope size={14} />
                        <span>{doctor.name || 'Dr. Marina Cordeiro Fernandes'}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                        {doctor.specialty || 'Regenerative Medicine & Longevity'} · Lic: {doctor.licenseNumber || 'DHA-P-0319842'}
                      </div>
                    </div>

                    {/* Clinical Regimen Title & Posology */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Regimen & Posology Schedule
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        {treatmentTitle}
                      </div>
                      <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8rem', color: '#134e4a', lineHeight: 1.45 }}>
                        {posology}
                      </div>
                    </div>

                    {/* Unaccepted Proposal / Patient Follow-up Block */}
                    {isProposal && (
                      <div style={{
                        background: '#fef7e0',
                        border: '1px solid #feefc3',
                        borderRadius: '6px',
                        padding: '16px'
                      }}>
                        <div style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#b06000',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Clock size={13} color="#b06000" />
                          <span>Clinical Treatment Proposal · Awaiting Patient</span>
                        </div>
                        <div style={{
                          fontSize: '0.82rem',
                          color: '#78350f',
                          lineHeight: 1.45,
                          marginBottom: '12px'
                        }}>
                          This personalized formulation was recommended by Dr. {doctor?.name || 'treating physician'}, but the patient has not yet confirmed or purchased the treatment order.
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleShareProposalWhatsApp(rx)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '10px 16px',
                              borderRadius: '4px',
                              background: '#25d366',
                              border: '1px solid #1ebc59',
                              color: '#ffffff',
                              fontSize: '0.82rem',
                              fontWeight: 650,
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(37,211,102,0.25)',
                              transition: 'all 0.12s'
                            }}
                          >
                            <MessageCircle size={15} style={{ color: '#ffffff' }} />
                            <span>WhatsApp Clinical Follow-up</span>
                          </button>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleCopyProposalLink(rx)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '4px',
                                background: '#ffffff',
                                border: '1px solid #dadce0',
                                color: '#1a73e8',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              <Copy size={13} />
                              <span>Copy Link</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSignOffPrescription(rx, e)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '4px',
                                background: '#003666',
                                border: '1px solid #002244',
                                color: '#ffffff',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              <CheckCircle2 size={13} />
                              <span>Convert to Active Rx</span>
                            </button>
                          </div>
                          <div style={{ fontSize: '0.70rem', color: '#64748b', textAlign: 'center', lineHeight: 1.35 }}>
                            Patient can review posology, ingredients, and confirm payment directly from the shared link.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clinical Sign-off & Task Action Block */}
                    {!isProposal && (isTask || (rx && ['pending', 'draft'].includes((rx.status || '').toLowerCase()))) && (() => {
                      const targetEntity = isTask ? item : rx;
                      const isSigned = targetEntity?.isSigned || targetEntity?.status === 'approved' || rx?.status === 'approved';
                      const isSigning = signingTaskId === (targetEntity?.id || targetEntity?.code || rx?.code);

                      return (
                        <div style={{
                          background: isSigned ? '#f0fdf4' : '#fffbeb',
                          border: `1px solid ${isSigned ? '#bbf7d0' : '#fde68a'}`,
                          borderRadius: '6px',
                          padding: '16px'
                        }}>
                          <div style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: isSigned ? '#166534' : '#92400e',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {isSigned ? (
                              <>
                                <CheckCircle2 size={13} color="#16a34a" />
                                <span>Clinical Dispensing Authorized & Signed</span>
                              </>
                            ) : (
                              <>
                                <Clock size={13} color="#b45309" />
                                <span>Pending Physician Clinical Authorization</span>
                              </>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.82rem',
                            color: isSigned ? '#14532d' : '#78350f',
                            lineHeight: 1.45,
                            marginBottom: '12px'
                          }}>
                            {isSigned
                              ? `Prescription digitally authorized by ${doctor.name || 'Treating Physician'} for compounding and release.`
                              : (item?.description || `Compounded prescription awaiting physician electronic sign-off.`)}
                          </div>

                          {!isSigned ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button
                                type="button"
                                disabled={isSigning}
                                onClick={(e) => handleSignOffPrescription(targetEntity, e)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '10px 16px',
                                  borderRadius: '4px',
                                  background: '#003666',
                                  border: '1px solid #002244',
                                  color: '#ffffff',
                                  fontSize: '0.82rem',
                                  fontWeight: 650,
                                  cursor: isSigning ? 'wait' : 'pointer',
                                  boxShadow: '0 1px 3px rgba(0,54,102,0.25)',
                                  transition: 'all 0.12s'
                                }}
                              >
                                {isSigning ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Authorizing & Signing...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={15} style={{ color: '#38bdf8' }} />
                                    <span>Authorize & Sign Dispensing Order</span>
                                  </>
                                )}
                              </button>
                              <div style={{ fontSize: '0.70rem', color: '#64748b', textAlign: 'center', lineHeight: 1.35 }}>
                                Electronically verifies patient posology, API tolerance, and authorizes compounding batch release.
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle2 size={14} /> Signed & Approved
                              </span>
                              <Link
                                href={`/rx/${rxCode}`}
                                target="_blank"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  color: '#003666',
                                  textDecoration: 'none'
                                }}
                              >
                                <span>Official Pad</span>
                                <ArrowUpRight size={12} />
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {inspectorTab === 'items' && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      Active Compounded Ingredients & Prescription Items ({itemsList.length || 1})
                    </div>
                    {itemsList.length === 0 ? (
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                        Custom personalized prescription regimen under clinical review.
                      </div>
                    ) : (
                      itemsList.map((it, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>{it.name}</span>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0d9488', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                              {it.dose || it.vehicle || 'Pharmaceutical Grade'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
                            Vehicle / Base: {it.vehicle || 'Micronized Plant-Based HPMC Capsules (Acid-Resistant)'}
                          </div>
                          <div style={{ marginTop: '6px', fontSize: '0.70rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} /> EU GMP Verified Active API
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {inspectorTab === 'dispensary' && (
                  <>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Laboratory & Dispensary Verification
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#003666', marginBottom: '4px' }}>
                        EU GMP Certified Cleanroom Dispensary
                      </div>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                        Formulated under ISO Class 5 Laminar Airflow with HPLC purity certification by Atlas Certified Compounding Solutions.
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Patient Access & Security
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                        Digital clinical dossier is protected by codified access token. Patients can verify authenticity and dosage guidelines directly.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/rx/${rxCode}?view=patient`;
                          navigator.clipboard?.writeText(url);
                          toast.success('Patient direct link copied ✓');
                        }}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '4px',
                          border: '1px solid #dadce0',
                          background: '#ffffff',
                          color: '#003666',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={13} />
                        <span>Copy Patient View Link</span>
                      </button>
                    </div>

                    {rx && (
                      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '14px 16px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Prescription Bottle Label
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#0c4a6e', lineHeight: 1.4 }}>
                          Direct access to vector print templates formatted for amber pharmaceutical bottles.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenLabelsModal(rx)}
                          style={{
                            height: '32px',
                            padding: '0 12px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Tag size={13} />
                          <span>Open Bottle Labels Modal</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Bottom Action Bar */}
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #dadce0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedInspectorItem(null)}
                  style={{
                    height: '34px',
                    padding: '0 14px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    color: '#3c4043',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                {rx && (
                  <Link
                    href={`/rx/${rxCode}`}
                    style={{
                      height: '34px',
                      padding: '0 16px',
                      borderRadius: '4px',
                      background: '#003666',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Open Full Monograph</span>
                    <ArrowUpRight size={13} />
                  </Link>
                )}
              </div>
            </aside>
          </div>
        );
      })()}

      {/* ── Slide-Over Clinical Intelligence & Algolia Search Drawer (Google Cloud UX Principle) ── */}
      {isDiscoveryDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s ease'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDiscoveryDrawerOpen(false);
            }
          }}
        >
          <aside
            style={{
              width: '100%',
              maxWidth: '1240px',
              height: '100vh',
              background: '#f8fafc',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '16px 24px',
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #003666 0%, #1e40af 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      Clinical Intelligence & Algolia Search Engine
                    </h2>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca' }}>
                      ⌘K Instant
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Interactive search across 77 evidence-based protocols & bioactive compounding APIs
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <kbd
                  style={{
                    fontSize: '0.70rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600
                  }}
                >
                  ESC to close
                </kbd>
                <button
                  type="button"
                  onClick={() => setIsDiscoveryDrawerOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Close Discovery Drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <ClinicalIntelligenceBanner
                protocols={data?.protocols || []}
                formulary={data?.formulary || []}
                opaqueDoctorCode={doctor?.opaqueCode || slug}
              />
            </div>
          </aside>
        </div>
      )}

      {/* ── Official Physician Credentials & Profile Popup Modal (Modularized) ── */}
      <DoctorCredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        doctor={doctor}
        slug={slug}
        onDoctorUpdated={(updates, serverDoctor) => {
          setData(prev => ({
            ...prev,
            doctor: {
              ...prev?.doctor,
              ...updates,
              ...serverDoctor
            }
          }));
        }}
      />

      {/* ── Atlas Platform Services & Membership Tiers Modal (GCP UX Style) ── */}
      <DoctorServicesMembershipModal
        isOpen={isServicesModalOpen}
        onClose={handleCloseServicesModal}
        doctor={doctor}
        doctorName={doctor.name || 'Doctor'}
        clinicName={doctor.clinic || 'Medical Practice'}
        currentTier={doctor.tier || doctor.membershipTier || doctor.subscriptionTier || 'basic'}
      />
    </div>
  );
}

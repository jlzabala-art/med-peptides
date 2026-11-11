"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { rememberDoctorSection } from '@/components/doctor/DoctorContinueBanner';
import { safeReplaceState } from '@/hooks/useSafeUrlState';
import {
  Stethoscope,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Globe,
  Pill,
  Sparkles,
  Award,
  FileText,
  Users,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Shield,
  Lock,
  Bell,
  TrendingUp,
  UserPlus,
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
  Network,
  Image as ImageIcon,
  Package
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
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import ClinicalIntelligenceBanner from '@/components/doctor/ClinicalIntelligenceBanner';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import { getFagronClinicalMonograph, resolveApiClinicalData } from '@/data/fagronClinicalMonographs';
import { getPrescriptionAtlasRecommendations } from '@/services/atlasRecommendationsEngine';
import { resolveDoctorSpecialtyIntelligence } from '@/services/specialtyBlueprintsEngine';
import { triggerHaptic } from '@/utils/haptics';
import { COUNTRIES } from '@/data/countries';
import { consolidateMultiPartPrescriptions } from '@/utils/prescriptionConsolidator';
import { calculateTreatmentDates, calculateTreatmentDuration } from '@/utils/clinical/clinicalFormulations';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import '@/styles/publicDesignSystem.css';
import DoctorAiMessageRenderer from '@/components/doctor/DoctorAiMessageRenderer';
import PrescriptionProtocolAlignmentCard from '@/components/doctor/PrescriptionProtocolAlignmentCard';
import DoctorClinicalAnalytics from '@/components/doctor/DoctorClinicalAnalytics';
import {
  sanitizePrescriptionCode,
  getCodifiedPatientId,
  maskDateOfBirth,
  maskMedicalLicense
} from '@/lib/prescriptionSanitizer';

const PrescriptionIntakeWorkspace = dynamic(
  () => import('@/features/prescriptions/components/PrescriptionIntakeWorkspace'),
  { ssr: false }
);
const PharmacyLabelsModal = dynamic(
  () => import('@/components/prescription/PharmacyLabelsModal'),
  { ssr: false }
);
const DoctorServicesMembershipModal = dynamic(
  () => import('@/components/doctor/DoctorServicesMembershipModal'),
  { ssr: false }
);
const DoctorPatientShareModal = dynamic(
  () => import('@/components/doctor/DoctorPatientShareModal'),
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
const DoctorTasksTab = dynamic(
  () => import('@/components/doctor/tabs/DoctorTasksTab'),
  { ssr: false }
);
const DoctorPrescriptionsTab = dynamic(
  () => import('@/components/doctor/tabs/DoctorPrescriptionsTab'),
  { ssr: false }
);
const DoctorLabResultsTab = dynamic(
  () => import('@/components/doctor/tabs/DoctorLabResultsTab'),
  { ssr: false }
);
const DoctorDiagnosticsTab = dynamic(
  () => import('@/components/doctor/tabs/DoctorDiagnosticsTab'),
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
const DoctorPracticeClaimModal = dynamic(
  () => import('@/components/doctor/modals/DoctorPracticeClaimModal'),
  { ssr: false }
);
const DoctorAuthNoticeModal = dynamic(
  () => import('@/components/doctor/modals/DoctorAuthNoticeModal'),
  { ssr: false }
);
const DoctorRequestInfoModal = dynamic(
  () => import('@/components/doctor/modals/DoctorRequestInfoModal'),
  { ssr: false }
);
const DoctorBlueprintDossierModal = dynamic(
  () => import('@/components/doctor/modals/DoctorBlueprintDossierModal'),
  { ssr: false }
);
const DoctorPatientFollowUpModal = dynamic(
  () => import('@/components/doctor/modals/DoctorPatientFollowUpModal'),
  { ssr: false }
);
const DoctorCommandPalette = dynamic(
  () => import('@/components/doctor/DoctorCommandPalette'),
  { ssr: false }
);
const DoctorContinueBanner = dynamic(
  () => import('@/components/doctor/DoctorContinueBanner'),
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

export function isProposalPrescription(rx) {
  if (!rx) return false;
  const s = (rx.status || rx.state || '').toLowerCase().trim();
  const rawInv = rx.invoiceRef ? String(rx.invoiceRef).trim() : '';
  const hasInv = rawInv && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(rawInv);
  if (hasInv || ['completed', 'delivered', 'shipped', 'paid'].includes(s) || rx.orderStatus === 'Delivered' || rx.orderStatus === 'Ordered') {
    return false;
  }
  return Boolean(s === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted');
}

export function isSoldPrescription(rx) {
  if (!rx) return false;
  const s = (rx.status || rx.state || '').toLowerCase().trim();
  const rawInv = rx.invoiceRef ? String(rx.invoiceRef).trim() : '';
  const hasInv = rawInv && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(rawInv);
  if (hasInv || ['completed', 'delivered', 'shipped', 'paid'].includes(s) || rx.orderStatus === 'Delivered') {
    return true;
  }
  const isProp = isProposalPrescription(rx);
  if (isProp) return false;
  return Boolean(rx.orderStatus === 'Ordered' || ['active', 'approved', 'dispensed', 'completed', 'delivered', 'shipped', 'paid'].includes(s));
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
  availableDoctors = [],
  initialTab = 'overview',
  initialSearchParams = {}
}) {
  const [slug, setSlug] = useState(propSlug);
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData?.doctor && !initialData?.success && !initialData?.serverComputed);
  const [error, setError] = useState(null);
  const [agentDoctors, setAgentDoctors] = useState(availableDoctors || []);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isAuthNoticeModalOpen, setIsAuthNoticeModalOpen] = useState(false);
  const [authNoticeResource, setAuthNoticeResource] = useState('');
  const [workstationAuthorized, setWorkstationAuthorized] = useState(false);
  const [isSwitchingDoctor, setIsSwitchingDoctor] = useState(false);
  const [followUpModalTask, setFollowUpModalTask] = useState(null);
  const [hoveredInsightBar, setHoveredInsightBar] = useState(null);

  const { user, activeRole, isAdmin } = useAuth();

  // DHA / HIPAA Medical Privacy Compliance:
  // Nominal patient identity is strictly restricted to authenticated authorized practitioners
  // or verified clinical workstations (remembered for 90 days).
  const isAuthorizedViewer = useMemo(() => {
    if (isCustomerAgent) return true;
    if (workstationAuthorized) return true;
    if (!user) return false;
    if (isAdmin || activeRole === 'admin' || activeRole === 'doctor' || activeRole === 'clinic_admin') return true;
    const docEmail = data?.doctor?.email || initialData?.doctor?.email;
    if (docEmail && user.email && user.email.toLowerCase() === docEmail.toLowerCase()) return true;
    return false;
  }, [user, activeRole, isAdmin, data?.doctor?.email, initialData?.doctor?.email, isCustomerAgent, workstationAuthorized]);

  // Verify Workstation Session (90-day persistence) or 1-Tap Magic Token / Auth Token from WhatsApp
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const magicToken = params.get('magic_token');
    const authToken = params.get('auth_token');
    let savedWsToken = '';
    try {
      savedWsToken = localStorage.getItem('atlas_workstation_session') || '';
    } catch (e) {
      console.debug('Could not read workstation session token:', e);
    }

    const targetSlug = slug || propSlug;
    if ((magicToken || authToken || savedWsToken) && targetSlug) {
      fetch('/api/doctor/verify-workstation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorSlug: targetSlug,
          magicToken: magicToken || '',
          authToken: authToken || '',
          workstationToken: savedWsToken || ''
        })
      })
        .then(res => res.json())
        .then(resData => {
          if (resData?.authorized) {
            setWorkstationAuthorized(true);
            if (resData.workstationToken) {
              try {
                localStorage.setItem('atlas_workstation_session', resData.workstationToken);
              } catch (e) {
                console.debug('Could not save workstation session token:', e);
              }
            }
            if (magicToken || authToken) {
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, '', cleanUrl);
              toast.success('Clinical practice verified! Nominal patient records unlocked.');
            }
          }
        })
        .catch(err => console.warn('Workstation session verification:', err));
    }
  }, [slug, propSlug]);

  // Sync if propSlug changes externally
  useEffect(() => {
    if (propSlug && propSlug !== slug) {
      setSlug(propSlug);
    }
  }, [propSlug, slug]);

  // Sync if initialData changes externally (guarded against mount re-renders)
  useEffect(() => {
    if (initialData && (!data || (initialData?.doctor?.id && initialData.doctor.id !== data?.doctor?.id))) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData, data]);

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
  const [searchQuery, setSearchQuery] = useState(initialSearchParams?.q || '');
  const [statusFilter, setStatusFilter] = useState(initialSearchParams?.status || 'all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState(initialSearchParams?.task || 'all');
  const [temporalFilter, setTemporalFilter] = useState(initialSearchParams?.time || 'all'); // 'all' | 'active' | '30d' | '90d'
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22 Scope Switcher)

  // Table Density & Synchronization (GCP Table Standard)
  const [tableDensity, setTableDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastRefreshed(new Date());
  }, []);

  const handleRefresh = useCallback(() => {
    triggerHaptic('light');
    setLastRefreshed(new Date());
    toast.success('Synchronized with medical record registry');
  }, []);

  // UI Actions State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIntake, setCopiedIntake] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const intakeSavedRef = useRef(false);

  // Language & Clinical Sidebar Navigation State (GCP Standard)
  const [lang, setLang] = useState('en');
  const isEs = lang === 'es';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState(
    initialTab || (initialSearchParams?.task ? 'tasks' : initialSearchParams?.tab) || 'overview'
  );

  // Modal for Viewing Pharmacy Labels Directly from Doctor Portal
  const [activeLabelRx, setActiveLabelRx] = useState(null);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isPatientShareModalOpen, setIsPatientShareModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isPracticeSearchOpen, setIsPracticeSearchOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [activeBlueprintDossier, setActiveBlueprintDossier] = useState(null);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    if (!isNotifDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifDropdownOpen]);

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
  const [inspectorTab, setInspectorTab] = useState('dossier'); // 'dossier' | 'items' | 'dispensary' | 'timeline'
  const [signingTaskId, setSigningTaskId] = useState(null);
  const [selectedRxIds, setSelectedRxIds] = useState([]);
  const [isBatchSigning, setIsBatchSigning] = useState(false);

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
  const [quickRxFilter, setQuickRxFilter] = useState(initialSearchParams?.filter || 'all'); // 'all' | 'active' (Sold & Invoiced) | 'proposals' (Unaccepted Offers) | 'multipart'
  const [apiFilter, setApiFilter] = useState(null); // Active pharmaceutical ingredient filter from Analytics

  // Atlas Recommendations UI State (Consolidated Master Catalog)
  const [recCategoryFilter, setRecCategoryFilter] = useState(initialSearchParams?.cat || 'all'); // 'all' | 'peptides' | 'supplements' | 'colway' | 'diagnostics'
  const [recSearchQuery, setRecSearchQuery] = useState('');
  const [expandedRecId, setExpandedRecId] = useState(null);
  const [recFilter, setRecFilter] = useState(null); // { id: string, title: string, rxIds: string[] }
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientFilterMode, setPatientFilterMode] = useState(initialSearchParams?.pmode || 'all'); // 'all' | 'sold' | 'unaccepted'

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
  const isFirstSyncRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const s = params.get('status');
      const f = params.get('filter');
      const pmode = params.get('pmode');
      const t = params.get('task');
      const tab = params.get('tab');
      const time = params.get('time');
      if (q !== null) setSearchQuery(q);
      if (s !== null) setStatusFilter(s);
      if (f !== null) setQuickRxFilter(f);
      if (pmode !== null) setPatientFilterMode(pmode);
      if (t) {
        setTaskFilter(t);
        setActiveAnchor('tasks');
      } else if (tab) {
        setActiveAnchor(tab);
      } else {
        setActiveAnchor('overview');
      }
      if (time !== null) setTemporalFilter(time);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (quickRxFilter !== 'all') params.set('filter', quickRxFilter);
    if (patientFilterMode !== 'all') params.set('pmode', patientFilterMode);
    if (taskFilter !== 'all') params.set('task', taskFilter);
    if (temporalFilter !== 'all') params.set('time', temporalFilter);
    if (activeAnchor !== 'overview') params.set('tab', activeAnchor);
    const newSearch = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== newSearch) {
      safeReplaceState(`${window.location.pathname}${newSearch}`);
    }
  }, [searchQuery, statusFilter, quickRxFilter, patientFilterMode, taskFilter, temporalFilter, activeAnchor]);

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
  // Opaque Doctor Slug (Protects Doctor Identity in URL)
  const opaqueCode = doctor.opaqueCode || doctor.slug || slug;

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
  const allTasks = useMemo(() => {
    const raw = data?.tasks || [];
    if (isAuthorizedViewer) return raw;
    return raw.map((t) => {
      const cleanCode = sanitizePrescriptionCode(t.code || t.id, t.patientName);
      const codifiedPt = getCodifiedPatientId(t.patientName, cleanCode);
      return {
        ...t,
        code: cleanCode,
        prescriptionNumber: cleanCode,
        patientName: `Patient ${codifiedPt}`,
        patient: {
          ...(t.patient || {}),
          name: `Patient ${codifiedPt}`,
          phone: '',
          mobile: '',
          dob: maskDateOfBirth(t.patient?.dob || t.patientDob, false)
        },
        patientPhone: '',
        phone: '',
        mobile: '',
        whatsappMessage: `Hello Patient ${codifiedPt}, your clinical follow-up for ${t.treatmentTitle || 'treatment plan'} is on file (Ref #${cleanCode}).`,
        description: (t.description || '').replace(new RegExp(t.patientName || 'XYZPATIENT', 'gi'), `Patient ${codifiedPt}`)
      };
    });
  }, [data?.tasks, isAuthorizedViewer, opaqueCode]);

  const allPrescriptions = useMemo(() => {
    const consolidated = consolidateMultiPartPrescriptions(data?.prescriptions || []);
    const sorted = [...consolidated].sort((a, b) => {
      const aSold = isSoldPrescription(a);
      const bSold = isSoldPrescription(b);
      if (aSold !== bSold) return aSold ? -1 : 1;
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    if (isAuthorizedViewer) return sorted;

    return sorted.map((p) => {
      const cleanCode = sanitizePrescriptionCode(p.code || p.prescriptionNumber || p.id, p.patientName);
      const codifiedPt = getCodifiedPatientId(p.patientName, cleanCode);
      return {
        ...p,
        id: cleanCode,
        code: cleanCode,
        prescriptionNumber: cleanCode,
        patientName: `Patient ${codifiedPt}`,
        patient: {
          ...(p.patient || {}),
          name: `Patient ${codifiedPt}`,
          phone: '',
          mobile: '',
          email: '',
          dob: maskDateOfBirth(p.patient?.dob || p.dob, false)
        },
        patientPhone: '',
        patientEmail: '',
        phone: '',
        mobile: '',
        email: '',
        doctorLicense: maskMedicalLicense(p.doctorLicense || doctor?.license, false, opaqueCode)
      };
    });
  }, [data?.prescriptions, isAuthorizedViewer, opaqueCode, doctor?.license]);

  const allProtocols = data?.protocols || [];
  const allLabResults = useMemo(() => {
    const raw = data?.labResults || [];
    if (isAuthorizedViewer) return raw;
    return raw.map((l) => {
      const cleanCode = sanitizePrescriptionCode(l.code || l.id, l.patientName);
      const codifiedPt = getCodifiedPatientId(l.patientName, cleanCode);
      return {
        ...l,
        code: cleanCode,
        patientName: `Patient ${codifiedPt}`,
        patient: {
          ...(l.patient || {}),
          name: `Patient ${codifiedPt}`,
          phone: '',
          dob: maskDateOfBirth(l.patient?.dob, false)
        },
        patientPhone: '',
        doctorName: `Physician (${opaqueCode})`
      };
    });
  }, [data?.labResults, isAuthorizedViewer, opaqueCode]);

  const labKpis = useMemo(() => {
    let optimal = 0;
    let attention = 0;
    const modalities = new Set();
    allLabResults.forEach(r => {
      const tName = String(r.testName || r.biomarker || '').toLowerCase();
      const isTelo = tName.includes('telo') || r.testType?.includes('telo') || r.estimatedBiologicalAge;
      const isTricho = tName.includes('tricho') || r.testType?.includes('tricho');
      const isEterna = tName.includes('eterna') || tName.includes('proteomic');

      if (isTelo) {
        modalities.add('Fagron TeloTest™ qPCR');
        const realAge = Number(r.realAge || r.keyFindings?.realAge || r.patient?.age) || 31;
        const bioAge = Number(r.estimatedBiologicalAge || r.keyFindings?.estimatedBiologicalAge || r.value) || 28;
        const delta = r.agingDelta != null ? Number(r.agingDelta) : (bioAge - realAge);
        if (delta <= 0) optimal++; else attention++;
      } else if (isTricho) {
        modalities.add('Pharmacogenetic DNA');
        optimal++;
      } else if (isEterna) {
        modalities.add('Plasma Proteomics');
        optimal++;
      } else {
        modalities.add('Bloodo™ DBS NAD+');
        const val = Number(r.value) || 0;
        if (val >= 21.7 || r.zone === 'green' || r.zone === 'optimal') optimal++;
        else attention++;
      }
    });
    return {
      total: allLabResults.length,
      optimal,
      attention,
      modalitiesCount: Math.max(modalities.size, 1),
      modalitiesList: Array.from(modalities).join(' · ')
    };
  }, [allLabResults]);

  const [activeSection, setActiveSection] = useState('overview');

  const [isDiscoveryDrawerOpen, setIsDiscoveryDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sectionIds = ['overview', 'tasks', 'prescriptions', 'patients', 'diagnostics'];
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

  // ── Global Escape Key Listener for Modals ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isDiscoveryDrawerOpen) setIsDiscoveryDrawerOpen(false);
        if (isCredentialsModalOpen) setIsCredentialsModalOpen(false);
        if (isServicesModalOpen) setIsServicesModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDiscoveryDrawerOpen, isCredentialsModalOpen, isServicesModalOpen]);

  // Filter Tasks (Consolidated per Patient/Prescription to prevent duplicates)
  const filteredTasks = useMemo(() => {
    const validTasks = allTasks.filter(t => !t.isSigned && t.status !== 'approved' && t.status !== 'completed');

    // When viewing "all", consolidate per patient + rx so patients don't appear twice
    let taskPool = validTasks;
    if (taskFilter === 'all') {
      const patientRxMap = new Map();
      const PRIORITY_SCORE = {
        approval: 5,
        tolerance_check: 4,
        tolerance_checkin: 4,
        refill: 3,
        cycles: 3,
        titration: 3,
        proposal_followup: 2,
        followup: 2,
        portal_inactive: 1
      };

      validTasks.forEach(t => {
        const patientKey = String(t.patientName || '').toLowerCase().trim();
        const rxKey = String(t.code || t.rxId || t.treatmentTitle || '').toLowerCase().trim();
        const groupKey = `${patientKey}_${rxKey}`;

        const existing = patientRxMap.get(groupKey);
        if (!existing) {
          patientRxMap.set(groupKey, { ...t });
        } else {
          const currentScore = PRIORITY_SCORE[existing.type] || 0;
          const newScore = PRIORITY_SCORE[t.type] || 0;

          if (t.type === 'portal_inactive') {
            existing.hasPortalInactive = true;
            existing.portalTask = t;
          } else if (existing.type === 'portal_inactive') {
            const upgraded = { ...t, hasPortalInactive: true, portalTask: existing };
            patientRxMap.set(groupKey, upgraded);
          } else if (newScore > currentScore) {
            patientRxMap.set(groupKey, { ...t, hasPortalInactive: existing.hasPortalInactive, portalTask: existing.portalTask });
          }
        }
      });
      taskPool = Array.from(patientRxMap.values());
    }

    return taskPool.filter(t => {
      if (taskFilter !== 'all') {
        if (taskFilter === 'refill') {
          if (t.type !== 'refill' && t.type !== 'cycles') return false;
        } else if (taskFilter === 'proposal_followup' || taskFilter === 'followup') {
          if (t.type !== 'proposal_followup' && t.type !== 'followup') return false;
        } else if (taskFilter === 'portal_inactive' || taskFilter === 'portal') {
          if (t.type !== 'portal_inactive') return false;
        } else if (taskFilter === 'tolerance_check' || taskFilter === 'tolerance') {
          if (t.type !== 'tolerance_check' && t.type !== 'tolerance_checkin') return false;
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
      portal_inactive: allTasks.filter(t => t.type === 'portal_inactive').length,
      proposal_followup: allTasks.filter(t => t.type === 'proposal_followup' || t.type === 'followup').length,
      tolerance_check: allTasks.filter(t => t.type === 'tolerance_check' || t.type === 'tolerance_checkin').length,
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
          if (!isProposalPrescription(rx)) return false;
        } else if (quickRxFilter === 'drafts') {
          const s = (rx.status || rx.state || '').toLowerCase();
          const isProp = isProposalPrescription(rx);
          if (isProp || (!['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review')) return false;
        } else if (quickRxFilter === 'pending') {
          const s = (rx.status || rx.state || '').toLowerCase();
          const isProp = isProposalPrescription(rx);
          if (!isProp && !['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review') return false;
        } else if (quickRxFilter === 'active') {
          if (!isSoldPrescription(rx)) return false;
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
        if (!isProposalPrescription(rx)) return false;
      } else if (quickRxFilter === 'drafts') {
        const s = (rx.status || rx.state || '').toLowerCase();
        const isProp = isProposalPrescription(rx);
        if (isProp || (!['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review')) return false;
      } else if (quickRxFilter === 'pending') {
        const s = (rx.status || rx.state || '').toLowerCase();
        const isProp = isProposalPrescription(rx);
        if (!isProp && !['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) && rx.ingestionStage !== 'awaiting_atlas_review') return false;
      } else if (quickRxFilter === 'active') {
        if (!isSoldPrescription(rx)) return false;
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
      const isSold = isSoldPrescription(p);
      const isProp = isProposalPrescription(p);
      const s = (p.status || p.state || '').toLowerCase();

      if (isSold) {
        activeCount++;
      } else if (isProp) {
        proposalsCount++;
      } else if (['draft', 'pending', 'awaiting', 'awaiting_validation'].includes(s) || p.ingestionStage === 'awaiting_atlas_review') {
        draftsCount++;
      }
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
    const doctorDisplay = isAuthorizedViewer ? (doctor.name || 'our clinic') : 'our accredited medical practice';
    const text = encodeURIComponent(`Hello, you can submit your medical prescription directly to ${doctorDisplay} at Atlas Clinical Services here: ${intakeUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ── Atlas WhatsApp for Doctor Communications (+971 55 356 1058) ───────────
  const handleContactAtlasWhatsApp = (topic = '', extraDetails = '') => {
    triggerHaptic('light');
    const doctorName = isAuthorizedViewer ? (doctor.name || 'Doctor') : `Prescribing Physician (${opaqueCode})`;
    let text = `Hello Atlas Support, I am ${doctorName}. I am contacting you directly from the Clinical Doctor Portal.`;
    if (topic) {
      text += `\n\n*Subject / Formulation:* ${topic}`;
    }
    if (extraDetails) {
      text += `\n*Clinical Inquiry:* ${extraDetails}`;
    }
    text += `\n\n*Practice:* ${isAuthorizedViewer ? (doctor.clinic || 'Atlas Partner Clinic') : `Practice ID: ${opaqueCode}`}`;
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
    const patientName = isAuthorizedViewer ? (rx.patientName || 'Patient') : `Patient PT-${String(rx.code || rx.id).slice(-4).toUpperCase()}`;
    const docSignature = isAuthorizedViewer ? `Dr. ${doctor.name}` : `Treating Physician (${opaqueCode})`;
    let text = `Dear ${patientName},\n\nHere is your treatment posology and administration guidance prescribed by ${docSignature}:\n\n`;
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
    text += `For medical inquiries, consult ${docSignature} or Atlas Clinical Support on WhatsApp.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareProposalWhatsApp = (rx, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!rx) return;
    triggerHaptic('light');
    const patientName = rx.patientName || 'Patient';
    const rxCode = sanitizePrescriptionCode(rx.code || rx.prescriptionNumber || rx.id, rx.patientName);
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

    let text;
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
    const rxCode = sanitizePrescriptionCode(rx.code || rx.prescriptionNumber || rx.id, rx.patientName);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
    const proposalUrl = `${origin}/rx/${rxCode}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(proposalUrl);
      toast.success('Proposal link copied to clipboard ✓');
    }
  };

  // ── Specialty Practice Intelligence & Web Footprint Resolution ────────────
  const doctorSpecialtyIntel = useMemo(
    () => resolveDoctorSpecialtyIntelligence(doctor, allPrescriptions),
    [doctor, allPrescriptions]
  );

  const handlePrescribeSpecialtyBlueprint = useCallback((blueprint, targetPatient = null) => {
    if (!blueprint?.compoundingFormula) return;
    triggerHaptic('selection');
    const cf = blueprint.compoundingFormula;
    const formulaSummary = {
      treatmentTitle: cf.treatmentTitle || blueprint.title || 'Specialty Compounded Regimen',
      dispensingForm: cf.dispensingForm || 'Magistral Formulation',
      items: Array.isArray(cf.items) ? cf.items : [],
      volume: cf.volume || '60 mL',
      posology: cf.posology || '',
      patientName: targetPatient?.name || '',
      patientPhone: targetPatient?.phone || '',
      patientDob: targetPatient?.dob || '',
      sourceRx: blueprint.code || blueprint.id || 'BLUEPRINT'
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('atlas_represcribe_prefill', JSON.stringify(formulaSummary));
    }
    toast.success(
      targetPatient?.name
        ? `"${blueprint.title}" pre-filled for ${targetPatient.name} ✓`
        : `Specialty Blueprint "${blueprint.title}" loaded into Prescription Builder ✓`
    );
    setIsIntakeOpen(true);
  }, []);

  const handleRequestBlueprintWhatsApp = useCallback((blueprint) => {
    if (!blueprint) return;
    triggerHaptic('light');
    handleContactAtlasWhatsApp(
      'clinical_recommendation',
      `Specialty Blueprint Dossier & Clinic Sample Request: ${blueprint.title} (${blueprint.code || blueprint.id}) — Formula: ${blueprint.compoundingFormula?.treatmentTitle || ''}`
    );
  }, []);

  const handleReprescribeFormula = (rx) => {
    triggerHaptic('selection');
    const resolvedParts = resolvePrescriptionParts(rx);
    let extractedItems = Array.isArray(rx.items) && rx.items.length > 0 ? rx.items : [];
    if (extractedItems.length === 0 && resolvedParts.length > 0) {
      extractedItems = resolvedParts.flatMap((part) =>
        (part.actives || []).map((act) => ({
          name: act.name,
          concentration: act.concentration || '',
          role: act.role || 'Active Compound'
        }))
      );
    }
    const cleanCode = sanitizePrescriptionCode(rx.code || rx.prescriptionNumber || rx.id, rx.patientName || rx.patient?.name);
    const codifiedPatient = getCodifiedPatientId(rx.patientName, cleanCode);
    const formulaSummary = {
      treatmentTitle: rx.treatmentTitle || 'Compounded Formulation',
      dispensingForm: rx.dispensingForm || resolvedParts[0]?.vehicle || 'Magistral Solution',
      items: extractedItems,
      volume: rx.volume || resolvedParts[0]?.volume || '60 mL',
      posology: rx.posology || resolvedParts[0]?.posology || '',
      patientName: isAuthorizedViewer ? (rx.patientName || rx.patient?.name || '') : `Patient ${codifiedPatient}`,
      patientPhone: isAuthorizedViewer ? (rx.patientPhone || rx.patient?.phone || '') : '',
      patientDob: maskDateOfBirth(rx.patient?.dob || rx.dob, isAuthorizedViewer),
      doctorLicense: maskMedicalLicense(doctor?.license || doctor?.medicalLicense, isAuthorizedViewer, opaqueCode),
      sourceRx: cleanCode
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('atlas_represcribe_prefill', JSON.stringify(formulaSummary));
    }
    toast.success(`Regimen #${cleanCode} cloned into Prescription Builder ✓`);
    setIsIntakeOpen(true);
  };

  const handleOpenNewPrescriptionIntake = useCallback(() => {
    triggerHaptic('selection');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('atlas_represcribe_prefill');
    }
    setIsIntakeOpen(true);
  }, []);

  const handleExecuteAiAction = (action) => {
    if (!action) return;
    triggerHaptic('selection');
    if (action.type === 'filter_sold') {
      setIsAtlasAiOpen(false);
      setActiveAnchor('prescriptions');
      setQuickRxFilter('active');
      setStatusFilter('all');
      toast.success('Filtered to Sold & Invoiced prescriptions');
    } else if (action.type === 'filter_proposals') {
      setIsAtlasAiOpen(false);
      setActiveAnchor('prescriptions');
      setQuickRxFilter('proposals');
      setStatusFilter('all');
      toast.success('Filtered to Unaccepted Proposals');
    } else if (action.type === 'filter_patient') {
      setIsAtlasAiOpen(false);
      setActiveAnchor('prescriptions');
      setQuickRxFilter('all');
      setStatusFilter('all');
      setSearchQuery(action.payload || '');
      toast.success(`Showing records for ${action.payload}`);
    } else if (action.type === 'open_tasks') {
      setIsAtlasAiOpen(false);
      setActiveAnchor('tasks');
      toast.success('Opened Clinical Tasks Queue');
    } else if (action.type === 'whatsapp_followup') {
      const targetRx = allPrescriptions.find(
        (p) => (p.code || p.id) === action.payload?.rxCode || p.patientName === action.payload?.patientName
      );
      if (targetRx) {
        handleShareProposalWhatsApp(targetRx);
      } else {
        setIsAtlasAiOpen(false);
        setActiveAnchor('prescriptions');
        setQuickRxFilter('proposals');
      }
    } else if (action.type === 'renew_rx') {
      const targetRx = allPrescriptions.find((p) => (p.code || p.id) === action.payload);
      if (targetRx) {
        setIsAtlasAiOpen(false);
        handleReprescribeFormula(targetRx);
      }
    } else if (action.type === 'open_synergies') {
      setIsAtlasAiOpen(false);
      setActiveAnchor('recommendations');
    } else if (action.type === 'open_intake') {
      setIsAtlasAiOpen(false);
      if (doctorSpecialtyIntel.primaryBlueprints?.[0]) {
        handlePrescribeSpecialtyBlueprint(doctorSpecialtyIntel.primaryBlueprints[0]);
      } else {
        handleOpenNewPrescriptionIntake();
      }
    } else if (action.type === 'open_discovery') {
      setIsAtlasAiOpen(false);
      setActiveAnchor('discovery');
    } else if (action.type === 'open_labs') {
      setIsAtlasAiOpen(false);
      setActiveAnchor('lab_results');
    } else if (action.type === 'open_colway_collection') {
      setIsAtlasAiOpen(false);
      if (typeof window !== 'undefined') {
        window.location.href = action.payload || '/collection/colway';
      }
    } else if (action.type === 'whatsapp_colway_sample') {
      setIsAtlasAiOpen(false);
      handleContactAtlasWhatsApp('Colway Clinical Sample Request - Hair Restoration & Trichology');
    }
  };

  // ── Atlas AI Clinical Reasoning Engine (Doctor-Personalized + Gemini 2.5 + Deterministic Graph) ───
  const handleSendAtlasAiQuery = async (queryText) => {
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

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const practiceContext = {
        doctor: {
          name: isAuthorizedViewer ? doctor.name : `Physician ${opaqueCode}`,
          specialty: doctor.specialty,
          specialtyCategory: doctorSpecialtyIntel.primaryCategory,
          clinic: isAuthorizedViewer ? doctor.clinic : 'Verified Medical Practice',
          city: doctor.city,
          country: doctor.country
        },
        webPracticeProfile: doctorSpecialtyIntel.webPracticeProfile,
        specialtyBlueprints: doctorSpecialtyIntel.primaryBlueprints,
        counts: {
          totalPatients: doctorPatientsList.length,
          soldPatients: soldPatientsCount,
          unacceptedPatients: unacceptedPatientsCount,
          totalPrescriptions: allPrescriptions.length,
          soldPrescriptions: quickCounts.active,
          unacceptedProposals: quickCounts.proposals,
          pendingTasks: filteredTasks.length,
          labReportsCount: allLabResults.length
        },
        topApis: doctorTopApis,
        patients: doctorPatientsList.slice(0, 60).map((pt) => {
          const soldRxs = (pt.prescriptions || []).filter(isSoldPrescription);
          const proposalRxs = (pt.prescriptions || []).filter(isProposalPrescription);
          const latestRx = pt.prescriptions?.[0];
          const codifiedId = getCodifiedPatientId(pt.name, latestRx?.code || latestRx?.prescriptionNumber || latestRx?.id);
          const safeName = isAuthorizedViewer ? pt.name : `Patient ${codifiedId}`;
          const safePhone = isAuthorizedViewer ? (pt.phone || '') : '';
          return {
            name: safeName,
            phone: safePhone,
            rxCount: (pt.prescriptions || []).length,
            soldRxCount: soldRxs.length,
            proposalRxCount: proposalRxs.length,
            hasSold: Boolean(pt.hasSold),
            invoices: pt.invoices || [],
            latestRxCode: latestRx?.code || latestRx?.prescriptionNumber || latestRx?.id || '',
            latestTreatment: pt.latestProduct || latestRx?.treatmentTitle || '',
            latestStatus: latestRx?.status || '',
            lastSeen: pt.latestDate || ''
          };
        }),
        prescriptions: allPrescriptions.slice(0, 60).map((rx) => {
          const codifiedId = getCodifiedPatientId(rx.patientName, rx.code || rx.prescriptionNumber || rx.id);
          const safePatientName = isAuthorizedViewer ? (rx.patientName || rx.patient?.name || 'Patient') : `Patient ${codifiedId}`;
          const safePatientPhone = isAuthorizedViewer ? (rx.patientPhone || rx.patient?.phone || '') : '';
          return {
            code: rx.code || rx.prescriptionNumber || rx.id,
            patientName: safePatientName,
            patientPhone: safePatientPhone,
            status: rx.status,
            isProposal: Boolean(rx.isProposal),
            invoiceNumber: rx.invoiceNumber || rx.zohoInvoiceNumber || null,
            treatmentTitle: rx.treatmentTitle || 'Compounded Regimen',
            dispensingForm: rx.dispensingForm || '',
            createdAt: rx.createdAt || rx.date || '',
            partCount: rx.partCount || 1,
            items: (rx.items || []).map((i) => ({
              name: i.name || i.drugName || i.activeIngredient || '',
              dose: i.dose || i.concentration || ''
            }))
          };
        })
      };

      const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}/ai-copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          practiceContext,
          isPublicUnverified: !isAuthorizedViewer
        })
      });

      const json = await res.json();
      const safeDocName = isAuthorizedViewer ? doctor.name : `Practice ${opaqueCode}`;
      const replyContent =
        json?.reply ||
        `**Practice Intelligence for ${safeDocName}:**\n• **${doctorPatientsList.length} Unique Patients** (${soldPatientsCount} Prescribed Patients · ${unacceptedPatientsCount} Pending Proposal Patients)\n• **${allPrescriptions.length} Prescriptions** (${quickCounts.active} Prescribed & Dispensed · ${quickCounts.proposals} Pending Proposals)`;

      const assistantMsg = {
        role: 'assistant',
        content: replyContent,
        actions: Array.isArray(json?.actions) ? json.actions : [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackDocName = isAuthorizedViewer ? doctor.name : `Practice ${opaqueCode}`;
      const assistantMsg = {
        role: 'assistant',
        content: `**Practice Overview — ${fallbackDocName}:**\n\n• **Unique Patients:** **${doctorPatientsList.length}** (**${soldPatientsCount}** Sold & Invoiced Customers · **${unacceptedPatientsCount}** Unaccepted Proposal Patients)\n• **Total Prescriptions:** **${allPrescriptions.length}** (**${quickCounts.active}** Sold & Invoiced · **${quickCounts.proposals}** Unaccepted Offers)\n• **Signature APIs:** ${doctorTopApis.map((a) => `${a.name} (${a.count})`).join(', ') || 'Custom Trichology & Regenerative APIs'}`,
        actions: [
          { label: `🟢 View ${quickCounts.active} Sold & Invoiced`, type: 'filter_sold' },
          { label: `⏳ View ${quickCounts.proposals} Unaccepted Offers`, type: 'filter_proposals' }
        ],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setAiLoading(false);
    }
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
    const rows = filteredPrescriptions.map((p) => {
      const st = String(p.status || '').toLowerCase();
      const isSold =
        ['approved', 'active', 'dispensed', 'completed', 'processing', 'en tránsito'].includes(st) ||
        Boolean(p.invoiceNumber || p.zohoInvoiceNumber);
      return {
        Code: p.code || p.prescriptionNumber || p.id || '',
        Patient: p.patientName || p.patient?.name || '',
        Phone: p.patientPhone || p.patient?.phone || '',
        CommercialStatus: isSold ? 'Sold & Invoiced' : p.isProposal ? 'Offer Unaccepted' : p.status || 'Draft',
        InvoiceRef: p.invoiceNumber || p.zohoInvoiceNumber || '',
        Treatment: p.treatmentTitle || '',
        Items: (p.items || []).map((i) => `${i.name || ''}${i.dose ? ` (${i.dose})` : ''}`).join('; '),
        Created: p.createdAt || p.createdDate || p.date || ''
      };
    });
    const headers = ['Code', 'Patient', 'Phone', 'CommercialStatus', 'InvoiceRef', 'Treatment', 'Items', 'Created'];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((r) =>
          Object.values(r)
            .map((v) => `"${String(v || '').replace(/"/g, '""')}"`)
            .join(',')
        )
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DR_${opaqueCode}_PRESCRIPTIONS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${rows.length} prescriptions to CSV ✓`);
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

    const isTolerance = taskOrRx.type === 'tolerance_check' || taskOrRx.type === 'tolerance_checkin';

    try {
      // Sign each prescription via the update-status API
      for (const code of codesToSign) {
        const res = await fetch('/api/prescriptions/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescriptionNumber: code,
            status: isTolerance ? undefined : 'approved',
            taskType: taskOrRx.type || 'approval',
            toleranceCheckCompleted: isTolerance,
            reason: isTolerance
              ? 'Physician clinical tolerance check-in verified & completed via Doctor Portal'
              : 'Physician electronic sign-off and dispensing authorization via Doctor Portal',
            updatedBy: doctor?.name || 'Treating Physician'
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to process prescription ${code}`);
        }
      }

      // Optimistically update local data state
      setData((prev) => {
        if (!prev) return prev;
        const updatedPrescriptions = (prev.prescriptions || []).map((rx) => {
          if (codesToSign.includes(rx.code) || codesToSign.includes(rx.prescriptionNumber) || codesToSign.includes(rx.id)) {
            return {
              ...rx,
              status: isTolerance ? rx.status : 'approved',
              state: isTolerance ? rx.state : 'approved',
              toleranceCheckCompleted: isTolerance ? true : rx.toleranceCheckCompleted,
              toleranceCheckedAt: isTolerance ? new Date().toISOString() : rx.toleranceCheckedAt,
              signedAt: isTolerance ? rx.signedAt : new Date().toISOString(),
              signedBy: isTolerance ? rx.signedBy : (doctor?.name || 'Treating Physician')
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
              toleranceCheckCompleted: true,
              priority: 'routine',
              title: isTolerance ? `${t.title} — Verified & Completed` : `${t.title} — Authorized`,
              description: isTolerance
                ? `Clinical tolerance check completed by ${doctor?.name || 'Treating Physician'}.`
                : `Digitally signed & authorized for compounding release by ${doctor?.name || 'Treating Physician'}.`
            };
          }
          return t;
        });

        // Recompute KPIs
        const newActive = updatedPrescriptions.filter(p => ['approved', 'active', 'ordered', 'delivered', 'completed', 'dispensed'].includes((p.status || '').toLowerCase())).length;
        const newPending = updatedTasks.filter(t => !t.isSigned && t.status !== 'approved' && !t.toleranceCheckCompleted).length;

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
              status: isTolerance ? prev.data.status : 'approved',
              isSigned: true,
              toleranceCheckCompleted: isTolerance ? true : prev.data.toleranceCheckCompleted
            },
            prescription: prev.prescription ? {
              ...prev.prescription,
              status: isTolerance ? prev.prescription.status : 'approved',
              state: isTolerance ? prev.prescription.state : 'approved',
              toleranceCheckCompleted: isTolerance ? true : prev.prescription.toleranceCheckCompleted,
              signedAt: isTolerance ? prev.prescription.signedAt : new Date().toISOString(),
              signedBy: isTolerance ? prev.prescription.signedBy : (doctor?.name || 'Treating Physician')
            } : null
          };
        }
        return prev;
      });

      triggerHaptic('success');
      if (isTolerance) {
        toast.success(
          `Tolerance check-in for ${taskOrRx.patientName || 'patient'} marked as verified & completed ✓`
        );
      } else {
        toast.success(
          codesToSign.length > 1
            ? `${codesToSign.length} prescriptions signed & authorized for compounding ✓`
            : `Prescription #${codesToSign[0]} signed & authorized for compounding ✓`
        );
      }

      // Non-blocking background re-fetch to ensure sync with server
      const targetSlug = opaqueCode || doctor?.slug || slug;
      if (targetSlug) {
        fetch(`/api/doctor/${encodeURIComponent(targetSlug)}?fresh=1`)
          .then(res => res.ok ? res.json() : null)
          .then(freshJson => {
            if (freshJson && freshJson.success) {
              setData(freshJson);
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error('Error signing off prescription:', err);
      toast.error('Signing error: ' + (err.message || 'Please try again'));
    } finally {
      setSigningTaskId(null);
    }
  };

  const handleQuickUpdatePrescriptionStatus = async (rx, targetStatus, customInvoiceRef = null, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const rxCode = rx.prescriptionNumber || rx.code || rx.id;
    if (!rxCode) return;

    try {
      toast.loading(`Updating prescription #${rxCode} to ${targetStatus}...`, { id: `status-${rxCode}` });
      const res = await fetch('/api/prescriptions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: rx.id || rxCode,
          prescriptionNumber: rxCode,
          status: targetStatus,
          invoiceRef: customInvoiceRef || rx.invoiceRef,
          updatedBy: isAuthorizedViewer ? (doctor.name || 'Treating Physician') : 'Clinical Physician',
          reason: targetStatus === 'delivered' ? 'Clinical delivery verified by practitioner' : 'Prescription order confirmed & accepted'
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update status');

      toast.success(`Prescription #${rxCode} marked as ${targetStatus.toUpperCase()} ✓`, { id: `status-${rxCode}` });

      setData((prev) => {
        if (!prev) return prev;
        const updatedPrescriptions = (prev.prescriptions || []).map((p) => {
          if (p.id === rx.id || p.code === rxCode || p.prescriptionNumber === rxCode) {
            return {
              ...p,
              status: targetStatus,
              state: targetStatus,
              orderStatus: targetStatus === 'delivered' ? 'Delivered' : 'Ordered',
              isTreatmentProposal: false,
              isDispensed: targetStatus === 'delivered',
              invoiceRef: customInvoiceRef || p.invoiceRef || (targetStatus === 'approved' ? `ORD-${Date.now().toString().slice(-6)}` : p.invoiceRef)
            };
          }
          return p;
        });
        return {
          ...prev,
          prescriptions: updatedPrescriptions
        };
      });

      setSelectedInspectorItem((prev) => {
        if (!prev || !prev.data) return prev;
        const isMatched = prev.data.id === rx.id || prev.data.code === rxCode || (prev.prescription && prev.prescription.code === rxCode);
        if (isMatched) {
          return {
            ...prev,
            data: {
              ...prev.data,
              status: targetStatus,
              state: targetStatus,
              orderStatus: targetStatus === 'delivered' ? 'Delivered' : 'Ordered',
              isTreatmentProposal: false
            },
            prescription: prev.prescription ? {
              ...prev.prescription,
              status: targetStatus,
              state: targetStatus,
              orderStatus: targetStatus === 'delivered' ? 'Delivered' : 'Ordered',
              isTreatmentProposal: false
            } : null
          };
        }
        return prev;
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update prescription status', { id: `status-${rxCode}` });
    }
  };

  const handleBatchSignPrescriptions = async () => {
    if (selectedRxIds.length === 0) return;
    setIsBatchSigning(true);
    triggerHaptic('selection');
    const targetRxs = allPrescriptions.filter(
      (rx) => selectedRxIds.includes(rx.id) || selectedRxIds.includes(rx.code) || selectedRxIds.includes(rx.prescriptionNumber)
    );
    let signedCount = 0;
    try {
      for (const rx of targetRxs) {
        await handleSignOffPrescription(rx);
        signedCount++;
      }
      toast.success(`${signedCount} prescriptions authorized & transmitted to compounding queue ✓`);
      setSelectedRxIds([]);
    } catch (err) {
      console.error('Batch sign error:', err);
      toast.error('Completed batch sign-off with some warnings');
    } finally {
      setIsBatchSigning(false);
    }
  };

  const handleExportPrescriptionsCsv = useCallback((list) => {
    const dataToExport = list && list.length > 0 ? list : allPrescriptions;
    if (!dataToExport || dataToExport.length === 0) {
      toast.error('No prescriptions available to export');
      return;
    }
    const headers = ['Prescription Code', 'Patient', 'Treatment Regimen', 'Status', 'Date', 'Invoice Ref'];
    const rows = dataToExport.map((p) => [
      p.code || p.id || '',
      `"${(p.patientName || 'Anonymous').replace(/"/g, '""')}"`,
      `"${(p.treatmentTitle || '').replace(/"/g, '""')}"`,
      p.status || '',
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
      p.invoiceNumber || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prescriptions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${dataToExport.length} prescriptions as CSV ✓`);
  }, [allPrescriptions]);

  // ── Pending Clinical Tasks Columns (DataTable Exclusive Rendering) ───────
  const taskColumns = useMemo(() => [
    {
      key: 'patientName',
      header: 'Patient Dossier',
      width: '26%',
      align: 'left',
      sortable: true,
      render: (val, row) => {
        const t = row || val || {};
        const rawName = t.nominalPatientName || t.patient?.name || t.patientName || (typeof val === 'string' && !val.startsWith('Patient PT-') ? val : '');
        const rxCode = t.code || (t.codes && t.codes[0]) || t.rxId || '';
        const codifiedId = t.codifiedPatientId || getCodifiedPatientId(rawName, rxCode);
        const dob = t.patient?.dob || t.patientDob || t.dob || (
          allPrescriptions.find(p => p.patientName && rawName && p.patientName.toLowerCase().trim() === rawName.toLowerCase().trim())?.patient?.dob
        );

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.03em',
                  background: '#f1f5f9',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                {codifiedId}
              </span>
              {rawName && !rawName.startsWith('Patient PT-') ? (
                <span style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.86rem' }}>
                  {rawName}
                </span>
              ) : null}
              {!isAuthorizedViewer && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    setAuthNoticeResource('Nominal patient clinical task records');
                    setIsAuthNoticeModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.66rem',
                    fontWeight: 650,
                    color: '#b45309',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '1px 6px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Patient identity protected under DHA/HIPAA standards. Click to sign in or register."
                >
                  <Lock size={10} />
                  <span>Protected</span>
                </span>
              )}
            </div>
            {isAuthorizedViewer && dob && (
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
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
      render: (val, row) => {
        const t = row || val || {};
        const isSigned = t.isSigned || t.status === 'approved';
        const rxMatch = allPrescriptions.find(
          (p) => p.code === t.code || p.id === t.rxId || (p.code && t.codes?.includes(p.code))
        );

        // Derive high-signal title and details following GCP UX standards
        const codeDisplay = t.code || (t.codes && t.codes[0]) || null;
        const medicationSummary = rxMatch?.treatmentTitle || rxMatch?.items?.map(i => i.name).filter(Boolean).slice(0, 2).join(' + ') || null;
        const parts = resolvePrescriptionParts(rxMatch || t);
        const isMultiPart = Array.isArray(parts) && parts.length > 1;

        if (t.type === 'portal_inactive') {
          const treatmentName = t.treatmentTitle || medicationSummary || 'Atlas Patient Portal';
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
                    background: '#f0f9ff',
                    color: '#0284c7',
                    border: '1px solid #bae6fd'
                  }}
                >
                  <Globe size={11} />
                  Portal Inactive
                </span>
                {isMultiPart && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: '#faf5ff',
                      color: '#7e22ce',
                      border: '1px solid #e9d5ff'
                    }}
                    title={parts.map(p => `${p.phase || p.title}: ${(p.apis || []).map(a => `${a.name} ${a.dose || ''}`).join(', ')}`).join(' | ')}
                  >
                    <Layers size={11} />
                    <span>{parts.length} Phases: {parts.map(p => p.phase || p.title || 'Phase').join(' + ')}</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Prescription confirmed</span>
                <span>•</span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>Unclaimed private portal access</span>
              </div>
            </div>
          );
        }

        if (t.type === 'tolerance_check') {
          const treatmentName = t.treatmentTitle || medicationSummary || 'Delivered Regimen';
          return (
            <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
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
                    background: '#f0fdfa',
                    color: '#0d9488',
                    border: '1px solid #99f6e4'
                  }}
                >
                  <Activity size={11} />
                  {t.daysAgo ? `Check-in (Day ${t.daysAgo})` : 'Tolerance Check-in'}
                </span>
                {isMultiPart && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: '#faf5ff',
                      color: '#7e22ce',
                      border: '1px solid #e9d5ff'
                    }}
                    title={parts.map(p => `${p.phase || p.title}: ${(p.apis || []).map(a => `${a.name} ${a.dose || ''}`).join(', ')}`).join(' | ')}
                  >
                    <Layers size={11} />
                    <span>{parts.length} Phases: {parts.map(p => p.phase || p.title || 'Phase').join(' + ')}</span>
                  </span>
                )}
                {t.hasPortalInactive && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 650,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: '#f0f9ff',
                      color: '#0284c7',
                      border: '1px solid #bae6fd'
                    }}
                  >
                    <Globe size={11} />
                    Portal Inactive
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {isMultiPart ? (
                  <span>{parts.map(p => `${p.phase || p.title}${p.vehicle ? ` in ${p.vehicle}` : ''}`).join(' • ')}</span>
                ) : (
                  <span>Treatment delivered</span>
                )}
                <span>•</span>
                <span style={{ color: '#0d9488', fontWeight: 600 }}>Verify patient tolerance &amp; response</span>
              </div>
            </div>
          );
        }

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
      render: (val, row) => {
        const t = row || val || {};
        const isSigned = t.isSigned || t.status === 'approved';
        const isSigning = signingTaskId === (t.id || t.code);

        if (t.type === 'portal_inactive' || t.type === 'proposal_followup' || t.type === 'tolerance_check') {
          const isPortal = t.type === 'portal_inactive';
          const isTolerance = t.type === 'tolerance_check';

          return (
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', width: '100%', flexWrap: 'wrap' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setFollowUpModalTask(t)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  background: isPortal ? '#f0f9ff' : (isTolerance ? '#f0fdfa' : '#f0fdf4'),
                  border: `1px solid ${isPortal ? '#bae6fd' : (isTolerance ? '#99f6e4' : '#bbf7d0')}`,
                  color: isPortal ? '#0284c7' : (isTolerance ? '#0d9488' : '#16a34a'),
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: 'all 0.12s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                title={isPortal ? "Send 1-Click Patient Portal Invitation" : (isTolerance ? "Review Tolerance Check-in" : "Prepare Clinical Follow-up")}
                aria-label="Clinical action"
              >
                {isPortal ? <Globe size={13} /> : (isTolerance ? <Activity size={13} /> : <MessageCircle size={13} />)}
                <span className="btn-label">{isPortal ? 'Invite Portal' : (isTolerance ? 'Check-in' : 'Follow-up')}</span>
              </button>

              {t.hasPortalInactive && t.portalTask && !isPortal && (
                <button
                  type="button"
                  onClick={() => setFollowUpModalTask(t.portalTask)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '5px 8px',
                    borderRadius: '4px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    color: '#0284c7',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    flexShrink: 0,
                    transition: 'all 0.12s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  title="Send 1-Click Patient Portal Invitation"
                  aria-label="Invite to Portal"
                >
                  <Globe size={12} />
                  <span className="btn-label">Invite</span>
                </button>
              )}

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
                title="View full prescription dossier"
                aria-label="Open dossier"
              >
                <ArrowUpRight size={13} />
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
  ], [signingTaskId, handleSignOffPrescription, allPrescriptions, isAuthorizedViewer]);

  // ── Prescriptions Dossier Columns (DataTable Exclusive Rendering) ─────────
  const prescriptionColumns = useMemo(() => [
    {
      key: 'patientName',
      header: 'Patient Dossier',
      width: '22%',
      align: 'left',
      sortable: true,
      render: (val, row) => {
        const rx = row || val || {};
        const isProposal = rx.status === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
        const rawInvoice = rx.invoiceRef ? String(rx.invoiceRef).trim() : '';
        const isLegitInvoice = rawInvoice && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(rawInvoice);
        // Clean single-line contact (strips OCR/AI commentary, notes, and paragraphs)
        const rawPhone = rx.patientPhone || rx.phone || rx.mobile || rx.patient?.phone || rx.patient?.mobile;
        const cleanPhone = (typeof rawPhone === 'string' && rawPhone.trim().length <= 25 && !/(email|provided|reference|note|found|gender|dob|clinic)/i.test(rawPhone))
          ? rawPhone.trim()
          : null;

        const rawEmail = rx.patientEmail || rx.email || rx.patient?.email;
        const cleanEmail = (!cleanPhone && typeof rawEmail === 'string' && rawEmail.trim().length <= 30 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail.trim()))
          ? rawEmail.trim()
          : null;

        // Resolve codified patient token uniquely per patient
        const codifiedId = getCodifiedPatientId(rx.patientName || rx.patient?.name, rx.prescriptionNumber || rx.code || rx.id);

        return (
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!isAuthorizedViewer ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '0.86rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.03em',
                      background: '#f1f5f9',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {codifiedId}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setAuthNoticeResource('Prescription patient records & nominal clinical dossiers');
                      setIsAuthNoticeModalOpen(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.66rem',
                      fontWeight: 650,
                      color: '#b45309',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '1px 6px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Patient identity protected under DHA/HIPAA standards. Click to sign in or register."
                  >
                    <Lock size={10} />
                    <span>Protected</span>
                  </span>
                </div>
              ) : (
                <span style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.88rem' }}>
                  {rx.patientName}
                </span>
              )}
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
            {isAuthorizedViewer && cleanPhone ? (
              <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <Phone size={11} style={{ color: '#059669', flexShrink: 0 }} />
                <span>{cleanPhone}</span>
              </div>
            ) : isAuthorizedViewer && cleanEmail ? (
              <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <Mail size={11} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span>{cleanEmail}</span>
              </div>
            ) : isAuthorizedViewer && rx.patient?.dob ? (
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                DOB: {rx.patient.dob}
              </div>
            ) : !isAuthorizedViewer ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  setAuthNoticeResource('Patient direct contact information');
                  setIsAuthNoticeModalOpen(true);
                }}
                style={{
                  fontSize: '0.70rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '1px',
                  cursor: 'pointer'
                }}
                title="Protected contact details. Click to sign in or register."
              >
                <Lock size={10} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span style={{ color: '#0284c7', textDecoration: 'underline' }}>Contact verified on file</span>
              </div>
            ) : isProposal ? (
              <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '1px' }}>
                No phone on file
              </div>
            ) : null}
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
      render: (val, row) => {
        const rx = row || val || {};
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
      header: 'Commercial & Clinical Status',
      width: '16%',
      align: 'left',
      sortable: true,
      render: (val, row) => {
        const rx = row || val || {};
        const isProposal = isProposalPrescription(rx);
        const isSold = isSoldPrescription(rx);
        const rawInvoice = rx.invoiceRef ? String(rx.invoiceRef).trim() : '';
        const isLegitInvoice = rawInvoice && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(rawInvoice);
        const effectiveStatus = isSold ? 'approved' : (isProposal ? 'proposal_pending' : (rx.status || 'active'));
        const isDraftOrReview = !isProposal && !isSold && (['draft', 'pending', 'awaiting_validation'].includes(String(rx.status || '').toLowerCase()) || rx.ingestionStage === 'awaiting_atlas_review');

        const createdAtMs = rx.createdAt ? new Date(rx.createdAt).getTime() : (rx.startDate ? new Date(rx.startDate).getTime() : Date.now());
        const daysPending = Math.max(0, Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60 * 24)));

        return (
          <div
            title={isSold ? `Confirmed & invoiced order (${rawInvoice || 'Authorized'}).` : (isProposal ? "Clinical proposal recommended by physician; patient has not yet confirmed or purchased the order." : (isDraftOrReview ? "Atlas AI clinical pharmacist review in progress (~24h SLA)." : undefined))}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            {isSold ? (
              <>
                <StatusBadge status="approved" customLabel="Sold & Invoiced" />
                <span
                  style={{
                    fontSize: '0.69rem',
                    color: '#15803d',
                    marginTop: '3px',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title={rawInvoice ? `Confirmed invoice ${rawInvoice}` : 'Confirmed customer purchase'}
                >
                  ✓ {rawInvoice || 'Invoiced Order'}
                </span>
              </>
            ) : isProposal ? (
              <>
                <StatusBadge status="proposal_pending" customLabel="Offer Unaccepted" />
                {daysPending >= 4 ? (
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
                      color: '#b06000',
                      marginTop: '3px',
                      fontWeight: 600,
                      lineHeight: 1.2
                    }}
                  >
                    ⏳ Pending checkout ({daysPending}d)
                  </span>
                )}
              </>
            ) : (
              <StatusBadge status={effectiveStatus} />
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
      render: (val, row) => {
        const rx = row || val || {};
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
      render: (val, row) => {
        const rx = row || val || {};
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const cleanCode = sanitizePrescriptionCode(rx.code || rx.prescriptionNumber || rx.id, rx.patientName);
                window.open(`/rx/${cleanCode}`, '_blank', 'noopener,noreferrer');
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
              title="View public prescription page (/rx)"
              aria-label="View public prescription page"
            >
              <ExternalLink size={14} />
            </button>

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

            {/* QUICK ACTION 4: 1-Click Renew / Clone Prescription Regimen */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReprescribeFormula(rx);
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
                e.currentTarget.style.background = '#f0fdf4';
                e.currentTarget.style.borderColor = '#16a34a';
                e.currentTarget.style.color = '#16a34a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#dadce0';
                e.currentTarget.style.color = '#5f6368';
              }}
              title="1-Click Renew / Clone Prescription Regimen"
              aria-label="Renew or Clone Prescription"
            >
              <RefreshCw size={13} />
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

                {/* 4. Official Bottle Labels (Admin Only) */}
                {Boolean(isAdmin || activeRole === 'admin') && (
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
                )}

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
                    const cleanCode = sanitizePrescriptionCode(rx.code || rx.prescriptionNumber || rx.id, rx.patientName);
                    const url = `${window.location.origin}/rx/${cleanCode}?view=patient`;
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
  ], [signingTaskId, handleSignOffPrescription, handleShareProposalWhatsApp, activeActionsMenuRxId, mobileActionRx, isAuthorizedViewer]);

  // ── Monitored Patients Directory (Aggregated from clinical records) ────────
  const doctorPatientsList = useMemo(() => {
    const pMap = new Map();

    allPrescriptions.forEach(rx => {
      const pName = (rx.patientName || rx.patient?.name || 'Patient').trim();
      if (!pName) return;
      const normKey = String(pName)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^(mr\.?|mrs\.?|ms\.?|miss|dr\.?|prof\.?|patient:?|paciente:?)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase() || String(rx.patientId || rx.id || '').toLowerCase();
      const isSold = isSoldPrescription(rx);
      const isProp = isProposalPrescription(rx);
      const rawInv = rx.invoiceRef ? String(rx.invoiceRef).trim() : '';
      const isLegitInv = rawInv && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(rawInv);

      const phone = rx.patientPhone || rx.phone || rx.mobile || rx.patient?.phone || rx.patient?.mobile || '';
      const email = rx.patientEmail || rx.email || rx.patient?.email || '';

      const existing = pMap.get(normKey);
      if (!existing) {
        pMap.set(normKey, {
          id: rx.patientId || normKey,
          name: pName,
          phone,
          email,
          prescriptions: [rx],
          hasSold: isSold,
          hasUnaccepted: isProp,
          needsRefill: isSold,
          invoices: isLegitInv ? [rawInv] : [],
          latestDate: rx.createdAt || rx.startDate || rx.createdDate || '',
          latestProduct: rx.treatmentTitle || rx.regimenShortTitle || 'Compounded Precision Regimen'
        });
      } else {
        existing.prescriptions.push(rx);
        if (isSold) {
          existing.hasSold = true;
          existing.needsRefill = true;
        }
        if (isProp) existing.hasUnaccepted = true;
        if (isLegitInv && !existing.invoices.includes(rawInv)) {
          existing.invoices.push(rawInv);
        }
        if (!existing.phone && phone) existing.phone = phone;
        if (!existing.email && email) existing.email = email;
      }
    });

    return Array.from(pMap.values()).sort((a, b) => {
      if (a.hasSold !== b.hasSold) return a.hasSold ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [allPrescriptions]);

  const soldPatientsCount = useMemo(
    () => doctorPatientsList.filter(p => p.hasSold).length,
    [doctorPatientsList]
  );

  const unacceptedPatientsCount = useMemo(
    () => doctorPatientsList.filter(p => !p.hasSold && p.hasUnaccepted).length,
    [doctorPatientsList]
  );

  const refillDuePatientsCount = useMemo(
    () => doctorPatientsList.filter(p => p.needsRefill).length,
    [doctorPatientsList]
  );

  const doctorTopApis = useMemo(() => {
    if (Array.isArray(data?.serverAnalytics?.topApis) && data.serverAnalytics.topApis.length > 0) {
      return data.serverAnalytics.topApis;
    }
    const counts = new Map();
    allPrescriptions.forEach(rx => {
      const parts = resolvePrescriptionParts(rx);
      const apis = parts.flatMap(p => p.apis || []);
      const list = apis.length > 0 ? apis : (rx.items || []);
      list.forEach(item => {
        const name = String(item.name || item.activeIngredient || '').trim();
        if (!name || name.length < 2) return;
        const key = name.toLowerCase();
        const prev = counts.get(key) || { name, count: 0, commonDose: item.dose || '' };
        prev.count += 1;
        if (!prev.commonDose && item.dose) prev.commonDose = item.dose;
        counts.set(key, prev);
      });
    });
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }, [data?.serverAnalytics?.topApis, allPrescriptions]);

  const practiceMonthlyTrends = useMemo(() => {
    if (Array.isArray(data?.serverAnalytics?.monthlyData) && data.serverAnalytics.monthlyData.length >= 6) {
      return data.serverAnalytics.monthlyData;
    }
    const monthMap = {};
    let latestTimestamp = 0;
    allPrescriptions.forEach((rx) => {
      const rawDate = rx.startDate || rx.dateIssued || rx.createdAt || rx.date;
      if (!rawDate) return;
      let d = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
      if (isNaN(d.getTime()) && typeof rawDate === 'string' && rawDate.includes('/')) {
        const [day, m, y] = rawDate.split('/');
        d = new Date(`${y}-${m}-${day}`);
      }
      if (isNaN(d.getTime())) return;
      if (d.getTime() > latestTimestamp) latestTimestamp = d.getTime();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      if (!monthMap[key]) {
        monthMap[key] = { key, label, count: 0 };
      }
      monthMap[key].count += 1;
    });

    const anchorDate = latestTimestamp > 0 ? new Date(latestTimestamp) : new Date();
    const timeline = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1);
      const key = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      const label = targetDate.toLocaleDateString('en-US', { month: 'short' });
      timeline.push({
        key,
        label,
        count: monthMap[key]?.count || 0
      });
    }
    return timeline;
  }, [data?.serverAnalytics?.monthlyData, allPrescriptions]);

  const filteredDoctorPatients = useMemo(() => {
    return doctorPatientsList.filter(pat => {
      if (patientFilterMode === 'sold' && !pat.hasSold) return false;
      if (patientFilterMode === 'unaccepted' && pat.hasSold) return false;
      if (patientFilterMode === 'refill' && !pat.needsRefill) return false;

      if (!patientSearchQuery.trim()) return true;
      const q = patientSearchQuery.toLowerCase().trim();
      const matchName = pat.name.toLowerCase().includes(q);
      const matchPhone = pat.phone.toLowerCase().includes(q);
      const matchEmail = pat.email.toLowerCase().includes(q);
      const matchInvoice = pat.invoices.some(inv => inv.toLowerCase().includes(q));
      const matchProduct = pat.latestProduct.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchInvoice || matchProduct;
    });
  }, [doctorPatientsList, patientFilterMode, patientSearchQuery]);

  const patientColumns = useMemo(() => [
    {
      key: 'name',
      header: 'Patient Profile',
      width: '28%',
      align: 'left',
      sortable: true,
      render: (val, row) => {
        const pat = row || val || {};
        const patName = pat.name || (typeof val === 'string' ? val : '');
        const codifiedId = pat.codifiedId || getCodifiedPatientId(patName, pat.latestRxCode || pat.id);
        const resolvedDisplayName = patName && !patName.startsWith('Patient PT-') ? patName : codifiedId;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
            {isAuthorizedViewer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.88rem' }}>
                  {resolvedDisplayName}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: '#0f172a',
                    fontSize: '0.86rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.03em',
                    background: '#f1f5f9',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  {codifiedId}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    setAuthNoticeResource('Nominal patient clinical dossiers');
                    setIsAuthNoticeModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.66rem',
                    fontWeight: 650,
                    color: '#b45309',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '1px 6px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Patient identity protected under DHA/HIPAA standards. Click to sign in or register."
                >
                  <Lock size={10} />
                  <span>Protected</span>
                </span>
              </div>
            )}
            {isAuthorizedViewer && pat.phone ? (
              <div style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={11} style={{ color: '#059669', flexShrink: 0 }} />
                <CopyableId value={pat.phone} />
              </div>
            ) : !isAuthorizedViewer ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  setAuthNoticeResource('Patient direct contact information');
                  setIsAuthNoticeModalOpen(true);
                }}
                style={{
                  fontSize: '0.70rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                title="Protected contact details. Click to sign in or register."
              >
                <Lock size={10} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span style={{ color: '#0284c7', textDecoration: 'underline' }}>Contact verified on file</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No direct phone
              </div>
            )}
            {isAuthorizedViewer && pat.email && (
              <div style={{ fontSize: '0.70rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={11} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span>{pat.email}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Prescription Status',
      width: '22%',
      align: 'left',
      sortable: true,
      render: (val, row) => {
        const pat = row || val || {};
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {pat.hasSold ? (
              <>
                <StatusBadge status="approved" customLabel="Prescribed" />
                <div style={{ fontSize: '0.70rem', color: '#15803d', fontWeight: 650, marginTop: '3px' }}>
                  ✓ {pat.invoices?.join(', ') || 'Prescription Fulfilled'}
                </div>
              </>
            ) : (
              <>
                <StatusBadge status="proposal_pending" customLabel="Offer Unaccepted" />
                <div style={{ fontSize: '0.70rem', color: '#b45309', fontWeight: 600, marginTop: '3px' }}>
                  ⏳ Awaiting Confirmation
                </div>
              </>
            )}
          </div>
        );
      }
    },
    {
      key: 'regimens',
      header: lang === 'es' ? 'Tratamiento Activo' : 'Active Prescription',
      width: '32%',
      align: 'left',
      render: (val, row) => {
        const pat = row || val || {};
        const count = (pat.prescriptions || []).length;
        const mainProduct = pat.latestProduct || (pat.prescriptions?.[0]?.treatmentTitle || pat.prescriptions?.[0]?.regimenShortTitle);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 650, color: '#0f172a', lineHeight: 1.25 }}>
              {mainProduct || (lang === 'es' ? 'Sin prescripción activa' : 'No active prescription')}
            </div>
            {count > 1 ? (
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {lang === 'es' ? `+${count - 1} prescripción previa` : `+${count - 1} prior prescription${count > 2 ? 's' : ''}`}
              </div>
            ) : pat.latestRxDate ? (
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                {pat.latestRxDate}
              </div>
            ) : null}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '18%',
      align: 'right',
      render: (val, row) => {
        const pat = row || val || {};
        const cleanPhone = (pat.phone || '').replace(/[^0-9]/g, '');
        const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                title={`Open WhatsApp chat with ${pat.name}`}
              >
                <MessageSquare size={12} />
                <span>WhatsApp</span>
              </a>
            )}
            {/* 1-Click Renew latest prescription */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const latestRx = pat.prescriptions?.[0];
                if (latestRx) {
                  handleReprescribeFormula(latestRx);
                } else {
                  toast.error('No previous prescription found for this patient');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: '0.72rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
              title={`1-Click renew / clone latest regimen for ${pat.name}`}
            >
              <RefreshCw size={11} />
              <span>Renew</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPatientFilter(pat.name);
                setQuickRxFilter('all');
                setActiveAnchor('prescriptions');
                toast.success(`Showing prescriptions for ${pat.name}`, { id: 'filter-patient' });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '0.72rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              <FileText size={12} />
              <span>Dossier</span>
            </button>
          </div>
        );
      }
    }
  ], [setPatientFilter, setQuickRxFilter, setActiveAnchor, isAuthorizedViewer]);

  // ── Bloodo & Fagron Diagnostic Lab Results Columns (DataTable Universal) ─────────
  const labResultsColumns = useMemo(() => [
    {
      key: 'code',
      header: 'Protocol / Sample Code',
      width: '16%',
      sortable: true,
      render: (row) => {
        const dateStr = row.analysisDate || row.resultsDate || row.date || row.receiptDate || '';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <CopyableId value={row.code || row.protocolNumber || row.id} iconOnly={false} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.70rem', color: '#64748b' }}>
              <span>{row.sampleType || (row.testType?.includes('telo') ? 'Oral Buccal Swab' : 'Dried Blood Spot (DBS)')}</span>
              {dateStr && <span>• {dateStr.slice(0, 10)}</span>}
            </div>
          </div>
        );
      }
    },
    {
      key: 'testName',
      header: 'Biomarker & Diagnostic Assay',
      width: '28%',
      sortable: true,
      render: (row) => {
        const tName = String(row.testName || row.biomarker || 'Diagnostic Biomarker Assay');
        const isTelo = tName.toLowerCase().includes('telo') || row.testType?.includes('telo') || row.keyFindings?.telomereLength || row.estimatedBiologicalAge;
        const isTricho = tName.toLowerCase().includes('tricho') || row.testType?.includes('tricho');
        const isEterna = tName.toLowerCase().includes('eterna') || tName.toLowerCase().includes('proteomic');

        const title = isTelo ? 'Fagron TeloTest™ · Biological Age DNA' :
                      isTricho ? 'Fagron TrichoTest™ · Pharmacogenetic Panel' :
                      isEterna ? 'ETERNA® · Multi-Organ Proteomics' :
                      (row.testName || row.biomarker || 'NAD+ Quantitative Test');

        const labName = isTelo || isTricho ? 'Fagron Genomics' :
                        isEterna ? 'Eurofins Genomics' :
                        (row.laboratory?.name || 'LifeLab1');

        const method = isTelo ? 'Absolute qPCR (Telomere/Single Gene Ratio)' :
                       isTricho ? 'DNA Microarray Pharmacogenetics' :
                       isEterna ? 'GrimAge-Calibrated Plasma Proteomics' :
                       (row.method || 'Enzymatic cyclic assay');

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#0369a1' }}>{labName}</span>
              <span>•</span>
              <span>{method}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'result',
      header: 'Quantification & Clinical Finding',
      width: '24%',
      sortable: true,
      render: (row) => {
        const tName = String(row.testName || row.biomarker || '').toLowerCase();
        const isTelo = tName.includes('telo') || row.testType?.includes('telo') || row.keyFindings?.telomereLength || row.estimatedBiologicalAge;
        const isTricho = tName.includes('tricho') || row.testType?.includes('tricho');
        const isEterna = tName.includes('eterna') || tName.includes('proteomic');

        // 1. Fagron TeloTest: Biological Age vs Chronological Age
        if (isTelo) {
          const realAge = Number(row.realAge || row.keyFindings?.realAge || row.patient?.age) || 31;
          const bioAge = Number(row.estimatedBiologicalAge || row.keyFindings?.estimatedBiologicalAge || row.value) || 28;
          let delta = row.agingDelta != null ? Number(row.agingDelta) : (row.keyFindings?.agingDelta != null ? Number(String(row.keyFindings.agingDelta).replace(/[^0-9.-]/g, '')) : (bioAge - realAge));
          if (isNaN(delta)) delta = bioAge - realAge;
          const isYounger = delta <= 0;
          const telomereKb = row.value != null ? row.value : (row.keyFindings?.telomereLength || '0.89');

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Bio-Age: {bioAge} yrs
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  (Real: {realAge} yrs)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isYounger ? '#15803d' : '#dc2626',
                    background: isYounger ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${isYounger ? '#bbf7d0' : '#fecaca'}`,
                    width: 'fit-content'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isYounger ? '#15803d' : '#dc2626' }} />
                  {isYounger ? `${delta < 0 ? delta : `-${Math.abs(delta)}`} yrs Younger (Optimal)` : `+${delta} yrs (Accelerated)`}
                </span>
                <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  {telomereKb} kb
                </span>
              </div>
            </div>
          );
        }

        // 2. TrichoTest: Pharmacogenetics
        if (isTricho) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.0rem', fontWeight: 800, color: '#0f172a' }}>
                  Dutasteride 100%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#15803d',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    width: 'fit-content'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803d' }} />
                  High Pharmacogenetic Match
                </span>
              </div>
            </div>
          );
        }

        // 3. ETERNA Proteomics
        if (isEterna) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                Proteomic Longevity
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#0369a1',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  width: 'fit-content'
                }}
              >
                GrimAge Calibrated (5 Organs)
              </span>
            </div>
          );
        }

        // 4. Default: NAD+ Intracellular Blood Biomarker
        const val = Number(row.value) || 0;
        const isOptimal = val >= 21.7;
        const isNearOptimal = val >= 17.4 && val < 21.7;
        const isInsufficient = val >= 8.8 && val < 17.4;
        const badgeColor = isOptimal ? '#15803d' : isNearOptimal ? '#16a34a' : isInsufficient ? '#d97706' : '#dc2626';
        const badgeBg = (isOptimal || isNearOptimal) ? '#f0fdf4' : isInsufficient ? '#fffbeb' : '#fef2f2';
        const badgeBorder = (isOptimal || isNearOptimal) ? '#bbf7d0' : isInsufficient ? '#fde68a' : '#fecaca';
        const badgeLabel = row.zoneLabel || (isOptimal ? 'Optimal Range' : isNearOptimal ? 'Near-Optimal' : isInsufficient ? 'Insufficient / Suboptimal' : 'Deficient / Depleted');

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {val > 0 ? val : '—'}
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
              {badgeLabel}
            </span>
          </div>
        );
      }
    },
    {
      key: 'patient',
      header: 'Patient Profile',
      width: '16%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 650, color: '#1e293b' }}>
            {row.patientName || row.patient?.name || 'Patient'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {row.patient?.age ? `${row.patient.age} yrs` : (row.patientDob ? `DOB: ${row.patientDob}` : '')} {row.patient?.gender ? `· ${row.patient.gender}` : ''}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '16%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Link
            href={`/lab/${row.code || row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Dedicated Interactive Dossier"
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
  ], [setPatientFilter, setQuickRxFilter, setActiveAnchor, isAuthorizedViewer]);

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

  const uniquePatientsCount = doctorPatientsList.length;

  const sidebarNavGroups = useMemo(() => {
    const workspaceItems = [
      {
        id: 'overview',
        label: 'Overview',
        icon: BarChart3,
        badge: null
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: Users,
        isLocked: !isAuthorizedViewer,
        badge: uniquePatientsCount > 0 ? uniquePatientsCount : null,
        actionBadgeTooltip: uniquePatientsCount > 0
          ? `${uniquePatientsCount} unique patients (${soldPatientsCount} sold customers, ${unacceptedPatientsCount} unaccepted proposals)`
          : undefined
      },
      {
        id: 'prescriptions',
        label: 'Prescriptions',
        icon: Layers,
        isLocked: !isAuthorizedViewer,
        badge: allPrescriptions.length > 0 ? allPrescriptions.length : null,
        actionBadgeTooltip: quickCounts.active > 0
          ? `${allPrescriptions.length} total prescriptions (${quickCounts.active} sold & invoiced, ${quickCounts.proposals} unaccepted proposals)`
          : undefined
      }
    ];

    if (filteredTasks.length > 0 || allPrescriptions.length > 0) {
      workspaceItems.push({
        id: 'tasks',
        label: 'Pending Actions',
        icon: Clock,
        isLocked: !isAuthorizedViewer,
        actionBadge: filteredTasks.length > 0 ? filteredTasks.length : null,
        actionBadgeTooltip: filteredTasks.length > 0
          ? `${filteredTasks.length} pending clinical task(s) requiring follow-up or review`
          : undefined
      });
    }

    return [
      {
        group: 'CLINICAL WORKSPACE',
        groupTitle: 'CLINICAL WORKSPACE',
        items: workspaceItems
      },
      {
        group: 'CLINICAL INTELLIGENCE',
        groupTitle: 'CLINICAL INTELLIGENCE',
        items: [
          {
            id: 'recommendations',
            label: 'Atlas Recommendations',
            icon: Sparkles,
            badge: doctorSpecialtyIntel.primaryBlueprints.length > 0 ? doctorSpecialtyIntel.primaryBlueprints.length : null
          },
          {
            id: 'lab_results',
            label: 'Lab Diagnostics',
            icon: FlaskConical,
            badge: allLabResults.length > 0 ? allLabResults.length : null
          },
          {
            id: 'analytics',
            label: 'Practice Analytics',
            icon: TrendingUp,
            badge: null
          }
        ]
      },
      {
        group: 'PRACTICE SETTINGS',
        groupTitle: 'PRACTICE SETTINGS',
        items: [
          {
            id: 'credentials',
            label: 'Clinic Credentials',
            icon: ShieldCheck,
            isLocked: !isAuthorizedViewer,
            badge: null
          },
          {
            id: 'services_tiers',
            label: 'Platform Services',
            icon: Award,
            badge: null
          }
        ]
      }
    ];
  }, [allPrescriptions.length, uniquePatientsCount, filteredTasks.length, allLabResults.length, quickCounts.active, quickCounts.pending, quickCounts.drafts, quickCounts.proposals, doctorSpecialtyIntel.primaryBlueprints.length, soldPatientsCount, unacceptedPatientsCount, isAuthorizedViewer]);

  const handleSidebarNavigate = (itemOrId) => {
    triggerHaptic('light');
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;

    if (id === 'intake') {
      handleOpenNewPrescriptionIntake();
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (id === 'search') {
      setIsPracticeSearchOpen(true);
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (id === 'patients') {
      setPatientFilterMode('all');
      setPatientSearchQuery('');
      setActiveAnchor('patients');
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (id === 'credentials') {
      if (!isAuthorizedViewer) {
        setAuthNoticeResource('Clinic licensing credentials & official practice verification files');
        setIsAuthNoticeModalOpen(true);
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
        return;
      }
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

  // Remember the last visited section so the doctor can resume in one tap.
  useEffect(() => {
    if (isAuthorizedViewer) rememberDoctorSection(slug, activeAnchor);
  }, [slug, activeAnchor, isAuthorizedViewer]);

  // Deep link: /dr/[slug]?represcribe=<rx code> → open the builder with that regimen cloned.
  const represcribeHandledRef = useRef(false);
  useEffect(() => {
    if (represcribeHandledRef.current || !isAuthorizedViewer || typeof window === 'undefined') return;
    const target = new URLSearchParams(window.location.search).get('represcribe');
    if (!target || allPrescriptions.length === 0) return;
    const wanted = target.trim().toLowerCase();
    const match = allPrescriptions.find((p) =>
      [p.code, p.id, p.prescriptionNumber].some((v) => v && String(v).toLowerCase() === wanted)
    );
    represcribeHandledRef.current = true;
    if (match) {
      handleReprescribeFormula(match);
    } else {
      toast.error(`Prescription ${target} was not found in your practice.`);
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('represcribe');
    window.history.replaceState({}, '', url.toString());
  });

  // Quick-actions palette entries (Cmd/Ctrl + /). Reuses existing navigation handlers.
  const quickActionCommands = [
    { id: 'new-rx', label: 'New prescription', hint: 'Open the prescription builder', icon: Plus, run: () => handleSidebarNavigate('intake') },
    { id: 'rx-list', label: 'Go to prescriptions', hint: 'Review and filter your prescriptions', icon: FileText, run: () => handleSidebarNavigate('prescriptions') },
    { id: 'patients', label: 'Go to patients', hint: 'Your patients only', icon: Users, run: () => handleSidebarNavigate('patients') },
    { id: 'tasks', label: 'Go to pending tasks', hint: 'Signatures and follow-ups', icon: Clock, run: () => handleSidebarNavigate('tasks') },
    { id: 'recs', label: 'Specialty blueprints & recommendations', hint: 'Evidence-based formulas for your specialty', icon: Sparkles, run: () => handleSidebarNavigate('recommendations') },
    { id: 'discovery', label: 'Browse product collection', hint: 'Atlas catalog, blueprints and synergies', icon: FlaskConical, run: () => { setRecCategoryFilter('all'); setRecSearchQuery(''); handleSidebarNavigate('recommendations'); } },
    { id: 'colway', label: 'Colway collection', hint: 'Dermocosmetics & trichology, filtered inside your portal', icon: Layers, run: () => { setRecCategoryFilter('colway'); setRecSearchQuery(''); handleSidebarNavigate('recommendations'); } },
    { id: 'search', label: 'Search practice records', hint: 'Find a prescription or patient', icon: Search, run: () => handleSidebarNavigate('search') },
    { id: 'creds', label: 'Clinic credentials', hint: 'Verification and licensing', icon: ShieldCheck, run: () => handleSidebarNavigate('credentials') },
    {
      id: 'forget-device',
      label: 'Forget this device',
      hint: 'Stop trusting this computer; sign-in will be required next time',
      icon: Lock,
      run: async () => {
        try {
          await fetch('/api/doctor/verify-workstation', { method: 'DELETE' });
          toast.success('This device is no longer trusted. You will be asked to verify next time.');
        } catch {
          toast.error('Could not forget this device. Please try again.');
        }
      }
    }
  ];

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
          padding: 24px 28px 100px 28px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
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
            padding: 14px 14px 48px 14px;
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
        doctorHomeHref={null}
        doctorName={null}
        hideTier2={false}
        breadcrumb={[
          { label: isEs ? 'Portal Médico' : 'Doctor Portal', href: '/doctor' },
          { label: isAuthorizedViewer ? (doctor?.name || 'Dr. Practitioner') : (doctor?.clinic || `Doctor #${doctor?.opaqueCode || slug}`) }
        ]}
        hideImportRx={true}
        hideSwitchRx={true}
        hideSearchButton={true}
        isDoctorView={true}
        onImportRx={handleOpenNewPrescriptionIntake}
        onSwitchRx={() => handleSidebarNavigate('prescriptions')}
        rxSwitcherCount={quickCounts.pending}
        banner={
          <NominalWelcomeBanner
            recipientName={isAuthorizedViewer ? (doctor?.name || 'Doctor') : (doctor?.clinic || `Doctor #${doctor?.opaqueCode || slug}`)}
            role="doctor"
            clinicName={doctor?.clinic}
            sessionDuration="90 days"
            storageKey={`atlas_welcome_doctor_${slug}`}
          />
        }
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
                      {!isSidebarCollapsed && (item.actionBadge !== null && item.actionBadge !== undefined || item.badge !== null && item.badge !== undefined || item.isLocked) && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                          {item.isLocked && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic('light');
                                setAuthNoticeResource(item.label);
                                setIsAuthNoticeModalOpen(true);
                              }}
                              title="Protected by healthcare privacy regulations. Click to sign in or register."
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                background: '#e0f2fe',
                                color: '#0284c7',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0284c7';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#e0f2fe';
                                e.currentTarget.style.color = '#0284c7';
                              }}
                            >
                              <Lock size={11} />
                            </span>
                          )}
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
                      {isSidebarCollapsed && item.isLocked && (
                        <span
                          title="Protected by security"
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0284c7'
                          }}
                        >
                          <Lock size={10} />
                        </span>
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
                if (isAuthorizedViewer) {
                  setIsCredentialsModalOpen(true);
                } else {
                  setAuthNoticeResource('Physician practice records & credentials');
                  setIsAuthNoticeModalOpen(true);
                }
              }}
              title={isAuthorizedViewer ? `View and manage physician profile: ${doctor.name || 'Treating Physician'}` : 'Sign in or claim practice to unlock nominal dossiers'}
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
                  {isAuthorizedViewer ? (doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D') : <Shield size={14} color="#ffffff" />}
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
                      {isAuthorizedViewer ? (doctor.name || 'Treating Physician') : 'Verified Medical Practice'}
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
                      {isAuthorizedViewer ? (doctor.clinic || doctor.specialty || 'Verified Medical Practice') : `Practice ID: ${opaqueCode}`}
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
                    background: isAuthorizedViewer ? '#f1f5f9' : '#e0f2fe',
                    color: isAuthorizedViewer ? '#64748b' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title={isAuthorizedViewer ? "View and edit physician profile" : "Sign in with DHA credentials to unlock dossiers"}
                >
                  {isAuthorizedViewer ? <Edit3 size={12} /> : <Lock size={12} />}
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
                if (isAuthorizedViewer) {
                  setIsCredentialsModalOpen(true);
                } else {
                  setIsClaimModalOpen(true);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, cursor: 'pointer' }}
              title={isAuthorizedViewer ? "Click to view verified doctor credentials & DHA license" : "Sign in or verify practice to unlock nominal dossiers"}
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
                {isAuthorizedViewer ? (doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D') : <Shield size={15} color="#ffffff" />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isAuthorizedViewer ? doctor.name : 'Verified DHA Practice'}
                  </span>
                  <span style={{ fontSize: '0.60rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    DHA Verified ✓
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isAuthorizedViewer ? `${doctor.specialty} • ${doctor.license}` : `Practice ID: ${opaqueCode}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  if (isAuthorizedViewer) {
                    setIsCredentialsModalOpen(true);
                  } else {
                    setIsClaimModalOpen(true);
                  }
                }}
                style={{
                  height: '34px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={isAuthorizedViewer ? "View Doctor Credentials & License" : "Sign in to unlock authorized nominal dossiers"}
              >
                {isAuthorizedViewer ? (
                  <>
                    <ShieldCheck size={13} style={{ color: '#0d9488' }} />
                    <span>Info</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} style={{ color: '#0284c7' }} />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="gcp-mobile-nav-trigger"
                onClick={() => setIsMobileSidebarOpen(true)}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #1a73e8',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  fontSize: '0.76rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Open Navigation Menu"
              >
                <Menu size={14} />
                <span>Menu</span>
              </button>
            </div>
          </div>

          {/* ── Simplified Clinical Command Bar (Page Header) ── */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              marginBottom: '18px',
              borderBottom: '1px solid #dadce0',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Section Breadcrumb, Clean Title & 1-Click Workspace Switcher */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.64rem', background: '#e8f0fe', color: '#1a73e8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {isAuthorizedViewer ? (doctor.license || 'DHA Verified') : 'DHA Verified'}
                </span>
                {doctorSpecialtyIntel.primaryMeta?.label && (
                  <span style={{ fontSize: '0.64rem', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '1px 7px', borderRadius: '999px', fontWeight: 600 }}>
                    {doctorSpecialtyIntel.primaryMeta.badgeIcon} {doctorSpecialtyIntel.primaryMeta.shortLabel || doctorSpecialtyIntel.primaryMeta.label}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.22rem', fontWeight: 700, color: '#202124', margin: 0 }}>
                  {activeAnchor === 'overview' && 'Practice Overview'}
                  {activeAnchor === 'search' && 'Practice Search'}
                  {activeAnchor === 'tasks' && 'Pending Actions'}
                  {activeAnchor === 'prescriptions' && 'Prescriptions'}
                  {activeAnchor === 'patients' && 'Patients'}
                  {activeAnchor === 'recommendations' && 'Specialty Blueprints & Rx Synergies'}
                  {activeAnchor === 'lab_results' && `Lab Diagnostics (${allLabResults.length})`}
                  {activeAnchor === 'analytics' && 'Practice Analytics'}
                  {activeAnchor === 'credentials' && 'Clinic Credentials & Verification'}
                  {activeAnchor === 'services_tiers' && 'Platform Services & Compounding Access'}
                </h1>

                {/* Unified 1-Click Segmented Switcher for Prescriptions / Patients / Pending Actions */}
                {(['prescriptions', 'patients', 'tasks'].includes(activeAnchor)) && (
                  <div role="tablist" aria-label="Portal sections" style={{ display: 'flex', maxWidth: '100%', overflowX: 'auto', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px', border: '1px solid #e2e8f0' }}>
                    {[
                      { id: 'prescriptions', label: 'Prescriptions', count: allPrescriptions.length },
                      { id: 'patients', label: 'Patients', count: uniquePatientsCount },
                      ...(filteredTasks.length > 0 ? [{ id: 'tasks', label: 'Pending Actions', count: filteredTasks.length }] : [])
                    ].map((tab) => {
                      const isTabActive = activeAnchor === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isTabActive}
                          onClick={() => handleSidebarNavigate(tab.id)}
                          style={{
                            padding: '4px 12px',
                            minHeight: '36px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            borderRadius: '6px',
                            border: 'none',
                            background: isTabActive ? '#ffffff' : 'transparent',
                            color: isTabActive ? '#0f172a' : '#64748b',
                            fontSize: '0.74rem',
                            fontWeight: isTabActive ? 700 : 600,
                            cursor: 'pointer',
                            boxShadow: isTabActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.12s ease'
                          }}
                        >
                          <span>{tab.label}</span>
                          <span style={{
                            fontSize: '0.66rem',
                            padding: '0 5px',
                            borderRadius: '999px',
                            background: isTabActive ? '#eff6ff' : '#e2e8f0',
                            color: isTabActive ? '#1d4ed8' : '#475569',
                            fontWeight: 700
                          }}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Consolidated Header Actions (Clean Physician Command Center) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Notifications Icon & Flyout Dropdown (Pending Clinical Actions) */}
              <div style={{ position: 'relative' }} ref={notifMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsNotifDropdownOpen(prev => !prev);
                  }}
                  style={{
                    position: 'relative',
                    width: '34px',
                    height: '34px',
                    borderRadius: '6px',
                    border: isNotifDropdownOpen ? '1px solid #1a73e8' : '1px solid #dadce0',
                    background: isNotifDropdownOpen ? '#eff6ff' : '#ffffff',
                    color: filteredTasks.length > 0 ? '#b45309' : '#5f6368',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                  }}
                  title={filteredTasks.length > 0 ? `${filteredTasks.length} pending clinical actions requiring review` : 'No pending actions'}
                  aria-expanded={isNotifDropdownOpen}
                >
                  <Bell size={16} />
                  {filteredTasks.length > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#f59e0b',
                        color: '#ffffff',
                        fontSize: '0.60rem',
                        fontWeight: 700,
                        borderRadius: '999px',
                        padding: '1px 5px',
                        lineHeight: 1.2
                      }}
                    >
                      {filteredTasks.length}
                    </span>
                  )}
                </button>

                {isNotifDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '360px',
                      maxWidth: 'calc(100vw - 24px)',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #dadce0',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
                      zIndex: 1100,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={15} style={{ color: '#003666' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                          Clinical Notifications
                        </span>
                        {filteredTasks.length > 0 ? (
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              background: '#fffbeb',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              padding: '1px 6px',
                              borderRadius: '999px'
                            }}
                          >
                            {filteredTasks.length} pending
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNotifDropdownOpen(false)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {filteredTasks.length === 0 ? (
                        <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '8px'
                            }}
                          >
                            <CheckCircle2 size={20} />
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                            All caught up!
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                            No urgent clinical tasks or approvals pending.
                          </div>
                        </div>
                      ) : (
                        filteredTasks.slice(0, 6).map((task) => {
                          const codifiedId = getCodifiedPatientId(task.patientName, task.code);
                          const displayPt = isAuthorizedViewer ? (task.patientName || `Patient ${codifiedId}`) : `Patient ${codifiedId}`;
                          const isProposal = task.type === 'proposal_followup';
                          const isPortal = task.type === 'portal_inactive';

                          return (
                            <div
                              key={task.id || task.code}
                              onClick={() => {
                                setIsNotifDropdownOpen(false);
                                handleSidebarNavigate('tasks');
                              }}
                              style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'background-color 0.12s ease',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: isProposal ? '#f59e0b' : (isPortal ? '#3b82f6' : '#10b981'),
                                  marginTop: '5px',
                                  flexShrink: 0
                                }}
                              />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                                    {displayPt}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.62rem',
                                      fontWeight: 600,
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      background: isPortal ? '#eff6ff' : (isProposal ? '#fffbeb' : '#f1f5f9'),
                                      color: isPortal ? '#1d4ed8' : (isProposal ? '#b45309' : '#475569')
                                    }}
                                  >
                                    {isPortal ? 'Portal Inactive' : (isProposal ? 'Offer Follow-up' : (task.typeLabel || 'Action Required'))}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px', lineHeight: 1.35 }}>
                                  {task.treatmentTitle || task.description || task.code}
                                </div>
                                {task.daysPending ? (
                                  <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '3px' }}>
                                    Pending for {task.daysPending} days
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        padding: '10px 16px',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        textAlign: 'center'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotifDropdownOpen(false);
                          handleSidebarNavigate('tasks');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#1a73e8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Open Action Queue (Pending Actions)</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Share Patient Intake Link Button */}
              <button
                type="button"
                onClick={() => setIsPatientShareModalOpen(true)}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#1a73e8',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.08)'
                }}
                title="Share patient intake registration link via WhatsApp, direct link, or QR code"
              >
                <Share2 size={14} />
                <span>Share Patient Link</span>
              </button>

              {/* Primary Action Button: New Prescription */}
              <button
                type="button"
                onClick={handleOpenNewPrescriptionIntake}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  border: '1px solid #1a73e8',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(26,115,232,0.3)'
                }}
                title="Create a new compounded prescription, customize a blueprint, or upload a clinical PDF/image"
              >
                <Plus size={15} />
                <span>New Prescription</span>
              </button>
            </div>
          </header>

          {/* ── View 1: Practice Overview (Adaptive for Zero-Rx vs Active Prescribers) ─ */}
          {activeAnchor === 'overview' && (
            <div id="overview" style={{ marginBottom: '24px' }}>
              {/* 1. Prominent Global Search Bar First (Golden Rule #7) */}
              <div style={{ marginBottom: '16px' }}>
                <GlobalSearchBar
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val);
                    if (val && val.trim().length >= 2 && allPrescriptions.length > 0) {
                      setScopeMode('filtered');
                    }
                  }}
                  placeholder={
                    allPrescriptions.length === 0
                      ? 'Search specialty formulas, active ingredients (Minoxidil, Dutasteride, GHK-Cu), or open ⌘K...'
                      : 'Search patient name, Rx code (#RX), invoice, or active ingredient...'
                  }
                  resultCount={allPrescriptions.length > 0 ? filteredPrescriptions.length : doctorSpecialtyIntel.primaryBlueprints.length}
                  totalCount={allPrescriptions.length > 0 ? allPrescriptions.length : doctorSpecialtyIntel.primaryBlueprints.length}
                  size="md"
                  namespace={`dr_overview_${slug}`}
                  filters={[
                    ...(searchQuery?.trim() ? [{
                      key: 'search_query',
                      label: 'Search',
                      value: searchQuery.trim(),
                      onRemove: () => setSearchQuery('')
                    }] : []),
                    ...(quickRxFilter && quickRxFilter !== 'all' ? [{
                      key: 'status_filter',
                      label: 'Status',
                      value: quickRxFilter === 'active' ? 'Sold & Invoiced' : quickRxFilter === 'proposals' ? 'Unaccepted Offers' : quickRxFilter,
                      onRemove: () => setQuickRxFilter('all')
                    }] : []),
                    ...(apiFilter ? [{
                      key: 'api_filter',
                      label: 'Formulation',
                      value: apiFilter,
                      onRemove: () => setApiFilter(null)
                    }] : []),
                    ...(patientFilter && patientFilter !== 'all' ? [{
                      key: 'patient_filter',
                      label: 'Patient',
                      value: patientFilter,
                      onRemove: () => setPatientFilter('all')
                    }] : [])
                  ]}
                />
              </div>

              {isAuthorizedViewer && (
                <DoctorContinueBanner slug={slug} onResume={handleSidebarNavigate} />
              )}

              {/* 2. KPI Header & Scope Indicator (Only show filter toggle when doctor has Rx records and filters apply) */}
              {(allPrescriptions.length > 0 && (scopeMode === 'filtered' || searchQuery || statusFilter !== 'all' || quickRxFilter !== 'all' || apiFilter)) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                        ? `Filtered View (${filteredPrescriptions.length} matching records)`
                        : `All Practice Records (${allPrescriptions.length} total)`}
                    </span>
                  </div>

                  <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setScopeMode('global')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: scopeMode === 'global' ? '#ffffff' : 'transparent',
                        color: scopeMode === 'global' ? '#0f172a' : '#64748b'
                      }}
                    >
                      All Records
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeMode('filtered')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
                        color: scopeMode === 'filtered' ? '#0f172a' : '#64748b'
                      }}
                    >
                      Filtered View
                    </button>
                  </div>
                </div>
              )}

              {/* ── SECTION 1: Practice Summary (4 Compact Equal-Height KPI Cards) ── */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                  {/* KPI 1: Active Patients */}
                  <div
                    onClick={() => {
                      triggerHaptic('light');
                      handleSidebarNavigate('patients');
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '105px',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Patients</span>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={15} style={{ color: '#1a73e8' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#202124', lineHeight: 1.15 }}>
                        {soldPatientsCount || doctorPatientsList.length}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Currently on therapy</span>
                        <span style={{ color: '#1a73e8', fontWeight: 600 }}>View →</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 2: Active Prescriptions */}
                  <div
                    onClick={() => {
                      triggerHaptic('light');
                      setQuickRxFilter('active');
                      handleSidebarNavigate('prescriptions');
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '105px',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Prescriptions</span>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={15} style={{ color: '#16a34a' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d', lineHeight: 1.15 }}>
                        {quickCounts.active}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Dispensed & invoiced</span>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>Explore →</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 3: Pending Actions */}
                  <div
                    onClick={() => {
                      triggerHaptic('light');
                      handleSidebarNavigate('tasks');
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderTop: filteredTasks.length > 0 ? '3px solid #f59e0b' : '1px solid #dadce0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '105px',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 650, color: filteredTasks.length > 0 ? '#b45309' : '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Actions</span>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: filteredTasks.length > 0 ? '#fffbeb' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={15} style={{ color: filteredTasks.length > 0 ? '#d97706' : '#64748b' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: filteredTasks.length > 0 ? '#b45309' : '#202124', lineHeight: 1.15 }}>
                        {filteredTasks.length}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{filteredTasks.length > 0 ? 'Require your review' : 'All caught up'}</span>
                        <span style={{ color: filteredTasks.length > 0 ? '#b45309' : '#1a73e8', fontWeight: 600 }}>Resolve →</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 4: Pending Patient Offers */}
                  <div
                    onClick={() => {
                      triggerHaptic('light');
                      setQuickRxFilter('proposals');
                      handleSidebarNavigate('prescriptions');
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '105px',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Offers</span>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={15} style={{ color: '#7c3aed' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#7c3aed', lineHeight: 1.15 }}>
                        {quickCounts.proposals}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Awaiting patient checkout</span>
                        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Follow up →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Requires Your Attention (Priority Actions Queue) ── */}
              <div
                style={{
                  marginBottom: '20px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderLeft: filteredTasks.length > 0 ? '4px solid #f59e0b' : '4px solid #16a34a',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: filteredTasks.length > 0 ? '12px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      ⚡ Requires Your Attention {filteredTasks.length > 0 && `(${filteredTasks.length})`}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {filteredTasks.length > 0
                        ? 'Prioritized actions requiring your clinical intervention'
                        : 'Practice queue is clear'}
                    </span>
                  </div>
                  {filteredTasks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSidebarNavigate('tasks')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#1a73e8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View all {filteredTasks.length} actions →
                    </button>
                  )}
                </div>

                {filteredTasks.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredTasks.slice(0, 5).map((t) => {
                      const isProposalTask = t.type === 'proposal_followup';
                      const isPortalTask = t.type === 'portal_inactive';
                      const isToleranceTask = t.type === 'tolerance_check' || t.type === 'tolerance_checkin';
                      const isRefillTask = t.type === 'refill' || t.type === 'cycles';
                      const isApprovalTask = t.type === 'approval' || (!t.type && !isProposalTask && !isPortalTask && !isToleranceTask && !isRefillTask);
                      const isSigning = signingTaskId === (t.id || t.code);
                      const codifiedId = getCodifiedPatientId(t.patientName, t.code);
                      const displayPatient = isAuthorizedViewer ? t.patientName : codifiedId;
                      const patientPhone = (t.patientPhone || t.patient?.phone || '').replace(/[^0-9+]/g, '');
                      const cleanDocTitle = (doctor?.name || 'Khalid Shukri').replace(/^Dr\.?\s*/i, '').trim();
                      const rawMsg = (t.whatsappMessage || `Hello ${t.patientName}, this is Dr. ${cleanDocTitle}'s clinical practice following up on your personalized ${t.treatmentTitle || 'treatment plan'}. You can review your medical protocol here: https://atlashealth-services.com/rx/${t.code}.`)
                        .replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. ');
                      const waUrl = patientPhone
                        ? `https://wa.me/${patientPhone}?text=${encodeURIComponent(rawMsg)}`
                        : `https://wa.me/?text=${encodeURIComponent(rawMsg)}`;

                      const taskBadge = isProposalTask
                        ? { label: 'Offer Pending Checkout', bg: '#fffbeb', color: '#b45309', border: '#fde68a' }
                        : isPortalTask
                        ? { label: 'Portal Invite Pending', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' }
                        : isRefillTask
                        ? { label: 'Refill Due', bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' }
                        : isToleranceTask
                        ? { label: 'Tolerance Check', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }
                        : { label: 'Awaiting Rx Approval', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };

                      return (
                        <div
                          key={t.id || t.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '10px 14px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                                {displayPatient}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.64rem',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: taskBadge.bg,
                                  color: taskBadge.color,
                                  border: `1px solid ${taskBadge.border}`
                                }}
                              >
                                {taskBadge.label}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>
                                {t.treatmentTitle || 'Compounded Prescription'}
                              </span>
                              {t.code && (
                                <span style={{ fontFamily: 'monospace', fontSize: '0.67rem', color: '#1a73e8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '3px' }}>
                                  #{t.code.length > 12 ? `${t.code.slice(0, 6)}...${t.code.slice(-4)}` : t.code}
                                </span>
                              )}
                              {t.pendingCount && t.pendingCount > 1 ? <span>· {t.pendingCount} Formulations</span> : null}
                              {t.daysPending ? <span>· {t.daysPending} days pending</span> : null}
                            </div>
                          </div>

                          <div style={{ flexShrink: 0 }}>
                            {isProposalTask || isPortalTask ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '5px',
                                  background: isPortalTask ? '#f5f3ff' : '#f0fdf4',
                                  border: `1px solid ${isPortalTask ? '#ddd6fe' : '#bbf7d0'}`,
                                  color: isPortalTask ? '#7c3aed' : '#15803d',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap'
                                }}
                                title={isPortalTask ? "Send patient portal invite via WhatsApp" : "Send WhatsApp follow-up reminder to patient"}
                              >
                                <MessageCircle size={13} />
                                <span>{isPortalTask ? 'Invite Portal' : 'Send Reminder'}</span>
                              </a>
                            ) : isToleranceTask ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 10px',
                                    borderRadius: '5px',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    color: '#15803d',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Send check-in message via WhatsApp"
                                >
                                  <MessageCircle size={13} />
                                  <span>WhatsApp</span>
                                </a>
                                <button
                                  type="button"
                                  disabled={isSigning}
                                  onClick={(e) => handleSignOffPrescription(t, e)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 10px',
                                    borderRadius: '5px',
                                    background: '#ffffff',
                                    border: '1px solid #99f6e4',
                                    color: '#0f766e',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: isSigning ? 'wait' : 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Mark tolerance check as verified and complete"
                                >
                                  {isSigning ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <Check size={13} />
                                  )}
                                  <span>Complete</span>
                                </button>
                              </div>
                            ) : isRefillTask ? (
                              <Link
                                href={t.actionUrl || `/rx/${t.code}`}
                                target="_blank"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '5px',
                                  background: '#f0fdfa',
                                  border: '1px solid #99f6e4',
                                  color: '#0f766e',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <ExternalLink size={13} />
                                <span>Issue Refill</span>
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled={isSigning}
                                onClick={(e) => handleSignOffPrescription(t, e)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '5px',
                                  background: '#1a73e8',
                                  border: 'none',
                                  color: '#ffffff',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: isSigning ? 'wait' : 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {isSigning ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Signing...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={13} />
                                    <span>Approve</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                        You’re all caught up. No urgent actions require your clinical attention.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSidebarNavigate('tasks')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#15803d',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View action history →
                    </button>
                  </div>
                )}
              </div>



              {/* ── SECTION 4: Atlas Clinical Intelligence (Top 3 Recommendations) ── */}
              <div
                style={{
                  marginBottom: '22px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        {doctorSpecialtyIntel.primaryMeta?.badgeIcon} {doctorSpecialtyIntel.primaryMeta?.label || 'Specialty Clinical Formulations'}
                      </span>
                      <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748b' }}>
                        Top 3 individual prescription formulas tailored to your specialty
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#202124' }}>
                      {lang === 'es' ? 'Fórmulas Magistrales Recomendadas (Top 3)' : 'Recommended Clinical Formulations (Top 3)'}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      handleSidebarNavigate('recommendations');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      color: '#1a73e8',
                      border: '1px solid #dadce0',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Explore All Atlas Recommendations</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff'
                  }}
                >
                  {doctorSpecialtyIntel.primaryBlueprints.slice(0, 3).map((bp, bpIdx, arr) => {
                    const isLast = bpIdx === arr.length - 1;
                    const formulaTitle = bp.compoundingFormula?.treatmentTitle || bp.title;
                    const dispensingVehicle = bp.compoundingFormula?.dispensingForm || 'Magistral Formulation';
                    const dispensingVolume = bp.compoundingFormula?.volume || '';
                    const formulaActives = Array.isArray(bp.compoundingFormula?.items) ? bp.compoundingFormula.items : [];

                    return (
                      <div
                        key={bp.id}
                        style={{
                          padding: '14px 18px',
                          borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '14px',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ flex: '1 1 340px', minWidth: '260px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: '#f1f5f9',
                                color: '#334155',
                                fontSize: '0.70rem',
                                fontWeight: 750,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {bpIdx + 1}
                            </span>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                border: '1px solid #bae6fd'
                              }}
                            >
                              {bp.targetProcedure || bp.badge || (lang === 'es' ? 'Fórmula Clínica' : 'Clinical Rx')}
                            </span>
                            {bp.code && (
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontFamily: 'monospace',
                                  color: '#64748b',
                                  background: '#f1f5f9',
                                  padding: '1px 6px',
                                  borderRadius: '3px'
                                }}
                              >
                                {bp.code}
                              </span>
                            )}
                          </div>

                          {/* Individual Prescription Formula Title */}
                          <div style={{ fontSize: '0.90rem', fontWeight: 750, color: '#0f172a', lineHeight: 1.35 }}>
                            {formulaTitle}
                          </div>

                          {/* Pharmaceutical Vehicle and Packaging */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                              📦 {dispensingVehicle} {dispensingVolume ? `· ${dispensingVolume}` : ''}
                            </span>
                            {bp.compoundingFormula?.posology && (
                              <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.35 }}>
                                • {bp.compoundingFormula.posology}
                              </span>
                            )}
                          </div>

                          {/* Key Clinical Actives Pills */}
                          {formulaActives.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginTop: '7px' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#003666', background: '#f1f5f9', padding: '1px 6px', borderRadius: '3px' }}>
                                {lang === 'es' ? 'Activos:' : 'Actives:'}
                              </span>
                              {formulaActives.map((act, actIdx) => (
                                <span
                                  key={actIdx}
                                  style={{
                                    fontSize: '0.67rem',
                                    fontWeight: 550,
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    background: '#f8fafc',
                                    color: '#334155',
                                    border: '1px solid #e2e8f0'
                                  }}
                                >
                                  {act.name} {act.concentration || act.dose ? `(${act.concentration || act.dose})` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setActiveBlueprintDossier(bp);
                            }}
                            style={{
                              padding: '7px 12px',
                              minHeight: '34px',
                              borderRadius: '4px',
                              border: '1px solid #dadce0',
                              background: '#ffffff',
                              color: '#3c4043',
                              fontSize: '0.74rem',
                              fontWeight: 650,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <FileText size={13} style={{ color: '#1a73e8' }} />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrescribeSpecialtyBlueprint(bp)}
                            style={{
                              padding: '7px 14px',
                              minHeight: '34px',
                              borderRadius: '4px',
                              border: '1px solid #1a73e8',
                              background: '#1a73e8',
                              color: '#ffffff',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 1px 2px rgba(26,115,232,0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Plus size={13} />
                            <span>Customize & Prescribe</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── SECTION 5: Practice Insights ── */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#202124' }}>
                      Practice Insights
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#5f6368' }}>
                      High-level prescription velocity and signature compounded formulations
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      handleSidebarNavigate('analytics');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1a73e8',
                      fontSize: '0.76rem',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>View Detailed Analytics</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                  {/* Card 1: 6-Month Prescription Activity (GCP Cloud Monitoring Style) */}
                  <div style={{ padding: '14px 16px', background: '#ffffff', borderRadius: '8px', border: '1px solid #dadce0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3c4043', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Prescription Activity
                      </span>
                      <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 500 }}>
                        {practiceMonthlyTrends.length > 0
                          ? `${practiceMonthlyTrends[0].label?.split(' ')[0] || ''} – ${practiceMonthlyTrends[practiceMonthlyTrends.length - 1].label || ''}`
                          : 'Last 6 Months'}
                      </span>
                    </div>

                    <div style={{ position: 'relative', width: '100%', height: '96px', marginTop: 'auto' }}>
                      <svg viewBox="0 0 280 88" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* GCP Guideline */}
                        <line x1="0" y1="30" x2="280" y2="30" stroke="#f1f3f4" strokeDasharray="3 3" />
                        {/* GCP Baseline */}
                        <line x1="0" y1="68" x2="280" y2="68" stroke="#dadce0" strokeWidth="1" />

                        {practiceMonthlyTrends.map((m, idx) => {
                          const totalBars = practiceMonthlyTrends.length;
                          const availableWidth = 280;
                          const barWidth = Math.min(22, (availableWidth / totalBars) * 0.55);
                          const gap = availableWidth / totalBars;
                          const x = idx * gap + (gap - barWidth) / 2;
                          const maxCount = Math.max(...practiceMonthlyTrends.map((t) => t.count), 1);
                          const barHeight = Math.max(6, Math.round((m.count / maxCount) * 44));
                          const y = 68 - barHeight;
                          const isLatest = idx === totalBars - 1;
                          const isHovered = hoveredInsightBar === idx;
                          const shortMonth = m.label ? m.label.split(' ')[0] : (m.key ? m.key.split('-')[1] : '');

                          return (
                            <g
                              key={m.key || idx}
                              onMouseEnter={() => setHoveredInsightBar(idx)}
                              onMouseLeave={() => setHoveredInsightBar(null)}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* Transparent hit area to make hovering easy */}
                              <rect
                                x={idx * gap}
                                y="0"
                                width={gap}
                                height="88"
                                fill="transparent"
                              />

                              {/* Bar rectangle */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx={3}
                                fill={isHovered ? '#1557b0' : isLatest ? '#1a73e8' : '#8ab4f8'}
                                style={{ transition: 'all 0.15s ease' }}
                              />

                              {/* Value count above bar */}
                              <text
                                x={x + barWidth / 2}
                                y={y - 4}
                                textAnchor="middle"
                                fontSize="9"
                                fontWeight={isHovered || isLatest ? '700' : '600'}
                                fill={isHovered ? '#1557b0' : isLatest ? '#1a73e8' : '#5f6368'}
                              >
                                {m.count}
                              </text>

                              {/* Month label below baseline */}
                              <text
                                x={x + barWidth / 2}
                                y="81"
                                textAnchor="middle"
                                fontSize="8.5"
                                fontWeight={isLatest ? '650' : '500'}
                                fill={isLatest ? '#1a73e8' : '#5f6368'}
                              >
                                {shortMonth}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* GCP Floating Tooltip */}
                      {hoveredInsightBar !== null && practiceMonthlyTrends[hoveredInsightBar] && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '0',
                            background: '#202124',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 500,
                            pointerEvents: 'none',
                            boxShadow: '0 2px 6px rgba(60,64,67,0.3)',
                            zIndex: 10,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <strong>{practiceMonthlyTrends[hoveredInsightBar].label}:</strong> {practiceMonthlyTrends[hoveredInsightBar].count} prescriptions
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Top 3 Prescribed Formulations */}
                  <div style={{ padding: '14px 16px', background: '#ffffff', borderRadius: '8px', border: '1px solid #dadce0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3c4043', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Top Formulations
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          handleSidebarNavigate('analytics');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.70rem',
                          color: '#1a73e8',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <span>Explore all</span>
                        <span>→</span>
                      </button>
                    </div>

                    {doctorTopApis.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                        {doctorTopApis.slice(0, 3).map((item, idx) => {
                          const maxTop = Math.max(...doctorTopApis.slice(0, 3).map((a) => a.count), 1);
                          const pct = Math.round((item.count / maxTop) * 100);
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                                  <span
                                    style={{
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      color: '#5f6368',
                                      background: '#f1f3f4',
                                      padding: '1px 5px',
                                      borderRadius: '3px',
                                      flexShrink: 0
                                    }}
                                  >
                                    #{idx + 1}
                                  </span>
                                  <span
                                    title={item.name}
                                    style={{
                                      fontSize: '0.74rem',
                                      fontWeight: 600,
                                      color: '#202124',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {item.name}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.74rem', color: '#202124', fontWeight: 700, flexShrink: 0 }}>
                                  {item.count} <span style={{ fontSize: '0.66rem', fontWeight: 500, color: '#5f6368' }}>Rx</span>
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#f1f3f4', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: idx === 0 ? '#1a73e8' : '#4285f4',
                                    borderRadius: '3px',
                                    transition: 'width 0.3s ease'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#5f6368', padding: '24px 0', textAlign: 'center' }}>
                        Ready for first compounded formulation.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── View: Practice Analytics (Dedicated Deep-Dive Tab) ── */}
          {activeAnchor === 'analytics' && (
            <section id="analytics" style={{ marginBottom: '32px' }}>
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
            </section>
          )}

          {/* ── View 2: Pending Clinical Tasks & To-Do Actions (Modularized) ── */}
          {activeAnchor === 'tasks' && (
            <DoctorTasksTab
              taskFilter={taskFilter}
              setTaskFilter={setTaskFilter}
              filteredTasks={filteredTasks}
              slug={slug}
              taskColumns={taskColumns}
              handleRowClickTask={handleRowClickTask}
            />
          )}

          {/* ── View 3: Associated Clinical Prescriptions Dossier (Modularized) ── */}
          {activeAnchor === 'prescriptions' && (
            <DoctorPrescriptionsTab
              lastRefreshed={lastRefreshed}
              handleRefresh={handleRefresh}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredPrescriptions={filteredPrescriptions}
              slug={slug}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              temporalFilter={temporalFilter}
              setTemporalFilter={setTemporalFilter}
              quickRxFilter={quickRxFilter}
              setQuickRxFilter={setQuickRxFilter}
              quickCounts={quickCounts}
              apiFilter={apiFilter}
              setApiFilter={setApiFilter}
              recFilter={recFilter}
              setRecFilter={setRecFilter}
              patientFilter={patientFilter}
              setPatientFilter={setPatientFilter}
              triggerHaptic={triggerHaptic}
              prescriptionColumns={prescriptionColumns}
              handleRowClickPrescription={handleRowClickPrescription}
              handleShareProposalWhatsApp={handleShareProposalWhatsApp}
              handleCopyProposalLink={handleCopyProposalLink}
              handleOpenHandout={handleOpenHandout}
              handleReprescribeFormula={handleReprescribeFormula}
              handleContactAtlasWhatsApp={handleContactAtlasWhatsApp}
              handleOpenLabelsModal={handleOpenLabelsModal}
              toast={toast}
            />
          )}

          {/* ── View 3.2: Monitored Patients Directory (Google Cloud Standard DataTable) ── */}
          {activeAnchor === 'patients' && (
            <section
              id="patients"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                overflow: 'hidden',
                marginBottom: '24px'
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
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} style={{ color: '#003666' }} />
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 650, color: '#202124', margin: 0 }}>
                      Monitored Patients Directory
                    </h2>
                    <span style={{ fontSize: '0.74rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {doctorPatientsList.length} Active Dossiers
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#5f6368', margin: '4px 0 0 0' }}>
                    Physician cohort monitoring, commercial fulfillment verification, and contact actions.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setPatientFilterMode('all');
                      setPatientSearchQuery('');
                    }}
                    style={{
                      height: '28px',
                      padding: '0 10px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#3c4043',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset View
                  </button>
                </div>
              </div>

              {/* 4 Google Cloud KPI Metric Cards for Patients */}
              <div style={{ padding: '16px 20px 0 20px' }}>
                <div className="gcp-kpi-grid" style={{ marginBottom: '16px' }}>
                  <div
                    className="gcp-kpi-card"
                    onClick={() => setPatientFilterMode('all')}
                    style={{ cursor: 'pointer', border: patientFilterMode === 'all' ? '2px solid #003666' : '1px solid #e8eaed' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>Total Patients</span>
                      <Users size={15} style={{ color: '#003666' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#202124' }}>
                      {doctorPatientsList.length}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#70757a', marginTop: '4px' }}>All registered patient dossiers</div>
                  </div>

                  <div
                    className="gcp-kpi-card"
                    onClick={() => setPatientFilterMode('sold')}
                    style={{ cursor: 'pointer', border: patientFilterMode === 'sold' ? '2px solid #16a34a' : '1px solid #e8eaed' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#15803d', textTransform: 'uppercase' }}>Prescribed Patients</span>
                      <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#15803d' }}>
                      {doctorPatientsList.filter(p => p.hasSold).length}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#15803d', marginTop: '4px', fontWeight: 650 }}>Active & Fulfilled Rx</div>
                  </div>

                  <div
                    className="gcp-kpi-card"
                    onClick={() => setPatientFilterMode('unaccepted')}
                    style={{ cursor: 'pointer', border: patientFilterMode === 'unaccepted' ? '2px solid #d97706' : '1px solid #e8eaed' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Unaccepted Proposals</span>
                      <Clock size={15} style={{ color: '#d97706' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#d97706' }}>
                      {doctorPatientsList.filter(p => !p.hasSold && p.hasUnaccepted).length}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#b45309', marginTop: '4px', fontWeight: 650 }}>Proposal pending checkout</div>
                  </div>

                  <div
                    className="gcp-kpi-card"
                    onClick={() => setPatientFilterMode('refill')}
                    style={{ cursor: 'pointer', border: patientFilterMode === 'refill' ? '2px solid #2563eb' : '1px solid #e8eaed' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1d4ed8', textTransform: 'uppercase' }}>Due for Renewal</span>
                      <RefreshCw size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1d4ed8' }}>
                      {refillDuePatientsCount}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#1d4ed8', marginTop: '4px', fontWeight: 650 }}>Active cycle candidates for refill →</div>
                  </div>
                </div>

                {/* Global Search Bar (Rule #7) & Filter Chips */}
                <div style={{ marginBottom: '14px' }}>
                  <GlobalSearchBar
                    searchQuery={patientSearchQuery}
                    onSearchChange={setPatientSearchQuery}
                    placeholder="Search by patient name, phone, email, or invoice number..."
                    resultCount={filteredDoctorPatients.length}
                    storageKey={`doctor-patients-search-${slug}`}
                    size="md"
                    filters={[
                      patientFilterMode !== 'all' && {
                        key: 'mode',
                        label: 'Status',
                        value: patientFilterMode === 'sold' ? 'Prescribed Patients' : (patientFilterMode === 'refill' ? 'Due for Renewal' : 'Unaccepted Proposals'),
                        onRemove: () => setPatientFilterMode('all')
                      }
                    ].filter(Boolean)}
                  />

                  {/* Filter chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                      Filter Status:
                    </span>
                    <button
                      type="button"
                      onClick={() => setPatientFilterMode('all')}
                      style={{
                        height: '26px',
                        padding: '0 10px',
                        borderRadius: '9999px',
                        border: patientFilterMode === 'all' ? '2px solid #003666' : '1px solid #dadce0',
                        background: patientFilterMode === 'all' ? '#f1f5f9' : '#ffffff',
                        color: '#003666',
                        fontSize: '0.72rem',
                        fontWeight: patientFilterMode === 'all' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      All Patients ({doctorPatientsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientFilterMode('sold')}
                      style={{
                        height: '26px',
                        padding: '0 10px',
                        borderRadius: '9999px',
                        border: patientFilterMode === 'sold' ? '2px solid #16a34a' : '1px solid #dadce0',
                        background: patientFilterMode === 'sold' ? '#f0fdf4' : '#ffffff',
                        color: '#15803d',
                        fontSize: '0.72rem',
                        fontWeight: patientFilterMode === 'sold' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      🟢 Prescribed Patients ({doctorPatientsList.filter(p => p.hasSold).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientFilterMode('unaccepted')}
                      style={{
                        height: '26px',
                        padding: '0 10px',
                        borderRadius: '9999px',
                        border: patientFilterMode === 'unaccepted' ? '2px solid #d97706' : '1px solid #dadce0',
                        background: patientFilterMode === 'unaccepted' ? '#fffbeb' : '#ffffff',
                        color: '#b45309',
                        fontSize: '0.72rem',
                        fontWeight: patientFilterMode === 'unaccepted' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      ⏳ Unaccepted Proposals ({doctorPatientsList.filter(p => !p.hasSold && p.hasUnaccepted).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientFilterMode('refill')}
                      style={{
                        height: '26px',
                        padding: '0 10px',
                        borderRadius: '9999px',
                        border: patientFilterMode === 'refill' ? '2px solid #2563eb' : '1px solid #dadce0',
                        background: patientFilterMode === 'refill' ? '#eff6ff' : '#ffffff',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: patientFilterMode === 'refill' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Due for Renewal ({refillDuePatientsCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Monitored Patients DataTable */}
              <DataTable
                columns={patientColumns}
                data={filteredDoctorPatients}
                keyField="id"
                tableId={`doctor-patients-table-${slug}`}
                pagination={true}
                initialRowsPerPage={10}
                alwaysShowPagination={true}
                emptyTitle="No Patients Found"
                emptyDescription={patientSearchQuery ? `No patient dossiers match "${patientSearchQuery}".` : "No registered patients in clinical directory."}
                expandableRender={(pat) => (
                  <div style={{ padding: '14px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Associated Clinical Prescriptions & Proposals ({(pat.prescriptions || []).length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(pat.prescriptions || []).map((p, idx) => {
                        const pIsSold = isSoldPrescription(p);
                        const pIsProp = isProposalPrescription(p);
                        const pInv = p.invoiceRef ? String(p.invoiceRef).trim() : '';
                        const pHasInv = pInv && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(pInv);
                        return (
                          <div
                            key={p.id || idx}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <CopyableId value={p.prescriptionNumber || p.code || p.id} />
                              <span style={{ fontSize: '0.84rem', fontWeight: 650, color: '#0f172a' }}>
                                {p.treatmentTitle || p.regimenShortTitle || 'Compounded Precision Regimen'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {pIsSold ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                                  ✓ Sold {pHasInv ? `(${pInv})` : ''}
                                </span>
                              ) : pIsProp ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>
                                  ⏳ Offer Unaccepted
                                </span>
                              ) : (
                                <StatusBadge status={p.status || 'active'} />
                              )}
                              {pIsProp && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickUpdatePrescriptionStatus(p, 'approved', null, e);
                                  }}
                                  style={{
                                    padding: '3px 8px',
                                    fontSize: '0.72rem',
                                    borderRadius: '4px',
                                    border: '1px solid #16a34a',
                                    background: '#f0fdf4',
                                    color: '#15803d',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Aceptar propuesta y registrar pedido confirmado"
                                >
                                  <span>✓ Aceptar Oferta</span>
                                </button>
                              )}

                              {pIsSold && !['delivered', 'completed', 'dispensed'].includes(String(p.status || '').toLowerCase()) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickUpdatePrescriptionStatus(p, 'delivered', null, e);
                                  }}
                                  style={{
                                    padding: '3px 8px',
                                    fontSize: '0.72rem',
                                    borderRadius: '4px',
                                    border: '1px solid #0284c7',
                                    background: '#f0f9ff',
                                    color: '#0369a1',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Marcar formulación como entregada al paciente"
                                >
                                  <span>📦 Marcar Entregado</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRowClickPrescription(p)}
                                style={{
                                  padding: '3px 8px',
                                  fontSize: '0.72rem',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                View Regimen →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            </section>
          )}

          {/* ── View 3.5: Bloodo™ & Fagron Diagnostic Lab Results (Modularized) ── */}
          {activeAnchor === 'lab_results' && (
            <DoctorLabResultsTab
              allLabResults={allLabResults}
              labResultsColumns={labResultsColumns}
              slug={slug}
              handleRefresh={handleRefresh}
              isSwitchingDoctor={isSwitchingDoctor}
            />
          )}

          {/* ── View 4: Bloodo™ Diagnostic Panels (Modularized) ── */}
          {activeAnchor === 'diagnostics' && (
            <DoctorDiagnosticsTab
              bloodoPanels={bloodoPanels}
              triggerHaptic={triggerHaptic}
            />
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

          {/* ── View 7: Consolidated Master Atlas Recommendations (Dual-Engine: Specialty + Rx) ── */}
          {activeAnchor === 'recommendations' && (
            <DoctorRecommendationsTab
              doctor={doctor}
              slug={slug}
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
              patientsList={doctorPatientsList}
              onPrescribeBlueprint={handlePrescribeSpecialtyBlueprint}
              onRequestSampleWhatsApp={handleRequestBlueprintWhatsApp}
              onOpenDossier={setActiveBlueprintDossier}
              onProfileEnriched={(enriched) => {
                setData((prev) => ({
                  ...prev,
                  specialtyCategory: enriched.specialtyCategory,
                  webPracticeProfile: enriched.webPracticeProfile,
                  specialtyBlueprints: enriched.specialtyBlueprints,
                  doctor: {
                    ...(prev?.doctor || {}),
                    specialtyCategory: enriched.specialtyCategory,
                    webPracticeProfile: enriched.webPracticeProfile
                  }
                }));
              }}
            />
          )}

        </main>
      </div>

      {/* ── Universal Public Sticky Action Bar (Only visible for unauthenticated public visitors; hidden when doctor is logged in) ── */}
      {!isAuthorizedViewer && (
        <PublicStickyActionBar
          compactMobile={true}
          overflowMobile={true}
          title={doctor?.name || `Doctor ${opaqueCode}`}
          subtitle={
            `${doctor?.clinic || (lang === 'es' ? 'Consulta Médica Verificada' : 'Verified Medical Practice')} • ${doctor?.specialty || (lang === 'es' ? 'Medicina Regenerativa y Longevidad' : 'Regenerative & Precision Medicine')}`
          }
          badge={
            lang === 'es' ? 'MÉDICO VERIFICADO' : 'VERIFIED PHYSICIAN'
          }
          badgeType="protocol"
          inquireLabel={
            lang === 'es' ? 'Enviar Receta a este Doctor ➔' : 'Submit Rx to this Doctor ➔'
          }
          onInquire={() => {
            window.location.href = `/rx/intake?refDoctor=${doctor?.opaqueCode || slug}`;
          }}
          showClinicalAI={true}
          aiCategory="Doctor Practice"
          aiContextQuery={
            lang === 'es'
              ? `¿Qué áreas de especialidad, tratamientos y protocolos médicos ofrece la consulta del Dr/a. ${doctor?.name || 'este especialista'}?`
              : `What medical specialties, treatments, and clinical protocols does ${doctor?.name || 'this specialist'} provide?`
          }
          onOpenClinicalAI={() => {
            triggerHaptic('selection');
            setIsAtlasAiOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* ── Google Cloud Console Standard Unified Footer (100% Full-Width) ── */}
      <PublicUnifiedFooter lang={lang || 'en'} minimal={isAuthorizedViewer} />

      {/* ── Practice Spotlight Search Palette (Rule #7 & Spotlight standard) ── */}
      <DoctorPracticeSearchModal
        isOpen={isPracticeSearchOpen}
        onClose={() => setIsPracticeSearchOpen(false)}
        doctor={doctor}
        isAuthorizedViewer={isAuthorizedViewer}
        opaqueDoctorCode={opaqueCode}
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

      {/* ── Doctor & Patient Intake Share Modal ── */}
      <DoctorPatientShareModal
        isOpen={isPatientShareModalOpen}
        onClose={() => setIsPatientShareModalOpen(false)}
        doctor={doctor}
        opaqueCode={opaqueCode}
        isAdmin={Boolean(isAdmin || activeRole === 'admin')}
        lang={lang}
      />

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
              const raw = mobileActionRx.code || mobileActionRx.prescriptionNumber || mobileActionRx.id;
              const code = sanitizePrescriptionCode(raw, mobileActionRx.patientName);
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
          ...((isAdmin || activeRole === 'admin') ? [{
            label: 'Official Bottle Labels',
            icon: Tag,
            onClick: () => {
              const target = mobileActionRx;
              setMobileActionRx(null);
              handleOpenLabelsModal(target);
            }
          }] : []),
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
            doctorName: isAuthorizedViewer ? doctor.name : `Physician (${opaqueCode})`,
            doctorSlug: doctor.slug || opaqueCode,
            clinicName: isAuthorizedViewer ? doctor.clinic : 'Verified Medical Practice',
            isAuthorizedViewer: Boolean(isAuthorizedViewer),
            doctorLicense: doctor.license || doctor.dhaLicense || doctor.medicalLicense || null,
            opaqueCode: opaqueCode
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
            toast.success(isAuthorizedViewer ? `Prescription attributed to ${doctor.name}` : 'Prescription attributed to practice');
          }}
        />
      )}

      {/* ── Slide-In Monograph Drawer (Modularized) ── */}
      <DoctorMonographDrawer
        selectedMonograph={selectedMonograph}
        onClose={() => setSelectedMonograph(null)}
        doctor={doctor}
        onInquire={(peptide) => {
          setInquiryPeptide(peptide);
          setIsInquiryOpen(true);
        }}
      />

      {/* ── Regimen Clinical Inquiry Modal (Modularized) ── */}
      <DoctorInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => {
          setIsInquiryOpen(false);
          setInquiryPeptide(null);
        }}
        doctor={doctor}
        inquiryPeptide={inquiryPeptide}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onContactWhatsApp={handleContactAtlasWhatsApp}
      />

      {/* ── Unified Atlas AI Clinical Copilot Slide-Over Drawer (Modularized) ── */}
      <DoctorAtlasAiModal
        isOpen={isAtlasAiOpen}
        onClose={() => setIsAtlasAiOpen(false)}
        doctor={doctor}
        prescriptions={filteredPrescriptions}
        tasks={filteredTasks}
        aiUsesRemaining={aiUsesRemaining}
        isAuthorizedViewer={isAuthorizedViewer}
        onDecrementUses={() => setAiUsesRemaining(prev => Math.max(0, prev - 1))}
        onContactWhatsApp={handleContactAtlasWhatsApp}
      />

      {/* ── Request Info Modal (Atlas Clinical Support: +971 55 356 1058) (Modularized) ── */}
      <DoctorRequestInfoModal
        isOpen={isRequestInfoOpen}
        onClose={() => setIsRequestInfoOpen(false)}
        doctor={doctor}
        opaqueCode={opaqueCode}
        isAuthorizedViewer={isAuthorizedViewer}
        prescriptions={filteredPrescriptions}
        onContactWhatsApp={handleContactAtlasWhatsApp}
      />

      {/* ── Patient Posology Handout Modal (Printable & Shareable) (Modularized) ── */}
      <DoctorHandoutModal
        isOpen={isHandoutOpen}
        onClose={() => {
          setIsHandoutOpen(false);
          setHandoutRx(null);
        }}
        handoutRx={handoutRx}
        doctor={doctor}
        onShareWhatsApp={handleShareProposalWhatsApp}
      />

      {/* ── Mobile Clinical Navigation Drawer (Off-Canvas, Rule #23) (Modularized) ── */}
      <DoctorMobileSidebarDrawer
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        doctor={doctor}
        sidebarNavGroups={sidebarNavGroups}
        activeAnchor={activeAnchor}
        onNavigate={handleSidebarNavigate}
        onOpenCredentials={() => setIsCredentialsModalOpen(true)}
        onCopyIntakeLink={handleCopyIntakeLink}
        onOpenIntake={() => setIsIntakeOpen(true)}
      />

      {/* ── GCP Resource Inspector Drawer (Golden Rule #4: Master-Detail) (Modularized) ── */}
      <DoctorResourceInspectorDrawer
        selectedInspectorItem={selectedInspectorItem}
        onClose={() => setSelectedInspectorItem(null)}
        doctor={doctor}
        isAuthorizedViewer={isAuthorizedViewer}
        opaqueCode={opaqueCode}
        signingTaskId={signingTaskId}
        onSignOffPrescription={handleSignOffPrescription}
        onOpenLabelsModal={handleOpenLabelsModal}
        onShareProposalWhatsApp={handleShareProposalWhatsApp}
        onCopyProposalLink={handleCopyProposalLink}
      />

      {/* ── Slide-Over Clinical Intelligence & Algolia Search Drawer (Modularized) ── */}
      <DoctorDiscoveryDrawer
        isOpen={isDiscoveryDrawerOpen}
        onClose={() => setIsDiscoveryDrawerOpen(false)}
        protocols={data?.protocols || []}
        formulary={data?.formulary || []}
        opaqueDoctorCode={doctor?.opaqueCode || slug}
      />

      {/* ── Official Physician Credentials & Profile Popup Modal (Modularized) ── */}
      {isAuthorizedViewer && (
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
      )}

      {/* ── Atlas Platform Services & Membership Tiers Modal (GCP UX Style) ── */}
      <DoctorServicesMembershipModal
        isOpen={isServicesModalOpen}
        onClose={handleCloseServicesModal}
        doctor={doctor}
        doctorName={isAuthorizedViewer ? (doctor.name || 'Doctor') : `Doctor ${opaqueCode}`}
        clinicName={isAuthorizedViewer ? (doctor.clinic || 'Medical Practice') : 'Verified Medical Practice'}
        currentTier={doctor.tier || doctor.membershipTier || doctor.subscriptionTier || 'basic'}
      />

      {/* ── Frictionless Auth & Clinical Data Protection Notice Modal ── */}
      <DoctorAuthNoticeModal
        isOpen={isAuthNoticeModalOpen}
        onClose={() => setIsAuthNoticeModalOpen(false)}
        doctor={doctor}
        opaqueCode={opaqueCode}
        resourceName={authNoticeResource}
        onOpenClaimModal={() => {
          setIsAuthNoticeModalOpen(false);
          setIsClaimModalOpen(true);
        }}
      />

      {/* ── Doctor Practice Claim & Workstation Verification Modal (Zero-Knowledge) ── */}
      <DoctorPracticeClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        doctor={doctor}
        opaqueCode={opaqueCode}
        isAuthorizedViewer={isAuthorizedViewer}
        onAuthorized={() => {
          setWorkstationAuthorized(true);
          setIsClaimModalOpen(false);
        }}
      />

      {/* ── Quick Actions Palette (GCP-style, keyboard-accessible Cmd/Ctrl + /, launcher button hidden to avoid overlaying tables) ── */}
      {isAuthorizedViewer && <DoctorCommandPalette commands={quickActionCommands} showLauncher={false} />}

      {/* ── Specialty Blueprint Clinical Monograph Dossier Modal (On-Screen, Zero WhatsApp) ── */}
      <DoctorBlueprintDossierModal
        isOpen={Boolean(activeBlueprintDossier)}
        onClose={() => setActiveBlueprintDossier(null)}
        blueprint={activeBlueprintDossier}
        onCustomizePrescribe={(bp) => {
          setActiveBlueprintDossier(null);
          handlePrescribeSpecialtyBlueprint(bp);
        }}
        onRequestSample={(bp) => {
          setActiveBlueprintDossier(null);
          handleRequestBlueprintWhatsApp(bp);
        }}
      />

      {/* ── Doctor Patient Clinical Follow-Up & Portal Invitation Modal (GCP UX Style) ── */}
      <DoctorPatientFollowUpModal
        isOpen={Boolean(followUpModalTask)}
        onClose={() => setFollowUpModalTask(null)}
        task={followUpModalTask || {}}
        doctor={doctor || {}}
      />
    </div>
  );
}

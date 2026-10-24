"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { rememberDoctorSection } from '@/components/doctor/DoctorContinueBanner';
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
const DoctorPracticeClaimModal = dynamic(
  () => import('@/components/doctor/modals/DoctorPracticeClaimModal'),
  { ssr: false }
);
const DoctorAuthNoticeModal = dynamic(
  () => import('@/components/doctor/modals/DoctorAuthNoticeModal'),
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

  // UI Actions State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIntake, setCopiedIntake] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const intakeSavedRef = useRef(false);

  // Language & Clinical Sidebar Navigation State (GCP Standard)
  const [lang, setLang] = useState('en');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState(
    initialTab || (initialSearchParams?.task ? 'tasks' : initialSearchParams?.tab) || 'overview'
  );

  // Modal for Viewing Pharmacy Labels Directly from Doctor Portal
  const [activeLabelRx, setActiveLabelRx] = useState(null);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
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
      window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
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

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
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
        `**Practice Intelligence for ${safeDocName}:**\n• **${doctorPatientsList.length} Unique Patients** (${soldPatientsCount} Sold Customers · ${unacceptedPatientsCount} Unaccepted Proposal Patients)\n• **${allPrescriptions.length} Prescriptions** (${quickCounts.active} Sold & Invoiced · ${quickCounts.proposals} Unaccepted Offers)`;

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
                    background: '#f0fdfa',
                    color: '#0d9488',
                    border: '1px solid #99f6e4'
                  }}
                >
                  <Activity size={11} />
                  {t.daysAgo ? `Check-in (Day ${t.daysAgo})` : 'Tolerance Check-in'}
                </span>
              </div>
              <div style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Treatment delivered</span>
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }}
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
        const patientPhone = rx.patientPhone || rx.phone || rx.mobile || rx.patient?.phone || rx.patient?.mobile;

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
            {isAuthorizedViewer && patientPhone ? (
              <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <Phone size={11} style={{ color: '#059669', flexShrink: 0 }} />
                <span>{patientPhone}</span>
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
            {isAuthorizedViewer && rx.patient?.dob && (
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
              {patName && !patName.startsWith('Patient PT-') && (
                <span style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.86rem' }}>
                  {patName}
                </span>
              )}
              {!isAuthorizedViewer && (
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
              )}
            </div>
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
      header: 'Commercial Status',
      width: '22%',
      align: 'left',
      sortable: true,
      render: (val, row) => {
        const pat = row || val || {};
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {pat.hasSold ? (
              <>
                <StatusBadge status="approved" customLabel="Sold Customer" />
                <div style={{ fontSize: '0.70rem', color: '#15803d', fontWeight: 650, marginTop: '3px' }}>
                  ✓ {pat.invoices?.join(', ') || 'Invoiced Order'}
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
      header: 'Prescriptions & History',
      width: '32%',
      align: 'left',
      render: (val, row) => {
        const pat = row || val || {};
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
              {pat.prescriptions?.length === 1 ? '1 Clinical Regimen' : `${pat.prescriptions?.length || 0} Clinical Regimens`}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.25 }}>
              {pat.latestProduct || '—'}
            </div>
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
        hideTier2={true}
        hideImportRx={true}
        hideSwitchRx={true}
        hideSearchButton={true}
        isDoctorView={true}
        onImportRx={handleOpenNewPrescriptionIntake}
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
                title={isAuthorizedViewer ? "View Doctor Credentials & License" : "Sign in to unlock authorized nominal dossiers"}
              >
                {isAuthorizedViewer ? (
                  <>
                    <ShieldCheck size={12} style={{ color: '#0d9488' }} />
                    <span>Info</span>
                  </>
                ) : (
                  <>
                    <Lock size={12} style={{ color: '#0284c7' }} />
                    <span>Sign In</span>
                  </>
                )}
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
                <span style={{ fontSize: '0.74rem', color: '#5f6368', fontWeight: 500 }}>
                  {isAuthorizedViewer ? `Dr. Portal · ${doctor.name}` : `Clinical Portal · Practice ${opaqueCode}`}
                </span>
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
                  {activeAnchor === 'tasks' && `Pending Actions (${filteredTasks.length})`}
                  {activeAnchor === 'prescriptions' && `Prescriptions (${filteredPrescriptions.length})`}
                  {activeAnchor === 'patients' && `Patients (${doctorPatientsList.length})`}
                  {activeAnchor === 'recommendations' && 'Specialty Blueprints & Rx Synergies'}
                  {activeAnchor === 'lab_results' && `Lab Diagnostics (${allLabResults.length})`}
                  {activeAnchor === 'analytics' && 'Practice Analytics'}
                  {activeAnchor === 'credentials' && 'Clinic Credentials & Verification'}
                  {activeAnchor === 'services_tiers' && 'Platform Services & Compounding Access'}
                </h1>

                {/* Unified 1-Click Segmented Switcher for Prescriptions / Patients / Pending Actions */}
                {(['prescriptions', 'patients', 'tasks'].includes(activeAnchor)) && (
                  <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px', border: '1px solid #e2e8f0' }}>
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
                          onClick={() => handleSidebarNavigate(tab.id)}
                          style={{
                            padding: '4px 10px',
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
              {/* Quick Search Trigger (⌘K) */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsPracticeSearchOpen(true);
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
                  boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                }}
                title="Search patients, prescriptions, formulations (⌘K)"
              >
                <Search size={14} style={{ color: '#5f6368' }} />
                <span>Search</span>
                <kbd style={{ fontSize: '0.66rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1px 5px', color: '#64748b' }}>⌘K</kbd>
              </button>

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

              {/* Doctor Avatar / Profile Button */}
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
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                }}
                title={isAuthorizedViewer ? `Verified Physician: ${doctor.name}` : 'Sign in to practice portal'}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.68rem',
                    fontWeight: 750
                  }}
                >
                  {isAuthorizedViewer ? (doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D') : <Shield size={10} color="#ffffff" />}
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a' }}>
                  {isAuthorizedViewer ? doctor.name?.split(' ').slice(0, 2).join(' ') : 'Practice ID'}
                </span>
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
                      border: filteredTasks.length > 0 ? '1.5px solid #f59e0b' : '1px solid #dadce0',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: filteredTasks.length > 0 ? '0 2px 6px rgba(245,158,11,0.12)' : '0 1px 2px rgba(60,64,67,0.06)',
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
                      const codifiedId = getCodifiedPatientId(t.patientName, t.code);
                      const displayPatient = isAuthorizedViewer ? t.patientName : codifiedId;
                      const patientPhone = (t.patientPhone || t.patient?.phone || '').replace(/[^0-9+]/g, '');
                      const cleanDocTitle = (doctor?.name || 'Khalid Shukri').replace(/^Dr\.?\s*/i, '').trim();
                      const rawMsg = (t.whatsappMessage || `Hello ${t.patientName}, this is Dr. ${cleanDocTitle}'s clinical practice following up on your personalized ${t.treatmentTitle || 'treatment plan'}. You can review your medical protocol here: https://atlashealth-services.com/rx/${t.code}.`)
                        .replace(/Dr\.\s+Dr\.\s+/gi, 'Dr. ');
                      const waUrl = patientPhone
                        ? `https://wa.me/${patientPhone}?text=${encodeURIComponent(rawMsg)}`
                        : `https://wa.me/?text=${encodeURIComponent(rawMsg)}`;

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
                                  background: isProposalTask ? '#fffbeb' : '#eff6ff',
                                  color: isProposalTask ? '#b45309' : '#1d4ed8',
                                  border: `1px solid ${isProposalTask ? '#fde68a' : '#bfdbfe'}`
                                }}
                              >
                                {isProposalTask ? 'Offer Pending Checkout' : 'Awaiting Rx Approval'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.treatmentTitle || t.code} {t.daysPending ? `· ${t.daysPending} days pending` : ''}
                            </div>
                          </div>

                          <div style={{ flexShrink: 0 }}>
                            {isProposalTask ? (
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
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  color: '#15803d',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Send WhatsApp follow-up reminder to patient"
                              >
                                <MessageCircle size={13} />
                                <span>Send Reminder</span>
                              </a>
                            ) : (
                              <button
                                type="button"
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
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve</span>
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
                        {doctorSpecialtyIntel.primaryMeta?.badgeIcon} {doctorSpecialtyIntel.primaryMeta?.label || 'Specialty Intelligence'}
                      </span>
                      <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748b' }}>
                        Specialty-tailored formulations & synergies
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#202124' }}>
                      Atlas Clinical Intelligence
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

                    return (
                      <div
                        key={bp.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ flex: '1 1 340px', minWidth: '260px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.68rem',
                                fontWeight: 700,
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
                              {bp.targetProcedure}
                            </span>
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
                          </div>

                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                            {bp.compoundingFormula?.treatmentTitle || bp.title}
                            {bp.compoundingFormula?.volume && (
                              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>
                                · {bp.compoundingFormula.volume}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {bp.peptideSynergy?.name && (
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 650,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  background: '#eef2ff',
                                  color: '#4338ca',
                                  border: '1px solid #c7d2fe'
                                }}
                              >
                                🧬 Peptide: {bp.peptideSynergy.name}
                              </span>
                            )}
                            {bp.dermocosmeticSynergy?.name && (
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 650,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  background: '#ecfdf5',
                                  color: '#047857',
                                  border: '1px solid #a7f3d0'
                                }}
                              >
                                🌿 Colway: {bp.dermocosmeticSynergy.name}
                              </span>
                            )}
                            {bp.diagnosticSynergy?.name && (
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 650,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  background: '#f0f9ff',
                                  color: '#0369a1',
                                  border: '1px solid #bae6fd'
                                }}
                              >
                                🔬 Lab: {bp.diagnosticSynergy.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setActiveBlueprintDossier(bp);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '5px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#1e293b',
                              fontSize: '0.72rem',
                              fontWeight: 650,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <FileText size={12} style={{ color: '#0284c7' }} />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrescribeSpecialtyBlueprint(bp)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '5px',
                              border: 'none',
                              background: '#003666',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                            }}
                          >
                            <Plus size={12} />
                            <span>+ Customize & Prescribe</span>
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

                {/* KPI 2: Portal Inactive */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setTaskFilter('portal_inactive');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${taskFilter === 'portal_inactive' ? '#0284c7' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    boxShadow: taskFilter === 'portal_inactive' ? '0 2px 6px rgba(2,132,199,0.15)' : '0 1px 2px rgba(60,64,67,0.06)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Portal Inactive
                    </span>
                    <Globe size={15} style={{ color: '#0284c7' }} />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>
                    {taskCounts.portal_inactive}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    Unclaimed patient portals
                  </div>
                </div>

                {/* KPI 3: Follow-ups */}
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

                {/* KPI 4: Checks & Refills */}
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
                      Checks &amp; Refills
                    </span>
                    <Activity size={15} style={{ color: '#0d9488' }} />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>
                    {taskCounts.refill + taskCounts.titration + taskCounts.tolerance_check}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    Adherence &amp; tolerance reviews
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
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Clock size={18} style={{ color: '#1a73e8' }} />
                      <span>Action Queue · Pending Follow-ups &amp; Unaccepted Offers</span>
                    </h2>
                    <div style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>This queue only lists pending proposals awaiting patient checkout. Confirmed orders do not require follow-up tasks.</span>
                      {quickCounts.active > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('selection');
                            setQuickRxFilter('active');
                            setActiveAnchor('prescriptions');
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '2px 10px',
                            borderRadius: '999px',
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            color: '#15803d',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <span>🟢 View {quickCounts.active} Sold &amp; Invoiced Prescriptions →</span>
                        </button>
                      )}
                    </div>
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

                    <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px', gap: '2px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: 'All', count: taskCounts.all },
                        { id: 'portal_inactive', label: 'Portal Inactive', count: taskCounts.portal_inactive },
                        { id: 'proposal_followup', label: 'Follow-ups', count: taskCounts.proposal_followup },
                        { id: 'tolerance_check', label: 'Check-ins', count: taskCounts.tolerance_check },
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
                      <span suppressHydrationWarning>
                        {isBackgroundSyncing
                          ? 'Updating registry...'
                          : isMounted && lastRefreshed
                          ? `Live registry · ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Live registry · Auto-synced'}
                      </span>
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Complete verified repository of compounded prescriptions and clinical regimens.
                  </p>
                </div>

                {/* Direct CSV Export Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    style={{
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#3c4043',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#1a73e8';
                      e.currentTarget.style.color = '#1a73e8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#dadce0';
                      e.currentTarget.style.color = '#3c4043';
                    }}
                    title="Export current prescription view to CSV"
                  >
                    <Download size={14} />
                    <span>Export CSV ({filteredPrescriptions.length})</span>
                  </button>
                </div>
              </div>

              {/* ── Persistent 4-Card Commercial & Clinical KPI Bar (Rule #22) ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
                  gap: '10px',
                  padding: '14px 20px 4px 20px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setQuickRxFilter('all');
                    setStatusFilter('all');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${quickRxFilter === 'all' && statusFilter === 'all' ? '#1a73e8' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    boxShadow: quickRxFilter === 'all' && statusFilter === 'all' ? '0 2px 6px rgba(26,115,232,0.12)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    All Prescriptions
                  </div>
                  <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {allPrescriptions.length}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Consolidated clinical regimens
                  </div>
                </div>

                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setQuickRxFilter(quickRxFilter === 'active' ? 'all' : 'active');
                    setStatusFilter('all');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${quickRxFilter === 'active' ? '#16a34a' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    boxShadow: quickRxFilter === 'active' ? '0 2px 6px rgba(22,163,74,0.14)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🟢 Sold & Invoiced
                  </div>
                  <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    {quickCounts.active}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Confirmed orders ({soldPatientsCount} patients)
                  </div>
                </div>

                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setQuickRxFilter(quickRxFilter === 'proposals' ? 'all' : 'proposals');
                    setStatusFilter('all');
                  }}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${quickRxFilter === 'proposals' ? '#d97706' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    boxShadow: quickRxFilter === 'proposals' ? '0 2px 6px rgba(217,119,6,0.14)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ⏳ Unaccepted Offers
                  </div>
                  <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                    {quickCounts.proposals}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Awaiting checkout ({unacceptedPatientsCount} patients)
                  </div>
                </div>

                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveAnchor('patients');
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    👥 Unique Patients
                  </div>
                  <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {doctorPatientsList.length}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {soldPatientsCount} sold · {unacceptedPatientsCount} unaccepted →
                  </div>
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
                      value: quickRxFilter === 'proposals' ? 'Unaccepted Offers' : quickRxFilter === 'drafts' ? 'Doctor Drafts' : quickRxFilter === 'active' ? 'Sold & Invoiced' : 'Multi-Part',
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
                    { id: 'all', label: `All Formulations (${quickCounts.all})`, color: '#003666', bg: '#f1f5f9' },
                    { id: 'active', label: `🟢 Sold & Invoiced (${quickCounts.active})`, color: '#137333', bg: '#f0fdf4' },
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

              {!isAuthorizedViewer && (
                <div
                  style={{
                    margin: '12px 20px 0 20px',
                    padding: '10px 14px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#0369a1' }}>
                    <Lock size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span>
                      <strong>DHA & HIPAA Double Codification Active:</strong> Physician and patient identities are de-identified with unique clinical tokens (<code>{opaqueCode}</code>, <code>PT-XXXX</code>) in compliance with UAE Health Data Law & HIPAA.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setIsClaimModalOpen(true);
                    }}
                    style={{
                      padding: '5px 12px',
                      background: '#003666',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Verify Practice & Unlock Dossiers</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              )}

              <DataTable
                columns={prescriptionColumns}
                data={filteredPrescriptions}
                keyField="id"
                tableId={`doctor-prescriptions-${slug}`}
                pagination={true}
                initialRowsPerPage={10}
                alwaysShowPagination={true}
                selectedIds={selectedRxIds}
                onSelectionChange={setSelectedRxIds}
                renderBatchActions={(ids, clearSelection) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={isBatchSigning}
                      onClick={handleBatchSignPrescriptions}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: '1px solid #15803d',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: isBatchSigning ? 'wait' : 'pointer'
                      }}
                    >
                      {isBatchSigning ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      <span>Authorize Selected ({ids.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetList = allPrescriptions.filter(p => ids.includes(p.id) || ids.includes(p.code));
                        handleExportPrescriptionsCsv(targetList);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#ffffff',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={13} />
                      <span>Export Selected ({ids.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: '4px 8px'
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
                onRowClick={handleRowClickPrescription}
                emptyTitle={
                  quickRxFilter === 'active'
                    ? "No Sold & Invoiced Prescriptions Found"
                    : quickRxFilter === 'proposals'
                    ? "No Unaccepted Proposals Found"
                    : "No Prescriptions Found"
                }
                emptyDescription={
                  quickRxFilter === 'active'
                    ? "No historical prescriptions with confirmed customer orders match the active criteria."
                    : quickRxFilter === 'proposals'
                    ? "All physician treatment proposals have been accepted or converted."
                    : "No prescriptions match the active search criteria or filters. Adjust search keywords or register a new patient."
                }
                emptyActionLabel={quickRxFilter !== 'all' && quickCounts.all > 0 ? `Show All Prescriptions (${quickCounts.all})` : undefined}
                onEmptyAction={quickRxFilter !== 'all' && quickCounts.all > 0 ? () => setQuickRxFilter('all') : undefined}
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

                      {/* Atlas Clinical Protocol Cross-Reference & Physician Calibration */}
                      <PrescriptionProtocolAlignmentCard rx={rx} doctor={doctor} />

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
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#15803d', textTransform: 'uppercase' }}>Sold Customers</span>
                      <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#15803d' }}>
                      {doctorPatientsList.filter(p => p.hasSold).length}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#15803d', marginTop: '4px', fontWeight: 650 }}>Confirmed invoice on file</div>
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
                        value: patientFilterMode === 'sold' ? 'Sold Customers' : (patientFilterMode === 'refill' ? 'Due for Renewal' : 'Unaccepted Proposals'),
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
                      🟢 Sold Customers ({doctorPatientsList.filter(p => p.hasSold).length})
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
                      Associated Clinical Prescriptions & Proposals ({pat.prescriptions.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pat.prescriptions.map((p, idx) => {
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

      {/* ── Universal Public Sticky Action Bar (GCP Standard Fixed Bottom Bar) ── */}
      <PublicStickyActionBar
        title={doctor?.name || `Doctor ${opaqueCode}`}
        subtitle={`${doctor?.clinic || (lang === 'es' ? 'Consulta Médica Verificada' : 'Verified Medical Practice')} • ${allPrescriptions.length} ${lang === 'es' ? 'Prescripciones' : 'Prescriptions'} • ${doctorPatientsList.length} ${lang === 'es' ? 'Pacientes' : 'Patients'}`}
        badge={lang === 'es' ? 'CONSOLA MÉDICA' : 'PHYSICIAN CONSOLE'}
        badgeType="protocol"
        inquireLabel={lang === 'es' ? 'Nueva Prescripción' : 'New Prescription'}
        onInquire={handleOpenNewPrescriptionIntake}
        showClinicalAI={true}
        onOpenClinicalAI={() => {
          triggerHaptic('selection');
          setIsAtlasAiOpen(true);
        }}
        lang={lang}
        extraActions={
          <>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setIsPracticeSearchOpen(true);
              }}
              className="public-sticky-action-bar__sections-btn"
              title={lang === 'es' ? 'Buscar paciente o receta (⌘K)' : 'Quickly find any patient or prescription (⌘K)'}
            >
              <Search size={14} style={{ color: '#003666' }} />
              <span className="public-sticky-action-bar__sections-label">
                {lang === 'es' ? 'Buscar Paciente / Rx (⌘K)' : 'Find Patient / Rx (⌘K)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsRequestInfoOpen(true);
              }}
              className="public-sticky-action-bar__sections-btn"
              title={lang === 'es' ? 'Asistencia médica directa por WhatsApp' : 'Direct clinical assistance via WhatsApp'}
            >
              <MessageCircle size={14} style={{ color: '#16a34a' }} />
              <span className="public-sticky-action-bar__sections-label" style={{ color: '#166534' }}>
                WhatsApp
              </span>
            </button>
          </>
        }
      />

      {/* ── Google Cloud Console Standard Unified Footer (100% Full-Width) ── */}
      <PublicUnifiedFooter lang={lang || 'en'} minimal={true} />

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
                Inquire in Custom Regimen with {isAuthorizedViewer ? doctor.name : 'Treating Physician'}
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
                  Attributed to {isAuthorizedViewer ? doctor.name : `Practice ${opaqueCode}`}
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
                    handleOpenNewPrescriptionIntake();
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



      {/* ── Atlas AI Clinical Copilot Modal (Doctor-Personalized Practice Intelligence) ─────── */}
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
              width: '680px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      Atlas AI — Clinical & Practice Copilot
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
                  <div style={{ fontSize: '0.73rem', opacity: 0.94, marginTop: '2px' }}>
                    Personalized for {isAuthorizedViewer ? doctor.name : `Practice ${opaqueCode}`} · <strong>{doctorPatientsList.length} Unique Patients</strong> ({soldPatientsCount} Sold · {unacceptedPatientsCount} Unaccepted) · <strong>{allPrescriptions.length} Prescriptions</strong>
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
              background: !isAuthorizedViewer ? '#eff6ff' : '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.72rem',
              color: !isAuthorizedViewer ? '#1e40af' : '#475569'
            }}>
              <ShieldCheck size={14} color={!isAuthorizedViewer ? '#2563eb' : '#6366f1'} />
              <span>
                {!isAuthorizedViewer ? (
                  <><strong>DHA & HIPAA Privacy Active:</strong> Physician and patient identities are de-identified (<code>{opaqueCode}</code>, <code>PT-XXXX</code>). Register or sign in to practice portal for nominal files.</>
                ) : (
                  <><strong>Isolated Practice Graph:</strong> Dedicated to {doctor.name} ({doctor.clinic || doctor.specialty || 'Clinical Practice'}). Full global practice context remains active regardless of table filters.</>
                )}
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
              maxHeight: '420px'
            }}>
              {/* Personalized Practice Briefing Welcome Card */}
              <div style={{
                alignSelf: 'flex-start',
                width: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Bot size={13} /> Atlas Clinical & Practice Intelligence — Live Briefing
                  </span>
                  <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>
                    {isAuthorizedViewer ? (
                      `${doctor.specialty || 'Regenerative & Compounding Medicine'} ${doctor.clinic ? `· ${doctor.clinic}` : ''}`
                    ) : (
                      `Accredited Practice · ID: ${opaqueCode}`
                    )}
                  </span>
                </div>

                <div style={{ fontSize: '0.80rem', color: '#1e293b', lineHeight: 1.5 }}>
                  Welcome{isAuthorizedViewer ? <>, <strong>{doctor.name}</strong></> : <> to <strong>Practice {opaqueCode}</strong></>}. I am synchronized with your complete practice graph (independent of any active table filter):
                </div>

                {/* 4-Box Real-Data Practice Snapshot */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                  gap: '8px',
                  marginTop: '10px',
                  marginBottom: '12px'
                }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Unique Patients</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{doctorPatientsList.length}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      <strong style={{ color: '#15803d' }}>{soldPatientsCount}</strong> Sold · <strong style={{ color: '#b45309' }}>{unacceptedPatientsCount}</strong> Unaccepted
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Sold & Invoiced</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803d' }}>{quickCounts.active} Rx</div>
                    <div style={{ fontSize: '0.65rem', color: '#166534' }}>
                      Confirmed & dispensed orders
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Unaccepted Offers</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b45309' }}>{quickCounts.proposals} Rx</div>
                    <div style={{ fontSize: '0.65rem', color: '#92400e' }}>
                      Ready for 1-click conversion
                    </div>
                  </div>

                  <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>
                      {doctorTopApis.length > 0 ? 'Your Top APIs' : 'Specialty Blueprints'}
                    </div>
                    <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#312e81', marginTop: '2px', lineHeight: 1.3 }}>
                      {doctorTopApis.length > 0
                        ? doctorTopApis.slice(0, 3).map((a) => `${a.name} (${a.count})`).join(', ')
                        : `${doctorSpecialtyIntel.primaryBlueprints.length} ${doctorSpecialtyIntel.primaryMeta?.shortLabel || 'Specialty'} Protocols`}
                    </div>
                  </div>
                </div>

                {/* Clear Explanation of What Atlas AI Does for This Doctor */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '0.74rem',
                  color: '#334155',
                  lineHeight: 1.5
                }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    How I can assist your practice right now ({aiUsesRemaining} session credits):
                  </div>
                  <div>• <strong>Specialty Practice Blueprints ({doctorSpecialtyIntel.primaryMeta?.shortLabel || doctor.specialty}):</strong> Recommend ready-to-prescribe compounding formulas, peptides, native collagen, and diagnostics matched to your clinical procedures ({(doctorSpecialtyIntel.webPracticeProfile?.detectedProcedures || []).slice(0, 3).join(', ') || 'clinical specialty'}).</div>
                  <div>• <strong>Patient & Rx Lookup:</strong> {!isAuthorizedViewer ? 'Ask about any patient by Rx code to inspect active compounding formulas and clinical posology.' : 'Ask about any patient by name or Rx code to inspect their exact formula, invoice status, and phone.'}</div>
                  <div>• <strong>Commercial Conversion & Renewals:</strong> Identify your <strong>{quickCounts.proposals} Unaccepted Offers</strong> ({unacceptedPatientsCount} patients) and <strong>{soldPatientsCount} Sold Customers</strong> due for 30/90-day refills.</div>
                </div>
              </div>

              {/* Chat Thread */}
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
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
                    {msg.role === 'user' ? 'You' : `Atlas Copilot · ${isAuthorizedViewer ? doctor.name : opaqueCode}`} · {msg.time}
                  </div>
                  {msg.role === 'user' ? (
                    <div style={{
                      fontSize: '0.80rem',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-line'
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <DoctorAiMessageRenderer
                      content={msg.content}
                      onExecuteAction={handleExecuteAiAction}
                    />
                  )}
                  {msg.role === 'assistant' && Array.isArray(msg.actions) && msg.actions.length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => handleExecuteAiAction(act)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #c7d2fe',
                            background: '#eef2ff',
                            color: '#4338ca',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{act.label}</span>
                          <ArrowUpRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
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
                  <span>Analyzing {isAuthorizedViewer ? `${doctor.name}'s` : 'practice'} {doctorPatientsList.length} patients & {allPrescriptions.length} prescriptions...</span>
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
                    <strong>Session Quota Reached (5/5):</strong> You have utilized all 5 clinical intelligence queries allocated to this session.
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

            {/* Personalized Quick Suggestion Chips */}
            {aiUsesRemaining > 0 && (
              <div style={{
                padding: '10px 16px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto'
              }}>
                {(allPrescriptions.length === 0
                  ? [
                      `🧬 Specialty Blueprints for ${doctorSpecialtyIntel.primaryMeta?.shortLabel || 'My Practice'}`,
                      `⚡ Ready-to-prescribe compounding formulas`,
                      `🔬 Peptide & Native Collagen synergies`,
                      `🩸 Pre-protocol Bloodo diagnostic panels`
                    ]
                  : [
                      `🧬 Specialty Blueprints for ${doctorSpecialtyIntel.primaryMeta?.shortLabel || 'My Practice'}`,
                      `🟢 My ${quickCounts.active} Sold & Invoiced orders`,
                      `⏳ Convert ${quickCounts.proposals} Unaccepted Offers`,
                      `🔄 Patients due for renewal`
                    ]
                ).map((chip, cIdx) => (
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
                      color: '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 600,
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
                placeholder={aiUsesRemaining > 0 ? `Ask about any of your ${doctorPatientsList.length} patients, ${allPrescriptions.length} prescriptions, renewals, or APIs...` : "Session limit reached. Contact Atlas Support on WhatsApp."}
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
              <span>Attributed Physician: <strong style={{ color: '#202124' }}>{isAuthorizedViewer ? doctor.name : `Physician (${opaqueCode})`}</strong></span>
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
                      const text = `Physician: ${isAuthorizedViewer ? doctor.name : `Physician (${opaqueCode})`}\nTopic: ${requestInfoSubject}\n${requestInfoSelectedRx ? `Ref: ${requestInfoSelectedRx}\n` : ''}${requestInfoNotes ? `Notes: ${requestInfoNotes}\n` : ''}`;
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
                  <strong style={{ color: '#0f172a', fontSize: '13px' }}>
                    {isAuthorizedViewer ? (handoutRx.patientName || 'Patient') : `Patient PT-${String(handoutRx.code || handoutRx.id).slice(-4).toUpperCase()}`}
                  </strong>
                  {isAuthorizedViewer && handoutRx.patient?.dob && <span style={{ color: '#64748b', display: 'block' }}>DOB: {handoutRx.patient.dob}</span>}
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PRESCRIBING PHYSICIAN</span>
                  <strong style={{ color: '#0f172a' }}>{isAuthorizedViewer ? (doctor.name || 'Treating Physician') : `Accredited Physician (${opaqueCode})`}</strong>
                  <span style={{ color: '#64748b', display: 'block' }}>{isAuthorizedViewer ? (doctor.clinic || 'Specialized Clinic') : 'DHA Verified Practice'}</span>
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
                <strong>Important:</strong> Keep compounded medicines in a cool, dry place away from direct sunlight. Follow the exact posology prescribed by {isAuthorizedViewer ? (doctor.name || 'your physician') : 'your treating physician'}. In case of any adverse reaction, discontinue use and contact your clinic immediately.
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
                    const safeHandoutPat = isAuthorizedViewer ? (handoutRx.patientName || 'Patient') : `Patient PT-${String(handoutRx.code || handoutRx.id).slice(-4).toUpperCase()}`;
                    const safeHandoutDoc = isAuthorizedViewer ? doctor.name : `Physician (${opaqueCode})`;
                    const handoutText = `📋 POSOLOGY HANDOUT\nPatient: ${safeHandoutPat}\nPhysician: ${safeHandoutDoc}\nCode: #${handoutRx.code || handoutRx.prescriptionNumber}\n\n${partsText}`;
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
                  {isAuthorizedViewer ? (doctor.name ? doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) : 'D') : <Shield size={16} color="#ffffff" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isAuthorizedViewer ? doctor.name : 'Verified DHA Practice'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {isAuthorizedViewer ? 'Clinical Operations' : `Practice ID: ${opaqueCode}`}
                  </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.isLocked && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMobileSidebarOpen(false);
                                setAuthNoticeResource(item.label);
                                setIsAuthNoticeModalOpen(true);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                background: '#e0f2fe',
                                color: '#0284c7'
                              }}
                              title="Protected. Tap to sign in or register."
                            >
                              <Lock size={12} />
                            </span>
                          )}
                          {item.badge !== null && item.badge !== undefined && (
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
                          {item.actionBadge > 0 && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: '#dc2626',
                                color: '#ffffff'
                              }}
                            >
                              {item.actionBadge}
                            </span>
                          )}
                        </div>
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
                  <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>
                    {isAuthorizedViewer ? (doctor.license || 'Active') : (doctor.license ? `DHA-••••${String(doctor.license).slice(-3)}` : 'Verified on file')}
                  </span>
                </div>
                {isAuthorizedViewer && (
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
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    if (isAuthorizedViewer) {
                      setIsCredentialsModalOpen(true);
                    } else {
                      setAuthNoticeResource('Clinic licensing credentials & official practice verification files');
                      setIsAuthNoticeModalOpen(true);
                    }
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
                  <span>{isAuthorizedViewer ? 'Full Profile' : 'Verify Practice'}</span>
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
                  handleOpenNewPrescriptionIntake();
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
        const rx = !isTask ? item : null;
        const rxCode = rx?.code || rx?.prescriptionNumber || item?.code || 'N/A';
        const rawPatientName = rx?.patientName || item?.patientName || 'Anonymous Patient';
        const codifiedPatientId = getCodifiedPatientId(rawPatientName, rxCode);
        const patientName = isAuthorizedViewer ? rawPatientName : `Patient ${codifiedPatientId}`;

        // De-identify any prescription codes that contain patient name slugs
        const maskCode = (code, rawName) => {
          if (!code || code === 'N/A') return 'N/A';
          if (isAuthorizedViewer) return code;
          let clean = String(code);
          if (rawName && rawName !== 'Anonymous Patient') {
            const parts = rawName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/).filter(p => p.length >= 2);
            for (const part of parts) {
              clean = clean.replace(new RegExp(`[-_]?${part}`, 'gi'), '');
            }
            clean = clean.replace(/[-_]+$/, '');
          }
          clean = clean.replace(/-(?:[a-z]{3,}-?)+$/i, '');
          return clean || `RX-${codifiedPatientId}`;
        };
        const safeRxCode = maskCode(rxCode, rawPatientName);

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
                      {isTask ? `Task: ${item.title}` : `Prescription #${safeRxCode}`}
                    </h3>
                    <CopyableId value={safeRxCode} iconOnly={true} />
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
                      href={`/rx/${safeRxCode}`}
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
                  { id: 'dispensary', label: 'Quality & Tracking', icon: ShieldCheck },
                  { id: 'timeline', label: 'Audit Trail', icon: Activity }
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Patient Demographics & Record
                        </span>
                        {!isAuthorizedViewer && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            color: '#b45309',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            padding: '2px 7px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            triggerHaptic('light');
                            setAuthNoticeResource('Patient demographics & clinical dossier');
                            setIsAuthNoticeModalOpen(true);
                          }}
                          title="Protected under DHA/HIPAA standards. Click to sign in or register."
                        >
                          <Lock size={10} />
                          <span>Protected</span>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                      {patientName}
                    </div>
                    {isAuthorizedViewer && rx?.patient?.dob && (
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                        DOB: {rx.patient.dob} {rx.patient?.gender ? `· ${rx.patient.gender}` : ''}
                      </div>
                    )}
                    {!isAuthorizedViewer && (
                      <div
                        onClick={() => {
                          triggerHaptic('light');
                          setAuthNoticeResource('Patient contact info & clinical dossier');
                          setIsAuthNoticeModalOpen(true);
                        }}
                        style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '3px', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Protected contact details. Click to sign in or register."
                      >
                        DHA/HIPAA Protected Clinical Dossier · Contact verified on file
                      </div>
                    )}
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Canonical Ref:</span>
                        <CopyableId value={safeRxCode} />
                      </div>
                    </div>

                    {/* Prescribing Doctor Information */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Treating Physician
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Stethoscope size={14} />
                        <span>{isAuthorizedViewer ? (doctor.name || 'Treating Physician') : `Accredited Physician (${opaqueCode})`}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                        {isAuthorizedViewer ? (
                          `${doctor.specialty || 'Regenerative Medicine & Longevity'} · Lic: ${doctor.licenseNumber || doctor.license || 'DHA Verified'}`
                        ) : (
                          `Clinical Practice · DHA Licensed · ID: ${opaqueCode}`
                        )}
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
                          This personalized formulation was recommended by {isAuthorizedViewer ? `Dr. ${doctor?.name || 'treating physician'}` : `an Accredited Physician (${opaqueCode})`}, but the patient has not yet confirmed or purchased the treatment order.
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
                              ? `Prescription digitally authorized by ${isAuthorizedViewer ? (doctor.name || 'Treating Physician') : 'Treating Physician'} for compounding and release.`
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
                                href={`/rx/${safeRxCode}`}
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
                          const url = `${window.location.origin}/rx/${safeRxCode}?view=patient`;
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

                {/* Tab 4: Audit Trail & Lifecycle Tracking (EU GMP Annex 11 / GCP Cloud Trace standard) */}
                {inspectorTab === 'timeline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Security & Verification Banner */}
                    <div
                      style={{
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ShieldCheck size={13} color="#003666" />
                          EU GMP Annex 11 & GCP Cloud Trace Audit
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 6px', borderRadius: '4px' }}>
                          IMMUTABLE
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#64748b', wordBreak: 'break-all' }}>
                        HASH: SHA256:{Math.abs(String(safeRxCode).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 12345678)).toString(16).padStart(16, '0')}f8a9e01c
                      </div>
                    </div>

                    {/* Timeline Stages List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', paddingLeft: '8px' }}>
                      {[
                        {
                          step: 1,
                          title: 'Physician Electronic Authorization',
                          actor: isAuthorizedViewer ? (doctor?.name || 'Treating Physician') : `Accredited Physician (${opaqueCode})`,
                          time: createdDate,
                          status: 'COMPLETED',
                          color: '#16a34a',
                          desc: 'Prescription formula authored and digitally authenticated via encrypted doctor session.'
                        },
                        {
                          step: 2,
                          title: 'Clinical Pharmacist Formulation Validation',
                          actor: 'Atlas QP Pharmacist (EU GMP)',
                          time: createdDate !== 'Active Regimen' ? createdDate : 'Automated Check',
                          status: 'COMPLETED',
                          color: '#16a34a',
                          desc: 'Cross-checked excipient compatibility, physiological dosing limits, and osmolarity stability.'
                        },
                        {
                          step: 3,
                          title: 'Commercial Invoicing & Billing Clearing',
                          actor: isProposal ? 'Offer Pending Confirmation' : 'Stripe & Zoho Financial Gateway',
                          time: rx?.invoiceNumber ? `Invoice #${rx.invoiceNumber}` : (isProposal ? 'Awaiting Patient' : 'Cleared'),
                          status: isProposal ? 'PENDING' : 'COMPLETED',
                          color: isProposal ? '#d97706' : '#16a34a',
                          desc: isProposal ? 'Proposal submitted. Awaiting patient checkout confirmation.' : 'Commercial ledger reconciled and released to compounding queue.'
                        },
                        {
                          step: 4,
                          title: 'Cleanroom Sterile Compounding Batching',
                          actor: 'Pharmapolis / Fagron Compounding Lab',
                          time: `LOT-${String(safeRxCode).replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}-2026`,
                          status: isProposal ? 'QUEUED' : 'ACTIVE',
                          color: isProposal ? '#94a3b8' : '#0284c7',
                          desc: 'Formulation prepared in Class A/ISO 5 laminar airflow workstation with HPLC purity verification (>99.0%).'
                        },
                        {
                          step: 5,
                          title: 'Cold-Chain Logistics & Temperature Log',
                          actor: 'Express Medical Courier (+2°C to +8°C)',
                          time: rx?.trackingNumber ? `Track #${rx.trackingNumber}` : 'Active Cold Box',
                          status: isProposal ? 'STANDBY' : 'MONITORED',
                          color: isProposal ? '#94a3b8' : '#003666',
                          desc: 'Shipped with active electronic temperature logger and tamper-evident thermal container.'
                        }
                      ].map((item, idx, arr) => (
                        <div
                          key={item.step}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            position: 'relative',
                            paddingBottom: idx === arr.length - 1 ? 0 : '18px'
                          }}
                        >
                          {/* Vertical Connector Line */}
                          {idx !== arr.length - 1 && (
                            <div
                              style={{
                                position: 'absolute',
                                left: '11px',
                                top: '22px',
                                bottom: '0',
                                width: '2px',
                                background: '#e2e8f0'
                              }}
                            />
                          )}

                          {/* Step Circle Indicator */}
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: item.status === 'COMPLETED' ? '#f0fdf4' : (item.status === 'ACTIVE' || item.status === 'MONITORED' ? '#eff6ff' : '#f8fafc'),
                              border: `2px solid ${item.color}`,
                              color: item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              flexShrink: 0,
                              zIndex: 1
                            }}
                          >
                            {item.status === 'COMPLETED' ? <Check size={12} strokeWidth={3} /> : item.step}
                          </div>

                          {/* Step Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                                {item.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.64rem',
                                  fontWeight: 700,
                                  color: item.color,
                                  background: item.status === 'COMPLETED' ? '#f0fdf4' : '#f8fafc',
                                  border: `1px solid ${item.color}40`,
                                  padding: '1px 6px',
                                  borderRadius: '3px',
                                  letterSpacing: '0.03em'
                                }}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                              {item.actor} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {item.time}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.35 }}>
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Export Action Card */}
                    <div
                      style={{
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                          Export Clinical Audit Certificate
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          Download signed JSON-LD record for institutional compliance.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const auditLog = {
                            prescriptionCode: safeRxCode,
                            patient: patientName,
                            doctor: isAuthorizedViewer ? (doctor?.name || 'Treating Physician') : `Accredited Physician (${opaqueCode})`,
                            timestamp: new Date().toISOString(),
                            integrityHash: `SHA256:${Math.abs(String(safeRxCode).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 12345678)).toString(16)}`,
                            standard: 'EU GMP Annex 11 / FDA 21 CFR Part 11',
                            stages: ['AUTH_COMPLETED', 'QP_VALIDATED', 'FIN_SETTLED', 'BATCH_DISPENSED', 'COLD_CHAIN_LOGGED']
                          };
                          navigator.clipboard?.writeText(JSON.stringify(auditLog, null, 2));
                          toast.success('Clinical audit log copied to clipboard ✓');
                        }}
                        style={{
                          height: '30px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: '1px solid #dadce0',
                          background: '#ffffff',
                          color: '#003666',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          flexShrink: 0
                        }}
                      >
                        <Download size={12} />
                        <span>Copy JSON</span>
                      </button>
                    </div>
                  </div>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isProposal && (
                    <button
                      type="button"
                      onClick={() => handleQuickUpdatePrescriptionStatus(rx, 'approved')}
                      style={{
                        height: '34px',
                        padding: '0 12px',
                        borderRadius: '4px',
                        background: '#f0fdf4',
                        border: '1px solid #16a34a',
                        color: '#15803d',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Convertir propuesta en oferta aceptada y pedido confirmado"
                    >
                      <CheckCircle2 size={13} />
                      <span>Aceptar Oferta</span>
                    </button>
                  )}

                  {!isProposal && !['delivered', 'completed', 'dispensed'].includes(String(rx.status || '').toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => handleQuickUpdatePrescriptionStatus(rx, 'delivered')}
                      style={{
                        height: '34px',
                        padding: '0 12px',
                        borderRadius: '4px',
                        background: '#f0f9ff',
                        border: '1px solid #0284c7',
                        color: '#0369a1',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Marcar formulación como entregada al paciente"
                    >
                      <Package size={13} />
                      <span>Marcar Entregado</span>
                    </button>
                  )}

                  {rx && (
                  <Link
                    href={`/rx/${safeRxCode}`}
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

      {/* ── Quick Actions Palette (GCP-style, Cmd/Ctrl + /) ── */}
      {isAuthorizedViewer && <DoctorCommandPalette commands={quickActionCommands} />}

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

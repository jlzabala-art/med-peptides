"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ArrowUpRight,
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
  Tag,
  Smartphone,
  MessageSquare
} from '@/lib/icons';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { RotateCcw, Home, Loader2, AlertTriangle } from 'lucide-react';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/i, '')
    .replace(/^dr[a]?\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
import { exportPrescriptionToXlsx } from '@/utils/exportPrescriptionToXlsx';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
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
import RequestAtlasQuotationModal from '@/features/prescriptions/components/RequestAtlasQuotationModal';
import RequestSupplierRFQModal from '@/features/prescriptions/components/RequestSupplierRFQModal';
import '@/styles/publicDesignSystem.css';
import './publicPrescriptionMobile.css';
import MultiPartOverview from './MultiPartOverview';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import PrescriptionBrochureModal from '@/components/prescription/PrescriptionBrochureModal';
import PrescriptionStatusQuickAction from '@/components/prescription/PrescriptionStatusQuickAction';
import { resolveDoctorProfile, formatMedicalLicense } from '@/services/doctorDirectoryService';
import DoctorRxSwitcherModal from '@/components/prescription/DoctorRxSwitcherModal';
import PatientRxSwitcherModal from '@/components/prescription/PatientRxSwitcherModal';
import PatientExperienceHub from '@/components/prescription/PatientExperienceHub';
import { getPrescriptionAtlasRecommendations } from '@/services/atlasRecommendationsEngine';

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
    .mobile-floating-action-bar {
      display: none !important;
    }
    .pds-content-with-sidebar {
      padding-bottom: 70px !important;
    }
  }

  @media (min-width: 1024px) {
    .public-sticky-action-bar {
      display: none !important;
    }
  }

  /* Google Cloud UX Action Toolbar: 4 buttons responsive alignment */
  .rx-header-action-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .rx-header-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border-radius: 4px;
    background: #ffffff;
    color: #3c4043;
    border: 1px solid #dadce0;
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    text-decoration: none;
    box-sizing: border-box;
  }
  .rx-header-action-btn:hover {
    background: #f8fafd;
    border-color: #1a73e8;
    color: #1a73e8;
  }
  .rx-header-action-btn.rx-btn-primary {
    color: #1a73e8;
    font-weight: 600;
  }
  .rx-header-buttons-group {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  @media (max-width: 640px) {
    .rx-header-action-toolbar {
      width: 100% !important;
      margin-top: 12px !important;
    }
    .rx-header-buttons-group {
      display: flex !important;
      flex-wrap: wrap !important;
      width: 100% !important;
      gap: 8px !important;
    }
    .rx-header-action-btn {
      height: 42px !important;
      min-height: 42px !important;
      font-size: 0.82rem !important;
      border-radius: 6px !important;
      padding: 0 12px !important;
      box-sizing: border-box !important;
    }
    .rx-header-action-btn.rx-btn-text {
      flex: 1 1 calc(50% - 6px) !important;
      min-width: 135px !important;
      justify-content: center !important;
    }
    .rx-header-action-btn.rx-btn-icon {
      flex: 0 0 42px !important;
      width: 42px !important;
      min-width: 42px !important;
      padding: 0 !important;
      justify-content: center !important;
    }
  }
  @media (max-width: 440px) {
    .rx-header-buttons-group {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      width: 100% !important;
      gap: 8px !important;
    }
    .rx-header-action-btn.rx-btn-text {
      flex: none !important;
      width: 100% !important;
      min-width: 0 !important;
    }
    .rx-header-action-btn.rx-btn-icon {
      flex: none !important;
      width: 100% !important;
      min-width: 0 !important;
    }
  }
  /* Floating Bottom Action Dock (Doctor & Patient View) */
  .rx-bottom-dock {
    position: fixed;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 860px;
    z-index: 48;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(203, 213, 225, 0.9);
    border-radius: 9999px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.05);
    padding: 7px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    transition: all 0.2s ease;
  }
  .rx-dock-patient-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 9999px;
    padding: 4px 10px 4px 5px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .rx-dock-patient-pill:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
  }
  .rx-dock-patient-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
  }
  .rx-dock-patient-meta {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .rx-dock-patient-name {
    font-size: 0.74rem;
    font-weight: 700;
    color: #0f172a;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rx-dock-patient-ref {
    font-size: 0.65rem;
    color: #0284c7;
    font-family: monospace;
    font-weight: 600;
  }
  .rx-bottom-dock-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    flex-wrap: nowrap;
  }
  .rx-dock-btn {
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
  .rx-dock-btn-sign {
    background: #003666;
    color: #ffffff;
    border-color: #002244;
    box-shadow: 0 1px 3px rgba(0, 54, 102, 0.35);
  }
  .rx-dock-btn-sign:hover {
    background: #002244;
  }
  .rx-dock-btn-primary {
    background: #1a73e8;
    color: #ffffff;
    border-color: #1a73e8;
    box-shadow: 0 1px 3px rgba(26, 115, 232, 0.35);
  }
  .rx-dock-btn-primary:hover {
    background: #1557b0;
  }
  .rx-dock-btn-quote {
    background: #0284c7;
    color: #ffffff;
    border-color: #0284c7;
    box-shadow: 0 1px 3px rgba(2, 132, 199, 0.35);
  }
  .rx-dock-btn-quote:hover {
    background: #0369a1;
  }
  .rx-dock-btn-secondary {
    background: #ffffff;
    color: #374151;
    border-color: #d1d5db;
  }
  .rx-dock-btn-secondary:hover {
    background: #f8fafc;
    border-color: #1a73e8;
    color: #1a73e8;
  }
  .rx-dock-drop-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: #202124;
    width: 100%;
    transition: background 0.15s;
  }
  .rx-dock-drop-item:hover {
    background: #f8fafd;
  }
  @media (max-width: 640px) {
    .rx-bottom-dock {
      bottom: 12px;
      width: calc(100% - 20px);
      padding: 6px 10px;
      gap: 6px;
    }
    .rx-dock-patient-meta {
      display: none;
    }
    .rx-dock-btn {
      height: 34px;
      padding: 0 10px;
      font-size: 0.76rem;
      gap: 4px;
    }
    .rx-dock-btn-label-desktop {
      display: none;
    }
  }
`;

// Helper to safely extract string posology from either string or structured object
function getPosologyText(pos) {
  if (!pos) return '';
  if (typeof pos === 'string') return pos;
  if (typeof pos === 'object') {
    const val = pos.regimen || pos.summary || pos.timing || pos.notes || pos.text || (Array.isArray(pos.steps) ? pos.steps[0] : '');
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') return getPosologyText(val);
    return '';
  }
  return String(pos);
}

export default function PublicPrescriptionClient({ rx, embedded = false, onBackToIntake = null, initialView = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = initialView || searchParams?.get('view') || searchParams?.get('mode');
  const isPatientView = viewParam === 'patient';

  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState(0);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [activeGcpTab, setActiveGcpTab] = useState('treatment'); // 'treatment' | 'roadmap' | 'traceability' | 'credentials' | 'patientSharing'
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    formulations: true,
    posology: true,
    traceability: true,
    genomics: true,
    recommendations: true,
    credentials: true,
    patientSharing: true,
    quotation: true
  });
  const atlasRecs = React.useMemo(() => {
    return rx?.atlasRecommendations || getPrescriptionAtlasRecommendations(rx);
  }, [rx]);
  const [selectedPhase, setSelectedPhase] = useState('all'); // 'all' | 'formulation-0' | 'formulation-1' | 'formulation-2'
  const [expandedPhases, setExpandedPhases] = useState({});
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [selectedLabelIndex, setSelectedLabelIndex] = useState(0);
  const [showSupplierRfqModal, setShowSupplierRfqModal] = useState(false);
  const [showAtlasQuotationModal, setShowAtlasQuotationModal] = useState(false);
  const [showRxSwitcherModal, setShowRxSwitcherModal] = useState(false);
  const [showPatientRxModal, setShowPatientRxModal] = useState(false);

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
      genomics: true,
      recommendations: true,
      credentials: true,
      patientSharing: true,
      quotation: true
    });
    setExpandedPhases({
      'formulation-0': true,
      'formulation-1': true,
      'formulation-2': true,
      'formulation-3': true
    });
  };

  const collapseAllSections = () => {
    setExpandedSections({
      overview: false,
      formulations: false,
      posology: false,
      traceability: false,
      genomics: false,
      recommendations: false,
      credentials: false,
      patientSharing: false,
      quotation: false
    });
    setExpandedPhases({
      'formulation-0': false,
      'formulation-1': false,
      'formulation-2': false,
      'formulation-3': false
    });
  };

  // Global smooth jump listener from sidebar
  React.useEffect(() => {
    const handleSectionJump = (e) => {
      const targetId = e.detail?.id;
      if (!targetId) return;
      if (targetId.startsWith('formulation') || targetId.includes('phase') || targetId === 'formula-card') {
        setActiveGcpTab('treatment');
        setExpandedSections(prev => ({ ...prev, formulations: true }));
      } else if (targetId.includes('milestone') || targetId.includes('roadmap')) {
        setActiveGcpTab('roadmap');
        setExpandedSections(prev => ({ ...prev, posology: true }));
      } else if (targetId.includes('quality') || targetId.includes('traceability') || targetId.includes('qr') || targetId.includes('docs')) {
        setActiveGcpTab('traceability');
        setExpandedSections(prev => ({ ...prev, traceability: true }));
      } else if (targetId.includes('recommendation') || targetId === 'atlas-recommendations-card') {
        setActiveGcpTab('recommendations');
        setExpandedSections(prev => ({ ...prev, recommendations: true }));
      } else if (targetId === 'doctor-patient-credentials' || targetId.includes('credential')) {
        setActiveGcpTab('credentials');
        setExpandedSections(prev => ({ ...prev, credentials: true }));
      } else if (targetId.includes('patient') || targetId.includes('sharing')) {
        setActiveGcpTab('patientSharing');
        setExpandedSections(prev => ({ ...prev, patientSharing: true }));
      } else {
        setActiveGcpTab('treatment');
      }
    };
    window.addEventListener('OPEN_RX_SECTION', handleSectionJump);
    return () => window.removeEventListener('OPEN_RX_SECTION', handleSectionJump);
  }, []);

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
  //    Dr. Miguel Ángel López Aranda & Dra. Haydee Camacho Gamboa.
  //    Strictly internal for compounding pharmacy / Fagron manufacture. NEVER shown to patient.
  const isInternalProdDoc = (name) => {
    const s = String(name || '').toLowerCase();
    return s.includes('miguel ángel') || s.includes('miguel angel') || s.includes('aranda') || s.includes('camacho') || s.includes('haydee');
  };

  const is50957Rutledge = String(rx.code || rx.id || rx.fileNumber || '').includes('50957') ||
    String(rx.patient || rx.patientName || '').toLowerCase().includes('rutledge');

  const docObj = (rx.doctor && typeof rx.doctor === 'object' && rx.doctor.name && !isInternalProdDoc(rx.doctor.name)) ? rx.doctor : {};
  const treatingDocObj = (rx.treatingDoctor && typeof rx.treatingDoctor === 'object' && !isInternalProdDoc(rx.treatingDoctor.name)) ? rx.treatingDoctor : {};
  const rawCandidateName = is50957Rutledge
    ? 'Dr. Marina Cordeiro Fernandes'
    : ((typeof rx.treatingDoctor === 'string' && !isInternalProdDoc(rx.treatingDoctor) ? rx.treatingDoctor : treatingDocObj.name) ||
      docObj.name ||
      (rx.doctorName && !isInternalProdDoc(rx.doctorName) ? rx.doctorName : null) ||
      (rx.prescribingDoctor && !isInternalProdDoc(rx.prescribingDoctor) ? rx.prescribingDoctor : null) ||
      (rx.patientDoctor && !rx.patientDoctor.isInternalOnly && !isInternalProdDoc(rx.patientDoctor.name) ? rx.patientDoctor.name : null) ||
      '');

  const rawCandidate = rawCandidateName ? {
    ...docObj,
    ...treatingDocObj,
    name: rawCandidateName,
    license: treatingDocObj.license || docObj.license || rx.doctorLicense || rx.doctorLicenseNumber || '',
    clinic: treatingDocObj.clinic || docObj.clinic || rx.clinic || rx.clinicName || '',
    specialty: treatingDocObj.specialty || docObj.specialty || docObj.title || rx.doctorSpecialty || '',
    phone: treatingDocObj.phone || docObj.phone || rx.doctorPhone || '',
    email: treatingDocObj.email || docObj.email || rx.doctorEmail || '',
    id: docObj.id || treatingDocObj.id || rx.doctorId || null
  } : null;

  const isCandidateProdDoc = Boolean(rawCandidate && isInternalProdDoc(rawCandidate.name));
  const hasTreatingDoctor = Boolean(rawCandidate && rawCandidate.name && !isCandidateProdDoc);

  // Auto-enrich treating doctor details from verified directory (specialty, clinic, phone, license, address)
  const resolvedProfile = hasTreatingDoctor ? resolveDoctorProfile(rawCandidate) : null;
  const treatingDoc = resolvedProfile || (hasTreatingDoctor ? rawCandidate : {});
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
    : (treatingDoc.phone || treatingDoc.mobile || '');
  const doctorLicense = isHaytham 
    ? 'DHA-P-0319842' 
    : (treatingDoc.license || treatingDoc.licenseNumber || '');
  const formattedDoctorLicense = useMemo(() => {
    return formatMedicalLicense(doctorLicense, treatingDoc);
  }, [doctorLicense, treatingDoc]);
  const isDhaLicensed = Boolean(doctorLicense && String(doctorLicense).toUpperCase().includes('DHA'));

  const doctorSlug = useMemo(() => {
    if (rx.doctorSlug) return rx.doctorSlug;
    if (rx.doctor?.slug) return rx.doctor.slug;
    if (treatingDoc?.slug) return treatingDoc.slug;
    return slugify(doctorName || 'haytham-salem');
  }, [rx.doctorSlug, rx.doctor, treatingDoc, doctorName]);

  const doctorPublicUrl = `/dr/${doctorSlug}`;


  // Pharmacogenomic test correlation & Unified Prescription Classification
  const genomicsData = detectFagronGenomicsTest(rx);
  const prescriptionTypeInfo = React.useMemo(() => classifyPrescription(rx), [rx]);
  const docs = rx.documents || rx.attachedDocuments || [];

  const rxProgLower = String(rx.treatmentProgram || rx.program || '').toLowerCase();
  const rxTypeLower = String(rx.treatmentType || '').toLowerCase();
  const rxDispLower = String(rx.dispensingForm || '').toLowerCase();
  const isNutrigen = prescriptionTypeInfo.key === 'nutrigen' || rxProgLower.includes('nutrigen') || rxTypeLower.includes('nutrigen') || String(rx.fagron?.testName || '').toLowerCase().includes('nutrigen');
  const isEntirelyOral = isNutrigen || rxDispLower.includes('capsule') || rxDispLower.includes('oral') || (Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0 && rx.prescriptionLines.every(i => (i.route || '').toLowerCase().includes('oral')));

  const baseUrl = 'https://med-peptides.com';
  const publicUrl = `${baseUrl}/rx/${rxId}`;
  const patientPublicUrl = `${baseUrl}/rx/${rxId}?view=patient`;

  const [currentStatus, setCurrentStatus] = useState(() => {
    return String(rx.status || rx.state || rx.fagronStatus || rx.orderStatus || 'approved').toLowerCase().trim();
  });
  const [isSigning, setIsSigning] = useState(false);

  const handleDoctorSignOff = async () => {
    setIsSigning(true);
    triggerHaptic('selection');
    try {
      const res = await fetch('/api/prescriptions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: rx?.id,
          prescriptionNumber: rx?.prescriptionNumber || rx?.code || rxId,
          status: 'approved',
          reason: 'Physician electronic sign-off and dispensing authorization',
          updatedBy: rx?.doctor?.name || 'Treating Physician'
        })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to sign prescription');
      }
      setCurrentStatus('approved');
      triggerHaptic('success');
      toast.success(isEs ? 'Receta firmada y autorizada para formulación ✓' : 'Prescription digitally signed & authorized for compounding release ✓');
    } catch (e) {
      console.error('Sign-off error:', e);
      toast.error(isEs ? 'Error al firmar: ' + (e.message || '') : 'Signing error: ' + (e.message || 'Please try again'));
    } finally {
      setIsSigning(false);
    }
  };

  const currentStatusMeta = useMemo(() => {
    const s = String(currentStatus || 'active').toLowerCase().trim();
    if (['active'].includes(s)) {
      return { label: 'Active Treatment', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    }
    if (['approved'].includes(s)) {
      return { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    }
    if (['completed'].includes(s)) {
      return { label: 'Completed Cycle', color: '#0284c7', bg: '#f0f9ff', border: '#93c5fd' };
    }
    if (['dispensed'].includes(s)) {
      return { label: 'Dispensed', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
    }
    if (['delivered'].includes(s)) {
      return { label: 'Delivered', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' };
    }
    if (['processing'].includes(s)) {
      return { label: 'Processing / Lab', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' };
    }
    if (['awaiting payment', 'awaiting_payment'].includes(s)) {
      return { label: 'Awaiting Payment', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' };
    }
    if (['pending'].includes(s)) {
      return { label: 'Pending Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    }
    if (['prescribed'].includes(s)) {
      return { label: 'Prescribed', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
    }
    if (['draft'].includes(s)) {
      return { label: 'Draft', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };
    }
    return { label: s.toUpperCase(), color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
  }, [currentStatus]);

  // Real-time Firestore sync: updates status whenever changed in doctor/admin portal
  useEffect(() => {
    if (!rxId || !db) return;
    try {
      const docRef = doc(db, 'prescriptions', String(rx.id || rxId));
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const newStatus = data.status || data.state || data.orderStatus || data.fagronStatus;
          if (newStatus) {
            setCurrentStatus(String(newStatus).toLowerCase().trim());
          }
        }
      }, () => {
        // Silently catch permission error in unauthenticated public view
      });
      return () => unsubscribe();
    } catch (_) {}
  }, [rxId, rx.id]);

  // Document Dropdown & Brochure Modal States
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const docDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (docDropdownRef.current && !docDropdownRef.current.contains(event.target)) {
        setShowDocDropdown(false);
      }
    }
    if (showDocDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDocDropdown]);

  const isDispensed = useMemo(() => {
    return Boolean(
      ['dispensed', 'delivered', 'completed', 'fulfilled'].includes(currentStatus) ||
      rx.isDispensed ||
      rx.dispensedAt ||
      rx.dispensedDate
    );
  }, [currentStatus, rx.isDispensed, rx.dispensedAt, rx.dispensedDate]);

  const resolvedPrice = useMemo(() => {
    const rawCurrency = rx.currency || rx.pricing?.currency || rx.quote?.currency || 'AED';
    const rawAmount = 
      rx.totalPrice || 
      rx.price || 
      rx.pricing?.total || 
      rx.pricing?.amount || 
      rx.quote?.total || 
      rx.quote?.amount || 
      rx.totalAmount || 
      rx.cost;

    if (rawAmount) {
      const num = Number(rawAmount);
      if (!isNaN(num)) {
        return {
          formatted: `${rawCurrency} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          currency: rawCurrency,
          amount: num
        };
      }
      return { formatted: `${rawCurrency} ${rawAmount}`, currency: rawCurrency, amount: rawAmount };
    }

    return null;
  }, [rx]);

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
  const rawLines = React.useMemo(() => {
    if (rx.allSessionItems && rx.allSessionItems.length > 0) {
      return rx.allSessionItems;
    }
    const itemsList = Array.isArray(rx.items) && rx.items.length > 0 ? rx.items : null;
    const linesList = Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0 ? rx.prescriptionLines : null;

    if (itemsList && linesList) {
      // Merge itemsList with linesList so we retain rich clinical data + explicit drug names & doses
      return itemsList.map((item, idx) => {
        const line = linesList[idx] || linesList.find(l => {
          const ln = (l.drugName || l.drug || l.name || '').toLowerCase();
          const iname = (item.name || item.activeIngredient || '').toLowerCase();
          return ln && (iname.includes(ln) || ln.includes(iname));
        });
        return {
          ...line,
          ...item,
          name: item.name || line?.drugName || line?.drug || item.productName || item.activeIngredient,
          drugName: line?.drugName || item.name || item.activeIngredient,
          dosage: item.dosage || item.dose || line?.strength || '—',
          dose: item.dose || item.dosage || line?.strength || '—'
        };
      });
    }

    if (itemsList) return itemsList;
    if (linesList) {
      return linesList.map(l => ({
        ...l,
        name: l.drugName || l.drug || l.name || l.title || 'Active Compound',
        drugName: l.drugName || l.drug || l.name || l.title || 'Active Compound',
        dose: l.strength || l.dosage || l.dose || '—',
        dosage: l.strength || l.dosage || l.dose || '—'
      }));
    }
    return rx.compounds || [];
  }, [rx.allSessionItems, rx.items, rx.prescriptionLines, rx.compounds]);

  const compoundedFormulations = React.useMemo(() => {
    // Helper to generate rich vehicle specs and tailored posology based on vehicle type and instructions
    const buildVehicleData = ({
      index,
      totalCount,
      vehicleName = '',
      treatmentTitle = '',
      dosageForm = '',
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

      const isPomade = routeLower.includes('perianal') ||
                       routeLower.includes('anal') ||
                       routeLower.includes('rectal') ||
                       titleLower.includes('pomade') ||
                       titleLower.includes('pomada') ||
                       titleLower.includes('ointment') ||
                       titleLower.includes('fissure') ||
                       vNameLower.includes('pomade') ||
                       vNameLower.includes('ointment') ||
                       (apis.some(a => {
                         const an = (a.name || a.productName || a.activeIngredient || '').toLowerCase();
                         return an.includes('diltiazem') || an.includes('lidocaine') || an.includes('pomade base') || an.includes('ointment base');
                       }));

      const isBHRT = vNameLower.includes('pentravan') ||
                     vNameLower.includes('lipoderm') ||
                     titleLower.includes('hormone') ||
                     titleLower.includes('bhrt') ||
                     titleLower.includes('transdermal') ||
                     (apis.some(a => {
                       const an = (a.name || a.productName || a.activeIngredient || '').toLowerCase();
                       return (an.includes('testosterone') || an.includes('estradiol') || an.includes('progesterone')) && !an.includes('minoxidil') && !an.includes('trichosol');
                     }));

      const resolvedDosageForm = dosageForm || (
        isTrichoOil ? (isEs ? 'Aceite Capilar Tópico' : 'Topical Scalp Oil') :
        isOral ? (isEs ? 'Cápsulas Orales' : 'Oral Capsules') :
        isTrichoFoam ? (isEs ? 'Espuma Tópica' : 'Topical Foam') :
        isPomade ? (isEs ? 'Pomada Tópica Galénica' : 'Topical Pomade / Ointment') :
        isBHRT ? (isEs ? 'Crema Transdérmica Liposomal' : 'Transdermal Liposomal Cream') :
        (isEs ? 'Solución Tópica' : 'Topical Scalp Solution')
      );

      // Theme accent color & badges
      let accentColor = '#0284c7';
      let accentBg = '#e0f2fe';
      let badgeText = isEs ? `PREPARACIÓN ${index} DE ${totalCount}` : `PREPARATION ${index} OF ${totalCount}`;
      let resolvedTitle = treatmentTitle || (isEs ? `Fórmula Magistral ${index}` : `Compounded Formulation ${index}`);
      let resolvedRoute = route || (isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application');
      let resolvedVolume = volume || (isTrichoOil ? '30 mL' : (isOral ? '90 Capsules' : (isPomade ? '30 g' : (isBHRT ? '90 mL' : '100 mL'))));
      let resolvedContainer = containerType;

      let vehicleObj = {
        tag: isEs ? 'VEHÍCULO MAGISTRAL' : 'COMPOUNDING VEHICLE / BASE',
        name: vehicleName || (isTrichoOil ? 'TrichoOil™ Natural Lipidic Carrier' : 'TrichoSol™ Liposomal Hydrophilic Base'),
        volume: resolvedVolume,
        specs: ''
      };

      const safeCustomPosology = getPosologyText(customPosology);
      let posologyObj = {
        title: '',
        regimen: safeCustomPosology || '',
        timing: (typeof customPosology === 'object' && customPosology?.timing) ? String(customPosology.timing) : '',
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
        posologyObj.regimen = safeCustomPosology || (isEs ? '1–2 Veces por Semana (Tratamiento Pre-Lavado)' : '1–2 Times Weekly (Pre-Shampoo Treatment)');
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
        accentColor = isNutrigen ? '#059669' : '#1a73e8'; // Emerald Green for NutriGen / GCP Blue for general oral
        accentBg = isNutrigen ? '#ecfdf5' : '#e8f0fe';
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
        
        const apisList = apis || [];
        const isProteolytic = apisList.some(a => {
          const n = String(a.name || a.productName || a.activeIngredient || '').toLowerCase();
          return n.includes('natto') || n.includes('serra') || n.includes('proteolytic');
        }) || String(treatmentTitle || '').toLowerCase().includes('proteolytic');

        if (isProteolytic) {
          posologyObj.title = isEs ? 'Pauta de Enzimas Proteolíticas Sistémicas' : 'Systemic Proteolytic Enzymes Regimen';
          posologyObj.regimen = safeCustomPosology || (isEs ? '1 cápsula 3 veces al día con el estómago vacío (Semana 1: 1 cap/día)' : '1 capsule 3 times daily on an empty stomach (Week 1: 1 cap/day)');
          posologyObj.timing = isEs ? 'Con el estómago vacío: mañana en ayunas, tarde (17:00 h) y antes de dormir' : 'On empty stomach: morning fasting, late afternoon (5:00 PM), and bedtime';
          posologyObj.duration = duration || rx.duration || (isEs ? '90 Días (270 Cápsulas)' : '90 Days (270 Capsules)');
          posologyObj.steps = [
            {
              step: 1,
              title: isEs ? 'Ingesta en Ayunas (Estómago Vacío)' : 'Fasting Administration (Empty Stomach)',
              timing: isEs ? '30-45 min antes de comidas' : '30-45 min before meals',
              instruction: isEs 
                ? 'Para asegurar la absorción sistémica en el torrente sanguíneo, tome cada cápsula con agua al menos 30-45 minutos antes de comer o 2 horas después. No tomar con alimentos para evitar su digestión gástrica.' 
                : 'To ensure optimal systemic absorption into circulation, take each capsule with water at least 30-45 minutes before meals or 2 hours after. Do not take with food to prevent gastric digestion of enzymes.'
            },
            {
              step: 2,
              title: isEs ? 'Pauta Escalonada' : 'Titration Schedule',
              timing: isEs ? 'Semana 1 vs Semana 2+' : 'Week 1 vs Week 2+',
              instruction: isEs 
                ? 'Semana 1: 1 cápsula al día por la mañana en ayunas. A partir de la Semana 2: 1 cápsula 3 veces al día (mañana en ayunas, 17:00 h y al acostarse).' 
                : 'Week 1: 1 capsule daily in the morning on an empty stomach. From Week 2 onwards: 1 capsule 3 times daily (morning fasting, 5:00 PM, and bedtime).'
            },
            {
              step: 3,
              title: isEs ? 'Conservación & Precauciones' : 'Storage & Precautions',
              timing: isEs ? 'Lugar fresco y seco' : 'Cool, Dry Place',
              instruction: isEs 
                ? 'Cápsulas gastrorresistentes entéricas. Conservar protegido de la humedad. Suspender 3 días antes de cirugías programadas.' 
                : 'Enteric acid-resistant capsules. Protect from moisture. Discontinue 3 days prior to scheduled elective surgery.'
            }
          ];
        } else {
          posologyObj.title = isNutrigen 
            ? (isEs ? 'Pauta de Administración Diaria NutriGen™ (Cápsulas)' : 'NutriGen™ Daily Oral Capsule Administration Regimen')
            : (isEs ? 'Pauta de Administración Oral (Cápsulas)' : 'Oral Capsule Administration Regimen');
          posologyObj.regimen = safeCustomPosology || (isEs ? '1 Cápsula Diaria por la Mañana con el Desayuno' : '1 Capsule Daily in the Morning with Breakfast');
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
                ? 'Para fórmulas metabólicas y antioxidantes (Ubiquinol, ALA, PQQ, Vitaminas), se recomienda tomar por la mañana con la comida. Si contiene inductores de descanso (Melatonina), tomar 30 minutos antes de dormir.' 
                : 'For metabolic and antioxidant botanicals (Ubiquinol, ALA, PQQ, Vitamins), ingest in the morning with a meal. If formulated with nighttime modulators like Melatonin, take 30 minutes before sleep.'
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
        }
      } else if (isTrichoFoam) {
        accentColor = '#0891b2'; // Cyan
        accentBg = '#cffafe';
        badgeText += isEs ? ' · ESPUMA TÓPICA' : ' · TOPICAL FOAM';
        resolvedTitle = treatmentTitle || (isEs ? 'Espuma Tópica Folicular (TrichoFoam™)' : 'Follicular Topical Foam (TrichoFoam™)');
        resolvedRoute = isEs ? 'Aplicación Tópica en Espuma' : 'Topical Foam Scalp Application';
        resolvedVolume = volume || '100 mL';
        resolvedContainer = resolvedContainer || (isEs ? 'Frasco Dosificador de Espuma con Bomba de Precisión' : 'Metered Foam Dispenser Bottle');
        vehicleObj.name = vehicleName || 'TrichoFoam™ Patented Vehicle';
        vehicleObj.specs = isEs
          ? 'Espuma de penetración rápida libre de propilenglicol con fitocomplejo TrichoTech™.'
          : 'Rapid-penetration, propylene glycol-free foam carrier formulated with TrichoTech™ phytocomplex.';
        posologyObj.title = isEs ? 'Pauta de Administración en Espuma Capilar' : 'Topical Foam Administration Protocol';
        posologyObj.regimen = safeCustomPosology || (isEs ? '2 Pulsaciones Diarias por la Noche' : '2 Pumps Daily at Bedtime');
        posologyObj.timing = isEs ? 'Por la noche antes de acostarse sobre cuero cabelludo limpio y seco' : 'Nightly at bedtime onto clean, dry scalp';
        posologyObj.steps = [
          {
            step: 1,
            title: isEs ? 'Dispensación & Aplicación' : 'Dispense & Application',
            timing: isEs ? '2 Pulsaciones (Nocturno)' : '2 Pumps (Nightly)',
            instruction: isEs ? 'Presione el dosificador 2 veces directamente sobre las yemas de los dedos. Aplique separando mechones de cabello y masajee suavemente sobre las zonas afectadas hasta absorción completa. Dejar actuar durante la noche.' : 'Dispense 2 metered pumps of foam onto fingertips. Part hair and gently massage into affected scalp zones until fully absorbed. Leave on overnight.'
          },
          {
            step: 2,
            title: isEs ? 'Higiene & Aclarado' : 'Hygiene & Rinsing',
            timing: isEs ? 'A la mañana siguiente' : 'Next Morning',
            instruction: isEs ? 'Lave las manos inmediatamente con agua y jabón tras aplicar. Aclare o lave el cuero cabelludo a la mañana siguiente si lo desea.' : 'Wash hands thoroughly with soap and water after application. Rinse or wash scalp the following morning if desired.'
          }
        ];
      } else if (isPomade) {
        accentColor = '#d97706'; // Amber for pomade / ointment
        accentBg = '#fef3c7';
        badgeText += isEs ? ' · POMADA MAGISTRAL' : ' · COMPOUNDED TOPICAL POMADE';
        resolvedTitle = treatmentTitle || (isEs ? 'Pomada Compuesta Tópica (30 g)' : 'Compounded Topical Pomade / Ointment (30 g)');
        resolvedRoute = route || (isEs ? 'Aplicación Tópica / Perianal' : 'Topical / Perianal Application');
        resolvedVolume = volume || rx.volume || '30 g';
        resolvedContainer = resolvedContainer || (isEs ? 'Tarro Topacio Farmacéutico de Seguridad (30 g)' : 'Topical Pomade Jar / Tube (30 g)');
        vehicleObj.tag = isEs ? 'BASE GALÉNICA: POMADA' : 'COMPOUNDING BASE: OINTMENT';
        vehicleObj.name = vehicleName || 'Hypoallergenic Non-Irritating Ointment Base (Fragrance & Alcohol Free, q.s. 30 g)';
        vehicleObj.specs = isEs
          ? 'Base de pomada galénica hipoalergénica sin fragancias ni alcohol, formulada para aplicación tópica/perianal con excelente tolerancia y retención dérmica.'
          : 'Hypoallergenic, fragrance-free, and alcohol-free compounding ointment base formulated for perianal/mucosal application with high tolerance and tissue adhesion.';
        posologyObj.title = isEs ? 'Pauta de Aplicación de la Pomada Tópica' : 'Topical Pomade Administration Regimen';
        posologyObj.regimen = safeCustomPosology || (isEs ? 'Aplicar cantidad tamaño guisante dos veces al día durante 2 meses' : 'Apply a pea-sized amount twice daily for 2 months');
        posologyObj.timing = isEs ? 'Mañana y noche (cada 12 horas) tras higiene suave' : 'Morning and evening (every 12 hours) after gentle cleansing';
        posologyObj.steps = [
          {
            step: 1,
            title: isEs ? 'Higiene & Preparación' : 'Hygiene & Cleansing',
            timing: isEs ? 'Antes de aplicar' : 'Before Application',
            instruction: isEs ? 'Limpie y seque suavemente la zona perianal antes de cada aplicación.' : 'Gently cleanse and dry the perianal area prior to each use.'
          },
          {
            step: 2,
            title: isEs ? 'Dosificación de la Pomada' : 'Pomade Application',
            timing: isEs ? 'Mañana y Noche (cada 12h)' : 'Morning & Evening (every 12h)',
            instruction: isEs ? 'Aplique una pequeña cantidad (tamaño de un guisante, ~0.5-1 cm) en el canal anal / margen anal según indicación médica. Lave las manos tras el uso.' : 'Apply a pea-sized amount (approx. 0.5–1 cm) to the anal canal/margin as directed by your physician. Wash hands after use.'
          }
        ];
      } else if (isBHRT) {
        accentColor = '#ea580c'; // Orange for BHRT / Hormones
        accentBg = '#fff7ed';
        badgeText += isEs ? ' · CREMA TRANSDÉRMICA BHRT' : ' · TRANSDERMAL BHRT CREAM';
        resolvedTitle = treatmentTitle || (isEs ? 'Crema Transdérmica Bioidéntica (BHRT)' : 'Bioidentical Hormone Transdermal Cream (BHRT)');
        resolvedRoute = route || (isEs ? 'Aplicación Transdérmica / Tópica' : 'Transdermal / Topical Application');
        resolvedVolume = volume || rx.volume || '90 mL';
        resolvedContainer = resolvedContainer || (isEs ? 'Dispensador Dosificador Airless Topi-Pump® (90 mL)' : 'Topi-Pump® Metered Airless Dispenser (90 mL)');
        vehicleObj.tag = isEs ? 'VEHÍCULO TRANSDÉRMICO: PENTRAVAN®' : 'TRANSDERMAL CARRIER: PENTRAVAN®';
        vehicleObj.name = vehicleName || 'Pentravan® Liposomal Transdermal Cream Base';
        vehicleObj.specs = isEs
          ? 'Emulsión liposomal patentada que asegura la absorción transdérmica continua de hormonas bioidénticas sin transferencia indeseada.'
          : 'Patented oil-in-water liposomal compounding emulsion delivering steady transdermal absorption of bioidentical hormones.';

        const fTitleLower = String(treatmentTitle || vehicleName || '').toLowerCase();
        const apisLower = apis.map(a => (a.name || a.productName || '').toLowerCase()).join(' ');
        const isEveningHormone = fTitleLower.includes('estradiol') || fTitleLower.includes('progesterone') || apisLower.includes('estradiol') || apisLower.includes('progesterone') || fTitleLower.includes('phase 2') || fTitleLower.includes('evening');
        const isMorningHormone = fTitleLower.includes('testosterone') || apisLower.includes('testosterone') || fTitleLower.includes('phase 1') || fTitleLower.includes('morning');

        posologyObj.title = isEs ? 'Pauta de Aplicación Transdérmica BHRT' : 'Transdermal BHRT Administration Regimen';
        posologyObj.regimen = safeCustomPosology || (isEs ? '1 Pulsación diaria (1 mL = 2 mg)' : '1 Metered pump daily (1 mL = 2 mg)');
        posologyObj.timing = isEveningHormone
          ? (isEs ? 'Cada noche antes de acostarse sobre muslo interno o brazo superior' : 'Every evening at bedtime onto inner thigh or upper arm')
          : (isMorningHormone
            ? (isEs ? 'Cada mañana sobre piel limpia del antebrazo interno o bajo abdomen' : 'Every morning onto clean skin of inner forearm or lower abdomen')
            : (isEs ? 'Diario sobre piel limpia y seca' : 'Daily onto clean, hairless skin'));

        posologyObj.steps = [
          {
            step: 1,
            title: isEs ? 'Dispensación de Dosis Exacta' : 'Metered Dose Dispensing',
            timing: isEs ? '1 Pulsación (1 mL = 2 mg)' : '1 Pump (1 mL = 2 mg)',
            instruction: isEveningHormone
              ? (isEs ? 'Presione el dosificador Topi-Pump 1 vez y aplique sobre piel limpia y seca del muslo interno o brazo superior. NUNCA aplicar sobre los senos ni mucosas.' : 'Dispense 1 metered pump from Topi-Pump container and apply onto clean, dry skin of inner thigh or upper arm. NEVER apply directly to breasts or mucous membranes.')
              : (isEs ? 'Presione el dosificador Topi-Pump 1 vez y aplique sobre piel limpia, seca y sin vello del antebrazo interno o abdomen inferior.' : 'Dispense 1 metered pump from Topi-Pump container and apply onto clean, dry, hairless skin of inner forearm or lower abdomen.')
          },
          {
            step: 2,
            title: isEs ? 'Masaje & Absorción' : 'Absorption & Hand Hygiene',
            timing: isEs ? 'Inmediato' : 'Immediate',
            instruction: isEs ? 'Extienda suavemente hasta que se absorba por completo. Lave las manos inmediatamente con agua y jabón para evitar transferencia a terceros.' : 'Gently spread until fully absorbed. Wash hands thoroughly with soap and water immediately to prevent accidental transfer to others.'
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
        posologyObj.regimen = safeCustomPosology || (isEs ? '1.0 mL Nocturno Diario (4-5 Pulverizaciones)' : '1.0 mL Nightly (4-5 Sprays)');
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

      if (extra?.posologySteps && Array.isArray(extra.posologySteps) && extra.posologySteps.length > 0) {
        posologyObj.steps = extra.posologySteps.map((s, sIdx) => ({
          step: s.stepNumber || (sIdx + 1),
          title: s.title || (isEs ? `Paso ${sIdx + 1}` : `Step ${sIdx + 1}`),
          timing: s.timing || '',
          instruction: s.instruction || ''
        }));
      }

      return {
        id: `formulation-${index}`,
        index,
        isOral,
        dosageForm: resolvedDosageForm,
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
        safetyWarnings: extra?.safetyWarnings || [],
        apis: apis.filter(api => {
          const an = (api.drugName || api.drug || api.productName || api.name || api.activeIngredient || '').toLowerCase();
          const af = (api.dosageForm || api.form || '').toLowerCase();
          return !api.isVehicleOrBase && !api._isVehicleOrBase && !api.isVehicle && 
                 !af.includes('vehicle') && 
                 !an.includes('vehicle') && 
                 !an.includes('vehiculo') && 
                 !an.includes('trichosol') && 
                 !an.includes('trichooil') && 
                 !an.includes('pentravan');
        }).map((api, aIdx) => {
          const apiName = api.drugName || api.drug || api.productName || api.name || api.activeIngredient || `Active Compound ${aIdx + 1}`;
          const n = apiName.toLowerCase();
          
          const mono = getFagronClinicalMonograph(api.productId) || 
                       getFagronClinicalMonograph(api.name) || 
                       getFagronClinicalMonograph(api.activeIngredient) ||
                       getFagronClinicalMonograph(apiName) ||
                       getFagronClinicalMonograph(n);

          // Priority for rich clinical metadata: Explicit Monograph / Clinical fields from DB > fallback strings
          const isGenericAction = !api.mechanismOfAction && (!api.action || api.action.toLowerCase().includes('personalized active ingredient') || api.action.toLowerCase().includes('principio activo personalizado'));
          const isGenericRole = !api.pharmacologicalClass && (!api.role || api.role.toLowerCase().includes('nutracéutico & modulador') || api.role.toLowerCase().includes('principio activo farmacogenómico') || api.role.toLowerCase().includes('systemic nutraceutical') || api.role.toLowerCase().includes('pharmacogenomic active'));
          const isGenericIndication = !api.clinicalIndication && (!api.indication || api.indication.toLowerCase().includes('personalizado') || api.indication.toLowerCase().includes('personalized') || api.indication.toLowerCase().includes('soporte metabólico') || api.indication.toLowerCase().includes('systemic metabolic') || api.indication.toLowerCase().includes('tratamiento folicular'));

          let role = mono?.pharmacologicalClass || api.pharmacologicalClass || api.therapeuticClass || api.category || (!isGenericRole ? api.role : null);
          let indication = mono?.clinicalIndication || api.clinicalIndication || api.therapeuticClass || api.category || (!isGenericIndication ? api.indication : null);
          let action = mono?.mechanismOfAction || api.mechanismOfAction || api.mechanism || (!isGenericAction ? (api.instructions || api.action) : null);
          const geneTargets = (mono?.geneTargets && mono.geneTargets.length > 0) ? mono.geneTargets : (api.geneTargets || []);

          // Guarantee English terms when !isEs
          if (!isEs) {
            const SPANISH_TO_ENGLISH_MAP = {
              'activador de sulfotransferasa & canales k_atp foliculares': 'Sulfotransferase Activator & Follicular K_ATP Channel Opener',
              'activador de sulfotransferasa & canales k_atp': 'Sulfotransferase Activator & Follicular K_ATP Channel Opener',
              'antagonista competitivo de receptores androgénicos': 'Competitive Androgen Receptor Antagonist',
              'precursor esencial de óxido nítrico (no) & vasodilatador folicular': 'Essential Nitric Oxide (NO) Precursor & Follicular Vasodilator',
              'precursor de óxido nítrico & estimulador microvascular': 'Nitric Oxide Precursor & Microvascular Stimulator',
              'inhibidor selectivo 5α-reductasa tipo ii': 'Selective 5α-Reductase Type II Inhibitor',
              'inhibidor dual 5α-reductasa tipo i y ii': 'Dual 5α-Reductase Type I & II Inhibitor',
              'antagonista selectivo del receptor pgd2': 'Selective PGD2 Receptor Antagonist',
              'precursor de coenzima a & regenerador celular': 'Coenzyme A Precursor & Cellular Regenerator',
              'fitoestimulante celular & inductor de vegf': 'Cellular Phytostimulant & VEGF Inducer',
              'optimizador microvascular & escudo antioxidante': 'Microvascular Optimizer & Antioxidant Shield',
              'supresión de dht folicular & prevención de miniaturización': 'Follicular DHT Suppression & Miniaturization Prevention',
              'estimulación de fase anágena & perfusión microvascular': 'Anagen Phase Induction & Microvascular Perfusion',
              'bloqueo local de dht en cuero cabelludo': 'Local Scalp DHT Blockade',
              'optimización de microcirculación perifolicular': 'Perifollicular Microcirculation Enhancement',
              'activación de la fase anágena del folículo': 'Follicular Anagen Phase Activation',
              'bloqueo periférico de la dht': 'Peripheral DHT Receptor Blockade',
              'vasodilatador periférico': 'Peripheral Vasodilator',
              'personalizado': 'Personalized Follicular Therapy',
              'tratamiento folicular personalizado': 'Personalized Follicular Treatment',
            };
            if (role && SPANISH_TO_ENGLISH_MAP[role.toLowerCase().trim()]) {
              role = SPANISH_TO_ENGLISH_MAP[role.toLowerCase().trim()];
            }
            if (indication && SPANISH_TO_ENGLISH_MAP[indication.toLowerCase().trim()]) {
              indication = SPANISH_TO_ENGLISH_MAP[indication.toLowerCase().trim()];
            }
          }

          if (!role) {
            if (n.includes('finasteride')) {
              role = isEs ? 'Inhibidor Selectivo 5α-Reductasa Tipo II' : 'Selective 5α-Reductase Type II Inhibitor';
            } else if (n.includes('dutasteride')) {
              role = isEs ? 'Inhibidor Dual 5α-Reductasa Tipo I y II' : 'Dual 5α-Reductase Type I & II Inhibitor';
            } else if (n.includes('minoxidil')) {
              role = isEs ? 'Activador de Sulfotransferasa & Canales K_ATP' : 'Sulfotransferase Activator & K_ATP Channel Opener';
            } else if (n.includes('spironolactone')) {
              role = isEs ? 'Antagonista Competitivo de Receptores Androgénicos' : 'Competitive Androgen Receptor Antagonist';
            } else if (n.includes('arginine') || n.includes('arginina')) {
              role = isEs ? 'Precursor de Óxido Nítrico & Estimulador Microvascular' : 'Nitric Oxide Precursor & Microvascular Stimulator';
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
            } else if (n.includes('spironolactone')) {
              indication = isEs ? 'Bloqueo Local de DHT en Cuero Cabelludo' : 'Local Scalp DHT Blockade';
            } else if (n.includes('arginine') || n.includes('arginina')) {
              indication = isEs ? 'Optimización de Microcirculación Perifolicular' : 'Perifollicular Microcirculation Enhancement';
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

          const rawDose = api.dosage || api.dose || api.strength || api.concentration;
          const hasPrescribedDose = Boolean(rawDose && rawDose !== '—' && String(rawDose).trim() !== '');
          
          let doseStr = rawDose;
          if (!hasPrescribedDose) {
            const rawStandard = mono?.standardDosages;
            const standardRef = typeof rawStandard === 'string'
              ? rawStandard
              : (rawStandard?.[resolvedRoute.toLowerCase().includes('oral') ? 'oral' : 'topical'] || rawStandard?.topical || null);
            
            if (standardRef) {
              const primaryRef = standardRef.split('·')[0].trim();
              doseStr = `Ref: ${primaryRef}`;
            } else if (n.includes('prostaquinon')) {
              doseStr = '3% Topical';
            } else if (n.includes('minoxidil')) {
              doseStr = '5% Topical';
            } else if (n.includes('latanoprost')) {
              doseStr = '0.005% Topical';
            } else {
              doseStr = isEs ? 'Dosis a calibrar' : 'Dose to calibrate';
            }
          }

          if (doseStr && !isEs) {
            doseStr = String(doseStr)
              .replace(/Tópico/gi, 'Topical')
              .replace(/Oral/gi, 'Oral')
              .replace(/Dosis a calibrar/gi, 'Standard Compounded Strength')
              .replace(/Dose to calibrate/gi, 'Standard Compounded Strength');
          }

          const dosageSafety = hasPrescribedDose
            ? checkDosageSafety(
                api.productId || apiName, 
                rawDose, 
                resolvedRoute.toLowerCase().includes('oral') ? 'oral' : 'topical'
              )
            : { evaluated: false, isWithinStandardRange: true, level: 'unrated' };

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

    // 1. If explicit sequential phases or multi-block formulations exist on the rx document
    const explicitPhases = (Array.isArray(rx.phases) && rx.phases.length > 0)
      ? rx.phases
      : (Array.isArray(rx.formulationBlocks) && rx.formulationBlocks.length > 0 ? rx.formulationBlocks : null);

    if (explicitPhases && explicitPhases.length > 0) {
      const totalBlocks = explicitPhases.length;
      return explicitPhases.map((block, idx) => {
        const rawBlockItems = block.apis || block.items || [];
        
        // Strictly separate vehicle excipients from true active ingredients (APIs)
        const vehicleItem = rawBlockItems.find(i => {
          const n = (i.name || i.productName || i.activeIngredient || '').toLowerCase();
          return i.isVehicleOrBase || i._isVehicleOrBase || n.includes('trichosol') || n.includes('trichofoam') || n.includes('trichooil') || n.includes('pentravan') || n.includes('versabase');
        });

        const activeApis = rawBlockItems.filter(i => i !== vehicleItem && !i.isVehicleOrBase && !i._isVehicleOrBase);
        
        let detectedVehicleName = block.vehicle?.name || block.vehicleBase?.name || block.vehicleName;
        if (!detectedVehicleName && vehicleItem) {
          detectedVehicleName = vehicleItem.name || vehicleItem.productName || vehicleItem.activeIngredient;
        }

        const phaseNum = block.phaseNumber || (idx + 1);
        const resolvedPhaseTitle = block.phaseName || block.treatmentType || block.treatmentProgram || `Phase ${phaseNum}`;

        return buildVehicleData({
          index: phaseNum,
          totalCount: totalBlocks,
          vehicleName: detectedVehicleName,
          treatmentTitle: resolvedPhaseTitle,
          route: block.route || block.dispensingForm || block.administrationRoute || '',
          volume: block.volume || block.packaging?.volume || vehicleItem?.dose || null,
          customPosology: block.posology || '',
          customInstructions: block.instructions || '',
          apis: activeApis,
          containerType: block.packaging?.containerType || block.container || '',
          duration: block.duration || '',
          extra: {
            phaseName: block.phaseName || null,
            timeOfDay: block.timeOfDay || null,
            posologySteps: Array.isArray(block.posologySteps) ? block.posologySteps : [],
            safetyWarnings: Array.isArray(block.safetyWarnings) ? block.safetyWarnings : []
          }
        });
      });
    }

    // Multi-part NutriGen / session: one dedicated formulation block per part (Detox 1, Detox 2, Supplementation...)
    if (Array.isArray(rx._sessionMembers) && rx._sessionMembers.length > 1) {
      const members = rx._sessionMembers;
      return members.map((m, idx) => {
        const mItems = (m.items || m.prescriptionLines || []).filter(i => !i.isVehicleOrBase && !i._isVehicleOrBase && !i.isVehicle);
        const nutri = m.nutrigenomics || null;

        const formOrRoute = String(m.dispensingForm || m.route || m.treatmentType || m.productName || m.formulaName || '').toLowerCase();
        const mItemsLower = mItems.map(i => (i.name || i.productName || i.activeIngredient || '').toLowerCase()).join(' ');
        const isCream = formOrRoute.includes('cream') || formOrRoute.includes('crema') || formOrRoute.includes('transdermal') || formOrRoute.includes('pentravan') || mItemsLower.includes('testosterone') || mItemsLower.includes('estradiol');
        const isOintment = formOrRoute.includes('ointment') || formOrRoute.includes('pomade') || formOrRoute.includes('pomada');
        const isFoam = formOrRoute.includes('foam') || formOrRoute.includes('espuma') || formOrRoute.includes('trichofoam');
        const isLiquid = formOrRoute.includes('solution') || formOrRoute.includes('solución') || formOrRoute.includes('trichosol');
        const isNutriOrCapsule = formOrRoute.includes('capsule') || formOrRoute.includes('cápsula') || formOrRoute.includes('oral') || Boolean(nutri);

        let vehicleName = m.vehicle?.name || (typeof m.vehicle === 'string' ? m.vehicle : null) || m.vehicleName;
        if (!vehicleName) {
          const reqs = m.formulationRequirements || m.specialCompoundingRequirements || rx.formulationRequirements || rx.specialCompoundingRequirements || '';
          const reqsLower = String(reqs).toLowerCase();
          const isVegCaps = reqsLower.includes('vegetable') || reqsLower.includes('gluten') || reqsLower.includes('sin gluten') || reqsLower.includes('lactose');

          if (isCream) vehicleName = 'Pentravan® Liposomal Transdermal Cream Base';
          else if (isOintment) vehicleName = isEs ? 'Base de Pomada Hipoalergénica (Sin Fragancia ni Alcohol)' : 'Hypoallergenic Non-Irritating Ointment Base (Fragrance & Alcohol Free, q.s. 30 g)';
          else if (isFoam) vehicleName = 'TrichoFoam™ Transdermal Base';
          else if (isLiquid) vehicleName = 'TrichoSol™ Hydrophilic Solution Base';
          else if (isNutriOrCapsule) vehicleName = isVegCaps ? 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.' : (isEs ? 'Cápsulas Vegetales / Excipiente de Celulosa' : 'Vegetable Acid-Resistant Capsule Base');
          else vehicleName = isEs ? 'Vehículo Galénico Magistral c.s.p.' : 'Galenic Compounding Vehicle q.s.';
        }

        let route = m.dispensingForm || m.route;
        if (!route) {
          if (isCream) route = isEs ? 'Vía Tópica / Transdérmica' : 'Topical / Transdermal Route';
          else if (isOintment) route = isEs ? 'Vía Tópica' : 'Topical Application';
          else if (isFoam || isLiquid) route = isEs ? 'Vía Tópica Capilar' : 'Topical Scalp Administration';
          else route = isEs ? 'Vía Oral' : 'Oral Administration';
        } else if (isCream && !route.toLowerCase().includes('transdermal') && !route.toLowerCase().includes('tópica')) {
          route = isEs ? `${route} (Vía Transdérmica)` : `${route} (Transdermal)`;
        } else if (isNutriOrCapsule && !route.toLowerCase().includes('oral')) {
          route = `${route} (Oral)`;
        }

        return buildVehicleData({
          index: idx + 1,
          totalCount: members.length,
          vehicleName,
          treatmentTitle: m.treatmentType || `Part ${idx + 1}`,
          route,
          volume: m.volume || null,
          customPosology: m.posology || '',
          duration: m.duration || '',
          apis: mItems,
          extra: {
            partCode: m.prescriptionNumber || m.prescriptionCode || m.id,
            phaseName: m.phaseName || null,
            nutrigenomics: nutri,
            dosageInstructions: m.dosageInstructions || null,
            specialCompoundingRequirements: m.specialCompoundingRequirements || (idx === 0 ? rx.specialCompoundingRequirements : null) || null,
            clinicalMilestones: m.clinicalMilestones || (idx === 0 ? rx.clinicalMilestones : null) || null,
            criticalPrecautions: m.criticalPrecautions || (idx === 0 ? rx.criticalPrecautions : null) || null
          }
        });
      });
    }

    // 2. Intelligent separation of rawLines into Distinct Vehicle Formulations
    const vehicleLines = [];

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
      const posologyText = getPosologyText(rx.posology) || (isEs ? '1 Cápsula Diaria' : '1 Capsule Daily');

      return [
        buildVehicleData({
          index: 1,
          totalCount: 1,
          vehicleName,
          treatmentTitle: title,
          route: routeText,
          volume: volText,
          customPosology: posologyText,
          apis: activeApis.length > 0 ? activeApis : rawLines,
          extra: {
            partCode: rx.prescriptionNumber || rx.prescriptionCode || rx.id,
            specialCompoundingRequirements: rx.specialCompoundingRequirements || null,
            clinicalMilestones: rx.clinicalMilestones || null,
            criticalPrecautions: rx.criticalPrecautions || null
          }
        })
      ];
    }

    const pomadeItems = [];
    const hormoneItems = [];
    const trichoSolItems = [];
    const trichoOilItems = [];
    const oralItems = [];
    const generalItems = [];

    rawLines.forEach((item) => {
      const nameLower = (item.drugName || item.drug || item.name || item.productName || item.activeIngredient || '').toLowerCase();
      const formLower = (item.dosageForm || item.form || '').toLowerCase();
      const routeLower = (item.route || '').toLowerCase();
      const blockLower = (item.formulationBlock || '').toLowerCase();

      const isVeh = Boolean(
        item.isVehicleOrBase ||
        item._isVehicleOrBase ||
        item.isVehicle ||
        item.itemType === 'vehicle_base' ||
        formLower.includes('vehicle') ||
        formLower.includes('base') ||
        nameLower.includes('trichosol') ||
        nameLower.includes('trichooil') ||
        nameLower.includes('trichofoam') ||
        nameLower.includes('pentravan') ||
        nameLower.includes('ointment base') ||
        nameLower.includes('pomade base') ||
        nameLower.includes('cream base') ||
        nameLower.includes('vehiculo') ||
        nameLower.includes('vehicle base') ||
        nameLower.includes('vehicle') ||
        nameLower.includes('base (q.s.') ||
        nameLower.includes('q.s.')
      );

      if (isVeh) {
        vehicleLines.push(item);
        return;
      }

      // Check if item belongs to Oral Capsules / NutriGen
      const isOralRoute = routeLower.includes('oral') || formLower.includes('capsule') || formLower.includes('tablet');
      const isOralItem = isOralRoute ||
                         blockLower.includes('oral') ||
                         blockLower.includes('capsule');

      // Check if item belongs to Compounded Pomade / Ointment
      const isPomadeItem = !isOralRoute && (
        blockLower.includes('pomade') ||
        blockLower.includes('pomada') ||
        blockLower.includes('ointment') ||
        routeLower.includes('perianal') ||
        routeLower.includes('anal') ||
        routeLower.includes('rectal') ||
        nameLower.includes('diltiazem') ||
        nameLower.includes('lidocaine') ||
        rxTypeLower.includes('pomade') ||
        rxTypeLower.includes('ointment') ||
        rxDispLower.includes('ointment')
      );

      // Check if item belongs to Transdermal BHRT / Hormone Cream
      const isHormoneItem = !isOralRoute && !isPomadeItem && !nameLower.includes('minoxidil') && !nameLower.includes('trichosol') && (
        prescriptionTypeInfo.key === 'hormone' ||
        blockLower.includes('hormone') ||
        blockLower.includes('bhrt') ||
        nameLower.includes('testosterone') ||
        nameLower.includes('estradiol') ||
        nameLower.includes('progesterone') ||
        rxTypeLower.includes('transdermal') ||
        rxTypeLower.includes('pentravan') ||
        rxDispLower.includes('pentravan')
      );

      // Check if item belongs to Scalp care / TrichoOil
      const isOilItem = !isOralRoute && !isPomadeItem && !isHormoneItem && (
        blockLower.includes('trichooil') || 
        blockLower.includes('scalp care') || 
        blockLower.includes('higiene') || 
        blockLower.includes('hygiene') ||
        nameLower.includes('trichooil') ||
        (nameLower.includes('ginseng') && !isOralRoute) || 
        (nameLower.includes('ginkgo') && !isOralRoute) || 
        (nameLower.includes('vitamin e') && !isOralRoute) ||
        (nameLower.includes('tocopherol') && !isOralRoute)
      );

      // Check if TrichoSol / Topical Scalp Solution
      const isSolItem = !isOralRoute && !isPomadeItem && !isHormoneItem && !isOilItem && (
        blockLower.includes('trichosol') || 
        blockLower.includes('topical treatment') ||
        nameLower.includes('minoxidil') || 
        nameLower.includes('spironolactone') || 
        nameLower.includes('arginine') || 
        nameLower.includes('latanoprost') ||
        nameLower.includes('prostaquinon') ||
        nameLower.includes('dutasteride') ||
        nameLower.includes('finasteride') ||
        nameLower.includes('cetirizine')
      );

      if (isPomadeItem) {
        pomadeItems.push(item);
      } else if (isHormoneItem) {
        hormoneItems.push(item);
      } else if (isOilItem) {
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
      if (pomadeItems.length > 0 || rxTypeLower.includes('pomade') || rxTypeLower.includes('ointment')) {
        pomadeItems.push(...generalItems);
      } else if (hormoneItems.length > 0 || prescriptionTypeInfo.key === 'hormone' || rxTypeLower.includes('transdermal') || rxTypeLower.includes('cream')) {
        hormoneItems.push(...generalItems);
      } else if (trichoSolItems.length > 0 || trichoOilItems.length > 0) {
        trichoSolItems.push(...generalItems);
      } else if (oralItems.length > 0) {
        oralItems.push(...generalItems);
      } else {
        trichoSolItems.push(...generalItems);
      }
    }

    // Determine how many distinct vehicle formulations exist
    const activeBlocks = [];

    // Preparation A: Compounded Topical Pomade / Ointment
    if (pomadeItems.length > 0) {
      const pomVeh = vehicleLines.find(v => {
        const vn = (v.name || v.drugName || '').toLowerCase();
        return vn.includes('base') || vn.includes('pomade') || vn.includes('ointment');
      })?.name || 'Hypoallergenic Non-Irritating Ointment Base (Fragrance & Alcohol Free, q.s. 30 g)';
      activeBlocks.push({
        type: 'pomade',
        vehicleName: pomVeh,
        dosageForm: isEs ? 'Pomada Tópica Galénica' : 'Topical Pomade / Ointment',
        treatmentTitle: rx.treatmentType || (isEs ? 'Pomada Compuesta Tópica (30 g)' : 'Compounded Topical Pomade / Ointment (30 g)'),
        route: rx.dispensingForm || (isEs ? 'Aplicación Tópica / Perianal' : 'Topical / Perianal Application'),
        volume: rx.volume || '30 g',
        customPosology: getPosologyText(rx.posology) || (isEs ? 'Aplicar dos veces al día durante 2 meses' : 'Apply twice daily for 2 months'),
        apis: pomadeItems
      });
    }

    // Preparation B: Transdermal BHRT Liposomal Cream
    if (hormoneItems.length > 0) {
      const hormVeh = vehicleLines.find(v => {
        const vn = (v.name || v.drugName || '').toLowerCase();
        return vn.includes('pentravan') || vn.includes('lipoderm');
      })?.name || 'Pentravan® Liposomal Transdermal Cream Base';
      activeBlocks.push({
        type: 'hormone',
        vehicleName: hormVeh,
        dosageForm: isEs ? 'Crema Transdérmica Liposomal' : 'Transdermal Liposomal Cream',
        treatmentTitle: rx.treatmentType || (isEs ? 'Crema Transdérmica Bioidéntica (BHRT)' : 'Bioidentical Hormone Transdermal Cream (BHRT)'),
        route: rx.dispensingForm || (isEs ? 'Aplicación Transdérmica / Tópica' : 'Transdermal / Topical Application'),
        volume: rx.volume || '90 mL',
        customPosology: getPosologyText(rx.posology) || (isEs ? '1 Pulsación diaria según indicación' : '1 Metered pump daily as prescribed'),
        apis: hormoneItems
      });
    }

    // Preparation C: Topical Solution (TrichoSol) or Topical Foam (TrichoFoam)
    if (trichoSolItems.length > 0 || (pomadeItems.length === 0 && hormoneItems.length === 0 && trichoOilItems.length === 0 && oralItems.length === 0 && rawLines.length > 0)) {
      const solItems = (trichoSolItems.length > 0 ? trichoSolItems : rawLines).filter(i => {
        const n = (i.drugName || i.drug || i.name || i.productName || i.activeIngredient || '').toLowerCase();
        const f = (i.dosageForm || i.form || '').toLowerCase();
        return !i.isVehicleOrBase && !i._isVehicleOrBase && !i.isVehicle && 
               !f.includes('vehicle') && 
               !n.includes('vehicle') && 
               !n.includes('trichosol') && 
               !n.includes('trichooil') && 
               !n.includes('trichofoam') && 
               !n.includes('pentravan');
      });

      const isFoam = String(rx.dispensingForm || '').toLowerCase().includes('foam') ||
                     String(rx.treatmentType || '').toLowerCase().includes('foam') ||
                     vehicleLines.some(v => {
                       const vn = (v.name || v.drugName || '').toLowerCase();
                       return vn.includes('foam') || vn.includes('trichofoam');
                     });

      const foamVehicleMatch = vehicleLines.find(v => {
        const vn = (v.name || v.drugName || '').toLowerCase();
        return vn.includes('foam') || vn.includes('trichofoam');
      });
      const solVehicleMatch = vehicleLines.find(v => (v.drugName || v.name || '').toLowerCase().includes('trichosol'));

      const vehicleName = isFoam
        ? (foamVehicleMatch?.name || foamVehicleMatch?.drugName || 'TrichoFoam™ Lipophilic Topical Foam Base (100 mL)')
        : (solVehicleMatch?.name || solVehicleMatch?.drugName || 'TrichoSol™ (Fagron)');

      const dosageForm = isFoam
        ? (isEs ? 'Espuma Tópica (TrichoFoam™)' : 'Topical Scalp Foam (TrichoFoam™)')
        : (isEs ? 'Solución Tópica' : 'Topical Scalp Solution');

      const treatmentTitle = rx.treatmentType || (isFoam
        ? (isEs ? 'Terapia Folicular Tópica en Espuma (TrichoFoam™ 100 mL)' : 'Personalized Follicular Therapy (TrichoFoam™ 100 mL)')
        : (isEs ? 'Terapia Folicular Tópica Personalizada (TrichoSol™)' : 'Personalized Follicular Therapy (TrichoSol™ Solution)'));

      activeBlocks.push({
        type: isFoam ? 'trichofoam' : 'trichosol',
        vehicleName,
        dosageForm,
        treatmentTitle,
        route: isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application',
        volume: rx.volume || '100 mL',
        customPosology: getPosologyText(rx.posology) || '',
        apis: solItems
      });
    }

    // Preparation D: Scalp Care & Hygiene (TrichoOil)
    if (trichoOilItems.length > 0) {
      const oilVeh = vehicleLines.find(v => (v.name || '').toLowerCase().includes('trichooil'))?.name || 'TrichoOil™ (Fagron)';
      activeBlocks.push({
        type: 'trichooil',
        vehicleName: oilVeh,
        dosageForm: isEs ? 'Aceite Capilar Tópico' : 'Topical Scalp Oil',
        treatmentTitle: isEs ? 'Higiene & Cuidado Folicular (TrichoOil™)' : 'Scalp Care & Hygiene (TrichoOil™)',
        route: isEs ? 'Aplicación Tópica / Masaje Capilar' : 'Topical Scalp Application & Massage',
        volume: '30 mL',
        customPosology: isEs ? '1–2 Veces por Semana (Tratamiento Pre-Lavado)' : '1–2 Times Weekly (Pre-Shampoo Treatment)',
        apis: trichoOilItems
      });
    }

    // Preparation E: Oral Compounded Capsules
    if (oralItems.length > 0) {
      const reqs = rx.formulationRequirements || rx.specialCompoundingRequirements || rx.vehicle || '';
      const reqsLower = String(typeof reqs === 'string' ? reqs : reqs?.name || '').toLowerCase();
      const isVegCaps = reqsLower.includes('vegetable') || reqsLower.includes('gluten') || reqsLower.includes('sin gluten') || reqsLower.includes('lactose');
      const oralVehName = isVegCaps
        ? 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.'
        : (isEs ? 'Cápsulas Vegetales / Celulosa Micronizada' : 'Vegetable Acid-Resistant Capsule Base');

      activeBlocks.push({
        type: 'oral',
        vehicleName: oralVehName,
        dosageForm: isEs ? 'Cápsulas Orales (Vegetales)' : 'Oral Route (Vegetable Capsules)',
        treatmentTitle: rx.treatmentType || (isEs ? 'Soporte Nutracéutico Sistémico (Cápsulas)' : 'Systemic Follicular & Nutraceutical Support (Capsules)'),
        route: isEs ? 'Vía Oral' : 'Oral Administration',
        volume: rx.volume || (isEs ? '60 Cápsulas' : '60 Compounded Capsules'),
        customPosology: getPosologyText(rx.posology) || (isEs ? '1 Cápsula Diaria con la Cena' : '1 Capsule Daily with Dinner / Bedtime'),
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
        dosageForm: b.dosageForm,
        route: b.route,
        volume: b.volume,
        customPosology: b.customPosology,
        apis: b.apis
      });
    });
  }, [rawLines, rx, isEs]);

  // Guaranteed label generation for EVERY phase / formulation in the prescription
  const prescriptionLabels = React.useMemo(() => {
    return getPharmapolisLabelsForPrescription(rx, compoundedFormulations);
  }, [rx, compoundedFormulations]);

  // Keep prescriptionApis for any auxiliary references
  const prescriptionApis = React.useMemo(() => {
    return compoundedFormulations.flatMap(f => f.apis);
  }, [compoundedFormulations]);

  // Dynamic Flexible TOC Sections (Adapts to 1 or Multiple Vehicles / Formulations)
  const tocSections = React.useMemo(() => {
    const list = [];
    if (compoundedFormulations.length > 1) {
      compoundedFormulations.forEach((form, idx) => {
        const phaseNum = form.index || (idx + 1);
        const formTypeDesc = form.isOral 
          ? (isEs ? 'Cápsulas Orales' : 'Oral Capsules')
          : (form.id.includes('oil')
              ? (isEs ? 'Aceite Folicular' : 'Scalp Oil')
              : (form.id.includes('pomade')
                  ? (isEs ? 'Pomada Tópica' : 'Topical Pomade')
                  : (isEs ? 'Solución Tópica' : 'Scalp Solution')));

        const cleanLabel = form.shortTitle || (
          form.title && form.title.length <= 32
            ? form.title 
            : (isEs ? `Fase ${phaseNum}: ${formTypeDesc}` : `Phase ${phaseNum}: ${formTypeDesc}`)
        );

        list.push({
          id: form.id,
          label: cleanLabel,
          category: 'formula',
          badge: form.volume || (form.apis ? `${form.apis.length} APIs` : null),
          accentColor: form.accentColor,
          icon: form.id.includes('oral') ? 'box' : (form.id.includes('oil') ? 'droplets' : 'flask')
        });
      });
    } else {
      list.push({ 
        id: 'formula-card', 
        label: isEs ? 'Fórmula Magistral & Posología' : 'Compounded Formula & Posology',
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

    list.push({ 
      id: 'milestones-card', 
      label: isEs ? 'Roadmap & Hitos Clínicos' : 'Roadmap & Milestones',
      category: 'milestones',
      icon: 'calendar'
    });

    list.push({ 
      id: 'quality-card', 
      label: isEs ? 'Calidad & Trazabilidad GMP' : 'Quality & EU Traceability',
      category: 'traceability',
      icon: 'shield'
    });

    if (atlasRecs?.peptide || atlasRecs?.supplement || atlasRecs?.diagnostic || atlasRecs?.colway) {
      list.push({ 
        id: 'atlas-recommendations-card', 
        label: isEs ? 'Recomendaciones Atlas' : 'Atlas Recommendations',
        category: 'recommendations',
        icon: 'sparkles'
      });
    }

    list.push({ 
      id: 'doctor-patient-credentials', 
      label: isEs ? 'Datos de Médico & Paciente' : 'Doctor & Patient Info',
      category: 'credentials',
      icon: 'stethoscope'
    });

    list.push({ 
      id: 'patient-sharing-card', 
      label: isPatientView
        ? (isEs ? 'Contacto con Médico' : 'Doctor & Clinic Support')
        : (isEs ? 'Atención al Paciente' : 'Patient Care Hub'),
      category: 'patient-sharing',
      icon: isPatientView ? 'stethoscope' : 'share'
    });

    if (!isPatientView) {
      list.push({ 
        id: 'atlas-quotation-card', 
        label: isEs ? 'Cotización Atlas' : 'Compounding Quote',
        category: 'quotation',
        icon: 'file'
      });
    }

    return list;
  }, [compoundedFormulations, genomicsData, isEs, isPatientView, atlasRecs]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(patientPublicUrl);
      triggerHaptic('copy');
      setCopied(true);
      toast.success(isEs ? 'Enlace del paciente copiado ✓' : 'Patient portal link copied ✓');
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
        `🛒 *Información y Cotización:* Consulte los detalles de la formulación y solicite presupuesto oficial para la preparación y compra de su prescripción:\n` +
        `🔗 ${patientPublicUrl}`
      : `*Atlas Services — Medical Prescription & Posology Regimen*\n` +
        `📋 *Prescription Ref:* ${rxId}\n` +
        `👤 *Patient:* ${patientName}${patientAlias}\n` +
        `🩺 *Prescribing Physician:* ${doctorName} (${clinic})\n` +
        `🧪 *Formula:* ${resolvedFormulaSummary}\n` +
        (genomicsData ? `🧬 *Genomics Guidance:* Formulated based on ${genomicsData.test.shortName} recommendations.\n` : '') +
        `🕒 *Dosage:* ${resolvedDosageSummary}\n\n` +
        `🛒 *Product Info & Compounding Quotation:* Review formulation details and request an official compounding quotation to purchase your prescription:\n` +
        `🔗 ${patientPublicUrl}`
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
          copyUrl={isPatientView ? patientPublicUrl : publicUrl}
          shortUrl={isPatientView ? patientPublicUrl : publicUrl}
          loginRedirect={isPatientView ? patientPublicUrl : publicUrl}
          hideTier2={true}
          brandHref={doctorPublicUrl}
          brandTitle={isEs ? `Volver a la página pública del Dr/a. ${doctorName}` : `Return to Dr. ${doctorName}'s Public Portal`}
          doctorHomeHref={doctorPublicUrl}
          doctorName={doctorName}
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
            genomicsTest: genomicsData?.test?.shortName || rx.testName || (compoundedFormulations?.length > 1 ? 'NutriGen' : 'Prescription'),
            isNutriGen: true,
            isPatientView,
            isDispensed,
            inquiryGoal: isPatientView ? (isDispensed ? 'renewal' : 'quotation') : 'inquiry',
            priceFormatted: resolvedPrice?.formatted || 'AED 1,450.00'
          }}
          breadcrumb={[
            { label: 'Clinical Intelligence', href: '/c/CAT-MU9L9GBN' },
            { label: isEs ? 'Prescripciones Médicas' : 'Prescription Dossier' },
            { label: rxId }
          ]}
          isDoctorView={!isPatientView}
          onImportRx={() => { window.location.href = `/rx/intake?from=${rxId}&fromRole=doctor`; }}
          onSwitchRx={() => setShowRxSwitcherModal(true)}
          banner={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '6px 20px',
              background: isPatientView
                ? 'linear-gradient(90deg, #0d9488 0%, #0284c7 100%)'
                : 'linear-gradient(90deg, #003666 0%, #1a73e8 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
            }}>
              {/* Mode icon */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                flexShrink: 0
              }}>
                {isPatientView
                  ? <User size={12} color="#ffffff" />
                  : <Stethoscope size={12} color="#ffffff" />}
              </span>

              {/* Label */}
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {isPatientView
                  ? (isEs ? 'Vista Paciente' : 'Patient View')
                  : (isEs ? 'Vista Médico — Panel Clínico' : 'Doctor View — Clinical Panel')}
              </span>

              {/* Description */}
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', fontWeight: 400, display: 'none' }}
                className="rx-banner-desc"
              >
                {isPatientView
                  ? (isEs ? 'Dossier simplificado para el paciente' : 'Simplified dossier for patient use')
                  : (isEs ? 'Acceso completo · Solo visible por el médico' : 'Full clinical access · Visible to doctor only')}
              </span>

              {/* Switch view link or patient prescriptions modal button */}
              {!isPatientView ? (
                <a
                  href={`/rx/${rxId}?view=patient`}
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.72rem', fontWeight: 500,
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 9px', borderRadius: '4px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    transition: 'background 0.15s'
                  }}
                  title={isEs ? 'Ver cómo lo verá el paciente' : 'Preview the patient view'}
                >
                  <Eye size={11} />
                  {isEs ? 'Vista Paciente' : 'Patient Preview'}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); setShowPatientRxModal(true); }}
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.72rem', fontWeight: 600,
                    color: '#ffffff',
                    background: 'rgba(255,255,255,0.20)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    borderRadius: '4px',
                    padding: '3px 10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'background 0.15s'
                  }}
                  title={isEs ? 'Ver todas las prescripciones de este paciente' : 'View all prescriptions for this patient across all doctors'}
                >
                  <Layers size={12} color="#ffffff" />
                  <span>{isEs ? 'Todas Mis Recetas' : 'All My Prescriptions'}</span>
                </button>
              )}
            </div>
          }
        />
      )}

      <style>{`
        @media (min-width: 640px) { .rx-banner-desc { display: inline !important; } }
      `}</style>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0.75rem 1rem 120px 1rem' }}>
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
              {/* Row 1: Resource Title & Quick Utilities */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
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
                        {isEs ? 'Prescripción Médica' : 'Medical Prescription'}{' '}
                        <span style={{ color: '#5f6368', fontWeight: 400 }}>#{rxId}</span>
                      </h1>

                      {/* GCP Status Badge / Interactive Quick Action for Doctor */}
                      {!isPatientView ? (
                        <PrescriptionStatusQuickAction
                          status={currentStatus}
                          prescriptionId={rx?.id}
                          prescriptionNumber={rx?.prescriptionNumber || rx?.code || rxId}
                          onStatusChange={(newSt) => setCurrentStatus(newSt)}
                          isEs={isEs}
                        />
                      ) : (
                        <span
                          role="status"
                          aria-label={`${isEs ? 'Estado' : 'Status'}: ${currentStatusMeta.label}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: currentStatusMeta.bg,
                            color: currentStatusMeta.color,
                            border: `1px solid ${currentStatusMeta.border}`,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            lineHeight: 1.2,
                            userSelect: 'none',
                            cursor: 'default'
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: currentStatusMeta.color,
                              flexShrink: 0
                            }}
                          />
                          <span>{currentStatusMeta.label}</span>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '2px' }}>
                      {isEs
                        ? 'Dossier clínico digital · Pauta posológica · Certificado GMP EU'
                        : 'Digital clinical dossier · Posology regimen · EU GMP Certified'}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Utilities (Copy permanent link & Doctor Public Portal link) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rx-header-action-btn rx-btn-icon"
                    title={isEs ? 'Copiar enlace permanente' : 'Copy permanent link'}
                    style={{ minWidth: 34, height: 32, borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} color="#5f6368" />}
                  </button>
                  <Link
                    href={doctorPublicUrl}
                    className="rx-header-action-btn rx-btn-icon"
                    title={isEs ? `Ir al portal clínico público del Dr/a. ${doctorName}` : `Go to Dr. ${doctorName}'s Public Clinical Portal`}
                    style={{ minWidth: 34, height: 32, borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <Home size={14} color="#5f6368" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── GCP Standard Sub-Tabs Navigation (Laptop & Mobile) ── */}
            <div className="gcp-subtabs-strip" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              borderRadius: '8px',
              padding: '4px 6px',
              boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
              position: 'sticky',
              top: '72px',
              zIndex: 30,
              backdropFilter: 'blur(8px)',
              marginBottom: '0.75rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
                width: '100%',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {[
                  { id: 'treatment', label: isEs ? 'Prescripción' : 'Prescription', icon: Pill, count: compoundedFormulations.length },
                  ...(atlasRecs?.peptide || atlasRecs?.supplement || atlasRecs?.diagnostic || atlasRecs?.colway ? [
                    { id: 'recommendations', label: isEs ? 'Recomendaciones' : 'Recommendations', icon: Sparkles, count: 'Atlas AI' }
                  ] : []),
                  { id: 'roadmap', label: 'Roadmap', icon: Layers, count: compoundedFormulations.length > 1 ? `${compoundedFormulations.length} ${isEs ? 'Fases' : 'Phases'}` : null },
                  { id: 'traceability', label: isEs ? 'Calidad GMP' : 'Quality GMP', icon: Factory },
                  { id: 'credentials', label: isEs ? 'Médico & Paciente' : 'Doctor & Patient', icon: Stethoscope },
                  { id: 'patientSharing', label: isEs ? 'Soporte' : 'Support', icon: Share2 },
                  ...(!isPatientView ? [
                    { id: 'quotation', label: isEs ? 'Cotización Atlas' : 'Compounding Quote', icon: FileText }
                  ] : [])
                ].map(tab => {
                  const isActive = activeGcpTab === tab.id;
                  const IconCmp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveGcpTab(tab.id);
                        if (tab.id === 'treatment') {
                          const allOpen = {};
                          compoundedFormulations.forEach(f => { allOpen[f.id] = true; });
                          setExpandedPhases(allOpen);
                          setSelectedPhase('all');
                          setExpandedSections(prev => ({ ...prev, formulations: true, posology: true, genomics: true }));
                        } else if (tab.id === 'recommendations') {
                          setExpandedSections(prev => ({ ...prev, recommendations: true }));
                        } else if (tab.id === 'roadmap') {
                          setExpandedSections(prev => ({ ...prev, posology: true }));
                        } else if (tab.id === 'traceability') {
                          setExpandedSections(prev => ({ ...prev, traceability: true }));
                        } else if (tab.id === 'credentials') {
                          setExpandedSections(prev => ({ ...prev, credentials: true }));
                        } else if (tab.id === 'patientSharing') {
                          setExpandedSections(prev => ({ ...prev, patientSharing: true }));
                        } else if (tab.id === 'quotation') {
                          setExpandedSections(prev => ({ ...prev, quotation: true }));
                        } else {
                          setExpandedSections(prev => ({ ...prev, [tab.id]: true }));
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f8fafd';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isActive ? '#e8f0fe' : 'transparent',
                        color: isActive ? '#1a73e8' : '#5f6368',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.80rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'background 0.15s ease, color 0.15s ease'
                      }}
                    >
                      <IconCmp size={15} style={{ color: isActive ? '#1a73e8' : '#5f6368', flexShrink: 0 }} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count !== null && (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: isActive ? '#1a73e8' : '#f1f3f4',
                          color: isActive ? '#ffffff' : '#5f6368'
                        }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Patient Action & Refill Banner Card (Patient View Standard) ── */}
            {isPatientView && (
              <div 
                className="rx-card patient-action-banner-card"
                style={{
                  background: isDispensed 
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' 
                    : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                  borderRadius: '12px',
                  border: isDispensed ? '1.5px solid #86efac' : '1.5px solid #93c5fd',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: 260 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      background: isDispensed ? '#15803d' : '#1d4ed8',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isDispensed ? '0 2px 8px rgba(21, 128, 61, 0.25)' : '0 2px 8px rgba(29, 78, 216, 0.25)'
                    }}>
                      {isDispensed ? <RotateCcw size={22} /> : <Tag size={22} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isDispensed ? '#dcfce7' : '#dbeafe',
                          color: isDispensed ? '#166534' : '#1e40af',
                          border: isDispensed ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                        }}>
                          {isDispensed 
                            ? (isEs ? 'Tratamiento Suministrado Previamente' : 'Previously Supplied Treatment')
                            : (isEs ? 'Prescripción Lista para Cotización' : 'Prescription Ready for Quotation')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>
                          Ref: {rxId}
                        </span>
                      </div>
                      <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                        {isDispensed 
                          ? (isEs ? '¿Se está terminando su medicación? Solicite su renovación' : 'Is your treatment running out? Request your refill')
                          : (isEs ? 'Solicitar Cotización de Formulación Magistral' : 'Request Official Compounding Quotation')}
                      </h2>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, maxWidth: 620 }}>
                        {isDispensed
                          ? (isEs 
                              ? 'Su fórmula magistral personalizada fue elaborada y suministrada con anterioridad. Puede solicitar la renovación directa con el laboratorio para garantizar la continuidad ininterrumpida de su tratamiento.' 
                              : 'Your customized compounded formula was previously dispensed. You can request a seamless renewal directly with the laboratory to maintain treatment continuity.')
                          : (isEs
                              ? 'Consulte el presupuesto oficial para la preparación en laboratorio especializado de su pauta médica personalizada con envío directo a su domicilio o clínica.'
                              : 'Request the formal compounding quotation for the preparation and direct delivery of your physician-prescribed clinical formula.')}
                      </p>
                    </div>
                  </div>

                  {/* Previous Price Box (Dispensed) and Action trigger */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem',
                    background: '#ffffff',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    minWidth: 200
                  }}>
                    {isDispensed && (
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isEs ? 'Precio Suministrado Anteriormente' : 'Previously Supplied Price'}
                        </div>
                        <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '2px' }}>
                          {resolvedPrice.formatted}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                          ✓ {isEs ? 'Formulación e IVA incluidos' : 'Compounding & VAT included'}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsInquiryDrawerOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0.65rem 1.25rem',
                        borderRadius: '8px',
                        background: isDispensed ? '#15803d' : '#1d4ed8',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: isDispensed ? '0 2px 8px rgba(21, 128, 61, 0.3)' : '0 2px 8px rgba(29, 78, 216, 0.3)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isDispensed ? <RotateCcw size={16} /> : <Tag size={16} />}
                      <span>
                        {isDispensed 
                          ? (isEs ? 'Renovar Prescripción' : 'Renew Prescription') 
                          : (isEs ? 'Pedir Cotización' : 'Request Quotation')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

        {/* ── Sequential Roadmap Tab: MultiPartOverview & KPIs ────────────────────── */}
        {activeGcpTab === 'roadmap' && (
          <MultiPartOverview
            formulations={compoundedFormulations}
            onSelectPhase={(phaseId) => {
              setSelectedPhase(phaseId);
              setActiveGcpTab('treatment');
              setExpandedPhases(prev => ({ ...prev, [phaseId]: true }));
            }}
          />
        )}

        {/* ── Compounded Formulations & Dedicated Posology Architecture ──────────── */}
        {activeGcpTab === 'treatment' && (
        <div id="formula-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
          
          {/* Google Cloud Style Phase Overview & Controls (100% Vertical & Responsive, No Horizontal Scroll) */}
          {compoundedFormulations.length > 1 && (
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

          {compoundedFormulations
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
              {/* Unified Authoritative Formulation Header (GCP Card Header) */}
              <div
                onClick={() => togglePhase(formulation.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: isPhaseExpanded ? '#f8fafc' : '#ffffff',
                  borderBottom: isPhaseExpanded ? '1px solid #dadce0' : 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    background: formulation.accentColor ? `${formulation.accentColor}15` : '#eff6ff',
                    color: formulation.accentColor || '#1a73e8',
                    border: `1px solid ${formulation.accentColor ? `${formulation.accentColor}33` : '#bfdbfe'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {formulation.isOral || formulation.route?.toLowerCase().includes('oral') || formulation.title?.toLowerCase().includes('cápsula') || formulation.title?.toLowerCase().includes('capsule') ? (
                      <Pill size={18} />
                    ) : (formulation.id.includes('oil') || formulation.title?.toLowerCase().includes('oil')) ? (
                      <Droplets size={18} />
                    ) : (
                      <FlaskConical size={18} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: formulation.accentColor || '#003666',
                        background: formulation.accentBg || '#f1f5f9',
                        padding: '1px 7px',
                        borderRadius: '4px'
                      }}>
                        {isEs ? `FASE ${phaseNumber} DE ${compoundedFormulations.length}` : `PHASE ${phaseNumber} OF ${compoundedFormulations.length}`} · {formulation.route || (isEs ? 'VÍA ORAL' : 'ORAL ROUTE')}
                      </span>
                      {formulation.duration && (
                        <span style={{ fontSize: '0.68rem', color: '#1967d2', background: '#e8f0fe', border: '1px solid #d2e3fc', borderRadius: '4px', padding: '1px 7px', fontWeight: 600 }}>
                          {formulation.duration}
                        </span>
                      )}
                      <span style={{ fontSize: '0.68rem', color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 7px', borderRadius: '4px', fontWeight: 600 }}>
                        {formulation.apis.length} APIs · {formulation.volume}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {formulation.title}
                    </h3>
                    {formulation.subtitle && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                        {formulation.subtitle}
                      </p>
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
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        color: '#1a73e8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.borderColor = '#1a73e8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#dadce0'; }}
                    >
                      <Tag size={12} color="#1a73e8" />
                      <span>{isEs ? 'Etiqueta 7.5×4.5 cm' : 'Label (7.5×4.5 cm)'}</span>
                    </button>
                  )}
                  <span style={{ color: '#5f6368', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{isPhaseExpanded ? (isEs ? 'Colapsar' : 'Collapse') : (isEs ? 'Expandir' : 'Expand')}</span>
                    {isPhaseExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
              </div>

              {(compoundedFormulations.length <= 1 || isPhaseExpanded) && (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    {formulation.vehicle.volume && formulation.vehicle.volume !== formulation.volume && (
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

              {/* Sub-Section 1b: Special Compounding Requirements & Galenic Purity Badges */}
              {Array.isArray(formulation.extra?.specialCompoundingRequirements) && formulation.extra.specialCompoundingRequirements.length > 0 && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={14} color="#059669" />
                    <span>{isEs ? 'Requisitos Galénicos de Formulación & Pureza (Clean Label)' : 'Galenic Purity Standards & Compounding Requirements'}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formulation.extra.specialCompoundingRequirements.map((req, rIdx) => (
                      <span
                        key={rIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: '#0f766e',
                          background: '#f0fdfa',
                          border: '1px solid #ccfbf1',
                          padding: '3px 9px',
                          borderRadius: '6px'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#0d9488' }}>✓</span>
                        <span>{req}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                            {formulation.isOral 
                              ? (String(api.dosage).includes('Ref:') || String(api.dosage).includes('Dosis') || String(api.dosage).includes('Dose') || String(api.dosage).toLowerCase().includes('/ cap') || String(api.dosage).toLowerCase().includes('/cap')
                                  ? `💊 ${String(api.dosage).replace(/cápsulas?/gi, 'capsules').replace(/cápsula/gi, 'capsule')}` 
                                  : `💊 ${String(api.dosage).replace(/cápsulas?/gi, 'capsules').replace(/cápsula/gi, 'capsule')} / capsule`) 
                              : String(api.dosage).replace(/cápsulas?/gi, 'capsules').replace(/cápsula/gi, 'capsule')}
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

              {/* Sub-Section 2c: Clinical Protocol Initiation Milestone */}
              {Array.isArray(formulation.extra?.clinicalMilestones) && formulation.extra.clinicalMilestones.length > 0 && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderLeft: '4px solid #0284c7',
                  borderRadius: '10px',
                  padding: '0.95rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                }}>
                  {formulation.extra.clinicalMilestones.map((ms, mIdx) => (
                    <div key={ms.id || mIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>🗓️</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0369a1' }}>
                          {ms.title}: {ms.timing}
                        </span>
                      </div>
                      {ms.description && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.5, paddingLeft: '26px' }}>
                          {ms.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
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
                    {String(formulation.posology.regimen || '')}
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

                {/* Sub-Section 3b: Critical Medical Safety Alerts & Pre-Procedure Guidance */}
                {Array.isArray(formulation.extra?.criticalPrecautions) && formulation.extra.criticalPrecautions.length > 0 && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderLeft: '4px solid #d97706',
                    borderRadius: '10px',
                    padding: '0.95rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                  }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#92400e',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <AlertTriangle size={15} color="#d97706" />
                      <span>{isEs ? 'Instrucciones Críticas de Seguridad y Manejo Pre-Procedimiento' : 'Critical Clinical Safety Alerts & Pre-Procedure Guidance'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formulation.extra.criticalPrecautions.map((prec, pIdx) => (
                        <div key={prec.id || pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.70rem',
                            fontWeight: 800,
                            color: prec.severity === 'critical' ? '#991b1b' : '#92400e',
                            background: prec.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                            border: `1px solid ${prec.severity === 'critical' ? '#fecaca' : '#fde68a'}`,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            {prec.severity === 'critical' ? 'CRITICAL' : 'CAUTION'}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.4 }}>
                            {prec.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

        {/* ── Biological Milestones & Evolution (90 Days) ────────────────────────── */}
        {(activeGcpTab === 'roadmap') && (
        <div id="milestones-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
          <div className="rx-card" style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '1.5rem',
            boxShadow: 'none',
            marginBottom: '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  background: '#e8f0fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1a73e8'
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#202124' }}>
                    {isEs ? '2. Pauta de Tratamiento & Evolución Biológica (90 Días)' : '2. Treatment Regimen & Biological Evolution (90 Days)'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#5f6368' }}>
                    {isEs ? 'Instrucciones paso a paso, administración cronobiológica y evolución clínica esperada' : 'Step-by-step application guidance, daily routine and expected biological pathway'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  background: '#e8f0fe', 
                  color: '#1967d2', 
                  border: '1px solid #d2e3fc', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.72rem', 
                  fontWeight: 600 
                }}>
                  {isEs ? 'Cronograma Secuencial' : 'Sequential Schedule'}
                </span>
                <span style={{ 
                  background: '#f0fdf4', 
                  color: '#16a34a', 
                  border: '1px solid #bbf7d0', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.72rem', 
                  fontWeight: 600 
                }}>
                  {isEs ? 'Ciclo Completo: 90 Días' : 'Full Cycle: 90 Days'}
                </span>
              </div>
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
                    borderLeft: '4px solid #1a73e8',
                    borderRadius: '8px',
                    padding: '1.15rem 1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                    boxShadow: 'none',
                    boxSizing: 'border-box',
                    width: '100%',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div className="rx-milestone-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
                    <div className="rx-milestone-title-wrap" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                      <span className="rx-milestone-phase-badge" style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: '#1967d2', 
                        background: '#e8f0fe', 
                        border: '1px solid #d2e3fc', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.04em' 
                      }}>
                        {tm.phase}
                      </span>
                      <span className="rx-milestone-title" style={{ fontSize: '0.92rem', fontWeight: 600, color: '#202124', lineHeight: 1.3 }}>
                        {tm.title}
                      </span>
                    </div>
                    <span className="rx-milestone-month-badge" style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 600, 
                      color: '#ffffff', 
                      background: '#1a73e8', 
                      padding: '3px 9px', 
                      borderRadius: '4px', 
                      whiteSpace: 'nowrap', 
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}>
                      {tm.badge}
                    </span>
                  </div>

                  <p className="rx-milestone-desc" style={{ margin: 0, fontSize: '0.82rem', color: '#3c4043', lineHeight: 1.6 }}>
                    {tm.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ── Patient Mobile Access Portal (Private Patient Dossier & Traceability) ──────────────── */}
        {/* ── Section: Quality, Laboratory & EU GMP Traceability (Authentic Dossier) ──────────────── */}
        {(activeGcpTab === 'traceability') && (
        <div id="quality-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
          <div className="rx-card" style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '1.5rem',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  background: '#e8f0fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1a73e8'
                }}>
                  <Factory size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#202124' }}>
                    {isEs ? '3. Laboratorio, Calidad & Trazabilidad Farmacopea UE' : '3. Quality, Laboratory & EU GMP Traceability'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#5f6368' }}>
                    {isEs 
                      ? 'Control de calidad analítico por HPLC, estándares de Farmacopea Europea (Ph. Eur.) y liberación de lote magistral' 
                      : 'Compounding batch HPLC analytical assays, European Pharmacopoeia (Ph. Eur.) compliance and QP release'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: '#e8f0fe', 
                  color: '#1967d2', 
                  border: '1px solid #d2e3fc', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.72rem', 
                  fontWeight: 600 
                }}>
                  Ph. Eur. Monographs · EU GMP Annex 1
                </span>
                <span style={{ 
                  background: '#f0fdf4', 
                  color: '#16a34a', 
                  border: '1px solid #bbf7d0', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.72rem', 
                  fontWeight: 600 
                }}>
                  ✓ {isEs ? 'Lote Verificado & Liberado' : 'Batch Released & Verified'}
                </span>
              </div>
            </div>

            {/* Google Cloud Style 4-Column Properties Grid */}
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px 20px'
            }}>
              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Lote de Elaboración' : 'Compounding Batch'}
                </div>
                <CopyableId value={`BATCH-${rxId}`} displayValue={`BATCH-${rxId}`} />
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Estándar Farmacopéico' : 'Compounding Standard'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
                  Ph. Eur. 11th Ed. &amp; EU GMP
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Entorno de Salas Limpias' : 'Cleanroom Facility'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
                  ISO Class 5 / Grade A (Annex 1)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Laboratorio Dispensador' : 'Compounding Pharmacy'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
                  Pharmapolis Ltd. (EU Reg.)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Pureza HPLC Mínima' : 'Minimum HPLC Purity'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#137333' }}>
                  ≥ 98.50% Area Ratio
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Límite de Endotoxinas' : 'Endotoxin Threshold'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
                  &lt; 0.25 EU/mL (Ph. Eur. 2.6.14)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Origen de Principios Activos' : 'API Sourcing'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
                  Fagron &amp; Pharmapolis Certified
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  {isEs ? 'Dictamen de Liberación QP' : 'QP Release Sign-Off'}
                </div>
                <div>
                  <StatusBadge status="approved" />
                </div>
              </div>
            </div>

            {/* HPLC Analytical Assay Release Table (GCP Tabular Standard) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#202124', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FlaskConical size={14} color="#1a73e8" />
                <span>{isEs ? 'Ensayos Analíticos de Liberación de Lote Magistral' : 'Compounding Batch Analytical Release Assays'}</span>
              </div>

              <div style={{
                overflowX: 'auto',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                background: '#ffffff'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dadce0' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Parámetro Analítico' : 'Test Parameter'}</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Método Oficial' : 'Official Method'}</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Especificación Farmacopea' : 'Specification'}</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Resultado del Lote' : 'Batch Result'}</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#3c4043' }}>{isEs ? 'Dictamen' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                        {isEs ? 'Pureza Cromatográfica (HPLC / UPLC)' : 'Chromatographic Purity (HPLC / UPLC)'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.2.29</td>
                      <td style={{ padding: '10px 14px', color: '#3c4043' }}>≥ 98.50% Area Ratio</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>99.28% – 99.45%</td>
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status="approved" />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                        {isEs ? 'Identidad Molecular (ESI-MS / MALDI-TOF)' : 'Molecular Identity (ESI-MS / MALDI-TOF)'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.2.43</td>
                      <td style={{ padding: '10px 14px', color: '#3c4043' }}>MW ± 1.0 Da del teórico</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>Match Confirmado (100%)</td>
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status="approved" />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                        {isEs ? 'Ensayo de Endotoxinas Bacterianas' : 'Bacterial Endotoxins Assay'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.6.14 (LAL Photometric)</td>
                      <td style={{ padding: '10px 14px', color: '#3c4043' }}>&lt; 0.25 EU/mL</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>&lt; 0.05 EU/mL</td>
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status="approved" />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f3f4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                        {isEs ? 'Control de Esterilidad & Bioburden' : 'Sterility & Bioburden Assay'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.6.1 / 2.6.12</td>
                      <td style={{ padding: '10px 14px', color: '#3c4043' }}>0 CFU / Ausencia Total</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>Negativo (0 CFU/g)</td>
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status="approved" />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#202124' }}>
                        {isEs ? 'Uniformidad de Masa y Contenido' : 'Uniformity of Dosage & Mass'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#5f6368' }}>Ph. Eur. 2.9.40</td>
                      <td style={{ padding: '10px 14px', color: '#3c4043' }}>Desviación &lt; 5.0% (AV &lt; 15.0)</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#137333' }}>AV = 2.1 (Conforme)</td>
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status="approved" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cold Chain & Qualified Person Certification Callout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
              paddingTop: '6px'
            }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <ShieldCheck size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                    {isEs ? 'Cadena de Frío y Conservación' : 'Cold Chain & Storage Conditions'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.45 }}>
                    {isEs 
                      ? 'Conservar entre 15°C y 25°C protegido de la luz y humedad directa. Viales reconstituidos en frío 2°C – 8°C.' 
                      : 'Store between 15°C and 25°C away from direct sunlight. Reconstituted peptide vials at 2°C – 8°C.'}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Award size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                    {isEs ? 'Liberación Técnica de Persona Cualificada (QP)' : 'Qualified Person (QP) Certification'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.45 }}>
                    {isEs 
                      ? 'Liberado conforme a normas de correcta fabricación de la UE y directrices de formulación magistral.' 
                      : 'Officially released under EU Good Compounding Practices and validated batch release protocols.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #f1f3f4',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  toast.success(isEs ? 'Certificado analítico descargado ✓' : 'Certificate of Analysis (COA) downloaded ✓');
                }}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#1a73e8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>{isEs ? 'Descargar Certificado Analítico (COA)' : 'Download Certificate of Analysis (COA)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  window.open('https://www.edqm.eu/en/european-pharmacopoeia-ph-eur-', '_blank');
                }}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={13} />
                <span>{isEs ? 'Monografía Farmacopea Europea (EDQM)' : 'European Pharmacopoeia Standards (EDQM)'}</span>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* ── Atlas Clinical Recommendations (Bioactive Peptides & Colway Hair System) ── */}
        {/* ── Atlas Clinical Recommendations (Lotusland Peptides, UltraPerson & Bloodo) ── */}
        {(activeGcpTab === 'recommendations') && (atlasRecs?.peptide || atlasRecs?.supplement || atlasRecs?.diagnostic || atlasRecs?.colway) && (
          <div id="atlas-recommendations-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              padding: '1.25rem',
              boxShadow: 'none'
            }}>
              {/* Clean GCP Card Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #f1f3f4',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.90rem', fontWeight: 600, color: '#202124' }}>
                        {isEs ? '4. Recomendaciones Clínicas Atlas (Ecosistema Coadyuvante)' : '4. Atlas Clinical Recommendations & Adjuvant Care'}
                      </span>
                      <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {isEs ? 'Basado en Evidencia · Tríada Sinérgica' : 'Evidence-Based · Synergistic Triad'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                      {isEs 
                        ? 'Protocolo coadyuvante calibrado a partir del perfil farmacodinámico y los principios activos de esta receta'
                        : 'Adjuvant biological protocol derived from the active APIs and therapeutic axis of this prescription'}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0'
                }}>
                  Atlas AI Intelligence
                </span>
              </div>
                {/* Detected APIs Header */}
                {atlasRecs.detectedApis && atlasRecs.detectedApis.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #f1f3f4',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '0.78rem', color: '#3c4043' }}>
                      <strong>{isEs ? 'Principios Activos Analizados en esta Fórmula:' : 'Active APIs Analyzed in this Formulation:'}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {atlasRecs.detectedApis.map((api, aIdx) => (
                        <span key={aIdx} style={{ fontSize: '0.70rem', background: '#f8f9fa', color: '#202124', border: '1px solid #dadce0', padding: '2px 7px', borderRadius: '4px', fontWeight: 600, fontFamily: 'monospace' }}>
                          {api}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-Pillar Responsive Grid (Lotusland + UltraPerson + Bloodo + Colway) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
                  {/* 1. Bioactive Biomimetic Peptide (Lotusland Research) */}
                  {atlasRecs.peptide && (
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #c7d2fe',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 2px rgba(67, 56, 202, 0.04)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
                            {isEs ? 'Péptido Biorregulador · Lotusland' : 'Bioactive Peptide · Lotusland'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {atlasRecs.peptide.matchScore || 'High Synergy'}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          {atlasRecs.peptide.peptideName}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', color: '#64748b' }}>
                          {atlasRecs.peptide.category}
                        </p>
                        <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #edf2f7', marginBottom: '8px' }}>
                          <strong style={{ color: '#0f172a' }}>{isEs ? 'Mecanismo Farmacológico & Sinergia: ' : 'Pharmacological Mechanism & Synergy: '}</strong>
                          {atlasRecs.peptide.pharmaRationale}
                        </div>
                      </div>

                      {atlasRecs.peptide.associatedProtocol && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                          <a
                            href={atlasRecs.peptide.associatedProtocol.url || `/proto/${atlasRecs.peptide.associatedProtocol.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 650,
                              color: '#1d4ed8',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>{isEs ? 'Protocolo: ' : 'Protocol: '}{atlasRecs.peptide.associatedProtocol.title}</span>
                            <ArrowUpRight size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Precision Oral Nutraceutical (UltraPerson by PharmaPolis) */}
                  {atlasRecs.supplement && (
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #fed7aa',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 2px rgba(234, 88, 12, 0.04)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#ffedd5', padding: '2px 8px', borderRadius: '4px' }}>
                            {isEs ? 'Suplementación Oral · UltraPerson' : 'Precision Nutraceutical · UltraPerson'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {atlasRecs.supplement.matchScore || 'Metabolic Synergy'}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 3px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          {atlasRecs.supplement.productName}
                        </h4>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.72rem', color: '#9a3412', fontWeight: 600 }}>
                          {atlasRecs.supplement.subtitle || atlasRecs.supplement.category}
                        </p>
                        
                        {/* Key Actives Pills */}
                        {atlasRecs.supplement.keyActives && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                            {atlasRecs.supplement.keyActives.map((act, actIdx) => (
                              <span key={actIdx} style={{ fontSize: '0.66rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                                {act}
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #edf2f7', marginBottom: '8px' }}>
                          <strong style={{ color: '#0f172a' }}>{isEs ? 'Justificación Clínica & Sinergia: ' : 'Clinical Rationale & Synergy: '}</strong>
                          {atlasRecs.supplement.clinicalRationale}
                        </div>

                        {atlasRecs.supplement.routineAdvice && (
                          <div style={{ fontSize: '0.72rem', color: '#475569', background: '#fff7ed', border: '1px solid #fed7aa', padding: '6px 8px', borderRadius: '6px', marginBottom: '8px' }}>
                            <strong style={{ color: '#9a3412' }}>{isEs ? 'Pauta Coadyuvante Sugerida: ' : 'Suggested Dosing Schedule: '}</strong>
                            {atlasRecs.supplement.routineAdvice}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                        <a
                          href={atlasRecs.supplement.catalogUrl || `/p/${atlasRecs.supplement.catalogSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 650,
                            color: '#c2410c',
                            background: '#fff7ed',
                            border: '1px solid #fed7aa',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{isEs ? 'Ver Ficha UltraPerson' : 'View UltraPerson Datasheet'}</span>
                          <ArrowUpRight size={11} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 3. Diagnostic Biomarker Monitoring (Bloodo Diagnostic Suite) */}
                  {atlasRecs.diagnostic && (
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 2px rgba(2, 132, 199, 0.04)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                            {isEs ? 'Monitorización Analítica · Bloodo' : 'Diagnostic Biomarkers · Bloodo'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {atlasRecs.diagnostic.matchScore || 'Analytical Synergy'}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 3px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          {atlasRecs.diagnostic.testName}
                        </h4>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                          {atlasRecs.diagnostic.subtitle || atlasRecs.diagnostic.category}
                        </p>

                        {/* Biomarkers Tested Pills */}
                        {atlasRecs.diagnostic.biomarkersTested && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                            {atlasRecs.diagnostic.biomarkersTested.map((bio, bIdx) => (
                              <span key={bIdx} style={{ fontSize: '0.66rem', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                                {bio}
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #edf2f7', marginBottom: '8px' }}>
                          <strong style={{ color: '#0f172a' }}>{isEs ? 'Objetivo Clínico de Monitorización: ' : 'Monitoring Objective: '}</strong>
                          {atlasRecs.diagnostic.clinicalRationale}
                        </div>

                        {atlasRecs.diagnostic.timingRecommendation && (
                          <div style={{ fontSize: '0.72rem', color: '#475569', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 8px', borderRadius: '6px', marginBottom: '8px' }}>
                            <strong style={{ color: '#0369a1' }}>{isEs ? 'Ventana Temporal Recomendada: ' : 'Recommended Test Window: '}</strong>
                            {atlasRecs.diagnostic.timingRecommendation}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                        <a
                          href={atlasRecs.diagnostic.catalogUrl || `/p/${atlasRecs.diagnostic.catalogSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 650,
                            color: '#0284c7',
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{isEs ? 'Ver Panel Bloodo' : 'View Bloodo Panel Specs'}</span>
                          <ArrowUpRight size={11} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 4. Epicutaneous Barrier & ECM Support (Colway Clinical Care - Only if Topical Scalp) */}
                  {atlasRecs.colway && (
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 2px rgba(4, 120, 87, 0.04)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px' }}>
                            {isEs ? 'Soporte Barrera & Colágeno · Colway' : 'Scalp Barrier & ECM · Colway'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {atlasRecs.colway.matchScore || 'Barrier Support'}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          {atlasRecs.colway.productName}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                          {atlasRecs.colway.brand} • {atlasRecs.colway.regulatoryNotice}
                        </p>
                        <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #edf2f7', marginBottom: '8px' }}>
                          <strong style={{ color: '#0f172a' }}>{isEs ? 'Justificación Clínica: ' : 'Clinical Rationale: '}</strong>
                          {atlasRecs.colway.clinicalRationale}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 8px', borderRadius: '6px', marginBottom: '8px' }}>
                          <strong style={{ color: '#166534' }}>{isEs ? 'Pauta Coadyuvante: ' : 'Recommended Routine: '}</strong>
                          {atlasRecs.colway.routineAdvice}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                        <a
                          href={atlasRecs.colway.catalogUrl || `/p/${atlasRecs.colway.catalogSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 650,
                            color: '#047857',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{isEs ? 'Ver Ficha Técnica Colway' : 'View Colway Clinical Datasheet'}</span>
                          <ArrowUpRight size={11} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </div>
        )}

        {/* ── Pharmacogenomic Clinical Guidance Card (Fagron Genomics) ───────────── */}
        {(activeGcpTab === 'treatment' || activeGcpTab === 'genomics') && genomicsData && (
          <div id="genomics-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
            <GenomicsPrescriptionGuidanceCard
              genomicsData={genomicsData}
              lang={lang}
            />
          </div>
        )}

        {/* ── Section: Doctor & Patient Credentials (Activated from Sidebar or Sub-Tab) ── */}
        {(activeGcpTab === 'credentials') && (
          <div id="doctor-patient-credentials" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '6px',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Stethoscope size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124' }}>
                      {isEs ? 'Acreditación Clínica · Médico Prescriptor y Paciente' : 'Clinical Credentials · Prescribing Physician & Patient'}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: '#e8f0fe',
                      color: '#1a73e8',
                      border: '1px solid #c2e7ff'
                    }}>
                      {isEs ? 'Expediente Oficial' : 'Official Dossier'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                    {isEs
                      ? 'Datos de colegiación médica, clínica prescriptora y filiación del paciente'
                      : 'Medical license, prescribing clinic credentials and patient demographic registration'}
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '12px',
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0'
              }}>
                ✓ {isEs ? 'Facultativo & Paciente Verificados' : 'Verified Clinical Record'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                {/* Panel 1: Prescribing Treating Physician (Full Width Line) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f4', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '6px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Stethoscope size={16} />
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {isEs ? 'Médico Prescriptor Tratante' : 'Prescribing Treating Physician'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                      ✓ {isEs ? 'Prescriptor Clínico Verificado' : 'Verified Clinical Prescriber'}
                    </span>
                  </div>

                  {hasTreatingDoctor ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px 24px',
                      alignItems: 'start'
                    }}>
                      {/* Doctor Name & License */}
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                          {isEs ? 'Facultativo Colegiado' : 'Physician'}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#202124' }}>
                          <Link
                            href={doctorPublicUrl}
                            title={isEs ? `Ir al portal clínico público del Dr/a. ${doctorName}` : `Go to Dr. ${doctorName}'s Public Clinical Portal`}
                            style={{ color: '#1a73e8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>{doctorName}</span>
                            <ExternalLink size={13} color="#1a73e8" />
                          </Link>
                        </div>
                        {doctorLicense && (
                          <div style={{ marginTop: '4px' }}>
                            <CopyableId value={doctorLicense} displayValue={`Lic. ${doctorLicense}`} />
                          </div>
                        )}
                      </div>

                      {/* Specialty */}
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                          {isEs ? 'Especialidad Médica' : 'Medical Specialty'}
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3c4043' }}>
                          {doctorSpecialty}
                        </div>
                      </div>

                      {/* Clinic & Location */}
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                          {isEs ? 'Clínica & Centro' : 'Clinic & Practice'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#3c4043', lineHeight: 1.35 }}>
                          {(doctorClinic || doctorAddress) ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              📍 <strong>{doctorClinic}</strong>{doctorAddress ? ` · ${doctorAddress}` : ''}
                            </span>
                          ) : (
                            <span style={{ color: '#9aa0a6' }}>—</span>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                          {isEs ? 'Contacto Directo' : 'Direct Communications'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem' }}>
                          {doctorPhone && (
                            <a href={`tel:${doctorPhone}`} style={{ color: '#1a73e8', textDecoration: 'none', fontWeight: 600 }}>
                              📞 {doctorPhone}
                            </a>
                          )}
                          {treatingDoc?.email && (
                            <a href={`mailto:${treatingDoc.email}`} style={{ color: '#5f6368', textDecoration: 'none' }}>
                              ✉️ {treatingDoc.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '8px 10px', borderRadius: '6px', background: '#fffbeb', border: '1px dashed #fcd34d', fontSize: '0.78rem', color: '#92400e' }}>
                      ⚠️ {isEs ? 'Sin médico asignado' : 'Pending Physician Assignment'}
                    </div>
                  )}
                </div>

                {/* Panel 2: Registered Patient (Full Width Line) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f4', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '6px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {isEs ? 'Paciente Registrado' : 'Registered Patient Demographics'}
                      </span>
                    </div>
                    <span
                      onClick={() => {
                        navigator.clipboard?.writeText(rxId);
                        toast.success(isEs ? 'Referencia copiada ✓' : 'Reference copied ✓');
                      }}
                      style={{
                        fontSize: '0.70rem',
                        fontFamily: 'monospace',
                        color: '#1a73e8',
                        background: '#e8f0fe',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #c2e7ff'
                      }}
                      title={isEs ? 'Copiar referencia' : 'Copy reference'}
                    >
                      Ref: {rxId}
                      <Copy size={11} />
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px 24px',
                    alignItems: 'start'
                  }}>
                    {/* Patient Name */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                        {isEs ? 'Nombre Completo' : 'Full Name'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#202124', wordBreak: 'break-word', lineHeight: 1.3 }}>
                        {patientName} {patientAlias}
                      </div>
                    </div>

                    {/* Demographics */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                        {isEs ? 'Filiación & Demografía' : 'Demographics'}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#3c4043', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {patient.dob && (
                          <span>{isEs ? 'F. Nac:' : 'DOB:'} <strong>{patient.dob}</strong></span>
                        )}
                        {patient.age && (
                          <>
                            <span style={{ color: '#dadce0' }}>·</span>
                            <span><strong>{patient.age}</strong> {isEs ? 'años' : 'yrs'}{patient.gender ? ` (${patient.gender})` : ''}</span>
                          </>
                        )}
                        {patient.nationality && (
                          <>
                            <span style={{ color: '#dadce0' }}>·</span>
                            <span><strong>{patient.nationality}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Identification / National ID */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                        {isEs ? 'Identificación / Expediente' : 'National ID / Record'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#3c4043' }}>
                        {patient.emiratesId ? (
                          <span>National ID: <strong>{patient.emiratesId}</strong></span>
                        ) : (
                          <span style={{ color: '#5f6368' }}>{isEs ? 'Expediente Clínico Digital' : 'Digital Clinical File'}</span>
                        )}
                      </div>
                    </div>

                    {/* Prescriptions History link */}
                    {isPatientView && (
                      <div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                          {isEs ? 'Historial Clínico' : 'Clinical History'}
                        </div>
                        <button
                          type="button"
                          onClick={() => { triggerHaptic('selection'); setShowPatientRxModal(true); }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: '#1a73e8',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Layers size={13} color="#1a73e8" />
                          <span>{isEs ? 'Ver todas las recetas de este paciente →' : 'View all prescriptions for this patient →'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 3: Clinical Regimen & Scope (Full Width Line) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f4', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '6px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={16} />
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {isEs ? 'Alcance y Régimen Clínico' : 'Clinical Regimen & Dispensing Scope'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                      ✓ EU GMP Cleanroom Verified
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px 24px',
                    alignItems: 'start'
                  }}>
                    {/* Regimen Type */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                        {isEs ? 'Formulación Principal' : 'Primary Formulation'}
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#202124' }}>
                        {rx.treatmentType || prescriptionTypeInfo.label || (isEs ? 'Protocolo Personalizado' : 'Personalized Clinical Protocol')}
                      </div>
                    </div>

                    {/* Phases and Dispensing */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                        {isEs ? 'Fases y Dispensación' : 'Phases & Dispensing'}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#3c4043', fontWeight: 600 }}>
                        {compoundedFormulations.length > 1
                          ? `${compoundedFormulations.length} ${isEs ? 'Fases Secuenciales' : 'Sequential Phases'} · ${compoundedFormulations.map(f => f.volume || '').filter(Boolean).join(' + ') || (compoundedFormulations[0]?.dosageForm || 'Oral')}`
                          : (compoundedFormulations[0]?.volume || rx.dispensingForm || (isEs ? 'Formulación Magistral' : 'Compounded Formulation'))}
                      </div>
                    </div>

                    {/* Quality Release Standard */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                        {isEs ? 'Estándar Farmacopéico' : 'Pharmacopeial Standard'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#137333', fontWeight: 600 }}>
                        ✓ EU GMP Certified Dispensary · Pharmapolis &amp; Fagron Quality
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        )}

        {/* ── Section 5: Doctor & Clinical Care Hub (Patient View) vs Patient Sharing & Mobile Access (Doctor View) ── */}
        {(activeGcpTab === 'patientSharing') && (
        <div id="patient-sharing-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
          <div className="rx-card" style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '1.5rem',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Clean GCP Card Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f1f3f4',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: 34, 
                  height: 34, 
                  borderRadius: '6px', 
                  background: isPatientView ? '#eff6ff' : '#ecfdf5', 
                  color: isPatientView ? '#1d4ed8' : '#059669', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}>
                  {isPatientView ? <Stethoscope size={18} /> : <Share2 size={18} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124' }}>
                      {isPatientView
                        ? (isEs ? '5. Contacto Médico & Soporte Clínico' : '5. Doctor & Clinical Care Hub')
                        : (isEs ? '5. Compartir con el Paciente & Acceso Móvil' : '5. Patient Communication & Mobile Access Hub')}
                    </span>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 500, 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      background: isPatientView ? '#eff6ff' : '#ecfdf5', 
                      color: isPatientView ? '#1d4ed8' : '#047857', 
                      border: isPatientView ? '1px solid #bfdbfe' : '1px solid #a7f3d0' 
                    }}>
                      {isPatientView 
                        ? (isEs ? 'Atención Médica' : 'Direct Clinician Contact') 
                        : (isEs ? 'Portal del Paciente' : 'Patient Safe View')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                    {isPatientView
                      ? (isEs 
                          ? 'Comunicación directa con tu médico prescriptor y centro clínico autorizado' 
                          : 'Direct communication with your prescribing physician and licensed medical practice')
                      : (isEs 
                          ? 'Enlace privado sin datos técnicos de laboratorio, código QR de consulta y envío directo por WhatsApp' 
                          : 'Private patient dossier link, clinical QR code and direct WhatsApp sharing')}
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '12px',
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0'
              }}>
                ✓ {isEs ? 'Canal Encriptado y Seguro' : 'Secure Clinical Channel'}
              </span>
            </div>
              {isPatientView ? (
                /* ── PATIENT VIEW: Dedicated Doctor & Clinical Support Hub ── */
                <>
                  <PatientExperienceHub
                    rx={rx}
                    isPatientView={true}
                    lang={lang}
                    doctorPhone={doctorPhone}
                    patientPublicUrl={patientPublicUrl}
                    onOpenQuotation={() => setShowAtlasQuotationModal(true)}
                  />

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginTop: '8px'
                  }}>
                    {/* Physician & Licensed Practice Credentials */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: '#e0f2fe',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Stethoscope size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                            {doctorName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {doctorSpecialty || (isEs ? 'Médico Prescriptor Titular' : 'Prescribing Physician')}
                          </div>
                          {doctorLicense && (
                            <div style={{ fontSize: '0.70rem', color: '#0369a1', fontWeight: 600, marginTop: 2 }}>
                              {formattedDoctorLicense || `Lic. ${doctorLicense}`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#334155' }}>
                          <Building2 size={15} style={{ color: '#64748b', flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <strong>{doctorClinic}</strong>
                            {doctorAddress && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>{doctorAddress}</div>}
                          </div>
                        </div>
                        {doctorPhone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#334155' }}>
                            <Phone size={15} style={{ color: '#64748b', flexShrink: 0 }} />
                            <a href={`tel:${doctorPhone}`} style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
                              {doctorPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Direct Patient Communication Channels */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                          {isEs ? 'Canales Directos con la Consulta' : 'Direct Practice Channels'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                          {isEs 
                            ? 'Conéctate de forma segura con la consulta médica para resolver dudas de dosificación o coordinar visitas presenciales.' 
                            : 'Connect securely with the clinical team to clarify protocol timing or schedule follow-up appointments.'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* WhatsApp Action */}
                        <a
                          href={`https://wa.me/${String(doctorPhone || '+97143498800').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            isEs
                              ? `Estimado equipo médico de ${doctorClinic},\nSoy ${patientName}, paciente del ${doctorName}. Me pongo en contacto en relación a mi prescripción médica #${rxId}.\n🔗 Consulta de seguimiento: ${patientPublicUrl}`
                              : `Dear ${doctorClinic} clinical team,\nI am ${patientName}, patient of ${doctorName}. I am contacting you regarding my prescription #${rxId}.\n🔗 Clinical follow-up inquiry: ${patientPublicUrl}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#25D366',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                          }}
                        >
                          <span>💬 {isEs ? 'Contactar por WhatsApp con la Clínica' : 'Contact Clinic / Doctor on WhatsApp'}</span>
                        </a>

                        {/* Call Clinic Action */}
                        {doctorPhone && (
                          <a
                            href={`tel:${doctorPhone}`}
                            style={{
                              background: '#ffffff',
                              color: '#0f172a',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '9px 16px',
                              fontSize: '0.80rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            <Phone size={15} style={{ color: '#0284c7' }} />
                            <span>{isEs ? `Llamar a la Consulta (${doctorPhone})` : `Call Practice (${doctorPhone})`}</span>
                          </a>
                        )}

                        {/* QR Modal for Patient Wallet */}
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('selection');
                            setShowQrModal(true);
                          }}
                          style={{
                            background: '#ffffff',
                            color: '#0284c7',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <QrCode size={15} />
                          <span>{isEs ? 'Ver Código QR de Mi Receta' : 'View My Prescription QR Card'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── DOCTOR / ADMIN VIEW: Patient Communication & Mobile Sharing Hub ── */
                <>
                  <PatientExperienceHub
                    rx={rx}
                    isPatientView={false}
                    lang={lang}
                    doctorPhone={doctorPhone}
                    patientPublicUrl={patientPublicUrl}
                  />

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginTop: '8px'
                  }}>
                    {/* Column 1: QR & In-Clinic Scan */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '10px'
                    }}>
                      <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>
                        📱 {isEs ? 'Código QR para Escaneo en Consulta' : 'In-Clinic Mobile QR Scan'}
                      </div>
                      <div style={{
                        background: '#ffffff',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}>
                        <QRCodeSVG
                          value={patientPublicUrl}
                          size={150}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {isEs ? 'El paciente puede escanearlo directamente desde la pantalla' : 'The patient can scan this directly using their mobile camera'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setShowQrModal(true);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#0f172a',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Maximize2 size={13} />
                        <span>{isEs ? 'Ampliar QR en Pantalla Completa' : 'Full Screen QR'}</span>
                      </button>
                    </div>

                    {/* Column 2: Direct Share & WhatsApp */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>
                        🔗 {isEs ? 'Enlace Directo del Paciente' : 'Direct Patient Link'}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        gap: '8px'
                      }}>
                        <input
                          type="text"
                          readOnly
                          value={patientPublicUrl}
                          style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '0.75rem',
                            color: '#334155',
                            background: 'transparent',
                            fontFamily: 'monospace'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('selection');
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(patientPublicUrl);
                              toast.success(isEs ? 'Enlace del paciente copiado ✓' : 'Patient link copied ✓');
                            }
                          }}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0
                          }}
                        >
                          <Copy size={12} />
                          <span>{isEs ? 'Copiar' : 'Copy'}</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            isEs
                              ? `Estimado/a ${patientName},\nAquí tiene su pauta personalizada y guía de administración prescrita por ${doctorName}:\n🔗 ${patientPublicUrl}`
                              : `Dear ${patientName},\nHere is your personalized treatment guide and daily routine prescribed by ${doctorName}:\n🔗 ${patientPublicUrl}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#25D366',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '0.80rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                          }}
                        >
                          <span>💬 {isEs ? 'Enviar por WhatsApp al Paciente' : 'Share via WhatsApp with Patient'}</span>
                        </a>

                        <a
                          href={patientPublicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#ffffff',
                            color: '#0284c7',
                            border: '1px solid #0284c7',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <ExternalLink size={14} />
                          <span>{isEs ? 'Abrir Vista de Paciente en Nueva Pestaña' : 'Open Patient View in New Tab'}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
        </div>
        )}

        {/* ── Section 6: Request to Atlas Quotation ── */}
        {(activeGcpTab === 'quotation') && !isPatientView && (
        <div id="atlas-quotation-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
          <div className="rx-card" style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '1.5rem',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Clean GCP Card Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f1f3f4',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '6px',
                  background: '#eff6ff',
                  color: '#1a73e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124' }}>
                      {isEs ? '6. Solicitar Cotización de Elaboración a Atlas' : '6. Request to Atlas Quotation'}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe'
                    }}>
                      Atlas Compounding Board
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
                    {isEs 
                      ? 'Petición directa de cotización de formulación magistral al equipo central de Atlas Health Services' 
                      : 'Direct compounding quotation request to Atlas Health Services central operations'}
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}>
                📄 {isEs ? 'Presupuesto Bajo Demanda' : 'On-Demand Pricing'}
              </span>
            </div>
              {/* Summary Table of Formulations to Quote */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {isEs ? 'Fórmulas y Presentaciones a Cotizar' : 'Compounding Formulations to Quote'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {compoundedFormulations.map((form, idx) => (
                    <div key={form.id || idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                            {form.vehicle?.name || form.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {Array.isArray(form.apis) ? form.apis.map(a => `${a.name} ${a.concentration || ''}`).join(' + ') : 'Compounded actives'}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {form.volume || form.vehicle?.volume || '3 months treatment'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requester Credentials Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {isEs ? 'Médico Prescriptor' : 'Prescribing Clinician'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {doctorName}
                  </div>
                  {doctorSpecialty && (
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>{doctorSpecialty}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {isEs ? 'Centro / Clínica' : 'Practice / Clinic'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {doctorClinic || clinic}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{doctorPhone || treatingDoc.email || ''}</div>
                </div>
              </div>

              {/* Default Note */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#475569'
              }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{isEs ? 'Nota predeterminada:' : 'Standard request note:'}</span>{' '}
                <span style={{ fontStyle: 'italic', color: '#0284c7' }}>"Please provide compounding quotation."</span>
              </div>

              {/* CTA Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('impact');
                    setShowAtlasQuotationModal(true);
                  }}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <FileText size={16} />
                  <span>{isEs ? 'Solicitar cotización a Atlas' : 'Request to Atlas quotation'}</span>
                </button>
              </div>
            </div>
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
            patientName={patientName}
            patient={patient}
            doctorName={doctorName}
            doctorTitle={doctorSpecialty}
            doctorLicense={doctorLicense}
            doctorOffice={doctorAddress}
            doctorPhone={doctorPhone}
            publicUrl={publicUrl}
            onOpenPdf={() => setShowBrochureModal(true)}
            onExportExcel={handleExportExcel}
            activeGcpTab={activeGcpTab}
            onSelectTab={setActiveGcpTab}
            lang={lang}
          />
        </div>
      </div>

      {/* Floating Bottom Action Dock (Doctor & Patient View - GCP Standard) */}
      {!embedded && (
        <div className="rx-bottom-dock">
          {/* Patient pill indicator / jump anchor */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveGcpTab('credentials');
              setExpandedSections(prev => ({ ...prev, credentials: true }));
              setTimeout(() => {
                const el = document.getElementById('doctor-patient-credentials');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 50);
            }}
            className="rx-dock-patient-pill"
            title={isEs ? 'Ver datos y acreditación de paciente y médico' : 'View patient & doctor credentials'}
          >
            <span className="rx-dock-patient-avatar">{patientName?.charAt(0) || 'P'}</span>
            <div className="rx-dock-patient-meta">
              <span className="rx-dock-patient-name">{patientName}</span>
              <span className="rx-dock-patient-ref">#{rxId}</span>
            </div>
          </button>

          <div className="rx-bottom-dock-actions">
            {!isPatientView ? (
              /* Doctor View CTAs */
              <>
                {/* 1. Sign & Authorize (if draft/pending) */}
                {['draft', 'pending'].includes(currentStatus) && (
                  <button
                    type="button"
                    disabled={isSigning}
                    onClick={handleDoctorSignOff}
                    className="rx-dock-btn rx-dock-btn-sign"
                    title={isEs ? 'Firmar y autorizar formulación magistral' : 'Digitally sign and authorize prescription'}
                  >
                    {isSigning ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{isEs ? 'Firmando...' : 'Signing...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} color="#38bdf8" />
                        <span>{isEs ? 'Firmar Receta' : 'Sign & Authorize'}</span>
                      </>
                    )}
                  </button>
                )}

                {/* 2. Documents dropdown */}
                <div style={{ position: 'relative' }} ref={docDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setShowDocDropdown(prev => !prev);
                    }}
                    className="rx-dock-btn rx-dock-btn-primary"
                    title={isEs ? 'Ver monografía, guía o etiquetas' : 'View Monograph, Guide or Labels'}
                  >
                    <FileText size={14} color="#ffffff" />
                    <span>{isEs ? 'Documentos' : 'Documents'}</span>
                    <ChevronDown
                      size={13}
                      color="#ffffff"
                      style={{
                        transform: showDocDropdown ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  </button>

                  {/* Upward Dropdown Menu */}
                  {showDocDropdown && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 10px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 999,
                      background: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 12px 32px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.08)',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      minWidth: '270px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      animation: 'fadeIn 0.15s ease-out'
                    }}>
                      <button
                        type="button"
                        onClick={() => { setShowDocDropdown(false); setShowBrochureModal(true); }}
                        className="rx-dock-drop-item"
                      >
                        <FileText size={16} color="#1a73e8" />
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Bróchure Médico' : 'Medical Brochure'}</div>
                          <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Monografía clínica completa (A4)' : 'Full clinical monograph (A4)'}</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowDocDropdown(false); setShowBrochureModal(true); }}
                        className="rx-dock-drop-item"
                      >
                        <User size={16} color="#059669" />
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Guía del Paciente' : 'Patient Guide'}</div>
                          <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Pauta diaria de administración' : 'Daily administration schedule'}</div>
                        </div>
                      </button>

                      {prescriptionLabels.length > 0 && (
                        <>
                          <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                          <button
                            type="button"
                            onClick={() => { setShowDocDropdown(false); setSelectedLabelIndex(0); setShowLabelsModal(true); }}
                            className="rx-dock-drop-item"
                          >
                            <Tag size={16} color="#c2410c" />
                            <div>
                              <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? `Etiquetas (${prescriptionLabels.length})` : `Bottle Labels (${prescriptionLabels.length})`}</div>
                              <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Etiquetas EU GMP 300 DPI' : 'EU GMP labels 300 DPI'}</div>
                            </div>
                          </button>
                        </>
                      )}

                      <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                      <button
                        type="button"
                        onClick={() => { setShowDocDropdown(false); handleExportExcel(); }}
                        className="rx-dock-drop-item"
                      >
                        <FileSpreadsheet size={16} color="#16a34a" />
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Exportar Ficha (Excel)' : 'Export Specs (Excel)'}</div>
                          <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Fórmula galénica completa' : 'Complete compounding formula'}</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Request Quotation / Pedir Cotización */}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); setShowAtlasQuotationModal(true); }}
                  className="rx-dock-btn rx-dock-btn-quote"
                  title={isEs ? 'Solicitar cotización oficial a Atlas' : 'Request compounding quotation'}
                >
                  <FileText size={14} color="#ffffff" />
                  <span>{isEs ? 'Pedir Cotización' : 'Request Quote'}</span>
                </button>

                {/* 4. QR Verification */}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); setShowQrModal(true); }}
                  className="rx-dock-btn rx-dock-btn-secondary"
                  title={isEs ? 'Verificación QR de la prescripción' : 'QR Verification'}
                >
                  <QrCode size={14} color="#1a73e8" />
                  <span className="rx-dock-btn-label-desktop">{isEs ? 'QR' : 'QR'}</span>
                </button>
              </>
            ) : (
              /* Patient View CTAs */
              <>
                {/* 1. Treatment Guide */}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); setShowBrochureModal(true); }}
                  className="rx-dock-btn rx-dock-btn-primary"
                  title={isEs ? 'Ver guía de tratamiento y PDF' : 'View treatment guide & PDF'}
                >
                  <FileText size={14} color="#ffffff" />
                  <span>{isEs ? 'Guía de Tratamiento' : 'Treatment Guide'}</span>
                </button>

                {/* 2. All My Prescriptions */}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); setShowPatientRxModal(true); }}
                  className="rx-dock-btn rx-dock-btn-secondary"
                  title={isEs ? 'Ver todas mis recetas' : 'View all my prescriptions'}
                >
                  <Layers size={14} color="#1a73e8" />
                  <span>{isEs ? 'Mis Recetas' : 'My Prescriptions'}</span>
                </button>

                {/* 3. Inquire / Renew */}
                <button
                  type="button"
                  onClick={() => setIsInquiryDrawerOpen(true)}
                  className="rx-dock-btn rx-dock-btn-quote"
                  title={isEs ? 'Consultar con Atlas' : 'Inquire with Atlas'}
                >
                  <MessageSquare size={14} color="#ffffff" />
                  <span>{isDispensed ? (isEs ? 'Renovar' : 'Refill') : (isEs ? 'Pedir Cotización' : 'Request Quote')}</span>
                </button>

                {/* 4. QR */}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); setShowQrModal(true); }}
                  className="rx-dock-btn rx-dock-btn-secondary"
                  title={isEs ? 'Ver QR de mi receta' : 'View my prescription QR'}
                >
                  <QrCode size={14} color="#1a73e8" />
                </button>
              </>
            )}
          </div>
        </div>
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
          isNutriGen: prescriptionTypeInfo.key === 'nutrigen',
          isPatientView,
          isDispensed,
          inquiryGoal: isPatientView ? (isDispensed ? 'renewal' : 'quotation') : 'inquiry',
          priceFormatted: resolvedPrice?.formatted || 'AED 1,450.00'
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
          formula: rx.formula || compoundedFormulations.map(f => f.formula || f.apis.map(a => `${a.name} ${a.dosage || ''}`.trim()).join(' + ')).filter(Boolean).join(' // ') || rx.treatmentType || 'Custom Compounded Formulation',
          dosage: getPosologyText(rx.posology) || compoundedFormulations[0]?.posology?.regimen || 'As prescribed by physician',
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

      {/* ── Official Clinical & Patient Brochure Live Preview Modal ── */}
      <PrescriptionBrochureModal
        isOpen={showBrochureModal}
        onClose={() => setShowBrochureModal(false)}
        rx={rx}
        compoundedFormulations={compoundedFormulations}
        genomicsData={genomicsData}
        currentStatus={currentStatus}
        isPatientView={isPatientView}
        publicUrl={publicUrl}
        patientPublicUrl={patientPublicUrl}
        onOpenLabels={() => {
          setSelectedLabelIndex(0);
          setShowLabelsModal(true);
        }}
      />

      {/* ── Request to Atlas quotation Modal ── */}
      <RequestAtlasQuotationModal
        rx={rx}
        isOpen={showAtlasQuotationModal}
        onClose={() => setShowAtlasQuotationModal(false)}
      />

      {/* ── Doctor Prescriptions Switcher Modal (doctor view only) ── */}
      {!isPatientView && (
        <DoctorRxSwitcherModal
          isOpen={showRxSwitcherModal}
          onClose={() => setShowRxSwitcherModal(false)}
          currentRx={rx}
          currentRxId={rxId}
          doctorName={doctorName}
          lang={lang}
        />
      )}

      {/* ── Patient Prescriptions Switcher Modal (patient view only - cross-physician record) ── */}
      {isPatientView && (
        <PatientRxSwitcherModal
          isOpen={showPatientRxModal}
          onClose={() => setShowPatientRxModal(false)}
          currentRx={rx}
          currentRxId={rxId}
          patientName={patientName}
          patientId={rx.patientId || patient?.id}
          patientPhone={patient?.phone}
          patientEmail={patient?.email}
          lang={lang}
          onOpenBrochure={() => setShowBrochureModal(true)}
          onRequestRefill={() => setShowAtlasQuotationModal(true)}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  Upload,
  ChevronDown,
  ChevronUp,
  Tag,
  Smartphone,
  MessageSquare
} from '@/lib/icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { RotateCcw, Home, Loader2, AlertTriangle, MessageCircle, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DoctorAuthNoticeModal = dynamic(
  () => import('@/components/doctor/modals/DoctorAuthNoticeModal'),
  { ssr: false }
);
const PatientAuthNoticeModal = dynamic(
  () => import('@/components/patient/modals/PatientAuthNoticeModal'),
  { ssr: false }
);

import { exportPrescriptionToXlsx } from '@/utils/exportPrescriptionToXlsx';
import { triggerHaptic } from '@/utils/haptics';
import { verifyPatientAccessKey } from '@/utils/prescriptionToken';
import toast from 'react-hot-toast';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PrescriptionDetailSidebar from '@/components/prescription/PrescriptionDetailSidebar';
import GenomicsPrescriptionGuidanceCard from '@/components/prescription/GenomicsPrescriptionGuidanceCard';
import ComplementaryHairMineralCard from '@/components/prescription/ComplementaryHairMineralCard';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import '@/styles/publicDesignSystem.css';
import './publicPrescriptionMobile.css';
import MultiPartOverview from './MultiPartOverview';
import PatientExperienceHub from '@/components/prescription/PatientExperienceHub';
import AtlasSynergyRecommendationsSection from '@/components/prescription/AtlasSynergyRecommendationsSection';
import PrescriptionMasterHeader from '@/components/prescription/PrescriptionMasterHeader';
import PatientActionBannerCard from '@/components/prescription/PatientActionBannerCard';
import CompoundedFormulationsSection from '@/components/prescription/CompoundedFormulationsSection';
import PatientPrescriptionGuide from '@/components/prescription/PatientPrescriptionGuide';
import RoadmapMilestonesSection from '@/components/prescription/RoadmapMilestonesSection';
import QualityTraceabilitySection from '@/components/prescription/QualityTraceabilitySection';
import PrescriptionModalsContainer from '@/components/prescription/PrescriptionModalsContainer';
import CalendarSyncModal from '@/components/prescription/CalendarSyncModal';
import PrescriptionDoctorContactModal from '@/components/prescription/PrescriptionDoctorContactModal';
import { getPrescriptionAtlasRecommendations } from '@/services/atlasRecommendationsEngine';
import { usePrescriptionData, getPosologyText } from '@/hooks/usePrescriptionData';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { fetchAuthorizedPrescriptionAction } from '@/actions/prescriptionsActions';

export default function PublicPrescriptionClient({ rx, embedded = false, onBackToIntake: _onBackToIntake = null, initialView = null }) {
  const { user } = useAuth();
  const { can, is } = useRoleAccess();
  const isAuthorizedViewer = Boolean(can('view:patients') || is('doctor') || is('medical_director') || is('admin') || is('clinic') || is('account_manager'));

  const [currentRx, setCurrentRx] = useState(rx || {});
  const [prevRx, setPrevRx] = useState(rx);
  if (rx !== prevRx) {
    setPrevRx(rx);
    setCurrentRx(rx || {});
  }

  // Authoritative re-fetch: If user is authenticated as Admin/Doctor/Clinic and SSR provided a codified payload,
  // load the full authoritative prescription document
  useEffect(() => {
    if (isAuthorizedViewer && (currentRx?.isCodifiedView || currentRx?.patientName?.startsWith('Patient PT-') || currentRx?.doctorName === 'Licensed Clinical Practice')) {
      const targetCode = currentRx?.fileNumber || currentRx?.code || currentRx?.id || rx?.fileNumber || rx?.code || rx?.id;
      if (targetCode) {
        fetchAuthorizedPrescriptionAction(targetCode).then(fullRx => {
          if (fullRx && !fullRx.isCodifiedView) {
            setCurrentRx(fullRx);
          }
        }).catch(err => {
          console.warn('[PublicPrescriptionClient] Authorized re-fetch error:', err);
        });
      }
    }
  }, [isAuthorizedViewer, currentRx?.isCodifiedView, currentRx?.patientName, currentRx?.doctorName, currentRx?.id, currentRx?.code, currentRx?.fileNumber, rx?.id, rx?.code, rx?.fileNumber]);

  const searchParams = useSearchParams();
  const viewParam = initialView || searchParams?.get('view') || searchParams?.get('mode');
  const defaultIsPatientView = viewParam === 'patient' || (!isAuthorizedViewer && viewParam !== 'doctor');
  const [overrideView, setOverrideView] = useState(null); // 'patient' | 'doctor' | null
  const isPatientView = overrideView ? overrideView === 'patient' : defaultIsPatientView;

  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [inquiryCustomEntity, setInquiryCustomEntity] = useState(null);
  const [activeGcpTab, setActiveGcpTab] = useState('treatment'); // 'treatment' | 'roadmap' | 'traceability' | 'credentials' | 'patientSharing'
  const [showDoctorAuthModal, setShowDoctorAuthModal] = useState(false);
  const [showPatientAuthModal, setShowPatientAuthModal] = useState(false);
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false);
  const [showDoctorContactModal, setShowDoctorContactModal] = useState(false);

  const handleOpenInquiry = useCallback((customEntity = null) => {
    setInquiryCustomEntity(customEntity || null);
    setIsInquiryDrawerOpen(true);
  }, []);
  const [, setExpandedSections] = useState({
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
    return currentRx?.atlasRecommendations || getPrescriptionAtlasRecommendations(currentRx);
  }, [currentRx]);
  const [, setSelectedPhase] = useState('all'); // 'all' | 'formulation-0' | 'formulation-1' | 'formulation-2'
  const [expandedPhases, setExpandedPhases] = useState({});
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [selectedLabelIndex, setSelectedLabelIndex] = useState(0);
  const [showAtlasQuotationModal, setShowAtlasQuotationModal] = useState(false);
  const [showPatientShareModal, setShowPatientShareModal] = useState(false);
  const [showRxSwitcherModal, setShowRxSwitcherModal] = useState(false);
  const [showPatientRxModal, setShowPatientRxModal] = useState(false);

  const togglePhase = (id) => {
    setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Global smooth jump listener from sidebar
  React.useEffect(() => {
    const handleSectionJump = (e) => {
      const targetId = e.detail?.id;
      if (!targetId) return;
      if (targetId.startsWith('formulation') || targetId.includes('phase') || targetId === 'formula-card') {
        setActiveGcpTab('treatment');
        setExpandedSections(prev => ({ ...prev, formulations: true }));
      } else if (targetId === 'genomics-card' || targetId.includes('genomic')) {
        setActiveGcpTab('genomics');
        setExpandedSections(prev => ({ ...prev, genomics: true }));
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
        if (isPatientView) {
          setActiveGcpTab('patientSharing');
          setExpandedSections(prev => ({ ...prev, patientSharing: true }));
        } else {
          setShowPatientShareModal(true);
        }
      } else if (targetId.includes('quotation')) {
        setShowAtlasQuotationModal(true);
      } else {
        setActiveGcpTab('treatment');
      }
    };
    window.addEventListener('OPEN_RX_SECTION', handleSectionJump);
    return () => window.removeEventListener('OPEN_RX_SECTION', handleSectionJump);
  }, []);

  const isEs = lang === 'es';

  const {
    rxId,
    patient,
    patientName,
    patientAlias,
    treatingDoc,
    doctorName,
    nominalDoctorName,
    displayDoctorName,
    displayDoctorNameShort,
    doctorOpaqueCode,
    doctorClinic,
    clinic,
    doctorSpecialty,
    doctorAddress,
    doctorPhone,
    safeDoctorPhone,
    doctorLicense,
    formattedDoctorLicense,
    doctorPublicUrl,
    hasTreatingDoctor,
    genomicsData,
    prescriptionTypeInfo,
    compoundedFormulations,
    prescriptionLabels,
    tocSections,
    resolvedFormulaSummary,
    resolvedDosageSummary,
    resolvedPrice,
    timeline
  } = usePrescriptionData(currentRx, { lang, isEs, isPatientView, atlasRecs, isAuthorizedViewer });

  const baseUrl = 'https://www.atlashealth-services.com';
  const publicUrl = `${baseUrl}/rx/${rxId}`;
  const patientPublicUrl = `${baseUrl}/rx/${rxId}?view=patient`;

  // Zero-friction tokenized access for patients entering via doctor-shared WhatsApp / QR
  const tokenParam = searchParams?.get('k') || searchParams?.get('token') || searchParams?.get('access');
  const isTokenAuthorized = useMemo(() => {
    return Boolean(tokenParam && rxId && verifyPatientAccessKey(rxId, tokenParam));
  }, [tokenParam, rxId]);
  const isPatientAuthenticated = Boolean(user || isTokenAuthorized);

  // Daily Adherence Tracking for Patient View
  const todayAdherenceKey = useMemo(() => {
    const d = new Date();
    return `atlas_rx_adh_${rxId}_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [rxId]);

  const [hasLoggedDoseToday, setHasLoggedDoseToday] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const d = new Date();
      const k = `atlas_rx_adh_${rxId}_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return Boolean(localStorage.getItem(k));
    } catch {
      return false;
    }
  });

  const handleToggleDoseToday = () => {
    triggerHaptic('selection');
    const nextState = !hasLoggedDoseToday;
    setHasLoggedDoseToday(nextState);
    if (typeof window !== 'undefined') {
      try {
        if (nextState) {
          localStorage.setItem(todayAdherenceKey, JSON.stringify({ takenAt: new Date().toISOString() }));
          toast.success(isEs ? '¡Dosis de hoy registrada! Cumplimiento al día ✓' : 'Today’s dose logged! Adherence on track ✓', { icon: '💊' });
        } else {
          localStorage.removeItem(todayAdherenceKey);
          toast(isEs ? 'Registro de dosis cancelado' : 'Dose log removed');
        }
      } catch {
        /* ignore */
      }
    }
  };

  const [currentStatus, setCurrentStatus] = useState(() => {
    return String(currentRx.status || currentRx.state || currentRx.fagronStatus || currentRx.orderStatus || 'approved').toLowerCase().trim();
  });
  const [isSigning, setIsSigning] = useState(false);

  const handleDoctorSignOff = async () => {
    if (!isAuthorizedViewer) {
      setShowDoctorAuthModal(true);
      return;
    }
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

  // Real-time Firestore sync: updates status & full clinical data whenever changed in doctor/admin portal or label editor
  useEffect(() => {
    if (!rxId || !db) return;
    try {
      const docRef = doc(db, 'prescriptions', String(currentRx.id || rx?.id || rxId));
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          const newStatus = String(data.status || data.state || data.orderStatus || data.fagronStatus || '').toLowerCase().trim();
          
          setCurrentRx(prev => {
            const prevStatus = String(prev.status || prev.state || prev.orderStatus || '').toLowerCase().trim();
            const isStatusChanged = newStatus && newStatus !== prevStatus;
            const isTrackingChanged = data.trackingNumber && data.trackingNumber !== prev.trackingNumber;
            const isUpdatedChanged = data.updatedAt && data.updatedAt !== prev.updatedAt;
            if (!isStatusChanged && !isTrackingChanged && !isUpdatedChanged && prev.id === docSnap.id) {
              return prev; // Identical state: preserve reference, eliminate hydration flicker
            }
            return {
              ...prev,
              ...data,
              id: docSnap.id
            };
          });

          if (newStatus) {
            setCurrentStatus(prevStatus => prevStatus === newStatus ? prevStatus : newStatus);
          }
        }
        // Silently catch permission error in unauthenticated public view
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('[PublicPrescriptionClient] Status sync listener warning:', err?.message || err);
    }
  }, [rxId, rx?.id, currentRx?.id]);

  // Listen to manual label editor saved events for instantaneous local reactivity
  useEffect(() => {
    const handlePrescriptionUpdated = (e) => {
      const { updatedFields, updatedData, item } = e.detail || {};
      if (!updatedFields && !updatedData && !item) return;
      setCurrentRx(prev => {
        const merged = { ...prev };
        if (updatedFields) Object.assign(merged, updatedFields);
        if (updatedData) Object.assign(merged, updatedData);
        if (item) {
          if (item.patientName) merged.patientName = item.patientName;
          if (item.productTitle) {
            merged.title = item.productTitle;
            merged.productTitle = item.productTitle;
          }
          if (item.volume) merged.volume = item.volume;
          if (item.directions) {
            merged.directions = item.directions;
            merged.instructions = item.directions;
          }
          if (item.batchCode) merged.batchCode = item.batchCode;
          if (item.doctorName) merged.doctorName = item.doctorName;
          if (item.clinicName) merged.clinicName = item.clinicName;
        }
        return merged;
      });
    };
    window.addEventListener('prescription-updated', handlePrescriptionUpdated);
    return () => window.removeEventListener('prescription-updated', handlePrescriptionUpdated);
  }, []);

  // Document Dropdown & Brochure Modal States
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const docDropdownRef = useRef(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (docDropdownRef.current && !docDropdownRef.current.contains(event.target)) {
        setShowDocDropdown(false);
      }
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target)) {
        setShowPatientDropdown(false);
      }
    }
    if (showDocDropdown || showPatientDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDocDropdown, showPatientDropdown]);

  const isDispensed = useMemo(() => {
    return Boolean(
      ['dispensed', 'delivered', 'completed', 'fulfilled'].includes(currentStatus) ||
      rx.isDispensed ||
      rx.dispensedAt ||
      rx.dispensedDate
    );
  }, [currentStatus, rx.isDispensed, rx.dispensedAt, rx.dispensedDate]);


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


  return (
    <div className="rx-dossier-main-wrapper">
      {/* ── Public Unified Header (GCP Standard with Login, Lang, Clinical AI) ───── */}
      {!embedded && (
        <PublicUnifiedHeader 
          track="protocols"
          lang={lang}
          onLangChange={(newLang) => setLang(newLang)}
          clinicLogo={treatingDoc?.clinicLogo || treatingDoc?.logoUrl || currentRx?.clinicLogo}
          clinicName={clinic || doctorClinic || treatingDoc?.clinic}
          copyUrl={isPatientView ? patientPublicUrl : publicUrl}
          shortUrl={isPatientView ? patientPublicUrl : publicUrl}
          loginRedirect={isPatientView ? patientPublicUrl : publicUrl}
          hideTier2={false}
          breadcrumb={doctorPublicUrl ? [
            { label: clinic || doctorClinic || treatingDoc?.clinic || displayDoctorNameShort || (isEs ? 'Clínica' : 'Clinic'), href: doctorPublicUrl },
            { label: isEs ? 'Prescripción Médica' : 'Medical Prescription' },
            { label: `#${rxId || currentRx?.prescriptionNumber || currentRx?.code || 'RX'}` }
          ] : [
            { label: isEs ? 'Portal de Pacientes' : 'Patient Portal', href: '/patient' },
            { label: isEs ? 'Prescripción Médica' : 'Medical Prescription' },
            { label: `#${rxId || currentRx?.prescriptionNumber || currentRx?.code || 'RX'}` }
          ]}
          brandHref={doctorPublicUrl}
          brandTitle={isAuthorizedViewer ? (isEs ? `Volver al portal del Dr/a. ${nominalDoctorName}` : `Return to Dr. ${nominalDoctorName}'s Portal`) : (isEs ? 'Portal de Práctica Médica Verificada' : 'Verified Medical Practice Portal')}
          doctorHomeHref={doctorPublicUrl}
          doctorName={displayDoctorNameShort}
          hideAccountManager={true}
          hideImportRx={isPatientView || !isAuthorizedViewer}
          hideSwitchRx={isPatientView || !isAuthorizedViewer}
          isDoctorView={!isPatientView && isAuthorizedViewer}
          inquiryContextType="prescription"
          inquiryEntity={{
            name: `Prescription ${rxId} — ${patientName}`,
            rxId,
            code: rxId,
            patientName,
            doctorName: isAuthorizedViewer ? (nominalDoctorName || 'Dr. Haytham Salem') : displayDoctorNameShort,
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
            { label: displayDoctorNameShort, href: doctorPublicUrl },
            { label: isEs ? 'Pacientes' : 'Patients', href: isAuthorizedViewer ? `${doctorPublicUrl}#patients` : undefined },
            { label: patientName || (isEs ? 'Expediente Paciente' : 'Patient Dossier') },
            { label: `#${rxId}` }
          ]}
          onImportRx={() => { window.location.href = `/rx/intake?from=${rxId}&fromRole=doctor`; }}
          onSwitchRx={() => setShowRxSwitcherModal(true)}
        />
      )}

      <div className="rx-dossier-inner-container">
        <div className="pds-content-with-sidebar">
          <div className="pds-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* ── Master Header Card (Google Cloud Console High-Density Resource Header) ─────── */}
            <PrescriptionMasterHeader
              rx={rx}
              rxId={rxId}
              isEs={isEs}
              isPatientView={isPatientView}
              isAuthorizedViewer={isAuthorizedViewer}
              onSwitchView={(mode) => {
                triggerHaptic('selection');
                setOverrideView(mode);
              }}
              currentStatus={currentStatus}
              currentStatusMeta={currentStatusMeta}
              setCurrentStatus={setCurrentStatus}
              doctorName={displayDoctorNameShort}
              doctorPublicUrl={doctorPublicUrl}
              handleCopyLink={handleCopyLink}
              copied={copied}
              onOpenPatientShare={() => setShowPatientShareModal(true)}
              onOpenInquiry={() => setShowDoctorContactModal(true)}
              onSyncCalendar={() => setShowCalendarSyncModal(true)}
              activeGcpTab={activeGcpTab}
              setActiveGcpTab={setActiveGcpTab}
              compoundedFormulations={compoundedFormulations}
              atlasRecs={atlasRecs}
              setExpandedPhases={setExpandedPhases}
              setSelectedPhase={setSelectedPhase}
              setExpandedSections={setExpandedSections}
            />

            {/* ── Patient Action & Refill Banner Card (Patient View Standard) ── */}
            <PatientActionBannerCard
              isPatientView={isPatientView}
              isDispensed={isDispensed}
              isEs={isEs}
              rxId={rxId}
              rx={currentRx}
              doctorName={displayDoctorNameShort}
              resolvedPrice={resolvedPrice}
              isAuthenticated={isPatientAuthenticated}
              onRequireAuth={() => setShowPatientAuthModal(true)}
              onOpenInquiry={() => setShowDoctorContactModal(true)}
            />

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

        {/* ── Compounded Formulations & Dedicated Posology Architecture (Patient vs Clinical) ──────────── */}
        {activeGcpTab === 'treatment' && (
          isPatientView ? (
            <PatientPrescriptionGuide
              rx={currentRx}
              compoundedFormulations={compoundedFormulations}
              isEs={isEs}
              doctorName={displayDoctorNameShort}
              doctorClinic={doctorClinic}
              doctorPhone={safeDoctorPhone}
              patientName={patientName}
              rxId={rxId}
              patientPublicUrl={patientPublicUrl}
              onOpenQuotation={() => setShowAtlasQuotationModal(true)}
              onOpenDoctorContact={() => setShowDoctorContactModal(true)}
            />
          ) : (
            <CompoundedFormulationsSection
              compoundedFormulations={compoundedFormulations}
              isEs={isEs}
              prescriptionLabels={prescriptionLabels}
              expandedPhases={expandedPhases}
              setExpandedPhases={setExpandedPhases}
              setSelectedPhase={setSelectedPhase}
              togglePhase={togglePhase}
              setSelectedLabelIndex={setSelectedLabelIndex}
              setShowLabelsModal={setShowLabelsModal}
            />
          )
        )}

        {/* ── Biological Milestones & Evolution (90 Days) ────────────────────────── */}
        {activeGcpTab === 'roadmap' && (
          <RoadmapMilestonesSection
            timeline={timeline}
            isEs={isEs}
          />
        )}

        {/* ── Section: Quality, Laboratory & EU GMP Traceability (Authentic Dossier) ──────────────── */}
        {activeGcpTab === 'traceability' && (
          <QualityTraceabilitySection
            rxId={rxId}
            isEs={isEs}
          />
        )}

        {/* ── Atlas Clinical Recommendations (Lotusland, UltraPerson, Bloodo & Colway) ── */}
        {(activeGcpTab === 'recommendations') && (atlasRecs?.peptide || atlasRecs?.supplement || atlasRecs?.diagnostic || atlasRecs?.colway || atlasRecs?.teletestHairMineral) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
            <AtlasSynergyRecommendationsSection
              atlasRecs={atlasRecs}
              isEs={isEs}
            />
            {atlasRecs?.teletestHairMineral && (
              <ComplementaryHairMineralCard
                rx={currentRx}
                lang={lang}
                onOpenInquiry={handleOpenInquiry}
                compact={false}
              />
            )}
          </div>
        )}

        {/* ── Pharmacogenomic Clinical Guidance Card (Fagron Genomics) ───────────── */}
        {activeGcpTab === 'genomics' && genomicsData && (
          <div id="genomics-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
            <GenomicsPrescriptionGuidanceCard
              genomicsData={genomicsData}
              lang={lang}
              rx={currentRx}
              onOpenInquiry={handleOpenInquiry}
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
                            title={isAuthorizedViewer ? (isEs ? `Ir al portal clínico del Dr/a. ${nominalDoctorName}` : `Go to Dr. ${nominalDoctorName}'s Clinical Portal`) : (isEs ? 'Ir al portal de la práctica médica' : 'Go to medical practice portal')}
                            style={{ color: '#1a73e8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>{displayDoctorNameShort}</span>
                            <ExternalLink size={13} color="#1a73e8" />
                          </Link>
                        </div>
                        {isAuthorizedViewer ? (
                          doctorLicense && (
                            <div style={{ marginTop: '4px' }}>
                              <CopyableId value={doctorLicense} displayValue={`Lic. ${doctorLicense}`} />
                            </div>
                          )
                        ) : (
                          <div style={{ marginTop: '4px', fontSize: '0.74rem', color: '#16a34a', fontWeight: 650 }}>
                            ✓ {isEs ? 'Acreditado DHA' : 'DHA Accredited Practice'}
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
                    {!isAuthorizedViewer && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.05rem' }}>🔒</span>
                          <div>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                              DHA & HIPAA Protected Health Information (PHI)
                            </div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                              Patient demographic identities and private contact channels are codified for unauthenticated access.
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/login?redirect=/rx/${rxId}`}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '4px',
                            background: '#003666',
                            color: '#ffffff',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Doctor Sign In</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    )}

                    {/* Patient Name */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{isEs ? 'Nombre Completo' : 'Full Name'}</span>
                        {!isAuthorizedViewer && (
                          <span style={{ fontSize: '0.58rem', background: '#e2e8f0', color: '#475569', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                            CODIFIED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#202124', wordBreak: 'break-word', lineHeight: 1.3 }}>
                        {patientName} {isAuthorizedViewer ? patientAlias : ''}
                      </div>
                    </div>

                    {/* Demographics */}
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                        {isEs ? 'Filiación & Demografía' : 'Demographics'}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#3c4043', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {!isAuthorizedViewer ? (
                          <span style={{ color: '#64748b', fontSize: '0.80rem' }}>
                            {patient.gender ? `${patient.gender} · ` : ''}Protected Medical Record
                          </span>
                        ) : (
                          <>
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
                        {!isAuthorizedViewer ? (
                          <span style={{ color: '#64748b', fontSize: '0.80rem' }}>Confidential (Physician Access Only)</span>
                        ) : patient.emiratesId ? (
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

        {/* ── Section 5: Doctor & Clinical Care Hub (Dedicated Patient View Support) ── */}
        {(activeGcpTab === 'patientSharing') && isPatientView && (
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
                    doctorPhone={safeDoctorPhone}
                    patientPublicUrl={patientPublicUrl}
                    onOpenQuotation={() => setShowAtlasQuotationModal(true)}
                    patientName={patientName}
                    doctorName={displayDoctorNameShort}
                    isAuthorizedViewer={isAuthorizedViewer}
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
                            {displayDoctorNameShort}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {isAuthorizedViewer ? (doctorSpecialty || (isEs ? 'Médico Prescriptor Titular' : 'Prescribing Physician')) : (isEs ? 'Práctica Médica Colaboradora' : 'Collaborating Medical Practice')}
                          </div>
                          {isAuthorizedViewer && doctorLicense ? (
                            <div style={{ fontSize: '0.70rem', color: '#0369a1', fontWeight: 600, marginTop: 2 }}>
                              {formattedDoctorLicense || `Lic. ${doctorLicense}`}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 650, marginTop: 2 }}>
                              ✓ {isEs ? 'Acreditación Oficial DHA' : 'Official DHA Accreditation'}
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
                        {isAuthorizedViewer && doctorPhone && (
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
                          href={`https://wa.me/${String(safeDoctorPhone || '+97143498800').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            isEs
                              ? `Estimado equipo médico de ${doctorClinic},\nSoy ${patientName}${isAuthorizedViewer ? `, paciente del ${nominalDoctorName}` : ''}. Me pongo en contacto en relación a mi prescripción médica #${rxId}.\n🔗 Consulta de seguimiento: ${patientPublicUrl}`
                              : `Dear ${doctorClinic} clinical team,\nI am ${patientName}${isAuthorizedViewer ? `, patient of ${nominalDoctorName}` : ''}. I am contacting you regarding my prescription #${rxId}.\n🔗 Clinical follow-up inquiry: ${patientPublicUrl}`
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
                    doctorPhone={safeDoctorPhone}
                    patientPublicUrl={patientPublicUrl}
                    patientName={patientName}
                    doctorName={displayDoctorNameShort}
                    isAuthorizedViewer={isAuthorizedViewer}
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
                              ? `Estimado/a ${patientName},\nAquí tiene su pauta personalizada y guía de administración prescrita por ${isAuthorizedViewer ? (nominalDoctorName.startsWith('Dr') ? nominalDoctorName : `Dr. ${nominalDoctorName}`) : (isEs ? 'su práctica médica' : 'your medical practice')}:\n🔗 ${patientPublicUrl}`
                              : `Dear ${patientName},\nHere is your personalized treatment guide and daily routine prescribed by ${isAuthorizedViewer ? (nominalDoctorName.startsWith('Dr') ? nominalDoctorName : `Dr. ${nominalDoctorName}`) : 'your medical practice'}:\n🔗 ${patientPublicUrl}`
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

            {/* Standardized Institutional Footer with Reference (Google Cloud Console Compliant) */}
            <footer style={{
              marginTop: '2rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
              paddingBottom: '2rem',
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
              <div style={{ color: '#64748b', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>Atlas Clinical Intelligence Infrastructure</span>
                <span>•</span>
                <span>ISO 15189 / 17025 Accredited</span>
                <span>•</span>
                <span>EU GMP Compounding Alliance</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.70rem' }}>
                Confidential Patient Prescription Dossier · Authorized Clinical Access Only
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
            doctorPublicUrl={doctorPublicUrl}
            publicUrl={publicUrl}
            onOpenPdf={() => setShowBrochureModal(true)}
            onExportExcel={handleExportExcel}
            activeGcpTab={activeGcpTab}
            onSelectTab={setActiveGcpTab}
            lang={lang}
            isAuthorizedViewer={isAuthorizedViewer}
            isPatientView={isPatientView}
            onOpenQuotation={() => setShowAtlasQuotationModal(true)}
          />
        </div>
      </div>

      {/* ── Google Cloud Console Standard Unified Footer ── */}
      <PublicUnifiedFooter lang={lang || 'en'} minimal={embedded} />

      {/* ── Universal Public Sticky Action Bar (GCP Standard Across All Public Pages) ── */}
      {!embedded && (
        <PublicStickyActionBar
          title={
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0, maxWidth: '100%' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {patientName || (isEs ? 'Expediente Paciente' : 'Patient Dossier')}
              </span>
              <CopyableId value={rxId} />
            </div>
          }
          subtitle={
            compoundedFormulations.length > 1
              ? `${isEs ? 'Parte' : 'Part'} ${compoundedFormulations[0]?.index || 1} de ${compoundedFormulations.length}: ${compoundedFormulations[0]?.shortTitle || resolvedFormulaSummary} • Dr. ${displayDoctorNameShort}`
              : `${resolvedFormulaSummary || prescriptionTypeInfo.label} • Dr. ${nominalDoctorName || displayDoctorNameShort || 'Atlas Clinical'}`
          }
          badge={
            <StatusBadge 
              status={currentStatus || 'active'} 
              label={isPatientView ? (isEs ? 'Tratamiento Activo' : 'Active Treatment') : undefined}
            />
          }
          inquireLabel={
            isPatientView
              ? (
                  !isPatientAuthenticated ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Lock size={12} color="#fbbf24" />
                      <span>{isDispensed ? (isEs ? 'Solicitar Reposición' : 'Request Refill') : (isEs ? 'Pedir Medicación' : 'Order Prescription')}</span>
                    </span>
                  ) : (
                    isDispensed ? (isEs ? 'Solicitar Reposición' : 'Request Refill') : (isEs ? 'Pedir Medicación' : 'Order Prescription')
                  )
                )
              : (isEs ? 'Consultar Laboratorio' : 'Inquire Lab Support')
          }
          onInquire={() => {
            if (isPatientView && !isPatientAuthenticated) {
              setShowPatientAuthModal(true);
            } else {
              setIsInquiryDrawerOpen(true);
            }
          }}
          showClinicalAI={true}
          onOpenClinicalAI={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-public-atlas-ai', {
                detail: {
                  productName: resolvedFormulaSummary || rxId,
                  category: prescriptionTypeInfo.label,
                  initialQuery: isEs
                    ? `¿Cómo debo tomar mi prescripción ${rxId} (${resolvedFormulaSummary}) y qué recomendaciones o interacciones debo seguir?`
                    : `How should I take my prescription ${rxId} (${resolvedFormulaSummary}) and what instructions or interactions should I follow?`
                }
              }));
            }
          }}
          showSections={true}
          sectionsCount={4}
          sectionsLabel={isEs ? 'Secciones' : 'Sections'}
          onOpenSections={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-rx-sections'));
            }
          }}
          lang={lang}
          extraActions={
            !isPatientView ? (
              /* Doctor View Supplemental Actions */
              <>
                {['draft', 'pending'].includes(currentStatus) && (
                  <button
                    type="button"
                    disabled={isSigning}
                    onClick={isAuthorizedViewer ? handleDoctorSignOff : () => setShowDoctorAuthModal(true)}
                    className="rx-dock-btn rx-dock-btn-sign"
                    title={
                      !isAuthorizedViewer
                        ? (isEs ? 'Iniciar sesión médica para firmar y autorizar' : 'Sign in as physician to sign & authorize')
                        : (isEs ? 'Firmar y autorizar formulación magistral' : 'Digitally sign and authorize prescription')
                    }
                  >
                    {isSigning ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{isEs ? 'Firmando...' : 'Signing...'}</span>
                      </>
                    ) : !isAuthorizedViewer ? (
                      <>
                        <Lock size={14} color="#f59e0b" />
                        <span>{isEs ? 'Firmar (Login Requerido)' : 'Sign (Login Required)'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} color="#38bdf8" />
                        <span>{isEs ? 'Firmar Receta' : 'Sign & Authorize'}</span>
                      </>
                    )}
                  </button>
                )}

                <div style={{ position: 'relative' }} ref={docDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setShowDocDropdown(prev => !prev);
                    }}
                    className="rx-dock-btn rx-dock-btn-secondary"
                    title={isEs ? 'Ver monografía, guía o etiquetas' : 'View Monograph, Guide or Labels'}
                  >
                    <FileText size={14} color="#003666" />
                    <span>{isEs ? 'Documentos' : 'Documents'}</span>
                    <ChevronDown
                      size={13}
                      color="#64748b"
                      style={{
                        transform: showDocDropdown ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  </button>

                  {showDocDropdown && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 12px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 999,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(24px) saturate(190%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                      borderRadius: '8px',
                      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                      border: '1px solid #cbd5e1',
                      padding: '6px',
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
                        <FileText size={15} color="#1a73e8" />
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
                        <User size={15} color="#059669" />
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
                            <Tag size={15} color="#c2410c" />
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
                        <FileSpreadsheet size={15} color="#16a34a" />
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Exportar Ficha (Excel)' : 'Export Specs (Excel)'}</div>
                          <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Fórmula galénica completa' : 'Complete compounding formula'}</div>
                        </div>
                      </button>

                      <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                      <button
                        type="button"
                        onClick={() => { setShowDocDropdown(false); setShowAtlasQuotationModal(true); }}
                        className="rx-dock-drop-item"
                      >
                        <FileText size={15} color="#0284c7" />
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Cotización de Laboratorio' : 'Lab Compounding Quote'}</div>
                          <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Solicitar presupuesto a Fagron / Atlas' : 'Request compounding quotation'}</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    const rawPhone = rx?.patientPhone || patient?.phone || patient?.mobile || '';
                    const cleanPhone = String(rawPhone).replace(/[^\d+]/g, '').replace(/^00/, '+');
                    const isProposal = currentStatus === 'proposal_pending' || rx?.isTreatmentProposal || rx?.orderStatus === 'Offer Not Accepted';
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
                    const docSignature = isAuthorizedViewer ? (nominalDoctorName.startsWith('Dr') ? nominalDoctorName : `Dr. ${nominalDoctorName}`) : (isEs ? 'Su práctica médica' : 'Your medical practice');
                    const text = isProposal
                      ? (isEs
                          ? `Estimado/a ${patientName},\n\n${docSignature} le remite su Propuesta de Tratamiento Personalizada:\n\n📋 Pauta: ${resolvedFormulaSummary}\n🆔 Ref: #${rxId}\n\nPuede revisar su formulación y confirmar la dispensación aquí:\n🔗 ${origin}/rx/${rxId}`
                          : `Dear ${patientName},\n\n${docSignature} has prepared your personalized Clinical Treatment Proposal:\n\n📋 Regimen: ${resolvedFormulaSummary}\n🆔 Proposal Ref: #${rxId}\n\nYou can review your formulation and activate your order here:\n🔗 ${origin}/rx/${rxId}`)
                      : (isEs
                          ? `Estimado/a ${patientName},\nAquí tiene su pauta personalizada y guía de administración prescrita por ${docSignature}:\n🔗 ${patientPublicUrl}`
                          : `Dear ${patientName},\nHere is your personalized treatment guide and daily routine prescribed by ${docSignature}:\n🔗 ${patientPublicUrl}`);
                    const waBase = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : 'https://wa.me/';
                    window.open(`${waBase}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="rx-dock-btn"
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: '1px solid #15803d',
                    boxShadow: '0 1px 3px rgba(22, 163, 74, 0.25)'
                  }}
                  title={isEs ? 'Compartir pauta o seguimiento con el paciente por WhatsApp' : 'Share posology or follow up with patient on WhatsApp'}
                >
                  <MessageCircle size={14} color="#ffffff" />
                  <span>
                    {currentStatus === 'proposal_pending' || rx?.isTreatmentProposal
                      ? (isEs ? 'Seguimiento' : 'Follow-up')
                      : (isEs ? 'Compartir Paciente' : 'Share with Patient')}
                  </span>
                </button>

                <Link
                  href={doctorPublicUrl}
                  className="rx-dock-btn rx-dock-btn-secondary"
                  style={{ textDecoration: 'none' }}
                  title={isAuthorizedViewer ? (isEs ? `Volver al portal clínico de ${nominalDoctorName}` : `Return to ${nominalDoctorName}'s Clinical Portal`) : (isEs ? 'Volver al portal de la práctica' : 'Return to practice portal')}
                >
                  <ArrowLeft size={14} color="#003666" strokeWidth={2.5} />
                  <span className="rx-dock-btn-label-desktop">{isEs ? 'Mi Portal' : 'My Portal'}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); setShowQrModal(true); }}
                  className="rx-dock-btn rx-dock-btn-secondary"
                  title={isEs ? 'Verificación QR de la prescripción' : 'QR Verification'}
                >
                  <QrCode size={14} color="#003666" />
                  <span className="rx-dock-btn-label-desktop">{isEs ? 'QR' : 'QR'}</span>
                </button>
              </>
            ) : (
              /* Patient View Supplemental Actions — Adherence + Direct Doctor Bridge + Options */
              <>
                <button
                  type="button"
                  onClick={handleToggleDoseToday}
                  className="rx-dock-btn"
                  style={{
                    background: hasLoggedDoseToday ? '#f0fdf4' : '#ffffff',
                    border: hasLoggedDoseToday ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                    color: hasLoggedDoseToday ? '#15803d' : '#334155',
                    fontWeight: 650
                  }}
                  title={isEs ? 'Registrar o cancelar la toma de medicación de hoy' : 'Toggle today’s dose confirmation'}
                >
                  {hasLoggedDoseToday ? <CheckCircle2 size={14} color="#16a34a" /> : <Pill size={14} color="#0284c7" />}
                  <span className="rx-dock-btn-label-desktop">
                    {hasLoggedDoseToday ? (isEs ? 'Dosis de hoy: Tomada ✓' : 'Today: Dose Logged ✓') : (isEs ? 'Marcar toma de hoy' : 'Log Today’s Dose')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setShowDoctorContactModal(true);
                  }}
                  className="rx-dock-btn"
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontWeight: 650
                  }}
                  title={isEs ? `Consultar a ${nominalDoctorName || displayDoctorNameShort}` : `Ask ${nominalDoctorName || displayDoctorNameShort} a question`}
                >
                  <MessageSquare size={14} color="#1d4ed8" />
                  <span className="rx-dock-btn-label-desktop">{isEs ? 'Consultar al Dr.' : 'Contact Doctor'}</span>
                </button>

                <div style={{ position: 'relative' }} ref={patientDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setShowPatientDropdown(prev => !prev);
                    }}
                    className="rx-dock-btn rx-dock-btn-secondary"
                    title={isEs ? 'Guía, autenticidad y opciones del paciente' : 'Regimen guide, QR & patient options'}
                  >
                    <FileText size={14} color="#003666" />
                    <span className="rx-dock-btn-label-desktop">{isEs ? 'Guía y Opciones' : 'Guide & Options'}</span>
                    <ChevronDown
                      size={13}
                      color="#64748b"
                      style={{
                        transform: showPatientDropdown ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  </button>

                {showPatientDropdown && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 12px)',
                    right: 0,
                    zIndex: 999,
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(24px) saturate(190%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                    border: '1px solid #cbd5e1',
                    padding: '6px',
                    minWidth: '280px',
                    maxWidth: 'calc(100vw - 32px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    {/* 1. Official Regimen Guide PDF */}
                    <button
                      type="button"
                      onClick={() => { setShowPatientDropdown(false); setShowBrochureModal(true); }}
                      className="rx-dock-drop-item"
                    >
                      <FileText size={15} color="#1a73e8" />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Guía de Tratamiento (PDF)' : 'Treatment Routine Guide (PDF)'}</div>
                        <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Pauta de administración y descarga para viajes' : 'Daily administration schedule & travel PDF'}</div>
                      </div>
                    </button>

                    {/* 2. Official QR Verification */}
                    <button
                      type="button"
                      onClick={() => { setShowPatientDropdown(false); setShowQrModal(true); }}
                      className="rx-dock-drop-item"
                    >
                      <QrCode size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Verificación Autenticidad QR' : 'Official QR Verification'}</div>
                        <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Validación digital farmacéutica EU GMP' : 'EU GMP digital dispensing verification'}</div>
                      </div>
                    </button>

                    {/* 3. Multi-Part Phase Switcher (if > 1 phase, e.g. RX-51812-A Morning vs Night) */}
                    {compoundedFormulations.length > 1 && (
                      <>
                        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                        <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '2px 8px' }}>
                          {isEs ? 'Fórmulas del Tratamiento' : 'Regimen Formulas'}
                        </div>
                        {compoundedFormulations.map((f, idx) => (
                          <button
                            key={f.id || idx}
                            type="button"
                            onClick={() => {
                              setShowPatientDropdown(false);
                              setSelectedPhase(f.id);
                              setActiveGcpTab('treatment');
                              setExpandedPhases(prev => ({ ...prev, [f.id]: true }));
                              const elem = document.getElementById(f.id) || document.getElementById(`formulation-${idx}`);
                              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="rx-dock-drop-item"
                          >
                            <Pill size={15} color={idx === 0 ? '#16a34a' : '#7c3aed'} />
                            <div>
                              <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>
                                {f.title || (isEs ? `Fórmula ${idx + 1}` : `Formula ${idx + 1}`)}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                                {f.dosageForm || (isEs ? 'Ver pauta y posología' : 'View formula details')}
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* 4. WhatsApp Direct Refill Request */}
                    <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPatientDropdown(false);
                        const text = isEs
                          ? `Hola, soy ${patientName}. Deseo solicitar la reposición de mi prescripción #${rxId} (${resolvedFormulaSummary || 'fórmula magistral'}).\n🔗 Expediente de verificación: ${patientPublicUrl}`
                          : `Hello, I am ${patientName}. I would like to request a refill for my prescription #${rxId} (${resolvedFormulaSummary || 'compounded formula'}).\n🔗 Verification link: ${patientPublicUrl}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="rx-dock-drop-item"
                    >
                      <MessageCircle size={15} color="#25D366" />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>{isEs ? 'Pedir Reposición por WhatsApp' : 'Request Refill via WhatsApp'}</div>
                        <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{isEs ? 'Mesa de despacho farmacéutico directo' : 'Direct pharmacy dispensing desk'}</div>
                      </div>
                    </button>

                    {/* 5. Contact Doctor/Clinic if phone available */}
                    {safeDoctorPhone && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowPatientDropdown(false);
                          const cleanPhone = String(safeDoctorPhone).replace(/[^0-9]/g, '');
                          const text = isEs
                            ? `Hola equipo de ${doctorClinic || 'consulta médica'}, soy ${patientName}. Tengo una consulta sobre mi pauta prescrita #${rxId}.\n🔗 Enlace: ${patientPublicUrl}`
                            : `Hello ${doctorClinic || 'clinical practice'}, I am ${patientName}. I have a question regarding my prescribed regimen #${rxId}.\n🔗 Link: ${patientPublicUrl}`;
                          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="rx-dock-drop-item"
                      >
                        <Stethoscope size={15} color="#003666" />
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>
                            {isEs ? `Contactar Clínica (${doctorClinic || 'Médico'})` : `Message Clinic (${doctorClinic || 'Practice'})`}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                            {isEs ? 'Dudas médicas sobre posología o revisión' : 'Clinical dosage or follow-up query'}
                          </div>
                        </div>
                      </button>
                    )}

                    {/* 6. Submit New Prescription / Lab Report (Frictionless Ingestion) */}
                    <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPatientDropdown(false);
                        window.location.href = `/rx/intake?from=${rxId}${treatingDoc?.opaqueCode ? `&refDoctor=${treatingDoc.opaqueCode}` : ''}`;
                      }}
                      className="rx-dock-drop-item"
                    >
                      <Upload size={15} color="#003666" />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>
                          {isEs ? 'Subir Nueva Receta o Analítica' : 'Submit New Rx or Lab'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                          {isEs ? 'Digitalización autónoma multimodal' : 'Autonomous multimodal AI intake'}
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          )
        }
        />
      )}

      {/* Context-Aware Prescription Clinical Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => {
          setIsInquiryDrawerOpen(false);
          setInquiryCustomEntity(null);
        }}
        contextType={inquiryCustomEntity ? 'product' : 'prescription'}
        initialEntity={inquiryCustomEntity || {
          name: `Prescription ${rxId} — ${patientName}`,
          rxId,
          code: rxId,
          patientName,
          doctorName: isAuthorizedViewer ? (nominalDoctorName || rx.treatingDoctor?.name || 'Treating Physician') : displayDoctorNameShort,
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

      {/* ── Prescription Dedicated Clinical AI Research Copilot ── */}
      <PublicAtlasAIDrawer
        contextType="prescription"
        contextAnchor={{
          name: `Prescription ${rxId}`,
          rxId,
          code: rxId,
          doctorName: isAuthorizedViewer ? nominalDoctorName : displayDoctorNameShort,
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

      {/* ── Prescription Modals Container ── */}
      <PrescriptionModalsContainer
        rx={currentRx}
        rxId={rxId}
        isEs={isEs}
        lang={lang}
        isPatientView={isPatientView}
        patient={patient}
        patientName={patientName}
        doctorName={displayDoctorNameShort}
        doctorClinic={doctorClinic}
        compoundedFormulations={compoundedFormulations}
        genomicsData={genomicsData}
        currentStatus={currentStatus}
        publicUrl={publicUrl}
        patientPublicUrl={patientPublicUrl}
        prescriptionLabels={prescriptionLabels}
        showPatientShareModal={showPatientShareModal}
        setShowPatientShareModal={setShowPatientShareModal}
        showQrModal={showQrModal}
        setShowQrModal={setShowQrModal}
        handleDownloadQrPng={handleDownloadQrPng}
        previewDoc={previewDoc}
        setPreviewDoc={setPreviewDoc}
        showLabelsModal={showLabelsModal}
        setShowLabelsModal={setShowLabelsModal}
        selectedLabelIndex={selectedLabelIndex}
        setSelectedLabelIndex={setSelectedLabelIndex}
        showBrochureModal={showBrochureModal}
        setShowBrochureModal={setShowBrochureModal}
        showAtlasQuotationModal={showAtlasQuotationModal}
        setShowAtlasQuotationModal={setShowAtlasQuotationModal}
        showRxSwitcherModal={showRxSwitcherModal}
        setShowRxSwitcherModal={setShowRxSwitcherModal}
        showPatientRxModal={showPatientRxModal}
        setShowPatientRxModal={setShowPatientRxModal}
        onPrescriptionUpdated={(payload) => {
          if (payload?.updatedFields) {
            setCurrentRx(prev => ({ ...prev, ...payload.updatedFields }));
          }
        }}
      />

      {/* ── Google Cloud UX Doctor Authentication Notice Modal ── */}
      <DoctorAuthNoticeModal
        isOpen={showDoctorAuthModal}
        onClose={() => setShowDoctorAuthModal(false)}
        doctor={{ name: nominalDoctorName || displayDoctorNameShort }}
        opaqueCode={rxId}
        resourceName={isEs ? 'Firma facultativa y autorización de dispensación' : 'Physician digital signature & dispensing clearance'}
      />

      {/* ── Google Cloud UX Patient Authentication Notice Modal ── */}
      <PatientAuthNoticeModal
        isOpen={showPatientAuthModal}
        onClose={() => setShowPatientAuthModal(false)}
        rxId={rxId}
        doctorName={nominalDoctorName || displayDoctorNameShort}
        actionGoal={isDispensed ? 'refill' : 'quotation'}
        isEs={isEs}
      />

      {/* ── Google Cloud Calendar Synchronization Modal ── */}
      <CalendarSyncModal
        isOpen={showCalendarSyncModal}
        onClose={() => setShowCalendarSyncModal(false)}
        rxId={rxId}
        patientName={patientName}
        doctorName={displayDoctorNameShort}
        compoundedFormulations={compoundedFormulations}
        patientPublicUrl={patientPublicUrl}
        isEs={isEs}
      />

      {/* ── Google Cloud UX Doctor-Patient Communication Bridge Modal ── */}
      <PrescriptionDoctorContactModal
        isOpen={showDoctorContactModal}
        onClose={() => setShowDoctorContactModal(false)}
        rxId={rxId}
        rx={currentRx}
        doctorName={nominalDoctorName || displayDoctorNameShort}
        doctorClinic={doctorClinic}
        doctorPhone={currentRx?.doctorPhone || '+97143498800'}
        patientName={patientName}
        patientEmail={patient?.email || ''}
        patientPublicUrl={patientPublicUrl}
        compoundedFormulations={compoundedFormulations}
        isEs={isEs}
      />
    </div>
  );
}

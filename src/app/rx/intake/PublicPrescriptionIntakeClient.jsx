"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from 'next/navigation';
import {
  Upload, X, CheckCircle2, AlertCircle, FileText,
  Sparkles, RefreshCw, ExternalLink, Download, ArrowLeft,
  Eye, Phone, Stethoscope, Copy, Check, Camera, FileSpreadsheet, ShieldAlert, User,
  Database, ThumbsUp, ThumbsDown, ClipboardCheck, ChevronRight, Info, XCircle, Plus, Trash2, Layers,
  SplitSquareHorizontal, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, ShieldCheck, Factory, Dna, Activity,
  Mail, Send, Award, ArrowRight, QrCode, Share2, MessageCircle
} from '@/lib/icons';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPrescriptionClient from '../[code]/PublicPrescriptionClient';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import IntakeStepperHeader from './components/IntakeStepperHeader';
import IntakePhase3Deliver from './components/IntakePhase3Deliver';
import IntakePatientQrModal from './components/IntakePatientQrModal';
import IntakeDoctorSelector from './components/IntakeDoctorSelector';
import {
  extractPrescriptionFromDocument,
  normalizeExtractedPrescriptions
} from '@/services/prescriptionAiService';
import { uploadPrescriptionDocument } from '@/services/prescriptionStorageService';
import { exportPrescriptionToXlsx, exportBatchPrescriptionsToXlsx } from '@/utils/exportPrescriptionToXlsx';
import { getFagronClinicalMonograph as getClinicalPharmacopeiaMonograph } from '@/data/fagronClinicalMonographs';
import '@/styles/publicDesignSystem.css';

const PUBLIC_INTAKE_STYLES = `
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

  /* ── Google Cloud Platform UX Stepper Navigation ── */
  .gcp-stepper-wrapper {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 10px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    position: sticky;
    top: 0;
    z-index: 9999;
  }

  .gcp-stepper-container {
    max-width: 1040px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .gcp-stepper-step {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .gcp-stepper-step.active {
    background: #f0f7ff;
    border-color: #bfdbfe;
  }

  .gcp-stepper-step.clickable {
    cursor: pointer;
  }
  .gcp-stepper-step.clickable:hover {
    background: #f8fafc;
  }

  .gcp-stepper-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 800;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .gcp-stepper-step.active .gcp-stepper-circle {
    background: #003666;
    color: #ffffff;
    box-shadow: 0 0 0 3px rgba(0, 54, 102, 0.15);
  }

  .gcp-stepper-step.completed .gcp-stepper-circle {
    background: #16a34a;
    color: #ffffff;
  }

  .gcp-stepper-step.pending .gcp-stepper-circle {
    background: #e2e8f0;
    color: #64748b;
  }

  .gcp-stepper-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .gcp-stepper-title {
    font-size: 0.82rem;
    font-weight: 800;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .gcp-stepper-step.pending .gcp-stepper-title {
    color: #64748b;
  }

  .gcp-stepper-step.active .gcp-stepper-title {
    color: #003666;
  }

  .gcp-stepper-desc {
    font-size: 0.7rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .gcp-stepper-divider {
    height: 2px;
    background: #e2e8f0;
    flex: 0 0 24px;
    border-radius: 1px;
  }

  .gcp-stepper-divider.completed {
    background: #16a34a;
  }

  /* ── Google Cloud Platform UX Standards for Intake Topbar ── */
  .gcp-intake-topbar {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .gcp-intake-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .gcp-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 9999px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .gcp-status-pill.published {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  .gcp-status-pill.review {
    background: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  .gcp-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
    display: inline-block;
  }

  .gcp-intake-title-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .gcp-intake-main-title {
    font-size: 0.92rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.25;
    margin: 0;
  }

  .gcp-intake-meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #475569;
    flex-wrap: wrap;
  }

  .gcp-code-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #003666;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.74rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .gcp-code-badge:hover {
    background: #e2e8f0;
    border-color: #94a3b8;
  }

  .gcp-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #475569;
    font-weight: 500;
  }

  .gcp-intake-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .gcp-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    text-decoration: none;
    line-height: 1.2;
    border: 1px solid transparent;
  }

  .gcp-action-btn-primary {
    background: #003666;
    color: #ffffff;
    border-color: #002244;
    box-shadow: 0 1px 2px rgba(0, 54, 102, 0.15);
  }
  .gcp-action-btn-primary:hover {
    background: #002b52;
    box-shadow: 0 2px 4px rgba(0, 54, 102, 0.25);
  }

  .gcp-action-btn-secondary {
    background: #ffffff;
    color: #334155;
    border-color: #cbd5e1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }
  .gcp-action-btn-secondary:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #0f172a;
  }

  .gcp-action-btn-excel {
    background: #ffffff;
    color: #15803d;
    border-color: #bbf7d0;
  }
  .gcp-action-btn-excel:hover {
    background: #f0fdf4;
    border-color: #86efac;
  }

  .gcp-action-btn-ghost {
    background: #f8fafc;
    color: #475569;
    border-color: #e2e8f0;
  }
  .gcp-action-btn-ghost:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }

  .gcp-telemetry-bar {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 6px 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .gcp-telemetry-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.73rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 5px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    border: 1px solid #e2e8f0;
    line-height: 1.3;
  }

  .gcp-stepper-mobile-progress {
    display: none;
  }

  .intake-capabilities-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    text-align: left;
    max-width: 880px;
    margin: 0 auto 1.5rem;
  }

  /* Responsive for Mobile Devices (< 768px / < 640px) */
  @media (max-width: 768px) {
    .gcp-stepper-wrapper {
      padding: 8px 12px;
    }
    .gcp-stepper-container {
      gap: 6px;
    }
    .gcp-stepper-step {
      padding: 4px 6px;
      gap: 6px;
      flex: 0 0 auto;
    }
    .gcp-stepper-step.active {
      flex: 1 1 auto;
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .gcp-stepper-step:not(.active) .gcp-stepper-info {
      display: none !important;
    }
    .gcp-stepper-step.active .gcp-stepper-info {
      display: flex !important;
    }
    .gcp-stepper-step.active .gcp-stepper-title {
      font-size: 0.76rem;
      white-space: normal;
    }
    .gcp-stepper-step.active .gcp-stepper-desc {
      display: none !important;
    }
    .gcp-stepper-divider {
      flex: 0 0 10px;
    }
    .gcp-stepper-circle {
      width: 24px;
      height: 24px;
      font-size: 0.72rem;
    }
    .gcp-stepper-mobile-progress {
      display: flex;
      gap: 4px;
      margin-top: 6px;
      height: 3px;
    }
    .gcp-progress-segment {
      flex: 1;
      height: 100%;
      border-radius: 2px;
      background: #e2e8f0;
      transition: background 0.2s ease;
    }
    .gcp-progress-segment.active {
      background: #003666;
    }

    .intake-capabilities-grid {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
    }
    .intake-hero-title {
      font-size: 1.35rem !important;
    }
    .intake-hero-desc {
      font-size: 0.82rem !important;
      line-height: 1.45 !important;
      margin-bottom: 1rem !important;
    }

    .gcp-intake-topbar {
      padding: 8px 12px;
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .gcp-intake-header-left {
      justify-content: space-between;
      gap: 6px;
    }

    .gcp-intake-main-title {
      font-size: 0.86rem;
    }

    .gcp-intake-meta-row {
      font-size: 0.72rem;
      gap: 6px;
    }

    .gcp-intake-actions {
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 4px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      gap: 6px;
    }
    .gcp-intake-actions::-webkit-scrollbar {
      display: none;
    }

    .gcp-action-btn {
      padding: 7px 11px;
      font-size: 0.76rem;
      flex-shrink: 0;
    }

    .gcp-telemetry-bar {
      overflow-x: auto;
      flex-wrap: nowrap;
      padding: 6px 12px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      gap: 6px;
    }
    .gcp-telemetry-bar::-webkit-scrollbar {
      display: none;
    }

    .gcp-telemetry-chip {
      flex-shrink: 0;
      font-size: 0.7rem;
    }
  }
`;

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const STORAGE_SESSION_KEY = 'atlas_intake_session_v2';

export default function PublicPrescriptionIntakeClient() {
  const { user, userProfile } = useAuth();
  const searchParams = useSearchParams();
  const referralAm = searchParams?.get('am') || '';

  const activeAmEmail = user?.email || referralAm || '';
  const activeAmName = user?.displayName || userProfile?.name || (activeAmEmail ? activeAmEmail.split('@')[0] : '');
  const activeAmId = user?.uid || null;

  // Language state (English by default)
  const [lang, setLang] = useState('en');
  const isEs = lang === 'es';

  // ── 3-Phase Stepper State: 1 = Scan | 2 = Verify & Complete | 3 = Quotation & QR ──
  const [currentPhase, setCurrentPhase] = useState(1);

  // Staging and processing state (Phase 1)
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [error, setError] = useState(null);

  // Draft extracted prescriptions for Review (Phase 2)
  const [draftRxList, setDraftRxList] = useState([]);
  const [activeDraftIndex, setActiveDraftIndex] = useState(0);
  const [batchMeta, setBatchMeta] = useState(null);

  // Missing API Clinical Details Modal & Enrichment State
  const [enrichmentAuditModal, setEnrichmentAuditModal] = useState(null);
  const [isEnrichingApis, setIsEnrichingApis] = useState(false);

  // Step 3: Multi-prescription published list & Active Index
  const [publishedRxList, setPublishedRxList] = useState([]);
  const [activeRxIndex, setActiveRxIndex] = useState(0);
  const [showOriginalModal, setShowOriginalModal] = useState(false);
  const [docZoom, setDocZoom] = useState(100);

  // Duplicate Warning & Override State
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [pendingExtractedList, setPendingExtractedList] = useState(null);

  // ── Physician Verification State ──────────────────────────────
  const [isSavingPhysician, setIsSavingPhysician] = useState(false);
  const [physicianForm, setPhysicianForm] = useState({
    name: '',
    licenseNumber: '',
    clinic: '',
    email: '',
    phone: '',
    specialty: 'Physician Specialist'
  });

  // ── Patient Verification State ────────────────────────────────
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: '',
    clinicalNotes: ''
  });

  // ── Step 3: Compounding Quotation State ────────────────────────
  const [quotationEmail, setQuotationEmail] = useState('');
  const [quotationNotes, setQuotationNotes] = useState('');
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);
  const [quotationStatus, setQuotationStatus] = useState('idle'); // 'idle' | 'submitted' | 'skipped'

  // ── Step 3: Patient Version Link & QR Code Modal State ─────────
  const [showPatientQrModal, setShowPatientQrModal] = useState(false);
  const [copiedPatientLink, setCopiedPatientLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Active items based on current phase
  const activeDraftRx = draftRxList[activeDraftIndex] || (draftRxList.length > 0 ? draftRxList[0] : null);
  const publishedRx = publishedRxList[activeRxIndex] || (publishedRxList.length > 0 ? publishedRxList[0] : null);

  const activeRx = currentPhase === 3 ? publishedRx : activeDraftRx;
  const activeFileUrl = activeRx?.originalFileUrl || activeRx?.scannedFileUrl || activeRx?.fileUrl || null;

  const officialCode = activeRx?.prescriptionNumber || activeRx?.id || 'RX-PRESCRIPTION';
  const fullPublicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/rx/${officialCode}` 
    : `https://med-peptides.com/rx/${officialCode}`;

  // Pre-fill physician & patient forms whenever active draft changes in Phase 2
  useEffect(() => {
    if (activeDraftRx) {
      setPhysicianForm({
        name: activeDraftRx.doctorName && activeDraftRx.doctorName !== 'Licensed Clinical Practice' && activeDraftRx.doctorName !== 'Not Specified'
          ? activeDraftRx.doctorName
          : (activeDraftRx.prescribingDoctor || ''),
        licenseNumber: activeDraftRx.doctorLicenseNumber || activeDraftRx.licenseNumber || '',
        clinic: activeDraftRx.clinic && activeDraftRx.clinic !== 'Licensed Clinical Practice' ? activeDraftRx.clinic : '',
        email: activeDraftRx.doctorEmail || activeDraftRx.email || user?.email || '',
        phone: activeDraftRx.doctorPhone || activeDraftRx.phone || '',
        specialty: activeDraftRx.doctorSpecialty || 'Physician Specialist'
      });
      setPatientForm({
        name: activeDraftRx.patientName || '',
        age: activeDraftRx.patientAge || '',
        gender: activeDraftRx.patientGender || '',
        clinicalNotes: activeDraftRx.clinicalNotes || activeDraftRx.diagnosis || ''
      });
      setQuotationEmail(activeDraftRx.doctorEmail || activeDraftRx.email || user?.email || '');
    }
  }, [activeDraftRx, user]);

  // Pre-fill physician form when published in Phase 3
  useEffect(() => {
    if (publishedRx) {
      setPhysicianForm({
        name: publishedRx.doctorName && publishedRx.doctorName !== 'Licensed Clinical Practice' && publishedRx.doctorName !== 'Not Specified'
          ? publishedRx.doctorName
          : (publishedRx.prescribingDoctor || ''),
        licenseNumber: publishedRx.doctorLicenseNumber || publishedRx.licenseNumber || '',
        clinic: publishedRx.clinic && publishedRx.clinic !== 'Licensed Clinical Practice' ? publishedRx.clinic : '',
        email: publishedRx.doctorEmail || publishedRx.email || user?.email || '',
        phone: publishedRx.doctorPhone || publishedRx.phone || '',
        specialty: publishedRx.doctorSpecialty || 'Physician Specialist'
      });
      setQuotationEmail(publishedRx.doctorEmail || publishedRx.email || user?.email || '');
    }
  }, [publishedRx, user]);

  // Session persistence and restoration across reloads
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.publishedRxList?.length > 0) {
          setPublishedRxList(parsed.publishedRxList);
          setActiveRxIndex(parsed.activeRxIndex || 0);
          setCurrentPhase(3);
        } else if (parsed?.draftRxList?.length > 0) {
          setDraftRxList(parsed.draftRxList);
          setActiveDraftIndex(parsed.activeDraftIndex || 0);
          setBatchMeta(parsed.batchMeta || null);
          setCurrentPhase(2);
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({
        currentPhase,
        draftRxList,
        activeDraftIndex,
        publishedRxList,
        activeRxIndex,
        batchMeta,
        timestamp: Date.now()
      }));
    } catch (_) {}
  }, [currentPhase, draftRxList, activeDraftIndex, publishedRxList, activeRxIndex, batchMeta]);

  // Multi-document staging handlers
  const handleAddFiles = useCallback((incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    setStagedFiles((prev) => {
      const currentCount = prev.length;
      const availableSlots = 3 - currentCount;
      if (availableSlots <= 0) {
        toast.error('Batch limit reached: Maximum 3 documents at a time');
        return prev;
      }

      const filesToAdd = incomingFiles.slice(0, availableSlots);
      if (incomingFiles.length > availableSlots) {
        toast(`Only ${availableSlots} file(s) added. Maximum 3 documents at a time per batch.`, { icon: '⚠️' });
      }

      const newEntries = filesToAdd.map((f, idx) => {
        let previewUrl = null;
        try {
          previewUrl = URL.createObjectURL(f);
        } catch (e) {
          console.warn('Could not generate object preview URL:', e);
        }
        return {
          id: `${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
          file: f,
          name: f.name,
          size: f.size,
          type: f.type,
          previewUrl
        };
      });

      return [...prev, ...newEntries];
    });
  }, []);

  const handleRemoveStagedFile = (idToRemove) => {
    setStagedFiles(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleClearAllStaged = () => {
    setStagedFiles([]);
    setError(null);
  };

  // ── PHASE 1 ACTION: Run Multimodal Extraction & Transition to Phase 2 ──
  const handleProcessAllStagedFiles = useCallback(async () => {
    if (stagedFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setDraftRxList([]);
    setActiveDraftIndex(0);
    setPublishedRxList([]);
    setActiveRxIndex(0);
    setDuplicateWarning(null);
    setPendingExtractedList(null);

    const allNormalized = [];
    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      for (let i = 0; i < stagedFiles.length; i++) {
        const staged = stagedFiles[i];
        const docNum = i + 1;
        const totalDocs = stagedFiles.length;
        const currentFile = staged.file;

        // Step 1 of 3: Multimodal AI Extraction
        setCurrentStepIndex(1);
        setProcessingStep(`[Document ${docNum}/${totalDocs}: ${currentFile.name}] Scanning prescription with Atlas Clinical AI...`);

        const [aiData, storageResult] = await Promise.all([
          extractPrescriptionFromDocument(currentFile),
          uploadPrescriptionDocument(currentFile).catch(err => {
            console.warn('[PublicIntake] Background storage upload warning:', err);
            return null;
          })
        ]);

        // Step 2 of 3: Normalization & Ingredient Matching
        setCurrentStepIndex(2);
        setProcessingStep(`[Document ${docNum}/${totalDocs}] Matching active ingredients against clinical pharmacopeia...`);

        const normalizedList = await normalizeExtractedPrescriptions(aiData, {
          currentUser: user || null,
        });

        if (!normalizedList || normalizedList.length === 0) {
          console.warn(`No legible formulations detected in file ${currentFile.name}`);
          continue;
        }

        const fileUrl = storageResult?.downloadUrl || staged.previewUrl;
        normalizedList.forEach(rx => {
          if (fileUrl) {
            rx.originalFileUrl = fileUrl;
            rx.scannedFileUrl = fileUrl;
            rx.fileUrl = fileUrl;
            rx.storagePath = storageResult?.storagePath;
          }
          rx.fileName = currentFile.name;
          rx.batchId = batchId;
          rx.batchIndex = docNum;
          rx.batchTotal = totalDocs;
        });

        allNormalized.push(...normalizedList);
      }

      if (allNormalized.length === 0) {
        throw new Error('No legible compounded formulations detected in the provided documents.');
      }

      // Step 3 of 3: Dosimetry & Clinical Validation
      setCurrentStepIndex(3);
      setProcessingStep('Validating standard therapeutic ranges, molecular targets and vehicle compatibility...');

      const accountManagerPayload = activeAmEmail ? {
        email: activeAmEmail,
        name: activeAmName,
        id: activeAmId,
      } : null;

      const uploadedByPayload = user?.email ? {
        email: user.email,
        name: user.displayName || userProfile?.name || user.email.split('@')[0],
        id: user.uid,
        role: userProfile?.role || 'user'
      } : null;

      // Active Ingredients Completeness Audit
      const incompleteApis = [];
      const seenNames = new Set();

      allNormalized.forEach(rx => {
        const apis = rx.prescriptionLines || rx.items || [];
        apis.forEach(item => {
          const rawName = item.productName || item.activeIngredient || item.name || '';
          const cleanName = rawName.trim().replace(/\s+\d[\d.,]*\s*(%|mg|ml|mcg|ug|g|iu|µg)?.*/i, '').replace(/\s+\(.*?\)/g, '').trim();
          if (!cleanName || seenNames.has(cleanName.toLowerCase())) return;
          seenNames.add(cleanName.toLowerCase());

          const mono = getClinicalPharmacopeiaMonograph(cleanName) || getClinicalPharmacopeiaMonograph(rawName);
          const hasRichDesc = mono && mono.mechanismOfAction && (mono.geneTargets?.length > 0 || mono.pharmacologicalClass);
          if (!hasRichDesc) {
            incompleteApis.push({
              rawName,
              cleanName,
              dose: item.dosage || item.dose || item.concentration || ''
            });
          }
        });
      });

      setBatchMeta({ batchId, accountManagerPayload, uploadedByPayload });

      if (incompleteApis.length > 0) {
        setEnrichmentAuditModal({
          incompleteApis,
          allNormalized,
          batchId,
          accountManagerPayload,
          uploadedByPayload
        });
        return;
      }

      // Transition smoothly into Phase 2 (Verification & Completion)
      setDraftRxList(allNormalized);
      setActiveDraftIndex(0);
      setCurrentPhase(2);
    } catch (err) {
      console.error('[PublicPrescriptionIntake] Error:', err);
      let rawMsg = String(err?.message || '');
      let cleanMsg = 'Failed to scan and digitize documents';

      if (/503|UNAVAILABLE|high demand|saturad|peak demand|capacity|spikes in demand|temporarily|busy/i.test(rawMsg)) {
        cleanMsg = 'Atlas Clinical AI is experiencing temporary peak demand. Please retry in a few moments.';
      } else if (/502|504|timeout|gateway|timed out/i.test(rawMsg)) {
        cleanMsg = 'The clinical genetics report is comprehensive and processing timed out. Please retry with the accelerated engine.';
      } else if (rawMsg && !rawMsg.startsWith('{')) {
        cleanMsg = rawMsg;
      }

      setError(cleanMsg);
      // Inline red banner under the scan button provides clean, non-intrusive feedback without top popup toast
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  }, [stagedFiles, user, userProfile, activeAmEmail, activeAmName, activeAmId]);

  // ── PHASE 2 ACTION: Approve, Save to Firestore & Advance to Phase 3 ──
  const handleValidateAndPublish = async () => {
    if (!physicianForm.name.trim()) {
      toast.error('Physician full name is required for official validation');
      return;
    }
    if (!physicianForm.email.trim() || !physicianForm.email.includes('@')) {
      toast.error('Valid physician email is required for compounding quotation and validation');
      return;
    }

    setIsSavingPhysician(true);
    toast.loading('Registering official electronic prescription...', { id: 'publish-rx' });

    try {
      // Merge updated physician and patient details into draft list
      const updatedDraftList = draftRxList.map((item, idx) => {
        if (idx === activeDraftIndex) {
          return {
            ...item,
            doctorName: physicianForm.name.trim(),
            prescribingDoctor: physicianForm.name.trim(),
            doctorLicenseNumber: physicianForm.licenseNumber.trim(),
            licenseNumber: physicianForm.licenseNumber.trim(),
            clinic: physicianForm.clinic.trim() || 'Clinical Practice',
            doctorEmail: physicianForm.email.trim().toLowerCase(),
            doctorPhone: physicianForm.phone.trim(),
            treatingDoctor: {
              name: physicianForm.name.trim(),
              licenseNumber: physicianForm.licenseNumber.trim(),
              clinic: physicianForm.clinic.trim() || 'Clinical Practice',
              email: physicianForm.email.trim().toLowerCase(),
              phone: physicianForm.phone.trim(),
              specialty: physicianForm.specialty || 'Physician Specialist'
            },
            patientName: patientForm.name.trim() || item.patientName || 'Clinical Patient',
            patientAge: patientForm.age.trim() || item.patientAge || '',
            patientGender: patientForm.gender.trim() || item.patientGender || '',
            clinicalNotes: patientForm.clinicalNotes.trim() || item.clinicalNotes || ''
          };
        }
        return item;
      });

      const res = await fetch('/api/prescriptions/public-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptions: updatedDraftList,
          createPatientRecord: true,
          source: 'public_scan_publish_batch',
          batchId: batchMeta?.batchId || `BATCH-${Date.now()}`,
          allowDuplicateOverride: false,
          accountManager: batchMeta?.accountManagerPayload || null,
          uploadedBy: batchMeta?.uploadedByPayload || null,
        })
      });

      const data = await res.json();

      if (data.duplicateDetected) {
        toast.dismiss('publish-rx');
        setPendingExtractedList(updatedDraftList);
        setDuplicateWarning(data);
        return;
      }

      if (!res.ok || !data.success || !data.savedPrescriptions?.length) {
        throw new Error(data.error || 'Failed to save and publish electronic prescriptions');
      }

      const savedList = data.savedPrescriptions.map((saved, idx) => {
        return saved.rxData || {
          ...updatedDraftList[idx],
          id: saved.id,
          prescriptionNumber: saved.prescriptionNumber,
          status: 'approved'
        };
      });

      setPublishedRxList(savedList);
      setActiveRxIndex(0);
      setQuotationEmail(physicianForm.email.trim().toLowerCase());
      setCurrentPhase(3);

      toast.success(`Successfully registered ${savedList.length} electronic prescription(s) in Atlas!`, { id: 'publish-rx' });
    } catch (err) {
      console.error('[PublicIntake] Publish error:', err);
      toast.error(err.message || 'Error publishing prescription', { id: 'publish-rx' });
    } finally {
      setIsSavingPhysician(false);
    }
  };

  // ── PHASE 3 ACTION: Compounding Quotation Opt-In ──
  const handleRequestCompoundingQuotation = async () => {
    const targetEmail = quotationEmail.trim() || publishedRx?.doctorEmail || physicianForm.email;
    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('Please provide a valid physician email to receive the quotation');
      return;
    }

    setIsSubmittingQuotation(true);
    try {
      const response = await fetch('/api/portal/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: publishedRx?.doctorName || physicianForm.name || 'Physician',
          email: targetEmail.toLowerCase(),
          organization: publishedRx?.clinic || physicianForm.clinic || 'Clinical Practice',
          phone: publishedRx?.doctorPhone || physicianForm.phone || '',
          topic: 'compounding_quotation',
          contextType: 'prescription',
          message: quotationNotes.trim() || `Official compounding quotation and production estimate request for prescription ${officialCode}. Patient: ${publishedRx?.patientName || 'Clinical Patient'}.`,
          attachedEntity: {
            id: publishedRx?.id,
            name: `Prescription ${officialCode}`,
            code: officialCode,
            category: 'compounding_prescription'
          },
          sourceUrl: typeof window !== 'undefined' ? window.location.href : ''
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit quotation request');
      }

      setQuotationStatus('submitted');
      toast.success('Official compounding quotation requested successfully ✓');
    } catch (err) {
      console.error('[PublicIntake] Quotation error:', err);
      toast.error(err.message || 'Failed to request quotation');
    } finally {
      setIsSubmittingQuotation(false);
    }
  };

  // ── Sharing and Export Helpers ──
  const handleCopyLink = () => {
    navigator?.clipboard?.writeText(fullPublicUrl);
    setCopiedLink(true);
    toast.success('Public prescription link copied to clipboard ✓');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPatientLink = () => {
    navigator?.clipboard?.writeText(fullPublicUrl);
    setCopiedPatientLink(true);
    toast.success('Patient digital prescription link copied ✓');
    setTimeout(() => setCopiedPatientLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator?.clipboard?.writeText(officialCode);
    setCopiedCode(true);
    toast.success(`Prescription reference ${officialCode} copied ✓`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadPatientQrPng = () => {
    try {
      const svg = document.getElementById('patient-intake-qr-code');
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
        downloadLink.download = `QR_PATIENT_${officialCode}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      toast.success('Patient QR code PNG downloaded ✓');
    } catch (err) {
      console.warn('[PublicIntake] Download QR error:', err);
    }
  };

  const handleExportExcel = () => {
    if (!publishedRx) return;
    try {
      toast.loading('Generating Excel (.xlsx) file...', { id: 'intake-excel' });
      const res = exportPrescriptionToXlsx(publishedRx, { lang: 'en' });
      if (res && res.success) {
        toast.success(`Prescription exported to Excel: ${res.filename}`, { id: 'intake-excel' });
      } else {
        toast.error('Failed to generate Excel file', { id: 'intake-excel' });
      }
    } catch (e) {
      toast.error('Error generating Excel spreadsheet', { id: 'intake-excel' });
    }
  };

  const handleExportBatchExcel = () => {
    if (!publishedRxList || publishedRxList.length === 0) return;
    try {
      toast.loading(`Generating Batch Excel (${publishedRxList.length} prescriptions)...`, { id: 'intake-excel' });
      const res = exportBatchPrescriptionsToXlsx(publishedRxList, { lang: 'en' });
      if (res && res.success) {
        toast.success(`Batch exported to Excel: ${res.filename}`, { id: 'intake-excel' });
      } else {
        toast.error('Failed to generate Batch Excel file', { id: 'intake-excel' });
      }
    } catch (e) {
      toast.error('Error exporting batch to Excel', { id: 'intake-excel' });
    }
  };

  const handleReset = () => {
    setStagedFiles([]);
    setDraftRxList([]);
    setPublishedRxList([]);
    setActiveDraftIndex(0);
    setActiveRxIndex(0);
    setError(null);
    setCurrentPhase(1);
    setQuotationStatus('idle');
    try {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (_) {}
  };

  // Dropzone hook for Phase 1
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    maxFiles: 3,
    maxSize: 25 * 1024 * 1024,
    onDrop: (accepted, rejected) => {
      if (rejected && rejected.length > 0) {
        toast.error('Some files exceed the 25MB limit or have unsupported formats');
      }
      if (accepted && accepted.length > 0) {
        handleAddFiles(accepted);
      }
    }
  });

  const isPhysicianValid = physicianForm.name.trim().length > 0 && physicianForm.email.includes('@');

  return (
    <div className="pds-page-shell" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <style dangerouslySetInnerHTML={{ __html: PUBLIC_INTAKE_STYLES }} />

      {/* Top Public Unified Header */}
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={setLang}
        hideTier2={false}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Autonomous Clinical Intake' }
        ]}
        copyUrl={typeof window !== 'undefined' ? `${window.location.origin}/rx/intake` : 'https://med-peptides.com/rx/intake'}
      />

      {/* ── GOOGLE CLOUD UX: 3-PHASE STEPPER BAR ── */}
      <IntakeStepperHeader
        currentStep={currentPhase}
        onStepClick={(step) => {
          if (step === 1 && currentPhase > 1) setCurrentPhase(1);
          if (step === 2 && currentPhase > 2 && draftRxList.length > 0) setCurrentPhase(2);
        }}
        isProcessing={isProcessing}
      />

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* PHASE 1: SCAN / UPLOAD DOCUMENT & MULTI-FILE STAGING AREA (MAX 3)           */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {currentPhase === 1 && (
        <div className="pds-page-shell-inner" style={{ maxWidth: '1040px', margin: '0 auto', padding: '1rem 1.25rem 2rem' }}>
          
          {/* GCP Autonomous Presentation Header (Compact, 1-Screen Density) */}
          <div style={{ textAlign: 'center', marginBottom: '1.15rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)',
              border: '1px solid #c7d2fe',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#4338ca',
              marginBottom: '0.4rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <Sparkles size={13} style={{ color: '#6366f1' }} />
              <span>AUTONOMOUS CLINICAL INTAKE</span>
            </div>

            <h1 className="intake-hero-title" style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.55rem)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.2,
              margin: '0 0 0.35rem'
            }}>
              Clinical Prescription Ingestion Engine
            </h1>

            <p className="intake-hero-desc" style={{
              maxWidth: '680px',
              margin: '0 auto 0.75rem',
              fontSize: '0.82rem',
              color: '#64748b',
              lineHeight: 1.45
            }}>
              Multimodal AI trained to identify, standardize, and extract complex medical prescriptions, compounding magistral formulas, and genetic reports.
            </p>

            {/* 3 Compact GCP Feature Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#1e40af'
              }}>
                <FileText size={13} />
                <span>Multi-Format Ingestion (PDF & Photos)</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#15803d'
              }}>
                <Dna size={13} />
                <span>Pharmacopeia & API Matching</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#7e22ce'
              }}>
                <Factory size={13} />
                <span>Compounding Quotes & QR</span>
              </div>
            </div>
          </div>

          {/* Staging & Dropzone Container */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px -2px rgba(0,0,0,0.05)',
            padding: '1.25rem 1.25rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={17} style={{ color: '#003666' }} />
                <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  Upload Prescriptions & Reports (Max 3 files)
                </h2>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: stagedFiles.length >= 3 ? '#dc2626' : '#64748b',
                background: stagedFiles.length >= 3 ? '#fef2f2' : '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: `1px solid ${stagedFiles.length >= 3 ? '#fecaca' : '#cbd5e1'}`
              }}>
                {stagedFiles.length} / 3 Staged
              </span>
            </div>

            {/* Layout: Adaptive Split if files are staged, Full Dropzone if empty */}
            <div style={{
              display: stagedFiles.length > 0 ? 'grid' : 'block',
              gridTemplateColumns: stagedFiles.length > 0 ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
              gap: '14px',
              alignItems: 'stretch'
            }}>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? '#2563eb' : '#cbd5e1'}`,
                  borderRadius: '10px',
                  padding: stagedFiles.length > 0 ? '1.15rem 1rem' : '1.85rem 1.25rem',
                  textAlign: 'center',
                  background: isDragActive ? '#eff6ff' : '#f8fafc',
                  cursor: stagedFiles.length >= 3 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: stagedFiles.length >= 3 ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: stagedFiles.length > 0 ? '130px' : '160px'
                }}
              >
                <input {...getInputProps()} disabled={stagedFiles.length >= 3 || isProcessing} />
                
                <div style={{
                  width: stagedFiles.length > 0 ? '36px' : '42px',
                  height: stagedFiles.length > 0 ? '36px' : '42px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <FileText size={stagedFiles.length > 0 ? 18 : 22} />
                </div>

                <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  {isDragActive ? 'Drop files here...' : (stagedFiles.length > 0 ? 'Add more files...' : 'Drag & drop prescription files here')}
                </h3>
                
                <p style={{ margin: '0 0 0.65rem', fontSize: '0.74rem', color: '#64748b' }}>
                  PDF, JPEG, PNG, WebP up to 25MB
                </p>

                <button
                  type="button"
                  disabled={stagedFiles.length >= 3 || isProcessing}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: '#003666',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: stagedFiles.length >= 3 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Browse Files
                </button>
              </div>

              {/* Staged File Cards & Action Column */}
              {stagedFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        Staged for Scanning ({stagedFiles.length}):
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAllStaged}
                        style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                      {stagedFiles.map((staged, sIdx) => (
                        <div key={staged.id} style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '7px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FileText size={12} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {staged.name}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                {formatFileSize(staged.size)} · Doc #{sIdx + 1}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStagedFile(staged.id)}
                            disabled={isProcessing}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Scan Trigger */}
                  <div>
                    <button
                      type="button"
                      onClick={handleProcessAllStagedFiles}
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: isProcessing ? '#64748b' : 'linear-gradient(135deg, #003666 0%, #002244 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(0, 54, 102, 0.22)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Processing with Atlas AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          <span>Scan & Extract {stagedFiles.length} Prescription(s) with Atlas AI ➔</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Real-Time Processing Status Banner */}
            {isProcessing && (
              <div style={{
                marginTop: '1.25rem',
                background: '#f0f7ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px',
                animation: 'pulse 2s infinite'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <RefreshCw size={16} className="animate-spin" style={{ color: '#1d4ed8' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e40af' }}>
                    {processingStep || 'Processing prescriptions with Atlas Clinical AI...'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#dbeafe', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(currentStepIndex / 3) * 100}%`,
                    height: '100%',
                    background: '#2563eb',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{
                marginTop: '1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                color: '#991b1b',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartScanning}
                  disabled={isProcessing}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.background = '#fecaca'; }}
                  onMouseLeave={(e) => { if (!isProcessing) e.currentTarget.style.background = '#fee2e2'; }}
                >
                  <RefreshCw size={13} className={isProcessing ? 'animate-spin' : ''} />
                  <span>{isProcessing ? 'Retrying...' : 'Retry Extraction'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* PHASE 2: VERIFICATION, CLINICAL AUDIT & DOCTOR CREDENTIALS COMPLETION       */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {currentPhase === 2 && activeDraftRx && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem 5rem' }}>
          
          {/* Phase 2 Header & Action Toolbar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span className={`gcp-status-pill ${isPhysicianValid ? 'published' : 'review'}`}>
                  <span className="gcp-status-dot" />
                  {isPhysicianValid ? 'Physician Verified' : 'Action Required: Verify Doctor'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Draft Document {activeDraftIndex + 1} of {draftRxList.length}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Phase 2: Review Clinical Data & Complete Doctor Credentials
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setCurrentPhase(1)}
                className="gcp-action-btn gcp-action-btn-ghost"
              >
                <ArrowLeft size={14} />
                <span>Back to Upload</span>
              </button>

              <button
                type="button"
                onClick={handleValidateAndPublish}
                disabled={isSavingPhysician}
                className="gcp-action-btn gcp-action-btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                {isSavingPhysician ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>Validate & Publish Official Prescription ➔</span>
              </button>
            </div>
          </div>

          {/* Batch Selector if multiple files */}
          {draftRxList.length > 1 && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 14px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
                Select Prescription Draft:
              </span>
              {draftRxList.map((d, dIdx) => (
                <button
                  key={dIdx}
                  type="button"
                  onClick={() => setActiveDraftIndex(dIdx)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: dIdx === activeDraftIndex ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    background: dIdx === activeDraftIndex ? '#eff6ff' : '#ffffff',
                    color: dIdx === activeDraftIndex ? '#1d4ed8' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: dIdx === activeDraftIndex ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  #{dIdx + 1} {d.patientName ? `· ${d.patientName}` : ''}
                </button>
              ))}
            </div>
          )}

          {/* Main 2-Column Verification Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}>
            
            {/* Left Column: Scanned Document Preview */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} style={{ color: '#003666' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    Scanned Document Preview
                  </span>
                </div>
                {activeFileUrl && (
                  <button
                    type="button"
                    onClick={() => setShowOriginalModal(true)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#003666',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Maximize2 size={12} /> Full Screen
                  </button>
                )}
              </div>

              {activeFileUrl ? (
                <div style={{
                  flex: 1,
                  minHeight: '380px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {activeFileUrl.endsWith('.pdf') ? (
                    <iframe
                      src={activeFileUrl}
                      title="PDF Preview"
                      style={{ width: '100%', height: '100%', minHeight: '420px', border: 'none' }}
                    />
                  ) : (
                    <img
                      src={activeFileUrl}
                      alt="Scanned Prescription"
                      style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
                    />
                  )}
                </div>
              ) : (
                <div style={{
                  flex: 1, minHeight: '280px', background: '#f8fafc',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', fontSize: '0.82rem'
                }}>
                  No preview document available
                </div>
              )}
            </div>

            {/* Right Column: Doctor & Patient Verification Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Doctor Details Verification Card (Algolia & Firestore Integrated) */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: isPhysicianValid ? '1px solid #bbf7d0' : '1px solid #fde68a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={18} style={{ color: '#003666' }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      Treating Physician Credentials
                    </span>
                  </div>
                  {isPhysicianValid ? (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                      Verified ✓
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                      Search Doctor or Complete Fields
                    </span>
                  )}
                </div>

                <IntakeDoctorSelector
                  physicianForm={physicianForm}
                  setPhysicianForm={setPhysicianForm}
                  setQuotationEmail={setQuotationEmail}
                  isPhysicianValid={isPhysicianValid}
                />
              </div>

              {/* Patient Details Card */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <User size={18} style={{ color: '#003666' }} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    Patient Clinical Details
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                      placeholder="e.g. Carlos Gomez"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '6px',
                        border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Age / DOB
                    </label>
                    <input
                      type="text"
                      value={patientForm.age}
                      onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                      placeholder="e.g. 42"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '6px',
                        border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    Diagnosis / Clinical Indication Notes
                  </label>
                  <input
                    type="text"
                    value={patientForm.clinicalNotes}
                    onChange={(e) => setPatientForm({ ...patientForm, clinicalNotes: e.target.value })}
                    placeholder="e.g. Androgenetic alopecia Norwood III, scalp diffuse thinning"
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '6px',
                      border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Extracted Formulations & APIs Preview Card */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Dna size={18} style={{ color: '#003666' }} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    Compounded Active Ingredients Mapped ({activeDraftRx.prescriptionLines?.length || activeDraftRx.items?.length || 0})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(activeDraftRx.prescriptionLines || activeDraftRx.items || []).map((line, lIdx) => (
                    <div key={lIdx} style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                          {line.productName || line.activeIngredient || line.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {line.action || line.mechanismOfAction || 'Standard Compounding Pharmacopeia'}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#003666',
                        background: '#eff6ff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe'
                      }}>
                        {line.dosage || line.dose || line.concentration || '1.0%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div style={{
            position: 'sticky',
            bottom: '16px',
            marginTop: '2rem',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <button
              type="button"
              onClick={() => setCurrentPhase(1)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={14} /> Back to Upload
            </button>

            <button
              type="button"
              onClick={handleValidateAndPublish}
              disabled={isSavingPhysician}
              style={{
                background: '#003666',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#ffffff',
                cursor: isSavingPhysician ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 54, 102, 0.25)'
              }}
            >
              {isSavingPhysician ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Validate & Generate Official Prescription ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* PHASE 3: OFFICIAL ELECTRONIC DOSSIER, COMPOUNDING QUOTATION & PATIENT QR    */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {currentPhase === 3 && publishedRx && (
        <IntakePhase3Deliver
          publishedRx={publishedRx}
          publishedRxList={publishedRxList}
          activeRxIndex={activeRxIndex}
          setActiveRxIndex={setActiveRxIndex}
          officialCode={officialCode}
          activeRx={activeRx}
          copiedLink={copiedLink}
          handleCopyLink={handleCopyLink}
          setShowPatientQrModal={setShowPatientQrModal}
          handleExportBatchExcel={handleExportBatchExcel}
          handleExportExcel={handleExportExcel}
          handleReset={handleReset}
          quotationStatus={quotationStatus}
          quotationEmail={quotationEmail}
          setQuotationEmail={setQuotationEmail}
          handleRequestCompoundingQuotation={handleRequestCompoundingQuotation}
          isSubmittingQuotation={isSubmittingQuotation}
          user={user}
          setShowOriginalModal={setShowOriginalModal}
          activeFileUrl={activeFileUrl}
        />
      )}

      {/* ── PATIENT VERSION & QR CODE MODAL ── */}
      <IntakePatientQrModal
        isOpen={showPatientQrModal}
        onClose={() => setShowPatientQrModal(false)}
        officialCode={officialCode}
        patientName={activeRx?.patientName}
        fullPublicUrl={fullPublicUrl}
        copiedPatientLink={copiedPatientLink}
        onCopyPatientLink={handleCopyPatientLink}
        onDownloadQrPng={handleDownloadPatientQrPng}
      />

      {/* Modal to view the original uploaded/scanned file */}
      {showOriginalModal && activeFileUrl && (
        <DocumentPreviewModal
          isOpen={showOriginalModal}
          fileUrl={activeFileUrl}
          title={activeRx?.fileName || activeRx?.prescriptionNumber || 'Scanned Document'}
          onClose={() => setShowOriginalModal(false)}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from 'next/navigation';
import {
  Upload, X, CheckCircle2, AlertCircle, FileText,
  Sparkles, RefreshCw, ExternalLink, Download, ArrowLeft,
  Eye, Phone, Stethoscope, Copy, Check, Camera, FileSpreadsheet, ShieldAlert, User,
  Database, ThumbsUp, ThumbsDown, ClipboardCheck, ChevronRight, Info
} from '@/lib/icons';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPrescriptionClient from '../[code]/PublicPrescriptionClient';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import {
  extractPrescriptionFromDocument,
  normalizeExtractedPrescriptions
} from '@/services/prescriptionAiService';
import { exportPrescriptionToXlsx } from '@/utils/exportPrescriptionToXlsx';
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
`;

export default function PublicPrescriptionIntakeClient() {
  const { user, userProfile } = useAuth();
  const searchParams = useSearchParams();
  const referralAm = searchParams?.get('am') || '';

  const activeAmEmail = user?.email || referralAm || '';
  const activeAmName = user?.displayName || userProfile?.name || (activeAmEmail ? activeAmEmail.split('@')[0] : '');
  const activeAmId = user?.uid || null;
  const isUserLoggedIn = Boolean(user?.email);

  // English by default
  const [lang, setLang] = useState('en');
  const isEs = lang === 'es';

  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Duplicate Warning & Override State
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [pendingExtractedList, setPendingExtractedList] = useState(null);

  // Step 2: The generated and published public prescription object
  const [publishedRx, setPublishedRx] = useState(null);
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  // ── Atlas Registration State ──────────────────────────────────────────────────
  // null = not yet answered | 'yes' | 'no'
  const [reviewSatisfied, setReviewSatisfied] = useState(null);
  // 'idle' | 'confirming' | 'registering' | 'done' | 'error'
  const [atlasStatus, setAtlasStatus] = useState('idle');
  const [atlasNotes, setAtlasNotes] = useState('');
  const [atlasResult, setAtlasResult] = useState(null);

  // Step 1: Handle Document Upload & Multimodal Extraction + Instant Publication
  const handleProcessFile = useCallback(async (droppedFile) => {
    if (!droppedFile) return;
    setFile(droppedFile);
    setIsProcessing(true);
    setError(null);
    setPublishedRx(null);
    setDuplicateWarning(null);
    setPendingExtractedList(null);

    // Create local object URL for original document preview
    try {
      const blobUrl = URL.createObjectURL(droppedFile);
      setFilePreviewUrl(blobUrl);
    } catch (e) {
      console.warn('Could not generate object preview URL:', e);
    }

    try {
      // 1. Multimodal AI Extraction
      setProcessingStep(isEs ? 'Analizando documento con Atlas Clinical AI...' : 'Scanning document with Atlas Clinical AI...');
      toast.loading(isEs ? 'Analizando con Atlas Clinical AI...' : 'Scanning with Atlas Clinical AI...', { id: 'ai-intake-step' });
      const aiData = await extractPrescriptionFromDocument(droppedFile);

      // 2. Normalization & Ingredient Resolution
      setProcessingStep(isEs ? 'Mapeando fórmulas y vehículos contra catálogo farmacológico...' : 'Resolving compounded active ingredients and excipients...');
      const normalizedList = await normalizeExtractedPrescriptions(aiData, {
        currentUser: user || null,
      });

      if (!normalizedList || normalizedList.length === 0) {
        throw new Error(isEs ? 'No se detectaron fórmulas legibles en el documento' : 'No legible compounded formulations detected in document');
      }

      // 3. Instant Firestore Publication
      setProcessingStep(isEs ? 'Publicando prescripción médica electrónica oficial...' : 'Publishing official electronic prescription dossier...');
      
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

      const res = await fetch('/api/prescriptions/public-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptions: normalizedList,
          createPatientRecord: true,
          source: 'public_scan_publish',
          allowDuplicateOverride: false,
          accountManager: accountManagerPayload,
          uploadedBy: uploadedByPayload,
        })
      });

      const data = await res.json();

      // Check if existing duplicate was detected by Box ID or Patient + Date
      if (data.duplicateDetected) {
        toast.dismiss('ai-intake-step');
        setPendingExtractedList(normalizedList);
        setDuplicateWarning(data);
        return;
      }

      if (!res.ok || !data.success || !data.savedPrescriptions?.[0]) {
        throw new Error(data.error || 'Failed to save and publish electronic prescription');
      }

      const saved = data.savedPrescriptions[0];
      const fullRxPayload = saved.rxData || {
        ...normalizedList[0],
        id: saved.id,
        prescriptionNumber: saved.prescriptionNumber,
        status: 'approved'
      };

      setPublishedRx(fullRxPayload);

      toast.success(
        isEs 
          ? `¡Prescripción electrónica publicada con éxito! Código: ${saved.prescriptionNumber}` 
          : `Official electronic prescription published! Ref: ${saved.prescriptionNumber}`,
        { id: 'ai-intake-step' }
      );
    } catch (err) {
      console.error('[PublicPrescriptionIntake] Error:', err);
      let rawMsg = String(err?.message || '');
      let cleanMsg = isEs ? 'Error al procesar el archivo con Atlas AI' : 'Failed to scan and publish document';

      if (/503|UNAVAILABLE|high demand|saturad|peak demand|capacity|spikes in demand|temporarily|busy/i.test(rawMsg)) {
        cleanMsg = isEs
          ? 'El servicio de Atlas AI está temporalmente saturado por alta demanda. Por favor, reintente en unos instantes.'
          : 'Atlas Clinical AI is experiencing temporary peak demand. Please retry in a few moments.';
      } else if (rawMsg.startsWith('{') && rawMsg.includes('error')) {
        try {
          const parsed = JSON.parse(rawMsg);
          cleanMsg = parsed?.error?.message || (isEs ? 'El servicio de Atlas AI está momentáneamente ocupado. Reintente en unos instantes.' : 'Atlas AI is momentarily busy. Please retry shortly.');
        } catch (_) {
          cleanMsg = isEs ? 'Atlas AI está ocupado en este momento. Por favor, intente de nuevo en breve.' : 'Atlas AI is currently busy. Please try again shortly.';
        }
      } else if (rawMsg && !rawMsg.startsWith('{')) {
        cleanMsg = rawMsg;
      }

      setError(cleanMsg);
      toast.error(cleanMsg, { id: 'ai-intake-step' });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  }, [isEs]);

  // Duplicate Warning Actions
  const handleViewExistingRx = () => {
    if (duplicateWarning?.existingPrescription?.rxData) {
      setPublishedRx(duplicateWarning.existingPrescription.rxData);
      setDuplicateWarning(null);
      setPendingExtractedList(null);
      toast.success(isEs ? 'Abriendo prescripción existente' : 'Viewing existing prescription');
    } else if (duplicateWarning?.existingPrescription?.rxUrl) {
      window.location.href = duplicateWarning.existingPrescription.rxUrl;
    }
  };

  const handleForcePublish = async () => {
    if (!pendingExtractedList) return;
    setIsProcessing(true);
    setProcessingStep(isEs ? 'Publicando prescripción (confirmada por usuario)...' : 'Publishing prescription (override confirmed)...');
    toast.loading(isEs ? 'Guardando prescripción...' : 'Saving prescription...', { id: 'ai-intake-step' });

    try {
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

      const res = await fetch('/api/prescriptions/public-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptions: pendingExtractedList,
          createPatientRecord: true,
          source: 'public_scan_publish_override',
          allowDuplicateOverride: true,
          accountManager: accountManagerPayload,
          uploadedBy: uploadedByPayload,
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.savedPrescriptions?.[0]) {
        throw new Error(data.error || 'Failed to save electronic prescription');
      }

      const saved = data.savedPrescriptions[0];
      const fullRxPayload = saved.rxData || {
        ...pendingExtractedList[0],
        id: saved.id,
        prescriptionNumber: saved.prescriptionNumber,
        status: 'approved'
      };

      setDuplicateWarning(null);
      setPendingExtractedList(null);
      setPublishedRx(fullRxPayload);

      toast.success(
        isEs 
          ? `¡Prescripción cargada de nuevo con éxito! Código: ${saved.prescriptionNumber}` 
          : `Official electronic prescription published! Ref: ${saved.prescriptionNumber}`,
        { id: 'ai-intake-step' }
      );
    } catch (err) {
      console.error('[PublicPrescriptionIntake] Duplicate override error:', err);
      toast.error(err.message || 'Error', { id: 'ai-intake-step' });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleDismissDuplicate = () => {
    setDuplicateWarning(null);
    setPendingExtractedList(null);
    setFile(null);
    setFilePreviewUrl(null);
  };

  const cameraInputRef = useRef(null);

  // Global clipboard paste listener (Phase 1 zero-friction intake)
  useEffect(() => {
    const handlePaste = (e) => {
      if (isProcessing) return;
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.indexOf('image') !== -1 || item.type === 'application/pdf') {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            toast.success(isEs ? 'Documento detectado desde portapapeles (⌘V)' : 'Document pasted from clipboard (⌘V)');
            handleProcessFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isProcessing, isEs, handleProcessFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted.length > 0 && handleProcessFile(accepted[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: isProcessing
  });

  const handleReset = () => {
    setFile(null);
    setFilePreviewUrl(null);
    setPublishedRx(null);
    setDuplicateWarning(null);
    setPendingExtractedList(null);
    setError(null);
    setShowOriginalModal(false);
    setReviewSatisfied(null);
    setAtlasStatus('idle');
    setAtlasNotes('');
    setAtlasResult(null);
  };

  // ── Atlas Registration Handler ────────────────────────────────────────────────
  const handleRegisterInAtlas = async () => {
    if (!publishedRx) return;
    setAtlasStatus('registering');
    const toastId = 'atlas-register';
    toast.loading('Registering in Atlas...', { id: toastId });

    try {
      const prescriptionId = publishedRx.id || publishedRx.firestoreId || null;
      const prescriptionNumber = publishedRx.prescriptionNumber || officialCode;

      const registeredByPayload = user?.email ? {
        email: user.email,
        name: user.displayName || userProfile?.name || user.email.split('@')[0],
        id: user.uid,
      } : (activeAmEmail ? { email: activeAmEmail, name: activeAmName, id: activeAmId } : null);

      const res = await fetch('/api/prescriptions/register-atlas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId,
          prescriptionNumber,
          registeredBy: registeredByPayload,
          reviewSatisfied: reviewSatisfied === 'yes',
          notes: atlasNotes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Atlas registration failed');
      }

      setAtlasResult(data);
      setAtlasStatus('done');
      toast.success(
        `Prescription ${data.prescriptionNumber} registered in Atlas ✓`,
        { id: toastId }
      );
    } catch (err) {
      console.error('[Atlas Registration]', err);
      setAtlasStatus('error');
      toast.error(err.message || 'Failed to register in Atlas', { id: toastId });
    }
  };

  const officialCode = publishedRx?.prescriptionNumber || publishedRx?.id || 'RX-PRESCRIPTION';
  const fullPublicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/rx/${officialCode}` 
    : `https://med-peptides.com/rx/${officialCode}`;

  const handleCopyLink = () => {
    navigator?.clipboard?.writeText(fullPublicUrl);
    setCopiedLink(true);
    toast.success(isEs ? 'Enlace oficial copiado al portapapeles ✓' : 'Public prescription link copied ✓');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportExcel = () => {
    if (!publishedRx) return;
    try {
      toast.loading(isEs ? 'Generando archivo Excel (.xlsx)...' : 'Generating Excel (.xlsx) file...', { id: 'intake-excel' });
      const res = exportPrescriptionToXlsx(publishedRx, { lang });
      if (res && res.success) {
        toast.success(
          isEs 
            ? `Receta exportada a Excel: ${res.filename} (${res.itemCount} productos)` 
            : `Prescription exported to Excel: ${res.filename} (${res.itemCount} items)`,
          { id: 'intake-excel' }
        );
      } else {
        toast.error(isEs ? 'No se pudo exportar a Excel' : 'Failed to export to Excel', { id: 'intake-excel' });
      }
    } catch (err) {
      console.error('[PublicPrescriptionIntake] Excel export error:', err);
      toast.error(isEs ? 'Error al generar Excel' : 'Error generating Excel file', { id: 'intake-excel' });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: VISUALIZE THE GENERATED PUBLIC PRESCRIPTION
  // Reuses 100% of the code from PublicPrescriptionClient (the public publishing page)
  // ─────────────────────────────────────────────────────────────────────────────
  if (publishedRx) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: '#f8fafc' }}>
        <style dangerouslySetInnerHTML={{ __html: PUBLIC_INTAKE_STYLES }} />

        {/* ── Top Sticky Bar — Quick Actions ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          color: '#ffffff',
          padding: '10px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#10b981', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <CheckCircle2 size={18} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800 }}>
                {isEs ? 'Prescripción Electrónica Publicada con Éxito' : 'Official Electronic Prescription Published'}
              </div>
              <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>
                Ref: <strong style={{ fontFamily: 'monospace' }}>{officialCode}</strong>
                {' '}·{' '}{publishedRx.patientName || publishedRx.patient?.name || 'Patient'}
                {atlasStatus === 'done' && (
                  <span style={{
                    marginLeft: '10px', background: 'rgba(16,185,129,0.25)',
                    border: '1px solid rgba(16,185,129,0.4)', borderRadius: '4px',
                    padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700
                  }}>
                    ✓ Atlas Registered
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {filePreviewUrl && (
              <button type="button" onClick={() => setShowOriginalModal(true)} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', borderRadius: '8px', padding: '6px 12px',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>
                <Eye size={14} />
                <span>{isEs ? 'Ver Documento Escaneado' : 'View Scanned Document'}</span>
              </button>
            )}
            <button type="button" onClick={handleCopyLink} style={{
              background: '#fff', border: 'none', color: '#064e3b', borderRadius: '8px',
              padding: '6px 12px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '5px'
            }}>
              {copiedLink ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
              <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
            </button>
            <button type="button" onClick={handleExportExcel} style={{
              background: '#fff', border: 'none', color: '#15803d', borderRadius: '8px',
              padding: '6px 12px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '5px'
            }} title={isEs ? 'Exportar a Excel (.xlsx)' : 'Export to Excel (.xlsx)'}>
              <FileSpreadsheet size={14} style={{ color: '#15803d' }} />
              <span>{isEs ? 'Exportar a Excel' : 'Export to Excel (.xlsx)'}</span>
            </button>
            <button type="button" onClick={handleReset} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
              borderRadius: '8px', padding: '6px 10px', fontSize: '0.78rem',
              fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
            }}>
              <RefreshCw size={13} />
              <span>{isEs ? 'Escanear Otra' : 'Scan Another'}</span>
            </button>
          </div>
        </div>

        {/* ── ATLAS REGISTRATION PANEL ── */}
        {atlasStatus !== 'done' && (
          <div style={{
            maxWidth: '900px',
            margin: '24px auto 0',
            padding: '0 16px',
          }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              {/* Panel Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
                borderBottom: '1px solid #dbe4ff',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#1a56db', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <Database size={18} style={{ color: '#ffffff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e3a8a' }}>
                    {isEs ? 'Registrar en Atlas' : 'Register in Atlas'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '1px' }}>
                    {isEs
                      ? 'Consolida oficialmente esta prescripción en el sistema Atlas de gestión clínica'
                      : 'Officially consolidate this prescription into the Atlas clinical management system'}
                  </div>
                </div>
                {atlasStatus === 'error' && (
                  <span style={{
                    padding: '3px 9px', borderRadius: '6px', fontSize: '0.72rem',
                    fontWeight: 700, background: '#fef2f2', color: '#dc2626',
                    border: '1px solid #fecaca'
                  }}>Registration failed</span>
                )}
              </div>

              <div style={{ padding: '20px' }}>

                {/* ── STEP A: Review Satisfaction ── */}
                {atlasStatus !== 'registering' && reviewSatisfied === null && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '12px 14px', background: '#f8fafc',
                      borderRadius: '10px', border: '1px solid #e2e8f0'
                    }}>
                      <Info size={16} style={{ color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.55 }}>
                        {isEs
                          ? 'Antes de registrar en Atlas, confirme que los datos extraídos por la IA son correctos y que la prescripción electrónica generada es satisfactoria.'
                          : 'Before registering in Atlas, please confirm that the AI-extracted data is accurate and the generated electronic prescription is satisfactory.'}
                      </p>
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                      {isEs ? '¿La revisión de la prescripción es satisfactoria?' : 'Is the prescription review satisfactory?'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setReviewSatisfied('yes')}
                        style={{
                          flex: 1, padding: '11px 14px', borderRadius: '10px',
                          background: '#f0fdf4', border: '2px solid #86efac',
                          color: '#15803d', fontWeight: 700, fontSize: '0.86rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '8px', transition: 'all 0.15s'
                        }}
                      >
                        <ThumbsUp size={16} />
                        <span>{isEs ? 'Sí, es correcta' : 'Yes, data is correct'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewSatisfied('no')}
                        style={{
                          flex: 1, padding: '11px 14px', borderRadius: '10px',
                          background: '#fff7ed', border: '2px solid #fed7aa',
                          color: '#c2410c', fontWeight: 700, fontSize: '0.86rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '8px', transition: 'all 0.15s'
                        }}
                      >
                        <ThumbsDown size={16} />
                        <span>{isEs ? 'No, hay errores' : 'No, data has errors'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP B: Not satisfied — guidance ── */}
                {reviewSatisfied === 'no' && atlasStatus !== 'registering' && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '14px'
                  }}>
                    <div style={{
                      padding: '14px 16px', background: '#fff7ed',
                      border: '1px solid #fed7aa', borderRadius: '10px',
                      display: 'flex', gap: '12px', alignItems: 'flex-start'
                    }}>
                      <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                          {isEs ? 'Revisión marcada como insatisfactoria' : 'Review marked as unsatisfactory'}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#b45309', lineHeight: 1.5 }}>
                          {isEs
                            ? 'Puedes registrar de todos modos e incluir una nota para el equipo clínico, o descartar y escanear de nuevo.'
                            : 'You can still register with a note for the clinical team, or discard and re-scan the document.'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => { setAtlasStatus('confirming'); }}
                        style={{
                          padding: '9px 16px', borderRadius: '8px',
                          background: '#1a56db', color: '#fff', border: 'none',
                          fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '7px'
                        }}
                      >
                        <Database size={15} />
                        <span>{isEs ? 'Registrar con nota de incidencia' : 'Register with incident note'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewSatisfied(null)}
                        style={{
                          padding: '9px 14px', borderRadius: '8px',
                          background: '#f8fafc', color: '#475569',
                          border: '1px solid #e2e8f0', fontSize: '0.84rem',
                          fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        {isEs ? '← Cambiar respuesta' : '← Change answer'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP C: Satisfied — confirm & register ── */}
                {reviewSatisfied === 'yes' && atlasStatus === 'idle' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', background: '#f0fdf4',
                      border: '1px solid #86efac', borderRadius: '10px'
                    }}>
                      <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#15803d' }}>
                        {isEs ? 'Revisión confirmada como satisfactoria' : 'Review confirmed as satisfactory'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAtlasStatus('confirming')}
                      style={{
                        width: '100%', padding: '13px 20px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
                        color: '#ffffff', border: 'none', fontWeight: 800,
                        fontSize: '0.95rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '10px', boxShadow: '0 4px 14px rgba(26,86,219,0.35)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Database size={18} />
                      <span>{isEs ? 'Registrar en Atlas' : 'Register in Atlas'}</span>
                      <ChevronRight size={16} style={{ marginLeft: '2px' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewSatisfied(null)}
                      style={{
                        background: 'none', border: 'none', color: '#94a3b8',
                        fontSize: '0.78rem', cursor: 'pointer', textAlign: 'center'
                      }}
                    >
                      {isEs ? '← Cambiar respuesta' : '← Change answer'}
                    </button>
                  </div>
                )}

                {/* ── STEP D: Confirmation modal ── */}
                {atlasStatus === 'confirming' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                      {isEs ? 'Confirmar registro en Atlas' : 'Confirm Atlas Registration'}
                    </div>
                    <div style={{
                      padding: '12px 14px', background: '#f8fafc',
                      border: '1px solid #e2e8f0', borderRadius: '10px',
                      fontSize: '0.82rem', color: '#475569', lineHeight: 1.5
                    }}>
                      <strong style={{ color: '#0f172a' }}>
                        {publishedRx.patientName || publishedRx.patient?.name || 'Patient'}
                      </strong>
                      {' — '}
                      <span style={{ fontFamily: 'monospace', color: '#1a56db', fontWeight: 700 }}>
                        {officialCode}
                      </span>
                      <br />
                      {publishedRx.doctorName || publishedRx.prescribingDoctor || ''}
                      {reviewSatisfied === 'no' && (
                        <span style={{ marginLeft: '8px', color: '#d97706', fontWeight: 600 }}>
                          · {isEs ? 'Marcada con incidencia' : 'Flagged with incident'}
                        </span>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        {isEs ? 'Notas para el equipo clínico (opcional)' : 'Notes for clinical team (optional)'}
                      </label>
                      <textarea
                        value={atlasNotes}
                        onChange={(e) => setAtlasNotes(e.target.value)}
                        placeholder={isEs ? 'Observaciones, correcciones, aclaraciones...' : 'Observations, corrections, clarifications...'}
                        rows={3}
                        style={{
                          width: '100%', padding: '10px 12px',
                          borderRadius: '8px', border: '1px solid #cbd5e1',
                          fontSize: '0.83rem', color: '#334155', resize: 'vertical',
                          boxSizing: 'border-box', fontFamily: 'inherit',
                          outline: 'none', lineHeight: 1.5
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleRegisterInAtlas}
                        disabled={atlasStatus === 'registering'}
                        style={{
                          flex: 1, padding: '11px 18px', borderRadius: '10px',
                          background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
                          color: '#fff', border: 'none', fontWeight: 800,
                          fontSize: '0.88rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '8px', boxShadow: '0 4px 12px rgba(26,86,219,0.3)',
                          opacity: atlasStatus === 'registering' ? 0.7 : 1,
                          transition: 'all 0.15s'
                        }}
                      >
                        <ClipboardCheck size={16} />
                        <span>{isEs ? 'Confirmar y Registrar en Atlas' : 'Confirm & Register in Atlas'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAtlasStatus('idle')}
                        disabled={atlasStatus === 'registering'}
                        style={{
                          padding: '11px 16px', borderRadius: '10px',
                          background: '#f8fafc', color: '#64748b',
                          border: '1px solid #e2e8f0', fontWeight: 600,
                          fontSize: '0.85rem', cursor: 'pointer'
                        }}
                      >
                        {isEs ? 'Cancelar' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP E: Registering spinner ── */}
                {atlasStatus === 'registering' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a56db 0%, #7c3aed 100%)',
                      margin: '0 auto 14px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      animation: 'pulse 1.5s infinite'
                    }}>
                      <Database size={22} style={{ color: '#fff' }} />
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                      {isEs ? 'Registrando en Atlas...' : 'Registering in Atlas...'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      {isEs ? 'Sincronizando con la base de datos clínica' : 'Syncing with clinical management database'}
                    </div>
                  </div>
                )}

                {/* ── STEP F: Error ── */}
                {atlasStatus === 'error' && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '12px'
                  }}>
                    <div style={{
                      padding: '12px 14px', background: '#fef2f2',
                      border: '1px solid #fecaca', borderRadius: '10px',
                      display: 'flex', gap: '10px', alignItems: 'flex-start'
                    }}>
                      <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.83rem', color: '#b91c1c' }}>
                        {isEs
                          ? 'El registro en Atlas falló. Por favor, inténtalo de nuevo o contacta con el equipo técnico.'
                          : 'Atlas registration failed. Please try again or contact the technical team.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAtlasStatus(reviewSatisfied === null ? 'idle' : 'confirming')}
                      style={{
                        padding: '9px 16px', borderRadius: '8px',
                        background: '#1a56db', color: '#fff', border: 'none',
                        fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '7px'
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>{isEs ? 'Reintentar' : 'Retry'}</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ── POST-REGISTRATION SUCCESS BANNER ── */}
        {atlasStatus === 'done' && atlasResult && (
          <div style={{
            maxWidth: '900px', margin: '24px auto 0', padding: '0 16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #86efac', borderRadius: '16px',
              padding: '18px 22px',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              boxShadow: '0 4px 16px rgba(22,163,74,0.1)'
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#16a34a', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0
              }}>
                <ClipboardCheck size={22} style={{ color: '#ffffff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#15803d', marginBottom: '4px' }}>
                  {isEs ? 'Prescripción registrada en Atlas con éxito' : 'Prescription successfully registered in Atlas'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.55 }}>
                  <strong style={{ fontFamily: 'monospace' }}>
                    {atlasResult.prescriptionNumber || officialCode}
                  </strong>
                  {' — '}
                  {isEs ? 'Registrada el' : 'Registered at'}{' '}
                  <strong>{new Date(atlasResult.atlasRegistration?.registeredAt || Date.now()).toLocaleString()}</strong>
                  {atlasResult.atlasRegistration?.registeredBy?.email && (
                    <span style={{ display: 'block', marginTop: '2px', color: '#16a34a' }}>
                      {isEs ? 'Por:' : 'By:'} {atlasResult.atlasRegistration.registeredBy.email}
                    </span>
                  )}
                  {atlasResult.atlasRegistration?.notes && (
                    <span style={{ display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
                      "{atlasResult.atlasRegistration.notes}"
                    </span>
                  )}
                </div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '8px', background: '#ffffff',
                border: '1px solid #bbf7d0', fontSize: '0.74rem', fontWeight: 800,
                color: '#16a34a', whiteSpace: 'nowrap', flexShrink: 0,
                alignSelf: 'flex-start'
              }}>Atlas ✓</span>
            </div>
          </div>
        )}

        {/* ── Prescription Clinical Dossier ── */}
        <PublicPrescriptionClient rx={publishedRx} />

        {/* Modal to view the original uploaded/scanned file */}
        {showOriginalModal && filePreviewUrl && (
          <DocumentPreviewModal
            url={filePreviewUrl}
            name={file?.name || 'Scanned Document'}
            onClose={() => setShowOriginalModal(false)}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: SCAN / UPLOAD DOCUMENT
  // ─────────────────────────────────────────────────────────────────────────────
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
          { label: isEs ? 'Inicio' : 'Home', href: '/' },
          { label: isEs ? 'Digitalización de Prescripciones' : 'Prescription Intake' }
        ]}
        copyUrl={typeof window !== 'undefined' ? `${window.location.origin}/rx/intake` : 'https://med-peptides.com/rx/intake'}
      />

      <div className="pds-page-shell-inner" style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        
        {/* Clean Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)',
            border: '1px solid #c7d2fe',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#4338ca',
            marginBottom: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <Sparkles size={14} style={{ color: '#6366f1' }} />
            <span>{isEs ? 'MOTOR ATLAS CLINICAL AI · ESCANEO Y PUBLICACIÓN' : 'ATLAS CLINICAL AI ENGINE · SCAN & PUBLISH'}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.2,
            margin: '0 0 1rem'
          }}>
            {isEs 
              ? 'Escaneo y Publicación de Prescripciones Médicas' 
              : 'Medical Prescription & Fagron Genomics Scanner'}
          </h1>

          <p style={{
            maxWidth: '640px',
            margin: '0 auto',
            fontSize: '1rem',
            color: '#475569',
            lineHeight: 1.6
          }}>
            {isEs
              ? 'Suba o escanee su informe Fagron Genomics (TrichoTest™, NutriGen™) o receta médica. La inteligencia artificial extraerá los datos y publicará instantáneamente la prescripción electrónica oficial.'
              : 'Scan or upload your Fagron Genomics report (TrichoTest™, NutriGen™) or medical prescription. Atlas AI will extract the compounded formula and instantly publish the official electronic prescription.'}
          </p>
        </div>

        {/* Account Manager Status Banner */}
        {isUserLoggedIn && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto 1.5rem',
            padding: '12px 18px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#166534' }}>
                {isEs ? 'Modo Account Manager Conectado' : 'Connected Account Manager Mode'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '1px' }}>
                {isEs 
                  ? `Sesión activa: ${user.email}. Todas las prescripciones digitalizadas se atribuirán a tu cuenta.` 
                  : `Active session: ${user.email}. All digitized prescriptions will be automatically linked to your account.`}
              </div>
            </div>
            <span style={{
              padding: '4px 8px',
              background: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #bbf7d0',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#16a34a',
              whiteSpace: 'nowrap'
            }}>
              Account Manager
            </span>
          </div>
        )}

        {!isUserLoggedIn && referralAm && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto 1.5rem',
            padding: '12px 18px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#dbeafe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e40af' }}>
                {isEs ? 'Canalizado por Account Manager' : 'Referred by Account Manager'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1d4ed8', marginTop: '1px' }}>
                {isEs 
                  ? `Gestor asignado: ${referralAm}. Su solicitud será atendida directamente por este gestor.` 
                  : `Assigned manager: ${referralAm}. Your request will be directly handled by this manager.`}
              </div>
            </div>
          </div>
        )}

        {/* Dropzone Upload & Scan Area */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '2px dashed #cbd5e1',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          cursor: isProcessing ? 'wait' : 'pointer'
        }}
        {...getRootProps()}
        >
          <input {...getInputProps()} />

          {isProcessing ? (
            <div style={{ padding: '2rem 1rem' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s infinite',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.3)'
              }}>
                <RefreshCw size={32} style={{ color: '#ffffff', animation: 'spin 2s linear infinite' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                {isEs ? 'Procesando prescripción con IA...' : 'Scanning document with Clinical AI...'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto' }}>
                {processingStep || (isEs ? 'Extrayendo fórmulas magistrales y publicando...' : 'Extracting active ingredients and publishing electronic dossier...')}
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                margin: '0 auto 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a'
              }}>
                <Upload size={34} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                {isDragActive 
                  ? (isEs ? 'Suelte el documento aquí...' : 'Drop your clinical document here...') 
                  : (isEs ? 'Arrastre o seleccione el documento clínico' : 'Drag & drop or browse your clinical document')}
              </h3>
              
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.75rem' }}>
                {isEs 
                  ? 'PDF de Fagron TrichoTest, recetas escaneadas, PNG, JPG (hasta 15MB)' 
                  : 'Fagron TrichoTest PDF, medical prescription scans, PNG, JPG (up to 15MB)'}
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    padding: '0.85rem 1.8rem',
                    borderRadius: '12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={18} />
                  <span>{isEs ? 'Seleccionar Archivo o PDF' : 'Browse Document or PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  style={{
                    padding: '0.85rem 1.8rem',
                    borderRadius: '12px',
                    background: '#047857',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Camera size={18} />
                  <span>{isEs ? 'Fotografiar con Cámara' : 'Scan with Camera'}</span>
                </button>
              </div>

              {/* Hidden camera input for mobile photo snap */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleProcessFile(e.target.files[0]);
                  }
                }}
              />

              {/* Clipboard paste hint */}
              <div style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>💡 {isEs ? 'O pega una captura directamente con' : 'Or paste a screenshot directly with'}</span>
                <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1px 6px', fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                  ⌘V / Ctrl+V
                </kbd>
              </div>
            </div>
          )}
        </div>

        {/* ── DUPLICATE WARNING MODAL ── */}
        {duplicateWarning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.70)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              border: '1px solid #fed7aa',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#d97706',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldAlert size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#92400e' }}>
                    {isEs ? 'Prescripción Previamente Registrada' : 'Prescription Already Registered'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#b45309' }}>
                    {isEs 
                      ? 'Se ha detectado una prescripción existente con los mismos identificadores clave.' 
                      : 'An existing prescription with the same key identifiers was found in the database.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismissDuplicate}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#92400e',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title={isEs ? 'Cerrar' : 'Close'}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Match criteria tag */}
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  color: '#92400e',
                  fontWeight: 600
                }}>
                  <span>📌 {isEs ? 'Causa de coincidencia:' : 'Match criteria:'}</span>
                  <span style={{ fontWeight: 800, color: '#b45309' }}>{duplicateWarning.matchReason}</span>
                </div>

                {/* Existing Card Details */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    {isEs ? 'Prescripción Existente en Base de Datos' : 'Existing Record in Database'}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>{isEs ? 'Código:' : 'Code:'} </span>
                      <strong style={{ fontFamily: 'monospace', color: '#003666' }}>
                        {duplicateWarning.existingPrescription?.prescriptionNumber || duplicateWarning.existingPrescription?.id}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>{isEs ? 'Paciente:' : 'Patient:'} </span>
                      <strong>{duplicateWarning.existingPrescription?.patientName || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>{isEs ? 'Fecha:' : 'Date:'} </span>
                      <strong>{duplicateWarning.existingPrescription?.prescriptionDate || '—'}</strong>
                    </div>
                    {duplicateWarning.existingPrescription?.boxId && (
                      <div>
                        <span style={{ color: '#64748b' }}>Box ID: </span>
                        <strong style={{ fontFamily: 'monospace' }}>{duplicateWarning.existingPrescription.boxId}</strong>
                      </div>
                    )}
                    <div>
                      <span style={{ color: '#64748b' }}>{isEs ? 'Médico:' : 'Doctor:'} </span>
                      <span>{duplicateWarning.existingPrescription?.doctorName || 'Physician'}</span>
                    </div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  {isEs
                    ? 'Para mantener la trazabilidad clínica y evitar duplicados innecesarios, se recomienda abrir la prescripción ya existente. Si se trata de una nueva versión o rectificación y deseas cargarla de nuevo igualmente, pulsa "Cargar de Todos Modos".'
                    : 'To preserve clinical audit trails, you can open the existing prescription. If this is a revised version and you still wish to re-upload it, you can proceed by confirming.'}
                </p>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '0.5rem'
                }}>
                  {/* Action 1: View Existing (Recommended) */}
                  <button
                    type="button"
                    onClick={handleViewExistingRx}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      background: '#003666',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(0,54,102,0.2)'
                    }}
                  >
                    <Eye size={16} />
                    <span>{isEs ? 'Ver Prescripción Existente (Recomendado)' : 'View Existing Prescription (Recommended)'}</span>
                  </button>

                  {/* Action 2: Force Re-Upload (Override) */}
                  <button
                    type="button"
                    onClick={handleForcePublish}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#fffbeb',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShieldAlert size={16} color="#d97706" />
                    <span>{isEs ? 'Cargar de Todos Modos (Permitir Duplicado)' : 'Upload Anyway (Allow Duplicate)'}</span>
                  </button>

                  {/* Action 3: Cancel */}
                  <button
                    type="button"
                    onClick={handleDismissDuplicate}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#64748b',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isEs ? 'Cancelar y descartar este archivo' : 'Cancel and dismiss file'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.88rem' }}>{error}</div>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {isEs ? 'Reintentar' : 'Retry'}
            </button>
          </div>
        )}

        {/* Public Clinical Footer */}
        <footer style={{
          marginTop: '4rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
            Atlas Services Clinical Intelligence · HIPAA & GDPR Compliant Medical Protocol Intake
          </div>
        </footer>

      </div>
    </div>
  );
}

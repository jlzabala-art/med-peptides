"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, CheckCircle2, Activity, AlertCircle, Save, FileText,
  Beaker, Sparkles, ExternalLink, RefreshCw, ShieldAlert,
  Stethoscope, Dna, Info, Copy, Check, ArrowRight, ArrowLeft, Phone,
  FileSpreadsheet, Eye, Clock, ChevronDown, ChevronUp,
  MessageCircle, RotateCcw, ShieldCheck, Send, UserCheck, UserPlus, Lock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import StandardDrawer from '../../../components/ui/StandardDrawer';
import AlgoliaProductPicker from '../../../components/admin/protocols/tabs/AlgoliaProductPicker';
import ShareIntakeWhatsAppModal from '../../../components/shared/ShareIntakeWhatsAppModal';
import toast from 'react-hot-toast';
import { useDrawer } from '../../../context/DrawerContext';
import {
  extractPrescriptionFromDocument,
  normalizeExtractedPrescriptions,
  checkDuplicatesInFirestore,
  savePrescriptionsToFirestore,
  validatePrescriptionClinicalRules
} from '../../../services/prescriptionAiService';
import { exportPrescriptionToXlsx } from '../../../utils/exportPrescriptionToXlsx';
import {
  sanitizePrescriptionCode,
  getCodifiedPatientId,
  maskDateOfBirth,
  maskMedicalLicense
} from '@/lib/prescriptionSanitizer';

export default function PrescriptionIntakeWorkspace({
  isOpen,
  onClose,
  onSaveSuccess,
  doctorContext = null
}) {
  const { openDrawer } = useDrawer();
  const { user, activeRole, isAdmin } = useAuth();

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingActionType, setSavingActionType] = useState('draft'); // 'draft' | 'pending'
  const [error, setError] = useState(null);

  const [rawAiData, setRawAiData] = useState(null);
  const isAuthorizedViewer = Boolean(
    doctorContext?.isAuthorizedViewer ||
    (user && (isAdmin || ['doctor', 'admin', 'clinic', 'clinic_admin', 'medical_director', 'fagron_doctor'].includes(activeRole || user?.role)))
  );
  const [renewalTarget, setRenewalTarget] = useState('same'); // 'same' | 'new'

  const [normalizedRxList, setNormalizedRxList] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawPrefill = sessionStorage.getItem('atlas_represcribe_prefill');
        if (rawPrefill) {
          sessionStorage.removeItem('atlas_represcribe_prefill');
          const parsed = JSON.parse(rawPrefill);
          const rawItems = Array.isArray(parsed.items) && parsed.items.length > 0
            ? parsed.items
            : [{ name: parsed.treatmentTitle || 'Compounded Active', dose: 'Standard Concentration' }];
          const lines = rawItems.map((it, idx) => ({
            id: it.id || `cloned_line_${idx}`,
            productId: it.productId || it.id || `cloned_prod_${idx}`,
            productName: it.name || it.productName || it.activeIngredient || 'Compounded Ingredient',
            activeIngredient: it.activeIngredient || it.name || 'Compounded Ingredient',
            dose: it.dose || it.dosage || it.concentration || 'Standard',
            dosage: it.dose || it.dosage || it.concentration || 'Standard',
            strength: it.dose || it.dosage || it.concentration || 'Standard',
            vehicle: it.vehicle || parsed.vehicle || 'Magistral Base',
            instructions: it.instructions || parsed.posology || 'Apply as directed by physician',
            quantity: it.quantity || 1,
            status: 'Ready',
            _isPlaceholder: false
          }));

          const cleanClonedCode = sanitizePrescriptionCode(parsed.sourceRx, parsed.patientName);
          const safePatientName = isAuthorizedViewer ? (parsed.patientName || '') : '';
          const safePatientPhone = isAuthorizedViewer ? (parsed.patientPhone || '') : '';
          const safeDob = isAuthorizedViewer ? (parsed.patientDob || '') : '';
          const safeDoctorLicense = isAuthorizedViewer
            ? (parsed.doctorLicense || doctorContext?.doctorLicense || '')
            : maskMedicalLicense(parsed.doctorLicense || doctorContext?.doctorLicense, false, doctorContext?.opaqueCode || doctorContext?.doctorSlug);

          return [{
            id: `cloned_${Date.now()}`,
            patientName: safePatientName,
            patientPhone: safePatientPhone,
            patient: {
              name: safePatientName,
              dob: safeDob,
              phone: safePatientPhone
            },
            doctorName: doctorContext?.doctorName || parsed.doctorName || 'Prescribing Physician',
            doctorId: doctorContext?.doctorId || parsed.doctorId || null,
            doctorLicense: safeDoctorLicense,
            clinic: doctorContext?.clinicName || parsed.clinic || 'Clinical Practice',
            treatmentTitle: parsed.treatmentTitle || 'Compounded Formulation',
            treatmentType: parsed.treatmentTitle || 'Compounded Formulation',
            dispensingForm: parsed.dispensingForm || 'Magistral Solution',
            volume: parsed.volume || '60 mL',
            posology: parsed.posology || 'Apply as directed by prescribing physician.',
            prescriptionLines: lines,
            items: lines,
            validationStatus: 'Ready',
            _clonedFromCode: cleanClonedCode || null,
            _clonedSourcePatient: isAuthorizedViewer ? (parsed.patientName || '') : ''
          }];
        }
      } catch (e) {
        console.warn('Could not parse atlas_represcribe_prefill:', e);
      }
    }
    return [];
  });
  // Default to false so we never silently select or merge similarly named patients without physician opt-in
  const [alsoCreatePatient, setAlsoCreatePatient] = useState(false);
  const [savedPrescriptionsResult, setSavedPrescriptionsResult] = useState(null);
  const isSubmittedResult = savedPrescriptionsResult?.[0]?.status === 'pending' || savingActionType === 'pending';
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingTargetStatus, setPendingTargetStatus] = useState('draft');
  const [showHowReviewWorks, setShowHowReviewWorks] = useState(false);

  // Workflow progress determination: 1 = Upload, 2 = Review, 3 = Save draft
  const currentStep = useMemo(() => {
    if (savedPrescriptionsResult) return 3;
    if (file || normalizedRxList.length > 0) return 2;
    return 1;
  }, [file, normalizedRxList.length, savedPrescriptionsResult]);

  // Clone / Renewal mode determination: formula prefilled from existing record without file upload
  const isCloneMode = useMemo(() => {
    return Boolean(normalizedRxList[0]?._clonedFromCode && !file);
  }, [normalizedRxList, file]);

  const cleanClonedCode = useMemo(() => {
    return sanitizePrescriptionCode(normalizedRxList[0]?._clonedFromCode || 'RX');
  }, [normalizedRxList]);

  const sourcePatientName = useMemo(() => {
    return isAuthorizedViewer ? (normalizedRxList[0]?._clonedSourcePatient || normalizedRxList[0]?.patientName || '') : '';
  }, [isAuthorizedViewer, normalizedRxList]);

  const hasUnsavedChanges = useMemo(() => {
    return (Boolean(file) || normalizedRxList.length > 0) && !savedPrescriptionsResult;
  }, [file, normalizedRxList.length, savedPrescriptionsResult]);

  const handleSafeClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm('You have unsaved prescription details. Are you sure you want to close without saving?');
      if (!confirmExit) return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  const handleSafeChangeFile = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm('Replacing this file will discard current extracted details. Continue?');
      if (!confirmChange) return;
    }
    setFile(null);
    setFilePreview(null);
    setNormalizedRxList([]);
    setRawAiData(null);
    setError(null);
  }, [hasUnsavedChanges]);

  const handleProcessFile = useCallback(async (droppedFile) => {
    if (!droppedFile) return;
    setFile(droppedFile);
    setIsProcessing(true);
    setError(null);
    setNormalizedRxList([]);
    setRawAiData(null);

    // Create local blob preview
    setFilePreview(URL.createObjectURL(droppedFile));

    try {
      toast.loading('Extracting document details...', { id: 'ai-intake' });
      
      // 1. Multimodal extraction
      const aiData = await extractPrescriptionFromDocument(droppedFile);
      setRawAiData(aiData);

      // 2. Normalize to canonical schema & resolve catalog ingredients
      toast.loading('Matching ingredients against clinical catalogue...', { id: 'ai-intake' });
      const normalized = await normalizeExtractedPrescriptions(aiData, {
        currentUser: user,
        context: doctorContext || {},
        splitBlocksIntoSeparatePrescriptions: true,
      });

      // 3. Deduplicate against Firestore
      const deduplicated = await checkDuplicatesInFirestore(normalized);
      setNormalizedRxList(deduplicated);

      toast.success(
        `Extraction complete (${deduplicated.length} ${deduplicated.length === 1 ? 'prescription' : 'compounded formulations'})`,
        { id: 'ai-intake' }
      );
    } catch (err) {
      console.error('[PrescriptionIntakeWorkspace] Error:', err);
      const rawMsg = String(err?.message || '');
      let cleanMsg = 'Unable to extract details from this document. Please check the file and retry.';

      if (/503|UNAVAILABLE|high demand|saturad|peak demand|capacity|spikes in demand|temporarily|busy/i.test(rawMsg)) {
        cleanMsg = 'Extraction service is temporarily experiencing high demand. Please retry in a few moments.';
      } else if (rawMsg && !rawMsg.startsWith('{')) {
        cleanMsg = rawMsg;
      }

      setError(cleanMsg);
      toast.error(cleanMsg, { id: 'ai-intake' });
    } finally {
      setIsProcessing(false);
    }
  }, [user, doctorContext]);

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop: (accepted, rejected) => {
      if (rejected && rejected.length > 0) {
        const rej = rejected[0];
        if (rej.errors?.some(e => e.code === 'file-too-large')) {
          toast.error('File exceeds maximum allowed size of 15 MB.');
          return;
        }
        if (rej.errors?.some(e => e.code === 'file-invalid-type')) {
          toast.error('Unsupported file format. Please upload a PDF, JPG, or PNG.');
          return;
        }
      }
      if (accepted.length > 0) {
        handleProcessFile(accepted[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 15 * 1024 * 1024,
    disabled: isProcessing
  });

  // Editable review field handlers
  const handleUpdateSharedHeaderField = useCallback((field, value) => {
    setNormalizedRxList(prev => prev.map(rx => {
      const updated = { ...rx };
      if (field === 'patientName') {
        updated.patientName = value;
        updated.patient = { ...(updated.patient || {}), name: value };
      } else if (field === 'patientDob') {
        updated.patient = { ...(updated.patient || {}), dob: value };
      } else if (field === 'doctorName') {
        updated.doctorName = value;
        updated.doctor = { ...(updated.doctor || {}), name: value };
      } else if (field === 'doctorLicense') {
        updated.doctorLicense = value;
        updated.doctor = { ...(updated.doctor || {}), license: value };
      }
      return updated;
    }));
  }, []);

  const handleUpdateFormulationField = useCallback((rxIndex, field, value) => {
    setNormalizedRxList(prev => {
      const copy = [...prev];
      copy[rxIndex] = {
        ...copy[rxIndex],
        [field]: value
      };
      return copy;
    });
  }, []);

  const handleUpdateIngredientField = useCallback((rxIndex, lineIndex, field, value) => {
    setNormalizedRxList(prev => {
      const copy = [...prev];
      const rx = { ...copy[rxIndex] };
      const lines = [...(rx.prescriptionLines || [])];
      const updatedLine = {
        ...lines[lineIndex],
        [field]: value
      };
      if (field === 'dose') {
        updatedLine.dosage = value;
        updatedLine.strength = value;
      }
      if (field === 'productName') {
        updatedLine.activeIngredient = value;
      }
      lines[lineIndex] = updatedLine;
      rx.prescriptionLines = lines;
      rx.items = lines;
      copy[rxIndex] = rx;
      return copy;
    });
  }, []);

  // Re-map an individual line item to a selected catalog product
  const handleProductMapped = (rxIndex, lineIndex, selectedProduct) => {
    setNormalizedRxList(prev => {
      const copy = [...prev];
      const rx = { ...copy[rxIndex] };
      const lines = [...rx.prescriptionLines];
      
      lines[lineIndex] = {
        ...lines[lineIndex],
        productId: selectedProduct.id || selectedProduct.objectID,
        productName: selectedProduct.name || selectedProduct.displayName || lines[lineIndex].productName,
        sku: selectedProduct.sku || '',
        price: selectedProduct.pricing?.wholesale?.perUnit || selectedProduct.price || 0,
        _isPlaceholder: false,
        _needsProductMapping: false,
        _isManuallyMapped: true,
        status: 'Pending'
      };

      rx.prescriptionLines = lines;
      rx.items = lines;
      
      const anyUnresolved = lines.some(l => !l.productId || l._isPlaceholder);
      rx.validationStatus = anyUnresolved ? 'Needs Review' : 'Ready';

      copy[rxIndex] = rx;
      return copy;
    });
    toast.success(`Ingredient mapped to: ${selectedProduct.name}`);
  };

  const handleCopyRxUrl = (url, rxNumber) => {
    if (typeof window === 'undefined') return;
    const fullUrl = `${window.location.origin}${url}`;
    navigator?.clipboard?.writeText(fullUrl);
    setCopiedUrl(rxNumber);
    toast.success('Online prescription dossier link copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleResetForNewUpload = () => {
    setFile(null);
    setFilePreview(null);
    setRawAiData(null);
    setNormalizedRxList([]);
    setSavedPrescriptionsResult(null);
    setError(null);
    setShowDuplicateModal(false);
  };

  const isDraftValid = useMemo(() => {
    if (!normalizedRxList.length) return false;
    const first = normalizedRxList[0];
    const hasPatientName = Boolean(first?.patientName && first.patientName.trim().length > 0);
    const hasLines = normalizedRxList.some(r => Array.isArray(r.prescriptionLines) && r.prescriptionLines.length > 0);
    return hasPatientName && hasLines;
  }, [normalizedRxList]);

  const disabledReason = useMemo(() => {
    if (isProcessing) return 'Waiting for document extraction to finish...';
    if (!normalizedRxList.length) return 'No extracted prescription details available yet.';
    if (!normalizedRxList[0]?.patientName?.trim()) return 'Enter a patient name before saving.';
    if (!normalizedRxList.some(r => r.prescriptionLines?.length > 0)) return 'At least one active ingredient is required.';
    return null;
  }, [isProcessing, normalizedRxList]);

  // Save directly to Firestore using canonical schema
  const handleConfirmSave = async (overrideDuplicate = false, targetStatus = 'draft') => {
    if (!isDraftValid) {
      toast.error(disabledReason || 'Please complete required prescription fields before saving.');
      return;
    }

    const hasDups = normalizedRxList.some(r => r._dupStatus === 'duplicate');
    if (hasDups && !overrideDuplicate) {
      setPendingTargetStatus(targetStatus);
      setShowDuplicateModal(true);
      return;
    }

    setIsSaving(true);
    setSavingActionType(targetStatus);
    setShowDuplicateModal(false);
    try {
      const isSubmitting = targetStatus === 'pending';
      toast.loading(
        isSubmitting
          ? 'Submitting prescription for pharmacist review...'
          : 'Saving prescription draft...',
        { id: 'save-intake' }
      );
      
      const result = await savePrescriptionsToFirestore(normalizedRxList, {
        alsoCreatePatient,
        currentUser: user,
        overrideDuplicate,
        targetStatus,
      });

      if (result.errors?.length > 0) {
        toast.error(`Saved with advisories: ${result.errors[0]}`, { id: 'save-intake' });
      } else {
        toast.success(
          isSubmitting
            ? `Submitted ${result.savedCount} prescription(s) for pharmacist review`
            : `Saved ${result.savedCount} prescription draft(s)`,
          { id: 'save-intake' }
        );
      }

      onSaveSuccess && onSaveSuccess(result.savedIds, result.savedPrescriptions);

      if (result.savedPrescriptions && result.savedPrescriptions.length > 0) {
        setSavedPrescriptionsResult(result.savedPrescriptions);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(`Error saving prescription: ${err.message}`, { id: 'save-intake' });
    } finally {
      setIsSaving(false);
    }
  };

  // Transfer data to UniversalOrderBuilder
  const handleOpenInBuilder = () => {
    if (!normalizedRxList.length) return;
    const firstRx = normalizedRxList[0];

    const initialItems = firstRx.prescriptionLines.map(p => ({
      id: p.productId || `temp_${Math.random()}`,
      productId: p.productId || null,
      name: p.productName || p.activeIngredient || 'Item',
      productName: p.productName || p.activeIngredient || 'Item',
      dosage: p.dosage || p.dose || '',
      frequency: p.frequency || '',
      quantity: p.quantity || 1,
      instructions: p.instructions || ''
    }));

    onClose();
    openDrawer('rx-builder', 'new', {
      initialDoctorName: firstRx.doctorName || 'Prescribing Physician',
      initialTarget: firstRx.patientName ? { name: firstRx.patientName, type: 'patient' } : null,
      initialItems,
      initialNotes: `Imported from prescription file: ${rawAiData?._fileName || file?.name || 'Prescription'}`
    });
  };

  const isFagron = rawAiData?.documentType === 'FagronGenomics' || rawAiData?.fagronDetails?.isFagron;
  const hasDuplicates = normalizedRxList.some(r => r._dupStatus === 'duplicate');
  const duplicateItem = normalizedRxList.find(r => r._dupStatus === 'duplicate');
  const rawExistingCode = duplicateItem?._existingData?.prescriptionNumber || duplicateItem?._existingData?.code || duplicateItem?._existingId;
  const existingCode = sanitizePrescriptionCode(rawExistingCode);
  const rawExistingPatient = duplicateItem?._existingData?.patientName || duplicateItem?._existingData?.patient?.name;
  const existingPatient = isAuthorizedViewer ? rawExistingPatient : (rawExistingPatient ? `Patient ${getCodifiedPatientId(rawExistingPatient, existingCode)}` : null);
  const existingDate = duplicateItem?._existingData?.reportDate || duplicateItem?._existingData?.prescriptionDate;
  const existingBox = duplicateItem?._existingData?.fagron?.boxId || duplicateItem?._existingData?.boxId;
  const dupReason = duplicateItem?._duplicateReason;

  const clinicalValidation = React.useMemo(() => {
    return validatePrescriptionClinicalRules(normalizedRxList);
  }, [normalizedRxList]);

  // Contextual Footer Render
  const renderFooter = () => {
    if (savedPrescriptionsResult) {
      return (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="gcp-btn-secondary"
            onClick={handleResetForNewUpload}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Upload size={14} />
            <span>Upload another prescription</span>
          </button>
          <button
            type="button"
            className="gcp-btn-primary"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '160px', justifyContent: 'center' }}
          >
            <span>Done</span>
            <ArrowRight size={15} />
          </button>
        </div>
      );
    }

    // Initial state: only Cancel (no unexplained, permanently disabled Save button)
    if (!file && normalizedRxList.length === 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
          <button type="button" className="gcp-btn-secondary" onClick={handleSafeClose}>
            Cancel
          </button>
        </div>
      );
    }

    // Clone / Renewal mode footer: 3 streamlined actions without clutter (no Back, no Excel, no Regimen Builder)
    if (isCloneMode) {
      return (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          <button type="button" className="gcp-btn-secondary" onClick={handleSafeClose} disabled={isSaving}>
            Cancel
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {disabledReason && (
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {disabledReason}
              </span>
            )}

            <button
              type="button"
              className="gcp-btn-secondary"
              onClick={() => handleConfirmSave(false, 'draft')}
              disabled={!isDraftValid || isSaving || isProcessing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              title="Save this prescription as a draft in your practice repository"
            >
              {isSaving && savingActionType === 'draft' ? (
                <>
                  <RefreshCw size={14} className="spin-slow" />
                  <span>Saving draft...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save draft</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="gcp-btn-primary"
              onClick={() => handleConfirmSave(false, 'pending')}
              disabled={!isDraftValid || isSaving || isProcessing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '160px',
                justifyContent: 'center',
                backgroundColor: '#003666',
                fontWeight: 650
              }}
              title="Submit prescription for compounding and pharmacist verification"
            >
              {isSaving && savingActionType === 'pending' ? (
                <>
                  <RefreshCw size={15} className="spin-slow" />
                  <span>Issuing prescription...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Issue prescription</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // Review state: Back, Cancel, optional tools, Submit for review (secondary), Save draft (primary)
    return (
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="gcp-btn-secondary"
            onClick={handleSafeChangeFile}
            disabled={isSaving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <button type="button" className="gcp-btn-secondary" onClick={handleSafeClose} disabled={isSaving}>
            Cancel
          </button>

          {normalizedRxList.length > 0 && (
            <>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleOpenInBuilder}
                disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={14} />
                <span>Open in Regimen Builder</span>
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => {
                  if (normalizedRxList[0]) {
                    toast.loading('Generating Excel file...', { id: 'ws-excel' });
                    const res = exportPrescriptionToXlsx(normalizedRxList[0], { lang: 'en' });
                    if (res?.success) {
                      toast.success(`Exported to Excel: ${res.filename} (${res.itemCount} items)`, { id: 'ws-excel' });
                    } else {
                      toast.error('Failed to export Excel file', { id: 'ws-excel' });
                    }
                  }
                }}
                disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d' }}
                title="Export structured prescription to Excel (.xlsx)"
              >
                <FileSpreadsheet size={14} color="#15803d" />
                <span>Export to Excel</span>
              </button>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {disabledReason && (
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              {disabledReason}
            </span>
          )}

          <button
            type="button"
            className="gcp-btn-secondary"
            onClick={() => handleConfirmSave(false, 'pending')}
            disabled={!isDraftValid || isSaving || isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            title="Save and submit to compounding pharmacist for review (reviewed within 24 hours)"
          >
            {isSaving && savingActionType === 'pending' ? (
              <>
                <RefreshCw size={14} className="spin-slow" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Submit for review</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="gcp-btn-primary"
            onClick={() => handleConfirmSave(false, 'draft')}
            disabled={!isDraftValid || isSaving || isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '140px', justifyContent: 'center' }}
          >
            {isSaving && savingActionType === 'draft' ? (
              <>
                <RefreshCw size={15} className="spin-slow" />
                <span>Saving draft...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save draft</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Adaptive drawer width compliant with Google Cloud UX standards:
  // - Step 1 (Upload): 580px (focused, zero wasted whitespace, dashboard/sidebar remains contextual)
  // - Step 2 (Review - File Upload): min(1160px, calc(100vw - 280px)) (spacious side-by-side workspace)
  // - Step 2 (Review - Clone / Renew): min(880px, calc(100vw - 120px)) (focused single-column workspace)
  // - Step 3 (Saved): 620px (clean summary card)
  const resolvedDrawerWidth = useMemo(() => {
    if (currentStep === 1) return '580px';
    if (currentStep === 3) return '620px';
    if (isCloneMode) return 'min(880px, calc(100vw - 120px))';
    return 'min(1160px, calc(100vw - 280px))';
  }, [currentStep, isCloneMode]);

  const drawerTitle = isCloneMode ? "Renew or Duplicate Prescription" : "New prescription";
  const drawerSubtitle = isCloneMode
    ? (isAuthorizedViewer && sourcePatientName
        ? `Pre-populated from #${cleanClonedCode}. Confirm recipient patient and issue prescription.`
        : `Pre-populated clinical formula from #${cleanClonedCode}. Confirm patient and issue prescription.`)
    : (
        currentStep === 1
          ? "Upload a prescription or clinical report to begin AI extraction."
          : currentStep === 2
          ? "Review and verify extracted active ingredients, dosages, and posology."
          : "Prescription successfully saved."
      );

  return (
    <>
      <StandardDrawer
        isOpen={isOpen}
        onClose={handleSafeClose}
        title={drawerTitle}
        subtitle={drawerSubtitle}
        width={resolvedDrawerWidth}
        preserveSidebar={true}
        footer={renderFooter()}
      >
        <div className="prescription-intake-body">
          {/* ── Progress Indicator / Renewal Badge ── */}
          {isCloneMode ? (
            <div className="clone-mode-header-badge">
              <div className="clone-mode-badge-left">
                <RefreshCw size={15} className="text-emerald-600" />
                <span>Prescription Renewal & Regimen Clone</span>
                <span className="clone-source-pill">Source: #{cleanClonedCode}</span>
              </div>
              <span className="clone-formula-type">
                {normalizedRxList[0]?.treatmentType || 'Compounded Formula'}
              </span>
            </div>
          ) : (
            <div className="workflow-stepper-strip" aria-label="Prescription intake steps">
              <div className={`step-node ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-circle">{currentStep > 1 ? <Check size={12} /> : '1'}</div>
                <span className="step-title">Upload</span>
              </div>
              <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`} />
              <div className={`step-node ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-circle">{currentStep > 2 ? <Check size={12} /> : '2'}</div>
                <span className="step-title">Review</span>
              </div>
              <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`} />
              <div className={`step-node ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-circle">{currentStep >= 3 ? <Check size={12} /> : '3'}</div>
                <span className="step-title">Save draft</span>
              </div>
            </div>
          )}

          {/* ── SAVED SUCCESS CONFIRMATION VIEW ── */}
          {savedPrescriptionsResult ? (
            <div className="saved-confirmation-container">
              <div className="saved-confirmation-card">
                <div className="saved-icon-circle">
                  <ShieldCheck size={28} />
                </div>
                <div className="saved-text-block">
                  <div className="saved-heading-row">
                    <h3 className="saved-title">
                      {isSubmittedResult ? 'Submitted for pharmacist review' : 'Prescription draft saved'}
                    </h3>
                    <span className="saved-badge">
                      {isSubmittedResult ? 'Pending Pharmacist Review · Not Yet Approved' : 'Draft Status · Not Yet Approved'}
                    </span>
                  </div>
                  <p className="saved-description">
                    {isSubmittedResult ? (
                      <>
                        Your prescription has been submitted for pharmacist review (status: <strong>Pending</strong>).
                        Compounding pharmacists verify excipients, molecular vehicles, and posology within 24 hours before final approval.
                      </>
                    ) : (
                      <>
                        The prescription has been saved in your practice repository as a <strong>Draft</strong>.
                        Drafts are not yet approved or dispensed until submitted and verified by a compounding pharmacist.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Saved items list */}
              <div className="saved-cards-list">
                {savedPrescriptionsResult.map((saved, idx) => (
                  <div key={saved.id || idx} className="saved-item-box">
                    <div className="saved-item-top">
                      <div className="saved-patient-info">
                        <FileText size={18} className="text-slate-600" />
                        <div>
                          <div className="saved-patient-name">
                            {saved.patientName} • {saved.treatmentType}
                          </div>
                          <div className="saved-patient-meta">
                            {saved.lineCount} formulated ingredients • Code: <code className="font-mono text-blue-900 font-bold">{saved.prescriptionNumber}</code>
                          </div>
                        </div>
                      </div>

                      <span className="draft-pill">
                        <Clock size={12} /> {saved.status === 'pending' ? 'Submitted for Review' : 'Draft'}
                      </span>
                    </div>

                    <div className="saved-item-actions">
                      <a
                        href={saved.rxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gcp-btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                        <span>View Online Prescription ({saved.prescriptionNumber})</span>
                      </a>

                      <button
                        type="button"
                        className="gcp-btn-secondary"
                        onClick={() => handleCopyRxUrl(saved.rxUrl, saved.prescriptionNumber)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px' }}
                      >
                        {copiedUrl === saved.prescriptionNumber ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{copiedUrl === saved.prescriptionNumber ? 'Link Copied' : 'Copy Patient Direct Link'}</span>
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hello ${saved.patientName}, here is your digitized medical prescription with validated clinical access:\n\n${typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com'}${saved.rxUrl}\n\nVerification Code: ${saved.prescriptionNumber}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gcp-btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.82rem',
                          padding: '6px 14px',
                          textDecoration: 'none',
                          color: '#15803d',
                          background: '#f0fdf4',
                          borderColor: '#bbf7d0'
                        }}
                      >
                        <Phone size={14} color="#25D366" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (!file && normalizedRxList.length === 0) ? (
            /* ── INITIAL STATE: CENTERED UPLOAD AREA (NO EMPTY RIGHT PANEL) ── */
            <div className="upload-screen-centered">
              {/* Brief Process Note */}
              <div className="brief-assurance-banner">
                <Sparkles size={16} className="text-blue-600 flex-shrink-0" />
                <span>Atlas extracts the document details for you to review before saving.</span>
              </div>

              {/* Main Compact Upload Area */}
              <div
                {...getRootProps()}
                className={`centered-dropzone-card ${isDragActive ? 'drag-active' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="upload-circle-icon">
                  <Upload size={30} />
                </div>
                
                <h3 className="upload-main-heading">Upload a document</h3>

                <button
                  type="button"
                  className="gcp-btn-primary choose-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                >
                  Choose file
                </button>

                <p className="upload-drag-text">Or drag and drop your file here</p>

                <div className="upload-specs-block">
                  <div className="upload-examples">Prescriptions, clinical reports and compounding formulas</div>
                  <div className="upload-formats">PDF, JPG, PNG · Max 15 MB</div>
                </div>
              </div>

              {/* Secondary Phone Upload Option */}
              <div className="mobile-upload-bar">
                <div className="mobile-upload-info">
                  <div className="mobile-upload-heading">Upload from your phone</div>
                  <div className="mobile-upload-helper">Send a mobile upload link via WhatsApp.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="gcp-btn-secondary mobile-share-btn"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>Send WhatsApp link</span>
                </button>
              </div>

              {/* Collapsible 'How review works' section */}
              <div className="how-review-section">
                <button
                  type="button"
                  className="how-review-trigger"
                  onClick={() => setShowHowReviewWorks(!showHowReviewWorks)}
                  aria-expanded={showHowReviewWorks}
                >
                  <Info size={14} className="text-slate-500" />
                  <span>How review works</span>
                  {showHowReviewWorks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showHowReviewWorks && (
                  <div className="how-review-content">
                    <div className="how-review-item">
                      <div className="how-num">1</div>
                      <div className="how-text">
                        <strong>AI extraction:</strong> Active pharmaceutical ingredients, dosages, and posology instructions are automatically extracted into structured fields.
                      </div>
                    </div>
                    <div className="how-review-item">
                      <div className="how-num">2</div>
                      <div className="how-text">
                        <strong>Physician review:</strong> You inspect, verify, or adjust every extracted line item, patient identity, and dispensing form.
                      </div>
                    </div>
                    <div className="how-review-item">
                      <div className="how-num">3</div>
                      <div className="how-text">
                        <strong>Saving a draft:</strong> You can save the prescription as a draft in your practice repository at any time. Saved drafts are never approved or dispensed automatically.
                      </div>
                    </div>
                    <div className="how-review-item">
                      <div className="how-num">4</div>
                      <div className="how-text">
                        <strong>Submission for pharmacist review:</strong> When ready, submit the prescription so compounding pharmacists can verify excipients, chemical compatibility, and posology (within 24 hours).
                      </div>
                    </div>
                    <div className="how-review-item">
                      <div className="how-num">5</div>
                      <div className="how-text">
                        <strong>Final approval:</strong> Once pharmacist verification and physician sign-off are complete, the prescription transitions to final approved status for dispensing.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── REVIEW STATE: SPLIT (FILE UPLOAD) OR FOCUSED SINGLE COLUMN (CLONE/RENEW) ── */
            <div className={isCloneMode ? "review-workspace-focused" : "review-workspace-split"}>
              {/* LEFT PANE: Document Preview (Only for file upload) */}
              {!isCloneMode && (
                <div className="review-document-pane">
                  <div className="document-pane-header">
                    <div className="document-file-identity">
                      <FileText size={15} className="text-slate-500" />
                      <span className="document-filename font-medium" title={file?.name || 'Uploaded Document'}>
                        {file?.name || 'Document'}
                      </span>
                      {file?.size && (
                        <span className="document-filesize text-xs text-slate-400">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSafeChangeFile}
                      className="change-file-btn"
                      title="Upload a different document"
                    >
                      <X size={13} />
                      <span>Change file</span>
                    </button>
                  </div>

                  <div className="document-preview-viewport">
                    {file?.type === 'application/pdf' ? (
                      <iframe
                        src={`${filePreview}#toolbar=0`}
                        className="pdf-preview-frame"
                        title="Document Preview"
                      />
                    ) : (
                      <img
                        src={filePreview}
                        alt="Prescription Document Preview"
                        className="image-preview-frame"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* RIGHT / MAIN PANE: Extracted Information & Physician Review */}
              <div className={`review-extracted-pane ${isCloneMode ? 'review-extracted-pane-full' : ''}`}>
                {/* Extraction Header */}
                <div className="extracted-pane-header">
                  <div className="extracted-title-cluster">
                    <h3 className="extracted-pane-title">
                      {isCloneMode ? "Formula & Patient Details" : "Review extracted details"}
                    </h3>
                    <span className="extracted-pane-subtitle">
                      {isCloneMode
                        ? "Verify recipient patient, active doses, and dispensing posology before issuing."
                        : "Verify patient information, active ingredients, and posology instructions."}
                    </span>
                  </div>

                  {rawAiData && (
                    <span
                      className={`classification-badge ${isFagron ? 'fagron-badge' : 'standard-badge'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Sparkles size={12} />
                      <span>{isFagron ? `Fagron ${rawAiData.fagronDetails?.testName || 'Genomics'}` : 'Standard Formulation'}</span>
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="extracted-pane-body">
                  {isProcessing ? (
                    <div className="extraction-loading-state">
                      <Activity size={36} className="spin-slow text-blue-600 mb-3" />
                      <h4 className="loading-title">Extracting document details...</h4>
                      <p className="loading-subtitle">
                        Reading formulations, dosages, and instructions from your document.
                      </p>
                    </div>
                  ) : error ? (
                    <div className="extraction-error-card">
                      <div className="error-card-header">
                        <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
                        <div>
                          <h4 className="error-card-title">Extraction Error</h4>
                          <p className="error-card-message">{error}</p>
                        </div>
                      </div>
                      <div className="error-card-actions">
                        <button
                          type="button"
                          className="gcp-btn-primary retry-btn"
                          onClick={() => handleProcessFile(file)}
                        >
                          <RotateCcw size={13} />
                          <span>Retry extraction</span>
                        </button>
                        <button
                          type="button"
                          className="gcp-btn-secondary"
                          onClick={handleSafeChangeFile}
                        >
                          <span>Choose another file</span>
                        </button>
                      </div>
                    </div>
                  ) : normalizedRxList.length > 0 ? (
                    <div className="review-sections-list">
                      {/* Missing or Uncertain Extraction Output Notice (only when reported by actual extraction) */}
                      {Array.isArray(rawAiData?.missing) && rawAiData.missing.length > 0 && (
                        <div className="clinical-safety-card">
                          <div className="clinical-safety-header">
                            <AlertCircle size={15} className="text-amber-600" />
                            <span className="clinical-safety-title">
                              Missing or uncertain information in document ({rawAiData.missing.length})
                            </span>
                          </div>
                          <div className="clinical-safety-list">
                            {rawAiData.missing.map((item, idx) => (
                              <div key={idx} className="clinical-warning-item">
                                • {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Potential Duplication Warning */}
                      {hasDuplicates && (
                        <div className="duplicate-alert-banner">
                          <div className="duplicate-alert-content">
                            <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="duplicate-alert-title">
                                Potential Duplicate Detected: {dupReason || 'A record with matching Box ID, patient name, or prescription date exists.'}
                              </div>
                              {existingCode && (
                                <div className="duplicate-alert-code">
                                  Existing prescription: <strong>{existingCode}</strong> {existingPatient ? `(${existingPatient})` : ''} {existingDate ? `— ${existingDate}` : ''}
                                </div>
                              )}
                            </div>
                          </div>
                          {existingCode && (
                            <button
                              type="button"
                              className="gcp-btn-secondary view-dup-btn"
                              onClick={() => window.open(`/rx/${existingCode}`, '_blank')}
                            >
                              <Eye size={13} />
                              <span>View Existing</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Clinical Safety Validations */}
                      {clinicalValidation.warnings.length > 0 && (
                        <div className="clinical-safety-card">
                          <div className="clinical-safety-header">
                            <AlertCircle size={15} className="text-amber-600" />
                            <span className="clinical-safety-title">
                              Clinical Safety Validations ({clinicalValidation.warnings.length})
                            </span>
                          </div>
                          <div className="clinical-safety-list">
                            {clinicalValidation.warnings.map((w, idx) => (
                              <div key={idx} className="clinical-warning-item">
                                <strong>• {w.title}:</strong> {w.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patient & Prescribing Physician Card (Editable Fields) */}
                      <div className="patient-physician-card">
                        {isCloneMode && (
                          isAuthorizedViewer && sourcePatientName ? (
                            <div className="renewal-target-selector">
                              <label className={`renewal-target-chip ${renewalTarget === 'same' ? 'active' : ''}`}>
                                <input
                                  type="radio"
                                  name="renewalTarget"
                                  value="same"
                                  checked={renewalTarget === 'same'}
                                  onChange={() => {
                                    setRenewalTarget('same');
                                    handleUpdateSharedHeaderField('patientName', sourcePatientName);
                                  }}
                                  className="sr-only"
                                />
                                <UserCheck size={15} />
                                <span>Renew for {sourcePatientName} (Repeat Cycle)</span>
                              </label>
                              <label className={`renewal-target-chip ${renewalTarget === 'new' ? 'active' : ''}`}>
                                <input
                                  type="radio"
                                  name="renewalTarget"
                                  value="new"
                                  checked={renewalTarget === 'new'}
                                  onChange={() => {
                                    setRenewalTarget('new');
                                    handleUpdateSharedHeaderField('patientName', '');
                                  }}
                                  className="sr-only"
                                />
                                <UserPlus size={15} />
                                <span>Prescribe to a New Patient</span>
                              </label>
                            </div>
                          ) : (
                            <div className="renewal-privacy-notice">
                              <Lock size={15} className="flex-shrink-0 text-amber-600" />
                              <span>Clinician sign-in required to view original patient records. Enter recipient patient name below to prescribe this formulation.</span>
                            </div>
                          )
                        )}

                        <div className="patient-physician-grid">
                          <div>
                            <label className="card-section-label" htmlFor="intake-patient-name">
                              Patient Profile
                            </label>
                            <input
                              id="intake-patient-name"
                              type="text"
                              className="review-inline-input font-semibold"
                              value={normalizedRxList[0]?.patientName || ''}
                              onChange={(e) => handleUpdateSharedHeaderField('patientName', e.target.value)}
                              placeholder={isAuthorizedViewer ? "Enter patient full name" : "Enter recipient patient name"}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span className="patient-dob-text">DOB:</span>
                              <input
                                type="text"
                                className="review-inline-input-sm"
                                value={isAuthorizedViewer
                                  ? (normalizedRxList[0]?.patient?.dob || rawAiData?.patient?.dob || '')
                                  : maskDateOfBirth(normalizedRxList[0]?.patient?.dob || rawAiData?.patient?.dob || '', false)
                                }
                                onChange={(e) => {
                                  if (isAuthorizedViewer) {
                                    handleUpdateSharedHeaderField('patientDob', e.target.value);
                                  }
                                }}
                                readOnly={!isAuthorizedViewer}
                                placeholder={isAuthorizedViewer ? "YYYY-MM-DD (optional)" : "••••-••-•• (Secured)"}
                                aria-label="Patient date of birth"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="card-section-label" htmlFor="intake-doctor-name">
                              Prescribing Physician
                            </label>
                            <div className="doctor-name-display">
                              <Stethoscope size={14} className="text-slate-500 flex-shrink-0" />
                              <input
                                id="intake-doctor-name"
                                type="text"
                                className="review-inline-input"
                                value={normalizedRxList[0]?.doctorName || ''}
                                onChange={(e) => {
                                  if (isAuthorizedViewer) {
                                    handleUpdateSharedHeaderField('doctorName', e.target.value);
                                  }
                                }}
                                readOnly={!isAuthorizedViewer}
                                placeholder="Prescribing physician name"
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span className="doctor-license-text">License:</span>
                              <input
                                type="text"
                                className="review-inline-input-sm"
                                value={isAuthorizedViewer
                                  ? (normalizedRxList[0]?.doctorLicense || doctorContext?.doctorLicense || '')
                                  : maskMedicalLicense(normalizedRxList[0]?.doctorLicense || doctorContext?.doctorLicense, false, doctorContext?.opaqueCode || doctorContext?.doctorSlug)
                                }
                                onChange={(e) => {
                                  if (isAuthorizedViewer) {
                                    handleUpdateSharedHeaderField('doctorLicense', e.target.value);
                                  }
                                }}
                                readOnly={!isAuthorizedViewer}
                                placeholder={isAuthorizedViewer ? "Medical license (optional)" : "DHA-•••••• (Verified)"}
                                aria-label="Physician medical license"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Explicit opt-in patient linking checkbox (hidden in clone mode to eliminate physician friction) */}
                        {!isCloneMode && (
                          <div className="patient-linking-strip">
                            <input
                              type="checkbox"
                              id="autoCreatePatient"
                              checked={alsoCreatePatient}
                              onChange={(e) => setAlsoCreatePatient(e.target.checked)}
                              className="cursor-pointer"
                            />
                            <label htmlFor="autoCreatePatient" className="patient-linking-label">
                              Create a new patient record in the clinical repository from these details (leave unchecked to link manually later)
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Fagron Genetics Summary Card */}
                      {isFagron && rawAiData?.fagronDetails && (
                        <div className="fagron-genetics-card">
                          <div className="fagron-header">
                            <Dna size={15} className="text-pink-600" />
                            <span className="fagron-box-title">
                              Fagron Genomics Details (BOX: {rawAiData.fagronDetails.boxId || 'N/A'})
                            </span>
                          </div>
                          {rawAiData.fagronDetails.reportDate && (
                            <span className="fagron-report-date">
                              Report Date: {rawAiData.fagronDetails.reportDate}
                            </span>
                          )}
                          {rawAiData.fagronDetails.geneticBiomarkers?.length > 0 && (
                            <div className="fagron-biomarkers-row">
                              {rawAiData.fagronDetails.geneticBiomarkers.map((b, i) => (
                                <span key={i} className="fagron-biomarker-chip">
                                  {b.gene}: {b.variant || b.interpretation}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Formulations & Prescription Lines */}
                      <div className="formulations-container">
                        <div className="formulations-count-header">
                          <span className="formulations-header-label">
                            Compounded Formulations ({normalizedRxList.length})
                          </span>
                          <span className="formulations-header-sub">
                            {normalizedRxList.reduce((sum, r) => sum + (r.prescriptionLines?.length || 0), 0)} active pharmaceutical ingredients
                          </span>
                        </div>

                        {normalizedRxList.map((rxItem, rxIdx) => (
                          <div key={rxIdx} className="formulation-card">
                            <div className="formulation-card-top">
                              <div style={{ flex: 1 }}>
                                <input
                                  type="text"
                                  className="review-inline-input font-bold"
                                  value={rxItem.treatmentType || `Formulation ${rxIdx + 1}`}
                                  onChange={(e) => handleUpdateFormulationField(rxIdx, 'treatmentType', e.target.value)}
                                  aria-label={`Formulation ${rxIdx + 1} title`}
                                />
                                {rxItem.volume && (
                                  <span className="formulation-volume">
                                    Volume / Delivery: {rxItem.volume} {rxItem.dispensingForm ? `(${rxItem.dispensingForm})` : ''}
                                  </span>
                                )}
                              </div>

                              <span
                                className={`validation-status-pill ${rxItem.validationStatus === 'Ready' ? 'status-ready' : 'status-review'}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                              >
                                {rxItem.validationStatus === 'Ready' ? (
                                  <>
                                    <CheckCircle2 size={12} />
                                    <span>Ready for draft</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle size={12} />
                                    <span>Review required</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Editable Posology instructions */}
                            <div className="posology-quote-box">
                              <label
                                htmlFor={`rx-posology-${rxIdx}`}
                                style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '3px', fontStyle: 'normal' }}
                              >
                                Posology & Administration Instructions
                              </label>
                              <textarea
                                id={`rx-posology-${rxIdx}`}
                                rows={2}
                                className="review-inline-textarea"
                                value={rxItem.posology || ''}
                                onChange={(e) => handleUpdateFormulationField(rxIdx, 'posology', e.target.value)}
                                placeholder="Enter dosing and administration instructions..."
                              />
                            </div>

                            {/* Ingredients Lines List */}
                            <div className="ingredients-lines-list">
                              {rxItem.prescriptionLines.map((line, lineIdx) => (
                                <div
                                  key={line.id || lineIdx}
                                  className={`ingredient-line-item ${line._isPlaceholder ? 'placeholder-item' : 'verified-item'}`}
                                >
                                  <div className="ingredient-line-header" style={{ flexWrap: 'wrap' }}>
                                    <div className="ingredient-identity" style={{ flex: '1 1 200px' }}>
                                      <Beaker size={14} className={line._isPlaceholder ? 'text-amber-600' : 'text-blue-600'} />
                                      <input
                                        type="text"
                                        className="review-inline-input-sm font-semibold"
                                        style={{ flex: 1 }}
                                        value={line.productName || line.activeIngredient || ''}
                                        onChange={(e) => handleUpdateIngredientField(rxIdx, lineIdx, 'productName', e.target.value)}
                                        aria-label={`Ingredient ${lineIdx + 1} name`}
                                      />
                                    </div>

                                    <div className="ingredient-meta-badges">
                                      <input
                                        type="text"
                                        className="review-inline-dose-input"
                                        value={line.dose || ''}
                                        onChange={(e) => handleUpdateIngredientField(rxIdx, lineIdx, 'dose', e.target.value)}
                                        placeholder="Strength / Dose"
                                        aria-label={`Ingredient ${lineIdx + 1} dose`}
                                      />
                                      <span className={`catalog-badge ${line._isPlaceholder ? 'catalog-placeholder' : 'catalog-verified'}`}>
                                        {line._isPlaceholder ? 'Needs Mapping' : 'Verified in Catalogue'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Option to re-map if placeholder */}
                                  {line._needsProductMapping && (
                                    <div className="mapping-picker-wrapper">
                                      <span className="mapping-picker-label">
                                        Map to an existing product in the Formulary catalogue (optional):
                                      </span>
                                      <AlgoliaProductPicker
                                        onProductSelect={(prod) => handleProductMapped(rxIdx, lineIdx, prod)}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pharmacist Review Notice (at submission stage) */}
                      <div className="review-assurance-footer-note">
                        <ShieldCheck size={15} className="text-blue-600 flex-shrink-0" />
                        <span>
                          Save as a draft to continue editing later, or submit for pharmacist review. Submitted prescriptions are verified by a compounding pharmacist within 24 hours before final approval.
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </StandardDrawer>

      {/* WhatsApp Quick Share Modal */}
      <ShareIntakeWhatsAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && (
        <div className="duplicate-modal-backdrop">
          <div className="duplicate-modal-card">
            <div className="duplicate-modal-header">
              <div className="duplicate-modal-icon">
                <ShieldAlert size={24} color="#d97706" />
              </div>
              <div>
                <h3 className="duplicate-modal-title">Potential Duplicate Prescription Detected</h3>
                <p className="duplicate-modal-desc">
                  {dupReason || 'An existing clinical record with matching Box ID, patient name, or prescription date was detected.'}
                </p>
              </div>
            </div>

            {existingCode && (
              <div className="duplicate-existing-details font-mono text-xs">
                <div><strong>Existing Code:</strong> {existingCode}</div>
                {existingPatient && <div><strong>Patient:</strong> {existingPatient}</div>}
                {existingDate && <div><strong>Registered Date:</strong> {existingDate}</div>}
                {existingBox && <div><strong>Box ID:</strong> {existingBox}</div>}
              </div>
            )}

            <div className="duplicate-modal-actions">
              {existingCode && (
                <button
                  type="button"
                  onClick={() => window.open(`/rx/${existingCode}`, '_blank')}
                  className="gcp-btn-secondary w-full justify-center"
                >
                  <Eye size={14} />
                  <span>View Existing Prescription Record</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleConfirmSave(true, pendingTargetStatus)}
                className="gcp-btn-primary w-full justify-center"
                style={{ backgroundColor: '#ea580c', borderColor: '#c2410c' }}
              >
                <Save size={14} />
                <span>{pendingTargetStatus === 'pending' ? 'Submit Anyway (Create Revision)' : 'Save Draft Anyway (Create Revision)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="gcp-btn-secondary w-full justify-center text-slate-500"
              >
                Cancel and Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Scoped Styling ── */}
      <style jsx>{`
        .prescription-intake-body {
          height: calc(100vh - 175px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        /* ── Stepper ── */
        .workflow-stepper-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0.85rem 1.5rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .step-node {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .step-node.active {
          color: #0f172a;
        }
        .step-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .step-node.active .step-circle {
          background: #0284c7;
          color: #ffffff;
        }
        .step-node.completed .step-circle {
          background: #16a34a;
          color: #ffffff;
        }
        .step-line {
          width: 36px;
          height: 2px;
          background: #e2e8f0;
        }
        .step-line.active {
          background: #0284c7;
        }

        /* ── Upload State: Centered ── */
        .upload-screen-centered {
          max-width: 620px;
          margin: 1.5rem auto;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
        }
        .brief-assurance-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.84rem;
          color: #1e40af;
          font-weight: 500;
        }
        .centered-dropzone-card {
          background: #ffffff;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .centered-dropzone-card:hover,
        .centered-dropzone-card.drag-active {
          border-color: #0284c7;
          background: #f0f9ff;
        }
        .upload-circle-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .upload-main-heading {
          font-size: 1.2rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.85rem 0;
        }
        .choose-file-btn {
          font-size: 0.88rem;
          padding: 9px 24px;
          border-radius: 6px;
          font-weight: 600;
          margin-bottom: 0.65rem;
          pointer-events: auto;
        }
        .upload-drag-text {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0 0 1.25rem 0;
        }
        .upload-specs-block {
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
          width: 100%;
          max-width: 440px;
        }
        .upload-examples {
          font-size: 0.78rem;
          color: #475569;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .upload-formats {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 500;
        }

        /* ── Inline Editable Review Inputs ── */
        .review-inline-input {
          width: 100%;
          padding: 5px 8px;
          font-size: 0.88rem;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          margin-top: 3px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .review-inline-input:focus,
        .review-inline-input-sm:focus,
        .review-inline-textarea:focus,
        .review-inline-dose-input:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
        }
        .review-inline-input-sm {
          padding: 3px 7px;
          font-size: 0.78rem;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
        }
        .review-inline-textarea {
          width: 100%;
          padding: 5px 8px;
          font-size: 0.78rem;
          color: #1e293b;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-family: inherit;
          resize: vertical;
        }
        .review-inline-dose-input {
          width: 110px;
          padding: 3px 7px;
          font-size: 0.74rem;
          font-weight: 600;
          color: #1d4ed8;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 4px;
        }

        /* ── Mobile Upload Secondary ── */
        .mobile-upload-bar {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.9rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .mobile-upload-heading {
          font-size: 0.85rem;
          font-weight: 650;
          color: #0f172a;
        }
        .mobile-upload-helper {
          font-size: 0.75rem;
          color: #64748b;
        }
        .mobile-share-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          padding: 6px 14px;
        }

        /* ── How Review Works ── */
        .how-review-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .how-review-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          color: #475569;
          gap: 8px;
        }
        .how-review-content {
          padding: 0.5rem 1.25rem 1.25rem 1.25rem;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .how-review-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.78rem;
          color: #475569;
          line-height: 1.45;
        }
        .how-num {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.68rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── Focused Single-Column Layout (For Clone / Renewal Mode) ── */
        .review-workspace-focused {
          display: flex;
          flex: 1;
          justify-content: center;
          padding: 1rem 1.25rem;
          overflow-y: auto;
          width: 100%;
        }
        .review-extracted-pane-full {
          max-width: 860px;
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        /* ── Clone Mode Header Badge ── */
        .clone-mode-header-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          margin: 0.75rem 1rem 0;
          font-size: 0.84rem;
          flex-wrap: wrap;
          gap: 8px;
        }
        .clone-mode-badge-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #166534;
          font-weight: 650;
        }
        .clone-source-pill {
          font-family: monospace;
          background: #dcfce7;
          color: #15803d;
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 0.76rem;
          border: 1px solid #bbf7d0;
        }
        .clone-formula-type {
          font-size: 0.78rem;
          color: #15803d;
          font-weight: 600;
          background: #ffffff;
          padding: 3px 9px;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }

        /* ── Renewal Target Selector Chips ── */
        .renewal-target-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .renewal-target-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .renewal-target-chip:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }
        .renewal-target-chip.active {
          border-color: #003666;
          background: #eff6ff;
          color: #003666;
          box-shadow: 0 0 0 1px #003666;
        }
        .renewal-privacy-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 0.81rem;
          color: #92400e;
          line-height: 1.4;
        }

        /* ── Review Workspace Split Layout ── */
        .review-workspace-split {
          display: flex;
          flex: 1;
          gap: 1rem;
          padding: 1rem;
          overflow: hidden;
        }
        @media (max-width: 860px) {
          .review-workspace-split {
            flex-direction: column;
            overflow-y: auto;
          }
        }

        /* Left Pane: Document */
        .review-document-pane {
          flex: 1 1 420px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          overflow: hidden;
        }
        .document-pane-header {
          padding: 0.65rem 1rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .document-file-identity {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: #334155;
          overflow: hidden;
        }
        .document-filename {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 220px;
        }
        .change-file-btn {
          border: none;
          background: transparent;
          color: #dc2626;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .document-preview-viewport {
          flex: 1;
          background: #e2e8f0;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pdf-preview-frame {
          width: 100%;
          height: 100%;
          border: none;
        }
        .image-preview-frame {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* Right Pane: Extracted Info */
        .review-extracted-pane {
          flex: 1 1 480px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          overflow-y: auto;
        }
        .extracted-pane-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .extracted-pane-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 750;
          color: #0f172a;
        }
        .extracted-pane-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          display: block;
          margin-top: 2px;
        }
        .classification-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
        }
        .fagron-badge {
          background: #fdf2f8;
          color: #be185d;
          border: 1px solid #fbcfe8;
        }
        .standard-badge {
          background: #eff6ff;
          color: #0284c7;
          border: 1px solid #bae6fd;
        }

        .extracted-pane-body {
          padding: 1.25rem;
          flex: 1;
        }

        .extraction-loading-state {
          text-align: center;
          padding: 4rem 1rem;
        }
        .loading-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .loading-subtitle {
          font-size: 0.82rem;
          color: #64748b;
          margin: 0;
        }

        .extraction-error-card {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
        }
        .error-card-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .error-card-title {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 700;
          color: #991b1b;
        }
        .error-card-message {
          margin: 4px 0 0 0;
          font-size: 0.8rem;
          color: #b91c1c;
        }
        .error-card-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        .retry-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
        }

        .review-sections-list {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        /* Duplicate Warning */
        .duplicate-alert-banner {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .duplicate-alert-content {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .duplicate-alert-title {
          font-size: 0.82rem;
          color: #92400e;
          font-weight: 650;
        }
        .duplicate-alert-code {
          font-size: 0.75rem;
          color: #b45309;
          margin-top: 2px;
        }
        .view-dup-btn {
          font-size: 0.76rem;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Clinical Safety */
        .clinical-safety-card {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 0.85rem 1rem;
        }
        .clinical-safety-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .clinical-safety-title {
          font-size: 0.82rem;
          font-weight: 750;
          color: #92400e;
        }
        .clinical-safety-list {
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .clinical-warning-item {
          font-size: 0.76rem;
          color: #78350f;
          line-height: 1.4;
        }

        /* Patient & Doctor Card */
        .patient-physician-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .patient-physician-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .card-section-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .patient-name-display {
          margin: 2px 0 0 0;
          font-size: 0.98rem;
          color: #0f172a;
          font-weight: 750;
        }
        .patient-dob-text {
          font-size: 0.75rem;
          color: #64748b;
          display: block;
        }
        .doctor-name-display {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.88rem;
          font-weight: 650;
          color: #0f172a;
          margin-top: 2px;
        }
        .doctor-license-text {
          font-size: 0.72rem;
          color: #64748b;
          display: block;
        }
        .patient-linking-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 0.5rem;
          border-top: 1px solid #e2e8f0;
        }
        .patient-linking-label {
          font-size: 0.78rem;
          color: #475569;
          cursor: pointer;
        }

        /* Fagron Card */
        .fagron-genetics-card {
          background: #fdf2f8;
          border: 1px solid #fbcfe8;
          border-radius: 8px;
          padding: 0.85rem 1rem;
        }
        .fagron-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .fagron-box-title {
          font-weight: 750;
          font-size: 0.82rem;
          color: #be185d;
        }
        .fagron-report-date {
          font-size: 0.75rem;
          color: #9d174d;
          display: block;
          margin-top: 2px;
        }
        .fagron-biomarkers-row {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 6px;
        }
        .fagron-biomarker-chip {
          padding: 2px 6px;
          background: #ffffff;
          color: #9d174d;
          border: 1px solid #f472b6;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        /* Formulations Container */
        .formulations-container {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .formulations-count-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .formulations-header-label {
          font-size: 0.76rem;
          font-weight: 750;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .formulations-header-sub {
          font-size: 0.72rem;
          color: #64748b;
        }

        .formulation-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .formulation-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.65rem;
        }
        .formulation-title {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 750;
          color: #0f172a;
        }
        .formulation-volume {
          font-size: 0.74rem;
          color: #64748b;
          display: block;
        }
        .validation-status-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .status-ready {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .status-review {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .posology-quote-box {
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border-left: 3px solid #0284c7;
          border-radius: 4px;
          font-size: 0.78rem;
          color: #334155;
          margin-bottom: 0.75rem;
          font-style: italic;
        }

        .ingredients-lines-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .ingredient-line-item {
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .placeholder-item {
          background: #fffdfa;
          border-color: #fed7aa;
        }
        .ingredient-line-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .ingredient-identity {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ingredient-name {
          font-weight: 650;
          font-size: 0.82rem;
          color: #0f172a;
        }
        .ingredient-meta-badges {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .dose-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          background: #eff6ff;
          color: #1d4ed8;
        }
        .catalog-badge {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .catalog-verified {
          background: #dcfce7;
          color: #15803d;
        }
        .catalog-placeholder {
          background: #ffedd5;
          color: #9a3412;
        }
        .mapping-picker-wrapper {
          margin-top: 0.35rem;
          padding-top: 0.4rem;
          border-top: 1px dashed #fed7aa;
        }
        .mapping-picker-label {
          font-size: 0.7rem;
          color: #9a3412;
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .review-assurance-footer-note {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: #475569;
          margin-top: 0.5rem;
        }

        /* ── Saved Confirmation ── */
        .saved-confirmation-container {
          max-width: 800px;
          margin: 1.5rem auto;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
        }
        .saved-confirmation-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .saved-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #16a34a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .saved-heading-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .saved-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #14532d;
        }
        .saved-badge {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .saved-description {
          margin: 6px 0 0 0;
          font-size: 0.85rem;
          color: #166534;
          line-height: 1.45;
        }
        .saved-cards-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .saved-item-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .saved-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .saved-patient-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .saved-patient-name {
          font-weight: 750;
          font-size: 0.95rem;
          color: #0f172a;
        }
        .saved-patient-meta {
          font-size: 0.78rem;
          color: #64748b;
        }
        .draft-pill {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .saved-item-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 8px;
          border-top: 1px dashed #e2e8f0;
        }

        /* ── Duplicate Modal ── */
        .duplicate-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
        }
        .duplicate-modal-card {
          background: #ffffff;
          border-radius: 14px;
          max-width: 500px;
          width: 100%;
          padding: 1.5rem;
          border: 1px solid #fed7aa;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .duplicate-modal-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .duplicate-modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .duplicate-modal-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 750;
          color: #0f172a;
        }
        .duplicate-modal-desc {
          margin: 3px 0 0 0;
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.4;
        }
        .duplicate-existing-details {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          color: #334155;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .duplicate-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </>
  );
}

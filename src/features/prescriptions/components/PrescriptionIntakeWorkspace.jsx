"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, CheckCircle2, Activity, AlertCircle, Save, FileText,
  Beaker, Sparkles, ExternalLink, RefreshCw, UserCheck, ShieldAlert,
  Calendar, Stethoscope, Dna, Info, Copy, Check, ArrowRight, Phone,
  FileSpreadsheet, Eye, Clock
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

export default function PrescriptionIntakeWorkspace({ isOpen, onClose, onSaveSuccess }) {
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [rawAiData, setRawAiData] = useState(null);
  const [normalizedRxList, setNormalizedRxList] = useState([]);
  const [alsoCreatePatient, setAlsoCreatePatient] = useState(true);
  const [groupIntoSession, setGroupIntoSession] = useState(true);
  const [savedPrescriptionsResult, setSavedPrescriptionsResult] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

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
      toast.loading('Extracting prescription data with Atlas Clinical AI...', { id: 'ai-intake' });
      
      // 1. Multimodal Gemini extraction
      const aiData = await extractPrescriptionFromDocument(droppedFile);
      setRawAiData(aiData);

      // 2. Normalize to canonical schema & resolve catalog ingredients
      toast.loading('Matching ingredients against clinical pharmacopeia...', { id: 'ai-intake' });
      const normalized = await normalizeExtractedPrescriptions(aiData, {
        currentUser: user,
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
      let rawMsg = String(err?.message || '');
      let cleanMsg = 'Error analyzing prescription with Atlas AI';

      if (/503|UNAVAILABLE|high demand|saturad|peak demand|capacity|spikes in demand|temporarily|busy/i.test(rawMsg)) {
        cleanMsg = 'Atlas AI service is temporarily experiencing high demand. Please retry in a few moments.';
      } else if (rawMsg && !rawMsg.startsWith('{')) {
        cleanMsg = rawMsg;
      }

      setError(cleanMsg);
      toast.error(cleanMsg, { id: 'ai-intake' });
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted.length > 0 && handleProcessFile(accepted[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: isProcessing
  });

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
    toast.success('Online prescription dossier link copied to clipboard ✓');
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

  // Save directly to Firestore using canonical schema
  const handleConfirmSave = async (overrideDuplicate = false) => {
    if (!normalizedRxList.length) {
      toast.error('No prescriptions available to save.');
      return;
    }

    const hasDups = normalizedRxList.some(r => r._dupStatus === 'duplicate');
    if (hasDups && !overrideDuplicate) {
      setShowDuplicateModal(true);
      return;
    }

    setIsSaving(true);
    setShowDuplicateModal(false);
    try {
      toast.loading('Registering prescriptions in Atlas clinical database...', { id: 'save-intake' });
      
      const result = await savePrescriptionsToFirestore(normalizedRxList, {
        alsoCreatePatient,
        currentUser: user,
        overrideDuplicate,
      });

      if (result.errors?.length > 0) {
        toast.error(`Saved with advisories: ${result.errors[0]}`, { id: 'save-intake' });
      } else {
        toast.success(`Successfully saved ${result.savedCount} prescription(s)!`, { id: 'save-intake' });
      }

      onSaveSuccess && onSaveSuccess(result.savedIds);

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
      initialNotes: `Importado con IA desde archivo: ${rawAiData?._fileName || 'Prescripción'}`
    });
  };

  const isFagron = rawAiData?.documentType === 'FagronGenomics' || rawAiData?.fagronDetails?.isFagron;
  const hasDuplicates = normalizedRxList.some(r => r._dupStatus === 'duplicate');
  const duplicateItem = normalizedRxList.find(r => r._dupStatus === 'duplicate');
  const existingCode = duplicateItem?._existingData?.prescriptionNumber || duplicateItem?._existingData?.code || duplicateItem?._existingId;
  const existingPatient = duplicateItem?._existingData?.patientName || duplicateItem?._existingData?.patient?.name;
  const existingDate = duplicateItem?._existingData?.reportDate || duplicateItem?._existingData?.prescriptionDate;
  const existingBox = duplicateItem?._existingData?.fagron?.boxId || duplicateItem?._existingData?.boxId;
  const dupReason = duplicateItem?._duplicateReason;

  const clinicalValidation = React.useMemo(() => {
    return validatePrescriptionClinicalRules(normalizedRxList);
  }, [normalizedRxList]);

  return (
    <>
      <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="AI Clinical Prescription Intake Workspace"
      subtitle="Upload printed clinic orders, handwritten doctor prescriptions, or Fagron Genomics reports. Atlas AI extracts molecules, dosages, and posology with two-phase clinical verification."
      width="90vw"
      footer={
        savedPrescriptionsResult ? (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="gcp-btn-secondary"
              onClick={handleResetForNewUpload}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={14} />
              <span>Import Another Prescription</span>
            </button>
            <button
              type="button"
              className="gcp-btn-primary"
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center' }}
            >
              <span>View in Prescriptions Table</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="gcp-btn-secondary" onClick={onClose}>Cancel</button>
              {normalizedRxList.length > 0 && (
                <>
                  <button
                    className="gcp-btn-secondary"
                    onClick={handleOpenInBuilder}
                    disabled={isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={15} />
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
                    <FileSpreadsheet size={15} color="#15803d" />
                    <span>Export to Excel</span>
                  </button>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="gcp-btn-primary"
                onClick={handleConfirmSave}
                disabled={!normalizedRxList.length || isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="spin-slow" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Prescription (Draft)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )
      }
    >
      <div style={{
        padding: '1rem',
        height: 'calc(100vh - 170px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        overflowY: 'auto'
      }}>
        {savedPrescriptionsResult ? (
          <div style={{ width: '100%', maxWidth: '840px', margin: '0 auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Two-Phase Intake Header Banner */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '1.4rem 1.6rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)'
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Clock size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#92400e' }}>
                    Formulation Registered in Draft Mode
                  </h3>
                  <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                    ⏳ Validation SLA: ~24 Hours
                  </span>
                </div>
                <p style={{ margin: '6px 0 12px 0', fontSize: '0.86rem', color: '#78350f', lineHeight: 1.5 }}>
                  The prescription has been digitally parsed and saved in <strong>Draft Mode</strong>. The <strong>Atlas AI Clinical Pharmacotherapy</strong> team is verifying molecular conversions, vehicle compatibility, and dosages. Once verified (typically within 24 hours), the prescription will be marked as <strong>Authorized</strong> in your official dispensary repository.
                </p>

                {/* 2-Phase Stepper Tracker */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>✓</div>
                    <div>
                      <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#166534' }}>Phase 1: Digital Ingestion</div>
                      <div style={{ fontSize: '0.70rem', color: '#15803d' }}>Document extracted & classified</div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>2</div>
                    <div>
                      <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#92400e' }}>Phase 2: Atlas Pharmacist QA</div>
                      <div style={{ fontSize: '0.70rem', color: '#b45309' }}>In progress · Molecular QA (~24h SLA)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List of saved prescriptions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {savedPrescriptionsResult.map((saved, idx) => (
                <div
                  key={saved.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>💊</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                          {saved.patientName} • {saved.treatmentType}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {saved.lineCount} formulated ingredients • Official Code: <code style={{ color: '#003666', fontWeight: 800 }}>{saved.prescriptionNumber}</code>
                        </div>
                      </div>
                    </div>

                    <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> Draft · Under Atlas AI Review (24h)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                    <a
                      href={saved.rxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gcp-btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 16px',
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>View Online Prescription ({saved.prescriptionNumber})</span>
                    </a>

                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      onClick={() => handleCopyRxUrl(saved.rxUrl, saved.prescriptionNumber)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        fontSize: '0.82rem',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}
                    >
                      {copiedUrl === saved.prescriptionNumber ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      <span>{copiedUrl === saved.prescriptionNumber ? 'Link Copied ✓' : 'Copy Patient Direct Link'}</span>
                    </button>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hello ${saved.patientName}, here is your official digitized medical prescription with validated clinical access:\n\n🔗 ${typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com'}${saved.rxUrl}\n\nVerification Code: ${saved.prescriptionNumber}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gcp-btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        fontSize: '0.82rem',
                        borderRadius: '6px',
                        fontWeight: 700,
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
        ) : (
          <>
            {/* LEFT PANE: Document Preview / Dropzone */}
            <div style={{
              flex: '1 1 360px',
          minHeight: '350px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--surface-border, #e2e8f0)',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'var(--surface-ground, #f8fafc)'
        }}>
          {!filePreview ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Two-Phase Clinical Verification Protocol Banner */}
              <div style={{
                margin: '1rem 1rem 0',
                padding: '0.85rem 1rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={15} color="#1a73e8" />
                    <span>Two-Phase Clinical Assurance Protocol</span>
                  </span>
                  <span style={{ fontSize: '0.70rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '1px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    24h Pharmacist QA SLA
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '6px', marginTop: '2px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px 8px', fontSize: '0.73rem', color: '#334155' }}>
                    <strong style={{ color: '#1a73e8' }}>Phase 1 · Instant Ingestion:</strong> AI extracts molecules & registers a structured Draft.
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px 8px', fontSize: '0.73rem', color: '#334155' }}>
                    <strong style={{ color: '#d97706' }}>Phase 2 · Pharmacist QA:</strong> Atlas compounding pharmacists verify excipients & posology.
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Mobile Share Banner */}
              <div style={{
                margin: '0.75rem 1rem 0',
                padding: '0.65rem 1rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                    Prefer patient or doctor to upload directly from mobile?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Phone size={12} />
                  <span>Send Mobile Upload Link via WhatsApp</span>
                </button>
              </div>

              {/* Universal Multi-Format Dropzone */}
              <div
                {...getRootProps()}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.75rem 1.25rem',
                  border: `2px dashed ${isDragActive ? '#3b82f6' : '#cbd5e1'}`,
                  margin: '0.75rem 1rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: isDragActive ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <input {...getInputProps()} />
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '50%',
                  marginBottom: '0.75rem',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.1)'
                }}>
                  <Upload size={32} />
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                  {isDragActive ? 'Drop prescription file here...' : 'Drag & drop prescription document here'}
                </p>
                <p style={{ margin: '0.35rem 0 0.75rem', fontSize: '0.80rem', color: '#64748b', maxWidth: '380px', lineHeight: 1.45 }}>
                  Universal AI intake: parses printed hospital orders, handwritten doctor notes, Fagron Genomics reports, and compounding worksheets.
                </p>

                {/* Multi-format Pill Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flexWrap: 'wrap', maxWidth: '420px', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.67rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 7px', borderRadius: '12px' }}>
                    📄 Hospital & Clinic EMR / EHR
                  </span>
                  <span style={{ fontSize: '0.67rem', fontWeight: 600, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 7px', borderRadius: '12px' }}>
                    ✍️ Handwritten Doctor Rx
                  </span>
                  <span style={{ fontSize: '0.67rem', fontWeight: 600, background: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8', padding: '2px 7px', borderRadius: '12px' }}>
                    🧬 Fagron Genomics Panels
                  </span>
                  <span style={{ fontSize: '0.67rem', fontWeight: 600, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 7px', borderRadius: '12px' }}>
                    🧪 Compounding Formulas
                  </span>
                  <span style={{ fontSize: '0.67rem', fontWeight: 600, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 7px', borderRadius: '12px' }}>
                    📸 PDF · JPG · PNG
                  </span>
                </div>

                <button
                  type="button"
                  className="gcp-btn-secondary"
                  style={{ fontSize: '0.82rem', pointerEvents: 'none' }}
                >
                  Browse Files on Device
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                  {file?.name || 'Documento cargado'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                    setNormalizedRxList([]);
                    setRawAiData(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <X size={14} /> Cambiar archivo
                </button>
              </div>

              <div style={{ flex: 1, position: 'relative', backgroundColor: '#e2e8f0' }}>
                {file?.type === 'application/pdf' ? (
                  <iframe
                    src={`${filePreview}#toolbar=0`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Previsualización PDF"
                  />
                ) : (
                  <img
                    src={filePreview}
                    alt="Previsualización de Prescripción"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: AI Extraction & Canonical Mapping */}
        <div style={{
          flex: '1 1 440px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--surface-border, #e2e8f0)',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                color: '#fff',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Extracción Atlas AI
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Motor Gemini 2.5 Flash con validación canónica
                </span>
              </div>
            </div>

            {rawAiData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  backgroundColor: isFagron ? '#fdf2f8' : '#eff6ff',
                  color: isFagron ? '#db2777' : '#2563eb',
                  border: `1px solid ${isFagron ? '#fbcfe8' : '#bfdbfe'}`,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {isFagron ? `✦ Fagron ${rawAiData.fagronDetails?.testName || 'Genomics'}` : '✦ Receta Estándar'}
                </span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div style={{ padding: '1.25rem', flex: 1 }}>
            {!file ? (
              <div style={{ textAlign: 'center', color: '#64748b', marginTop: '5rem' }}>
                <FileText size={48} opacity={0.25} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600, margin: 0, color: '#334155' }}>Upload a prescription document to begin</p>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.35rem', maxWidth: '340px', margin: '0.35rem auto 0', lineHeight: 1.45 }}>
                  Atlas AI automatically classifies printed hospital EMRs, handwritten prescriptions, or Fagron genomics panels.
                </p>
              </div>
            ) : isProcessing ? (
              <div style={{ textAlign: 'center', color: '#2563eb', marginTop: '4rem' }}>
                <Activity size={44} className="spin-slow" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0, color: '#0f172a' }}>
                  Extracting clinical data & active ingredients...
                </p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Identifying molecules, concentrations, and posology with multimodal clinical vision AI.
                </p>
              </div>
            ) : error ? (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <AlertCircle size={20} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Processing Error</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{error}</p>
                </div>
              </div>
            ) : normalizedRxList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Duplication Warning */}
                {hasDuplicates && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <ShieldAlert size={20} color="#d97706" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.84rem', color: '#92400e', fontWeight: 600 }}>
                          Potential Duplicate Detected: {dupReason || 'A record with identical Box ID or Patient + Date already exists in the registry.'}
                        </div>
                        {existingCode && (
                          <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '2px' }}>
                            Existing prescription: <strong>{existingCode}</strong> {existingPatient ? `(${existingPatient})` : ''} {existingDate ? `— ${existingDate}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    {existingCode && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="gcp-btn-secondary"
                          onClick={() => window.open(`/rx/${existingCode}`, '_blank')}
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={13} />
                          <span>View Existing</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Clinical Validation & Interaction Alerts */}
                {clinicalValidation.warnings.length > 0 && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} color="#d97706" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                        Clinical Safety Validations ({clinicalValidation.warnings.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '1.5rem' }}>
                      {clinicalValidation.warnings.map((w, idx) => (
                        <div key={idx} style={{ fontSize: '0.78rem', color: '#78350f', lineHeight: 1.4 }}>
                          <strong>• {w.title}:</strong> {w.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient & Doctor Card */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                        Patient Profile
                      </span>
                      <h4 style={{ margin: '0.1rem 0 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                        {normalizedRxList[0]?.patientName || 'Unknown Patient'}
                      </h4>
                      {rawAiData?.patient?.dob && (
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          DOB: {rawAiData.patient.dob} {rawAiData.patient.gender ? `(${rawAiData.patient.gender})` : ''}
                        </span>
                      )}
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                        Prescribing Physician
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                        <Stethoscope size={14} color="#64748b" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                          {normalizedRxList[0]?.doctorName || 'Unspecified Physician'}
                        </span>
                      </div>
                      {normalizedRxList[0]?.doctorLicense && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Lic/Reg: {normalizedRxList[0].doctorLicense}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Auto-create patient option */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <input
                      type="checkbox"
                      id="autoCreatePatient"
                      checked={alsoCreatePatient}
                      onChange={(e) => setAlsoCreatePatient(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="autoCreatePatient" style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer', margin: 0 }}>
                      Automatically link or register patient profile in Atlas Clinical CRM
                    </label>
                  </div>
                </div>

                {/* Fagron Genetics Summary Card */}
                {isFagron && rawAiData?.fagronDetails && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#fdf2f8',
                    border: '1px solid #fbcfe8',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#be185d' }}>
                      <Dna size={16} />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Fagron Genomics Details (BOX: {rawAiData.fagronDetails.boxId || 'N/A'})
                      </span>
                    </div>
                    {rawAiData.fagronDetails.reportDate && (
                      <span style={{ fontSize: '0.78rem', color: '#9d174d' }}>
                        Report Date: {rawAiData.fagronDetails.reportDate}
                      </span>
                    )}
                    {rawAiData.fagronDetails.geneticBiomarkers?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                        {rawAiData.fagronDetails.geneticBiomarkers.map((b, i) => (
                          <span key={i} style={{
                            padding: '2px 6px',
                            backgroundColor: '#ffffff',
                            color: '#9d174d',
                            border: '1px solid #f472b6',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}>
                            {b.gene}: {b.variant || b.interpretation}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Formulations & Prescription Lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Compounded Formulations ({normalizedRxList.length})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {normalizedRxList.reduce((sum, r) => sum + (r.prescriptionLines?.length || 0), 0)} active pharmaceutical ingredients
                    </span>
                  </div>

                  {normalizedRxList.map((rxItem, rxIdx) => (
                    <div
                      key={rxIdx}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1rem',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                            {rxItem.treatmentType || `Formulation ${rxIdx + 1}`}
                          </h4>
                          {rxItem.volume && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Volume / Delivery: {rxItem.volume} {rxItem.dispensingForm ? `(${rxItem.dispensingForm})` : ''}
                            </span>
                          )}
                        </div>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: rxItem.validationStatus === 'Ready' ? '#f0fdf4' : '#fffbeb',
                          color: rxItem.validationStatus === 'Ready' ? '#166534' : '#92400e',
                          border: `1px solid ${rxItem.validationStatus === 'Ready' ? '#bbf7d0' : '#fde68a'}`
                        }}>
                          {rxItem.validationStatus === 'Ready' ? '✓ Ready to Prescribe' : '⚠ Catalogue Review Required'}
                        </span>
                      </div>

                      {/* Posology sentence */}
                      {rxItem.posology && (
                        <div style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          borderLeft: '3px solid #3b82f6',
                          fontSize: '0.8rem',
                          color: '#334155',
                          marginBottom: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          "{rxItem.posology}"
                        </div>
                      )}

                      {/* Lines List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {rxItem.prescriptionLines.map((line, lineIdx) => (
                          <div
                            key={line.id || lineIdx}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              backgroundColor: line._isPlaceholder ? '#fffdfa' : '#f8fafc',
                              border: `1px solid ${line._isPlaceholder ? '#fed7aa' : '#e2e8f0'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Beaker size={14} color={line._isPlaceholder ? "#ea580c" : "#2563eb"} />
                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                                  {line.productName || line.activeIngredient}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                {line.dose && (
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#eff6ff',
                                    color: '#1d4ed8'
                                  }}>
                                    {line.dose}
                                  </span>
                                )}
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: line._isPlaceholder ? '#ffedd5' : '#dcfce7',
                                  color: line._isPlaceholder ? '#9a3412' : '#15803d'
                                }}>
                                  {line._isPlaceholder ? 'Placeholder Active' : 'Verified in Catalogue'}
                                </span>
                              </div>
                            </div>

                            {/* Option to re-map if placeholder */}
                            {line._needsProductMapping && (
                              <div style={{ marginTop: '0.25rem', paddingTop: '0.4rem', borderTop: '1px dashed #fed7aa' }}>
                                <span style={{ fontSize: '0.72rem', color: '#9a3412', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
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

              </div>
            ) : null}
          </div>
        </div>
      </>
    )}
      </div>
    </StandardDrawer>

    <ShareIntakeWhatsAppModal
      isOpen={isShareModalOpen}
      onClose={() => setIsShareModalOpen(false)}
    />

    {/* Duplicate Confirmation Modal */}
    {showDuplicateModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '1.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #fed7aa',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldAlert size={24} color="#d97706" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                Potential Duplicate Prescription Detected
              </h3>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.45 }}>
                {dupReason || 'An existing clinical record with matching Box ID, patient name, or prescription date was detected.'}
              </p>
            </div>
          </div>

          {existingCode && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              fontSize: '0.82rem',
              color: '#334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div><strong>Existing Code:</strong> <span style={{ fontFamily: 'monospace' }}>{existingCode}</span></div>
              {existingPatient && <div><strong>Patient:</strong> {existingPatient}</div>}
              {existingDate && <div><strong>Registered Date:</strong> {existingDate}</div>}
              {existingBox && <div><strong>Box ID:</strong> {existingBox}</div>}
            </div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginTop: '0.5rem'
          }}>
            {existingCode && (
              <button
                type="button"
                onClick={() => window.open(`/rx/${existingCode}`, '_blank')}
                className="gcp-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  width: '100%'
                }}
              >
                <Eye size={15} />
                <span>View Existing Prescription Record</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleConfirmSave(true)}
              className="gcp-btn-primary"
              style={{
                backgroundColor: '#ea580c',
                borderColor: '#c2410c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                width: '100%',
                color: '#ffffff',
                fontWeight: 600
              }}
            >
              <Save size={15} />
              <span>Import Anyway (Create Revision / New Intake)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDuplicateModal(false)}
              className="gcp-btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.55rem 1rem',
                width: '100%',
                color: '#64748b'
              }}
            >
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

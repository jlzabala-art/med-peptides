"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, CheckCircle2, Activity, AlertCircle, Save, FileText,
  Beaker, Sparkles, ExternalLink, RefreshCw, UserCheck, ShieldAlert,
  Calendar, Stethoscope, Dna, Info
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import StandardDrawer from '../../../components/ui/StandardDrawer';
import AlgoliaProductPicker from '../../../components/admin/protocols/tabs/AlgoliaProductPicker';
import toast from 'react-hot-toast';
import { useDrawer } from '../../../context/DrawerContext';
import {
  extractPrescriptionFromDocument,
  normalizeExtractedPrescriptions,
  checkDuplicatesInFirestore,
  savePrescriptionsToFirestore,
  validatePrescriptionClinicalRules
} from '../../../services/prescriptionAiService';

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
      toast.loading('Analizando prescripción con Gemini AI...', { id: 'ai-intake' });
      
      // 1. Multimodal Gemini extraction
      const aiData = await extractPrescriptionFromDocument(droppedFile);
      setRawAiData(aiData);

      // 2. Normalize to canonical schema & resolve catalog ingredients
      toast.loading('Mapeando fármacos contra catálogo...', { id: 'ai-intake' });
      const normalized = await normalizeExtractedPrescriptions(aiData, {
        currentUser: user,
      });

      // 3. Deduplicate against Firestore
      const deduplicated = await checkDuplicatesInFirestore(normalized);
      setNormalizedRxList(deduplicated);

      toast.success(
        `Extracción completada (${deduplicated.length} ${deduplicated.length === 1 ? 'prescripción' : 'formulaciones'})`,
        { id: 'ai-intake' }
      );
    } catch (err) {
      console.error('[PrescriptionIntakeWorkspace] Error:', err);
      setError(err.message || 'Error al analizar el documento con IA');
      toast.error(`Error: ${err.message}`, { id: 'ai-intake' });
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
    toast.success(`Ingrediente vinculado a: ${selectedProduct.name}`);
  };

  // Save directly to Firestore using canonical schema
  const handleConfirmSave = async () => {
    if (!normalizedRxList.length) {
      toast.error('No hay prescripciones para guardar.');
      return;
    }

    setIsSaving(true);
    try {
      toast.loading('Guardando prescripciones en Firestore...', { id: 'save-intake' });
      
      const result = await savePrescriptionsToFirestore(normalizedRxList, {
        alsoCreatePatient,
        currentUser: user,
      });

      if (result.errors?.length > 0) {
        toast.error(`Guardado parcial con advertencias: ${result.errors[0]}`, { id: 'save-intake' });
      } else {
        toast.success(`¡${result.savedCount} prescripción(es) guardadas con éxito!`, { id: 'save-intake' });
      }

      onSaveSuccess && onSaveSuccess(result.savedIds);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(`Error al guardar: ${err.message}`, { id: 'save-intake' });
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
  const clinicalValidation = React.useMemo(() => {
    return validatePrescriptionClinicalRules(normalizedRxList);
  }, [normalizedRxList]);

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Prescripción con IA"
      subtitle="Sube una receta médica o informe Fagron Genomics (PDF/Imagen). Atlas AI extraerá y validará los datos clínicos automáticamente."
      width="90vw"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="gcp-btn-secondary" onClick={onClose}>Cancelar</button>
            {normalizedRxList.length > 0 && (
              <button
                className="gcp-btn-secondary"
                onClick={handleOpenInBuilder}
                disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={15} />
                <span>Abrir en Creador de Recetas</span>
              </button>
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
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Guardar Prescripción</span>
                </>
              )}
            </button>
          </div>
        </div>
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
            <div
              {...getRootProps()}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 1.5rem',
                border: `2px dashed ${isDragActive ? '#3b82f6' : '#cbd5e1'}`,
                margin: '1rem',
                borderRadius: '12px',
                backgroundColor: isDragActive ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <input {...getInputProps()} />
              <div style={{
                padding: '1.25rem',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderRadius: '50%',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(37,99,235,0.1)'
              }}>
                <Upload size={36} />
              </div>
              <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>
                {isDragActive ? 'Suelta el documento aquí...' : 'Arrastra y suelta la prescripción aquí'}
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#64748b', maxWidth: '280px' }}>
                Soporta archivos <strong>PDF</strong>, <strong>JPG</strong>, <strong>PNG</strong> de clínicas o informes <strong>Fagron Genomics</strong>.
              </p>
              <button
                type="button"
                className="gcp-btn-secondary"
                style={{ marginTop: '1.25rem', fontSize: '0.85rem', pointerEvents: 'none' }}
              >
                Seleccionar archivo del equipo
              </button>
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
                <p style={{ fontWeight: 500, margin: 0 }}>Carga un documento para comenzar</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Atlas AI identificará automáticamente si es una receta médica estándar o un informe Fagron.
                </p>
              </div>
            ) : isProcessing ? (
              <div style={{ textAlign: 'center', color: '#2563eb', marginTop: '4rem' }}>
                <Activity size={44} className="spin-slow" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0, color: '#0f172a' }}>
                  Extrayendo datos clínicos...
                </p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Identificando principios activos, concentraciones y posología con IA multimodal.
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
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Error de procesamiento</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{error}</p>
                </div>
              </div>
            ) : normalizedRxList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Duplication Warning */}
                {hasDuplicates && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}>
                    <ShieldAlert size={18} color="#d97706" />
                    <span style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>
                      Advertencia: Ya existe una prescripción con este Box ID o paciente/fecha en Firestore.
                    </span>
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
                        Validaciones Clínicas de Seguridad ({clinicalValidation.warnings.length})
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
                        Paciente
                      </span>
                      <h4 style={{ margin: '0.1rem 0 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                        {normalizedRxList[0]?.patientName || 'Paciente desconocido'}
                      </h4>
                      {rawAiData?.patient?.dob && (
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Nacimiento: {rawAiData.patient.dob} {rawAiData.patient.gender ? `(${rawAiData.patient.gender})` : ''}
                        </span>
                      )}
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                        Médico / Prescriptor
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                        <Stethoscope size={14} color="#64748b" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                          {normalizedRxList[0]?.doctorName || 'Médico no especificado'}
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
                      Vincular o registrar automáticamente el perfil del paciente en el CRM
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
                        Detalles Fagron Genomics (BOX: {rawAiData.fagronDetails.boxId || 'N/A'})
                      </span>
                    </div>
                    {rawAiData.fagronDetails.reportDate && (
                      <span style={{ fontSize: '0.78rem', color: '#9d174d' }}>
                        Fecha del Informe: {rawAiData.fagronDetails.reportDate}
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
                      Formulaciones ({normalizedRxList.length})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {normalizedRxList.reduce((sum, r) => sum + (r.prescriptionLines?.length || 0), 0)} principios activos totales
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
                            {rxItem.treatmentType || `Formulación ${rxIdx + 1}`}
                          </h4>
                          {rxItem.volume && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Volumen/Presentación: {rxItem.volume} {rxItem.dispensingForm ? `(${rxItem.dispensingForm})` : ''}
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
                          {rxItem.validationStatus === 'Ready' ? '✓ Listo para Prescribir' : '⚠ Revisión de Catálogo'}
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
                                  {line._isPlaceholder ? 'Placeholder' : 'En Catálogo'}
                                </span>
                              </div>
                            </div>

                            {/* Option to re-map if placeholder */}
                            {line._needsProductMapping && (
                              <div style={{ marginTop: '0.25rem', paddingTop: '0.4rem', borderTop: '1px dashed #fed7aa' }}>
                                <span style={{ fontSize: '0.72rem', color: '#9a3412', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                                  Mapear a un producto existente del catálogo (opcional):
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

      </div>
    </StandardDrawer>
  );
}

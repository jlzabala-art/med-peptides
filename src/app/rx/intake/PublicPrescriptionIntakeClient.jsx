"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Upload, X, CheckCircle2, AlertCircle, Save, FileText,
  Sparkles, ExternalLink, RefreshCw, User, Stethoscope,
  Dna, Info, Copy, Check, ArrowRight, Share2, Phone,
  ShieldCheck, HelpCircle, ArrowLeft, Download, Plus, Search,
  Activity, Clock, Calendar, Beaker
} from '@/lib/icons';
import toast from 'react-hot-toast';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import AlgoliaProductPicker from '@/components/admin/protocols/tabs/AlgoliaProductPicker';
import {
  extractPrescriptionFromDocument,
  normalizeExtractedPrescriptions,
  validatePrescriptionClinicalRules
} from '@/services/prescriptionAiService';
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
  const [lang, setLang] = useState('es');
  const isEs = lang === 'es';

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [rawAiData, setRawAiData] = useState(null);
  const [normalizedRxList, setNormalizedRxList] = useState([]);
  const [activeMappingTarget, setActiveMappingTarget] = useState(null); // { rxIdx, lineIdx }
  const [savedPrescriptionsResult, setSavedPrescriptionsResult] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);

  const qrRef = useRef(null);

  // File Upload and AI Analysis
  const handleProcessFile = useCallback(async (droppedFile) => {
    if (!droppedFile) return;
    setFile(droppedFile);
    setIsProcessing(true);
    setError(null);
    setNormalizedRxList([]);
    setRawAiData(null);
    setSavedPrescriptionsResult(null);

    // Create local preview if image
    if (droppedFile.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(droppedFile));
    } else {
      setFilePreview(null);
    }

    try {
      setProcessingStep(isEs ? 'Analizando documento con Gemini AI Multimodal...' : 'Analyzing document with Multimodal Gemini AI...');
      toast.loading(isEs ? 'Analizando prescripción con Gemini AI...' : 'Analyzing prescription with Gemini AI...', { id: 'ai-public-intake' });
      
      // 1. Multimodal AI Extraction
      const aiData = await extractPrescriptionFromDocument(droppedFile);
      setRawAiData(aiData);

      // 2. Normalize and Catalog Mapping
      setProcessingStep(isEs ? 'Mapeando fármacos y fórmulas magistrales contra catálogo...' : 'Resolving active ingredients against clinical catalog...');
      const normalized = await normalizeExtractedPrescriptions(aiData, {
        currentUser: null,
      });

      setNormalizedRxList(normalized);

      toast.success(
        isEs 
          ? `Extracción completada (${normalized.length} ${normalized.length === 1 ? 'fórmula' : 'formulaciones'})` 
          : `Extraction completed (${normalized.length} formulations)`,
        { id: 'ai-public-intake' }
      );
    } catch (err) {
      console.error('[PublicPrescriptionIntake] Error:', err);
      const msg = err.message || (isEs ? 'Error al procesar el archivo con IA' : 'Failed to process document with AI');
      setError(msg);
      toast.error(msg, { id: 'ai-public-intake' });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  }, [isEs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted.length > 0 && handleProcessFile(accepted[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: isProcessing
  });

  // Re-map an individual line item to an Algolia product
  const handleProductMapped = (rxIndex, lineIndex, selectedProduct) => {
    setNormalizedRxList(prev => {
      const copy = [...prev];
      const rx = { ...copy[rxIndex] };
      const lines = [...(rx.prescriptionLines || rx.items || [])];
      
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
      
      copy[rxIndex] = rx;
      return copy;
    });
    setActiveMappingTarget(null);
    toast.success(isEs ? `Ingrediente vinculado a: ${selectedProduct.name}` : `Ingredient mapped to: ${selectedProduct.name}`);
  };

  // Save to Firestore via server API
  const handleConfirmSave = async () => {
    if (!normalizedRxList.length) {
      toast.error(isEs ? 'No hay prescripciones para guardar.' : 'No prescriptions to save.');
      return;
    }

    setIsSaving(true);
    try {
      toast.loading(isEs ? 'Guardando prescripción oficial...' : 'Saving official prescription...', { id: 'save-pub-intake' });
      
      const res = await fetch('/api/prescriptions/public-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptions: normalizedRxList,
          createPatientRecord: true,
          source: 'public_portal_upload',
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save prescription');
      }

      toast.success(
        isEs ? `¡Prescripción digitalizada y verificada con éxito!` : `Prescription digitized and verified!`,
        { id: 'save-pub-intake' }
      );

      setSavedPrescriptionsResult(data.savedPrescriptions);
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Error al guardar', { id: 'save-pub-intake' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyRxUrl = (url, rxNumber) => {
    if (typeof window === 'undefined') return;
    const fullUrl = `${window.location.origin}${url}`;
    navigator?.clipboard?.writeText(fullUrl);
    setCopiedUrl(rxNumber);
    toast.success(isEs ? 'Enlace oficial copiado al portapapeles ✓' : 'Official prescription link copied ✓');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setRawAiData(null);
    setNormalizedRxList([]);
    setSavedPrescriptionsResult(null);
    setError(null);
    setActiveMappingTarget(null);
  };

  const handleDownloadQrPng = () => {
    const svg = document.getElementById('public-intake-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const a = document.createElement('a');
      a.download = `Prescription-Intake-QR.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Clinical warnings
  const clinicalValidation = normalizedRxList.length > 0 ? validatePrescriptionClinicalRules(normalizedRxList) : null;

  return (
    <div className="pds-page-shell" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <style dangerouslySetInnerHTML={{ __html: PUBLIC_INTAKE_STYLES }} />

      {/* Top Public Unified Header */}
      <PublicUnifiedHeader
        track="peptides"
        lang={lang}
        onLangChange={setLang}
        hideTier2={false}
        breadcrumb={[
          { label: isEs ? 'Inicio' : 'Home', href: '/' },
          { label: isEs ? 'Digitalización de Prescripciones' : 'Prescription Intake' }
        ]}
        copyUrl={typeof window !== 'undefined' ? `${window.location.origin}/rx/intake` : 'https://med-peptides.com/rx/intake'}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
      />

      <div className="pds-page-shell-inner" style={{ maxWidth: '1080px', margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>
        
        {/* Hero Section */}
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
            marginBottom: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <Sparkles size={14} style={{ color: '#6366f1' }} />
            <span>{isEs ? 'MOTOR ATLAS CLINICAL AI · FAGRON GENOMICS COMPATIBLE' : 'ATLAS CLINICAL AI ENGINE · FAGRON GENOMICS READY'}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.2,
            margin: '0 0 1rem'
          }}>
            {isEs 
              ? 'Digitalización y Verificación de Prescripciones Médicas' 
              : 'Medical Prescription & Genomics Intake Portal'}
          </h1>

          <p style={{
            maxWidth: '680px',
            margin: '0 auto 1.5rem',
            fontSize: '1rem',
            color: '#475569',
            lineHeight: 1.6
          }}>
            {isEs
              ? 'Suba su informe Fagron Genomics (TrichoTest™, NutriGen™, etc.) o receta médica en PDF o fotografía. Nuestra inteligencia artificial extraerá y mapeará las fórmulas magistrales al instante sin necesidad de registro.'
              : 'Upload your Fagron Genomics report (TrichoTest™, NutriGen™, etc.) or medical prescription in PDF or image format. Atlas AI extracts formulas, ingredients, and dosages instantly without registration.'}
          </p>

          {/* Trust badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.8rem',
            color: '#64748b'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={15} style={{ color: '#059669' }} />
              {isEs ? '100% Confidencial y Seguro' : '100% Confidential & Secure'}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Dna size={15} style={{ color: '#0284c7' }} />
              {isEs ? 'TrichoTest & Fagron Compatible' : 'TrichoTest & Fagron Compatible'}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={15} style={{ color: '#7c3aed' }} />
              {isEs ? 'Gemini 2.5 Multimodal' : 'Gemini 2.5 Multimodal'}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={15} style={{ color: '#10b981' }} />
              {isEs ? 'Sin Registro Requerido' : 'No Account Required'}
            </span>
          </div>
        </div>

        {/* ── STAGE 1: Dropzone Upload ── */}
        {!savedPrescriptionsResult && normalizedRxList.length === 0 && (
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '2px dashed #cbd5e1',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
            cursor: isProcessing ? 'wait' : 'pointer'
          }}
          {...getRootProps()}
          >
            <input {...getInputProps()} />

            {isProcessing ? (
              <div style={{ padding: '2rem 1rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                  margin: '0 auto 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 1.5s infinite'
                }}>
                  <RefreshCw size={30} style={{ color: '#ffffff', animation: 'spin 2s linear infinite' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  {isEs ? 'Procesando prescripción con IA...' : 'Processing prescription with AI...'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                  {processingStep || (isEs ? 'Extrayendo principios activos, médico y posología...' : 'Extracting active ingredients, doctor and posology...')}
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  margin: '0 auto 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a'
                }}>
                  <Upload size={32} />
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  {isDragActive 
                    ? (isEs ? 'Suelte el documento aquí...' : 'Drop the document here...') 
                    : (isEs ? 'Arrastre o seleccione su archivo aquí' : 'Drag & drop or browse your file')}
                </h3>
                
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
                  {isEs 
                    ? 'Formatos aceptados: PDF de Fagron TrichoTest, recetas escaneadas, PNG, JPG (máx. 15MB)' 
                    : 'Accepted formats: Fagron TrichoTest PDF, scanned Rx, PNG, JPG (max 15MB)'}
                </p>

                <button
                  type="button"
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={18} />
                  <span>{isEs ? 'Seleccionar Documento' : 'Browse File'}</span>
                </button>
              </div>
            )}
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

        {/* ── STAGE 2: Extracted Data Review ── */}
        {!savedPrescriptionsResult && normalizedRxList.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '4px 10px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}>
                  ✓ {normalizedRxList.length} {normalizedRxList.length === 1 ? (isEs ? 'Fórmula Extraída' : 'Formulation Extracted') : (isEs ? 'Fórmulas Extraídas' : 'Formulations Extracted')}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {file?.name}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Subir Otro Documento' : 'Upload Different File'}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '10px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isSaving ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  {isSaving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  <span>{isSaving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Generar Receta Oficial Online' : 'Generate Official Online Rx')}</span>
                </button>
              </div>
            </div>

            {/* Clinical Safety Alert Banner */}
            {clinicalValidation && clinicalValidation.warnings?.length > 0 && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                color: '#92400e'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={16} style={{ color: '#d97706' }} />
                  <span>{isEs ? 'Alertas Farmacoterapéuticas Detectadas' : 'Clinical Safety Warnings Detected'}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {clinicalValidation.warnings.map((w, idx) => (
                    <li key={idx}><strong>{w.title}:</strong> {w.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulation Blocks */}
            {normalizedRxList.map((rx, rxIdx) => {
              const lines = rx.prescriptionLines || rx.items || [];
              const doctor = rx.doctor || {};
              const patient = rx.patient || {};
              const isFagron = !!rx.fagron?.boxId || rx.treatmentProgram?.includes('Fagron') || rx.treatmentProgram?.includes('TrichoTest');

              return (
                <div key={rxIdx} style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}>
                  {/* Card Header */}
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    background: isFagron ? 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          padding: '3px 8px',
                          background: isFagron ? '#0284c7' : '#0f172a',
                          color: '#ffffff',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {isFagron ? 'FAGRON GENOMICS' : 'FORMULATION'}
                        </span>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          {rx.treatmentProgram || (isEs ? 'Fórmula Magistral' : 'Magistral Formula')}
                        </h2>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {rx.treatmentType} {rx.volume ? `· ${rx.volume}` : ''} {rx.duration ? `· ${rx.duration}` : ''}
                      </div>
                    </div>

                    {rx.fagron?.boxId && (
                      <div style={{
                        padding: '4px 12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#0369a1'
                      }}>
                        Box ID: {rx.fagron.boxId}
                      </div>
                    )}
                  </div>

                  {/* Doctor & Patient Metadata Row */}
                  <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                    background: '#fafafa'
                  }}>
                    {/* Patient */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <User size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                          {isEs ? 'PACIENTE' : 'PATIENT'}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          {patient.name || rx.patientName || (isEs ? 'No especificado' : 'Not specified')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {patient.gender ? `${patient.gender} · ` : ''}
                          {patient.dob ? `${patient.dob}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Prescribing Doctor */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                          {isEs ? 'MÉDICO PRESCRIPTOR' : 'PRESCRIBING PHYSICIAN'}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          {doctor.name || rx.doctorName || (isEs ? 'Dr. No especificado' : 'Not specified')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {doctor.license ? `${isEs ? 'Col.' : 'Lic.'} #${doctor.license} · ` : ''}
                          {doctor.clinic || rx.clinicName || ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Posology / Directions Callout */}
                  {rx.posology && (
                    <div style={{
                      padding: '0.85rem 1.5rem',
                      background: '#eff6ff',
                      borderBottom: '1px solid #dbeafe',
                      fontSize: '0.85rem',
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Info size={16} style={{ flexShrink: 0 }} />
                      <span><strong>{isEs ? 'Posología / Pauta:' : 'Posology / Directions:'}</strong> {rx.posology}</span>
                    </div>
                  )}

                  {/* Active Ingredients Table */}
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                      {isEs ? 'Principios Activos y Composición Formulada:' : 'Active Ingredients & Formulated Composition:'}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>
                              {isEs ? 'Principio Activo' : 'Active Ingredient'}
                            </th>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>
                              {isEs ? 'Concentración / Dosis' : 'Dosage / Strength'}
                            </th>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>
                              {isEs ? 'Mapeo en Catálogo' : 'Catalog Mapping'}
                            </th>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>
                              {isEs ? 'Acciones' : 'Actions'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, lineIdx) => {
                            const isPlaceholder = line._isPlaceholder;
                            const isTargetMapping = activeMappingTarget?.rxIdx === rxIdx && activeMappingTarget?.lineIdx === lineIdx;

                            return (
                              <React.Fragment key={lineIdx}>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                                    {line.productName || line.activeIngredient || line.name}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {line.dosage || line.dose || '—'}
                                  </td>
                                  <td style={{ padding: '10px 12px' }}>
                                    {isPlaceholder ? (
                                      <span style={{
                                        padding: '3px 8px',
                                        background: '#fffbeb',
                                        color: '#b45309',
                                        borderRadius: '6px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <Beaker size={12} />
                                        {isEs ? 'API Magistral Fagron' : 'Magistral Fagron API'}
                                      </span>
                                    ) : (
                                      <span style={{
                                        padding: '3px 8px',
                                        background: '#f0fdf4',
                                        color: '#15803d',
                                        borderRadius: '6px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <CheckCircle2 size={12} />
                                        {isEs ? 'Catálogo Vinculado' : 'Catalog Matched'}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      onClick={() => setActiveMappingTarget(isTargetMapping ? null : { rxIdx, lineIdx })}
                                      style={{
                                        background: 'none',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: '#0284c7',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {isTargetMapping ? (isEs ? 'Cerrar' : 'Close') : (isEs ? 'Vincular Catálogo' : 'Map Product')}
                                    </button>
                                  </td>
                                </tr>

                                {/* Inline Algolia Product Picker Drawer */}
                                {isTargetMapping && (
                                  <tr>
                                    <td colSpan={4} style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                      <div style={{ maxWidth: '500px' }}>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '6px' }}>
                                          {isEs ? 'Buscar producto en el catálogo oficial para vincular:' : 'Search official catalog product to map:'}
                                        </div>
                                        <AlgoliaProductPicker
                                          onProductSelect={(prod) => handleProductMapped(rxIdx, lineIdx, prod)}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Final Action CTA */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? '¿Todo listo para generar la prescripción online?' : 'Ready to generate the online prescription?'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', maxWidth: '540px' }}>
                {isEs 
                  ? 'Al confirmar, el sistema creará un código de verificación clínico único con acceso directo, QR para escaneo y opción de compartir por WhatsApp.' 
                  : 'Upon confirmation, the system creates a unique verified clinical code with online portal access, QR code and WhatsApp shareability.'}
              </p>

              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                style={{
                  padding: '0.85rem 2.25rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: isSaving ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                }}
              >
                {isSaving ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />}
                <span>{isSaving ? (isEs ? 'Generando prescripción digital...' : 'Generating digital prescription...') : (isEs ? 'Confirmar y Generar Prescripción Digital' : 'Confirm & Generate Digital Prescription')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: Instant Online Prescription Success Result ── */}
        {savedPrescriptionsResult && savedPrescriptionsResult.length > 0 && (
          <div style={{
            marginTop: '2rem',
            background: '#ffffff',
            borderRadius: '24px',
            border: '2px solid #bbf7d0',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>
              {isEs ? '¡Prescripción Digital Verificada con Éxito!' : 'Digital Prescription Verified Successfully!'}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
              {isEs 
                ? 'Su prescripción ha sido procesada y almacenada en el registro clínico. Puede acceder al expediente completo, compartirlo por WhatsApp o descargarlo en PDF.' 
                : 'Your prescription has been digitized and verified. You can access the clinical dossier, share via WhatsApp, or download as PDF.'}
            </p>

            {/* Created Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
              {savedPrescriptionsResult.map((saved, sIdx) => {
                const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com'}${saved.rxUrl}`;
                const waMessage = isEs 
                  ? `Hola ${saved.patientName}, aquí tiene su receta médica oficial digitalizada con acceso clínico validado:\n\n🔗 ${fullUrl}\n\nCódigo de Verificación: ${saved.prescriptionNumber}`
                  : `Hello ${saved.patientName}, here is your verified medical prescription dossier:\n\n🔗 ${fullUrl}\n\nVerification Code: ${saved.prescriptionNumber}`;
                const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

                return (
                  <div key={sIdx} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                          {isEs ? 'CÓDIGO DE RECETA' : 'PRESCRIPTION NUMBER'}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0284c7', fontFamily: 'monospace' }}>
                          {saved.prescriptionNumber}
                        </div>
                      </div>

                      <span style={{
                        padding: '4px 10px',
                        background: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        ✓ {isEs ? 'Activa & Verificada' : 'Active & Verified'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <strong>{isEs ? 'Paciente:' : 'Patient:'}</strong> {saved.patientName} · {saved.lineCount} {isEs ? 'principios activos' : 'active ingredients'}
                    </div>

                    {/* QR Code */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px'
                    }}>
                      <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <QRCodeSVG
                          id="public-intake-qr"
                          value={fullUrl}
                          size={90}
                          level="H"
                        />
                      </div>
                      <div style={{ flex: 1, fontSize: '0.8rem', color: '#64748b' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                          {isEs ? 'Escaneo con Teléfono Móvil' : 'Mobile Smartphone QR'}
                        </div>
                        <div>{isEs ? 'Escanee para abrir inmediatamente el portal del paciente en su móvil.' : 'Scan to open mobile patient dossier on your smartphone.'}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      <Link
                        href={saved.rxUrl}
                        target="_blank"
                        style={{
                          flex: 1,
                          padding: '0.65rem 1rem',
                          background: '#0284c7',
                          color: '#ffffff',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <ExternalLink size={15} />
                        <span>{isEs ? 'Ver Receta Online' : 'Open Online Rx'}</span>
                      </Link>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.65rem 1rem',
                          background: '#25D366',
                          color: '#ffffff',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Phone size={15} />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyRxUrl(saved.rxUrl, saved.prescriptionNumber)}
                        style={{
                          padding: '0.65rem 1rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {copiedUrl === saved.prescriptionNumber ? <Check size={15} style={{ color: '#16a34a' }} /> : <Copy size={15} />}
                        <span>{copiedUrl === saved.prescriptionNumber ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleDownloadQrPng}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>{isEs ? 'Descargar Código QR (PNG)' : 'Download QR Code (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                <span>{isEs ? 'Subir Otra Prescripción' : 'Upload Another Rx'}</span>
              </button>
            </div>
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
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '9999px',
            fontSize: '0.74rem'
          }}>
            <ShieldCheck size={14} style={{ color: '#0284c7' }} />
            <span>Atlas Services Clinical Intelligence · HIPAA & GDPR Compliant Medical Protocol Intake</span>
          </div>
          <div>
            {isEs 
              ? 'Todos los datos procesados son confidenciales y se cifran con estándares de grado clínico en tránsito y en reposo.' 
              : 'All processed medical documents are strictly confidential and encrypted with clinical-grade standards in transit and at rest.'}
          </div>
        </footer>

      </div>

      {/* Atlas AI Clinical Research Drawer */}
      <PublicAtlasAIDrawer
        contextType="prescription"
        contextAnchor={{
          name: 'Public Prescription Intake',
          treatmentProgram: 'Fagron Genomics & Prescription Intake',
          category: 'Clinical Intake Portal'
        }}
        storageKey="rx_public_intake"
        hideFloatingTrigger={true}
        lang={lang}
      />

      {/* Context-Aware Institutional Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="general"
        initialEntity={{
          name: 'Public Prescription & Fagron Intake Portal',
          category: 'Clinical Intake Dossier'
        }}
        lang={lang}
      />
    </div>
  );
}

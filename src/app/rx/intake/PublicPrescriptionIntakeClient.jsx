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
  Activity, Clock, Calendar, Beaker, Eye, Layers, FileCode
} from '@/lib/icons';
import toast from 'react-hot-toast';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import AlgoliaProductPicker from '@/components/admin/protocols/tabs/AlgoliaProductPicker';
import PublicPrescriptionClient from '../[code]/PublicPrescriptionClient';
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
  // Default to English as requested
  const [lang, setLang] = useState('en');
  const isEs = lang === 'es';

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
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

  // Active view tab: 'electronic' | 'original' | 'breakdown'
  const [activeTab, setActiveTab] = useState('electronic');

  // File Upload and Multimodal AI Analysis
  const handleProcessFile = useCallback(async (droppedFile) => {
    if (!droppedFile) return;
    setFile(droppedFile);
    setIsProcessing(true);
    setError(null);
    setNormalizedRxList([]);
    setRawAiData(null);
    setSavedPrescriptionsResult(null);

    const isFilePdf = droppedFile.type === 'application/pdf' || droppedFile.name?.toLowerCase().endsWith('.pdf');
    setIsPdf(isFilePdf);

    // Create local object URL for preview (both PDF and images)
    try {
      const blobUrl = URL.createObjectURL(droppedFile);
      setFilePreview(blobUrl);
    } catch (e) {
      console.warn('Could not generate object preview:', e);
    }

    try {
      setProcessingStep(isEs ? 'Analizando documento con Gemini AI Multimodal...' : 'Analyzing clinical document with Multimodal Gemini AI...');
      toast.loading(isEs ? 'Analizando prescripción con Gemini AI...' : 'Analyzing prescription with Gemini AI...', { id: 'ai-public-intake' });
      
      // 1. Multimodal AI Extraction
      const aiData = await extractPrescriptionFromDocument(droppedFile);
      setRawAiData(aiData);

      // 2. Normalize and Catalog Mapping
      setProcessingStep(isEs ? 'Mapeando fármacos y fórmulas magistrales contra catálogo...' : 'Resolving compounded ingredients against pharmaceutical catalog...');
      const normalized = await normalizeExtractedPrescriptions(aiData, {
        currentUser: null,
      });

      setNormalizedRxList(normalized);
      setActiveTab('electronic'); // Default to showing electronic version right away

      toast.success(
        isEs 
          ? `Extracción completada (${normalized.length} ${normalized.length === 1 ? 'fórmula' : 'formulaciones'})` 
          : `Extraction completed (${normalized.length} ${normalized.length === 1 ? 'formulation' : 'formulations'})`,
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
      toast.loading(isEs ? 'Activando prescripción oficial...' : 'Activating official electronic prescription...', { id: 'save-pub-intake' });
      
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
        isEs ? `¡Prescripción electrónica verificada y guardada!` : `Electronic prescription verified and activated!`,
        { id: 'save-pub-intake' }
      );

      setSavedPrescriptionsResult(data.savedPrescriptions);
      setActiveTab('electronic');
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
    toast.success(isEs ? 'Enlace oficial copiado al portapapeles ✓' : 'Official electronic link copied ✓');
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
    setActiveTab('electronic');
  };

  // Clinical warnings
  const clinicalValidation = normalizedRxList.length > 0 ? validatePrescriptionClinicalRules(normalizedRxList) : null;

  // Active Electronic Rx payload for the electronic preview
  const primarySaved = savedPrescriptionsResult?.[0];
  const activeElectronicRx = primarySaved?.rxData || (normalizedRxList.length > 0 ? {
    ...normalizedRxList[0],
    id: normalizedRxList[0]?.prescriptionNumber || 'RX-ELECTRONIC-PREVIEW',
    prescriptionNumber: normalizedRxList[0]?.prescriptionNumber || 'RX-ELECTRONIC-PREVIEW',
    status: primarySaved ? 'approved' : 'pending'
  } : null);

  const officialCode = primarySaved?.prescriptionNumber || activeElectronicRx?.prescriptionNumber || 'RX-PENDING';
  const officialUrl = primarySaved ? primarySaved.rxUrl : `/rx/${officialCode}`;
  const fullOfficialUrl = typeof window !== 'undefined' ? `${window.location.origin}${officialUrl}` : `https://med-peptides.com${officialUrl}`;

  // WhatsApp share messages
  const patientWaMessage = isEs
    ? `Hola ${activeElectronicRx?.patientName || 'Paciente'}, aquí tiene su receta médica electrónica oficial con ficha técnica y pauta posológica validada:\n\n🔗 ${fullOfficialUrl}\n\nCódigo de Verificación: ${officialCode}`
    : `Hello ${activeElectronicRx?.patientName || 'Patient'}, here is your official verified electronic medical prescription dossier and posology guide:\n\n🔗 ${fullOfficialUrl}\n\nPrescription Ref: ${officialCode}`;

  const doctorWaMessage = isEs
    ? `Estimado/a Dr./Dra. ${activeElectronicRx?.doctorName || ''}, se ha digitalizado y verificado la prescripción médica para el paciente ${activeElectronicRx?.patientName || ''}:\n\n🔗 ${fullOfficialUrl}\n\nCódigo Oficial: ${officialCode}`
    : `Dear Dr. ${activeElectronicRx?.doctorName || ''}, the electronic medical prescription dossier for patient ${activeElectronicRx?.patientName || ''} has been verified:\n\n🔗 ${fullOfficialUrl}\n\nPrescription Ref: ${officialCode}`;

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
          { label: isEs ? 'Digitalización de Prescripciones' : 'Prescription Intake' },
          ...(activeElectronicRx ? [{ label: officialCode }] : [])
        ]}
        copyUrl={typeof window !== 'undefined' ? `${window.location.origin}/rx/intake` : 'https://med-peptides.com/rx/intake'}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
      />

      <div className="pds-page-shell-inner" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.75rem 1.25rem 5rem' }}>
        
        {/* ── Top Hero (Visible when no document has been uploaded) ── */}
        {!activeElectronicRx && (
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
              <span>{isEs ? 'MOTOR ATLAS CLINICAL AI · FAGRON GENOMICS COMPATIBLE' : 'ATLAS CLINICAL AI ENGINE · FAGRON GENOMICS COMPATIBLE'}</span>
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
                : 'Medical Prescription & Fagron Genomics Intake Portal'}
            </h1>

            <p style={{
              maxWidth: '680px',
              margin: '0 auto 1.5rem',
              fontSize: '1rem',
              color: '#475569',
              lineHeight: 1.6
            }}>
              {isEs
                ? 'Suba su informe Fagron Genomics (TrichoTest™, NutriGen™, etc.) o receta médica en PDF o fotografía. Nuestra inteligencia artificial extraerá y generará la versión electrónica oficial al instante sin necesidad de registro.'
                : 'Upload your Fagron Genomics report (TrichoTest™, NutriGen™, etc.) or medical prescription in PDF or image format. Atlas AI extracts the compounded formula and generates the official electronic prescription dossier instantly with no account required.'}
            </p>

          </div>
        )}

        {/* ── STAGE 1: Dropzone Upload ── */}
        {!activeElectronicRx && (
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
                  {isEs ? 'Procesando prescripción con IA...' : 'Processing document with Clinical AI...'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                  {processingStep || (isEs ? 'Extrayendo principios activos, médico y posología...' : 'Extracting active ingredients, doctor and posology protocol...')}
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
                    ? (isEs ? 'Suelte el documento aquí...' : 'Drop your clinical document here...') 
                    : (isEs ? 'Arrastre o seleccione su archivo aquí' : 'Drag & drop or browse your file')}
                </h3>
                
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
                  {isEs 
                    ? 'Formatos aceptados: PDF de Fagron TrichoTest, recetas escaneadas, PNG, JPG (máx. 15MB)' 
                    : 'Accepted formats: Fagron TrichoTest PDF, medical prescription scan, PNG, JPG (max 15MB)'}
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
                  <span>{isEs ? 'Seleccionar Documento' : 'Browse Clinical Document'}</span>
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

        {/* ── STAGE 2: Interactive Digitized View & Electronic Prescription Dossier ── */}
        {activeElectronicRx && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Top Control Bar: Status, Segmented View Switcher, and Instant Share Actions */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              
              {/* Row 1: Identification & Activation status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>{isEs ? 'Subir Otro' : 'Upload New'}</span>
                  </button>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {primarySaved ? (isEs ? 'RECETA OFICIAL VERIFICADA' : 'VERIFIED ELECTRONIC DOSSIER') : (isEs ? 'VISTA PREVIA ELECTRÓNICA DIGITALIZADA' : 'DIGITIZED ELECTRONIC PREVIEW')}
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7', fontFamily: 'monospace' }}>
                      {officialCode}
                    </div>
                  </div>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    background: primarySaved ? '#dcfce7' : '#fef3c7',
                    color: primarySaved ? '#15803d' : '#b45309'
                  }}>
                    {primarySaved 
                      ? (isEs ? '✓ Activa y Verificada' : '✓ Active & Verified') 
                      : (isEs ? '● Pendiente de Confirmación' : '● Ready to Activate')}
                  </span>
                </div>

                {/* Right CTAs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {!primarySaved && (
                    <button
                      type="button"
                      onClick={handleConfirmSave}
                      disabled={isSaving}
                      style={{
                        padding: '0.65rem 1.25rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        cursor: isSaving ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      {isSaving ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={15} />}
                      <span>{isSaving ? (isEs ? 'Activando...' : 'Activating...') : (isEs ? 'Confirmar & Activar Receta' : 'Confirm & Activate Prescription')}</span>
                    </button>
                  )}

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(patientWaMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      background: '#25D366',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
                    }}
                    title="Share with patient via WhatsApp"
                  >
                    <Phone size={15} />
                    <span>{isEs ? 'WhatsApp Paciente' : 'WhatsApp Patient'}</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(doctorWaMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      background: '#0284c7',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                    }}
                    title="Share with doctor via WhatsApp"
                  >
                    <Stethoscope size={15} />
                    <span>{isEs ? 'WhatsApp Médico' : 'WhatsApp Doctor'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyRxUrl(officialUrl, officialCode)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {copiedUrl === officialCode ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                    <span>{copiedUrl === officialCode ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
                  </button>

                  {primarySaved && (
                    <Link
                      href={officialUrl}
                      target="_blank"
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: '#0f172a',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>{isEs ? 'Abrir Completa' : 'Full Dossier'}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Row 2: Segmented View Navigation Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{
                  display: 'inline-flex',
                  background: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '12px',
                  gap: '4px'
                }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('electronic')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'electronic' ? '#ffffff' : 'transparent',
                      color: activeTab === 'electronic' ? '#0f172a' : '#64748b',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'electronic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Eye size={15} style={{ color: activeTab === 'electronic' ? '#0284c7' : '#94a3b8' }} />
                    <span>{isEs ? 'Versión Electrónica (Médico & Paciente)' : 'Electronic Prescription Dossier (Live)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('original')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'original' ? '#ffffff' : 'transparent',
                      color: activeTab === 'original' ? '#0f172a' : '#64748b',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'original' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={15} style={{ color: activeTab === 'original' ? '#0284c7' : '#94a3b8' }} />
                    <span>{isEs ? 'Documento Original Digitalizado' : 'Original Uploaded Document'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('breakdown')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'breakdown' ? '#ffffff' : 'transparent',
                      color: activeTab === 'breakdown' ? '#0f172a' : '#64748b',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'breakdown' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Beaker size={15} style={{ color: activeTab === 'breakdown' ? '#0284c7' : '#94a3b8' }} />
                    <span>{isEs ? 'Mapeo de Ingredientes & Catálogo' : 'Ingredients & Catalog Mapping'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {activeTab === 'electronic' && (
                    <span>{isEs ? 'Esta es la versión exacta que reciben el médico y el paciente.' : 'This is the verified electronic version shared with doctor & patient.'}</span>
                  )}
                  {activeTab === 'original' && (
                    <span>{file?.name || 'Uploaded Document'} · {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── TAB 1: ELECTRONIC PRESCRIPTION DOSSIER (LIVE VIEW) ── */}
            {activeTab === 'electronic' && (
              <div style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 25px rgba(0,0,0,0.04)',
                overflow: 'hidden'
              }}>
                <PublicPrescriptionClient
                  rx={activeElectronicRx}
                  embedded={true}
                />
              </div>
            )}

            {/* ── TAB 2: ORIGINAL UPLOADED DOCUMENT PREVIEW ── */}
            {activeTab === 'original' && (
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {isEs ? 'Previsualización del Documento Original' : 'Original Document Viewer'}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      {file?.name}
                    </p>
                  </div>

                  {filePreview && (
                    <a
                      href={filePreview}
                      download={file?.name || 'prescription-document'}
                      style={{
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#334155',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={14} />
                      <span>{isEs ? 'Descargar Archivo' : 'Download Original File'}</span>
                    </a>
                  )}
                </div>

                {filePreview ? (
                  isPdf ? (
                    <div style={{ width: '100%', height: '800px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <iframe
                        src={filePreview}
                        title="Original Prescription PDF"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <img
                        src={filePreview}
                        alt="Original Document"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '750px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  )
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    {isEs ? 'No se pudo generar la vista previa del documento.' : 'Document preview is unavailable.'}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: INGREDIENTS & CATALOG MAPPING TABLE ── */}
            {activeTab === 'breakdown' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
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
                  const isFagron = !!rx.fagron?.boxId || rx.treatmentProgram?.includes('Fagron') || rx.treatmentProgram?.includes('TrichoTest');

                  return (
                    <div key={rxIdx} style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                      overflow: 'hidden'
                    }}>
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
                              {rx.treatmentProgram || (isEs ? 'Fórmula Magistral' : 'Compounded Formulation')}
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

                      {/* Active Ingredients Table */}
                      <div style={{ padding: '1.25rem 1.5rem' }}>
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
              </div>
            )}

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

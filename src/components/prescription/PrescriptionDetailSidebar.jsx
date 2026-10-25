"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FlaskConical,
  List, 
  X, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  Stethoscope, 
  ExternalLink, 
  Award, 
  Sparkles, 
  Download, 
  Dna, 
  Droplets, 
  Clock, 
  Calendar, 
  Layers, 
  ArrowUp, 
  Printer, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Box, 
  Lock, 
  QrCode,
  Phone,
  Mail,
  MessageCircle,
  Edit2,
  Loader2
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import '@/components/product/PublicDatasheetTableOfContents.css';

/**
 * PrescriptionDetailSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant dedicated sidebar for public prescription dossiers.
 * Flexible Architecture:
 *  - Supports single or multiple compounded formulations / vehicles
 *  - Supports multi-phase clinical regimens (e.g. Induction vs Maintenance)
 *  - Real-time IntersectionObserver ScrollSpy
 *  - Permanent Unique URL copy-on-click & direct verification
 *  - Clinical Actions widget (PDF Download, DHA Verification badge, Prescribing Physician)
 *  - Responsive: Desktop sticky sidebar + Mobile drawer (triggered via PublicStickyActionBar)
 */
export default function PrescriptionDetailSidebar({
  sections = [],
  formulations = [],
  phases = [],
  rxId = '',
  patientName = '',
  patient = null,
  rx = null,
  doctorName = '',
  doctorTitle = '',
  doctorLicense = '',
  doctorOffice = '',
  doctorPhone = '',
  doctorPublicUrl = '',
  publicUrl = '',
  onOpenPdf = null,
  onExportExcel = null,
  onAssignDoctor = null,
  activeGcpTab = '',
  onSelectTab = null,
  lang = 'en',
  isAuthorizedViewer = false,
  isPatientView = false,
  onOpenQuotation = null,
  onPatientContactUpdated = null
}) {
  const isEs = lang === 'es';
  const prescriptionCode = rxId || 'RX';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Direct patient contact states for frictionless enrichment
  const initialPhone = patient?.phone || rx?.patientPhone || '';
  const initialEmail = (patient?.email && !patient.email.includes('paciente@atlas-rx.com')) ? patient.email : (rx?.patientEmail || '');
  const [patientPhone, setPatientPhone] = useState(initialPhone);
  const [patientEmail, setPatientEmail] = useState(initialEmail);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [whatsAppInput, setWhatsAppInput] = useState(initialPhone);

  useEffect(() => {
    const currentP = patient?.phone || rx?.patientPhone || '';
    const currentE = (patient?.email && !patient.email.includes('paciente@atlas-rx.com')) ? patient.email : (rx?.patientEmail || '');
    if (currentP) {
      setPatientPhone(currentP);
      setPhoneInput(currentP);
      setWhatsAppInput(currentP);
    }
    if (currentE) {
      setPatientEmail(currentE);
      setEmailInput(currentE);
    }
  }, [patient?.phone, patient?.email, rx?.patientPhone, rx?.patientEmail]);

  const handleSaveContact = async (overridePhone = null) => {
    const targetPhone = overridePhone !== null ? overridePhone : phoneInput;
    const targetEmail = emailInput;

    if (!targetPhone?.trim() && !targetEmail?.trim()) {
      toast.error(isEs ? 'Introduzca al menos un teléfono o un email.' : 'Enter at least a phone or email.');
      return false;
    }

    setIsSavingContact(true);
    triggerHaptic('impact');

    try {
      const res = await fetch(`/api/prescriptions/${prescriptionCode}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone?.trim() || '',
          email: targetEmail?.trim() || '',
          patientId: patient?.id || rx?.patientId || '',
          patientName,
          doctorName,
          clinic: doctorOffice
        })
      });

      if (res.ok) {
        if (targetPhone?.trim()) setPatientPhone(targetPhone.trim());
        if (targetEmail?.trim()) setPatientEmail(targetEmail.trim());
        setIsEditingContact(false);
        setShowWhatsAppPrompt(false);
        toast.success(isEs ? 'Contacto guardado y base de datos enriquecida ✓' : 'Patient contact saved & synced ✓');
        onPatientContactUpdated?.({
          phone: targetPhone?.trim() || '',
          email: targetEmail?.trim() || ''
        });
        return true;
      } else {
        toast.error(isEs ? 'Error al guardar el contacto.' : 'Failed to save contact.');
        return false;
      }
    } catch {
      toast.error(isEs ? 'Error de conexión.' : 'Connection error.');
      return false;
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleSendWhatsApp = (phoneToSend = null) => {
    const rawPhone = String(phoneToSend || patientPhone || '').replace(/[^0-9]/g, '');
    if (!rawPhone || rawPhone.length < 7) {
      setShowWhatsAppPrompt(true);
      return;
    }

    const patientUrl = `${canonicalUrl}?view=patient`;
    const msg = isEs
      ? `Estimado/a ${patientName || 'Paciente'},\nSu médico ${doctorName || 'de Atlas Health'} le comparte el acceso a su prescripción digital y pauta personalizada #${prescriptionCode}.\nPuede consultar sus dosis, horarios e indicaciones aquí:\n🔗 ${patientUrl}`
      : `Dear ${patientName || 'Patient'},\nYour physician ${doctorName || 'at Atlas Health'} has shared access to your digital prescription and customized regimen #${prescriptionCode}.\nYou can review your dosages, schedule, and clinical instructions here:\n🔗 ${patientUrl}`;

    const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  const handlePromptSubmitWhatsApp = async (e) => {
    e.preventDefault();
    if (!whatsAppInput.trim() || whatsAppInput.trim().replace(/[^0-9]/g, '').length < 7) {
      toast.error(isEs ? 'Por favor indique un número de WhatsApp válido (mínimo 7 dígitos).' : 'Please enter a valid WhatsApp phone number.');
      return;
    }
    const saved = await handleSaveContact(whatsAppInput.trim());
    if (saved) {
      handleSendWhatsApp(whatsAppInput.trim());
    }
  };

  const SECTION_TO_TAB = useMemo(() => ({
    'formula-card': 'treatment',
    'genomics-card': 'genomics',
    'milestones-card': 'roadmap',
    'quality-card': 'traceability',
    'atlas-recommendations-card': 'recommendations',
    'doctor-patient-credentials': 'credentials',
    'patient-sharing-card': 'patientSharing',
    'atlas-quotation-card': 'quotation'
  }), []);

  const TAB_TO_DEFAULT_SECTION = useMemo(() => ({
    treatment: 'formula-card',
    genomics: 'genomics-card',
    roadmap: 'milestones-card',
    traceability: 'quality-card',
    recommendations: 'atlas-recommendations-card',
    credentials: 'doctor-patient-credentials',
    patientSharing: 'patient-sharing-card',
    quotation: 'atlas-quotation-card'
  }), []);

  const canonicalUrl = publicUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}/rx/${rxId}` 
    : `https://www.atlashealth-services.com/rx/${rxId}`);

  const availableSections = useMemo(() => {
    return sections.filter(sec => sec && sec.id);
  }, [sections]);

  // Sync active section when activeGcpTab changes from parent
  useEffect(() => {
    if (!activeGcpTab) return;
    const defaultSec = TAB_TO_DEFAULT_SECTION[activeGcpTab];
    if (defaultSec) {
      const timer = setTimeout(() => setActiveId(defaultSec), 0);
      return () => clearTimeout(timer);
    }
  }, [activeGcpTab, TAB_TO_DEFAULT_SECTION]);

  // Support external trigger from PublicStickyActionBar ("Sections" button)
  useEffect(() => {
    const handleExternalOpen = () => {
      triggerHaptic('light');
      setIsMobileDrawerOpen(true);
    };
    window.addEventListener('open-rx-sections', handleExternalOpen);
    return () => window.removeEventListener('open-rx-sections', handleExternalOpen);
  }, []);

  // Real-time ScrollSpy via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined' || !availableSections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topEntry = visibleEntries[0];
          if (topEntry?.target?.id) {
            setActiveId(topEntry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5]
      }
    );

    availableSections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [availableSections]);

  const scrollTo = (id) => {
    triggerHaptic('selection');

    // Switch tab if clicking a section belonging to a different tab
    const targetTab = SECTION_TO_TAB[id] || (availableSections.find(s => s.id === id)?.category === 'formula' ? 'treatment' : null);
    if (targetTab && onSelectTab && activeGcpTab !== targetTab) {
      onSelectTab(targetTab);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('OPEN_RX_SECTION', { detail: { id } }));
    }

    const performScroll = (targetId) => {
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 95;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        setActiveId(targetId);
        if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
        return true;
      }
      return false;
    };

    if (!performScroll(id)) {
      setTimeout(() => performScroll(id), 60);
    }
  };

  const handleCopyPermanentUrl = () => {
    try {
      navigator?.clipboard?.writeText(canonicalUrl);
      setCopiedUrl(true);
      triggerHaptic('success');
      toast.success(
        isEs 
          ? 'URL permanente de la prescripción copiada ✓' 
          : 'Permanent prescription URL copied ✓'
      );
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch (_) {
      toast.error('Could not copy link');
    }
  };

  const getSectionIcon = (id, iconType) => {
    if (iconType === 'box' || id.includes('oral')) return Box;
    if (iconType === 'droplets' || id.includes('oil') || id.includes('infographic')) return Droplets;
    if (iconType === 'dna' || id.includes('genomics')) return Dna;
    if (iconType === 'clock' || id.includes('posology')) return Clock;
    if (iconType === 'calendar' || id.includes('milestone')) return Calendar;
    if (iconType === 'stethoscope' || id.includes('doctor') || id.includes('clinical')) return Stethoscope;
    if (iconType === 'shield' || id.includes('qr')) return ShieldCheck;
    if (iconType === 'file' || id.includes('doc')) return FileText;
    if (iconType === 'sparkles' || id.includes('recommendation') || id.includes('synergy')) return Sparkles;
    if (iconType === 'share' || id.includes('sharing')) return ExternalLink;
    if (id.includes('formula')) return FlaskConical;
    return List;
  };

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR (Hidden on mobile via CSS) ── */}
      <div 
        className="pds-sidebar-desktop"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem'
        }}
      >
        {/* Patient Identity & Direct Contact Card (GCP Standard with Frictionless Enrichment) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 14px',
          boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Main header row: Avatar + Name + Edit Pencil */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.88rem',
              flexShrink: 0
            }}>
              {patientName?.charAt(0) || 'P'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <span>{isEs ? 'Paciente' : 'Patient'}</span>
                  {!isAuthorizedViewer && (
                    <span style={{ fontSize: '0.60rem', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, letterSpacing: '0.02em' }}>
                      🔒 DHA/HIPAA
                    </span>
                  )}
                </div>

                {/* Inline Edit Trigger (Golden Rule #5) */}
                {isAuthorizedViewer && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setIsEditingContact(prev => !prev);
                      setShowWhatsAppPrompt(false);
                    }}
                    title={isEs ? 'Añadir o editar teléfono y email del paciente' : 'Add or edit patient phone and email'}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px 4px',
                      color: isEditingContact ? '#0284c7' : '#94a3b8',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.68rem',
                      fontWeight: 600
                    }}
                  >
                    <Edit2 size={12} />
                    <span>{isEs ? (patientPhone || patientEmail ? 'Editar' : '+ Contacto') : (patientPhone || patientEmail ? 'Edit' : '+ Contact')}</span>
                  </button>
                )}
              </div>

              <div 
                title={patientName || 'Patient'}
                style={{ 
                  fontSize: '0.88rem', 
                  fontWeight: 750, 
                  color: '#0f172a', 
                  whiteSpace: 'normal', 
                  wordBreak: 'break-word', 
                  lineHeight: 1.32,
                  marginTop: '1px'
                }}
              >
                {patientName || 'Patient'}
              </div>

              <div style={{ fontSize: '0.70rem', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span>Ref: {prescriptionCode}</span>
              </div>
            </div>
          </div>

          {/* Current Contact Info Pills if available */}
          {isAuthorizedViewer && !isEditingContact && (patientPhone || patientEmail) && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '6px',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.72rem',
              color: '#334155'
            }}>
              {patientPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={11} color="#059669" />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{patientPhone}</span>
                </div>
              )}
              {patientEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={11} color="#0284c7" />
                  <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patientEmail}</span>
                </div>
              )}
            </div>
          )}

          {/* Missing contact notice for clinical staff */}
          {isAuthorizedViewer && !isEditingContact && !patientPhone && !patientEmail && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '0.68rem',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px'
            }}>
              <span>{isEs ? 'Sin teléfono ni email registrado.' : 'No phone or email recorded.'}</span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsEditingContact(true);
                }}
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isEs ? '+ Añadir' : '+ Add'}
              </button>
            </div>
          )}

          {/* Inline Edit Micro-Panel (Golden Rule #5 with explicit ✔️ and ❌) */}
          {isEditingContact && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {isEs ? 'Datos de Contacto del Paciente' : 'Patient Contact Info'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={12} color="#64748b" style={{ flexShrink: 0 }} />
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder={isEs ? 'Móvil / WhatsApp (+34...)' : 'Mobile / WhatsApp (+...)'}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    fontSize: '0.74rem',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={12} color="#64748b" style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="paciente@email.com"
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    fontSize: '0.74rem',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  disabled={isSavingContact}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ❌ {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveContact()}
                  disabled={isSavingContact}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#003666',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isSavingContact ? <Loader2 size={11} className="animate-spin" /> : '✔️'}
                  <span>{isSavingContact ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar' : 'Save')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick WhatsApp Send Button (The frictionless delivery trigger) */}
          {isAuthorizedViewer && !showWhatsAppPrompt && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                handleSendWhatsApp();
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(37, 211, 102, 0.25)',
                transition: 'background 0.2s ease'
              }}
            >
              <MessageCircle size={14} />
              <span>{isEs ? 'Enviar Pauta por WhatsApp' : 'Send Regimen via WhatsApp'}</span>
            </button>
          )}

          {/* Prompt when WhatsApp clicked but phone was missing */}
          {showWhatsAppPrompt && (
            <form onSubmit={handlePromptSubmitWhatsApp} style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534' }}>
                {isEs ? '📲 ¿A qué WhatsApp enviamos la pauta?' : '📲 Which WhatsApp to send regimen?'}
              </div>
              <input
                type="tel"
                autoFocus
                value={whatsAppInput}
                onChange={(e) => setWhatsAppInput(e.target.value)}
                placeholder="+34 600 000 000"
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  border: '1px solid #86efac',
                  fontSize: '0.75rem',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowWhatsAppPrompt(false)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.68rem',
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingContact}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#25D366',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isSavingContact ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                  <span>{isSavingContact ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Enviar y Guardar' : 'Send & Save')}</span>
                </button>
              </div>
            </form>
          )}

          {!isAuthorizedViewer && (
            <div style={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.3, background: '#f8fafc', padding: '5px 7px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#003666', fontWeight: 600 }}>Privacy Protected:</span> Nominal record restricted.{' '}
              <Link href={`/login?redirect=/rx/${prescriptionCode}`} style={{ color: '#003666', fontWeight: 700, textDecoration: 'underline' }}>
                Doctor Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Treating Physician Card (Google Cloud Parent Context) */}
        {doctorName && (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '12px 14px',
            boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isAuthorizedViewer ? (isEs ? 'Médico Prescriptor' : 'Prescribing Physician') : (isEs ? 'Práctica Médica' : 'Medical Practice')}
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 750, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                {isAuthorizedViewer 
                  ? (doctorName.startsWith('Dr') ? doctorName : `Dr. ${doctorName}`)
                  : (isEs ? 'Práctica Médica Verificada' : 'Verified Clinical Practice')}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAuthorizedViewer ? (doctorTitle || (isEs ? 'Facultativo Colegiado' : 'Licensed Physician')) : (isEs ? 'Acreditación Oficial DHA' : 'Official DHA Accreditation')}
              </div>
            </div>
            {doctorPublicUrl && (
              <Link
                href={doctorPublicUrl}
                title={isAuthorizedViewer ? (isEs ? `Ir al portal de ${doctorName}` : `Go to ${doctorName}'s Portal`) : (isEs ? 'Ir al portal de la práctica' : 'Go to practice portal')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #dadce0',
                  color: '#003666',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  textDecoration: 'none',
                  flexShrink: 0
                }}
              >
                <span>{isEs ? 'Portal' : 'Portal'}</span>
                <ChevronRight size={13} />
              </Link>
            )}
          </div>
        )}

        {/* Compounding Quote Widget (Doctor / Admin Only) */}
        {!isPatientView && (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '12px 14px',
            boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 750, color: '#0f172a' }}>
                    {isEs ? 'Cotización de Elaboración' : 'Compounding Quote'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {isEs ? 'Gestionado por Atlas Services' : 'Managed by Atlas Services'}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 650,
                padding: '2px 6px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}>
                {isEs ? 'Bajo Demanda' : 'On-Demand'}
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.35 }}>
              {isEs 
                ? `${formulations?.length || 1} fórmula(s) lista(s) para cotización, gestionada directamente por Atlas Services.`
                : `${formulations?.length || 1} compounded formula(s) ready for review, managed directly by Atlas Services.`}
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('impact');
                if (onOpenQuotation) onOpenQuotation();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '7px',
                padding: '8px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                transition: 'background 0.15s'
              }}
            >
              <FileText size={13} />
              <span>{isEs ? 'Solicitar Cotización a Atlas Services' : 'Request Compounding Quote'}</span>
            </button>
          </div>
        )}

        {/* Widget 1: On This Dossier (TOC) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.15rem',
          boxShadow: '0 4px 16px rgba(0, 54, 102, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
            paddingBottom: '0.65rem',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <List size={14} color="#0284c7" />
              <span>{isEs ? 'EN ESTE DOSSIER' : 'ON THIS DOSSIER'}</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
              {availableSections.length} {isEs ? 'Secciones' : 'Sections'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {availableSections.map((sec, idx) => {
              const isActive = activeId === sec.id;
              const IconComp = getSectionIcon(sec.id, sec.icon);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollTo(sec.id)}
                  title={sec.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#f0f9ff' : 'transparent',
                    color: isActive ? '#0284c7' : '#475569',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.70rem', color: isActive ? '#0284c7' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px', flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <IconComp size={15} color={isActive ? (sec.accentColor || '#0284c7') : '#94a3b8'} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ 
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 750 : 550,
                        color: isActive ? '#0284c7' : '#334155',
                        lineHeight: 1.35,
                        wordBreak: 'break-word',
                        whiteSpace: 'normal'
                      }}>
                        {sec.label}
                      </span>
                      {sec.badge && (
                        <span style={{
                          alignSelf: 'flex-start',
                          fontSize: '0.66rem',
                          fontWeight: 650,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isActive ? '#e0f2fe' : '#f1f5f9',
                          color: isActive ? '#0369a1' : '#64748b',
                          lineHeight: 1.3
                        }}>
                          {sec.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  {isActive && <ChevronRight size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>



        {/* Widget 3: EU GMP Quality & Verification Seal (GCP Standard) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '1rem',
          boxShadow: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={16} color="#137333" />
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#137333', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Trazabilidad & Calidad' : 'Traceability & Quality'}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#5f6368', lineHeight: 1.4 }}>
            {isEs 
              ? 'Elaboración individualizada en salas blancas bajo normativa EU GMP. Materias primas y vehículos con control analítico HPLC.'
              : 'Compounded under cleanroom EU GMP standards with verified batch release and HPLC analytical verification.'}
          </div>
          <div style={{
            marginTop: '8px',
            padding: '5px 8px',
            borderRadius: '4px',
            background: '#e6f4ea',
            border: '1px solid #ceead6',
            color: '#137333',
            fontSize: '0.70rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>✓ Pharmapolis &amp; Fagron Standard</span>
          </div>
        </div>

      </div>

      {/* ── MOBILE SLIDE-OVER DRAWER (Opened via floating bottom bar) ── */}
      {isMobileDrawerOpen && (
        <div 
          className="pds-mobile-drawer-overlay"
          onClick={() => setIsMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            className="pds-mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '85%',
              maxWidth: '350px',
              height: '100%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              overflowY: 'auto',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.25)',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 800, color: '#003666' }}>
                <List size={16} color="#0284c7" />
                <span>{isEs ? 'Secciones del Dossier' : 'Dossier Sections'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Permanent URL Action in Mobile */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#166534" />
                <span>{isEs ? 'Expediente Clínico Digital' : 'Digital Clinical Record'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1e293b', fontWeight: 600 }}>
                {isEs ? `Expediente clínico oficial (${prescriptionCode})` : `Official clinical record (${prescriptionCode})`}
              </div>
              <button
                type="button"
                onClick={handleCopyPermanentUrl}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {copiedUrl ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedUrl ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy URL')}</span>
              </button>
            </div>

            {/* Compounding Quote Action in Mobile */}
            {!isPatientView && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('impact');
                  setIsMobileDrawerOpen(false);
                  if (onOpenQuotation) onOpenQuotation();
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                }}
              >
                <FileText size={14} />
                <span>{isEs ? 'Solicitar Cotización a Atlas' : 'Request Compounding Quote'}</span>
              </button>
            )}

            {/* TOC Sections List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                {isEs ? 'Todas las Secciones' : 'All Sections'}
              </div>
              {availableSections.map((sec, idx) => {
                const isActive = activeId === sec.id;
                const IconComp = getSectionIcon(sec.id, sec.icon);
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollTo(sec.id)}
                    title={sec.label}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isActive ? '#bae6fd' : '#e2e8f0',
                      background: isActive ? '#f0f9ff' : '#ffffff',
                      color: isActive ? '#0284c7' : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.74rem', color: isActive ? '#0284c7' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px', flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <IconComp size={15} color={isActive ? '#0284c7' : '#64748b'} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{
                          fontSize: '0.84rem',
                          fontWeight: isActive ? 750 : 550,
                          lineHeight: 1.35,
                          wordBreak: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          {sec.label}
                        </span>
                        {sec.badge && (
                          <span style={{
                            alignSelf: 'flex-start',
                            fontSize: '0.68rem',
                            fontWeight: 650,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: isActive ? '#e0f2fe' : '#f1f5f9',
                            color: isActive ? '#0369a1' : '#64748b'
                          }}>
                            {sec.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && <ChevronRight size={15} color="#0284c7" style={{ marginTop: '3px', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Registered Patient Summary in Mobile Drawer */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.86rem',
                flexShrink: 0
              }}>
                {patientName?.charAt(0) || 'P'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.66rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  <span>{isEs ? 'PACIENTE' : 'PATIENT'}</span>
                  {!isAuthorizedViewer && (
                    <span style={{ fontSize: '0.58rem', background: '#f1f5f9', color: '#475569', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                      🔒 DHA/HIPAA
                    </span>
                  )}
                </div>
                <div 
                  title={patientName || 'Patient'}
                  style={{ 
                    fontSize: '0.90rem', 
                    fontWeight: 800, 
                    color: '#0f172a', 
                    marginTop: '1px', 
                    whiteSpace: 'normal', 
                    wordBreak: 'break-word', 
                    lineHeight: 1.32 
                  }}
                >
                  {patientName || 'Patient'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                  Ref: {prescriptionCode}
                </div>
                {isAuthorizedViewer && (patientPhone || patientEmail) && (
                  <div style={{ marginTop: '4px', fontSize: '0.68rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {patientPhone && <div>📱 {patientPhone}</div>}
                    {patientEmail && <div>✉️ {patientEmail}</div>}
                  </div>
                )}
                {isAuthorizedViewer && (
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp()}
                    style={{
                      marginTop: '6px',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MessageCircle size={12} />
                    <span>{isEs ? 'Enviar WhatsApp' : 'Send WhatsApp'}</span>
                  </button>
                )}
                {!isAuthorizedViewer && (
                  <div style={{ marginTop: '5px', fontSize: '0.66rem', color: '#64748b', lineHeight: 1.3, background: '#f8fafc', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <Link href={`/login?redirect=/rx/${prescriptionCode}`} style={{ color: '#003666', fontWeight: 700, textDecoration: 'underline' }}>
                      Sign in as Doctor
                    </Link>{' '}
                    to view nominal details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

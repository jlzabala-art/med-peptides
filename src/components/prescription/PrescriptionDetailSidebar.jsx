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
  Loader2,
  Send
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

  const formulaSections = useMemo(() => {
    return availableSections.filter(sec => sec.category === 'formula');
  }, [availableSections]);

  const moduleSections = useMemo(() => {
    return availableSections.filter(sec => sec.category !== 'formula');
  }, [availableSections]);

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR (Google Cloud Console High-Density Layout) ── */}
      <div 
        className="pds-sidebar-desktop"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        {/* 1. Unified Clinical Context Card (Patient + Prescribing Physician in 1 GCP Properties Card) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '12px 14px',
          boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Patient Header Row: Compact Avatar + Name + Subtle Inline Edit Trigger */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#e8f0fe',
              color: '#1a73e8',
              border: '1px solid #c2e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
              flexShrink: 0
            }}>
              {patientName?.charAt(0) || 'P'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <span>{isEs ? 'Paciente' : 'Patient'}</span>
                  {!isAuthorizedViewer && (
                    <span style={{ fontSize: '0.58rem', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
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
                      padding: '1px 4px',
                      color: isEditingContact ? '#0284c7' : '#64748b',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.66rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}
                  >
                    <Edit2 size={11} style={{ opacity: 0.75, flexShrink: 0 }} />
                    <span>{isEs ? (patientPhone || patientEmail ? 'Editar' : '+ Contacto') : (patientPhone || patientEmail ? 'Edit' : '+ Contact')}</span>
                  </button>
                )}
              </div>

              <div 
                title={patientName || 'Patient'}
                style={{ 
                  fontSize: '0.86rem', 
                  fontWeight: 700, 
                  color: '#202124', 
                  whiteSpace: 'normal', 
                  wordBreak: 'break-word', 
                  lineHeight: 1.3,
                  marginTop: '2px'
                }}
              >
                {patientName || 'Patient'}
              </div>
            </div>
          </div>

          {/* Current Contact Info Pills if available */}
          {isAuthorizedViewer && !isEditingContact && (patientPhone || patientEmail) && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '6px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              fontSize: '0.71rem',
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

          {/* Inline Edit Micro-Panel (Golden Rule #5 with explicit ✔️ and ❌) */}
          {isEditingContact && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
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
                    fontSize: '0.73rem',
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
                    fontSize: '0.73rem',
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

          {/* Tonal Secondary Action Row (No competing neon buttons; clean GCP secondary actions) */}
          {isAuthorizedViewer && !isEditingContact && !showWhatsAppPrompt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!patientPhone && !patientEmail && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setIsEditingContact(true);
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #dadce0',
                    fontWeight: 600,
                    fontSize: '0.70rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Phone size={11} color="#64748b" />
                  <span>{isEs ? '+ Añadir contacto' : '+ Add contact'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  handleSendWhatsApp();
                }}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  fontWeight: 650,
                  fontSize: '0.70rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'background 0.15s ease'
                }}
              >
                <MessageCircle size={12} color="#16a34a" />
                <span>{isEs ? 'Enviar por WhatsApp' : 'Send via WhatsApp'}</span>
              </button>
            </div>
          )}

          {/* Prompt when WhatsApp clicked but phone was missing */}
          {showWhatsAppPrompt && (
            <form onSubmit={handlePromptSubmitWhatsApp} style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
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
                  fontSize: '0.74rem',
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
                    background: '#16a34a',
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
            <div style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1.3, background: '#f8fafc', padding: '5px 7px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#003666', fontWeight: 600 }}>Privacy Protected:</span> Nominal record restricted.{' '}
              <Link href={`/login?redirect=/rx/${prescriptionCode}`} style={{ color: '#003666', fontWeight: 700, textDecoration: 'underline' }}>
                Doctor Sign in
              </Link>
            </div>
          )}

          {/* Embedded Prescribing Physician Row (Single Unified Card, Divided by Hairline) */}
          {doctorName && (
            <div style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isAuthorizedViewer ? (isEs ? 'Médico Prescriptor' : 'Prescribing Physician') : (isEs ? 'Práctica Médica' : 'Medical Practice')}
                </div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                  {isAuthorizedViewer 
                    ? (doctorName.startsWith('Dr') ? doctorName : `Dr. ${doctorName}`)
                    : (isEs ? 'Práctica Médica Verificada' : 'Verified Clinical Practice')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #dadce0',
                    color: '#003666',
                    fontSize: '0.68rem',
                    fontWeight: 650,
                    textDecoration: 'none',
                    flexShrink: 0
                  }}
                >
                  <span>Portal</span>
                  <ExternalLink size={11} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 2. Compounding Quote Widget (Single Primary Sidebar CTA for Doctor / Admin) */}
        {!isPatientView && (
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '11px 14px',
            boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '5px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText size={13} />
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#202124' }}>
                  {isEs ? 'Cotización Magistral' : 'Compounding Quote'}
                </div>
              </div>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 650,
                padding: '1px 6px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}>
                {isEs ? 'Bajo Demanda' : 'On-Demand'}
              </span>
            </div>

            <div style={{ fontSize: '0.70rem', color: '#5f6368', lineHeight: 1.35 }}>
              {isEs 
                ? `${formulations?.length || 1} fórmula(s) magistral(es) lista(s) para valoración por Atlas Services.`
                : `${formulations?.length || 1} compounded formula(s) ready for review by Atlas Services.`}
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
                background: '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              <FileText size={13} />
              <span>{isEs ? 'Solicitar Cotización' : 'Request Compounding Quote'}</span>
            </button>
          </div>
        )}

        {/* 3. Google Cloud Minimalist "ON THIS PAGE" Rail Navigation (Grouped: Formulas vs Dossier Modules) */}
        <nav
          aria-label={isEs ? 'En este dossier' : 'On this dossier'}
          style={{
            padding: '4px 2px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '4px'
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEs ? 'EN ESTE DOSSIER' : 'ON THIS DOSSIER'}
            </span>
          </div>

          {/* Group A: Active Regimen Formulations */}
          {formulaSections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 0 4px 10px' }}>
                {isEs ? 'Fórmulas Prescritas' : 'Compounded Formulas'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '2px solid #e2e8f0', marginLeft: '4px' }}>
                {formulaSections.map((sec) => {
                  const isActive = activeGcpTab === 'treatment' && activeId === sec.id;
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
                         gap: '7px',
                        width: '100%',
                        padding: '5px 8px 5px 10px',
                        marginLeft: '-2px',
                        border: 'none',
                        borderLeft: isActive ? '2px solid #0284c7' : '2px solid transparent',
                        background: isActive ? 'rgba(2, 132, 199, 0.06)' : 'transparent',
                        color: isActive ? '#0284c7' : '#3c4043',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        borderRadius: '0 6px 6px 0'
                      }}
                    >
                      <IconComp size={13} color={isActive ? '#0284c7' : '#64748b'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#0284c7' : '#3c4043',
                          lineHeight: 1.3,
                          wordBreak: 'break-word'
                        }}>
                          {sec.label}
                        </span>
                        {sec.badge && (
                          <span style={{ fontSize: '0.64rem', color: isActive ? '#0369a1' : '#64748b', fontWeight: 500 }}>
                            {sec.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group B: Dossier Sections / Tabs */}
          {moduleSections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 0 4px 10px' }}>
                {isEs ? 'Módulos del Expediente' : 'Dossier Modules'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '2px solid #e2e8f0', marginLeft: '4px' }}>
                {moduleSections.map((sec) => {
                  const mappedTab = SECTION_TO_TAB[sec.id];
                  const isActive = (mappedTab && activeGcpTab === mappedTab) || activeId === sec.id;
                  const IconComp = getSectionIcon(sec.id, sec.icon);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollTo(sec.id)}
                      title={sec.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        width: '100%',
                        padding: '5px 8px 5px 10px',
                        marginLeft: '-2px',
                        border: 'none',
                        borderLeft: isActive ? '2px solid #0284c7' : '2px solid transparent',
                        background: isActive ? 'rgba(2, 132, 199, 0.06)' : 'transparent',
                        color: isActive ? '#0284c7' : '#5f6368',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        borderRadius: '0 6px 6px 0'
                      }}
                    >
                      <IconComp size={13} color={isActive ? '#0284c7' : '#94a3b8'} style={{ flexShrink: 0 }} />
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#0284c7' : '#3c4043',
                        lineHeight: 1.3,
                        wordBreak: 'break-word'
                      }}>
                        {sec.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

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

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Mail,
  Send,
  Check,
  Building2,
  FlaskConical,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAlgoliaSearch } from '@/hooks/data/useAlgoliaSearch';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';

const INQUIRY_TOPICS = [
  {
    id: 'coa_specs',
    labelEn: 'Analytical CoA & Batch Purity Verification',
    labelEs: 'Certificado de Análisis (CoA) y Pureza de Lote',
    icon: ShieldCheck,
    placeholderEn: 'Please specify required lot numbers, HPLC/MS test requirements, or analytical documentation needed...',
    placeholderEs: 'Indique número de lote, requerimientos de ensayos HPLC/MS o documentación analítica necesaria...'
  },
  {
    id: 'clinical_dosing',
    labelEn: 'Clinical Dosing, Titration & Protocols',
    labelEs: 'Dosificación Clínica, Titulación y Protocolos',
    icon: FileText,
    placeholderEn: 'Describe your clinical application, patient population context, or titration schedule query...',
    placeholderEs: 'Describa su aplicación clínica, perfil de pacientes o consulta sobre pauta de titulación...'
  },
  {
    id: 'wholesale_access',
    labelEn: 'Wholesale Pricing & Practitioner Account',
    labelEs: 'Tarifas Mayoristas y Cuenta Profesional',
    icon: Building2,
    placeholderEn: 'Tell us about your clinic volume, compounding frequency, or wholesale onboarding questions...',
    placeholderEs: 'Indique volumen estimado de su clínica, frecuencia de formulación o dudas de registro...'
  },
  {
    id: 'custom_synthesis',
    labelEn: 'Custom Peptide Synthesis & Lyophilization',
    labelEs: 'Síntesis Personalizada y Liofilización',
    icon: FlaskConical,
    placeholderEn: 'Specify amino acid sequence, desired mass (mg/g), purity threshold (≥98-99%), and salt form...',
    placeholderEs: 'Especifique secuencia de aminoácidos, masa requerida (mg/g), pureza mínima y sal deseada...'
  },
  {
    id: 'general_inquiry',
    labelEn: 'General Institutional Inquiry',
    labelEs: 'Consulta Institucional General',
    icon: Mail,
    placeholderEn: 'How can the Med-Peptides medical & scientific affairs desk assist your practice?',
    placeholderEs: '¿En qué puede asistirle el equipo médico y científico de Med-Peptides?'
  }
];


export default function PublicInstitutionalInquiryDrawer({
  isOpen = false,
  onClose,
  contextType = 'general', // 'product' | 'protocol' | 'catalog' | 'protocols_directory' | 'general'
  initialEntity = null,    // { name, slug, code, strength, category }
  lang = 'en'
}) {
  const [topic, setTopic] = useState(() => {
    if (contextType === 'product') return 'coa_specs';
    if (contextType === 'protocol') return 'clinical_dosing';
    if (contextType === 'catalog') return 'wholesale_access';
    return 'general_inquiry';
  });

  const [attachedEntity, setAttachedEntity] = useState(initialEntity);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [organization, setOrganization] = useState('');
  const [phonePrefix, setPhonePrefix] = useState(() => (lang === 'es' ? '+34' : '+1'));
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = useMemo(() => {
    if (!email.trim()) return false;
    return EMAIL_REGEX.test(email.trim());
  }, [email]);

  // Algolia Search states for attaching compounds / protocols dynamically
  const [searchTab, setSearchTab] = useState(contextType === 'protocols_directory' ? 'protocols' : 'products');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingEntity, setIsSearchingEntity] = useState(false);

  // Sync initial entity if provided
  useEffect(() => {
    if (initialEntity) {
      setAttachedEntity(initialEntity);
    }
  }, [initialEntity]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Algolia hook for products
  const { hits: productHits, loading: productsLoading } = useAlgoliaSearch(
    'products',
    searchTab === 'products' ? searchQuery : '',
    { hitsPerPage: 5 }
  );

  // Algolia hook for protocols
  const { hits: protocolHits, loading: protocolsLoading } = useAlgoliaSearch(
    'protocols',
    searchTab === 'protocols' ? searchQuery : '',
    { hitsPerPage: 5 }
  );

  const activeTopicObj = useMemo(() => {
    return INQUIRY_TOPICS.find(t => t.id === topic) || INQUIRY_TOPICS[4];
  }, [topic]);

  // Generate pre-filled mailto link for 1-click email client fallback
  const mailtoUrl = useMemo(() => {
    const entityLabel = attachedEntity ? ` [Ref: ${attachedEntity.code || attachedEntity.name}]` : '';
    const subject = encodeURIComponent(`Institutional Inquiry: ${activeTopicObj.labelEn}${entityLabel}`);
    const formattedPhone = phoneNumber.trim() ? `${phonePrefix} ${phoneNumber.trim()}` : '';
    const bodyLines = [
      `From: ${name || 'Prospective Healthcare Practitioner'}`,
      `Organization: ${organization || 'Clinical Practice'}`,
      `Email: ${email || 'N/A'}`,
      `Phone/WhatsApp: ${formattedPhone || 'N/A'}`,
      `Topic: ${activeTopicObj.labelEn}`,
      attachedEntity ? `Referenced Resource: ${attachedEntity.name} (${attachedEntity.code || attachedEntity.slug || ''})` : null,
      '',
      '--- Inquiry Details ---',
      message || '(Inquiry text)',
      '',
      `Source Page: ${typeof window !== 'undefined' ? window.location.href : ''}`,
      'Sent via Med-Peptides Institutional Portal'
    ].filter(Boolean).join('\n');

    return `mailto:business@med-peptides.com?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;
  }, [name, organization, email, phonePrefix, phoneNumber, activeTopicObj, attachedEntity, message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(lang === 'es' ? 'Por favor complete su nombre, email y mensaje.' : 'Please provide your name, professional email, and inquiry.');
      return;
    }

    if (!isEmailValid) {
      setEmailTouched(true);
      toast.error(lang === 'es' ? 'Por favor introduzca un email profesional válido.' : 'Please enter a valid professional email address.');
      return;
    }

    const formattedPhone = phoneNumber.trim() ? `${phonePrefix} ${phoneNumber.trim()}` : '';

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/portal/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          phone: formattedPhone,
          topic,
          message: message.trim(),
          contextType,
          attachedEntity,
          sourceUrl: typeof window !== 'undefined' ? window.location.href : ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        triggerHaptic('success');
        toast.success(
          lang === 'es'
            ? 'Consulta enviada a business@med-peptides.com. Le responderemos en breve.'
            : 'Inquiry submitted to business@med-peptides.com. Medical affairs will respond shortly.'
        );
      } else {
        throw new Error(data.error || 'Submission error');
      }
    } catch (err) {
      console.warn('Inquiry API relay fallback:', err);
      // Fallback: invite user to open default mailto client
      window.location.href = mailtoUrl;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        transition: 'opacity 0.2s ease-in-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Institutional Inquiry Drawer"
    >
      {/* ── Slide-over Container (GCP Drawer Design) ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 32px rgba(0, 54, 102, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'pdsSlideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.15rem 1.4rem',
            background: '#003666',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', letterSpacing: '-0.01em' }}>
                {lang === 'es' ? 'Consulta Médica e Institucional' : 'Institutional & Clinical Inquiry'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#a7f3d0', fontWeight: 700 }}>●</span>
                <span>
                  {lang === 'es' ? 'Mesa Oficial de Asuntos Médicos & Científicos' : 'Official Medical & Scientific Affairs Desk'}
                </span>
                <span>•</span>
                <span style={{ color: '#bae6fd' }}>
                  {lang === 'es' ? 'Canal Institucional' : 'Verified Channel'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            aria-label="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.4rem' }}>
          {isSuccess ? (
            <div
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a'
                }}
              >
                <Check size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  {lang === 'es' ? 'Consulta Registrada con Éxito' : 'Inquiry Successfully Received'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  {lang === 'es'
                    ? 'Su mensaje ha sido remitido con acuse de recibo a la Mesa Científica Oficial de Med-Peptides. Un enlace médico colegiado se pondrá en contacto en un plazo máximo de 24 horas laborables.'
                    : 'Your inquiry has been securely routed to the Med-Peptides Official Medical & Scientific Affairs Desk. A medical liaison will follow up within 24 business hours.'}
                </p>
              </div>

              <div
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.78rem',
                  color: '#475569',
                  textAlign: 'left',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  {lang === 'es' ? 'Resumen de Envío:' : 'Transmission Summary:'}
                </div>
                <div><strong>{lang === 'es' ? 'Remitente:' : 'Contact:'}</strong> {name} ({email})</div>
                {organization && <div><strong>{lang === 'es' ? 'Institución:' : 'Institution:'}</strong> {organization}</div>}
                <div><strong>{lang === 'es' ? 'Tema:' : 'Topic:'}</strong> {lang === 'es' ? activeTopicObj.labelEs : activeTopicObj.labelEn}</div>
                {attachedEntity && <div><strong>{lang === 'es' ? 'Referencia:' : 'Reference:'}</strong> {attachedEntity.name}</div>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleResetForm}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'es' ? 'Enviar Otra Consulta' : 'Submit Another Inquiry'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    background: '#003666',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'es' ? 'Cerrar' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Context Attachment (Pre-selected or Algolia Search) */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'es' ? 'Recurso Clínico Vinculado' : 'Referenced Clinical Asset'}
                  </span>
                  {attachedEntity ? (
                    <button
                      type="button"
                      onClick={() => setAttachedEntity(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {lang === 'es' ? 'Desvincular' : 'Detach'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSearchingEntity(!isSearchingEntity)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Search size={12} />
                      {isSearchingEntity 
                        ? (lang === 'es' ? 'Cerrar Buscador' : 'Close Search') 
                        : (lang === 'es' ? '+ Buscar Péptido / Protocolo con Algolia' : '+ Attach Compound / Protocol via Algolia')}
                    </button>
                  )}
                </div>

                {attachedEntity ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      color: '#1e40af'
                    }}
                  >
                    <FlaskConical size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1e3a8a', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        {attachedEntity.name}
                      </div>
                      {attachedEntity.strength && (
                        <div style={{ fontSize: '0.74rem', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
                          {lang === 'es' ? 'Dosis/Concentración:' : 'Strength/Dose:'} {attachedEntity.strength}
                        </div>
                      )}
                    </div>
                    {attachedEntity.code && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 750, background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', color: '#1d4ed8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {attachedEntity.code}
                      </span>
                    )}
                  </div>
                ) : isSearchingEntity ? (
                  <div>
                    {/* Algolia Selector Tabs */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSearchTab('products')}
                        style={{
                          flex: 1,
                          padding: '0.3rem',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: searchTab === 'products' ? '#0284c7' : '#cbd5e1',
                          background: searchTab === 'products' ? '#eff6ff' : '#ffffff',
                          color: searchTab === 'products' ? '#0284c7' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          cursor: 'pointer'
                        }}
                      >
                        {lang === 'es' ? 'Péptidos' : 'Products'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchTab('protocols')}
                        style={{
                          flex: 1,
                          padding: '0.3rem',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: searchTab === 'protocols' ? '#0284c7' : '#cbd5e1',
                          background: searchTab === 'protocols' ? '#eff6ff' : '#ffffff',
                          color: searchTab === 'protocols' ? '#0284c7' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          cursor: 'pointer'
                        }}
                      >
                        {lang === 'es' ? 'Protocolos' : 'Protocols'}
                      </button>
                    </div>

                    {/* Algolia Search Input */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          searchTab === 'products'
                            ? (lang === 'es' ? 'Buscar producto (ej. BPC-157, Semaglutide)...' : 'Search product (e.g. BPC-157, Semaglutide)...')
                            : (lang === 'es' ? 'Buscar protocolo (ej. WMT-001, Wolverine)...' : 'Search protocol (e.g. Wolverine, Metabolic)...')
                        }
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem 0.45rem 2rem',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>

                    {/* Algolia Instant Results List */}
                    {searchQuery.trim().length > 1 && (
                      <div
                        style={{
                          marginTop: '6px',
                          maxHeight: '140px',
                          overflowY: 'auto',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                        }}
                      >
                        {(productsLoading || protocolsLoading) && (
                          <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.74rem', color: '#64748b' }}>
                            <Loader2 size={14} className="pds-spinner" style={{ display: 'inline', marginRight: '4px' }} />
                            {lang === 'es' ? 'Consultando índice Algolia...' : 'Searching Algolia index...'}
                          </div>
                        )}

                        {searchTab === 'products' && (
                          productHits.length > 0 ? (
                            productHits.map(h => (
                              <div
                                key={h.objectID || h.id}
                                onClick={() => {
                                  setAttachedEntity({
                                    id: h.objectID || h.id,
                                    name: h.name || h.title,
                                    slug: h.slug || h.id,
                                    strength: h.strength || '',
                                    category: h.category || ''
                                  });
                                  setIsSearchingEntity(false);
                                  setSearchQuery('');
                                }}
                                style={{
                                  padding: '0.45rem 0.65rem',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                              >
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{h.name || h.title}</span>
                                <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>+ Attach</span>
                              </div>
                            ))
                          ) : (
                            !productsLoading && (
                              <div style={{ padding: '0.5rem', fontSize: '0.74rem', color: '#94a3b8', textAlign: 'center' }}>
                                {lang === 'es' ? 'Sin resultados en catálogo' : 'No compounds matched'}
                              </div>
                            )
                          )
                        )}

                        {searchTab === 'protocols' && (
                          protocolHits.length > 0 ? (
                            protocolHits.map(h => (
                              <div
                                key={h.objectID || h.id}
                                onClick={() => {
                                  setAttachedEntity({
                                    id: h.objectID || h.id,
                                    name: h.name || h.title,
                                    slug: h.slug || h.id,
                                    code: h.protocol_id || h.code || '',
                                    category: h.category || ''
                                  });
                                  setIsSearchingEntity(false);
                                  setSearchQuery('');
                                }}
                                style={{
                                  padding: '0.45rem 0.65rem',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                              >
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{h.name || h.title}</span>
                                <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>+ Attach</span>
                              </div>
                            ))
                          ) : (
                            !protocolsLoading && (
                              <div style={{ padding: '0.5rem', fontSize: '0.74rem', color: '#94a3b8', textAlign: 'center' }}>
                                {lang === 'es' ? 'Sin resultados en protocolos' : 'No protocols matched'}
                              </div>
                            )
                          )
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {lang === 'es' 
                      ? 'Consulta institucional general sobre el compendio de péptidos o registro clínico.' 
                      : 'General institutional inquiry regarding catalog synthesis, wholesale accounts, or clinical guidelines.'}
                  </div>
                )}
              </div>

              {/* Inquiry Classification Topics */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}>
                  {lang === 'es' ? 'Clasificación de la Consulta *' : 'Inquiry Classification *'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.35rem' }}>
                  {INQUIRY_TOPICS.map(t => {
                    const isSelected = topic === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTopic(t.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #003666' : '1px solid #e2e8f0',
                          background: isSelected ? '#f0fdf4' : '#ffffff',
                          color: isSelected ? '#003666' : '#334155',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={14} style={{ color: isSelected ? '#0284c7' : '#64748b', flexShrink: 0 }} />
                        <span>{lang === 'es' ? t.labelEs : t.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {lang === 'es' ? 'Nombre Completo *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Carlos Méndez"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                      {lang === 'es' ? 'Email Profesional *' : 'Professional Email *'}
                    </label>
                    {emailTouched && email.trim() && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 750, color: isEmailValid ? '#16a34a' : '#dc2626' }}>
                        {isEmailValid 
                          ? (lang === 'es' ? '✓ Válido' : '✓ Valid format') 
                          : (lang === 'es' ? '⚠ Formato incorrecto' : '⚠ Invalid format')}
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="practitioner@clinic.com"
                      style={{
                        width: '100%',
                        padding: '0.5rem 2rem 0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: `1.5px solid ${emailTouched && email.trim() ? (isEmailValid ? '#16a34a' : '#dc2626') : '#cbd5e1'}`,
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff'
                      }}
                    />
                    {emailTouched && email.trim() && (
                      <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                        {isEmailValid ? (
                          <Check size={14} color="#16a34a" />
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.80rem' }}>!</span>
                        )}
                      </span>
                    )}
                  </div>
                  {emailTouched && email.trim() && !isEmailValid && (
                    <div style={{ fontSize: '0.68rem', color: '#dc2626', marginTop: '3px' }}>
                      {lang === 'es' ? 'Introduce una dirección de email válida.' : 'Please enter a valid professional email address.'}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    {lang === 'es' ? 'Clínica / Institución' : 'Clinic / Institution'}
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder={lang === 'es' ? 'Centro de Medicina Regenerativa' : 'Regenerative Medical Center'}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    {lang === 'es' ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'}
                  </label>
                  <InternationalPhoneInput
                    phonePrefix={phonePrefix}
                    onPrefixChange={setPhonePrefix}
                    phoneNumber={phoneNumber}
                    onPhoneNumberChange={setPhoneNumber}
                    lang={lang}
                    countryHint={lang === 'es' ? 'ES' : 'US'}
                  />
                </div>
              </div>

              {/* Message Details (GCP Form Guidelines: permanent helper text + clean placeholder) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                    {lang === 'es' ? 'Detalle de la Consulta *' : 'Inquiry Specifications *'}
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {message.length > 0 ? `${message.length} chars` : (lang === 'es' ? 'Mín. 10 caracteres' : 'Min. 10 chars')}
                  </span>
                </div>
                
                {/* Visible descriptive helper text above textarea according to GCP standards */}
                <div style={{ fontSize: '0.73rem', color: '#475569', marginBottom: '0.45rem', lineHeight: 1.4, backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  ℹ {lang === 'es' ? activeTopicObj.placeholderEs : activeTopicObj.placeholderEn}
                </div>

                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    lang === 'es'
                      ? 'Escriba aquí los detalles de su consulta clínica o requerimientos...'
                      : 'Enter your clinical inquiry, dosing query, or specific requirements...'
                  }
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Direct Institutional Routing Note */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.72rem',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span>
                  {lang === 'es'
                    ? 'Canal Directo Institucional • Triaje y respuesta médica colegiada < 24h laborables.'
                    : 'Direct Institutional Desk • Average clinical triage & response < 24h.'}
                </span>
              </div>

              {/* Action Buttons Sticky Footer (Google Cloud Drawer Standard) */}
              <div
                style={{
                  position: 'sticky',
                  bottom: '-1.4rem',
                  background: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  padding: '0.9rem 1.4rem',
                  margin: '1.25rem -1.4rem -1.4rem -1.4rem',
                  boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  zIndex: 20
                }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    background: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="pds-spinner" />
                      <span>{lang === 'es' ? 'Enviando consulta...' : 'Transmitting inquiry...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{lang === 'es' ? 'Enviar Consulta Institucional' : 'Submit Institutional Inquiry'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

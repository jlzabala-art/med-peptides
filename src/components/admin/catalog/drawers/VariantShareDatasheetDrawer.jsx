'use client';

import React, { useState, useEffect, useMemo } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import UniversalRecipientCombobox from '@/components/shared/UniversalRecipientCombobox';
import { useActiveWorkspaceBinding } from '@/hooks/useActiveWorkspaceBinding';
import { QRCodeSVG } from 'qrcode.react';
import notifier from '@/services/NotificationService';
import { 
  FileText, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Mail, 
  QrCode, 
  User, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Lock, 
  Eye, 
  Send,
  FlaskConical,
  RefreshCw,
  Package
} from 'lucide-react';

/**
 * VariantShareDatasheetDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified 2-stage action drawer for clinical variant technical datasheets:
 * 
 * Stage 1: Variant Verification & Parameters (Locked)
 *   - Variant details (Compound, Dose, Supplier, Format, Batch / Vial Code)
 *   - Direct "Live Datasheet Preview" link
 *   - Language selector (EN, ES, PT)
 * 
 * Stage 2: Recipient Assignment (Mandatory primary flow)
 *   - Inherits recipient automatically from Active Workspace
 *   - UniversalRecipientCombobox (42px compact GCP search) replaces bulky card selectors
 * 
 * Output:
 *   - Unique, tracked short URL (/d/[code]) bound to recipient and variant
 *   - Logged into recipient user profile subcollection (users/{userId}/shared_datasheets)
 *   - Synced with central shared_records and shared_catalog_links for CRM User360
 *   - Quick-share actions: WhatsApp, Mail, Copy, QR Code
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function VariantShareDatasheetDrawer({
  isOpen,
  onClose,
  variant = {},
  selectedProduct = {},
  currentVialCode = '',
  initialRecipient = null,
}) {
  const productSlug = selectedProduct?.slug || selectedProduct?.id || '';
  const { workspaceRecipient, hasRecipient } = useActiveWorkspaceBinding({
    productId: productSlug,
  });

  const [recipientMode, setRecipientMode] = useState('concrete'); // 'concrete' | 'generic'
  const [selectedLang, setSelectedLang] = useState('en');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Recipient state - Priority: initialRecipient > workspaceRecipient > fallback
  const [recipient, setRecipient] = useState(() => {
    if (initialRecipient) return initialRecipient;
    if (workspaceRecipient) return workspaceRecipient;
    return {
      type: 'doctor',
      id: null,
      name: '',
      company: '',
      email: '',
      phone: '',
      notes: '',
    };
  });

  // Tracked short link state
  const [generatedShortUrl, setGeneratedShortUrl] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSavedInUserProfile, setIsSavedInUserProfile] = useState(false);

  const productName = selectedProduct?.canonicalName || selectedProduct?.name || 'Peptide Compound';
  const dose = variant?.dosage || variant?.dose || '';
  const supplierName = variant?.supplierName || variant?.supplier || selectedProduct?.supplier || 'Standard';
  const formatName = variant?.format || variant?.presentation || 'vial';
  const vialCode = currentVialCode || variant?.vialCode || variant?.id || 'BATCH-STD';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';

  // Auto-bind recipient on open if not already customized
  useEffect(() => {
    if (isOpen) {
      if (initialRecipient) {
        setRecipient(initialRecipient);
      } else if (!recipient.name && !recipient.id && workspaceRecipient) {
        setRecipient(workspaceRecipient);
      }
    }
  }, [isOpen, initialRecipient, workspaceRecipient, recipient.name, recipient.id]);

  // Canonical target URL for live web preview
  const liveTargetUrl = useMemo(() => {
    const qParams = new URLSearchParams();
    if (variant?.format) qParams.set('format', variant.format);
    if (dose) qParams.set('dose', dose);
    if (variant?.supplierId || variant?.supplier) qParams.set('supplier', variant.supplierId || variant.supplier);
    if (vialCode) qParams.set('batch', vialCode);
    if (selectedLang && selectedLang !== 'en') qParams.set('lang', selectedLang);
    const qStr = qParams.toString();
    return `${origin}/p/${encodeURIComponent(productSlug)}${qStr ? `?${qStr}` : ''}`;
  }, [origin, productSlug, variant, dose, vialCode, selectedLang]);

  // Reset when drawer opens
  useEffect(() => {
    if (isOpen) {
      setCopiedLink(false);
      setShowQr(false);
      setGeneratedShortUrl('');
      setGeneratedCode('');
      setIsSavedInUserProfile(false);
      // Auto-generate initial tracked short URL
      generateShortUrl();
    }
  }, [isOpen, recipientMode, recipient.id, recipient.type, recipient.name, recipient.phone, recipient.email, selectedLang]);

  const generateShortUrl = async (channel = 'web_share') => {
    if (!productSlug) return liveTargetUrl;
    setIsGenerating(true);

    try {
      const payloadRecipient = recipientMode === 'concrete'
        ? {
            id: recipient.id || null,
            name: recipient.name || 'Healthcare Practitioner',
            company: recipient.company || '',
            email: recipient.email || '',
            phone: recipient.phone || '',
            type: recipient.type || 'doctor',
          }
        : {
            id: null,
            name: 'Public / Generic Visitor',
            company: '',
            email: '',
            phone: '',
            type: 'generic',
          };

      const res = await fetch('/api/short-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: liveTargetUrl,
          slug: productSlug,
          dose,
          format: formatName,
          supplier: supplierName,
          batch: vialCode,
          lang: selectedLang,
          productName,
          recipient: payloadRecipient,
          variant: {
            id: variant?.id,
            productId: productSlug,
            productName,
            dose,
            format: formatName,
            supplier: supplierName,
            batch: vialCode,
          },
          deliveryChannel: channel,
          notes: recipient.notes || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedShortUrl(data.shortUrl);
        setGeneratedCode(data.code);
        setIsSavedInUserProfile(Boolean(payloadRecipient.id));
        return data.shortUrl;
      } else {
        // Fallback to live URL if short-url service fails
        setGeneratedShortUrl(liveTargetUrl);
        return liveTargetUrl;
      }
    } catch (err) {
      console.warn('Failed to generate tracked short URL:', err);
      setGeneratedShortUrl(liveTargetUrl);
      return liveTargetUrl;
    } finally {
      setIsGenerating(false);
    }
  };

  const effectiveUrl = generatedShortUrl || liveTargetUrl;

  const handleCopy = async () => {
    const finalUrl = generatedShortUrl || await generateShortUrl('copy_link');
    await navigator.clipboard.writeText(finalUrl);
    setCopiedLink(true);
    notifier.success('Enlace corto copiado al portapapeles ✓');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const composeWhatsAppMessage = (urlToUse) => {
    const url = urlToUse || effectiveUrl;
    const isEs = selectedLang === 'es';
    const isPt = selectedLang === 'pt';
    const recipientGreeting = recipient.name 
      ? (isEs ? `Estimado/a ${recipient.name},\n\n` : isPt ? `Prezado(a) ${recipient.name},\n\n` : `Dear ${recipient.name},\n\n`)
      : '';

    const intro = isEs 
      ? `Le comparto la ficha técnica analítica oficial de ${productName} (${dose || 'Estándar'} - ${supplierName}):`
      : isPt
      ? `Compartilho a ficha técnica analítica oficial de ${productName} (${dose || 'Padrão'} - ${supplierName}):`
      : `Please find the official clinical monograph and analytical specifications for ${productName} (${dose || 'Standard'} - ${supplierName}):`;

    const batchText = vialCode ? `\n🏷️ Lote / Vial Code: ${vialCode}` : '';
    const footer = isEs
      ? '\n\nQuedo a su disposición para cualquier consulta de dosificación o pedido.'
      : isPt
      ? '\n\nFico à disposição para qualquer dúvida ou pedido.'
      : '\n\nPlease feel free to contact us for dosing inquiries or supply orders.';

    return `${recipientGreeting}${intro}${batchText}\n\n🔗 ${url}${footer}`;
  };

  const handleShareWhatsApp = async () => {
    const finalUrl = generatedShortUrl || await generateShortUrl('whatsapp');
    const msg = composeWhatsAppMessage(finalUrl);
    const cleanPhone = (recipient.phone || '').replace(/[^\d]/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    notifier.success('WhatsApp abierto con enlace corto personalizado ✓');
  };

  const handleShareEmail = async () => {
    const finalUrl = generatedShortUrl || await generateShortUrl('email');
    const subject = `ATLAS HEALTH — Ficha Técnica Oficial: ${productName} ${dose}`;
    const body = composeWhatsAppMessage(finalUrl);
    const to = recipient.email || '';
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir Ficha Técnica Clínica"
      subtitle="Operación en 2 etapas: verificación de variante y asignación de destinatario"
      width="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ── STAGE 1: Parámetros de la Variante (Bloqueada) ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#003666',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.70rem',
                fontWeight: 700
              }}>
                1
              </div>
              <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
                Ficha Técnica de la Variante
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.65rem',
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                <Lock size={10} /> Parámetros Bloqueados
              </span>
            </div>

            {/* Live Preview Button */}
            <a
              href={liveTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 650,
                color: '#0284c7',
                textDecoration: 'none',
                padding: '3px 8px',
                borderRadius: '5px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd'
              }}
              title="Abrir vista previa pública en pestaña nueva"
            >
              <Eye size={12} />
              <span>Ver Ficha en Vivo</span>
              <ExternalLink size={10} />
            </a>
          </div>

          {/* Details Body */}
          <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Compuesto</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>{productName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Concentración / Dosis</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666' }}>{dose || 'Dosis única'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Laboratorio / Proveedor</div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={12} color="#64748b" /> {supplierName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Formato / Vial Code</div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={12} color="#64748b" />
                  <code style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                    {vialCode}
                  </code>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={13} color="#64748b" /> Idioma de la ficha:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { code: 'en', label: '🇬🇧 EN' },
                  { code: 'es', label: '🇪🇸 ES' },
                  { code: 'pt', label: '🇵🇹 PT' }
                ].map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setSelectedLang(l.code)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: selectedLang === l.code ? 700 : 500,
                      borderRadius: '4px',
                      border: selectedLang === l.code ? '1px solid #003666' : '1px solid #e2e8f0',
                      backgroundColor: selectedLang === l.code ? '#003666' : '#ffffff',
                      color: selectedLang === l.code ? '#ffffff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── STAGE 2: Asignación de Destinatario ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#003666',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.70rem',
                fontWeight: 700
              }}>
                2
              </div>
              <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
                Asignación del Destinatario
              </span>
            </div>

            {/* Recipient Mode Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#e2e8f0',
              padding: '2px',
              borderRadius: '6px',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => setRecipientMode('concrete')}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.70rem',
                  fontWeight: recipientMode === 'concrete' ? 700 : 500,
                  backgroundColor: recipientMode === 'concrete' ? '#ffffff' : 'transparent',
                  color: recipientMode === 'concrete' ? '#0f172a' : '#64748b',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                👤 Destinatario Concreto
              </button>
              <button
                type="button"
                onClick={() => setRecipientMode('generic')}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.70rem',
                  fontWeight: recipientMode === 'generic' ? 700 : 500,
                  backgroundColor: recipientMode === 'generic' ? '#ffffff' : 'transparent',
                  color: recipientMode === 'generic' ? '#0f172a' : '#64748b',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🌐 Enlace Genérico
              </button>
            </div>
          </div>

          <div style={{ padding: '0.85rem' }}>
            {recipientMode === 'concrete' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                  Seleccione un médico, mayorista o paciente registrado para generar un <strong>enlace corto único</strong> y registrar el envío en su perfil de usuario:
                </div>

                <UniversalRecipientCombobox
                  value={recipient}
                  onChange={(updated) => setRecipient(updated)}
                  allowedTypes={['doctor', 'patient', 'wholeseller', 'clinic']}
                  workspaceId={workspaceRecipient?.workspaceId}
                />
              </div>
            ) : (
              <div style={{
                padding: '0.85rem',
                backgroundColor: '#fffbeb',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <Globe size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.74rem', color: '#92400e', lineHeight: 1.4 }}>
                  <strong>Modo Enlace Genérico / Público:</strong> Este enlace no estará vinculado a ningún perfil de usuario específico ni registrará apertura en un CRM de cliente. Úselo únicamente para difusión general o redes.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── STAGE 3: Enlace Corto Trackeado & Canales de Envío ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Tracking Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#003666" /> Enlace Corto con Telemetría
            </span>

            {isGenerating ? (
              <span style={{ fontSize: '0.70rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={11} className="animate-spin" /> Generando enlace seguro...
              </span>
            ) : isSavedInUserProfile ? (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#166534',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '2px 7px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle2 size={11} color="#16a34a" /> Registrado en perfil de usuario
              </span>
            ) : (
              <span style={{
                fontSize: '0.68rem',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '2px 7px',
                borderRadius: '4px'
              }}>
                Enlace Anónimo / Genérico
              </span>
            )}
          </div>

          {/* Short URL Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '4px 6px',
            gap: '8px'
          }}>
            <input
              type="text"
              readOnly
              value={effectiveUrl}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.80rem',
                color: '#0f172a',
                fontFamily: 'monospace',
                outline: 'none',
                padding: '4px'
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: copiedLink ? '#16a34a' : '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copiedLink ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Action Dispatch Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(37,211,102,0.2)'
              }}
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleShareEmail}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              <Mail size={14} color="#0284c7" />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQr(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: showQr ? '#f1f5f9' : '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              <QrCode size={14} color="#475569" />
              <span>{showQr ? 'Ocultar QR' : 'Ver QR'}</span>
            </button>
          </div>

          {/* High-Res QR View */}
          {showQr && effectiveUrl && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              gap: '0.5rem'
            }}>
              <QRCodeSVG value={effectiveUrl} size={160} level="M" />
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                Escanee para abrir la ficha técnica verificada en dispositivo móvil
              </div>
            </div>
          )}

          {/* Telemetry Footnote */}
          <div style={{
            fontSize: '0.68rem',
            color: '#64748b',
            lineHeight: 1.4,
            paddingTop: '0.5rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            🔒 <strong>Confirmación de lectura automática:</strong> Cada visita registra fecha/hora y número de aperturas. Si el destinatario solicita información técnica o acepta el boletín clínico, la interacción se asocia directamente a su ficha de cliente.
          </div>
        </div>

      </div>
    </StandardDrawer>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import RecipientHierarchySelector from '@/components/shared/RecipientHierarchySelector';
import { QRCodeSVG } from 'qrcode.react';
import notifier from '@/services/NotificationService';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Building2, 
  User, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  QrCode,
  Send,
  Mail,
  Loader2,
  Package
} from '@/lib/icons';

/**
 * QuickShareDatasheetModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Converted to StandardDrawer conforming to GCP standards and AGENTS.md rules:
 * - Dynamic products from Firestore API (replaces legacy hardcoded compounds).
 * - Full Recipient Hierarchy Selector (Doctor, Wholesaler, Patient, Client).
 * - Issues tracked short URL (/d/[code]) bound to the recipient.
 * - Records dispatch into users/{userId}/shared_datasheets subcollection.
 * - Real-time telemetry, read receipts, and CRM sync.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function QuickShareDatasheetModal({
  isOpen,
  onClose,
  item = null,
  activeWs = null,
  initialRecipient = null,
}) {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [selectedDose, setSelectedDose] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');

  const [recipientMode, setRecipientMode] = useState('concrete'); // 'concrete' | 'generic'
  const [recipient, setRecipient] = useState({
    type: 'wholeseller',
    id: null,
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Load dynamic catalog products if item is not preselected
  useEffect(() => {
    if (isOpen && !item) {
      setIsLoadingProducts(true);
      fetch('/api/catalog/summary?limit=30')
        .then((res) => res.json())
        .then((data) => {
          const list = (data.items || data.products || []).filter(p => Boolean(p.slug || p.id));
          setProducts(list);
          if (list.length > 0) {
            setSelectedProductIdx(0);
            const firstVariants = list[0].variants || [];
            if (firstVariants.length > 0) {
              setSelectedDose(firstVariants[0].dosage || firstVariants[0].dose || '');
              setSelectedFormat(firstVariants[0].format || firstVariants[0].presentation || 'vial');
            }
          }
        })
        .catch((err) => {
          console.warn('[QuickShareDatasheetModal] Error fetching dynamic catalog:', err);
        })
        .finally(() => setIsLoadingProducts(false));
    }
  }, [isOpen, item]);

  // Initialize recipient from initialRecipient or activeWs
  useEffect(() => {
    if (isOpen) {
      setGeneratedLink(null);
      setCopied(false);
      setShowQr(false);

      if (initialRecipient) {
        setRecipientMode('concrete');
        setRecipient({
          type: initialRecipient.role || initialRecipient.type || 'wholeseller',
          id: initialRecipient.id || null,
          name: initialRecipient.name || initialRecipient.companyName || initialRecipient.fullName || '',
          company: initialRecipient.company || initialRecipient.clinicName || '',
          email: initialRecipient.email || initialRecipient.contactEmail || '',
          phone: initialRecipient.phone || initialRecipient.whatsapp || '',
          notes: '',
        });
      } else if (activeWs?.targetEntity) {
        const target = activeWs.targetEntity;
        const targetRole = target.role === 'wholesaler' || target.type === 'wholeseller' || activeWs?.type === 'wholesaler'
          ? 'wholeseller'
          : 'doctor';
        setRecipientMode('concrete');
        setRecipient({
          type: targetRole,
          id: target.id || null,
          name: target.name || target.displayName || target.companyName || '',
          company: target.company || '',
          email: target.email || '',
          phone: target.phone || '',
          notes: '',
        });
      }
    }
  }, [isOpen, activeWs, initialRecipient]);

  // Current product resolution
  const currentProduct = item || products[selectedProductIdx] || null;
  const currentVariants = currentProduct?.variants || [];
  const itemName = currentProduct?.canonicalName || currentProduct?.name || currentProduct?.displayName || 'Clinical Compound';
  const itemSlug = currentProduct?.slug || currentProduct?.id || '';
  const itemDose = item?.dosage || item?.dose || selectedDose || currentVariants[0]?.dosage || currentVariants[0]?.dose || '';
  const itemFormat = item?.format || item?.presentation || selectedFormat || currentVariants[0]?.format || 'vial';
  const itemSupplier = item?.supplier || item?.supplierName || currentProduct?.supplier || currentProduct?.supplierName || 'Standard';

  // Available doses and formats for selected dynamic product
  const availableDoses = Array.from(new Set(currentVariants.map(v => v.dosage || v.dose).filter(Boolean)));
  const availableFormats = Array.from(new Set(currentVariants.map(v => v.format || v.presentation).filter(Boolean)));

  const handleGenerateLink = async () => {
    if (!itemSlug) return;
    setIsGenerating(true);
    try {
      const payloadRecipient = recipientMode === 'concrete'
        ? {
            id: recipient.id || null,
            name: recipient.name || 'Valued Partner',
            company: recipient.company || '',
            email: recipient.email || '',
            phone: recipient.phone || '',
            type: recipient.type || 'wholeseller',
          }
        : {
            id: null,
            name: 'Public Visitor',
            type: 'generic',
          };

      const res = await fetch('/api/short-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: itemSlug,
          dose: itemDose,
          format: itemFormat,
          supplier: itemSupplier,
          productName: itemName,
          lang: selectedLang,
          recipient: payloadRecipient,
          variant: {
            productId: itemSlug,
            productName: itemName,
            dose: itemDose,
            format: itemFormat,
            supplier: itemSupplier,
          },
          deliveryChannel: 'workspace_share',
          notes: recipient.notes || '',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate tracking short URL');
      }

      const data = await res.json();
      setGeneratedLink(data);

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.shortUrl);
        setCopied(true);
        toast.success(payloadRecipient.name ? `Enlace corto generado y copiado para ${payloadRecipient.name} ✓` : 'Enlace generado y copiado al portapapeles ✓');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('[QuickShareDatasheetModal] Error:', err);
      notifier.error(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const effectiveShortUrl = generatedLink?.shortUrl || '';

  const handleCopy = async () => {
    if (effectiveShortUrl && navigator.clipboard) {
      await navigator.clipboard.writeText(effectiveShortUrl);
      setCopied(true);
      toast.success('Enlace corto copiado al portapapeles ✓');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const composeWhatsAppMessage = () => {
    const isEs = selectedLang === 'es';
    const isPt = selectedLang === 'pt';
    const cleanRecipientName = recipient.name || (isEs ? 'Estimado cliente' : 'Valued Partner');
    const header = isEs
      ? `*Ficha Técnica Oficial — ATLAS HEALTH*\n📋 *Compuesto:* ${itemName} (${itemDose} ${itemFormat})\nDestinatario: ${cleanRecipientName}\n\nAcceso a especificaciones analíticas y ficha técnica veríficada:`
      : isPt
      ? `*Ficha Técnica Oficial — ATLAS HEALTH*\n📋 *Composto:* ${itemName} (${itemDose} ${itemFormat})\nDestinatário: ${cleanRecipientName}\n\nAcesse as especificações analíticas e monografia verificada:`
      : `*Official Technical Datasheet — ATLAS HEALTH*\n📋 *Compound:* ${itemName} (${itemDose} ${itemFormat})\nRecipient: ${cleanRecipientName}\n\nAccess verified analytical specifications and monograph:`;

    return `${header}\n${effectiveShortUrl}`;
  };

  const handleShareWhatsApp = () => {
    if (!effectiveShortUrl) return;
    const msg = composeWhatsAppMessage();
    const cleanPhone = (recipient.phone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleShareEmail = () => {
    if (!effectiveShortUrl) return;
    const subject = `ATLAS HEALTH — Ficha Técnica Oficial: ${itemName} ${itemDose}`;
    const body = composeWhatsAppMessage();
    const mailto = `mailto:${encodeURIComponent(recipient.email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir Ficha Técnica y Monografía"
      subtitle="Generación de enlace corto individualizado con trazabilidad y telemetría"
      width="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── 1. Compound / Variant Parameters (Dynamic) ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
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
                Compuesto y Especificaciones
              </span>
            </div>

            {/* Language Chips */}
            <div style={{ display: 'flex', gap: '3px' }}>
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
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    fontWeight: selectedLang === l.code ? 700 : 500,
                    borderRadius: '4px',
                    border: selectedLang === l.code ? '1px solid #003666' : '1px solid #cbd5e1',
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

          <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {item ? (
              // Pre-locked item from workspace
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>PRODUCTO</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>{itemName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>CONCENTRACIÓN / DOSIS</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666' }}>{itemDose || 'Dosis Estándar'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>FORMATO</div>
                  <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>{itemFormat}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>LABORATORIO</div>
                  <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>{itemSupplier}</div>
                </div>
              </div>
            ) : isLoadingProducts ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem', color: '#64748b', fontSize: '0.80rem' }}>
                <Loader2 size={16} className="animate-spin" /> Cargando catálogo de productos desde Firestore...
              </div>
            ) : (
              // Dynamic Product Picker
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    Seleccionar Compuesto del Catálogo Oficial:
                  </label>
                  <select
                    value={selectedProductIdx}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setSelectedProductIdx(idx);
                      const prod = products[idx];
                      if (prod?.variants?.length) {
                        setSelectedDose(prod.variants[0].dosage || prod.variants[0].dose || '');
                        setSelectedFormat(prod.variants[0].format || prod.variants[0].presentation || 'vial');
                      }
                    }}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    {products.map((p, idx) => (
                      <option key={p.id || idx} value={idx}>
                        {p.canonicalName || p.name || p.id} ({p.category || 'Peptides'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {availableDoses.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                        Dosis:
                      </label>
                      <select
                        value={itemDose}
                        onChange={(e) => setSelectedDose(e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      >
                        {availableDoses.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {availableFormats.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                        Formato:
                      </label>
                      <select
                        value={itemFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      >
                        {availableFormats.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Recipient Hierarchy Selector ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
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
                Asignación de Destinatario
              </span>
            </div>

            <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '2px', borderRadius: '6px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setRecipientMode('concrete')}
                style={{
                  padding: '2px 8px',
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
                  padding: '2px 8px',
                  fontSize: '0.70rem',
                  fontWeight: recipientMode === 'generic' ? 700 : 500,
                  backgroundColor: recipientMode === 'generic' ? '#ffffff' : 'transparent',
                  color: recipientMode === 'generic' ? '#0f172a' : '#64748b',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🌐 Genérico
              </button>
            </div>
          </div>

          <div style={{ padding: '0.85rem' }}>
            {recipientMode === 'concrete' ? (
              <RecipientHierarchySelector
                value={recipient}
                onChange={(upd) => setRecipient(upd)}
                showNotesField={false}
              />
            ) : (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                fontSize: '0.74rem',
                color: '#92400e'
              }}>
                <strong>Modo Enlace Genérico:</strong> El enlace no quedará vinculado a ningún cliente ni se registrará lectura en su perfil individual.
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Generation & Tracked Actions ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="#003666" /> Enlace Corto con Telemetría
            </span>

            <button
              type="button"
              onClick={handleGenerateLink}
              disabled={isGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                backgroundColor: '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
              <span>{isGenerating ? 'Generando...' : 'Generar Enlace Corto'}</span>
            </button>
          </div>

          {effectiveShortUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '4px 6px',
                gap: '6px'
              }}>
                <input
                  type="text"
                  readOnly
                  value={effectiveShortUrl}
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
                    backgroundColor: copied ? '#16a34a' : '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 650,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={13} />
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
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 650,
                    cursor: 'pointer'
                  }}
                >
                  <Mail size={13} color="#0284c7" />
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
                    padding: '8px',
                    backgroundColor: showQr ? '#f1f5f9' : '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 650,
                    cursor: 'pointer'
                  }}
                >
                  <QrCode size={13} color="#475569" />
                  <span>{showQr ? 'Ocultar QR' : 'Ver QR'}</span>
                </button>
              </div>

              {showQr && (
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
                  <QRCodeSVG value={effectiveShortUrl} size={150} level="M" />
                  <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                    Escanee para abrir la ficha técnica verificada en dispositivo móvil
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
              Haga clic en <strong>Generar Enlace Corto</strong> para crear la URL con telemetría y asociarla al destinatario.
            </div>
          )}
        </div>

      </div>
    </StandardDrawer>
  );
}

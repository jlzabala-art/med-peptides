"use client";

import React, { useState, useEffect, useMemo } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Building2, 
  Layers, 
  Activity, 
  Globe, 
  QrCode, 
  Eye, 
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Send
} from '@/lib/icons';
import { processProductVariants } from '@/utils/productVariantProcessing';
import { SUPPORTED_LANGUAGES } from '@/utils/productTranslations';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

function WaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/>
    </svg>
  );
}

export default function ShareProductMonographDrawer({
  isOpen,
  onClose,
  product,
  initialSupplierKey = null,
  initialFormatId = null,
  initialStrengthId = null,
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');

  // Process hierarchy from variants
  const hierarchy = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) {
      return { suppliers: [], formats: [], strengths: [], variantIndex: {} };
    }
    return processProductVariants(product.variants);
  }, [product?.variants]);

  const suppliersList = useMemo(() => {
    const list = [...(hierarchy.suppliers || [])];
    return list;
  }, [hierarchy.suppliers]);

  // Selected state
  const [selectedSupplierId, setSelectedSupplierId] = useState('all');
  const [selectedFormatId, setSelectedFormatId] = useState('all');
  const [selectedStrengthId, setSelectedStrengthId] = useState('all');

  // Initialize or reset when drawer opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setShowQr(false);

      if (initialSupplierKey) {
        // Try finding matching supplier id in hierarchy
        const cleanTarget = String(initialSupplierKey).toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');
        const matched = suppliersList.find(s => {
          const sClean = String(s.id || s.name).toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');
          return sClean === cleanTarget || sClean.includes(cleanTarget) || cleanTarget.includes(sClean);
        });
        setSelectedSupplierId(matched ? matched.id : initialSupplierKey);
      } else {
        setSelectedSupplierId('all');
      }

      setSelectedFormatId(initialFormatId || 'all');
      setSelectedStrengthId(initialStrengthId || 'all');
    }
  }, [isOpen, initialSupplierKey, initialFormatId, initialStrengthId, suppliersList]);

  // Available formats based on selected supplier
  const availableFormats = useMemo(() => {
    if (selectedSupplierId === 'all') {
      return hierarchy.formats || [];
    }
    const supp = suppliersList.find(s => s.id === selectedSupplierId);
    if (!supp) return hierarchy.formats || [];
    const suppFormatIds = Array.isArray(supp.formats) ? supp.formats : [];
    return (hierarchy.formats || []).filter(f => suppFormatIds.includes(f.id));
  }, [selectedSupplierId, suppliersList, hierarchy.formats]);

  // Available strengths based on selected format
  const availableStrengths = useMemo(() => {
    if (selectedFormatId === 'all') {
      return hierarchy.strengths || [];
    }
    const fmt = (hierarchy.formats || []).find(f => f.id === selectedFormatId);
    if (!fmt) return hierarchy.strengths || [];
    const fmtStrengthIds = Array.isArray(fmt.strengths) ? fmt.strengths : [];
    return (hierarchy.strengths || []).filter(s => fmtStrengthIds.length === 0 || fmtStrengthIds.includes(s.id));
  }, [selectedFormatId, hierarchy.formats, hierarchy.strengths]);

  // If format is no longer available under the selected supplier, reset it to 'all'
  useEffect(() => {
    if (selectedFormatId !== 'all' && !availableFormats.some(f => f.id === selectedFormatId)) {
      setSelectedFormatId('all');
    }
  }, [availableFormats, selectedFormatId]);

  // If strength is no longer available under the selected format, reset it to 'all'
  useEffect(() => {
    if (selectedStrengthId !== 'all' && !availableStrengths.some(s => s.id === selectedStrengthId)) {
      setSelectedStrengthId('all');
    }
  }, [availableStrengths, selectedStrengthId]);

  if (!isOpen || !product) return null;

  const productName = product.canonicalName || product.name || 'Clinical Product';
  const slug = product.slug || product.id;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';

  // Build reactive URL
  const queryParams = new URLSearchParams();
  if (selectedSupplierId && selectedSupplierId !== 'all') {
    queryParams.set('supplier', selectedSupplierId);
  }
  if (selectedFormatId && selectedFormatId !== 'all') {
    queryParams.set('format', selectedFormatId);
  }
  if (selectedStrengthId && selectedStrengthId !== 'all') {
    queryParams.set('dose', selectedStrengthId);
  }
  if (selectedLang && selectedLang !== 'en') {
    queryParams.set('lang', selectedLang);
  }

  const queryString = queryParams.toString();
  const shareUrl = `${origin}/p/${encodeURIComponent(slug)}${queryString ? `?${queryString}` : ''}`;

  // Active names for display and text generation
  const activeSupplierObj = suppliersList.find(s => s.id === selectedSupplierId);
  const activeSupplierName = selectedSupplierId === 'all' 
    ? 'All Certified Laboratories' 
    : (activeSupplierObj?.name || selectedSupplierId);

  const activeFormatObj = availableFormats.find(f => f.id === selectedFormatId);
  const activeFormatName = selectedFormatId === 'all' ? 'All Formats' : (activeFormatObj?.name || selectedFormatId);

  const activeStrengthObj = availableStrengths.find(s => s.id === selectedStrengthId);
  const activeStrengthName = selectedStrengthId === 'all' ? 'All Strengths' : (activeStrengthObj?.name || selectedStrengthId);

  // Generate tailored WhatsApp text
  const isEs = selectedLang === 'es';
  const isPt = selectedLang === 'pt';
  const waIntro = isEs ? 'Ficha Técnica Clínica Oficial — RegenPept' : isPt ? 'Ficha Técnica Clínica Oficial — RegenPept' : 'Official Clinical Monograph — RegenPept';
  const waCompound = isEs ? 'Compuesto' : isPt ? 'Composto' : 'Compound';
  const waSource = isEs ? 'Laboratorio' : isPt ? 'Laboratório' : 'Laboratory';
  const waPres = isEs ? 'Presentación' : isPt ? 'Apresentação' : 'Presentation';
  const waDose = isEs ? 'Concentración' : isPt ? 'Concentração' : 'Strength';
  const waAccess = isEs ? 'Acceso a especificaciones analíticas y protocolo:' : isPt ? 'Acesse as especificações analíticas e protocolo:' : 'Access analytical specifications & clinical protocol:';

  let waLines = [
    `*${waIntro}*`,
    `📋 *${waCompound}:* ${productName}`,
  ];
  if (selectedSupplierId !== 'all') {
    waLines.push(`🔬 *${waSource}:* ${activeSupplierName}`);
  }
  if (selectedFormatId !== 'all') {
    waLines.push(`📦 *${waPres}:* ${activeFormatName}`);
  }
  if (selectedStrengthId !== 'all') {
    waLines.push(`⚖️ *${waDose}:* ${activeStrengthName}`);
  }
  waLines.push('');
  waLines.push(`${waAccess}`);
  waLines.push(`${shareUrl}`);

  const waText = waLines.join('\n');
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(`${waIntro} — ${productName}`)}&body=${encodeURIComponent(waText.replace(/\*/g, ''))}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      triggerHaptic();
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleOpenPreview = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Share Clinical Monograph"
      subtitle={`Configure & generate tailored links for ${productName}`}
      width="clamp(440px, 48vw, 680px)"
      zIndex={100065}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
          <button
            type="button"
            onClick={handleOpenPreview}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={14} />
            <span>Open Preview</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                background: copied ? '#16a34a' : '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* ── 1. Supplier / Laboratory Selector ── */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            <Building2 size={15} color="#003666" />
            <span>Manufacturing Laboratory / Supplier:</span>
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setSelectedSupplierId('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: selectedSupplierId === 'all' ? 700 : 500,
                background: selectedSupplierId === 'all' ? '#003666' : '#ffffff',
                color: selectedSupplierId === 'all' ? '#ffffff' : '#334155',
                border: selectedSupplierId === 'all' ? '1px solid #003666' : '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🌐 All Verified Sources (Multi-Supplier)
            </button>

            {suppliersList.map(s => {
              const isSelected = selectedSupplierId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSupplierId(s.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? '#003666' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
            {selectedSupplierId === 'all' 
              ? 'Multi-supplier mode: Recipient can browse all verified laboratories.'
              : `Locked mode: Recipient strictly views ${activeSupplierName} with zero references to other sources.`}
          </p>
        </div>

        {/* ── 2. Presentation Format Selector ── */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            <Layers size={15} color="#003666" />
            <span>Target Presentation Format:</span>
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setSelectedFormatId('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: selectedFormatId === 'all' ? 700 : 500,
                background: selectedFormatId === 'all' ? '#0369a1' : '#ffffff',
                color: selectedFormatId === 'all' ? '#ffffff' : '#334155',
                border: selectedFormatId === 'all' ? '1px solid #0369a1' : '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Formats Available
            </button>

            {availableFormats.map(fmt => {
              const isSelected = selectedFormatId === fmt.id;
              const isPen = fmt.id.includes('pen');
              const isCart = fmt.id.includes('cartridge');
              const isSpray = fmt.id.includes('spray');
              const isOral = fmt.id.includes('capsule') || fmt.id.includes('tablet');
              const icon = isPen ? '🖊️' : isCart ? '💉' : isSpray ? '💨' : isOral ? '💊' : '🧪';

              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSelectedFormatId(fmt.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? '#0369a1' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1px solid #0369a1' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {icon} {fmt.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Strength / Dosage Selector ── */}
        {availableStrengths.length > 0 && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              <Activity size={15} color="#003666" />
              <span>Target Dose / Strength:</span>
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setSelectedStrengthId('all')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: selectedStrengthId === 'all' ? 700 : 500,
                  background: selectedStrengthId === 'all' ? '#0f766e' : '#ffffff',
                  color: selectedStrengthId === 'all' ? '#ffffff' : '#334155',
                  border: selectedStrengthId === 'all' ? '1px solid #0f766e' : '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                All Strengths
              </button>

              {availableStrengths.map(st => {
                const isSelected = selectedStrengthId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStrengthId(st.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#0f766e' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #0f766e' : '1px solid #cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    {st.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. Language Selector ── */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            <Globe size={15} color="#003666" />
            <span>Monograph Language:</span>
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SUPPORTED_LANGUAGES.map(l => {
              const isSelected = selectedLang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLang(l.code)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? '#4338ca' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1px solid #4338ca' : '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  {l.flag} {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 5. Real-Time Generated URL Box ── */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Generated Public Monograph URL
            </span>
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <QrCode size={13} /> {showQr ? 'Hide QR' : 'View QR'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => e.target.select()}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontFamily: 'monospace',
                color: '#0f172a'
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                background: copied ? '#16a34a' : '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* QR Code Collapsible */}
          {showQr && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <img 
                src={qrUrl} 
                alt={`QR code for ${productName}`} 
                style={{ width: '180px', height: '180px', borderRadius: '4px' }} 
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                Scan to open directly on any device
              </span>
            </div>
          )}
        </div>

        {/* ── 6. Instant Sharing Channels ── */}
        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            Instant Clinical Dispatch:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#25D366',
                color: '#ffffff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
              }}
            >
              <WaIcon />
              <span>WhatsApp</span>
            </a>

            {/* Email */}
            <a
              href={mailUrl}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#0284c7',
                color: '#ffffff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
              }}
            >
              <Send size={15} />
              <span>Email Monograph</span>
            </a>
          </div>
        </div>

        {/* ── 7. Message Preview Box ── */}
        <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
          <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
            Clinical Message Preview ({selectedLang.toUpperCase()})
          </span>
          <pre style={{
            margin: 0,
            fontSize: '0.76rem',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            color: '#334155',
            lineHeight: 1.45
          }}>
            {waText}
          </pre>
        </div>

      </div>
    </StandardDrawer>
  );
}

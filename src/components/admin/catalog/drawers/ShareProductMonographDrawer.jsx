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
  Send,
  FileText,
  FileDown,
  User,
  ChevronDown,
  ChevronUp,
  Info,
  Link2,
  Printer,
  RotateCcw
} from '@/lib/icons';
import { processProductVariants } from '@/utils/productVariantProcessing';
import { SUPPORTED_LANGUAGES } from '@/utils/productTranslations';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import RecipientHierarchySelector from '@/components/shared/RecipientHierarchySelector';

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
  const [showThermalSection, setShowThermalSection] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [trackedShortUrl, setTrackedShortUrl] = useState(null);

  // Process hierarchy from variants
  const hierarchy = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) {
      return { suppliers: [], formats: [], strengths: [], variantIndex: {} };
    }
    return processProductVariants(product.variants);
  }, [product?.variants]);

  const suppliersList = useMemo(() => {
    return [...(hierarchy.suppliers || [])];
  }, [hierarchy.suppliers]);

  // Selected state
  const [selectedSupplierId, setSelectedSupplierId] = useState('all');
  const [selectedFormatId, setSelectedFormatId] = useState('all');
  const [selectedStrengthId, setSelectedStrengthId] = useState('all');

  const [recipientMode, setRecipientMode] = useState('concrete'); // 'concrete' | 'generic'
  const [recipient, setRecipient] = useState({
    type: 'doctor',
    id: null,
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Reset tracked link when selection changes
  useEffect(() => {
    setTrackedShortUrl(null);
  }, [selectedSupplierId, selectedFormatId, selectedStrengthId, selectedLang, recipientMode, recipient.id, recipient.type, recipient.name]);

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

  // Helper to normalize supplier strings for robust matching
  const cleanSupplierKey = (val) => String(val || '').toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');

  // Filter product variants strictly matching selectedSupplierId
  const supplierVariants = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return [];
    if (selectedSupplierId === 'all') return product.variants;
    
    const targetClean = cleanSupplierKey(selectedSupplierId);
    return product.variants.filter(v => {
      const vSupp = cleanSupplierKey(v.supplierId || v.supplier || v.supplierName || '');
      return vSupp === targetClean || vSupp.includes(targetClean) || targetClean.includes(vSupp);
    });
  }, [product?.variants, selectedSupplierId]);

  // Supplier variant counts for display
  const supplierCounts = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return {};
    const map = {};
    product.variants.forEach(v => {
      const key = cleanSupplierKey(v.supplierId || v.supplier || v.supplierName || '');
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [product?.variants]);

  // Available formats based on selected supplier
  const availableFormats = useMemo(() => {
    if (selectedSupplierId === 'all') {
      return hierarchy.formats || [];
    }
    const suppFormatIds = new Set();
    supplierVariants.forEach(v => {
      const rawFormat = v.formatId || v.format || v.presentation || 'vial';
      suppFormatIds.add(rawFormat.toLowerCase().replace(/\s+/g, '_'));
    });
    return (hierarchy.formats || []).filter(f => suppFormatIds.has(f.id));
  }, [selectedSupplierId, supplierVariants, hierarchy.formats]);

  // Format counts
  const formatCounts = useMemo(() => {
    const map = {};
    supplierVariants.forEach(v => {
      const rawFormat = v.formatId || v.format || v.presentation || 'vial';
      const fId = rawFormat.toLowerCase().replace(/\s+/g, '_');
      map[fId] = (map[fId] || 0) + 1;
    });
    return map;
  }, [supplierVariants]);

  // Available strengths based on BOTH selected supplier AND selected format
  const availableStrengths = useMemo(() => {
    const validStrengthIds = new Set();
    supplierVariants.forEach(v => {
      const rawFormat = v.formatId || v.format || v.presentation || 'vial';
      const formatId = rawFormat.toLowerCase().replace(/\s+/g, '_');
      if (selectedFormatId !== 'all' && formatId !== selectedFormatId) {
        return;
      }
      const rawStrength = v.strengthId || v.dosage || v.dose || v.strength || v.name || 'unknown_strength';
      const strengthId = rawStrength.toString().toLowerCase().replace(/\s+/g, '_');
      validStrengthIds.add(strengthId);
    });

    return (hierarchy.strengths || []).filter(s => validStrengthIds.has(s.id));
  }, [supplierVariants, selectedFormatId, hierarchy.strengths]);

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

  const catLowerSMD = (product.category || product.therapeutic_category || '').toLowerCase();
  const isProductCosmeticSMD = (
    catLowerSMD === 'cosmetics' ||
    catLowerSMD === 'hair cosmetics' ||
    catLowerSMD === 'cosmeceutical' ||
    catLowerSMD === 'aesthetic injectables' ||
    catLowerSMD === 'aesthetic injectable' ||
    product.is_cosmetic === true ||
    product.is_aesthetic_injectable === true
  );

  // Build reactive URL
  const queryParams = new URLSearchParams();
  if (!isProductCosmeticSMD) {
    if (selectedSupplierId && selectedSupplierId !== 'all') {
      queryParams.set('supplier', selectedSupplierId);
    }
    if (selectedFormatId && selectedFormatId !== 'all') {
      queryParams.set('format', selectedFormatId);
    }
    if (selectedStrengthId && selectedStrengthId !== 'all') {
      queryParams.set('dose', selectedStrengthId);
    }
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

  // Check if non-default filters are active
  const hasActiveFilters = selectedSupplierId !== 'all' || selectedFormatId !== 'all' || selectedStrengthId !== 'all' || selectedLang !== 'en';

  const handleResetFilters = () => {
    setSelectedSupplierId('all');
    setSelectedFormatId('all');
    setSelectedStrengthId('all');
    setSelectedLang('en');
    toast.success('Configuration reset to full monograph scope');
  };

  // Generate tailored WhatsApp text
  const isEs = selectedLang === 'es';
  const isPt = selectedLang === 'pt';
  const waIntro = isEs ? 'Ficha Técnica Clínica Oficial — ATLAS HEALTH' : isPt ? 'Ficha Técnica Clínica Oficial — ATLAS HEALTH' : 'Official Clinical Monograph — ATLAS HEALTH';
  const waCompound = isEs ? 'Compuesto' : isPt ? 'Composto' : 'Compound';
  const waSource = isEs ? 'Laboratorio' : isPt ? 'Laboratório' : 'Laboratory';
  const waPres = isEs ? 'Presentación' : isPt ? 'Apresentação' : 'Presentation';
  const waDose = isEs ? 'Concentración' : isPt ? 'Concentração' : 'Strength';
  const waAccess = isEs ? 'Acceso a especificaciones analíticas y protocolo:' : isPt ? 'Acesse as especificações analíticas e protocolo:' : 'Access analytical specifications & clinical protocol:';

  const effectiveShareUrl = trackedShortUrl || shareUrl;

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
  waLines.push(`${effectiveShareUrl}`);

  const waText = waLines.join('\n');
  const cleanPhone = (recipient.phone || '').replace(/[^\d]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
    : `https://wa.me/?text=${encodeURIComponent(waText)}`;
  const mailUrl = `mailto:${encodeURIComponent(recipient.email || '')}?subject=${encodeURIComponent(`${waIntro} — ${productName}`)}&body=${encodeURIComponent(waText.replace(/\*/g, ''))}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(effectiveShareUrl)}`;

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: `${productName} — ATLAS HEALTH`,
          text: waText,
          url: effectiveShareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed:', err);
        }
      }
    }
    handleCopy();
  };

  const handleCopy = async () => {
    try {
      let urlToCopy = trackedShortUrl;

      if (!urlToCopy) {
        try {
          const res = await fetch('/api/short-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug,
              dose: selectedStrengthId !== 'all' ? selectedStrengthId : null,
              format: selectedFormatId !== 'all' ? selectedFormatId : null,
              supplier: selectedSupplierId !== 'all' ? selectedSupplierId : null,
              lang: selectedLang,
              productName,
              recipient: recipientMode === 'concrete'
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
                    name: 'Public Visitor',
                    type: 'generic',
                  },
              targetUrl: shareUrl,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            urlToCopy = data.shortUrl;
            setTrackedShortUrl(data.shortUrl);
          }
        } catch {
          urlToCopy = shareUrl;
        }
      }

      const finalUrl = urlToCopy || shareUrl;
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(finalUrl);
      }
      triggerHaptic();
      setCopied(true);
      toast.success(recipient.name ? `Tracked link copied for ${recipient.name} ✓` : 'Link copied to clipboard!');
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
      subtitle={`Configure specification scope & dispatch tracked links for ${productName}`}
      width="clamp(460px, 52vw, 740px)"
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
              padding: '9px 14px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              minHeight: '40px'
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
                minHeight: '40px',
                boxShadow: '0 1px 3px rgba(0, 54, 102, 0.2)',
                transition: 'background 0.2s ease'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Tracked Link'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* ── 1. Specification Scope (GCP Form Field Grid) ── */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#003666" />
                <span>Monograph Specification Parameters</span>
              </h4>
              <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                Filter which sources, presentation formats, or specific dosages are locked into the generated link.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
                title="Reset all filters to default full monograph"
              >
                <RotateCcw size={12} />
                <span>Reset Scope</span>
              </button>
            )}
          </div>

          {/* Responsive 2-Column Grid (Laptop: 2-col, Mobile: 1-col) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px 16px'
          }}>
            {/* Field: Manufacturing Laboratory */}
            <div>
              <label 
                htmlFor="gcp-share-supplier"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
              >
                <Building2 size={14} color="#003666" />
                <span>Manufacturing Laboratory:</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="gcp-share-supplier"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 28px 8px 10px',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    minHeight: '42px',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <option value="all">🌐 All Verified Sources (Multi-Supplier View)</option>
                  {suppliersList.map(s => {
                    const cleanKey = cleanSupplierKey(s.id || s.name);
                    const count = supplierCounts[cleanKey] || 0;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} {count > 0 ? `(${count} variant${count === 1 ? '' : 's'})` : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.70rem', color: selectedSupplierId === 'all' ? '#64748b' : '#0369a1', lineHeight: 1.3 }}>
                {selectedSupplierId === 'all'
                  ? 'Recipient can compare all certified manufacturers.'
                  : `🔒 Locked mode: Recipient strictly views ${activeSupplierName}.`}
              </p>
            </div>

            {/* Field: Target Presentation Format */}
            <div>
              <label 
                htmlFor="gcp-share-format"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
              >
                <Layers size={14} color="#003666" />
                <span>Presentation Format:</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="gcp-share-format"
                  value={selectedFormatId}
                  onChange={(e) => setSelectedFormatId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 28px 8px 10px',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    minHeight: '42px',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <option value="all">📦 All Formats Available</option>
                  {availableFormats.map(fmt => {
                    const count = formatCounts[fmt.id] || 0;
                    return (
                      <option key={fmt.id} value={fmt.id}>
                        {fmt.name} {count > 0 ? `(${count})` : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.70rem', color: '#64748b', lineHeight: 1.3 }}>
                {selectedFormatId === 'all'
                  ? 'Allows recipient to toggle between vials, cartridges, or pens.'
                  : `Locked format: ${activeFormatName}.`}
              </p>
            </div>

            {/* Field: Target Dose / Strength */}
            <div>
              <label 
                htmlFor="gcp-share-dose"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
              >
                <Activity size={14} color="#003666" />
                <span>Target Strength / Dosage:</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="gcp-share-dose"
                  value={selectedStrengthId}
                  onChange={(e) => setSelectedStrengthId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 28px 8px 10px',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    minHeight: '42px',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <option value="all">⚖️ All Strengths Available</option>
                  {availableStrengths.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.70rem', color: '#64748b', lineHeight: 1.3 }}>
                {selectedStrengthId === 'all'
                  ? 'All certified dosage tiers listed.'
                  : `Deep-links directly to ${activeStrengthName}.`}
              </p>
            </div>

            {/* Field: Monograph Language */}
            <div>
              <label 
                htmlFor="gcp-share-lang"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
              >
                <Globe size={14} color="#003666" />
                <span>Monograph Language:</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="gcp-share-lang"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 28px 8px 10px',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    minHeight: '42px',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.70rem', color: '#64748b', lineHeight: 1.3 }}>
                Clinical descriptions and protocols render in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.label || 'English'}.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. Recipient Assignment & Profile Tracking (GCP Standard Card) ── */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} color="#003666" />
                <span>Recipient Assignment & Audit Logging</span>
              </h4>
              <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                Assign to a healthcare practitioner to automatically record dispatches and monitor read receipts.
              </p>
            </div>

            {/* GCP Segmented Switcher */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => setRecipientMode('concrete')}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: recipientMode === 'concrete' ? 700 : 500,
                  backgroundColor: recipientMode === 'concrete' ? '#ffffff' : 'transparent',
                  color: recipientMode === 'concrete' ? '#0f172a' : '#64748b',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: recipientMode === 'concrete' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                👤 Specific Practitioner
              </button>
              <button
                type="button"
                onClick={() => setRecipientMode('generic')}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: recipientMode === 'generic' ? 700 : 500,
                  backgroundColor: recipientMode === 'generic' ? '#ffffff' : 'transparent',
                  color: recipientMode === 'generic' ? '#0f172a' : '#64748b',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: recipientMode === 'generic' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                🌐 Generic Public Link
              </button>
            </div>
          </div>

          {recipientMode === 'concrete' ? (
            <div style={{
              padding: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px'
            }}>
              <RecipientHierarchySelector
                value={recipient}
                onChange={(updated) => setRecipient(updated)}
                showNotesField={false}
              />
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#059669' }}>
                <CheckCircle2 size={13} color="#059669" />
                <span>
                  {recipient.name 
                    ? `Dispatch telemetry will be permanently logged under ${recipient.name}'s profile.`
                    : 'Search and select a practitioner or enter custom contact information.'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              fontSize: '0.74rem',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Info size={15} color="#d97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>Generic Public Mode:</strong> Generates an unassigned link without profile attribution or recipient read-receipt logging.
              </div>
            </div>
          )}
        </section>

        {/* ── 3. Generated Monograph Link (GCP Terminal Style) ── */}
        <section style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Generated Monograph Link
              </span>
              {recipientMode === 'concrete' && recipient.name ? (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={11} /> Tracked for {recipient.name}
                </span>
              ) : (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0'
                }}>
                  Public Direct
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.74rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <QrCode size={13} /> {showQr ? 'Hide QR Code' : 'View QR Code'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            <input
              type="text"
              readOnly
              value={effectiveShareUrl}
              onClick={(e) => e.target.select()}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '0.80rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                color: '#0f172a',
                minHeight: '42px',
                textOverflow: 'ellipsis'
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                background: copied ? '#16a34a' : '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: '42px',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* QR Code Collapsible */}
          {showQr && (
            <div style={{
              marginTop: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              <img 
                src={qrUrl} 
                alt={`QR code for ${productName}`} 
                style={{ width: '180px', height: '180px', borderRadius: '4px' }} 
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '8px', fontWeight: 500 }}>
                Point any mobile camera to test the recipient view immediately
              </span>
            </div>
          )}
        </section>

        {/* ── 4. Instant Dispatch Channels (Touch-friendly 44px min-height) ── */}
        <div>
          <span style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            Instant Dispatch Channels:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: canShare ? 'repeat(auto-fit, minmax(130px, 1fr))' : '1fr 1fr', gap: '10px' }}>
            {/* Native Share */}
            {canShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  minHeight: '44px',
                  boxShadow: '0 2px 4px rgba(0, 54, 102, 0.2)',
                  transition: 'background 0.15s ease'
                }}
              >
                <Share2 size={15} />
                <span>Share Apps</span>
              </button>
            )}

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
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                minHeight: '44px',
                boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)'
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
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                minHeight: '44px',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
              }}
            >
              <Send size={15} />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* ── 5. Warehouse & Physical Thermal Labels (Secondary Collapsible Accordion) ── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={() => setShowThermalSection(!showThermalSection)}
            style={{
              width: '100%',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={15} color="#003666" />
              <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1e293b' }}>
                Physical Thermal Labels & Printing (38x90 mm)
              </span>
              <span style={{
                fontSize: '0.66rem',
                color: '#64748b',
                background: '#e2e8f0',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                Warehouse Tool
              </span>
            </div>
            {showThermalSection ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
          </button>

          {showThermalSection && (
            <div style={{ padding: '14px', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 12px', fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4 }}>
                Instant PDF generation for 38x90 mm thermal roll printers. The embedded QR code directly loads this customized monograph link.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                <a
                  href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=shipping${queryString ? `&${queryString}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    color: '#003666',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    minHeight: '40px'
                  }}
                >
                  <QrCode size={13} />
                  <span>Shipping Label</span>
                </a>

                <a
                  href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=client${queryString ? `&${queryString}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#f0fdfa',
                    color: '#0d9488',
                    border: '1px solid #99f6e4',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    minHeight: '40px'
                  }}
                >
                  <FileText size={13} />
                  <span>Client Label (Full Specs)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── 6. Clinical Message Preview (Collapsible Accordion) ── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={() => setShowMessagePreview(!showMessagePreview)}
            style={{
              width: '100%',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={15} color="#003666" />
              <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1e293b' }}>
                Clinical Message Template ({selectedLang.toUpperCase()})
              </span>
            </div>
            {showMessagePreview ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
          </button>

          {showMessagePreview && (
            <div style={{ padding: '14px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(waText);
                      toast.success('Message text copied to clipboard!');
                    }
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Copy size={11} /> Copy Text
                </button>
              </div>
              <pre style={{
                margin: 0,
                fontSize: '0.76rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                color: '#334155',
                lineHeight: 1.45,
                background: '#f1f5f9',
                padding: '10px 12px',
                borderRadius: '8px'
              }}>
                {waText}
              </pre>
            </div>
          )}
        </div>

      </div>
    </StandardDrawer>
  );
}

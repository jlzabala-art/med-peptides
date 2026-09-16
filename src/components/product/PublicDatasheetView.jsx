"use client";

import './PublicDatasheetView.css';
import React, { useState, useEffect, useTransition, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  FlaskConical, 
  Thermometer, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Info,
  Box,
  QrCode,
  ExternalLink,
  Building2,
  Tag,
  Eye
} from '@/lib/icons';
import { SUPPORTED_LANGUAGES, getTranslations, getLocalizedField } from '../../utils/productTranslations';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import ProductTraceabilityCard from './ProductTraceabilityCard';
import InteractiveReconstitutionGuide from './InteractiveReconstitutionGuide';
import ShareProductMonographDrawer from '../admin/catalog/drawers/ShareProductMonographDrawer';
import PublicDatasheetMobileBar from './PublicDatasheetMobileBar';
import MonographPreviewModal from './MonographPreviewModal';

function WaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/>
    </svg>
  );
}

export default function PublicDatasheetView({ 
  product, 
  slug, 
  baseUrl,
  initialSupplierFilter = null,
  initialFormat = null,
  initialStrength = null,
  initialLang = null 
}) {
  const [lang, setLang] = useState(() => {
    if (initialLang && SUPPORTED_LANGUAGES.some(l => l.code === initialLang)) {
      return initialLang;
    }
    return 'en';
  });
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inlineSvg, setInlineSvg] = useState(null);
  const [svgError, setSvgError] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedLabelType, setCopiedLabelType] = useState(null);
  const requestedLangs = useRef(new Set());

  const handleCopyLabelUrl = (type) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=${type}${labelQueryString}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      setCopiedLabelType(type);
      triggerHaptic('success');
      toast.success(type === 'shipping' ? 'Shipping label link copied ✓' : 'Clinical label link copied ✓');
      setTimeout(() => setCopiedLabelType(null), 2500);
    }
  };

  // Strictly default to English unless explicitly requested via initialLang param
  useEffect(() => {
    if (initialLang && SUPPORTED_LANGUAGES.some(l => l.code === initialLang)) {
      setLang(initialLang);
    }
  }, [initialLang]);

  const t = getTranslations(lang);
  const targetId = product?.id || slug;
  const pdfUrl = `/api/product-sheet/${encodeURIComponent(targetId)}?format=vial`;
  const barcodeSupplier = product?.supplierId || product?.supplierName || product?.supplier || 'lotusland';
  const barcodeImageUrl = `/api/barcode/${encodeURIComponent(slug)}?supplier=${encodeURIComponent(barcodeSupplier)}`;

  // Fetch SVG inline — <img> cannot render nested <svg> (QR inside label)
  useEffect(() => {
    if (!slug) return;
    setSvgError(false);
    setInlineSvg(null);
    fetch(barcodeImageUrl)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(svg => setInlineSvg(svg))
      .catch(() => setSvgError(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, barcodeImageUrl]);

  // On-demand translation for non-English languages if missing from product document
  useEffect(() => {
    if (lang === 'en' || !product?.id) return;

    const existing = getLocalizedField(product, 'description', lang);
    if ((existing && existing !== product?.description) || requestedLangs.current.has(lang)) {
      return;
    }

    const rawDesc = product?.description || product?.desc || product?.objective || '';
    if (!rawDesc) return;

    requestedLangs.current.add(lang);
    let isMounted = true;
    setIsTranslating(true);

    fetch('/api/ai-translate-clinical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: product.id,
        targetType: 'product',
        targetLang: lang,
        fields: {
          description: rawDesc,
        },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.ok && data?.translations) {
          setDynamicTranslations(prev => ({
            ...prev,
            [lang]: data.translations,
          }));
        }
      })
      .catch(err => {
        console.warn('On-demand translation notice:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsTranslating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lang, product]);

  const name = product?.name || product?.displayName || 'Clinical Peptide';
  const category = product?.category || product?.therapeutic_category || 'Peptide';
  const casNumber = product?.casNumber || product?.cas || 'Documented on Monograph';
  const formula = product?.molecularFormula || product?.molecular_formula || null;
  const mw = product?.molecularWeight || product?.molecular_weight ? `${product.molecularWeight || product.molecular_weight} g/mol` : null;
  const purity = product?.purity || '≥ 99.4% (RP-HPLC)';
  const sequence = product?.sequence || null;
  const targetSystem = product?.targetSystem || product?.target || 'Targeted Physiological Receptor Axis';
  const description = dynamicTranslations[lang]?.description
    || getLocalizedField(product, 'description', lang) 
    || product?.description 
    || product?.desc 
    || product?.objective 
    || '';

  // ─── Hierarchy, Formats & Strengths Matrix ─────────────────────────────────
  const hierarchy = product?.processedHierarchy || {};
  const suppliersList = useMemo(() => Array.isArray(hierarchy.suppliers) ? hierarchy.suppliers : [], [hierarchy.suppliers]);
  const isMultiSupplierMode = !product?.isSingleSupplierLocked && suppliersList.length > 1;

  // Active supplier state (if multi-supplier mode)
  const [activeSupplierId, setActiveSupplierId] = useState(() => {
    if (initialSupplierFilter && initialSupplierFilter !== 'all') {
      const cleanTarget = String(initialSupplierFilter).toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');
      const matched = suppliersList.find(s => {
        const sClean = String(s.id || s.name).toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');
        return sClean === cleanTarget || sClean.includes(cleanTarget);
      });
      if (matched) return matched.id;
    }
    return 'all';
  });

  const activeSupplierObj = useMemo(() => {
    if (activeSupplierId === 'all') return null;
    return suppliersList.find(s => s.id === activeSupplierId) || null;
  }, [suppliersList, activeSupplierId]);

  const supplierName = useMemo(() => {
    if (product?.isSingleSupplierLocked) {
      return product?.supplierName || product?.supplier || 'Certified Clinical Synthesis Laboratory';
    }
    if (activeSupplierObj) {
      return activeSupplierObj.name || activeSupplierObj.id;
    }
    return 'All Certified Laboratories (Multi-Source)';
  }, [product, activeSupplierObj]);

  const rawFormats = Array.isArray(hierarchy.formats) ? hierarchy.formats : [];
  const rawStrengths = Array.isArray(hierarchy.strengths) ? hierarchy.strengths : [];

  // Filter formats by activeSupplier if not 'all'
  const supplierFilteredFormats = useMemo(() => {
    if (activeSupplierId === 'all' || !activeSupplierObj) {
      return rawFormats;
    }
    const allowedFormatIds = Array.isArray(activeSupplierObj.formats) ? activeSupplierObj.formats : [];
    return rawFormats.filter(f => allowedFormatIds.includes(f.id));
  }, [activeSupplierId, activeSupplierObj, rawFormats]);

  /**
   * Parse total active content from a strength name.
   * For single peptides: "10 mg" → 10
   * For blends (pipe, plus, or slash separated):
   * "6 mg + 6 mg + 30 mg + 6 mg" → 48 (sum of all)
   * "10 mg | 10 mg | 75 mg | 10 mg" → 105 (sum of all)
   */
  const parseNum = (str) => {
    const s = String(str || '');
    // Match all instances of e.g. "6 mg", "30mg"
    const mgMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*mg/gi)];
    if (mgMatches.length > 0) {
      const sum = mgMatches.reduce((acc, m) => acc + parseFloat(m[1]), 0);
      if (sum > 0) return sum;
    }
    // Check for separators: |, +, or /
    if (s.includes('|') || s.includes('+') || s.includes('/')) {
      const parts = s.split(/[|+/]/);
      let total = 0;
      for (const part of parts) {
        const m = part.match(/(\d+(?:\.\d+)?)/);
        if (m) total += parseFloat(m[1]);
      }
      if (total > 0) return total;
    }
    const m = s.match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : 999;
  };

  /**
   * Recommended BAC Water Reconstitution Volume by Vial Strength
   */
  const getReconstitutionVolume = (strengthName) => {
    const mg = parseNum(strengthName);
    if (mg <= 0 || isNaN(mg)) return { volume: '2.0', concentration: '5.0' };

    let targetConc;
    const strLower = String(strengthName || '').toLowerCase();
    const isBlendStrength = strLower.includes('+') 
      || strLower.includes('|') 
      || strLower.includes('/')
      || String(name || '').toLowerCase().includes('klow')
      || String(name || '').toLowerCase().includes('glow');

    if (isBlendStrength || mg > 50) {
      targetConc = 15.0; // Multi-peptide blends (GLOW, KLOW, etc.)
    } else if (mg <= 5) {
      targetConc = 2.5;  // Easy low-dose titration
    } else {
      targetConc = 5.0;  // Standard single peptides
    }

    const rawVol = mg / targetConc;
    const volume = Math.min(10.0, Math.round(rawVol * 2) / 2).toFixed(1);
    const concentration = (mg / parseFloat(volume)).toFixed(1);
    return { volume, concentration };
  };

  const sortedStrengths = useMemo(() => {
    return [...rawStrengths].sort((a, b) => parseNum(a.name || a.id) - parseNum(b.name || b.id));
  }, [rawStrengths]);

  // Strictly Lotusland check: true ONLY if supplier is explicitly Lotusland
  const isStrictlyLotusland = useMemo(() => {
    const s = (supplierName || '').toLowerCase();
    const sid = (activeSupplierId || product?.supplierId || '').toLowerCase();
    return s.includes('lotusland') || sid.includes('lotusland');
  }, [supplierName, activeSupplierId, product]);

  const sanitizedFormats = useMemo(() => {
    if (isStrictlyLotusland) {
      return supplierFilteredFormats.filter(f => !f.id.includes('pen') && !f.id.includes('cartridge'));
    }
    return supplierFilteredFormats;
  }, [isStrictlyLotusland, supplierFilteredFormats]);

  // Fallback if no hierarchy is present
  const availableFormats = sanitizedFormats.length > 0 ? sanitizedFormats : [
    { id: 'vial', name: 'Lyophilized Subcutaneous Vial', strengths: sortedStrengths.map(s => s.id) }
  ];

  const [activeFormatId, setActiveFormatId] = useState(() => {
    if (initialFormat) {
      const cleanF = String(initialFormat).toLowerCase();
      const found = availableFormats.find(f => f.id.toLowerCase() === cleanF || f.id.toLowerCase().includes(cleanF));
      if (found) return found.id;
    }
    return availableFormats[0]?.id || 'vial';
  });

  // Keep activeFormatId valid when available formats change
  useEffect(() => {
    if (!availableFormats.some(f => f.id === activeFormatId)) {
      setActiveFormatId(availableFormats[0]?.id || 'vial');
    }
  }, [availableFormats, activeFormatId]);

  const activeFormat = availableFormats.find(f => f.id === activeFormatId) || availableFormats[0];
  const activeFormatStrengthIds = Array.isArray(activeFormat?.strengths) ? activeFormat.strengths : [];

  const filteredStrengths = useMemo(() => {
    return sortedStrengths.filter(s => 
      activeFormatStrengthIds.length === 0 || activeFormatStrengthIds.includes(s.id)
    );
  }, [sortedStrengths, activeFormatStrengthIds]);

  const [selectedStrengthId, setSelectedStrengthId] = useState(() => {
    if (initialStrength) {
      const cleanS = String(initialStrength).toLowerCase().replace(/[-_\s]+/g, '');
      const found = filteredStrengths.find(s => {
        const sc = String(s.name || s.id).toLowerCase().replace(/[-_\s]+/g, '');
        return sc === cleanS || sc.includes(cleanS) || cleanS.includes(sc);
      });
      if (found) return found.id;
    }
    return filteredStrengths[0]?.id || sortedStrengths[0]?.id || '10_mg';
  });

  useEffect(() => {
    if (!filteredStrengths.some(s => s.id === selectedStrengthId)) {
      setSelectedStrengthId(filteredStrengths[0]?.id || sortedStrengths[0]?.id || '10_mg');
    }
  }, [filteredStrengths, selectedStrengthId, sortedStrengths]);

  // Optional Reconstitution Section State (Respects ?reconstitution=false)
  const [showReconstitutionSection, setShowReconstitutionSection] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('reconstitution') === 'false' || p.get('reconstitution') === '0') return false;
    }
    return true;
  });

  const selectedStrength = useMemo(() => {
    return filteredStrengths.find(s => s.id === selectedStrengthId) 
      || sortedStrengths.find(s => s.id === selectedStrengthId) 
      || filteredStrengths[0] 
      || sortedStrengths[0] 
      || null;
  }, [filteredStrengths, sortedStrengths, selectedStrengthId]);

  // Reactive Dynamic Share URL respecting active state
  const dynamicPublicUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (activeSupplierId && activeSupplierId !== 'all' && !product?.isSingleSupplierLocked) {
      params.set('supplier', activeSupplierId);
    } else if (product?.isSingleSupplierLocked && product?.supplierId) {
      params.set('supplier', product.supplierId);
    }
    if (activeFormatId) {
      params.set('format', activeFormatId);
    }
    if (selectedStrengthId) {
      params.set('dose', selectedStrengthId);
    }
    if (lang && lang !== 'en') {
      params.set('lang', lang);
    }
    const q = params.toString();
    return `${baseUrl}/p/${slug}${q ? `?${q}` : ''}`;
  }, [baseUrl, slug, activeSupplierId, activeFormatId, selectedStrengthId, lang, product]);

  const labelQueryString = useMemo(() => {
    const p = new URLSearchParams();
    const supp = (activeSupplierId && activeSupplierId !== 'all') ? activeSupplierId : (product?.isSingleSupplierLocked ? product?.supplierId : null);
    if (supp) p.set('supplier', supp);
    if (supplierName && !supplierName.includes('All Certified Laboratories')) {
      p.set('supplierName', supplierName);
    }
    const targetDose = selectedStrength?.name || selectedStrengthId;
    if (targetDose && targetDose !== 'all') p.set('dose', targetDose);
    if (activeFormatId && activeFormatId !== 'all') p.set('presentation', activeFormatId);
    if (lang && lang !== 'en') p.set('lang', lang);
    const qs = p.toString();
    return qs ? `&${qs}` : '';
  }, [activeSupplierId, product, supplierName, selectedStrength, selectedStrengthId, activeFormatId, lang]);

  // ⚡ Non-blocking Access Telemetry Beacon for Tracked Client Links
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('sid') || urlParams.get('share_id') || urlParams.get('logId');
    if (!sid) return;

    const payload = JSON.stringify({
      id: sid,
      event: 'view',
      productSlug: slug,
      productName: name,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      screen: `${window.innerWidth}x${window.innerHeight}`,
      viewedAt: new Date().toISOString(),
    });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/catalog/tracking-logs', blob);
      } else {
        fetch('/api/catalog/tracking-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Non-blocking telemetry failure is ignored
    }
  }, [slug, name]);

  const handlePrint = () => window.print();

  const handleCopyUrl = async () => {
    triggerHaptic('copy');
    await navigator.clipboard.writeText(dynamicPublicUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${name} (${activeFormat?.name || 'Monograph'}) — Official Monograph | Atlas Services × ${supplierName}`,
          text: `Official Pharmaceutical Monograph & Analytical Specifications for ${name}. Formulated as ${activeFormat?.name || 'clinical grade peptide'}, synthesized under verified cGMP quality standards by ${supplierName} for Atlas Services. RP-HPLC Purity ≥ 99.0%.`,
          url: dynamicPublicUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await handleCopyUrl();
  };

  const handleWhatsApp = () => {
    triggerHaptic('light');
    const isPenOrCart = (activeFormatId || '').includes('pen') || (activeFormatId || '').includes('cartridge');
    const isSpray = (activeFormatId || '').includes('spray');
    const isOral = (activeFormatId || '').includes('capsule') || (activeFormatId || '').includes('tablet');
    const formatLabel = activeFormat?.name || (isPenOrCart ? 'Pre-filled SubQ Pen' : isSpray ? 'Intranasal Spray Device' : isOral ? 'Oral Gastro-Resistant Capsule' : 'Sterile Lyophilized SubQ Vial');
    const recon = getReconstitutionVolume(selectedStrength?.name);
    const purityText = purity || '≥ 99.0% (RP-HPLC Verified)';
    const targetText = targetSystem || 'Clinical Incretin / Target Receptor Axis';
    
    let adminLine = `• *Reconstitution:* ${recon.volume} mL BAC Water → ${recon.concentration} mg/mL · Cold-Chain 2–8°C\n`;
    if (isPenOrCart) {
      adminLine = `• *Administration:* Pre-filled Multi-Dose SubQ Pen · Cold-Chain 2–8°C (Ready to Use, No Reconstitution)\n`;
    } else if (isSpray) {
      adminLine = `• *Administration:* Intranasal Spray · Metered Dose Pump · Cold-Chain 2–8°C\n`;
    } else if (isOral) {
      adminLine = `• *Administration:* Oral Gastro-Resistant Capsule · Ingest with water on empty stomach\n`;
    }

    const pharmaMsg = 
      `🔬 *${name}* — Official Pharmaceutical Monograph & Clinical Specifications\n\n` +
      `• *Formulation:* ${formatLabel}\n` +
      `• *Target Dose:* ${selectedStrength?.name || 'Standard'}\n` +
      `• *Synthesis Lab:* ${supplierName} (Verified Quality Standards) for Atlas Services\n` +
      `• *Analytical Release:* RP-HPLC Purity ${purityText} · ESI-MS Mass Verified\n` +
      `• *Receptor Target Axis:* ${targetText}\n` +
      adminLine +
      `• *Regulatory Class:* Clinical Research & Analytical Standard (Zero Impurities)\n\n` +
      `📑 *Access Official Monograph & Certificate of Analysis:*\n${dynamicPublicUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(pharmaMsg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="public-datasheet-root">
      {/* ── Fixed Top Institutional Header ── */}
      <header className="pds-top-bar">
        <div className="pds-bar-inner">
          <div className="pds-brand-group">
            <span className="pds-brand-title">{t.brandName}</span>
            <span className="pds-badge-pill">{t.scientificMonograph}</span>
            <span className="pds-zero-price-badge">{t.clinicalReference}</span>
          </div>

          <div className="pds-actions-group">
            {/* Multi-language Selector */}
            <select 
              className="pds-lang-select" 
              value={lang} 
              onChange={(e) => startTransition(() => setLang(e.target.value))}
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>

            <button 
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsPreviewModalOpen(true);
              }}
              className="pds-btn pds-btn-pdf"
              title="Preview Monograph & Download PDF"
            >
              <Eye size={14} /> Preview PDF
            </button>

            <a 
              href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=full${labelQueryString}`}
              target="_blank" 
              rel="noopener noreferrer" 
              download={`vial_label_${slug}_full_38x90.pdf`}
              className="pds-btn pds-btn-barcode"
              title="Download Complete Specification Vial Label 38x90mm (PDF)"
            >
              <Tag size={14} /> Full Label
            </a>

            <a 
              href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=barcode${labelQueryString}`}
              target="_blank" 
              rel="noopener noreferrer" 
              download={`batch_label_${slug}_barcode_38x90.pdf`}
              className="pds-btn pds-btn-barcode"
              title="Download Direct Monograph Barcode & QR Label (PDF)"
            >
              <QrCode size={14} /> Barcode Only
            </a>

            <button 
              type="button"
              onClick={() => {
                triggerHaptic('light');
                const el = document.getElementById('reconstitution-guide');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="pds-btn pds-btn-ghost"
              title="Interactive Reconstitution Calculator & Syringe Visualizer"
            >
              <FlaskConical size={14} /> Reconstitution
            </button>

            <button 
              type="button"
              onClick={() => setIsShareDrawerOpen(true)} 
              className="pds-btn pds-btn-ghost" 
              title={t.shareColleague}
            >
              <Share2 size={14} />
              <span>{t.shareColleague}</span>
            </button>

            <button 
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsPreviewModalOpen(true);
              }} 
              className="pds-btn pds-btn-ghost" 
              title="Preview & Print Complete Monograph (All Formulations)"
            >
              <Printer size={14} /> {t.printPdf}
            </button>

            <button onClick={handleWhatsApp} className="pds-btn pds-btn-wa">
              <WaIcon /> WhatsApp
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Monograph Container ── */}
      <main className="pds-container">

        {/* Hero Section */}
        <section className="pds-hero">
          <div className="pds-hero-header">
            <div className="pds-tag-group">
              <span className="pds-cat-tag">{category}</span>
              <span className="pds-cgmp-tag">
                {isStrictlyLotusland ? t.lotuslandVerified : `${supplierName} Quality Verified`}
              </span>
            </div>
            <h1 className="pds-title">{name}</h1>
            <p className="pds-target">
              <strong>Target Receptor Axis:</strong> {targetSystem}
            </p>
          </div>

          {description && (
            <div className="pds-description-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 className="pds-section-heading" style={{ margin: 0 }}>
                  {t.pharmacologicalOverview || 'Pharmacological Overview'}
                </h2>
                {isTranslating ? (
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, backgroundColor: '#f0f9ff', padding: '3px 10px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <Sparkles size={13} className="spin" /> {t.translating || 'Translating with Gemini…'}
                  </span>
                ) : lang !== 'en' && (
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <Sparkles size={11} color="#0284c7" /> Gemini 2.5 Flash Translated
                  </span>
                )}
              </div>
              <p className="pds-description-body">{description}</p>
            </div>
          )}
        </section>

        {/* ── Available Strengths & Administration Formats Matrix ── */}
        <section className="pds-matrix-section">
          <div className="pds-matrix-header">
            <div>
              <h2 className="pds-section-heading" style={{ marginBottom: '0.25rem' }}>
                <Layers size={18} color="#003666" />
                {t.presentationsMatrix} ({supplierName})
              </h2>
              <p className="pds-matrix-subtitle">
                {t.activePresentation}
              </p>
            </div>
            <div className="pds-supplier-badge">
              <CheckCircle2 size={13} color="#0284c7" />
              <span>Pedigree Verified ({supplierName})</span>
            </div>
          </div>

          {/* Multi-Supplier Laboratory Selector (Rendered ONLY if product has multiple verified suppliers) */}
          {isMultiSupplierMode && (
            <div className="pds-lab-filter-wrap" style={{ marginBottom: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={15} color="#003666" />
                  Verified Manufacturing Laboratories:
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {suppliersList.length} verified sources available
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSupplierId('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: activeSupplierId === 'all' ? 700 : 500,
                    background: activeSupplierId === 'all' ? '#003666' : '#ffffff',
                    color: activeSupplierId === 'all' ? '#ffffff' : '#334155',
                    border: activeSupplierId === 'all' ? '1px solid #003666' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🌐 All Laboratories (Overview)
                </button>

                {suppliersList.map(s => {
                  const isSelected = activeSupplierId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSupplierId(s.id);
                        // Auto-select first compatible format for this supplier
                        const suppFormatIds = Array.isArray(s.formats) ? s.formats : [];
                        const compatFormats = rawFormats.filter(f => suppFormatIds.includes(f.id));
                        if (compatFormats.length > 0 && !compatFormats.some(f => f.id === activeFormatId)) {
                          setActiveFormatId(compatFormats[0].id);
                        }
                      }}
                      style={{
                        padding: '6px 14px',
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
            </div>
          )}

          {/* Administration Format Tabs */}
          <div className="pds-format-tabs">
            {availableFormats.map(fmt => {
              const isActive = fmt.id === activeFormatId;
              const isPen = fmt.id.includes('pen');
              const isCartridge = fmt.id.includes('cartridge');
              let icon = '🧪';
              let subtitle = 'Lyophilized SubQ Cake (Sterile Vial)';
              if (isPen) {
                icon = '🖊️';
                subtitle = 'Prefilled Multi-Dose Dial Device';
              } else if (isCartridge) {
                icon = '💉';
                subtitle = '3 mL Multi-Dose Refill Cartridge';
              } else if (fmt.id.includes('spray')) {
                icon = '💨';
                subtitle = 'Intranasal Spray Device';
              } else if (fmt.id.includes('capsule') || fmt.id.includes('tablet')) {
                icon = '💊';
                subtitle = 'Oral Gastro-Resistant Formulation';
              }

              return (
                <button
                  key={fmt.id}
                  onClick={() => {
                    setActiveFormatId(fmt.id);
                    const compat = sortedStrengths.filter(s => !fmt.strengths || fmt.strengths.includes(s.id));
                    if (compat.length > 0 && !compat.some(s => s.id === selectedStrengthId)) {
                      setSelectedStrengthId(compat[0].id);
                    }
                  }}
                  className={`pds-format-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="pds-format-tab-icon">{icon}</span>
                  <div className="pds-format-tab-text">
                    <span className="pds-format-tab-name">{fmt.name}</span>
                    <span className="pds-format-tab-sub">{subtitle}</span>
                  </div>
                  {isActive && <span className="pds-format-active-dot" />}
                </button>
              );
            })}
          </div>

          {/* Strengths Chips */}
          <div className="pds-strengths-wrapper">
            <div className="pds-strengths-label-row">
              <span className="pds-sublabel">Select Available Strength / Dose:</span>
              <span className="pds-count-badge">{filteredStrengths.length} options available</span>
            </div>

            <div className="pds-strength-chips">
              {filteredStrengths.map(st => {
                const isSelected = st.id === selectedStrengthId;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStrengthId(st.id)}
                    className={`pds-strength-chip ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="pds-chip-dot" />
                    <strong>{st.name}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Specification Detail Box */}
          <div className="pds-selected-detail-card">
            <div className="pds-detail-grid">
              <div className="pds-detail-col">
                <span className="pds-dlabel">Active Content</span>
                <span className="pds-dval font-bold text-sky-950">{selectedStrength?.name || '10 mg'}</span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">Administration Route</span>
                <span className="pds-dval">Subcutaneous (SubQ) Periumbilical</span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">
                  {((activeFormatId || '').includes('pen') || (activeFormatId || '').includes('cartridge')) 
                    ? 'Device Delivery' 
                    : 'Recommended Reconstitution'}
                </span>
                <span className="pds-dval">
                  {((activeFormatId || '').includes('pen') || (activeFormatId || '').includes('cartridge')) ? (
                    <>
                      Pre-dissolved SubQ Liquid (Ready to Use)
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → Direct multi-dose dial injection (no BAC reconstitution required)
                      </span>
                    </>
                  ) : (
                    <>
                      {getReconstitutionVolume(selectedStrength?.name).volume} mL Bacteriostatic Water (BAC)
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {getReconstitutionVolume(selectedStrength?.name).concentration} mg/mL final concentration
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">Lyophilization / Excipient</span>
                <span className="pds-dval">
                  {((activeFormatId || '').includes('pen') || (activeFormatId || '').includes('cartridge'))
                    ? 'Sterile Isotonic Solution (pH 6.8–7.4)'
                    : 'D-Mannitol (USP / EP Grade)'}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">Sourcing & Batch Release</span>
                <span className="pds-dval">{supplierName} (Verified Clinical Quality)</span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">Analytical Purity</span>
                <span className="pds-dval font-bold text-sky-950">≥ 99.0% (RP-HPLC Verified)</span>
              </div>
            </div>
          </div>

          {/* ── Complete Formulations & Strengths Matrix (Always fully visible in Print & Web) ── */}
          <div className="pds-all-strengths-matrix">
            <div className="pds-matrix-header-row">
              <div>
                <h4 className="pds-matrix-table-title">
                  <span>📋</span> Complete Formulations & Strengths Matrix
                </h4>
                <p className="pds-matrix-table-sub">
                  Full analytical index of all approved laboratory presentations, doses and preparation protocols for {name}
                </p>
              </div>
              <span className="pds-matrix-print-pill">
                All Available Options Included
              </span>
            </div>

            <div className="pds-table-responsive">
              <table className="pds-strengths-table">
                <thead>
                  <tr>
                    <th>Strength / Dose</th>
                    <th>Presentation Format</th>
                    <th>Reconstitution Diluent</th>
                    <th>Resulting Concentration</th>
                    <th>Administration</th>
                    <th>Analytical Grade</th>
                    <th>Laboratory Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {availableFormats.flatMap(fmt => {
                    const compatStrengths = sortedStrengths.filter(s => !fmt.strengths || fmt.strengths.includes(s.id));
                    const list = compatStrengths.length > 0 ? compatStrengths : [{ id: 'std', name: 'Standard Clinical Dose' }];
                    const isPenOrCart = fmt.id.includes('pen') || fmt.id.includes('cartridge');
                    const isOral = fmt.id.includes('capsule') || fmt.id.includes('tablet') || fmt.id.includes('oral');
                    const isSpray = fmt.id.includes('spray') || fmt.id.includes('nasal');

                    return list.map(st => {
                      const recon = getReconstitutionVolume(st.name);
                      const isCurrentlyActive = fmt.id === activeFormatId && st.id === selectedStrengthId;

                      const diluentText = isPenOrCart 
                        ? 'Pre-filled Solution (Zero mixing)' 
                        : isOral 
                          ? 'Solid Oral Dose (No diluent)'
                          : isSpray
                            ? 'Pre-metered Intranasal Solution'
                            : `${recon.volume} mL BAC Water`;

                      const concText = isPenOrCart 
                        ? 'Pre-formulated Liquid' 
                        : isOral 
                          ? 'Unit Dosage'
                          : isSpray
                            ? 'Metered Spray Solution'
                            : `${recon.concentration} mg/mL`;

                      const adminText = isOral 
                        ? 'Oral (Gastro-resistant)' 
                        : isSpray 
                          ? 'Intranasal (Nasal Mucosa)'
                          : isPenOrCart
                            ? 'SubQ Pen Injection'
                            : 'Subcutaneous (SubQ)';

                      return (
                        <tr 
                          key={`${fmt.id}-${st.id}`} 
                          className={isCurrentlyActive ? 'pds-row-selected' : ''}
                          onClick={() => {
                            setActiveFormatId(fmt.id);
                            setSelectedStrengthId(st.id);
                          }}
                          style={{ cursor: 'pointer' }}
                          title={`Click to select ${st.name} ${fmt.name}`}
                        >
                          <td data-label="Strength / Dose">
                            <span className="pds-mobile-card-title">{st.name}</span>
                            <span className="pds-mobile-card-badges">
                              <span className="pds-format-mini-badge">{fmt.name}</span>
                              {isCurrentlyActive && <span className="pds-active-badge">Active Selection</span>}
                            </span>
                          </td>
                          <td data-label="Presentation Format">{fmt.name}</td>
                          <td data-label="Reconstitution Diluent">{diluentText}</td>
                          <td data-label="Resulting Concentration" className="pds-conc-cell">{concText}</td>
                          <td data-label="Administration">{adminText}</td>
                          <td data-label="Analytical Grade" className="pds-purity-cell">≥ 99.0% (RP-HPLC)</td>
                          <td data-label="Laboratory Verification">{supplierName}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Block 2.5: Interactive Reconstitution Simulator & Precision Syringe Visualizer (Optional & Toggleable) ── */}
        <section id="reconstitution-guide" className="pds-reconstitution-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            marginBottom: showReconstitutionSection ? '14px' : '0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={17} color="#0284c7" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                Reconstitution Simulator & Syringe Visualizer
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '10px' }}>
                Optional Tool
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowReconstitutionSection(prev => !prev)}
              style={{
                backgroundColor: showReconstitutionSection ? '#f1f5f9' : '#003666',
                color: showReconstitutionSection ? '#334155' : '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {showReconstitutionSection ? 'Hide Section ✕' : 'Show Simulator ▾'}
            </button>
          </div>

          {showReconstitutionSection && (
            <InteractiveReconstitutionGuide
              product={product}
              selectedStrength={selectedStrength}
              availableStrengths={sortedStrengths}
              activeFormatId={activeFormatId}
              activeFormat={activeFormat}
              supplierName={supplierName}
              lang={lang}
            />
          )}
        </section>

        {/* ── Block 3: Analytical Certificate & Molecular Profile (Unified COA & Specs) ── */}
        <section className="pds-specs-section">
          <ProductTraceabilityCard product={product} baseUrl={baseUrl} lang={lang} />
        </section>

        {/* ── Block 4: Physical Labels & Dispensing Downloads ── */}
        <section id="labels-section" className="pds-vial-label-section">
          <div className="pds-vial-label-card">
            <div className="pds-vial-label-header">
              <div className="pds-vial-label-title-group">
                <div className="pds-vial-label-icon-badge">
                  <QrCode size={22} color="#003666" />
                </div>
                <div>
                  <h3 className="pds-vial-label-title">Physical Vial Labels &amp; Batch Printing</h3>
                  <p className="pds-vial-label-subtitle">
                    Standard 38×90mm adhesive labels and batch sheets formatted for clinical and dispatch use.
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Label Options Grid: Shipping vs Client Vial */}
            <div className="pds-dual-labels-grid">
              {/* Option 1: Shipping / Batch Traceability Label */}
              <div className="pds-label-type-card">
                <div className="pds-label-type-head">
                  <span className="pds-label-badge-icon">📦</span>
                  <div>
                    <h4 className="pds-label-type-title">Shipping &amp; Traceability Label</h4>
                    <span className="pds-label-use-tag">For Outbound Box &amp; Logistics</span>
                  </div>
                </div>
                <p className="pds-label-type-desc">
                  Discreet packaging label with high-density 1D barcode and QR code. Enables instant camera lookup of the digital monograph and laboratory certificate without displaying brand names.
                </p>
                <div className="pds-label-type-buttons">
                  <a 
                    href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=shipping&download=1${labelQueryString}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    download={`shipping_label_${slug}_38x90.pdf`}
                    className="pds-btn pds-btn-barcode"
                    title="Download 38x90mm Shipping Label (PDF File)"
                  >
                    <Download size={14} /> Download 38×90mm PDF
                  </a>
                  <a 
                    href={`/api/vial-label/${encodeURIComponent(slug)}?format=sheet_a4&type=shipping&download=1${labelQueryString}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    download={`shipping_labels_sheet_${slug}_a4.pdf`}
                    className="pds-btn pds-btn-ghost"
                    title="Download A4 Sheet with 8 Shipping Labels (PDF File)"
                  >
                    <FileText size={14} /> Sheet (A4 ×8 PDF)
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLabelUrl('shipping')}
                    className="pds-btn pds-btn-copy-label"
                    title="Copy direct shareable link to this shipping label"
                  >
                    {copiedLabelType === 'shipping' ? (
                      <><Check size={13} style={{ color: '#16a34a' }} /> <span>Copied Link</span></>
                    ) : (
                      <><Copy size={13} /> <span>Copy Link</span></>
                    )}
                  </button>
                </div>
              </div>

              {/* Option 2: Client Vial Application Label */}
              <div className="pds-label-type-card highlight">
                <div className="pds-label-type-head">
                  <span className="pds-label-badge-icon">🏷️</span>
                  <div>
                    <h4 className="pds-label-type-title">Client Vial Application Label</h4>
                    <span className="pds-label-use-tag active">For Customer Vial Adhesion</span>
                  </div>
                </div>
                <p className="pds-label-type-desc">
                  Full clinical specification label provided for the client or clinician to adhere directly onto the vial. Includes dose, RP-HPLC purity, handwriteable reconstitution fields, and cold-chain guidance.
                </p>
                <div className="pds-label-type-buttons">
                  <a 
                    href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=client&download=1${labelQueryString}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    download={`client_vial_label_${slug}_38x90.pdf`}
                    className="pds-btn pds-btn-pdf"
                    title="Download 38x90mm Client Vial Label (PDF File)"
                  >
                    <Download size={14} /> Download 38×90mm PDF
                  </a>
                  <a 
                    href={`/api/vial-label/${encodeURIComponent(slug)}?format=sheet_a4&type=client&download=1${labelQueryString}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    download={`client_vial_labels_sheet_${slug}_a4.pdf`}
                    className="pds-btn pds-btn-ghost"
                    title="Download A4 Sheet with 8 Client Vial Labels (PDF File)"
                  >
                    <FileText size={14} /> Sheet (A4 ×8 PDF)
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLabelUrl('client')}
                    className="pds-btn pds-btn-copy-label"
                    title="Copy direct shareable link to this client vial label"
                  >
                    {copiedLabelType === 'client' ? (
                      <><Check size={13} style={{ color: '#16a34a' }} /> <span>Copied Link</span></>
                    ) : (
                      <><Copy size={13} /> <span>Copy Link</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Scannable Label Preview */}
            <div className="pds-vial-label-preview-wrap">
              {inlineSvg ? (
                <div
                  className="pds-vial-label-img"
                  aria-label={`Official Barcode & QR Label for ${name}`}
                  dangerouslySetInnerHTML={{ __html: inlineSvg }}
                />
              ) : svgError ? (
                <div className="pds-vial-label-error">
                  <span>⚠ Could not load barcode label. Check your connection.</span>
                </div>
              ) : (
                <div className="pds-vial-label-skeleton" aria-label="Loading barcode..." />
              )}
            </div>
          </div>
        </section>

        {/* Institutional Regulatory Footnote */}
        <footer className="pds-page-footer">
          <div className="pds-footer-box">
            <p className="pds-footer-text">
              <strong>Quality & Regulatory Governance:</strong> Synthesized under certified ISO 9001:2015 and current Good Manufacturing Practice (cGMP) quality management systems. Sourced through authorized synthesis partner ({supplierName}). All analytical batches undergo independent dual-column RP-HPLC and LC-MS release testing. This technical document is intended exclusively for authorized medical professionals, clinical researchers, and institutional partners.
            </p>
            <p className="pds-footer-meta">
              Document Ref: PDS-{slug.toUpperCase()}-2026 • Verified on Atlas Health Clinical Engine • {new Date().getFullYear()} ATLAS HEALTH Clinical Portal
            </p>
          </div>
        </footer>
      </main>

      {/* ── High-Conversion Sticky Mobile Action Bar ── */}
      <PublicDatasheetMobileBar
        product={product}
        name={name}
        activeFormat={activeFormat}
        selectedStrength={selectedStrength}
        supplierName={supplierName}
        dynamicPublicUrl={dynamicPublicUrl}
        pdfUrl={pdfUrl}
        onOpenPreview={() => {
          triggerHaptic('light');
          setIsPreviewModalOpen(true);
        }}
        lang={lang}
      />

      {/* Dynamic Flexible Share Monograph Drawer */}
      <ShareProductMonographDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        product={product}
        initialSupplierKey={activeSupplierId !== 'all' ? activeSupplierId : (product?.supplierId || null)}
        initialFormatId={activeFormatId}
        initialStrengthId={selectedStrengthId}
      />

      {/* Visual Clinical Monograph & PDF Preview Modal */}
      <MonographPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        product={product}
        slug={slug}
        supplierName={supplierName}
        activeFormat={activeFormat}
        selectedStrength={selectedStrength}
        availableFormats={availableFormats}
        sortedStrengths={sortedStrengths}
        dynamicPublicUrl={dynamicPublicUrl}
        labelQueryString={labelQueryString}
      />
    </div>
  );
}


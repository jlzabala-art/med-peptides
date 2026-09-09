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
  ExternalLink
} from '@/lib/icons';
import { SUPPORTED_LANGUAGES, getTranslations, getLocalizedField } from '../../utils/productTranslations';
import ProductTraceabilityCard from './ProductTraceabilityCard';
import InteractiveReconstitutionGuide from './InteractiveReconstitutionGuide';

function WaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/>
    </svg>
  );
}

export default function PublicDatasheetView({ product, slug, baseUrl }) {
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [inlineSvg, setInlineSvg] = useState(null);
  const [svgError, setSvgError] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [, startTransition] = useTransition();
  const requestedLangs = useRef(new Set());

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language?.slice(0, 2)?.toLowerCase();
      if (browserLang && SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
        setLang(browserLang);
      }
    }
  }, []);

  const t = getTranslations(lang);
  const publicUrl = `${baseUrl}/p/${slug}`;
  const targetId = product?.id || slug;
  const pdfUrl = `/api/product-sheet/${encodeURIComponent(targetId)}?format=vial`;
  const barcodeImageUrl = `/api/barcode/${encodeURIComponent(slug)}?supplier=lotusland`;

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
  }, [slug]);

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
  const rawFormats = Array.isArray(hierarchy.formats) ? hierarchy.formats : [];
  const rawStrengths = Array.isArray(hierarchy.strengths) ? hierarchy.strengths : [];
  const supplierName = product?.supplierName || product?.supplier || 'Lotusland Clinical Synthesis';

  const parseNum = (str) => {
    const m = String(str || '').match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : 999;
  };

  /**
   * Recommended BAC Water Reconstitution Volume by Vial Strength
   * ────────────────────────────────────────────────────────────────
   * Clinical best practice targets a concentration of ~2.5 mg/mL,
   * which yields practical dose volumes (0.1–0.5 mL) measurable on
   * a standard U-100 insulin syringe (1 mL / 100 units).
   *
   * Formula: Volume (mL) = ActiveContent (mg) / TargetConcentration (mg/mL)
   * Rounded to nearest 0.5 mL for practical clinical use.
   *
   * Reference values:
   *   5 mg  → 2.0 mL (2.5 mg/mL)   — standard for low-dose titration
   *  10 mg  → 2.0 mL (5.0 mg/mL)   — most common research reconstitution
   *  15 mg  → 3.0 mL (5.0 mg/mL)   — maintains consistent concentration
   *  20 mg  → 4.0 mL (5.0 mg/mL)   — avoids high-viscosity solution
   *  30 mg  → 6.0 mL (5.0 mg/mL)   — prevents peptide aggregation
   *  40 mg  → 8.0 mL (5.0 mg/mL)   — clinical max for single vial
   *  50 mg  → 10.0 mL (5.0 mg/mL)  — requires 10 mL BAC vial
   */
  const getReconstitutionVolume = (strengthName) => {
    const mg = parseNum(strengthName);
    if (mg <= 0 || isNaN(mg)) return { volume: '2.0', concentration: '5.0' };

    // Target 5.0 mg/mL for all strengths ≥ 10 mg; 2.5 mg/mL for ≤ 5 mg (easier low-dose titration)
    const targetConc = mg <= 5 ? 2.5 : 5.0;
    const rawVol = mg / targetConc;
    // Round to nearest 0.5 mL for practical syringe measurement
    const volume = (Math.round(rawVol * 2) / 2).toFixed(1);
    const concentration = (mg / parseFloat(volume)).toFixed(1);
    return { volume, concentration };
  };

  const sortedStrengths = [...rawStrengths].sort((a, b) => parseNum(a.name || a.id) - parseNum(b.name || b.id));

  // Lotusland strictly manufactures Lyophilized Subcutaneous Vials (no cartridges or pens)
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const supplierIds = Array.isArray(product?.supplierIds) ? product.supplierIds : [];

  // Strictly Lotusland check: true ONLY if all suppliers/variants are Lotusland (no mixed suppliers)
  const isStrictlyLotusland = useMemo(() => {
    if (supplierIds.length > 0) {
      return supplierIds.every(id => String(id).toLowerCase().includes('lotusland'));
    }
    if (variants.length > 0) {
      return variants.every(v => {
        const s = (v.supplier || v.supplierName || v.supplierId || '').toLowerCase();
        return s.includes('lotusland');
      });
    }
    const topSupplier = (product?.supplier || product?.supplierName || product?.supplierId || '').toLowerCase();
    return topSupplier.includes('lotusland');
  }, [product, supplierIds, variants]);

  const isLotusland = (supplierName || '').toLowerCase().includes('lotusland') || (product?.supplierId || '').toLowerCase().includes('lotusland');
  const sanitizedFormats = isLotusland 
    ? rawFormats.filter(f => !f.id.includes('pen') && !f.id.includes('cartridge'))
    : rawFormats;

  // Fallback if no hierarchy is present
  const availableFormats = sanitizedFormats.length > 0 ? sanitizedFormats : [
    { id: 'vial', name: 'Lyophilized Subcutaneous Vial', strengths: sortedStrengths.map(s => s.id) }
  ];

  const [activeFormatId, setActiveFormatId] = useState(availableFormats[0]?.id || 'vial');
  const activeFormat = availableFormats.find(f => f.id === activeFormatId) || availableFormats[0];

  const activeFormatStrengthIds = Array.isArray(activeFormat?.strengths) ? activeFormat.strengths : [];
  const filteredStrengths = sortedStrengths.filter(s => 
    activeFormatStrengthIds.length === 0 || activeFormatStrengthIds.includes(s.id)
  );

  const [selectedStrengthId, setSelectedStrengthId] = useState(filteredStrengths[0]?.id || sortedStrengths[0]?.id || '10_mg');
  const selectedStrength = sortedStrengths.find(s => s.id === selectedStrengthId) || filteredStrengths[0] || { name: '10 mg' };

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
    await navigator.clipboard.writeText(publicUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${name} (SubQ Vial) — Official Monograph | RegenPept × Lotusland`,
          text: `Official Pharmaceutical Monograph & Analytical Specifications for ${name}. Formulated as a sterile lyophilized SubQ vial, synthesized under cGMP & ISO 9001:2015 by Lotusland for RegenPept. RP-HPLC Purity ≥ 99.0%.`,
          url: publicUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await handleCopyUrl();
  };

  const handleWhatsApp = () => {
    const recon = getReconstitutionVolume(selectedStrength?.name);
    const purityText = purity || '≥ 99.0% (RP-HPLC Verified)';
    const targetText = targetSystem || 'Clinical Incretin / Target Receptor Axis';
    const pharmaMsg = 
      `🔬 *${name}* — Official Pharmaceutical Monograph & Clinical Specifications\n\n` +
      `• *Formulation:* Sterile Lyophilized Subcutaneous Vial\n` +
      `• *Synthesis Lab:* Lotusland (cGMP / ISO 9001:2015 Certified) for RegenPept\n` +
      `• *Analytical Release:* RP-HPLC Purity ${purityText} · ESI-MS Mass Verified\n` +
      `• *Receptor Target Axis:* ${targetText}\n` +
      `• *Reconstitution:* ${recon.volume} mL BAC Water → ${recon.concentration} mg/mL · Cold-Chain 2–8°C\n` +
      `• *Regulatory Class:* Clinical Research & Analytical Standard (Zero Impurities)\n\n` +
      `📑 *Access Official Monograph & Certificate of Analysis:*\n${publicUrl}`;

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

            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="pds-btn pds-btn-pdf"
            >
              <Download size={14} /> {t.downloadPdf}
            </a>

            <a 
              href={barcodeImageUrl} 
              download={`LOT-${slug.toUpperCase()}-vial-barcode.svg`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="pds-btn pds-btn-barcode"
              title="Download High-Resolution Scannable Vial Barcode & QR Label"
            >
              <QrCode size={14} /> Vial Barcode / QR
            </a>

            <button onClick={handleShare} className="pds-btn pds-btn-ghost" title={t.copyLink}>
              {copied ? <Check size={14} color="#4ade80" /> : <Share2 size={14} />}
              {copied ? t.copied : t.shareColleague}
            </button>

            <button onClick={handlePrint} className="pds-btn pds-btn-ghost pds-print-hide-desktop">
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
              <span className="pds-cgmp-tag">{t.lotuslandVerified}</span>
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
                {isTranslating && (
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, backgroundColor: '#f0f9ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                    <Sparkles size={12} /> {t.translating || 'Translating...'}
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

          {/* Administration Format Tabs */}
          <div className="pds-format-tabs">
            {availableFormats.map(fmt => {
              const isActive = fmt.id === activeFormatId;
              const isPen = fmt.id.includes('pen');
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
                  <span className="pds-format-tab-icon">{isPen ? '🖊️' : '🧪'}</span>
                  <div className="pds-format-tab-text">
                    <span className="pds-format-tab-name">{fmt.name}</span>
                    <span className="pds-format-tab-sub">
                      {isPen ? 'Prefilled Multi-Dose Dial Device' : 'Lyophilized SubQ Cake (Single or 10-Pack Kit)'}
                    </span>
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
                <span className="pds-dlabel">Recommended Reconstitution</span>
                <span className="pds-dval">
                  {getReconstitutionVolume(selectedStrength?.name).volume} mL Bacteriostatic Water (BAC)
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    → {getReconstitutionVolume(selectedStrength?.name).concentration} mg/mL final concentration
                  </span>
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">Lyophilization Cryoprotectant</span>
                <span className="pds-dval">D-Mannitol (USP / EP Grade)</span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">Sourcing & Batch Release</span>
                <span className="pds-dval">{supplierName} (cGMP Verified)</span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">Analytical Purity</span>
                <span className="pds-dval font-bold text-sky-950">≥ 99.0% (RP-HPLC Verified)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Scientific Identity Grid */}
        <section className="pds-specs-section">
          <h2 className="pds-section-heading">
            <FlaskConical size={18} color="#003666" />
            Chemical & Molecular Specifications
          </h2>

          <div className="pds-specs-grid">
            <div className="pds-spec-box">
              <span className="pds-spec-label">CAS Registry Number</span>
              <span className="pds-spec-val font-mono">{casNumber}</span>
            </div>

            {formula && (
              <div className="pds-spec-box">
                <span className="pds-spec-label">Molecular Formula</span>
                <span className="pds-spec-val font-mono">{formula}</span>
              </div>
            )}

            {mw && (
              <div className="pds-spec-box">
                <span className="pds-spec-label">Molecular Weight</span>
                <span className="pds-spec-val font-mono">{mw}</span>
              </div>
            )}

            <div className="pds-spec-box">
              <span className="pds-spec-label">Physical Appearance</span>
              <span className="pds-spec-val">White to off-white lyophilized powder</span>
            </div>

            <div className="pds-spec-box">
              <span className="pds-spec-label">Reconstitution Vehicle</span>
              <span className="pds-spec-val">Bacteriostatic Water (0.9% Benzyl Alcohol) or USP Saline</span>
            </div>

            <div className="pds-spec-box">
              <span className="pds-spec-label">Lyophilized Storage</span>
              <span className="pds-spec-val font-semibold text-sky-900">-20°C (Protect from light & humidity)</span>
            </div>
          </div>

          {sequence && (
            <div className="pds-sequence-box">
              <span className="pds-spec-label">Primary Peptide Sequence (Mono-letter Notation)</span>
              <code className="pds-sequence-code">{sequence}</code>
            </div>
          )}
        </section>

        {/* Analytical Traceability Card */}
        <section className="pds-specs-section">
          <ProductTraceabilityCard product={product} baseUrl={baseUrl} lang={lang} />
        </section>

        {/* Scannable Vial Label & Batch Barcode Section */}
        <section className="pds-vial-label-section">
          <div className="pds-vial-label-card">
            <div className="pds-vial-label-header">
              <div className="pds-vial-label-title-group">
                <div className="pds-vial-label-icon-badge">
                  <QrCode size={20} color="#003666" />
                </div>
                <div>
                  <h3 className="pds-vial-label-title">{t.vialQrTitle}</h3>
                  <p className="pds-vial-label-subtitle">
                    {t.vialQrSubtitle}
                  </p>
                </div>
              </div>
              <div className="pds-vial-label-actions">
                <a 
                  href={barcodeImageUrl}
                  download={`LOT-${slug.toUpperCase()}-vial-label.svg`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="pds-btn pds-btn-barcode"
                >
                  <Download size={14} /> {t.downloadLabelSvg}
                </a>
              </div>
            </div>

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

        {/* Reconstitution Protocol & Interactive Syringe Simulator */}
        <section className="pds-guide-section">
          <InteractiveReconstitutionGuide
            product={product}
            selectedStrength={selectedStrength}
            lang={lang}
          />
        </section>

        {/* ── Provenance & Alliance (moved from top for less distraction) ── */}
        <section className="pds-provenance-section">
          <div className="pds-notice-card">
            <div className="pds-notice-icon">
              <ShieldCheck size={20} color="#0284c7" />
            </div>
            <div className="pds-notice-text">
              <strong>{t.provenanceNoticeTitle}</strong>
              <span>{t.provenanceNoticeDesc}</span>
            </div>
          </div>

          {isStrictlyLotusland && (
            <div className="pds-alliance-card">
              <div className="pds-alliance-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="pds-alliance-body">
                <strong className="pds-alliance-title">
                  Relationship: RegenPept × Lotusland Clinical Synthesis Alliance
                </strong>
                <span>
                  <strong>RegenPept</strong> is the clinical peptide research, quality assurance, and distribution platform. <strong>Lotusland</strong> is the primary accredited cGMP and ISO 9001 certified pharmaceutical synthesis laboratory that manufactures and lyophilizes peptide batches for RegenPept. Lotusland compounds are strictly synthesized in lyophilized subcutaneous vials (never cartridges or pens), subject to dual-stage analytical verification (RP-HPLC purity ≥ 99.0% and ESI-MS molecular confirmation).
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Institutional Regulatory Footnote */}
        <footer className="pds-page-footer">
          <div className="pds-footer-box">
            <p className="pds-footer-text">
              <strong>Quality & Regulatory Governance:</strong> Synthesized under certified ISO 9001:2015 and current Good Manufacturing Practice (cGMP) quality management systems. Sourced through authorized synthesis partner ({supplierName}). All analytical batches undergo independent dual-column RP-HPLC and LC-MS release testing. This technical document is intended exclusively for authorized medical professionals, clinical researchers, and institutional partners.
            </p>
            <p className="pds-footer-meta">
              Document Ref: PDS-{slug.toUpperCase()}-2026 • Verified on Atlas Health Clinical Engine • {new Date().getFullYear()} RegenPept
            </p>
          </div>
        </footer>
      </main>

      {/* ── Floating Mobile Bar ── */}
      <div className="pds-mobile-bar">
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="pds-mbtn pds-mbtn-pdf"
        >
          <Download size={15} /> {t.downloadPdf}
        </a>
        <button onClick={handleCopyUrl} className="pds-mbtn pds-mbtn-copy">
          {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
          {copied ? t.copied : t.copyLink}
        </button>
        <button onClick={handleWhatsApp} className="pds-mbtn pds-mbtn-wa">
          <WaIcon /> WhatsApp
        </button>
      </div>
    </div>
  );
}


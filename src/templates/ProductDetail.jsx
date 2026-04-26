import { useState, useEffect, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, FlaskConical, Beaker, FileText, ShieldCheck, Target, Layers, Plus, Minus, ChevronDown, ChevronUp, Maximize2, ExternalLink, Activity, Microscope, Truck, Lock, UserCheck, BookOpen, Zap, Thermometer } from 'lucide-react';
import ImageModal from '../snippets/ImageModal';
import OptimizedImage from '../snippets/OptimizedImage';
import FAQAccordion from '../components/discovery/FAQAccordion';
import RelatedPeptidesRow from '../components/discovery/RelatedPeptidesRow';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getFAQForProduct, getRelatedPeptides } from '../utils/discoveryEngine';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { resolveVariantPrice, formatPrice } from '../services/pricingService';
import { usePricingTier } from '../hooks/usePricingTier';
import { formatDose } from '../data/dosageUnits';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail({
  product,
  region,
  isProfessional,
  isAdmin,
  onBack,
  onAddToCart,
  cart,
  onSelectObjective,
  onSelectCategory,
  onSelectProduct,
  products,
  allFaqs,
}) {
  usePageMeta({
    title: product?.name || 'Product Detail',
    description: product?.shortDesc
      ? `${product.shortDesc} — Research-grade ${product.name} with verified purity, available in multiple formats from Med-Peptides.`
      : `Detailed technical profile for ${product?.name || 'this peptide'} — purity data, dosage formats, and research references.`,
    path: product?.name ? `/products/${product.name.toLowerCase().replace(/\s+/g, '-')}` : '/products',
  });

  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const { tier, isLoading: tierLoading } = usePricingTier();
  // ── Discovery Engine State ─────────────────────────────────────────────
  const [activeProduct, setActiveProduct] = useState(product);
  const [selectedVariant, setSelectedVariant] = useState(null); // Force explicit selection
  const [relatedEngine, setRelatedEngine] = useState([]);
  const [relatedProtocols, setRelatedProtocols] = useState([]);
  const [selectionType, setSelectionType] = useState('vial'); // 'vial' or 'kit'
  const [showPurityModal, setShowPurityModal] = useState(false);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);

  const [isCapabilitiesExpanded, setIsCapabilitiesExpanded] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync active product when prop changes
  useEffect(() => {
    setActiveProduct(product);
    setSelectedVariant(null); // Reset selection on product change
  }, [product]);

  // Handle local modal scroll lock
  useEffect(() => {
    if (showPurityModal) {
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [showPurityModal]);

  // Fetch engine data and protocols
  useEffect(() => {
    if (!activeProduct?.name) return;
    let cancelled = false;
    async function fetchDiscovery() {
      try {
        const [engineSnap, protocolsSnap] = await Promise.all([
          getDocs(collection(db, 'peptide_related_engine')),
          getDocs(collection(db, 'protocols')).catch(() => ({ docs: [] }))
        ]);
        if (cancelled) return;

        const engineData = engineSnap.docs.map(d => d.data());
        const pSlug = activeProduct.slug || activeProduct.name.toLowerCase().replace(/\s+/g, '-');

        const extractedProtocols = protocolsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => {
            if (!p.protocolMapping) return false;
            if (Array.isArray(p.protocolMapping)) return p.protocolMapping.includes(pSlug) || p.protocolMapping.includes(activeProduct.name);
            return !!p.protocolMapping[pSlug] || !!p.protocolMapping[activeProduct.name];
          });

        setRelatedEngine(engineData);
        setRelatedProtocols(extractedProtocols);
      } catch (err) {
        console.error('Discovery fetch error on PDP:', err);
      }
    }
    fetchDiscovery();
    return () => { cancelled = true; };
  }, [activeProduct?.name, isProfessional]);

  // Memoized Variants — read from activeProduct.variants (canonical repository shape)
  // Sorted by numeric dosage (lowest dose first)
  const productVariants = useMemo(() => {
    const variants = activeProduct?.variants;
    if (!variants || !Array.isArray(variants) || variants.length === 0) return [];
    return [...variants]
      .filter(v => isAdmin || v.isActive !== false)
      .sort((a, b) => {
        const numA = parseFloat((a.dosage || a.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat((b.dosage || b.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
      });
  }, [activeProduct, isAdmin]);

  // Always pre-select the lowest-dose variant (first after sort) when variants load
  // Also respect _preselectedVariantIndex from search navigation
  useEffect(() => {
    if (productVariants.length > 0 && !selectedVariant) {
      const preIdx = typeof product?._preselectedVariantIndex === 'number'
        ? product._preselectedVariantIndex
        : 0;
      setSelectedVariant(productVariants[Math.min(preIdx, productVariants.length - 1)]);
    }
  }, [productVariants]);

  // Memoized FAQs from Engine
  const productDiscoveryFaqs = useMemo(() => {
    if (!activeProduct?.name || !allFaqs) return [];
    return getFAQForProduct(activeProduct.name, allFaqs, activeProduct.id || null, isProfessional, 3);
  }, [activeProduct?.name, activeProduct?.id, allFaqs, isProfessional]);

  // Memoized Related Peptides
  const discoveryRelated = useMemo(
    () => getRelatedPeptides(activeProduct?.name, relatedEngine, [], isProfessional, 6),
    [activeProduct?.name, relatedEngine, isProfessional]
  );

  // Merge Local and Discovery FAQs
  const combinedFaqs = useMemo(() => {
    if (!activeProduct) return [];

    const localFaqs = activeProduct.faqModalItems || [];
    const formattedLocal = localFaqs.map(f => ({
      question: f.q,
      answer: f.a,
      isLocal: true
    }));

    const seen = new Set();
    const result = [];

    [...formattedLocal, ...productDiscoveryFaqs].forEach(item => {
      const q = item.question?.toLowerCase().trim();
      if (q && !seen.has(q)) {
        seen.add(q);
        result.push(item);
      }
    });

    return result;
  }, [activeProduct?.faqModalItems, productDiscoveryFaqs]);

  if (!activeProduct) return null;

  // formatDose is imported from src/data/dosageUnits.js
  // Call: formatDose(raw, product.name) to get product-aware units (mg / IU / mcg …)

  const itemKey = selectedVariant ?
    (selectedVariant.dosage ? `${activeProduct.name} (${selectedVariant.dosage})` : activeProduct.name)
    : null;
  const currentQty = itemKey && cart[itemKey] ? cart[itemKey] : 0;

  // Filter related products (same category, different name)
  const relatedPeptides = products
    ? products
      .filter(p => p.category === activeProduct.category && p.name !== activeProduct.name && (isAdmin || p.isActive !== false))
      .slice(0, 3)
    : [];

  // Exchange rates and pricing logic (consistent with Catalog.jsx)
  const EXCHANGE_RATES = {
    uae: { rate: 3.67, currency: 'AED', name: 'United Arab Emirates' },
    qatar: { rate: 3.64, currency: 'QAR', name: 'Qatar' },
    kuwait: { rate: 0.31, currency: 'KWD', name: 'Kuwait' },
    saudi: { rate: 3.75, currency: 'SAR', name: 'Saudi Arabia' },
    row: { rate: 1, currency: 'USD', name: 'Global' }
  };

  /**
   * Resolve the display price for the currently selected variant.
   * targetVariant is always a variant document (has .pricing).
   * Falls back to productVariants[0] while selectedVariant hydrates.
   */
  const priceDisplay = (() => {
    if (authLoading || tierLoading) return null; // Auth still hydrating
    if (!selectedVariant && productVariants.length > 1) return null; // Prompt: pick a strength

    // Never fall back to activeProduct — it has no .pricing field
    const targetVariant = selectedVariant ?? productVariants[0] ?? null;
    if (!targetVariant?.pricing) return 'unavailable';

    const resolved = resolveVariantPrice(targetVariant, { tier });
    const amount = selectionType === 'kit' ? resolved.kit : resolved.perUnit;

    if (amount == null) return 'unavailable';
    return formatPrice(amount, resolved.currency ?? 'USD');
  })();

  return (
    <>
      {/* Standardized ProductDetail root container — relies on global with-header-padding in App.jsx */}
      <div className="template-root" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem 3rem 1.5rem',
        animation: 'fadeIn 0.5s ease-out',
        overflow: 'visible'
      }}>
        <style>{`
        /* === Product Detail — pd namespace === */

        /* Desktop 2-column grid: 40% image | 60% info */
        .pd-grid {
          display: grid;
          grid-template-columns: 40% 1fr;
          gap: 3rem;
          align-items: start;
        }

        /* Left col: sticky image on desktop */
        .pd-visual-col {
          position: sticky;
          top: 96px;
          align-self: start;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 10;
        }

        /* Hero image */
        .pd-hero-img {
          width: 100%;
          max-height: 380px;
          object-fit: contain;
          border-radius: 12px;
          display: block;
        }

        /* Back button */
        .pd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0.4rem 0;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }
        .pd-back-btn:hover { color: var(--primary); }

        /* Variant selector pills */
        .pd-variant-btn {
          padding: 0.55rem 1.1rem;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: white;
          color: var(--text-main);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 44px;
          min-width: 64px;
          text-align: center;
        }
        .pd-variant-btn:hover:not(.pd-variant-selected) {
          border-color: var(--secondary);
          color: var(--secondary);
          background: rgba(0, 163, 224, 0.04);
        }
        .pd-variant-selected {
          border: 2px solid var(--secondary) !important;
          background: var(--secondary) !important;
          color: white !important;
          font-weight: 800 !important;
          box-shadow: 0 4px 14px rgba(0, 163, 224, 0.3);
        }

        /* Spec grid cards */
        .pd-spec-card {
          padding: 0.9rem 1rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          transition: all 0.2s ease;
        }
        .pd-spec-card:hover {
          border-color: rgba(0, 163, 224, 0.3);
          box-shadow: 0 4px 12px rgba(0, 163, 224, 0.07);
        }

        /* Trust badge mini cards */
        .pd-trust-card {
          padding: 0.7rem 0.85rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        /* Accordions */
        .pd-accordion {
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 0.625rem;
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }
        .pd-accordion:hover { box-shadow: 0 4px 12px rgba(0,54,102,0.04); }
        .pd-accordion summary {
          padding: 1rem 1.25rem;
          font-weight: 700;
          color: var(--primary);
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
          font-size: 0.9rem;
          gap: 0.75rem;
        }
        .pd-accordion summary::-webkit-details-marker { display: none; }
        .pd-accordion summary::after {
          content: '+';
          font-size: 1.15rem;
          color: var(--text-muted);
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,54,102,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s;
        }
        .pd-accordion[open] summary {
          border-bottom: 1px solid var(--border);
          background: rgba(0,54,102,0.015);
        }
        .pd-accordion[open] summary::after { content: '−'; }

        /* Related cards */
        .related-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .related-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          border-color: var(--primary);
        }

        /* Segmented type toggle */
        .pd-type-toggle {
          display: flex;
          border-radius: 10px;
          border: 1px solid var(--border);
          overflow: hidden;
          height: 44px;
        }
        .pd-type-toggle button {
          flex: 1;
          border: none;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }

        /* Mobile sticky CTA (hidden by default) */
        @keyframes slideUpCta {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .pd-mobile-cta { display: none; }
        .pd-mobile-bottom-pad { height: 0; }

        /* ── Tablet ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .pd-grid { grid-template-columns: 45% 1fr; gap: 2rem; }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .pd-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.25rem !important;
          }
          .pd-info-col { display: contents !important; }
          .pd-visual-col {
            position: relative !important;
            top: 0 !important;
            z-index: 1 !important;
            order: 3 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .pd-mobile-order-1 { order: 1 !important; }
          .pd-mobile-order-2 { order: 2 !important; }
          .pd-mobile-order-4 { order: 4 !important; }
          .pd-mobile-order-5 { order: 5 !important; }

          .pd-title-h1 { font-size: 1.85rem !important; }
          .pd-hero-img { max-height: 260px !important; }

          /* Hide desktop price card; shown in sticky footer instead */
          .pd-price-card-desktop { display: none !important; }

          /* Sticky mobile CTA */
          .pd-mobile-cta {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 200;
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid var(--border);
            padding: 0.6rem 1.25rem;
            padding-bottom: max(0.6rem, env(safe-area-inset-bottom));
            box-shadow: 0 -4px 24px rgba(0,54,102,0.1);
            align-items: center;
            gap: 0.875rem;
            animation: slideUpCta 0.28s cubic-bezier(0.4,0,0.2,1) both;
          }
          .pd-mobile-bottom-pad { height: 130px !important; }
        }

        /* Accordion body */
        .pd-accordion-content {
          padding: 1rem 1.25rem 1.25rem;
          font-size: 0.875rem;
          color: var(--text-main);
          line-height: 1.65;
        }

        /* Purity badge hover */
        .pd-purity-badge:hover {
          border-color: var(--primary) !important;
          color: var(--primary) !important;
          background: rgba(0,54,102,0.04) !important;
        }
      `}</style>

        <div className="pd-grid">
          {/* Left Column: Product Visual (Sticky on Desktop) */}
          <div className="pd-visual-col">
            <div className="card" style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #F8FAFC, #FFFFFF)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div
                style={{
                  width: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'default',
                  position: 'relative',
                  backgroundColor: '#f0f4f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0, 75, 135, 0.1)'
                }}
              >
                <OptimizedImage
                  src={activeProduct.image || '/peptide-placeholder.png'}
                  alt={activeProduct.name}
                  className="pd-hero-img"
                  eager={true}
                  style={{ padding: '2rem', width: '100%', height: '100%' }}
                  objectFit="contain"
                  fallback={
                    <img
                      src="/peptide-placeholder.png"
                      alt={activeProduct.name}
                      className="pd-hero-img"
                      style={{ padding: '2rem', width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  }
                />
              </div>
            </div>

            {/* Trust badges — visible only on desktop below image */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { icon: <ShieldCheck size={14} />, label: '≥ 99% Purity' },
                { icon: <FlaskConical size={14} />, label: 'HPLC & MS' },
                { icon: <Truck size={14} />, label: 'Cold Chain' }
              ].map((badge, i) => (
                <div key={i} className="pd-trust-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>{badge.icon}</div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Purity certificate button — desktop only */}
            <button
              className="pd-purity-badge"
              onClick={() => setShowPurityModal(true)}
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'white',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={13} /> View Certificate of Analysis
            </button>
          </div>

          {/* Right Column: Product Information */}
          <div className="pd-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div className="pd-mobile-order-1" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className="badge"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', alignSelf: 'start' }}
                  onClick={() => onSelectCategory(activeProduct.category)}
                >
                  {activeProduct.category}
                </span>
              </div>

              <h1 className="pd-title-h1" style={{ fontSize: '2.5rem', margin: '0', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {activeProduct.name}
                </span>
                {activeProduct.scientificName && (
                  <span style={{
                    fontSize: '1.2rem',
                    color: 'var(--text-main)',
                    opacity: 0.6,
                    fontWeight: 600,
                    marginTop: '0.25rem',
                    letterSpacing: '-0.01em'
                  }}>
                    {activeProduct.scientificName}
                  </span>
                )}
              </h1>

              {activeProduct.objective && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {activeProduct.objective.split(',').map((obj, i) => (
                    <button key={i} onClick={() => onSelectObjective(obj.trim())} style={{ background: 'rgba(0, 163, 224, 0.08)', border: '1px solid rgba(0, 163, 224, 0.15)', padding: '0.35rem 0.75rem', borderRadius: 99, color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      {obj.trim()}
                    </button>
                  ))}
                </div>
              )}

              {productVariants.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Strength
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {productVariants.map((variant, idx) => {
                      const variantKey = `${variant._docId ?? ''}_${variant.id ?? idx}`;
                      const selectedKey = `${selectedVariant?._docId ?? ''}_${selectedVariant?.id ?? ''}`;
                      const isSelected = !!selectedVariant && variantKey === selectedKey;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedVariant(variant)}
                          style={{
                            padding: '0.55rem 1.1rem',
                            borderRadius: '10px',
                            border: isSelected ? '2.5px solid #0055cc' : '1.5px solid #cbd5e1',
                            backgroundColor: isSelected ? '#0066cc' : '#f0f2f5',
                            color: isSelected ? '#ffffff' : '#64748b',
                            fontWeight: isSelected ? 800 : 500,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            boxShadow: isSelected ? '0 0 0 3px rgba(0,102,204,0.18), 0 4px 14px rgba(0,102,204,0.22)' : '0 1px 3px rgba(0,0,0,0.06)',
                            letterSpacing: isSelected ? '0.01em' : '0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          {isSelected && (
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                              <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(255,255,255,0.25)" />
                              <path d="M3 6.5L5.5 9L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {formatDose(variant.dosage || variant.strength, activeProduct.name, activeProduct.category)}
                        </button>
                      );
                    })}
                  </div>
                  {selectedVariant && (
                    <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0066cc', marginTop: '0.4rem' }}>
                      ✓ {formatDose(selectedVariant.dosage || selectedVariant.strength, activeProduct.name, activeProduct.category)} selected
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 1. Price & Purchase (Conversion Block moved up) */}
            <div className="card pd-mobile-order-2 pd-price-card-desktop" style={{ padding: '1.5rem', border: '2px solid var(--primary-light)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{selectionType === 'kit' ? 'Price per kit' : 'Price per vial'}</span>
                  {selectionType === 'kit' && <span style={{ color: 'var(--secondary)', fontSize: '0.70rem', fontWeight: 800 }}>⭐ RECOMMENDED SET</span>}
                </div>
                {authLoading ? (
                  <span style={{ display: 'inline-block', width: '120px', height: '32px', borderRadius: '8px', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ) : priceDisplay === 'unavailable' ? (
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center' }}>Contact us for pricing</span>
                ) : priceDisplay ? (
                  <span style={{ fontWeight: 800, color: selectionType === 'kit' ? 'var(--secondary)' : 'var(--primary)', fontSize: '1.85rem', lineHeight: 1 }}>{priceDisplay}</span>
                ) : (
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center' }}>Select strength to see price</span>
                )}
              </div>
              <p style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                margin: '-0.75rem 0 0.5rem 0',
                lineHeight: 1.4,
                fontWeight: 500,
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.75rem'
              }}>
                Final logistics and tax calculations are applied at checkout.
              </p>

              {activeProduct.category !== "Research Supplies" && (
                <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', height: '42px', opacity: (priceDisplay && priceDisplay !== 'unavailable') ? 1 : 0.5, pointerEvents: (priceDisplay && priceDisplay !== 'unavailable') ? 'auto' : 'none' }}>
                  <button onClick={() => setSelectionType('vial')} style={{ flex: 1, border: 'none', backgroundColor: selectionType === 'vial' ? 'var(--primary)' : '#f8fafc', color: selectionType === 'vial' ? 'white' : 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Single Vial</button>
                  <button onClick={() => setSelectionType('kit')} style={{ flex: 1, border: 'none', backgroundColor: selectionType === 'kit' ? 'var(--secondary)' : '#f8fafc', color: selectionType === 'kit' ? 'white' : 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>10-Vial Kit</button>
                </div>
              )}

              <button
                className="btn"
                disabled={!priceDisplay || priceDisplay === 'unavailable'}
                onClick={() => {
                  if (!selectedVariant && productVariants.length > 1) return;
                  const target = selectedVariant
                    ? { ...selectedVariant, name: activeProduct.name }
                    : activeProduct;
                  onAddToCart(target, activeProduct.category === "Research Supplies" ? 1 : (selectionType === 'kit' ? 10 : 1));
                }}
                style={{ width: '100%', gap: '0.75rem', backgroundColor: (priceDisplay && priceDisplay !== 'unavailable') ? (selectionType === 'kit' ? 'var(--secondary)' : 'var(--primary)') : 'var(--border)', color: (priceDisplay && priceDisplay !== 'unavailable') ? 'white' : 'var(--text-muted)', padding: '1rem', fontSize: '1rem', fontWeight: 800, cursor: (priceDisplay && priceDisplay !== 'unavailable') ? 'pointer' : 'not-allowed' }}
              >
                <Plus size={18} /> {currentQty > 0 ? `Add More (${currentQty})` : `Add to Research Inquiry`}
              </button>
            </div>

            <div className="pd-mobile-order-4" style={{ marginBottom: '2rem' }}>
              <div
                onClick={() => setIsCapabilitiesExpanded(!isCapabilitiesExpanded)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isCapabilitiesExpanded ? 'var(--shadow-md)' : 'none',
                  backgroundColor: isCapabilitiesExpanded ? '#f8fafc' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(0, 54, 102, 0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Maximize2 size={16} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Unlock Advanced Capabilities
                  </h3>
                </div>
                {isCapabilitiesExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>

              {isCapabilitiesExpanded && (
                <div className="anim-slide-down" style={{
                  marginTop: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {[
                        {
                          id: 'clinic',
                          role: 'Clinic',
                          icon: <Activity size={18} />,
                          highlights: [
                            'Build patient-specific titration protocols',
                            'Real-time safety validation',
                            'Automated monitoring schedules'
                          ]
                        },
                        {
                          id: 'pharmacy',
                          role: 'Pharmacy',
                          icon: <Beaker size={18} />,
                          highlights: [
                            'Generate multi-patient kit configurations',
                            'Bulk vial forecasting',
                            'Inventory-aligned protocol packaging'
                          ]
                        },
                        {
                          id: 'researcher',
                          role: 'Researcher',
                          icon: <Microscope size={18} />,
                          highlights: [
                            'Explore validated protocol templates',
                            'Access compound compatibility insights',
                            'Export structured research documentation'
                          ]
                        },
                        {
                          id: 'distributor',
                          role: 'Distributor',
                          icon: <Truck size={18} />,
                          highlights: [
                            'Manage institutional supply planning',
                            'Generate bulk demand forecasts',
                            'Coordinate multi-site logistics workflows'
                          ]
                        }
                      ].map((role, idx) => {
                        const isRoleExpanded = expandedRole === role.id || !isMobile;

                        return (
                          <div key={role.id} style={{
                            borderBottom: idx < 3 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                            paddingBottom: idx < 3 ? '1.5rem' : 0
                          }}>
                            <div
                              onClick={() => {
                                if (isMobile) {
                                  setExpandedRole(expandedRole === role.id ? null : role.id);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: isRoleExpanded ? '0.75rem' : 0,
                                cursor: isMobile ? 'pointer' : 'default'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ color: 'var(--primary)', opacity: 0.7 }}>{role.icon}</div>
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {role.role}
                                </span>
                              </div>
                              {isMobile && (
                                isRoleExpanded ? <Minus size={14} color="var(--text-muted)" /> : <Plus size={14} color="var(--text-muted)" />
                              )}
                            </div>

                            {isRoleExpanded && (
                              <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {role.highlights.map((h, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                    <Check size={14} color="#10b981" strokeWidth={3} />
                                    {h}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{
                      marginTop: '2rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <UserCheck size={16} color="var(--text-muted)" />
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          These advanced tools require verified professional registration.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <button
                          onClick={() => navigate('/auth?register=true')}
                          className="btn"
                          style={{
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          Request Verified Access
                        </button>
                        <button
                          onClick={() => navigate('/auth')}
                          style={{
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            backgroundColor: 'transparent',
                            color: 'var(--primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Login to Existing Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pd-mobile-order-5" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* ── ADMIN ONLY: Supplier & Master Pricing Panel ── */}
              {isAdmin && (() => {
                const supplier = activeProduct.supplier || '—';
                const masterVial = selectedVariant?.pricing?.master?.perUnit;
                const masterKit  = selectedVariant?.pricing?.master?.kit;
                const variantCount = activeProduct.variants?.length || 0;
                return (
                  <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid #334155',
                    borderRadius: '14px',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.6rem' }}>
                      <Lock size={13} color="#f59e0b" />
                      <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Admin — Supplier Info
                      </span>
                    </div>
                    {/* Supplier */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Supplier</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>{supplier}</span>
                    </div>
                    {/* Master pricing */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { label: 'Master / Vial', value: masterVial != null ? `$${masterVial.toFixed(2)}` : '—' },
                        { label: 'Master / Kit',  value: masterKit  != null ? `$${masterKit.toFixed(2)}`  : '—' },
                        { label: 'Variants',       value: `${variantCount}` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '0.55rem 0.6rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                        }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#34d399' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    {/* Slug */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Slug / ID</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>{activeProduct.slug || activeProduct.id}</span>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Scientific Facts (Grid — dynamic clinical data) */}
              {(() => {
                const storageDry = activeProduct.storage_conditions?.dry || '-20°C to -80°C';
                const storageLiq = activeProduct.storage_conditions?.reconstituted || '2°C to 8°C (7 days)';
                const mw = activeProduct.molecular_weight ? `${activeProduct.molecular_weight} Da` : null;
                const formula = activeProduct.molecular_formula || null;
                const baseSpecs = [
                  { label: 'Analytical Purity', value: '≥ 99%', icon: <Target size={14} /> },
                  { label: 'Verification', value: 'HPLC & MS Verified', icon: <ShieldCheck size={14} /> },
                  { label: 'Storage (Dry)', value: storageDry, icon: <Layers size={14} /> },
                  { label: 'Storage (Liquid)', value: storageLiq, icon: <FlaskConical size={14} /> },
                ];
                const extraSpecs = [
                  ...(mw ? [{ label: 'Molecular Weight', value: mw, icon: <Beaker size={14} /> }] : []),
                  ...(formula ? [{ label: 'Molecular Formula', value: formula, icon: <FlaskConical size={14} /> }] : []),
                ];
                const allSpecs = [...baseSpecs, ...extraSpecs];
                return (
                  <div>
                    {(mw || formula) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                        <Microscope size={13} color="var(--secondary)" />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Molecular Properties</span>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      {allSpecs.map((spec, i) => (
                        <div key={i} style={{ padding: '0.85rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {spec.icon}
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{spec.label}</span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', wordBreak: 'break-all' }}>{spec.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 3. Scientific Literature Card */}
              <div
                className="card"
                onClick={() => setShowPubMedPanel(true)}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid rgba(0, 75, 135, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 75, 135, 0.1)'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              >
                <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)', fontWeight: 700 }}>Scientific Literature</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Explore peer-reviewed publications</p>
                </div>
                <ExternalLink size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </div>

              {/* 4. Structural Accordions (Description at bottom) */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <details className="pd-accordion" open>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} color="var(--primary)" />
                    Research Background
                  </summary>
                  <div className="pd-accordion-content">
                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{activeProduct.desc}</p>
                  </div>
                </details>

                {activeProduct.mechanismOfAction ? (
                  <details className="pd-accordion" open>
                    <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={16} color="var(--primary)" />
                      Mechanism of Action
                    </summary>
                    <div className="pd-accordion-content">
                      <div style={{ padding: '0.5rem 0' }}>
                        <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.95rem', lineHeight: '1.4' }}>
                          {activeProduct.mechanismOfAction.summary}
                        </p>
                        {activeProduct.mechanismOfAction.researchFocus?.length > 0 && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Research Focus</div>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                              {activeProduct.mechanismOfAction.researchFocus.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {activeProduct.mechanisms && activeProduct.mechanisms.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {activeProduct.mechanisms.map((mech, i) => (
                              <span key={i} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{mech}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                ) : activeProduct.mechanisms && activeProduct.mechanisms.length > 0 && (
                  <details className="pd-accordion">
                    <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={16} color="var(--primary)" />
                      Mechanism of Action
                    </summary>
                    <div className="pd-accordion-content">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {activeProduct.mechanisms.map((mech, i) => (
                          <span key={i} style={{ padding: '0.3rem 0.6rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>{mech}</span>
                        ))}
                      </div>
                    </div>
                  </details>
                )}

                {/* Pharmacokinetics accordion — populated by Phase-4 migration */}
                {activeProduct.pharmacokinetics && (() => {
                  const pk = activeProduct.pharmacokinetics;
                  const rows = [
                    pk.half_life && { label: 'Half-life', value: pk.half_life },
                    pk.bioavailability && { label: 'Bioavailability', value: pk.bioavailability },
                    pk.route && { label: 'Route', value: Array.isArray(pk.route) ? pk.route.join(', ') : pk.route },
                    pk.onset && { label: 'Onset', value: pk.onset },
                    pk.metabolism && { label: 'Metabolism', value: pk.metabolism },
                    pk.elimination && { label: 'Elimination', value: pk.elimination },
                  ].filter(Boolean);
                  if (rows.length === 0) return null;
                  return (
                    <details className="pd-accordion">
                      <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={16} color="var(--primary)" />
                        Pharmacokinetics
                      </summary>
                      <div className="pd-accordion-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {rows.map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.45rem 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', gap: '1rem' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{row.label}</span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  );
                })()}

                <details className="pd-accordion">
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Thermometer size={16} color="var(--primary)" />
                    Stability Note
                  </summary>
                  <div className="pd-accordion-content" style={{ backgroundColor: '#fff8f0' }}>
                    <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                      Lyophilized peptides remain stable at room temperature during transit. Upon receipt, store in a laboratory freezer.
                    </p>
                  </div>
                </details>
              </div>

              {/* Compliance Card */}
              <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '12px', backgroundColor: 'rgba(248, 250, 252, 0.5)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <ShieldCheck size={20} color="var(--secondary)" />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Supplied exclusively for in-vitro research. Acquisition requires institutional affiliation.
                </p>
              </div>
            </div>
          </div>
        </div>{/* /pd-grid */}

        {/* ── Mobile sticky bottom CTA (always visible on mobile) ─────────── */}
        <div className="pd-mobile-cta" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          {/* Vial / Kit toggle on mobile */}
          {activeProduct.category !== 'Research Supplies' && (
            <div style={{ display: 'flex', width: '100%', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', height: '36px' }}>
              <button onClick={() => setSelectionType('vial')} style={{ flex: 1, border: 'none', backgroundColor: selectionType === 'vial' ? 'var(--primary)' : '#f8fafc', color: selectionType === 'vial' ? 'white' : 'var(--text-main)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Single Vial</button>
              <button onClick={() => setSelectionType('kit')} style={{ flex: 1, border: 'none', backgroundColor: selectionType === 'kit' ? 'var(--secondary)' : '#f8fafc', color: selectionType === 'kit' ? 'white' : 'var(--text-main)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>10-Vial Kit</button>
            </div>
          )}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selectionType === 'kit' ? 'Price per kit' : 'Price per vial'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: (priceDisplay && priceDisplay !== 'unavailable') ? 'var(--primary)' : 'var(--text-muted)', lineHeight: 1, marginTop: '0.1rem' }}>
                {authLoading ? '...' : (priceDisplay === 'unavailable' ? 'N/A' : (priceDisplay || 'Select strength'))}
              </div>
            </div>
            <button
              disabled={!priceDisplay || priceDisplay === 'unavailable' || authLoading}
              onClick={() => {
                if (!selectedVariant && productVariants.length > 1) return;
                const target = selectedVariant
                  ? { ...selectedVariant, name: activeProduct.name }
                  : activeProduct;
                onAddToCart(target, activeProduct.category === 'Research Supplies' ? 1 : (selectionType === 'kit' ? 10 : 1));
              }}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: (priceDisplay && priceDisplay !== 'unavailable') ? (selectionType === 'kit' ? 'var(--secondary)' : 'var(--primary)') : 'var(--border)',
                color: (priceDisplay && priceDisplay !== 'unavailable') ? 'white' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: (priceDisplay && priceDisplay !== 'unavailable') ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                boxShadow: (priceDisplay && priceDisplay !== 'unavailable') ? '0 4px 16px rgba(0,54,102,0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <ShoppingCart size={16} />
              {currentQty > 0 ? `Add More (${currentQty} in cart)` : 'Add to Inquiry'}
            </button>
          </div>
        </div>
        {/* Bottom padding to offset sticky footer on mobile */}
        <div className="pd-mobile-bottom-pad" />

        {/* Purity & Testing Methods Modal */}

        {showPurityModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <button
                onClick={() => setShowPurityModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <ShieldCheck size={32} />
                <h2 style={{ fontSize: '1.75rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Quality Assurance & Testing</h2>
              </div>

              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                We adhere to stringent pharmaceutical-grade analytical standards to verify the molecular integrity, sequence correctness, and purity of every peptide batch synthesized.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 163, 224, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={18} /> High-Performance Liquid Chromatography (HPLC)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Used to separate, identify, and quantify each component in the mixture. We guarantee a minimum analytical purity of ≥ 99.0% for all catalog peptides.
                  </p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(0, 163, 224, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Beaker size={18} /> Mass Spectrometry (MS)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Confirms the exact molecular weight and sequence of the synthesized peptide, ensuring it strictly matches the theoretical molecular mass without truncation or modifications.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setShowPurityModal(false);
                    alert("CoA request sent. Our team will contact you with the latest batch data.");
                  }}
                  style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                  Request Certificate of Analysis (CoA)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Related Sections Group ────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)' }}>

        {/* 1. Related Peptides */}
        {discoveryRelated.length > 0 && (
          <div style={{ padding: '4rem 0', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <RelatedPeptidesRow
                peptides={discoveryRelated}
                allProducts={products}
                onProductClick={(p) => onSelectProduct?.(p)}
                title={`Related Peptides`}
              />
            </div>
          </div>
        )}

        {/* 2. Used in Protocols */}
        {relatedProtocols.length > 0 && (
          <div style={{ padding: '4rem 0', background: 'white', borderTop: '1px solid var(--border)' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.75rem', color: 'var(--primary)', fontWeight: 800 }}>Used in Protocols</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Clinical workflows integrating this compound.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {relatedProtocols.map(protocol => (
                  <div key={protocol.id} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: '#fafbfd' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {protocol.metadata?.scientificName || protocol.name || protocol.title}
                    </h4>
                    {protocol.metadata?.scientificName && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontStyle: 'italic' }}>
                        {protocol.name || protocol.title}
                      </div>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{protocol.shortDescription}</p>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {getPrice()}
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      margin: '0 0 1.5rem 0',
                      lineHeight: 1.4,
                      fontWeight: 500
                    }}>
                      Final logistics and tax calculations are applied at checkout.
                    </p>
                    <button
                      onClick={() => navigate(`/protocol/${protocol.slug || protocol.id}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                      Explore Protocol →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Discovery: FAQ on PDP ──────────────────────────────────────── */}
      {combinedFaqs.length > 0 && (
        <div style={{ padding: '5rem 0', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
          <div className="container" style={{ maxWidth: '880px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>FAQ & Discovery</span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', marginTop: 0, fontWeight: 800 }}>Frequently Asked Questions</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Answers specifically relevant to {activeProduct.name}, curated by our clinical team.
              </p>
            </div>
            <FAQAccordion
              faqItems={combinedFaqs}
              relatedProducts={products}
              onProductClick={(p) => onSelectProduct?.(p)}
            />
          </div>
        </div>
      )}

      {/* Product Detail Footer / Bottom Space */}
      <div style={{ height: '4rem' }} />

      {/* PubMed Preview Panel */}
      <PubMedPreviewPanel
        isOpen={showPubMedPanel}
        onClose={() => setShowPubMedPanel(false)}
        product={activeProduct}
      />
    </>
  );
}

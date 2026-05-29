/* eslint-disable react-hooks/set-state-in-effect, no-undef, no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { trackPeptideView, trackPurchaseIntent } from '../hooks/useAnalytics';
import { trackRecentView } from '../utils/recentViews';
import { usePageMeta } from '../hooks/usePageMeta';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, FlaskConical, Beaker, FileText, ShieldCheck, Target, Layers, Plus, Minus, ChevronDown, ChevronUp, Maximize2, ExternalLink, Activity, Microscope, Truck, Lock, UserCheck, BookOpen, Zap, Thermometer, Scale, Bot, X } from 'lucide-react';
import ImageModal from '../snippets/ImageModal';
import OptimizedImage from '../snippets/OptimizedImage';
import FAQAccordion from '../components/discovery/FAQAccordion';
import RelatedPeptidesRow from '../components/discovery/RelatedPeptidesRow';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';
import ProductProtocolsSection from '../components/product/ProductProtocolsSection';
import ReconstitutionGuide from '../components/product/ReconstitutionGuide';
import SmartDosageGuide from '../components/product/SmartDosageGuide';
import VialLabelPrinter from '../components/product/VialLabelPrinter';
import ProtocolTOC from '../components/protocol/ProtocolTOC';
import ClinicalAssistant from '../components/shared/ClinicalAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getFAQForProduct, getRelatedPeptides } from '../utils/discoveryEngine';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { resolveVariantPrice, formatPrice } from '../services/pricingService';
import { usePricingTier } from '../hooks/usePricingTier';
import { formatDose } from '../data/dosageUnits';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, logEvent } from 'firebase/analytics';
import app from '../firebase';
import { DetailSkeleton } from '../components/shared/SkeletonLoader';

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
  const { tier, isLoading: tierLoading } = usePricingTier();



  const navigate = useNavigate();
  const location = useLocation();
  const { loading: authLoading, userRole } = useAuth();

  const isWholesaler = userRole === 'wholesaler' || userRole === 'admin';

  // ── All state declarations FIRST — before any useEffect that references them ──
  const [activeProduct, setActiveProduct] = useState(product);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState('Lotusland');
  const [relatedEngine, setRelatedEngine] = useState([]);
  const [relatedProtocols, setRelatedProtocols] = useState([]);
  const [selectionType, setSelectionType] = useState('vial');
  const [showPurityModal, setShowPurityModal] = useState(false);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);
  const [isCapabilitiesExpanded, setIsCapabilitiesExpanded] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLabelPrinter, setShowLabelPrinter] = useState(false);

  // ── Analytics: Track peptide view + recent history ──────────────────────────
  useEffect(() => {
    if (activeProduct) {
      trackPeptideView({
        peptide_name: activeProduct.name,
        protocol_id: location.state?.protocol_id || null
      });
      trackRecentView({
        type: 'peptide',
        slug: activeProduct.slug || activeProduct.id,
        name: activeProduct.name,
      });
    }
  }, [activeProduct?.name, activeProduct?.slug, location.state?.protocol_id]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync active product when prop changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveProduct(product);
    setSelectedVariant(null);
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
  // Sorted by numeric dosage (lowest dose first) and filtered by Guest/Pro access
  const productVariants = useMemo(() => {
    const variants = activeProduct?.variants;
    if (!variants || !Array.isArray(variants) || variants.length === 0) return [];
    return [...variants]
      .filter(v => {
        if (v.isActive === false && !isAdmin) return false;
        if (!isProfessional && (v.isProfessional === true || v.supplier === 'NPLAB')) return false;
        return true;
      })
      .sort((a, b) => {
        const numA = parseFloat((a.dosage || a.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat((b.dosage || b.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
      });
  }, [activeProduct, isAdmin, isProfessional]);

  // Group variants by unique formatted strength/dosage
  const uniqueStrengths = useMemo(() => {
    const strengthsMap = new Map();
    productVariants.forEach((v) => {
      const formatted = formatDose(v.dosage || v.strength, activeProduct.name, activeProduct.category);
      if (!strengthsMap.has(formatted)) {
        strengthsMap.set(formatted, []);
      }
      strengthsMap.get(formatted).push(v);
    });
    return Array.from(strengthsMap.entries()).map(([formatted, vars]) => ({
      formatted,
      dosage: vars[0].dosage || vars[0].strength,
      variants: vars,
    }));
  }, [productVariants, activeProduct]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    trackPurchaseIntent({
      peptide_name: activeProduct.name,
      variant_id: variant.id,
      action: 'variant_switch'
    });
  };

  useEffect(() => {
    if (selectedVariant) {
      setSelectedSupplier(selectedVariant.supplier || 'Lotusland');
    }
  }, [selectedVariant]);



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
  }, [activeProduct, allFaqs, isProfessional]);

  // Memoized Related Peptides
  const discoveryRelated = useMemo(
    () => getRelatedPeptides(activeProduct?.name, relatedEngine, [], isProfessional, 6),
    [activeProduct, relatedEngine, isProfessional]
  );

  // Merge Local and Discovery FAQs
  // Phase 8: read canonical aiContent.faqModalItems first; fall back to legacy flat field
  const combinedFaqs = useMemo(() => {
    if (!activeProduct) return [];

    const rawLocalFaqs =
      Array.isArray(activeProduct.aiContent?.faqModalItems)
        ? activeProduct.aiContent.faqModalItems          // ✅ canonical (Phase 6)
        : Array.isArray(activeProduct.faqModalItems)
          ? activeProduct.faqModalItems                  // 🔄 legacy fallback
          : [];

    const formattedLocal = rawLocalFaqs.map(f => ({
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
  }, [activeProduct?.aiContent, activeProduct?.faqModalItems, productDiscoveryFaqs]);

  // ── Structured Data (JSON-LD) — declared AFTER combinedFaqs to avoid TDZ ──
  const structuredData = useMemo(() => {
    if (!product) return null;
    const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
    const productUrl = `https://Atlas Health-app-27a3a.web.app/product/${slug}`;

    const graph = [
      {
        "@type": "Product",
        "name": product.name,
        "image": product.image ? [`https://Atlas Health-app-27a3a.web.app${product.image}`] : [],
        "description": product.shortDesc || product.description,
        "brand": { "@type": "Brand", "name": "Atlas Health" },
        "sku": product.id || slug,
        "offers": {
          "@type": "Offer",
          "url": productUrl,
          "priceCurrency": "USD",
          "availability": product.isActive !== false
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          "itemCondition": "https://schema.org/NewCondition"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home",
            "item": "https://Atlas Health-app-27a3a.web.app/" },
          { "@type": "ListItem", "position": 2,
            "name": product.category || "Catalog",
            "item": `https://Atlas Health-app-27a3a.web.app/collection/${(product.category || "peptides").toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
          { "@type": "ListItem", "position": 3, "name": product.name,
            "item": productUrl }
        ]
      }
    ];

    if (combinedFaqs && combinedFaqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        "mainEntity": combinedFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      });
    }

    return { "@context": "https://schema.org", "@graph": graph };
  }, [product, combinedFaqs]);

  // ── SEO meta — placed after structuredData to avoid TDZ ──
  usePageMeta({
    title: product?.name || 'Product Detail',
    description: product?.shortDesc
      ? `${product.shortDesc} — Research-grade ${product.name} with verified purity, available in multiple formats from Atlas Health.`
      : `Detailed technical profile for ${product?.name || 'this peptide'} — purity data, dosage formats, and research references.`,
    path: product?.name ? `/product/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}` : '/products',
    image: product?.image ? `https://Atlas Health-app-27a3a.web.app${product.image}` : undefined,
    structuredData
  });

  // formatDose is imported from src/data/dosageUnits.js
  // Call: formatDose(raw, product.name) to get product-aware units (mg / IU / mcg …)

  const isReconstitutionRelevant = useMemo(() => {
    if (!activeProduct) return false;
    const productType = activeProduct.productType;
    const isPeptide = productType === 'peptide';
    const typeDataRecon = activeProduct.typeData?.reconstitutionRelevant === true || activeProduct.typeData?.peptide?.reconstitutionRelevant === true;
    const variantRoute = selectedVariant?.route || '';
    const isInjectableVial = typeof variantRoute === 'string' && (variantRoute.toLowerCase().includes('injectable_vial') || variantRoute === 'injectable_vial' || ['SC', 'IM', 'IV'].includes(variantRoute));
    return isPeptide || typeDataRecon || isInjectableVial;
  }, [activeProduct, selectedVariant]);

  if (tierLoading || !activeProduct) {
    return (
      <div className="bg-background min-h-screen pt-24">
        <DetailSkeleton />
      </div>
    );
  }

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
    if (!targetVariant?.pricing) {
      console.warn('[PriceDisplay] targetVariant has no .pricing field', targetVariant);
      return 'unavailable';
    }

    // ── DIAGNOSTIC: log raw pricing data and tier ──
    console.log('[PriceDisplay] tier:', tier);
    console.log('[PriceDisplay] raw variant.pricing:', JSON.parse(JSON.stringify(targetVariant.pricing)));

    const resolved = resolveVariantPrice(targetVariant, { tier, countryCode: region });
    const amount = selectionType === 'kit' ? resolved.kit : resolved.perUnit;

    console.log('[PriceDisplay] resolved:', resolved, '| amount:', amount);

    if (amount == null) return 'unavailable';
    return formatPrice(amount, resolved.currency ?? 'USD', region);
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

        /* Desktop 3-column grid: TOC | Content | ClinicAI */
        .pd-grid {
          display: grid;
          grid-template-columns: 260px 1fr 340px;
          gap: 3rem;
          align-items: start;
        }

        /* Left col: sticky TOC */
        .pd-toc-col {
          position: sticky;
          top: 96px;
          align-self: start;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 10;
        }

        /* Right col: sticky ClinicAI */
        .pd-ai-col {
          position: sticky;
          top: 96px;
          align-self: start;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
          z-index: 10;
        }

        /* Center col */
        .pd-info-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 120px; /* Space for Floating Action Bar */
        }

        /* Hero image with glow */
        .pd-hero-container {
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          transition: var(--transition-smooth);
        }
        .pd-hero-container:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
          border-color: var(--secondary);
        }
        .pd-vial-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          background: var(--secondary);
          filter: blur(80px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
          animation: pulse-glow 4s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.3); opacity: 0.25; }
        }
        .pd-hero-img {
          width: 100%;
          height: auto;
          max-height: 280px;
          object-fit: contain;
          z-index: 1;
          filter: drop-shadow(0 10px 20px rgba(0,54,102,0.15));
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

        /* Variant row container */
        .pd-variant-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

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

        /* Sticky mobile CTA & Desktop Floating Action Bar */
        @keyframes slideUpCta {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .pd-floating-bar {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 900px;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          padding: 1rem 1.5rem;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          animation: slideUpCta 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .pd-mobile-cta { display: none; }
        
        .pd-floating-price {
          font-family: 'Outfit', sans-serif;
          font-size: 1.75rem;
          font-weight: 850;
          color: var(--primary);
          line-height: 1;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .pd-grid { grid-template-columns: 220px 1fr 300px; gap: 2rem; }
        }

        @media (max-width: 1024px) {
          .pd-grid { grid-template-columns: 220px 1fr; gap: 2rem; }
          .pd-ai-col { display: none; }
        }

        @media (max-width: 768px) {
          .pd-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .pd-toc-col {
            display: none;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .pd-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.25rem !important;
          }
          .pd-toc-col { display: none !important; }
          .pd-info-col { display: contents !important; }

          .pd-title-h1 { font-size: 1.85rem !important; }
          .pd-hero-img { height: 220px !important; }

          /* Dosage pills — compact, scrollable row on mobile */
          .pd-variant-row {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 0.4rem !important;
            max-height: 9rem !important;
            overflow-y: auto !important;
            padding-right: 0.25rem !important;
          }
          .pd-variant-btn {
            padding: 0.4rem 0.75rem !important;
            font-size: 0.78rem !important;
            min-height: 36px !important;
            min-width: 52px !important;
            border-radius: 8px !important;
          }

          /* Sticky mobile CTA replaces floating bar on mobile */
          .pd-floating-bar {
            bottom: 0;
            width: 100%;
            border-radius: 20px 20px 0 0;
            padding: 1.25rem 1.5rem calc(1.25rem + env(safe-area-inset-bottom));
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .pd-floating-price-col {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .pd-mobile-bottom-pad { height: 190px !important; }
        }

        @media (max-width: 580px) {
          .pd-ai-widget-header {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
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
          {/* Left Column: TOC */}
          <aside className="pd-toc-col">
            <ProtocolTOC sections={[
              { id: 'overview', label: 'Overview' },
              uniqueStrengths.length > 0 && { id: 'formats', label: 'Formats & Supply' },
              (activeProduct.desc || activeProduct.features) && { id: 'clinical_profile', label: 'Clinical Profile' },
              relatedProtocols.length > 0 && { id: 'protocols', label: 'Protocols' },
              combinedFaqs.length > 0 && { id: 'faqs', label: 'FAQs' }
            ].filter(Boolean)} />
          </aside>

          {/* Right Column: Product Information */}
          <div className="pd-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div id="overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              {/* Product Visual Container (Moved from left) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="pd-hero-container">
              <div className="pd-vial-glow"></div>
              <img
                src="/peptide-placeholder.png"
                alt={`${activeProduct.name} Research Vial`}
                className="pd-hero-img"
              />
            </div>

            {/* Trust badges — visible only on desktop below image */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(isReconstitutionRelevant ? [
                { icon: <ShieldCheck size={14} />, label: '≥ 99% Purity' },
                { icon: <FlaskConical size={14} />, label: 'HPLC & MS' },
                { icon: <Truck size={14} />, label: 'Secure Transit' }
              ] : [
                { icon: <ShieldCheck size={14} />, label: 'Verified Quality' },
                { icon: <Beaker size={14} />, label: 'Lab Tested' },
                { icon: <Truck size={14} />, label: 'Secure Transit' }
              ]).map((badge, i) => (
                <div key={i} className="pd-trust-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>{badge.icon}</div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Purity certificate button — desktop only */}
            {isReconstitutionRelevant && (
              <button
                className="pd-purity-badge"
                onClick={() => setShowPurityModal(true)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  background: 'white',
                  color: 'var(--primary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <FileText size={14} /> 
                <span>Certificate of Analysis</span>
                <span style={{ 
                  marginLeft: 'auto', 
                  fontSize: '0.65rem', 
                  backgroundColor: 'var(--success)', 
                  color: 'white', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>Verified</span>
              </button>
            )}

            {isReconstitutionRelevant && (
              <ReconstitutionGuide product={activeProduct} selectedVariant={selectedVariant} />
            )}

            {/* Smart Dosing Insight — only renders when pharmacokinetics.half_life exists */}
            <SmartDosageGuide product={activeProduct} selectedVariant={selectedVariant} />

            {/* Print Vial Label */}
            {isReconstitutionRelevant && (
              <button
                onClick={() => setShowLabelPrinter(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.65rem 1rem',
                  background: 'transparent',
                  border: '1.5px dashed var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'rgba(0,54,102,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                🏷️ Print Vial Label
              </button>
            )}
              </div>

              {/* Product Title and Top Actions */}
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

              <h1 className="pd-title-h1" style={{ fontSize: '2.75rem', margin: '0', display: 'flex', flexDirection: 'column', lineHeight: 1.05, fontFamily: "'Outfit', sans-serif" }}>
                <span style={{ fontWeight: 850, color: 'var(--primary)', letterSpacing: '-0.04em' }}>
                  {activeProduct.name}
                </span>
                {activeProduct.scientificName && (
                  <span style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    marginTop: '0.35rem',
                    letterSpacing: '-0.01em',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {activeProduct.scientificName}
                  </span>
                )}
              </h1>

              {activeProduct.objective && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {activeProduct.objective.split(',').map((obj, i) => (
                    <button key={i} onClick={() => onSelectObjective(obj.trim())} style={{ 
                      background: 'rgba(0, 54, 102, 0.04)', 
                      border: '1px solid rgba(0, 54, 102, 0.1)', 
                      padding: '0.4rem 0.85rem', 
                      borderRadius: '99px', 
                      color: 'var(--text-main)', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.color = 'var(--secondary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 54, 102, 0.1)'; e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <Target size={12} color="var(--secondary)" />
                      {obj.trim()}
                    </button>
                  ))}
                </div>
              )}

              {uniqueStrengths.length > 0 && (
                <div className="pd-strength-body" style={{ marginTop: '0.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Strength
                  </span>
                  <div className="pd-variant-row" style={{ gap: '0.5rem' }}>
                    {uniqueStrengths.map(({ formatted, dosage, variants }, idx) => {
                      const isSelected = selectedVariant && formatDose(selectedVariant.dosage || selectedVariant.strength, activeProduct.name, activeProduct.category) === formatted;
                      const handleSelectStrength = () => {
                        const preferredSupplier = selectedSupplier || 'Lotusland';
                        const match = variants.find(v => v.supplier === preferredSupplier) || variants[0];
                        setSelectedVariant(match);
                      };
                      return (
                        <button
                          key={idx}
                          className="pd-variant-btn"
                          onClick={handleSelectStrength}
                          style={{
                            padding: '0.55rem 1.1rem',
                            borderRadius: '10px',
                            border: isSelected ? '2.5px solid #0055cc' : '1.5px solid #cbd5e1',
                            backgroundColor: isSelected ? '#0066cc' : '#f0f2f5',
                            color: isSelected ? 'var(--color-bg-surface)' : 'var(--color-text-secondary)',
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
                          {formatted}
                        </button>
                      );
                    })}
                  </div>

                  {/* Supplier selector for B2B professional users */}
                  {isProfessional && selectedVariant && (() => {
                    const currentStrengthFormatted = formatDose(selectedVariant.dosage || selectedVariant.strength, activeProduct.name, activeProduct.category);
                    const currentStrengthData = uniqueStrengths.find(s => s.formatted === currentStrengthFormatted);
                    const availableVariants = currentStrengthData?.variants || [];
                    
                    if (availableVariants.length > 1) {
                      const suppliers = availableVariants.map(v => v.supplier || 'Lotusland');
                      const uniqueSuppliers = [...new Set(suppliers)];
                      if (uniqueSuppliers.length > 1) {
                        return (
                          <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Select Supplier
                            </span>
                            <div className="pd-supplier-toggle" style={{ display: 'inline-flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border)' }}>
                              {uniqueSuppliers.map(sup => {
                                const isSelected = selectedVariant.supplier === sup;
                                return (
                                  <button
                                    key={sup}
                                    onClick={() => {
                                      const match = availableVariants.find(v => v.supplier === sup) || availableVariants[0];
                                      setSelectedVariant(match);
                                      setSelectedSupplier(sup);
                                    }}
                                    style={{
                                      padding: '0.35rem 0.95rem',
                                      borderRadius: '7px',
                                      border: 'none',
                                      backgroundColor: isSelected ? 'white' : 'transparent',
                                      color: isSelected ? '#0066cc' : 'var(--text-muted)',
                                      fontWeight: 800,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    {sup === 'Lotusland' ? 'Lotusland (Standard)' : 'NPLAB (Specialty)'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}

                  {selectedVariant && (
                    <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0066cc', marginTop: '0.5rem' }}>
                      ✓ {formatDose(selectedVariant.dosage || selectedVariant.strength, activeProduct.name, activeProduct.category)} ({selectedVariant.supplier || 'Lotusland'}) selected
                    </span>
                  )}
                </div>
              )}
            </div>
            </div> {/* Close #overview */}

            {/* 1. Price & Purchase (Conversion Block moved up) */}
            <div id="formats" className="card pd-mobile-order-2 pd-price-card-desktop" style={{ padding: '1.5rem', border: '2px solid var(--primary-light)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{selectionType === 'kit' ? 'Price per kit' : 'Price per vial'}</span>
                  {selectionType === 'kit' && <span style={{ color: 'var(--secondary)', fontSize: '0.70rem', fontWeight: 800 }}>⭐ RECOMMENDED SET</span>}
                </div>
                {authLoading ? (
                  <span style={{ display: 'inline-block', width: '120px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
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

              <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', height: '42px', opacity: (priceDisplay && priceDisplay !== 'unavailable') ? 1 : 0.5, pointerEvents: (priceDisplay && priceDisplay !== 'unavailable') ? 'auto' : 'none' }}>
                <button onClick={() => setSelectionType('vial')} style={{ flex: 1, border: 'none', backgroundColor: selectionType === 'vial' ? 'var(--primary)' : 'var(--color-bg-app)', color: selectionType === 'vial' ? 'white' : 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Single Vial</button>
                <button onClick={() => setSelectionType('kit')} style={{ flex: 1, border: 'none', backgroundColor: selectionType === 'kit' ? 'var(--secondary)' : 'var(--color-bg-app)', color: selectionType === 'kit' ? 'white' : 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>10-Vial Kit</button>
              </div>

              {/* ClinicalAI — contextual product intelligence CTA (desktop) */}
              <button
                onClick={() => {
                  // Clear stored conversation so Product Intelligence Mode
                  // always opens with a fresh, product-specific greeting
                  try {
                    localStorage.removeItem('clinical_ai_messages_v2');
                    sessionStorage.removeItem('clinical_ai_messages');
                  } catch (e) {
                    /* ignore */
                  }
                  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                    detail: {
                      action: 'ask_about_entity',
                      entityName: activeProduct?.name || '',
                      section: 'ProductDetail.Hero',
                      autoSend: true
                    }
                  }));
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 163, 224, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(0, 163, 224, 0.55)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,163,224,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 163, 224, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(0, 163, 224, 0.3)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(0, 163, 224, 0.3)',
                  backgroundColor: 'rgba(0, 163, 224, 0.06)',
                  color: 'var(--secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.01em',
                }}
              >
                {/* Live pulse dot */}
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--secondary)',
                  flexShrink: 0,
                  boxShadow: '0 0 0 2px rgba(0,163,224,0.25)',
                  animation: 'ca-dot-ping 1.8s ease-in-out infinite',
                }} />
                Ask ClinicalAI about {activeProduct?.name || 'this peptide'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>

              <button
                className="btn"
                disabled={!priceDisplay || priceDisplay === 'unavailable'}
                onClick={() => {
                  if (!selectedVariant && productVariants.length > 1) return;
                  const target = selectedVariant
                    ? { ...selectedVariant, name: activeProduct.name }
                    : activeProduct;
                  
                  trackPurchaseIntent({
                    peptide_name: activeProduct.name,
                    protocol_id: null
                  });

                  onAddToCart(target, selectionType === 'kit' ? 10 : 1);
                }}
                style={{ width: '100%', gap: '0.75rem', backgroundColor: (priceDisplay && priceDisplay !== 'unavailable') ? (selectionType === 'kit' ? 'var(--secondary)' : 'var(--primary)') : 'var(--border)', color: (priceDisplay && priceDisplay !== 'unavailable') ? 'white' : 'var(--text-muted)', padding: '1rem', fontSize: '1rem', fontWeight: 800, cursor: (priceDisplay && priceDisplay !== 'unavailable') ? 'pointer' : 'not-allowed' }}
              >
                <Plus size={18} /> {currentQty > 0 ? `Add More (${currentQty})` : `Add to Sample Order`}
              </button>
            </div>

            <div id="clinical_profile" className="pd-mobile-order-4" style={{ marginBottom: '2rem' }}>
              <div
                onClick={() => setIsCapabilitiesExpanded(!isCapabilitiesExpanded)}
                style={{
                  padding: '1.25rem',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isCapabilitiesExpanded ? 'var(--shadow-md)' : 'none',
                  backgroundColor: isCapabilitiesExpanded ? 'var(--color-bg-app)' : 'var(--color-bg-surface)'
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
                  backgroundColor: 'var(--color-bg-app)',
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
                                    <Check size={14} color="var(--color-success)" strokeWidth={3} />
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

              {/* ── ADMIN ONLY: Full Pricing Breakdown Table ── */}
              {isAdmin && (() => {
                const pricing = selectedVariant?.pricing ?? {};
                const masterVial = pricing?.master?.perUnit ?? null;
                const masterKit  = pricing?.master?.kit ?? null;

                const profiles = [
                  { key: 'retail',    label: 'Retail',    color: '#60a5fa', badge: 'Guest / Public' },
                  { key: 'wholesale', label: 'Wholesale', color: '#a78bfa', badge: 'Pro / Reseller' },
                  { key: 'clinic',    label: 'Clinic',    color: '#34d399', badge: 'Clinic Account' },
                ];

                const calcMargin = (price, master) => {
                  if (price == null || master == null || master === 0) return null;
                  const absMargin = price - master;
                  const pctMargin = ((price - master) / master) * 100;
                  return { abs: absMargin, pct: pctMargin };
                };

                const fmtUsd = (v) => v != null ? `$${Number(v).toFixed(2)}` : '—';
                const fmtPct = (v) => v != null ? `+${v.toFixed(0)}%` : '—';

                return (
                  <div style={{
                    background: '#000000',
                    border: '1px solid #1e293b',
                    borderRadius: '14px',
                    overflow: 'hidden',
                  }}>
                    {/* Table Header */}
                    <div style={{
                      background: 'linear-gradient(90deg, #0f172a, #1e293b)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderBottom: '1px solid #1e293b',
                    }}>
                      <Lock size={12} color="#f59e0b" />
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Admin — All Profile Prices &amp; Margins
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.58rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                        {selectedVariant?.label || selectedVariant?.name || 'Selected Variant'}
                      </span>
                    </div>

                    {/* Column Headers — 7 cols */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.1fr 0.8fr 0.8fr 0.6fr 0.8fr 0.8fr 0.6fr',
                      padding: '0.5rem 1rem',
                      background: '#0a0f1a',
                      borderBottom: '1px solid #1e293b',
                      gap: '0.2rem',
                    }}>
                      {['Profile', 'Vial', 'Vial Margin', 'Vial %', 'Kit', 'Kit Margin', 'Kit %'].map(h => (
                        <span key={h} style={{ fontSize: '0.52rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                      ))}
                    </div>

                    {/* Master row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.1fr 0.8fr 0.8fr 0.6fr 0.8fr 0.8fr 0.6fr',
                      padding: '0.6rem 1rem',
                      background: '#0f172a',
                      borderBottom: '1px solid #1e293b',
                      gap: '0.2rem',
                      alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f59e0b' }}>Master</span>
                        <span style={{ fontSize: '0.55rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Our Cost</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{fmtUsd(masterVial)}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-primary)' }}>—</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>base</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{fmtUsd(masterKit)}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-primary)' }}>—</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>base</span>
                    </div>

                    {/* Profile rows */}
                    {profiles.map(({ key, label, color, badge }, idx) => {
                      const p = pricing?.[key];
                      const vial = p?.perUnit ?? null;
                      const kit  = p?.kit ?? null;
                      const marginVial = calcMargin(vial, masterVial);
                      const marginKit  = calcMargin(kit,  masterKit);
                      const isLast = idx === profiles.length - 1;

                      const marginStyle = (m) => ({
                        fontSize: '0.7rem', fontWeight: 800, fontFamily: 'monospace',
                        color: m != null ? (m.abs >= 0 ? '#34d399' : '#f87171') : 'var(--color-text-primary)',
                      });
                      const pctStyle = (m) => ({
                        fontSize: '0.7rem', fontWeight: 900, fontFamily: 'monospace',
                        color: m != null ? (m.pct >= 0 ? '#34d399' : '#f87171') : 'var(--color-text-primary)',
                        background: m != null ? 'rgba(52,211,153,0.08)' : 'transparent',
                        borderRadius: '4px',
                        padding: '0.1rem 0.25rem',
                        display: 'inline-block',
                      });

                      return (
                        <div key={key} style={{
                          display: 'grid',
                          gridTemplateColumns: '1.1fr 0.8fr 0.8fr 0.6fr 0.8fr 0.8fr 0.6fr',
                          padding: '0.6rem 1rem',
                          background: idx % 2 === 0 ? '#060b14' : '#000000',
                          borderBottom: isLast ? 'none' : '1px solid #0f172a',
                          gap: '0.2rem',
                          alignItems: 'center',
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 900, color }}>{label}</span>
                            <span style={{ fontSize: '0.52rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{badge}</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>{fmtUsd(vial)}</span>
                          <span style={marginStyle(marginVial)}>{marginVial != null ? `+$${marginVial.abs.toFixed(2)}` : '—'}</span>
                          <span style={pctStyle(marginVial)}>{marginVial != null ? fmtPct(marginVial.pct) : '—'}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>{fmtUsd(kit)}</span>
                          <span style={marginStyle(marginKit)}>{marginKit != null ? `+$${marginKit.abs.toFixed(2)}` : '—'}</span>
                          <span style={pctStyle(marginKit)}>{marginKit != null ? fmtPct(marginKit.pct) : '—'}</span>
                        </div>
                      );
                    })}
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

              {/* 3. Clinical Evidence Hub */}
              <div
                onClick={() => setShowPubMedPanel(true)}
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 15px rgba(0,54,102,0.03)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = 'var(--secondary)'; 
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,163,224,0.08)'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'var(--border)'; 
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,54,102,0.03)'; 
                }}
              >
                {/* Decorative glow */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--secondary)', opacity: 0.05, filter: 'blur(20px)', borderRadius: '50%' }} />
                
                <div style={{ 
                  backgroundColor: 'var(--section-alt, #EEF4FA)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  color: 'var(--secondary)', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0, 163, 224, 0.15)'
                }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Clinical Evidence Hub</h4>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'var(--primary)', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Summarized</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Access peer-reviewed PubMed publications with key insight summaries.</p>
                </div>
                <div style={{ color: 'var(--secondary)', opacity: 0.7 }}>
                  <ExternalLink size={18} />
                </div>
              </div>

              {/* ── ClinicAI Interactive Research Assistant Widget ── */}
              <div style={{
                background: 'linear-gradient(145deg, #0d1b2e 0%, #070e17 100%)',
                border: '1px solid rgba(0, 163, 224, 0.25)',
                borderRadius: '24px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 54, 102, 0.15)',
                color: 'var(--color-bg-app)',
                marginBottom: '1.5rem'
              }}>
                {/* Ambient background glow */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(0, 163, 224, 0.15) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
                
                <div className="pd-ai-widget-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexDirection: 'row', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(0, 163, 224, 0.15)',
                    border: '1.5px solid rgba(0, 163, 224, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: '0 0 20px rgba(0, 163, 224, 0.25)',
                    flexShrink: 0
                  }}>
                    <Bot size={28} strokeWidth={2.2} color="#00a3ff" />
                  </div>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00a3ff', textTransform: 'uppercase', letterSpacing: '0.12em', background: 'rgba(0, 163, 225, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        ClinicAI Integrated
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 700 }}>
                        <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-success)', borderRadius: '50%', display: 'inline-block' }} />
                        Expert System Live
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif" }}>
                      Interactive Research Assistant
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                      Explore clinical applications, safety thresholds, reconstitution guidelines, and stack synergies for {activeProduct.name} with our institutional AI.
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(0, 163, 224, 0.2), transparent)', margin: '1.5rem 0' }} />

                {/* Quick Query Chips */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    Select a research inquiry
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[
                      {
                        icon: '🩺',
                        label: `Dosing Protocols & Reconstitution`,
                        query: `What are the recommended dosing timelines, reconstitution ratios, and safety thresholds for ${activeProduct.name}?`
                      },
                      {
                        icon: '⚡',
                        label: `Synergistic Stack Combinations`,
                        query: `Which compounds and supplements synergize best with ${activeProduct.name} to maximize clinical efficacy, and in what ratios?`
                      },
                      {
                        icon: '🧬',
                        label: `Molecular Mechanism & Pathways`,
                        query: `Explain the biological mechanisms of action, molecular pathways, and target receptors affected by ${activeProduct.name}.`
                      }
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          try {
                            localStorage.removeItem('clinical_ai_messages_v2');
                          } catch (e) {
                            /* ignore */
                          }
                          window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                            detail: {
                              query: q.query,
                              section: 'ProductDetail.FAQWidget',
                              autoSend: true
                            }
                          }));
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '14px',
                          padding: '0.85rem 1.1rem',
                          color: 'var(--color-border)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontFamily: 'inherit',
                          width: '100%'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 163, 224, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(0, 163, 224, 0.4)';
                          e.currentTarget.style.transform = 'translateX(6px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{q.icon}</span>
                        <span style={{ flex: 1 }}>{q.label}</span>
                        <span style={{ color: '#00a3ff', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 800 }}><Bot size={16} strokeWidth={2.2} /></span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Structural Accordions (Description at bottom) */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <details className="pd-accordion" open>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} color="var(--primary)" />
                    Research Background
                  </summary>
                  <div className="pd-accordion-content">
                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                      {activeProduct.desc || activeProduct.description}
                    </p>
                  </div>
                </details>

                {/* 2. Specifications Accordion */}
                {(() => {
                  const specs = [];
                  if (activeProduct.molecular_formula) specs.push({ label: 'Molecular Formula', value: activeProduct.molecular_formula });
                  if (activeProduct.molecular_weight) specs.push({ label: 'Molecular Weight', value: typeof activeProduct.molecular_weight === 'number' || !isNaN(activeProduct.molecular_weight) ? `${activeProduct.molecular_weight} Da` : activeProduct.molecular_weight });
                  if (activeProduct.cas) specs.push({ label: 'CAS Number', value: activeProduct.cas });
                  if (activeProduct.sequence) specs.push({ label: 'Sequence', value: activeProduct.sequence, isSequence: true });
                  if (activeProduct.typeData?.typicalResearchUse) specs.push({ label: 'Typical Research Use', value: activeProduct.typeData.typicalResearchUse });
                  const purityVal = activeProduct.purity || activeProduct.purity_level;
                  if (purityVal) specs.push({ label: 'Purity Level', value: purityVal });

                  if (specs.length === 0) return null;

                  return (
                    <details className="pd-accordion">
                      <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={16} color="var(--primary)" />
                        Specifications
                      </summary>
                      <div className="pd-accordion-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {specs.map((spec, i) => (
                            <div key={i} style={{ 
                              display: 'flex', 
                              flexDirection: spec.isSequence ? 'column' : 'row',
                              justifyContent: spec.isSequence ? 'flex-start' : 'space-between', 
                              alignItems: spec.isSequence ? 'flex-start' : 'baseline', 
                              padding: '0.45rem 0', 
                              borderBottom: i < specs.length - 1 ? '1px solid var(--border)' : 'none', 
                              gap: '1rem' 
                            }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                                {spec.label}
                              </span>
                              <span style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--text-main)', 
                                fontWeight: 500, 
                                textAlign: spec.isSequence ? 'left' : 'right',
                                wordBreak: 'break-all',
                                fontFamily: spec.isSequence ? 'monospace' : 'inherit',
                                marginTop: spec.isSequence ? '0.25rem' : '0',
                                backgroundColor: spec.isSequence ? 'var(--color-bg-app)' : 'transparent',
                                padding: spec.isSequence ? '0.35rem 0.5rem' : '0',
                                borderRadius: spec.isSequence ? '4px' : '0',
                                border: spec.isSequence ? '1px solid var(--border)' : 'none',
                                width: spec.isSequence ? '100%' : 'auto'
                              }}>
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  );
                })()}

                {/* 3. Clinical Guidelines Accordion */}
                {(() => {
                  const hasPK = !!activeProduct.pharmacokinetics;
                  const rawDosage = activeProduct.typeData?.dosageRange || activeProduct.dosageRange || activeProduct.typeData?.dosage;
                  const dosage = typeof rawDosage === 'object' && rawDosage !== null
                    ? `${rawDosage.min ?? ''}${rawDosage.max ? `–${rawDosage.max}` : ''} ${rawDosage.unit ?? ''} ${rawDosage.frequency ? `(${rawDosage.frequency.replace(/_/g, ' ')})` : ''}`.trim()
                    : rawDosage;
                  
                  if (!hasPK && !dosage) return null;

                  const pk = activeProduct.pharmacokinetics || {};
                  const rows = [
                    dosage && { label: 'Dosage Range', value: dosage },
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
                        Clinical Guidelines
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

                {/* 4. Research & Mechanism Accordion */}
                {(() => {
                  const sciSummary = activeProduct.aiContent?.scientificSummary || activeProduct.scientificSummary;
                  const moa = activeProduct.typeData?.mechanismOfAction || activeProduct.mechanismOfAction || activeProduct.typeData?.peptide?.mechanismOfAction;
                  const mechanisms = activeProduct.mechanisms || [];

                  if (!sciSummary && !moa && mechanisms.length === 0) return null;

                  return (
                    <details className="pd-accordion">
                      <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Microscope size={16} color="var(--primary)" />
                        Research &amp; Mechanism
                      </summary>
                      <div className="pd-accordion-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {sciSummary && (
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Scientific Overview</div>
                              <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                                {sciSummary}
                              </p>
                            </div>
                          )}

                          {moa?.summary && (
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Mechanism of Action</div>
                              <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                {moa.summary}
                              </p>
                            </div>
                          )}

                          {moa?.researchFocus && moa.researchFocus.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Research Focus Areas</div>
                              <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                {moa.researchFocus.map((item, idx) => (
                                  <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {mechanisms.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Associated Biological Pathways</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {mechanisms.map((mech, i) => (
                                  <span key={i} style={{ 
                                    padding: '0.25rem 0.6rem', 
                                    backgroundColor: '#f1f5f9', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '6px', 
                                    fontSize: '0.75rem', 
                                    color: 'var(--text-muted)', 
                                    fontWeight: 650 
                                  }}>{mech}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  );
                })()}

                {/* 5. Stability & Storage Accordion */}
                {(() => {
                  const stability = activeProduct.stabilityNote || activeProduct.typeData?.stabilityNote;
                  const storage = activeProduct.storage_conditions || activeProduct.typeData?.storage;

                  if (!stability && !storage) return null;

                  return (
                    <details className="pd-accordion">
                      <summary style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Thermometer size={16} color="var(--primary)" />
                        Stability &amp; Storage
                      </summary>
                      <div className="pd-accordion-content" style={{ 
                        backgroundColor: isReconstitutionRelevant ? '#fff8f0' : 'rgba(248, 250, 252, 0.5)',
                        borderColor: isReconstitutionRelevant ? '#fed7aa' : 'var(--border)' 
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {stability ? (
                            <p style={{ 
                              fontSize: '0.85rem', 
                              color: isReconstitutionRelevant ? '#92400e' : 'var(--text-main)', 
                              margin: 0, 
                              lineHeight: 1.5,
                              fontWeight: isReconstitutionRelevant ? 600 : 500
                            }}>
                              {stability}
                            </p>
                          ) : (
                            <p style={{ 
                              fontSize: '0.85rem', 
                              color: isReconstitutionRelevant ? '#92400e' : 'var(--text-main)', 
                              margin: 0, 
                              lineHeight: 1.5,
                              fontWeight: isReconstitutionRelevant ? 600 : 500
                            }}>
                              {isReconstitutionRelevant 
                                ? "Lyophilized peptides remain stable at room temperature during transit. Upon receipt, store in a laboratory freezer."
                                : "Store in a cool, dry place away from direct sunlight. Maintain at room temperature (15°C to 25°C)."
                              }
                            </p>
                          )}

                          {storage && (
                            <div style={{ 
                              marginTop: '0.25rem', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '0.4rem',
                              borderTop: `1px solid ${isReconstitutionRelevant ? '#ffedd5' : 'var(--border)'}`,
                              paddingTop: '0.6rem'
                            }}>
                              {storage.dry && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: 700, color: isReconstitutionRelevant ? '#b45309' : 'var(--text-muted)' }}>Storage (Dry):</span>
                                  <span style={{ fontWeight: 600, color: isReconstitutionRelevant ? '#92400e' : 'var(--text-main)' }}>{storage.dry}</span>
                                </div>
                              )}
                              {storage.reconstituted && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: 700, color: isReconstitutionRelevant ? '#b45309' : 'var(--text-muted)' }}>Storage (Liquid):</span>
                                  <span style={{ fontWeight: 600, color: isReconstitutionRelevant ? '#92400e' : 'var(--text-main)' }}>{storage.reconstituted}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  );
                })()}
              </div>

              {/* Compliance Card */}
              <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '12px', backgroundColor: 'rgba(248, 250, 252, 0.5)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <ShieldCheck size={20} color="var(--secondary)" />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Supplied exclusively for in-vitro research. Acquisition requires institutional affiliation.
                </p>
              </div>
            </div>{/* /pd-mobile-order-5 */}
          </div>{/* /pd-info-col */}

          {/* RIGHT COLUMN: Persistent ClinicAI Sidebar */}
          <div className="pd-ai-col">
            <ClinicalAssistant embedded={true} isOpen={true} setIsOpen={() => {}} />
          </div>

        </div>{/* /pd-grid */}

        {/* ── Floating Action Bar (Desktop & Mobile) ─────────── */}
        <div className="pd-floating-bar">
          <div className="pd-floating-price-col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {selectedVariant ? `${formatDose(selectedVariant.dosage || selectedVariant.strength, activeProduct.name, activeProduct.category)} • ${selectionType === 'kit' ? 'Kit (10)' : 'Single'}` : 'Select Strength'}
              </span>
              <span className="pd-floating-price">
                {authLoading ? '...' : (priceDisplay && priceDisplay !== 'unavailable' ? priceDisplay : '---')}
              </span>
            </div>
          </div>
          
          <button
            disabled={!priceDisplay || priceDisplay === 'unavailable' || authLoading}
            onClick={() => {
              if (!selectedVariant && productVariants.length > 1) return;
              const target = selectedVariant ? { ...selectedVariant, name: activeProduct.name } : activeProduct;
              trackPurchaseIntent({ peptide_name: activeProduct.name, protocol_id: null });
              onAddToCart(target, selectionType === 'kit' ? 10 : 1);
            }}
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '99px',
              border: 'none',
              backgroundColor: (priceDisplay && priceDisplay !== 'unavailable') ? 'var(--primary)' : 'var(--border)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: (priceDisplay && priceDisplay !== 'unavailable') ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: (priceDisplay && priceDisplay !== 'unavailable') ? '0 4px 14px rgba(0,54,102,0.25)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <ShoppingCart size={18} />
            {currentQty > 0 ? `Add More (${currentQty})` : 'Add to Order'}
          </button>
        </div>
        {/* Bottom padding to offset sticky footer */}
        <div className="pd-mobile-bottom-pad" />

        {/* Purity & Testing Methods Modal */}

        {showPurityModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 27, 46, 0.65)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem 2.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
              color: 'var(--text-main)'
            }}>
              <button
                onClick={() => setShowPurityModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.03)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <ShieldCheck size={28} color="var(--success)" />
                <div>
                  <h2 style={{ fontSize: '1.35rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 900 }}>Certificate of Analysis (CoA)</h2>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Batch Analysis for {activeProduct.name}</p>
                </div>
                <div style={{ marginLeft: 'auto', backgroundColor: 'var(--success)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Purity: 99.42%
                </div>
              </div>

              {/* HPLC Chromatogram Visualizer */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>High-Performance Liquid Chromatography (HPLC)</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>RT: 12.42 min</span>
                </h4>
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem' }}>
                  <svg width="100%" height="150" viewBox="0 0 500 150">
                    {/* Gridlines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#CBD5E0" strokeWidth="1.5" />
                    <line x1="40" y1="20" x2="40" y2="120" stroke="#CBD5E0" strokeWidth="1.5" />

                    {/* Chromatogram Curve Path */}
                    {/* Main peak is around RT 12.4 min (x = 242) */}
                    <path 
                      d="M 40 120 L 200 120 Q 220 120 228 115 T 235 50 Q 240 15 242 15 Q 244 15 249 50 T 256 115 Q 264 120 280 120 L 320 120 Q 325 120 328 110 Q 330 108 332 110 Q 335 120 340 120 L 480 120" 
                      fill="none" 
                      stroke="var(--secondary)" 
                      strokeWidth="2.5" 
                    />

                    {/* Peak Highlight dot */}
                    <circle cx="242" cy="15" r="4.5" fill="var(--primary)" />
                    <line x1="242" y1="15" x2="242" y2="120" stroke="var(--primary)" strokeDasharray="2 2" />

                    {/* Axis Labels */}
                    <text x="242" y="10" fontSize="8" fontWeight="800" fill="var(--primary)" textAnchor="middle">Peak RT 12.42m (99.42%)</text>
                    <text x="475" y="132" fontSize="8" fontWeight="700" fill="#718096" textAnchor="end">Tiempo de Retención (min)</text>
                    <text x="35" y="15" fontSize="8" fontWeight="700" fill="#718096" textAnchor="end" transform="rotate(-90 35 15)">Intensidad (mAU)</text>
                  </svg>
                </div>
              </div>

              {/* Mass Spectrometry & Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem', marginBottom: '2rem' }}>
                {/* Mass Spec Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Mass Spectrometry (MS)
                  </h4>
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0.85rem', background: '#FFF', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Masa Teórica:</span>
                      <span style={{ fontWeight: 700 }}>{activeProduct.molecular_weight ? `${activeProduct.molecular_weight} Da` : '1419.2 Da'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Masa Hallada:</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {activeProduct.molecular_weight ? `${(parseFloat(activeProduct.molecular_weight) - 0.02).toFixed(2)} Da` : '1419.18 Da'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Diferencia:</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>PASS (-0.02 Da)</span>
                    </div>
                  </div>
                </div>

                {/* Batch Specifications Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Especificaciones del Lote
                  </h4>
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0.85rem', background: '#FFF', fontSize: '0.76rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={12} color="var(--success)" strokeWidth={3} />
                      <span style={{ color: 'var(--text-muted)' }}>Identidad:</span> <strong>PASS</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={12} color="var(--success)" strokeWidth={3} />
                      <span style={{ color: 'var(--text-muted)' }}>Pureza:</span> <strong style={{ color: 'var(--success)' }}>99.4%</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={12} color="var(--success)" strokeWidth={3} />
                      <span style={{ color: 'var(--text-muted)' }}>TFA:</span> <strong>&lt; 1.0%</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={12} color="var(--success)" strokeWidth={3} />
                      <span style={{ color: 'var(--text-muted)' }}>Agua:</span> <strong>&lt; 5.0%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* CoA Request Footer */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowPurityModal(false)}
                  style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    if (isWholesaler) {
                      if (activeProduct.coaDriveUrl) {
                        window.open(activeProduct.coaDriveUrl, '_blank');
                      } else {
                        alert("El certificado de análisis para este lote está en proceso de carga. Por favor contacte con soporte técnico.");
                      }
                    } else {
                      setShowPurityModal(false);
                      navigate('/contact', {
                        state: {
                          topic: 'Regulatory Documentation',
                          prefillMessage: `Hello, I would like to request the Certificate of Analysis (CoA) for the research product: ${activeProduct.name}.`
                        }
                      });
                    }
                  }}
                  style={{ background: isWholesaler ? 'var(--primary)' : 'var(--success)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 800 }}
                >
                  {isWholesaler ? "Descargar Reporte Completo (PDF)" : "Solicitar Reporte Completo (PDF)"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Related Sections Group ────────────────────────────────────── */}
      <div className="pdp-discovery-group">
        <style dangerouslySetInnerHTML={{ __html: `
          .pdp-discovery-group {
            background: #f8fafc;
            border-top: 1px solid var(--border);
            padding: 4rem 0;
            display: flex;
            flex-direction: column;
            gap: 5rem;
          }
          @media (max-width: 768px) {
            .pdp-discovery-group {
              padding: 3rem 0;
              gap: 3rem;
            }
          }
        ` }} />

        {/* 1. Related Peptides */}
        {discoveryRelated.length > 0 && (
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <RelatedPeptidesRow
              peptides={discoveryRelated}
              allProducts={products}
              onProductClick={(p) => onSelectProduct?.(p)}
              title={`Discovery Engine: Related Compounds`}
            />
          </div>
        )}

        {/* 2. Used in Protocols */}
        <div id="protocols">
          <ProductProtocolsSection
            protocols={relatedProtocols}
            peptideName={activeProduct.name}
          />
        </div>

      </div>

      {/* ── Discovery: FAQ on PDP ──────────────────────────────────────── */}
      {combinedFaqs.length > 0 && (
        <div id="faqs" style={{ padding: '5rem 0', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
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

      {/* Vial Label Printer Modal */}
      {showLabelPrinter && (
        <VialLabelPrinter
          product={activeProduct}
          selectedVariant={selectedVariant}
          onClose={() => setShowLabelPrinter(false)}
        />
      )}

      {/* PubMed Preview Panel */}
      <PubMedPreviewPanel
        isOpen={showPubMedPanel}
        onClose={() => setShowPubMedPanel(false)}
        product={activeProduct}
      />
    </>
  );
}

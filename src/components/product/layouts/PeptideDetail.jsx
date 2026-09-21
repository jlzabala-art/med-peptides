"use client";

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trackPeptideView, trackPurchaseIntent } from '@/hooks/useAnalytics';
import { trackProductView } from '@/services/algoliaInsights';
import { trackRecentView } from '@/utils/recentViews';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatDose } from '@/data/dosageUnits';
import { productCategories, SUPPLIERS } from '@/data/productConstants';
import { getRelatedPeptides, getFAQForProduct } from '@/utils/discoveryEngine';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';
import { resolveVariantClinicalImage } from '@/utils/clinicalImageResolver';
import DynamicProductVisualOverlay from '@/components/product/DynamicProductVisualOverlay';
import ProceduralPeptideAnalysis from '@/components/product/ProceduralPeptideAnalysis';
import ReconstitutionCalculator from '@/components/product/ReconstitutionCalculator';
import CoaModal from '@/components/product/CoaModal';
import WidgetErrorBoundary from '@/components/shared/WidgetErrorBoundary';
import { openProductAI } from '@/utils/openModuleAI';





















import ImageModal from '@/snippets/ImageModal';
import OptimizedImage from '@/snippets/OptimizedImage';
import FAQAccordion from '@/components/discovery/FAQAccordion';
import RelatedPeptidesRow from '@/components/discovery/RelatedPeptidesRow';
import PubMedPreviewPanel from '@/components/discovery/PubMedPreviewPanel';
import DatasheetTeaserCard from '../DatasheetTeaserCard';
import ProductProtocolsSection from '../ProductProtocolsSection';
import ReconstitutionGuide from '../ReconstitutionGuide';
import PenDosingGuide from '../PenDosingGuide';
import SprayDosingGuide from '../SprayDosingGuide';
import OralDosingGuide from '../OralDosingGuide';
import SmartDosageGuide from '../SmartDosageGuide';
import VialLabelPrinter from '../VialLabelPrinter';
import ProductTraceabilityCard from '../ProductTraceabilityCard';
import ProtocolTOC from '@/components/protocol/ProtocolTOC';
import ClinicalAssistant from '@/components/shared/ClinicalAssistant';
import MedicalSupervisionBanner from '@/components/shared/MedicalSupervisionBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopilot } from '@/context/CopilotContext';
import PeptideDetailStyles from './detail/PeptideDetailStyles';
import PeptideTrustBadges from './detail/PeptideTrustBadges';
import PeptideClinicalEvidence from './detail/PeptideClinicalEvidence';
import PeptideResearchAccordions from './detail/PeptideResearchAccordions';
import FdaRegulatoryBadge from '@/components/product/FdaRegulatoryBadge';

import { collection, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import * as protocolRepository from '@/repositories/protocolRepository';
import * as productRepository from '@/repositories/productRepository';
import { mapSourcingToCategory } from '@/repositories/mappers';
import { lockScroll, unlockScroll } from '@/utils/scrollLock';
import { getHumanFormatName } from '@/utils/productVariantProcessing';
import RelatedProductsCarousel from '@/components/shared/RelatedProductsCarousel';
import AlgoliaCompetitorBadge from '@/components/admin/competitors/AlgoliaCompetitorBadge';
import { formatPrice, resolveVariantPrice } from '@/services/pricingService';
import { usePricingTier } from '@/hooks/usePricingTier';
import { DOSAGE_UNITS } from '@/data/dosageUnits';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { db } from '@/firebase';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import { LayoutTemplate, Shield, Database, Droplet, ArrowRight, ArrowLeft, ShoppingCart, Check, FlaskConical, Beaker, FileText, ShieldCheck, Target, Layers, Plus, Minus, ChevronDown, ChevronUp, Maximize2, ExternalLink, Activity, Microscope, Truck, Lock, UserCheck, BookOpen, Zap, Thermometer, Scale, Bot, X, Sparkles, Snowflake, Archive, Droplets, Package, CheckCircle2 } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import InlineEditableCell from '@/components/ui/InlineEditableCell';

const PRESENTATION_TYPE_CONFIG = {
  finished_product: {
    label: 'Finished Product',
    sublabel: 'Patient-Ready Formulations',
    icon: '💊',
  },
  raw_material: {
    label: 'Bulk API Powder',
    sublabel: 'Compounding Raw Material',
    icon: '🧪',
  },
  clinical_supplies: {
    label: 'Clinical Supplies',
    sublabel: 'Diluents & Accessories',
    icon: '💉',
  },
  diagnostic: {
    label: 'Diagnostic Kit',
    sublabel: 'Biomarker Testing Panel',
    icon: '🔬',
  },
  service: {
    label: 'Clinical Service',
    sublabel: 'Protocol & Consultation',
    icon: '📋',
  },
};

export default function PeptideDetail({
  product,
  region,
  isProfessional,
  onBack,
  onAddToCart,
  cart,
  onSelectObjective,
  onSelectCategory,
  onSelectProduct,
  products,
  allFaqs,
  processedHierarchy,
  isQuickView = false,
}) {
  const { tier, isLoading: tierLoading } = usePricingTier();

  const router = useRouter();
  const pathname = usePathname();
  const { loading: authLoading, userRole } = useAuth();
  const { can, is } = useRoleAccess();
  const isAdmin = is('admin'); // Legacy alias for quick refactoring
  const { openCopilot } = useCopilot();

  const isWholesaler = userRole === 'wholesaler' || userRole === 'admin';

  const [activeProduct, setActiveProduct] = useState(product);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [relatedEngine, setRelatedEngine] = useState([]);
  const [relatedProtocols, setRelatedProtocols] = useState([]);
  const [volumeOption, setVolumeOption] = useState('unit'); // 'unit' | 'kit'
  const [showPurityModal, setShowPurityModal] = useState(false);
  const [showPubMedPanel, setShowPubMedPanel] = useState(false);
  const [isCapabilitiesExpanded, setIsCapabilitiesExpanded] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. Available presentation types on this product (for Hybrid products)
  const availableProductTypes = useMemo(() => {
    const rawTypes = Array.isArray(product?.availableTypes) && product.availableTypes.length > 0
      ? product.availableTypes
      : (product?.variants || []).map(v => v.type || v.productType).filter(Boolean);

    const types = [...new Set(rawTypes.map(t => t === 'api_raw_material' ? 'raw_material' : t))];
    return types.length > 0 ? types : ['finished_product'];
  }, [product?.availableTypes, product?.variants]);

  const [selectedProductType, setSelectedProductType] = useState(() => {
    return product?.primaryType || availableProductTypes[0] || 'finished_product';
  });

  // Keep selectedProductType in sync if product changes
  useEffect(() => {
    if (!availableProductTypes.includes(selectedProductType)) {
      setSelectedProductType(product?.primaryType || availableProductTypes[0] || 'finished_product');
    }
  }, [availableProductTypes, product?.primaryType, selectedProductType]);

  // Memoized Variants — read from activeProduct.variants (canonical repository shape)
  const productVariants = useMemo(() => {
    let variants = activeProduct?.variants || [];
    
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      if (!activeProduct) return [];
      return [activeProduct];
    }
    
    return [...variants]
      .filter(v => {
        if (!v) return false;
        if (v.isActive === false && !isAdmin) return false;
        if (!isAdmin && !isProfessional && v.isProfessional === true) return false;

        // If product is hybrid (has multiple availableTypes), filter variants by active selectedProductType
        if (availableProductTypes.length > 1 && selectedProductType) {
          const vType = v.type || v.productType || 'finished_product';
          const normalizedVType = vType === 'api_raw_material' ? 'raw_material' : vType;
          if (normalizedVType !== selectedProductType) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const numA = parseFloat((a?.dosage || a?.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat((b?.dosage || b?.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
      });
  }, [activeProduct, isAdmin, isProfessional, availableProductTypes, selectedProductType]);
  const [showLabelPrinter, setShowLabelPrinter] = useState(false);

  // ── Analytics: Track peptide view + recent history ──────────────────────────
  useEffect(() => {
    if (activeProduct) {
      trackPeptideView({
        peptide_name: activeProduct.name,
        protocol_id: (typeof window !== 'undefined' && window.history?.state?.protocol_id) || null
      });
      trackProductView({
        objectID: activeProduct.objectID || activeProduct.id || activeProduct.slug
      });
      trackRecentView({
        type: 'peptide',
        slug: activeProduct.slug || activeProduct.id,
        name: activeProduct.name,
      });
    }
  }, [activeProduct?.name, activeProduct?.slug, activeProduct?.id]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Cmd+S / Ctrl+S listener to trigger blur on active input
  useEffect(() => {
    const handleGlobalSave = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalSave);
    return () => window.removeEventListener('keydown', handleGlobalSave);
  }, []);

  // Sync active product when prop changes
  useEffect(() => {
    if (!isQuickView) {
      window.scrollTo(0, 0);
    }
    setActiveProduct(product);
    setSelectedVariant(null);
  }, [product, isQuickView]);

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
        const [engineData, protocolsData] = await Promise.all([
          productRepository.getRelatedEngineData(),
          protocolRepository.getAllProtocols().catch(() => [])
        ]);
        if (cancelled) return;

        const pSlug = activeProduct.slug || activeProduct.name.toLowerCase().replace(/\s+/g, '-');

        const extractedProtocols = protocolsData
          .filter(p => {
            if (!p.peptideIds) return false;
            if (activeProduct.peptideIds && Array.isArray(activeProduct.peptideIds)) {
               return p.peptideIds.some(id => activeProduct.peptideIds.includes(id));
            }
            return p.peptideIds.includes(activeProduct.peptideId);
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

  const searchParams = useSearchParams();
  const urlSupplier = searchParams.get('supplier');

  // 1. All Unique Suppliers (From Server Hierarchy or fallback)
  const normalizeSupplier = (raw) => {
    if (!raw) return "lotusland";
    const r = String(raw).toLowerCase().replace(/^supplier-/, '').trim();
    return r || "lotusland";
  };

  const uniqueSuppliers = useMemo(() => {
    if (processedHierarchy && processedHierarchy.suppliers) {
      return [...new Set(processedHierarchy.suppliers.map(s => normalizeSupplier(s.id)))];
    }
    const suppliers = productVariants.map(v => normalizeSupplier(v?.supplierId || v?.supplier));
    return [...new Set(suppliers)];
  }, [productVariants, processedHierarchy]);

  const [selectedSupplierId, setSelectedSupplierId] = useState(uniqueSuppliers[0] || 'lotusland');
  const [selectedFormatId, setSelectedFormatId] = useState(null);
  const [selectedStrengthId, setSelectedStrengthId] = useState(null);

  // Fallbacks for older client components or QuickView modal without processedHierarchy
  const getFormat = (v) => {
    const raw = v?.formatId || v?.presentation || v?.format || activeProduct?.presentation || activeProduct?.format || 'Vial';
    return String(raw).replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Sync selectedSupplierId with preselected, URL or uniqueSuppliers updates
  useEffect(() => {
    console.log("PeptideDetail: activeProduct._preselectedSupplierId is", activeProduct?._preselectedSupplierId);
    console.log("PeptideDetail: uniqueSuppliers are", uniqueSuppliers);
    if (uniqueSuppliers.length === 0) return;

    const normalizedPreselected = activeProduct?._preselectedSupplierId ? normalizeSupplier(activeProduct._preselectedSupplierId) : null;

    if (normalizedPreselected && uniqueSuppliers.includes(normalizedPreselected)) {
      if (selectedSupplierId !== normalizedPreselected) {
        console.log("PeptideDetail: Setting selectedSupplierId to _preselectedSupplierId", normalizedPreselected);
        setSelectedSupplierId(normalizedPreselected);
      }
      return;
    }

    // Filter fallback chain
    if (!selectedSupplierId || !uniqueSuppliers.includes(selectedSupplierId)) {
      const normalizedUrlSupplier = urlSupplier ? normalizeSupplier(urlSupplier) : null;
      if (normalizedUrlSupplier && uniqueSuppliers.includes(normalizedUrlSupplier)) {
        setSelectedSupplierId(normalizedUrlSupplier);
      } else if (uniqueSuppliers.includes('lotusland')) {
        setSelectedSupplierId('lotusland');
      } else {
        setSelectedSupplierId(uniqueSuppliers[0]);
      }
    }
  }, [uniqueSuppliers, activeProduct?._preselectedSupplierId, urlSupplier, selectedSupplierId]);

  // Derived state: active Supplier Node
  const activeSupplierNode = useMemo(() => {
    return processedHierarchy?.suppliers?.find(s => normalizeSupplier(s.id) === selectedSupplierId) || null;
  }, [processedHierarchy, selectedSupplierId]);

  // Derivations based on selections
  const filteredVariants = useMemo(() => {
    return productVariants.filter(v => {
      // 1. Filter by Supplier
      const vSupplier = normalizeSupplier(v.supplierId || v.supplier);
      if (selectedSupplierId && vSupplier !== selectedSupplierId) {
        return false;
      }
      return true;
    });
  }, [productVariants, selectedSupplierId]);

  // Derived state: Available Formats
  const availableFormatNodes = useMemo(() => {
    if (activeSupplierNode && processedHierarchy?.formats) {
      return activeSupplierNode.formats.map(fid => 
        processedHierarchy.formats.find(f => f.id === fid)
      ).filter(Boolean);
    }
    // Fallback if no hierarchy
    const formats = productVariants
      .filter(v => normalizeSupplier(v.supplierId || v.supplier) === selectedSupplierId)
      .map(v => getFormat(v));
    const uniqueF = [...new Set(formats)].sort();
    return uniqueF.map(name => ({ id: name, name: getHumanFormatName(name, name) })); 
  }, [activeSupplierNode, processedHierarchy, productVariants, selectedSupplierId]);

  // Auto-select valid format
  useEffect(() => {
    if (availableFormatNodes.length > 0) {
      const currentIsValid = availableFormatNodes.some(f => f.id === selectedFormatId);
      if (!currentIsValid) {
        setSelectedFormatId(availableFormatNodes[0].id);
      }
    } else {
      setSelectedFormatId(null);
    }
  }, [availableFormatNodes, selectedFormatId]);

  // Derived state: Available Strengths
  const availableStrengthNodes = useMemo(() => {
    if (!selectedFormatId) return [];
    
    if (activeSupplierNode && processedHierarchy?.formats && processedHierarchy?.strengths) {
      const activeFormatNode = processedHierarchy.formats.find(f => f.id === selectedFormatId);
      if (activeFormatNode) {
        return activeFormatNode.strengths.map(sid => {
          const sNode = processedHierarchy.strengths.find(s => s.id === sid);
          // Check if variant actually exists for this supplier + format + strength
          const v = processedHierarchy.variantIndex[`${selectedSupplierId}::${selectedFormatId}::${sid}`];
          return v && sNode ? { ...sNode, firstVariant: v } : null;
        }).filter(Boolean);
      }
    }

    // Fallback if no hierarchy
    const matches = productVariants.filter(v => 
      normalizeSupplier(v.supplierId || v.supplier) === selectedSupplierId &&
      getFormat(v) === selectedFormatId
    );
    const validMatches = matches.length > 0 ? matches : productVariants.filter(v => getFormat(v) === selectedFormatId);
    
    const strengths = validMatches.map(v => v.dosage || v.strength || v.name);
    const uniqueS = [...new Set(strengths)].filter(Boolean).sort((a, b) => {
        const numA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
    });

    return uniqueS.map(name => {
       const v = validMatches.find(v => (v.dosage || v.strength || v.name) === name);
       return { id: name, name, firstVariant: v };
    });
  }, [selectedFormatId, activeSupplierNode, processedHierarchy, selectedSupplierId, productVariants]);

  // Auto-select Variant when the pool of strengths changes
  useEffect(() => {
    if (availableStrengthNodes.length > 0) {
      const currentIsValid = selectedStrengthId && availableStrengthNodes.some(s => s.id === selectedStrengthId);
      if (!currentIsValid) {
        // Respect preselected index if any
        const preIdx = typeof product?._preselectedVariantIndex === 'number'
          ? product._preselectedVariantIndex
          : 0;
        const targetStrength = availableStrengthNodes[Math.min(preIdx, availableStrengthNodes.length - 1)];
        setSelectedStrengthId(targetStrength.id);
        setSelectedVariant(targetStrength.firstVariant);
      }
    }
  }, [availableStrengthNodes, selectedStrengthId, product]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    trackPurchaseIntent({
      peptide_name: activeProduct.name,
      variant_id: variant.id,
      action: 'variant_switch'
    });
  };

  // Memoized FAQs from Engine
  const productDiscoveryFaqs = useMemo(() => {
    if (!activeProduct?.name || !allFaqs) return [];
    return getFAQForProduct(activeProduct.name, activeProduct.id || null, isProfessional, 3);
  }, [activeProduct, isProfessional]);

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
    const canonicalBase = 'https://med-peptides.com';
    const productUrl = `${canonicalBase}/product/${slug}`;

    const graph = [
      {
        "@type": "Product",
        "name": product.name,
        "image": product.image ? [`${canonicalBase}${product.image}`] : [],
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
            "item": `${canonicalBase}/` },
          { "@type": "ListItem", "position": 2,
            "name": product.category || "Catalog",
            "item": `${canonicalBase}/collection/${(product.category || "peptides").toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
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
    image: product?.image ? `https://med-peptides.com${product.image}` : undefined,
    structuredData
  });

  // formatDose is imported from src/data/dosageUnits.js
  // Call: formatDose(raw, product.name) to get product-aware units (mg / IU / mcg …)

  const presentationClass = useMemo(() => {
    const fmt = selectedFormatId?.toLowerCase() || '';
    if (fmt.includes('pen') || fmt.includes('prefilled')) return 'pen';
    if (fmt.includes('spray') || fmt.includes('nasal')) return 'spray';
    if (fmt.includes('capsule') || fmt.includes('pill') || fmt.includes('oral') || fmt.includes('drop')) return 'oral';
    if (fmt.includes('cream') || fmt.includes('gel') || fmt.includes('topical')) return 'topical';
    return 'vial';
  }, [selectedFormatId]);

  const isPeptide = useMemo(() => {
    const cat = (activeProduct?.category || '').toLowerCase();
    const name = (activeProduct?.name || '').toLowerCase();
    
    // Explicit non-peptides (small molecules, steroids, hormones, excipients)
    const isSmallMoleculeOrHormone = 
      name.includes('estradiol') || 
      name.includes('dutasteride') || 
      name.includes('finasteride') || 
      name.includes('tadalafil') || 
      name.includes('sildenafil') || 
      name.includes('minoxidil') || 
      name.includes('naltrexone') || 
      name.includes('nadolol') ||
      name.includes('lidocaine') ||
      name.includes('serrapeptase') ||
      name.includes('lanolin');

    if (isSmallMoleculeOrHormone) return false;

    const isExplicitPeptideCat = cat === 'peptides' || cat === 'peptide' || cat === 'prefilled peptide pens' || cat.includes('peptide') || cat === 'api peptide';
    const hasSeq = Boolean(activeProduct?.sequence || activeProduct?.molecular?.sequence);
    return isExplicitPeptideCat || hasSeq;
  }, [activeProduct]);

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
    const targetVariant = selectedVariant ?? productVariants[0] ?? activeProduct ?? null;
    if (!targetVariant) return 'unavailable';

    // ── NEW CANONICAL SCHEMA SUPPORT (Golden Rule) ──
    const rawPrice = targetVariant.unit_price ?? targetVariant.price ?? targetVariant.retailPrice ?? targetVariant.supplierCost ?? targetVariant.supplierUnitCostUSD ?? targetVariant.perVialPriceUSD ?? targetVariant.perUnit;
    // We only accept rawPrice if it's > 0. If it's 0, it means it's unpriced or requires resolving via the pricing object.
    if (rawPrice !== undefined && rawPrice !== null && rawPrice > 0) {
      if (volumeOption === 'kit' || volumeOption === 'tier_10') {
        const raw10 = targetVariant.price_per_kit_10 ?? targetVariant.kitCost ?? targetVariant.supplierKitCostUSD ?? targetVariant.perKitPriceUSD ?? targetVariant.kitPriceUSD ?? targetVariant.cost_tiers?.cost_10 ?? targetVariant.cost_10;
        const total10 = (raw10 != null && raw10 > 0 && raw10 <= rawPrice * 2) ? (raw10 * 10) : (raw10 ?? (rawPrice * 10));
        return formatPrice(total10, 'USD', region);
      }
      if (volumeOption === 'tier_50') {
        const raw50 = targetVariant.cost_tiers?.cost_50 ?? targetVariant.cost_50;
        const total50 = (raw50 != null && raw50 > 0 && raw50 <= rawPrice * 2) ? (raw50 * 50) : (raw50 ?? (rawPrice * 50));
        return formatPrice(total50, 'USD', region);
      }
      if (volumeOption === 'tier_100') {
        const raw100 = targetVariant.cost_tiers?.cost_100 ?? targetVariant.cost_100;
        const total100 = (raw100 != null && raw100 > 0 && raw100 <= rawPrice * 2) ? (raw100 * 100) : (raw100 ?? (rawPrice * 100));
        return formatPrice(total100, 'USD', region);
      }
      return formatPrice(rawPrice, 'USD', region);
    }

    // ── LEGACY SCHEMA FALLBACK ──
    if (!targetVariant?.pricing) {
      console.warn('[PriceDisplay] targetVariant has no .pricing or .unit_price field', targetVariant);
      return 'unavailable';
    }

    const resolved = resolveVariantPrice(targetVariant, { tier, countryCode: region });
    const isKit = volumeOption === 'kit' || volumeOption === 'tier_10';
    const amount = isKit ? resolved.kit : resolved.perUnit;

    // Fallback if kit is selected but not available
    if (amount == null && isKit) {
      return formatPrice(resolved.perUnit, resolved.currency ?? 'USD', region);
    }

    if (amount == null) return 'unavailable';

    return formatPrice(amount, resolved.currency ?? 'USD', region);
  })();

  return (
    <>
      {/* Standardized ProductDetail root container — relies on global with-header-padding in App.jsx */}
      <div className="template-root pd-template-root" style={{
        animation: 'fadeIn 0.5s ease-out',
        overflow: 'visible'
      }}>
        <PeptideDetailStyles />

        <div className="pd-grid">
          {/* Main Column: Product Information */}
          <div className="pd-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div id="overview" className="pd-overview-grid">
              {/* Product Visual Container (Moved from left) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <DynamicProductVisualOverlay
                  product={activeProduct}
                  variant={selectedVariant || productVariants[0]}
                  selectedFormat={selectedFormatId}
                />
                <PeptideTrustBadges
                  presentationClass={presentationClass}
                  product={activeProduct}
                  onOpenCoa={() => setShowPurityModal(true)}
                />
              </div>

          {/* Right Column (Title + Price) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Product Title and Top Actions */}
                <div className="pd-mobile-order-1" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className="badge"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', alignSelf: 'start', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 800, padding: '0.4rem 0.8rem', letterSpacing: '0.05em', fontSize: '0.75rem' }}
                  onClick={() => onSelectCategory(activeProduct.category)}
                >
                  {(activeProduct.category?.toLowerCase() === 'peptides' || activeProduct.category?.toLowerCase() === 'peptide') 
                    ? 'PEPTIDE CATALOG' 
                    : activeProduct.category?.toUpperCase() || 'CATALOG'}
                </span>
              </div>

              <h1 className="pd-title-h1" style={{ fontSize: '2.75rem', margin: '0', display: 'flex', flexDirection: 'column', lineHeight: 1.05, fontFamily: "'Outfit', sans-serif" }}>
                <span style={{ fontWeight: 850, color: 'var(--primary)', letterSpacing: '-0.04em' }}>
                  {activeProduct.canonicalName || activeProduct.baseName || activeProduct.name}
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

              {/* Scientific PubChem Monograph Badges (Regla #11 Copyable / Technical Specs) */}
              {activeProduct.scientificData && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {activeProduct.scientificData.molecularWeight && (
                    <span style={{ background: 'rgba(0, 54, 102, 0.05)', border: '1px solid rgba(0, 54, 102, 0.12)', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      MW: <strong>{activeProduct.scientificData.molecularWeight} g/mol</strong>
                    </span>
                  )}
                  {activeProduct.scientificData.molecularFormula && (
                    <span style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
                      Formula: <strong>{activeProduct.scientificData.molecularFormula}</strong>
                    </span>
                  )}
                  {activeProduct.scientificData.cid && (
                    <span style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                      PubChem CID: <strong>{activeProduct.scientificData.cid}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* 🛡️ FDA & Regulatory Compliance Overview Banner */}
              <FdaRegulatoryBadge product={activeProduct} variant="banner" style={{ marginTop: '0.25rem' }} />

              {/* 🔬 1-Click Bridge: Official Technical Datasheet & HPLC Certificate */}
              <DatasheetTeaserCard product={activeProduct} />



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

              {/* 0. Hybrid Product Presentation Type Selector */}
              {availableProductTypes.length > 1 && (
                <div className="pd-presentation-type-section" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Presentation Category
                    </label>
                    <span style={{ fontSize: '0.7rem', color: '#003666', background: 'rgba(0, 54, 102, 0.08)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      Hybrid Catalog
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${availableProductTypes.length}, 1fr)`, gap: '0.4rem', background: 'var(--bg-subtle, #f1f5f9)', padding: '4px', borderRadius: '10px' }}>
                    {availableProductTypes.map(t => {
                      const cfg = PRESENTATION_TYPE_CONFIG[t] || { label: t, icon: '📦' };
                      const isSelected = selectedProductType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedProductType(t)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.2rem',
                            padding: '0.6rem 0.5rem',
                            borderRadius: '7px',
                            border: isSelected ? '1px solid rgba(0, 54, 102, 0.15)' : '1px solid transparent',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 750 : 550,
                            color: isSelected ? '#003666' : 'var(--text-muted, #64748b)',
                            background: isSelected ? '#ffffff' : 'transparent',
                            boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{cfg.icon}</span>
                          <span style={{ fontSize: '0.82rem', lineHeight: 1.1 }}>{cfg.label}</span>
                          {cfg.sublabel && (
                            <span style={{ fontSize: '0.68rem', color: isSelected ? '#0d9488' : '#94a3b8', fontWeight: 500 }}>
                              {cfg.sublabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1. Supplier Selector */}
              {uniqueSuppliers.length > 0 && (
                <div className="pd-supplier-section" style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Supplier
                  </label>
                  <div className="pd-supplier-toggle" style={{ width: '100%' }}>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '16px'
                      }}
                    >
                      {uniqueSuppliers.map(sup => {
                        let displayLabel = SUPPLIERS[sup];
                        if (!displayLabel) {
                           // Try to find the original name in variants
                           const mVar = productVariants.find(v => v?.supplierId === sup && v?.supplier);
                           if (mVar) {
                             displayLabel = mVar.supplier;
                           } else {
                             displayLabel = sup.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                           }
                        }
                        return (
                          <option key={sup} value={sup}>
                            {displayLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {selectedSupplierId === 'Europeptides' && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0d9488', fontSize: '0.75rem', fontWeight: 600, background: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                      <Truck size={14} />
                      <span>Shipping from the Central Europe warehouse</span>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Format / Presentation Selector */}
              {availableFormatNodes.length > 0 && (
                <div className="pd-format-section" style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Form of Administration
                  </label>
                  <div className="pd-supplier-toggle" style={{ width: '100%' }}>
                    <select
                      value={selectedFormatId || ''}
                      onChange={(e) => {
                        triggerHaptic('light');
                        setSelectedFormatId(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        minHeight: '44px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '16px'
                      }}
                    >
                      {availableFormatNodes.map((format, idx) => (
                        <option key={`valid-${idx}`} value={format.id}>{getHumanFormatName(format.id, format.name)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 3. Strength Selector */}
              {availableStrengthNodes.length > 0 && (
                <div className="pd-strength-body" style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Strength
                  </label>
                  <div className="pd-supplier-toggle" style={{ width: '100%' }}>
                    <select
                      value={selectedStrengthId || ''}
                      onChange={(e) => {
                        const sid = e.target.value;
                        setSelectedStrengthId(sid);
                        const validObj = availableStrengthNodes.find(s => s.id === sid);
                        if (validObj && validObj.firstVariant) {
                          handleVariantChange(validObj.firstVariant);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '16px'
                      }}
                    >
                      {availableStrengthNodes.map((sNode, idx) => (
                        <option key={`valid-${idx}`} value={sNode.id}>
                          {sNode.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Price & Purchase (Conversion Block moved up) */}
            <div id="formats" className="card pd-mobile-order-2 pd-price-card-desktop" style={{ padding: '1.5rem', border: '2px solid var(--primary-light)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {volumeOption === 'kit' || volumeOption === 'tier_10'
                      ? 'Tier ×10 (Total Pack Price)'
                      : volumeOption === 'tier_50'
                      ? 'Tier ×50 (Total Pack Price)'
                      : volumeOption === 'tier_100'
                      ? 'Tier ×100 (Total Pack Price)'
                      : `Unit Price (x1)`} {tier ? `(${tier})` : ''}
                  </span>
                  {(volumeOption === 'kit' || volumeOption === 'tier_10') && <span style={{ color: 'var(--color-secondary, #0096cc)', fontSize: '0.70rem', fontWeight: 800 }}>⭐ RECOMMENDED VOLUME TIER</span>}
                </div>
                {authLoading ? (
                  <span style={{ display: 'inline-block', width: '120px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ) : priceDisplay === 'unavailable' ? (
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', alignSelf: 'center' }}>{tier === 'master' ? 'Not Set (Set Below)' : 'Contact us for pricing'}</span>
                ) : priceDisplay ? (
                  <span style={{ fontWeight: 800, color: (volumeOption === 'kit' || volumeOption === 'tier_10') ? 'var(--color-secondary, #0096cc)' : 'var(--color-primary, #003666)', fontSize: '1.85rem', lineHeight: 1 }}>{priceDisplay}</span>
                ) : (
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', alignSelf: 'center' }}>Select strength to see price</span>
                )}
              </div>
              <p style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted, #64748b)',
                margin: '-0.75rem 0 0.5rem 0',
                lineHeight: 1.4,
                fontWeight: 500,
                borderBottom: '1px solid var(--border, #e2e8f0)',
                paddingBottom: '0.75rem'
              }}>
                Final logistics and tax calculations are applied at checkout.
              </p>

              {(() => {
                const targetVariant = selectedVariant ?? productVariants[0] ?? activeProduct ?? null;
                const pkgName = targetVariant?.sampleType || activeProduct?.packageType || 'Unit';
                
                let showKitToggle = false;
                
                // 1. Canonical Schema Check
                const rawPrice = targetVariant?.unit_price ?? targetVariant?.price ?? targetVariant?.retailPrice ?? targetVariant?.supplierCost ?? targetVariant?.supplierUnitCostUSD ?? targetVariant?.perVialPriceUSD ?? targetVariant?.perUnit;
                if (rawPrice !== undefined && rawPrice !== null && rawPrice > 0) {
                   const formatOrPres = (targetVariant.presentation || targetVariant.format || '').toLowerCase();
                   const hasKitPrice = targetVariant.price_per_kit_10 != null || targetVariant.kitCost != null || targetVariant.supplierKitCostUSD != null || targetVariant.perKitPriceUSD != null || targetVariant.kitPriceUSD != null || (targetVariant.cost_tiers && targetVariant.cost_tiers.cost_10 != null);
                   showKitToggle = hasKitPrice || formatOrPres === 'vial';
                } else {
                   // 2. Legacy Schema Check
                   const resolved = targetVariant?.pricing ? resolveVariantPrice(targetVariant, { tier, countryCode: region }) : {};
                   showKitToggle = resolved.kit != null;
                }

                const hasTier50 = targetVariant?.cost_tiers?.cost_50 != null || targetVariant?.cost_50 != null;
                const hasTier100 = targetVariant?.cost_tiers?.cost_100 != null || targetVariant?.cost_100 != null;
                
                if (showKitToggle) {
                  return (
                    <div style={{ display: 'flex', gap: '0.5rem', opacity: (priceDisplay && priceDisplay !== 'unavailable') ? 1 : 0.5, pointerEvents: (priceDisplay && priceDisplay !== 'unavailable') ? 'auto' : 'none' }}>
                      <div style={{ flex: 1, display: 'flex', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)', overflow: 'hidden', height: '42px' }}>
                        <button type="button" onClick={() => setVolumeOption('unit')} style={{ flex: 1, border: 'none', backgroundColor: volumeOption === 'unit' ? 'var(--color-primary, #003666)' : 'var(--color-bg-app, #f8fafc)', color: volumeOption === 'unit' ? '#ffffff' : 'var(--color-text-main, #0f172a)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>Unit (×1)</button>
                        <button type="button" onClick={() => setVolumeOption('kit')} style={{ flex: 1, border: 'none', backgroundColor: (volumeOption === 'kit' || volumeOption === 'tier_10') ? 'var(--color-secondary, #0096cc)' : 'var(--color-bg-app, #f8fafc)', color: (volumeOption === 'kit' || volumeOption === 'tier_10') ? '#ffffff' : 'var(--color-text-main, #0f172a)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>Tier ×10</button>
                      </div>

                      {(hasTier50 || hasTier100) && (
                        <select
                          value={volumeOption === 'unit' || volumeOption === 'kit' ? '' : volumeOption}
                          onChange={(e) => {
                            if (e.target.value) setVolumeOption(e.target.value);
                          }}
                          style={{
                            height: '42px',
                            padding: '0 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: (volumeOption === 'tier_50' || volumeOption === 'tier_100') ? 'var(--primary-light, #e0e7ff)' : 'white',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="" disabled>More Tiers...</option>
                          {hasTier50 && <option value="tier_50">Tier ×50</option>}
                          {hasTier100 && <option value="tier_100">Tier ×100</option>}
                        </select>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Unified Single AI Assistant Button */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  const targetVar = selectedVariant || productVariants[0] || {};
                  const formatName = selectedFormatId || targetVar.format || 'Vial';
                  const supplierName = selectedSupplierId || targetVar.supplier || 'Supplier';
                  const dosageStr = targetVar.dosage || targetVar.strength || 'Standard';

                  const richPrompt = `Provide a comprehensive clinical overview and guidance for ${activeProduct.name} (${dosageStr} ${formatName} by ${supplierName}). Include mechanism of action, recommended administration protocols, HPLC purity standards, cold-chain storage requirements, and clinical contraindications.`;

                  openProductAI({
                    ...activeProduct,
                    selectedVariant: targetVar,
                    selectedFormat: selectedFormatId,
                    selectedSupplier: selectedSupplierId
                  }, {
                    initialPrompt: richPrompt,
                    autoSend: true,
                    clearHistory: true,
                    displayText: `Clinical AI: ${activeProduct.name}`
                  });
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,92,246,0.18)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.28)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(139, 92, 246, 0.28)',
                  backgroundColor: 'rgba(139, 92, 246, 0.05)',
                  color: '#7c3aed',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.01em',
                }}
              >
                <Sparkles size={16} />
                Ask ClinicalAI about {activeProduct?.name || 'this product'}
              </button>

              <button
                className="btn pd-inline-buy-btn"
                disabled={!priceDisplay || priceDisplay === 'unavailable'}
                onClick={() => {
                  const targetVariant = selectedVariant ?? productVariants[0] ?? activeProduct ?? null;
                  if (!targetVariant) return;
                  
                  let effectiveUnitPrice = null;
                  const isKit = volumeOption === 'kit' || volumeOption === 'tier_10';
                  const isTier50 = volumeOption === 'tier_50';
                  const isTier100 = volumeOption === 'tier_100';

                  if (targetVariant) {
                    const rawPrice = targetVariant.unit_price ?? targetVariant.price ?? targetVariant.retailPrice ?? targetVariant.supplierCost ?? targetVariant.supplierUnitCostUSD ?? targetVariant.perVialPriceUSD ?? targetVariant.perUnit;
                    
                    if (rawPrice !== undefined && rawPrice !== null && rawPrice > 0) {
                      if (isKit) {
                        const kitPrice = targetVariant.price_per_kit_10 ?? targetVariant.kitCost ?? targetVariant.supplierKitCostUSD ?? targetVariant.perKitPriceUSD ?? targetVariant.kitPriceUSD ?? targetVariant.cost_tiers?.cost_10 ?? (rawPrice * 10);
                        effectiveUnitPrice = kitPrice / 10;
                      } else if (isTier50) {
                        const t50Price = targetVariant.cost_tiers?.cost_50 ?? targetVariant.cost_50 ?? (rawPrice * 50);
                        effectiveUnitPrice = t50Price / 50;
                      } else if (isTier100) {
                        const t100Price = targetVariant.cost_tiers?.cost_100 ?? targetVariant.cost_100 ?? (rawPrice * 100);
                        effectiveUnitPrice = t100Price / 100;
                      } else {
                        effectiveUnitPrice = rawPrice;
                      }
                    } else if (targetVariant?.pricing) {
                      const resolved = resolveVariantPrice(targetVariant, { tier, countryCode: region });
                      if (isKit) {
                        effectiveUnitPrice = resolved.kit != null ? (resolved.kit / 10) : resolved.perUnit;
                      } else {
                        effectiveUnitPrice = resolved.perUnit;
                      }
                    }
                  }

                  const target = targetVariant
                    ? { ...targetVariant, productId: activeProduct.id, variantId: targetVariant.id || targetVariant.variantId, name: activeProduct.name, price: effectiveUnitPrice }
                    : { ...activeProduct, productId: activeProduct.id, variantId: activeProduct.id, price: effectiveUnitPrice };

                  trackPurchaseIntent({
                    peptide_name: activeProduct.name,
                    protocol_id: null
                  });

                  const addQty = isKit ? 10 : (isTier50 ? 50 : (isTier100 ? 100 : 1));
                  onAddToCart(target, addQty);
                  setAddedRecently(true);
                  setTimeout(() => setAddedRecently(false), 1600);
                  window.dispatchEvent(new CustomEvent('open-cart'));
                }}
                style={{ 
                  width: '100%', 
                  gap: '0.75rem', 
                  backgroundColor: addedRecently ? '#16a34a' : ((priceDisplay && priceDisplay !== 'unavailable') ? ((volumeOption === 'kit' || volumeOption === 'tier_10') ? 'var(--color-secondary, #0096cc)' : 'var(--color-primary, #003666)') : 'var(--color-border, #e2e8f0)'), 
                  color: (priceDisplay && priceDisplay !== 'unavailable') ? '#ffffff' : 'var(--text-muted, #94a3b8)', 
                  padding: '1rem', 
                  fontSize: '1rem', 
                  fontWeight: 800, 
                  cursor: (priceDisplay && priceDisplay !== 'unavailable') ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {addedRecently ? (
                  <>
                    <Check size={18} strokeWidth={3} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <Plus size={18} /> {currentQty > 0 ? `Add More (${currentQty})` : `Add to Cart`}
                  </>
                )}
              </button>
                {/* AI Copilot button */}
                {/* Cold Chain & Quality Trust Card (Canonical Schema Driven) */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                  border: '1px solid #dbeafe',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e40af', fontSize: '0.78rem', fontWeight: 800 }}>
                      <Snowflake size={14} color="#2563eb" />
                      <span>Guaranteed Cold Chain</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '10px' }}>
                      2°C - 8°C · 24-48h Delivery
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#334155' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={13} color="#16a34a" /> HPLC Verified Purity (&gt;99%)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPurityModal(true)}
                      style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      View CoA ➔
                    </button>
                  </div>
                </div>

                {/* Cross-Integration: Medical Supervision On-Ramp */}
                <MedicalSupervisionBanner itemName={activeProduct?.name} itemType="peptide" style={{ margin: '0.5rem 0 0.75rem' }} />

            </div>
            </div> {/* Close Right Column */}
            </div> {/* Close #overview */}

            {/* Reconstitution & Dosage Calculators (Full Width) */}
            <div className="pd-mobile-order-2" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {isPeptide && presentationClass === 'vial' && (
                <WidgetErrorBoundary fallbackMessage="Unable to load dosing calculator.">
                  <ReconstitutionCalculator
                    product={activeProduct}
                    variant={selectedVariant || productVariants[0]}
                  />
                </WidgetErrorBoundary>
              )}
              {presentationClass === 'pen' && (
                <PenDosingGuide product={activeProduct} selectedVariant={selectedVariant} />
              )}
              {presentationClass === 'spray' && (
                <SprayDosingGuide product={activeProduct} selectedVariant={selectedVariant} />
              )}
              {presentationClass === 'oral' && (
                <OralDosingGuide product={activeProduct} selectedVariant={selectedVariant} />
              )}
              
              {/* Smart Dosing Insight — only renders when pharmacokinetics.half_life exists */}
              <SmartDosageGuide product={activeProduct} selectedVariant={selectedVariant} />
            </div>



            <div className="pd-mobile-order-5" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* ── ADMIN ONLY: Pricing & Cost Tiers Table ── */}
              {isAdmin && (() => {
                const targetVariant = selectedVariant ?? productVariants[0] ?? activeProduct ?? null;
                const unitPrice = Number(targetVariant?.unit_price || targetVariant?.price || targetVariant?.retailPrice || 0);
                const costTiers = targetVariant?.cost_tiers || {};
                const cost10 = Number(costTiers.cost_10 || 0);
                const cost20 = Number(costTiers.cost_20 || 0);
                const cost50 = Number(costTiers.cost_50 || 0);
                const cost100 = Number(costTiers.cost_100 || 0);

                return (
                  <div style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {/* Table Header */}
                    <div style={{
                      background: 'rgba(0,0,0,0.02)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <Lock size={12} color="var(--primary)" />
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Admin — Variant Pricing & Cost Tiers
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {selectedVariant?.label || selectedVariant?.name || 'Selected Variant'}
                      </span>
                    </div>

                    {/* Column Headers */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr',
                      padding: '0.5rem 1rem',
                      background: 'rgba(0,0,0,0.01)',
                      borderBottom: '1px solid var(--border-light)',
                      gap: '0.2rem',
                    }}>
                      {['Unit Price', 'Cost (10x)', 'Cost (20x)', 'Cost (50x)', 'Cost (100x)'].map(h => (
                        <span key={h} style={{ fontSize: '0.52rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                      ))}
                    </div>

                    {/* Editor Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr',
                      padding: '0.8rem 1rem',
                      background: 'white',
                      gap: '0.2rem',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                        <InlineEditableCell
                          value={unitPrice}
                          type="number"
                          format={(v) => (v ? `$${v}` : '-')}
                          onSave={async (newVal) => {
                            const numeric = parseFloat(newVal) || 0;
                            if (numeric !== unitPrice) {
                              const result = await updateVariantPriceAction({
                                productId: activeProduct.id,
                                variantId: targetVariant.id,
                                fieldPath: 'unit_price',
                                newValue: numeric,
                                oldValue: unitPrice
                              });
                              if (result.success) toast.success('Unit Price updated');
                              else toast.error('Failed to update price');
                            }
                          }}
                        />
                      </span>
                      {[
                        { key: 'cost_10', val: cost10 },
                        { key: 'cost_20', val: cost20 },
                        { key: 'cost_50', val: cost50 },
                        { key: 'cost_100', val: cost100 }
                      ].map(tier => (
                        <span key={tier.key} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                          <InlineEditableCell
                            value={tier.val}
                            type="number"
                            format={(v) => (v ? `$${v}` : '-')}
                            onSave={async (newVal) => {
                              const numeric = parseFloat(newVal) || 0;
                              if (numeric !== tier.val) {
                                const result = await updateVariantPriceAction({
                                  productId: activeProduct.id,
                                  variantId: targetVariant.id,
                                  fieldPath: `cost_tiers.${tier.key}`,
                                  newValue: numeric,
                                  oldValue: tier.val
                                });
                                if (result.success) toast.success(`Cost Tier ${tier.key} updated`);
                                else toast.error('Failed to update cost tier');
                              }
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {/* 2. Scientific Facts (Grid — dynamic clinical data) */}
              {(() => {
                const storageDry = activeProduct.storage_conditions?.dry || 'Store at -20°C (Freezer) or Room Temp (short term)';
                const storageLiq = activeProduct.storage_conditions?.reconstituted || 'Refrigerate (2-8°C)';
                const isLiquid = presentationClass === 'pen' || presentationClass === 'spray' || presentationClass === 'topical';
                const isOral = presentationClass === 'oral';
                const rawMw = activeProduct.molecularWeight || activeProduct.molecular_weight;
                const mw = rawMw ? (String(rawMw).includes('Da') ? rawMw : `${rawMw} Da`) : null;
                const formula = activeProduct.molecularFormula || activeProduct.molecular_formula || null;

                const baseSpecs = [
                  { label: 'Analytical Purity', value: '≥ 99%', icon: <Target size={14} color="var(--primary)" /> },
                  { label: 'Verification', value: 'HPLC & MS Verified', icon: <ShieldCheck size={14} color="var(--primary)" /> },
                  ...(!isLiquid && !isOral && storageDry ? [{ label: 'Storage (Dry)', value: storageDry, icon: <Snowflake size={14} color="var(--primary)" /> }] : []),
                  ...(isOral ? [{ label: 'Storage', value: 'Store in a cool, dry place', icon: <Archive size={14} color="var(--primary)" /> }] : []),
                  ...(!isOral && storageLiq ? [{ label: isLiquid ? 'Storage' : 'Storage (Reconstituted)', value: storageLiq, icon: <Thermometer size={14} color="var(--primary)" /> }] : [])
                ];
                
                const extraSpecs = [
                  ...(mw ? [{ label: 'Molecular Weight', value: mw, icon: <Beaker size={14} /> }] : []),
                  ...(formula ? [{ label: 'Molecular Formula', value: formula, icon: <FlaskConical size={14} /> }] : []),
                ];
                const allSpecs = [...baseSpecs, ...extraSpecs];
                
                const factsContent = (
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
                
                if (isAdmin && isQuickView) {
                  return (
                    <details className="pd-accordion">
                      <summary>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FlaskConical size={16} />
                          <span>Scientific Facts & Storage</span>
                        </div>
                      </summary>
                      <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        {factsContent}
                      </div>
                    </details>
                  );
                }
                return factsContent;
              })()}

              {/* 3. Institutional Quality & Traceability Hub */}
              <ProductTraceabilityCard product={activeProduct} />

              {/* 4. Clinical Evidence Hub & Research AI */}
              <PeptideClinicalEvidence
                product={activeProduct}
                isMobile={isMobile}
                isPeptide={isPeptide}
                presentationClass={presentationClass}
                onOpenPubMed={() => setShowPubMedPanel(true)}
              />

              {/* 5. Structural & Scientific Accordions */}
              <PeptideResearchAccordions
                product={activeProduct}
                presentationClass={presentationClass}
              />

              {/* Procedural HPLC Chromatogram & Analytical Sequence Matrix — Peptide Only */}
              {isPeptide && (
                <ProceduralPeptideAnalysis
                  product={activeProduct}
                  variant={selectedVariant || productVariants[0]}
                />
              )}

              {/* Compliance Card */}
              <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '12px', backgroundColor: 'rgba(248, 250, 252, 0.5)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <ShieldCheck size={20} color="var(--secondary)" />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Supplied exclusively for in-vitro research. Acquisition requires institutional affiliation.
                </p>
              </div>
            </div>{/* /pd-mobile-order-5 */}
          </div>{/* /pd-info-col */}

        </div>{/* /pd-grid */}
        {/* Purity & Testing Methods Modal */}

        {/* Institutional Certificate of Analysis (COA) Modal */}
        <CoaModal
          product={activeProduct}
          variant={selectedVariant || productVariants[0]}
          isOpen={showPurityModal}
          onClose={() => setShowPurityModal(false)}
        />
      </div>

      {/* ── Related Sections Group ────────────────────────────────────── */}
      {!isQuickView && relatedProtocols && relatedProtocols.length > 0 && (
        <div className="pdp-discovery-group">
          <style dangerouslySetInnerHTML={{ __html: `
            .pdp-discovery-group {
              background: #f8fafc;
              border-top: 1px solid var(--border);
              padding: 2rem 0;
              display: flex;
              flex-direction: column;
              gap: 2rem;
            }
            @media (max-width: 768px) {
              .pdp-discovery-group {
                padding: 1.5rem 0;
                gap: 1.5rem;
              }
            }
          ` }} />

          {/* 2. Used in Protocols */}
          <div id="protocols">
            <ProductProtocolsSection
              protocols={relatedProtocols}
              peptideName={activeProduct.name}
            />
          </div>
        </div>
      )}

      {/* ── Algolia Recommend: AI Synergistic Peptides Carousel ─────────────── */}
      {!isQuickView && (
        <div style={{ padding: '2.5rem 0', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <RelatedProductsCarousel
              productId={activeProduct.objectID || activeProduct.id || ''}
              productObjectID={activeProduct.objectID || activeProduct.id || ''}
              productName={activeProduct.name || activeProduct.canonicalName || ''}
              category={activeProduct.category || activeProduct.categoryId || ''}
              goals={activeProduct.goals || []}
              maxItems={6}
            />
          </div>
        </div>
      )}

      {/* ── Discovery: FAQ on PDP ──────────────────────────────────────── */}
      {!isQuickView && combinedFaqs.length > 0 && (
        <div id="faqs" style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          <div className="container" style={{ maxWidth: '880px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>FAQ & Discovery</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', marginTop: 0, fontWeight: 800 }}>Frequently Asked Questions</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
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

      {/* ── Mobile Sticky Buy Bar ────────────────────────────────────────── */}
      {isMobile && showStickyBar && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(68px + env(safe-area-inset-bottom, 8px))',
          left: '12px',
          right: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '0.84rem',
              fontWeight: 800,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {activeProduct?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
                {priceDisplay || '$15.00'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                • {selectedVariant?.dosage || productVariants[0]?.dosage || activeProduct?.dosage || 'Standard'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const targetVariant = selectedVariant ?? productVariants[0] ?? activeProduct ?? null;
              if (!targetVariant) return;
              
              let effectiveUnitPrice = null;
              const isKit = volumeOption === 'kit' || volumeOption === 'tier_10';
              const isTier50 = volumeOption === 'tier_50';
              const isTier100 = volumeOption === 'tier_100';

              if (targetVariant) {
                const rawPrice = targetVariant.unit_price ?? targetVariant.price ?? targetVariant.retailPrice ?? targetVariant.supplierCost ?? targetVariant.supplierUnitCostUSD ?? targetVariant.perVialPriceUSD ?? targetVariant.perUnit;
                
                if (rawPrice !== undefined && rawPrice !== null && rawPrice > 0) {
                  if (isKit) {
                    const kitPrice = targetVariant.price_per_kit_10 ?? targetVariant.kitCost ?? targetVariant.supplierKitCostUSD ?? targetVariant.perKitPriceUSD ?? targetVariant.kitPriceUSD ?? targetVariant.cost_tiers?.cost_10 ?? (rawPrice * 10);
                    effectiveUnitPrice = kitPrice / 10;
                  } else if (isTier50) {
                    const t50Price = targetVariant.cost_tiers?.cost_50 ?? targetVariant.cost_50 ?? (rawPrice * 50);
                    effectiveUnitPrice = t50Price / 50;
                  } else if (isTier100) {
                    const t100Price = targetVariant.cost_tiers?.cost_100 ?? targetVariant.cost_100 ?? (rawPrice * 100);
                    effectiveUnitPrice = t100Price / 100;
                  } else {
                    effectiveUnitPrice = rawPrice;
                  }
                } else if (targetVariant?.pricing) {
                  const resolved = resolveVariantPrice(targetVariant, { tier, countryCode: region });
                  if (isKit) {
                    effectiveUnitPrice = resolved.kit != null ? (resolved.kit / 10) : resolved.perUnit;
                  } else {
                    effectiveUnitPrice = resolved.perUnit;
                  }
                }
              }

              const target = targetVariant
                ? { ...targetVariant, productId: activeProduct.id, variantId: targetVariant.id || targetVariant.variantId, name: activeProduct.name, price: effectiveUnitPrice }
                : { ...activeProduct, productId: activeProduct.id, variantId: activeProduct.id, price: effectiveUnitPrice };

              trackPurchaseIntent({
                peptide_name: activeProduct.name,
                protocol_id: null
              });

              const addQty = isKit ? 10 : (isTier50 ? 50 : (isTier100 ? 100 : 1));
              onAddToCart(target, addQty);
              setAddedRecently(true);
              setTimeout(() => setAddedRecently(false), 1600);
              window.dispatchEvent(new CustomEvent('open-cart'));
            }}
            disabled={!priceDisplay || priceDisplay === 'unavailable'}
            style={{
              backgroundColor: addedRecently ? '#16a34a' : ((volumeOption === 'kit' || volumeOption === 'tier_10') ? 'var(--color-secondary, #0096cc)' : 'var(--color-primary, #003666)'),
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.1rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {addedRecently ? (
              <>
                <Check size={16} strokeWidth={3} /> Added!
              </>
            ) : (
              <>
                <Plus size={16} strokeWidth={2.5} /> Add to Cart
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
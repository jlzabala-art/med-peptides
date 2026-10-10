"use client";

import './PublicDatasheetView.css';
import './InteractiveReconstitutionGuide.css';
import './PeptideAnalyticalSpecsCard.css';
import React, { useState, useEffect, useTransition, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
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
  ArrowRight,
  ArrowUpRight,
  Info,
  Box,
  QrCode,
  ExternalLink,
  Building2,
  Tag,
  Eye,
  Loader2,
  Droplets,
  Printer,
  HelpCircle,
  ZoomIn,
  Beaker,
  Microscope,
  ClipboardList,
  ChevronDown,
  Clock,
  Dna
} from '@/lib/icons';
import ImageModal from '@/snippets/ImageModal';
import { 
  SUPPORTED_LANGUAGES, 
  getTranslations, 
  getLocalizedField,
  getLocalizedCategory,
  getLocalizedTargetSystem
} from '../../utils/productTranslations';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import ProductTraceabilityCard from './ProductTraceabilityCard';
import InteractiveReconstitutionGuide from './InteractiveReconstitutionGuide';
import SolventTechnicalSpecs from './SolventTechnicalSpecs';
import CosmeticTechnicalSpecs from './CosmeticTechnicalSpecs';
import SupplementTechnicalSpecs from './SupplementTechnicalSpecs';
import HairProtocolsSidebarWidget from './HairProtocolsSidebarWidget';
import DiagnosticTestTechnicalSpecs from './DiagnosticTestTechnicalSpecs';
import BloodoRelatedPeptidesSection from './BloodoRelatedPeptidesSection';
import BloodoNadFaqCard from './BloodoNadFaqCard';
import BloodoSuiteNav, { isBloodoProduct } from './BloodoSuiteNav';
import BloodoClinicalAdvantageCard from './BloodoClinicalAdvantageCard';
import EternaGeneticTechnicalSpecs from './EternaGeneticTechnicalSpecs';
import IvDripTechnicalSpecs from './IvDripTechnicalSpecs';
import FdaRegulatoryBadge from './FdaRegulatoryBadge';
import { FDA_APPROVED_PEPTIDES_NETWORK } from '@/data/fdaPeptidesRegistry';
import PeptidePublicationsSection from './PeptidePublicationsSection';
import PeptideContraindicationsSection from './PeptideContraindicationsSection';
import UaeCompanySetupTechnicalSpecs from './UaeCompanySetupTechnicalSpecs';
import SpainCompanyResidencyTechnicalSpecs from './SpainCompanyResidencyTechnicalSpecs';
import CompoundingServicesTechnicalSpecs from './CompoundingServicesTechnicalSpecs';
import PeptideSupplyManagementTechnicalSpecs from './PeptideSupplyManagementTechnicalSpecs';
import PeptideAnalyticalSpecsCard from './PeptideAnalyticalSpecsCard';
import ProductRegulatoryWarningsSection from './ProductRegulatoryWarningsSection';
import CoaModal from './CoaModal';
import ShareProductMonographDrawer from '../admin/catalog/drawers/ShareProductMonographDrawer';
import MonographPreviewModal from './MonographPreviewModal';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import CorporateResidencyInquiryDrawer from '@/components/portal/CorporateResidencyInquiryDrawer';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicPageHero from '@/components/shared/public/PublicPageHero';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';
import ProductDetailSidebar from './ProductDetailSidebar';
import EternaPublicOverviewShowcase from './EternaPublicOverviewShowcase';
import SupplementPublicOverviewShowcase from './SupplementPublicOverviewShowcase';
import ProductOverviewQuickNav from './ProductOverviewQuickNav';
import ProductSectionHeaderBanner from './ProductSectionHeaderBanner';
import ProductSectionFooterNav from './ProductSectionFooterNav';
import PresentationsMatrixSection from './datasheet/sections/PresentationsMatrixSection';
import ReconstitutionRouterSection from './datasheet/sections/ReconstitutionRouterSection';
import PeptideMonographWorkspace from './monograph/PeptideMonographWorkspace';
import { Mail, Lock } from 'lucide-react';
import { generateDiscreetBatchCode } from '../../utils/discreetBatchHelper';
import { prefetchPdf } from '../../utils/pdfPrefetch';
import { getHumanFormatName } from '../../utils/productVariantProcessing';
import { PUBLIC_APP_VERSION, getPublicVersionInfo } from '../../config/publicVersionConfig';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatCommercialSupplierName } from '@/utils/supplierCommercialNames';

export default function PublicDatasheetView({ 
  product, 
  slug, 
  baseUrl,
  initialSupplierFilter = null,
  initialFormat = null,
  initialStrength = null,
  initialLang = null,
  initialBatch = null,
  initialPhase = null,
  associatedProtocols = []
}) {
  const [lang, setLang] = useState(() => {
    if (initialLang && SUPPORTED_LANGUAGES.some(l => l.code === initialLang)) {
      return initialLang;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang');
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        return stored;
      }
    }
    return 'en';
  });
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewModalTab, setPreviewModalTab] = useState('monograph');
  const [isCoaModalOpen, setIsCoaModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inlineSvg, setInlineSvg] = useState(null);
  const [svgError, setSvgError] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedLabelType, setCopiedLabelType] = useState(null);
  const [downloadingType, setDownloadingType] = useState(null);

  // Active section management (Single-section display rule)
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) return hash;
    }
    return 'overview';
  });

  const handleSelectSection = useCallback((targetId) => {
    if (!targetId) return;
    setActiveSection(targetId);
    if (typeof window !== 'undefined') {
      if (window.history?.replaceState) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setActiveSection(hash);
      } else {
        setActiveSection('overview');
      }
    };

    if (window.location.hash) {
      const initialHash = window.location.hash.replace('#', '').trim();
      if (initialHash) setActiveSection(initialHash);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { user } = useAuth();
  const router = useRouter();

  const handleOpenInquiry = () => {
    if (!user) {
      triggerHaptic('warning');
      toast.error(lang === 'es' ? 'Debes iniciar sesión para consultar o solicitar cotizaciones.' : 'Please sign in to request a quotation.');
      const redirectUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setIsInquiryDrawerOpen(true);
  };

  const handleDownloadClick = (typeKey) => {
    setDownloadingType(typeKey);
    triggerHaptic('light');
    toast.success(lang === 'es' ? 'Preparando descarga del PDF...' : 'Preparing PDF download...');
    setTimeout(() => {
      setDownloadingType(null);
    }, 4000);
  };
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const requestedLangs = useRef(new Set());

  const primaryProtocol = useMemo(() => {
    if (!Array.isArray(associatedProtocols) || associatedProtocols.length === 0) return null;
    return associatedProtocols.find(p => p.isPrimary) || associatedProtocols[0];
  }, [associatedProtocols]);

  const secondaryProtocols = useMemo(() => {
    if (!Array.isArray(associatedProtocols) || associatedProtocols.length <= 1) return [];
    const primId = primaryProtocol?.id || primaryProtocol?.slug;
    return associatedProtocols.filter(p => (p.id || p.slug) !== primId);
  }, [associatedProtocols, primaryProtocol]);

  const isSpainResidency = useMemo(() => {
    const slugLower = String(slug || product?.slug || product?.id || '').toLowerCase();
    const nameLower = String(product?.canonicalName || product?.name || '').toLowerCase();
    return slugLower.includes('spain-company') || slugLower.includes('spain-residency') || nameLower.includes('spanish corporate');
  }, [slug, product]);

  const isUaeCorporateService = useMemo(() => {
    const slugLower = String(slug || product?.slug || product?.id || '').toLowerCase();
    const nameLower = String(product?.canonicalName || product?.name || '').toLowerCase();
    return slugLower.includes('uae-company') || slugLower.includes('company-setup') || nameLower.includes('uae company setup');
  }, [slug, product]);

  const isCompoundingService = useMemo(() => {
    const slugLower = String(slug || product?.slug || product?.id || '').toLowerCase();
    const nameLower = String(product?.canonicalName || product?.name || '').toLowerCase();
    return slugLower.includes('compounding') || slugLower.includes('farmaceutico') || nameLower.includes('compounding');
  }, [slug, product]);

  const isPeptideSupplyService = useMemo(() => {
    const slugLower = String(slug || product?.slug || product?.id || '').toLowerCase();
    const nameLower = String(product?.canonicalName || product?.name || '').toLowerCase();
    return slugLower.includes('peptide-supply') || slugLower.includes('suministro-peptidos') || nameLower.includes('peptide supply') || nameLower.includes('suministro');
  }, [slug, product]);

  const isCorporateService = useMemo(() => {
    return isSpainResidency || isUaeCorporateService || isCompoundingService || isPeptideSupplyService || product?.isCorporateService === true || product?.category === 'corporate_services' || product?.type === 'service';
  }, [isSpainResidency, isUaeCorporateService, isCompoundingService, isPeptideSupplyService, product]);



  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(
        window.innerWidth <= 768 ||
        /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopyLabelUrl = async (type) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=${type}${labelQueryString}`;
    let success = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        success = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, trying fallback:', err);
      }
    }
    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    }
    if (success) {
      setCopiedLabelType(type);
      triggerHaptic('success');
      toast.success(type === 'shipping' ? 'Shipping label link copied ✓' : 'Clinical label link copied ✓');
      setTimeout(() => setCopiedLabelType(null), 2500);
    } else {
      toast.error('Could not copy link to clipboard');
    }
  };

  const [copiedMonograph, setCopiedMonograph] = useState(false);

  // Resolve commercial brand names (FDA Approved reference products)
  const resolvedCommercialNames = useMemo(() => {
    if (Array.isArray(product?.commercialNames) && product.commercialNames.length > 0) {
      return product.commercialNames;
    }
    if (typeof product?.commercialNames === 'string' && product.commercialNames.trim()) {
      return [product.commercialNames.trim()];
    }
    if (Array.isArray(product?.commercialProducts) && product.commercialProducts.length > 0) {
      return product.commercialProducts.map(cp => cp.brandName || cp.name).filter(Boolean);
    }
    const targetSlug = (slug || product?.slug || product?.id || '').toLowerCase().trim();
    const netItem = FDA_APPROVED_PEPTIDES_NETWORK.find(p => 
      p.slug === targetSlug || 
      (p.aliases && p.aliases.includes(targetSlug)) ||
      (product?.name && p.name.toLowerCase().includes(product.name.toLowerCase()))
    );
    if (netItem?.brandNames) {
      return netItem.brandNames.split('/').map(s => s.trim());
    }
    return [];
  }, [product, slug]);

  const resolvedCommercialProducts = useMemo(() => {
    if (Array.isArray(product?.commercialProducts) && product.commercialProducts.length > 0) {
      return product.commercialProducts;
    }
    return [];
  }, [product]);

  // Sync language with URL param, initialLang param, or localStorage preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && SUPPORTED_LANGUAGES.some(l => l.code === urlLang)) {
        setLang(urlLang);
        return;
      }
      if (initialLang && SUPPORTED_LANGUAGES.some(l => l.code === initialLang)) {
        setLang(initialLang);
        localStorage.setItem('atlas_portal_lang', initialLang);
        return;
      }
      const stored = localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang');
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        setLang(stored);
      }

      const handleGlobalLang = (e) => {
        if (e.detail && SUPPORTED_LANGUAGES.some(l => l.code === e.detail)) {
          setLang(e.detail);
        }
      };
      window.addEventListener('atlas_lang_change', handleGlobalLang);
      return () => window.removeEventListener('atlas_lang_change', handleGlobalLang);
    }
  }, [initialLang]);

  const t = getTranslations(lang);
  const targetId = product?.id || slug;
  const pdfUrl = `/api/product-sheet/${encodeURIComponent(targetId)}?format=vial`;

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

  const isSolventProduct = useMemo(() => {
    const slug = (product?.slug || product?.id || '').toLowerCase();
    const cat = (product?.category || '').toLowerCase();
    const pt = (product?.productType || '').toLowerCase();
    const pName = (product?.name || product?.title || '').toLowerCase();
    return Boolean(
      product?.isSolvent || 
      cat === 'solvent' || 
      pt === 'solvent' || 
      slug === 'bac-water' || 
      slug === 'purified-water' || 
      slug.includes('bacteriostatic') || 
      pName.includes('bacteriostatic water')
    );
  }, [product]);

  const isDiagnosticKit = useMemo(() => {
    const slug = (product?.slug || product?.id || '').toLowerCase();
    const cat = (product?.category || '').toLowerCase();
    const pt = (product?.productType || '').toLowerCase();
    const pName = (product?.name || product?.title || '').toLowerCase();
    const pres = (product?.presentation || '').toLowerCase();
    const fmt = (product?.format || '').toLowerCase();
    const supp = (product?.supplierId || '').toLowerCase();
    return Boolean(
      cat === 'genomics_biomarkers' || 
      cat === 'diagnostic_tests' ||
      cat === 'tests' ||
      pres === 'blood_test' || 
      pres === 'home_test_kit' ||
      fmt === 'blood_test' || 
      supp === 'supplier-bloodo' ||
      slug.includes('bloodo') ||
      slug.endsWith('-test') ||
      pName.includes('test kit') ||
      pName.includes('level test')
    );
  }, [product]);

  const isBloodoDiagnostic = useMemo(() => {
    return isBloodoProduct(product, slug);
  }, [product, slug]);

  const isEternaDiagnostic = useMemo(() => {
    const sId = (product?.supplierId || '').toLowerCase();
    const sName = (product?.supplierName || '').toLowerCase();
    const pSlug = (product?.slug || product?.id || slug || '').toLowerCase();
    const pName = (product?.name || product?.canonicalName || '').toLowerCase();
    const sample = (product?.sampleType || '').toLowerCase();
    return sId === 'supplier-eternadx' || sName.includes('eterna') || pSlug.includes('eterna') || pName.includes('eterna') || sample.includes('saliva');
  }, [product, slug]);

  const isIvDrip = useMemo(() => {
    const pSlug = (product?.slug || product?.id || slug || '').toLowerCase();
    const cat = (product?.category || product?.categoryId || '').toLowerCase();
    const pt = (product?.product_type || product?.productType || '').toLowerCase();
    const pName = (product?.name || product?.title || '').toLowerCase();
    const pres = (product?.presentation || '').toLowerCase();
    return Boolean(
      cat === 'iv_drips' || 
      cat === 'iv_therapy' ||
      pt === 'iv_drip' || 
      pres === 'iv_drip' || 
      pres === 'infusion_bag' ||
      pSlug.includes('iv-drip') || 
      pSlug.includes('drip-plus') || 
      pName.includes('iv drip') ||
      (Array.isArray(product?.ingredients) && product.ingredients.length > 0 && pSlug.includes('drip'))
    );
  }, [product, slug]);

  const isCosmeticProduct = useMemo(() => {
    const pSlug = (product?.slug || product?.id || slug || '').toLowerCase();
    const cat = (product?.category || product?.therapeutic_category || '').toLowerCase();
    const pt = (product?.productType || product?.product_type || product?.type || '').toLowerCase();
    const pName = (product?.name || product?.title || product?.canonicalName || '').toLowerCase();
    const brand = (product?.brand || product?.supplier || '').toLowerCase();
    return Boolean(
      product?.is_cosmetic ||
      cat === 'cosmetics' ||
      cat === 'hair cosmetics' ||
      cat === 'cosmeceutical' ||
      cat === 'scalp cosmetics' ||
      cat.includes('cosmetic') ||
      pt === 'cosmetic' ||
      pt === 'cosmetics' ||
      brand.includes('colway') ||
      pSlug.includes('colway') ||
      pName.includes('colway') ||
      pSlug.includes('strengthening-shampoo') ||
      pSlug.includes('strengthening-conditioner')
    );
  }, [product, slug]);

  const isSupplementProduct = useMemo(() => {
    const pSlug = (product?.slug || product?.id || slug || '').toLowerCase();
    const cat = (product?.category || product?.therapeutic_category || '').toLowerCase();
    const pt = (product?.productType || product?.product_type || product?.type || '').toLowerCase();
    const pName = (product?.name || product?.title || product?.canonicalName || '').toLowerCase();
    const pres = (product?.presentation || '').toLowerCase();
    const fmt = (product?.format || '').toLowerCase();
    const brand = (product?.brand || product?.supplier || '').toLowerCase();
    return Boolean(
      product?.is_supplement ||
      product?.isSupplement ||
      cat === 'supplements' ||
      cat === 'oral_supplements' ||
      cat === 'clinical_supplements' ||
      cat.includes('supplement') ||
      pt === 'supplement' ||
      pt === 'oral_supplement' ||
      pSlug.includes('ultraperson') ||
      pName.includes('ultraperson') ||
      brand.includes('ultraperson') ||
      pres.includes('caps') ||
      pres.includes('bottle_(') ||
      fmt === 'capsules'
    );
  }, [product, slug]);

  const isPeptideCompound = useMemo(() => {
    return !isCorporateService && !isDiagnosticKit && !isCosmeticProduct && !isSolventProduct && !isSupplementProduct;
  }, [isCorporateService, isDiagnosticKit, isCosmeticProduct, isSolventProduct, isSupplementProduct]);

  const name = product?.name || product?.displayName || (isSolventProduct ? 'Bacteriostatic Water (BAC)' : (isEternaDiagnostic ? (product?.name || 'ETERNA™ Saliva DNA & Epigenetics') : (isDiagnosticKit ? 'Bloodo™ Clinical Diagnostic Test' : (isIvDrip ? (product?.title || 'Master IV Drip Formulation') : (isCosmeticProduct ? (product?.canonicalName || 'Colway Cosmeceutical Formulation') : (isSupplementProduct ? (product?.name || 'UltraPerson Clinical Supplement') : 'Clinical Peptide'))))));
  const category = isCosmeticProduct
    ? (lang === 'es' ? 'Cosmecéutica y Cuidado Capilar' : 'Hair & Scalp Cosmeceuticals')
    : isSolventProduct 
    ? (lang === 'es' ? 'Solvente y Diluyente Estéril' : 'Sterile Reconstitution Solvent')
    : isDiagnosticKit
    ? (lang === 'es' ? 'Diagnóstico Clínico y Biomarcadores' : 'Clinical Diagnostics & Biomarkers')
    : isIvDrip
    ? (lang === 'es' ? 'Terapia Intravenosa y Nutrición Parenteral' : 'Sterile IV Infusion & Micronutrient Formulation')
    : isSupplementProduct
    ? (lang === 'es' ? 'Suplementación Clínica Avanzada' : 'Advanced Clinical Supplementation')
    : getLocalizedCategory(product?.category || product?.therapeutic_category || 'Peptide', lang);
  const casNumber = isCosmeticProduct
    ? (lang === 'es' ? 'Reglamento Cosmético UE 1223/2009' : 'EU Cosmetics Reg. 1223/2009 (CPNP)')
    : isSolventProduct 
    ? '100-51-6 (Benzyl Alcohol USP)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Directiva CE-IVDR (UE 2017/746)' : 'CE-IVDR Directive (EU 2017/746)')
    : isIvDrip
    ? 'USP <797> Compounded Parenteral'
    : isSupplementProduct
    ? (lang === 'es' ? 'Directiva UE 2002/46/CE · Sin Fármacos' : 'EU Directive 2002/46/EC · Drug-Free')
    : (product?.casNumber || product?.cas || 'Documented on Monograph');
  const formula = isCosmeticProduct
    ? (lang === 'es' ? `Complejo Bioactivo (${product?.ingredients?.length || '15+'} Activos INCI)` : `Bioactive Multi-Complex (${product?.ingredients?.length || '15+'} INCI Actives)`)
    : isSolventProduct 
    ? 'H₂O + C₇H₈O (0.9%)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Matriz: Sangre Capilar Seca (DBS)' : 'Matrix: Dried Blood Spot (DBS)')
    : isIvDrip
    ? `${product?.ingredients?.length || 12} Active Compounds (${product?.volume_ml || 50} mL)`
    : isSupplementProduct
    ? (lang === 'es' ? `Fórmula Multi-Activa (${product?.ingredients?.length || '6+'} Activos Clave)` : `Multi-Active Matrix (${product?.ingredients?.length || '6+'} Key Actives)`)
    : (product?.molecularFormula || product?.molecular_formula || product?.molecular?.molecularFormula || product?.molecular?.formula || null);
  const mw = isCosmeticProduct
    ? (lang === 'es' ? 'Formulación Tópica: pH 4.5–5.5' : 'Topical Cosmeceutical: pH 4.5–5.5')
    : isSolventProduct 
    ? '18.02 g/mol (H₂O)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Laboratorio Central: LifeLab1' : 'Central Laboratory: LifeLab1')
    : isIvDrip
    ? `Total Actives: ${(product?.totalActiveMg || 10000).toLocaleString()} mg`
    : isSupplementProduct
    ? (lang === 'es' ? 'Cápsulas HPMC Gastrorresistentes' : 'Acid-Resistant HPMC Delayed-Release')
    : (product?.molecularWeight || product?.molecular_weight || product?.molecular?.molecularWeight ? `${product.molecularWeight || product.molecular_weight || product?.molecular?.molecularWeight} g/mol` : null);
  const purity = isCosmeticProduct
    ? (lang === 'es' ? 'Dermatológicamente Testado · Sin Sulfatos' : 'Dermatologically Tested · Sulphate-Free')
    : isSolventProduct 
    ? 'USP Pharmacopeial Grade (Sterile)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Precisión CV ≤ 6.6% (LoD 0.23 µmol/L)' : 'Precision CV ≤ 6.6% (LoD 0.23 µmol/L)')
    : isIvDrip
    ? 'USP <797> Sterile / ISO Class 5 Certified'
    : isSupplementProduct
    ? (lang === 'es' ? 'Grado Farmacéutico EU GMP · 100% Vegano' : 'EU GMP Certified · 100% Vegan')
    : (product?.purity || '≥ 99.4% (RP-HPLC)');
  const sequence = (isSolventProduct || isDiagnosticKit || isIvDrip || isCosmeticProduct || isSupplementProduct) ? null : (product?.sequence || product?.molecular?.sequence || null);
  const targetSystem = isCosmeticProduct
    ? (lang === 'es' ? 'Folículo Piloso, Matriz Dérmica y Fase Anágena' : 'Hair Follicle, Scalp Dermal Matrix & Anagen Phase')
    : isSolventProduct
    ? (lang === 'es' ? 'Vehículo Estéril de Reconstitución de Péptidos (USP)' : 'Universal Sterile Peptide Reconstitution Vehicle (USP)')
    : isDiagnosticKit
    ? (lang === 'es' ? 'Monitoreo Cuantitativo de Biomarcadores y Longevidad Celular' : 'Cellular Longevity & Quantitative Biomarker Monitoring')
    : isIvDrip
    ? (lang === 'es' ? 'Optimización Celular, Inmunidad y Longevidad Intravenosa' : 'Parenteral Cellular Optimization, Immunity & Longevity')
    : isSupplementProduct
    ? (lang === 'es' ? (product?.targetSystem || 'Optimización Metabólica, Mitocondrial y Celular') : (product?.targetSystem || 'Mitochondrial, Metabolic & Cellular Optimization'))
    : getLocalizedTargetSystem(product?.targetSystem || product?.target || 'Targeted Physiological Receptor Axis', lang);
  const description = dynamicTranslations[lang]?.description
    || getLocalizedField(product, 'description', lang) 
    || getLocalizedField(product, 'clinicalOverview', lang)
    || product?.clinicalOverview
    || product?.clinical_overview
    || product?.description 
    || product?.desc 
    || product?.objective 
    || '';

  // ─── Version & Update Date System ──────────────────────────────────────────
  const versionInfo = useMemo(() => {
    const rawUpdated = product?.updatedAt || product?._updatedAt;
    let d = new Date();
    if (rawUpdated) {
      if (typeof rawUpdated.toDate === 'function') d = rawUpdated.toDate();
      else {
        const parsed = new Date(rawUpdated);
        if (!isNaN(parsed.getTime())) d = parsed;
      }
    }
    const updatedAtDate = d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return getPublicVersionInfo(product?.version, updatedAtDate, lang);
  }, [product, lang]);

  // ─── Hierarchy, Formats & Strengths Matrix ─────────────────────────────────
  const hierarchy = product?.processedHierarchy || {};
  const suppliersList = useMemo(() => {
    const list = Array.isArray(hierarchy.suppliers) ? [...hierarchy.suppliers] : [];
    list.sort((a, b) => {
      const aIsLotus = String(a.id || a.name || '').toLowerCase().includes('lotusland');
      const bIsLotus = String(b.id || b.name || '').toLowerCase().includes('lotusland');
      if (aIsLotus && !bIsLotus) return -1;
      if (!aIsLotus && bIsLotus) return 1;
      return 0;
    });
    return list;
  }, [hierarchy.suppliers]);

  const isMultiSupplierMode = !product?.isSingleSupplierLocked && suppliersList.length > 1;

  // Helper to ensure physical labels, QR codes, and URLs always bind to a concrete laboratory
  const getConcreteSupplierId = (suppId, sName) => {
    const raw = String(suppId || sName || '').trim();
    if (!raw || raw === 'all' || raw.toLowerCase().includes('all certified') || raw.toLowerCase().includes('multi-source')) {
      const firstHierarchySupp = suppliersList[0]?.id;
      if (firstHierarchySupp && firstHierarchySupp !== 'all') {
        return firstHierarchySupp.startsWith('supplier-') ? firstHierarchySupp : `supplier-${firstHierarchySupp}`;
      }
      const firstVariantSupp = product?.variants?.[0]?.supplierId || product?.variants?.[0]?.supplierName;
      if (firstVariantSupp && firstVariantSupp !== 'all') {
        return firstVariantSupp.startsWith('supplier-') ? firstVariantSupp : `supplier-${firstVariantSupp}`;
      }
      return 'supplier-lotusland';
    }
    return raw.startsWith('supplier-') ? raw : `supplier-${raw.toLowerCase().replace(/[\s_]+/g, '-')}`;
  };

  // Active supplier state: default strictly to Lotusland if present, otherwise first available
  const [activeSupplierId, setActiveSupplierId] = useState(() => {
    if (initialSupplierFilter && initialSupplierFilter !== 'all') {
      const cleanTarget = String(initialSupplierFilter).toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');
      const matched = suppliersList.find(s => {
        const sClean = String(s.id || s.name).toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');
        return sClean === cleanTarget || sClean.includes(cleanTarget);
      });
      if (matched) return matched.id;
    }
    // Default strictly to Lotusland if present
    const lotuslandSupp = suppliersList.find(s => String(s.id || s.name).toLowerCase().includes('lotusland'));
    return lotuslandSupp?.id || suppliersList[0]?.id || product?.supplierId || 'supplier-lotusland';
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

  const displaySupplierName = useMemo(() => {
    const raw = supplierName || '';
    if (!raw || raw.toLowerCase().includes('lotusland') || raw.toLowerCase().includes('lotus')) {
      return 'Certified Clinical Synthesis Laboratory';
    }
    return formatCommercialSupplierName(raw);
  }, [supplierName]);

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
   * ─────────────────────────────────────────────────────────────
   * Clinical target: keep final concentration between 2.5–10 mg/mL
   * for comfortable SubQ injection volumes (0.1–0.6 mL per dose).
   * Volume MUST increase proportionally with dose to avoid
   * hyper-concentrated solutions that are painful to inject.
   */
  const getReconstitutionVolume = (strengthName) => {
    const mg = parseNum(strengthName);
    if (mg <= 0 || isNaN(mg)) return { volume: '2.0', concentration: '5.0' };

    let volumeNum;
    const strLower = String(strengthName || '').toLowerCase();
    const isBlendStrength = strLower.includes('+') 
      || strLower.includes('|') 
      || strLower.includes('/')
      || String(name || '').toLowerCase().includes('klow')
      || String(name || '').toLowerCase().includes('glow');

    if (isBlendStrength) {
      // Multi-peptide blends: scale proportionally, min 2.0 mL
      const rawVol = mg / 10.0;
      volumeNum = Math.max(2.0, Math.round(rawVol * 2) / 2);
    } else if (mg <= 2) {
      volumeNum = 1.0;  // → 2.0 mg/mL — precise low-dose titration
    } else if (mg <= 5) {
      volumeNum = 2.0;  // → 2.5 mg/mL
    } else if (mg <= 10) {
      volumeNum = 2.0;  // → 5.0 mg/mL — standard clinical concentration
    } else if (mg <= 15) {
      volumeNum = 3.0;  // → 5.0 mg/mL
    } else if (mg <= 20) {
      volumeNum = 3.0;  // → 6.7 mg/mL
    } else if (mg <= 30) {
      volumeNum = 4.0;  // → 7.5 mg/mL
    } else if (mg <= 40) {
      volumeNum = 5.0;  // → 8.0 mg/mL
    } else if (mg <= 50) {
      volumeNum = 5.0;  // → 10.0 mg/mL
    } else {
      // 60mg+: scale to keep ≤10 mg/mL, rounded to nearest 0.5 mL
      volumeNum = Math.max(5.0, Math.round((mg / 10.0) * 2) / 2);
    }

    const volume = volumeNum.toFixed(1);
    const concentration = (mg / volumeNum).toFixed(1);
    return { volume, concentration };
  };

  const sortedStrengths = useMemo(() => {
    const seen = new Set();
    const deduped = [];
    for (const s of rawStrengths) {
      const key = String(s.id || s.name || '')
        .toLowerCase()
        .replace(/,/g, '')
        .replace(/\s*\/\s*vial$/i, '')
        .replace(/[-_\s]+/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(s);
      }
    }
    return deduped.sort((a, b) => parseNum(a.name || a.id) - parseNum(b.name || b.id));
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

  // Priority-ordered available formats: Lyophilized Vial is the primary clinical standard
  const availableFormats = useMemo(() => {
    const list = sanitizedFormats.length > 0 ? [...sanitizedFormats] : [
      { id: 'vial', name: 'Lyophilized Subcutaneous Vial', strengths: sortedStrengths.map(s => s.id) }
    ];
    const getOrder = (id) => {
      const s = String(id || '').toLowerCase();
      if (s.includes('vial')) return 1;
      if (s.includes('pen') && !s.includes('cartridge')) return 2;
      if (s.includes('cartridge')) return 3;
      if (s.includes('spray') || s.includes('nasal')) return 4;
      if (s.includes('oral') || s.includes('capsule')) return 5;
      return 10;
    };
    return list.sort((a, b) => getOrder(a.id) - getOrder(b.id));
  }, [sanitizedFormats, sortedStrengths]);

  const [activeFormatId, setActiveFormatId] = useState(() => {
    if (initialFormat) {
      const cleanF = String(initialFormat).toLowerCase();
      const found = availableFormats.find(f => f.id.toLowerCase() === cleanF || f.id.toLowerCase().includes(cleanF));
      if (found) return found.id;
    }
    // Prefer lyophilized vial as primary standard; fall back to availableFormats[0]
    const vialFmt = availableFormats.find(f => f.id.toLowerCase().includes('vial'));
    return vialFmt?.id || availableFormats[0]?.id || 'vial';
  });

  // Keep activeFormatId valid when available formats change
  useEffect(() => {
    if (!availableFormats.some(f => f.id === activeFormatId)) {
      setActiveFormatId(availableFormats[0]?.id || 'vial');
    }
  }, [availableFormats, activeFormatId]);

  const activeFormat = availableFormats.find(f => f.id === activeFormatId) || availableFormats[0];
  const activeFormatStrengthIds = Array.isArray(activeFormat?.strengths) ? activeFormat.strengths : [];

  const handleSelectFormat = (formatId) => {
    setActiveFormatId(formatId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('presentation', formatId);
      url.searchParams.delete('dose');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const filteredStrengths = useMemo(() => {
    if (activeSupplierId !== 'all' && activeSupplierObj?.formatStrengths) {
      const allowedStrengthIds = activeSupplierObj.formatStrengths[activeFormatId] || [];
      if (allowedStrengthIds.length > 0) {
        return sortedStrengths.filter(s => allowedStrengthIds.includes(s.id));
      }
    }
    return sortedStrengths.filter(s => 
      activeFormatStrengthIds.length === 0 || activeFormatStrengthIds.includes(s.id)
    );
  }, [sortedStrengths, activeSupplierId, activeSupplierObj, activeFormatId, activeFormatStrengthIds]);

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

  const [packUnits, setPackUnits] = useState(1); // 1 (Single) | 5 (Pack) | 10 (Wholesale Box)

  useEffect(() => {
    if (!filteredStrengths.some(s => s.id === selectedStrengthId)) {
      setSelectedStrengthId(filteredStrengths[0]?.id || sortedStrengths[0]?.id || '10_mg');
    }
  }, [filteredStrengths, selectedStrengthId, sortedStrengths]);


  const selectedStrength = useMemo(() => {
    return filteredStrengths.find(s => s.id === selectedStrengthId) 
      || sortedStrengths.find(s => s.id === selectedStrengthId) 
      || filteredStrengths[0] 
      || sortedStrengths[0] 
      || null;
  }, [filteredStrengths, sortedStrengths, selectedStrengthId]);

  const handleSelectVariant = useCallback(({ strengthId, formatId, supplierId, strengthName }) => {
    triggerHaptic('selection');
    if (supplierId && supplierId !== 'all') {
      setActiveSupplierId(supplierId);
    }
    if (formatId) {
      setActiveFormatId(formatId);
    }
    if (strengthId) {
      setSelectedStrengthId(strengthId);
    } else if (strengthName) {
      const cleanS = String(strengthName).toLowerCase().replace(/[-_\s]+/g, '');
      const found = sortedStrengths.find(s => {
        const sc = String(s.name || s.id).toLowerCase().replace(/[-_\s]+/g, '');
        return sc === cleanS || sc.includes(cleanS) || cleanS.includes(sc);
      });
      if (found) {
        setSelectedStrengthId(found.id);
      }
    }
    toast.success(lang === 'es' ? 'Presentación clínica activa actualizada ✓' : 'Active clinical presentation updated ✓');
  }, [sortedStrengths, lang, setActiveSupplierId, setActiveFormatId, setSelectedStrengthId]);

  const handleCopyMonographSpecs = async () => {
    const isEs = lang === 'es';
    const prodName = product?.canonicalName || product?.name || name;
    const prodCat = category || 'Therapeutic Peptide';
    const prodTarget = targetSystem || 'Cellular Receptor Signaling';
    const purity = '≥ 99.0% (RP-HPLC Dual-Column Analytical Grade)';
    const cas = product?.cas || product?.casNumber || 'Verified CAS Registry';
    const mw = product?.molecularWeight || 'Calculated Theoretical Mass';
    const formula = product?.formula || product?.empiricalFormula || 'Synthetic Polypeptide Chain';
    const reconVol = selectedStrength ? getReconstitutionVolume(selectedStrength.name) : { volume: '2.0', concentration: '5.0' };
    const protocolsList = (associatedProtocols || []).slice(0, 3).map(p => `  • ${p.name || p.title}`).join('\n');

    const text = `*ATLAS HEALTH CLINICAL API MONOGRAPH*\n` +
      `Compound: ${prodName}\n` +
      `Category: ${prodCat}\n` +
      `Target Axis: ${prodTarget}\n` +
      `----------------------------------------\n` +
      `*ANALYTICAL SPECIFICATIONS:*\n` +
      `• Purity: ${purity}\n` +
      `• CAS Registry: ${cas}\n` +
      `• Molecular Weight: ${mw}\n` +
      `• Empirical Formula: ${formula}\n\n` +
      `*RECONSTITUTION & STORAGE:*\n` +
      `• Recommended Diluent: ${reconVol.volume} mL Bacteriostatic Water USP\n` +
      `• In-Use Concentration: ${reconVol.concentration} mg/mL\n` +
      `• Storage: 2°C – 8°C Refrigerated (Do Not Freeze) · 28-Day Stability\n\n` +
      (protocolsList ? `*ASSOCIATED CLINICAL BLUEPRINTS:*\n${protocolsList}\n\n` : '') +
      `Official Verification: https://med-peptides.com/p/${slug}\n` +
      `_Atlas Services · SSOT Clinical Intelligence Standard_`;

    let success = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, trying fallback:', err);
      }
    }

    if (!success && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    }

    if (success) {
      setCopiedMonograph(true);
      triggerHaptic('success');
      toast.success(isEs ? 'Ficha técnica copiada al portapapeles ✓' : 'Technical monograph copied to clipboard ✓');
      setTimeout(() => setCopiedMonograph(false), 2500);
    } else {
      toast.error(isEs ? 'No se pudo copiar al portapapeles' : 'Could not copy to clipboard');
    }
  };

  // Resolve current active variant from hierarchy or product.variants
  const currentVariant = useMemo(() => {
    const vIndex = hierarchy.variantIndex || {};
    const directKey = `${activeSupplierId}::${activeFormatId}::${selectedStrengthId}`;
    if (vIndex[directKey]) return vIndex[directKey];

    for (const key of Object.keys(vIndex)) {
      if (key.includes(String(selectedStrengthId)) && key.includes(String(activeFormatId))) {
        return vIndex[key];
      }
    }

    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const cleanStr = String(selectedStrength?.name || selectedStrengthId || '').toLowerCase().replace(/[-_\s]+/g, '');
    return variants.find(v => {
      const vStr = String(v.dosage || v.dose || v.name || v.id || '').toLowerCase().replace(/[-_\s]+/g, '');
      return vStr === cleanStr || vStr.includes(cleanStr) || cleanStr.includes(vStr);
    }) || null;
  }, [activeSupplierId, activeFormatId, selectedStrengthId, selectedStrength, hierarchy.variantIndex, product?.variants]);

  // Real verified discount for 10-unit kit (calculated from Firestore pricing on server, never invented)
  const realKitSavings = useMemo(() => {
    if (!currentVariant) return null;
    if (typeof currentVariant.kitDiscountPct === 'number' && currentVariant.kitDiscountPct > 0) {
      return {
        hasDiscount: true,
        discountPct: currentVariant.kitDiscountPct
      };
    }
    const pricing = currentVariant.pricing || {};
    const tier = pricing.wholesale || pricing.retail || pricing.master || pricing.clinic || null;
    const perUnit = tier?.perUnit != null ? Number(tier.perUnit) : null;
    const kit = tier?.kit != null ? Number(tier.kit) : null;
    const kitQty = tier?.kitQuantity ? Number(tier.kitQuantity) : 10;

    if (perUnit && kit && perUnit > 0 && kit > 0) {
      const total10Singles = perUnit * kitQty;
      if (total10Singles > kit) {
        const discountPct = Math.round(((total10Singles - kit) / total10Singles) * 100);
        return {
          hasDiscount: discountPct > 0,
          discountPct,
          perUnit,
          kit,
          kitQty,
          currency: tier.currency || 'USD'
        };
      }
    }
    return null;
  }, [currentVariant]);

  const isPenFormat = useMemo(() => {
    const f = (activeFormatId || '').toLowerCase();
    return f.includes('pen');
  }, [activeFormatId]);

  const isCartridgeFormat = useMemo(() => {
    const f = (activeFormatId || '').toLowerCase();
    return f.includes('cartridge');
  }, [activeFormatId]);

  const isPenOrCart = isPenFormat || isCartridgeFormat;

  const isSprayFormat = useMemo(() => {
    const f = (activeFormatId || '').toLowerCase();
    return f.includes('spray') || f.includes('nasal');
  }, [activeFormatId]);

  const distinctPenFmt = useMemo(() => {
    return availableFormats.find(f => (f.id || '').toLowerCase().includes('pen') && !(f.id || '').toLowerCase().includes('cartridge'));
  }, [availableFormats]);

  const distinctCartridgeFmt = useMemo(() => {
    return availableFormats.find(f => (f.id || '').toLowerCase().includes('cartridge') && !(f.id || '').toLowerCase().includes('pen'));
  }, [availableFormats]);

  const isPenAndCartridgeEcosystem = Boolean(distinctPenFmt && distinctCartridgeFmt);

  const tocSections = useMemo(() => {
    if (isEternaDiagnostic) {
      return [
        { id: 'overview', label: lang === 'es' ? 'Longevidad & Edad Biológica' : 'Longevity & Epigenetic Overview', icon: Clock },
        { id: 'reconstitution-section', label: lang === 'es' ? '5 Pilares Epigenéticos & Dianas' : '5 Epigenetic Pillars & Targets', icon: Dna },
        { id: 'presentations-matrix', label: lang === 'es' ? 'Kit y Presentaciones de Muestreo' : 'Kit Presentations & Sampling', icon: Layers },
        { id: 'specs-section', label: lang === 'es' ? 'Certificación y Trazabilidad' : 'Lab Traceability & Standards', icon: ShieldCheck },
        { id: 'publications-section', label: lang === 'es' ? 'Evidencia y Relojes Epigenéticos' : 'Clinical Evidence & Clocks', icon: FileText },
        { id: 'labels-section', label: lang === 'es' ? 'Identificador y Código de Muestra' : 'Sample Barcode & Clinical Labels', icon: Tag },
        { id: 'related-peptides-section', label: lang === 'es' ? 'Protocolos de Intervención Longevidad' : 'Companion Longevity Protocols', icon: FlaskConical }
      ];
    }

    if (isDiagnosticKit || isBloodoDiagnostic || product?.slug?.includes('bloodo') || product?.canonicalKey?.includes('bloodo')) {
      return [
        { id: 'overview', label: lang === 'es' ? 'Descripción y Utilidad' : 'Overview & Utility', icon: FileText },
        { id: 'presentations-matrix', label: lang === 'es' ? 'Presentaciones del Kit' : 'Kit Presentations', icon: Layers },
        { id: 'diagnostic-specs', label: lang === 'es' ? 'Especificaciones Analíticas' : 'Analytical Specs', icon: Activity },
        { id: 'biomarker-simulator', label: lang === 'es' ? 'Simulador Clínico' : 'Biomarker Simulator', icon: Sparkles },
        { id: 'collection-protocol', label: lang === 'es' ? 'Protocolo de Muestreo DBS' : 'DBS Collection Protocol', icon: Droplets },
        { id: 'pre-analytical-prep', label: lang === 'es' ? 'Estandarización Preanalítica' : 'Pre-Analytical Prep', icon: CheckCircle2 },
        { id: 'kit-contents', label: lang === 'es' ? 'Contenido del Kit' : 'Kit Included Items', icon: Layers },
        { id: 'specs-section', label: lang === 'es' ? 'Trazabilidad y Calidad' : 'Lab Quality & Traceability', icon: ShieldCheck },
        { id: 'nad-clinical-faq', label: lang === 'es' ? 'Guías y Preguntas Clínicas' : 'Clinical FAQs & Guidance', icon: HelpCircle },
        { id: 'related-peptides-section', label: lang === 'es' ? 'Protocolos Acompañantes' : 'Companion Protocols', icon: FlaskConical },
        ...(isBloodoDiagnostic ? [
          { id: 'bloodo-suite', label: lang === 'es' ? 'Otros Tests Disponibles' : 'Other Diagnostic Tests', icon: Sparkles },
          { id: 'clinical-dbs-advantages', label: lang === 'es' ? 'Ventaja DBS en Consulta' : 'In-Office DBS Advantages', icon: ShieldCheck }
        ] : [
          { id: 'clinical-dbs-advantages', label: lang === 'es' ? 'Ventaja DBS en Consulta' : 'In-Office DBS Advantages', icon: ShieldCheck }
        ])
      ];
    }

    if (isCorporateService) {
      return [
        { id: 'overview', label: lang === 'es' ? 'Resumen Ejecutivo' : 'Executive Overview', icon: FileText },
        { id: 'reconstitution-section', label: lang === 'es' ? 'Especificaciones del Servicio' : 'Service Specifications', icon: Building2 },
        { id: 'specs-section', label: lang === 'es' ? 'Marco Legal y Acreditación' : 'Legal & Accreditation', icon: ShieldCheck }
      ];
    }

    if (isCosmeticProduct) {
      return [
        { id: 'overview', label: lang === 'es' ? 'Descripción y Perfil Clínico' : 'Overview & Clinical Profile', icon: FileText },
        { id: 'presentations-matrix', label: lang === 'es' ? 'Presentaciones y Envase' : 'Packaging & Presentations', icon: Layers },
        { id: 'reconstitution-section', label: lang === 'es' ? 'Especificaciones Físico-Químicas' : 'Formulation Technical Specs', icon: Beaker },
        { id: 'clinical-evidence', label: lang === 'es' ? 'Evidencia y Dianas Foliculares' : 'Clinical Evidence & Targets', icon: Activity },
        { id: 'inci-dossier', label: lang === 'es' ? 'Composición INCI Completa' : 'Full INCI Composition', icon: Microscope },
        { id: 'application-protocol', label: lang === 'es' ? 'Protocolo de Aplicación' : 'Clinical Usage Protocol', icon: ClipboardList },
        { id: 'colway-system', label: lang === 'es' ? 'Sistema Capilar Colway' : 'Colway 2-Step System', icon: Sparkles },
        { id: 'contraindications-section', label: lang === 'es' ? 'Seguridad y Test de Parche' : 'Safety & Patch Test', icon: ShieldCheck }
      ];
    }

    if (isSupplementProduct) {
      return [
        { id: 'overview', label: lang === 'es' ? 'Perfil Nutracéutico y Clínico' : 'Nutraceutical & Clinical Overview', icon: FileText },
        { id: 'reconstitution-section', label: lang === 'es' ? 'Pauta de Administración y Posología' : 'Dosage & Administration Protocol', icon: ClipboardList },
        { id: 'presentations-matrix', label: lang === 'es' ? 'Lotes y Presentaciones' : 'Batch & Presentations', icon: Layers },
        { id: 'specs-section', label: lang === 'es' ? 'Certificado de Calidad (CoA)' : 'Certificate of Analysis (CoA)', icon: ShieldCheck },
        { id: 'publications-section', label: lang === 'es' ? 'Respaldos Científicos' : 'Scientific Evidence & Trials', icon: FileText },
        { id: 'contraindications-section', label: lang === 'es' ? 'Seguridad y Precauciones' : 'Safety & Precautions', icon: ShieldCheck },
        { id: 'labels-section', label: lang === 'es' ? 'Etiquetas de Farmacia' : 'Compounding Pharmacy Labels', icon: Tag },
        { id: 'related-peptides-section', label: lang === 'es' ? 'Sinergias y Protocolos' : 'Synergies & Protocols', icon: FlaskConical }
      ];
    }

    // Default therapeutic peptide monograph
    return [
      { id: 'overview', label: lang === 'es' ? 'Perfil Farmacológico' : 'Pharmacological Profile', icon: FileText },
      { id: 'reconstitution-section', label: isPenOrCart ? (lang === 'es' ? 'Calibración de Dial' : 'Pen Dial Titration') : isSprayFormat ? (lang === 'es' ? 'Dosimetría Intranasal' : 'Intranasal Dosimetry') : (lang === 'es' ? 'Guía de Reconstitución' : 'Reconstitution Guide'), icon: Droplets },
      { id: 'presentations-matrix', label: lang === 'es' ? 'Lotes y Presentaciones' : 'Batch & Presentations', icon: Layers },
      { id: 'specs-section', label: lang === 'es' ? 'Certificado de Análisis (CoA)' : 'Certificate of Analysis', icon: ShieldCheck },
      ...(!isSolventProduct ? [
        { id: 'publications-section', label: lang === 'es' ? 'Ensayos y Literatura' : 'Scientific Literature', icon: FileText },
        { id: 'contraindications-section', label: lang === 'es' ? 'Seguridad y Precauciones' : 'Safety & Contraindications', icon: ShieldCheck },
        { id: 'labels-section', label: lang === 'es' ? 'Etiquetas de Dispensación' : 'Dispensing Vial Labels', icon: Tag },
        { id: 'analytical-specs', label: lang === 'es' ? 'Cromatografía y Pureza' : 'HPLC Purity & Mass', icon: Activity }
      ] : []),
      { id: 'related-peptides-section', label: lang === 'es' ? 'Protocolos Clínicos' : 'Clinical Protocols', icon: FlaskConical }
    ];
  }, [isEternaDiagnostic, isDiagnosticKit, isCorporateService, isPenOrCart, isSprayFormat, isSolventProduct, isCosmeticProduct, isSupplementProduct, product, lang]);

  // Deterministic discreet batch code fallback
  const effectiveBatchCode = useMemo(() => {
    if (initialBatch && String(initialBatch).trim().length > 0 && !String(initialBatch).toLowerCase().includes('dummy')) {
      return initialBatch;
    }
    const currentDose = selectedStrength?.name || selectedStrengthId || '10 mg';
    const currentSupplier = (activeSupplierId && activeSupplierId !== 'all') ? activeSupplierId : (supplierName || 'supplier-lotusland');
    return generateDiscreetBatchCode({
      slug: slug || product?.slug,
      dose: currentDose,
      supplier: currentSupplier
    });
  }, [initialBatch, slug, product?.slug, selectedStrength?.name, selectedStrengthId, activeSupplierId, supplierName]);

  // Guaranteed fallback to 'overview' if activeSection is not in current tocSections
  const effectiveActiveSection = useMemo(() => {
    if (!activeSection || activeSection === 'overview') return 'overview';
    const exists = tocSections.some(s => s.id === activeSection);
    return exists ? activeSection : 'overview';
  }, [activeSection, tocSections]);

  // Reactive Dynamic Share URL respecting active state — Guaranteed https://med-peptides.com
  const dynamicPublicUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    // 1. Dose: Prefer canonical readable name e.g. "10 mg"
    const currentDose = (selectedStrength?.name || selectedStrengthId || '10 mg').replace(/_/g, ' ');
    params.set('dose', currentDose);

    // 2. Presentation / Format: Always bound (e.g. "vial")
    const currentFormat = activeFormat?.id || activeFormatId || 'vial';
    params.set('presentation', currentFormat);

    // 3. Supplier: Always bind the concrete active or canonical supplier (e.g. "supplier-lotusland")
    const targetSupplier = getConcreteSupplierId(activeSupplierId, supplierName);
    params.set('supplier', targetSupplier);

    // 4. Batch & VialCode: Synchronized authentic discreet lot code
    params.set('batch', effectiveBatchCode);
    params.set('vialCode', effectiveBatchCode);

    // 5. Language (if not default)
    if (lang && lang !== 'en') {
      params.set('lang', lang);
    }

    const q = params.toString();
    const canonicalDomain = 'https://med-peptides.com';
    return `${canonicalDomain}/p/${slug}${q ? `?${q}` : ''}`;
  }, [slug, selectedStrength?.name, selectedStrengthId, activeFormat?.id, activeFormatId, activeSupplierId, supplierName, effectiveBatchCode, lang]);

  // 🔄 Synchronize browser address bar with unique product identity parameters (Golden UX Rule)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history && dynamicPublicUrl) {
      try {
        const urlObj = new URL(dynamicPublicUrl);
        const currentPathAndQuery = window.location.pathname + window.location.search;
        const targetPathAndQuery = urlObj.pathname + urlObj.search;
        if (currentPathAndQuery !== targetPathAndQuery) {
          window.history.replaceState({}, '', targetPathAndQuery);
        }
      } catch (_err) {
        // Ignore URL parsing errors
      }
    }
  }, [dynamicPublicUrl]);

  // 🔗 Reactive Short Monograph URL (Deterministic share link preserving dose, presentation, supplier, batch)
  const [shortMonographUrl, setShortMonographUrl] = useState('');

  useEffect(() => {
    if (!dynamicPublicUrl) return;
    let isMounted = true;
    fetch('/api/short-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUrl: dynamicPublicUrl,
        slug,
        recipient: { type: 'public' }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.shortUrl) {
          setShortMonographUrl(data.shortUrl);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [dynamicPublicUrl, slug]);

  const labelQueryString = useMemo(() => {
    const p = new URLSearchParams();
    const targetDose = (selectedStrength?.name || selectedStrengthId || '10 mg').replace(/_/g, ' ');
    p.set('dose', targetDose);

    const currentFormat = activeFormat?.id || activeFormatId || 'vial';
    p.set('presentation', currentFormat);
    p.set('format', currentFormat);

    const targetSupplier = getConcreteSupplierId(activeSupplierId, supplierName);
    p.set('supplier', targetSupplier);

    if (supplierName && !supplierName.includes('All Certified Laboratories') && !supplierName.includes('Multi-Source')) {
      p.set('supplierName', supplierName);
    }

    p.set('batch', effectiveBatchCode);
    p.set('vialCode', effectiveBatchCode);

    if (lang && lang !== 'en') p.set('lang', lang);

    if (dynamicPublicUrl) {
      p.set('url', dynamicPublicUrl);
    }
    const qs = p.toString();
    return qs ? `&${qs}` : '';
  }, [selectedStrength?.name, selectedStrengthId, activeFormat?.id, activeFormatId, activeSupplierId, supplierName, effectiveBatchCode, lang, dynamicPublicUrl]);

  // Variant-specific file naming suffix so operators never confuse downloaded labels
  const variantFileSuffix = useMemo(() => {
    const clean = (s) => String(s || '').trim().replace(/^supplier[-_]/i, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase();
    const d = clean(selectedStrength?.name || selectedStrengthId || '10mg');
    const p = clean(activeFormat?.name || activeFormatId || 'vial');
    const s = clean(supplierName || activeSupplierId || 'lotusland');
    const b = clean(effectiveBatchCode || 'batch');
    return `${clean(slug)}_${d}_${p}_${s}_${b}`;
  }, [slug, selectedStrength, selectedStrengthId, activeFormat, activeFormatId, supplierName, activeSupplierId, effectiveBatchCode]);

  // Live Scannable 2D/3D Barcode SVG URL synced with current variant state
  const barcodeSupplier = getConcreteSupplierId(activeSupplierId, supplierName);
  const barcodeImageUrl = useMemo(() => {
    const qs = new URLSearchParams();
    const currentDose = (selectedStrength?.name || selectedStrengthId || '10 mg').replace(/_/g, ' ');
    qs.set('dose', currentDose);
    const currentFormat = activeFormat?.id || activeFormatId || 'vial';
    qs.set('presentation', currentFormat);
    qs.set('supplier', barcodeSupplier);
    qs.set('batch', effectiveBatchCode);
    qs.set('vialCode', effectiveBatchCode);
    if (dynamicPublicUrl) qs.set('url', dynamicPublicUrl);
    return `/api/barcode/${encodeURIComponent(slug)}?${qs.toString()}`;
  }, [slug, barcodeSupplier, selectedStrength?.name, selectedStrengthId, activeFormat?.id, activeFormatId, effectiveBatchCode, dynamicPublicUrl]);

  // Fetch SVG inline — <img> cannot render nested <svg> (QR inside label)
  useEffect(() => {
    if (!slug || !barcodeImageUrl) return;
    setSvgError(false);
    setInlineSvg(null);
    fetch(barcodeImageUrl)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(svg => setInlineSvg(svg))
      .catch(() => setSvgError(true));
  }, [slug, barcodeImageUrl]);

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
    const targetUrl = shortMonographUrl || dynamicPublicUrl;
    await navigator.clipboard.writeText(targetUrl).catch(() => {});
    setCopied(true);
    toast.success(lang === 'es' ? 'Enlace corto copiado al portapapeles ✓' : 'Short link copied to clipboard ✓');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${name} (${activeFormat?.name || 'Monograph'}) — Monograph | Atlas Services × ${supplierName}`,
          text: `Clinical Pharmaceutical Monograph & Analytical Specifications for ${name}. Formulated as ${activeFormat?.name || 'clinical grade peptide'}, sourced through authorized synthesis partner ${supplierName} for Atlas Services. RP-HPLC Purity ≥ 99.0%.`,
          url: dynamicPublicUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await handleCopyUrl();
  };

  const matrixRows = useMemo(() => {
    const rows = [];
    const variantIndex = hierarchy.variantIndex || {};

    if (activeSupplierId !== 'all' && activeSupplierObj) {
      // 1. Single Supplier Mode: Only show verified formulations belonging to THIS supplier
      availableFormats.forEach(fmt => {
        const suppStrengthsForFormat = activeSupplierObj.formatStrengths?.[fmt.id] || [];
        const strengthObjs = sortedStrengths.filter(s => suppStrengthsForFormat.includes(s.id));

        strengthObjs.forEach(st => {
          const vKey = `${activeSupplierObj.id}::${fmt.id}::${st.id}`;
          const v = variantIndex[vKey];
          const recon = getReconstitutionVolume(st.name);
          const isCurrentlyActive = fmt.id === activeFormatId && st.id === selectedStrengthId;
          const isPenOrCart = fmt.id.includes('pen') || fmt.id.includes('cartridge');
          const isOral = fmt.id.includes('capsule') || fmt.id.includes('tablet') || fmt.id.includes('oral');
          const isSpray = fmt.id.includes('spray') || fmt.id.includes('nasal');

          const diluentText = isSolventProduct
            ? (lang === 'es' ? 'Solvente Puro (Vehículo de Reconstitución)' : 'Pure Diluent (Reconstitution Solvent)')
            : isDiagnosticKit
              ? (lang === 'es' ? 'Kit Todo Incluido (Lancetas + Tarjeta DBS)' : 'Self-Contained Kit (Lancets + DBS Card)')
              : isSupplementProduct
                ? (lang === 'es' ? 'Cápsula HPMC Oral (Sin reconstitución)' : 'Oral HPMC Capsule (No reconstitution)')
                : isPenOrCart 
                  ? (lang === 'es' ? 'Solución Precargada (Sin mezcla)' : 'Pre-filled Solution (Zero mixing)')
                  : isOral 
                    ? (lang === 'es' ? 'Dosis Oral Sólida (Sin diluyente)' : 'Solid Oral Dose (No diluent)')
                    : isSpray
                      ? (lang === 'es' ? 'Solución Intranasal Dosificada' : 'Pre-metered Intranasal Solution')
                      : `${recon.volume} mL BAC Water`;

          const concText = isSolventProduct
            ? '0.9% Benzyl Alcohol USP'
            : isDiagnosticKit
              ? (lang === 'es' ? 'Rango: 5.0–60.0 µmol/L (LoD 0.23)' : 'Range: 5.0–60.0 µmol/L (LoD 0.23)')
              : isSupplementProduct
                ? (st.name || (lang === 'es' ? 'Fórmula Multi-Activa' : 'Multi-Active Formula'))
                : isPenOrCart 
                  ? (lang === 'es' ? 'Solución Calibrada en Pluma' : 'Calibrated Pen Solution')
                  : isOral 
                    ? (lang === 'es' ? 'Unidad Sólida Oral' : 'Dry Oral Solid Unit')
                    : isSpray
                      ? (lang === 'es' ? 'Unidad de Spray Dosificado' : 'Metered Spray Unit')
                      : `${recon.concentration} mg/mL`;

          const adminText = isSolventProduct
            ? (lang === 'es' ? 'Vehículo Reconstitución Multidosis' : 'Multi-Dose Reconstitution Vehicle')
            : isDiagnosticKit
              ? (lang === 'es' ? 'Punción Capilar (DBS Yema de Dedo)' : 'Capillary Fingerstick (DBS Card)')
              : isSupplementProduct
                ? (lang === 'es' ? 'Vía Oral (Con agua / Comida)' : 'Oral Route (With water / Food)')
                : isPenOrCart 
                  ? (lang === 'es' ? 'Subcutánea Pluma Multidosis' : 'Subcutaneous Pen Multi-dose')
                  : isOral 
                    ? (lang === 'es' ? 'Unidad Oral Entérica' : 'Oral Enteric Unit')
                    : isSpray
                      ? (lang === 'es' ? 'Mucosa Intranasal' : 'Intranasal Mucosal')
                      : 'Subcutaneous / IM (U-100)';

          rows.push({
            key: `${activeSupplierObj.id}-${fmt.id}-${st.id}`,
            formatId: fmt.id,
            formatName: fmt.name,
            strengthId: st.id,
            strengthName: st.name,
            diluentText,
            concText,
            adminText,
            recon,
            isPenOrCart,
            isOral,
            isSpray,
            isCurrentlyActive,
            purity: v?.purity || (isSolventProduct ? 'USP Grade (Sterile)' : (isDiagnosticKit ? 'CE-IVDR · LifeLab1 (CV 6.6%)' : isSupplementProduct ? (lang === 'es' ? 'EU GMP Farmacéutico · Vegano' : 'EU GMP Certified · Vegan') : '≥ 99.0% (RP-HPLC)')),
            supplierName: activeSupplierObj.name || (isSupplementProduct ? 'Pharmapolis' : 'Lotusland Limited'),
            supplierId: activeSupplierObj.id
          });
        });
      });
    } else {
      // 2. All Laboratories Overview Mode: List every verified supplier and their true formulations
      suppliersList.forEach(supp => {
        const suppFormatIds = Array.isArray(supp.formats) ? supp.formats : [];
        suppFormatIds.forEach(fId => {
          const fmtObj = availableFormats.find(f => f.id === fId) || { id: fId, name: getHumanFormatName(fId) };
          const suppStrengths = supp.formatStrengths?.[fId] || [];
          const strengthObjs = sortedStrengths.filter(s => suppStrengths.includes(s.id));

          strengthObjs.forEach(st => {
            const vKey = `${supp.id}::${fId}::${st.id}`;
            const v = variantIndex[vKey];
            const recon = getReconstitutionVolume(st.name);
            const isCurrentlyActive = fId === activeFormatId && st.id === selectedStrengthId;
            const isPen = fId.includes('pen');
            const isCart = fId.includes('cartridge');
            const isPenOrCart = isPen || isCart;
            const isOral = fId.includes('capsule') || fId.includes('tablet') || fId.includes('oral');
            const isSpray = fId.includes('spray') || fId.includes('nasal');

            const diluentText = isSolventProduct
              ? (lang === 'es' ? 'Solvente Puro (Vehículo de Reconstitución)' : 'Pure Diluent (Reconstitution Solvent)')
              : isDiagnosticKit
                ? (lang === 'es' ? 'Kit Todo Incluido (Lancetas + Tarjeta DBS)' : 'Self-Contained Kit (Lancets + DBS Card)')
                : isSupplementProduct
                  ? (lang === 'es' ? 'Cápsula HPMC Oral (Sin diluyente)' : 'Oral HPMC Capsule (No diluent)')
                  : isPen
                    ? (lang === 'es' ? 'Solución Precargada (Sin BAC · Cero mezcla)' : 'Pre-filled Solution (Zero BAC mixing)')
                    : isCart
                      ? (lang === 'es' ? 'Cartucho 3 mL Recambio (Sin BAC)' : '3 mL Refill Cartridge (Zero BAC)')
                      : isOral 
                        ? (lang === 'es' ? 'Dosis Oral Sólida (Sin diluyente)' : 'Solid Oral Dose (No diluent)')
                        : isSpray
                          ? (lang === 'es' ? 'Solución Intranasal Tamponada (Sin BAC)' : 'Pre-metered Buffered Solution (Zero BAC)')
                          : `${recon.volume} mL BAC Water`;

            const concText = isSolventProduct
              ? '0.9% Benzyl Alcohol USP'
              : isDiagnosticKit
                ? (lang === 'es' ? 'Rango: 5.0–60.0 µmol/L (LoD 0.23)' : 'Range: 5.0–60.0 µmol/L (LoD 0.23)')
                : isSupplementProduct
                  ? (st.name || (lang === 'es' ? 'Fórmula Multi-Activa' : 'Multi-Active Formula'))
                  : isPen
                    ? (lang === 'es' ? '3.0 mL (Multidosis Calibrada)' : '3.0 mL (Calibrated Multi-dose)')
                    : isCart
                      ? (lang === 'es' ? '3.0 mL (Cartucho Borosilicato Tipo I)' : '3.0 mL (Borosilicate Refill)')
                      : isOral 
                        ? (lang === 'es' ? 'Unidad Sólida Oral' : 'Dry Oral Solid Unit')
                        : isSpray
                          ? (lang === 'es' ? '10 mL (~100 sprays · 0.1 mL/puff)' : '10 mL (~100 sprays · 0.1 mL/puff)')
                          : `${recon.concentration} mg/mL`;

            const adminText = isSolventProduct
              ? (lang === 'es' ? 'Vehículo Reconstitución Multidosis' : 'Multi-Dose Reconstitution Vehicle')
              : isDiagnosticKit
                ? (lang === 'es' ? 'Punción Capilar (DBS Yema de Dedo)' : 'Capillary Fingerstick (DBS Card)')
                : isSupplementProduct
                  ? (lang === 'es' ? 'Vía Oral (Con agua / Comida)' : 'Oral Route (With water / Food)')
                  : isPen
                    ? (lang === 'es' ? 'Subcutánea Pluma Multidosis' : 'Subcutaneous Pen Multi-dose')
                    : isCart
                      ? (lang === 'es' ? 'Recambio 3 mL para Pluma' : '3 mL Reusable Pen Refill')
                      : isOral 
                        ? (lang === 'es' ? 'Unidad Oral Entérica' : 'Oral Enteric Unit')
                        : isSpray
                          ? (lang === 'es' ? 'Mucosa Intranasal (Sin Agujas)' : 'Intranasal Mucosal (Needle-Free)')
                          : 'Subcutaneous / IM (U-100)';

            rows.push({
              key: `${supp.id}-${fId}-${st.id}`,
              formatId: fId,
              formatName: fmtObj.name,
              strengthId: st.id,
              strengthName: st.name,
              diluentText,
              concText,
              adminText,
              recon,
              isPenOrCart,
              isPen,
              isCart,
              isOral,
              isSpray,
              isCurrentlyActive,
              purity: v?.purity || (isSolventProduct ? 'USP Grade (Sterile)' : (isDiagnosticKit ? 'CE-IVDR · LifeLab1 (CV 6.6%)' : isSupplementProduct ? (lang === 'es' ? 'EU GMP Farmacéutico · Vegano' : 'EU GMP Certified · Vegan') : '≥ 99.0% (RP-HPLC)')),
              supplierName: supp.name || supp.id,
              supplierId: supp.id
            });
          });
        });
      });
    }

    return rows.sort((a, b) => {
      const diff = parseNum(a.strengthName) - parseNum(b.strengthName);
      if (diff !== 0) return diff;
      return a.supplierName.localeCompare(b.supplierName);
    });
  }, [activeSupplierId, activeSupplierObj, availableFormats, sortedStrengths, hierarchy.variantIndex, activeFormatId, selectedStrengthId, isSolventProduct, isDiagnosticKit, suppliersList, lang]);

  // Official Diagnostic Product Packaging Photo for Datasheet Hero
  const diagnosticHeroImage = isEternaDiagnostic
    ? (product?.imageUrl || product?.image || '/images/products/eterna/eterna-kit-box.png')
    : (isDiagnosticKit || isBloodoDiagnostic)
      ? (product?.imageUrl || product?.image || (
          slug.includes('nad') ? '/images/products/bloodo/nad.jpg' :
          slug.includes('cortisol') ? '/images/products/bloodo/cortisol.jpg' :
          slug.includes('hba1c') || slug.includes('hemoglobin') ? '/images/products/bloodo/hba1c.jpg' :
          slug.includes('omega-index') ? '/images/products/bloodo/omega-index.jpg' :
          slug.includes('omega') ? '/images/products/bloodo/omega.jpg' :
          slug.includes('testosterone') ? '/images/products/bloodo/testosterone.jpg' :
          slug.includes('vitamin-d') || slug.includes('vit-d') ? '/images/products/bloodo/vitamin-d.jpg' :
          '/images/products/bloodo/nad.jpg'
        ))
      : null;

  return (
    <div className="public-datasheet-root">
      {/* ── Fixed Executive Navigation (Tier 1 Only on Product Page) ── */}
      <PublicUnifiedHeader
        track="peptides"
        lang={lang}
        onLangChange={setLang}
        copyUrl={dynamicPublicUrl}
        shortUrl={shortMonographUrl}
        supplierName={supplierName || product?.sourceSupplier || product?.supplierName || product?.supplier || 'Lotusland'}
        currentSlug={slug}
        inquiryContextType="product"
        inquiryEntity={{
          name: product?.name || name,
          slug,
          code: effectiveBatchCode || '',
          strength: selectedStrengthId || '',
          category: category || 'Research Peptides'
        }}
        onOpenInquiry={handleOpenInquiry}
        hideContactButton={true}
        loginRedirect={`/p/${encodeURIComponent(slug)}`}
        hideTier2={true}
        breadcrumb={[
          { label: lang === 'es' ? 'Catálogo de Productos' : 'Product Catalog', href: '/c/CAT-MU9L9GBN' },
          { label: product?.canonicalName || product?.name || name || 'Peptide Monograph' }
        ]}
      />

      {/* ── Standardized Clinical Page Shell / Peptide Monograph Workspace ── */}
      {isPeptideCompound ? (
        <PeptideMonographWorkspace
          product={product}
          slug={slug}
          effectiveBatch={effectiveBatchCode}
          associatedProtocols={associatedProtocols}
          baseUrl={baseUrl}
          supplierName={displaySupplierName || formatCommercialSupplierName(supplierName)}
          activeFormat={activeFormat}
          selectedStrength={selectedStrength}
          availableFormats={availableFormats}
          sortedStrengths={filteredStrengths}
          presentationMatrixRows={matrixRows}
          dynamicPublicUrl={dynamicPublicUrl}
          shortUrl={shortMonographUrl}
          versionInfo={versionInfo}
          labelQueryString={labelQueryString}
          onFormatChange={handleSelectFormat}
          onSelectVariant={handleSelectVariant}
        />
      ) : (
        <PublicPageShell>
        {/* ── Google Cloud Console Dynamic Dual Navigation Layout ── */}
        <div className="pds-content-with-sidebar">
          <div className="pds-main-column">
            {effectiveActiveSection === 'overview' ? (
              <div id="overview">
                <PublicPageHero
            badges={
            <>
              <span className="pds-cat-tag">
                {lang === 'es' && (category === 'PEPTIDE' || category === 'Peptide' || !category) ? 'PÉPTIDO' : category}
              </span>
              <span className="pds-cgmp-tag">
                {isCorporateService
                  ? (displaySupplierName && !displaySupplierName.includes('Certified Clinical Laboratories') && !displaySupplierName.includes('Multi-Source')
                      ? `${displaySupplierName} ${lang === 'es' ? 'Calidad Verificada' : 'Quality Verified'}`
                      : (lang === 'es' ? 'Asesoramiento Institucional' : 'Institutional Advisory'))
                  : isStrictlyLotusland 
                    ? (t.lotuslandVerified || (lang === 'es' ? 'Certificado Atlas Services' : 'Atlas Services Certified')) 
                    : `${displaySupplierName} ${lang === 'es' ? 'Calidad Verificada' : 'Quality Verified'}`}
              </span>
              {!isCorporateService && !isDiagnosticKit && !isCosmeticProduct && <FdaRegulatoryBadge product={product} variant="hero-pill" lang={lang} />}
              {!isCorporateService && !isSolventProduct && !isDiagnosticKit && !isCosmeticProduct && (
                <>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #6ee7b7',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={13} color="#059669" />
                    <span>{lang === 'es' ? '≥ 99.0% Pureza (Dual RP-HPLC)' : '≥ 99.0% Purity (Dual RP-HPLC)'}</span>
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <span>{lang === 'es' ? 'Grado Protocolo Clínico' : 'Clinical Protocol Grade'}</span>
                  </span>
                </>
              )}
              {isCosmeticProduct && (
                <>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#f0fdfa',
                    color: '#0d9488',
                    border: '1px solid #99f6e4',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={13} color="#0d9488" />
                    <span>{lang === 'es' ? 'Reglamento UE 1223/2009 (CPNP)' : 'EU Reg. 1223/2009 (CPNP)'}</span>
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <Sparkles size={13} color="#2563eb" />
                    <span>{lang === 'es' ? 'Testado Dermatológicamente' : 'Dermatologically Tested'}</span>
                  </span>
                </>
              )}
              <span className="pds-version-tag" title={`Clinical Monograph Revision ${versionInfo.version}`}>
                <span className="pds-version-dot" />
                <span>Rev {versionInfo.version}</span>
              </span>
              <span className="pds-updated-tag" title="Verified specification release date">
                <span>{lang === 'es' ? 'Actualizado:' : 'Updated:'} {versionInfo.updatedAtDate}</span>
              </span>
              {initialBatch && !isCorporateService && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #6ee7b7',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  <ShieldCheck size={13} color="#059669" />
                  <span>{lang === 'es' ? 'Lote Verificado:' : 'Batch Verified:'}</span>
                  <code style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857' }}>{initialBatch}</code>
                </span>
              )}
            </>
          }
          title={name}
          description={
            <>
              {/* 🏛️ FDA Commercial Reference Brands Strip (Laptop & Mobile Responsive) */}
              {resolvedCommercialNames.length > 0 && (
                <div className="pds-commercial-brands-strip">
                  <div className="pds-cbs-label">
                    <span className="pds-cbs-icon">🏛️</span>
                    <span>{lang === 'es' ? 'Medicamentos Comerciales de Referencia (FDA):' : 'FDA Commercial Reference Brands:'}</span>
                  </div>
                  <div className="pds-cbs-chips">
                    {resolvedCommercialNames.map((brand, idx) => (
                      <span key={idx} className="pds-cbs-chip">
                        <span className="pds-cbs-chip-dot" />
                        <strong className="pds-cbs-chip-name">{brand}</strong>
                        <span className="pds-cbs-chip-tag">FDA Approved</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <span style={{ display: 'block', fontSize: '0.96rem', color: '#475569', marginBottom: '0.45rem' }}>
                <strong style={{ color: '#0f172a' }}>
                  {isCorporateService
                    ? (lang === 'es' ? 'Marco Normativo y Alcance:' : 'Statutory Framework & Scope:')
                    : isSolventProduct 
                      ? (lang === 'es' ? 'Función en el Compendio:' : 'Compendium Function:') 
                      : isDiagnosticKit 
                        ? (lang === 'es' ? 'Utilidad Diagnóstica y Aplicación:' : 'Diagnostic Utility & Target Axis:') 
                        : (t.targetReceptorAxis || 'Target Receptor Axis:')}
                </strong>{' '}
                {targetSystem}
              </span>

              {/* ── Google Cloud UX Action Buttons Strip ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '0.65rem',
                marginBottom: '0.65rem',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={handleCopyMonographSpecs}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                  title={lang === 'es' ? 'Copiar ficha técnica monográfica al portapapeles' : 'Copy technical monograph to clipboard'}
                >
                  {copiedMonograph ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                  <span>{copiedMonograph ? (lang === 'es' ? 'Copiado ✓' : 'Copied ✓') : (lang === 'es' ? 'Copiar Ficha Técnica' : 'Copy Spec Sheet')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                  title={lang === 'es' ? 'Imprimir o guardar ficha técnica en PDF' : 'Print or save technical monograph to PDF'}
                >
                  <Printer size={13} />
                  <span>{lang === 'es' ? 'Ficha Imprimible (PDF)' : 'Print / PDF Monograph'}</span>
                </button>
              </div>

              {isBloodoDiagnostic && (
                <BloodoSuiteNav currentSlug={slug || product?.slug} lang={lang} variant="chips" />
              )}
            </>
          }
          meta={
            <>
              {/* 🏛️ FDA Approved Commercial Formulations Detail Card (Laptop & Mobile) */}
              {resolvedCommercialProducts.length > 0 && (
                <div className="pds-commercial-products-card">
                  <div className="pds-cpc-header">
                    <div className="pds-cpc-title-wrap">
                      <ShieldCheck size={16} color="#16a34a" />
                      <h3 className="pds-cpc-title">
                        {lang === 'es' ? 'Fármacos Comerciales Aprobados por FDA (Especialidades de Referencia)' : 'FDA-Approved Commercial Products (Reference Formulations)'}
                      </h3>
                    </div>
                    <span className="pds-cpc-badge">
                      {resolvedCommercialProducts.length} {lang === 'es' ? 'Especialidades Registradas' : 'Registered Brands'}
                    </span>
                  </div>

                  <div className="pds-cpc-grid">
                    {resolvedCommercialProducts.map((cp, idx) => (
                      <div key={idx} className="pds-cpc-item">
                        <div className="pds-cpc-item-top">
                          <span className="pds-cpc-item-brand">{cp.brandName}</span>
                          {cp.fdaApprovalYear && (
                            <span className="pds-cpc-item-year">FDA {cp.fdaApprovalYear}</span>
                          )}
                        </div>

                        {cp.sponsor && (
                          <div className="pds-cpc-item-sponsor">
                            🏢 {cp.sponsor}
                          </div>
                        )}

                        {cp.primaryIndication && (
                          <div className="pds-cpc-item-indication">
                            <strong>{lang === 'es' ? 'Indicación FDA:' : 'FDA Indication:'}</strong> {cp.primaryIndication}
                          </div>
                        )}

                        <div className="pds-cpc-item-meta">
                          {cp.route && <span>💉 {cp.route}</span>}
                          {cp.dosageForms && (
                            <>
                              <span style={{ opacity: 0.4 }}>•</span>
                              <span>📦 {cp.dosageForms}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {description && (
                <div className="pds-description-card" style={{ marginTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2 className="pds-section-heading" style={{ margin: 0 }}>
                      {isCorporateService
                        ? (lang === 'es' ? 'Resumen Ejecutivo y Estructura Legal' : 'Executive Legal & Operational Overview')
                        : isDiagnosticKit 
                          ? (lang === 'es' ? 'Descripción Clínica del Biomarcador y Utilidad' : 'Clinical Biomarker Overview & Diagnostic Utility') 
                          : (t.pharmacologicalOverview || 'Pharmacological Overview')}
                    </h2>
                    {isTranslating ? (
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, backgroundColor: '#f0f9ff', padding: '3px 10px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <Sparkles size={13} className="spin" /> {lang === 'es' ? 'Traduciendo...' : (t.translating || 'Translating…')}
                      </span>
                    ) : lang !== 'en' && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <Sparkles size={11} color="#0284c7" /> {lang === 'es' ? 'Traducción Asistida' : 'Verified Translation'}
                      </span>
                    )}
                  </div>
                  <p className="pds-description-body">{description}</p>
                </div>
              )}
            </>
          }
          desktopSecondary={
            diagnosticHeroImage ? (
              <div 
                className="pds-hero-square-showcase"
                onClick={() => setIsImageModalOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsImageModalOpen(true); }}
                title={lang === 'es' ? 'Haz clic para ampliar la imagen del kit oficial' : 'Click to inspect official kit packaging'}
              >
                {/* 1. Frosted Glass Top Badges */}
                <div className="pds-square-badge-strip">
                  <div className="pds-square-frosted-pill">
                    <ShieldCheck size={13} color="#0d9488" />
                    <span>
                      {isEternaDiagnostic
                        ? (lang === 'es' ? 'Kit Oficial ETERNA DX' : 'Official ETERNA DX Kit')
                        : (lang === 'es' ? 'Kit Oficial Bloodo™' : 'Official Bloodo™ Kit')}
                    </span>
                  </div>
                  <div className="pds-square-zoom-btn" title={lang === 'es' ? 'Ampliar imagen' : 'Enlarge image'}>
                    <ZoomIn size={14} />
                  </div>
                </div>

                {/* 2. Studio Lighting Square Viewport */}
                <div className="pds-square-img-viewport">
                  <img
                    src={diagnosticHeroImage}
                    alt={name}
                    className="pds-square-product-img"
                    loading="eager"
                  />
                </div>

                {/* 3. High-End Technical Spec Strip */}
                <div className="pds-square-footer-spec">
                  <div className="pds-square-lab-row">
                    <span className="pds-square-lab-name">
                      {isEternaDiagnostic ? 'Fagron Genomics / European Lab' : 'LifeLab1 Central Lab (Vilnius)'}
                    </span>
                    <span className="pds-square-ce-tag">
                      {isEternaDiagnostic ? 'CE-IVD' : 'CE-IVDR'}
                    </span>
                  </div>
                  <div className="pds-square-sub-meta">
                    <span>{isEternaDiagnostic ? 'Saliva DNA Buffer' : 'Whatman® 903 Card'}</span>
                    <span>•</span>
                    <span>{isEternaDiagnostic ? '+700K Microarray' : 'Capillary DBS LC-MS'}</span>
                  </div>
                </div>
              </div>
            ) : null
          }
          mobileSecondary={
            diagnosticHeroImage ? (
              <div 
                className="pds-hero-mobile-square-card"
                onClick={() => setIsImageModalOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div className="pds-mobile-square-thumb-wrap">
                  <img
                    src={diagnosticHeroImage}
                    alt={name}
                    className="pds-mobile-square-thumb"
                    loading="eager"
                  />
                </div>
                <div className="pds-mobile-square-content">
                  <div className="pds-mobile-square-badge">
                    <ShieldCheck size={11} color="#0d9488" />
                    <span>
                      {isEternaDiagnostic
                        ? (lang === 'es' ? 'Kit Oficial ETERNA DX' : 'Official ETERNA DX Kit')
                        : (lang === 'es' ? 'Kit Oficial Bloodo™' : 'Official Bloodo™ Kit')}
                    </span>
                  </div>
                  <strong className="pds-mobile-square-title">
                    {isEternaDiagnostic ? 'Fagron Genomics / European Lab' : 'LifeLab1 Clinical Laboratory'}
                  </strong>
                  <span className="pds-mobile-square-sub">
                    {isEternaDiagnostic ? 'CE-IVD Certified · Saliva DNA Kit' : 'CE-IVDR Certified · Whatman® 903 Card'}
                  </span>
                </div>
                <div className="pds-mobile-square-action">
                  <ZoomIn size={16} color="#0284c7" />
                </div>
              </div>
            ) : null
          }
        />
        {isEternaDiagnostic && (
          <EternaPublicOverviewShowcase
            product={product}
            lang={lang}
            onSelectSection={handleSelectSection}
          />
        )}
        {isSupplementProduct && (
          <SupplementPublicOverviewShowcase
            product={product}
            lang={lang}
            onSelectSection={handleSelectSection}
          />
        )}
        <ProductOverviewQuickNav
          sections={tocSections}
          activeSection={effectiveActiveSection}
          onSelectSection={handleSelectSection}
          lang={lang}
        />
        </div>
      ) : (
        <div className="pds-single-section-view">
          <ProductSectionHeaderBanner
            productName={name}
            category={category}
            activeSection={effectiveActiveSection}
            sections={tocSections}
            onSelectSection={handleSelectSection}
            lang={lang}
          />

          {effectiveActiveSection === 'presentations-matrix' && (
            <PresentationsMatrixSection
              product={product}
              slug={slug}
              lang={lang}
              t={t}
              isCorporateService={isCorporateService}
              isDiagnosticKit={isDiagnosticKit}
              isSolventProduct={isSolventProduct}
              isSupplementProduct={isSupplementProduct}
              isCosmeticProduct={isCosmeticProduct}
              isPenOrCart={isPenOrCart}
              isSprayFormat={isSprayFormat}
              isCartridgeFormat={isCartridgeFormat}
              isPenFormat={isPenFormat}
              isPenAndCartridgeEcosystem={isPenAndCartridgeEcosystem}
              distinctCartridgeFmt={distinctCartridgeFmt}
              distinctPenFmt={distinctPenFmt}
              isMultiSupplierMode={isMultiSupplierMode}
              suppliersList={suppliersList}
              activeSupplierId={activeSupplierId}
              setActiveSupplierId={setActiveSupplierId}
              availableFormats={availableFormats}
              activeFormatId={activeFormatId}
              setActiveFormatId={setActiveFormatId}
              rawFormats={rawFormats}
              filteredStrengths={filteredStrengths}
              sortedStrengths={sortedStrengths}
              selectedStrengthId={selectedStrengthId}
              setSelectedStrengthId={setSelectedStrengthId}
              selectedStrength={selectedStrength}
              packUnits={packUnits}
              setPackUnits={setPackUnits}
              realKitSavings={realKitSavings}
              displaySupplierName={displaySupplierName}
              matrixRows={matrixRows}
              getReconstitutionVolume={getReconstitutionVolume}
            />
          )}

    {/* ── Block 2: Corporate & Clinical Services or Reconstitution/Specs ── */}
          {effectiveActiveSection === 'reconstitution-section' && (
            <ReconstitutionRouterSection
              product={product}
              lang={lang}
              t={t}
              isSpainResidency={isSpainResidency}
              isCompoundingService={isCompoundingService}
              isPeptideSupplyService={isPeptideSupplyService}
              isUaeCorporateService={isUaeCorporateService}
              isSolventProduct={isSolventProduct}
              isEternaDiagnostic={isEternaDiagnostic}
              isDiagnosticKit={isDiagnosticKit}
              isIvDrip={isIvDrip}
              isCosmeticProduct={isCosmeticProduct}
              isSupplementProduct={isSupplementProduct}
              isPenOrCart={isPenOrCart}
              isSprayFormat={isSprayFormat}
              selectedStrength={selectedStrength}
              sortedStrengths={sortedStrengths}
              activeFormatId={activeFormatId}
              activeFormat={activeFormat}
              availableFormats={availableFormats}
              setActiveFormatId={setActiveFormatId}
              displaySupplierName={displaySupplierName}
              primaryProtocol={primaryProtocol}
              associatedProtocols={associatedProtocols}
              initialPhase={initialPhase}
              onOpenInquiry={handleOpenInquiry}
            />
          )}

      {/* ── Block 3: Analytical Certificate & Molecular Profile (Elevated Top-Level Section) ── */}
      {effectiveActiveSection === 'specs-section' && !isCorporateService && !isCosmeticProduct && (
        <section id="specs-section" className="pds-traceability-wrapper">
          <ProductTraceabilityCard
            product={product}
            baseUrl={baseUrl}
            lang={lang}
            monographUrl={dynamicPublicUrl}
            batchCode={effectiveBatchCode}
          />
        </section>
      )}

      {/* ── Peer-Reviewed Scientific Literature & Clinical Trials ── */}
      {effectiveActiveSection === 'publications-section' && !isCorporateService && !isDiagnosticKit && !isSolventProduct && !isCosmeticProduct && (
        <PeptidePublicationsSection product={product} lang={lang} />
      )}

      {/* ── Clinical Safety Profile: Contraindications & Precautions ── */}
      {effectiveActiveSection === 'contraindications-section' && !isCorporateService && !isDiagnosticKit && !isSolventProduct && !isCosmeticProduct && (
        <PeptideContraindicationsSection product={product} lang={lang} />
      )}

      {effectiveActiveSection === 'labels-section' && !isDiagnosticKit && !isCorporateService && !isCosmeticProduct && (
        <section id="labels-section" className="pds-section-card">
            <div className="pds-section-header">
              <div className="pds-section-header-left">
                <div className="pds-section-header-shield">
                  <QrCode size={22} />
                </div>
                <div className="pds-section-header-titles">
                  <div className="pds-section-header-meta-row">
                    <span className="pds-section-header-category">
                      {t.physicalLabelsSection || 'PHYSICAL VIAL LABELS & DISPENSING'}
                    </span>
                    <span className="pds-section-badge">
                      <CheckCircle2 size={11} /> 38×90mm THERMAL
                    </span>
                  </div>
                  <h3 className="pds-section-header-title">
                    {t.physicalLabelsSection || 'Physical Vial Labels & Batch Printing'}
                  </h3>
                </div>
              </div>

              <div className="pds-section-header-right">
                <div className="pds-section-cert-badge">
                  <Printer size={14} color="#38bdf8" />
                  <span>Thermal 38×90mm Ready</span>
                </div>
              </div>
            </div>

            <div className="pds-section-card-body" style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                {t.physicalLabelsSubtitle || 'Standard 38×90mm adhesive labels and batch sheets formatted for clinical and dispatch use.'}
              </p>

              {/* Dual Label Options Grid: Shipping vs Client Vial */}
              <div className="pds-dual-labels-grid">
                {/* Option 1: Shipping / Batch Traceability Label */}
                <div className="pds-label-type-card">
                  <div className="pds-label-type-head">
                    <span className="pds-label-badge-icon">📦</span>
                    <div>
                      <h4 className="pds-label-type-title">{t.shippingTraceabilityLabel || 'Shipping & Traceability Label'}</h4>
                      <span className="pds-label-use-tag">{t.outboundLogisticsTag || 'For Outbound Box & Logistics'}</span>
                    </div>
                  </div>
                  <p className="pds-label-type-desc">
                    {t.shippingLabelDesc || 'Discreet packaging label with high-density 1D barcode and QR code. Enables instant camera lookup of the digital monograph and laboratory certificate without displaying brand names.'}
                  </p>
                  <div className="pds-label-type-buttons">
                    <button 
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setPreviewModalTab('shipping');
                        setIsPreviewModalOpen(true);
                      }}
                      className="pds-btn pds-btn-gcp pds-btn-primary-action pds-btn-barcode"
                      title="Preview 38x90mm Shipping Label before printing"
                    >
                      <Eye size={15} className="pds-btn-icon" /> <span>{t.previewPrintLabel || 'Preview & Print 38×90mm'}</span>
                    </button>
                    <a 
                      href={`/api/vial-label/${encodeURIComponent(slug)}?format=sheet_a4&type=shipping&download=1${labelQueryString}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download={isMobileDevice ? undefined : `shipping_labels_sheet_${variantFileSuffix}_a4.pdf`}
                      onClick={() => handleDownloadClick('shipping_sheet')}
                      className={`pds-btn pds-btn-gcp pds-btn-secondary-action pds-btn-ghost ${downloadingType === 'shipping_sheet' ? 'loading' : ''}`}
                      style={downloadingType === 'shipping_sheet' ? { pointerEvents: 'none', opacity: 0.8 } : undefined}
                      title="Download A4 Sheet with 8 Shipping Labels (PDF File)"
                    >
                      {downloadingType === 'shipping_sheet' ? (
                        <><Loader2 size={15} className="pds-btn-icon animate-spin" /> <span>{t.downloadingState || 'Downloading...'}</span></>
                      ) : (
                        <><FileText size={15} className="pds-btn-icon" /> <span>Sheet (A4 ×8)</span></>
                      )}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyLabelUrl('shipping')}
                      className={`pds-btn pds-btn-gcp pds-btn-copy-action pds-btn-copy-label ${copiedLabelType === 'shipping' ? 'copied' : ''}`}
                      title="Copy direct shareable link to this shipping label"
                    >
                      {copiedLabelType === 'shipping' ? (
                        <><Check size={14} className="pds-btn-icon text-success" /> <span>{t.copied || 'Copied Link'}</span></>
                      ) : (
                        <><Copy size={14} className="pds-btn-icon" /> <span>{t.copyDirectLabelLink || 'Copy Link'}</span></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Option 2: Client Vial Application Label */}
                <div className="pds-label-type-card highlight">
                  <div className="pds-label-type-head">
                    <span className="pds-label-badge-icon">🏷️</span>
                    <div>
                      <h4 className="pds-label-type-title">
                        {isPenOrCart
                          ? (lang === 'es' ? 'Etiqueta de Bolígrafo / Cartucho' : 'Patient Pen / Cartridge Label')
                          : (t.clientVialLabelTitle || 'Patient Vial Label')}
                      </h4>
                      <span className="pds-label-use-tag active">
                        {isPenOrCart
                          ? (lang === 'es' ? 'Dispensación para Paciente (SubQ Pen)' : 'For Patient Dispensing (SubQ Pen)')
                          : (t.patientSubqTag || 'For Patient Dispensing (SubQ)')}
                      </span>
                    </div>
                  </div>
                  <p className="pds-label-type-desc">
                    {isPenOrCart
                      ? (lang === 'es'
                          ? 'Etiqueta clínica de alta adherencia para bolígrafos y cartuchos de recambio. Muestra potencia de la formulación, lote estéril, instrucciones de dosificación por dial y QR de verificación directa.'
                          : 'High-adhesion clinical label for patient dial pens and refill cartridges. Displays formulation potency, sterile batch number, dial dosage instructions, and direct-lookup verification QR.')
                      : (t.clientVialLabelDesc || 'High-adhesion clinical vial label for patient vials. Displays formulation potency, sterile batch number, reconstitution instructions, and direct-lookup verification QR.')}
                  </p>
                  <div className="pds-label-type-buttons">
                    <button 
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setPreviewModalTab('client');
                        setIsPreviewModalOpen(true);
                      }}
                      className="pds-btn pds-btn-gcp pds-btn-primary-action pds-btn-pdf"
                      title="Preview 38x90mm Client Vial Label before printing"
                    >
                      <Eye size={15} className="pds-btn-icon" /> <span>{t.previewPrintLabel || 'Preview & Print 38×90mm'}</span>
                    </button>
                    <a 
                      href={`/api/vial-label/${encodeURIComponent(slug)}?format=sheet_a4&type=client&download=1${labelQueryString}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download={isMobileDevice ? undefined : `client_vial_labels_sheet_${variantFileSuffix}_a4.pdf`}
                      onClick={() => handleDownloadClick('client_sheet')}
                      className={`pds-btn pds-btn-gcp pds-btn-secondary-action pds-btn-ghost ${downloadingType === 'client_sheet' ? 'loading' : ''}`}
                      style={downloadingType === 'client_sheet' ? { pointerEvents: 'none', opacity: 0.8 } : undefined}
                      title="Download A4 Sheet with 8 Client Vial Labels (PDF File)"
                    >
                      {downloadingType === 'client_sheet' ? (
                        <><Loader2 size={15} className="pds-btn-icon animate-spin" /> <span>{t.downloadingState || 'Downloading...'}</span></>
                      ) : (
                        <><FileText size={15} className="pds-btn-icon" /> <span>Sheet (A4 ×8)</span></>
                      )}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyLabelUrl('client')}
                      className={`pds-btn pds-btn-gcp pds-btn-copy-action pds-btn-copy-label ${copiedLabelType === 'client' ? 'copied' : ''}`}
                      title="Copy direct shareable link to this client vial label"
                    >
                      {copiedLabelType === 'client' ? (
                        <><Check size={14} className="pds-btn-icon text-success" /> <span>{t.copied || 'Copied Link'}</span></>
                      ) : (
                        <><Copy size={14} className="pds-btn-icon" /> <span>{t.copyDirectLabelLink || 'Copy Link'}</span></>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Scannable Label Preview */}
              <div className="pds-vial-label-preview-wrap">
                <img
                  src={`/api/barcode/${encodeURIComponent(slug)}?supplier=${encodeURIComponent(getConcreteSupplierId(activeSupplierId, supplierName))}&batch=${encodeURIComponent(effectiveBatchCode)}`}
                  alt={`Vial Dispensing Label for ${product?.canonicalName || product?.name || slug}`}
                  className="pds-vial-label-img"
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Block 4.5: Analytical Quality Verification & Clinical Dosing Parameters (EQNO Inspired) ── */}
        {effectiveActiveSection === 'analytical-specs' && !isCorporateService && !isDiagnosticKit && !isSolventProduct && !isCosmeticProduct && !isSupplementProduct && (
          <PeptideAnalyticalSpecsCard
            product={product}
            selectedStrength={selectedStrength}
            lang={lang}
            onOpenCoa={() => setIsCoaModalOpen(true)}
          />
        )}

        {/* ── Block 4.8: Bloodo™ Clinical Diagnostic FAQ & WhatsApp Share ── */}
        {effectiveActiveSection === 'nad-clinical-faq' && !isCosmeticProduct && (isDiagnosticKit || isBloodoDiagnostic || product?.slug?.includes('bloodo') || product?.canonicalKey?.includes('bloodo') || (Array.isArray(product?.clinical_faq) && product.clinical_faq.length > 0)) && (
          <BloodoNadFaqCard product={product} lang={lang} />
        )}

        {/* ── Block 5: Targeted Therapeutic Peptides (Lotusland Limited) ── */}
        {effectiveActiveSection === 'related-peptides-section' && (
          <BloodoRelatedPeptidesSection product={product} lang={lang} />
        )}

        {/* ── Block 6: Bloodo™ Diagnostic Suite Switcher (All 6 Clinical DBS Tests) ── */}
        {effectiveActiveSection === 'bloodo-suite' && isBloodoDiagnostic && (
          <BloodoSuiteNav currentSlug={slug || product?.slug} lang={lang} variant="section" />
        )}

        {/* ── Block 7: In-Office Clinical Advantage (Capillary DBS vs Traditional Phlebotomy) ── */}
        {effectiveActiveSection === 'clinical-dbs-advantages' && (isBloodoDiagnostic || isDiagnosticKit) && (
          <BloodoClinicalAdvantageCard lang={lang} />
        )}

        {/* Diagnostic kit specific sub-sections */}
        {['diagnostic-specs', 'biomarker-simulator', 'collection-protocol', 'pre-analytical-prep', 'kit-contents'].includes(effectiveActiveSection) && (
          <section id={effectiveActiveSection} className="pds-section-card">
            <DiagnosticTestTechnicalSpecs
              product={product}
              selectedDose={selectedStrength?.name || 'Standard'}
              supplierName={displaySupplierName}
              lang={lang}
            />
          </section>
        )}

        {/* Cosmetic specific sub-sections */}
        {['clinical-evidence', 'inci-dossier', 'application-protocol', 'colway-system'].includes(effectiveActiveSection) && (
          <section id={effectiveActiveSection} className="pds-section-card">
            <CosmeticTechnicalSpecs
              product={product}
              lang={lang}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
            />
          </section>
        )}

        <ProductSectionFooterNav
          activeSection={effectiveActiveSection}
          sections={tocSections}
          onSelectSection={handleSelectSection}
          lang={lang}
        />
      </div>
    )}

    {/* ── Block 8: Product Regulatory Warnings & Safety Governance ── */}
        <ProductRegulatoryWarningsSection
          product={product}
          lang={lang}
          isCosmeticProduct={isCosmeticProduct}
          isDiagnosticKit={isDiagnosticKit || isBloodoDiagnostic}
          isSolventProduct={isSolventProduct}
          isCorporateService={isCorporateService}
          isSupplementProduct={isSupplementProduct}
          supplierName={supplierName}
        />

        {/* Institutional Regulatory Footnote */}
        <footer className="pds-page-footer">
          <div className="pds-footer-box">
            <p className="pds-footer-text">
              {isCosmeticProduct ? (
                <>
                  <strong>{lang === 'es' ? 'Gobernanza y Regulación Cosmética Europea:' : 'Quality & European Cosmetic Regulatory Governance:'}</strong>{' '}
                  {lang === 'es' 
                    ? `Distribuido a través del socio oficial autorizado (${supplierName}). Formulado de plena conformidad con el Reglamento Europeo (CE) Nº 1223/2009 sobre productos cosméticos y estándares de Buenas Prácticas de Fabricación ISO 22716. Expediente activo en el Portal Europeo CPNP. Testado dermatológicamente. Ficha técnica elaborada para orientación tricológica, cosmética y de cuidado personal.`
                    : `Sourced through authorized brand partner (${supplierName}). Formulated and packaged in full compliance with EU Cosmetic Regulation (EC) No 1223/2009 and ISO 22716 Cosmetic GMP standards. Notification active on the European CPNP. Dermatologically tested. This technical document is intended for trichological, cosmetic, and personal wellness advisory.`}
                </>
              ) : (isDiagnosticKit || isBloodoDiagnostic) ? (
                <>
                  <strong>{lang === 'es' ? 'Gobernanza y Regulación de Diagnóstico In Vitro:' : 'Quality & In Vitro Diagnostic Regulatory Governance:'}</strong>{' '}
                  {lang === 'es'
                    ? `Dispositivo de diagnóstico in vitro con marcado CE-IVD conforme a la Directiva 98/79/CE y el Reglamento Europeo (UE) 2017/746 (CE-IVDR). Procesamiento analítico cuantitativo ejecutado por laboratorio clínico acreditado (LifeLab1, certificación ISO 15189). Trazabilidad de muestra en sangre seca (Whatman 903). Destinado a profesionales sanitarios y seguimiento clínico.`
                    : `CE-IVD Marked in accordance with EU Directive 98/79/EC & Regulation (EU) 2017/746 (CE-IVDR). Analytical processing performed by accredited central clinical laboratory (LifeLab1, ISO 15189 certified). Quantitative blood spot analytical reports delivered via secure encrypted clinical portal.`}
                </>
              ) : isSolventProduct ? (
                <>
                  <strong>{lang === 'es' ? 'Estándares de Calidad & Solvente Estéril:' : 'Sterile Solvent & Quality Governance:'}</strong>{' '}
                  {lang === 'es'
                    ? `Diluyente estéril preparado bajo estándares de Farmacopea Europea (Ph. Eur.) y cGMP para reconstitución de péptidos liofilizados. Control de endotoxinas (<0.25 EU/mL) con 0.9% de alcohol bencílico como conservante bacteriostático. Uso en reconstitución clínica y farmacia de compounding.`
                    : `Pharmaceutical-grade sterile bacteriostatic diluent manufactured under EU GMP / cGMP standards. Multi-dose vial preserved with 0.9% benzyl alcohol. Endotoxin tested (<0.25 EU/mL). Intended for aseptic peptide and lyophilized compound reconstitution.`}
                </>
              ) : isSupplementProduct ? (
                <>
                  <strong>{lang === 'es' ? 'Gobernanza y Regulación de Suplementos Clínicos:' : 'Clinical Supplement Quality & Regulatory Governance:'}</strong>{' '}
                  {lang === 'es'
                    ? `Fabricado y envasado bajo normativa europea de complementos alimenticios (Directiva 2002/46/CE) y directrices cGMP / ISO 22000. Cápsulas vegetales gastrorresistentes HPMC sin gluten, sin lactosa y libres de alérgenos. Lotes analizados por terceros para pureza, metales pesados y ausencia de contaminantes microbiológicos. Formulado para profesionales sanitarios y optimización metabólica.`
                    : `Manufactured and packaged in strict compliance with EU Dietary Supplements Directive 2002/46/EC and cGMP / ISO 22000 standards. Acid-resistant HPMC vegetable capsules, gluten-free, lactose-free, and allergen-free. Third-party tested for purity, heavy metals, and microbiological safety. Intended for healthcare practitioners and clinical nutritional optimization.`}
                </>
              ) : isCorporateService ? (
                <>
                  <strong>{lang === 'es' ? 'Cumplimiento Legal & Marco Corporativo:' : 'Corporate & Regulatory Governance:'}</strong>{' '}
                  {lang === 'es'
                    ? `Servicios corporativos gestionados conforme a la Ley 14/2013 y marco normativo europeo y emiratí. Diligencia debida, custodia fiduciaria y cumplimiento societario coordinado a través de despachos colegiados y socios institucionales.`
                    : `Corporate acquisition and residency programs are processed under Spanish Law 14/2013 / UAE Corporate Framework. Comprehensive due diligence and institutional escrow compliance handled through verified institutional partners.`}
                </>
              ) : (
                <>
                  <strong>Quality & Regulatory Governance:</strong> Sourced through authorized synthesis partner ({supplierName}). All analytical batches undergo independent dual-column RP-HPLC and LC-MS release testing meeting pharmacopeial grade standards. This technical document is intended exclusively for authorized medical professionals, clinical researchers, and institutional partners.
                </>
              )}
            </p>
            <p className="pds-footer-meta">
              Document Ref: PDS-{slug.toUpperCase()}-2026 • Rev {versionInfo.version} • {lang === 'es' ? 'Actualizado:' : 'Updated:'} {versionInfo.updatedAtDate} • Verified on Atlas Health Clinical Engine • {new Date().getFullYear()} ATLAS HEALTH Clinical Portal
            </p>
            {isStrictlyLotusland && (
              <p style={{ marginTop: '6px', fontSize: '0.6rem', color: '#94a3b8', opacity: 0.55, lineHeight: 1.4 }}>
                {lang === 'es' ? 'Fabricación externalizada: ' : 'Contract manufacturer: '}
                <a
                  href="https://drive.google.com/file/d/1GbqhKnRbBgNcvH5E87iYFmmaurnVQnAv/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  Hotide Biotech — Quality Methodology &amp; U.S. Regulatory Compliance
                </a>
              </p>
            )}
          </div>
        </footer>
          </div>

          {/* Specialized Google Cloud Console Product Sidebar (Desktop Sticky + Mobile Drawer) */}
          <ProductDetailSidebar 
            sections={tocSections} 
            lang={lang} 
            product={product}
            slug={slug || product?.slug}
            effectiveBatchCode={effectiveBatchCode}
            associatedProtocols={associatedProtocols}
            onOpenPreviewModal={() => setIsPreviewModalOpen(true)}
            onOpenCoaModal={() => setIsCoaModalOpen(true)}
            onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
            isDiagnosticKit={isDiagnosticKit}
            isBloodoDiagnostic={isBloodoDiagnostic}
            isCosmeticProduct={isCosmeticProduct}
            isSolventProduct={isSolventProduct}
            isCorporateService={isCorporateService}
            isSupplementProduct={isSupplementProduct}
            hideFloatingTrigger={true}
            activeSection={effectiveActiveSection}
            onSelectSection={handleSelectSection}
          />
        </div>
      </PublicPageShell>
      )}

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
        initialBatch={effectiveBatchCode}
        version={versionInfo.version}
        updatedAtDate={versionInfo.updatedAtDate}
        isCosmetic={isCosmeticProduct}
        initialTab={previewModalTab}
      />

      {/* Printable Lot Quality Certificate of Analysis (COA) Modal */}
      <CoaModal
        isOpen={isCoaModalOpen}
        onClose={() => setIsCoaModalOpen(false)}
        product={product}
        variant={selectedStrength}
      />

      {/* Sandboxed Public Atlas AI Research Copilot */}
      <PublicAtlasAIDrawer
        lang={lang}
        hideFloatingTrigger={true}
        contextType={isSpainResidency ? "corporate_residency" : isCompoundingService ? "compounding_service" : isPeptideSupplyService ? "peptide_supply_service" : isDiagnosticKit ? "diagnostic_test" : "monograph"}
        contextAnchor={{
          name: isSpainResidency 
            ? 'Spanish Corporate Acquisition & Law 14/2013 Residence Program'
            : isCompoundingService
            ? 'European Pharmaceutical Compounding & Custom Formulation Service'
            : isPeptideSupplyService
            ? 'B2B Peptide Supply Chain & Dedicated Inventory Management Service'
            : isDiagnosticKit
            ? (product?.canonicalName || product?.name || 'Bloodo™ CE-IVDR Intracellular NAD+ Blood Test Kit')
            : (product?.canonicalName || product?.name || 'Peptide Monograph'),
          slug: slug,
          cas: product?.cas || (isCompoundingService ? 'EU GMP / Ph. Eur.' : isPeptideSupplyService ? 'B2B Certified Stock' : isDiagnosticKit ? 'CE-IVDR / Whatman 903' : 'N/A'),
          purity: isSpainResidency ? '100% S.L. Legal Ownership & Clean Due Diligence' : isCompoundingService ? 'EU GMP & Ph. Eur. Certified Compounding Pharmacy' : isPeptideSupplyService ? '≥ 99.0% (HPLC & Mass Spectrometry Certified In-Stock Inventory)' : isDiagnosticKit ? 'CE-IVDR · LifeLab1 (CV ≤ 6.6%)' : (product?.purity || '≥ 99.0% (Dual-Stage RP-HPLC Verified)'),
          category: isSpainResidency ? 'Corporate Services' : isCompoundingService ? (lang === 'es' ? 'Compounding Farmacéutico' : 'Pharmaceutical Compounding') : isPeptideSupplyService ? (lang === 'es' ? 'Suministro de Péptidos' : 'Peptide Supply Management') : isDiagnosticKit ? 'Diagnostic Kits' : (product?.category || 'Peptides'),
          faq: product?.clinical_faq || product?.faq || [],
          associatedProtocols: (associatedProtocols || []).map(p => ({
            name: p.name || p.title,
            slug: p.slug,
            url: `/proto/${p.slug}`,
            goal: p.goal || p.category,
            duration: p.duration
          })),
          details: isSpainResidency ? {
            program: 'Spanish Corporate Acquisition & Law 14/2013 Residence',
            statutoryBasis: 'Law 14/2013 of September 27 (Articles 68 to 72)',
            resolutionWindow: '20 business days statutory decision window (UGE-CE)',
            initialPermit: '3 full years initial residence card (renewable +2 years)',
            schengenMobility: '29 Schengen countries free visa-free border mobility',
            ownership: '100% legal ownership of an existing debt-free Spanish S.L. (Sociedad Limitada)',
            physicalPresence: 'No strict 183-day stay required to maintain/renew permit',
            remoteExecution: 'Full remote execution through consular Power of Attorney (PoA)',
          } : isCompoundingService ? {
            service: 'European Pharmaceutical Compounding & Custom Formulation',
            pharmacyStandards: 'EU Ph. Eur. & GMP Certified European Compounding Laboratory',
            orderChannels: 'Dedicated Mobile Application or Direct Email to kasia@mediluxeme.com / business@atlas-services.com',
            turnaroundTime: '5 to 7 working days from European compounding facility to destination',
            invoicingFlexibility: 'Clinic Wholesale Price (if clinic pays) vs Recommended Patient Price RRP (if patient pays directly)',
            destinationFlexibility: 'Shipped directly to Clinic or dropshipped to Patient home address with validated cold-chain',
            shippingFeeRules: '200 to 400 AED standard shipping; 100% Free Shipping on orders of 10 or more products',
            paymentOptions: 'European Bank SEPA / Wire or Secure Payment Link via email, EUR currency (converted to AED on invoice date)'
          } : isPeptideSupplyService ? {
            service: 'B2B Peptide Supply Chain & Dedicated Inventory Management',
            stockStatus: 'Pre-certified in-stock HPLC ≥99% inventory ready for immediate allocation with ZERO manufacturing delay (24-48h dispatch)',
            accountManager: 'Dedicated personal Account Manager assigned to every clinic as clinical and logistical concierge',
            lotLocking: 'Lot-locking guarantee ensuring consistent lot number for patient multi-month cycles',
            invoicingFlexibility: 'Clinic B2B Wholesale Billing vs Direct Patient RRP Invoicing',
            deliveryFlexibility: 'Bulk refrigerated delivery to Clinic OR individual cold dropship to Patient residence',
            shippingFeeRules: '100% Free Complimentary Air Freight on orders of 10 or more vials (200-400 AED on smaller orders)',
            directHotline: 'VIP WhatsApp and telephone concierge'
          } : {
            category: isSolventProduct ? 'Sterile Reconstitution Solvent' : isDiagnosticKit ? 'CE-IVDR Clinical Diagnostic Test' : (product?.category || 'Peptides'),
            targetReceptorAxis: targetSystem || 'Pharmacological target receptors',
            overview: description || '',
            storage: isSolventProduct ? '2-25°C unopened, 2-8°C refrigerated after puncture. Discard after 28 days.' : isDiagnosticKit ? 'Ambient 15-25°C dry storage. Dried blood spot stable up to 14 days at room temp.' : '2-8°C (Lyophilized), -20°C (Long term), Reconstituted refrigerated 2-8°C, discard after 28 days',
            reconstitution: isSolventProduct ? 'Pure diluent solvent for lyophilized peptide reconstitution' : isDiagnosticKit ? 'No reconstitution required. Direct capillary dried blood spot (DBS) collection.' : '1.0mL - 2.0mL sterile bacteriostatic water (0.9% benzyl alcohol)',
            activeSupplier: displaySupplierName || (isDiagnosticKit ? 'LifeLab1 / Bloodo' : 'Lotusland Limited / Atlas Services'),
            availableFormulations: (matrixRows || []).slice(0, 8).map(r => ({
              strength: r.strengthName,
              format: r.formatName,
              diluent: r.diluentText,
              concentration: r.concText,
              route: r.adminText,
              purity: r.purity,
              laboratory: r.supplierName
            })),
            indexedClinicalPublications: (product?.articles || product?.publications || []).map(a => ({
              title: a.title,
              journal: a.journal,
              year: a.year,
              pmid: a.pmid,
              keyFindings: a.keyFindings || a.clinicalSummary || a.abstract || ''
            }))
          }
        }}
        storageKey={isDiagnosticKit ? `diagnostic_${slug}` : `monograph_${slug}`}
        onOpenRegisterModal={() => {
          window.open('/auth/login?register=true', '_blank');
        }}
      />

      {/* Context-Aware Inquiry Drawer: Dedicated Visa Questionnaire for Corporate, Clinical Drawer for Peptides */}
      {isSpainResidency ? (
        <CorporateResidencyInquiryDrawer
          isOpen={isInquiryDrawerOpen}
          onClose={() => setIsInquiryDrawerOpen(false)}
          initialEntity={{
            name: product?.canonicalName || product?.name || 'Spanish Corporate Acquisition & Law 14/2013 Residence Program',
            slug: slug,
            category: 'Corporate Services'
          }}
          lang={lang}
        />
      ) : (
        <PublicInstitutionalInquiryDrawer
          isOpen={isInquiryDrawerOpen}
          onClose={() => setIsInquiryDrawerOpen(false)}
          contextType={isCompoundingService ? 'compounding' : isPeptideSupplyService ? 'supply' : 'product'}
          initialEntity={{
            name: product?.canonicalName || product?.name || slug,
            slug: slug,
            strength: selectedStrength?.name || selectedStrengthId || '',
            category: isCompoundingService ? (lang === 'es' ? 'Compounding Farmacéutico' : 'Pharmaceutical Compounding') : isPeptideSupplyService ? (lang === 'es' ? 'Suministro de Péptidos' : 'Peptide Supply Management') : (product?.category || 'Peptides')
          }}
          lang={lang}
        />
      )}

      {/* Unified Persistent Sticky Bottom Action Bar (GCP Standard) */}
      <PublicStickyActionBar
        title={
          isSpainResidency
            ? (lang === 'es' ? 'Programa de Residencia y Adquisición Corporativa (Ley 14/2013)' : 'Spanish Corporate Acquisition & Law 14/2013 Residence Program')
            : isCompoundingService
            ? (lang === 'es' ? 'Servicio de Compounding Farmacéutico Europeo' : 'European Pharmaceutical Compounding Service')
            : isPeptideSupplyService
            ? (lang === 'es' ? 'Suministro de Péptidos B2B y Gestión de Inventario' : 'B2B Dedicated Peptide Supply Chain')
            : (product?.canonicalName || product?.name || slug)
        }
        subtitle={
          isDiagnosticKit
            ? (lang === 'es' ? 'Sangre Capilar (DBS) • Certificado CE-IVDR • LifeLab1' : 'Capillary Blood (DBS) • CE-IVDR Certified • LifeLab1')
            : isSpainResidency
            ? (lang === 'es' ? 'Programa Legal Ley 14/2013 • Resolución en 20 Días' : 'Law 14/2013 Statutory Program • 20-Day Fast Track')
            : isCompoundingService
            ? (lang === 'es' ? 'Formulaciones Personalizadas EU GMP & Ph. Eur.' : 'EU GMP & Ph. Eur. Certified Compounding Formulation')
            : isPeptideSupplyService
            ? (lang === 'es' ? 'Stock HPLC ≥99% Certificado • Envío 24-48h' : 'HPLC ≥99% Certified Inventory • 24-48h Dispatch')
            : `${selectedStrength?.name || ''}${product?.format ? ` · ${getHumanFormatName(product.format, lang)}` : ''} • ${lang === 'es' ? 'Pureza' : 'Purity'} ${product?.purity || '≥99%'}`.trim()
        }
        badge={
          isDiagnosticKit
            ? (lang === 'es' ? 'Test Diagnóstico' : 'Diagnostic Kit')
            : isSpainResidency
            ? (lang === 'es' ? 'Programa Legal' : 'Residency Program')
            : isCompoundingService
            ? 'Compounding'
            : isPeptideSupplyService
            ? (lang === 'es' ? 'Suministro B2B' : 'B2B Supply')
            : (lang === 'es' ? 'Monografía' : 'Peptide Monograph')
        }
        badgeType={isDiagnosticKit ? 'diagnostic' : 'default'}
        inquireLabel={
          isDiagnosticKit
            ? (lang === 'es' ? 'Consultar Test' : 'Inquire Test')
            : isSpainResidency
            ? (lang === 'es' ? 'Consultar Programa' : 'Inquire Program')
            : isCompoundingService
            ? (lang === 'es' ? 'Consultar Formulación' : 'Inquire Formulation')
            : isPeptideSupplyService
            ? (lang === 'es' ? 'Consultar Suministro' : 'Inquire Supply')
            : (lang === 'es' ? 'Consultar Producto' : 'Inquire Product')
        }
        onInquire={handleOpenInquiry}
        showClinicalAI={true}
        showSections={true}
        sectionsCount={isPeptideCompound ? 5 : tocSections.length}
        sectionsLabel={isPeptideCompound ? (lang === 'es' ? 'Pestañas' : 'Tabs') : null}
        onOpenSections={() => {
          if (typeof window !== 'undefined') {
            if (isPeptideCompound) {
              window.dispatchEvent(new CustomEvent('open-monograph-tabs-navigator'));
            } else {
              window.dispatchEvent(new CustomEvent('open-datasheet-toc'));
            }
          }
        }}
        lang={lang}
      />

      {/* Full-Screen Visual Kit Image Modal */}
      {diagnosticHeroImage && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageSrc={diagnosticHeroImage}
          altText={name}
        />
      )}
    </div>
  );
}


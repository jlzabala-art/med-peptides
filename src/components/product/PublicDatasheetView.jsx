"use client";

import './PublicDatasheetView.css';
import React, { useState, useEffect, useTransition, useRef, useMemo } from 'react';
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
  Printer
} from '@/lib/icons';
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
import DiagnosticTestTechnicalSpecs from './DiagnosticTestTechnicalSpecs';
import BloodoRelatedPeptidesSection from './BloodoRelatedPeptidesSection';
import EternaGeneticTechnicalSpecs from './EternaGeneticTechnicalSpecs';
import IvDripTechnicalSpecs from './IvDripTechnicalSpecs';
import FdaRegulatoryBadge from './FdaRegulatoryBadge';
import PeptidePublicationsSection from './PeptidePublicationsSection';
import UaeCompanySetupTechnicalSpecs from './UaeCompanySetupTechnicalSpecs';
import SpainCompanyResidencyTechnicalSpecs from './SpainCompanyResidencyTechnicalSpecs';
import VisualAdministrationGuide from './VisualAdministrationGuide';
import ShareProductMonographDrawer from '../admin/catalog/drawers/ShareProductMonographDrawer';
import MonographPreviewModal from './MonographPreviewModal';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicPageHero from '@/components/shared/public/PublicPageHero';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';
import { Mail, Lock } from 'lucide-react';
import { generateDiscreetBatchCode } from '../../utils/discreetBatchHelper';
import { prefetchPdf } from '../../utils/pdfPrefetch';
import { getHumanFormatName } from '../../utils/productVariantProcessing';
import { PUBLIC_APP_VERSION, getPublicVersionInfo } from '../../config/publicVersionConfig';

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
  initialLang = null,
  initialBatch = null,
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
  const [copied, setCopied] = useState(false);
  const [inlineSvg, setInlineSvg] = useState(null);
  const [svgError, setSvgError] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedLabelType, setCopiedLabelType] = useState(null);
  const [downloadingType, setDownloadingType] = useState(null);

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

  const isCorporateService = useMemo(() => {
    return isSpainResidency || isUaeCorporateService || product?.isCorporateService === true || product?.category === 'corporate_services' || product?.type === 'service';
  }, [isSpainResidency, isUaeCorporateService, product]);

  const [shortMonographUrl, setShortMonographUrl] = useState('');

  useEffect(() => {
    if (!slug) return;
    const fullUrl = `https://med-peptides.com/p/${slug}`;
    fetch('/api/short-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: fullUrl, entityType: 'datasheet', slug })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.shortUrl) setShortMonographUrl(data.shortUrl);
      })
      .catch(() => {});
  }, [slug]);

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

  const name = product?.name || product?.displayName || (isSolventProduct ? 'Bacteriostatic Water (BAC)' : (isEternaDiagnostic ? (product?.name || 'ETERNA™ Saliva DNA & Epigenetics') : (isDiagnosticKit ? 'Bloodo™ Clinical Diagnostic Test' : (isIvDrip ? (product?.title || 'Master IV Drip Formulation') : 'Clinical Peptide'))));
  const category = isSolventProduct 
    ? (lang === 'es' ? 'Solvente y Diluyente Estéril' : 'Sterile Reconstitution Solvent')
    : isDiagnosticKit
    ? (lang === 'es' ? 'Diagnóstico Clínico y Biomarcadores' : 'Clinical Diagnostics & Biomarkers')
    : isIvDrip
    ? (lang === 'es' ? 'Terapia Intravenosa y Nutrición Parenteral' : 'Sterile IV Infusion & Micronutrient Formulation')
    : getLocalizedCategory(product?.category || product?.therapeutic_category || 'Peptide', lang);
  const casNumber = isSolventProduct 
    ? '100-51-6 (Benzyl Alcohol USP)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Directiva CE-IVDR (UE 2017/746)' : 'CE-IVDR Directive (EU 2017/746)')
    : isIvDrip
    ? 'USP <797> Compounded Parenteral'
    : (product?.casNumber || product?.cas || 'Documented on Monograph');
  const formula = isSolventProduct 
    ? 'H₂O + C₇H₈O (0.9%)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Matriz: Sangre Capilar Seca (DBS)' : 'Matrix: Dried Blood Spot (DBS)')
    : isIvDrip
    ? `${product?.ingredients?.length || 12} Active Compounds (${product?.volume_ml || 50} mL)`
    : (product?.molecularFormula || product?.molecular_formula || product?.molecular?.molecularFormula || product?.molecular?.formula || null);
  const mw = isSolventProduct 
    ? '18.02 g/mol (H₂O)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Laboratorio Central: LifeLab1' : 'Central Laboratory: LifeLab1')
    : isIvDrip
    ? `Total Actives: ${(product?.totalActiveMg || 10000).toLocaleString()} mg`
    : (product?.molecularWeight || product?.molecular_weight || product?.molecular?.molecularWeight ? `${product.molecularWeight || product.molecular_weight || product?.molecular?.molecularWeight} g/mol` : null);
  const purity = isSolventProduct 
    ? 'USP Pharmacopeial Grade (Sterile)' 
    : isDiagnosticKit
    ? (lang === 'es' ? 'Precisión CV ≤ 6.6% (LoD 0.23 µmol/L)' : 'Precision CV ≤ 6.6% (LoD 0.23 µmol/L)')
    : isIvDrip
    ? 'USP <797> Sterile / ISO Class 5 Certified'
    : (product?.purity || '≥ 99.4% (RP-HPLC)');
  const sequence = (isSolventProduct || isDiagnosticKit || isIvDrip) ? null : (product?.sequence || product?.molecular?.sequence || null);
  const targetSystem = isSolventProduct
    ? (lang === 'es' ? 'Vehículo Estéril de Reconstitución de Péptidos (USP)' : 'Universal Sterile Peptide Reconstitution Vehicle (USP)')
    : isDiagnosticKit
    ? (lang === 'es' ? 'Monitoreo Cuantitativo de Biomarcadores y Longevidad Celular' : 'Cellular Longevity & Quantitative Biomarker Monitoring')
    : isIvDrip
    ? (lang === 'es' ? 'Optimización Celular, Inmunidad y Longevidad Intravenosa' : 'Parenteral Cellular Optimization, Immunity & Longevity')
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
    return supplierName || 'Certified Clinical Synthesis Laboratory';
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

    let volumeNum = 2.0;
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

  // Priority-ordered available formats: Prefilled Pen always comes before Cartridge / Refill
  const availableFormats = useMemo(() => {
    const list = sanitizedFormats.length > 0 ? [...sanitizedFormats] : [
      { id: 'vial', name: 'Lyophilized Subcutaneous Vial', strengths: sortedStrengths.map(s => s.id) }
    ];
    const getOrder = (id) => {
      const s = String(id || '').toLowerCase();
      if (s.includes('pen') && !s.includes('cartridge')) return 1;
      if (s.includes('vial')) return 2;
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
    // Prefer pre-filled pen over refill cartridge on initial load
    const penFmt = availableFormats.find(f => f.id.toLowerCase().includes('pen') && !f.id.toLowerCase().includes('cartridge'));
    return penFmt?.id || availableFormats[0]?.id || 'vial';
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

  const hasPenFormat = useMemo(() => {
    return availableFormats.some(f => (f.id || '').toLowerCase().includes('pen'));
  }, [availableFormats]);

  const hasCartridgeFormat = useMemo(() => {
    return availableFormats.some(f => (f.id || '').toLowerCase().includes('cartridge'));
  }, [availableFormats]);

  const isPenAndCartridgeEcosystem = hasPenFormat && hasCartridgeFormat;

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
    await navigator.clipboard.writeText(dynamicPublicUrl).catch(() => {});
    setCopied(true);
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
      `🔬 *${name}* — Clinical Pharmaceutical Monograph & Specifications\n\n` +
      `• *Formulation:* ${formatLabel}\n` +
      `• *Target Dose:* ${selectedStrength?.name || 'Standard'}\n` +
      `• *Synthesis Lab:* ${supplierName} (Verified Quality Standards) for Atlas Services\n` +
      `• *Analytical Release:* RP-HPLC Purity ${purityText} · ESI-MS Mass Verified\n` +
      `• *Receptor Target Axis:* ${targetText}\n` +
      adminLine +
      `• *Regulatory Class:* Clinical Research & Analytical Standard (Zero Impurities)\n\n` +
      `📑 *Access Clinical Monograph & Certificate of Analysis:*\n${dynamicPublicUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(pharmaMsg)}`, '_blank', 'noopener,noreferrer');
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
            purity: v?.purity || (isSolventProduct ? 'USP Grade (Sterile)' : (isDiagnosticKit ? 'CE-IVDR · LifeLab1 (CV 6.6%)' : '≥ 99.0% (RP-HPLC)')),
            supplierName: activeSupplierObj.name || 'Lotusland Limited',
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
              purity: v?.purity || (isSolventProduct ? 'USP Grade (Sterile)' : (isDiagnosticKit ? 'CE-IVDR · LifeLab1 (CV 6.6%)' : '≥ 99.0% (RP-HPLC)')),
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

  return (
    <div className="public-datasheet-root">
      {/* ── Fixed Executive Navigation (Tier 1 Only on Product Page) ── */}
      <PublicUnifiedHeader
        track="peptides"
        lang={lang}
        onLangChange={setLang}
        copyUrl={shortMonographUrl || dynamicPublicUrl}
        inquiryContextType="product"
        inquiryEntity={{
          name: product?.name || name,
          slug,
          code: effectiveBatchCode || '',
          strength: selectedStrengthId || '',
          category: category || 'Research Peptides'
        }}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
        loginRedirect={`/p/${encodeURIComponent(slug)}`}
        hideTier2={true}
        breadcrumb={[
          { label: lang === 'es' ? 'Catálogo de Productos' : 'Product Catalog', href: '/c/CAT-MU9L9GBN' },
          { label: product?.canonicalName || product?.name || name || 'Peptide Monograph' }
        ]}
      />

      {/* ── Standardized Clinical Page Shell ── */}
      <PublicPageShell>
        {/* Universal Clinical / Institutional Page Hero */}
        <PublicPageHero
          badges={
            <>
              <span className="pds-cat-tag">{category}</span>
              <span className="pds-cgmp-tag">
                {isCorporateService
                  ? (lang === 'es' ? 'Asesoramiento Institucional' : 'Institutional Advisory')
                  : isStrictlyLotusland 
                    ? (t.lotuslandVerified || 'Atlas Services Certified') 
                    : `${displaySupplierName} Quality Verified`}
              </span>
              {!isCorporateService && <FdaRegulatoryBadge product={product} variant="hero-pill" />}
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
                  <span>Batch Verified:</span>
                  <code style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857' }}>{initialBatch}</code>
                </span>
              )}
            </>
          }
          title={name}
          description={
            <>
              <span style={{ display: 'block', fontSize: '0.96rem', color: '#475569', marginBottom: '0.25rem' }}>
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
            </>
          }
          meta={description && (
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
        />

        {/* ── Multi-Formulation / Laboratory Switcher (Golden Rule #28 & #4) ── */}
        {!isCorporateService && !product?.isSingleSupplierLocked && Array.isArray(product?.availableSuppliers) && product.availableSuppliers.length > 1 && (
          <div style={{
            margin: '0 0 1.25rem 0',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'var(--surface-alt, #f8fafc)',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={16} color="#003666" />
              <span style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'es' ? 'Presentaciones de Laboratorio Certificadas:' : 'Certified Laboratory Formulations:'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.availableSuppliers.map(supp => {
                const isCurrent = (product.activeSupplierId || '').includes(supp.id.replace('supplier-', '')) || (product.supplierId || '').includes(supp.id.replace('supplier-', ''));
                const label = supp.isPen
                  ? (lang === 'es' ? '🖊️ Bolígrafo Precargado SubQ (Magenta)' : '🖊️ Pre-filled SubQ Pen (Magenta)')
                  : supp.isSpray
                    ? (lang === 'es' ? '👃 Spray Nasal Dosificado' : '👃 Metered Nasal Spray')
                    : (lang === 'es' ? '💉 Vial Liofilizado SubQ (Lotusland)' : '💉 Lyophilized SubQ Vial (Lotusland)');
                return (
                  <a
                    key={supp.id}
                    href={`/p/${encodeURIComponent(slug)}?supplier=${supp.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      background: isCurrent ? '#003666' : '#ffffff',
                      color: isCurrent ? '#ffffff' : '#334155',
                      border: isCurrent ? '1px solid #003666' : '1px solid #cbd5e1',
                      boxShadow: isCurrent ? '0 2px 4px rgba(0,54,102,0.15)' : 'none'
                    }}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Block 1: Batch Availability & Presentations Matrix (Harmonized Navy Header) ── */}
        {!isCorporateService && (
        <section id="presentations-matrix" className="pds-section-card">
          <div className="pds-section-header">
            <div className="pds-section-header-left">
              <div className="pds-section-header-shield">
                <Layers size={22} />
              </div>
              <div className="pds-section-header-titles">
                <div className="pds-section-header-meta-row">
                  <span className="pds-section-header-category">
                    {lang === 'es' ? 'DISPONIBILIDAD DE LOTE Y PRESENTACIONES' : 'BATCH AVAILABILITY & PRESENTATIONS'}
                  </span>
                  <span className="pds-section-badge">
                    <CheckCircle2 size={11} /> {t.clinicalCompendium || (lang === 'es' ? 'COMPENDIO CLÍNICO' : 'CLINICAL COMPENDIUM')}
                  </span>
                </div>
                <h3 className="pds-section-header-title">
                  {t.presentationsMatrix || 'Batch Availability & Presentations Matrix'} ({displaySupplierName})
                </h3>
              </div>
            </div>

            <div className="pds-section-header-right">
              <div className="pds-section-cert-badge">
                <Sparkles size={14} color="#38bdf8" />
                <span>{t.allApprovedPresentations || 'All Verified Presentations & Formats'}</span>
              </div>
            </div>
          </div>

          <div className="pds-section-card-body">

          {/* Multi-Supplier Laboratory Selector (Rendered ONLY if product has multiple verified suppliers) */}
          {isMultiSupplierMode && (
            <div className="pds-lab-filter-wrap" style={{ marginBottom: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={15} color="#003666" />
                  {t.verifiedLaboratories || 'Verified Manufacturing Laboratories:'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {suppliersList.length} {t.verifiedSourcesAvailable || 'verified sources available'}
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
                  🌐 {t.allLaboratoriesOverview || 'All Laboratories (Overview)'}
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
              let subtitle = t.formatSubVial || 'Lyophilized SubQ Cake (Sterile Vial)';
              if (isDiagnosticKit || fmt.id.includes('test') || fmt.id.includes('blood')) {
                icon = '🩸';
                subtitle = lang === 'es' ? 'Kit Diagnóstico Capilar DBS (CE-IVDR)' : 'Capillary DBS Diagnostic Kit (CE-IVDR)';
              } else if (isPen) {
                icon = '🖊️';
                subtitle = t.formatSubPen || 'Prefilled Multi-Dose Dial Device';
              } else if (isCartridge) {
                icon = '💉';
                subtitle = t.formatSubCart || '3 mL Multi-Dose Refill Cartridge';
              } else if (fmt.id.includes('spray')) {
                icon = '💨';
                subtitle = t.formatSubSpray || 'Intranasal Spray Device';
              } else if (fmt.id.includes('capsule') || fmt.id.includes('tablet')) {
                icon = '💊';
                subtitle = t.formatSubOral || 'Oral Gastro-Resistant Formulation';
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
              <span className="pds-sublabel">
                {isDiagnosticKit 
                  ? (lang === 'es' ? 'Presentación de Kit / Unidades:' : 'Kit Format / Sample Units:') 
                  : (t.selectAvailableStrength || 'Select Available Strength / Dose:')}
              </span>
              <span className="pds-count-badge">{filteredStrengths.length} {t.optionsAvailable || 'options available'}</span>
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

          {/* Refill Cross-Format Callouts (Pen vs 3 mL Refill Cartridge) */}
          {isPenAndCartridgeEcosystem && isPenFormat && (
            <div className="pds-refill-callout pds-refill-to-cartridge">
              <div className="pds-refill-callout-icon">💡</div>
              <div className="pds-refill-callout-content">
                <strong>{lang === 'es' ? '¿Ya dispones del aplicador Dial Pen?' : 'Already have the reusable Dial Pen device?'}</strong>
                <p>
                  {lang === 'es'
                    ? 'Ahorra en tus ciclos adquiriendo exclusivamente el Cartucho de Recambio (Refill 3 mL). El dispositivo aplicador es reutilizable y compatible con los recambios.'
                    : 'Save on ongoing therapy by purchasing the 3 mL Refill Cartridge. The pen device is fully reusable and accepts replacement cartridges.'}
                </p>
              </div>
              <button
                type="button"
                className="pds-refill-switch-btn"
                onClick={() => {
                  const cartFmt = availableFormats.find(f => (f.id || '').toLowerCase().includes('cartridge'));
                  if (cartFmt) {
                    setActiveFormatId(cartFmt.id);
                    triggerHaptic('selection');
                  }
                }}
              >
                <span>{lang === 'es' ? 'Ver Cartucho de Recambio' : 'Switch to Refill Cartridge'}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {isPenAndCartridgeEcosystem && isCartridgeFormat && (
            <div className="pds-refill-callout pds-refill-to-pen">
              <div className="pds-refill-callout-icon">🔄</div>
              <div className="pds-refill-callout-content">
                <strong>{lang === 'es' ? 'Cartucho de Recambio 3 mL (Refill)' : '3 mL Replacement Cartridge (Refill)'}</strong>
                <p>
                  {lang === 'es'
                    ? 'Este cartucho de vidrio pre-llenado requiere un bolígrafo dosificador compatible para su administración. Si es tu primer tratamiento o no tienes el aplicador, selecciona el Pen completo.'
                    : 'This pre-filled glass cartridge requires a compatible reusable dial pen for administration. If this is your first cycle or you need the device, select the Pre-filled Pen.'}
                </p>
              </div>
              <button
                type="button"
                className="pds-refill-switch-btn"
                onClick={() => {
                  const penFmt = availableFormats.find(f => (f.id || '').toLowerCase().includes('pen'));
                  if (penFmt) {
                    setActiveFormatId(penFmt.id);
                    triggerHaptic('selection');
                  }
                }}
              >
                <span>{lang === 'es' ? 'Ver Bolígrafo Completo' : 'View Complete Pen Device'}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {/* Intranasal Spray Callout */}
          {isSprayFormat && (
            <div className="pds-spray-callout">
              <div className="pds-spray-callout-icon">💨</div>
              <div className="pds-spray-callout-content">
                <strong>{lang === 'es' ? 'Sistema de Atomización Mucosal Intranasal (Sin Agujas)' : 'Intranasal Mucosal Atomization System (Needle-Free)'}</strong>
                <p>
                  {lang === 'es'
                    ? 'Formulación líquida isotónica calibrada para absorción directa a través de la mucosa nasal (vía olfatoria y trigémino direct-to-brain). Válvula dosificadora de 0.1 mL por spray. Cero reconstitución BAC.'
                    : 'Calibrated isotonic formulation engineered for direct mucosal absorption (olfactory and trigeminal direct-to-brain pathway). Sterile metered pump delivers 0.1 mL per spray. Zero BAC mixing required.'}
                </p>
              </div>
              <div className="pds-spray-callout-badge">
                <span>{lang === 'es' ? '0.1 mL / spray calibrado' : '0.1 mL metered puff'}</span>
              </div>
            </div>
          )}

          {/* Active Specification Detail Box */}
          <div className="pds-selected-detail-card">
            <div className="pds-detail-grid">
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Contenido del Kit' : 'Kit Contents') : (t.activeContent || 'Active Content')}</span>
                <span className="pds-dval font-bold text-sky-950">
                  {selectedStrength?.name || (isSolventProduct ? '30 mL' : isDiagnosticKit ? '1 Test / Kit' : '10 mg')}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Toma de Muestra' : 'Sample Collection') : (t.adminRoute || 'Administration Route')}</span>
                <span className="pds-dval">
                  {isSolventProduct 
                    ? (lang === 'es' ? 'Vehículo de Reconstitución (No Inyección Directa)' : 'Reconstitution Vehicle (Not for Direct Injection)')
                    : isDiagnosticKit
                      ? (lang === 'es' ? 'Punción Capilar en Dedo (3 gotas en tarjeta DBS)' : 'Capillary Fingerstick (3 spots on DBS Card)')
                      : isSprayFormat
                        ? (lang === 'es' ? 'Atomización Transmucosa Intranasal (Sin Agujas)' : 'Intranasal Transmucosal Atomization (Needle-Free)')
                        : isCartridgeFormat
                          ? (lang === 'es' ? 'Cartucho de Recambio 3 mL (Bolígrafo Reutilizable)' : '3 mL Refill Cartridge (Reusable Dial Pen)')
                          : isPenFormat
                            ? (lang === 'es' ? 'Inyección Subcutánea Micro-Dial (Selector Clics)' : 'Subcutaneous Micro-Dial Injection (Click Dial)')
                            : (t.subqPeriumbilical || 'Subcutaneous (SubQ) Periumbilical')}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">
                  {isSolventProduct 
                    ? (lang === 'es' ? 'Función Diluyente' : 'Diluent Function')
                    : isDiagnosticKit
                      ? (lang === 'es' ? 'Metodología Analítica' : 'Analytical Methodology')
                      : isSprayFormat
                        ? (lang === 'es' ? 'Mecanismo de Atomización' : 'Atomization Mechanism')
                        : isCartridgeFormat
                          ? (lang === 'es' ? 'Compatibilidad de Recambio' : 'Refill Compatibility')
                          : isPenFormat
                            ? (t.deviceDelivery || 'Device Delivery') 
                            : (t.recommendedRecon || 'Recommended Reconstitution')}
                </span>
                <span className="pds-dval">
                  {isSolventProduct ? (
                    <>
                      {lang === 'es' ? 'Solvente de Reconstitución Multidosis' : 'Universal Multi-Dose Peptide Diluent'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Diluir 1.0 – 3.0 mL en viales liofilizados' : 'Dilute 1.0 – 3.0 mL into lyophilized vials'}
                      </span>
                    </>
                  ) : isDiagnosticKit ? (
                    <>
                      {lang === 'es' ? 'Ensayo Cíclico Enzimático (Espectrofotometría)' : 'Enzymatic Cyclic Assay (Spectrophotometry)'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Rango Lineal 5.0–60.0 µmol/L · LoD: 0.23 µmol/L' : 'Linear Range 5.0–60.0 µmol/L · LoD: 0.23 µmol/L'}
                      </span>
                    </>
                  ) : isSprayFormat ? (
                    <>
                      {lang === 'es' ? 'Válvula Dosificadora 0.1 mL / spray' : 'Metered Mucosal Pump (0.1 mL / spray)'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Absorción directa Nose-to-Brain (Sin dilución BAC)' : 'Direct Nose-to-Brain Pathway (No BAC mixing)'}
                      </span>
                    </>
                  ) : isCartridgeFormat ? (
                    <>
                      {lang === 'es' ? 'Cartucho Sellado de Recambio 3 mL' : 'Pre-dissolved 3 mL Refill Cartridge'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Inserción directa en bolígrafo dosificador (0% mezcla BAC)' : 'Direct insertion into dial pen (Zero BAC mixing)'}
                      </span>
                    </>
                  ) : isPenFormat ? (
                    <>
                      {t.preDissolvedLiquid || 'Pre-dissolved SubQ Liquid (Ready to Use)'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {t.directDialInjection || 'Direct multi-dose dial injection (no BAC reconstitution required)'}
                      </span>
                    </>
                  ) : (
                    <>
                      {getReconstitutionVolume(selectedStrength?.name).volume} mL Bacteriostatic Water (BAC)
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {getReconstitutionVolume(selectedStrength?.name).concentration} mg/mL {t.finalConcentration || 'final concentration'}
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Regulación y Calidad' : 'Regulatory Standard') : (t.lyophilizationExcipient || 'Lyophilization / Excipient')}</span>
                <span className="pds-dval">
                  {isSolventProduct
                    ? '0.9% Benzyl Alcohol USP (Antimicrobial Preservative)'
                    : isDiagnosticKit
                      ? 'CE-IVDR (UE 2017/746) · ISO 15189'
                      : isSprayFormat
                        ? (lang === 'es' ? 'Solución Tamponada Isotónica Estéril (pH 6.8–7.4)' : 'Sterile Buffered Isotonic Solution (pH 6.8–7.4)')
                        : isCartridgeFormat
                          ? (lang === 'es' ? 'Vidrio Borosilicato Tipo I · Émbolo Teflón' : 'Type I Borosilicate Glass · Teflon Plunger')
                          : isPenFormat
                            ? (t.sterileIsotonicSolution || 'Sterile Isotonic Solution (pH 6.8–7.4)')
                            : (t.dMannitol || 'D-Mannitol (USP / EP Grade)')}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Laboratorio Analítico' : 'Testing Laboratory') : (t.sourcingBatchRelease || 'Sourcing & Batch Release')}</span>
                <span className="pds-dval">
                  {isDiagnosticKit ? 'LifeLab1 (Vilna, Lituania) / Bloodo' : `${displaySupplierName} (${t.verifiedClinicalQuality || 'Verified Clinical Quality'})`}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Precisión Analítica' : 'Analytical Precision') : (t.analyticalPurity || 'Analytical Purity')}</span>
                <span className="pds-dval font-bold text-sky-950">
                  {isSolventProduct ? 'USP Pharmacopeia (Sterile, Non-Pyrogenic)' : isDiagnosticKit ? 'CV ≤ 6.6% (Validado)' : `≥ 99.0% (${t.rpHplcVerified || 'RP-HPLC Verified'})`}
                </span>
              </div>
            </div>
          </div>

          {/* ── Complete Formulations & Strengths Subpanel ── */}
          <div className="pds-table-subpanel">
            <div className="pds-table-subpanel-header">
              <div className="pds-table-subpanel-titles">
                <span className="pds-subpanel-label">
                  {t.analyticalMatrixSection || 'ANALYTICAL MATRIX & CLINICAL SPECIFICATIONS'}
                </span>
                <h4 className="pds-subpanel-title">
                  {t.completeFormulationsMatrix || 'Complete Formulations & Strengths Matrix'}
                </h4>
              </div>
              <div className="pds-subpanel-badge-wrap">
                <span className="pds-subpanel-badge font-mono">
                  {sortedStrengths.length} {lang === 'es' ? 'concentraciones analíticas' : 'analytical strengths'}
                </span>
              </div>
            </div>

            <div className="pds-table-responsive">
                <table className="pds-strengths-table">
                  <thead>
                    <tr>
                      <th>{isDiagnosticKit ? (lang === 'es' ? 'Presentación de Kit' : 'Kit Presentation') : (lang === 'es' ? 'Concentración / Dosis' : 'Strength / Dose')}</th>
                      <th>{isDiagnosticKit ? (lang === 'es' ? 'Tipo de Muestra' : 'Specimen Type') : (lang === 'es' ? 'Formato de Presentación' : 'Presentation Format')}</th>
                      <th>
                        {isDiagnosticKit 
                          ? (lang === 'es' ? 'Componentes del Kit' : 'Kit Components') 
                          : isSprayFormat 
                            ? (lang === 'es' ? 'Formulación y Vehículo' : 'Formulation & Vehicle') 
                            : (isPenFormat || isCartridgeFormat) 
                              ? (lang === 'es' ? 'Sistema / Reconstitución' : 'Delivery / Reconstitution') 
                              : (lang === 'es' ? 'Diluyente de Reconstitución' : 'Reconstitution Diluent')}
                      </th>
                      <th>
                        {isDiagnosticKit 
                          ? (lang === 'es' ? 'Rango Analítico / LoD' : 'Assay Range / LoD') 
                          : isSprayFormat 
                            ? (lang === 'es' ? 'Volumen / Dosis por Envase' : 'Device Volume / Actuations') 
                            : (isPenFormat || isCartridgeFormat) 
                              ? (lang === 'es' ? 'Volumen del Dispositivo' : 'Device Volume') 
                              : (t.solutionConcentrationCol || 'Solution Concentration (mg/mL)')}
                      </th>
                      <th>{isDiagnosticKit ? (lang === 'es' ? 'Método de Muestreo' : 'Sampling Method') : (lang === 'es' ? 'Vía de Administración' : 'Administration')}</th>
                      <th>{isDiagnosticKit ? (lang === 'es' ? 'Certificación y Regulación' : 'Certification & Standard') : (lang === 'es' ? 'Grado Analítico' : 'Analytical Grade')}</th>
                      <th>{isDiagnosticKit ? (lang === 'es' ? 'Laboratorio Analizador' : 'Testing Laboratory') : (lang === 'es' ? 'Verificación de Laboratorio' : 'Laboratory Verification')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map(row => {
                      return (
                        <tr 
                          key={row.key}
                          className={row.isCurrentlyActive ? 'pds-row-selected' : ''}
                          onClick={() => {
                            setActiveFormatId(row.formatId);
                            setSelectedStrengthId(row.strengthId);
                            triggerHaptic('selection');
                          }}
                          title="Click to view full clinical details for this presentation"
                          style={{ cursor: 'pointer' }}
                        >
                          <td data-label="Strength / Dose" className="pds-strength-cell">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              {row.isCurrentlyActive && (
                                <span className="pds-active-dot" aria-label="Active Presentation" title="Active Presentation" />
                              )}
                              <span className="pds-strength-name">{row.strengthName}</span>
                            </div>
                          </td>
                          <td data-label="Presentation Format">
                            <span className={`pds-format-pill pds-format-${row.formatId}`}>
                              {row.formatName}
                            </span>
                          </td>
                          <td data-label="Reconstitution Diluent">{row.diluentText}</td>
                          <td data-label="Solution Concentration (mg/mL)" className="pds-conc-cell">
                            {row.recon.volume > 0 && !row.isPenOrCart && !row.isOral && !row.isSpray && !isSolventProduct ? (
                              <span className="pds-conc-badge font-mono">
                                {row.concText}
                              </span>
                            ) : (
                              row.concText
                            )}
                          </td>
                          <td data-label="Administration">{row.adminText}</td>
                          <td data-label="Analytical Grade" className="pds-purity-cell">
                            {row.purity}
                          </td>
                          <td data-label="Laboratory Verification">{row.supplierName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ── Block 2: Reconstitution, Diagnostic Specs, Eterna Genetics, IV Drips, Corporate Services, or Solvent Technical Specs ── */}
        <section id="reconstitution-section" className="pds-section-card">
          {isSpainResidency ? (
            <SpainCompanyResidencyTechnicalSpecs
              product={product}
              lang={lang}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
            />
          ) : isUaeCorporateService ? (
            <UaeCompanySetupTechnicalSpecs product={product} lang={lang} />
          ) : isSolventProduct ? (
            <SolventTechnicalSpecs product={product} lang={lang} />
          ) : isEternaDiagnostic ? (
            <EternaGeneticTechnicalSpecs product={product} lang={lang} />
          ) : isDiagnosticKit ? (
            <DiagnosticTestTechnicalSpecs
              product={product}
              selectedDose={selectedStrength?.name || 'Standard'}
              supplierName={displaySupplierName}
              lang={lang}
            />
          ) : isIvDrip ? (
            <IvDripTechnicalSpecs
              product={product}
              selectedDose={selectedStrength?.name || '50 mL Infusion'}
              supplierName={displaySupplierName}
              lang={lang}
            />
          ) : (
            <>
              <div className="pds-section-header">
                <div className="pds-section-header-left">
                  <div className="pds-section-header-shield">
                    <FlaskConical size={22} />
                  </div>
                  <div className="pds-section-header-titles">
                    <div className="pds-section-header-meta-row">
                      <span className="pds-section-header-category">
                        {isPenOrCart
                          ? (lang === 'es' ? 'TITULACIÓN Y CALIBRACIÓN DE DIAL' : 'DOSIMETRY & DIAL TITRATION')
                          : isSprayFormat
                            ? (lang === 'es' ? 'DOSIMETRÍA INTRANASAL TRANSMUCOSA' : 'INTRANASAL DOSIMETRY')
                            : (t.reconstitutionSection || 'RECONSTITUTION PROTOCOL & DOSIMETRY')}
                      </span>
                      <span className="pds-section-badge">
                        <CheckCircle2 size={11} />{' '}
                        {isPenOrCart
                          ? (lang === 'es' ? 'SIMULADOR MULTIDOSIS' : 'MULTI-DOSE PEN SIMULATOR')
                          : isSprayFormat
                            ? (lang === 'es' ? 'BOMBA DOSIFICADA' : 'METERED MUCOSAL PUMP')
                            : (t.interactiveCalcBadge || 'PRECISION SIMULATOR')}
                      </span>
                    </div>
                    <h3 className="pds-section-header-title">
                      {isPenOrCart
                        ? (lang === 'es' ? 'Guía de Calibración de Dial en Bolígrafo Precargado' : 'Pre-filled Pen Dial Titration & Administration Guide')
                        : isSprayFormat
                          ? (lang === 'es' ? 'Guía Clínica de Administración Intranasal Dosificada' : 'Clinical Intranasal Metered Dose Guide')
                          : (t.interactiveCalcTitle || 'Interactive Reconstitution & U-100 Syringe Simulator')}
                    </h3>
                  </div>
                </div>

                <div className="pds-section-header-right">
                  <div className="pds-section-cert-badge">
                    <Droplets size={14} color="#38bdf8" />
                    <span>
                      {isPenOrCart
                        ? 'ISO 11608-2 Micro-Dial (1 Click = 0.01 mL)'
                        : isSprayFormat
                          ? (lang === 'es' ? '0.1 mL por Pulverización' : '0.1 mL Metered Mucosal Actuation')
                          : 'U-100 Standard (1.0 mL = 100 U)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pds-section-card-body" style={{ padding: 0 }}>
                {/* Visual Step-by-Step Delivery Guide */}
                <div style={{ padding: '20px 24px 8px 24px' }}>
                  <VisualAdministrationGuide activeFormatId={activeFormatId} lang={lang} />
                </div>

                <InteractiveReconstitutionGuide
                  product={product}
                  selectedStrength={selectedStrength}
                  availableStrengths={sortedStrengths}
                  activeFormatId={activeFormatId}
                  activeFormat={activeFormat}
                  availableFormats={availableFormats}
                  onFormatChange={setActiveFormatId}
                  supplierName={displaySupplierName}
                  lang={lang}
                  primaryProtocol={primaryProtocol}
                  associatedProtocols={associatedProtocols}
                />
              </div>
            </>
          )}
        </section>

        {/* ── Block 3: Analytical Certificate & Molecular Profile (Elevated Top-Level Section) ── */}
        {!isCorporateService && (
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
        {!isCorporateService && !isDiagnosticKit && !isSolventProduct && (
          <PeptidePublicationsSection product={product} lang={lang} />
        )}

        {/* ── Block 4: Physical Labels & Dispensing Downloads (Harmonized Navy Header) ── */}
        {!isDiagnosticKit && !isCorporateService && (
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
                    <a 
                      href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=shipping&download=1${labelQueryString}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download={isMobileDevice ? undefined : `shipping_label_${variantFileSuffix}_38x90.pdf`}
                      onClick={() => handleDownloadClick('shipping_38x90')}
                      className={`pds-btn pds-btn-gcp pds-btn-primary-action pds-btn-barcode ${downloadingType === 'shipping_38x90' ? 'loading' : ''}`}
                      style={downloadingType === 'shipping_38x90' ? { pointerEvents: 'none', opacity: 0.8 } : undefined}
                      title="Download 38x90mm Shipping Label (PDF File)"
                    >
                      {downloadingType === 'shipping_38x90' ? (
                        <><Loader2 size={15} className="pds-btn-icon animate-spin" /> <span>{t.downloadingState || 'Downloading...'}</span></>
                      ) : (
                        <><Download size={15} className="pds-btn-icon" /> <span>{t.downloadPrintReadyPdf || 'Download 38×90mm PDF'}</span></>
                      )}
                    </a>
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
                    <a 
                      href={`/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=client&download=1${labelQueryString}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download={isMobileDevice ? undefined : `client_vial_label_${variantFileSuffix}_38x90.pdf`}
                      onClick={() => handleDownloadClick('client_38x90')}
                      className={`pds-btn pds-btn-gcp pds-btn-primary-action pds-btn-pdf ${downloadingType === 'client_38x90' ? 'loading' : ''}`}
                      style={downloadingType === 'client_38x90' ? { pointerEvents: 'none', opacity: 0.8 } : undefined}
                      title="Download 38x90mm Client Vial Label (PDF File)"
                    >
                      {downloadingType === 'client_38x90' ? (
                        <><Loader2 size={15} className="pds-btn-icon animate-spin" /> <span>{t.downloadingState || 'Downloading...'}</span></>
                      ) : (
                        <><Download size={15} className="pds-btn-icon" /> <span>{t.downloadPrintReadyPdf || 'Download 38×90mm PDF'}</span></>
                      )}
                    </a>
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
                {inlineSvg ? (
                  <div
                    className="pds-vial-label-img"
                    aria-label={`Barcode & QR Label for ${name}`}
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
        )}

        {/* ── Block 5: Targeted Therapeutic Peptides (Lotusland Limited) ── */}
        <BloodoRelatedPeptidesSection product={product} lang={lang} />



        {/* Institutional Regulatory Footnote */}
        <footer className="pds-page-footer">
          <div className="pds-footer-box">
            <p className="pds-footer-text">
              <strong>Quality & Regulatory Governance:</strong> Sourced through authorized synthesis partner ({supplierName}). All analytical batches undergo independent dual-column RP-HPLC and LC-MS release testing meeting pharmacopeial grade standards. This technical document is intended exclusively for authorized medical professionals, clinical researchers, and institutional partners.
            </p>
            <p className="pds-footer-meta">
              Document Ref: PDS-{slug.toUpperCase()}-2026 • Rev {versionInfo.version} • {lang === 'es' ? 'Actualizado:' : 'Updated:'} {versionInfo.updatedAtDate} • Verified on Atlas Health Clinical Engine • {new Date().getFullYear()} ATLAS HEALTH Clinical Portal
            </p>
          </div>
        </footer>
      </PublicPageShell>

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
      />

      {/* Sandboxed, Strictly English Public Atlas AI Research Copilot */}
      <PublicAtlasAIDrawer
        contextType="monograph"
        contextAnchor={{
          name: product?.canonicalName || product?.name || 'Peptide Monograph',
          cas: product?.cas || 'N/A',
          purity: product?.purity || '≥ 99.0% (Dual-Stage RP-HPLC Verified)',
          molecular: product?.molecularWeight || product?.molecularFormula || 'N/A',
          sequence: product?.sequence || null,
          details: {
            category: isSolventProduct ? 'Sterile Reconstitution Solvent' : isDiagnosticKit ? 'CE-IVDR Clinical Diagnostic Test' : (product?.category || 'Peptides'),
            storage: isSolventProduct ? '2-25°C unopened, 2-8°C refrigerated after puncture. Discard after 28 days.' : isDiagnosticKit ? 'Ambient 15-25°C dry storage. Dried blood spot stable up to 14 days at room temp.' : '2-8°C (Lyophilized), -20°C (Long term), Reconstituted refrigerated 2-8°C',
            reconstitution: isSolventProduct ? 'Pure diluent solvent for lyophilized peptide reconstitution' : isDiagnosticKit ? 'No reconstitution required. Direct capillary dried blood spot (DBS) collection.' : '1.0mL - 2.0mL sterile bacteriostatic water',
            activeSupplier: displaySupplierName || (isDiagnosticKit ? 'LifeLab1 / Bloodo' : 'Atlas Services'),
          }
        }}
        storageKey={`monograph_${slug}`}
        onOpenRegisterModal={() => {
          window.open('/auth/login?register=true', '_blank');
        }}
      />

      {/* Non-Intrusive Institutional Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="product"
        initialEntity={{
          name: product?.canonicalName || product?.name || slug,
          slug: slug,
          strength: selectedStrength?.name || selectedStrengthId || '',
          category: product?.category || 'Peptides'
        }}
        lang={lang}
      />
    </div>
  );
}


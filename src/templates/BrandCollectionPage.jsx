"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import PublicUnifiedHeader from '../components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '../components/shared/PublicUnifiedFooter';
import DiagnosticReportVisualPreview from '../components/diagnostic/DiagnosticReportVisualPreview';
import BloodoCollectionSidebar from '../components/diagnostic/BloodoCollectionSidebar';
import EternaCollectionSidebar from '../components/diagnostic/EternaCollectionSidebar';
import UltraPersonCollectionSidebar from '../components/diagnostic/UltraPersonCollectionSidebar';
import ColwayCollectionSidebar from '../components/diagnostic/ColwayCollectionSidebar';
import ColwayMainSections from '../components/collection/ColwayMainSections';
import PublicInstitutionalInquiryDrawer from '../components/shared/PublicInstitutionalInquiryDrawer';
import PublicAtlasAIDrawer from '../components/shared/PublicAtlasAIDrawer';
import ColwayTrichologyStemCellShowcase from '../components/product/ColwayTrichologyStemCellShowcase';
import CopyableId from '../components/ui/CopyableId';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  Search, SlidersHorizontal, LayoutGrid, List, Sparkles, Shield, Activity,
  Zap, HeartPulse, Check, ArrowRight, ExternalLink, Dna,
  Droplets, Microscope, FileText, FlaskConical, Award, ShieldCheck, CheckCircle2, ChevronRight,
  ChevronDown, Layers, Eye, Lock, LogIn, User, MessageSquare
} from '@/lib/icons';
import '../styles/collection_shared.css';

// Brand configurations with clinical metadata and 4 KPIs (Regla Golden #22)
const BRAND_CONFIGS = {
  colway: {
    name: 'Colway',
    title: 'Colway® Bioactive Native Collagen, Cosmeceuticals & Trichology',
    badge: 'Clinical Nutriceuticals, Dermocosmetics & Trichology Desk',
    badgeColor: '#0d9488',
    subtitle: 'Polish pioneer in biologically active native freshwater fish tropocollagen (triple-helix preserved), cellular oral nutriceuticals, advanced diamond cosmeceuticals, and medical follicular trichology.',
    heroImage: '/images/products/colway/colway-dermatology-clinic-hero-v2.jpg',
    accentColor: '#0d9488',
    kpis: [
      { label: 'Active Tropocollagen', value: 'Triple Helix', sub: 'Sublimation Freeze-Dried Active Form', icon: Sparkles, color: '#0d9488' },
      { label: 'Diamond Peptides', value: 'VEP-Carrier', sub: 'Cellular Neocollagenesis & Remodeling', icon: Award, color: '#2563eb' },
      { label: 'Scalp Trichology', value: 'Baicapil™ 2%', sub: 'Follicular Anchorage & Diosmin', icon: Zap, color: '#d97706' },
      { label: 'Regulatory Compliance', value: 'EU Reg. & GMP', sub: 'CPNP Registered & Dermatologically Tested', icon: ShieldCheck, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Formulations' },
      { id: 'epigenetic', label: 'Epigenetic & Blue Diamond' },
      { id: 'native-dermal', label: 'Native Dermal & Barrier' },
      { id: 'trichology', label: 'Trichology & Scalp System' },
      { id: 'nutricosmetics', label: 'Inside-Out Nutricosmetics' },
      { id: 'bundles', label: 'Clinical Protocol Bundles' }
    ]
  },
  bloodo: {
    name: 'Bloodo™ Diagnostics',
    title: 'Bloodo™ Capillary Blood Diagnostics & CE-IVDR Test Kits',
    badge: 'CE-IVDR Certified Laboratory Diagnostics',
    badgeColor: '#dc2626',
    subtitle: 'Precision Dried Blood Spot (DBS) tests analyzing intracellular cellular bioenergetics, diurnal endocrine rhythms, and 90-day metabolic glycation with ISO 15189 European laboratory validation.',
    heroImage: '/images/products/bloodo/nad.jpg',
    accentColor: '#e11d48',
    kpis: [
      { label: 'Accredited Biomarkers', value: '6 CE-IVDR Panels', sub: 'NAD+, Testosterone, Cortisol, HbA1c', icon: Microscope, color: '#e11d48' },
      { label: 'Laboratory Quality', value: 'ISO 15189', sub: 'European Reference Diagnostic Lab', icon: Award, color: '#0284c7' },
      { label: 'Sample Technology', value: 'Capillary DBS', sub: '100% Painless Finger-Prick Collection', icon: Droplets, color: '#d97706' },
      { label: 'Result Turnaround', value: '48 – 72 Hours', sub: 'Direct Quantitative Portal Delivery', icon: HeartPulse, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Tests (6)' },
      { id: 'nad', label: 'Bioenergetics (NAD+)' },
      { id: 'cortisol', label: 'Endocrine & Cortisol CAR' },
      { id: 'testosterone', label: 'Androgens & Testosterone+' },
      { id: 'hba1c', label: 'Glycation & HbA1c' },
      { id: 'omega', label: 'Lipidomics & Omega-3' },
      { id: 'vitamin-d', label: 'Micronutrients & Vit D3' }
    ]
  },
  ultraperson: {
    name: 'UltraPerson™ Personalization',
    title: 'UltraPerson™ Personalization Protocols & Clinical Supplements',
    badge: 'PharmaPolis Targeted Clinical Formulations',
    badgeColor: '#7c3aed',
    subtitle: 'Medical-grade targeted nutritional cofactors engineered by PharmaPolis for synergy with precision peptide protocols, mitochondrial rejuvenation, and sustained daily physiological resilience.',
    heroImage: '/assets/vials/eterna-longevity.png',
    accentColor: '#7c3aed',
    kpis: [
      { label: 'Targeted Protocols', value: '6 Formulations', sub: 'Synergistic with Peptide Therapies', icon: FlaskConical, color: '#7c3aed' },
      { label: 'Capsule Technology', value: 'Vegan HPMC', sub: 'Acid-Resistant Delayed Release', icon: ShieldCheck, color: '#0284c7' },
      { label: 'Clean Standard', value: '0% Allergens', sub: 'Non-GMO, Gluten-Free, 100% Vegan', icon: Award, color: '#16a34a' },
      { label: 'AAA Protocol', value: '3-Month Formulations', sub: 'Standardized 500 mg Active Actives/Day', icon: Zap, color: '#ea580c' }
    ],
    categories: [
      { id: 'all', label: 'All Formulations' },
      { id: 'energy', label: 'Energy & Metabolic' },
      { id: 'cognitive', label: 'Cognitive & Clarity' },
      { id: 'stress', label: 'Stress & Cortisol' },
      { id: 'sleep', label: 'Sleep & Circadian' },
      { id: 'longevity', label: 'Longevity & Cellular' }
    ]
  },
  eterna: {
    name: 'ETERNA® Longevity DX',
    title: 'ETERNA® Multi-Omics Diagnostics & Organ Proteomics',
    badge: 'High-Throughput Multi-Omics Platform',
    badgeColor: '#0284c7',
    subtitle: 'Integrated longevity platform combining fixed genomic baseline (+700,000 SNPs), organ-specific biological age proteomics, and longitudinal blood telemetry processed by Eurofins.',
    heroImage: '/images/products/eterna/eterna-kit-box.png',
    accentColor: '#0284c7',
    kpis: [
      { label: 'Genetic Scope', value: '+700,000 SNPs', sub: 'High-Throughput Saliva DNA Array', icon: Dna, color: '#0284c7' },
      { label: 'Organ Proteomics', value: 'Blood Serum/Plasma', sub: 'Organ-Specific Biological Age Clocks', icon: Droplets, color: '#e11d48' },
      { label: 'Laboratory Partner', value: 'Eurofins Genomics', sub: 'ISO 17025 Clinical NGS Processing', icon: Award, color: '#16a34a' },
      { label: 'Wearable Sync', value: 'Continuous Telemetry', sub: 'Apple Health, Oura, Garmin Integration', icon: HeartPulse, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Tests & Services' },
      { id: 'genomics', label: 'Genomics & Saliva DNA' },
      { id: 'proteomics', label: 'Organ Proteomics & Blood' },
      { id: 'platform', label: 'Digital Platform & Pro' }
    ]
  },
  teletest: {
    name: 'TeleTest Analytika®',
    title: 'TeleTest Analytika® Clinical Genomics & Laboratory Diagnostics',
    badge: 'ISO 17025 European Reference Laboratory',
    badgeColor: '#0284c7',
    subtitle: 'European reference clinical laboratory authorized by Generalitat de Catalunya (E08750211) & ISO 17025 accredited. High-precision HLA immunogenetics, autoimmune celiac predisposition, and ICP-MS/MS hair tissue mineral & heavy metals toxicology.',
    heroImage: '/images/products/teletest/hla-autoinmunidad.svg',
    accentColor: '#0284c7',
    kpis: [
      { label: 'Laboratory Quality', value: 'ISO 17025', sub: 'Generalitat de Catalunya E08750211', icon: Award, color: '#16a34a' },
      { label: 'Analytical Method', value: 'ICP-MS/MS & qPCR', sub: 'High-Resolution Mass Spectrometry', icon: Microscope, color: '#0284c7' },
      { label: 'Diagnostic Scope', value: '33 Elements & HLA', sub: 'Hair Toxicology & Immunogenetics', icon: Dna, color: '#d97706' },
      { label: 'Digital Reports', value: 'FNMT Signed', sub: 'Digital Validation 5-7 Workdays', icon: ShieldCheck, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Diagnostic Panels (5)' },
      { id: 'genomics', label: 'Genomics & Autoimmunity (HLA)' },
      { id: 'toxicology', label: 'Hair Mineral Analysis (HTMA)' },
      { id: 'metabolic', label: 'Omega Fatty Acids & Inflammatory Balance' },
      { id: 'detox', label: 'Pharmacogenetics & Metabolizer Detox' }
    ]
  }
};

function resolveBrandProductImage(product, brandSlug) {
  if (product.image_url) return product.image_url;
  if (product.imageUrl) return product.imageUrl;
  if (product.image) return product.image;

  const id = (product.id || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  if (brandSlug === 'teletest') {
    if (id.includes('hla') || id.includes('gnt')) return '/images/products/teletest/hla-autoinmunidad.svg';
    if (id.includes('celiac') || id.includes('gluten')) return '/images/products/teletest/celiac-genetics.svg';
    if (id.includes('omega') || name.includes('omega')) return '/images/products/teletest/omega-test.svg';
    if (id.includes('detox') || id.includes('metabolizer') || name.includes('detox')) return '/images/products/teletest/metabolizer-detox.svg';
    if (id.includes('tox') || id.includes('pesados')) return '/images/products/teletest/heavy-metals.svg';
    return '/images/products/teletest/mineralograma-cabello.svg';
  }

  if (brandSlug === 'colway') {
    if (id.includes('colway-trichology') || id === 'colway-trichology') return '/images/products/colway/bundle-colway-trichology.jpg';
    if (id.includes('bundle-blue-diamond') || id.includes('blue-diamond-ritual')) return '/images/products/colway/bundle-blue-diamond-ritual.jpg';
    if (id.includes('bundle-inside-out') || id.includes('inside-out-collagen')) return '/images/products/colway/bundle-inside-out-collagen.jpg';
    if (id.includes('colvita') || name.includes('colvita')) return '/images/products/colway/colvita.png';
    if (id.includes('trichology') || name.includes('trichology')) return '/images/products/colway/bundle-colway-trichology.jpg';
    if (id.includes('vege') || name.includes('vege') || name.includes('vegan')) return '/images/products/colway/vege-collagen.png';
    if (id.includes('peeling') || name.includes('peeling')) return '/images/products/colway/blue-diamond-peeling.png';
    if (id.includes('blue-diamond') || id.includes('diamond') || name.includes('diamond') || name.includes('diament')) return '/images/products/colway/blue-diamond-cream.png';
    if (id.includes('lip') || name.includes('lip') || id.includes('balm') || name.includes('balm') || name.includes('pomadka')) return '/images/products/colway/lip-care.png';
    if (id.includes('wash') || name.includes('wash') || id.includes('gel') || name.includes('gel') || name.includes('zel')) return '/images/products/colway/washing-gel.png';
    if (id.includes('conditioner') || name.includes('conditioner')) return '/images/products/colway/conditioner.png';
    return '/images/products/colway/shampoo.png';
  }

  if (brandSlug === 'bloodo') {
    if (id.includes('nad') || name.includes('nad')) return '/images/products/bloodo/nad.jpg';
    if (id.includes('testosterone') || name.includes('testosterone')) return '/images/products/bloodo/testosterone.jpg';
    if (id.includes('cortisol') || name.includes('cortisol')) return '/images/products/bloodo/cortisol.jpg';
    if (id.includes('hba1c') || name.includes('hba1c') || name.includes('hemoglobin')) return '/images/products/bloodo/hba1c.jpg';
    if (id.includes('omega') || name.includes('omega')) return '/images/products/bloodo/omega.jpg';
    if (id.includes('vitamin-d') || name.includes('vitamin d')) return '/images/products/bloodo/vitamin-d.jpg';
    return '/images/products/bloodo/nad.jpg';
  }

  if (brandSlug === 'eterna') {
    return '/images/products/eterna/eterna-kit-box.png';
  }

  return '/images/longevity_supps.png';
}

function resolveProductDatasheet(product, brandSlug) {
  if (brandSlug !== 'colway') return null;
  const id = (product.id || product.slug || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  if (id.includes('wash') || name.includes('wash') || id.includes('zel') || name.includes('cleansing')) {
    return {
      title: 'Collagen Wash Gel Datasheet',
      url: '/docs/colway/colway-collagen-wash-gel-datasheet.pdf',
      filename: 'Colway-Collagen-Wash-Gel-Datasheet.pdf',
      badge: 'Wash Gel Monograph (PDF)',
      size: '362 KB'
    };
  }

  if (id.includes('shampoo') || name.includes('shampoo') || id.includes('conditioner') || name.includes('conditioner') || id === 'colway-trichology') {
    return {
      title: 'Trichology Duo Protocol & Datasheet',
      url: '/docs/colway/colway-shampoo-conditioner-trichology-datasheet.pdf',
      filename: 'Colway-Trichology-Shampoo-Conditioner-Dossier.pdf',
      badge: 'Trichology Dossier (PDF)',
      size: '1.1 MB'
    };
  }

  if (id.includes('vege') || name.includes('vege') || name.includes('vegan')) {
    return {
      title: 'Vege Collagen 100% Fitocosmetic Datasheet',
      url: '/docs/colway/colway-vege-collagen-datasheet.pdf',
      filename: 'Colway-Vege-Collagen-100-Fitocosmetic-Datasheet.pdf',
      badge: 'Fitocosmetic Monograph (PDF)',
      size: '4.3 MB'
    };
  }

  return null;
}

function resolveProductRegulatoryBadges(product, brandSlug) {
  if (brandSlug !== 'colway') {
    return [
      { label: brandSlug === 'eterna' ? 'CAP / CLIA' : brandSlug === 'ultraperson' ? 'EU GMP' : 'CE-IVDR', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'Laboratory Accreditation' }
    ];
  }

  const id = (product.id || product.slug || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  // All Colway products registered in European Union (Regulation EC No 1223/2009 & CPNP)
  const badges = [
    { label: '🇪🇺 EU CPNP Reg.', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'European Union CPNP & Regulation (EC) No 1223/2009 Registered' }
  ];

  const isShampooOrConditioner = id.includes('shampoo') || name.includes('shampoo') || id.includes('conditioner') || name.includes('conditioner') || id === 'colway-trichology';
  const isLipBalmOrWashGel = id.includes('lip') || name.includes('lip') || id.includes('balm') || name.includes('pomadka') || id.includes('wash') || name.includes('wash') || id.includes('gel');

  if (isShampooOrConditioner) {
    badges.push(
      { label: '🇦🇪 UAE MoHAP / Montaji', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.12)', border: 'rgba(3, 105, 161, 0.25)', title: 'Registered in the United Arab Emirates (MoHAP / Dubai Montaji)' },
      { label: '🇶🇦 Qatar MoPH', color: '#831843', bg: 'rgba(131, 24, 67, 0.12)', border: 'rgba(131, 24, 67, 0.25)', title: 'Registered in Qatar (Ministry of Public Health)' }
    );
  } else if (isLipBalmOrWashGel) {
    badges.push(
      { label: '🇦🇪 UAE MoHAP / Montaji', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.12)', border: 'rgba(3, 105, 161, 0.25)', title: 'Registered in the United Arab Emirates (MoHAP / Dubai Montaji)' }
    );
  }

  return badges;
}

export default function BrandCollectionPage({
  brandSlug = 'bloodo',
  products = [],
  onSelectProduct,
  updateCart,
  toggleCompare
}) {
  const router = useRouter();
  const config = BRAND_CONFIGS[brandSlug] || BRAND_CONFIGS.bloodo;
  const { user, isProfessional, loginWithGoogle } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isEs = false; // Force English — Spanish translations preserved for future i18n

  const colwayCategories = useMemo(() => [
    { id: 'all', label: isEs ? 'Todas las Formulaciones' : 'All Formulations', count: 9 },
    { id: 'epigenetic', label: isEs ? 'Diamante Azul & Epigenética' : 'Epigenetic & Blue Diamond', count: 2 },
    { id: 'native-dermal', label: isEs ? 'Tropocolágeno Dérmico & Barrera' : 'Native Dermal & Barrier', count: 3 },
    { id: 'trichology', label: isEs ? 'Tricología Folicular Anti-DHT' : 'Trichology & Scalp System', count: 3 },
    { id: 'nutricosmetics', label: isEs ? 'Nutricosmética Celular Oral' : 'Inside-Out Nutricosmetics', count: 1 },
    { id: 'bundles', label: isEs ? 'Kits & Protocolos Clínicos' : 'Clinical Protocol Bundles', count: 3 },
  ], [isEs]);

  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atlas_portal_lang') || 'en';
    }
    return 'en';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortOption, setSortOption] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [scopeMode, setScopeMode] = useState('filtered'); // 'filtered' | 'global'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);
  const [activeColwaySection, setActiveColwaySection] = useState('overview'); // 'overview' | 'catalog' | 'advantage' | 'protocols' | 'calculator'
  const [activeProtocolId, setActiveProtocolId] = useState(null);

  // Multi-Currency Selector & Incoterm Engine (Fase 3)
  const [activeCurrency, setActiveCurrency] = useState('EUR'); // 'EUR' | 'USD' | 'AED'

  const CURRENCY_RATES = useMemo(() => ({
    EUR: { symbol: '€', rate: 1.0, label: 'EUR (€)' },
    USD: { symbol: '$', rate: 1.08, label: 'USD ($)' },
    AED: { symbol: 'AED', rate: 3.97, label: 'AED (د.إ)' }
  }), []);

  const resolveProductBasePrice = (product) => {
    if (typeof product.price === 'number' && product.price > 0) return product.price;
    if (typeof product.wholesalePriceAed === 'number' && product.wholesalePriceAed > 0) {
      return Math.round((product.wholesalePriceAed / 3.97) * 100) / 100;
    }
    const id = (product.id || product.slug || '').toLowerCase();
    if (id.includes('diamond-cream')) return 64.00;
    if (id.includes('diamond-peeling') || id.includes('diamond-exfoliat')) return 34.00;
    if (id.includes('colvita')) return 31.00;
    if (id.includes('vege')) return 25.00;
    if (id.includes('shampoo')) return 29.00;
    if (id.includes('conditioner')) return 29.00;
    if (id.includes('wash')) return 29.00;
    if (id.includes('lip')) return 4.50;
    return null;
  };

  const formatCurrencyPrice = (eurAmount) => {
    if (!eurAmount && eurAmount !== 0) return null;
    const cfg = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.EUR;
    const converted = eurAmount * cfg.rate;
    if (activeCurrency === 'AED') {
      return `${Math.round(converted).toLocaleString()} AED`;
    }
    if (activeCurrency === 'USD') {
      return `$${converted.toFixed(2)}`;
    }
    return `€${converted.toFixed(2)}`;
  };

  const canonicalUrl = `https://www.atlashealth-services.com/collection/${brandSlug}`;

  // Direct Institutional WhatsApp Inquiry with pre-filled clinical context (Fase 1)
  const getWhatsAppInquiryUrl = (product = null) => {
    const cleanPhone = process.env.NEXT_PUBLIC_ATLAS_WHATSAPP || '971564179256';
    let text = '';
    if (product) {
      text = `Hello Atlas Health Services Medical Affairs, I am inquiring about *${product.name || product.title}* from the Colway® Collection. Please provide institutional wholesale pricing and clinical technical documentation.`;
    } else if (selectedCategory && selectedCategory !== 'all') {
      const catMeta = colwayCategories.find(c => c.id === selectedCategory);
      text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *Colway® ${catMeta?.label || selectedCategory}* line. I would like to request clinical protocols and B2B pricing for medical clinics.`;
    } else {
      text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *Colway® Bioactive Native Collagen Collection* (8 formulations + clinical bundles). Please share the wholesale catalog and clinical onboarding guidelines.`;
    }
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  // SEO & structured data
  usePageMeta({
    title: `${config.title} | Atlas Collections`,
    description: config.subtitle,
    path: `/collection/${brandSlug}`,
  });

  // Google Cloud UX Rule #7: Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('catalog-search-input');
        if (input) {
          input.focus();
          input.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/collection/peptides' },
    { label: config.name }
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Colway collection: individual formulations vs bundles
    if (brandSlug === 'colway') {
      if (selectedCategory === 'bundles') {
        list = [
          {
            id: 'colway-trichology',
            slug: 'colway-strengthening-shampoo',
            name: 'Colway Trichology Hair Strengthening System (2-Step Duo)',
            category: 'trichology',
            presentation: '2-Step System (250 mL Shampoo + 200 mL Conditioner)',
            overview_summary: 'Dual-action medical trichology protocol: ostium cleansing with Baicapil™ 2% + Diosmin followed by cuticular sealing and keratin reinforcement.',
            image: '/images/products/colway/bundle-colway-trichology.jpg',
            routine_badge: 'Complete 2-Step Trichological System',
            step_number: 99,
            price: 92.00,
            landedCostAed: 200,
            wholesalePriceAed: 230,
            retailPriceAed: 340
          },
          {
            id: 'bundle-blue-diamond-ritual',
            slug: 'colway-blue-diamond-cream',
            name: 'Blue Diamond Complete Cellular Epigenetic Ritual',
            category: 'epigenetic-cellular',
            presentation: '2-Step Cellular Ritual (75 mL Peeling + 50 mL Cream)',
            overview_summary: 'Enzymatic diamond pre-exfoliation to triple skin permeability, followed by VEP-carrier diamond peptide cream for deep neocollagenesis.',
            image: '/images/products/colway/bundle-blue-diamond-ritual.jpg',
            routine_badge: 'Complete Epigenetic Rejuvenation Kit',
            step_number: 99,
            price: 155.00,
            landedCostAed: 335,
            wholesalePriceAed: 385.25,
            retailPriceAed: 580
          },
          {
            id: 'bundle-inside-out-collagen',
            slug: 'colway-colvita',
            name: 'Inside-Out Complete Neocollagenesis Protocol',
            category: 'nutricosmetics',
            presentation: 'Dual-Action Protocol (Colvita 60 Caps + Blue Diamond Cream 50 mL)',
            overview_summary: 'The ultimate dual-action protocol: oral freeze-dried tropocollagen supplying building amino acids from the bloodstream, combined with topical diamond peptides.',
            image: '/images/products/colway/bundle-inside-out-collagen.jpg',
            routine_badge: 'Inside-Out Clinical Protocol',
            step_number: 99,
            price: 150.00,
            landedCostAed: 325,
            wholesalePriceAed: 373.75,
            retailPriceAed: 560
          }
        ];
      } else {
        // Exclude all bundle/protocol products from individual formulations view
        list = list.filter(p => {
          const pid = p.id || '';
          return pid !== 'colway-trichology' &&
                 !pid.startsWith('bundle-') &&
                 p.slug !== 'colway-trichology';
        });
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const text = `${p.id} ${p.name || ''} ${p.title || ''} ${p.description || ''} ${p.desc || ''} ${p.sampleType || ''} ${JSON.stringify(p.activeIngredients || [])}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Category filter
    if (selectedCategory !== 'all' && selectedCategory !== 'bundles') {
      const cat = selectedCategory.toLowerCase();
      list = list.filter(p => {
        const str = `${p.id} ${p.name || ''} ${p.title || ''} ${p.category || ''} ${p.subcategory || ''} ${p.clinical_line || ''}`.toLowerCase();
        if (brandSlug === 'colway') {
          if (cat === 'epigenetic') return str.includes('diamond') || str.includes('diament') || str.includes('peeling') || str.includes('epigenetic');
          if (cat === 'native-dermal') return (str.includes('vege') || str.includes('wash') || str.includes('lip') || str.includes('dermal')) && !str.includes('diamond');
          if (cat === 'trichology' || cat === 'hair') return str.includes('hair') || str.includes('shampoo') || str.includes('conditioner') || str.includes('trichology') || str.includes('szampon') || str.includes('odzywka');
          if (cat === 'nutricosmetics' || cat === 'nutraceutical') return str.includes('colvita') || str.includes('supplement') || str.includes('capsule') || str.includes('suplement');
        }
        return str.includes(cat);
      });
    }

    // Sorting
    if (sortOption === 'name-asc') {
      list.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    } else if (sortOption === 'name-desc') {
      list.sort((a, b) => (b.name || b.title || '').localeCompare(a.name || a.title || ''));
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortOption]);

  const activeSectionContext = useMemo(() => {
    if (brandSlug !== 'colway') {
      return {
        sectionId: selectedCategory,
        sectionTitle: `${config.name} Clinical Portfolio`,
        products: filteredProducts.map(p => p.name || p.title),
        keyActives: config.subtitle,
        mechanisms: 'Analytical clinical specifications and verified standard parameters.',
      };
    }

    if (selectedCategory === 'epigenetic') {
      return {
        sectionId: 'epigenetic',
        sectionTitle: 'Epigenetic Rejuvenation & Blue Diamond Line',
        products: [
          'Colway Blue Diamond Cellular Rejuvenation Cream (50 mL)',
          'Colway Blue Diamond Exfoliating & Micro-Resurfacing Peeling (75 mL)',
          'Blue Diamond Cellular Rejuvenation Protocol Duo'
        ],
        keyActives: 'MATRIGENICS 14G (Undaria pinnatifida stipes extract), VEP-Endorphin Peptides, Acetyl Hexapeptide-8, Diamond Micro-Crystals, Intact Fish Tropocollagen',
        mechanisms: 'Epigenetic reactivation of 14 youth genes regulating synthesis of Collagen I, III, IV, VII and Hyaluronic Acid. Reverses the "Triangle of Beauty" inversion in perimenopausal skin.',
      };
    }

    if (selectedCategory === 'trichology') {
      return {
        sectionId: 'trichology',
        sectionTitle: 'Follicular Trichology & Scalp Anti-DHT System',
        products: [
          'Colway Hair Strengthening Bio-Collagen Shampoo (200 mL)',
          'Colway Hair Strengthening Bio-Collagen Conditioner (200 mL)',
          'Colway Complete Trichology Follicular System Duo'
        ],
        keyActives: 'Baicapil™ 2% (Scutellaria baicalensis, Glycine soja & Triticum vulgare germ), Kerascalp™ (Phyllanthus emblica / Amla), Hydrafeel® (Pantotrophin 3 / Vit B5), Horsetail Extract (natural organic silica), Cottonseed & Sweet Almond oils',
        mechanisms: 'Stimulates hair follicle stem cells, activates Wnt/β-catenin signaling pathway, prolongs anagen (growth) phase while shortening telogen (shedding) phase. Protects scalp microcirculation and inhibits follicular miniaturization.',
      };
    }

    if (selectedCategory === 'native-dermal') {
      return {
        sectionId: 'native-dermal',
        sectionTitle: 'Native Tropocollagen Dermal Regeneration & Barrier Support',
        products: [
          'Colway Collagen Wash Gel (250 mL)',
          'Colway Vege Collagen 100% Fitocosmetic (45 mL)',
          'Colway Bioactive Collagen Lip Care Balm (4.2 g)'
        ],
        keyActives: 'Intact 3D Triple-Helix Freshwater Fish Tropocollagen, 100% Plant-Derived Collagen Amino Acids in Young Coconut Water, Aosain, Niacinamide, D-Panthenol, Aloe Vera, Noni Extract',
        mechanisms: 'Biologically active hydration and transdermal signal peptides stimulating dermal fibroblast neocollagenesis. SLS/SLES-free barrier preservation of skin hydrolipidic film.',
      };
    }

    if (selectedCategory === 'nutricosmetics') {
      return {
        sectionId: 'nutricosmetics',
        sectionTitle: 'Inside-Out Cellular Nutricosmetics',
        products: [
          'Colvita Freeze-Dried Bioactive Collagen Capsules (60/120 Caps)',
          'Inside-Out Dual-Phase Collagen Protocol'
        ],
        keyActives: 'Cryogenically freeze-dried fish tropocollagen (-40°C), Bladderwrack (Fucus vesiculosus algae, rich in organic iodine, selenium & zinc), Natural D-alpha-tocopheryl acetate (Vitamin E from cold-pressed grains)',
        mechanisms: 'Systemic neocollagenesis activating dermal fibroblasts and chondrocytes from within. Clinical ITA-TEST #B-89146 confirms +90% skin elasticity and cellular regeneration in 110 days.',
      };
    }

    if (selectedCategory === 'bundles') {
      return {
        sectionId: 'bundles',
        sectionTitle: 'Clinical Protocol Bundles & Dual-Phase Kits',
        products: [
          'Blue Diamond Cellular Rejuvenation Protocol',
          'Inside-Out Dual-Phase Collagen Protocol',
          'Colway Complete Trichology Follicular System'
        ],
        keyActives: 'Integrated topical + oral multi-target formulations combining cellular exfoliation, dermal replenishment, and oral chondro-dermal support.',
        mechanisms: 'Synergistic protocol combinations designed for clinical practitioners and aesthetic medicine doctors.',
      };
    }

    // Default 'all' collection context:
    return {
      sectionId: 'all',
      sectionTitle: 'Colway® European Biotechnology Collection (Complete Portfolio)',
      products: [
        'Colway Blue Diamond Cellular Rejuvenation Cream (50 mL)',
        'Colway Blue Diamond Exfoliating & Micro-Resurfacing Peeling (75 mL)',
        'Colvita Freeze-Dried Bioactive Collagen Capsules (60/120 Caps)',
        'Colway Vege Collagen 100% Fitocosmetic (45 mL)',
        'Colway Hair Strengthening Bio-Collagen Shampoo (200 mL)',
        'Colway Hair Strengthening Bio-Collagen Conditioner (200 mL)',
        'Colway Collagen Wash Gel (250 mL)',
        'Colway Bioactive Collagen Lip Care Balm (4.2 g)'
      ],
      keyActives: 'Intact 3D Triple Helix Freshwater Tropocollagen, Baicapil™ 2%, Kerascalp™, MATRIGENICS 14G, VEP-Endorphin Peptides, Cryogenic Freeze-Drying (-40°C)',
      mechanisms: 'Patented European biotechnology preserving native biological activity without thermal denaturation. Certified under ISO 22716 GMP, EU CPNP (1223/2009), UAE MoHAP / Dubai Montaji, and Qatar MoPH.',
    };
  }, [brandSlug, selectedCategory, config.name, config.subtitle, filteredProducts]);

  const toggleExpand = (productId, e) => {
    e?.stopPropagation();
    setExpandedDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleProductClick = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product.name || product.title);
    } else {
      const slug = product.slug || product.id;
      router.push(`/p/${slug}`);
    }
  };

  const handleQuickAdd = (product, e) => {
    e?.stopPropagation();
    if (updateCart) {
      const variant = product.variants?.[0] || { id: `${product.id}-default`, presentation: product.presentation || 'Standard Kit' };
      updateCart({
        id: product.id,
        name: product.name || product.title,
        price: product.price || 0,
        variant
      }, 1);
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 2200);
    } else {
      handleProductClick(product);
    }
  };

  return (
    <div className="brand-collection-root" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* ── 1. Unified Public Header (Sticky top) ── */}
      <PublicUnifiedHeader
        track="products"
        lang={lang}
        onLangChange={setLang}
        copyUrl={canonicalUrl}
        shortUrl={canonicalUrl}
        brandHref="/c/CAT-MU9L9GBN"
        brandTitle="Atlas Health Services Clinical & Healthcare Intelligence"
        hideTier2={true}
        hideAccountManager={true}
        hideAiButton={true}
        collectionScope={brandSlug}
        collectionProducts={filteredProducts}
        collectionTitle={config.name}
        onSelectCollectionProduct={handleProductClick}
      />

      {/* ── 2. Breadcrumbs Bar ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 2rem 0' }}>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* ── 3. Google Cloud Hero Header ── */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', marginTop: '0.75rem', padding: '2.5rem 0 2rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: 'flex-start',
              background: `${config.badgeColor}15`,
              border: `1px solid ${config.badgeColor}35`,
              color: config.badgeColor,
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={13} />
              <span>{config.badge}</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.9rem, 4.2vw, 3.35rem)',
              fontWeight: 850,
              color: '#0f172a',
              letterSpacing: '-0.035em',
              margin: 0,
              lineHeight: 1.12,
              textWrap: 'balance',
              width: '100%'
            }}>
              {config.title}
            </h1>
            <p style={{
              fontSize: 'clamp(0.96rem, 1.35vw, 1.12rem)',
              color: '#475569',
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 450,
              maxWidth: '1280px'
            }}>
              {config.subtitle}
            </p>

            {/* Architecture Metadata Badges (GCP Standard) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 650, color: '#334155', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px' }}>
                🧬 {filteredProducts.length} {brandSlug === 'colway' ? 'Formulations' : 'Items'}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 650, color: config.accentColor, background: `${config.accentColor}10`, border: `1px solid ${config.accentColor}30`, padding: '4px 10px', borderRadius: '6px' }}>
                {brandSlug === 'colway' ? '🏛️ Colway sp.j. (Poland / EU)' : brandSlug === 'eterna' ? '🏛️ Eurofins Genomics' : '🏛️ LifeLab1 Diagnostics'}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 650, color: '#0284c7', background: '#f0f9ff', border: '1px solid #e0f2fe', padding: '4px 10px', borderRadius: '6px' }}>
                {brandSlug === 'colway' ? '🛡️ ISO 22716 & CPNP Compliant' : '🛡️ CE-IVDR & ISO 15189'}
              </span>
            </div>

            {/* Official Complete Collection Showcase Hero Banner */}
            {brandSlug === 'colway' && (
              <div style={{
                marginTop: '1.5rem',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
                border: '1px solid #e2e8f0',
                background: '#ffffff'
              }}>
                <img
                  src="/images/products/colway/colway-dermatology-clinic-hero-v2.jpg"
                  alt="Colway® Complete Cellular Dermocosmetics & Nutricosmetics Collection"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 4. 4 KPIs Grid + Scope Switcher (Regla Golden #22) ── */}
      {brandSlug !== 'colway' && (
      <section style={{ maxWidth: '1440px', margin: '-1.25rem auto 2.5rem', padding: '0 2rem' }}>
        {/* Scope Indicator Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '6px',
              background: scopeMode === 'filtered' ? '#e0f2fe' : '#f1f5f9',
              border: '1px solid',
              borderColor: scopeMode === 'filtered' ? '#bae6fd' : '#e2e8f0',
              color: scopeMode === 'filtered' ? '#0369a1' : '#64748b',
              fontSize: '0.74rem',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: scopeMode === 'filtered' ? '#0284c7' : '#94a3b8' }} />
              {scopeMode === 'filtered' 
                ? (isEs ? `Resultados Filtrados (${filteredProducts.length} ${brandSlug === 'colway' ? 'formulaciones' : 'pruebas'})` : `Matching Active Filters (${filteredProducts.length} items)`)
                : (isEs ? `Colección Completa (${products.length} ${brandSlug === 'colway' ? 'formulaciones' : 'pruebas'})` : `Entire Collection (${products.length} items)`)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setScopeMode('filtered')}
              style={{
                background: scopeMode === 'filtered' ? '#0284c7' : '#ffffff',
                color: scopeMode === 'filtered' ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: scopeMode === 'filtered' ? '#0284c7' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Filtros Activos' : 'Filtered View'}
            </button>
            <button
              onClick={() => { setScopeMode('global'); setSearchQuery(''); setSelectedCategory('all'); }}
              style={{
                background: scopeMode === 'global' ? '#0284c7' : '#ffffff',
                color: scopeMode === 'global' ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: scopeMode === 'global' ? '#0284c7' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Ver Colección Global' : 'Entire Database'}
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {config.kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: `${kpi.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color,
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {kpi.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* ── 5. GRAPHIC OVERVIEW: HOW RESULTS ARE OBTAINED & LAB REPORT MOCKUP ── */}
      {brandSlug === 'bloodo' && (
        <section style={{ maxWidth: '1440px', margin: '0 auto 2.5rem', padding: '0 2rem' }}>
          <DiagnosticReportVisualPreview lang={lang} activeTest="nad" />
        </section>
      )}


      {/* ── 6. MAIN WORKSPACE (Left Sidebar 320px + Right Main Content) ── */}
      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div className="gcp-collection-workspace">
          {/* ── LEFT COLUMN: STICKY DEDICATED SIDEBAR PER BRAND ── */}
          {brandSlug === 'bloodo' ? (
            <BloodoCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : brandSlug === 'eterna' ? (
            <EternaCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : brandSlug === 'ultraperson' ? (
            <UltraPersonCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : brandSlug === 'colway' ? (
            <ColwayCollectionSidebar
              lang={lang}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const el = document.getElementById('colway-main-content');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onSearchKeyword={(kw) => {
                setSearchQuery(kw);
                const el = document.getElementById('colway-main-content');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          ) : (
            <aside className="gcp-collection-sidebar" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', position: 'sticky', top: '90px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{config.name}</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>{config.subtitle}</p>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>{filteredProducts.length} items in catalog</div>
            </aside>
          )}

          {/* ── RIGHT COLUMN: MAIN CONTENT (DIRECT UNIFIED CATALOG & TREATMENT LINES) ── */}
          <main id="colway-main-content" style={{ minWidth: 0, gridColumn: '2', order: 2 }}>
            {/* Mobile Categories Navigation Strip (Golden Rule #23) */}
            <div className="gcp-mobile-categories-strip" style={{
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '1rem',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <SlidersHorizontal size={14} color="#0d9488" />
                  <span>{isEs ? 'Filtros & Categorías' : 'Categories & Filters'}</span>
                  <span style={{
                    fontSize: '0.70rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}>
                    {colwayCategories.length}
                  </span>
                </button>

                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  {filteredProducts.length} {isEs ? 'formulaciones' : 'formulations'}
                </span>
              </div>

              {/* Swipeable Category Pills */}
              {brandSlug === 'colway' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: '4px',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}>
                  {colwayCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          flexShrink: 0,
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '9999px',
                          background: isSelected ? '#0d9488' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: isSelected ? '1px solid #0d9488' : '1px solid #cbd5e1',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 700 : 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isSelected ? '0 2px 6px rgba(13, 148, 136, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{cat.label}</span>
                        <span style={{
                          fontSize: '0.66rem',
                          padding: '1px 5px',
                          borderRadius: '9999px',
                          background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b',
                          fontWeight: 700
                        }}>
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>



            {/* Google Cloud Filter Bar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              {/* Row 1: Search / Category Heading + View Toggle */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                {brandSlug === 'colway' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                      {isEs ? 'Catálogo de Formulaciones Colway®' : 'Colway® Formulations Catalog'}
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 650,
                      color: '#0d9488',
                      background: '#f0fdfa',
                      border: '1px solid #a7f3d0',
                      padding: '3px 10px',
                      borderRadius: '9999px'
                    }}>
                      {selectedCategory === 'all'
                        ? (isEs ? 'Todas las Categorías' : 'All Formulations')
                        : selectedCategory}
                    </span>
                  </div>
                ) : (
                  <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '480px' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      id="catalog-search-input"
                      type="text"
                      placeholder={isEs ? `Buscar en ${config.name} (ej. NAD+, cortisol, DBS)... ⌘K` : `Search in ${config.name} (e.g. NAD+, cortisol)... ⌘K`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.2rem 0.65rem 2.5rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                    {filteredProducts.length} {filteredProducts.length === 1 
                      ? (brandSlug === 'colway' ? (isEs ? 'formulación' : 'formulation') : (isEs ? 'test' : 'test')) 
                      : (brandSlug === 'colway' ? (isEs ? 'formulaciones' : 'formulations') : (isEs ? 'tests' : 'tests'))}
                  </span>

                  {/* Incoterm Badge (Fase 3) */}
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#475569',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📦 Terms: <strong>Ex-Works (EXW)</strong>
                  </span>

                  {/* Currency Selector (Fase 3) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <select
                      value={activeCurrency}
                      onChange={(e) => setActiveCurrency(e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#003666',
                        background: '#fff',
                        cursor: 'pointer'
                      }}
                      title="Select display currency for practitioner pricing"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#334155', background: '#fff' }}
                  >
                    <option value="featured">{isEs ? 'Destacados' : 'Featured'}</option>
                    <option value="name-asc">{isEs ? 'Nombre A-Z' : 'Name A-Z'}</option>
                    <option value="name-desc">{isEs ? 'Nombre Z-A' : 'Name Z-A'}</option>
                  </select>

                  <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                      style={{ padding: '6px 10px', background: viewMode === 'grid' ? '#f1f5f9' : '#ffffff', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? '#0f172a' : '#94a3b8' }}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      title="Master-Detail List"
                      style={{ padding: '6px 10px', background: viewMode === 'table' ? '#f1f5f9' : '#ffffff', border: 'none', cursor: 'pointer', color: viewMode === 'table' ? '#0f172a' : '#94a3b8' }}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Active Filter Chip (categories now live in the sidebar) */}
              {selectedCategory !== 'all' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    background: `${config.accentColor}12`,
                    border: `1px solid ${config.accentColor}40`,
                    color: config.accentColor,
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    {config.categories.find(c => c.id === selectedCategory)?.label || selectedCategory}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: config.accentColor,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        padding: '0 2px',
                        lineHeight: 1
                      }}
                      aria-label="Clear category filter"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '4rem 2rem', textAlign: 'center' }}>
                <FlaskConical size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  {isEs 
                    ? (brandSlug === 'colway' ? 'No se encontraron formulaciones' : 'No se encontraron resultados')
                    : (brandSlug === 'colway' ? 'No Colway formulations found' : 'No diagnostic panels found')}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
                  {isEs ? 'Prueba limpiando los filtros o utilizando otros términos de búsqueda.' : 'Try adjusting your search criteria or resetting filters.'}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: config.accentColor, color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isEs ? 'Limpiar Filtros' : 'Clear Filters'}
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: viewMode === 'grid' ? '1.25rem' : '0.75rem',
                width: '100%'
              }}>
                {filteredProducts.map(product => {
                  const imageSrc = resolveBrandProductImage(product, brandSlug);
                  const displayName = product.canonicalName || product.name || product.title || product.id;
                  const desc = product.overview_summary || product.description || product.desc || '';
                  const sampleType = brandSlug === 'bloodo'
                    ? (product.sampleType || 'Capillary Dried Blood Spot (DBS)')
                    : brandSlug === 'colway'
                    ? (product.volume || product.presentation || (product.is_supplement || product.id?.includes('colvita') ? '60 / 120 Capsules (Box)' : 'Dermocosmetic Formulation'))
                    : (product.sampleType || product.presentation || product.volume || 'Clinical Formulation');
                  const isExpanded = !!expandedDetails[product.id];
                  const isAdded = addedItem === product.id;

                  if (viewMode === 'table') {
                    return (
                      <div
                        key={product.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          {/* Left: Thumbnail & Essential Identifiers */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 360px', minWidth: 0 }}>
                            <div
                              onClick={() => handleProductClick(product)}
                              style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '8px',
                                background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >
                              <img
                                src={imageSrc}
                                alt={displayName}
                                style={{ maxHeight: '56px', maxWidth: '85%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))' }}
                              />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                                  <CopyableId value={product.id} maxLength={18} />
                                </span>
                                {resolveProductRegulatoryBadges(product, brandSlug).map((rb, idx) => (
                                  <span
                                    key={idx}
                                    title={rb.title}
                                    style={{
                                      fontSize: '0.64rem',
                                      fontWeight: 800,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: rb.bg,
                                      color: rb.color,
                                      border: `1px solid ${rb.border}`,
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {rb.label}
                                  </span>
                                ))}
                                <span style={{ fontSize: '0.70rem', color: '#0d9488', fontWeight: 650 }}>
                                  {sampleType}
                                </span>
                                {brandSlug === 'colway' && (product.routine_badge || product.step_number != null) && (
                                  <span style={{
                                    fontSize: '0.66rem',
                                    fontWeight: 700,
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    background: '#f0fdfa',
                                    color: '#0d9488',
                                    border: '1px solid #99f6e4'
                                  }}>
                                    {product.routine_badge || `Step ${product.step_number}`}
                                  </span>
                                )}
                              </div>
                              <h3
                                onClick={() => handleProductClick(product)}
                                style={{
                                  fontSize: '0.98rem',
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  margin: '0 0 3px 0',
                                  lineHeight: 1.3,
                                  cursor: 'pointer'
                                }}
                              >
                                {displayName}
                              </h3>
                              <p style={{
                                fontSize: '0.78rem',
                                color: '#64748b',
                                margin: 0,
                                whiteSpace: isExpanded ? 'normal' : 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {desc}
                              </p>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {(() => {
                              const basePrice = resolveProductBasePrice(product);
                              if (!basePrice) return null;
                              return (
                                <div style={{ textAlign: 'right', marginRight: '6px' }}>
                                  <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, display: 'block' }}>EXW</span>
                                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{formatCurrencyPrice(basePrice)}</strong>
                                </div>
                              );
                            })()}
                            <button
                              type="button"
                              onClick={(e) => toggleExpand(product.id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '6px 8px'
                              }}
                            >
                              <span>{isExpanded ? (isEs ? 'Menos' : 'Less') : (isEs ? 'Detalles' : 'Details')}</span>
                              <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            {(() => {
                              const doc = resolveProductDatasheet(product, brandSlug);
                              if (!doc) return null;
                              return (
                                <a
                                  href={doc.url}
                                  download={doc.filename}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Download official datasheet: ${doc.title}`}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #fed7aa',
                                    background: '#fff7ed',
                                    color: '#ea580c',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <FileText size={13} color="#ea580c" />
                                  <span>PDF ↓</span>
                                </a>
                              );
                            })()}
                            <button
                              type="button"
                              onClick={() => handleProductClick(product)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.borderColor = '#94a3b8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }}
                            >
                              <Eye size={13} style={{ color: '#0284c7' }} />
                              <span>{isEs ? 'Ver Producto' : 'View Product'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Expandable Details in Table mode */}
                        {isExpanded && (
                          <div style={{
                            background: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            padding: '10px 14px',
                            fontSize: '0.76rem',
                            color: '#334155',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '8px'
                          }}>
                            <div>
                              <strong style={{ color: '#0f172a' }}>
                                {brandSlug === 'colway' 
                                  ? (isEs ? 'Fabricación & Estándar:' : 'Quality & Compliance:')
                                  : (isEs ? 'Laboratorio de Referencia:' : 'Reference Lab:')
                                }
                              </strong> {
                                brandSlug === 'eterna' ? 'Eurofins Genomics (Munich/Ebersberg) · CAP / CLIA / ISO 17025' :
                                brandSlug === 'ultraperson' ? 'PharmaPolis Compounding Labs · EU GMP / cGMP' :
                                brandSlug === 'colway' ? 'Colway sp.j. (Poland / EU) · ISO 22716 / CPNP Compliant' :
                                'LifeLab1 Central Lab (Vilnius) · ISO 15189'
                              }
                            </div>
                            <div>
                              <strong style={{ color: '#0f172a' }}>
                                {brandSlug === 'colway'
                                  ? (isEs ? 'Tecnología Bioactiva:' : 'Bioactive Technology:')
                                  : (isEs ? 'Tecnología / Metodología:' : 'Analytical Method:')
                                }
                              </strong> {
                                brandSlug === 'eterna' ? 'Illumina Infinium +700k SNPs & High-Density Proteomics' :
                                brandSlug === 'ultraperson' ? 'Vegan HPMC Delayed-Release Capsule Standardization' :
                                brandSlug === 'colway' ? 'Intact 3D Triple-Helix Tropocollagen & Cold Freeze-Drying' :
                                'LC-MS/MS & UHPLC Tandem MS'
                              }
                            </div>
                            {brandSlug !== 'colway' && (
                              <div>
                                <strong style={{ color: '#0f172a' }}>
                                  {isEs ? 'Tiempo de Respuesta / Logística:' : 'Turnaround / Logistics:'}
                                </strong> {
                                  brandSlug === 'eterna' ? '15 – 20 Business Days' :
                                  brandSlug === 'ultraperson' ? '48 – 72h Compounding Dispatch' :
                                  '48 – 72h post-receipt'
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={product.id}
                      className="gcp-collection-card"
                    >
                      {/* Card Visual / Showcase (Left Column on Desktop) */}
                      <div
                        className="gcp-collection-card-visual"
                        onClick={() => handleProductClick(product)}
                      >
                        <img
                          src={imageSrc}
                          alt={displayName}
                        />

                        {/* Top Badges: Multi-country Regulatory Registration */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '85%' }}>
                          {resolveProductRegulatoryBadges(product, brandSlug).map((rb, idx) => (
                            <span
                              key={idx}
                              title={rb.title}
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: rb.bg,
                                color: rb.color,
                                border: `1px solid ${rb.border}`,
                                backdropFilter: 'blur(4px)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {rb.label}
                            </span>
                          ))}
                        </div>

                        {/* Formulation Line Badge (Below image, aligned to left) */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.67rem',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase'
                        }}>
                          {brandSlug === 'colway' ? (
                            product.category?.toLowerCase().includes('trichology') || product.slug?.includes('shampoo') || product.slug?.includes('conditioner')
                              ? 'Bio-Collagen Trichology'
                              : product.category?.toLowerCase().includes('nutricosmetic') || product.slug?.includes('colvita')
                              ? 'Bioactive Nutricosmetic'
                              : 'Native Bio-Collagen'
                          ) : brandSlug === 'eterna' ? 'Genomic Multi-Omics' : brandSlug === 'ultraperson' ? 'Longevity Formula' : 'Laboratory Diagnostic'}
                        </div>
                      </div>

                      {/* Card Content Area (Right Column on Desktop) */}
                      <div className="gcp-collection-card-body">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ID: <CopyableId value={product.id} maxLength={18} />
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> {brandSlug === 'eterna' ? 'Eurofins Genomics' : brandSlug === 'ultraperson' ? 'PharmaPolis Labs' : brandSlug === 'colway' ? 'Colway Dermocosmetics' : 'LifeLab1'}
                          </span>
                        </div>

                        <h3
                          onClick={() => handleProductClick(product)}
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 6px 0',
                            lineHeight: 1.3,
                            cursor: 'pointer'
                          }}
                        >
                          {displayName}
                        </h3>

                        {brandSlug === 'colway' && (product.routine_badge || product.step_number != null) && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f0fdfa',
                            border: '1px solid #99f6e4',
                            color: '#0d9488',
                            fontSize: '0.69rem',
                            fontWeight: 700,
                            marginBottom: '6px',
                            width: 'fit-content'
                          }}>
                            <Sparkles size={11} />
                            <span>{product.routine_badge || `Step ${product.step_number}`}</span>
                          </div>
                        )}

                        <div style={{
                          fontSize: '0.75rem',
                          color: brandSlug === 'colway' ? '#0d9488' : '#0284c7',
                          fontWeight: 600,
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {brandSlug === 'bloodo' ? <Droplets size={13} /> : <Sparkles size={13} />}
                          <span>{sampleType}</span>
                        </div>

                        <p style={{
                          fontSize: '0.82rem',
                          color: '#475569',
                          lineHeight: 1.5,
                          margin: '0 0 1rem 0',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {desc}
                        </p>

                        {/* Master-Detail Expandable Drawer (Regla #4) */}
                        {isExpanded && (
                          <div style={{
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            padding: '10px 12px',
                            fontSize: '0.76rem',
                            color: '#334155',
                            marginBottom: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div>
                              <strong style={{ color: '#0f172a' }}>
                                {brandSlug === 'colway' 
                                  ? (isEs ? 'Fabricación & Estándar:' : 'Quality & Compliance:')
                                  : (isEs ? 'Laboratorio de Referencia:' : 'Reference Lab:')
                                }
                              </strong> {
                                brandSlug === 'eterna' ? 'Eurofins Genomics (Munich/Ebersberg) · CAP / CLIA / ISO 17025' :
                                brandSlug === 'ultraperson' ? 'PharmaPolis Compounding Labs · EU GMP / cGMP' :
                                brandSlug === 'colway' ? 'Colway sp.j. (Poland / EU) · ISO 22716 / CPNP Compliant' :
                                'LifeLab1 Central Lab (Vilnius) · ISO 15189'
                              }
                            </div>
                            <div>
                              <strong style={{ color: '#0f172a' }}>
                                {brandSlug === 'colway'
                                  ? (isEs ? 'Tecnología Bioactiva:' : 'Bioactive Technology:')
                                  : (isEs ? 'Tecnología / Metodología:' : 'Analytical Method:')
                                }
                              </strong> {
                                brandSlug === 'eterna' ? 'Illumina Infinium +700k SNPs & High-Density Proteomics' :
                                brandSlug === 'ultraperson' ? 'Vegan HPMC Delayed-Release Capsule Standardization' :
                                brandSlug === 'colway' ? 'Intact 3D Triple-Helix Tropocollagen & Cold Freeze-Drying' :
                                'LC-MS/MS & UHPLC Tandem MS'
                              }
                            </div>
                            {brandSlug !== 'colway' && (
                              <div>
                                <strong style={{ color: '#0f172a' }}>
                                  {isEs ? 'Tiempo de Respuesta / Logística:' : 'Turnaround / Logistics:'}
                                </strong> {
                                  brandSlug === 'eterna' ? '15 – 20 Business Days' :
                                  brandSlug === 'ultraperson' ? '48 – 72h Compounding Dispatch' :
                                  '48 – 72h post-receipt'
                                }
                              </div>
                            )}
                            {(() => {
                              const doc = resolveProductDatasheet(product, brandSlug);
                              if (!doc) return null;
                              return (
                                <div style={{
                                  marginTop: '4px',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  background: '#fff7ed',
                                  border: '1px solid #fed7aa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileText size={14} color="#ea580c" />
                                    <span style={{ fontSize: '0.74rem', color: '#9a3412', fontWeight: 650 }}>
                                      {doc.title} ({doc.size})
                                    </span>
                                  </div>
                                  <a
                                    href={doc.url}
                                    download={doc.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.70rem',
                                      fontWeight: 800,
                                      color: '#ffffff',
                                      background: '#ea580c',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    Download PDF ↓
                                  </a>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Clinical Wholesale Pricing & EXW Incoterm (Fase 3) */}
                        {(() => {
                          const basePrice = resolveProductBasePrice(product);
                          if (!basePrice) return null;
                          return (
                            <div style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              justifyContent: 'space-between',
                              marginBottom: '0.65rem',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div>
                                <span style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: 650, display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                  Practitioner B2B (EXW)
                                </span>
                                <span style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f172a' }}>
                                  {formatCurrencyPrice(basePrice)}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.66rem', color: '#0d9488', fontWeight: 750, background: '#f0fdfa', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccfbf1' }}>
                                Ex-Works (EXW)
                              </span>
                            </div>
                          );
                        })()}

                        {/* Card Action Strip */}
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(product.id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 0'
                            }}
                          >
                            <span>{isExpanded ? (isEs ? 'Ocultar' : 'Hide Specs') : (isEs ? 'Master-Detail' : (brandSlug === 'colway' ? 'Clinical Specs' : 'Specs & Lab'))}</span>
                            <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {(() => {
                              const doc = resolveProductDatasheet(product, brandSlug);
                              if (!doc) return null;
                              return (
                                <a
                                  href={doc.url}
                                  download={doc.filename}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Download official datasheet: ${doc.title}`}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #fed7aa',
                                    background: '#fff7ed',
                                    color: '#ea580c',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <FileText size={13} color="#ea580c" />
                                  <span>PDF ↓</span>
                                </a>
                              );
                            })()}
                            {brandSlug === 'colway' && (
                              <a
                                href={getWhatsAppInquiryUrl(product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`WhatsApp consultation for ${product.name || product.title}`}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #bbf7d0',
                                  background: '#f0fdf4',
                                  color: '#15803d',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <MessageSquare size={13} color="#16a34a" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleProductClick(product)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.borderColor = '#94a3b8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }}
                            >
                              <Eye size={13} style={{ color: '#0284c7' }} />
                              <span>{isEs ? 'Ver Producto' : 'View Product'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* ── FLOATING ACTION DOCK / STICKED FOOT (Regla Golden User Idea) ── */}
      <div className="collection-bottom-dock">
        {/* Left: Brand Chip / Mobile Categories Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="collection-dock-mobile-only"
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '9999px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={12} color="#0d9488" />
            <span>{isEs ? 'Categorías' : 'Categories'}</span>
          </button>

          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: config.accentColor
          }} />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
            {config.name}
          </span>
          <span className="collection-dock-hide-mobile" style={{ fontSize: '0.74rem', color: '#64748b' }}>
            · {filteredProducts.length} {isEs ? 'ítems en catálogo' : 'items'}
          </span>
        </div>

        {/* Dock Actions: Inquire Info + Atlas AI 5/5 (All Unified in One Single Footer) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && (
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '9999px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={13} />
              <span>{isEs ? 'Ver Carrito' : 'View Cart'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsInquiryDrawerOpen(true)}
            title={isEs ? 'Solicitar información del producto, ficha técnica y precios institucionales' : 'Inquire product information, technical dossiers and institutional pricing'}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '9999px',
              background: config.accentColor,
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <FileText size={13} />
            <span>{isEs ? 'Consultar Info' : 'Inquire Info'}</span>
          </button>

          {/* Direct WhatsApp Clinical Concierge (Fase 1) */}
          <a
            href={getWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('selection')}
            title={isEs ? 'Consulta Rápida por WhatsApp con Dirección Médica' : 'Fast WhatsApp Direct Inquiry with Medical Affairs'}
            style={{
              height: '36px',
              padding: '0 13px',
              borderRadius: '9999px',
              background: '#25D366',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: 750,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={14} color="#ffffff" />
            <span>WhatsApp</span>
          </a>

          {/* Simple Atlas AI 5/5 trigger button integrated in the single footer dock */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setIsAtlasAiOpen(true);
            }}
            title={isEs ? 'Atlas AI (Tope máximo de 5 consultas por sesión)' : 'Atlas AI (Maximum 5 inquiries per session)'}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(0, 54, 102, 0.3)'
            }}
          >
            <Sparkles size={14} color="#38bdf8" />
            <span>Atlas AI 5/5</span>
          </button>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER (Golden Rule #23) ── */}
      {isMobileSidebarOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-start'
        }}
        onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '360px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              position: 'sticky',
              top: 0,
              background: '#ffffff',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} color={config.accentColor} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {isEs ? 'Departamentos & Filtros' : 'Departments & Filters'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body: Sidebar per brand */}
            <div style={{ padding: '1rem' }}>
              {brandSlug === 'bloodo' ? (
                <BloodoCollectionSidebar lang={lang} onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }} />
              ) : brandSlug === 'eterna' ? (
                <EternaCollectionSidebar lang={lang} onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }} />
              ) : brandSlug === 'ultraperson' ? (
                <UltraPersonCollectionSidebar lang={lang} onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }} />
              ) : (
                <ColwayCollectionSidebar
                  lang={lang}
                  onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => {
                    setSelectedCategory(catId);
                    setIsMobileSidebarOpen(false);
                    const el = document.getElementById('colway-main-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  onSearchKeyword={(kw) => {
                    setSearchQuery(kw);
                    setIsMobileSidebarOpen(false);
                    const el = document.getElementById('colway-main-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Friction-Free Professional Access Modal ── */}
      {isAuthModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1
              }}
            >
              ✕
            </button>

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${config.accentColor}18`,
              color: config.accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={26} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                {isEs ? 'Acceso Profesional & Clínicas' : 'Professional & Clinical Access'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {isEs
                  ? `Consulta baremos mayoristas, protocolos CPNP y expedición directa para centros médicos y especialistas de ${config.name}.`
                  : `Access wholesale tiers, official CPNP clinical monographs, and direct clinic dispatch for ${config.name}.`}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '0.25rem' }}>
              {/* Option 1: 1-Click Google Sign-In */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                    setIsAuthModalOpen(false);
                  } catch (err) {
                    console.error('Google Sign In error:', err);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{isEs ? 'Acceder con Google (1 clic directo)' : 'Continue with Google (1-Click)'}</span>
              </button>

              {/* Option 2: Direct Consultation without Account */}
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsInquiryDrawerOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'rgba(13, 148, 136, 0.08)',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  color: '#0d9488',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={15} />
                <span>{isEs ? '💬 Consultar sin Registro (Mesa Clínica)' : '💬 Inquire without Account (Clinical Desk)'}</span>
              </button>

              {/* Option 3: Traditional Email/Password Link */}
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => router.push(`/auth/login?redirect=/collection/${brandSlug}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isEs ? 'O acceder con email y contraseña' : 'Or sign in with email & password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Context-Aware Clinical Inquiry Drawer ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="brand_collection"
        brandType={brandSlug}
        initialEntity={{
          brandSlug,
          brandName: config.name,
          catalogCount: filteredProducts.length
        }}
      />

      {/* ── Public Atlas AI Copilot Drawer (Unified in single footer dock) ── */}
      <PublicAtlasAIDrawer
        isOpenControlled={isAtlasAiOpen}
        onCloseControlled={() => setIsAtlasAiOpen(false)}
        hideFloatingTrigger={true}
        contextType="brand_collection"
        contextAnchor={activeSectionContext}
        collectionProducts={filteredProducts}
        storageKey={`colway_${selectedCategory}`}
      />

      {/* ── 7. Unified Public Institutional Footer (Bottom) ── */}
      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}

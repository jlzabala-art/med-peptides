'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Share2,
  Check,
  ShoppingCart,
  ShieldCheck,
  Box,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  Lock,
  ArrowRight,
  Eye,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
  Zap,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import Breadcrumb from '@/components/ui/Breadcrumb';
import EmptyState from '@/components/ui/EmptyState';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';
import ClinicalProtocolDrawer from '@/components/pricing/ClinicalProtocolDrawer';
import AtlasAiCopilotDrawer from '@/components/pricing/AtlasAiCopilotDrawer';
import { COUNTRIES } from '@/data/countries';
import '../colway/ColwayPriceList.css';

const CATEGORY_MAP = {
  repair: { label: 'Tissue Repair & Healing', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: '🩹' },
  metabolic: { label: 'Metabolic & GLP-1', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '⚡' },
  longevity: { label: 'Longevity & Cellular', color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', icon: '🧬' },
  neuro: { label: 'Neuro & Cognitive', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5', icon: '🧠' },
  growth_hormone: { label: 'GH Secretagogues', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', icon: '🚀' },
  cosmetic: { label: 'Dermal & Follicular', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8', icon: '✨' },
  general_health: { label: 'Bioactive Peptide', color: '#475569', bg: '#f8fafc', border: '#e2e8f0', icon: '🧪' },
  supplies: { label: 'Solvents & Supplies', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: '💧' }
};

const CATEGORY_ORDER = [
  'repair',
  'metabolic',
  'longevity',
  'neuro',
  'growth_hormone',
  'cosmetic',
  'general_health',
  'supplies'
];

const DOSAGE_STRENGTHS = [
  { id: 'all', label: 'All Strengths' },
  { id: '5mg', label: '5 mg' },
  { id: '10mg', label: '10 mg' },
  { id: '20mg_plus', label: '15–20 mg+' }
];

const CLINICAL_PRESETS = [
  {
    id: 'tissue_repair',
    name: 'Tissue Repair Protocol',
    icon: '🩹',
    description: 'BPC-157 (10mg) + TB-500 (10mg)',
    categoryName: 'Musculoskeletal & Tendon Repair',
    accent: '#0284c7',
    accentBg: '#f0f9ff',
    searchTerms: ['bpc-157', 'tb-500'],
    dosageFilter: '10mg',
    cycleDuration: '6 to 8 Consecutive Weeks',
    administration: 'Subcutaneous (SQ) injection near injury site or abdomen',
    posology: 'BPC-157: 250–500 mcg twice daily. TB-500: 2.0–2.5 mg twice weekly.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'BPC-157 accelerates focal neo-angiogenesis via VEGF upregulation and stabilizes granulation tissue. TB-500 acts as a cellular G-actin sequestrant, inducing rapid migration of myoblasts and endothelial progenitor cells into damaged connective tissue matrices.',
    outcomes: [
      'Accelerated collagen Type I & III synthesis in tendon-to-bone junctions',
      'Rapid resolution of micro-vascular inflammation and muscular soreness',
      'Systemic gastro-protective endothelial stabilization'
    ],
    peptides: [
      { name: 'BPC-157', dosage: '10 mg', role: 'Angiogenic Repair & Collagen Synthesis' },
      { name: 'TB-500 (Thymosin Beta-4)', dosage: '10 mg', role: 'Actin Regulation & Fibroblast Migration' }
    ]
  },
  {
    id: 'metabolic_glp1',
    name: 'Metabolic & GLP-1 Protocol',
    icon: '⚡',
    description: 'Tirzepatide (10mg) + Retatrutide (10mg)',
    categoryName: 'Dual/Triple Incretin Synergy',
    accent: '#16a34a',
    accentBg: '#f0fdf4',
    searchTerms: ['tirzepatide', 'retatrutide'],
    dosageFilter: '10mg',
    cycleDuration: '8 to 12 Weeks Titration',
    administration: 'Subcutaneous (SQ) injection once weekly (abdominal rotation)',
    posology: 'Starting titration: 2.5 mg once weekly for 4 weeks, escalating to 5.0 mg – 7.5 mg weekly based on glycemic/adipose response.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Simultaneous GLP-1 (satiety & gastric delay), GIP (adipose lipid buffering & insulinotropic balance), and Glucagon receptor agonism (mitochondrial thermogenesis and resting energy expenditure enhancement).',
    outcomes: [
      'Significant reduction in visceral adipose tissue and waist circumference',
      'Suppression of food noise and restoration of glycemic sensitivity',
      'Hepatic steatosis resolution through glucagon-mediated lipid clearance'
    ],
    peptides: [
      { name: 'Tirzepatide', dosage: '10 mg', role: 'Dual GIP / GLP-1 Receptor Agonist' },
      { name: 'Retatrutide', dosage: '10 mg', role: 'Triple GIP / GLP-1 / Glucagon Agonist' }
    ]
  },
  {
    id: 'cellular_longevity',
    name: 'Longevity & Cellular Protocol',
    icon: '🧬',
    description: 'Epithalon (10mg) + MOTS-c (10mg)',
    categoryName: 'Telomeric & Mitochondrial Health',
    accent: '#7c3aed',
    accentBg: '#faf5ff',
    searchTerms: ['epithalon', 'mots-c'],
    dosageFilter: '10mg',
    cycleDuration: '20 to 60 Days Cyclic Routine',
    administration: 'Subcutaneous (SQ) injection (morning upon waking)',
    posology: 'Epithalon: 5–10 mg daily for 10–20 days (repeat 2x per year). MOTS-c: 5–10 mg 3x weekly for 4–8 weeks.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Epithalon induces telomerase elongation and regulates pineal melatonin/circadian expression. MOTS-c translocates to the cell nucleus upon metabolic stress to trigger AMPK activation and mitochondrial biogenesis.',
    outcomes: [
      'Cellular senescence defense and genomic integrity stabilization',
      'Enhanced insulin sensitivity and systemic metabolic flexibility',
      'Deep circadian rhythm realignment and slow-wave sleep depth'
    ],
    peptides: [
      { name: 'Epithalon', dosage: '10 mg', role: 'Telomerase Induction & Pineal Regulation' },
      { name: 'MOTS-c', dosage: '10 mg', role: 'Mitochondrial-Derived Peptide & AMPK Activator' }
    ]
  },
  {
    id: 'cognitive_neuro',
    name: 'Neuro & Focus Protocol',
    icon: '🧠',
    description: 'Semax (10mg) + Selank (10mg)',
    categoryName: 'Neuropeptide Cognitive Optimization',
    accent: '#ea580c',
    accentBg: '#fff7ed',
    searchTerms: ['semax', 'selank'],
    dosageFilter: '10mg',
    cycleDuration: '4 to 6 Weeks Consecutive Cycle',
    administration: 'Subcutaneous (SQ) or Intranasal reconstitutions',
    posology: 'Semax: 250–500 mcg morning. Selank: 250–500 mcg late afternoon or evening.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Semax triggers potent BDNF (Brain-Derived Neurotrophic Factor) and TrkB receptor expression in the hippocampus. Selank modulates GABAergic neurotransmission and suppresses enkephalin degradation without sedation.',
    outcomes: [
      'Marked enhancement of executive focus, working memory, and mental stamina',
      'Robust stress resilience and reduction of Generalized Anxiety symptoms',
      'Cerebrovascular neuroprotection and synaptic plasticity enhancement'
    ],
    peptides: [
      { name: 'Semax', dosage: '10 mg', role: 'BDNF/TrkB Upregulation & Executive Function' },
      { name: 'Selank', dosage: '10 mg', role: 'GABA-A Modulation & Stress Reduction' }
    ]
  },
  {
    id: 'gh_secretagogue',
    name: 'GH Secretagogue Axis',
    icon: '🚀',
    description: 'CJC-1295 (5mg) + Ipamorelin (5mg)',
    categoryName: 'Somatotropic Pituitary Pulsatility',
    accent: '#0d9488',
    accentBg: '#f0fdfa',
    searchTerms: ['cjc-1295', 'ipamorelin'],
    dosageFilter: '5mg',
    cycleDuration: '8 to 12 Consecutive Weeks (5 days on / 2 days off)',
    administration: 'Subcutaneous (SQ) pre-bedtime on an empty stomach (2h post-meal)',
    posology: '100–200 mcg CJC-1295 + 100–300 mcg Ipamorelin once daily before sleep.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'CJC-1295 (GHRH analog) amplifies natural growth hormone pulse amplitude, while Ipamorelin (selective GHSR-1a agonist) triggers pituitary release without elevating cortisol, prolactin, or appetite-stimulating ghrelin.',
    outcomes: [
      'Pulsatile nocturnal growth hormone & circulating IGF-1 elevation',
      'Enhanced lean body mass preservation and lipolysis',
      'Accelerated micro-connective tissue repair and deeper stage-4 restorative sleep'
    ],
    peptides: [
      { name: 'CJC-1295 (No DAC)', dosage: '5 mg', role: 'GHRH Secretagogue Pulse Amplifier' },
      { name: 'Ipamorelin', dosage: '5 mg', role: 'Selective Ghrelin/GHSR-1a Receptor Agonist' }
    ]
  }
];

export default function PeptidesPriceListClient({ initialProducts = [], referralCode = 'CAT-RX-7482', isDistributor = false }) {
  const [currency, setCurrency] = useState('USD'); // USD, EUR, AED
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStrength, setSelectedStrength] = useState('all'); // 'all' | '5mg' | '10mg' | '20mg_plus'
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22)
  const [copied, setCopied] = useState(false);
  const [hasRestoredCart, setHasRestoredCart] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);

  // Debounce search query to keep main thread at 60fps on mobile (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Order Drawer State
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState({}); // { [productId]: { quantity1x: 0, quantity10x: 0, product } }
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    phoneCountryCode: 'es',
    country: 'Spain',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    company_fax: '' // Anti-spam Honeypot (hidden from real users)
  });

  // ── Cart & Contact Draft Persistence (Anti-abandonment) ──
  const storageKey = `atlas_peptides_b2b_cart_${referralCode || 'CAT-RX-7482'}`;

  // Persist current tier & referral to localStorage so registration inherits correct pricing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_peptides_tier', isDistributor ? 'distributor' : 'wholesaler');
        localStorage.setItem('atlas_peptides_referral', referralCode || (isDistributor ? 'DISTRIBUTOR-15' : 'WHOLESALER-B2B'));
      } catch (e) {}
    }
  }, [isDistributor, referralCode]);

  // Hydrate cart & contact on initial mount (asynchronously to avoid cascading renders)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setCartItems(parsed);
            setHasRestoredCart(true);
          }
        }
        const savedContact = localStorage.getItem('atlas_peptides_b2b_contact');
        if (savedContact) {
          const parsedContact = JSON.parse(savedContact);
          if (parsedContact && typeof parsedContact === 'object') {
            setOrderForm(prev => ({ ...prev, ...parsedContact, company_fax: '' }));
          }
        }
      } catch (err) {
        console.warn('Could not restore cached cart:', err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (Object.keys(cartItems).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.warn('Could not save cart:', err);
    }
  }, [cartItems, storageKey]);

  // Sync contact info to localStorage (excluding honeypot)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const toSave = { ...orderForm };
      delete toSave.company_fax;
      localStorage.setItem('atlas_peptides_b2b_contact', JSON.stringify(toSave));
    } catch (err) {
      console.warn('Could not save contact draft:', err);
    }
  }, [orderForm]);

  // Currency conversions (Base USD)
  const fxRate = useMemo(() => {
    if (currency === 'EUR') return 0.92;
    if (currency === 'AED') return 3.6725;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'EUR') return '€';
    if (currency === 'AED') return 'AED ';
    return '$';
  }, [currency]);

  const formatPrice = useCallback((usdAmount) => {
    if (usdAmount == null || isNaN(usdAmount)) return '—';
    const converted = usdAmount * fxRate;
    return `${currencySymbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currencySymbol, fxRate]);

  // Helper to extract numeric dosage for ascending sort (2mg < 5mg < 10mg < 20mg)
  const parseDoseNum = (str = '') => {
    const match = String(str).match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Map, categorize and sort products by Category Priority and Ascending Dose
  const processedProducts = useMemo(() => {
    const mapped = initialProducts.map((p) => {
      const nameLower = (p.productName || '').toLowerCase();
      let categoryKey = p.primaryGoal || 'general_health';

      if (nameLower.includes('bac water') || nameLower.includes('bacteriostatic') || nameLower.includes('water') || nameLower.includes('diluent') || nameLower.includes('solvent') || nameLower.includes('saline')) {
        categoryKey = 'supplies';
      } else if (nameLower.includes('semaglutide') || nameLower.includes('tirzepatide') || nameLower.includes('retatrutide') || nameLower.includes('aod') || nameLower.includes('cagrilintide') || nameLower.includes('survodutide')) {
        categoryKey = 'metabolic';
      } else if (nameLower.includes('bpc') || nameLower.includes('tb-500') || nameLower.includes('kpv') || nameLower.includes('thymosin beta')) {
        categoryKey = 'repair';
      } else if (nameLower.includes('epithalon') || nameLower.includes('mots-c') || nameLower.includes('ss-31') || nameLower.includes('humanin') || nameLower.includes('foxo4') || nameLower.includes('nad')) {
        categoryKey = 'longevity';
      } else if (nameLower.includes('semax') || nameLower.includes('selank') || nameLower.includes('dihexa') || nameLower.includes('oxytocin') || nameLower.includes('pinealon')) {
        categoryKey = 'neuro';
      } else if (nameLower.includes('cjc') || nameLower.includes('ipamorelin') || nameLower.includes('sermorelin') || nameLower.includes('ghrp') || nameLower.includes('hexarelin') || nameLower.includes('tesamorelin')) {
        categoryKey = 'growth_hormone';
      } else if (nameLower.includes('ghk') || nameLower.includes('ahk') || nameLower.includes('snap-8')) {
        categoryKey = 'cosmetic';
      }

      return {
        ...p,
        categoryKey,
        categoryMeta: CATEGORY_MAP[categoryKey] || CATEGORY_MAP.general_health
      };
    });

    // Sort by Category Priority Order, then by Product Name, then by Numerical Dose ascending
    const sorted = [...mapped].sort((a, b) => {
      const catA = CATEGORY_ORDER.indexOf(a.categoryKey) !== -1 ? CATEGORY_ORDER.indexOf(a.categoryKey) : 99;
      const catB = CATEGORY_ORDER.indexOf(b.categoryKey) !== -1 ? CATEGORY_ORDER.indexOf(b.categoryKey) : 99;
      if (catA !== catB) return catA - catB;

      const nameA = (a.productName || '').trim();
      const nameB = (b.productName || '').trim();
      const comp = nameA.localeCompare(nameB);
      if (comp !== 0) return comp;

      return parseDoseNum(a.dosage) - parseDoseNum(b.dosage);
    });

    // Assign sequential item numbers
    return sorted.map((p, idx) => ({
      ...p,
      itemNumber: idx + 1
    }));
  }, [initialProducts]);

  // Filtering with debounced query (Keeps 60fps responsiveness on mobile devices)
  const filteredProducts = useMemo(() => {
    return processedProducts.filter(p => {
      const q = debouncedSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.productName || '').toLowerCase().includes(q) ||
        (p.dosage || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.categoryMeta.label || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || p.categoryKey === selectedCategory;

      let matchesStrength = true;
      if (selectedStrength !== 'all') {
        const d = (p.dosage || '').toLowerCase();
        if (selectedStrength === '5mg') {
          matchesStrength = d.includes('5 mg') || d.includes('5mg') || d.includes('5.0');
        } else if (selectedStrength === '10mg') {
          matchesStrength = d.includes('10 mg') || d.includes('10mg');
        } else if (selectedStrength === '20mg_plus') {
          matchesStrength = d.includes('15') || d.includes('20') || d.includes('30') || d.includes('50') || d.includes('60') || d.includes('100');
        }
      }

      return matchesSearch && matchesCat && matchesStrength;
    });
  }, [processedProducts, debouncedSearchQuery, selectedCategory, selectedStrength]);

  // Cart quantity update & removal helpers
  const updateItemQuantity = useCallback((productId, type, delta) => {
    setCartItems(prev => {
      const existing = prev[productId];
      if (!existing) return prev;
      const field = type === '10x' ? 'quantity10x' : 'quantity1x';
      const nextVal = Math.max(0, (existing[field] || 0) + delta);
      const otherField = type === '10x' ? 'quantity1x' : 'quantity10x';
      if (nextVal === 0 && (existing[otherField] || 0) === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...existing,
          [field]: nextVal
        }
      };
    });
  }, []);

  const handlePrintProforma = useCallback(() => {
    if (Object.keys(cartItems).length === 0) {
      toast.error('Please select formulations before printing or saving a PDF proforma.');
      return;
    }
    window.print();
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (product, packType) => {
    setCartItems(prev => {
      const current = prev[product.id] || { quantity1x: 0, quantity10x: 0, product };
      const updated = {
        ...current,
        [packType === '10x' ? 'quantity10x' : 'quantity1x']: current[packType === '10x' ? 'quantity10x' : 'quantity1x'] + 1
      };
      return { ...prev, [product.id]: updated };
    });
    toast.success(`Added ${product.productName} (${packType === '10x' ? 'Pack ×10' : '1x Vial'}) to request ✓`);
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity1x + (item.quantity10x * 10), 0);
  }, [cartItems]);

  const totalCartValueUsd = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => {
      const p = item.product;
      const v1x = (item.quantity1x || 0) * (p.unitPrice || 0);
      const v10x = (item.quantity10x || 0) * (p.pack10Price || (p.unitPrice * 10 * 0.85));
      return sum + v1x + v10x;
    }, 0);
  }, [cartItems]);

  // Express Medical Logistics (60 EUR base)
  const _shippingCostEur = 60;
  const shippingCostUsd = useMemo(() => {
    return Math.round((60 / 0.92) * 100) / 100; // $65.22 USD
  }, []);

  const shippingCostCurrentCurrency = useMemo(() => {
    if (currency === 'EUR') return 60;
    if (currency === 'AED') return Math.round((60 / 0.92) * 3.6725 * 100) / 100; // 239.50 AED
    return shippingCostUsd; // 65.22 USD
  }, [currency, shippingCostUsd]);

  const grandTotalCartValueUsd = useMemo(() => {
    return totalCartCount > 0 ? (totalCartValueUsd + shippingCostUsd) : 0;
  }, [totalCartCount, totalCartValueUsd, shippingCostUsd]);

  // 1-Click Protocol Preset Addition Helper (Mejora #2)
  const handleAddProtocolPreset = useCallback((preset, isPack10 = false) => {
    let addedCount = 0;
    const itemsToAdd = {};

    preset.searchTerms.forEach(term => {
      const cleanTerm = term.toLowerCase().trim();
      // Prioritize pure individual peptide without picking up combo blends (e.g. 'tb-500' shouldn't grab 'bpc-157 + tb-500')
      const match = processedProducts.find(p => {
        const name = (p.productName || '').toLowerCase().trim();
        const dose = (p.dosage || '').toLowerCase();
        const isCleanMatch = (name === cleanTerm || name.startsWith(`${cleanTerm} `) || name.startsWith(`${cleanTerm}(`)) && !name.includes('+');
        return isCleanMatch && (preset.dosageFilter ? dose.includes(preset.dosageFilter) : true);
      }) || processedProducts.find(p => {
        const name = (p.productName || '').toLowerCase().trim();
        const dose = (p.dosage || '').toLowerCase();
        return name.includes(cleanTerm) && (preset.dosageFilter ? dose.includes(preset.dosageFilter) : true);
      }) || processedProducts.find(p => (p.productName || '').toLowerCase().includes(cleanTerm));

      if (match) {
        itemsToAdd[match.id] = match;
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setCartItems(prev => {
        const updated = { ...prev };
        Object.values(itemsToAdd).forEach(prod => {
          const current = updated[prod.id] || { quantity1x: 0, quantity10x: 0, product: prod };
          if (isPack10) {
            updated[prod.id] = {
              ...current,
              quantity10x: current.quantity10x + 1
            };
          } else {
            updated[prod.id] = {
              ...current,
              quantity1x: current.quantity1x + 1
            };
          }
        });
        return updated;
      });
      toast.success(`Added ${preset.name} (${addedCount} formulations${isPack10 ? ' · Pack ×10 Boxes' : ''}) to request! ✓`);
    } else {
      toast.info(`Could not automatically locate items for ${preset.name}`);
    }
  }, [processedProducts]);

  // Direct Order via WhatsApp Helper (Mejora #4)
  const handleOrderViaWhatsApp = useCallback(() => {
    if (Object.keys(cartItems).length === 0) {
      toast.error('Please add formulations before ordering via WhatsApp');
      return;
    }

    const itemsListText = Object.values(cartItems).map(item => {
      const qty1x = item.quantity1x > 0 ? `${item.quantity1x}x 1x Vial` : null;
      const qty10x = item.quantity10x > 0 ? `${item.quantity10x}x Pack ×10` : null;
      const qtyStr = [qty1x, qty10x].filter(Boolean).join(', ');
      const lineTotal = (item.quantity1x * item.product.unitPrice) + (item.quantity10x * (item.product.pack10Price || item.product.unitPrice * 8.5));
      return `• ${item.product.productName} (${item.product.dosage || 'Lyophilized'}) [${qtyStr}] ── ${currencySymbol}${lineTotal.toFixed(2)}`;
    }).join('\n');

    const totalStr = `${currencySymbol}${grandTotalCartValueUsd.toFixed(2)} ${currency}`;
    const clinicStr = orderForm.clinicName || orderForm.name ? `\nClinic: ${orderForm.clinicName || orderForm.name}` : '';
    const emailStr = orderForm.email ? `\nEmail: ${orderForm.email}` : '';
    const destinationStr = orderForm.country ? `\nDestination: ${orderForm.city ? `${orderForm.city}, ` : ''}${orderForm.country}` : '';

    const message = `Hello, I would like to place this clinical peptide proforma request (Partner Code: ${referralCode || 'CAT-RX-7482'}):

${itemsListText}

Subtotal: ${currencySymbol}${totalCartValueUsd.toFixed(2)}
Freight: Express Medical Logistics (${currencySymbol}${shippingCostCurrentCurrency.toFixed(2)})
Grand Total: ${totalStr}${clinicStr}${emailStr}${destinationStr}

Please coordinate 24-hour proforma confirmation and secure payment link. Thank you!`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  }, [cartItems, currencySymbol, grandTotalCartValueUsd, currency, orderForm, referralCode, totalCartValueUsd, shippingCostCurrentCurrency]);

  const handleShareSchedule = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Official B2B Price Schedule link copied to clipboard ✓');
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit B2B Order Request
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      toast.error('Please enter your name, email and phone number');
      return;
    }
    // Professional email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email.trim())) {
      toast.error('Please enter a valid professional email address.');
      return;
    }
    // International phone digits validation
    const digits = (orderForm.phone || '').replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      toast.error('Please enter a valid international phone number with country code (e.g. +34 600 000 000).');
      return;
    }
    if (!orderForm.addressLine1 || !orderForm.city || !orderForm.postalCode) {
      toast.error('Please provide full shipping address (Street, City, Postal Code)');
      return;
    }
    if (Object.keys(cartItems).length === 0) {
      toast.error('Your order request is empty. Please select products first.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const itemsPayload = Object.values(cartItems).map(item => {
        const totalVials = item.quantity1x + (item.quantity10x * 10);
        const packPrice = item.product.pack10Price || (item.product.unitPrice * 8.5);
        const subtotal = (item.quantity1x * item.product.unitPrice) + (item.quantity10x * packPrice);
        return {
          id: item.product.id,
          productId: item.product.productId,
          name: item.product.productName,
          productName: item.product.productName,
          dosage: item.product.dosage,
          presentation: item.product.presentation || 'Lyophilized Vial (10R)',
          quantity: totalVials,
          quantity1x: item.quantity1x,
          quantity10x: item.quantity10x,
          totalVials,
          unitPrice: item.product.unitPrice,
          unitPriceUsd: item.product.unitPrice,
          tier10UnitPrice: packPrice / 10,
          subtotal,
          subtotalUsd: subtotal
        };
      });

      const fullAddress = [
        orderForm.addressLine1,
        orderForm.addressLine2,
        orderForm.city,
        orderForm.state,
        orderForm.postalCode,
        orderForm.country
      ].filter(Boolean).join(', ');

      const totalUnits = itemsPayload.reduce((acc, i) => acc + i.totalVials, 0);
      const subtotalUsd = totalCartValueUsd;
      const finalShippingUsd = totalUnits > 0 ? shippingCostUsd : 0;
      const finalGrandTotalUsd = subtotalUsd + finalShippingUsd;

      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: itemsPayload,
          items: itemsPayload,
          contact: orderForm,
          customerName: orderForm.name,
          customerEmail: orderForm.email,
          customerPhone: orderForm.phone,
          customerAddress: fullAddress,
          customerNotes: orderForm.notes,
          shippingDestination: orderForm.country || 'International Express Medical Courier',
          referralCode: referralCode || 'CAT-RX-7482',
          source: 'public_peptides_price_schedule',
          collection: 'vials',
          subtotal: subtotalUsd,
          shippingCost: finalShippingUsd,
          shippingCostEur: 60,
          grandTotal: finalGrandTotalUsd,
          totalAmountUsd: finalGrandTotalUsd,
          totalUnits,
          currency: 'USD',
          currencySymbol: '$',
          company_fax: orderForm.company_fax || '' // Honeypot field
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Could not submit order proforma');
      }

      toast.success('Proforma request submitted successfully! Confirmation sent to your email.');
      setCartItems({});
      try {
        localStorage.removeItem(storageKey);
      } catch (storageErr) {
        console.warn('Could not clear storage cart:', storageErr);
      }
      setIsOrderDrawerOpen(false);
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error(err.message || 'Unable to send order. Please try again or contact support.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // DataTable columns (Strict Rule #30: explicit width, no horizontal scroll, Google Cloud UX)
  const columns = useMemo(() => [
    {
      key: 'itemNumber',
      label: '#',
      width: '4%',
      align: 'center',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#5f6368', fontWeight: 600 }}>
          {val ?? row?.itemNumber}
        </span>
      )
    },
    {
      key: 'productName',
      label: 'Peptide Formulation & Concentration',
      width: '43%',
      align: 'left', // STRICT: Left-aligned for clean price list readability
      sortable: true,
      render: (_, row) => (
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#202124', letterSpacing: '-0.01em' }}>
              {row.productName}
            </span>
            {row.dosage && (
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#1a73e8',
                background: '#e8f0fe',
                border: '1px solid #c2e7ff',
                padding: '2px 7px',
                borderRadius: '4px',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap'
              }}>
                {row.dosage}
              </span>
            )}
            <span style={{
              fontSize: '0.64rem',
              fontWeight: 600,
              color: row?.categoryMeta?.color,
              background: row?.categoryMeta?.bg,
              border: `1px solid ${row?.categoryMeta?.border}`,
              padding: '1px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap'
            }}>
              {row?.categoryMeta?.label}
            </span>
          </div>
          <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Sterile Lyophilized Vial (10R Borosilicate)</span>
            <span>•</span>
            <span style={{ color: '#137333', fontWeight: 600 }}>≥99.0% HPLC Analytical Purity</span>
          </div>
        </div>
      )
    },
    {
      key: 'unitPrice',
      label: 'Single Vial (1x)',
      width: '17%',
      align: 'left',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#202124', fontSize: '0.92rem' }}>
            {formatPrice(val ?? row.unitPrice)}
          </span>
          <span style={{ fontSize: '0.66rem', color: '#5f6368' }}>per sterile vial</span>
        </div>
      )
    },
    {
      key: 'pack10Price',
      label: 'Box of 10 (Pack ×10)',
      width: '20%',
      align: 'left',
      sortable: true,
      render: (_, row) => {
        const p10 = row.pack10Price || (row.unitPrice * 10 * 0.85);
        const perUnit = row.tier10UnitPrice || (row.unitPrice * 0.85);
        const discountPct = Math.max(10, Math.round((1 - (p10 / (row.unitPrice * 10))) * 100));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#137333', fontSize: '0.92rem' }}>
                {formatPrice(p10)}
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#137333',
                background: '#e6f4ea',
                border: '1px solid #ceead6',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                -{discountPct}% Box
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', color: '#137333', fontFamily: 'monospace' }}>
              ({formatPrice(perUnit)} / vial)
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Order Request',
      width: '16%',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', flexWrap: 'nowrap' }}>
          <button
            onClick={() => handleAddToCart(row, '1x')}
            style={{
              padding: '4px 7px',
              fontSize: '0.70rem',
              fontWeight: 600,
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              color: '#3c4043',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            title="Add 1 single vial to proforma"
          >
            <Plus size={11} />
            <span>1 Vial</span>
          </button>
          <button
            onClick={() => handleAddToCart(row, '10x')}
            style={{
              padding: '4px 8px',
              fontSize: '0.70rem',
              fontWeight: 600,
              background: '#1a73e8',
              border: '1px solid #1a73e8',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
            title="Add manufacturer box of 10 vials (-volume discount)"
          >
            <Box size={11} />
            <span>+Pack ×10</span>
          </button>
        </div>
      )
    }
  ], [formatPrice, handleAddToCart]);

  return (
    <div className="colway-price-root">
      {/* ── Screen Navigation Bar ── */}
      <header className="screen-nav-bar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand">
              <Sparkles size={16} className="text-sky-400" />
              <span>MEDILUXE B2B</span>
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-section">Price Schedules</span>
            <span className="nav-divider">/</span>
            <span className="nav-current">Lyophilized Peptide Vials</span>
          </div>

          <div className="nav-actions">
            {/* Currency selector */}
            <div className="currency-selector">
              <span>Display FX:</span>
              <div className="pill-group">
                {['USD', 'EUR', 'AED'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`pill-btn ${currency === curr ? 'active' : ''}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsOrderDrawerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: totalCartCount > 0 ? '#0284c7' : 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ShoppingCart size={14} />
              <span>Request Proforma</span>
              {totalCartCount > 0 && (
                <span style={{
                  background: '#ffffff',
                  color: '#0284c7',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '0.70rem',
                  fontWeight: 800
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Share button */}
            <button
              onClick={handleShareSchedule}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Copy verified price list link"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.25rem 1.25rem 4rem 1.25rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Breadcrumb items={[
            { label: 'B2B Portal', href: '/' },
            { label: 'Official Price Schedules', href: '/pricing/peptides' },
            { label: 'Clinical Peptide Vials' }
          ]} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: isDistributor ? '#0f766e' : '#0284c7',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {isDistributor ? 'Official Distributor Schedule • +15% Cost Margin' : 'Official Wholesaler Schedule • 15% + 15% Margin Tier'}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  color: '#0d9488',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  Batch Verified ≥99.0% HPLC
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                {isDistributor ? 'Certified Clinical Peptide Vials • Distributor B2B' : 'Certified Clinical Peptide Vials • Wholesaler & Clinic'}
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px', maxWidth: '850px' }}>
                {isDistributor
                  ? 'Official B2B distributor price list for certified lyophilized peptide vials (10R Borosilicate). Strictly applied +15% margin over Lotusland cost with manufacturer box volume pricing.'
                  : 'Official institutional and wholesale price schedule for sterile lyophilized bioactive peptides. Standard wholesale tier with manufacturer 10-pack volume savings.'
                }
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>Export PDF / Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Layout Styles (GCP-Inspired Desktop, Laptop & Mobile UX) */}
        <style dangerouslySetInnerHTML={{ __html: `
          .gcp-pricing-portal-layout {
            display: flex;
            gap: 1.25rem;
            align-items: flex-start;
            width: 100%;
          }
          .gcp-pricing-sidebar {
            width: 240px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            position: sticky;
            top: 72px;
          }
          .gcp-pricing-workspace {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
          }
          @media (max-width: 1024px) {
            .gcp-pricing-portal-layout {
              flex-direction: column;
              gap: 1rem;
            }
            .gcp-pricing-sidebar {
              width: 100%;
              position: static;
            }
            .gcp-categories-horizontal {
              display: flex !important;
              flex-direction: row !important;
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch;
              padding-bottom: 6px;
              gap: 6px !important;
            }
            .gcp-categories-horizontal button {
              flex-shrink: 0;
              white-space: nowrap;
            }
            .gcp-protocols-grid {
              display: grid !important;
              grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
              gap: 8px !important;
            }
          }
        ` }} />

        {/* ── Google Cloud Console 2-Column Portal Layout ── */}
        <div className="gcp-pricing-portal-layout">
          {/* ── Left Navigation Rail / Sidebar ── */}
          <aside className="gcp-pricing-sidebar">
            {/* 1. Peptide Categories Navigation Tree (GCP Left Rail Pattern) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              padding: '12px 14px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Peptide Categories
              </div>
              <div className="gcp-categories-horizontal" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: selectedCategory === 'all' ? '#e8f0fe' : 'transparent',
                    color: selectedCategory === 'all' ? '#1a73e8' : '#3c4043',
                    fontSize: '0.76rem',
                    fontWeight: selectedCategory === 'all' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = '#f1f3f4'; }}
                  onMouseLeave={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>All Formulations</span>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    background: selectedCategory === 'all' ? '#1a73e8' : '#f1f3f4',
                    color: selectedCategory === 'all' ? '#ffffff' : '#5f6368',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {processedProducts.length}
                  </span>
                </button>

                {CATEGORY_ORDER.map(key => {
                  const meta = CATEGORY_MAP[key];
                  if (!meta) return null;
                  const count = processedProducts.filter(p => p.categoryKey === key).length;
                  if (count === 0) return null;
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCategory(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        background: isSelected ? meta.bg : 'transparent',
                        color: isSelected ? meta.color : '#3c4043',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f4'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        background: isSelected ? meta.color : '#f1f3f4',
                        color: isSelected ? '#ffffff' : '#5f6368',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Clinical Protocols Directory (5 Synergies) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              padding: '12px 14px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Clinical Protocols
                </div>
                <span style={{ fontSize: '0.65rem', color: '#1a73e8', fontWeight: 700 }}>5 Presets</span>
              </div>

              <div className="gcp-protocols-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CLINICAL_PRESETS.map(preset => (
                  <div
                    key={preset.id}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${preset.accent}30`,
                      background: preset.bg,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.90rem' }}>{preset.icon}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#202124' }}>
                          {preset.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '2px' }}>
                        {preset.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedProtocol(preset)}
                        style={{
                          flex: 1,
                          padding: '4px 6px',
                          borderRadius: '4px',
                          border: '1px solid #dadce0',
                          background: '#ffffff',
                          color: '#3c4043',
                          fontSize: '0.68rem',
                          fontWeight: 650,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
                        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                        title="View full clinical dossier, mechanism, posology & reconstitution"
                      >
                        <BookOpen size={11} />
                        <span>Consult</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddProtocolPreset(preset, false)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${preset.accent}`,
                          background: preset.accent,
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        title="Add 1 cycle to proforma request"
                      >
                        <Plus size={11} />
                        <span>+ Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Data Workspace Area ── */}
          <div className="gcp-pricing-workspace">
            {/* ── 4 KPIs with Scope Switcher (Golden Rule #22) ── */}
            <div style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {/* Scope Indicator & Switcher */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #f1f5f9',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: scopeMode === 'filtered' ? '#0284c7' : '#475569',
                    background: scopeMode === 'filtered' ? '#f0f9ff' : '#f8fafc',
                    border: `1px solid ${scopeMode === 'filtered' ? '#bae6fd' : '#e2e8f0'}`,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {scopeMode === 'filtered' ? `Matching Active Filters (${filteredProducts.length} Formulations)` : `Entire Database (${processedProducts.length} Formulations)`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Metrics Scope:</span>
                  <div className="pill-group" style={{ background: '#f1f5f9' }}>
                    <button
                      onClick={() => setScopeMode('filtered')}
                      className={`pill-btn ${scopeMode === 'filtered' ? 'active' : ''}`}
                      style={{ color: scopeMode === 'filtered' ? '#0284c7' : '#64748b' }}
                    >
                      Filtered View
                    </button>
                    <button
                      onClick={() => setScopeMode('global')}
                      className={`pill-btn ${scopeMode === 'global' ? 'active' : ''}`}
                      style={{ color: scopeMode === 'global' ? '#0284c7' : '#64748b' }}
                    >
                      Global Database
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Standard Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                    Available Formulations
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {scopeMode === 'filtered' ? filteredProducts.length : processedProducts.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>
                    Sterile Lyophilized Vials
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                    Volume Pack Tier
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    -15% to -52%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>
                    On 10+ Vial Box Orders
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                    Purity Verification
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    ≥99.0%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0d9488', marginTop: '2px' }}>
                    HPLC & MS Analytical Testing
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                    Analytical Quality
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    100% COA
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0d9488', marginTop: '2px' }}>
                    Batch HPLC & Mass Spec Tested
                  </div>
                </div>
              </div>
            </div>

            {/* ── Global Search & Filters (Golden Rule #7) ── */}
            <div style={{ marginBottom: '1.25rem' }}>
              <GlobalSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by peptide name (e.g. BPC-157, Semaglutide, Tirzepatide, GHK-Cu, Epithalon)..."
                size="lg"
                resultCount={filteredProducts.length}
                filters={
                  <div>
                    {/* Dosage Strength Quick Filter Pills (Mejora #5) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Filter Strength:
                      </span>
                      {DOSAGE_STRENGTHS.map(st => {
                        const isSelected = selectedStrength === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setSelectedStrength(st.id)}
                            style={{
                              padding: '2px 9px',
                              borderRadius: '20px',
                              fontSize: '0.70rem',
                              fontWeight: isSelected ? 750 : 600,
                              border: '1px solid',
                              cursor: 'pointer',
                              background: isSelected ? '#0284c7' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              borderColor: isSelected ? '#0284c7' : '#cbd5e1',
                              transition: 'all 0.12s ease'
                            }}
                          >
                            {st.label}
                          </button>
                        );
                      })}

                      {(selectedCategory !== 'all' || selectedStrength !== 'all' || searchQuery) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('all');
                            setSelectedStrength('all');
                            setSearchQuery('');
                          }}
                          style={{
                            marginLeft: 'auto',
                            border: 'none',
                            background: 'none',
                            color: '#dc2626',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Reset Filters ×
                        </button>
                      )}
                    </div>
                  </div>
                }
              />
            </div>

            {/* ── Peptide DataTable (Golden Rule #3) ── */}
            <div style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem' }}>
                  <EmptyState
                    icon={FileText}
                    title="No peptide formulations found"
                    subtitle="Try adjusting your keyword search or category filter to discover available formulations."
                    action={{
                      label: 'Clear Filters',
                      onClick: () => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedStrength('all');
                      }
                    }}
                  />
                </div>
              ) : (
                <DataTable
                  data={filteredProducts}
                  columns={columns}
                  keyField="id"
                  pageSize={50}
                  showPagination={true}
                  sortable={true}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Quick Order Request Drawer ── */}
      {isOrderDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Request B2B Proforma
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Reference Code: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{referralCode}</span>
                </p>
              </div>
              <button
                onClick={() => setIsOrderDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {/* Selected Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Selected Formulations ({totalCartCount} Vials)
                  </h4>
                  {Object.keys(cartItems).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCartItems({});
                        try {
                          localStorage.removeItem(storageKey);
                        } catch (clearErr) {
                          console.warn('Could not clear cart storage:', clearErr);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {hasRestoredCart && Object.keys(cartItems).length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: '#065f46',
                    marginBottom: '8px'
                  }}>
                    <span>Restored previous session draft ✓</span>
                    <button
                      type="button"
                      onClick={() => setHasRestoredCart(false)}
                      style={{ background: 'transparent', border: 'none', color: '#065f46', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {Object.keys(cartItems).length === 0 ? (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                    fontSize: '0.82rem'
                  }}>
                    Your order request is currently empty. Use the "+1 Vial" or "+Pack ×10" buttons in the table to add items.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.values(cartItems).map(item => {
                      const p = item.product;
                      const lineTotal = (item.quantity1x * p.unitPrice) + (item.quantity10x * (p.pack10Price || p.unitPrice * 8.5));
                      return (
                        <div
                          key={p.id}
                          style={{
                            padding: '10px 12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                                {p.productName}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                {p.dosage} • Lyophilized Vial (10R)
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                                {formatPrice(lineTotal)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCartItems(prev => {
                                    const copy = { ...prev };
                                    delete copy[p.id];
                                    return copy;
                                  });
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#94a3b8',
                                  cursor: 'pointer',
                                  padding: '2px 4px'
                                }}
                                title="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Incremental Controls inside Drawer */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                            {/* 1x Single Vial Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>1x Vial:</span>
                              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '1x', -1)}
                                  disabled={item.quantity1x <= 0}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '3px 6px',
                                    cursor: item.quantity1x <= 0 ? 'not-allowed' : 'pointer',
                                    color: item.quantity1x <= 0 ? '#cbd5e1' : '#334155'
                                  }}
                                >
                                  <Minus size={11} />
                                </button>
                                <span style={{ padding: '0 6px', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700 }}>
                                  {item.quantity1x}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '1x', 1)}
                                  style={{ border: 'none', background: 'transparent', padding: '3px 6px', cursor: 'pointer', color: '#334155' }}
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                            </div>

                            {/* 10x Pack Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.70rem', color: '#047857', fontWeight: 700 }}>Pack ×10:</span>
                              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #a7f3d0', borderRadius: '4px', background: '#f0fdf4' }}>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '10x', -1)}
                                  disabled={item.quantity10x <= 0}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '3px 6px',
                                    cursor: item.quantity10x <= 0 ? 'not-allowed' : 'pointer',
                                    color: item.quantity10x <= 0 ? '#cbd5e1' : '#047857'
                                  }}
                                >
                                  <Minus size={11} />
                                </button>
                                <span style={{ padding: '0 6px', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
                                  {item.quantity10x}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '10x', 1)}
                                  style={{ border: 'none', background: 'transparent', padding: '3px 6px', cursor: 'pointer', color: '#047857' }}
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div style={{
                      marginTop: '0.75rem',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: '#475569' }}>
                        <span>Subtotal Formulations ({totalCartCount} vials):</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                          {formatPrice(totalCartValueUsd)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: '#0369a1' }}>
                        <span>Express Medical Logistics (€60 base):</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                          +{currencySymbol}{shippingCostCurrentCurrency.toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        paddingTop: '8px',
                        borderTop: '1px solid #cbd5e1',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Estimated Total:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.10rem', color: '#0284c7' }}>
                          {formatPrice(grandTotalCartValueUsd)}
                        </span>
                      </div>
                    </div>

                    {/* 1-Click Proforma PDF / Print button */}
                    <button
                      type="button"
                      onClick={handlePrintProforma}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 650,
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Generate official printable B2B proforma sheet"
                    >
                      <Printer size={14} />
                      <span>Print / Save PDF Proforma Quote</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmitOrder}>
                {/* ── Anti-Spam Bot Trap (Invisible to humans, catches automated bots) ── */}
                <div style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
                  <input
                    type="text"
                    name="company_fax"
                    tabIndex={-1}
                    autoComplete="off"
                    value={orderForm.company_fax || ''}
                    onChange={e => setOrderForm(prev => ({ ...prev, company_fax: e.target.value }))}
                  />
                </div>

                {/* ── Section 1: Contact ── */}
                <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>1.</span> Institutional Contact
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.name}
                      onChange={e => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. Full Name / Procurement Lead"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Practice / Clinic Name
                      </label>
                      <input
                        type="text"
                        value={orderForm.clinicName}
                        onChange={e => setOrderForm(prev => ({ ...prev, clinicName: e.target.value }))}
                        placeholder="Clinic / Lab Name"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.email}
                        onChange={e => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="doctor@clinic.com"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Phone / WhatsApp (International) *
                    </label>
                    <InternationalPhoneInput
                      value={orderForm.phone}
                      onChange={(val) => setOrderForm(prev => ({ ...prev, phone: val }))}
                      countryHint={orderForm.phoneCountryCode || 'ES'}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                {/* ── Section 2: Delivery Destination ── */}
                <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>2.</span> Shipping & Delivery Destination
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Destination Country *
                    </label>
                    <select
                      value={orderForm.country}
                      onChange={e => {
                        const selectedName = e.target.value;
                        const match = COUNTRIES.find(c => c.name === selectedName);
                        setOrderForm(prev => ({
                          ...prev,
                          country: selectedName,
                          phoneCountryCode: match?.code || prev.phoneCountryCode
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        backgroundColor: '#ffffff',
                        color: '#0f172a'
                      }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.dial_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Street Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.addressLine1}
                      onChange={e => setOrderForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                      placeholder="Street address, building number, medical tower..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Suite / Floor / Department (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderForm.addressLine2}
                      onChange={e => setOrderForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                      placeholder="Suite 400, Floor 3, Clinic Reception..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.city}
                        onChange={e => setOrderForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        State / Province / Region
                      </label>
                      <input
                        type="text"
                        value={orderForm.state}
                        onChange={e => setOrderForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State or Region"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Postal Code / ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.postalCode}
                      onChange={e => setOrderForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="Postal / ZIP code"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                {/* ── Section 3: Notes & Submission ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Order Notes / Compounding Specifications
                    </label>
                    <textarea
                      rows={2}
                      value={orderForm.notes}
                      onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any specific batch, concentration, or delivery notes..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder || Object.keys(cartItems).length === 0}
                    style={{
                      marginTop: '0.5rem',
                      padding: '12px',
                      background: Object.keys(cartItems).length === 0 ? '#94a3b8' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.90rem',
                      cursor: Object.keys(cartItems).length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {submittingOrder ? 'Submitting Proforma Request...' : 'Submit Proforma Request'}
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleOrderViaWhatsApp}
                    disabled={Object.keys(cartItems).length === 0}
                    style={{
                      padding: '11px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: Object.keys(cartItems).length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>Send Order via WhatsApp</span>
                  </button>

                  <p style={{ fontSize: '0.70rem', color: '#94a3b8', textAlign: 'center', margin: '4px 0 0 0' }}>
                    Upon submission, our medical logistics team will issue an official B2B proforma invoice with customs documentation and analytical COA verification.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Cart Dock (Mejora #3: Mobile & Desktop Quick Checkout) ── */}
      {totalCartCount > 0 && !isOrderDrawerOpen && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '560px',
          backgroundColor: '#003666',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 80,
          boxShadow: '0 8px 30px rgba(0, 54, 102, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              backgroundColor: '#38bdf8',
              color: '#003666',
              fontWeight: 800,
              fontSize: '0.78rem',
              borderRadius: '9999px',
              padding: '2px 9px'
            }}>
              {totalCartCount} Vials
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#ffffff' }}>
                {formatPrice(totalCartValueUsd)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#93c5fd' }}>
                +€60 Express Logistics added at checkout
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOrderDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#38bdf8',
              color: '#003666',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            <span>Review Proforma</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Atlas AI Floating Clinical Copilot Sticker (Modern Public SaaS / Google Assistant style) ── */}
      <div
        onClick={() => setIsAtlasAiOpen(true)}
        style={{
          position: 'fixed',
          bottom: totalCartCount > 0 ? '78px' : '22px',
          right: '24px',
          zIndex: 950,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px 8px 10px',
          background: '#1f2937',
          borderRadius: '28px',
          border: '1px solid #38bdf8',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 0 10px rgba(56, 189, 248, 0.25)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.3), 0 0 16px rgba(56, 189, 248, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25), 0 0 10px rgba(56, 189, 248, 0.25)';
        }}
        title="Open Atlas AI Clinical Copilot (Interactive Pharmacopeia, Reconstitution & Synergies)"
      >
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)'
        }}>
          <Sparkles size={16} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              Atlas AI Copilot
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '1px 5px',
              borderRadius: '4px'
            }}>
              {selectedCategory !== 'all' ? (CATEGORY_MAP[selectedCategory]?.label || 'Filtered') : 'Peptide Pharmacopeia'}
            </span>
          </div>
          <span style={{ fontSize: '0.67rem', color: '#94a3b8' }}>
            {selectedCategory !== 'all'
              ? `Reconstitution math & synergies (${filteredProducts.length} items)`
              : 'Reconstitution math, syringe calibration & synergies'}
          </span>
        </div>
      </div>

      {/* ── Official Printable Proforma Document (@media print) ── */}
      <div className="peptides-printable-proforma" style={{ display: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            .peptides-printable-proforma, .peptides-printable-proforma * {
              visibility: visible !important;
            }
            .peptides-printable-proforma {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 2cm !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              font-size: 11pt !important;
            }
            @page {
              size: A4;
              margin: 1.5cm;
            }
          }
        ` }} />

        {/* Proforma Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 800, color: '#0284c7' }}>ATLAS HEALTH SERVICES</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '9pt', color: '#64748b' }}>
              MEDILUXE B2B CLINICAL DIVISION • OFFICIAL PROFORMA QUOTE
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '8.5pt', color: '#64748b' }}>
              Certified Lyophilized Peptides • ≥99.0% HPLC Analytical Purity
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a' }}>
              PROFORMA ESTIMATE
            </div>
            <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '2px' }}>
              Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '8.5pt', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
              Attributed Wholesaler: Nikolaos Psathas (NP Labs)
            </div>
            <div style={{ fontSize: '8pt', fontFamily: 'monospace', color: '#64748b' }}>
              Ref Code: {referralCode || 'CAT-RX-7482'}
            </div>
          </div>
        </div>

        {/* Client & Shipping Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <div>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>INSTITUTIONAL CLIENT</div>
            <div style={{ fontSize: '10pt', fontWeight: 700, marginTop: '2px' }}>{orderForm.name || 'Clinical Practitioner'}</div>
            {orderForm.clinicName && <div style={{ fontSize: '9pt', color: '#334155' }}>{orderForm.clinicName}</div>}
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{orderForm.email || 'Email not specified'}</div>
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{orderForm.phone || 'Phone not specified'}</div>
          </div>
          <div>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>DELIVERY DESTINATION</div>
            <div style={{ fontSize: '9pt', color: '#0f172a', fontWeight: 600 }}>{orderForm.country || 'International'}</div>
            <div style={{ fontSize: '8.5pt', color: '#334155' }}>{orderForm.addressLine1 || 'Pending delivery address'}</div>
            {orderForm.addressLine2 && <div style={{ fontSize: '8.5pt', color: '#334155' }}>{orderForm.addressLine2}</div>}
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
              {[orderForm.city, orderForm.state, orderForm.postalCode].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>

        {/* Selected Items Table */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '9pt' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
              <th style={{ padding: '8px 10px', width: '45%' }}>Formulation & Dosage</th>
              <th style={{ padding: '8px 10px', width: '20%' }}>Packaging & Quantity</th>
              <th style={{ padding: '8px 10px', width: '15%', textAlign: 'right' }}>Unit / Pack Price</th>
              <th style={{ padding: '8px 10px', width: '15%', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(cartItems).map((item, idx) => {
              const p = item.product;
              const lineTotal = (item.quantity1x * p.unitPrice) + (item.quantity10x * (p.pack10Price || p.unitPrice * 8.5));
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.productName}</div>
                    <div style={{ fontSize: '8pt', color: '#64748b' }}>{p.dosage} • Lyophilized Vial (10R) • ≥99.0% HPLC</div>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {item.quantity1x > 0 && <div>{item.quantity1x}x Single Vial</div>}
                    {item.quantity10x > 0 && <div style={{ color: '#047857', fontWeight: 600 }}>{item.quantity10x}x Pack ×10 (-15% Vol.)</div>}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {item.quantity1x > 0 && <div>{formatPrice(p.unitPrice)}</div>}
                    {item.quantity10x > 0 && <div style={{ color: '#047857' }}>{formatPrice(p.pack10Price || p.unitPrice * 8.5)}</div>}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatPrice(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid #cbd5e1' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 650, fontSize: '9pt', color: '#475569' }}>
                SUBTOTAL FORMULATIONS:
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '9.5pt', color: '#0f172a', fontFamily: 'monospace' }}>
                {formatPrice(totalCartValueUsd)}
              </td>
            </tr>
            <tr style={{ borderTop: '1px solid #f1f5f9' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 650, fontSize: '9pt', color: '#0369a1' }}>
                EXPRESS MEDICAL LOGISTICS & HANDLING (€60.00 BASE):
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '9.5pt', color: '#0284c7', fontFamily: 'monospace' }}>
                +{currencySymbol}{shippingCostCurrentCurrency.toFixed(2)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid #0f172a' }}>
              <td colSpan={4} style={{ padding: '10px', textAlign: 'right', fontWeight: 800, fontSize: '10pt', color: '#0f172a' }}>
                ESTIMATED PROFORMA TOTAL:
              </td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, fontSize: '11pt', color: '#0284c7', fontFamily: 'monospace' }}>
                {formatPrice(grandTotalCartValueUsd)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Logistics & Quality Regulatory Terms */}
        <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '8pt', color: '#64748b', lineHeight: 1.5 }}>
          <strong>Logistics & Regulatory Terms:</strong> All peptide vials are manufactured under cGMP standards with certified analytical purity (≥99.0% HPLC). Lyophilized sterile formulations are vacuum-sealed for maximum room-temperature stability and dispatched via express medical courier. Official proforma invoice and analytical COA documentation will be issued upon formal order confirmation.
        </div>
      </div>

      {/* ── Clinical Protocol Dossier Drawer ── */}
      <ClinicalProtocolDrawer
        isOpen={!!selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
        protocol={selectedProtocol}
        onAddProtocol={handleAddProtocolPreset}
        formatPrice={formatPrice}
        currency={currency}
        currencySymbol={currencySymbol}
        isDistributor={isDistributor}
      />

      {/* ── Atlas AI Clinical Copilot Drawer ── */}
      <AtlasAiCopilotDrawer
        isOpen={isAtlasAiOpen}
        onClose={() => setIsAtlasAiOpen(false)}
        currencySymbol={currencySymbol}
        activeCategory={selectedCategory}
        activeCategoryLabel={selectedCategory !== 'all' ? CATEGORY_MAP[selectedCategory]?.label : null}
      />

      {/* Unified Public Footer (Pointer events disabled in B2B Price Portal to prevent distraction) */}
      <div style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.85 }}>
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}


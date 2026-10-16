"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Globe,
  Stethoscope,
  User,
  FlaskConical,
  Sliders,
  ExternalLink,
  RefreshCw,
  Tag,
  ArrowRight,
  Shield,
  X,
  Layers,
  Sparkles,
  Building,
  Check,
  Pin
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { searchAlgoliaProducts } from '@/services/algoliaSearch';
import { triggerHaptic } from '../../utils/haptics';
import {
  getActiveContext,
  setActiveDoctor,
  setActivePatient,
  setActiveSupplier,
  clearActiveDoctor,
  clearActivePatient,
  clearActiveSupplier,
  subscribeToActiveContext
} from '@/services/activeContextService';

export default function GCPCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [algoliaHits, setAlgoliaHits] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeContext, setActiveContext] = useState(getActiveContext());
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Subscribe to reactive active context
  useEffect(() => {
    setActiveContext(getActiveContext());
    const unsubscribe = subscribeToActiveContext((newCtx) => {
      setActiveContext(newCtx);
    });
    return unsubscribe;
  }, []);

  // Global Keydown Listener for ⌘K / Ctrl+K and ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        triggerHaptic('selection');
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = (e) => {
      setIsOpen(true);
      if (e?.detail?.query) {
        setQuery(e.detail.query);
      }
      if (e?.detail?.filter) {
        setSelectedCategory(e.detail.filter);
      } else {
        setSelectedCategory('All');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-gcp-command-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-gcp-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setAlgoliaHits([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Dynamic Algolia live product search (<15ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setAlgoliaHits([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(() => {
      searchAlgoliaProducts(trimmed, { hitsPerPage: 10 })
        .then((hits) => {
          if (isMounted) {
            const formatted = (hits || []).map((hit) => ({
              id: `algolia-${hit.objectID || hit.slug}`,
              title: hit.name || hit.title || 'Product Datasheet',
              subtitle: `${hit.brand || hit.supplierName || 'Atlas Pharmacopeia'}${hit.format ? ` · ${hit.format}` : ''}${hit.dosage ? ` · ${hit.dosage}` : ''}`,
              category: 'Products',
              url: `/p/${hit.slug || hit.objectID}`,
              icon: FlaskConical,
              badge: hit.brand || 'Catalog'
            }));
            setAlgoliaHits(formatted);
            setIsSearching(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('[GCPCommandPalette] Algolia search error:', err);
            setAlgoliaHits([]);
            setIsSearching(false);
          }
        });
    }, 80);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Master Indexed Resources (0ms RAM lookup)
  const staticResources = useMemo(() => [
    // 1. Physicians (Médicos Activos)
    {
      id: 'doc-khalid',
      title: 'Dr. Khalid Shukri (Dubai, UAE 🇦🇪)',
      subtitle: 'Lotusland Bio-Regenerative Center · Anti-Aging & Compounding Peptides',
      category: 'Physicians',
      url: '/dr/khalid-shukri',
      icon: Stethoscope,
      badge: 'Longevity MD',
      doctorData: { id: 'khalid-shukri', name: 'Dr. Khalid Shukri', slug: 'khalid-shukri', specialty: 'Anti-Aging & Peptides', clinic: 'Lotusland Dubai' }
    },
    {
      id: 'doc-raffanie',
      title: 'Dr. Raffanie Lucenio (Doha, Qatar 🇶🇦)',
      subtitle: 'The Masters Medical Center · Dermatology & Medical Trichology',
      category: 'Physicians',
      url: '/dr/raffanie-lucenio',
      icon: Stethoscope,
      badge: 'Dermatology',
      doctorData: { id: 'raffanie-lucenio', name: 'Dr. Raffanie Lucenio', slug: 'raffanie-lucenio', specialty: 'Dermatology', clinic: 'The Masters Doha' }
    },
    {
      id: 'doc-sezgin',
      title: 'Dr. Çağatay Sezgin (Dubai, UAE 🇦🇪)',
      subtitle: 'Hortman Clinics / Novomed · Hair Restoration & Longevity Surgery',
      category: 'Physicians',
      url: '/dr/dr-cagatay-sezgin',
      icon: Stethoscope,
      badge: 'Surgeon',
      doctorData: { id: 'dr-cagatay-sezgin', name: 'Dr. Çağatay Sezgin', slug: 'dr-cagatay-sezgin', specialty: 'Hair Restoration', clinic: 'Hortman Clinics' }
    },
    {
      id: 'doc-alkhatib',
      title: 'Dr. M Jay Alkhatib (Dubai, UAE 🇦🇪)',
      subtitle: 'York Diagnostic Laboratories (YDL) · Clinical Diagnostics & Genetics',
      category: 'Physicians',
      url: '/dr/dr-jay-alkhatib',
      icon: Stethoscope,
      badge: 'Lab Director',
      doctorData: { id: 'dr-jay-alkhatib', name: 'Dr. M Jay Alkhatib', slug: 'dr-jay-alkhatib', specialty: 'Clinical Diagnostics', clinic: 'YDL Dubai' }
    },
    {
      id: 'doc-sobia',
      title: 'Dr. Sobia Mirza (Dubai, UAE 🇦🇪)',
      subtitle: 'My London Skin Clinic (MLSC) · Aesthetic & Longevity Medicine',
      category: 'Physicians',
      url: '/dr/dr-sobia-mirza',
      icon: Stethoscope,
      badge: 'Aesthetics',
      doctorData: { id: 'dr-sobia-mirza', name: 'Dr. Sobia Mirza', slug: 'dr-sobia-mirza', specialty: 'Aesthetic Medicine', clinic: 'MLSC Dubai' }
    },
    {
      id: 'doc-camacho',
      title: 'Dra. Haydee Camacho (Madrid, Spain 🇪🇸)',
      subtitle: 'Clínica Dra. Haydee Camacho · Regenerative & Anti-Aging Medicine',
      category: 'Physicians',
      url: '/dr/haydee-camacho',
      icon: Stethoscope,
      badge: 'Regenerative',
      doctorData: { id: 'haydee-camacho', name: 'Dra. Haydee Camacho', slug: 'haydee-camacho', specialty: 'Regenerative Medicine', clinic: 'Clínica Camacho Madrid' }
    },
    {
      id: 'doc-mendez',
      title: 'Dr. Carlos Méndez (Barcelona, Spain 🇪🇸)',
      subtitle: 'Clínica Regenerativa Capilar · Medical Trichology & Epigenetics',
      category: 'Physicians',
      url: '/dr/carlos-mendez',
      icon: Stethoscope,
      badge: 'Trichology',
      doctorData: { id: 'carlos-mendez', name: 'Dr. Carlos Méndez', slug: 'carlos-mendez', specialty: 'Medical Trichology', clinic: 'Barcelona Clinic' }
    },
    {
      id: 'doc-silva',
      title: 'Dr. Frank Silva (London, UK 🇬🇧)',
      subtitle: 'Silva Longevity Institute · Cellular Optimization & Bioregulators',
      category: 'Physicians',
      url: '/dr/frank-silva',
      icon: Stethoscope,
      badge: 'Longevity',
      doctorData: { id: 'frank-silva', name: 'Dr. Frank Silva', slug: 'frank-silva', specialty: 'Cellular Optimization', clinic: 'Silva Longevity London' }
    },

    // 2. Suppliers (Proveedores / Fabricantes Farmacéuticos)
    {
      id: 'sup-colway',
      title: 'Colway Poland (Biological Tropocollagen & Supplements)',
      subtitle: 'Native fish collagen, Colvita, Atelocollagen, DNA Cellular Serum · EU GMP',
      category: 'Suppliers',
      url: '/collection/colway',
      icon: Building,
      badge: 'Colway EU',
      supplierData: { id: 'colway', name: 'Colway Poland', slug: 'colway', brand: 'Colway' }
    },
    {
      id: 'sup-fagron',
      title: 'Fagron Iberia (Active Pharmaceutical Ingredients & TrichoTech)',
      subtitle: 'Compounding vehicles (TrichoSol, TrichoOil), Minoxidil, Finasteride API · GMP Certified',
      category: 'Suppliers',
      url: '/collection/fagron',
      icon: FlaskConical,
      badge: 'Fagron GMP',
      supplierData: { id: 'fagron', name: 'Fagron Iberia', slug: 'fagron', brand: 'Fagron' }
    },
    {
      id: 'sup-jymed',
      title: 'JYMed Peptide Laboratories (Clinical Synthesis & Research APIs)',
      subtitle: 'HPLC 99%+ peptide APIs (Semaglutide, Tirzepatide, Retatrutide, BPC-157, Epithalon)',
      category: 'Suppliers',
      url: '/catalog?supplier=jymed',
      icon: FlaskConical,
      badge: 'HPLC 99%+',
      supplierData: { id: 'jymed-peptide', name: 'JYMed Peptide Labs', slug: 'jymed-peptide', brand: 'JYMed' }
    },
    {
      id: 'sup-ydl',
      title: 'York Diagnostic Laboratories (Dubai UAE)',
      subtitle: 'Clinical genomics facility, DNA TrichoTest, Fagron TeloTest processing hub',
      category: 'Suppliers',
      url: '/suppliers/ydl',
      icon: Shield,
      badge: 'ISO 15189',
      supplierData: { id: 'ydl', name: 'York Diagnostic Labs', slug: 'ydl', brand: 'YDL' }
    },

    // 3. Patients (Pacientes con Prescripciones Activas)
    {
      id: 'pt-turky',
      title: 'Turky Bakhit S A Al-shahwani (Qatar 🇶🇦)',
      subtitle: 'RX-BOX02574AATRI · Dr. Raffanie Lucenio (TrichoTest TrichoSol)',
      category: 'Patients',
      url: '/rx/RX-BOX02574AATRI',
      icon: User,
      badge: 'TrichoTest',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'dr-raffanie-lucenio',
      patientData: { id: 'turky', name: 'Turky Bakhit Al-shahwani', code: 'RX-BOX02574AATRI', condition: 'Androgenetic Alopecia', doctorName: 'Dr. Raffanie Lucenio', doctorSlug: 'dr-raffanie-lucenio' }
    },
    {
      id: 'pt-aisha',
      title: 'Aisha Mohammed Alsulaiti (Qatar 🇶🇦)',
      subtitle: 'RX-BOX02550AATRI · Dr. Raffanie Lucenio (TrichoTest Scalp Solution)',
      category: 'Patients',
      url: '/rx/RX-BOX02550AATRI',
      icon: User,
      badge: 'TrichoTest',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'dr-raffanie-lucenio',
      patientData: { id: 'aisha', name: 'Aisha Mohammed Alsulaiti', code: 'RX-BOX02550AATRI', condition: 'Female Pattern Thinning', doctorName: 'Dr. Raffanie Lucenio', doctorSlug: 'dr-raffanie-lucenio' }
    },
    {
      id: 'pt-maryam',
      title: 'Maryam Mohammed Al-Sulaiti (Qatar 🇶🇦)',
      subtitle: 'RX-BOX02571AATRI · Dr. Raffanie Lucenio (TrichoTest Protocol)',
      category: 'Patients',
      url: '/rx/RX-BOX02571AATRI',
      icon: User,
      badge: 'TrichoTest',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'dr-raffanie-lucenio',
      patientData: { id: 'maryam', name: 'Maryam Mohammed Al-Sulaiti', code: 'RX-BOX02571AATRI', condition: 'Telogen Effluvium', doctorName: 'Dr. Raffanie Lucenio', doctorSlug: 'dr-raffanie-lucenio' }
    },
    {
      id: 'pt-rashid',
      title: 'Rashid Shahin Malalla (Dubai 🇦🇪)',
      subtitle: 'RX-BOX03484AATRI · Dr. Çağatay Sezgin (TrichoTest Post-Op Solution)',
      category: 'Patients',
      url: '/rx/RX-BOX03484AATRI',
      icon: User,
      badge: 'TrichoTest',
      doctorName: 'Dr. Çağatay Sezgin',
      doctorSlug: 'dr-cagatay-sezgin',
      patientData: { id: 'rashid', name: 'Rashid Shahin Malalla', code: 'RX-BOX03484AATRI', condition: 'Post-Transplant Recovery', doctorName: 'Dr. Çağatay Sezgin', doctorSlug: 'dr-cagatay-sezgin' }
    },
    {
      id: 'pt-fakhro',
      title: 'Abdulrahman Darwish Fakhro (Qatar 🇶🇦)',
      subtitle: 'RX-BOX03054AATRI · Dr. Raffanie Lucenio (TrichoTest TrichoSol)',
      category: 'Patients',
      url: '/rx/RX-BOX03054AATRI',
      icon: User,
      badge: 'TrichoTest',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'dr-raffanie-lucenio',
      patientData: { id: 'fakhro', name: 'Abdulrahman Darwish Fakhro', code: 'RX-BOX03054AATRI', condition: 'Alopecia Grade III', doctorName: 'Dr. Raffanie Lucenio', doctorSlug: 'dr-raffanie-lucenio' }
    },
    {
      id: 'pt-alkhulaifi',
      title: 'Mohammed Yousuf Al-khulaifi (Qatar 🇶🇦)',
      subtitle: 'RX-BOX03044AATRI · Dr. Raffanie Lucenio (TrichoTest Scalp Regimen)',
      category: 'Patients',
      url: '/rx/RX-BOX03044AATRI',
      icon: User,
      badge: 'TrichoTest',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'dr-raffanie-lucenio',
      patientData: { id: 'alkhulaifi', name: 'Mohammed Yousuf Al-khulaifi', code: 'RX-BOX03044AATRI', condition: 'Follicular Miniaturization', doctorName: 'Dr. Raffanie Lucenio', doctorSlug: 'dr-raffanie-lucenio' }
    },
    {
      id: 'pt-saadat',
      title: 'Saadat Valiyeva (Dubai 🇦🇪)',
      subtitle: 'RX-FAG-YDL-001 · Dr. M Jay Alkhatib (YDL TrichoTest)',
      category: 'Patients',
      url: '/rx/RX-FAG-YDL-001',
      icon: User,
      badge: 'TrichoTest',
      doctorName: 'Dr. M Jay Alkhatib',
      doctorSlug: 'dr-m-jay-alkhatib',
      patientData: { id: 'saadat', name: 'Saadat Valiyeva', code: 'RX-FAG-YDL-001', condition: 'Diffuse Thinning', doctorName: 'Dr. M Jay Alkhatib', doctorSlug: 'dr-m-jay-alkhatib' }
    },
    {
      id: 'pt-melissa',
      title: 'Melissa Nel (Dubai 🇦🇪)',
      subtitle: 'RX-BOX03531AATEL · Dr. Sobia Mirza (Fagron TeloTest)',
      category: 'Patients',
      url: '/rx/RX-BOX03531AATEL',
      icon: User,
      badge: 'TeloTest',
      doctorName: 'Dr. Sobia Mirza',
      doctorSlug: 'dr-sobia-mirza',
      patientData: { id: 'melissa', name: 'Melissa Nel', code: 'RX-BOX03531AATEL', condition: 'Biological Age Telomere', doctorName: 'Dr. Sobia Mirza', doctorSlug: 'dr-sobia-mirza' }
    },

    // 4. Products & Catalog Highlights
    {
      id: 'prod-colvita',
      title: 'Colway Colvita (Pure Freeze-Dried Tropocollagen + Algae + Vit E)',
      subtitle: 'Native fish collagen capsule supplement · 60 & 120 count · Systemic ECM Repair',
      category: 'Products',
      url: '/p/colway-colvita',
      icon: FlaskConical,
      badge: 'Colway Polish Collagen'
    },
    {
      id: 'prod-retatrutide',
      title: 'Retatrutide 10mg (Triple Agonist GLP-1/GIP/GCG)',
      subtitle: 'RP-LOT-RT10-2609 · HPLC 99.6% · Lyophilized SubQ Vial',
      category: 'Products',
      url: '/p/retatrutide',
      icon: FlaskConical,
      badge: '99.6% HPLC'
    },
    {
      id: 'prod-tirzepatide',
      title: 'Tirzepatide 15mg (Dual Incretin GLP-1/GIP)',
      subtitle: 'RP-LOT-TZ15-2611 · HPLC 99.4% · Lyophilized SubQ Vial',
      category: 'Products',
      url: '/p/tirzepatide',
      icon: FlaskConical,
      badge: '99.4% HPLC'
    },
    {
      id: 'prod-semaglutide',
      title: 'Semaglutide 5mg (Selective GLP-1 RA)',
      subtitle: 'RP-LOT-SM05-2608 · HPLC 99.5% · Lyophilized SubQ Vial',
      category: 'Products',
      url: '/p/semaglutide',
      icon: FlaskConical,
      badge: '99.5% HPLC'
    },
    {
      id: 'prod-bpctb',
      title: 'BPC-157 & TB-500 Synergistic Healing Blend',
      subtitle: 'RP-LOT-BPCTB-2610 · HPLC 99.7% · Tissue Regeneration Blend',
      category: 'Products',
      url: '/p/bpc-157-tb-500',
      icon: FlaskConical,
      badge: '99.7% HPLC'
    },
    {
      id: 'prod-ghk',
      title: 'GHK-Cu Pure Copper Tripeptide-1 (50mg)',
      subtitle: 'RP-LOT-GHK50-2605 · HPLC 99.3% · Follicular & ECM Remodeling',
      category: 'Products',
      url: '/p/ghk-cu',
      icon: FlaskConical,
      badge: '99.3% HPLC'
    },

    // 5. Portals & Operations
    {
      id: 'am-console',
      title: 'Account Manager Console (Operations Hub)',
      subtitle: 'Commercial and clinical operations command center',
      category: 'Operations',
      url: '/account-manager',
      icon: Sliders,
      badge: 'Hub'
    },
    {
      id: 'pub-catalog',
      title: 'Peptide Formulary & Active Compounds',
      subtitle: 'General catalog of research actives and peptides',
      category: 'Operations',
      url: '/catalog',
      icon: FlaskConical,
      badge: 'Catalog'
    },
    {
      id: 'pub-protocols',
      title: 'Clinical Protocols & Titrations Library',
      subtitle: 'Combined protocols, titration curves, and phase schedules',
      category: 'Operations',
      url: '/protocols',
      icon: Layers,
      badge: 'Protocols'
    }
  ], []);

  // Filter by query and category with Strict Medical Confidentiality
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    let pool = staticResources;

    // Strict Patient Confidentiality:
    // If a physician is selected / active in context, ONLY show patients belonging to that physician.
    // Patients belonging to other doctors are strictly excluded.
    if (activeContext?.doctor) {
      const activeDocName = (activeContext.doctor.name || '').toLowerCase().trim();
      const activeDocSlug = (activeContext.doctor.slug || '').toLowerCase().trim();
      const cleanDocName = activeDocName.replace(/^dr\.\s*/i, '').trim();

      pool = pool.filter(r => {
        if (r.category !== 'Patients') return true;

        const pDocName = (r.patientData?.doctorName || r.doctorName || '').toLowerCase().trim();
        const pDocSlug = (r.patientData?.doctorSlug || r.doctorSlug || '').toLowerCase().trim();
        const pSub = (r.subtitle || '').toLowerCase();

        return (
          (activeDocName && pDocName.includes(activeDocName)) ||
          (activeDocSlug && pDocSlug.includes(activeDocSlug)) ||
          (cleanDocName && pDocName.includes(cleanDocName)) ||
          (cleanDocName && pSub.includes(cleanDocName))
        );
      });
    }

    if (selectedCategory !== 'All') {
      pool = pool.filter(r => r.category === selectedCategory);
    }

    if (!q) {
      return pool.slice(0, 14);
    }

    const staticMatches = pool.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.badge && r.badge.toLowerCase().includes(q))
    );

    const seenUrls = new Set();
    const merged = [];

    // Add Algolia hits if searching products or All
    if (selectedCategory === 'All' || selectedCategory === 'Products') {
      algoliaHits.forEach(item => {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          merged.push(item);
        }
      });
    }

    staticMatches.forEach(item => {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        merged.push(item);
      }
    });

    return merged.slice(0, 18);
  }, [staticResources, algoliaHits, query, selectedCategory, activeContext]);

  // Handle Keyboard Selection
  const handleKeyDownList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filtered[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  // Directly set entity as active in the Operations Dock
  const handlePinAsActive = (e, item) => {
    e.stopPropagation();
    triggerHaptic('impact');

    if (item.category === 'Physicians' && item.doctorData) {
      setActiveDoctor(item.doctorData);
      toast.success(`${item.doctorData.name} fijado como Médico Activo en el Dock`, { icon: '🩺' });
    } else if (item.category === 'Patients' && item.patientData) {
      setActivePatient(item.patientData);
      toast.success(`${item.patientData.name} fijado como Paciente Activo en el Dock`, { icon: '👤' });
    } else if (item.category === 'Suppliers' && item.supplierData) {
      setActiveSupplier(item.supplierData);
      toast.success(`${item.supplierData.name} fijado como Proveedor Activo en el Dock`, { icon: '🏭' });
    } else if (item.category === 'Physicians') {
      setActiveDoctor({ name: item.title.split(' (')[0], slug: item.url.replace('/dr/', ''), clinic: item.subtitle });
      toast.success(`${item.title.split(' (')[0]} fijado como Médico Activo`, { icon: '🩺' });
    }

    setIsOpen(false);
  };

  const handleSelect = (item) => {
    triggerHaptic('impact');

    // Auto-set context when selecting an item
    if (item.category === 'Physicians' && item.doctorData) {
      setActiveDoctor(item.doctorData);
    } else if (item.category === 'Patients' && item.patientData) {
      setActivePatient(item.patientData);
    } else if (item.category === 'Suppliers' && item.supplierData) {
      setActiveSupplier(item.supplierData);
    }

    setIsOpen(false);
    if (item.url) {
      router.push(item.url);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'All', label: 'All', icon: Sparkles },
    { id: 'Physicians', label: 'Physicians', icon: Stethoscope },
    { id: 'Patients', label: 'Patients', icon: User },
    { id: 'Suppliers', label: 'Suppliers', icon: Building },
    { id: 'Products', label: 'Products', icon: FlaskConical }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(32, 33, 36, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #dadce0',
          boxShadow: '0 8px 28px rgba(60, 64, 67, 0.28), 0 4px 8px rgba(60, 64, 67, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#202124'
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Bar (Google Cloud Standard Styling) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.25rem', borderBottom: '1px solid #dadce0', background: '#ffffff' }}>
          <Search size={20} color="#1a73e8" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search & activate doctor, patient, supplier, or product..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#202124',
              fontWeight: 400
            }}
          />
          {isSearching && (
            <span style={{ fontSize: '0.72rem', color: '#1a73e8', fontWeight: 500 }}>
              Searching...
            </span>
          )}
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setAlgoliaHits([]); }}
              style={{ background: 'transparent', border: 'none', color: '#5f6368', cursor: 'pointer', padding: '2px' }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <kbd style={{ fontSize: '0.70rem', background: '#f1f3f4', padding: '3px 7px', borderRadius: '4px', color: '#5f6368', border: '1px solid #dadce0', fontWeight: 600 }}>
            ESC
          </kbd>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close search"
            title="Close (ESC)"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#5f6368',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              marginLeft: '2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f3f4';
              e.currentTarget.style.color = '#202124';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#5f6368';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Chips Bar (GCP Console Standard Chips) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: '#f8f9fa',
          borderBottom: '1px solid #dadce0',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 600, marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filter:
          </span>
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedCategory(cat.id);
                  setSelectedIndex(0);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: isCatActive ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: isCatActive ? '#e8f0fe' : '#ffffff',
                  color: isCatActive ? '#1a73e8' : '#3c4043',
                  fontSize: '0.72rem',
                  fontWeight: isCatActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <CatIcon size={12} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Current Active Operations Context Banner (When query is empty) */}
        {!query && (activeContext?.doctor || activeContext?.patient || activeContext?.supplier) && (
          <div style={{
            padding: '10px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active in Dock:
              </span>
              {activeContext.doctor && (
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  color: '#15803d',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  🩺 {activeContext.doctor.name}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearActiveDoctor(); }}
                    style={{ background: 'transparent', border: 'none', color: '#15803d', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                    title="Clear active doctor"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeContext.patient && (
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  color: '#7e22ce',
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  👤 {activeContext.patient.name}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearActivePatient(); }}
                    style={{ background: 'transparent', border: 'none', color: '#7e22ce', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                    title="Clear active patient"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeContext.supplier && (
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  color: '#1d4ed8',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  🏭 {activeContext.supplier.name}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearActiveSupplier(); }}
                    style={{ background: 'transparent', border: 'none', color: '#1d4ed8', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                    title="Clear active supplier"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '8px',
            background: '#ffffff'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#5f6368', fontSize: '0.88rem' }}>
              No clinical resources or catalog items match &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComp = item.icon || Globe;
              const isActivatable = ['Physicians', 'Patients', 'Suppliers'].includes(item.category);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? '#e8f0fe' : 'transparent',
                    border: isSelected ? '1px solid #aecbfa' : '1px solid transparent',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      background: isSelected ? '#1a73e8' : '#f1f3f4',
                      color: isSelected ? '#ffffff' : '#5f6368',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComp size={16} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? '#1a73e8' : '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Action Button: Set as Active in Dock */}
                    {isActivatable && (
                      <button
                        type="button"
                        onClick={(e) => handlePinAsActive(e, item)}
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '4px',
                          background: isSelected ? '#1a73e8' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#1a73e8',
                          border: '1px solid #1a73e8',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Pin as active ${item.category.slice(0, -1)} in the Operations Dock`}
                      >
                        <Pin size={10} />
                        <span>Activar</span>
                      </button>
                    )}

                    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f3f4', color: '#3c4043', border: '1px solid #dadce0', fontWeight: 500 }}>
                      {item.badge || item.category}
                    </span>

                    {isSelected && (
                      <ArrowRight size={13} color="#1a73e8" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints (Google Cloud Styling & English Language) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 14px',
          background: '#f8f9fa',
          borderTop: '1px solid #dadce0',
          fontSize: '0.72rem',
          color: '#5f6368'
        }}>
          <div>
            Navigate with <kbd style={{ background: '#ffffff', padding: '1px 5px', borderRadius: '3px', border: '1px solid #dadce0', color: '#3c4043' }}>↑</kbd> <kbd style={{ background: '#ffffff', padding: '1px 5px', borderRadius: '3px', border: '1px solid #dadce0', color: '#3c4043' }}>↓</kbd> · Press <kbd style={{ background: '#ffffff', padding: '1px 5px', borderRadius: '3px', border: '1px solid #dadce0', color: '#3c4043' }}>↵</kbd> to open & activate · <kbd style={{ background: '#ffffff', padding: '1px 5px', borderRadius: '3px', border: '1px solid #dadce0', color: '#3c4043' }}>ESC</kbd> to dismiss
          </div>
          <div style={{ color: '#137333', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span>●</span>
            <span>Operations Hub Active</span>
          </div>
        </div>

      </div>
    </div>
  );
}

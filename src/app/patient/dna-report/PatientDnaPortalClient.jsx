'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Download,
  Share2,
  Check,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  MessageSquare,
  Utensils,
  Pill,
  Sparkles,
  ExternalLink,
  Printer,
  Calendar,
  ListChecks,
  ShoppingBag,
  HeartPulse,
  Activity,
  ArrowRight,
  Search,
  Globe,
  HelpCircle,
  User,
  LogIn,
  LogOut,
  Lock,
  Copy,
  X,
  FileText,
  SlidersHorizontal,
  Info,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import CopyableId from '@/components/ui/CopyableId';
import {
  evaluateNutrigenomicProfile,
  THREE_CAPSULE_PROTOCOL,
  TREATMENT_CYCLE,
  GALENIC_COMPATIBILITY_ANALYSIS,
  CLINICAL_PILLARS,
  PRESCRIPTION_COMPARISON
} from '@/data/genomics/clinicalNutrigenomicEngine';

// Modular Subcomponents
import DnaReportRoadmap from '@/components/patient/dna/DnaReportRoadmap';
import DnaPrioritiesSection from '@/components/patient/dna/DnaPrioritiesSection';
import DnaAncestryHeritageSection from '@/components/patient/dna/DnaAncestryHeritageSection';
import DnaFoodMatrixSection from '@/components/patient/dna/DnaFoodMatrixSection';
import DnaWeeklyMealPlan from '@/components/patient/dna/DnaWeeklyMealPlan';
import DnaGroceryChecklist from '@/components/patient/dna/DnaGroceryChecklist';
import DnaCompoundingPrescription from '@/components/patient/dna/DnaCompoundingPrescription';
import DnaLocalPharmacyOptionA from '@/components/patient/dna/DnaLocalPharmacyOptionA';
import DnaDownloadsSection from '@/components/patient/dna/DnaDownloadsSection';

const CHAPTERS = [
  { id: 'priorities', label: '1. DNA Priorities', icon: '🧬', subtitle: 'Metabolism & 5 Clinical Axes' },
  { id: 'ancestry', label: '2. Ancestral Origins', icon: '🌍', subtitle: 'Indus Valley & Haplogroup M2a\'b' },
  { id: 'foods', label: '3. 17 Food Families', icon: '🥗', subtitle: '116 Foods Classified (🟢🟡🔴)' },
  { id: 'mealplan', label: '4. 7-Day Meal Plan', icon: '📅', subtitle: 'Daily Menus & 24h Routine' },
  { id: 'grocery', label: '5. Grocery Checklist', icon: '🛒', subtitle: 'Monoprix / Lulu Qatar Ready' },
  { id: 'prescription', label: '6. Pharmacy Prescription', icon: '💊', subtitle: 'Compounded vs Local OTC' },
  { id: 'downloads', label: '7. Official PDF Dossiers', icon: '📥', subtitle: '59-Page CE-IVD Documents' }
];

export default function PatientDnaPortalClient({
  initialPatientName,
  initialSampleCode,
  initialClinic,
  initialDoctor,
  initialProfile
}) {
  const [patientName] = useState(initialPatientName || 'Hossam Ahmed');
  const [sampleCode] = useState(initialSampleCode || '24G-QA-90421');
  const [clinic] = useState(initialClinic || 'Ryhanh Medical Company · Doha');
  const [activeChapter, setActiveChapter] = useState('priorities');
  const [prescriptionModality, setPrescriptionModality] = useState('modalityB'); // 'modalityB' (Compounded) | 'modalityA' (Local)
  const [copiedLink, setCopiedLink] = useState(false);

  // GCP Header Interaction States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState('doctor'); // 'doctor' | 'patient'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginFeedback, setLoginFeedback] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en' | 'ar' | 'es'
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(true);

  const searchContainerRef = useRef(null);
  const exportMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Dynamic Clinical Profile Inference (Fast RSC Handoff - Golden Rule #21)
  const clinicalProfile = useMemo(() => {
    if (
      initialProfile &&
      (initialProfile.patient?.name === patientName || initialProfile.patientName === patientName) &&
      (initialProfile.patient?.sampleCode === sampleCode || initialProfile.sampleCode === sampleCode)
    ) {
      return initialProfile;
    }
    return evaluateNutrigenomicProfile({
      patientName,
      sampleCode,
      clinic,
      doctor: initialDoctor
    });
  }, [patientName, sampleCode, clinic, initialProfile, initialDoctor]);

  // Derive Patient Initials for Avatar
  const patientInitials = useMemo(() => {
    if (!patientName) return 'PT';
    const clean = patientName.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }, [patientName]);

  // Omnibox Global Search Indexing (Genes, Foods, Priorities, Chapters)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return { chapters: [], axes: [], foods: [] };

    const matchingChapters = CHAPTERS.filter(
      (ch) => ch.label.toLowerCase().includes(q) || ch.subtitle.toLowerCase().includes(q)
    );

    const matchingAxes = (clinicalProfile.fiveClinicalAxes || []).filter(
      (ax) =>
        ax.title.toLowerCase().includes(q) ||
        ax.genes.toLowerCase().includes(q) ||
        ax.summary.toLowerCase().includes(q)
    );

    const allFoods = [];
    (clinicalProfile.supermarketGroceryList || []).forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.name.toLowerCase().includes(q)) {
          allFoods.push({ name: item.name, category: cat.title, priority: item.priority });
        }
      });
    });

    return {
      chapters: matchingChapters.slice(0, 3),
      axes: matchingAxes.slice(0, 4),
      foods: allFoods.slice(0, 5)
    };
  }, [searchQuery, clinicalProfile]);

  const hasSearchResults =
    searchResults.chapters.length > 0 || searchResults.axes.length > 0 || searchResults.foods.length > 0;

  // Global Keyboard Shortcuts (⌘K for Omnibox, Esc for modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('gcp-omnibox-search');
        if (input) {
          input.focus();
          setIsSearchOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsExportMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsLangMenuOpen(false);
        setIsHelpDrawerOpen(false);
        setIsLoginModalOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // LocalStorage-backed Grocery Checklist
  const groceryStorageKey = `atlas_grocery_${sampleCode || 'default'}`;
  const [checkedGroceryItems, setCheckedGroceryItems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(`atlas_grocery_${sampleCode || 'default'}`);
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore storage errors
      }
    }
    return {};
  });

  const toggleGroceryItem = (itemKey) => {
    setCheckedGroceryItems((prev) => {
      const next = {
        ...prev,
        [itemKey]: !prev[itemKey]
      };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(groceryStorageKey, JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
      }
      return next;
    });
  };

  const resetGroceryChecklist = () => {
    setCheckedGroceryItems({});
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(groceryStorageKey);
      } catch {
        // Ignore storage errors
      }
    }
  };

  // Official PDF download URLs
  const currentDoctor = clinicalProfile.patient?.doctor || initialDoctor || '';
  const pdfDownloadUrl = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&modality=${prescriptionModality}&includeOriginal=true`;
  const pdfDownloadUrlLight = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&modality=${prescriptionModality}&full=false`;
  const mealPlanPdfUrl = `/api/reports/24genomics-mealplan-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&includeOriginal=true`;
  const mealPlanPdfUrlLight = `/api/reports/24genomics-mealplan-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&full=false`;

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleWhatsAppShare = (lang = 'en') => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      const text =
        lang === 'es'
          ? `Hola ${patientName}, aquí tienes tu Dossier Genómico Personalizado: ${url}\n\nBasado estrictamente en tu secuenciación de 24Genetics, el equipo clínico de Atlas ha desarrollado las hojas ejecutivas iniciales con tu plan nutricional y suplementación. Al ser un equipo local basado en UAE, cuentan con plena flexibilidad para realizar cualquier adaptación a medida de tus requerimientos.`
          : `Hello ${patientName}, here is your Personalized Genomic Dossier: ${url}\n\nBased directly on your 24Genetics sequencing report, the Atlas clinical team has developed the executive opening guides for your meal plan and targeted supplementation. As a local UAE-based team, Atlas offers complete flexibility to make tailored adaptations according to your specific requirements.`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleChefWhatsAppShare = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const lightPdfFullUrl = `${origin}${mealPlanPdfUrlLight}`;
      const text =
        `👨‍🍳 *7-Day Personalized Menu & Kitchen Guide for ${patientName}*\n\n` +
        `*3 Simple Kitchen Rules for Every Meal:*\n` +
        `1️⃣ *1-2-3 Plate Order:* Serve leafy greens/vegetables first -> protein (fish/poultry/eggs) second -> complex carbs (quinoa/sweet potato/lentils) last.\n` +
        `2️⃣ *Cooking Oils:* Cook exclusively with Extra Virgin Olive Oil (EVOO), Avocado Oil, or Grass-Fed Ghee (no sunflower/corn/canola seed oils).\n` +
        `3️⃣ *Dairy & Flour:* 100% cow-lactose-free (use goat/sheep feta, aged Parmigiano, or almond/coconut milk) and avoid refined white bread/flour.\n\n` +
        `📄 *Download 5-Page Printable Menu & 17-Family Food List (PDF):*\n${lightPdfFullUrl}`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginFeedback({
      type: 'success',
      text: loginRole === 'doctor'
        ? 'Authenticated as Prescribing Physician. Full Clinical Edit privileges unlocked.'
        : 'Patient OTP verified. Full Health Records access active.'
    });
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setLoginFeedback(null);
    }, 1800);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── 1-Click Verified Nominal Welcome Header (Streamlined) ── */}
      <NominalWelcomeBanner
        recipientName={patientName}
        role="patient"
        clinicName={clinic}
        verifiedBy="Atlas Multidisciplinary Clinical Team"
        sessionDuration="90 days"
        storageKey={`atlas_patient_dna_${sampleCode}`}
        lang={selectedLanguage}
      />

      {/* ── Unified Google Cloud Console-Style Top Navigation Bar ── */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #dadce0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '8px 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Left: Brand & GCP-Style Resource Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 'fit-content' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#1a73e8',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: '0 1px 3px rgba(26,115,232,0.3)'
              }}
            >
              A
            </div>
            <div className="dna-hide-mobile">
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ATLAS HEALTH SERVICES
              </div>
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#202124' }}>
                Precision Genomics
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: '1px', height: '22px', backgroundColor: '#dadce0', margin: '0 4px' }} className="dna-hide-mobile" />

            {/* GCP Project / Resource Selector Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #dadce0',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              <User size={13} color="#5f6368" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#202124' }}>{patientName}</span>
              <CopyableId value={sampleCode} displayValue={`#${sampleCode}`} />
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  backgroundColor: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}
                className="dna-hide-mobile"
              >
                ✓ Verified
              </span>
            </div>
          </div>

          {/* Center: Google Cloud Omnibox Global Search Bar */}
          <div
            ref={searchContainerRef}
            style={{
              position: 'relative',
              flex: '1 1 280px',
              maxWidth: '460px',
              minWidth: '200px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f3f4',
                borderRadius: '8px',
                border: isSearchOpen ? '1px solid #1a73e8' : '1px solid transparent',
                padding: '5px 12px',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Search size={15} color="#5f6368" />
              <input
                id="gcp-omnibox-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search food, gene, meal or nutrient..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.78rem',
                  color: '#202124',
                  width: '100%'
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#5f6368' }}
                >
                  <X size={14} />
                </button>
              ) : (
                <kbd
                  style={{
                    fontSize: '0.62rem',
                    backgroundColor: '#ffffff',
                    color: '#5f6368',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontWeight: 600
                  }}
                  className="dna-hide-mobile"
                >
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Omnibox Floating Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  boxShadow: '0 4px 16px rgba(60,64,67,0.18)',
                  zIndex: 90,
                  maxHeight: '380px',
                  overflowY: 'auto',
                  padding: '8px 0'
                }}
              >
                {!hasSearchResults ? (
                  <div style={{ padding: '12px 16px', fontSize: '0.76rem', color: '#5f6368', textAlign: 'center' }}>
                    No genomic matches found for &quot;<strong>{searchQuery}</strong>&quot;
                  </div>
                ) : (
                  <>
                    {/* Chapter Matches */}
                    {searchResults.chapters.length > 0 && (
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Report Chapters
                        </div>
                        {searchResults.chapters.map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => {
                              setActiveChapter(ch.id);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            style={{
                              padding: '8px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.78rem',
                              color: '#202124'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{ch.icon}</span>
                              <span style={{ fontWeight: 600 }}>{ch.label}</span>
                            </div>
                            <span style={{ fontSize: '0.66rem', color: '#5f6368' }}>{ch.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Genes & Clinical Priorities Matches */}
                    {searchResults.axes.length > 0 && (
                      <div style={{ marginBottom: '6px', borderTop: '1px solid #f1f3f4', paddingTop: '6px' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Genes &amp; 5 Priorities
                        </div>
                        {searchResults.axes.map((ax, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setActiveChapter('priorities');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            style={{
                              padding: '8px 14px',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              color: '#202124'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div style={{ fontWeight: 600, color: '#1a73e8' }}>{ax.title}</div>
                            <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '2px' }}>{ax.genes}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Food Items Matches */}
                    {searchResults.foods.length > 0 && (
                      <div style={{ borderTop: '1px solid #f1f3f4', paddingTop: '6px' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Personalized Foods &amp; Supermarket
                        </div>
                        {searchResults.foods.map((food, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setActiveChapter('foods');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            style={{
                              padding: '7px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.78rem',
                              color: '#202124'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>{food.name}</span>
                            <span style={{ fontSize: '0.66rem', color: '#5f6368', backgroundColor: '#f1f3f4', padding: '1px 6px', borderRadius: '4px' }}>
                              {food.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions, Language, Export, Help & GCP Login/Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
            {/* Language Selector (EN / AR / ES) */}
            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  backgroundColor: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#3c4043',
                  cursor: 'pointer'
                }}
                title="Select language"
              >
                <Globe size={14} color="#5f6368" />
                <span>{selectedLanguage.toUpperCase()}</span>
                <ChevronDown size={12} color="#5f6368" />
              </button>

              {isLangMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    boxShadow: '0 4px 12px rgba(60,64,67,0.15)',
                    zIndex: 90,
                    width: '130px',
                    padding: '4px 0'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setSelectedLanguage('en'); setIsLangMenuOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 12px',
                      border: 'none',
                      backgroundColor: selectedLanguage === 'en' ? '#f1f3f4' : 'transparent',
                      fontSize: '0.74rem',
                      fontWeight: selectedLanguage === 'en' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedLanguage('ar'); setIsLangMenuOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 12px',
                      border: 'none',
                      backgroundColor: selectedLanguage === 'ar' ? '#f1f3f4' : 'transparent',
                      fontSize: '0.74rem',
                      fontWeight: selectedLanguage === 'ar' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🇦🇪 العربية (AR)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedLanguage('es'); setIsLangMenuOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 12px',
                      border: 'none',
                      backgroundColor: selectedLanguage === 'es' ? '#f1f3f4' : 'transparent',
                      fontSize: '0.74rem',
                      fontWeight: selectedLanguage === 'es' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🇪🇸 Español
                  </button>
                </div>
              )}
            </div>

            {/* Consolidated Export / PDF Dropdown (Replaces 2 sprawling buttons) */}
            <div ref={exportMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#e8f0fe',
                  border: '1px solid #d2e3fc',
                  color: '#1a73e8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span className="dna-hide-mobile">Export Dossier</span>
                <ChevronDown size={12} />
              </button>

              {isExportMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #dadce0',
                    boxShadow: '0 4px 16px rgba(60,64,67,0.18)',
                    zIndex: 90,
                    width: '260px',
                    padding: '6px 0'
                  }}
                >
                  <div style={{ padding: '6px 14px', fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Official PDF Archives
                  </div>
                  <a
                    href={mealPlanPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsExportMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      fontSize: '0.76rem',
                      color: '#202124',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Utensils size={14} color="#1a73e8" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Meal Plan Dossier (59p)</div>
                      <div style={{ fontSize: '0.66rem', color: '#5f6368' }}>Full 17-family kitchen guide</div>
                    </div>
                  </a>

                  <a
                    href={pdfDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsExportMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      fontSize: '0.76rem',
                      color: '#202124',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Pill size={14} color="#188038" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Clinical Rx &amp; Compounding (59p)</div>
                      <div style={{ fontSize: '0.66rem', color: '#5f6368' }}>Full CE-IVD certified dossier</div>
                    </div>
                  </a>

                  <a
                    href={mealPlanPdfUrlLight}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsExportMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      fontSize: '0.76rem',
                      color: '#202124',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Printer size={14} color="#5f6368" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Print Kitchen Guide (5p)</div>
                      <div style={{ fontSize: '0.66rem', color: '#5f6368' }}>Compact weekly dining sheet</div>
                    </div>
                  </a>

                  <div style={{ borderTop: '1px solid #dadce0', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      handleShareClick();
                      setIsExportMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.76rem',
                      color: '#202124',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Share2 size={14} color="#5f6368" />
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Secure Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleWhatsAppShare(selectedLanguage);
                      setIsExportMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.76rem',
                      color: '#188038',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <MessageSquare size={14} color="#188038" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              )}
            </div>

            {/* Help / Clinical Concierge Trigger (GCP Question Mark) */}
            <button
              type="button"
              onClick={() => setIsHelpDrawerOpen(true)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #dadce0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5f6368',
                cursor: 'pointer'
              }}
              title="Clinical Support & FAQ"
            >
              <HelpCircle size={16} />
            </button>

            {/* GCP User Profile & Account Popover / Login */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px',
                  borderRadius: '20px',
                  border: '1px solid #dadce0',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.78rem'
                  }}
                >
                  {patientInitials}
                </div>
                <ChevronDown size={12} color="#5f6368" style={{ marginRight: '4px' }} />
              </button>

              {/* GCP Account Popover Menu */}
              {isUserMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #dadce0',
                    boxShadow: '0 4px 16px rgba(60,64,67,0.18)',
                    zIndex: 90,
                    width: '270px',
                    padding: '12px'
                  }}
                >
                  {/* Account Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#1a73e8',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.90rem'
                      }}
                    >
                      {patientInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
                        {patientName}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                        ID: {sampleCode}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      padding: '8px 10px',
                      fontSize: '0.70rem',
                      color: '#475569',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#137333', fontWeight: 600, marginBottom: '2px' }}>
                      <ShieldCheck size={12} />
                      <span>Verified Session (90 days)</span>
                    </div>
                    <div><strong>Clinic:</strong> {clinic}</div>
                    {currentDoctor && <div><strong>Doctor:</strong> {currentDoctor}</div>}
                  </div>

                  <div style={{ borderTop: '1px solid #dadce0', margin: '8px 0' }} />

                  {/* Login / Auth Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsLoginModalOpen(true);
                      setLoginRole('doctor');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#1a73e8',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e8f0fe')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Lock size={14} />
                    <span>Clinician / Doctor Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsLoginModalOpen(true);
                      setLoginRole('patient');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      color: '#3c4043',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogIn size={14} />
                    <span>Patient Account Portal</span>
                  </button>

                  <div style={{ borderTop: '1px solid #dadce0', margin: '6px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (typeof window !== 'undefined') {
                        window.sessionStorage.clear();
                        window.location.reload();
                      }
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      color: '#d93025',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fce8e6')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} />
                    <span>Lock Session / Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Horizontal Pill Carousel (Sticky Under Header on Mobile) ── */}
      <div className="dna-mobile-pill-bar">
        {CHAPTERS.map((ch) => {
          const isActive = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChapter(ch.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: isActive ? 600 : 500,
                border: '1px solid',
                borderColor: isActive ? '#1a73e8' : '#dadce0',
                backgroundColor: isActive ? '#e8f0fe' : '#ffffff',
                color: isActive ? '#1a73e8' : '#3c4043',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <span>{ch.icon}</span>
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Master Layout (2-Column Grid on Laptop / 1-Column on Mobile) ── */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          padding: '1.25rem 1.25rem 5rem 1.25rem',
          flex: 1
        }}
      >
        <div className="dna-portal-grid">
          {/* ── Left Sidebar (Laptop / Desktop >= 1024px) ── */}
          <aside className="dna-desktop-sidebar">
            {/* Patient Clinical Profile Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                padding: '1rem',
                marginBottom: '0.75rem',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 600, backgroundColor: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '1px 6px', borderRadius: '4px' }}>
                  CE-IVD CERTIFIED
                </span>
                <span style={{ fontSize: '0.66rem', color: '#137333', fontWeight: 600 }}>✓ Active</span>
              </div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '1.0rem', fontWeight: 600, color: '#202124' }}>
                {patientName}
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#5f6368', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Specimen ID:</span>
                <CopyableId value={sampleCode} displayValue={sampleCode} />
              </div>
              <div style={{ fontSize: '0.70rem', color: '#5f6368', borderTop: '1px solid #dadce0', paddingTop: '6px' }}>
                <strong>Clinic:</strong> {clinic}
              </div>
              {currentDoctor && (
                <div style={{ fontSize: '0.70rem', color: '#5f6368', paddingTop: '3px' }}>
                  <strong>Doctor:</strong> {currentDoctor}
                </div>
              )}
            </div>

            {/* Vertical Chapter Navigation */}
            <nav
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                padding: '0.5rem',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.66rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Report Chapters
              </div>

              {CHAPTERS.map((ch) => {
                const isActive = activeChapter === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChapter(ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: isActive ? '0 4px 4px 0' : '4px',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #1a73e8' : '3px solid transparent',
                      backgroundColor: isActive ? '#e8f0fe' : 'transparent',
                      color: isActive ? '#1a73e8' : '#3c4043',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.0rem' }}>{ch.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: isActive ? 600 : 500 }}>
                          {ch.label}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: isActive ? '#1a73e8' : '#70757a', marginTop: '1px' }}>
                          {ch.subtitle}
                        </div>
                      </div>
                    </div>
                    {isActive && <ChevronRight size={14} color="#1a73e8" />}
                  </button>
                );
              })}
            </nav>

            {/* Sticky Sidebar Quick Actions */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                padding: '1rem',
                marginTop: '0.75rem',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '0.66rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Action Links
              </div>
              <button
                type="button"
                onClick={handleChefWhatsAppShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#188038',
                  border: '1px solid #dadce0',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={14} />
                <span>Send Menu to Chef (WA)</span>
              </button>

              <a
                href={mealPlanPdfUrlLight}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#1a73e8',
                  border: '1px solid #dadce0',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                <Printer size={14} />
                <span>Print Kitchen Guide (5p)</span>
              </a>
            </div>
          </aside>

          {/* ── Main Content Canvas (Renders Active Chapter) ── */}
          <main style={{ minWidth: 0 }}>
            {/* Executive Roadmap: Rendered ONLY in Chapter 1 to avoid cluttering Chapters 2–7 */}
            {activeChapter === 'priorities' && showRoadmap && (
              <div style={{ position: 'relative' }}>
                <DnaReportRoadmap
                  onSelectSection={(sec) => {
                    if (sec === 'mealplan') setActiveChapter('mealplan');
                    if (sec === 'prescription') setActiveChapter('prescription');
                  }}
                  onSetFoodViewMode={() => setActiveChapter('foods')}
                />
                <button
                  type="button"
                  onClick={() => setShowRoadmap(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    border: 'none',
                    backgroundColor: '#f1f3f4',
                    color: '#5f6368',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.66rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <X size={12} />
                  <span>Dismiss</span>
                </button>
              </div>
            )}

            {/* Chapter 1: DNA Priorities & Plate Sequencing */}
            {activeChapter === 'priorities' && (
              <DnaPrioritiesSection
                clinicalProfile={clinicalProfile}
                patientName={patientName}
                sampleCode={sampleCode}
              />
            )}

            {/* Chapter 2: Ancestral Origins & Metabolic Heritage */}
            {activeChapter === 'ancestry' && (
              <DnaAncestryHeritageSection
                clinicalProfile={clinicalProfile}
              />
            )}

            {/* Chapter 3: Complete Food List & 17-Family Matrix */}
            {activeChapter === 'foods' && (
              <DnaFoodMatrixSection
                clinicalProfile={clinicalProfile}
                initialViewMode="fagron_matrix"
              />
            )}

            {/* Chapter 4: 7-Day Precision Meal Plan & 24h Routine */}
            {activeChapter === 'mealplan' && (
              <DnaWeeklyMealPlan
                clinicalProfile={clinicalProfile}
                onShareChefWhatsApp={handleChefWhatsAppShare}
              />
            )}

            {/* Chapter 5: Supermarket Grocery Checklist */}
            {activeChapter === 'grocery' && (
              <DnaGroceryChecklist
                supermarketGroceryList={clinicalProfile.supermarketGroceryList || []}
                checkedGroceryItems={checkedGroceryItems}
                onToggleItem={toggleGroceryItem}
                onResetList={resetGroceryChecklist}
              />
            )}

            {/* Chapter 6: Pharmacy Prescription (Compounded vs Local OTC) */}
            {activeChapter === 'prescription' && (
              <div>
                {/* Modality Selector Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setPrescriptionModality('modalityB')}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      border: 'none',
                      backgroundColor: prescriptionModality === 'modalityB' ? '#003666' : '#ffffff',
                      color: prescriptionModality === 'modalityB' ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: prescriptionModality === 'modalityB' ? '0 2px 6px rgba(0, 54, 102, 0.2)' : 'none',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: prescriptionModality === 'modalityB' ? '#003666' : '#cbd5e1'
                    }}
                  >
                    💊 Option B: 3-Capsule Custom Pharmacy Order (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrescriptionModality('modalityA')}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      border: 'none',
                      backgroundColor: prescriptionModality === 'modalityA' ? '#0d9488' : '#ffffff',
                      color: prescriptionModality === 'modalityA' ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: prescriptionModality === 'modalityA' ? '0 2px 6px rgba(13, 148, 136, 0.2)' : 'none',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: prescriptionModality === 'modalityA' ? '#0d9488' : '#cbd5e1'
                    }}
                  >
                    🏪 Option A: Local Retail Pharmacy Supplements
                  </button>
                </div>

                {prescriptionModality === 'modalityB' ? (
                  <DnaCompoundingPrescription
                    threeCapsuleProtocol={THREE_CAPSULE_PROTOCOL}
                    treatmentCycle={TREATMENT_CYCLE}
                    onSwitchToOptionA={() => setPrescriptionModality('modalityA')}
                  />
                ) : (
                  <DnaLocalPharmacyOptionA
                    onSwitchToOptionB={() => setPrescriptionModality('modalityB')}
                  />
                )}
              </div>
            )}

            {/* Chapter 7: Official PDF Dossiers & Downloads */}
            {activeChapter === 'downloads' && (
              <DnaDownloadsSection
                mealPlanPdfUrl={mealPlanPdfUrl}
                pdfDownloadUrl={pdfDownloadUrl}
                mealPlanPdfUrlLight={mealPlanPdfUrlLight}
                pdfDownloadUrlLight={pdfDownloadUrlLight}
                patientName={patientName}
                sampleCode={sampleCode}
              />
            )}
          </main>
        </div>
      </div>

      {/* ── GCP Modal: Clinician & Patient Authentication (Login) ── */}
      {isLoginModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(32,33,36,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              border: '1px solid #dadce0'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  A
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#202124' }}>
                    Atlas Identity &amp; Access Management
                  </h3>
                  <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                    Google Cloud Healthcare API Compliant
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginFeedback(null);
                }}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Role Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #dadce0', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setLoginRole('doctor')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  borderBottom: loginRole === 'doctor' ? '2px solid #1a73e8' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: loginRole === 'doctor' ? '#1a73e8' : '#5f6368',
                  fontWeight: loginRole === 'doctor' ? 600 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                👨‍⚕️ Clinician / Doctor
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('patient')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  borderBottom: loginRole === 'patient' ? '2px solid #1a73e8' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: loginRole === 'patient' ? '#1a73e8' : '#5f6368',
                  fontWeight: loginRole === 'patient' ? 600 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                👤 Patient Portal
              </button>
            </div>

            {loginFeedback && (
              <div
                style={{
                  backgroundColor: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.74rem',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={14} />
                <span>{loginFeedback.text}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loginRole === 'doctor' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>
                      Clinical Email / GMC License
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="dr.burud@transcendhealth.me"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        fontSize: '0.80rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>
                      Master Password / 2FA Passkey
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        fontSize: '0.80rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>
                      Verified Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        fontSize: '0.80rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', fontWeight: 600, color: '#3c4043', marginBottom: '4px' }}>
                      One-Time SMS Passcode (OTP)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="6-digit code"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        fontSize: '0.80rem',
                        outline: 'none',
                        letterSpacing: '0.2em'
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    backgroundColor: '#ffffff',
                    color: '#3c4043',
                    fontSize: '0.76rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {loginRole === 'doctor' ? 'Sign In as Prescriber' : 'Verify & Enter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── GCP Slide-over Help & Clinical Concierge Drawer ── */}
      {isHelpDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(32,33,36,0.4)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setIsHelpDrawerOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#ffffff',
              height: '100%',
              boxShadow: '-4px 0 16px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#1a73e8" />
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: '#202124' }}>
                  Atlas Clinical Concierge
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpDrawerOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase' }}>
                  Your Multidisciplinary Care Team
                </div>
                <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#202124', marginTop: '2px' }}>
                  Transcend Healthcare · Dubai &amp; Doha
                </div>
                <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px' }}>
                  Doctor in charge: <strong>{currentDoctor || 'Dr. Sajid Burud'}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '8px' }}>
                Frequently Asked Questions
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ border: '1px solid #dadce0', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124' }}>
                    How do I read the 🟢🟡🔴 traffic lights?
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
                    🟢 <strong>Eat Freely:</strong> Genetically optimal. 🟡 <strong>Normal Portion:</strong> Consume 1-2x/week with plate sequencing. 🔴 <strong>Avoid:</strong> Triggers inflammatory or insulin spikes.
                  </div>
                </div>

                <div style={{ border: '1px solid #dadce0', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124' }}>
                    What is the 1-2-3 Plate Order Rule?
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
                    Consume leafy fibers first, protein and healthy fats second, and complex carbs last to blunt postprandial glucose spikes by up to 45%.
                  </div>
                </div>

                <div style={{ border: '1px solid #dadce0', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124' }}>
                    How do I order the 3-Capsule Compounding formula?
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
                    Jump to Chapter 6 and download your official compounding prescription or send it directly to our partner compounding pharmacy in UAE.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #dadce0', paddingTop: '14px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => handleWhatsAppShare(selectedLanguage)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#188038',
                  color: '#ffffff',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={16} />
                <span>Chat with Clinical Genetics Concierge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Sticky Bottom Action Bar (Fixed to thumb area on phones) ── */}
      <div className="dna-mobile-bottom-bar">
        <button
          type="button"
          onClick={handleChefWhatsAppShare}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            backgroundColor: '#ffffff',
            color: '#188038',
            borderRadius: '4px',
            border: '1px solid #dadce0',
            fontWeight: 500,
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}
        >
          <MessageSquare size={15} />
          <span>WhatsApp to Chef</span>
        </button>

        <a
          href={mealPlanPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            backgroundColor: '#1a73e8',
            color: '#ffffff',
            borderRadius: '4px',
            fontWeight: 500,
            fontSize: '0.78rem',
            textDecoration: 'none',
            textAlign: 'center'
          }}
        >
          <Download size={15} />
          <span>Download PDF (59p)</span>
        </a>
      </div>

      {/* ── Responsive CSS Rules ── */}
      <style jsx>{`
        .dna-portal-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .dna-desktop-sidebar {
          display: none;
        }
        .dna-mobile-pill-bar {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          padding: 10px 1rem;
          position: sticky;
          top: 50px;
          z-index: 35;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          -webkit-overflow-scrolling: touch;
        }
        .dna-mobile-bottom-bar {
          display: flex;
          gap: 10px;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 1rem;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
          z-index: 50;
        }

        @media (max-width: 768px) {
          .dna-hide-mobile {
            display: none !important;
          }
        }

        @media (min-width: 1024px) {
          .dna-portal-grid {
            grid-template-columns: 280px minmax(0, 1fr);
            gap: 1.75rem;
            align-items: start;
          }
          .dna-desktop-sidebar {
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 68px;
            max-height: calc(100vh - 84px);
            overflow-y: auto;
          }
          .dna-mobile-pill-bar {
            display: none;
          }
          .dna-mobile-bottom-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

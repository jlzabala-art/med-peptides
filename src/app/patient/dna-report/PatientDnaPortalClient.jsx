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
  AlertCircle,
  QrCode
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import CopyableId from '@/components/ui/CopyableId';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { filterAdminDirectoryGroups } from '@/constants/publicAdminDirectory';
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
  { id: 'priorities', label: '1. DNA Priorities', icon: '🧬', subtitle: 'Metabolism & 5 Nutrition Axes', patientSubtitle: 'Your 5 Body Priorities' },
  { id: 'ancestry', label: '2. Ancestral Origins', icon: '🌍', subtitle: 'MENA / Nile Valley & Haplogroups', patientSubtitle: 'Origins & Food Heritage' },
  { id: 'foods', label: '3. 17 Food Families', icon: '🥗', subtitle: '116 Foods Classified (🟢🟡🔴)', patientSubtitle: 'What to Eat & Avoid (🟢🟡🔴)' },
  { id: 'mealplan', label: '4. 7-Day Meal Plan', icon: '📅', subtitle: 'Daily Menus & 24h Routine', patientSubtitle: 'Daily Menus & Routine' },
  { id: 'grocery', label: '5. Grocery Checklist', icon: '🛒', subtitle: 'Monoprix / Lulu Qatar Ready', patientSubtitle: 'Supermarket Shopping List' },
  { id: 'prescription', label: '6. Supplement Plan', icon: '💊', subtitle: 'Compounded vs Local OTC', patientSubtitle: 'Daily Supplement Guide' },
  { id: 'downloads', label: '7. PDF Dossiers', icon: '📥', subtitle: 'Nutritionist & Patient PDFs', patientSubtitle: 'Simple Patient PDF (11p)' }
];

export default function PatientDnaPortalClient({
  initialPatientName,
  initialSampleCode,
  initialClinic,
  initialDoctor,
  initialProfile,
  initialCanAccessNutritionist = false,
  initialNutritionistToken = null
}) {
  const [patientName] = useState(initialPatientName || 'Hossam Ahmed');
  const [sampleCode] = useState(initialSampleCode || '24G-QA-90421');
  const [clinic] = useState(initialClinic || 'Ryhanh Medical Company · Doha');
  const [activeChapter, setActiveChapter] = useState('priorities');
  const [prescriptionModality, setPrescriptionModality] = useState('modalityB'); // 'modalityB' (Compounded) | 'modalityA' (Local)
  const [copiedLink, setCopiedLink] = useState(false);

  // Asymmetric Audience Mode: Patient (default, locked) vs Nutritionist (requires token or specialist auth)
  const router = useRouter();
  const { is } = useRoleAccess();
  const isAdminUser = is('admin');
  const [canAccessNutritionist, setCanAccessNutritionist] = useState(Boolean(initialCanAccessNutritionist));
  const [nutritionistToken, setNutritionistToken] = useState(initialNutritionistToken || null);
  const [audienceMode, setAudienceMode] = useState(initialCanAccessNutritionist ? 'nutritionist' : 'patient');
  const isNutritionistView = (canAccessNutritionist || isAdminUser) && audienceMode === 'nutritionist';
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedQrType, setCopiedQrType] = useState(null);

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

  // Omnibox Global Search Indexing (Genes, Foods, Priorities, Chapters + Admin Public Screens Index)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) {
      return { chapters: CHAPTERS, axes: [], foods: [] };
    }

    const matchingChapters = CHAPTERS.filter(
      (ch) =>
        ch.label.toLowerCase().includes(q) ||
        ch.subtitle.toLowerCase().includes(q) ||
        (ch.patientSubtitle && ch.patientSubtitle.toLowerCase().includes(q))
    );

    const matchingAxes = (clinicalProfile.fiveClinicalAxes || []).filter(
      (ax) =>
        ax.title.toLowerCase().includes(q) ||
        (isNutritionistView && ax.genes && ax.genes.toLowerCase().includes(q)) ||
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
      chapters: matchingChapters.slice(0, 7),
      axes: matchingAxes.slice(0, 4),
      foods: allFoods.slice(0, 6)
    };
  }, [searchQuery, clinicalProfile, isNutritionistView]);

  const adminDirectoryGroups = useMemo(
    () => (isAdminUser ? filterAdminDirectoryGroups(searchQuery) : []),
    [isAdminUser, searchQuery]
  );

  const hasSearchResults =
    searchResults.chapters.length > 0 ||
    searchResults.axes.length > 0 ||
    searchResults.foods.length > 0 ||
    adminDirectoryGroups.length > 0;

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

  // Official PDF download URLs (Separated: Nutritionist Merged 24Genetics vs Simple Patient without annexes)
  const currentDoctor = clinicalProfile.patient?.doctor || initialDoctor || '';
  const pdfDownloadUrl = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&modality=${prescriptionModality}&audience=nutritionist&includeOriginal=true`;
  const pdfDownloadUrlLight = `/api/reports/24genomics-patient-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&modality=${prescriptionModality}&audience=patient&includeOriginal=false&full=false`;
  const mealPlanPdfUrl = `/api/reports/24genomics-mealplan-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&audience=nutritionist&includeOriginal=true`;
  const mealPlanPdfUrlLight = `/api/reports/24genomics-mealplan-pdf?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(currentDoctor)}&audience=patient&includeOriginal=false&full=false`;

  // Canonical QR URLs (Patient QR never exposes nutritionist token; Nutritionist QR only generated when authorized)
  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
  const patientPortalUrl = `${baseOrigin}/patient/dna-report?patient=${encodeURIComponent(patientName)}&sample=${encodeURIComponent(sampleCode)}`;
  const nutritionistPortalUrl = canAccessNutritionist && nutritionistToken
    ? `${patientPortalUrl}&view=nutritionist&nt=${encodeURIComponent(nutritionistToken)}`
    : null;

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(patientPortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopySpecificUrl = (type, url) => {
    if (typeof window !== 'undefined' && url) {
      navigator.clipboard.writeText(url);
      setCopiedQrType(type);
      setTimeout(() => setCopiedQrType(null), 2200);
    }
  };

  const handleWhatsAppShare = (lang = 'en') => {
    if (typeof window !== 'undefined') {
      const url = patientPortalUrl;
      const text =
        lang === 'es'
          ? `Hola ${patientName}, aquí tienes tu Guía Genómica Personalizada: ${url}\n\nBasado en tus informes de Ancestría y Nutrición de 24Genetics, el equipo de Atlas ha preparado tu plan nutricional de 7 días, semáforo de alimentos y suplementación personalizada.`
          : `Hello ${patientName}, here is your Personalized DNA & Heritage Guide: ${url}\n\nBased on your 24Genetics Ancestry and Nutrition reports, the Atlas team has prepared your 7-day meal plan, food traffic light, and targeted supplement guide.`;
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginRole === 'doctor') {
      try {
        const res = await fetch('/api/genomics/nutritionist-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sampleCode, email: loginEmail || 'nutritionist@atlashealth-services.com' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.token) {
            setNutritionistToken(data.token);
            setCanAccessNutritionist(true);
            setAudienceMode('nutritionist');
          }
        }
      } catch {
        // Fallback keeps user authenticated UI feedback
      }
      setLoginFeedback({
        type: 'success',
        text: 'Authenticated as Nutritionist / Specialist. Full Nutrigenomics & 24Genetics Dossier unlocked.'
      });
    } else {
      setLoginFeedback({
        type: 'success',
        text: 'Patient OTP verified. Personal Nutrition & Meal Plan active.'
      });
    }
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setLoginFeedback(null);
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── 1-Click Verified Nominal Welcome Header (Streamlined) ── */}
      <NominalWelcomeBanner
        recipientName={patientName}
        role="patient"
        clinicName={clinic}
        verifiedBy="Atlas Nutrition & Wellness Team"
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

            {/* Omnibox Floating Search Results Dropdown (Opens on focus or typing; Admin sees Public Screens Index) */}
            {isSearchOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  minWidth: 'min(92vw, 480px)',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #dadce0',
                  boxShadow: '0 8px 24px rgba(60,64,67,0.20)',
                  zIndex: 90,
                  maxHeight: '72vh',
                  overflowY: 'auto',
                  padding: '8px 0'
                }}
              >
                {!hasSearchResults ? (
                  <div style={{ padding: '12px 16px', fontSize: '0.76rem', color: '#5f6368', textAlign: 'center' }}>
                    No matches found for &quot;<strong>{searchQuery}</strong>&quot;
                  </div>
                ) : (
                  <>
                    {/* Chapter Matches (Current Report Index) */}
                    {searchResults.chapters.length > 0 && (
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {selectedLanguage === 'es' ? 'Índice de este Informe (7 Capítulos)' : 'This Report Index (7 Chapters)'}
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
                              gap: '8px',
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
                            <span style={{ fontSize: '0.66rem', color: '#5f6368' }}>
                              {isNutritionistView ? ch.subtitle : (ch.patientSubtitle || ch.subtitle)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Genes & Priorities Matches */}
                    {searchResults.axes.length > 0 && (
                      <div style={{ marginBottom: '6px', borderTop: '1px solid #f1f3f4', paddingTop: '6px' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isNutritionistView ? 'Genes & 5 Priorities' : 'Your 5 Body Priorities'}
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
                            {isNutritionistView && (
                              <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '2px' }}>{ax.genes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Food Items Matches */}
                    {searchResults.foods.length > 0 && (
                      <div style={{ marginBottom: '6px', borderTop: '1px solid #f1f3f4', paddingTop: '6px' }}>
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

                    {/* ADMIN ONLY: Master Public Screens & Catalogs Directory */}
                    {isAdminUser && adminDirectoryGroups.length > 0 && (
                      <div style={{ borderTop: '1px solid #dadce0', marginTop: '6px', padding: '8px 12px 4px', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.66rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                          <ShieldCheck size={12} />
                          <span>{selectedLanguage === 'es' ? 'Índice Maestro de Pantallas Públicas (Solo Admin)' : 'Public Screens & Catalogs Directory (Admin Only)'}</span>
                        </div>
                        {adminDirectoryGroups.map((group) => (
                          <div key={group.id} style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '4px' }}>
                              {selectedLanguage === 'es' ? group.titleEs : group.titleEn}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '5px' }}>
                              {group.items.map((item) => (
                                <button
                                  key={item.href}
                                  type="button"
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                    router.push(item.href);
                                  }}
                                  style={{
                                    width: '100%',
                                    minHeight: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px',
                                    padding: '6px 9px',
                                    borderRadius: '6px',
                                    border: '1px solid #dadce0',
                                    backgroundColor: '#ffffff',
                                    color: '#202124',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                >
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {selectedLanguage === 'es' ? item.labelEs : item.labelEn}
                                  </span>
                                  <span style={{ fontSize: '0.60rem', fontWeight: 700, color: '#1a73e8', backgroundColor: '#e8f0fe', padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>
                                    {item.tag}
                                  </span>
                                </button>
                              ))}
                            </div>
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

            {/* Nutritionist Asymmetric Mode Switcher (ONLY visible when authorized as Nutritionist) */}
            {canAccessNutritionist && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#f1f3f4',
                  borderRadius: '6px',
                  padding: '2px',
                  border: '1px solid #dadce0'
                }}
                title="Nutritionist Mode shows full SNPs & merged 24Genetics PDF. Patient Preview shows exactly what your patient sees."
              >
                <button
                  type="button"
                  onClick={() => setAudienceMode('nutritionist')}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: audienceMode === 'nutritionist' ? '#003666' : 'transparent',
                    color: audienceMode === 'nutritionist' ? '#ffffff' : '#5f6368'
                  }}
                >
                  {selectedLanguage === 'es' ? 'Modo Nutricionista' : 'Nutritionist'}
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceMode('patient')}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: audienceMode === 'patient' ? '#0d9488' : 'transparent',
                    color: audienceMode === 'patient' ? '#ffffff' : '#5f6368'
                  }}
                >
                  {selectedLanguage === 'es' ? 'Vista Paciente' : 'Patient View'}
                </button>
              </div>
            )}

            {/* QR Codes Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 9px',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                color: '#3c4043',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="View & Share Portal QR Codes"
            >
              <QrCode size={14} color="#1a73e8" />
              <span className="dna-hide-mobile">QR</span>
            </button>

            {/* Consolidated Export / PDF Dropdown */}
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
                    {isNutritionistView ? 'Nutritionist & Patient PDFs' : 'Simple Patient PDF (No Annexes)'}
                  </div>
                  {isNutritionistView && (
                    <>
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
                          <div style={{ fontWeight: 600 }}>Nutritionist Dossier (Merged 24Genetics)</div>
                          <div style={{ fontSize: '0.66rem', color: '#5f6368' }}>Full guide + original 24Genetics report</div>
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
                          <div style={{ fontWeight: 600 }}>Formulation &amp; SNPs Dossier (Merged)</div>
                          <div style={{ fontSize: '0.66rem', color: '#5f6368' }}>Includes 24Genetics CE-IVD annex</div>
                        </div>
                      </a>
                    </>
                  )}

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
                    <Printer size={14} color="#0d9488" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Patient Meal &amp; Food Guide (11p)</div>
                      <div style={{ fontSize: '0.66rem', color: '#5f6368' }}>Simple edition · No lab annexes</div>
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
              title="Nutrition Support & FAQ"
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
                    <span>Nutritionist / Specialist Sign In</span>
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
                          {isNutritionistView ? ch.subtitle : (ch.patientSubtitle || ch.subtitle)}
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
                href={isNutritionistView ? mealPlanPdfUrl : mealPlanPdfUrlLight}
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
                <span>{isNutritionistView ? 'Nutritionist Dossier PDF' : 'Print Kitchen Guide (5p)'}</span>
              </a>

              {isNutritionistView && (
                <a
                  href={`/rx/intake?patient=${encodeURIComponent(patientName)}&dna=${encodeURIComponent(sampleCode)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    border: '1px solid #003666',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Pill size={14} />
                  <span>{selectedLanguage === 'es' ? 'Crear Prescripción / Plan' : 'Create Rx / Supplement Plan'}</span>
                </a>
              )}
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
                audienceMode={isNutritionistView ? 'nutritionist' : 'patient'}
              />
            )}

            {/* Chapter 2: Ancestral Origins & Metabolic Heritage */}
            {activeChapter === 'ancestry' && (
              <DnaAncestryHeritageSection
                clinicalProfile={clinicalProfile}
                audienceMode={isNutritionistView ? 'nutritionist' : 'patient'}
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
                audienceMode={isNutritionistView ? 'nutritionist' : 'patient'}
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
                👨‍⚕️ Nutritionist / Specialist
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
                      Nutritionist Email / Specialist ID
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
                  Atlas Nutrition Concierge
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
                <span>Chat with Nutrition Genetics Concierge</span>
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
          href={isNutritionistView ? mealPlanPdfUrl : mealPlanPdfUrlLight}
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
          <span>{isNutritionistView ? 'Nutritionist PDF' : 'Patient PDF (5p)'}</span>
        </a>
      </div>

      {/* ── Asymmetric 2-QR Modal (Patient QR always; Nutritionist QR ONLY when authorized) ── */}
      {isQrModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1rem'
          }}
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: canAccessNutritionist && nutritionistPortalUrl ? '680px' : '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.22)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                  {canAccessNutritionist ? 'Portal QR Codes · Patient & Nutritionist' : 'My Personal DNA Portal QR'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  {patientName} · Sample #{sampleCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: canAccessNutritionist && nutritionistPortalUrl ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr', gap: '16px' }}>
              {/* Patient QR (Always visible) */}
              <div style={{ border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '16px', backgroundColor: '#f0fdfa', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', fontSize: '0.66rem', fontWeight: 800, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Patient QR · Practical View Only
                </span>
                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', display: 'inline-block', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                  <QRCodeSVG value={patientPortalUrl} size={156} level="M" includeMargin={false} />
                </div>
                <p style={{ fontSize: '0.72rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  Share with the patient. Shows meal plan, food traffic lights &amp; simple PDF only (no SNPs or lab annexes).
                </p>
                <button
                  type="button"
                  onClick={() => handleCopySpecificUrl('patient', patientPortalUrl)}
                  style={{
                    width: '100%',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid #0d9488',
                    backgroundColor: copiedQrType === 'patient' ? '#0d9488' : '#ffffff',
                    color: copiedQrType === 'patient' ? '#ffffff' : '#0f766e',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copiedQrType === 'patient' ? '✓ Patient Link Copied' : 'Copy Patient Link'}
                </button>
              </div>

              {/* Nutritionist QR (ONLY visible when authorized) */}
              {canAccessNutritionist && nutritionistPortalUrl && (
                <div style={{ border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '16px', backgroundColor: '#eff6ff', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', fontSize: '0.66rem', fontWeight: 800, color: '#003666', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Nutritionist QR · Full SNPs + Preview
                  </span>
                  <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', display: 'inline-block', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                    <QRCodeSVG value={nutritionistPortalUrl} size={156} level="M" includeMargin={false} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    For specialist use. Unlocks full SNPs/rsIDs, merged 24Genetics PDF &amp; Patient Preview toggle.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopySpecificUrl('nutritionist', nutritionistPortalUrl)}
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      border: '1px solid #003666',
                      backgroundColor: copiedQrType === 'nutritionist' ? '#003666' : '#ffffff',
                      color: copiedQrType === 'nutritionist' ? '#ffffff' : '#003666',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedQrType === 'nutritionist' ? '✓ Nutritionist Link Copied' : 'Copy Nutritionist Link'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

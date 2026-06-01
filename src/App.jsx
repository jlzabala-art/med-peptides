/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import AtlasHealthLogo from './components/brand/AtlasHealthLogo';
import AppErrorBoundary from './components/AppErrorBoundary';
import { resolveProductPrice } from './utils/resolveProductPrice';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams, Outlet } from 'react-router-dom';
import PageTransition from './components/PageTransition';
import Header from './layout/Header';
import { HelmetProvider } from 'react-helmet-async';
import SearchModal from './snippets/SearchModal';
import Hero from './sections/Hero';
import Footer from './layout/Footer';
import RegionBar from './sections/RegionBar';
import BackToTop from './layout/BackToTop';
import Cart from './snippets/Cart';
import AccessCatalogOverlay from './layout/AccessCatalogOverlay';
import blogPosts from './data/blogData';
import ExitProfessionalMode from './components/auth/ExitProfessionalMode';
import ClinicalAssistant from './components/shared/ClinicalAssistant';
import ProductComparator from './components/discovery/ProductComparator';import { trackPageView } from './hooks/useAnalytics';

// --- Layouts and Contexts ---
import ProtectedRoute from './components/auth/ProtectedRoute';
import GlobalAppLayout from './components/shared/GlobalAppLayout';
import ShopLayout from './layout/ShopLayout';
import { HeaderProvider } from './context/HeaderContext';
import AdminLayout from './layout/AdminLayout';
import ClinicalLayout from './layout/ClinicalLayout';
import { useCart } from './context/CartProvider';
import { useModal } from './context/ModalProvider';
import { useShop } from './context/ShopProvider';
import { AdminProvider } from './context/AdminProvider';
import { DoctorProvider } from './context/DoctorProvider';
// ── Lazy Loading Heavy Templates (Section 2: Performance) ────────────────────
const HomeView = lazy(() => import('./templates/HomeView'));
const About = lazy(() => import('./templates/About'));
const Quality = lazy(() => import('./templates/Quality'));
const Catalog = lazy(() => import('./templates/Catalog'));
const Contact = lazy(() => import('./templates/Contact'));
const ProductDetail = lazy(() => import('./templates/ProductDetail'));
const SuppliesView = lazy(() => import('./templates/SuppliesView'));
const ObjectivesView = lazy(() => import('./templates/ObjectivesView'));
const ObjectiveDetailView = lazy(() => import('./templates/ObjectiveDetailView'));
const CategoryDetailView = lazy(() => import('./templates/CategoryDetailView'));
const Calculator = lazy(() => import('./templates/Calculator'));
const CustomSynthesis = lazy(() => import('./templates/CustomSynthesis'));
const FAQDiscoveryView = lazy(() => import('./templates/FAQDiscoveryView'));
const AcademyView = lazy(() => import('./templates/AcademyView'));
const CourseDetailView = lazy(() => import('./templates/CourseDetailView'));
const AuthPage = lazy(() => import('./templates/AuthPage'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const UserDashboard = lazy(() => import('./templates/UserDashboard'));
const RoleDashboard = lazy(() => import('./templates/RoleDashboard'));
const AccountManagerDashboard = lazy(() => import('./templates/AccountManagerDashboard'));
const DoctorHome = lazy(() => import('./templates/DoctorHome'));
const DoctorDashboard = lazy(() => import('./templates/DoctorDashboard'));
const DoctorRoutes = lazy(() => import('./routes/DoctorRoutes'));
const WholesalerRoutes = lazy(() => import('./routes/WholesalerRoutes'));
const SupplierRoutes = lazy(() => import('./routes/SupplierRoutes'));
const WholesalerHome = lazy(() => import('./templates/WholesalerHome'));
const PublicCatalogView = lazy(() => import('./templates/PublicCatalogView'));
const CatalogEmailTracker = lazy(() => import('./templates/CatalogEmailTracker'));
const ClinicRoutes = lazy(() => import('./routes/ClinicRoutes'));
const PharmacyRoutes = lazy(() => import('./routes/PharmacyRoutes'));
const SupplierHome = lazy(() => import('./templates/SupplierHome'));
const PublicSupplierQuote = lazy(() => import('./components/public/PublicSupplierQuote'));
const PublicClientQuote = lazy(() => import('./components/public/PublicClientQuote'));
const PatientRoutes = lazy(() => import('./routes/PatientRoutes'));
const PatientAppointments = lazy(() => import('./templates/PatientAppointments'));
const DoctorPatients = lazy(() => import('./templates/DoctorPatients'));
const DoctorAppointments = lazy(() => import('./templates/DoctorAppointments'));
const DoctorLabResults = lazy(() => import('./templates/DoctorLabResults'));
const DoctorResearch = lazy(() => import('./templates/DoctorResearch'));
const DoctorSettings = lazy(() => import('./templates/DoctorSettings'));
const DoctorProfile = lazy(() => import('./templates/DoctorProfile'));
const HormonePelletsPage = lazy(() => import('./pages/pellets.jsx'));
import PelletDetailPage from './pages/pelletDetail.jsx';
const PatientDetailAdmin = lazy(() => import('./templates/PatientDetailAdmin'));
const CalendarPage = lazy(() => import('./components/calendar/CalendarPage'));

const LegalConditions = lazy(() => import('./templates/LegalConditions'));
const TermsOfUse = lazy(() => import('./templates/TermsOfUse'));
const UserSettings = lazy(() => import('./templates/UserSettings'));
const ProductTemplate = lazy(() => import('./templates/ProductTemplate'));
const CollectionTemplate = lazy(() => import('./templates/CollectionTemplate'));
const ProtocolTemplate = lazy(() => import('./templates/ProtocolTemplate'));
const FAQTemplate = lazy(() => import('./templates/FAQTemplate'));
const ResearchStudyTemplate = lazy(() => import('./templates/ResearchStudyTemplate'));
const BlogPage = lazy(() => import('./templates/BlogPage'));
const BlogPostPage = lazy(() => import('./templates/BlogPostPage'));
const SearchTemplate = lazy(() => import('./templates/SearchTemplate'));
const ContactTemplate = lazy(() => import('./templates/ContactTemplate'));
const CompareTemplate = lazy(() => import('./templates/CompareTemplate'));
const CompoundComparator = lazy(() => import('./templates/CompoundComparator'));
const PrivacyPolicy = lazy(() => import('./templates/PrivacyPolicy'));
const WhatArePeptides = lazy(() => import('./templates/WhatArePeptides'));
const WhatAreProtocolsPage = lazy(() => import('./templates/WhatAreProtocolsPage'));
const ReconstitutionGuide = lazy(() => import('./templates/ReconstitutionGuide'));
const ProtocolFinderRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nav:apiDashboard'));
    navigate('/', { replace: true });
  }, [navigate]);
  return null;
};

const ObjectiveDetailRouteWrapper = ({ isProfessional, visibleProducts, allFaqs, onSelectProduct }) => {
  const { objectiveId } = useParams();
  const navigate = useNavigate();
  
  const idMap = {
    'healing-repair': 'Healing & Repair',
    'metabolic-optimization': 'Metabolic Optimization',
    'neuro-cognitive': 'Neuro-Cognitive',
    'longevity-vitality': 'Longevity & Vitality',
    'somatic-research': 'Somatic Research',
    'hormonal-pathways': 'Hormonal Pathways'
  };
  const resolvedId = idMap[objectiveId] || objectiveId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <ObjectiveDetailView
      objectiveId={resolvedId}
      onBack={() => navigate('/objectives')}
      onSelectProduct={onSelectProduct}
      isProfessional={isProfessional}
      products={visibleProducts}
      allFaqs={allFaqs}
    />
  );
};

const Checkout = lazy(() => import('./templates/Checkout'));
const SupplementDetailPage = lazy(() => import('./templates/SupplementDetailPage'));
const TestingDetailPage = lazy(() => import('./templates/TestingDetailPage'));
const APIDashboard = lazy(() => import('./templates/APIDashboard'));

// Branded Atlas Health loading screen (used as Suspense fallback)
const ClinicalLoader = () => (
  <div style={{
    height: '80vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '1rem'
  }}>
    <div style={{ animation: 'atlas-pulse 1.8s ease-in-out infinite' }}>
      <AtlasHealthLogo size={52} />
    </div>
    <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, margin: 0 }}>Cargando…</p>
    <div style={{ width: 100, height: 3, borderRadius: 99, background: 'rgba(0,54,102,0.08)', overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#003666,#00BCD4)', animation: 'atlas-shimmer 1.4s ease-in-out infinite' }} />
    </div>
    <style>{`
      @keyframes atlas-pulse { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
      @keyframes atlas-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
    `}</style>
  </div>
);

import { db } from './firebase';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { fetchLiveRates } from './utils/liveRates';
import { getCatalog } from './repositories/productRepository';
// v2 canonical catalog — replaces the legacy staticProducts fallback
import { catalog as staticProducts, categories as v2Categories } from './data/v2/index.js';
import { productCategories } from './data/products'; // still needed for legacy category nav
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTenant } from './context/TenantContext';
import { useFirestoreData } from './hooks/useFirestoreData';
import { COUNTRIES } from './data/countries';
import { REGION_FLAGS } from './data/regions';

// Initial default settings (will be overridden by Firestore)
const DEFAULT_SETTINGS = {
  exchangeRates: {
    ae: { rate: 1, currency: 'USD', name: 'United Arab Emirates' },
    qa: { rate: 1, currency: 'USD', name: 'Qatar' },
    kw: { rate: 1, currency: 'USD', name: 'Kuwait' },
    sa: { rate: 1, currency: 'USD', name: 'Saudi Arabia' },
    eu: { rate: 1, currency: 'USD', name: 'European Union' },
    gb: { rate: 1, currency: 'USD', name: 'United Kingdom' },
    us: { rate: 1, currency: 'USD', name: 'USA' },
    row: { rate: 1, currency: 'USD', name: 'Global' }
  },
  shippingCosts: { standard: 0, express: 50, courier: 30 },
  deliveryTimes: { standard: '5-7 days', express: '2-3 days', courier: 'next day' }
};

// ── Feature Flags ────────────────────────────────────────────────────────────
// Set to `true` to show the Region/Profile bar at the bottom of the page,
// or `false` to hide it globally. Toggle from here to manage visibility.
const SHOW_REGION_BAR = false;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantSlug } = useTenant();
  const [scrolled, setScrolled] = useState(false);

  const tenantNavigate = (path, options) => {
    if (typeof path === 'string' && tenantSlug && path.startsWith('/') && !path.startsWith('/admin') && !path.startsWith('/login') && !path.startsWith('/session-ended')) {
      navigate(`/partner/${tenantSlug}${path}`, options);
    } else {
      navigate(path, options);
    }
  };

  // Global scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname + location.search, document.title || 'Regenpept');
  }, [location.pathname, location.search]);
  
  // Lifted global state with safety catch for Private modes
  const { region, setRegion, settings, setSettings, products, compareList, setCompareList } = useShop();
  const { cart, setCart, cartMetadata, setCartMetadata, cartOwnership, setCartOwnership, updateCart, removeProtocolBundle, cartBreakdown, cartCount } = useCart();
  const { activeModal, setActiveModal } = useModal();
  
  const { isProfessional, isAdmin, isPhysician, isPatient, user, userProfile, loading: authLoading, activeRole } = useAuth();
  // allFaqs and protocolIndex: read-only, session-cached — no products fetch inside hook
  const { allFaqs, protocolIndex, supplementCatalogue } = useFirestoreData();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        setLoadingTimeout(true);
      }
    }, 2500); // Reduced from 5s to 2.5s for faster UX
    return () => clearTimeout(timer);
  }, [authLoading]);

  const visibleProducts = useMemo(() => {
    if (isAdmin) return products;
    return products.filter(p => {
      if (p.isActive === false) return false;
      if (!isProfessional && (p.isProfessional === true || p.supplier === 'NPLAB')) return false;
      return true;
    });
  }, [products, isAdmin, isProfessional]);

  const [selectedShipping, setSelectedShipping] = useState('standard');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInitialTab, setSearchInitialTab] = useState('peptides');

  const [showCheckout, setShowCheckout] = useState(false);
  const [pendingQuote, setPendingQuote] = useState(null);
  const [manualRegionChange, setManualRegionChange] = useState(false);
  
  // Dynamic Settings are now from useShop
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    try {
      if (region) localStorage.setItem('mp_region', region);
    } catch (e) {
      console.warn("Storage restricted:", e);
    }
  }, [region]);

  // Listen for API Dashboard navigation event (dispatched by UserDashboard card)
  useEffect(() => {
    const handler = () => { navigate('/api-dashboard'); };
    window.addEventListener('nav:apiDashboard', handler);
    return () => window.removeEventListener('nav:apiDashboard', handler);
  }, []);





  // IP-Based Detection — uses ISO country code for reliable matching
  useEffect(() => {
    if (!region && !manualRegionChange) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const countryCode = (data.country_code || '').toLowerCase(); // e.g. 'ae', 'us', 'gb'
          const countryName = data.country_name || '';

          if (countryCode) {
            // 1. Check if we have a direct exchange-rate region key for this country code
            if (settings.exchangeRates[countryCode]) {
              setRegion(countryCode);
            } else {
              // 2. Try to match the detected country code inside COUNTRIES list
              //    so we can at least show the correct flag/name without an exchange-rate entry
              const knownCountry = COUNTRIES.find(c => c.code === countryCode);
              if (knownCountry) {
                // Store the ISO code as region so header shows the real flag
                setRegion(countryCode);
              } else {
                setRegion('row'); // True fallback: unknown country
              }
            }
            setManualRegionChange(false);
            // Store detected country metadata for checkout to use
            setSettings(prev => ({ ...prev, detectedCountry: countryName, detectedCountryCode: countryCode }));
          }
        })
        .catch(err => console.warn("IP detection failed:", err));
    }
  }, [region, settings.exchangeRates, manualRegionChange]);

  // ── Phase 4: Stamp cartOwnership when auth state changes ──────────────────
  // When a patient logs in → set patientId and reset source to 'patient_selected'.
  // When anyone else logs in → only patientId is relevant if they're a patient.
  // On logout → wipe ownership back to anonymous defaults.
  //
  // IMPORTANT: Only clear the cart when the auth identity *actually* changes
  // (different UID, or login → logout transition). Firebase Auth re-initializes
  // on every page load, causing this effect to fire even for unchanged guest state.
  // Without this guard, guest carts are wiped on every product page navigation.
  const prevUserUidRef = useRef(undefined); // undefined = not yet initialized
  useEffect(() => {
    const prevUid = prevUserUidRef.current;
    const currUid = user?.uid ?? null;

    // Skip on first mount (Firebase Auth hasn't resolved yet) — undefined means uninitialized
    if (prevUid === undefined) {
      prevUserUidRef.current = currUid;
      // Still stamp ownership on first mount without clearing cart
      if (user && isPatient) {
        setCartOwnership({
          patientId: user.uid,
          supervisingPhysicianId: userProfile?.assignedPhysicianIds?.[0] ?? null,
          supervisingAdminId: null,
          source: 'patient_selected',
          recommendationId: null,
        });
      } else if (!user) {
        setCartOwnership({
          patientId: null,
          supervisingPhysicianId: null,
          supervisingAdminId: null,
          source: 'patient_selected',
          recommendationId: null,
        });
      }
      return;
    }

    // Only clear cart if identity actually changed (different user or login/logout)
    const identityChanged = prevUid !== currUid;
    prevUserUidRef.current = currUid;

    if (identityChanged) {
      setCart({});
      setCartMetadata({});
    }

    if (user && isPatient) {
      // Patient just authenticated — stamp ownership.
      setCartOwnership({
        patientId: user.uid,
        supervisingPhysicianId: userProfile?.assignedPhysicianIds?.[0] ?? null,
        supervisingAdminId: null,
        source: 'patient_selected',
        recommendationId: null,
      });
    } else if (!user) {
      // Logged out — reset to anonymous defaults.
      setCartOwnership({
        patientId: null,
        supervisingPhysicianId: null,
        supervisingAdminId: null,
        source: 'patient_selected',
        recommendationId: null,
      });
    }
    // Non-patient users (professionals, admins) keep the default null ownership
    // because THEY never pay — only patients do.
  }, [user, isPatient, userProfile?.assignedPhysicianIds]);


  // ── Product catalog is now fetched by ShopProvider ────────────────────────


  // ── Live Exchange Rate Sync ──────────────────────────────────────────────
  // Fetches fresh rates from open.er-api.com once per session (24-hour gap)
  // and saves them to Firestore. The onSnapshot below picks up the change
  // automatically and distributes it to all components.
  useEffect(() => {
    const LAST_SYNC_KEY = 'mp_rates_last_sync';
    const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

    const syncRates = async () => {
      if (!isAdmin) return; // Only admins can update the global rates doc
      
      try {
        const lastSync = sessionStorage.getItem(LAST_SYNC_KEY);
        if (lastSync && Date.now() - parseInt(lastSync, 10) < SYNC_INTERVAL_MS) {
          return; 
        }
        const live = await fetchLiveRates();
        await setDoc(
          doc(db, 'settings', 'global'),
          { ...live },
          { merge: true }
        );
        sessionStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
        console.info('[Rates] Live exchange rates synced →', live.ratesLastUpdated);
      } catch (err) {
        console.warn('[Rates] Live sync failed:', err.message);
      }
    };

    if (isAdmin) syncRates();
  }, [isAdmin]);

  // ── Dynamic Settings Subscription (single document — real-time) ──────────
  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Transform incoming flat rates back into the rich object format needed by the UI
        const mappedRates = { ...DEFAULT_SETTINGS.exchangeRates };
        if (data.exchangeRates) {
          Object.entries(data.exchangeRates).forEach(([key, val]) => {
            if (mappedRates[key]) {
              mappedRates[key] = { ...mappedRates[key], rate: val };
            }
          });
        }
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          exchangeRates: mappedRates
        });
      }
    }, (error) => {
      console.error('Firestore Settings Error:', error);
      // Fail silently — DEFAULT_SETTINGS are already applied
    });

    return () => { unsubscribeSettings(); };
  }, []);

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id || p.name === product.name);
      if (exists) {
        return prev.filter(p => p.id !== product.id && p.name !== product.name);
      }
      if (prev.length >= 3) {
        alert("You can only compare up to 3 products at a time.");
        return prev;
      }
      return [...prev, product];
    });
    setActiveModal('compare'); // Automatically open compare drawer when adding
  };



  // ── Listen for direct cart additions from PatientPrescriptionPanel (Rx "Buy" button)
  //    and from Clinical Assistant PDF analyzer ────────────────────────────────────────
  useEffect(() => {
    const handleAddToCartDirect = (e) => {
      const { product, delta = 1, metadata = {} } = e.detail || {};
      if (!product) return;

      // 1. Add the item to the cart quantity map
      updateCart(product, delta);

      // 2. Stamp per-item metadata (prescriptionId, source, supervisingPhysicianId, …)
      const itemKey = product.name;
      if (Object.keys(metadata).length > 0) {
        setCartMetadata(prev => ({
          ...prev,
          [itemKey]: { ...(prev[itemKey] || {}), ...metadata },
        }));
      }

      // 3. If this item came from a prescription, stamp cartOwnership so Checkout
      //    can write prescriptionId onto the Firestore order document.
      //    This is required for the onOrderCreatedForRx Cloud Function to fire.
      const rxId  = product.prescriptionId || metadata.prescriptionId || null;
      const docId = product.doctorId       || metadata.supervisingPhysicianId || null;
      if (rxId || docId) {
        setCartOwnership(prev => ({
          ...prev,
          prescriptionId:         rxId  ?? prev.prescriptionId,
          supervisingPhysicianId: docId ?? prev.supervisingPhysicianId,
          source: 'from_prescription',
        }));
      }

      setActiveModal('cart');
    };
    window.addEventListener('add-to-cart-direct', handleAddToCartDirect);
    return () => window.removeEventListener('add-to-cart-direct', handleAddToCartDirect);
  }, [updateCart]);

  // ── Listen for refill / rx-add-to-cart events (PatientHome refill flow) ───────────
  useEffect(() => {
    const handleRxAddToCart = (e) => {
      const { items = [], prescriptionId, source = 'refill', doctorId } = e.detail || {};
      items.forEach(item => {
        if (!item?.name) return;
        // Build a product-like object compatible with updateCart
        updateCart({ name: item.name, id: item.id || item.name }, item.quantity || 1);
        setCartMetadata(prev => ({
          ...prev,
          [item.name]: {
            ...(prev[item.name] || {}),
            prescriptionId,
            source,
            supervisingPhysicianId: doctorId || item.doctorId || null,
          },
        }));
      });
      if (prescriptionId) {
        setCartOwnership(prev => ({
          ...prev,
          prescriptionId,
          source,
          supervisingPhysicianId: doctorId ?? prev.supervisingPhysicianId,
        }));
      }
    };
    window.addEventListener('rx-add-to-cart', handleRxAddToCart);
    return () => window.removeEventListener('rx-add-to-cart', handleRxAddToCart);
  }, [updateCart]);

  const handleProtocolSupply = (bundle) => {
    setCartMetadata(prev => ({
      ...prev,
      protocolBundles: [...(prev.protocolBundles || []), bundle]
    }));
    setActiveModal('cart');
  };



  // ── Phase 4: Accept a doctor recommendation into the cart ─────────────────
  // Called when a patient taps "Accept Recommendation" in their portal.
  // Seeds the cart with the recommended products/protocols and upgrades
  // cartOwnership.source to 'doctor_recommended'.
  //
  // @param {object} recommendation — Firestore recommendation document
  //   { id, patientId, doctorId, products: [{name, qty}], protocols: [...], ... }
  const acceptRecommendation = (recommendation) => {
    if (!recommendation) return;

    const { id, doctorId, adminId, products: recProducts = [], protocols: recProtocols = [], peptides = [] } = recommendation;

    // Seed cart with recommended products
    recProducts.forEach(item => {
      if (item.name && item.qty > 0) {
        setCart(prev => ({
          ...prev,
          [item.name]: (prev[item.name] || 0) + item.qty,
        }));
        // Tag each item with the recommendation source in metadata
        setCartMetadata(prev => ({
          ...prev,
          [item.name]: {
            ...(prev[item.name] || {}),
            source: 'doctor_recommended',
            recommendationId: id,
          },
        }));
      }
    });

    // Also support simple peptides list (from PhysicianDashboard new recommendations)
    peptides.forEach(peptideName => {
      const name = typeof peptideName === 'string' ? peptideName : peptideName.name;
      if (name) {
        setCart(prev => ({
          ...prev,
          [name]: (prev[name] || 0) + 1,
        }));
        setCartMetadata(prev => ({
          ...prev,
          [name]: {
            ...(prev[name] || {}),
            source: 'doctor_recommended',
            recommendationId: id,
          },
        }));
      }
    });

    // Upgrade ownership to reflect doctor-guided purchase
    setCartOwnership(prev => ({
      ...prev,
      supervisingPhysicianId: doctorId ?? prev.supervisingPhysicianId,
      supervisingAdminId: adminId ?? prev.supervisingAdminId,
      source: adminId ? 'admin_recommended' : 'doctor_recommended',
      recommendationId: id ?? null,
    }));

    setActiveModal('cart');
  };

  const isHome = location.pathname === '/' || ['/clinic', '/doctor', '/wholesaler', '/sales_agent', '/staff', '/patient'].includes(location.pathname);



  const handleCategorySelect = (cat) => {
    console.log('[App] Category Select:', cat);
    
    if (cat === 'Home') { 
      navigate(activeRole === 'admin' ? '/admin' : '/');
      return; 
    }
    
    if (cat === 'Peptides' || cat === 'Products') {
      navigate('/collection/peptides');
      return;
    }

    if (cat === 'FAQ') {
      navigate('/faq');
      return;
    }

    if (cat === 'Contact' || cat === 'Partner') {
      navigate('/contact');
      return;
    }

    if (cat === 'Supplies') {
      navigate('/collection/supplies');
      return;
    }

    if (cat === 'Academy') {
      navigate('/academy');
      return;
    }

    // Handle Research Focus Areas from Marquee
    const focusAreaMap = {
      'Recovery & Repair': '/collection/protocols?goal=Recovery & Repair',
      'Metabolic & Weight': '/collection/protocols?goal=Metabolic & Weight',
      'Longevity & Anti-Aging': '/collection/protocols?goal=Longevity & Anti-Aging',
      'Cognitive & Mood': '/collection/protocols?goal=Cognitive & Mood',
      'Sleep & Circadian': '/collection/protocols?goal=Sleep & Circadian',
      'Hormonal Optimization': '/collection/protocols?goal=Hormonal Optimization',
      'Immune Support': '/collection/protocols?goal=Immune Support'
    };

    if (focusAreaMap[cat]) {
      navigate(focusAreaMap[cat]);
      return;
    }

    if (cat === 'Research Pathways' || cat === 'Objectives') {
      navigate('/objectives');
    } else if (cat === 'Calculator') {
      navigate('/calculator');
    } else if (cat === 'About' || cat === 'Logistics') {
      navigate('/about');
    } else if (cat === 'Quality') {
      navigate('/quality');
    } else if (cat === 'Custom Synthesis') {
      if (isProfessional) navigate('/custom-synthesis');
    } else if (cat === 'API Materials' || cat === 'API Dashboard' || cat === 'Wholesale') {
      navigate('/api-dashboard');
    } else if (cat === 'Login' || cat === 'Auth') {
      navigate('/login');
    } else if (cat === 'Admin') {
      if (window.innerWidth >= 1024) {
        navigate('/admin');
      }
    } else if (cat === 'Dashboard') {
      navigate('/paciente');
    } else if (cat === 'Settings') {
      navigate('/settings');
    } else if (cat === 'Legal') {
      navigate('/legal');
    } else {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/collection/${slug}`);
    }
  };



  const handleProductSelect = (productOrName) => {
    // ── Product-type aware routing ──────────────────────────────────────────
    // Every object from a repository now carries a `productType` field:
    //   'peptide'    → /product/:slug
    //   'supplement' → /supplements/:slug
    //   (future)     → extend the ROUTE_MAP below
    // Legacy string callers still work via products-array lookup.
    // ────────────────────────────────────────────────────────────────────────

    const ROUTE_MAP = {
      supplement: (slug) => `/supplements/${slug}`,
      peptide:    (slug) => `/product/${slug}`,
      testing:    (slug) => `/testing/${slug}`,
      diagnostic: (slug) => `/testing/${slug}`,
    };

    if (typeof productOrName === 'object' && productOrName !== null) {
      const obj  = productOrName;
      const slug = obj.slug || obj.id || (obj.name && obj.name.toLowerCase().replace(/\s+/g, '-'));
      if (!slug) return;

      // Primary: productType field or category-based check
      const type = obj.productType || obj.type || (obj.category === 'Longevity Diagnostics' ? 'testing' : undefined);
      const routeFn = ROUTE_MAP[type];
      if (routeFn) {
        navigate(routeFn(slug));
        window.scrollTo(0, 0);
        return;
      }

      // Fallback: if object is not in the peptide products list, treat as supplement
      const isKnownPeptide = products.some(
        (p) => p.id === obj.id || p.slug === slug || p.name === obj.name
      );
      const isTestingCategory = obj.category === 'Longevity Diagnostics';
      navigate(isKnownPeptide ? `/product/${slug}` : isTestingCategory ? `/testing/${slug}` : `/supplements/${slug}`);
      window.scrollTo(0, 0);
      return;
    }

    // String path: look up in peptide products first
    const product = products.find(p => p.name === productOrName || p.id === productOrName);
    if (product) {
      const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/product/${slug}`);
      window.scrollTo(0, 0);
    } else {
      // Unknown string — default to /product/ to preserve legacy behaviour
      navigate(`/product/${productOrName.toLowerCase().replace(/\s+/g, '-')}`);
      window.scrollTo(0, 0);
    }
  };

  // Global Title Management (SEO)
  useEffect(() => {
    if (location.pathname === '/') {
      document.title = "Atlas Health | Premium Cellular Health & Longevity";
    } else if (location.pathname === '/privacy') {
      document.title = "Privacy Policy | Atlas Health";
    }
  }, [location.pathname]);


  // Global Modal Scroll Management
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeModal]);



  const renderPublicShopRoutes = (isPartner) => (
    <>
      <Route path={isPartner ? "" : "/"} element={
        activeRole === 'admin' && !isPartner
          ? <Navigate to="/admin" replace />
          : <HomeView 
              isProfessional={isProfessional}
              userProfile={userProfile}
              onSelectCategory={handleCategorySelect}
              onSelectProduct={handleProductSelect}
              products={visibleProducts}
              onOpenSearch={(q, tab) => {
                if (q !== undefined) setSearchQuery(q);
                if (tab) setSearchInitialTab(tab);
                setActiveModal('search');
              }}
              onOpenCart={() => setActiveModal('cart')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
      } />
      {['clinic', 'sales_agent', 'staff'].map(role => (
        <Route key={role} path={isPartner ? role : `/${role}`} element={
          <HomeView 
            forcedRole={role}
            isProfessional={isProfessional}
            userProfile={userProfile}
            onSelectCategory={handleCategorySelect}
            onSelectProduct={handleProductSelect}
            products={visibleProducts}
            onOpenSearch={(q, tab) => {
              if (q !== undefined) setSearchQuery(q);
              if (tab) setSearchInitialTab(tab);
              setActiveModal('search');
            }}
            onOpenCart={() => setActiveModal('cart')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        } />
      ))}
      <Route path="collection/hormone-pellets" element={<HormonePelletsPage />} />
      <Route path="product/:slug" element={
        <ProductTemplate 
          region={region} 
          isProfessional={isProfessional} 
          isAdmin={isAdmin} 
          cart={cart} 
          onAddToCart={updateCart}
          toggleCompare={toggleCompare}
          compareList={compareList}
          products={visibleProducts}
        />
      } />
      <Route path="collection/:slug" element={
        <CollectionTemplate
          region={region}
          isProfessional={isProfessional}
          isAdmin={isAdmin}
          cart={cart}
          setCart={setCart}
          updateCart={updateCart}
          toggleCompare={toggleCompare}
          setRegion={setRegion}
          isCartOpen={activeModal === 'cart'}
          setIsCartOpen={(val) => setActiveModal(val ? 'cart' : null)}
          setPendingQuote={setPendingQuote}
          onOpenSearch={(q, tab) => {
            setSearchQuery(q);
            setSearchInitialTab(tab || 'products');
            setActiveModal('search');
          }}
          products={visibleProducts}
          EXCHANGE_RATES={settings.exchangeRates}
          allFaqs={allFaqs}
        />
      } />
      <Route path="protocol/:slug" element={
        <ProtocolTemplate 
          region={region} 
          isProfessional={isProfessional} 
          cart={cart} 
          updateCart={updateCart} 
          setRegion={setRegion}
          products={visibleProducts}
        />
      } />
      <Route path="protocol-finder" element={<ProtocolFinderRedirect />} />
      <Route path="about" element={<About />} />
      <Route path="faq" element={<FAQTemplate />} />
      <Route path="faq/:topic" element={<FAQTemplate />} />
      <Route path="search" element={
        <SearchTemplate products={visibleProducts} />
      } />
      <Route path="contact" element={
        <ContactTemplate 
          cart={cart}
          region={region}
          isProfessional={isProfessional}
          products={visibleProducts}
          pendingQuote={pendingQuote}
          setPendingQuote={setPendingQuote}
        />
      } />
      <Route path="privacy" element={<PrivacyPolicy />} />
      <Route path="legal" element={<LegalConditions />} />
      <Route path="terms" element={<TermsOfUse />} />
      <Route path="what-are-peptides" element={<WhatArePeptides />} />
      <Route path="blog" element={<BlogPage />} />
      <Route path="blog/:slug" element={<BlogPostPage />} />
      <Route path="what-are-protocols" element={<WhatAreProtocolsPage />} />
      <Route path="reconstitution-guide" element={<ReconstitutionGuide />} />
      <Route path="calculator" element={<Calculator onBack={() => window.history.back()} />} />
      <Route path="compare" element={<CompoundComparator />} />
      <Route path="compare/:slug1/:slug2" element={
        <CompareTemplate products={visibleProducts} />
      } />
      <Route path="research/:slug" element={
        <ResearchStudyTemplate 
          region={region} 
          isProfessional={isProfessional} 
          cart={cart} 
          updateCart={updateCart} 
          setRegion={setRegion} 
        />
      } />
      <Route path="supplements/:slug" element={<SupplementDetailPage onAddToCart={updateCart} region={region} />} />
      <Route path="testing/:slug" element={<TestingDetailPage onAddToCart={updateCart} region={region} />} />
      {isPartner && <Route path="*" element={<Navigate to="" replace />} />}
    </>
  );

  const renderContinuedShopRoutes = () => (
    <>
      <Route path="academy" element={
        <AcademyView onSelectCourse={(courseId) => tenantNavigate(`/academy/${courseId}`)} />
      } />
      <Route path="academy/:courseId" element={
        <CourseDetailView onBack={() => tenantNavigate('/academy')} />
      } />
      <Route path="faqs" element={
        <FAQDiscoveryView
          onBack={() => tenantNavigate('/')}
          products={visibleProducts}
        />
      } />
      <Route path="quality" element={
        <Quality onBack={() => window.history.back()} />
      } />
      <Route path="custom-synthesis" element={
        <CustomSynthesis onBack={() => window.history.back()} />
      } />
      <Route path="api-dashboard" element={
        <APIDashboard onBack={() => window.history.back()} isProfessional={isProfessional} />
      } />
      <Route path="objectives" element={
        <ObjectivesView 
          onBack={() => window.history.back()}
          region={region}
          setRegion={setRegion}
          isProfessional={isProfessional}
          EXCHANGE_RATES={settings.exchangeRates}
          products={visibleProducts}
          onSelectObjective={(objectiveId) => tenantNavigate(`/objective/${objectiveId.toLowerCase().replace(/ /g, '-')}`)}
        />
      } />
      <Route path="objective/:objectiveId" element={
        <ObjectiveDetailRouteWrapper
          isProfessional={isProfessional}
          visibleProducts={visibleProducts}
          allFaqs={allFaqs}
          onSelectProduct={handleProductSelect}
        />
      } />
      <Route path="settings" element={
        <UserSettings onBack={() => tenantNavigate('/patient')} />
      } />
      <Route path="orders" element={<Navigate to="../patient" replace />} />
      <Route path="orders/history" element={<Navigate to="../patient" replace />} />
      <Route path="saved" element={<Navigate to="../patient" replace />} />
      <Route path="saved/protocols" element={<Navigate to="../patient" replace />} />
      <Route path="saved/products" element={<Navigate to="../patient" replace />} />
      <Route path="my-protocols" element={<Navigate to="../patient" replace />} />
    </>
  );

  // Public auth routes (/login, /login?tab=register) must NEVER be blocked by the loading gate.
  // We check the pathname directly so users can always access login/register.
  const isPublicAuthRoute = location.pathname === '/login';

  if (authLoading && !loadingTimeout && !isPublicAuthRoute) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#020e1c', color: 'white', fontFamily: 'var(--font-heading)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Atlas Health
          </div>
          <button 
            onClick={() => setLoadingTimeout(true)}
            style={{
              marginTop: '2rem',
              padding: '0.6rem 1.2rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Bypass Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <HeaderProvider>
      <div className="app">
        <PageTransition locationKey={location.pathname}>
          <Suspense fallback={<ClinicalLoader />}>
          <Routes>
            {/* ── STANDALONE ROUTES ── */}
            <Route path="/login" element={<AuthPage onBack={() => window.history.back()} />} />
            <Route path="/session-ended" element={<ExitProfessionalMode onBack={() => navigate('/')} onLogin={() => navigate('/login')} />} />
            
            {/* ── MAGIC LINKS (No Auth Required) ── */}
            <Route path="/supplier-quote/:id" element={<PublicSupplierQuote />} />
            <Route path="/client-quote/:id" element={<PublicClientQuote />} />

            {/* ── PUBLIC SHOP LAYOUT (Standard) ── */}
            <Route element={
              <ShopLayout 
                scrolled={scrolled} 
                region={region}
                onOpenRegion={() => {
                  setRegion(null);
                  setManualRegionChange(true);
                  // eslint-disable-next-line no-empty
                  try { localStorage.removeItem('mp_region'); } catch (e) {}
                }}
                cartCount={cartCount}
                onOpenCart={() => setActiveModal('cart')}
                onOpenSearch={() => { setSearchInitialTab('peptides'); setActiveModal('search'); }}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                isHome={isHome}
                onGoHome={() => {
                  tenantNavigate('/');
                }}
                onSelectProduct={handleProductSelect}
                onSelectCategory={handleCategorySelect}
                products={visibleProducts}
              />
            }>
              {renderPublicShopRoutes(false)}
            </Route>

            {/* ── PUBLIC SHOP LAYOUT (Partner) ── */}
            <Route path="/partner/:tenantSlug" element={
              <ShopLayout 
                scrolled={scrolled} 
                region={region}
                onOpenRegion={() => {
                  setRegion(null);
                  setManualRegionChange(true);
                  // eslint-disable-next-line no-empty
                  try { localStorage.removeItem('mp_region'); } catch (e) {}
                }}
                cartCount={cartCount}
                onOpenCart={() => setActiveModal('cart')}
                onOpenSearch={() => { setSearchInitialTab('peptides'); setActiveModal('search'); }}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                isHome={isHome}
                onGoHome={() => {
                  tenantNavigate('/');
                }}
                onSelectProduct={handleProductSelect}
                onSelectCategory={handleCategorySelect}
                products={visibleProducts}
              />
            }>
              {renderPublicShopRoutes(true)}
            </Route>

            {/* --- ZONA ADMIN (outside ShopLayout — no public header) --- */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminProvider><AdminLayout /></AdminProvider>}>
                <Route path="/admin/*"            element={<AdminRoutes />} />
                <Route path="/admin/patient/:id"  element={<PatientDetailAdmin />} />
              </Route>
            </Route>

            {/* --- PUBLIC SHOP LAYOUT (continued below admin - Standard) --- */}
            <Route element={
              <ShopLayout 
                scrolled={scrolled} 
                region={region}
                onOpenRegion={() => {
                  setRegion(null);
                  setManualRegionChange(true);
                  // eslint-disable-next-line no-empty
                  try { localStorage.removeItem('mp_region'); } catch (e) {}
                }}
                cartCount={cartCount}
                onOpenCart={() => setActiveModal('cart')}
                onOpenSearch={() => { setSearchInitialTab('peptides'); setActiveModal('search'); }}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                isHome={isHome}
                onGoHome={() => { tenantNavigate('/'); }}
                onSelectProduct={handleProductSelect}
                onSelectCategory={handleCategorySelect}
                products={visibleProducts}
              />
            }>
              {renderContinuedShopRoutes()}
            </Route>

            {/* --- PUBLIC SHOP LAYOUT (continued below admin - Partner) --- */}
            <Route path="/partner/:tenantSlug" element={
              <ShopLayout 
                scrolled={scrolled} 
                region={region}
                onOpenRegion={() => {
                  setRegion(null);
                  setManualRegionChange(true);
                  // eslint-disable-next-line no-empty
                  try { localStorage.removeItem('mp_region'); } catch (e) {}
                }}
                cartCount={cartCount}
                onOpenCart={() => setActiveModal('cart')}
                onOpenSearch={() => { setSearchInitialTab('peptides'); setActiveModal('search'); }}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                isHome={isHome}
                onGoHome={() => { tenantNavigate('/'); }}
                onSelectProduct={handleProductSelect}
                onSelectCategory={handleCategorySelect}
                products={visibleProducts}
              />
            }>
              {renderContinuedShopRoutes()}
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['professional', 'patient', 'doctor', 'admin']} />}>
              <Route element={<DoctorProvider><Outlet /></DoctorProvider>}>
                <Route path="/doctor/*" element={<DoctorRoutes />} />
                <Route path="/doctor-dashboard/*" element={<DoctorRoutes />} />

                {/* Account Manager Routing */}
                <Route path="account-manager/*" element={<AccountManagerDashboard />} />
              </Route>
            </Route>

            <Route path="/profile" element={
              <AppErrorBoundary>
                <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                  <UserSettings onBack={() => window.history.back()} />
                </div>
              </AppErrorBoundary>
            } />

            <Route path="checkout" element={<Checkout />} />

            <Route element={<ProtectedRoute allowedRoles={['professional', 'patient', 'doctor', 'admin']} />}>
              <Route path="/patient/*" element={<Suspense fallback={<ClinicalLoader />}><PatientRoutes /></Suspense>} />
            </Route>
            
            {/* /paciente and dashboard: unified under GlobalAppLayout */}
            <Route element={
              <GlobalAppLayout 
                cartCount={cartCount}
                onOpenCart={() => setActiveModal('cart')}
              />
            }>
              <Route element={<ProtectedRoute allowedRoles={['professional', 'patient', 'doctor', 'admin']} />}>
                <Route path="/paciente" element={<Suspense fallback={<ClinicalLoader />}><UserDashboard onOpenCart={() => setActiveModal('cart')} /></Suspense>} />
                <Route path="/calendar" element={<Suspense fallback={<ClinicalLoader />}><CalendarPage /></Suspense>} />
                <Route path="/account/supervisor" element={<Suspense fallback={<ClinicalLoader />}><UserDashboard onOpenCart={() => setActiveModal('cart')} /></Suspense>} />
              </Route>
            </Route>
            {/* Sub-paths with ClinicalLayout (legacy tabs) */}
            <Route element={<ProtectedRoute allowedRoles={['professional', 'patient', 'doctor', 'admin']} />}>
              <Route element={<DoctorProvider><ClinicalLayout /></DoctorProvider>}>
                <Route path="/doctor/patients" element={<DoctorPatients />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/lab-results" element={<DoctorLabResults />} />
                <Route path="/doctor/research" element={<DoctorResearch />} />
                <Route path="/doctor/profile" element={<DoctorProfile />} />
              </Route>
            </Route>
            <Route path="/wholesaler/*" element={activeRole === 'wholesaler' || activeRole === 'admin' ? <WholesalerRoutes /> : <Navigate to="/paciente" replace />} />
            <Route path="/wholeseller/*" element={<Navigate to="/wholesaler" replace />} />
            <Route path="/catalog/:catalogSlug" element={<PublicCatalogView />} />
            <Route path="/partner/:tenantSlug/catalog/:catalogSlug" element={<PublicCatalogView />} />
            <Route path="/catalog/track/:eventId" element={<CatalogEmailTracker />} />
            <Route path="/clinic-dashboard/*" element={activeRole === 'clinic' || activeRole === 'admin' ? <ClinicRoutes /> : <Navigate to="/paciente" replace />} />
            <Route path="/pharmacy-dashboard/*" element={activeRole === 'compounding_pharmacy' || activeRole === 'admin' ? <PharmacyRoutes /> : <Navigate to="/paciente" replace />} />
            <Route path="/supplier-dashboard/*" element={activeRole === 'supplier' || activeRole === 'admin' ? <SupplierRoutes /> : <Navigate to="/paciente" replace />} />
            {/* --- PUBLIC SHOP LAYOUT (continued for Settings & Redirects - Standard) --- */}
            <Route element={
              <ShopLayout 
                scrolled={scrolled} 
                region={region}
                onOpenRegion={() => {
                  setRegion(null);
                  setManualRegionChange(true);
                  // eslint-disable-next-line no-empty
                  try { localStorage.removeItem('mp_region'); } catch (e) {}
                }}
                cartCount={cartCount}
                onOpenCart={() => setActiveModal('cart')}
                onOpenSearch={() => { setSearchInitialTab('peptides'); setActiveModal('search'); }}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                isHome={isHome}
                onGoHome={() => { tenantNavigate('/'); }}
                onSelectProduct={handleProductSelect}
                onSelectCategory={handleCategorySelect}
                products={visibleProducts}
              />
            }>
              {renderContinuedShopRoutes()}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* --- PUBLIC SHOP LAYOUT (continued for Settings & Redirects - Partner) --- */}
            <Route path="/partner/:tenantSlug" element={
              <ShopLayout 
                scrolled={scrolled} 
                region={region}
                onOpenRegion={() => {
                  setRegion(null);
                  setManualRegionChange(true);
                  // eslint-disable-next-line no-empty
                  try { localStorage.removeItem('mp_region'); } catch (e) {}
                }}
                cartCount={cartCount}
                onOpenCart={() => setActiveModal('cart')}
                onOpenSearch={() => { setSearchInitialTab('peptides'); setActiveModal('search'); }}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                isHome={isHome}
                onGoHome={() => { tenantNavigate('/'); }}
                onSelectProduct={handleProductSelect}
                onSelectCategory={handleCategorySelect}
                products={visibleProducts}
              />
            }>
              {renderContinuedShopRoutes()}
              <Route path="*" element={<Navigate to="" replace />} />
            </Route>
          </Routes>
        </Suspense>
        </PageTransition>
        <ClinicalAssistant 
          isOpen={activeModal === 'ai'} 
          setIsOpen={(val) => setActiveModal(val ? 'ai' : null)} 
          contextMode={activeRole === 'admin' ? 'admin' : activeRole === 'doctor' ? 'doctor' : 'patient'}
        />
      {/* Global Profile & Destination Bar — controlled by SHOW_REGION_BAR flag */}
      {SHOW_REGION_BAR && !showCheckout && (
        <RegionBar
          region={region}
          user={user}
          isProfessional={isProfessional}
          settings={settings}
          onChangeRegion={() => {
            setRegion(null);
            setManualRegionChange(true);
            // eslint-disable-next-line no-empty
            try { localStorage.removeItem('mp_region'); } catch (e) {}
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}





      <Cart 
        isOpen={activeModal === 'cart'}
        onClose={() => setActiveModal(null)}
        cart={cart}
        cartMetadata={cartMetadata}
        updateCart={updateCart}
        region={region}
        isProfessional={isProfessional}
        EXCHANGE_RATES={settings.exchangeRates}
        products={visibleProducts}
        shippingCosts={settings.shippingCosts}
        deliveryTimes={settings.deliveryTimes}
        selectedShipping={selectedShipping}
        setSelectedShipping={setSelectedShipping}
        protocolRequests={[]}
        removeProtocolRequest={removeProtocolBundle}
        cartOwnership={cartOwnership}
        onCheckout={() => {
          setActiveModal(null);
          setShowCheckout(true);
        }}
      />

      {/* ── Global Checkout Overlay (outside Routes so it works from any URL) ── */}
      {showCheckout && (
        <div style={{
          position: 'fixed', inset: 0,
          zIndex: 3000,
          backgroundColor: 'var(--background, #fff)',
          overflowY: 'auto',
        }}>
          <Checkout 
            cart={cart}
            cartMetadata={cartMetadata}
            region={region}
            isProfessional={isProfessional}
            EXCHANGE_RATES={settings.exchangeRates}
            detectedCountry={settings.detectedCountry}
            products={visibleProducts}
            shippingCosts={settings.shippingCosts}
            deliveryTimes={settings.deliveryTimes}
            cartOwnership={cartOwnership}
            onBack={() => setShowCheckout(false)}
            onComplete={() => {
              setCart({});
              setCartMetadata({});
              // Reset ownership back to logged-in patient defaults after order placed
              setCartOwnership(prev => ({
                ...prev,
                source: 'patient_selected',
                recommendationId: null,
                supervisingPhysicianId: prev.supervisingPhysicianId, // keep doctor link
              }));
            }}
          />
        </div>
      )}

      {/* BottomNav moved to optional MobileQuickNav guest section */}
      <BackToTop />

      {activeModal === 'compare' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}>
          <ProductComparator 
            compareList={compareList} 
            setCompareList={setCompareList} 
            onClose={() => setActiveModal(null)} 
          />
        </div>
      )}

      <SearchModal 
        isOpen={activeModal === 'search'} 
        onClose={() => { setActiveModal(null); setSearchQuery(''); setSearchInitialTab('peptides'); }} 
        onSelectProduct={handleProductSelect}
        products={visibleProducts}
        allFaqs={allFaqs}
        protocolIndex={protocolIndex}
        initialQuery={searchQuery}
        initialTab={searchInitialTab}
        isProfessional={isProfessional}
        supplementCatalogue={supplementCatalogue}
      />

      {!isPublicAuthRoute && (
        <AccessCatalogOverlay 
          region={region} 
          setRegion={(r) => {
            setRegion(r);
            setManualRegionChange(false);
          }}
          onOpenLogin={() => navigate('/login')}
          EXCHANGE_RATES={settings.exchangeRates}
          detectedCountry={settings.detectedCountry}
        />
      )}

      </div>
    </HeaderProvider>
  );
}

export default App;

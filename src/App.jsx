/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import AtlasHealthLogo from './components/brand/AtlasHealthLogo';
import AppErrorBoundary from './components/AppErrorBoundary';
import { resolveProductPrice } from './utils/resolveProductPrice';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams, Outlet } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import PageTransition from './components/PageTransition';
import Header from './layout/Header';
import { HelmetProvider } from 'react-helmet-async';
import Hero from './sections/Hero';
import Footer from './layout/Footer';
import BottomTabBar from './layout/BottomTabBar';
import RegionBar from './sections/RegionBar';
import BackToTop from './layout/BackToTop';
import SEO from './components/SEO';
import ExitProfessionalMode from './components/auth/ExitProfessionalMode';
import ClinicalAssistant from './components/shared/ClinicalAssistant';
import { trackPageView } from './hooks/useAnalytics';
import { Toaster } from 'react-hot-toast';

// --- Contexts ---
import ProtectedRoute from './components/auth/ProtectedRoute';
import { HeaderProvider } from './context/HeaderContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { useCart } from './context/CartProvider';
import { useShop } from './context/ShopProvider';
import { useUIStore } from './stores/uiStore';
// ── Lazy Loading Heavy Templates (Section 2: Performance) ────────────────────
const SearchModal = lazy(() => import('./snippets/SearchModal'));
const Cart = lazy(() => import('./snippets/Cart'));
const AccessCatalogOverlay = lazy(() => import('./layout/AccessCatalogOverlay'));
const ProductComparator = lazy(() => import('./components/discovery/ProductComparator'));

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
    <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, margin: 0 }}>Loading…</p>
    <div style={{ width: 100, height: 3, borderRadius: 99, background: 'rgba(0,54,102,0.08)', overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#003666,#00BCD4)', animation: 'atlas-shimmer 1.4s ease-in-out infinite' }} />
    </div>
    <style>{`
      @keyframes atlas-pulse { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
      @keyframes atlas-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
    `}</style>
  </div>
);

import { getCatalog } from './repositories/productRepository';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTenant } from './context/TenantContext';
import { useFirestoreData } from './hooks/useFirestoreData';
import { useCartOwnershipSync } from './hooks/useCartOwnershipSync';
import { useGlobalSettings } from './hooks/useGlobalSettings';
import { REGION_FLAGS } from './data/regions';

// Initial default settings (will be overridden by Firestore)

// ── Feature Flags ────────────────────────────────────────────────────────────
// Set to `true` to show the Region/Profile bar at the bottom of the page,
// or `false` to hide it globally. Toggle from here to manage visibility.
const SHOW_REGION_BAR = false;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantSlug } = useTenant();
  const { scrolled, setScrolled } = useUIStore();
  const { showCheckout, setShowCheckout } = useUIStore();
  const { manualRegionChange, setManualRegionChange } = useUIStore();
  const { searchQuery, setSearchQuery } = useUIStore();
  const { searchInitialTab, setSearchInitialTab } = useUIStore();
  const { activeModal, setActiveModal } = useUIStore();

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
    setScrolled(false);
    trackPageView(location.pathname + location.search, document.title || 'Regenpept');
  }, [location.pathname, location.search]);
  
  // Lifted global state with safety catch for Private modes
  const { region, setRegion, settings, setSettings, products, compareList, setCompareList } = useShop();
  const { cart, setCart, cartMetadata, setCartMetadata, cartOwnership, setCartOwnership, updateCart, removeProtocolBundle, cartBreakdown, cartCount } = useCart();
  
  const { isProfessional, isAdmin, isPhysician, isPatient, user, userProfile, loading: authLoading, activeRole } = useAuth();
  // allFaqs and protocolIndex: read-only, session-cached — no products fetch inside hook
  const { allFaqs, protocolIndex, supplementCatalogue } = useFirestoreData();
  useGlobalSettings();
  useCartOwnershipSync();
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
  const [pendingQuote, setPendingQuote] = useState(null);
  
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





  
  

  // ── Product catalog is now fetched by ShopProvider ────────────────────────


  
  
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



  
  
  const handleProtocolSupply = (bundle) => {
    setCartMetadata(prev => ({
      ...prev,
      protocolBundles: [...(prev.protocolBundles || []), bundle]
    }));
    setActiveModal('cart');
  };



  
  const isHome = location.pathname === '/' || ['/clinic', '/doctor', '/wholesaler', '/sales_agent', '/staff', '/patient'].includes(location.pathname);
  const isPortalRoute = /^\/(admin|doctor|patient|wholesaler|pharmacy-dashboard|staff|clinic)/.test(location.pathname);

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
      navigate('/patient');
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



  const routerProps = {
    location, navigate, tenantNavigate,
    handleCategorySelect, handleProductSelect, visibleProducts,
    setPendingQuote, allFaqs,
    isHome, pendingQuote,
  };

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
      <div className="app">
        <SEO />
        <Toaster position="bottom-right" />
        <AppRouter {...routerProps} />
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
          <Suspense fallback={null}>
            <ProductComparator 
              compareList={compareList} 
              setCompareList={setCompareList} 
              onClose={() => setActiveModal(null)} 
            />
          </Suspense>
        </div>
      )}

      <Suspense fallback={null}>
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
      </Suspense>

      {!isPublicAuthRoute && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {/* ── Mobile Navigation ── */}
      {!isPortalRoute && <BottomTabBar />}
      </div>
  );
}

export default App;

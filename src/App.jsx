import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Always-mounted layout components (eager — never lazy)
import Header from './layout/Header';
import SearchModal from './snippets/SearchModal';
import Footer from './layout/Footer';
import AccessCatalogOverlay from './layout/AccessCatalogOverlay';
import BottomNav from './layout/BottomNav';
import Cart from './snippets/Cart';

// Route-level templates — code-split, loaded on demand
const About             = lazy(() => import('./templates/About'));
const Contact           = lazy(() => import('./templates/Contact'));
const Quality           = lazy(() => import('./templates/Quality'));
const Catalog           = lazy(() => import('./templates/Catalog'));
const ProductDetail     = lazy(() => import('./templates/ProductDetail'));
const SuppliesView      = lazy(() => import('./templates/SuppliesView'));
const ObjectivesView    = lazy(() => import('./templates/ObjectivesView'));
const ObjectiveDetailView = lazy(() => import('./templates/ObjectiveDetailView'));
const CategoryDetailView  = lazy(() => import('./templates/CategoryDetailView'));
const HomeView          = lazy(() => import('./templates/HomeView'));
const Calculator        = lazy(() => import('./templates/Calculator'));
const CustomSynthesis   = lazy(() => import('./templates/CustomSynthesis'));
const FAQDiscoveryView  = lazy(() => import('./templates/FAQDiscoveryView'));
const AcademyView       = lazy(() => import('./templates/AcademyView'));
const CourseDetailView  = lazy(() => import('./templates/CourseDetailView'));
const AuthPage          = lazy(() => import('./templates/AuthPage'));
const Checkout          = lazy(() => import('./templates/Checkout'));
const AdminDashboard    = lazy(() => import('./templates/AdminDashboard'));
const DataToolsPage     = lazy(() => import('./admin/DataToolsPage'));
const UserDashboard     = lazy(() => import('./templates/UserDashboard'));
const LegalConditions   = lazy(() => import('./templates/LegalConditions'));
const UserSettings      = lazy(() => import('./templates/UserSettings'));

// New Architecture Templates (code-split)
const ProductTemplate    = lazy(() => import('./templates/ProductTemplate'));
const CollectionTemplate = lazy(() => import('./templates/CollectionTemplate'));
const ProtocolTemplate   = lazy(() => import('./templates/ProtocolTemplate'));
const FAQTemplate        = lazy(() => import('./templates/FAQTemplate'));
const SearchTemplate     = lazy(() => import('./templates/SearchTemplate'));
const ContactTemplate    = lazy(() => import('./templates/ContactTemplate'));
const CompareTemplate    = lazy(() => import('./templates/CompareTemplate'));
const ProtocolBuilder    = lazy(() => import('./templates/ProtocolBuilder'));
const ProtocolHistory    = lazy(() => import('./templates/ProtocolHistory'));
const ValidationDashboard = lazy(() => import('./templates/ValidationDashboard'));

import { db } from './firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useFirestoreData } from './hooks/useFirestoreData';
import { configService } from './services/configService';

import { clearScrollLocks } from './utils/scrollLock';

// Minimal fallback shown while a lazy route chunk is downloading
const RouteFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020e1c' }}>
    <div className="spinner" />
  </div>
);

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

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Pathway mapping (loaded from Firestore via configService, with local fallback)
  const [pathwayMapping, setPathwayMapping] = useState({
    'healing-repair': 'healing-recovery',
    'healing-amp-recovery': 'healing-recovery',
    'healing-recovery': 'healing-recovery',
    'metabolic-optimization': 'weight-management-metabolic',
    'weight-management-metabolic': 'weight-management-metabolic',
    'weight-management-amp-metabolic': 'weight-management-metabolic',
    'neuro-cognitive': 'cognitive-neuro-protection',
    'cognitive-neuro-protection': 'cognitive-neuro-protection',
    'cognitive-amp-neuro-protection': 'cognitive-neuro-protection',
    'longevity-vitality': 'anti-aging-longevity',
    'anti-aging-longevity': 'anti-aging-longevity',
    'anti-aging-amp-longevity': 'anti-aging-longevity',
    'somatic-research': 'muscle-growth-performance',
    'muscle-growth-performance': 'muscle-growth-performance',
    'muscle-growth-amp-performance': 'muscle-growth-performance',
    'hormonal-pathways': 'hormonal-support',
    'hormonal-support': 'hormonal-support',
  });

  useEffect(() => {
    configService.getPathwayMapping()
      .then(map => { if (map && Object.keys(map).length) setPathwayMapping(map); })
      .catch(() => {}); // silently fall back to the default above
  }, []);

  // Global Reset on Navigation
  useEffect(() => {
    // Force immediate scroll to top on every navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Clear any residual scroll locks (e.g., from a closed modal)
    clearScrollLocks();
  }, [location.pathname, location.search]);

  // Mount-time cleanup: flush any residual touchAction/overflow from old deployments
  useEffect(() => {
    clearScrollLocks();
  }, []);


  // Lifted global state with safety catch for Private modes
  const [region, setRegion] = useState(() => {
    try { return localStorage.getItem('mp_region') || null; }
    catch (e) { return null; }
  });

  // Tracks the exact country code the user picked (may differ from region key if mapped to 'row')
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
    try { return localStorage.getItem('mp_country_code') || localStorage.getItem('mp_region') || null; }
    catch (e) { return null; }
  });
  const { isProfessional, isAdmin, user, userProfile, loading: authLoading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        setLoadingTimeout(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [authLoading]);


  // ── Core catalog data (products + variants, FAQs, mappings, protocol index) ──
  const {
    products,
    setProducts,
    allFaqs,
    allMappings,
    protocolIndex,
    loadingProducts,
  } = useFirestoreData();

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('regenpept_cart');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (e) {
      return {};
    }
  });

  // Track metadata for items (e.g., if they were added via Protocol Builder)
  const [cartMetadata, setCartMetadata] = useState(() => {
    try {
      const savedMeta = localStorage.getItem('regenpept_cart_meta');
      return savedMeta ? JSON.parse(savedMeta) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('regenpept_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not save cart:", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('regenpept_cart_meta', JSON.stringify(cartMetadata));
    } catch (e) {
      console.warn("Could not save cart metadata:", e);
    }
  }, [cartMetadata]);
  const [isCartOpen, setIsCartOpenState] = useState(false);
  const setIsCartOpen = useCallback((val) => setIsCartOpenState(val), []);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Open the discovery modal, optionally pre-seeding a query from any entry point
  const openSearchWithQuery = (query = '') => {
    if (query) setSearchQuery(query);
    setIsSearchOpen(true);
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showCustomSynthesis, setShowCustomSynthesis] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showAcademy, setShowAcademy] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pendingQuote, setPendingQuote] = useState(null);
  const [initialCatalogCategory, setInitialCatalogCategory] = useState(null);
  const [manualRegionChange, setManualRegionChange] = useState(false);

  // Dynamic Settings
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    // Throttle scroll updates with requestAnimationFrame
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        rafId = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Admin Mobile Guard — also fire immediately on mount
    const handleResize = () => {
      if (window.innerWidth < 1024 && showAdmin) setShowAdmin(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [showAdmin]);

  useEffect(() => {
    try {
      if (region) localStorage.setItem('mp_region', region);
    } catch (e) {
      console.warn("Storage restricted:", e);
    }
  }, [region]);

  // Persist Cart
  // This useEffect is now replaced by the two separate useEffects for cart and cartMetadata
  // useEffect(() => {
  //   try {
  //     localStorage.setItem('mp_cart', JSON.stringify(cart));
  //   } catch (e) {
  //     console.warn("Could not save cart:", e);
  //   }
  // }, [cart]);

  // Keep a ref so the IP-detection effect can read latest exchange rates
  // without re-running every time Firestore updates settings
  const exchangeRatesRef = useRef(settings.exchangeRates);
  useEffect(() => { exchangeRatesRef.current = settings.exchangeRates; }, [settings.exchangeRates]);

  // IP-Based Detection
  useEffect(() => {
    if (!region && !manualRegionChange) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.country_name) {
            const countryName = data.country_name;
            const matchedRegion = Object.entries(exchangeRatesRef.current).find(
              ([key, val]) => val.name.toLowerCase() === countryName.toLowerCase()
            );
            if (matchedRegion) {
              setRegion(matchedRegion[0]);
            } else {
              setRegion('row');
            }
            setManualRegionChange(false);
            setSettings(prev => ({ ...prev, detectedCountry: countryName }));
          }
        })
        .catch(err => console.warn('IP detection failed:', err));
    }
  }, [region, manualRegionChange]); // exchangeRates read via ref — no re-fetch on Firestore updates

  // Clear cart when user logs in or out
  useEffect(() => {
    setCart({});
    setCartMetadata({});
  }, [user]);

  // ── Dynamic Settings Subscription (real-time: admin can update rates live) ──
  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const mappedRates = { ...DEFAULT_SETTINGS.exchangeRates };
        if (data.exchangeRates) {
          Object.entries(data.exchangeRates).forEach(([key, val]) => {
            if (mappedRates[key]) {
              mappedRates[key] = { ...mappedRates[key], rate: val };
            }
          });
        }
        setSettings({ ...DEFAULT_SETTINGS, ...data, exchangeRates: mappedRates });
      }
    }, (error) => {
      console.error('Firestore Settings Error:', error);
    });

    return () => unsubscribeSettings();
  }, []);

  const updateCart = (productOrName, delta, metadata = null) => {
    // Determine the unique key: "Name (Dosage)" or just "Name"
    const isObject = typeof productOrName === 'object' && productOrName !== null;
    const productName = isObject ? productOrName.name : productOrName;
    const dosage = isObject ? productOrName.dosage : null;
    const itemKey = dosage ? `${productName} (${dosage})` : productName;

    setCart(prev => {
      const currentQty = prev[itemKey] || 0;
      const newQty = currentQty + delta;



      if (newQty <= 0) {
        const { [itemKey]: _, ...rest } = prev;

        // Remove associated metadata if quantity drops to 0
        setCartMetadata(mPrev => {
          const { [itemKey]: _m, ...mRest } = mPrev;
          return mRest;
        });

        return rest;
      }

      // Stock Validation
      const product = products.find(p => `${p.name} (${p.dosage})` === itemKey || p.name === itemKey);
      if (product && delta > 0) {
        if (newQty > (product.stock || 0)) {
          alert(`Sorry, we only have ${product.stock} units of ${productName} in stock.`);
          return prev;
        }
      }

      // Enforce 20 units total limit (Only for Guests)
      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      const diff = delta;
      if (!isProfessional && (currentTotal + diff > 20)) {
        alert("For security and research compliance, individual guest inquiries are limited to 20 units total. Please log in to a Professional account or contact us for bulk institutional requirements.");
        return prev;
      }

      // If metadata is provided, save it
      if (metadata && delta > 0) {
        setCartMetadata(mPrev => ({ ...mPrev, [itemKey]: metadata }));
      }

      return { ...prev, [itemKey]: newQty };
    });
  };

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);
  const isHome = location.pathname === '/';

  // Memoised filtered product list — avoids 21 inline filter calls per render
  const activeProducts = useMemo(
    () => isAdmin ? products : products.filter(p => p.isActive !== false),
    [products, isAdmin]
  );

  const resetViews = () => {
    // Clear legacy state
    setSelectedProduct(null);
    setSelectedCategory(null);
    setShowCatalog(false);
    setShowObjectives(false);
    setShowCalculator(false);
    setShowFAQ(false);
    setShowAbout(false);
    setShowQuality(false);
    setShowContact(false);
    setShowCustomSynthesis(false);
    setShowCheckout(false);
    setShowAuth(false);
    setShowAdmin(false);
    setShowDashboard(false);
    setShowSettings(false);
    setShowLegal(false);
    setShowAcademy(false);
    setSelectedCourse(null);
    setSelectedObjective(null);
    setInitialCatalogCategory(null);
    setPendingQuote(null);
    setIsCartOpen(false);
    setIsSearchOpen(false);
  };

  const handleCategorySelect = (cat) => {
    // If it's a known multipage route, navigate
    if (cat === 'Home') {
      resetViews();
      navigate('/');
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
      navigate('/supplies');
      return;
    }

    if (cat === 'Academy') {
      navigate('/academy');
      return;
    }

    if (cat === 'About' || cat === 'Logistics') {
      navigate('/about');
      return;
    }

    if (cat === 'Quality') {
      navigate('/quality');
      return;
    }

    if (cat === 'Custom Synthesis') {
      navigate('/custom-synthesis');
      return;
    }

    if (cat === 'Login' || cat === 'Auth') {
      navigate('/login');
      return;
    }

    if (cat === 'Admin') {
      navigate('/admin');
      return;
    }

    if (cat === 'Dashboard') {
      navigate('/dashboard');
      return;
    }

    if (cat === 'Settings') {
      navigate('/settings');
      return;
    }

    if (cat === 'Legal') {
      navigate('/legal');
      return;
    }

    if (cat === 'Calculator') {
      navigate('/calculator');
      return;
    }

    if (cat === 'Protocol' || cat === 'Protocol Builder') {
      navigate('/protocol-builder');
      return;
    }

    // Collection Routing
    const normalizedCat = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

    // Mapping for Research Focus (Pathways) — loaded from configService
    if (pathwayMapping[normalizedCat]) {
      navigate(`/collection/${pathwayMapping[normalizedCat]}`);
    } else if (normalizedCat === 'investigational-pathways' || normalizedCat === 'investigation-pathways' || normalizedCat === 'objectives') {
      navigate('/collection/investigation-pathways');
    } else if (normalizedCat === 'peptides') {
      navigate('/collection/peptides');
    } else if (normalizedCat === 'faq') { // Extra safety
      navigate('/faq');
    } else {
      // For any other category, attempt to go to its specific collection page
      navigate(`/collection/${normalizedCat}`);
    }

    resetViews();

  };


  const handleObjectiveSelect = (obj) => {
    // Try to find a slug for the objective
    const slug = obj.toLowerCase().replace(/\s+/g, '-');
    navigate(`/protocol/${slug}`);
  };

  const handleProductSelect = (productOrName) => {
    let slug = '';
    if (typeof productOrName === 'object' && productOrName !== null) {
      slug = productOrName.slug || productOrName.id || productOrName.name.toLowerCase().replace(/\s+/g, '-');
    } else {
      const searchStr = productOrName.toLowerCase();
      const product = products.find(p =>
        p.name.toLowerCase() === searchStr ||
        p.id?.toLowerCase() === searchStr ||
        p.slug?.toLowerCase() === searchStr ||
        p.id?.toLowerCase().replace(/_/g, '-') === searchStr.replace(/_/g, '-') ||
        p.name.toLowerCase().replace(/\s+/g, '-') === searchStr.replace(/\s+/g, '-')
      );

      if (product) {
        slug = product.slug || product.id || product.name.toLowerCase().replace(/\s+/g, '-');
      } else {
        slug = productOrName.toLowerCase().replace(/\s+/g, '-');
      }
    }

    if (slug) {
      navigate(`/product/${slug}`);
      resetViews();
      window.scrollTo(0, 0);
    }
  };


  // Global Title Management (SEO)
  useEffect(() => {
    let title = "ReGen PEPT | Premium Research Peptides";
    if (selectedProduct) {
      title = `${selectedProduct.name} | Research Peptide | RegenPept`;
    } else if (selectedCategory) {
      title = `${selectedCategory} | Research Catalog | RegenPept`;
    } else if (showCatalog) {
      title = "Research Catalyst Catalog | RegenPept";
    } else if (showObjectives) {
      title = "Investigational Pathways | Research Focus | RegenPept";
    } else if (selectedObjective) {
      title = `${selectedObjective} | Investigational Pathway | RegenPept`;
    } else if (showFAQ) {
      title = "Research Knowledge Base & FAQ | RegenPept";
    } else if (showAbout) {
      title = "Global Logistics & Institutional Presence | RegenPept";
    } else if (showContact) {
      title = "Contact & Institutional Inquiry | RegenPept";
    } else if (showCustomSynthesis) {
      title = "Custom Peptide Synthesis | Institutional Solutions";
    } else if (showCheckout) {
      title = "Request Research Quotation | RegenPept";
    } else if (showLegal) {
      title = "Legal Conditions & Compliance | RegenPept";
    } else if (showAcademy || selectedCourse) {
      title = "Knowledge Academy | RegenPept";
    }
    document.title = title;
  }, [selectedProduct, selectedCategory, showCatalog, showObjectives, selectedObjective, showFAQ, showAbout, showContact, showCustomSynthesis, showAcademy, selectedCourse]);

  // NOTE: Per-page scroll-to-top is handled by each template/page component,
  // not globally here. A global scrollTo with selectedProduct in deps fired
  // after async product data loaded, resetting the user's scroll mid-page.


  // (dev-only render log removed for production performance)
  if (authLoading && !loadingTimeout) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#020e1c', color: 'white', fontFamily: 'var(--font-heading)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            RegenPept
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
      {!showCheckout && (
        <Header
          scrolled={scrolled}
          region={region}
          selectedCountryCode={selectedCountryCode}
          onOpenRegion={() => {
            setRegion(null);
            setManualRegionChange(true);
            try { localStorage.removeItem('mp_region'); } catch (e) { }
          }}
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          isHome={isHome}
          onGoHome={() => {
            resetViews();
            navigate('/');
          }}
          onSelectProduct={handleProductSelect}
          onSelectCategory={handleCategorySelect}
          products={activeProducts}
        />
      )}

      <div className={`view-container ${(!isHome && !showCheckout) ? 'with-header-padding' : ''}`}>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={
            <HomeView
              isProfessional={isProfessional}
              onSelectCategory={handleCategorySelect}
              onSelectProduct={handleProductSelect}
              products={activeProducts}
              onOpenSearch={openSearchWithQuery}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          } />

          <Route path="/catalog" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={
            <Catalog
              region={region}
              setRegion={setRegion}
              isProfessional={isProfessional}
              cart={cart}
              setCart={setCart}
              updateCart={updateCart}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              setPendingQuote={setPendingQuote}
              onSelectCategory={handleCategorySelect}
              onSelectProduct={handleProductSelect}
              onOpenSearch={() => setIsSearchOpen(true)}
              initialCategory={initialCatalogCategory}
              EXCHANGE_RATES={settings.exchangeRates}
              products={activeProducts}
            />
          } />

          <Route path="/product/:slug" element={
            <ProductTemplate
              region={region}
              isProfessional={isProfessional}
              isAdmin={isAdmin}
              cart={cart}
              onAddToCart={updateCart}
              products={activeProducts}
              allFaqs={allFaqs}
              allMappings={allMappings}
            />
          } />
          <Route path="/collection/:slug" element={
            <CollectionTemplate
              region={region}
              isProfessional={isProfessional}
              isAdmin={isAdmin}
              cart={cart}
              setCart={setCart}
              updateCart={updateCart}
              setRegion={setRegion}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              setPendingQuote={setPendingQuote}
              onOpenSearch={() => setIsSearchOpen(true)}
              EXCHANGE_RATES={settings.exchangeRates}
              products={activeProducts}
              allFaqs={allFaqs}
              allMappings={allMappings}
            />
          } />
          {/* Protocol Redirects */}
          <Route path="/protocol" element={<Navigate to="/protocol-builder" replace />} />
          <Route path="/protocol/" element={<Navigate to="/protocol-builder" replace />} />
          <Route path="/protocol/builder" element={<Navigate to="/protocol-builder" replace />} />

          <Route path="/protocol/:slug" element={
            <ProtocolTemplate
              region={region}
              isProfessional={isProfessional}
              cart={cart}
              updateCart={updateCart}
              setRegion={setRegion}
              products={activeProducts}
              allFaqs={allFaqs}
              allMappings={allMappings}
            />
          } />

          <Route path="/faq" element={<FAQTemplate />} />
          <Route path="/faq/:topic" element={<FAQTemplate />} />
          <Route path="/search" element={
            <SearchTemplate
              products={activeProducts}
              allFaqs={allFaqs}
              allMappings={allMappings}
              protocolIndex={protocolIndex}
            />
          } />
          <Route path="/contact" element={
            <ContactTemplate
              cart={cart}
              region={region}
              isProfessional={isProfessional}
              products={activeProducts}
              pendingQuote={pendingQuote}
              setPendingQuote={setPendingQuote}
            />
          } />
          <Route path="/compare/:slug1/:slug2" element={
            <CompareTemplate products={activeProducts} />
          } />

          <Route path="/protocol-builder" element={
            <ProtocolBuilder
              region={region}
              isProfessional={isProfessional}
              cart={cart}
              updateCart={updateCart}
              setCartMetadata={setCartMetadata}
              onOpenCart={() => setIsCartOpen(true)}
              products={activeProducts}
            />
          } />

          <Route path="/protocol-builder/history" element={<ProtocolHistory />} />

          {/* ---- Previously missing routes (broken after React Router migration) ---- */}
          <Route path="/about" element={<About onBack={() => navigate(-1)} />} />
          <Route path="/quality" element={<Quality onBack={() => navigate(-1)} />} />
          <Route path="/legal" element={<LegalConditions onBack={() => navigate(-1)} />} />
          <Route path="/supplies" element={
            <SuppliesView
              onBack={() => navigate(-1)}
              onSelectProduct={handleProductSelect}
              updateCart={updateCart}
              cart={cart}
              region={region}
              setRegion={setRegion}
              isProfessional={isProfessional}
              EXCHANGE_RATES={settings.exchangeRates}
              products={activeProducts}
            />
          } />
          <Route path="/custom-synthesis" element={
            <CustomSynthesis onBack={() => navigate(-1)} />
          } />
          <Route path="/dashboard" element={
            <UserDashboard onBack={() => navigate(-1)} />
          } />
          <Route path="/settings" element={
            <UserSettings onBack={() => navigate(-1)} />
          } />
          <Route path="/admin" element={
            <AdminDashboard onBack={() => navigate(-1)} />
          } />
          <Route path="/admin/data-tools" element={
            <DataToolsPage />
          } />
          <Route path="/admin/validation" element={
            <ValidationDashboard products={products} />
          } />
          <Route path="/login" element={
            <AuthPage onBack={() => navigate(-1)} />
          } />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/academy" element={
            <AcademyView onSelectCourse={(courseId) => navigate(`/academy/${courseId}`)} />
          } />
          <Route path="/academy/:courseId" element={
            <CourseDetailView onBack={() => '/academy'} />
          } />
          <Route path="/calculator" element={
            <Calculator onBack={() => navigate(-1)} />
          } />

          <Route path="*" element={
            <>
              {showCheckout ? (
                <Checkout
                  cart={cart}
                  region={region}
                  isProfessional={isProfessional}
                  EXCHANGE_RATES={settings.exchangeRates}
                  detectedCountry={settings.detectedCountry}
                  products={activeProducts}
                  onBack={() => setShowCheckout(false)}
                  onComplete={() => {
                    setCart({});
                    // Checkout has its own success view
                  }}
                />
              ) : selectedProduct ? (
                <ProductDetail
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                  region={region}
                  isProfessional={isProfessional}
                  isAdmin={isAdmin}
                  cart={cart}
                  onAddToCart={updateCart}
                  onSelectObjective={handleObjectiveSelect}
                  onSelectCategory={handleCategorySelect}
                  onSelectProduct={handleProductSelect}
                  products={activeProducts}
                  allFaqs={allFaqs}
                  allMappings={allMappings}
                />
              ) : selectedCategory === 'Research Supplies' ? (
                <SuppliesView
                  onBack={() => setSelectedCategory(null)}
                  onSelectProduct={handleProductSelect}
                  updateCart={updateCart}
                  cart={cart}
                  region={region}
                  setRegion={setRegion}
                  isProfessional={isProfessional}
                  EXCHANGE_RATES={settings.exchangeRates}
                  products={activeProducts}
                />
              ) : showCatalog ? (
                <Catalog
                  initialCategory={initialCatalogCategory}
                  region={region} setRegion={setRegion}
                  isProfessional={isProfessional}
                  cart={cart} setCart={setCart} updateCart={updateCart}
                  isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}
                  setPendingQuote={setPendingQuote}
                  EXCHANGE_RATES={settings.exchangeRates}
                  onOpenSearch={() => setIsSearchOpen(true)}
                  onSelectCategory={handleCategorySelect}
                  onSelectProduct={(name) => {
                    const product = products.find(p => p.name === name);
                    if (product) setSelectedProduct(product);
                    window.scrollTo(0, 0);
                  }}
                  products={activeProducts}
                />
              ) : selectedCategory ? (
                <CategoryDetailView
                  category={selectedCategory}
                  onBack={() => setSelectedCategory(null)}
                  onSelectProduct={(name) => {
                    const product = products.find(p => p.name === name);
                    if (product) {
                      setSelectedProduct(product);
                      setSelectedCategory(null);
                      window.scrollTo(0, 0);
                    }
                  }}
                  updateCart={updateCart}
                  cart={cart}
                  isProfessional={isProfessional}
                  region={region}
                  setRegion={setRegion}
                  EXCHANGE_RATES={settings.exchangeRates}
                  products={activeProducts}
                  allFaqs={allFaqs}
                  allMappings={allMappings}
                />
              ) : showObjectives ? (
                <ObjectivesView
                  onBack={() => setShowObjectives(false)}
                  onSelectObjective={(objectiveId) => {
                    setShowObjectives(false);
                    handleCategorySelect(objectiveId);
                  }}
                  region={region}
                  setRegion={setRegion}
                  isProfessional={isProfessional}
                  EXCHANGE_RATES={settings.exchangeRates}
                  products={activeProducts}
                />
              ) : selectedObjective ? (
                <ObjectiveDetailView
                  objectiveId={selectedObjective}
                  onBack={() => {
                    setSelectedObjective(null);
                    setShowObjectives(true);
                  }}
                  onSelectProduct={handleProductSelect}
                  isProfessional={isProfessional}
                  products={activeProducts}
                  allFaqs={allFaqs}
                  allMappings={allMappings}
                />
              ) : showCustomSynthesis ? (
                <CustomSynthesis onBack={() => setShowCustomSynthesis(false)} />
              ) : showCalculator ? (
                <Calculator onBack={() => setShowCalculator(false)} />
              ) : showFAQ ? (
                <FAQDiscoveryView
                  onBack={() => setShowFAQ(false)}
                  onSelectProduct={handleProductSelect}
                  products={activeProducts}
                />
              ) : showAbout ? (
                <About onBack={() => setShowAbout(false)} />
              ) : showQuality ? (
                <Quality onBack={() => setShowQuality(false)} />
              ) : showAuth ? (
                <AuthPage onBack={() => setShowAuth(false)} />
              ) : showAdmin ? (
                <AdminDashboard onBack={() => setShowAdmin(false)} />
              ) : showDashboard ? (
                <UserDashboard onBack={() => setShowDashboard(false)} />
              ) : showSettings ? (
                <UserSettings onBack={() => setShowSettings(false)} />
              ) : showLegal ? (
                <LegalConditions onBack={() => setShowLegal(false)} />
              ) : showContact ? (
                <Contact
                  onBack={() => setShowContact(false)}
                  pendingQuote={pendingQuote}
                  setPendingQuote={setPendingQuote}
                  cart={cart}
                  region={region}
                  isProfessional={isProfessional}
                  products={activeProducts}
                />
              ) : showAcademy ? (
                <AcademyView onSelectCourse={(courseId) => {
                  setShowAcademy(false);
                  setSelectedCourse(courseId);
                }} />
              ) : selectedCourse ? (
                <CourseDetailView onBack={() => {
                  setSelectedCourse(null);
                  setShowAcademy(true);
                }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <h2 style={{ color: 'var(--primary)' }}>404 - Page Not Found</h2>
                  <p style={{ color: 'var(--text-muted)' }}>The page you are looking for does not exist or has been moved.</p>
                  <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Return Home</button>
                </div>
              )}
            </>
          } />
        </Routes>
        </Suspense>
      </div>





      {isHome && <Footer />}

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartMetadata={cartMetadata}
        updateCart={updateCart}
        region={region}
        isProfessional={isProfessional}
        EXCHANGE_RATES={settings.exchangeRates}
        products={activeProducts}
        onCheckout={() => {
          setIsCartOpen(false);
          setShowCheckout(true);
        }}
      />

      {!showCheckout && !location.pathname.startsWith('/protocol-builder') && (
        <BottomNav
          onGoHome={() => { resetViews(); navigate('/'); }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenProducts={() => navigate('/collection/peptides')}
          cartCount={cartCount}
        />
      )}


      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        onSelectProduct={(p) => {
          setIsSearchOpen(false);
          handleProductSelect(p);
        }}
        products={products}
        allFaqs={allFaqs}
        allMappings={allMappings}
        protocolIndex={protocolIndex}
        initialQuery={searchQuery}
        onQueryChange={setSearchQuery}
      />

      <AccessCatalogOverlay
        region={region}
        setRegion={(r) => {
          setRegion(r);
          setManualRegionChange(false);
          // Sync the specific country the user picked (not just the region bucket)
          try {
            const countryCode = localStorage.getItem('mp_country_code') || r;
            setSelectedCountryCode(countryCode);
          } catch (e) { }
        }}
        onOpenLogin={() => setShowAuth(true)}
        EXCHANGE_RATES={settings.exchangeRates}
        detectedCountry={settings.detectedCountry}
      />

    </div>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;

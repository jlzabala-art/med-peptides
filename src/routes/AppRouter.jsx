import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';

// Import Layouts & Auth
import ProtectedRoute from '../components/auth/ProtectedRoute';
import GlobalAppLayout from '../components/shared/GlobalAppLayout';
import ShopLayout from '../layout/ShopLayout';
import AdminLayout from '../layout/AdminLayout';
import ClinicalLayout from '../layout/ClinicalLayout';
import PageTransition from '../components/PageTransition';
import AppErrorBoundary from '../components/AppErrorBoundary';
import AtlasHealthLogo from '../components/brand/AtlasHealthLogo';
import { AdminProvider } from '../context/AdminProvider';
import { DoctorProvider } from '../context/DoctorProvider';

// Lazy Templates
const HomeView = lazy(() => import('../templates/HomeView'));
const About = lazy(() => import('../templates/About'));
const Quality = lazy(() => import('../templates/Quality'));
const Contact = lazy(() => import('../templates/Contact'));
const ProductDetail = lazy(() => import('../templates/ProductDetail'));
const SuppliesView = lazy(() => import('../templates/SuppliesView'));
const ObjectivesView = lazy(() => import('../templates/ObjectivesView'));
const ObjectiveDetailView = lazy(() => import('../templates/ObjectiveDetailView'));
const Calculator = lazy(() => import('../templates/Calculator'));
const CustomSynthesis = lazy(() => import('../templates/CustomSynthesis'));
const FAQDiscoveryView = lazy(() => import('../templates/FAQDiscoveryView'));
const AcademyView = lazy(() => import('../templates/AcademyView'));
const CourseDetailView = lazy(() => import('../templates/CourseDetailView'));
const AuthPage = lazy(() => import('../templates/AuthPage'));
const AdminRoutes = lazy(() => import('./AdminRoutes'));
const UserDashboard = lazy(() => import('../templates/UserDashboard'));
const AccountManagerDashboard = lazy(() => import('../templates/AccountManagerDashboard'));
const DoctorRoutes = lazy(() => import('./DoctorRoutes'));
const WholesalerRoutes = lazy(() => import('./WholesalerRoutes'));
const SupplierRoutes = lazy(() => import('./SupplierRoutes'));
const PublicCatalogView = lazy(() => import('../templates/PublicCatalogView'));
const CatalogEmailTracker = lazy(() => import('../templates/CatalogEmailTracker'));
const ClinicRoutes = lazy(() => import('./ClinicRoutes'));
const PharmacyRoutes = lazy(() => import('./PharmacyRoutes'));
const PublicSupplierQuote = lazy(() => import('../components/public/PublicSupplierQuote'));
const PublicClientQuote = lazy(() => import('../components/public/PublicClientQuote'));
const PatientRoutes = lazy(() => import('./PatientRoutes'));
const DoctorPatients = lazy(() => import('../templates/DoctorPatients'));
const DoctorAppointments = lazy(() => import('../templates/DoctorAppointments'));
const DoctorLabResults = lazy(() => import('../templates/DoctorLabResults'));
const DoctorResearch = lazy(() => import('../templates/DoctorResearch'));
const DoctorProfile = lazy(() => import('../templates/DoctorProfile'));
const HormonePelletsPage = lazy(() => import('../pages/pellets.jsx'));
const PatientDetailAdmin = lazy(() => import('../templates/PatientDetailAdmin'));
const CalendarPage = lazy(() => import('../components/calendar/CalendarPage'));
const LegalConditions = lazy(() => import('../templates/LegalConditions'));
const TermsOfUse = lazy(() => import('../templates/TermsOfUse'));
const UserSettings = lazy(() => import('../templates/UserSettings'));
const ProductTemplate = lazy(() => import('../templates/ProductTemplate'));
const CollectionTemplate = lazy(() => import('../templates/CollectionTemplate'));
const ProtocolTemplate = lazy(() => import('../templates/ProtocolTemplate'));
const FAQTemplate = lazy(() => import('../templates/FAQTemplate'));
const ResearchStudyTemplate = lazy(() => import('../templates/ResearchStudyTemplate'));
const BlogPage = lazy(() => import('../templates/BlogPage'));
const BlogPostPage = lazy(() => import('../templates/BlogPostPage'));
const SearchTemplate = lazy(() => import('../templates/SearchTemplate'));
const ContactTemplate = lazy(() => import('../templates/ContactTemplate'));
const CompareTemplate = lazy(() => import('../templates/CompareTemplate'));
const CompoundComparator = lazy(() => import('../templates/CompoundComparator'));
const PrivacyPolicy = lazy(() => import('../templates/PrivacyPolicy'));
const WhatArePeptides = lazy(() => import('../templates/WhatArePeptides'));
const WhatAreProtocolsPage = lazy(() => import('../templates/WhatAreProtocolsPage'));
const ReconstitutionGuide = lazy(() => import('../templates/ReconstitutionGuide'));
const Checkout = lazy(() => import('../templates/Checkout'));
const SupplementDetailPage = lazy(() => import('../templates/SupplementDetailPage'));
const TestingDetailPage = lazy(() => import('../templates/TestingDetailPage'));
const APIDashboard = lazy(() => import('../templates/APIDashboard'));
const ExitProfessionalMode = lazy(() => import('../components/auth/ExitProfessionalMode'));
const ProtocolFinderRedirect = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('nav:apiDashboard'));
    navigate('/', { replace: true });
  }, [navigate]);
  return null;
};
const ObjectiveDetailRouteWrapper = ({ isProfessional, visibleProducts, allFaqs, onSelectProduct, tenantNavigate }) => {
  const { objectiveId } = useParams();
  
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
      onBack={() => tenantNavigate('/objectives')}
      onSelectProduct={onSelectProduct}
      isProfessional={isProfessional}
      products={visibleProducts}
      allFaqs={allFaqs}
    />
  );
};

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
  </div>
);

export default function AppRouter(props) {
  const {
    location, navigate, tenantNavigate, activeRole, isProfessional, isAdmin, userProfile,
    handleCategorySelect, handleProductSelect, visibleProducts, searchQuery, setSearchQuery,
    setSearchInitialTab, setActiveModal, activeModal, region, setRegion, cart, setCart, updateCart,
    toggleCompare, compareList, setPendingQuote, settings, allFaqs, scrolled, setManualRegionChange,
    cartCount, isHome, pendingQuote,
  } = props;

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
          tenantNavigate={tenantNavigate}
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

  return (
    <PageTransition locationKey={location.pathname}>
      <Suspense fallback={<ClinicalLoader />}>
        <Routes>
          <Route path="/login" element={<AuthPage onBack={() => window.history.back()} />} />
          <Route path="/session-ended" element={<ExitProfessionalMode onBack={() => navigate('/')} onLogin={() => navigate('/login')} />} />
          <Route path="/supplier-quote/:id" element={<PublicSupplierQuote />} />
          <Route path="/client-quote/:id" element={<PublicClientQuote />} />

          <Route element={
            <ShopLayout 
              scrolled={scrolled} 
              region={region}
              onOpenRegion={() => {
                setRegion(null);
                setManualRegionChange(true);
                try { localStorage.removeItem('mp_region'); } catch (err) {}
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

          <Route path="/partner/:tenantSlug" element={
            <ShopLayout 
              scrolled={scrolled} 
              region={region}
              onOpenRegion={() => {
                setRegion(null);
                setManualRegionChange(true);
                try { localStorage.removeItem('mp_region'); } catch (err) {}
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

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminProvider><AdminLayout /></AdminProvider>}>
              <Route path="/admin/*"            element={<AdminRoutes />} />
              <Route path="/admin/patient/:id"  element={<PatientDetailAdmin />} />
            </Route>
          </Route>

          <Route element={
            <ShopLayout 
              scrolled={scrolled} 
              region={region}
              onOpenRegion={() => {
                setRegion(null);
                setManualRegionChange(true);
                try { localStorage.removeItem('mp_region'); } catch (err) {}
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

          <Route path="/partner/:tenantSlug" element={
            <ShopLayout 
              scrolled={scrolled} 
              region={region}
              onOpenRegion={() => {
                setRegion(null);
                setManualRegionChange(true);
                try { localStorage.removeItem('mp_region'); } catch (err) {}
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
          
          <Route element={<ProtectedRoute allowedRoles={['professional', 'patient', 'doctor', 'admin']} />}>
            <Route element={<DoctorProvider><Outlet /></DoctorProvider>}>
              <Route path="/doctor/*" element={<DoctorRoutes />} />
              <Route path="/doctor-dashboard/*" element={<DoctorRoutes />} />
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
            <Route path="/patient/*" element={<PatientRoutes />} />
          </Route>
          
          <Route element={
            <GlobalAppLayout 
              cartCount={cartCount}
              onOpenCart={() => setActiveModal('cart')}
            />
          }>
            <Route element={<ProtectedRoute allowedRoles={['professional', 'patient', 'doctor', 'admin']} />}>
              <Route path="/paciente" element={<UserDashboard onOpenCart={() => setActiveModal('cart')} />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/account/supervisor" element={<UserDashboard onOpenCart={() => setActiveModal('cart')} />} />
            </Route>
          </Route>
          
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
          
          <Route element={
            <ShopLayout 
              scrolled={scrolled} 
              region={region}
              onOpenRegion={() => {
                setRegion(null);
                setManualRegionChange(true);
                try { localStorage.removeItem('mp_region'); } catch (err) {}
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
        </Routes>
      </Suspense>
    </PageTransition>
  );
}

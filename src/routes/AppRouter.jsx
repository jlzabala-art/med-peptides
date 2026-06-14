import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';

// Import Layouts & Auth
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ExitProfessionalMode from '../components/auth/ExitProfessionalMode';
import PageTransition from '../components/PageTransition';
import AppErrorBoundary from '../components/AppErrorBoundary';
import AtlasHealthLogo from '../components/brand/AtlasHealthLogo';
import { useUIStore } from '../stores/uiStore';
import { useShop } from '../context/ShopProvider';
import { useCart } from '../context/CartProvider';
import { useAuth } from '../context/AuthContext';

// Lazy Templates & Layouts
const GlobalAppLayout = lazy(() => import('../components/shared/GlobalAppLayout'));
const ShopLayout = lazy(() => import('../layout/ShopLayout'));
const AdminLayout = lazy(() => import('../layout/AdminLayout'));
const ClinicalLayout = lazy(() => import('../layout/ClinicalLayout'));
const AdminProvider = lazy(() => import('../context/AdminProvider').then(module => ({ default: module.AdminProvider })));
const DoctorProvider = lazy(() => import('../context/DoctorProvider').then(module => ({ default: module.DoctorProvider })));

import ShopRoutes from './ShopRoutes';
import AuthPage from '../templates/AuthPage';
const AdminRoutes = lazy(() => import('./AdminRoutes'));
const UserDashboard = lazy(() => import('../templates/UserDashboard'));
const UserSettings = lazy(() => import('../templates/UserSettings'));
const Checkout = lazy(() => import('../templates/Checkout'));
const ImpersonateCallback = lazy(() => import('../pages/ImpersonateCallback'));
const AccountManagerDashboard = lazy(() => import('../templates/AccountManagerDashboard'));
const DoctorRoutes = lazy(() => import('./DoctorRoutes'));
const WholesalerRoutes = lazy(() => import('./WholesalerRoutes'));
const SupplierRoutes = lazy(() => import('./SupplierRoutes'));
const PublicCatalogView = lazy(() => import('../templates/PublicCatalogView'));
const CatalogEmailTracker = lazy(() => import('../templates/CatalogEmailTracker'));
const ClinicRoutes = lazy(() => import('./ClinicRoutes'));
const PharmacyRoutes = lazy(() => import('./PharmacyRoutes'));
const PublicSupplierQuote = lazy(() => import('../components/public/PublicSupplierQuote'));
const B2BSupplierPOView = lazy(() => import('../components/b2b/B2BSupplierPOView'));
const PublicClientQuote = lazy(() => import('../components/public/PublicClientQuote'));
const B2BClientQuoteView = lazy(() => import('../components/b2b/B2BClientQuoteView'));
const PatientRoutes = lazy(() => import('./PatientRoutes'));
const HormonePelletsPage = lazy(() => import('../pages/pellets.jsx'));
const PatientDetailAdmin = lazy(() => import('../templates/PatientDetailAdmin'));
const CalendarPage = lazy(() => import('../components/calendar/CalendarPage'));
// ObjectiveDetailRouteWrapper moved to ShopRoutes.jsx
// ProtocolFinderRedirect moved to ShopRoutes.jsx

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
  </div>
);

export default function AppRouter(props) {
  const {
    location, navigate, tenantNavigate, 
    handleCategorySelect, handleProductSelect, visibleProducts, 
    setPendingQuote, allFaqs, 
    isHome, pendingQuote,
  } = props;

  const { searchQuery, setSearchQuery, searchInitialTab, setSearchInitialTab, activeModal, setActiveModal, scrolled, setManualRegionChange } = useUIStore();
  const { region, setRegion, settings, compareList, setCompareList } = useShop();
  const { cart, setCart, updateCart, cartCount } = useCart();
  const { activeRole, isProfessional, isAdmin, userProfile } = useAuth();

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) {
        alert("You can only compare up to 3 products at a time.");
        return prev;
      }
      return [...prev, product];
    });
  };



  return (
    <Suspense fallback={<ClinicalLoader />}>
      <Routes>
          <Route path="/login" element={<AuthPage onBack={() => window.history.back()} />} />
          <Route path="/session-ended" element={<ExitProfessionalMode onBack={() => navigate('/')} onLogin={() => navigate('/login')} />} />
          <Route path="/supplier-quote/:id" element={<PublicSupplierQuote />} />
          <Route path="/b2b-po/:poId" element={<B2BSupplierPOView />} />
          <Route path="/client-quote/:id" element={<PublicClientQuote />} />
          <Route path="/b2b-quote/:quoteId" element={<B2BClientQuoteView />} />

          <Route path="/*" element={
            <ShopLayout 
              onGoHome={() => {
                tenantNavigate('/');
              }}
              onSelectProduct={handleProductSelect}
              onSelectCategory={handleCategorySelect}
              products={visibleProducts}
            />
          }>
            <Route path="*" element={
              <ShopRoutes 
                isPartner={false}
                handleCategorySelect={handleCategorySelect}
                handleProductSelect={handleProductSelect}
                visibleProducts={visibleProducts}
                pendingQuote={pendingQuote}
                setPendingQuote={setPendingQuote}
                allFaqs={allFaqs}
                tenantNavigate={tenantNavigate}
              />
            } />
          </Route>

          <Route path="/partner/:tenantSlug/*" element={
            <ShopLayout 
              onGoHome={() => {
                tenantNavigate('/');
              }}
              onSelectProduct={handleProductSelect}
              onSelectCategory={handleCategorySelect}
              products={visibleProducts}
            />
          }>
            <Route path="*" element={
              <ShopRoutes 
                isPartner={true}
                handleCategorySelect={handleCategorySelect}
                handleProductSelect={handleProductSelect}
                visibleProducts={visibleProducts}
                pendingQuote={pendingQuote}
                setPendingQuote={setPendingQuote}
                allFaqs={allFaqs}
                tenantNavigate={tenantNavigate}
              />
            } />
          </Route>

          <Route path="/impersonate" element={
            <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', padding: '5rem'}}>Loading secure session...</div>}>
              <ImpersonateCallback />
            </Suspense>
          } />

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminProvider><AdminLayout /></AdminProvider>}>
              <Route path="/admin/*"            element={<AdminRoutes />} />
              <Route path="/admin/patient/:id"  element={<PatientDetailAdmin />} />
            </Route>
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
              <Route path="/patient" element={<UserDashboard onOpenCart={() => setActiveModal('cart')} />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/account/supervisor" element={<UserDashboard onOpenCart={() => setActiveModal('cart')} />} />
            </Route>
          </Route>
          

          
          <Route path="/wholesaler/*" element={activeRole === 'wholesaler' || activeRole === 'admin' ? <WholesalerRoutes /> : <Navigate to="/patient" replace />} />
          <Route path="/wholeseller/*" element={<Navigate to="/wholesaler" replace />} />
          <Route path="/catalog/:catalogSlug" element={<PublicCatalogView />} />
          <Route path="/partner/:tenantSlug/catalog/:catalogSlug" element={<PublicCatalogView />} />
          <Route path="/catalog/track/:eventId" element={<CatalogEmailTracker />} />
          <Route path="/clinic-dashboard/*" element={activeRole === 'clinic' || activeRole === 'admin' ? <ClinicRoutes /> : <Navigate to="/patient" replace />} />
          <Route path="/pharmacy-dashboard/*" element={activeRole === 'compounding_pharmacy' || activeRole === 'admin' ? <PharmacyRoutes /> : <Navigate to="/patient" replace />} />
          <Route path="/supplier-dashboard/*" element={activeRole === 'supplier' || activeRole === 'admin' ? <SupplierRoutes /> : <Navigate to="/patient" replace />} />
          

      </Routes>
    </Suspense>
  );
}

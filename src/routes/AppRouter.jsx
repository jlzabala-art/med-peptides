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
import { useUIStore } from '../stores/uiStore';
import { useShop } from '../context/ShopProvider';
import { useCart } from '../context/CartProvider';
import { useAuth } from '../context/AuthContext';

// Lazy Templates
import ShopRoutes from './ShopRoutes';
import AuthPage from '../templates/AuthPage';
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
    <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, margin: 0 }}>Cargando…</p>
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
    <PageTransition locationKey={location.pathname}>
      <Suspense fallback={<ClinicalLoader />}>
        <Routes>
          <Route path="/login" element={<AuthPage onBack={() => window.history.back()} />} />
          <Route path="/session-ended" element={<ExitProfessionalMode onBack={() => navigate('/')} onLogin={() => navigate('/login')} />} />
          <Route path="/supplier-quote/:id" element={<PublicSupplierQuote />} />
          <Route path="/client-quote/:id" element={<PublicClientQuote />} />

          <Route path="/*" element={
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
          

        </Routes>
      </Suspense>
    </PageTransition>
  );
}

import React, { lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useShop } from '../context/ShopProvider';
import { useCart } from '../context/CartProvider';
import { useAuth } from '../context/AuthContext';

// Lazy Templates
const HomeView = lazy(() => import('../templates/HomeView'));
const About = lazy(() => import('../templates/About'));
const Quality = lazy(() => import('../templates/Quality'));
const ContactTemplate = lazy(() => import('../templates/ContactTemplate'));
const ProductTemplate = lazy(() => import('../templates/ProductTemplate'));
const CollectionTemplate = lazy(() => import('../templates/CollectionTemplate'));
const ProtocolTemplate = lazy(() => import('../templates/ProtocolTemplate'));
const FAQTemplate = lazy(() => import('../templates/FAQTemplate'));
const ResearchStudyTemplate = lazy(() => import('../templates/ResearchStudyTemplate'));
const BlogPage = lazy(() => import('../templates/BlogPage'));
const BlogPostPage = lazy(() => import('../templates/BlogPostPage'));
const SearchTemplate = lazy(() => import('../templates/SearchTemplate'));
const CompareTemplate = lazy(() => import('../templates/CompareTemplate'));
const CompoundComparator = lazy(() => import('../templates/CompoundComparator'));
const PrivacyPolicy = lazy(() => import('../templates/PrivacyPolicy'));
const LegalConditions = lazy(() => import('../templates/LegalConditions'));
const TermsOfUse = lazy(() => import('../templates/TermsOfUse'));
const WhatArePeptides = lazy(() => import('../templates/WhatArePeptides'));
const WhatAreProtocolsPage = lazy(() => import('../templates/WhatAreProtocolsPage'));
const ReconstitutionGuide = lazy(() => import('../templates/ReconstitutionGuide'));
const Calculator = lazy(() => import('../templates/Calculator'));
const HormonePelletsPage = lazy(() => import('../pages/pellets.jsx'));
const SupplementDetailPage = lazy(() => import('../templates/SupplementDetailPage'));
const TestingDetailPage = lazy(() => import('../templates/TestingDetailPage'));
const AcademyView = lazy(() => import('../templates/AcademyView'));
const CourseDetailView = lazy(() => import('../templates/CourseDetailView'));
const FAQDiscoveryView = lazy(() => import('../templates/FAQDiscoveryView'));
const CustomSynthesis = lazy(() => import('../templates/CustomSynthesis'));
const APIDashboard = lazy(() => import('../templates/APIDashboard'));
const ObjectivesView = lazy(() => import('../templates/ObjectivesView'));
const ObjectiveDetailView = lazy(() => import('../templates/ObjectiveDetailView'));
const UserSettings = lazy(() => import('../templates/UserSettings'));

const ProtocolFinderRedirect = () => {
  const navigate = require('react-router-dom').useNavigate();
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

export default function ShopRoutes({
  isPartner = false,
  handleCategorySelect,
  handleProductSelect,
  visibleProducts,
  pendingQuote,
  setPendingQuote,
  allFaqs,
  tenantNavigate
}) {
  const { searchQuery, setSearchQuery, setSearchInitialTab, setActiveModal, activeModal } = useUIStore();
  const { region, setRegion, settings, compareList, setCompareList } = useShop();
  const { cart, setCart, updateCart } = useCart();
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
    <Routes>
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
          EXCHANGE_RATES={settings?.exchangeRates || {}}
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
      <Route path="search" element={<SearchTemplate products={visibleProducts} />} />
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
      <Route path="compare/:slug1/:slug2" element={<CompareTemplate products={visibleProducts} />} />
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
      
      {/* Continued Routes */}
      <Route path="academy" element={<AcademyView onSelectCourse={(courseId) => tenantNavigate(`/academy/${courseId}`)} />} />
      <Route path="academy/:courseId" element={<CourseDetailView onBack={() => tenantNavigate('/academy')} />} />
      <Route path="faqs" element={<FAQDiscoveryView onBack={() => tenantNavigate('/')} products={visibleProducts} />} />
      <Route path="quality" element={<Quality onBack={() => window.history.back()} />} />
      <Route path="custom-synthesis" element={<CustomSynthesis onBack={() => window.history.back()} />} />
      <Route path="api-dashboard" element={<APIDashboard onBack={() => window.history.back()} isProfessional={isProfessional} />} />
      <Route path="objectives" element={
        <ObjectivesView 
          onBack={() => window.history.back()}
          region={region}
          setRegion={setRegion}
          isProfessional={isProfessional}
          EXCHANGE_RATES={settings?.exchangeRates || {}}
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
      <Route path="settings" element={<UserSettings onBack={() => tenantNavigate('/patient')} />} />
      
      {/* Fallbacks */}
      <Route path="orders" element={<Navigate to="../patient" replace />} />
      <Route path="orders/history" element={<Navigate to="../patient" replace />} />
      <Route path="saved" element={<Navigate to="../patient" replace />} />
      <Route path="saved/protocols" element={<Navigate to="../patient" replace />} />
      <Route path="saved/products" element={<Navigate to="../patient" replace />} />
      <Route path="my-protocols" element={<Navigate to="../patient" replace />} />

      {isPartner && <Route path="*" element={<Navigate to="" replace />} />}
    </Routes>
  );
}

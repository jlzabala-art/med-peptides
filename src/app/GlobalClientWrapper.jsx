"use client";

import React, { Suspense } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Cart from '../snippets/Cart';
import ClinicalAssistant from '../components/shared/ClinicalAssistant';
import BackToTop from '../layout/BackToTop';
import BottomTabBar from '../layout/BottomTabBar';
import SearchModal from '../snippets/SearchModal';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../stores/uiStore';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import AppErrorBoundary from '../components/AppErrorBoundary';
import PWAInstallPrompt from '../components/mobile/PWAInstallPrompt';
import AtlasAIDrawer from '../components/shared/AtlasAIDrawer';
import { useFirestoreData } from '../hooks/useFirestoreData';

// Routes that have their own dashboard/portal layout or are standalone public views — B2C shell must be hidden
const PORTAL_PREFIXES = ['/admin', '/doctor', '/patient', '/clinic', '/supplier', '/wholesaler', '/pharmacy', '/login', '/session-ended', '/shared', '/quotation'];

export default function GlobalClientWrapper({ children }) {
  const { isProfessional, activeRole } = useAuth();
  const { activeModal, setActiveModal, searchQuery, setSearchQuery, setSearchInitialTab } = useUIStore();
  const { catalogue: products, protocols, supplements } = useFirestoreData();
  const router = useRouter();
  const pathname = usePathname();

  const isPortalRoute = PORTAL_PREFIXES.some((prefix) => pathname?.startsWith(prefix));


  // Basic routing handlers since the original Header needed them
  const handleCategorySelect = (cat) => {
    if (cat === 'Home') return router.push(activeRole === 'admin' ? '/admin' : '/');
    if (cat === 'Peptides' || cat === 'Products') return router.push('/collection/peptides');
    if (cat === 'FAQ') return router.push('/faq');
    if (cat === 'Contact' || cat === 'Partner') return router.push('/contact');
    if (cat === 'Supplies') return router.push('/collection/supplies');
    if (cat === 'Academy') return router.push('/academy');
    
    const focusAreaMap = {
      'Recovery & Repair': '/collection/protocols?goal=Recovery & Repair',
      'Metabolic & Weight': '/collection/protocols?goal=Metabolic & Weight',
      'Longevity & Anti-Aging': '/collection/protocols?goal=Longevity & Anti-Aging',
      'Cognitive & Mood': '/collection/protocols?goal=Cognitive & Mood',
      'Sleep & Circadian': '/collection/protocols?goal=Sleep & Circadian',
      'Hormonal Optimization': '/collection/protocols?goal=Hormonal Optimization',
      'Immune Support': '/collection/protocols?goal=Immune Support',
    };

    if (focusAreaMap[cat]) return router.push(focusAreaMap[cat]);
    if (cat === 'Research Pathways' || cat === 'Objectives') return router.push('/objectives');
    if (cat === 'Calculator') return router.push('/calculator');
    if (cat === 'About' || cat === 'Logistics') return router.push('/about');
    if (cat === 'Quality') return router.push('/quality');
    if (cat === 'Custom Synthesis') {
      if (isProfessional) router.push('/custom-synthesis');
      return;
    }
    if (cat === 'API Materials' || cat === 'API Dashboard' || cat === 'Wholesale') return router.push('/api-dashboard');
    if (cat === 'Login' || cat === 'Auth') return router.push('/login');
    if (cat === 'Admin' && window.innerWidth >= 1024) return router.push('/admin');
    if (cat === 'Dashboard') return router.push('/patient');
    if (cat === 'Settings') return router.push('/settings');
    if (cat === 'Legal') return router.push('/legal');

    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    router.push(`/collection/${slug}`);
  };

  // Portal routes have their own layout — just render children
  if (isPortalRoute) {
    return (
      <AppErrorBoundary>
        <Toaster containerStyle={{ zIndex: 99999 }} />
        {children}
        <PWAInstallPrompt />
      </AppErrorBoundary>
    );
  }

  return (
    <AppErrorBoundary>
      <Header 
        onSelectCategory={handleCategorySelect}
        onOpenSearch={(q, tab) => {
          if (q !== undefined) setSearchQuery(q);
          if (tab) setSearchInitialTab(tab);
          setActiveModal('search');
        }}
        onOpenCart={() => setActiveModal('cart')}
      />
      
      <main>
        {children}
      </main>

      {pathname === '/' && <Footer />}
      <Cart />
      <ClinicalAssistant />
      <BackToTop />
      <BottomTabBar />
      <AtlasAIDrawer 
        isOpen={activeModal === 'ai'} 
        onClose={() => setActiveModal(null)} 
      />
      
      {activeModal === 'search' && (
        <Suspense fallback={null}>
          <SearchModal 
            isOpen={true}
            initialQuery={searchQuery}
            products={products || []}
            protocolIndex={protocols || []}
            supplementCatalogue={supplements || []}
            onClose={() => setActiveModal(null)} 
            onSelectProduct={(p) => {
               const slug = p.slug || p.id;
               router.push(`/product/${slug}`);
               setActiveModal(null);
            }} 
          />
        </Suspense>
      )}
      <Toaster containerStyle={{ zIndex: 99999 }} />
      <PWAInstallPrompt />
    </AppErrorBoundary>
  );
}


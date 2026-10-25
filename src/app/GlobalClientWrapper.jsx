"use client";

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import BackToTop from '../layout/BackToTop';
import BottomTabBar from '../layout/BottomTabBar';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../stores/uiStore';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import AppErrorBoundary from '../components/AppErrorBoundary';
import PWAInstallPrompt from '../components/mobile/PWAInstallPrompt';
import { useFirestoreData } from '../hooks/useFirestoreData';

// ⚡ Dynamic Client-Only Lazy Imports for Zero TBT & Optimal LCP
const Cart = dynamic(() => import('../snippets/Cart'), { ssr: false });
const UniversalSearchModal = dynamic(() => import('../components/shared/DatasheetQuickSearchModal'), { ssr: false });
const AtlasAIDrawer = dynamic(() => import('../components/shared/AtlasAIDrawer'), { ssr: false });
const GCPImpersonationDock = dynamic(() => import('../components/navigation/GCPImpersonationDock'), { ssr: false });
const GCPCommandPalette = dynamic(() => import('../components/navigation/GCPCommandPalette'), { ssr: false });

const PORTAL_PREFIXES = [
  '/admin',
  '/doctor',
  '/patient',
  '/clinic',
  '/supplier',
  '/wholesaler',
  '/pharmacy',
  '/login',
  '/auth',
  '/session-ended',
  '/shared',
  '/quotation',
  '/p',
  '/raw',
  '/proto',
  '/catalog',
  '/verify',
  '/c',
  '/collection',
  '/mediluxe',
  '/company',
  '/atlas',
  '/rx',
  '/d',
  '/intake',
  '/labels',
  '/lab',
  '/dr',
  '/account-manager',
  '/tools',
  '/b2b',
  '/rfq',
  '/medical',
  '/pricing',
  '/compounding'
];

function StorefrontShell({ children }) {
  const { isProfessional, activeRole } = useAuth();
  const { activeModal, setActiveModal, searchQuery, setSearchQuery, setSearchInitialTab } = useUIStore();
  const { catalogue: products, protocols, supplements } = useFirestoreData();
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => setActiveModal('ai');
    window.addEventListener('open-atlas-ai', handleOpen);
    return () => window.removeEventListener('open-atlas-ai', handleOpen);
  }, [setActiveModal]);

  const handleCategorySelect = (cat) => {
    if (cat === 'Home') return router.push(activeRole === 'admin' ? '/admin' : '/');
    if (cat === 'Peptides' || cat === 'Products') return router.push('/collection/peptides');
    if (cat === 'FAQ') return router.push('/faq');
    if (cat === 'Contact' || cat === 'Partner') return router.push('/contact');
    if (cat === 'Supplies') return router.push('/collection/supplies');
    if (cat === 'Academy') return router.push('/academy');
    
    const focusAreaMap = {
      'Recovery & Repair': '/proto?goal=Recovery & Repair',
      'Metabolic & Weight': '/proto?goal=Metabolic & Weight',
      'Longevity & Anti-Aging': '/proto?goal=Longevity & Anti-Aging',
      'Cognitive & Mood': '/proto?goal=Cognitive & Mood',
      'Sleep & Circadian': '/proto?goal=Sleep & Circadian',
      'Hormonal Optimization': '/proto?goal=Hormonal Optimization',
      'Immune Support': '/proto?goal=Immune Support',
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
    if (cat === 'Admin') return router.push('/admin');
    if (cat === 'Dashboard') {
      const dashboardPath = (activeRole === 'admin') ? '/admin'
        : (activeRole === 'doctor' || activeRole === 'medical_director') ? '/doctor'
        : (activeRole === 'wholesaler' || activeRole === 'wholeseller') ? '/wholesaler'
        : activeRole === 'supplier' ? '/supplier'
        : activeRole === 'clinic' ? '/clinic'
        : '/patient';
      return router.push(dashboardPath);
    }
    if (cat === 'Settings') return router.push('/settings');
    if (cat === 'Legal') return router.push('/legal');

    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    router.push(`/collection/${slug}`);
  };

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

      <Footer />
      <Cart />
      <BackToTop />
      <BottomTabBar />
      <AtlasAIDrawer 
        isOpen={activeModal === 'ai'} 
        onClose={() => setActiveModal(null)} 
      />
      
      {activeModal === 'search' && (
        <Suspense fallback={null}>
          <UniversalSearchModal 
            isOpen={true}
            initialQuery={searchQuery || ''}
            onClose={() => setActiveModal(null)} 
          />
        </Suspense>
      )}
      <Toaster containerStyle={{ zIndex: 99999 }} />
      <PWAInstallPrompt />
    </AppErrorBoundary>
  );
}

export default function GlobalClientWrapper({ children }) {
  const pathname = usePathname();
  const { isAdmin, activeRole } = useAuth();
  const isSuperUser = Boolean(isAdmin || activeRole === 'admin');
  const { setActiveModal } = useUIStore();

  // Universal ⌘K / Ctrl+K keyboard shortcut for public storefront visitors
  useEffect(() => {
    if (isSuperUser) return; // Admins utilize GCPCommandPalette for ⌘K
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveModal('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSuperUser, setActiveModal]);

  const isPortalRoute = PORTAL_PREFIXES.some((prefix) => 
    pathname === prefix || pathname?.startsWith(`${prefix}/`)
  );

  // Portal routes have their own layout — just render children without loading B2C data
  if (isPortalRoute) {
    return (
      <AppErrorBoundary>
        <Toaster containerStyle={{ zIndex: 99999 }} />
        {children}
        {isSuperUser && <GCPCommandPalette />}
        <PWAInstallPrompt />
      </AppErrorBoundary>
    );
  }

  return (
    <>
      <StorefrontShell>{children}</StorefrontShell>
      {isSuperUser && <GCPImpersonationDock />}
      {isSuperUser && <GCPCommandPalette />}
    </>
  );
}


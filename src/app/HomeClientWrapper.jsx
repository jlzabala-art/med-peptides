"use client";

import React from 'react';
import HomeView from '../templates/HomeView';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../stores/uiStore';
import { useRouter } from 'next/navigation';

export default function HomeClientWrapper({ initialProducts = [] }) {
  const { isProfessional, userProfile, activeRole } = useAuth();
  const { setSearchQuery, setSearchInitialTab, setActiveModal, searchQuery } = useUIStore();
  const router = useRouter();

  React.useEffect(() => {
    if (activeRole === 'admin') {
      router.replace('/admin');
    }
  }, [activeRole, router]);

  const handleCategorySelect = (cat) => {
    // Next.js routing logic for categories
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

  const handleProductSelect = (productOrName) => {
    const ROUTE_MAP = {
      supplement: (slug) => `/supplements/${slug}`,
      peptide: (slug) => `/product/${slug}`,
      testing: (slug) => `/testing/${slug}`,
      diagnostic: (slug) => `/testing/${slug}`,
    };

    if (typeof productOrName === 'object' && productOrName !== null) {
      const obj = productOrName;
      const slug = obj.slug || obj.id || (obj.name && obj.name.toLowerCase().replace(/\s+/g, '-'));
      if (!slug) return;

      const type = obj.productType || obj.type || (obj.category === 'Longevity Diagnostics' ? 'testing' : undefined);
      const routeFn = ROUTE_MAP[type];
      if (routeFn) return router.push(routeFn(slug));

      const isKnownPeptide = initialProducts.some(p => p.id === obj.id || p.slug === slug || p.name === obj.name);
      const isTestingCategory = obj.category === 'Longevity Diagnostics';
      router.push(isKnownPeptide ? `/product/${slug}` : isTestingCategory ? `/testing/${slug}` : `/supplements/${slug}`);
      return;
    }

    const product = initialProducts.find(p => p.name === productOrName || p.id === productOrName);
    if (product) {
      const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
      router.push(`/product/${slug}`);
    } else {
      router.push(`/product/${productOrName.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  return (
    <HomeView 
      isProfessional={isProfessional}
      userProfile={userProfile}
      onSelectCategory={handleCategorySelect}
      onSelectProduct={handleProductSelect}
      products={initialProducts}
      onOpenSearch={(q, tab) => {
        if (q !== undefined) setSearchQuery(q);
        if (tab) setSearchInitialTab(tab);
        setActiveModal('search');
      }}
      onOpenCart={() => setActiveModal('cart')}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}

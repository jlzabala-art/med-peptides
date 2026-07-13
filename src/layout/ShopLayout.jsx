"use client";

import React, { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Outlet } from 'next/navigation';
import { useUIStore } from '../stores/uiStore';
import { useCart } from '../context/CartProvider';
import { useAuth } from '../context/AuthContext';
import UniversalAppLayout from '../components/layout/UniversalAppLayout';
import ResearchDrawer from '../components/shared/ResearchDrawer';
import PageTransition from '../components/PageTransition';
import { Activity, Home, Package, Search, ShoppingCart, User, Beaker, HeartPulse, Settings } from '@/lib/icons';

export default function ShopLayout({
  onGoHome,
  onSelectProduct,
  onSelectCategory,
  products
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveModal } = useUIStore();
  const { cartCount } = useCart();
  const { userProfile, logout } = useAuth();

  const handleOpenSearch = useCallback(() => setActiveModal('search'), [setActiveModal]);
  const handleOpenCart = useCallback(() => setActiveModal('cart'), [setActiveModal]);
  const handleLogout = useCallback(() => { if(logout) logout(); router.push('/'); }, [logout, router]);

  // Define B2C / Shop Navigation Groups
  const sidebarNavGroups = useMemo(() => [
    {
      id: 'shop',
      label: 'Store',
      items: [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'peptides', label: 'Peptides', icon: Beaker, path: '/collection/peptides' },
        { id: 'wellness', label: 'Wellness', icon: HeartPulse, path: '/collection/wellness' },
      ]
    },
    {
      id: 'account',
      label: 'My Account',
      items: userProfile ? [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, path: '/patient' },
        { id: 'orders', label: 'Orders', icon: Package, path: '/patient/orders' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/patient/settings' },
      ] : [
        { id: 'login', label: 'Sign In', icon: User, path: '/login' },
      ]
    }
  ], [userProfile]);

  // Define Pinned Items for BottomNav/Mobile
  const sidebarPinnedItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'search', label: 'Search', icon: Search, action: handleOpenSearch },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, action: handleOpenCart, badge: cartCount },
    { id: 'account', label: 'Account', icon: User, path: userProfile ? '/patient' : '/login' },
  ];

  // Map current path to active item ID
  const activeTab = useMemo(() => {
    for (const group of sidebarNavGroups) {
      const match = group.items.find(item => item.path && (pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path))));
      if (match) return match.id;
    }
    const pinnedMatch = sidebarPinnedItems.find(item => item.path && (pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path))));
    if (pinnedMatch) return pinnedMatch.id;
    return 'home';
  }, [pathname, sidebarNavGroups, sidebarPinnedItems]);

  const navToTab = useCallback((tabId) => {
    // Find the item
    let target = null;
    for (const group of sidebarNavGroups) {
      target = group.items.find(item => item.id === tabId);
      if (target) break;
    }
    if (!target) target = sidebarPinnedItems.find(item => item.id === tabId);

    if (target?.action) {
      target.action();
    } else if (target?.path) {
      router.push(target.path);
    }
  }, [sidebarNavGroups, sidebarPinnedItems, router]);

  // Custom header actions for B2C (Search, Cart, Profile)
  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button onClick={handleOpenSearch} className="icon-button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-secondary)' }}>
        <Search size={20} />
      </button>
      <button onClick={handleOpenCart} className="icon-button" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-secondary)' }}>
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '0px',
            background: 'var(--color-primary)', color: 'white',
            borderRadius: '50%', width: '16px', height: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', fontWeight: 800
          }}>
            {cartCount}
          </span>
        )}
      </button>
      {userProfile && (
        <button onClick={() => router.push('/patient/settings')} className="icon-button" style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '0.5rem' }}>
          <User size={16} color="var(--primary)" />
        </button>
      )}
    </div>
  );

  return (
    <UniversalAppLayout
      sidebarNavGroups={sidebarNavGroups}
      sidebarPinnedItems={sidebarPinnedItems}
      activeNavId={activeTab}
      onNavigate={navToTab}
      portalTitle="RegenPept Store"
      roleContext="patient"
      pageContext={{
        activeTab,
        label: sidebarNavGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Shop',
        group: 'Store'
      }}
      headerActions={headerActions}
    >
      <div className={`view-container ${(pathname !== '/') ? 'with-header-padding' : ''}`} style={{ flex: 1, overflowY: 'auto' }}>
        <PageTransition locationKey={pathname}>
          <Outlet />
        </PageTransition>
      </div>

      {/* Global Research Drawer */}
      <ResearchDrawer />
    </UniversalAppLayout>
  );
}

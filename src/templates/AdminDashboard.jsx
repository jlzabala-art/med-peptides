"use client";

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import { conversationRepository } from '../repositories/conversationRepository';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import PanelShell from '../components/shell/PanelShell';
import PageTransition from '../components/PageTransition';
import dynamic from 'next/dynamic';

const Omnibar = dynamic(() => import('../components/admin/Omnibar'), {
  ssr: false,
});
import { useRoleAccess } from '../hooks/useRoleAccess';

import GlobalNotificationCenter from '../components/shared/widgets/GlobalNotificationCenter';
import MarketIntelligenceHub from '../components/admin/market/MarketIntelligenceHub';

// ── Removed unused tab component imports for code splitting ─────────────────
// icon alias (lucide doesn't export MailPlus2 — must be before NAV_GROUPS)
function MailPlus2(props) {
  return <UserPlus {...props} />;
}


import { NAVIGATION_REGISTRY, getNavigationForRole, ROUTE_ALIASES } from '../config/navigationRegistry';
import { ShieldCheck, ArrowLeft, Settings, Users, Database, Layers, PackageSearch, LayoutDashboard, Bot, Link2, BarChart3, ChevronRight, ChevronDown, ClipboardList, Zap, Globe, Wrench, ShoppingCart, Receipt, FlaskConical, Box, Tag, DollarSign, FileText, Eye, EyeOff, Mail, Activity, BookOpen, Cpu, LogOut, Menu, X, Building2, TrendingUp, Truck, Search, Building, Stethoscope, HeartPulse, UserPlus, Lock, Briefcase, LayoutTemplate, Network, ScrollText, MessageSquare, Calendar, UploadCloud, Settings2, CheckCircle, PieChart, CreditCard, ShieldAlert, Pill, FilePlus, ArrowLeftRight, UserCog, BarChart4, Workflow, GraduationCap, PackageOpen, Package, Inbox } from '../lib/icons';

// ── Always-visible pinned items (not inside accordion groups) ─────────────────
const PINNED_ITEMS = [
  { id: 'dashboard', label: 'Dashboard KPIs', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'operations-inbox', label: 'Inbox', icon: Inbox },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'pending-apis', label: 'APIs Pendientes', icon: Database },
];

// ── Hooks ──────────────────────────────────────────────────────────────────────
function useUnreadMessagesCount() {
  const { user } = useAuth();
  const { is } = useRoleAccess();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let unsub = null;
    const timer = setTimeout(() => {
      unsub = conversationRepository.subscribeToUnreadMessages(
        { userId: user.uid, isAdmin: is('admin') },
        setUnread
      );
    }, 800);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [user, is]);

  return unread;
}

function useInboxPendingCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let unsub = null;
    const timer = setTimeout(() => {
      unsub = conversationRepository.subscribeToInboxPending(setCount);
    }, 1000);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, []);
  return count;
}

function useUpcomingCalendarCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let unsub = null;
    const timer = setTimeout(() => {
      unsub = conversationRepository.subscribeToUpcomingCalendarEvents(user.uid, setCount);
    }, 1200);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [user]);

  return count;
}

function usePendingApiCount() {
  const { is } = useRoleAccess();
  const isAdmin = is('admin');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAdmin || typeof window === 'undefined') return;
    let unsub = null;
    const timer = setTimeout(() => {
      const q = query(collection(db, 'products'), where('isApiPlaceholder', '==', true));
      unsub = onSnapshot(q, (snap) => setCount(snap.size), (err) => {
        console.error('Error fetching pending APIs', err);
        setCount(0);
      });
    }, 1500);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [isAdmin]);

  return count;
}

// ── Intent-based navigation groups ────────────────────────────────────────────
const NAV_GROUPS = NAVIGATION_REGISTRY.map(group => ({
  ...group,
  items: group.items.map(item => ({
    ...item,
    id: item.id.replace(/^\//, '') || 'dashboard'
  }))
}));

// Tab→group lookup
const TAB_TO_GROUP = {};
for (const g of NAV_GROUPS) for (const item of g.items) TAB_TO_GROUP[item.id] = g.id;

// ── Loading spinner ────────────────────────────────────────────────────────────
function AdminLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(0,54,102,0.1)',
          borderTopColor: 'var(--primary)',
          animation: 'adminSpin 1s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
        Loading module...
      </span>
      <style>{`@keyframes adminSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const { loading: authLoading, logout, userProfile } = useAuth();
  const { is, can } = useRoleAccess();
  const isAdmin = is('admin');
  const router = useRouter();
  const pathname = usePathname();
  const unreadMessages = useUnreadMessagesCount();
  const pendingInboxItems = useInboxPendingCount();
  const upcomingCalendarCount = useUpcomingCalendarCount();
  const pendingApiCount = usePendingApiCount();
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOmnibarOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dynamicPinnedItems = React.useMemo(() => {
    return PINNED_ITEMS.map((item) => {
      if (item.id === 'messages') {
        return {
          ...item,
          badge: unreadMessages > 0 ? unreadMessages : null,
          badgeColor: '#25D366', // WhatsApp green
        };
      }
      if (item.id === 'operations-inbox') {
        return {
          ...item,
          badge: pendingInboxItems > 0 ? pendingInboxItems : null,
          badgeColor: '#0ea5e9', // Blue
        };
      }
      if (item.id === 'calendar') {
        return {
          ...item,
          badge: upcomingCalendarCount > 0 ? upcomingCalendarCount : null,
          badgeColor: '#f97316', // Orange for calendar
        };
      }
      if (item.id === 'pending-apis') {
        return {
          ...item,
          badge: pendingApiCount > 0 ? pendingApiCount : null,
          badgeColor: '#eab308', // Yellow
        };
      }
      return item;
    });
  }, [unreadMessages, pendingInboxItems, upcomingCalendarCount, pendingApiCount]);

  const filteredNavGroups = React.useMemo(() => {
    // 1. Determine which role to use for navigation (simulated or real)
    const roleToUse = userProfile?.role || 'admin';

    // 2. Fetch the proper navigation structure for that role from the registry
    const baseNavGroups = getNavigationForRole(roleToUse).map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        id: item.id.replace(/^\//, '') || 'dashboard'
      }))
    }));

    // 3. Admin overrides filtering
    if (isAdmin) {
      return baseNavGroups.filter(group => group.items.length > 0);
    }

    // 4. Normal Auth logic for non-admin users with specific allowed tabs
    if (!userProfile?.allowedAdminTabs || userProfile.allowedAdminTabs.length === 0) {
      return baseNavGroups.filter(group => group.items.length > 0);
    }

    // Filter by allowedAdminTabs if the user is restricted
    return baseNavGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => userProfile.allowedAdminTabs.includes(item.id)),
    })).filter((group) => group.items.length > 0);
  }, [userProfile, isAdmin]);

  // Derive active tab from the URL path instead of query params.
  // E.g., /admin/users -> 'users', /admin -> 'dashboard'
  const pathParts = pathname.split('/').filter(Boolean);
  const rawTab = pathParts.length > 1 ? pathParts[1] : 'dashboard';

  // Redirect stale bookmarks (old slugs → new consolidated routes)
  React.useEffect(() => {
    if (ROUTE_ALIASES[rawTab]) {
      router.replace(`/admin/${ROUTE_ALIASES[rawTab]}`);
    }
  }, [rawTab, router]);

  const activeTab = ROUTE_ALIASES[rawTab] ?? rawTab;

  // Flatten allowed tab IDs from the filtered groups
  const allowedNavIds = React.useMemo(() => {
    return filteredNavGroups.flatMap(group => group.items.map(i => i.id));
  }, [filteredNavGroups]);

  React.useEffect(() => {
    // Let admins bypass restrictions
    if (isAdmin) return;

    if (allowedNavIds.length > 0) {
      if (
        !allowedNavIds.includes(activeTab) &&
        activeTab !== 'dashboard' &&
        activeTab !== 'my-profile'
      ) {
        router.push(`/admin/${allowedNavIds[0]}`);
      } else if (activeTab === 'dashboard' && !allowedNavIds.includes('dashboard')) {
        router.push(`/admin/${allowedNavIds[0]}`);
      }
    }
  }, [
    allowedNavIds,
    activeTab,
    router,
    isAdmin
  ]);

  const [isPending, startTransition] = React.useTransition();

  const navToTab = useCallback(
    (tabId) => {
      startTransition(() => {
        if (tabId === 'b2c-shop') {
          router.push('/');
          return;
        }
        if (tabId === 'pending-apis') {
          router.push('/admin/catalog?apiPlaceholder=Only APIs');
          return;
        }
        router.push(`/admin/${tabId === 'dashboard' ? '' : tabId}`);
      });
    },
    [router]
  );

  const handleLogout = () => {
    if (logout) logout();
    window.location.href = '/';
  };

  const currentGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeTab));
  const currentItem =
    currentGroup?.items.find((i) => i.id === activeTab) ??
    PINNED_ITEMS.find((i) => i.id === activeTab);

  return (
    <PanelShell
      sidebarNavGroups={filteredNavGroups}
      sidebarPinnedItems={dynamicPinnedItems}
      activeNavId={activeTab}
      onNavigate={navToTab}
      portalTitle="Control Center"
      roleContext="admin"
      pageContext={{
        activeTab: activeTab,
        label: currentItem?.label || 'Dashboard',
        group: currentGroup?.label || 'Overview',
      }}
      headerActions={
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '4px',
            }}
            title="Logout"
          >
            <LogOut size={18} color="var(--color-text-secondary)" />
          </button>
        </div>
      }
    >
      <div 
        style={{ 
          padding: '1.5rem', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          minHeight: 0, 
          boxSizing: 'border-box',
          opacity: isPending ? 0.75 : 1,
          transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'opacity, transform',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <React.Suspense fallback={<AdminLoadingFallback />}>
          {children}
        </React.Suspense>
      </div>
      <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} />
    </PanelShell>
  );
}

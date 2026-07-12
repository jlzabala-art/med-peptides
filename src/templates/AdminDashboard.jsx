"use client";

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import { conversationRepository } from '../repositories/conversationRepository';
import { useAuth } from '../context/AuthContext';

import PortalLayout from '../components/ui/PortalLayout';
import PageTransition from '../components/PageTransition';
import Omnibar from '../components/admin/Omnibar';
import { useAdminRoleSimulation } from '../hooks/admin/useAdminRoleSimulation';

import GlobalNotificationCenter from '../components/shared/widgets/GlobalNotificationCenter';
import MarketIntelligenceHub from '../components/admin/market/MarketIntelligenceHub';

// ── Removed unused tab component imports for code splitting ─────────────────
// icon alias (lucide doesn't export MailPlus2 — must be before NAV_GROUPS)
function MailPlus2(props) {
  return <UserPlus {...props} />;
}


import { NAVIGATION_REGISTRY, getNavigationForRole } from '../config/navigationRegistry';
import { ShieldCheck, ArrowLeft, Settings, Users, Database, Layers, PackageSearch, LayoutDashboard, Bot, Link2, BarChart3, ChevronRight, ChevronDown, ClipboardList, Zap, Globe, Wrench, ShoppingCart, Receipt, FlaskConical, Box, Tag, DollarSign, FileText, Eye, EyeOff, Mail, Activity, BookOpen, Cpu, LogOut, Menu, X, Building2, TrendingUp, Truck, Search, Building, Stethoscope, HeartPulse, UserPlus, Lock, Briefcase, LayoutTemplate, Network, ScrollText, MessageSquare, Calendar, UploadCloud, Settings2, CheckCircle, PieChart, CreditCard, ShieldAlert, Pill, FilePlus, ArrowLeftRight, UserCog, BarChart4, Workflow, GraduationCap, PackageOpen, Package, Inbox } from '../lib/icons';

// ── Always-visible pinned items (not inside accordion groups) ─────────────────
const PINNED_ITEMS = [
  { id: 'dashboard', label: 'Dashboard KPIs', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'operations-inbox', label: 'Inbox', icon: Inbox },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

// ── Hooks ──────────────────────────────────────────────────────────────────────
function useUnreadMessagesCount() {
  const { user, isAdmin, userRole } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    return conversationRepository.subscribeToUnreadMessages(
      { userId: user.uid, isAdmin: isAdmin || userRole === 'admin' },
      setUnread
    );
  }, [user, isAdmin, userRole]);

  return unread;
}

function useInboxPendingCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    return conversationRepository.subscribeToInboxPending(setCount);
  }, []);
  return count;
}

function useUpcomingCalendarCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    return conversationRepository.subscribeToUpcomingCalendarEvents(user.uid, setCount);
  }, [user]);

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
  const { isAdmin, loading: authLoading, logout, userProfile } = useAuth();
  const { simulatedRole, allowedAdminTabs, isSimulating } = useAdminRoleSimulation();
  const router = useRouter();
  const pathname = usePathname();
  const unreadMessages = useUnreadMessagesCount();
  const pendingInboxItems = useInboxPendingCount();
  const upcomingCalendarCount = useUpcomingCalendarCount();
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
      return item;
    });
  }, [unreadMessages, pendingInboxItems, upcomingCalendarCount]);

  const filteredNavGroups = React.useMemo(() => {
    // 1. Determine which role to use for navigation (simulated or real)
    const roleToUse = isSimulating ? simulatedRole : (userProfile?.role || 'admin');

    // 2. Fetch the proper navigation structure for that role from the registry
    const baseNavGroups = getNavigationForRole(roleToUse).map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        id: item.id.replace(/^\//, '') || 'dashboard'
      }))
    }));

    // 3. Role simulation or Admin overrides filtering
    if (isSimulating || isAdmin || userProfile?.role === 'admin') {
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
  }, [userProfile, isAdmin, isSimulating, simulatedRole]);

  // Derive active tab from the URL path instead of query params.
  // E.g., /admin/users -> 'users', /admin -> 'dashboard'
  const pathParts = pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[1] : 'dashboard';

  // Flatten allowed tab IDs from the filtered groups
  const allowedNavIds = React.useMemo(() => {
    return filteredNavGroups.flatMap(group => group.items.map(i => i.id));
  }, [filteredNavGroups]);

  React.useEffect(() => {
    // Let admins bypass restrictions if they are not simulating
    if (!isSimulating && (isAdmin || userProfile?.role === 'admin')) return;

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
    isAdmin,
    userProfile?.role,
    isSimulating,
  ]);

  const navToTab = useCallback(
    (tabId) => {
      if (tabId === 'b2c-shop') {
        router.push('/');
        return;
      }
      router.push(`/admin/${tabId === 'dashboard' ? '' : tabId}`);
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
    <PortalLayout
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
      <div style={{ padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <React.Suspense fallback={<AdminLoadingFallback />}>
          {children}
        </React.Suspense>
      </div>
      <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} />
    </PortalLayout>
  );
}

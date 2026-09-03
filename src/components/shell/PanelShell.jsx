"use client";

import React, { useEffect } from 'react';
import PortalLayout from '../ui/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import AtlasLoadingScreen from '../ui/AtlasLoadingScreen';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useNotificationContext } from '../../context/NotificationContext';
import IOSPushBanner from '../ui/IOSPushBanner';

const GlobalQuickCreateHandler = dynamic(() => import('../shared/GlobalQuickCreateHandler'), { ssr: false });
const GlobalDrawerManager = dynamic(() => import('../shared/GlobalDrawerManager'), { ssr: false });
const PushNotificationPrompt = dynamic(() => import('../ui/PushNotificationPrompt'), { ssr: false });

/**
 * PanelShell
 * 
 * Centralized layout component that wraps the powerful PortalLayout (formerly Admin-only)
 * to bring a unified, GCP-style responsive experience to ALL roles (B2B and B2C).
 * 
 * It dynamically injects CSS variables for role-based theming via classes.
 */
import '../../styles/themes/roles.css';

export default function PanelShell({
  children,
  sidebarNavGroups = [],
  sidebarPinnedItems = [],
  activeNavId,
  onNavigate,
  portalTitle,
  roleContext = 'patient',
  pageContext,
  headerActions,
  allowedRoles = []
}) {
  const { user, activeRole, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Handle route protection
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
        router.replace('/');
      }
    }
  }, [user, activeRole, loading, allowedRoles, router]);

  // Determine the effective role for theming (fallback to the passed roleContext)
  const themeRole = activeRole || roleContext;

  // Apply role-based theme classes to the body or a wrapper container
  // Admin/B2B generally uses the default blue/corporate theme.
  // Patient/B2C could use a softer, wellness-focused theme.
  useEffect(() => {
    // Add theme class to document body to ensure global styles (like modals) pick it up
    const themeClass = `theme-${themeRole}`;
    document.body.classList.add(themeClass);
    return () => {
      document.body.classList.remove(themeClass);
    };
  }, [themeRole]);

  if (loading || !user || (allowedRoles.length > 0 && !allowedRoles.includes(activeRole))) {
    return <AtlasLoadingScreen />;
  }

  return (
    <div className={`universal-layout-wrapper theme-${themeRole}`}>
      <style>{`
        /* 
          Ensure the PanelShell completely fills the viewport 
          so PortalLayout renders correctly within it.
        */
        .universal-layout-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }
      `}</style>
      <IOSPushBanner />
      <PushNotificationPrompt />
      <PortalLayout
        sidebarNavGroups={sidebarNavGroups}
        sidebarPinnedItems={sidebarPinnedItems}
        activeNavId={activeNavId}
        onNavigate={onNavigate}
        portalTitle={portalTitle}
        roleContext={themeRole}
        pageContext={pageContext}
        headerActions={headerActions}
      >
        {children}
      </PortalLayout>
      <GlobalQuickCreateHandler />
      <Suspense fallback={null}>
        <GlobalDrawerManager />
      </Suspense>
    </div>
  );
}

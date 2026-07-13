"use client";

import React, { useEffect } from 'react';
import PortalLayout from '../ui/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';

/**
 * UniversalAppLayout
 * 
 * Centralized layout component that wraps the powerful PortalLayout (formerly Admin-only)
 * to bring a unified, GCP-style responsive experience to ALL roles (B2B and B2C).
 * 
 * It dynamically injects CSS variables for role-based theming.
 */
export default function UniversalAppLayout({
  children,
  sidebarNavGroups = [],
  sidebarPinnedItems = [],
  activeNavId,
  onNavigate,
  portalTitle,
  roleContext = 'patient',
  pageContext,
  headerActions
}) {
  const { user, activeRole } = useAuth();
  const pathname = usePathname();

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

  return (
    <div className={`universal-layout-wrapper theme-${themeRole}`}>
      <style>{`
        /* 
          Role-Based Theming System 
          Overrides global CSS variables based on the active role.
        */
        
        .theme-patient {
          --color-primary: #10b981; /* Emerald green for wellness */
          --color-bg-app: #f8fafc;
          --color-sidebar-bg: #ffffff;
        }

        .theme-doctor, .theme-physician, .theme-medical_director {
          --color-primary: #0ea5e9; /* Medical Blue */
          --color-bg-app: #f0fdfa; /* Slight teal tint */
        }

        .theme-admin {
          --color-primary: #003666; /* Deep Corporate Blue */
        }

        .theme-wholesaler, .theme-supplier {
          --color-primary: #f97316; /* Orange for B2B/Logistics */
        }

        /* 
          Ensure the UniversalAppLayout completely fills the viewport 
          so PortalLayout renders correctly within it.
        */
        .universal-layout-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
      `}</style>
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
    </div>
  );
}

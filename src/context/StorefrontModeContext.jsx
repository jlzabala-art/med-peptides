"use client";
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const StorefrontModeContext = createContext(null);

export function StorefrontModeProvider({ children }) {
  const { user, userRole, isProfessional } = useAuth?.() ?? {};

  const modeData = useMemo(() => {
    const rawRole = (userRole || '').toLowerCase().trim();

    let mode = 'retail';
    if (rawRole === 'admin') {
      mode = 'admin';
    } else if (['doctor', 'clinic', 'pharmacy', 'hospital', 'healthcare provider'].some(r => rawRole.includes(r))) {
      mode = 'clinical';
    } else if (['wholesaler', 'distributor', 'bulk'].some(r => rawRole.includes(r))) {
      mode = 'wholesale';
    } else if (['researcher', 'laboratory', 'lab'].some(r => rawRole.includes(r))) {
      mode = 'research';
    }

    const isB2B = mode !== 'retail';
    const isB2C = mode === 'retail';

    const permissions = {
      canPrescribe: mode === 'clinical' || mode === 'admin',
      canViewTiers: isB2B,
      canAccessClinicalAI: true,
      canRequestDropship: mode === 'wholesale' || mode === 'admin',
      canManageWholesaleCatalogs: mode === 'wholesale' || mode === 'admin',
      canViewWholesalePricing: isB2B
    };

    const theme = {
      primaryColor: mode === 'clinical' ? '#0d9488' : mode === 'wholesale' ? '#c2410c' : mode === 'research' ? '#7c3aed' : '#003666',
      badgeLabel: mode === 'clinical' ? 'CLINICAL PRACTITIONER' : mode === 'wholesale' ? 'WHOLESALE DISTRIBUTOR' : mode === 'research' ? 'RESEARCH LAB' : 'RESEARCH STOREFRONT',
      badgeColor: mode === 'clinical' ? '#0d9488' : mode === 'wholesale' ? '#c2410c' : mode === 'research' ? '#7c3aed' : '#0284c7'
    };

    return {
      mode,
      isB2B,
      isB2C,
      user,
      userRole,
      isProfessional: isProfessional || isB2B,
      permissions,
      theme
    };
  }, [user, userRole, isProfessional]);

  return (
    <StorefrontModeContext.Provider value={modeData}>
      {children}
    </StorefrontModeContext.Provider>
  );
}

export function useStorefrontMode() {
  const context = useContext(StorefrontModeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      mode: 'retail',
      isB2B: false,
      isB2C: true,
      permissions: {
        canPrescribe: false,
        canViewTiers: false,
        canAccessClinicalAI: true,
        canRequestDropship: false,
        canManageWholesaleCatalogs: false,
        canViewWholesalePricing: false
      },
      theme: {
        primaryColor: '#003666',
        badgeLabel: 'RESEARCH STOREFRONT',
        badgeColor: '#0284c7'
      }
    };
  }
  return context;
}

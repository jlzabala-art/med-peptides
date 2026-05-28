import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { resolveTenantBySlug, resolveTenantById, getTenantSlugFromPath } from '../utils/resolveTenant';
import { setActiveTenantForResolution } from '../utils/resolvePrice';

const TenantContext = createContext(null);

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function TenantProvider({ children }) {
  const location = useLocation();
  const { userProfile, loading: authLoading } = useAuth();
  
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loadingTenant, setLoadingTenant] = useState(true);

  // Extract tenant slug from current path
  const pathSlug = useMemo(() => getTenantSlugFromPath(location.pathname), [location.pathname]);

  // Resolve tenant based on path or user profile
  useEffect(() => {
    let active = true;

    async function resolve() {
      setLoadingTenant(true);

      // 1. Try URL path first (e.g. /partner/some-slug)
      if (pathSlug) {
        const tenant = await resolveTenantBySlug(pathSlug);
        if (active) {
          setCurrentTenant(tenant);
          setLoadingTenant(false);
          return;
        }
      }

      // 2. Fallback to logged-in user profile's assigned tenant
      if (!authLoading && userProfile?.assignedTenantId) {
        const tenant = await resolveTenantById(userProfile.assignedTenantId);
        if (active) {
          setCurrentTenant(tenant);
          setLoadingTenant(false);
          return;
        }
      }

      // 3. No tenant resolved
      if (active) {
        setCurrentTenant(null);
        setLoadingTenant(false);
      }
    }

    resolve();

    return () => {
      active = false;
    };
  }, [pathSlug, userProfile?.assignedTenantId, authLoading]);

  // Apply branding CSS variables dynamically
  useEffect(() => {
    const root = document.documentElement;
    const branding = currentTenant?.branding;

    if (branding) {
      if (branding.primaryColor) {
        root.style.setProperty('--primary', branding.primaryColor);
        root.style.setProperty('--brand-primary', branding.primaryColor);
      }
      if (branding.secondaryColor) {
        root.style.setProperty('--secondary', branding.secondaryColor);
        root.style.setProperty('--brand-secondary', branding.secondaryColor);
      }
      if (branding.fontFamily) {
        root.style.setProperty('--font-heading', branding.fontFamily);
      }
    } else {
      // Revert to defaults
      root.style.removeProperty('--primary');
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--font-heading');
    }
  }, [currentTenant]);

  // Sync active tenant for global non-React price resolution
  useEffect(() => {
    setActiveTenantForResolution(currentTenant);
  }, [currentTenant]);

  const value = useMemo(() => ({
    tenant: currentTenant,
    loadingTenant,
    isWhiteLabeled: !!currentTenant,
    tenantId: currentTenant?.id || null,
    tenantSlug: currentTenant?.slug || null,
    branding: currentTenant?.branding || null,
  }), [currentTenant, loadingTenant]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

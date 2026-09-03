"use client";

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CatalogProvider } from '../../components/CatalogProvider';
import AppProviders from '../../providers/AppProviders';
import NextProtectedRoute from '../auth/NextProtectedRoute';
import '../../i18n'; // Initialize i18n for the portals

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function PortalProviders({ children, allowedRoles }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <CatalogProvider>
        <AppProviders>
          {allowedRoles ? (
            <NextProtectedRoute allowedRoles={allowedRoles}>
              {children}
            </NextProtectedRoute>
          ) : (
            children
          )}
        </AppProviders>
      </CatalogProvider>
    </QueryClientProvider>
  );
}

"use client";

import '../i18n';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { usePathname } from 'next/navigation';

// Contexts
import { AuthProvider } from '../context/AuthContext';
import { TenantProvider } from '../context/TenantContext';
import { ShopProvider } from '../context/ShopProvider';
import { CartProvider } from '../context/CartProvider';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { HeaderProvider } from '../context/HeaderContext';
import { CopilotProvider } from '../context/CopilotContext';
import { ModalProvider } from '../hooks/ui/useModalStack';
import { DrawerProvider } from '../context/DrawerContext';
import { JobQueueProvider } from '../context/JobQueueContext';
import { StorefrontModeProvider } from '../context/StorefrontModeContext';
import GlobalDrawerManager from '../components/shared/GlobalDrawerManager';
import Omnibar from '../components/ui/Omnibar';
import NetworkStatusBanner from '../components/ui/NetworkStatusBanner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,          // 5 minutes — aligned with repository RAM/LocalStorage TTL (Golden Rule #2)
      gcTime: 1000 * 60 * 60 * 2,         // 2 hours — keep in memory
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',        // Re-sync on network restore
      structuralSharing: true,             // Skip re-renders when data is structurally equal
      throwOnError: false,                 // Prevent query errors from crashing component tree
    },
    mutations: {
      throwOnError: false,                 // Same resilience for mutations
    },
  },
});

// Cache buster: invalidate persisted cache when app version changes
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
  key: `regen-query-cache-v${APP_VERSION}`,
});

export default function NextProviders({ children, serverUser }) {
  const pathname = usePathname();
  const isPublicStandalone = pathname?.startsWith('/p/') || pathname?.startsWith('/verify');

  // 🚀 Fast-path for public standalone routes: Zero Auth listeners, Zero AI Copilot, Zero Cart, Zero Omnibar
  if (isPublicStandalone) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <AuthProvider serverUser={serverUser}>
          <TenantProvider>
            <StorefrontModeProvider>
              <ShopProvider>
                <CartProvider>
                  <ThemeProvider>
                      <NotificationProvider>
                        <PreferencesProvider>
                          <CopilotProvider>
                            <HeaderProvider>
                              <ModalProvider>
                                <JobQueueProvider>
                                  <DrawerProvider>
                                    {children}
                                    <GlobalDrawerManager />
                                    <Omnibar />
                                    <NetworkStatusBanner />
                                  </DrawerProvider>
                                </JobQueueProvider>
                              </ModalProvider>
                            </HeaderProvider>
                          </CopilotProvider>
                        </PreferencesProvider>
                      </NotificationProvider>
                  </ThemeProvider>
                </CartProvider>
              </ShopProvider>
            </StorefrontModeProvider>
          </TenantProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}

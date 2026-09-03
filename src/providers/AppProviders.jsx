"use client";
import React, { useEffect } from 'react';
import { BrowserRouter } from 'next/navigation';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { HelmetProvider } from 'react-helmet-async';
import { initStorageQuotaGuard } from '../utils/storageQuotaGuard';

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
import { ModalProvider } from '../hooks/ui/useModalStack.jsx';
import { DrawerProvider } from '../context/DrawerContext';
import { JobQueueProvider } from '../context/JobQueueContext';
import GlobalDrawerManager from '../components/shared/GlobalDrawerManager';
import Omnibar from '../components/ui/Omnibar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (Replaces cacheTime in RQv5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => {
      if (typeof window === 'undefined') return null;
      try {
        const val = await get(key);
        return val ?? null;
      } catch {
        try { return localStorage.getItem(key); } catch { return null; }
      }
    },
    setItem: async (key, value) => {
      if (typeof window === 'undefined') return;
      try {
        await set(key, value);
      } catch {
        try { localStorage.setItem(key, value); } catch {}
      }
    },
    removeItem: async (key) => {
      if (typeof window === 'undefined') return;
      try {
        await del(key);
      } catch {
        try { localStorage.removeItem(key); } catch {}
      }
    },
  },
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

export default function AppProviders({ children }) {
  useEffect(() => {
    initStorageQuotaGuard();
  }, []);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <AuthProvider>
          <TenantProvider>
            <ShopProvider>
              <CartProvider>

                  <HelmetProvider>
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
                                  </DrawerProvider>
                                </JobQueueProvider>
                              </ModalProvider>
                            </HeaderProvider>
                          </CopilotProvider>
                        </PreferencesProvider>
                      </NotificationProvider>
                    </ThemeProvider>
                  </HelmetProvider>

              </CartProvider>
            </ShopProvider>
          </TenantProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}

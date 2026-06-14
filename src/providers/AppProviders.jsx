import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { HelmetProvider } from 'react-helmet-async';

// Contexts
import { AuthProvider } from '../context/AuthContext';
import { TenantProvider } from '../context/TenantContext';
import { ShopProvider } from '../context/ShopProvider';
import { CartProvider } from '../context/CartProvider';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { HeaderProvider } from '../context/HeaderContext';
import { CopilotProvider } from '../context/CopilotContext';

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
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
});

export default function AppProviders({ children }) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <BrowserRouter>
        <AuthProvider>
          <PermissionsProvider>
            <TenantProvider>
              <ShopProvider>
                <CartProvider>
                  <HelmetProvider>
                    <ThemeProvider>
                      <NotificationProvider>
                        <PreferencesProvider>
                          <CopilotProvider>
                            <HeaderProvider>
                              {children}
                            </HeaderProvider>
                          </CopilotProvider>
                        </PreferencesProvider>
                      </NotificationProvider>
                    </ThemeProvider>
                  </HelmetProvider>
                </CartProvider>
              </ShopProvider>
            </TenantProvider>
          </PermissionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

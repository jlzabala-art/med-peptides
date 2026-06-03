import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
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
                          <HeaderProvider>
                            {children}
                          </HeaderProvider>
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
    </QueryClientProvider>
  );
}

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { ShopProvider } from './context/ShopProvider';
import { ModalProvider } from './context/ModalProvider';
import { CartProvider } from './context/CartProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './i18n'; // Initialize i18next
import App from './App.jsx';
import { trackEvent } from './hooks/useAnalytics';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Core Web Vitals → GA4 (non-blocking, fires after paint)
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
const reportVital = ({ name, value, rating }) =>
  trackEvent('web_vitals', { metric_name: name, value: Math.round(value), rating });
onCLS(reportVital);
onINP(reportVital);
onLCP(reportVital);
onFCP(reportVital);
onTTFB(reportVital);

// ── Stale chunk recovery ─────────────────────────────────────────────────────
// After a new deployment, old hashed chunk URLs no longer exist on the server.
// The SPA fallback returns index.html → browser rejects it as text/html MIME.
// Vite fires `vite:preloadError` for this case. We force a one-time reload
// which fetches the freshly deployed chunks.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  // Guard against reload loops: only reload once per session
  const reloaded = sessionStorage.getItem('chunk_reload');
  if (!reloaded) {
    sessionStorage.setItem('chunk_reload', '1');
    window.location.reload();
  }
});

// ── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    // Detect stale-chunk / MIME-type errors
    const isChunkError =
      error?.message?.includes('is not a valid JavaScript MIME type') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.name === 'ChunkLoadError';
    return { hasError: true, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Critical Render Error:', error, errorInfo);

    // Auto-reload on chunk errors (guard against loops)
    if (
      error?.message?.includes('is not a valid JavaScript MIME type') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.name === 'ChunkLoadError'
    ) {
      const reloaded = sessionStorage.getItem('chunk_reload');
      if (!reloaded) {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-app)',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h1 style={{ color: '#0f172a', fontSize: '1.5rem', marginBottom: '1rem' }}>
            {this.state.isChunkError ? 'Updating Application…' : 'System Refresh Required'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
            {this.state.isChunkError
              ? 'A new version was detected. Reloading automatically…'
              : 'The clinical interface encountered a rendering synchronization issue.'}
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem('chunk_reload');
              window.location.href = '/';
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {this.state.isChunkError ? 'Reload Now' : 'Restart Application'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

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

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {/* Es mejor envolver el AuthProvider aquí para que App tenga acceso a todo */}
            <AuthProvider>
              <PermissionsProvider>
              <TenantProvider>
              <ShopProvider>
                <ModalProvider>
                  <CartProvider>
                    <HelmetProvider>
                      <ThemeProvider>
                        <NotificationProvider>
                          <App />
                        </NotificationProvider>
                      </ThemeProvider>
                    </HelmetProvider>
                  </CartProvider>
                </ModalProvider>
              </ShopProvider>
              </TenantProvider>
              </PermissionsProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  // Caso extremo: el HTML no tiene el div#root
  document.body.innerHTML = '<div style="padding:20px">Critical Error: Root mount point missing.</div>';
}

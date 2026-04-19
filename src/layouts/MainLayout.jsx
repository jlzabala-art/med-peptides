import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import BottomNav from '../layout/BottomNav';
import BackToTop from '../layout/BackToTop';
import ErrorBoundary from '../components/ErrorBoundary'; // Crear este componente

export default function MainLayout(props) {
  const { pathname } = useLocation();

  // Mejora: Scroll to top automático en cambios de ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-main-wrapper" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh', // Dynamic Viewport Height
      position: 'relative'
    }}>
      <Header {...props} />

      {/* Añadimos un main tag para SEO y accesibilidad.
          padding-bottom asegura que el BottomNav no tape el contenido final.
      */}
      <main className="view-container with-header-padding" style={{
        flex: '1 0 auto',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'
      }}>
        <ErrorBoundary fallback={<RouteErrorState />}>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet context={props} />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer onNavigate={props.onSelectCategory} />

      {/* Solo mostrar BottomNav si no estamos en Checkout para evitar distracciones 
      */}
      {!pathname.includes('checkout') && (
        <BottomNav
          onGoHome={props.onGoHome}
          onOpenSearch={props.onOpenSearch}
          onOpenCart={props.onOpenCart}
          onOpenProducts={props.onOpenProducts}
          cartCount={props.cartCount}
        />
      )}

      <BackToTop />
    </div>
  );
}

// Sub-componentes para limpieza de código
const LoadingFallback = () => (
  <div style={{
    height: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem'
  }}>
    <div className="spinner"></div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
      LOADING RESEARCH MODULE...
    </p>
  </div>
);

const RouteErrorState = () => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h3>Module Load Error</h3>
    <p>There was a problem loading this section. Please check your connection.</p>
    <button onClick={() => window.location.reload()} className="btn-primary">
      Retry Load
    </button>
  </div>
);
 
import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import BackToTop from '../layout/BackToTop';
import ErrorBoundary from '../components/ErrorBoundary'; // Crear este componente

export default function MainLayout(props) {
  const { pathname } = useLocation();

  // Improvement: Automatic scroll to top on route changes
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

      {/* Adding a main tag for SEO and accessibility.
          padding-bottom asegura que el BottomNav no tape el contenido final.
      */}
      <main className="view-container with-header-padding" style={{
        flex: '1 0 auto',
        paddingBottom: '0' // Removed padding as BottomNav is gone
      }}>
        <ErrorBoundary fallback={<RouteErrorState />}>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet context={props} />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer onNavigate={props.onSelectCategory} />



      <BackToTop />
    </div>
  );
}

// Sub-components for code cleanup
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
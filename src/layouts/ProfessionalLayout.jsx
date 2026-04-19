import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import BottomNav from '../layout/BottomNav';
import BackToTop from '../layout/BackToTop';

export default function ProfessionalLayout(props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Gestión de scroll automático
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="app professional-mode" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh', // Altura dinámica para móvil
      backgroundColor: '#f1f5f9' // Fondo ligeramente más gris/clínico
    }}>
      {/* Barra de estado profesional superior opcional */}
      <div style={{
        backgroundColor: 'var(--primary)',
        color: 'white',
        fontSize: '0.65rem',
        textAlign: 'center',
        padding: '4px 0',
        letterSpacing: '0.1em',
        fontWeight: 'bold'
      }}>
        PROFESSIONAL CONSOLE ACTIVE
      </div>

      <Header {...props} isProfessional={true} />

      <main style={{
        flex: 1,
        paddingBottom: 'calc(90px + env(safe-area-inset-bottom))'
      }}>
        <Suspense fallback={<ProLoadingState />}>
          {/* Usamos el context de Outlet para pasar funciones de utilidad a las páginas hijas */}
          <Outlet context={{ ...props, mode: 'professional' }} />
        </Suspense>
      </main>

      {/* Footer simplificado para profesionales (menos marketing, más soporte) */}
      <Footer onNavigate={props.onSelectCategory} isProfessional={true} />

      <BottomNav
        onGoHome={props.onGoHome}
        onOpenSearch={props.onOpenSearch}
        onOpenCart={props.onOpenCart}
        onOpenProducts={() => navigate('/catalog')}
        cartCount={props.cartCount}
      />

      <BackToTop />
    </div>
  );
}

// Fallback visual más acorde al sector científico
const ProLoadingState = () => (
  <div style={{
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem'
  }}>
    <div className="spinner" style={{ borderColor: 'var(--secondary)', borderTopColor: 'transparent' }}></div>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', letterSpacing: '0.05em' }}>
        SECURE DATA SYNC
      </p>
      <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Accessing professional catalog...</p>
    </div>
  </div>
);
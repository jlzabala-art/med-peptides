import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalSidebar from './PortalSidebar';
import PortalHeader from './PortalHeader';
import PortalAIDrawer from './PortalAIDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import AtlasHealthLogo from '../components/brand/AtlasHealthLogo';

/* ── Branded loading screen ─────────────────────────────────────────────────── */
function AtlasLoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e8f4f8 100%)',
      zIndex: 9999,
    }}>
      {/* Pulsing logo */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: '1.5rem' }}
      >
        <AtlasHealthLogo size={64} animate />
      </motion.div>

      {/* Brand name */}
      <p style={{
        fontWeight: 800,
        fontSize: '1.1rem',
        color: '#003666',
        letterSpacing: '-0.01em',
        marginBottom: '0.4rem',
      }}>
        Atlas Health
      </p>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
        Cargando…
      </p>

      {/* Shimmer bar */}
      <div style={{
        marginTop: '1.75rem',
        width: '120px',
        height: '3px',
        borderRadius: '99px',
        background: 'rgba(0,54,102,0.08)',
        overflow: 'hidden',
      }}>
        <motion.div
          style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #003666, #00BCD4)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

/* ── Main layout ─────────────────────────────────────────────────────────────── */
export default function AppPortalLayout({ allowedRoles = [], children }) {
  const { user, activeRole, loading } = useAuth();
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    const handleOpenAI = () => setIsAIOpen(true);
    window.addEventListener('open-clinical-ai', handleOpenAI);
    window.addEventListener('OPEN_ATLAS_CLINICAL_MODE', handleOpenAI);
    return () => {
      window.removeEventListener('open-clinical-ai', handleOpenAI);
      window.removeEventListener('OPEN_ATLAS_CLINICAL_MODE', handleOpenAI);
    };
  }, []);

  if (loading) return <AtlasLoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="portal-container">
      <PortalSidebar />

      <div className="portal-main-content">
        <PortalHeader onToggleAI={() => setIsAIOpen(true)} />

        <main className="portal-page-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%' }}
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <PortalAIDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <style>{`
        .portal-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .portal-main-content {
          flex: 1;
          margin-left: 248px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .portal-page-wrapper {
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .portal-main-content { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}

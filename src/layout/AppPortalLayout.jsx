import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalSidebar from './PortalSidebar';
import PortalHeader from './PortalHeader';
import PortalAIDrawer from './PortalAIDrawer';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppPortalLayout({ allowedRoles = [], children }) {
  const { user, activeRole, loading } = useAuth();
  const [isAIOpen, setIsAIOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <style>{`
          .spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid rgba(0,54,102,0.1); border-top-color: #003666; animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    // If the active role is not in the allowed list for this route, bounce them to home
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
          margin-left: 260px; /* matches sidebar width */
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

        /* Responsive */
        @media (max-width: 1024px) {
          .portal-main-content {
            margin-left: 0;
          }
          .portal-sidebar {
            transform: translateX(-100%);
          }
          /* We would add a mobile hamburger menu to toggle sidebar here */
        }
      `}</style>
    </div>
  );
}

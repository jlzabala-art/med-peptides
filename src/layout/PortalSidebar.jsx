import React from 'react';
import { NavLink } from 'react-router-dom';
import { getPortalTabs } from '../config/portalConfig';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function PortalSidebar() {
  const { activeRole } = useAuth();
  const tabs = getPortalTabs(activeRole);

  return (
    <aside className="portal-sidebar">
      <div className="sidebar-header">
        <img src="/assets/logo.svg" alt="Regenpept Logo" className="sidebar-logo" onError={(e) => e.target.style.display='none'} />
        <span className="sidebar-brand">Regenpept</span>
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink 
              key={tab.id} 
              to={tab.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end={tab.path === '/admin' || tab.path === '/doctor' || tab.path === '/supplier' || tab.path === '/paciente'}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sidebar-icon-wrapper"
              >
                <Icon className="sidebar-icon" />
              </motion.div>
              <span className="sidebar-label">{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        .portal-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 1px 0 10px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .sidebar-logo {
          height: 28px;
          margin-right: 12px;
        }

        .sidebar-brand {
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--color-primary, #003666);
          letter-spacing: -0.02em;
        }

        .sidebar-nav {
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: var(--color-text-secondary, #4a5568);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          background: rgba(0, 54, 102, 0.04);
          color: var(--color-primary, #003666);
        }

        .sidebar-link.active {
          background: rgba(0, 54, 102, 0.08);
          color: var(--color-primary, #003666);
          font-weight: 600;
        }

        .sidebar-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: inherit;
        }

        .sidebar-icon {
          font-size: 1.25rem;
        }
      `}</style>
    </aside>
  );
}

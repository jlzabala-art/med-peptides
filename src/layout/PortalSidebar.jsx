import Pin from "lucide-react/dist/esm/icons/pin";
import PinOff from "lucide-react/dist/esm/icons/pin-off";
import Star from "lucide-react/dist/esm/icons/star";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getPortalTabs } from '../config/portalConfig';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';




import AtlasHealthLogo from '../components/brand/AtlasHealthLogo';

const STORAGE_KEY = (uid, role) => `atlas_pinned_${uid}_${role}`;

function usePinnedTabs(uid, role) {
  const key = STORAGE_KEY(uid, role);
  const [pinned, setPinned] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  });

  const toggle = useCallback((tabId) => {
    setPinned(prev => {
      const next = prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return { pinned, toggle };
}

function SidebarNavItem({ tab, isActive, onPin, isPinned, showPin }) {
  const Icon = tab.icon;
  return (
    <motion.div className="sidebar-item-wrapper" whileHover="hover">
      <NavLink
        to={tab.path}
        className={({ isActive: a }) => `sidebar-link ${a ? 'active' : ''}`}
        end={['/admin', '/doctor', '/supplier', '/paciente', '/patient', '/wholesaler'].includes(tab.path)}
      >
        <motion.div
          variants={{ hover: { scale: 1.08 } }}
          className="sidebar-icon-wrapper"
        >
          <Icon size={17} className="sidebar-icon" />
        </motion.div>
        <span className="sidebar-label">{tab.label}</span>
      </NavLink>

      {/* Pin button — appears on hover */}
      <motion.button
        className={`sidebar-pin-btn ${isPinned ? 'pinned' : ''}`}
        onClick={(e) => { e.preventDefault(); onPin(tab.id); }}
        title={isPinned ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        variants={{ hover: { opacity: 1, scale: 1 } }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileTap={{ scale: 0.85 }}
      >
        {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
      </motion.button>
    </motion.div>
  );
}

export default function PortalSidebar({ isOpen, onClose }) {
  const { activeRole, user } = useAuth();
  const uid = user?.uid || 'anon';
  const tabs = getPortalTabs(activeRole);
  const { pinned, toggle } = usePinnedTabs(uid, activeRole);
  const [openCategory, setOpenCategory] = useState(null);

  const pinnedTabs = tabs.filter(t => pinned.includes(t.id));
  const restTabs   = tabs.filter(t => !pinned.includes(t.id));

  // Group restTabs by category
  const categories = restTabs.reduce((acc, tab) => {
    const cat = tab.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tab);
    return acc;
  }, {});

  const toggleCategory = (cat) => {
    setOpenCategory(prev => prev === cat ? null : cat);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`portal-sidebar ${isOpen ? 'open' : ''}`}>
      {/* ── Brand header ─────────────────────────────────── */}
      <div className="sidebar-header" style={{ justifyContent: 'center' }}>
        <AtlasHealthLogo size={42} style={{ flexShrink: 0 }} />
      </div>

      <nav className="sidebar-nav">
        {/* ── Favorites (always expanded) ──────────────── */}
        <AnimatePresence>
          {pinnedTabs.length > 0 && (
            <motion.div
              key="favorites-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="sidebar-section-label">
                <Star size={11} style={{ marginRight: 5 }} />
                Favoritos
              </div>
              {pinnedTabs.map(tab => (
                <SidebarNavItem
                  key={`pin-${tab.id}`}
                  tab={tab}
                  onPin={toggle}
                  isPinned={true}
                />
              ))}
              <div className="sidebar-divider" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Categories Accordion ────────────────────────────── */}
        {Object.keys(categories).map(catName => {
          const catTabs = categories[catName];
          const isOpen = openCategory === catName;
          return (
            <div key={catName} className="sidebar-category">
              <button 
                className="sidebar-category-header" 
                onClick={() => toggleCategory(catName)}
              >
                <span className="sidebar-category-title">{catName}</span>
                <ChevronDown 
                  size={14} 
                  style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
                    transition: 'transform 0.2s ease',
                    color: '#94a3b8' 
                  }} 
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="sidebar-category-content">
                      {catTabs.map(tab => (
                        <SidebarNavItem
                          key={tab.id}
                          tab={tab}
                          onPin={toggle}
                          isPinned={false}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <style>{`
        .portal-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 248px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border-right: 1px solid rgba(0,54,102,0.08);
          box-shadow: 2px 0 20px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          z-index: 10001; /* Higher than header */
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-overlay {
          display: none;
        }

        .sidebar-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          border-bottom: 1px solid rgba(0,54,102,0.07);
          flex-shrink: 0;
        }

        .sidebar-brand {
          font-weight: 700;
          font-size: 1.05rem;
          color: #003666;
          letter-spacing: -0.02em;
        }

        .sidebar-nav {
          padding: 0.75rem 0.75rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          flex: 1;
        }

        .sidebar-section-label {
          display: flex;
          align-items: center;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #00BCD4;
          padding: 0.6rem 0.75rem 0.3rem;
        }

        .sidebar-divider {
          height: 1px;
          background: rgba(0,54,102,0.07);
          margin: 0.5rem 0.5rem 0.65rem;
        }

        .sidebar-category {
          margin-bottom: 0.25rem;
        }

        .sidebar-category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          padding: 0.6rem 0.75rem;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.15s ease;
        }

        .sidebar-category-header:hover {
          background: rgba(0,54,102,0.03);
        }

        .sidebar-category-title {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }

        .sidebar-category-content {
          padding-left: 0.25rem;
          padding-top: 0.25rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-item-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          flex: 1;
          padding: 0.6rem 0.75rem;
          border-radius: 9px;
          color: #4a5568;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.88rem;
          transition: all 0.18s ease;
          min-width: 0;
        }

        .sidebar-link:hover {
          background: rgba(0,54,102,0.05);
          color: #003666;
        }

        .sidebar-link.active {
          background: linear-gradient(135deg, rgba(0,54,102,0.10), rgba(0,188,212,0.08));
          color: #003666;
          font-weight: 700;
          box-shadow: inset 2px 0 0 #003666;
        }

        .sidebar-icon-wrapper {
          display: flex;
          align-items: center;
          margin-right: 10px;
          color: inherit;
          flex-shrink: 0;
        }

        .sidebar-pin-btn {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          border: 1px solid rgba(0,54,102,0.12);
          border-radius: 5px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          padding: 0;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .sidebar-pin-btn:hover,
        .sidebar-pin-btn.pinned {
          background: #00BCD4;
          border-color: #00BCD4;
          color: white;
        }

        .sidebar-item-wrapper:not(:hover) .sidebar-pin-btn:not(.pinned) {
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 1024px) {
          .portal-sidebar { transform: translateX(-100%); }
          .portal-sidebar.open { transform: translateX(0); }
          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 30, 60, 0.4);
            backdrop-filter: blur(2px);
            z-index: 10000;
          }
        }
      `}</style>
    </aside>
    </>
  );
}
"use client";

import { useRouter } from 'next/navigation';










import React, { useState, useEffect } from 'react';

import ClinicalAssistant from '../shared/ClinicalAssistant';
import SidebarGadget from '../shared/AppSidebar/SidebarGadget';
import { db } from '../../firebase';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import CommandPalette from '../CommandPalette';
import useSessionTracking from '../../hooks/useSessionTracking';

import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import AvatarGenerator from './AvatarGenerator';
import AdminPortalSwitcher from '../shared/AppHeader/AdminPortalSwitcher';
import GlobalPreferencesDropdown from '../shared/AppHeader/GlobalPreferencesDropdown';
import RoleImpersonatorSelector from '../shell/RoleImpersonatorSelector';
import useAdminNotifications from '../../hooks/useAdminNotifications';
import { useCopilot } from '../../context/CopilotContext';
import CopilotWorkspacePanel from '../ai-copilot/CopilotWorkspacePanel';
import ContextualFAB from '../common/ContextualFAB';
import HelpDrawer from './HelpDrawer';
import PullToRefreshContainer from '../mobile/PullToRefreshContainer';
import { Menu, Search, Bell, HelpCircle, User, Bot, X, Sparkles, Maximize2, List, Briefcase } from '@/lib/icons';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useCart } from '../../context/CartProvider';
import MobileBottomNav from '../mobile/MobileBottomNav';

// ── Atlas AI — Suggested Prompts per Role (100% English) ──────────────────────
const ROLE_SUGGESTED_PROMPTS = {
  admin: [
    { label: '🔄 Sync catalog with Zoho' },
    { label: '🛠️ Check SKU Sync errors' },
    { label: '📦 Unprocessed orders today' },
    { label: '⚠️ Low stock alerts' },
    { label: '💰 Summarize accounts receivable (AR)' },
    { label: '📉 Project net income based on sales' },
  ],
  doctor: [
    { label: '💉 Weight loss protocol recommendations' },
    { label: '🔬 Clinical evidence for BPC-157' },
    { label: '💊 Drug interactions: Semaglutide + Metformin' },
    { label: '📋 Draft clinical summary note' },
    { label: '⚖️ Weight-adjusted Tirzepatide titration' },
  ],
  patient: [
    { label: '💬 Explain my current peptide protocol' },
    { label: '📅 What to expect in week 2 with BPC-157?' },
    { label: '🩺 Injection site redness — is this normal?' },
    { label: '⏰ Protocol adherence schedule' },
    { label: '📈 How to track biomarker progress' },
  ],
  wholesaler: [
    { label: '📦 Which peptides have highest demand?' },
    { label: '💰 Optimize margins with these cost tiers' },
    { label: '🗺️ Territory and clinic growth analysis' },
    { label: '📜 Regulatory guidance for Semaglutide' },
    { label: '🤝 B2B clinic proposal outline' },
  ],
  compounding_pharmacy: [
    { label: '⚗️ Formulation: BPC-157 200mcg/ml × 5ml' },
    { label: '🛒 Sourcing API for CJC-1295 with DAC' },
    { label: '🧊 Stability of Semax at 4°C vs -20°C' },
    { label: '✅ GMP compliance checklist' },
    { label: '💵 Compounding unit cost from API €/g' },
  ],
  supplier: [
    { label: '📄 Generate API technical data sheet' },
    { label: '📊 Demand forecast for Q3' },
    { label: '🤝 B2B wholesale partnership proposal' },
    { label: '📋 Export documentation and compliance' },
    { label: '🔬 Certificate of Analysis (COA) review' },
  ],
};

const ROLE_AGENT_TYPE = {
  admin: 'admin_operations',
  doctor: 'clinical_decision',
  patient: 'wellness_companion',
  wholesaler: 'b2b_optimizer',
  compounding_pharmacy: 'formulation_expert',
  supplier: 'api_catalog_expert',
};

const ROLE_BADGE_CONFIG = {
  admin: {
    label: 'ADMIN',
    name: 'Administrator',
    color: '#003666',
    bg: 'rgba(0, 54, 102, 0.08)',
    border: 'rgba(0, 54, 102, 0.22)',
  },
  doctor: {
    label: 'DOCTOR',
    name: 'Clinical MD',
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.08)',
    border: 'rgba(13, 148, 136, 0.22)',
  },
  patient: {
    label: 'PATIENT',
    name: 'Patient Portal',
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.22)',
  },
  wholesaler: {
    label: 'WHOLESALER',
    name: 'B2B Wholesale',
    color: '#c2410c',
    bg: 'rgba(194, 65, 12, 0.08)',
    border: 'rgba(194, 65, 12, 0.22)',
  },
  wholeseller: {
    label: 'WHOLESALER',
    name: 'B2B Wholesale',
    color: '#c2410c',
    bg: 'rgba(194, 65, 12, 0.08)',
    border: 'rgba(194, 65, 12, 0.22)',
  },
  supplier: {
    label: 'SUPPLIER',
    name: 'Raw API Supplier',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.08)',
    border: 'rgba(2, 132, 199, 0.22)',
  },
  clinic: {
    label: 'CLINIC',
    name: 'Clinical Facility',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
    border: 'rgba(5, 150, 105, 0.22)',
  },
  compounding_pharmacy: {
    label: 'PHARMACY',
    name: 'Compounding Pharmacy',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
    border: 'rgba(217, 119, 6, 0.22)',
  },
  pharmacy: {
    label: 'PHARMACY',
    name: 'Compounding Pharmacy',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
    border: 'rgba(217, 119, 6, 0.22)',
  },
};

/**
 * PortalLayout - The universal layout wrapper for all private portals
 * Mimics Google Cloud Console layout (Left Sidebar + Topbar + Main Area + Right AI Drawer)
 */
export default function PortalLayout({
  children,
  sidebarNavGroups = [],
  sidebarPinnedItems = [],
  activeNavId,
  onNavigate,
  portalTitle = 'Cloud Console',
  roleContext = 'patient',
  pageContext = null,
  headerActions,
}) {
  useSessionTracking(); // Start tracking session for the current user
  const routerNavigate = useRouter();
  const { user, userProfile } = useAuth();
  const { currency, updateCurrency, density, updateDensity } = usePreferences();
  const { cart } = useCart();
  const { toggleDrawer: toggleWorkspaceDrawer, getTotalItemCount, getActiveWorkspace } = useWorkspaceStore();
  const workspaceItemCount = getTotalItemCount();
  const activeWs = getActiveWorkspace();
  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAiOpen, setAiOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleOpenAi = () => setAiOpen(true);
    window.addEventListener('open-clinical-ai', handleOpenAi);
    return () => window.removeEventListener('open-clinical-ai', handleOpenAi);
  }, []);

  const { toggleCopilot, isOpen: isCopilotOpen } = useCopilot();
  // Holds live data injected by admin tab components via 'admin-context-update' events
  const [enrichedContext, setEnrichedContext] = useState(null);
  // Real-time attention notifications state
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [optimisticReadIds, setOptimisticReadIds] = useState([]); // Instant UI update
  // Command Palette
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  // Help Drawer
  const [isHelpOpen, setHelpOpen] = useState(false);

  // Listen for Cmd+K / Ctrl+K and ?
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K for Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      // Shift + / (?) for Help Drawer (only if not typing in an input)
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for custom event from Sidebar to open the command palette
  useEffect(() => {
    const openFromSidebar = () => setPaletteOpen(true);
    window.addEventListener('sidebar:open-palette', openFromSidebar);
    return () => window.removeEventListener('sidebar:open-palette', openFromSidebar);
  }, []);

  // Fetch real-time attention alerts using the custom polling hook
  const { data: notifications = [] } = useAdminNotifications(roleContext);

  // Derived state: Filter out read notifications and sort
  const readIds = userProfile?.read_notifications || [];
  const visibleNotifications = notifications
    .filter((n) => !readIds.includes(n.id) && !optimisticReadIds.includes(n.id))
    .sort((a, b) => {
      const severityScore = { critical: 3, warning: 2, info: 1 };
      return (severityScore[b.severity] || 0) - (severityScore[a.severity] || 0);
    });

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    
    setOptimisticReadIds(prev => [...prev, id]); // Instant UI update
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(id),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    if (!user || visibleNotifications.length === 0) return;
    
    const allIds = visibleNotifications.map((n) => n.id);
    setOptimisticReadIds(prev => [...prev, ...allIds]); // Instant UI update
    setNotificationsOpen(false);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(...allIds),
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Listen for context enrichment events from any admin tab
  useEffect(() => {
    const handleContextUpdate = (e) => {
      if (e?.detail) {
        setEnrichedContext((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('admin-context-update', handleContextUpdate);
    return () => window.removeEventListener('admin-context-update', handleContextUpdate);
  }, []);

  // Reset enrichedContext when the active tab/page changes
  useEffect(() => {
    Promise.resolve().then(() => setEnrichedContext(null));
  }, [pageContext?.activeTab]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setAiOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const siriAnimation = `
    @keyframes siriGlow {
      0%, 100% { box-shadow: 0 0 10px 2px rgba(168, 85, 247, 0.4); transform: scale(1); }
      50% { box-shadow: 0 0 25px 6px rgba(168, 85, 247, 0.8); transform: scale(1.08); }
    }
    @keyframes siriGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  const headerCSS = `
    .portal-header {
      height: 60px;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      border-top: 3px solid var(--color-primary, #003666);
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      padding: 0 1.5rem;
      position: relative;
      z-index: 101;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      box-sizing: border-box;
      width: 100%;
      overflow: visible;
    }
    .portal-header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow: visible;
      min-width: 0;
      flex-shrink: 1;
    }
    .portal-header-logo {
      height: 40px;
      width: auto;
      object-fit: contain;
      flex-shrink: 0;
    }
    .portal-header-sep {
      color: #e2e8f0;
      font-size: 1.4rem;
      font-weight: 300;
      flex-shrink: 0;
      line-height: 1;
    }
    .portal-header-title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 1;
      min-width: 0;
    }
    .portal-header-switcher {
      flex-shrink: 0;
    }
    /* CENTER: search bar (desktop) */
    .portal-header-center {
      min-width: 0;
      padding: 0 0.75rem;
      overflow: visible;
    }
    .portal-header-search-bar {
      display: flex;
      position: relative;
      width: 100%;
      max-width: clamp(200px, 24vw, 380px);
    }
    .portal-header-search-bar input {
      width: 100%;
      padding: 0.55rem 3.4rem 0.55rem 2.6rem;
      border-radius: 20px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.65);
      color: var(--color-text-primary);
      font-size: 0.85rem;
      outline: none;
      cursor: pointer;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }
    .portal-header-search-bar input:hover {
      background: rgba(255, 255, 255, 0.95);
      border-color: var(--color-primary, #003666);
    }
    .portal-header-search-kbd {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      font-size: 0.68rem;
      font-family: inherit;
      font-weight: 700;
      color: var(--color-text-secondary);
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 5px;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
    .portal-header-search-icon-inside {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--color-text-secondary);
      display: flex;
    }
    /* Mobile search ICON button — hidden on desktop */
    .portal-header-search-btn {
      display: none;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }
    /* RIGHT: never shrinks */
    .portal-header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.4rem;
      flex-shrink: 0;
      min-width: 0;
      padding-left: 0.5rem;
    }
    /* Preferences pill — hide on narrow */
    .portal-header-prefs { display: flex; }
    .portal-header-impersonator-wrap { display: flex; align-items: center; }
    @media (max-width: 840px) {
      .portal-header-prefs { display: none; }
    }
    /* ─ Responsive ─────────────────────────── */
    @media (max-width: 960px) {
      /* Shrink logo */
      .portal-header-logo { height: 32px; }
      /* Hide portal title text — keep switcher */
      .portal-header-title { display: none; }
      .portal-header-sep:first-of-type { display: none; }
    }
    @media (max-width: 768px) {
      .portal-header-impersonator-wrap { display: none !important; }
      .portal-header-sparkles-btn {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        padding: 0 !important;
        justify-content: center !important;
      }
      .portal-header-bell-btn {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
      }
    }
    @media (max-width: 720px) {
      /* Hide ALL text in left, show only logo + hamburger */
      .portal-header-sep { display: none; }
      .portal-header-logo { height: 28px; }
      /* Replace search bar with icon */
      .portal-header-search-bar { display: none; }
      .portal-header-search-btn { display: flex; }
      .portal-header { padding: 0 1rem; }
    }
    @media (max-width: 768px) {
      .portal-main-content {
        padding-bottom: calc(64px + env(safe-area-inset-bottom, 8px)) !important;
      }
    }
  `;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-app)',
      }}
    >
      <style>{siriAnimation}</style>
      <style>{headerCSS}</style>
      {/* TOPBAR */}
      <header className="portal-header">
        {/* LEFT: hamburger + logo + title + portal switcher */}
        <div className="portal-header-left">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title="Toggle Menu"
            >
              <Menu size={20} color="var(--color-text-primary)" />
            </button>
          )}
          {portalTitle ? (
            <>
              <span className="portal-header-title">{portalTitle}</span>
              <span className="portal-header-sep">|</span>
              <span className="portal-header-switcher">
                <AdminPortalSwitcher />
              </span>
            </>
          ) : (
            (() => {
              const roleBadge = ROLE_BADGE_CONFIG[roleContext] || ROLE_BADGE_CONFIG.admin;
              return (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    background: roleBadge.bg,
                    color: roleBadge.color,
                    border: `1px solid ${roleBadge.border}`,
                    marginLeft: '0.25rem',
                    flexShrink: 0,
                    boxShadow: `0 1px 4px ${roleBadge.color}15`,
                  }}
                  title={`Active Portal Role: ${roleBadge.name}`}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: roleBadge.color,
                      boxShadow: `0 0 6px ${roleBadge.color}`,
                      display: 'inline-block',
                    }}
                  />
                  {roleBadge.label}
                </span>
              );
            })()
          )}
        </div>

        {/* CENTER: search bar — hidden on mobile via CSS, collapses to nothing */}
        <div className="portal-header-center">
          <div className="portal-header-search-bar">
            <span className="portal-header-search-icon-inside">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search everything..."
              onClick={() => setPaletteOpen(true)}
              readOnly
            />
            <span className="portal-header-search-kbd">⌘K</span>
          </div>
        </div>

        {/* RIGHT: action buttons — never shrink */}
        <div className="portal-header-right">
          {/* Search icon — shown only on mobile (CSS), replaces the search bar */}
          <button
            className="portal-header-search-btn"
            onClick={() => setPaletteOpen(true)}
            title="Search"
          >
            <Search size={20} />
          </button>

          {/* Preferences pill — hidden on narrow screens via CSS */}
          <span className="portal-header-prefs">
            <GlobalPreferencesDropdown />
          </span>

          {/* Notifications Dropdown (GCP Attention Style) */}
          <div style={{ position: 'relative' }} className="portal-header-bell-wrap">
            <button
              className="portal-header-bell-btn"
              onClick={() => setNotificationsOpen(!isNotificationsOpen)}
              style={{
                ...iconBtnStyle,
                position: 'relative',
                backgroundColor: isNotificationsOpen
                  ? 'rgba(26,115,232,0.1)'
                  : 'rgba(255,255,255,0.5)',
                borderColor: isNotificationsOpen ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
              }}
              title="Alertas de Atención"
            >
              <Bell
                size={20}
                color={
                  visibleNotifications.length > 0
                    ? 'var(--color-warning, #f59e0b)'
                    : 'var(--color-text-secondary)'
                }
              />
              {visibleNotifications.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                  }}
                >
                  {visibleNotifications.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 'min(340px, 92vw)',
                  maxWidth: '92vw',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                    Attention Items
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-primary)',
                        fontWeight: 500,
                      }}
                    >
                      {visibleNotifications.length} pending
                    </span>
                    {visibleNotifications.length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {visibleNotifications.length === 0 ? (
                    <div
                      style={{
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                      }}
                    >
                      ✨ No items require attention.
                    </div>
                  ) : (
                    visibleNotifications.slice(0, 15).map((n, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (n.actionPath) {
                            // If path contains query string, navigate to /admin/<tab>?query
                            const [tabPart, queryPart] = n.actionPath.split('?');
                            const fullPath = `/admin/${tabPart}${queryPart ? '?' + queryPart : ''}`;
                            routerNavigate.push(fullPath);
                          }
                          setNotificationsOpen(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom:
                            idx < Math.min(visibleNotifications.length, 15) - 1
                              ? '1px solid rgba(0,0,0,0.04)'
                              : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: n.severity === 'critical' ? '#ef4444' : '#f59e0b',
                              backgroundColor: n.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {n.type}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {n.timeLabel}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#334155',
                            fontWeight: 500,
                            marginTop: '3px',
                          }}
                        >
                          {n.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {n.description}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleWorkspaceDrawer}
            style={{
              ...iconBtnStyle,
              position: 'relative',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderColor: 'rgba(0,0,0,0.05)',
              marginLeft: '0.25rem'
            }}
            title={`Espacios de Trabajo (${activeWs?.name || 'Workspace'} - ${workspaceItemCount} items)`}
          >
            <Briefcase
              size={20}
              color="var(--color-text-secondary)"
            />
            {workspaceItemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--color-primary, #003666)',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}
              >
                {workspaceItemCount}
              </span>
            )}
          </button>

          <button
            className="portal-header-sparkles-btn"
            onClick={() => {
              setAiOpen(!isAiOpen);
            }}
            style={{
              ...iconBtnStyle,
              padding: '0.4rem 0.8rem',
              borderRadius: '24px',
              gap: '6px',
              backgroundColor: isAiOpen
                ? 'rgba(168, 85, 247, 0.1)'
                : 'rgba(255,255,255,0.5)',
              borderColor: isAiOpen
                ? 'rgba(168, 85, 247, 0.4)'
                : 'rgba(0,0,0,0.05)',
            }}
            title="Ask Atlas AI anything"
          >
            <Sparkles
              size={16}
              color={
                isAiOpen
                  ? '#a855f7'
                  : 'var(--color-text-secondary)'
              }
            />
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isAiOpen
                  ? '#a855f7'
                  : 'var(--color-text-secondary)',
                display: isMobile ? 'none' : 'inline',
              }}
            >
              Atlas AI
            </span>
          </button>

          <div
            style={{ marginLeft: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <AvatarGenerator
              name={
                userProfile?.firstName && userProfile?.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile?.fullName || userProfile?.displayName
              }
              email={userProfile?.email || user?.email}
              size={36}
              onClick={() => routerNavigate(`/${roleContext}/my-profile`)}
            />
            {/* Role Impersonator Tool (Rule #14) — hidden on mobile topbar */}
            <span className="portal-header-impersonator-wrap">
              <RoleImpersonatorSelector />
            </span>

            {/* Header Actions (Logout icon from AdminDashboard) */}
            {headerActions}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR GADGET (Acts as Drawer on Mobile when isSidebarOpen is true) */}
        <SidebarGadget
          groups={sidebarNavGroups}
          pinnedItems={sidebarPinnedItems}
          activeId={activeNavId}
          onNavigate={onNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          header={{ title: '', subtitle: '' }} // Let PortalLayout topbar handle branding
          prefsKey={`${roleContext}_sidebar`}
        />

        {/* CENTER CONTENT */}
        <main
          className="portal-main-content"
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            maxWidth: '100%',
            backgroundColor: 'var(--color-bg-app)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PullToRefreshContainer>
            {children}
          </PullToRefreshContainer>
        </main>

        {/* Universal Atlas AI Assistant Drawer */}
        {isAiOpen && (
          <aside
            style={{
              width: isMobile ? '100%' : '300px',
              position: isMobile ? 'absolute' : 'relative',
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: 'var(--color-bg-surface)',
              borderLeft: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: isMobile ? 60 : 40,
              boxShadow: isMobile ? '-4px 0 15px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {isMobile && (
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles size={18} /> Atlas AI
                </span>
                <button
                  onClick={() => setAiOpen(false)}
                  style={{ background: 'none', border: 'none' }}
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ClinicalAssistant
                embedded={true}
                isOpen={true}
                setIsOpen={() => setAiOpen(false)}
                pageContext={enrichedContext ? { ...pageContext, ...enrichedContext } : pageContext}
                contextMode={roleContext}
                agentType={ROLE_AGENT_TYPE[roleContext] || 'default'}
                suggestedPrompts={ROLE_SUGGESTED_PROMPTS[roleContext] || []}
              />
            </div>
          </aside>
        )}
      </div>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setPaletteOpen(false)}
        navGroups={sidebarNavGroups}
        pinnedItems={sidebarPinnedItems}
        onNavigate={onNavigate}
        portalType={roleContext}
        onAskAI={(q) => {
          setPaletteOpen(false);
          setAiOpen(true);
          // Dispatch after a tick so the panel is mounted before receiving the event
          if (q && q.trim()) {
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('ATLAS_PREFILL_QUERY', { detail: { query: q } })
              );
            }, 150);
          }
        }}
      />
      <CopilotWorkspacePanel />
      <ClinicalAssistant
        embedded={false}
        isOpen={isAiOpen}
        setIsOpen={setAiOpen}
        pageContext={enrichedContext ? { ...pageContext, ...enrichedContext } : pageContext}
        contextMode={roleContext}
        agentType={ROLE_AGENT_TYPE[roleContext] || 'default'}
        suggestedPrompts={ROLE_SUGGESTED_PROMPTS[roleContext] || []}
      />
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      <MobileBottomNav 
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenAi={() => setAiOpen(true)}
      />
    </div>
  );
}

const iconBtnStyle = {
  background: 'rgba(255,255,255,0.5)',
  border: '1px solid rgba(0,0,0,0.05)',
  padding: '0.5rem',
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
};

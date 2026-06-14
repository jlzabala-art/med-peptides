import Menu from "lucide-react/dist/esm/icons/menu";
import Search from "lucide-react/dist/esm/icons/search";
import Bell from "lucide-react/dist/esm/icons/bell";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import User from "lucide-react/dist/esm/icons/user";
import Bot from "lucide-react/dist/esm/icons/bot";
import X from "lucide-react/dist/esm/icons/x";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import List from "lucide-react/dist/esm/icons/list";
import React, { useState, useEffect } from 'react';










import ClinicalAssistant from '../shared/ClinicalAssistant';
import SidebarGadget from '../shared/AppSidebar/SidebarGadget';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import CommandPalette from '../CommandPalette';
import useSessionTracking from '../../hooks/useSessionTracking';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import AvatarGenerator from './AvatarGenerator';
import AdminPortalSwitcher from '../shared/AppHeader/AdminPortalSwitcher';
import GlobalPreferencesDropdown from '../shared/AppHeader/GlobalPreferencesDropdown';
import useAdminNotifications from '../../hooks/useAdminNotifications';
import { useCopilot } from '../../context/CopilotContext';
import CopilotWorkspacePanel from '../ai-copilot/CopilotWorkspacePanel';
import ContextualFAB from '../common/ContextualFAB';

// ── Atlas AI — Suggested Prompts per Role ──────────────────────────────────────
const ROLE_SUGGESTED_PROMPTS = {
  admin: [
    { label: '🔄 Sync catalog with Zoho' },
    { label: '🛠️ Check SKU Sync errors' },
    { label: '📦 Unprocessed orders today' },
    { label: '⚠️ Low stock alerts' },
    { label: '💰 Summarize accounts receivable (AR)' },
    { label: '📉 Project net income based on sales' }
  ],
  doctor: [
    { label: '💉 Protocolo para pérdida de peso' },
    { label: '🔬 Evidencia clínica BPC-157' },
    { label: '💊 Interacciones: Semaglutide + Metformina' },
    { label: '📋 Redactar nota clínica' },
    { label: '⚖️ Dosis ajustada por peso para Tirzepatide' },
  ],
  patient: [
    { label: '💬 Explícame mi protocolo actual' },
    { label: '📅 ¿Qué esperar en semana 2 con BPC-157?' },
    { label: '🩺 Tuve rojez en el sitio — ¿es normal?' },
    { label: '⏰ Recordatorio de adherencia' },
    { label: '📈 ¿Cómo mido mi progreso?' },
  ],
  wholesaler: [
    { label: '📦 ¿Qué péptidos tienen más demanda?' },
    { label: '💰 Optimizar márgenes con estos costos' },
    { label: '🗺️ Análisis de territorio para Madrid' },
    { label: '📜 Regulación Semaglutide en España' },
    { label: '🤝 Presentación para nueva clínica' },
  ],
  compounding_pharmacy: [
    { label: '⚗️ Formulación BPC-157 200mcg/ml × 5ml' },
    { label: '🛒 Sourcing API CJC-1295 con DAC' },
    { label: '🧊 Estabilidad Semax a 4°C vs -20°C' },
    { label: '✅ ¿Cumple mi proceso con GMP España?' },
    { label: '💵 Precio de formulación desde API a €X/g' },
  ],
  supplier: [
    { label: '📄 Generar ficha técnica de API' },
    { label: '📊 Forecast demanda Q3' },
    { label: '🤝 Propuesta B2B para nuevo wholesaler' },
    { label: '📋 Documentación para exportar a México' },
    { label: '🔬 Interpretar Certificate of Analysis' },
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
  headerActions
}) {
  useSessionTracking(); // Start tracking session for the current user
  const routerNavigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { currency, updateCurrency, density, updateDensity } = usePreferences();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAiOpen, setAiOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { toggleCopilot, isOpen: isCopilotOpen } = useCopilot();
  // Holds live data injected by admin tab components via 'admin-context-update' events
  const [enrichedContext, setEnrichedContext] = useState(null);
  // Real-time attention notifications state
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  // Command Palette
  const [isPaletteOpen, setPaletteOpen] = useState(false);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
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
    .filter(n => !readIds.includes(n.id))
    .sort((a, b) => {
      const severityScore = { critical: 3, warning: 2, info: 1 };
      return (severityScore[b.severity] || 0) - (severityScore[a.severity] || 0);
    });

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(id)
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    if (!user || visibleNotifications.length === 0) return;
    try {
      const allIds = visibleNotifications.map(n => n.id);
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(...allIds)
      });
      setNotificationsOpen(false);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Listen for context enrichment events from any admin tab
  useEffect(() => {
    const handleContextUpdate = (e) => {
      if (e?.detail) {
        setEnrichedContext(prev => ({ ...prev, ...e.detail }));
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
      const mobile = window.innerWidth < 1024;
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
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      padding: 0 1.5rem;
      position: relative;
      z-index: 50;
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
      max-width: 420px;
    }
    .portal-header-search-bar input {
      width: 100%;
      padding: 0.55rem 1rem 0.55rem 2.6rem;
      border-radius: 24px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.5);
      color: var(--color-text-primary);
      font-size: 0.88rem;
      outline: none;
      cursor: pointer;
      box-sizing: border-box;
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
      background: rgba(255,255,255,0.5);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 50%;
      padding: 0.45rem;
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
    @media (max-width: 720px) {
      /* Hide ALL text in left, show only logo + hamburger */
      .portal-header-sep { display: none; }
      .portal-header-logo { height: 28px; }
      /* Replace search bar with icon */
      .portal-header-search-bar { display: none; }
      .portal-header-search-btn { display: flex; }
      .portal-header { padding: 0 1rem; }
    }
  `;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-bg-app)' }}>
      <style>{siriAnimation}</style>
      <style>{headerCSS}</style>
      {/* TOPBAR */}
      <header className="portal-header">
        {/* LEFT: hamburger + logo + title + portal switcher */}
        <div className="portal-header-left">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="Toggle Menu"
            >
              <Menu size={20} color="var(--color-text-primary)" />
            </button>
          )}
          {portalTitle && (
            <>
              <span className="portal-header-title">{portalTitle}</span>
              <span className="portal-header-sep">|</span>
              <span className="portal-header-switcher"><AdminPortalSwitcher /></span>
            </>
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
              placeholder="Search everything... (Cmd+K)"
              onClick={() => setPaletteOpen(true)}
              readOnly
            />
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
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setNotificationsOpen(!isNotificationsOpen)} 
              style={{
                ...iconBtnStyle,
                position: 'relative',
                backgroundColor: isNotificationsOpen ? 'rgba(26,115,232,0.1)' : 'rgba(255,255,255,0.5)',
                borderColor: isNotificationsOpen ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)'
              }} 
              title="Alertas de Atención"
            >
              <Bell size={20} color={visibleNotifications.length > 0 ? 'var(--color-warning, #f59e0b)' : 'var(--color-text-secondary)'} />
              {visibleNotifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {visibleNotifications.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Attention Items</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>{visibleNotifications.length} pending</span>
                    {visibleNotifications.length > 0 && (
                      <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.7rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Mark all read</button>
                    )}
                  </div>
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {visibleNotifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
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
                            routerNavigate(fullPath);
                          }
                          setNotificationsOpen(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: idx < Math.min(visibleNotifications.length, 15) - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          textAlign: 'left'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: n.severity === 'critical' ? '#ef4444' : '#f59e0b',
                            backgroundColor: n.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {n.type}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{n.timeLabel}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500, marginTop: '3px' }}>{n.title}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{n.description}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (roleContext === 'admin') {
                toggleCopilot();
              } else {
                setAiOpen(!isAiOpen);
              }
            }}
            style={{
              ...iconBtnStyle,
              padding: '0.4rem 0.8rem',
              borderRadius: '24px',
              gap: '6px',
              backgroundColor: (roleContext === 'admin' ? isCopilotOpen : isAiOpen) ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.5)',
              borderColor: (roleContext === 'admin' ? isCopilotOpen : isAiOpen) ? 'rgba(168, 85, 247, 0.4)' : 'rgba(0,0,0,0.05)'
            }}
            title="Ask Atlas anything"
          >
            <Sparkles size={16} color={(roleContext === 'admin' ? isCopilotOpen : isAiOpen) ? '#a855f7' : 'var(--color-text-secondary)'} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: (roleContext === 'admin' ? isCopilotOpen : isAiOpen) ? '#a855f7' : 'var(--color-text-secondary)', display: isMobile ? 'none' : 'inline' }}>
              Atlas AI
            </span>
          </button>

          <div style={{ marginLeft: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AvatarGenerator 
              name={(userProfile?.firstName && userProfile?.lastName) ? `${userProfile.firstName} ${userProfile.lastName}` : (userProfile?.fullName || userProfile?.displayName)}
              email={userProfile?.email || user?.email}
              size={36}
              onClick={() => routerNavigate(`/${roleContext}/my-profile`)}
            />
            {/* Header Actions (Logout icon from AdminDashboard) */}
            {headerActions}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR GADGET */}
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
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          backgroundColor: 'var(--color-bg-app)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </main>

        {/* AdminAIAssistant removed in favor of CopilotWorkspacePanel */}
        {isAiOpen && roleContext !== 'admin' && (
          <aside style={{
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
            boxShadow: isMobile ? '-4px 0 15px rgba(0,0,0,0.1)' : 'none'
          }}>
            {isMobile && (
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} /> Atlas AI
                </span>
                <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none' }}><X size={20} /></button>
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
              window.dispatchEvent(new CustomEvent('ATLAS_PREFILL_QUERY', { detail: { query: q } }));
            }, 150);
          }
        }}
      />
      <CopilotWorkspacePanel />
      <ContextualFAB />
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
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
};
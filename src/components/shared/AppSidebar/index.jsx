"use client";

import React, { useEffect, useMemo } from 'react';
import { Plus, MoreHorizontal, LogOut, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Star, LayoutDashboard, Users, CheckSquare, Building, Eye, X } from '@/lib/icons';
import AtlasHealthLogo from '../../brand/AtlasHealthLogo';
import { useNavigationStore } from '../../../stores/navigationStore';
import { useSimulationStore, ALL_ROLES } from '../../../stores/useSimulationStore';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import QuickCreateDropdown from './QuickCreateDropdown';
import { prefetchModuleData } from '../../../utils/speculativePrefetch';
import './AppSidebar.css';


// ── Main AppSidebar ───────────────────────────────────────────────────────────
export default function AppSidebar({
  groups = [],
  activeId,
  onNavigate,
  isMobile,
  footer,
  isOpen,
  onClose
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { 
    expandedGroups, toggleGroup, setExpandedGroups,
    favorites, toggleFavorite,
    recents, addRecent
  } = useNavigationStore();


  const { simulatedRole, exitSimulation } = useSimulationStore();
  const simulatedRoleData = ALL_ROLES.find((r) => r.id === simulatedRole);
  const pathname = usePathname() || '';

  // Determine the effective role for filtering:
  const effectiveRole = simulatedRole || 'admin';

  // Filter groups and items based on effective role
  const filteredGroups = groups
    .filter((group) => !group.roles || group.roles.includes(effectiveRole))
    .map((group) => ({
      ...group,
      items: (group.items || []).filter(
        (item) => !item.roles || item.roles.includes(effectiveRole)
      ),
    }))
    .filter((group) => group.items.length > 0);

  // Auto-expand the group that contains the current active route
  useEffect(() => {
    if (!pathname) return;
    // Extract the slug from /admin/<slug> or treat '' as Overview
    const parts = pathname.split('/').filter(Boolean);
    const currentSlug = parts.length > 1 ? parts.slice(1).join('/') : '';
    for (const group of filteredGroups) {
      const hasActive = group.items?.some(item => item.id === currentSlug || item.id === '');
      if (hasActive && !expandedGroups.includes(group.id)) {
        toggleGroup(group.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Local visual expand/collapse with persistence and compact-laptop intelligence
  const [expanded, setExpanded] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('atlas_sidebar_expanded');
      if (saved !== null) return saved === 'true';
      // Auto-collapse on compact laptop screens (1024px to 1280px) to maximize table working area
      if (window.innerWidth >= 1024 && window.innerWidth <= 1280) return false;
    }
    return true;
  });

  const handleToggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('atlas_sidebar_expanded', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Publish sidebar width as a CSS var so fixed-position overlays (e.g. QuickView drawer)
  // can align to the sidebar edge without JS coupling.
  useEffect(() => {
    const w = isMobile ? '0px' : expanded ? 'var(--sb-w-full)' : 'var(--sb-w-mini)';
    document.documentElement.style.setProperty('--sidebar-current-width', w);
    return () => document.documentElement.style.removeProperty('--sidebar-current-width');
  }, [expanded, isMobile]);

  // Helper to extract an item by ID from the global registry (so we can render favs/recents)
  const getItemById = (id) => {
    for (const g of groups) {
      const found = g.items?.find(i => i.id === id);
      if (found) return found;
    }
    return null;
  };

  const handleNavigate = (id) => {
    addRecent(id);
    onNavigate(id);
  };

  const renderItem = (item, level = 1, prefix = '') => {
    if (!item) return null;
    const Icon = item.icon;
    // Extract current slug from pathname: /admin/patients -> 'patients', /admin -> ''
    const parts = pathname.split('/').filter(Boolean);
    const currentSlug = parts.length > 1 ? parts.slice(1).join('/') : '';
    const isActive = item.id === '' ? currentSlug === '' : currentSlug === item.id || currentSlug.startsWith(item.id + '/');
    const isFav = favorites.includes(item.id);

    const targetHref = item.id === 'b2c-shop' ? '/' : `/${effectiveRole}/${item.id === 'dashboard' ? '' : item.id}`;

    return (
      <div 
        key={`${prefix}${item.id}`} 
        className={`sb-item ${isActive ? 'active' : ''} level-${level}`}
        data-tooltip={!expanded ? item.label : undefined}
        onMouseEnter={() => {
          try {
            router.prefetch(targetHref);
            prefetchModuleData(item.id, queryClient, effectiveRole);
          } catch (e) {}
        }}

      >
        <Link 
          href={targetHref}
          className="sb-item-btn" 
          onClick={(e) => {
            // Let the Link handle navigation normally, but still record recents if needed
            addRecent(item.id);
            // We do NOT call preventDefault here so Next.js router handles the navigation
            if (isMobile) {
              onClose?.();
            }
          }}
          prefetch={true}
        >
          <span className="sb-item-icon" style={{ position: 'relative' }}>
            {Icon && <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
            {!expanded && !isMobile && item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: typeof item.badge === 'object' ? item.badge.bg || '#ef4444' : '#ef4444',
                  boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)'
                }}
              />
            )}
          </span>
          {(expanded || isMobile) && (
            <span className="sb-item-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, gap: '6px' }}>
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                <span 
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: typeof item.badge === 'object' ? item.badge.bg || '#ef4444' : '#ef4444',
                    color: typeof item.badge === 'object' ? item.badge.color || '#ffffff' : '#ffffff',
                    lineHeight: '1.2'
                  }}
                >
                  {typeof item.badge === 'object' ? item.badge.text : item.badge}
                </span>
              )}
            </span>
          )}
        </Link>
        
        {(expanded || isMobile) && (
          <button 
            className={`sb-item-action ${isFav ? 'fav-active' : ''}`} 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star size={14} fill={isFav ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="sb-mobile-overlay" 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 999,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}
      <aside className={`app-sidebar ${!expanded ? 'collapsed' : ''} ${isMobile && isOpen ? 'mobile-open' : ''}`}>
      {/* Top Header Section */}
      <div className="sb-header">
        <div className="sb-brand">
          <AtlasHealthLogo size={24} />
          {(expanded || isMobile) && <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--sb-text)' }}>Atlas Health</span>}
        </div>
        {isMobile ? (
          <button 
            className="sb-close-btn" 
            onClick={onClose}
            aria-label="Close menu"
            style={{ 
              marginLeft: 'auto', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              width: '44px', 
              height: '44px', 
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--sb-text)',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        ) : (
          <button 
            className="sb-hamburger" 
            onClick={handleToggleExpanded}
            style={{ marginLeft: expanded ? 'auto' : '0' }}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </div>

      <nav className="sb-scroll">
        
        {/* Quick Create Dropdown */}
        {expanded && (
          <QuickCreateDropdown onNavigate={onNavigate} activeRole={effectiveRole} />
        )}

        {/* Simulation Badge */}
        {expanded && simulatedRole && simulatedRoleData && (
          <div
            style={{
              margin: '8px 12px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: `${simulatedRoleData.color}15`,
              border: `1.5px solid ${simulatedRoleData.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: simulatedRoleData.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Eye size={13} /> {simulatedRoleData.emoji} {simulatedRoleData.label}
            </span>
            <button
              onClick={exitSimulation}
              style={{ fontSize: '0.7rem', color: simulatedRoleData.color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              Exit
            </button>
          </div>
        )}

        {/* Favorites Section */}
        {expanded && favorites.length > 0 && (
          <div className="sb-group">
            <div className="sb-group-header">Favorites</div>
            <div className="sb-group-items">
              {favorites.map(id => renderItem(getItemById(id), 1, 'fav-'))}
            </div>
          </div>
        )}

        {/* Recents Section */}
        {expanded && recents.length > 0 && (
          <div className="sb-group">
            <div className="sb-group-header">Recent</div>
            <div className="sb-group-items">
              {recents.map(id => renderItem(getItemById(id), 1, 'recent-'))}
            </div>
          </div>
        )}

        {/* Dynamic Groups — filtered by effective role */}
        {filteredGroups.map((group) => {
          const isGroupExpanded = expandedGroups.includes(group.id);
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="sb-group hierarchical">
              <button 
                className="sb-group-toggle"
                onClick={() => {
                  if (!expanded) setExpanded(true);
                  toggleGroup(group.id);
                }}
              >
                {GroupIcon && <GroupIcon size={18} strokeWidth={2} style={{ color: 'var(--text-muted)', marginRight: expanded ? 8 : 0 }} />}
                {expanded && (
                  <>
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {group.label.toUpperCase()}
                    </span>
                    {isGroupExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </>
                )}
              </button>

              {/* Sub-items (Level 2) */}
              {(isGroupExpanded || !expanded) && (
                <div className={`sb-group-items ${!expanded ? 'sb-flyout' : ''}`}>
                  {group.items?.map(item => renderItem(item, 2, `group-${group.id}-`))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      {footer && (
        <div className="sb-footer">
          <button className="sb-item sb-item-btn" onClick={footer.onClick} data-tooltip={!expanded ? footer.label : undefined}>
            <span className="sb-item-icon"><LogOut size={18} /></span>
            {expanded && <span className="sb-item-label">{footer.label}</span>}
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
/**
 * AppSidebar — Shared Google Cloud-style sidebar
 * Used by: AdminDashboard, DoctorDashboard, WholesalerHome, AdminLayout
 *
 * Props:
 *   storageKey  {string}   — localStorage key for persistence (e.g. 'admin-sidebar')
 *   groups      {Array}    — NAV_GROUPS (see format below)
 *   activeId    {string}   — currently active item ID
 *   onNavigate  {function} — called with item.id when clicked
 *   accentColor {string}   — CSS color for active item border (default: #0071bd)
 *   header      {object}   — { title, subtitle }
 *   footer      {object}   — { label, icon: LucideIcon, onClick }
 *
 * NAV_GROUPS format:
 *   [{ id, label, emoji, items: [{ id, label, icon: LucideIcon, badge? }] }]
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Menu, ChevronDown, LogOut } from 'lucide-react';
import './AppSidebar.css';

export default function AppSidebar({
  storageKey = 'app-sidebar',
  groups = [],
  activeId,
  onNavigate,
  accentColor = '#0071bd',
  header = {},
  footer,
  isOpen,
  onClose,
  isMobile
}) {
  // ── Persistent state ──────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}:expanded`) ?? 'true'); }
    catch { return true; }
  });

  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`${storageKey}:openGroups`) ?? 'null');
      if (saved) return new Set(saved);
    } catch {}
    // Default: open the group that contains the active item
    return new Set(groups.map(g => g.id));
  });

  // Persist on change
  useEffect(() => {
    localStorage.setItem(`${storageKey}:expanded`, JSON.stringify(expanded));
  }, [expanded, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:openGroups`, JSON.stringify([...openGroups]));
  }, [openGroups, storageKey]);

  // Auto-open the group containing the active item
  useEffect(() => {
    const activeGroup = groups.find(g => g.items?.some(i => i.id === activeId));
    if (activeGroup) {
      setOpenGroups(prev => { const next = new Set(prev); next.add(activeGroup.id); return next; });
    }
  }, [activeId, groups]);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!isMobile) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobile, onClose]);

  const toggleGroup = useCallback((groupId) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  }, []);

  const handleItemClick = useCallback((itemId) => {
    onNavigate?.(itemId);
    if (isMobile) onClose?.();
  }, [onNavigate, isMobile, onClose]);

  const sidebarClasses = [
    'app-sidebar',
    !expanded && !isMobile ? 'collapsed' : '',
    isOpen && isMobile ? 'mobile-open' : '',
  ].filter(Boolean).join(' ');

  // CSS custom property for active accent per portal
  const sidebarStyle = { '--sb-active-border': accentColor, '--sb-active-bg': `${accentColor}25` };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div className="sb-overlay" onClick={onClose} />
      )}

      <aside className={sidebarClasses} style={sidebarStyle} aria-label="Main navigation">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="sb-header">
          {!isMobile && (
            <button
              className="sb-hamburger"
              onClick={() => setExpanded(e => !e)}
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              <Menu size={18} />
            </button>
          )}
          <div className="sb-brand">
            {header.title && <span className="sb-brand-title">{header.title}</span>}
            {header.subtitle && <span className="sb-brand-sub">{header.subtitle}</span>}
          </div>
        </div>

        {/* ── Scrollable nav ───────────────────────────────────────────────── */}
        <nav className="sb-scroll" role="navigation">
          {groups.map((group, gi) => {
            const isOpen = openGroups.has(group.id);
            const items = group.items || [];
            const maxH = isOpen ? `${items.length * 40 + 8}px` : '0px';

            return (
              <div key={group.id} className="sb-group">
                {/* Group header */}
                <button
                  className="sb-group-header"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  data-tooltip={!expanded ? group.label : undefined}
                  title={!expanded ? group.label : undefined}
                >
                  <span className="sb-group-emoji" aria-hidden="true">{group.emoji}</span>
                  <span className="sb-group-label">{group.label}</span>
                  {group.badge && expanded && (
                    <span style={{
                      fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px',
                      padding: '1px 5px', borderRadius: '3px',
                      backgroundColor: group.badgeColor || '#0071bd',
                      color: 'white', marginRight: '4px',
                    }}>
                      {group.badge}
                    </span>
                  )}
                  <ChevronDown
                    size={13}
                    className={`sb-group-chevron${isOpen ? ' open' : ''}`}
                  />
                </button>

                {/* Items — always rendered but height-animated */}
                <div
                  className="sb-group-items"
                  style={{ maxHeight: expanded ? maxH : '999px' }}
                >
                  {items.map(item => {
                    const Icon = item.icon;
                    const isActive = item.id === activeId;
                    return (
                      <button
                        key={item.id}
                        className={`sb-item${isActive ? ' active' : ''}`}
                        onClick={() => handleItemClick(item.id)}
                        data-tooltip={!expanded ? item.label : undefined}
                        title={!expanded ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        data-testid={`sb-item-${item.id}`}
                      >
                        <span className="sb-item-icon">
                          {Icon && <Icon size={16} />}
                        </span>
                        <span className="sb-item-label" data-testid={`sb-label-${item.id}`}>{item.label}</span>
                        {!!item.badge && (
                          <span className="sb-item-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Divider between groups */}
                {gi < groups.length - 1 && <div className="sb-divider" />}
              </div>
            );
          })}
        </nav>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {footer && (
          <div className="sb-footer">
            <button
              className="sb-item"
              onClick={footer.onClick}
              data-tooltip={!expanded ? footer.label : undefined}
              title={!expanded ? footer.label : undefined}
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <span className="sb-item-icon">
                {footer.icon ? <footer.icon size={16} /> : <LogOut size={16} />}
              </span>
              <span className="sb-item-label">{footer.label}</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

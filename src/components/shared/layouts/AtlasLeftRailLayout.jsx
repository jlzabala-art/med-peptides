'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Menu, Lock } from '@/lib/icons';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import UnifiedMobileSidebarDrawer from '@/components/shared/public/UnifiedMobileSidebarDrawer';

const STORAGE_KEY_DEFAULT = 'atlas_left_rail_mode';

/**
 * AtlasLeftRailLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Always-Left 4-Zone Contextual Shell for Desktop (>=1280px),
 * Compact Laptop (1024px-1279px -> smart 64px Mini-Rail), and Mobile (<1024px).
 */
export default function AtlasLeftRailLayout({
  title = 'Navigation',
  status = null,
  statusLabel = '',
  entityId = '',
  navItems = [], // [{ id, label, icon, badge?, href?, onClick? }]
  activeNavId = '',
  onSelectNav = null,
  navTitle = 'Context',
  propertiesTitle = 'Entity Properties',
  properties = [], // [{ label, value, copyable?, status?, statusLabel? }]
  primaryAction = null,
  secondaryActions = [],
  links = [],
  extraRailContent = null,
  storageKey = STORAGE_KEY_DEFAULT,
  defaultLaptopMode = 'mini', // 'mini' | 'expanded'
  showMobilePill = true,
  mobileTriggerLabel = 'Sections & Context',
  containerClassName = '',
  children,
}) {
  const [railMode, setRailMode] = useState('expanded'); // 'expanded' | 'mini'
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hydration-safe viewport + localStorage initialization
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let active = true;

    let saved = null;
    try {
      saved = window.localStorage.getItem(storageKey);
    } catch {
      // ignore storage errors
    }

    const isCompactLaptop = window.innerWidth >= 1024 && window.innerWidth <= 1279;
    let initialMode = 'expanded';
    if (saved === 'mini' || saved === 'collapsed') {
      initialMode = 'mini';
    } else if (saved === 'expanded') {
      initialMode = 'expanded';
    } else if (isCompactLaptop && defaultLaptopMode === 'mini') {
      initialMode = 'mini';
    }

    Promise.resolve().then(() => {
      if (active) setRailMode(initialMode);
    });

    return () => {
      active = false;
    };
  }, [storageKey, defaultLaptopMode]);

  const toggleRailMode = useCallback(() => {
    setRailMode((prev) => {
      const next = prev === 'mini' ? 'expanded' : 'mini';
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, [storageKey]);

  // Listen to unified mobile toggle + Cmd/Ctrl + \ shortcut
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onToggleMobile = () => {
      if (window.innerWidth < 1024) {
        setMobileOpen((prev) => !prev);
      } else {
        toggleRailMode();
      }
    };
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        if (window.innerWidth < 1024) setMobileOpen((prev) => !prev);
        else toggleRailMode();
      }
    };

    window.addEventListener('atlas:toggle-left-sidebar', onToggleMobile);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('atlas:toggle-left-sidebar', onToggleMobile);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [toggleRailMode]);

  const isMini = railMode === 'mini';

  const renderRailContent = (inMobileDrawer = false) => {
    const miniMode = isMini && !inMobileDrawer;

    return (
      <div className="gcp-sb-card atlas-left-rail-inner">
        {/* Zone 1: Identity & Collapse Header */}
        <div className="atlas-left-z1">
          {!miniMode && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
              </div>
              {(status || entityId) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {status && <StatusBadge status={status} customLabel={statusLabel || undefined} />}
                  {entityId && <CopyableId value={entityId} maxLength={16} />}
                </div>
              )}
            </div>
          )}

          {!inMobileDrawer && (
            <button
              type="button"
              onClick={toggleRailMode}
              className="atlas-left-collapse-btn"
              aria-label={miniMode ? 'Expand sidebar' : 'Collapse sidebar to mini rail'}
              title={miniMode ? 'Expand sidebar (Ctrl/Cmd+\\)' : 'Collapse sidebar (Ctrl/Cmd+\\)'}
            >
              {miniMode ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          )}
        </div>

        {/* Zone 2: Primary Context Tree */}
        {navItems.length > 0 && (
          <div className="atlas-left-z2">
            {!miniMode && (
              <div className="gcp-sb-section-title gcp-sb-section-title--static" style={{ marginBottom: '4px' }}>
                {navTitle}
              </div>
            )}
            <div className="gcp-sb-items" style={{ paddingRight: miniMode ? 0 : '0.45rem' }}>
              {navItems.map((item) => {
                const Icon = item.icon || null;
                const isActive = activeNavId === item.id;
                const cls = `gcp-sb-item ${isActive ? 'is-active' : ''}`;

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cls}
                      data-tooltip={miniMode ? item.label : undefined}
                      title={miniMode ? item.label : undefined}
                      onClick={() => {
                        item.onClick?.();
                        if (inMobileDrawer) setMobileOpen(false);
                      }}
                    >
                      <span className="gcp-sb-item-main" style={{ justifyContent: miniMode ? 'center' : 'flex-start' }}>
                        {Icon && (
                          <span className="gcp-sb-item-icon">
                            <Icon size={16} />
                          </span>
                        )}
                        {!miniMode && <span className="gcp-sb-item-label">{item.label}</span>}
                      </span>
                      {!miniMode && item.badge !== undefined && item.badge !== null && (
                        <span className="gcp-sb-count">{item.badge}</span>
                      )}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cls}
                    data-tooltip={miniMode ? item.label : undefined}
                    title={miniMode ? item.label : undefined}
                    onClick={() => {
                      if (onSelectNav) onSelectNav(item.id);
                      else item.onClick?.();
                      if (inMobileDrawer) setMobileOpen(false);
                    }}
                  >
                    <span className="gcp-sb-item-main" style={{ justifyContent: miniMode ? 'center' : 'flex-start' }}>
                      {Icon && (
                        <span className="gcp-sb-item-icon">
                          <Icon size={16} />
                        </span>
                      )}
                      {!miniMode && <span className="gcp-sb-item-label">{item.label}</span>}
                    </span>
                    {!miniMode && item.badge !== undefined && item.badge !== null && (
                      <span className="gcp-sb-count">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Zone 3: Live Context Summary (hidden in 64px mini mode, collapsible on laptop) */}
        {!miniMode && properties.length > 0 && (
          <details className="atlas-left-z3" open>
            <summary className="atlas-left-z3-summary">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} style={{ color: '#80868b' }} />
                <span>{propertiesTitle}</span>
              </span>
            </summary>
            <div className="gcp-sb-kv-list" style={{ padding: '0 0.875rem 0.5rem' }}>
              {properties.map((prop) => (
                <div key={prop.label} className="gcp-sb-kv-row">
                  <span className="gcp-sb-kv-label">{prop.label}</span>
                  {prop.status ? (
                    <StatusBadge status={prop.status} customLabel={prop.statusLabel || prop.value} />
                  ) : prop.copyable ? (
                    <CopyableId value={String(prop.value || '')} maxLength={18} truncate={Boolean(prop.truncate)} />
                  ) : (
                    <span className="gcp-sb-kv-value">{prop.value}</span>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {!miniMode && extraRailContent}

        {!miniMode && links.length > 0 && (
          <div style={{ padding: '0.5rem 0.875rem', borderTop: '1px solid var(--gcp-sb-divider, #e8eaed)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {links.map((lnk) => (
              <Link
                key={lnk.href}
                href={lnk.href}
                onClick={() => inMobileDrawer && setMobileOpen(false)}
                className="gcp-sb-item"
                style={{ minHeight: '32px', fontSize: '0.78rem', padding: '4px 8px' }}
              >
                <span className="gcp-sb-item-label">{lnk.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Zone 4: Pinned Action Footer */}
        {(primaryAction || secondaryActions.length > 0) && (
          <div className="gcp-sb-actions atlas-left-z4" style={{ alignItems: miniMode ? 'center' : 'stretch' }}>
            {primaryAction && (
              <button
                type="button"
                onClick={() => {
                  primaryAction.onClick?.();
                  if (inMobileDrawer) setMobileOpen(false);
                }}
                className="gcp-btn-primary"
                title={miniMode ? primaryAction.label : undefined}
                style={{ width: miniMode ? '40px' : '100%', padding: miniMode ? '0' : undefined, minHeight: '36px', justifyContent: 'center' }}
              >
                {primaryAction.icon && <primaryAction.icon size={15} />}
                {!miniMode && <span>{primaryAction.label}</span>}
              </button>
            )}

            {secondaryActions.map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={() => {
                  act.onClick?.();
                  if (inMobileDrawer) setMobileOpen(false);
                }}
                className="gcp-btn-secondary"
                title={miniMode ? act.label : undefined}
                style={{
                  width: miniMode ? '40px' : '100%',
                  padding: miniMode ? '0' : '0.42rem 0.75rem',
                  minHeight: '36px',
                  justifyContent: 'center',
                  color: '#5f6368',
                  borderColor: '#dadce0',
                  background: '#ffffff',
                }}
              >
                {act.icon && <act.icon size={15} />}
                {!miniMode && <span>{act.label}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={containerClassName}>
      {/* Mobile Top Context Pill (< 1024px) */}
      {showMobilePill && (
        <div className="atlas-left-mobile-pill no-print">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="gcp-btn-secondary"
            style={{ minHeight: '38px', padding: '4px 10px', color: '#202124', borderColor: '#dadce0', background: '#ffffff', fontSize: '0.8rem' }}
          >
            <Menu size={16} />
            <span>{mobileTriggerLabel}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
            {status && <StatusBadge status={status} customLabel={statusLabel || undefined} />}
            {entityId && <CopyableId value={entityId} maxLength={16} />}
          </div>
        </div>
      )}

      {/* Canonical Left-Only Desktop/Laptop Shell */}
      <div className={`atlas-left-shell ${isMini ? 'is-mini' : ''}`}>
        <aside className={`atlas-left-rail no-print ${isMini ? 'is-mini' : ''}`} aria-label={title}>
          {renderRailContent(false)}
        </aside>
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>

      {/* Unified Left Off-Canvas Drawer (< 1024px) */}
      <UnifiedMobileSidebarDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title={title}
      >
        {renderRailContent(true)}
      </UnifiedMobileSidebarDrawer>
    </div>
  );
}

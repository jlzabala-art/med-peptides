'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Menu, Sparkles } from '@/lib/icons';
import UnifiedMobileSidebarDrawer from './UnifiedMobileSidebarDrawer';
import './ContextualSidebar.css';

/**
 * ContextualSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified, GCP-compliant sidebar built on gcp-sidebar.css & UnifiedMobileSidebarDrawer
 * for public entity, collection, and catalog views.
 */
export default function ContextualSidebar({
  title = '',
  subtitle = '',
  badge = null,
  sections = [],
  primaryAction = null,
  secondaryAction = null,
  showAtlasAiButton = true,
  atlasAiLabel = 'Ask Atlas AI',
  onOpenAtlasAi = null,
  children = null,
  mobileTriggerLabel = 'Navigation & Filters',
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({});

  const toggleSection = (id) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAi = () => {
    if (onOpenAtlasAi) {
      onOpenAtlasAi();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
    }
    setMobileOpen(false);
  };

  const sidebarBody = (
    <div className="gcp-sb-card">
      {(title || subtitle || badge) && (
        <div className="gcp-sb-card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {title && (
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--gcp-sb-text, #202124)' }}>
                {title}
              </h3>
            )}
            {badge && <span className="gcp-sb-count">{badge}</span>}
          </div>
          {subtitle && (
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--gcp-sb-text-secondary, #5f6368)', lineHeight: 1.45 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="gcp-sb-card-body">
        {sections.map((sec, secIdx) => {
          const isOpen = collapsed[sec.id] === undefined ? sec.defaultOpen !== false : !collapsed[sec.id];
          return (
            <React.Fragment key={sec.id}>
              {secIdx > 0 && <div className="gcp-sb-divider" />}
              <div className="gcp-sb-section">
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className="gcp-sb-section-title"
                  aria-expanded={isOpen}
                >
                  <span>{sec.title}</span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isOpen && Array.isArray(sec.items) && (
                  <div className="gcp-sb-items">
                    {sec.items.map((item) => {
                      const cls = `gcp-sb-item ${item.active ? 'is-active' : ''}`;
                      if (item.href) {
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cls}
                          >
                            <span className="gcp-sb-item-main">
                              <span className="gcp-sb-item-label">{item.label}</span>
                            </span>
                            {item.count !== undefined && <span className="gcp-sb-count">{item.count}</span>}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            item.onClick?.();
                            setMobileOpen(false);
                          }}
                          className={cls}
                        >
                          <span className="gcp-sb-item-main">
                            <span className="gcp-sb-item-label">{item.label}</span>
                          </span>
                          {item.count !== undefined && <span className="gcp-sb-count">{item.count}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {children}

      {(primaryAction || secondaryAction || showAtlasAiButton) && (
        <div className="gcp-sb-actions">
          {primaryAction && (
            <button
              type="button"
              onClick={() => {
                primaryAction.onClick?.();
                setMobileOpen(false);
              }}
              className="gcp-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={() => {
                secondaryAction.onClick?.();
                setMobileOpen(false);
              }}
              className="gcp-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', color: '#3c4043' }}
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )}

          {showAtlasAiButton && (
            <button
              type="button"
              onClick={handleOpenAi}
              className="gcp-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', color: '#3c4043' }}
            >
              <Sparkles size={14} />
              <span>{atlasAiLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="contextual-sidebar-desktop">{sidebarBody}</div>

      <div className="contextual-sidebar-mobile">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="gcp-sb-mobile-trigger"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Menu size={16} />
            <span>{mobileTriggerLabel}</span>
          </span>
        </button>

        <UnifiedMobileSidebarDrawer
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          title={mobileTriggerLabel}
          icon={<Menu size={16} />}
        >
          {sidebarBody}
        </UnifiedMobileSidebarDrawer>
      </div>
    </>
  );
}

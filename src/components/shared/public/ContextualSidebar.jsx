'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X, Sparkles } from 'lucide-react';
import './ContextualSidebar.css';

/**
 * ContextualSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified, mobile-responsive sidebar for public entity detail, collection,
 * and catalog views (/collection/*, /p/*, /proto/*, /pricing/*).
 *
 * Enforces 3 standard zones:
 *  1. Context Header (title, subtitle, optional status/count badge)
 *  2. Sections / Navigation (collapsible groups or nav links)
 *  3. Sticky Action Footer (primary CTA, secondary CTA, unified Ask Atlas AI)
 */
export default function ContextualSidebar({
  title = '',
  subtitle = '',
  badge = null,
  sections = [], // [{ id, title, defaultOpen?, items: [{ id, label, count?, active?, onClick, href? }] }]
  primaryAction = null, // { label, onClick, icon? }
  secondaryAction = null, // { label, onClick, icon? }
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
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* 1. Context Header */}
      {(title || subtitle || badge) && (
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {title && (
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                {title}
              </h3>
            )}
            {badge && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  whiteSpace: 'nowrap',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* 2. Collapsible Navigation / Filter Sections */}
      {sections.map((sec) => {
        const isOpen = collapsed[sec.id] === undefined ? sec.defaultOpen !== false : !collapsed[sec.id];
        return (
          <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => toggleSection(sec.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '0.25rem 0',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <span>{sec.title}</span>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {isOpen && Array.isArray(sec.items) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {sec.items.map((item) => {
                  const baseStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: item.active ? '#eff6ff' : 'transparent',
                    color: item.active ? '#1d4ed8' : '#334155',
                    fontWeight: item.active ? 600 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  };

                  if (item.href) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        style={baseStyle}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
                        {item.count !== undefined && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.count}</span>
                        )}
                      </a>
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
                      style={baseStyle}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                      {item.count !== undefined && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Optional custom slot */}
      {children}

      {/* 3. Sticky Action Footer */}
      {(primaryAction || secondaryAction || showAtlasAiButton) && (
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {primaryAction && (
            <button
              type="button"
              onClick={() => {
                primaryAction.onClick?.();
                setMobileOpen(false);
              }}
              className="gcp-btn-primary"
              style={{ width: '100%', minHeight: '40px', borderRadius: '10px', fontSize: '0.84rem' }}
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
              style={{ width: '100%', minHeight: '38px', borderRadius: '10px', fontSize: '0.82rem', color: '#5f6368', background: '#ffffff' }}
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
              style={{ width: '100%', minHeight: '38px', borderRadius: '10px', fontSize: '0.82rem', color: '#5f6368', background: '#ffffff' }}
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
      {/* Desktop Sticky Sidebar */}
      <div className="contextual-sidebar-desktop">{sidebarBody}</div>

      {/* Mobile Compact Trigger + Drawer */}
      <div className="contextual-sidebar-mobile">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            minHeight: '44px',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <Menu size={16} />
          <span>{mobileTriggerLabel}</span>
        </button>

        {mobileOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9990,
              background: 'rgba(15, 23, 42, 0.5)',
              display: 'flex',
              justifyContent: 'flex-start',
            }}
            onClick={() => setMobileOpen(false)}
          >
            <div
              style={{
                width: 'min(320px, 86vw)',
                height: '100%',
                background: '#f8fafc',
                padding: '1rem',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    border: 'none',
                    background: '#e2e8f0',
                    borderRadius: '999px',
                    width: '32px',
                    height: '32px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              {sidebarBody}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

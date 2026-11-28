'use client';

import React from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronRight, Lock, Building2, ArrowRight } from '@/lib/icons';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';

/**
 * GcpInspectorSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Google Cloud Console Right Inspector Panel ("On This Page" +
 * "Entity Properties" + "Quick Actions / Connected Resources" + "Traceability QR").
 * Standardizes width (300px), hairline #dadce0 borders, 8px radius, and mobile collapse.
 */
export default function GcpInspectorSidebar({
  title = 'Entity Properties',
  mobileSummaryTitle = 'Entity Properties & Summary',
  mobileSummaryBadge = '',
  navItems = [],
  activeNavId = '',
  onSelectNav = null,
  navTitle = 'On This Page',
  progressPct = null,
  properties = [],
  linksTitle = 'Connected Resources',
  links = [],
  primaryAction = null,
  secondaryActions = [],
  qr = null,
  extraCards = null,
  children = null,
  className = '',
}) {
  const propertiesRows = properties.length > 0 && (
    <div className="gcp-sb-kv-list" style={{ padding: 0 }}>
      {properties.map((prop) => (
        <div key={prop.label} className="gcp-sb-kv-row">
          <span className="gcp-sb-kv-label">{prop.label}</span>
          {prop.status ? (
            <StatusBadge status={prop.status} customLabel={prop.statusLabel || prop.value} />
          ) : prop.copyable ? (
            <CopyableId
              value={String(prop.value || '')}
              maxLength={prop.maxLength || 22}
              truncate={Boolean(prop.truncate)}
            />
          ) : (
            <span className="gcp-sb-kv-value">{prop.value}</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Collapsible Mobile Summary <= 1024px */}
      {properties.length > 0 && (
        <details className="gcp-sb-mobile-summary gcp-sb-card no-print">
          <summary>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} />
              <span>{mobileSummaryTitle}</span>
            </span>
            {mobileSummaryBadge && <StatusBadge status="active" customLabel={mobileSummaryBadge} />}
          </summary>
          <div style={{ padding: '0.25rem 1rem 0.9rem', borderTop: '1px solid #f1f3f4' }}>
            {propertiesRows}
          </div>
        </details>
      )}

      {/* Canonical Desktop Right Inspector */}
      <aside className={`gcp-sb-inspector no-print ${className}`.trim()} aria-label={title}>
        {navItems.length > 0 && (
          <div className="gcp-sb-card">
            <div className="gcp-sb-card-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span className="gcp-sb-section-title gcp-sb-section-title--static" style={{ padding: 0 }}>
                  {navTitle}
                </span>
                {typeof progressPct === 'number' && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gcp-sb-text-secondary, #5f6368)' }}>
                    {Math.round(progressPct)}%
                  </span>
                )}
              </div>
              {typeof progressPct === 'number' && (
                <div style={{ height: '3px', background: '#e8eaed', borderRadius: '99px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ width: `${Math.min(100, Math.max(0, progressPct))}%`, height: '100%', background: 'var(--gcp-sb-accent, #1a73e8)', transition: 'width 0.15s ease-out' }} />
                </div>
              )}
            </div>
            <div className="gcp-sb-card-body">
              <div className="gcp-sb-items">
                {navItems.map((item) => {
                  const Icon = item.icon || null;
                  const isActive = activeNavId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectNav?.(item.id)}
                      className={`gcp-sb-item ${isActive ? 'is-active' : ''}`}
                    >
                      <span className="gcp-sb-item-main">
                        {Icon && (
                          <span className="gcp-sb-item-icon">
                            <Icon size={14} />
                          </span>
                        )}
                        <span className="gcp-sb-item-label">{item.label}</span>
                      </span>
                      <ChevronRight size={13} style={{ opacity: isActive ? 1 : 0.4, flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {properties.length > 0 && (
          <div className="gcp-sb-card">
            <div style={{ padding: '0.85rem 1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.55rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e8eaed',
                }}
              >
                <span className="gcp-sb-section-title gcp-sb-section-title--static" style={{ padding: 0 }}>
                  {title}
                </span>
                <Lock size={13} style={{ color: '#80868b' }} />
              </div>
              {propertiesRows}
            </div>
          </div>
        )}

        {(links.length > 0 || primaryAction || secondaryActions.length > 0) && (
          <div className="gcp-sb-card">
            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {linksTitle && (
                <div className="gcp-sb-section-title gcp-sb-section-title--static" style={{ padding: 0, marginBottom: '0.15rem' }}>
                  {linksTitle}
                </div>
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="gcp-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {primaryAction.icon && <primaryAction.icon size={14} />}
                  <span>{primaryAction.label}</span>
                </button>
              )}

              {secondaryActions.map((act) => (
                <button
                  key={act.label}
                  type="button"
                  onClick={act.onClick}
                  className="gcp-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', color: '#3c4043' }}
                >
                  {act.icon && <act.icon size={14} />}
                  <span>{act.label}</span>
                </button>
              ))}

              {links.map((lnk) => (
                <Link
                  key={lnk.href}
                  href={lnk.href}
                  className="gcp-btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    color: '#5f6368',
                    background: '#ffffff',
                    borderColor: '#dadce0',
                    fontSize: '0.8125rem',
                    padding: '0.45rem 0.9rem',
                  }}
                >
                  <span>{lnk.label}</span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {qr?.value && (
          <div className="gcp-sb-card">
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '0.5rem', display: 'inline-flex' }}>
                <QRCodeSVG
                  value={qr.value}
                  size={qr.size || 124}
                  level="M"
                  fgColor="#202124"
                  bgColor="#ffffff"
                />
              </div>
              {qr.title && (
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gcp-sb-text, #202124)' }}>
                  {qr.title}
                </div>
              )}
              {qr.subtitle && (
                <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--gcp-sb-text-secondary, #5f6368)', lineHeight: 1.4 }}>
                  {qr.subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {extraCards}
        {children}
      </aside>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from '@/lib/icons';

/**
 * GcpFilterRail
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Google Cloud Console Left Filter & Context Rail archetype.
 * Replaces fragmented per-catalog/collection sidebars with unified border,
 * left-bar active state, tabular-nums counts, and monochrome actions.
 */
export default function GcpFilterRail({
  title = '',
  subtitle = '',
  badge = '',
  sections = [],
  credentials = [],
  stepsTitle = '',
  steps = [],
  actions = null,
  className = '',
  asRailContainer = true,
  children = null,
}) {
  const [collapsedSections, setCollapsedSections] = useState({});
  const [stepsOpen, setStepsOpen] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const toggleSection = (id) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyUrl = async () => {
    if (!actions?.copyUrl) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(actions.copyUrl);
      }
      setCopiedUrl(true);
      toast.success(actions.copySuccessMessage || 'Link copied to clipboard');
      setTimeout(() => setCopiedUrl(false), 2400);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const innerContent = (
    <>
      {(title || subtitle || badge) && (
        <div className="gcp-sb-card">
          <div className="gcp-sb-card-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              {title && (
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--gcp-sb-text, #202124)' }}>
                  {title}
                </h3>
              )}
              {badge && (
                <span className="gcp-sb-count">{badge}</span>
              )}
            </div>
            {subtitle && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gcp-sb-text-secondary, #5f6368)', lineHeight: 1.45 }}>
                {subtitle}
              </p>
            )}
          </div>

          {credentials.length > 0 && (
            <div style={{ padding: '0.65rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {credentials.map((cred, idx) => {
                const CredIcon = cred.icon || ShieldCheck;
                return (
                  <div key={cred.label || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.75rem', color: '#3c4043' }}>
                    <CredIcon size={14} style={{ color: 'var(--gcp-sb-accent, #1a73e8)', flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      <strong>{cred.label}</strong>
                      {cred.detail ? ` — ${cred.detail}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {sections.length > 0 && (
        <div className="gcp-sb-card">
          <div className="gcp-sb-card-body">
            {sections.map((sec, secIdx) => {
              const isCollapsible = sec.collapsible !== false;
              const isOpen =
                collapsedSections[sec.id] === undefined
                  ? sec.defaultOpen !== false
                  : !collapsedSections[sec.id];

              return (
                <React.Fragment key={sec.id}>
                  {secIdx > 0 && <div className="gcp-sb-divider" />}
                  <div className="gcp-sb-section">
                    <button
                      type="button"
                      onClick={() => isCollapsible && toggleSection(sec.id)}
                      className={`gcp-sb-section-title ${!isCollapsible ? 'gcp-sb-section-title--static' : ''}`}
                      aria-expanded={isOpen}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{sec.title}</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {sec.totalLabel && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--gcp-sb-text-muted, #80868b)' }}>
                            {sec.totalLabel}
                          </span>
                        )}
                        {isCollapsible && (isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />)}
                      </span>
                    </button>

                    {isOpen && Array.isArray(sec.items) && (
                      <div className="gcp-sb-items">
                        {sec.items.map((item) => {
                          const ItemIcon = item.icon || null;
                          const itemClass = `gcp-sb-item ${item.active ? 'is-active' : ''}`;

                          if (item.href) {
                            return (
                              <Link
                                key={item.id}
                                href={item.href}
                                title={item.tooltip || undefined}
                                className={itemClass}
                                onClick={item.onClick}
                              >
                                <span className="gcp-sb-item-main">
                                  {ItemIcon && (
                                    <span className="gcp-sb-item-icon">
                                      <ItemIcon size={14} />
                                    </span>
                                  )}
                                  <span className="gcp-sb-item-label">{item.label}</span>
                                </span>
                                {item.count !== undefined && item.count !== null && (
                                  <span className="gcp-sb-count">{item.count}</span>
                                )}
                              </Link>
                            );
                          }

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={item.onClick}
                              title={item.tooltip || undefined}
                              className={itemClass}
                            >
                              <span className="gcp-sb-item-main">
                                {ItemIcon && (
                                  <span className="gcp-sb-item-icon">
                                    <ItemIcon size={14} />
                                  </span>
                                )}
                                <span className="gcp-sb-item-label">{item.label}</span>
                              </span>
                              {item.count !== undefined && item.count !== null && (
                                <span className="gcp-sb-count">{item.count}</span>
                              )}
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
        </div>
      )}

      {steps.length > 0 && (
        <div className="gcp-sb-card">
          <div style={{ padding: '0.75rem 1rem' }}>
            <button
              type="button"
              onClick={() => setStepsOpen((v) => !v)}
              className="gcp-sb-section-title"
              style={{ padding: 0, marginBottom: stepsOpen ? '0.65rem' : 0 }}
              aria-expanded={stepsOpen}
            >
              <span>{stepsTitle || 'Workflow'}</span>
              {stepsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>

            {stepsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {steps.map((st, idx) => (
                  <div key={st.num || st.step || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: 'var(--gcp-sb-accent, #1a73e8)',
                        background: 'var(--gcp-sb-accent-soft, #e8f0fe)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        flexShrink: 0,
                      }}
                    >
                      {st.num || st.step || `0${idx + 1}`}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.77rem', fontWeight: 600, color: 'var(--gcp-sb-text, #202124)', lineHeight: 1.3 }}>
                        {st.title}
                      </div>
                      {st.desc && (
                        <div style={{ fontSize: '0.71rem', color: 'var(--gcp-sb-text-secondary, #5f6368)', lineHeight: 1.35, marginTop: '2px' }}>
                          {st.desc}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {children}

      {actions && (
        <div className="gcp-sb-card">
          <div className="gcp-sb-actions" style={{ borderTop: 'none' }}>
            {actions.primaryCta && (
              actions.primaryCta.href ? (
                <Link
                  href={actions.primaryCta.href}
                  className="gcp-btn-primary"
                  style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
                >
                  {actions.primaryCta.icon && <actions.primaryCta.icon size={14} />}
                  <span>{actions.primaryCta.label}</span>
                  <ArrowRight size={13} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={actions.primaryCta.onClick}
                  className="gcp-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {actions.primaryCta.icon && <actions.primaryCta.icon size={14} />}
                  <span>{actions.primaryCta.label}</span>
                </button>
              )
            )}

            {actions.secondaryCta && (
              actions.secondaryCta.href ? (
                <Link
                  href={actions.secondaryCta.href}
                  className="gcp-btn-secondary"
                  style={{ width: '100%', textDecoration: 'none', justifyContent: 'center', color: '#3c4043' }}
                >
                  {actions.secondaryCta.icon && <actions.secondaryCta.icon size={14} />}
                  <span>{actions.secondaryCta.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={actions.secondaryCta.onClick}
                  className="gcp-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', color: '#3c4043' }}
                >
                  {actions.secondaryCta.icon && <actions.secondaryCta.icon size={14} />}
                  <span>{actions.secondaryCta.label}</span>
                </button>
              )
            )}

            {actions.copyUrl && (
              <button
                type="button"
                onClick={handleCopyUrl}
                className="gcp-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', color: '#3c4043' }}
              >
                {copiedUrl ? <Check size={14} style={{ color: '#1e8e3e' }} /> : <Copy size={14} />}
                <span>{copiedUrl ? (actions.copiedLabel || 'Link Copied') : (actions.copyLabel || 'Copy Canonical Link')}</span>
              </button>
            )}

            {actions.onOpenAi && (
              <button
                type="button"
                onClick={actions.onOpenAi}
                className="gcp-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', color: '#3c4043' }}
              >
                <Sparkles size={14} />
                <span>{actions.aiLabel || 'Ask Atlas AI'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (!asRailContainer) {
    return <div className={className}>{innerContent}</div>;
  }

  return (
    <aside className={`gcp-sb-rail ${className}`.trim()}>
      {innerContent}
    </aside>
  );
}

'use client';

import React from 'react';

/**
 * PageHeroCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical institutional hero card used across /pricing/*, /vials, /proto,
 * /calculator, /compounding, /p/[slug], and /dr/[slug].
 * Derived from the clean /pricing/colway document header:
 *   - Left: Eyebrow pills/badges + H1 + subtitle
 *   - Right: Stamp / Metadata box (DOCUMENT REF, CURRENCY, etc.)
 */
export default function PageHeroCard({
  brandLeft = 'ATLAS HEALTH',
  brandRight,
  badges = [],
  eyebrow,
  title,
  subtitle,
  metaItems = [],
  actions,
  children,
  className = '',
}) {
  const hasEyebrow = Boolean(eyebrow || brandLeft || brandRight || badges.length > 0);

  return (
    <section className={`atlas-hero-card ${className}`.trim()} aria-label={typeof title === 'string' ? title : 'Page header'}>
      <div className="atlas-hero-row">
        <div className="atlas-hero-identity">
          {hasEyebrow && (
            <div className="atlas-hero-eyebrow">
              {eyebrow ? (
                eyebrow
              ) : (
                <>
                  {brandLeft && <span className="atlas-hero-pill-primary">{brandLeft}</span>}
                  {brandLeft && brandRight && <span className="atlas-hero-cross">×</span>}
                  {brandRight && <span className="atlas-hero-pill-secondary">{brandRight}</span>}
                  {badges.map((badge, idx) => (
                    <span key={idx} className="atlas-hero-pill-secondary">
                      {badge}
                    </span>
                  ))}
                </>
              )}
            </div>
          )}

          {title && <h1 className="atlas-hero-title">{title}</h1>}
          {subtitle && <p className="atlas-hero-subtitle">{subtitle}</p>}
        </div>

        {metaItems.length > 0 && (
          <div className="atlas-hero-stamp-box">
            {metaItems.map((item, idx) => (
              <div key={item.label || idx} className="atlas-hero-stamp-item">
                <span className="atlas-hero-stamp-label">{item.label}</span>
                <span
                  className={`atlas-hero-stamp-value ${item.mono ? 'font-mono' : ''}`.trim()}
                  style={item.color ? { color: item.color } : undefined}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {actions && <div className="atlas-hero-actions">{actions}</div>}
      {children}
    </section>
  );
}

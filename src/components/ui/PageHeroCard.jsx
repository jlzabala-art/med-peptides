'use client';

import React from 'react';

/**
 * PageHeroCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Google Cloud Console Compact Resource Hero used across all Atlas
 * screens (/calculator, /pricing/peptides, /pricing/pens, /pricing/pellets,
 * /pricing/24genetics, /pricing/colway*, /vials, /proto, /compounding).
 *
 * Compact Single-Band Architecture (≤ 84px on Laptop · ≤ 112px on Mobile):
 *   - Left: Eyebrow chips (Brand + Badges + inline REF/Meta chips) + 1-line H1 + concise subtitle
 *   - Right (same horizontal row on Laptop): Action toolbar buttons
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
  const hasEyebrow = Boolean(
    eyebrow || brandLeft || brandRight || badges.length > 0 || metaItems.length > 0
  );

  return (
    <section
      className={`atlas-hero-card ${className}`.trim()}
      aria-label={typeof title === 'string' ? title : 'Page header'}
    >
      <div className="atlas-hero-row">
        <div className="atlas-hero-identity">
          {hasEyebrow && (
            <div className="atlas-hero-eyebrow">
              {eyebrow ? (
                eyebrow
              ) : (
                <>
                  {brandLeft && <span className="atlas-hero-pill-primary">{brandLeft}</span>}
                  {brandRight && <span className="atlas-hero-pill-secondary">{brandRight}</span>}
                  {badges.map((badge, idx) => (
                    <span key={idx} className="atlas-hero-pill-secondary">
                      {badge}
                    </span>
                  ))}
                  {metaItems.map((item, idx) => (
                    <span
                      key={item.label || idx}
                      className={`atlas-hero-pill-meta ${item.mono ? 'font-mono' : ''}`.trim()}
                      style={item.color ? { color: item.color } : undefined}
                    >
                      {item.label && <strong className="atlas-hero-pill-meta-lbl">{item.label}</strong>}{' '}
                      <span>{item.value}</span>
                    </span>
                  ))}
                </>
              )}
            </div>
          )}

          {title && <h1 className="atlas-hero-title">{title}</h1>}
          {subtitle && <p className="atlas-hero-subtitle">{subtitle}</p>}
        </div>

        {actions && <div className="atlas-hero-actions">{actions}</div>}
      </div>

      {children}
    </section>
  );
}

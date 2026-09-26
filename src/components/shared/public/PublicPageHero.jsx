"use client";

import React from 'react';

/**
 * PublicPageHero
 * Universal Hero section for Med-Peptides public pages.
 * Standardizes card surface, heading hierarchy, badge group, and responsive secondary module.
 */
export default function PublicPageHero({
  badges,
  title,
  description,
  meta,
  desktopSecondary,
  mobileSecondary,
  className = '',
  id = null,
  style = {}
}) {
  return (
    <section className={`pds-hero-card ${className}`} id={id} style={style}>
      <div className="pds-hero-layout">
        <div className="pds-hero-main">
          {badges && (
            <div className="pds-hero-badge-group">
              {badges}
            </div>
          )}

          <h1 className="pds-hero-title">
            {title}
          </h1>

          {description && (
            <div className="pds-hero-desc">
              {description}
            </div>
          )}

          {meta && (
            <div style={{ marginTop: '0.85rem' }}>
              {meta}
            </div>
          )}

          {mobileSecondary && (
            <div className="pds-mobile-verification-bar">
              {mobileSecondary}
            </div>
          )}
        </div>

        {desktopSecondary && (
          <div className="pds-hero-side">
            {desktopSecondary}
          </div>
        )}
      </div>
    </section>
  );
}

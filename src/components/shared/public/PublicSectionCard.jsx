"use client";

import React from 'react';
import { ShieldCheck } from '@/lib/icons';

/**
 * PublicSectionCard
 * Universal section container with deep navy gradient header or subtle top-border accent.
 * Replicates the authoritative clinical look established in the Product Monograph.
 */
export default function PublicSectionCard({
  id,
  icon: Icon = ShieldCheck,
  category,
  badge,
  badgeVariant = 'green',
  title,
  rightAction,
  children,
  variant = 'navy',
  bodyPadding = true,
  className = '',
  style = {}
}) {
  const isSubtle = variant === 'subtle';

  return (
    <section id={id} className={`pds-section-card ${isSubtle ? 'is-subtle' : ''} ${className}`} style={style}>
      {!isSubtle && (
        <div className="pds-section-header">
          <div className="pds-section-header-left">
            {Icon && (
              <div className="pds-section-header-shield">
                <Icon size={18} />
              </div>
            )}
            <div className="pds-section-header-titles">
              {(category || badge) && (
                <div className="pds-section-header-meta-row">
                  {category && (
                    <span className="pds-section-header-category">{category}</span>
                  )}
                  {badge && (
                    <span className={`pds-section-badge ${badgeVariant === 'cyan' ? 'is-cyan' : badgeVariant === 'purple' ? 'is-purple' : ''}`}>
                      {badge}
                    </span>
                  )}
                </div>
              )}
              {title && (
                <h3 className="pds-section-header-title">{title}</h3>
              )}
            </div>
          </div>

          {rightAction && (
            <div className="pds-section-header-right">
              {rightAction}
            </div>
          )}
        </div>
      )}

      <div className={`pds-section-card-body ${!bodyPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </section>
  );
}

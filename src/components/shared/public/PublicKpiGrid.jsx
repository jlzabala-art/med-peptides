"use client";

import React from 'react';

/**
 * PublicKpiCard
 * Individual clinical metric card with icon box, uppercase title, prominent value, and subtitle.
 */
export function PublicKpiCard({
  icon: Icon,
  iconBg = '#eff6ff',
  iconColor = '#0284c7',
  title,
  value,
  subtitle,
  subColor,
  className = '',
  style = {}
}) {
  return (
    <div className={`pds-kpi-card ${className}`} style={style}>
      {Icon && (
        <div className="pds-kpi-icon-box" style={{ background: iconBg, color: iconColor }}>
          <Icon size={20} />
        </div>
      )}
      <div className="pds-kpi-body">
        <div className="pds-kpi-title">{title}</div>
        <div className="pds-kpi-value">{value}</div>
        {subtitle && (
          <div className="pds-kpi-subtitle" style={subColor ? { color: subColor } : { color: iconColor }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PublicKpiGrid
 * Standardized 4-column metric summary grid.
 * Responsive: 4 col desktop -> 2 col tablet -> 1 or 2 col mobile.
 */
export default function PublicKpiGrid({
  children,
  items,
  className = '',
  style = {}
}) {
  return (
    <section className={`pds-kpi-grid ${className}`} style={style}>
      {items && items.length > 0
        ? items.map((item, idx) => (
            <PublicKpiCard key={idx} {...item} />
          ))
        : children}
    </section>
  );
}

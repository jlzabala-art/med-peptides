"use client";

import React from 'react';
import '@/styles/publicDesignSystem.css';

/**
 * PublicPageShell
 * Standardized outer shell for all Med-Peptides public clinical pages.
 * Enforces maximum layout width, responsive gutters, and consistent vertical rhythm.
 */
export default function PublicPageShell({
  children,
  className = '',
  id = null,
  style = {}
}) {
  return (
    <div className={`pds-page-shell ${className}`} id={id} style={style}>
      <div className="pds-page-shell-inner">
        {children}
      </div>
    </div>
  );
}

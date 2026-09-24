"use client";

import React from 'react';
import Link from 'next/link';
import { FlaskConical, ChevronRight, Sparkles, CheckCircle2 } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import './AssociatedProtocolsSidebarWidget.css';

/**
 * AssociatedProtocolsSidebarWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console inspired sidebar widget listing all verified clinical
 * protocols that integrate the current peptide/product.
 */
export default function AssociatedProtocolsSidebarWidget({
  protocols = [],
  lang = 'en'
}) {
  const isEs = lang === 'es';

  if (!Array.isArray(protocols) || protocols.length === 0) return null;

  return (
    <div className="pds-sidebar-protocols-widget">
      <div className="pds-spw-header">
        <div className="pds-spw-header-left">
          <FlaskConical size={14} className="pds-spw-icon" />
          <span className="pds-spw-title">
            {isEs ? 'PROTOCOLOS INTEGRADOS' : 'ASSOCIATED PROTOCOLS'}
          </span>
        </div>
        <span className="pds-spw-badge">
          {protocols.length}
        </span>
      </div>

      <div className="pds-spw-list">
        {protocols.slice(0, 4).map((p) => {
          const protoSlug = p.slug || p.id;
          const protoName = p.name || p.title || 'Clinical Protocol';
          const duration = p.duration || `${p.durationWeeks || 8} ${isEs ? 'Semanas' : 'Weeks'}`;
          const isPrimary = Boolean(p.isPrimary);

          return (
            <Link
              key={p.id || protoSlug}
              href={`/proto/${protoSlug}`}
              onClick={() => triggerHaptic('selection')}
              className={`pds-spw-item ${isPrimary ? 'is-primary' : ''}`}
              title={protoName}
            >
              <div className="pds-spw-item-content">
                <div className="pds-spw-item-top">
                  {isPrimary ? (
                    <span className="pds-spw-tag primary">
                      <Sparkles size={10} />
                      {isEs ? 'Vía Principal' : 'Primary Pathway'}
                    </span>
                  ) : (
                    <span className="pds-spw-tag">
                      <CheckCircle2 size={10} />
                      {isEs ? 'Integrado' : 'Clinical Protocol'}
                    </span>
                  )}
                  <span className="pds-spw-duration">{duration}</span>
                </div>
                <div className="pds-spw-name">{protoName}</div>
                {p.category && (
                  <div className="pds-spw-category">{p.category}</div>
                )}
              </div>
              <ChevronRight size={13} className="pds-spw-arrow" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

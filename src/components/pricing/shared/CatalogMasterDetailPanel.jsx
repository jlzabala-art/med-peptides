'use client';

import React from 'react';

/**
 * CatalogMasterDetailPanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable Google Cloud UX Master-Detail expandable panel for pricing & catalog
 * DataTables. Keeps main table rows compact (title + 1-line metadata) while
 * surfacing the full clinical/product description, structured technical specs,
 * and primary action inside the expandable drawer.
 */
export default function CatalogMasterDetailPanel({
  description = '',
  descriptionLabel = 'Clinical & Product Description',
  sections = [],
  actions = null,
}) {
  return (
    <div
      style={{
        padding: '14px 18px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        borderLeft: '3px solid var(--color-primary, #003666)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {description && (
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            {descriptionLabel}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.82rem',
              color: '#1e293b',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        </div>
      )}

      {sections.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px',
            borderTop: description ? '1px solid #e2e8f0' : 'none',
            paddingTop: description ? '12px' : 0,
          }}
        >
          {sections.map((section, idx) => (
            <div
              key={section.key || idx}
              style={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {section.icon}
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#3c4043',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {section.title}
                </span>
              </div>
              <div style={{ fontSize: '0.80rem', color: '#3c4043', lineHeight: 1.45 }}>
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

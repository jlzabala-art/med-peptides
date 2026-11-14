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
        padding: '1.15rem 1.5rem 1.25rem',
        background: '#f8f9fa',
        borderTop: '1px solid #dadce0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {description && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderLeft: '3px solid #1a73e8',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#5f6368',
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
              fontSize: '0.84rem',
              color: '#202124',
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
            gap: '1rem',
          }}
        >
          {sections.map((section, idx) => (
            <div
              key={section.key || idx}
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
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

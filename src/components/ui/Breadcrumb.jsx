"use client";

/**
 * Breadcrumb — Golden Rule #17
 * ─────────────────────────────────────────────────────────────────────────────
 * Standard breadcrumb navigation for all panels.
 * Keeps users oriented in deep hierarchies (e.g. Patients > John > RX-001).
 *
 * Props:
 *   items — Array of objects: { label: string, href?: string }
 *           The last item should omit href, representing the active page.
 */

import React from 'react';
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Link from 'next/link';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1.25rem' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.4rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.875rem',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {item.href ? (
                <Link
                  href={item.href}
                  style={{
                    color: 'var(--color-text-secondary, #64748b)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontWeight: 500,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-primary, #003666)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary, #64748b)')}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  style={{
                    color: 'var(--color-text-primary, #1e293b)',
                    fontWeight: 600,
                  }}
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  size={14}
                  strokeWidth={2.5}
                  style={{ color: 'var(--color-text-muted, #94a3b8)' }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

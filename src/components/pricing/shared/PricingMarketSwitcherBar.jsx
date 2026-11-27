'use client';

import React from 'react';
import { Globe } from 'lucide-react';

/**
 * PricingMarketSwitcherBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Google Cloud UX market/region switcher so a single brand screen
 * (e.g. /pricing/24genetics or /pricing/colway) serves Global, UAE, and Qatar
 * schedules cleanly via `?market=` without duplicating routes.
 */
export default function PricingMarketSwitcherBar({
  label = 'Market Schedule',
  activeMarket = 'global',
  options = [], // [{ id, label, badge }]
  onChange,
}) {
  if (!Array.isArray(options) || options.length < 2) return null;

  return (
    <div
      className="no-print"
      style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '6px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <Globe size={13} color="#5f6368" />
          <span>{label}</span>
        </div>

        <div
          role="tablist"
          aria-label={label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '2px',
          }}
        >
          {options.map((opt) => {
            const isSel = activeMarket === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isSel}
                onClick={() => onChange && onChange(opt.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: isSel ? '1px solid #1a73e8' : '1px solid transparent',
                  background: isSel ? '#e8f0fe' : 'transparent',
                  color: isSel ? '#1967d2' : '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: isSel ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{opt.label}</span>
                {opt.badge && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '999px',
                      background: isSel ? '#ffffff' : '#f1f3f4',
                      color: isSel ? '#1967d2' : '#5f6368',
                    }}
                  >
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

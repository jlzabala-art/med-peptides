'use client';

import React from 'react';

/**
 * StepTimelineList
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Google Cloud UX vertical linear stepper (Golden Rule #70).
 * Always renders sequential steps, protocols, or checklists as full-width
 * rows with a vertical timeline rail — eliminating orphan cards on odd counts
 * (3, 5, 7 steps) on both desktop and mobile.
 *
 * Props:
 *   - steps: Array<{ step?: number|string, title: string, desc?: string, highlight?: boolean, badge?: string }>
 *   - className?: string
 */
export default function StepTimelineList({ steps = [], className = '' }) {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <ol
      className={className}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {steps.map((s, idx) => {
        const isLast = idx === steps.length - 1;
        const isHighlight = Boolean(s.highlight);
        const stepNumber = s.step ?? idx + 1;

        return (
          <li
            key={s.id || `${stepNumber}-${idx}`}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '14px',
              padding: '13px 16px',
              background: isHighlight ? '#f0fdf4' : '#ffffff',
              borderLeft: isHighlight ? '3px solid #16a34a' : '3px solid transparent',
              borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
            }}
          >
            {/* Left Vertical Stepper Rail */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                paddingTop: '1px',
              }}
            >
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: isHighlight ? '#16a34a' : '#003666',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  boxShadow: isHighlight
                    ? '0 2px 6px rgba(22, 163, 74, 0.25)'
                    : '0 1px 3px rgba(0, 54, 102, 0.16)',
                  flexShrink: 0,
                }}
              >
                {stepNumber}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '14px',
                    marginTop: '6px',
                    borderRadius: '2px',
                    background: isHighlight ? '#bbf7d0' : '#e2e8f0',
                  }}
                />
              )}
            </div>

            {/* Right Full-Width Row Content */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : '2px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: s.desc ? '4px' : 0,
                }}
              >
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: isHighlight ? '#14532d' : '#0f172a',
                    lineHeight: 1.3,
                  }}
                >
                  {s.title}
                </span>
                {s.badge && (
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      background: isHighlight ? '#dcfce7' : '#f1f5f9',
                      color: isHighlight ? '#15803d' : '#475569',
                      border: isHighlight ? '1px solid #86efac' : '1px solid #e2e8f0',
                    }}
                  >
                    {s.badge}
                  </span>
                )}
              </div>
              {s.desc && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.79rem',
                    color: isHighlight ? '#166534' : '#475569',
                    lineHeight: 1.55,
                  }}
                >
                  {s.desc}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

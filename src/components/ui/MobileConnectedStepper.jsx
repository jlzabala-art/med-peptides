'use client';

import React from 'react';

/**
 * MobileConnectedStepper
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX–aligned connected progress stepper for mobile viewports (≤768px).
 * Displays all steps simultaneously as numbered circular nodes connected by a
 * progress line (green ✓ for completed, #1a73e8 with ring for active), plus a
 * full-width active step label card so titles never truncate.
 *
 * Props:
 *  - steps: Array<{ id?: string|number, label: string, kicker?: string }>
 *  - activeIndex: number (0-based)
 *  - onSelect?: (index: number) => void (omit for read-only progress indicator)
 *  - isEs?: boolean
 *  - ariaLabel?: string
 *  - desktopHidden?: boolean (default true — hides above 768px when desktop uses tabs)
 */
export default function MobileConnectedStepper({
  steps = [],
  activeIndex = 0,
  onSelect,
  isEs = false,
  ariaLabel,
  desktopHidden = true,
}) {
  if (!steps.length) return null;

  const safeIndex = Math.max(0, Math.min(activeIndex, steps.length - 1));
  const current = steps[safeIndex] || steps[0];
  const isInteractive = typeof onSelect === 'function';

  return (
    <div
      className={`gcp-mobile-stepper ${desktopHidden ? 'gcp-mobile-stepper--mobile-only' : ''}`}
      aria-label={ariaLabel || (isEs ? 'Progreso paso a paso' : 'Step-by-step progress')}
    >
      <style>{`
        .gcp-mobile-stepper {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .gcp-mobile-stepper--mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .gcp-mobile-stepper--mobile-only {
            display: flex;
          }
        }
        .gcp-mobile-stepper-nodes {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 2px 4px;
          box-sizing: border-box;
        }
        .gcp-mobile-node {
          position: relative;
          width: 30px !important;
          height: 30px !important;
          min-width: 30px !important;
          min-height: 30px !important;
          max-width: 30px !important;
          max-height: 30px !important;
          aspect-ratio: 1 / 1;
          border-radius: 9999px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 800;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          margin: 0;
          box-sizing: border-box;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .gcp-mobile-node::after {
          content: '';
          position: absolute;
          inset: -7px;
        }
        .gcp-mobile-node.is-clickable {
          cursor: pointer;
        }
        .gcp-mobile-node.is-active {
          background: #1a73e8;
          border-color: #1a73e8;
          color: #ffffff;
          box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.18);
        }
        .gcp-mobile-node.is-completed {
          background: #16a34a;
          border-color: #16a34a;
          color: #ffffff;
        }
        .gcp-mobile-connector {
          flex: 1;
          height: 2px;
          min-width: 8px;
          background: #cbd5e1;
          margin: 0 4px;
          border-radius: 1px;
          transition: background-color 0.2s ease;
        }
        .gcp-mobile-connector.is-completed {
          background: #16a34a;
        }
        .gcp-mobile-active-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #dadce0;
          border-left: 3px solid #1a73e8;
          border-radius: 8px;
          padding: 9px 12px;
        }
        .gcp-mobile-active-kicker {
          font-size: 0.70rem;
          font-weight: 800;
          color: #1a73e8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .gcp-mobile-active-name {
          font-size: 0.84rem;
          font-weight: 700;
          color: #003666;
          text-align: right;
          line-height: 1.25;
        }
      `}</style>

      <div className="gcp-mobile-stepper-nodes">
        {steps.map((s, idx) => {
          const isActive = idx === safeIndex;
          const isCompleted = idx < safeIndex;
          const cls = `gcp-mobile-node ${isInteractive ? 'is-clickable' : ''} ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`;
          return (
            <React.Fragment key={s.id ?? idx}>
              {isInteractive ? (
                <button
                  type="button"
                  onClick={() => onSelect(idx)}
                  aria-label={`${isEs ? 'Paso' : 'Step'} ${idx + 1}: ${s.label}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={cls}
                >
                  {isCompleted ? '✓' : idx + 1}
                </button>
              ) : (
                <span
                  aria-current={isActive ? 'step' : undefined}
                  className={cls}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
              )}
              {idx < steps.length - 1 && (
                <div className={`gcp-mobile-connector ${idx < safeIndex ? 'is-completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="gcp-mobile-active-label">
        <span className="gcp-mobile-active-kicker">
          {current.kicker || (isEs ? `Paso ${safeIndex + 1} de ${steps.length}` : `Step ${safeIndex + 1} of ${steps.length}`)}
        </span>
        <span className="gcp-mobile-active-name">{current.label}</span>
      </div>
    </div>
  );
}

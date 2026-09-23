"use client";

import React from 'react';
import { Check, ChevronRight } from '@/lib/icons';

/**
 * WorkspaceStepperBar
 * Horizontal step navigator. Each step is a clickable circle + label.
 * Mobile-first: labels hidden at < 380px, only numbered circles shown.
 * Active step has an animated blue underline indicator.
 */
export default function WorkspaceStepperBar({ steps, activeStep, onGoToStep }) {
  return (
    <div
      className="ws-stepper-bar"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'stretch',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        .ws-stepper-bar::-webkit-scrollbar { display: none; }
        .ws-step-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 4px 0;
          min-width: 0;
          flex: 1;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          min-height: 52px;
        }
        .ws-step-btn:focus-visible {
          outline: 2px solid #0284c7;
          outline-offset: 2px;
          border-radius: 4px;
        }
        .ws-step-label {
          font-size: 0.70rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
          padding-bottom: 6px;
          transition: color 0.18s ease;
          letter-spacing: 0.01em;
        }
        @media (max-width: 380px) {
          .ws-step-label { max-width: 75px; font-size: 0.65rem; }
          .ws-step-btn { padding: 6px 2px 6px; min-height: 44px; }
        }
        .ws-step-active-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          background-color: #0b57d0;
          border-radius: 2px 2px 0 0;
          animation: wsBarSlideIn 0.2s ease;
        }
        @keyframes wsBarSlideIn {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
        .ws-step-connector {
          display: flex;
          align-items: center;
          padding-top: 4px;
          flex-shrink: 0;
          color: #dadce0;
          padding-bottom: 12px;
        }
      `}</style>

      {steps.map((step, idx) => {
        const isActive = idx === activeStep;
        const isComplete = step.isComplete;

        const circleColor = isComplete
          ? { bg: '#e6f4ea', border: '#137333', text: '#137333' }
          : isActive
          ? { bg: '#e8f0fe', border: '#0b57d0', text: '#0b57d0' }
          : { bg: '#f1f3f4', border: '#dadce0', text: '#5f6368' };

        const labelColor = isComplete ? '#137333' : isActive ? '#0b57d0' : '#5f6368';

        return (
          <React.Fragment key={step.key}>
            <button
              type="button"
              className="ws-step-btn"
              onClick={() => onGoToStep(idx)}
              aria-label={`Step ${idx + 1}: ${step.label}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: circleColor.bg,
                  border: `2px solid ${circleColor.border}`,
                  color: circleColor.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  transition: 'all 0.18s ease',
                }}
              >
                {isComplete ? <Check size={11} strokeWidth={3} /> : idx + 1}
              </div>
              <span className="ws-step-label" style={{ color: labelColor }}>
                {step.label}
              </span>
              {isActive && <div className="ws-step-active-bar" />}
            </button>
            {idx < steps.length - 1 && (
              <div className="ws-step-connector">
                <ChevronRight size={12} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

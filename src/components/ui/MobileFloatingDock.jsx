"use client";

import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * MobileFloatingDock
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console style bottom action dock for mobile viewports (< 768px).
 * Keeps 1 to 2 primary actions fixed at the bottom with haptic feedback.
 * Automatically hides on fast downward scroll and re-appears on upward scroll.
 */
export default function MobileFloatingDock({ primaryAction, secondaryAction, className = '' }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setIsVisible(false); // Hide on scroll down
      } else {
        setIsVisible(true);  // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (!primaryAction && !secondaryAction) return null;

  return (
    <div className={`mfd-dock-wrapper ${isVisible ? 'mfd-visible' : 'mfd-hidden'} ${className}`}>
      <div className="mfd-dock-container">
        {secondaryAction && (
          <button
            type="button"
            className="mfd-btn mfd-btn-secondary"
            onClick={(e) => {
              triggerHaptic('light');
              secondaryAction.onClick?.(e);
            }}
            disabled={secondaryAction.disabled}
          >
            {secondaryAction.icon && <span className="mfd-btn-icon">{secondaryAction.icon}</span>}
            <span className="mfd-btn-label">{secondaryAction.label}</span>
          </button>
        )}

        {primaryAction && (
          <button
            type="button"
            className="mfd-btn mfd-btn-primary"
            onClick={(e) => {
              triggerHaptic('medium');
              primaryAction.onClick?.(e);
            }}
            disabled={primaryAction.disabled}
          >
            {primaryAction.icon && <span className="mfd-btn-icon">{primaryAction.icon}</span>}
            <span className="mfd-btn-label">{primaryAction.label}</span>
            {primaryAction.badge && <span className="mfd-badge">{primaryAction.badge}</span>}
          </button>
        )}
      </div>

      <style jsx>{`
        .mfd-dock-wrapper {
          position: fixed;
          bottom: calc(56px + env(safe-area-inset-bottom, 0px));
          left: 0;
          right: 0;
          z-index: 90;
          padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.25);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          display: none;
        }

        @media (max-width: 768px) {
          .mfd-dock-wrapper {
            display: block;
          }
        }

        .mfd-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .mfd-hidden {
          transform: translateY(100%);
          opacity: 0;
          pointer-events: none;
        }

        .mfd-dock-container {
          max-width: 480px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mfd-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 48px;
          padding: 0 1.25rem;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
          user-select: none;
        }

        .mfd-btn:active {
          transform: scale(0.97);
        }

        .mfd-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mfd-btn-primary {
          background: linear-gradient(135deg, #003666 0%, #0d9488 100%);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 54, 102, 0.35);
        }

        .mfd-btn-secondary {
          background: rgba(255, 255, 255, 0.12);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .mfd-btn-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .mfd-badge {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 800;
          margin-left: 0.25rem;
        }
      `}</style>
    </div>
  );
}

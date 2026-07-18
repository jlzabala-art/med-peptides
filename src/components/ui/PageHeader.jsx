"use client";

import React from 'react';
import { HelpCircle } from '@/lib/icons';
import Breadcrumb from './Breadcrumb';

/**
 * PageHeader - Unified header for all panels (Admin, Doctor, Patient, Wholeseller)
 * Displays page icon, title, description/statistics, and action buttons.
 * Supports sticky behavior and auto-accents based on the panel context.
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumbs,
  panel = 'admin', // admin | doctor | patient | wholeseller
  iconBg,
  iconColor,
  helpTopic
}) {
  // Determine default accent colors based on panel
  let defaultIconColor = 'var(--color-primary, #003666)';
  let defaultIconBg = 'var(--color-primary-subtle, rgba(0, 54, 102, 0.08))';

  if (panel === 'doctor') {
    defaultIconColor = 'var(--color-primary, #0d9488)';
    defaultIconBg = 'rgba(13, 148, 136, 0.08)';
  } else if (panel === 'patient') {
    defaultIconColor = 'var(--color-primary, #7c3aed)';
    defaultIconBg = 'rgba(124, 58, 237, 0.08)';
  } else if (panel === 'wholeseller') {
    defaultIconColor = 'var(--color-primary, #c2410c)';
    defaultIconBg = 'rgba(194, 65, 12, 0.08)';
  }

  const finalIconColor = iconColor || defaultIconColor;
  const finalIconBg = iconBg || defaultIconBg;

  return (
    <>
      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          position: sticky;
          top: 0;
          z-index: 20;
          background-color: var(--color-bg-app, #f8fafc);
        }

        .page-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 250px;
        }

        .page-header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md, 8px);
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .page-header-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--color-text-primary, #1e293b);
          line-height: 1.2;
        }

        .page-header-subtitle {
          color: var(--color-text-secondary, #64748b);
          font-size: 0.85rem;
          margin-top: 0.35rem;
          font-weight: 500;
        }

        .page-header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .page-header-help {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md, 8px);
          background-color: transparent;
          border: 1px solid var(--color-border, #e2e8f0);
          color: var(--text-muted, #64748b);
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-header-help:hover {
          background-color: var(--color-bg-hover, #f1f5f9);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .page-header-right {
            width: 100%;
            justify-content: stretch;
          }
          /* This forces action buttons passed as children to stretch on mobile if desired */
          .page-header-right > button, .page-header-right > div {
            flex: 1;
            justify-content: center;
          }
          .page-header-help {
            flex: 0 0 44px !important;
            height: 44px; /* Taller touch target on mobile */
          }
        }
      `}</style>
      <div className={`page-header panel-${panel}`}>
        <div className="page-header-left">
          {Icon && (
            <div
              className="page-header-icon"
              style={{
                backgroundColor: finalIconBg,
                color: finalIconColor,
              }}
            >
              <Icon size={24} />
            </div>
          )}
          <div>
            {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
            <h2 className="page-header-title">{title}</h2>
            {subtitle && (
              <div className="page-header-subtitle">{subtitle}</div>
            )}
          </div>
        </div>
        
        {(helpTopic || actions) && (
          <div className="page-header-right">
            {helpTopic && (
              <button
                className="page-header-help"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-atlas-copilot', {
                    detail: {
                      query: `Quiero aprender a usar este módulo (${helpTopic}). ¿Me das un resumen de qué puedo hacer y mejores prácticas?`,
                      context: { module: helpTopic }
                    }
                  }));
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = finalIconColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted, #64748b)';
                }}
                title="Help & Context"
              >
                <HelpCircle size={18} />
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </>
  );
}


"use client";

import React from 'react';
import { HelpCircle, Sparkles } from '@/lib/icons';
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
  helpTopic,
  showAiAssistant = true,
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
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          position: sticky;
          top: 0;
          z-index: 20;
          background-color: var(--color-bg-app, #f8fafc);
        }

        .page-header-left {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex: 1 1 340px;
          min-width: 280px;
          max-width: 580px;
        }

        .page-header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md, 8px);
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .page-header-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-text-primary, #1e293b);
          line-height: 1.25;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .page-header-subtitle {
          color: var(--color-text-secondary, #64748b);
          font-size: 0.84rem;
          line-height: 1.35;
          margin-top: 0.2rem;
          font-weight: 500;
        }

        .page-header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 0 1 auto;
          margin-left: auto;
          justify-content: flex-end;
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
            gap: 0.4rem;
            padding: 0.25rem 0 0.5rem;
            margin-bottom: 0.25rem;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            position: static !important;
          }
          .page-header-left {
            flex: 0 0 auto !important;
            min-width: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            gap: 0.5rem;
          }
          .page-header-icon {
            width: 36px;
            height: 36px;
          }
          .page-header-title {
            font-size: 1.125rem;
            white-space: normal;
          }
          .page-header-subtitle {
            font-size: 0.78rem;
            line-height: 1.3;
            margin-top: 0.1rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          /* Actions area: full width on mobile */
          .page-header-right {
            display: flex !important;
            width: 100%;
            flex-direction: column;
            gap: 0.4rem;
            margin-left: 0 !important;
          }
          .page-header-actions-wrap {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }
          .page-header-help {
            flex: 0 0 36px !important;
            height: 36px;
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
          <div style={{ minWidth: 0 }}>
            {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
            <h2 className="page-header-title">{title}</h2>
            {subtitle && (
              <div className="page-header-subtitle">{subtitle}</div>
            )}
          </div>
        </div>
        
        {/* Actions: always rendered — CSS controls layout on mobile */}
        {(helpTopic || actions || showAiAssistant) && (
          <div className="page-header-right">
            {showAiAssistant && (
              <button
                className="page-header-ai-btn"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-ai-chat', {
                    detail: {
                      title,
                      context: { screenTitle: title, helpTopic }
                    }
                  }));
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: 'var(--color-bg-surface, #ffffff)',
                  color: finalIconColor,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                title={`Ask AI Assistant for ${title}`}
              >
                <Sparkles size={14} style={{ color: finalIconColor }} />
                <span>Ask AI</span>
              </button>
            )}
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
            {/* Actions: hidden via CSS on very narrow screens if no helpTopic
                Use MobileActionsMenu in the caller to get proper mobile overflow menu */}
            {actions && (
              <div className="page-header-actions-wrap" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}


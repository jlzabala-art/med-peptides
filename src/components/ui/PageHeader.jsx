"use client";

import React from 'react';
import { HelpCircle, Sparkles, ArrowLeft } from '@/lib/icons';
import Breadcrumb from './Breadcrumb';
import { useRouter, usePathname } from 'next/navigation';

const DASHBOARD_ROUTES = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
  wholeseller: '/wholesaler',
  wholesaler: '/wholesaler',
  supplier: '/supplier',
  clinic: '/clinic',
  pharmacy: '/pharmacy',
};

const DASHBOARD_LABELS = {
  admin: 'Admin Dashboard',
  doctor: 'Doctor Overview',
  patient: 'Patient Home',
  wholeseller: 'Wholesaler Hub',
  wholesaler: 'Wholesaler Hub',
  supplier: 'Supplier Hub',
  clinic: 'Clinic Portal',
  pharmacy: 'Pharmacy Desk',
};

/**
 * PageHeader - Unified header for all panels (Admin, Doctor, Patient, Wholeseller, Supplier, Clinic, Pharmacy)
 * Displays page icon, title, description/statistics, action buttons, and a 1-click return to Dashboard.
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumbs,
  panel = 'admin', // admin | doctor | patient | wholeseller | supplier | clinic | pharmacy
  iconBg,
  iconColor,
  helpTopic,
  showAiAssistant = true,
  showDashboardBack = true,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const dashboardRoute = DASHBOARD_ROUTES[panel] || `/${panel}`;
  const dashboardLabel = DASHBOARD_LABELS[panel] || 'Dashboard';
  const isDashboardRoot = pathname === dashboardRoute || pathname === `${dashboardRoute}/`;

  // Auto-generate breadcrumbs if not explicitly provided and not on root dashboard
  const finalBreadcrumbs = breadcrumbs || (!isDashboardRoot ? [
    { label: `🏠 ${dashboardLabel}`, href: dashboardRoute },
    { label: title }
  ] : null);

  // Determine default accent colors based on panel
  let defaultIconColor = 'var(--color-primary, #003666)';
  let defaultIconBg = 'var(--color-primary-subtle, rgba(0, 54, 102, 0.08))';

  if (panel === 'doctor') {
    defaultIconColor = 'var(--color-primary, #0d9488)';
    defaultIconBg = 'rgba(13, 148, 136, 0.08)';
  } else if (panel === 'patient') {
    defaultIconColor = 'var(--color-primary, #7c3aed)';
    defaultIconBg = 'rgba(124, 58, 237, 0.08)';
  } else if (panel === 'wholeseller' || panel === 'wholesaler') {
    defaultIconColor = 'var(--color-primary, #c2410c)';
    defaultIconBg = 'rgba(194, 65, 12, 0.08)';
  } else if (panel === 'supplier') {
    defaultIconColor = 'var(--color-primary, #2563eb)';
    defaultIconBg = 'rgba(37, 99, 235, 0.08)';
  } else if (panel === 'clinic') {
    defaultIconColor = 'var(--color-primary, #0284c7)';
    defaultIconBg = 'rgba(2, 132, 199, 0.08)';
  } else if (panel === 'pharmacy') {
    defaultIconColor = 'var(--color-primary, #059669)';
    defaultIconBg = 'rgba(5, 150, 105, 0.08)';
  }

  const finalIconColor = iconColor || defaultIconColor;
  const finalIconBg = iconBg || defaultIconBg;

  return (
    <>
      <style>{`
        .page-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          position: sticky;
          top: 0;
          z-index: 20;
          background-color: rgba(248, 250, 252, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .page-header-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 0.75rem;
        }

        .page-header-left {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex: 1 1 auto;
          min-width: 0;
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
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .page-header-subtitle {
          color: var(--color-text-secondary, #64748b);
          font-size: 0.84rem;
          line-height: 1.35;
          margin-top: 0.2rem;
          font-weight: 500;
        }

        .page-header-quick-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .page-header-quick-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 12px;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--color-border, #cbd5e1);
          background-color: #ffffff;
          color: var(--color-text-primary, #0f172a);
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .page-header-quick-btn:hover {
          background-color: var(--color-bg-hover, #f8fafc);
          border-color: #94a3b8;
        }

        .page-header-help {
          width: 36px;
          padding: 0;
          border-color: var(--color-border, #e2e8f0);
          color: var(--text-muted, #64748b);
        }

        .page-header-actions-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: stretch;
          gap: 0.5rem;
          margin-top: 0.75rem;
          box-sizing: border-box;
        }

        .page-header-actions-row > * {
          width: 100%;
        }

        .page-header-quick-btn-label {
          display: inline;
        }

        @media (max-width: 1024px) {
          .page-header {
            padding: 0.45rem 0;
            margin-bottom: 0.5rem;
            position: static !important;
          }
          .page-header-top-row {
            gap: 0.4rem;
          }
          .page-header-breadcrumbs-wrap {
            display: none !important;
          }
          .page-header-icon {
            width: 34px;
            height: 34px;
          }
          .page-header-title {
            font-size: 1.05rem;
          }
          .page-header-subtitle {
            display: none !important;
          }
          .page-header-quick-btn {
            width: 36px;
            height: 36px;
            padding: 0;
          }
          .page-header-quick-btn-label {
            display: none !important;
          }
          .page-header-actions-row {
            margin-top: 0.45rem;
            width: 100% !important;
            justify-content: stretch !important;
            align-items: stretch !important;
          }
          .page-header-actions-row > * {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
        }
      `}</style>
      <div className={`page-header panel-${panel}`}>
        <div className="page-header-top-row">
          <div className="page-header-left">
            {Icon && (
              <div
                className="page-header-icon"
                style={{
                  backgroundColor: finalIconBg,
                  color: finalIconColor,
                }}
              >
                <Icon size={22} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              {finalBreadcrumbs && (
                <div className="page-header-breadcrumbs-wrap">
                  <Breadcrumb items={finalBreadcrumbs} />
                </div>
              )}
              <h2 className="page-header-title">{title}</h2>
              {subtitle && (
                <div className="page-header-subtitle">{subtitle}</div>
              )}
            </div>
          </div>

          {(helpTopic || showAiAssistant || (showDashboardBack && !isDashboardRoot)) && (
            <div className="page-header-quick-actions">
              {showDashboardBack && !isDashboardRoot && (
                <button
                  type="button"
                  onClick={() => router.push(dashboardRoute)}
                  className="page-header-quick-btn"
                  title={`Return to ${dashboardLabel}`}
                >
                  <ArrowLeft size={16} style={{ color: finalIconColor }} />
                  <span className="page-header-quick-btn-label">Dashboard</span>
                </button>
              )}
              {showAiAssistant && (
                <button
                  type="button"
                  className="page-header-quick-btn page-header-ai-btn"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-ai-chat', {
                      detail: {
                        title,
                        context: { screenTitle: title, helpTopic }
                      }
                    }));
                  }}
                  title={`Ask AI Assistant for ${title}`}
                >
                  <Sparkles size={15} style={{ color: finalIconColor }} />
                  <span className="page-header-quick-btn-label">Ask AI</span>
                </button>
              )}
              {helpTopic && (
                <button
                  type="button"
                  className="page-header-quick-btn page-header-help"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-atlas-copilot', {
                      detail: {
                        query: `Quiero aprender a usar este módulo (${helpTopic}). ¿Me das un resumen de qué puedo hacer y mejores prácticas?`,
                        context: { module: helpTopic }
                      }
                    }));
                  }}
                  title="Module Help & Documentation"
                >
                  <HelpCircle size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {actions && (
          <div className="page-header-actions-row">
            {actions}
          </div>
        )}
      </div>
    </>
  );
}

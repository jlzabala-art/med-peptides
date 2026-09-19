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
 * Helper to safely render icons without throwing React Error #130
 * if an object or React element is passed instead of a component.
 */
function renderSafeIcon(IconComponent, props = {}) {
  if (!IconComponent) return null;
  if (React.isValidElement(IconComponent)) return IconComponent;
  if (typeof IconComponent === 'function') return <IconComponent {...props} />;
  return null;
}

/**
 * PageHeader - Standardized Header across Atlas Health (AI Prompts/UX Header)
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *  - Typographic Title: No decorative thumbnails next to page titles.
 *  - Full Title Visibility: No awkward "Product C..." truncation.
 *  - Compact Breadcrumbs above title on desktop.
 *  - Clear Action Hierarchy: Primary action → Secondary actions (outlined/tonal) → Tertiary navigation.
 *  - Optional View Selector (Material Segmented Control).
 *  - Native Mobile Reflow: [←] Title → View Selector → Primary Action → Secondary Grid.
 */
export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  viewSelector,
  breadcrumbs,
  panel = 'admin',
  iconBg,
  iconColor,
  helpTopic,
  showAiAssistant = false,
  showDashboardBack = true,
  onBack,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const effectivePanel = (panel && panel !== 'admin') 
    ? panel 
    : (pathname?.startsWith('/doctor') ? 'doctor' : (panel || 'admin'));

  const dashboardRoute = DASHBOARD_ROUTES[effectivePanel] || `/${effectivePanel}`;
  const dashboardLabel = DASHBOARD_LABELS[effectivePanel] || 'Dashboard';
  const isDashboardRoot = pathname === dashboardRoute || pathname === `${dashboardRoute}/`;

  // Auto-generate breadcrumbs if not explicitly set to false and not on root dashboard
  const finalBreadcrumbs = (breadcrumbs === false || breadcrumbs === null) ? null : (breadcrumbs || (!isDashboardRoot ? [
    { label: dashboardLabel, href: dashboardRoute },
    { label: title }
  ] : null));

  let defaultPrimaryColor = 'var(--color-primary, #003666)';
  if (effectivePanel === 'doctor') defaultPrimaryColor = '#0d9488';
  else if (effectivePanel === 'patient') defaultPrimaryColor = '#7c3aed';
  else if (effectivePanel === 'wholeseller' || effectivePanel === 'wholesaler') defaultPrimaryColor = '#c2410c';
  else if (effectivePanel === 'supplier') defaultPrimaryColor = '#2563eb';
  else if (effectivePanel === 'clinic') defaultPrimaryColor = '#0284c7';
  else if (effectivePanel === 'pharmacy') defaultPrimaryColor = '#059669';

  return (
    <>
      <style>{`
        .page-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.85rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          position: sticky;
          top: 0;
          z-index: 20;
          background-color: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .page-header-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          gap: 1rem;
        }

        .page-header-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1 1 auto;
          min-width: 0;
        }

        .page-header-breadcrumbs-wrap {
          margin-bottom: 0.25rem;
        }

        .page-header-breadcrumbs-wrap ol {
          font-size: 0.76rem !important;
          color: #64748b;
        }

        .page-header-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }

        .page-header-mobile-back-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #1e293b;
          cursor: pointer;
          flex-shrink: 0;
          transition: background-color 0.15s ease;
        }

        .page-header-mobile-back-btn:hover {
          background-color: #f1f5f9;
        }

        .page-header-title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
          letter-spacing: -0.015em;
          white-space: normal;
          word-break: break-word;
        }

        .page-header-subtitle {
          color: #64748b;
          font-size: 0.82rem;
          line-height: 1.35;
          margin-top: 0.2rem;
          font-weight: 500;
        }

        .page-header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .page-header-actions-desktop {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .page-header-quick-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
          padding-left: 0.4rem;
          border-left: 1px solid #e2e8f0;
        }

        .page-header-quick-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #334155;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .page-header-quick-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .page-header-help {
          width: 36px;
          padding: 0;
          color: #64748b;
        }

        .page-header-view-selector-desktop {
          margin-top: 0.5rem;
          width: 100%;
        }

        .page-header-view-selector-mobile {
          display: none;
        }

        .page-header-actions-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 0.5rem 0;
            margin-bottom: 0.5rem;
            position: static !important;
          }

          .page-header-top-row {
            gap: 0.5rem;
          }

          .page-header-breadcrumbs-wrap {
            display: none !important;
          }

          .page-header-mobile-back-btn {
            display: inline-flex !important;
          }

          .page-header-title {
            font-size: 1.15rem;
            line-height: 1.25;
          }

          .page-header-subtitle {
            display: none !important;
          }

          .page-header-right {
            margin-left: auto;
          }

          .page-header-actions-desktop {
            display: none !important;
          }

          .page-header-quick-actions {
            border-left: none;
            padding-left: 0;
          }

          .page-header-quick-btn {
            width: 36px;
            height: 36px;
            padding: 0;
          }

          .page-header-quick-btn-label {
            display: none !important;
          }

          .page-header-view-selector-desktop {
            display: none !important;
          }

          .page-header-view-selector-mobile {
            display: flex !important;
            width: 100% !important;
            margin-top: 0.5rem;
          }

          .page-header-view-selector-mobile > * {
            width: 100% !important;
          }

          .page-header-actions-mobile {
            display: flex !important;
            flex-direction: column;
            margin-top: 0.5rem;
            width: 100% !important;
            gap: 0.5rem;
          }
        }
      `}</style>
      <header className={`page-header panel-${effectivePanel}`}>
        <div className="page-header-top-row">
          <div className="page-header-left">
            {finalBreadcrumbs && (
              <div className="page-header-breadcrumbs-wrap">
                <Breadcrumb items={finalBreadcrumbs} style={{ marginBottom: '2px', fontSize: '0.76rem' }} />
              </div>
            )}
            <div className="page-header-title-row">
              {showDashboardBack && !isDashboardRoot && (
                <button
                  type="button"
                  onClick={() => (onBack ? onBack() : router.push(dashboardRoute))}
                  className="page-header-mobile-back-btn"
                  title={`Back to ${dashboardLabel}`}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h1 className="page-header-title">{title}</h1>
            </div>
            {subtitle && (
              <div className="page-header-subtitle">{subtitle}</div>
            )}
            {viewSelector && (
              <div className="page-header-view-selector-desktop">
                {viewSelector}
              </div>
            )}
          </div>

          <div className="page-header-right">
            {actions && (
              <div className="page-header-actions-desktop">
                {actions}
              </div>
            )}

            {(helpTopic || showAiAssistant || (showDashboardBack && !isDashboardRoot)) && (
              <div className="page-header-quick-actions">
                {showDashboardBack && !isDashboardRoot && (
                  <button
                    type="button"
                    onClick={() => (onBack ? onBack() : router.push(dashboardRoute))}
                    className="page-header-quick-btn"
                    title={`Return to ${dashboardLabel}`}
                  >
                    <ArrowLeft size={15} style={{ color: defaultPrimaryColor }} />
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
                    <Sparkles size={15} style={{ color: defaultPrimaryColor }} />
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
                    aria-label="Help"
                  >
                    <HelpCircle size={17} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {viewSelector && (
          <div className="page-header-view-selector-mobile">
            {viewSelector}
          </div>
        )}

        {actions && (
          <div className="page-header-actions-mobile">
            {actions}
          </div>
        )}
      </header>
    </>
  );
}

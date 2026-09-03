"use client";

import React from 'react';

/**
 * KpiScopeBar
 *
 * Universal Scope Switcher header for KPI sections (Golden Rule #22).
 * Displays transparency between Applied Filters View and Global Database View.
 */
export default function KpiScopeBar({
  scope = 'filtered',
  onScopeChange,
  scopeLabel = '',
  isFiltered = false,
  filteredCount = null,
  globalCount = null,
  filteredLabel = 'Applied Filters View',
  globalLabel = 'Global Database View'
}) {
  return (
    <>
      <style>{`
        .kpi-scope-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          width: 100%;
        }
        .kpi-scope-switcher {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .kpi-scope-btn-text-mobile {
          display: none;
        }
        .kpi-scope-btn-text-desktop {
          display: inline;
        }
        @media (max-width: 640px) {
          .kpi-scope-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.4rem;
          }
          .kpi-scope-switcher {
            width: 100%;
          }
          .kpi-scope-switcher > button {
            flex: 1;
            text-align: center;
            justify-content: center;
            padding: 6px 4px !important;
          }
          .kpi-scope-btn-text-mobile {
            display: inline;
          }
          .kpi-scope-btn-text-desktop {
            display: none;
          }
        }
      `}</style>
      <div className="kpi-scope-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Metrics Scope:
          </span>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 600, 
            padding: '2px 8px', 
            borderRadius: '12px', 
            backgroundColor: isFiltered ? '#eff6ff' : '#f1f5f9',
            color: isFiltered ? '#2563eb' : '#475569',
            border: `1px solid ${isFiltered ? '#bfdbfe' : '#e2e8f0'}`
          }}>
            {scopeLabel || (isFiltered ? 'Matching Active Filters' : 'Entire Database (Unfiltered)')}
          </span>
        </div>

        {onScopeChange && (
          <div className="kpi-scope-switcher">
            <button
              type="button"
              onClick={() => onScopeChange('filtered')}
              style={{
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: scope === 'filtered' ? '#ffffff' : 'transparent',
                color: scope === 'filtered' ? '#1e293b' : '#64748b',
                boxShadow: scope === 'filtered' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="kpi-scope-btn-text-desktop">
                {filteredLabel} {isFiltered && filteredCount != null && `(${filteredCount})`}
              </span>
              <span className="kpi-scope-btn-text-mobile">
                Filtered {filteredCount != null ? `(${filteredCount})` : ''}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onScopeChange('global')}
              style={{
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: scope === 'global' ? '#ffffff' : 'transparent',
                color: scope === 'global' ? '#1e293b' : '#64748b',
                boxShadow: scope === 'global' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="kpi-scope-btn-text-desktop">
                {globalLabel} {globalCount != null && `(${globalCount})`}
              </span>
              <span className="kpi-scope-btn-text-mobile">
                All Global {globalCount != null ? `(${globalCount})` : ''}
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

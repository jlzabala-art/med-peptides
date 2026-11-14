"use client";

import React from 'react';
import { FlaskConical, Sparkles, Layers, Clock } from '@/lib/icons';

export default function ProtocolCatalogKpiStrip({
  kpiMetrics,
  kpiScope,
  onChangeScope,
  hasActiveFilters,
  onResetFilters,
  lang = 'en',
}) {
  const isFilteredView = hasActiveFilters && kpiScope === 'filtered';

  return (
    <div className="proto-kpi-wrapper">
      {/* Scope Status + Switcher Bar (Rule #22) */}
      <div className="proto-kpi-scope-header">
        <div className="proto-kpi-scope-status">
          <span
            className="proto-kpi-scope-dot"
            style={{ background: isFilteredView ? '#ea580c' : '#16a34a' }}
          />
          <span className="proto-kpi-scope-text">
            {isFilteredView
              ? `Matching Active Filters (${kpiMetrics.filteredCount} of ${kpiMetrics.totalCount} protocols)`
              : `Entire Database (${kpiMetrics.totalCount} standardized protocols)`}
          </span>
        </div>

        <div className="proto-kpi-scope-actions">
          {hasActiveFilters && (
            <div className="proto-scope-switcher" role="group" aria-label="KPI Metrics Scope">
              <button
                type="button"
                className={`proto-scope-switch-btn ${kpiScope === 'filtered' ? 'is-active' : ''}`}
                onClick={() => onChangeScope('filtered')}
              >
                {lang === 'es' ? `Filtrados (${kpiMetrics.filteredCount})` : `Filtered (${kpiMetrics.filteredCount})`}
              </button>
              <button
                type="button"
                className={`proto-scope-switch-btn ${kpiScope === 'global' ? 'is-active' : ''}`}
                onClick={() => onChangeScope('global')}
              >
                {lang === 'es' ? `Global (${kpiMetrics.totalCount})` : `Global (${kpiMetrics.totalCount})`}
              </button>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              className="proto-kpi-reset-btn"
              onClick={onResetFilters}
            >
              {lang === 'es' ? 'Limpiar' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI Cards — 2x2 compact grid on mobile, 4-col on desktop */}
      <div className="proto-kpi-strip">
        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#eff6ff', color: '#0284c7' }}>
            <FlaskConical size={18} />
          </div>
          <div className="proto-kpi-body">
            <div className="proto-kpi-title">ACTIVE PROTOCOLS</div>
            <div className="proto-kpi-val">{kpiMetrics.activeCount}</div>
            <div className="proto-kpi-subtitle">Standardized pathways</div>
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
            <Sparkles size={18} />
          </div>
          <div className="proto-kpi-body">
            <div className="proto-kpi-title">THERAPEUTIC GOALS</div>
            <div className="proto-kpi-val">{kpiMetrics.goalsCount}</div>
            <div className="proto-kpi-subtitle">Biomarker categories</div>
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
            <Layers size={18} />
          </div>
          <div className="proto-kpi-body">
            <div className="proto-kpi-title">LAB SURVEILLANCE</div>
            <div className="proto-kpi-val">{kpiMetrics.labCoveragePct}%</div>
            <div className="proto-kpi-subtitle">Biomarker-tracked</div>
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <Clock size={18} />
          </div>
          <div className="proto-kpi-body">
            <div className="proto-kpi-title">CYCLE HORIZON</div>
            <div className="proto-kpi-val">{kpiMetrics.cycleRange}</div>
            <div className="proto-kpi-subtitle">Duration spectrum</div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import {
  Search,
  X,
  List,
  LayoutGrid,
  Filter,
  ShieldAlert,
  Award,
  Sparkles,
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import { GOAL_TRANSLATIONS } from '../../utils/protocolTranslations';

const ROUTE_OPTIONS = [
  { id: 'all', en: 'All Routes', es: 'Todas las Vías' },
  { id: 'Subcutaneous (SubQ)', en: 'SubQ', es: 'SubQ' },
  { id: 'Intranasal', en: 'Nasal (Needle-Free)', es: 'Nasal (Sin agujas)' },
  { id: 'Topical', en: 'Topical', es: 'Tópico' },
  { id: 'Oral', en: 'Oral', es: 'Oral' },
];

export default function ProtocolCatalogSearchToolbar({
  searchQuery,
  onSearchChange,
  selectedGoal,
  onSelectGoal,
  goalBuckets = [],
  goalCounts = {},
  durationFilter,
  onSelectDuration,
  phasesFilter,
  onSelectPhases,
  routeFilter,
  onSelectRoute,
  evidenceFilter,
  onSelectEvidence,
  safetyExclusions = [],
  onToggleSafetyExclusion,
  onlyShortlisted,
  onToggleOnlyShortlisted,
  shortlistCount = 0,
  viewMode,
  onChangeViewMode,
  hasActiveFilters,
  onResetFilters,
  onOpenMobileDrawer,
  filteredCount,
  totalCount,
  lang = 'en',
  t = {},
}) {
  const isEs = lang === 'es';

  return (
    <div className="proto-search-wrapper-clean">
      {/* 1. Primary Global Search Input (Rule #7) */}
      <div className="proto-search-input-wrapper">
        <Search size={19} className="proto-search-icon" />
        <input
          id="protocol-global-search"
          type="text"
          className="proto-search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && searchQuery) {
              onSearchChange('');
            }
          }}
          placeholder={
            t.searchPlaceholder ||
            (isEs
              ? 'Buscar por protocolo, péptido, biomarcador (HbA1c, IGF-1) o vía...'
              : 'Search by protocol, peptide, biomarker (HbA1c, IGF-1), or route...')
          }
          aria-label={isEs ? 'Buscar protocolos clínicos' : 'Search clinical protocols'}
        />

        {searchQuery ? (
          <button
            type="button"
            className="proto-search-clear-btn"
            onClick={() => {
              triggerHaptic('light');
              onSearchChange('');
            }}
            title={isEs ? 'Limpiar búsqueda' : 'Clear search'}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        ) : (
          <kbd className="proto-search-kbd" aria-hidden="true">⌘K</kbd>
        )}
      </div>

      {/* 2. Mobile Horizontal Goal Pills (< 1024px) for 1-tap category switching */}
      <div className="proto-mobile-goal-strip" role="navigation" aria-label="Therapeutic goals">
        {goalBuckets.map((bucket) => {
          const count = bucket.id === 'all' ? totalCount : goalCounts[bucket.id] || 0;
          if (bucket.id !== 'all' && count === 0) return null;
          const isActive = selectedGoal === bucket.id;
          const label = GOAL_TRANSLATIONS[bucket.id]?.[lang] || bucket.label;
          return (
            <button
              key={bucket.id}
              type="button"
              className={`proto-quick-pill ${isActive ? 'is-active' : ''}`}
              onClick={() => {
                triggerHaptic('selection');
                onSelectGoal(bucket.id);
              }}
            >
              <span>{label}</span>
              <span className="proto-quick-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Clinical Physician Triage Bar (Route, Evidence, Safety Gate, Shortlist) */}
      <div className="proto-triage-bar">
        <div className="proto-triage-scroll">
          {/* Route pills */}
          {ROUTE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`proto-triage-chip ${routeFilter === opt.id ? 'is-active' : ''}`}
              onClick={() => {
                triggerHaptic('selection');
                onSelectRoute(routeFilter === opt.id && opt.id !== 'all' ? 'all' : opt.id);
              }}
            >
              {isEs ? opt.es : opt.en}
            </button>
          ))}

          <span className="proto-triage-divider" aria-hidden="true" />

          {/* Evidence Grade Filter */}
          <button
            type="button"
            className={`proto-triage-chip ${evidenceFilter === 'high_moderate' ? 'is-active-teal' : ''}`}
            onClick={() => {
              triggerHaptic('selection');
              onSelectEvidence(evidenceFilter === 'high_moderate' ? 'all' : 'high_moderate');
            }}
          >
            <Award size={12} />
            <span>{isEs ? 'Evidencia Alta/Mod' : 'High/Mod Evidence'}</span>
          </button>

          {/* Safety Exclusion Gates */}
          <button
            type="button"
            className={`proto-triage-chip ${safetyExclusions.includes('oncology') ? 'is-active-safety' : ''}`}
            onClick={() => {
              triggerHaptic('selection');
              onToggleSafetyExclusion('oncology');
            }}
            title={isEs ? 'Ocultar protocolos con precaución angiogénica/oncológica' : 'Exclude protocols with angiogenic/oncology precautions'}
          >
            <ShieldAlert size={12} />
            <span>{isEs ? 'Sin riesgo oncológico' : 'No Oncology Risk'}</span>
          </button>

          <button
            type="button"
            className={`proto-triage-chip ${safetyExclusions.includes('thyroid_men2') ? 'is-active-safety' : ''}`}
            onClick={() => {
              triggerHaptic('selection');
              onToggleSafetyExclusion('thyroid_men2');
            }}
            title={isEs ? 'Ocultar agonistas GLP-1/incretinas (MTC/MEN2)' : 'Exclude GLP-1/incretin agonists (MTC/MEN2)'}
          >
            <ShieldAlert size={12} />
            <span>{isEs ? 'Sin riesgo MEN2/Tiroides' : 'No MEN2/Thyroid Risk'}</span>
          </button>

          {shortlistCount > 0 && (
            <button
              type="button"
              className={`proto-triage-chip ${onlyShortlisted ? 'is-active-amber' : ''}`}
              onClick={() => {
                triggerHaptic('selection');
                onToggleOnlyShortlisted();
              }}
            >
              <Sparkles size={12} />
              <span>{isEs ? `Favoritos (${shortlistCount})` : `Shortlist (${shortlistCount})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="proto-active-filters-strip">
          <span className="proto-active-filters-label">
            {isEs ? 'Filtros Activos:' : 'Active Filters:'}
          </span>
          {searchQuery && (
            <span className="proto-filter-badge">
              {isEs ? 'Búsqueda' : 'Search'}: &ldquo;{searchQuery}&rdquo;
              <button type="button" className="proto-filter-badge-remove" onClick={() => onSearchChange('')} aria-label="Remove search filter">×</button>
            </span>
          )}
          {selectedGoal !== 'all' && (
            <span className="proto-filter-badge">
              {isEs ? 'Objetivo' : 'Goal'}: {GOAL_TRANSLATIONS[selectedGoal]?.[lang] || selectedGoal}
              <button type="button" className="proto-filter-badge-remove" onClick={() => onSelectGoal('all')} aria-label="Remove goal filter">×</button>
            </span>
          )}
          {routeFilter !== 'all' && (
            <span className="proto-filter-badge">
              {isEs ? 'Vía' : 'Route'}: {routeFilter}
              <button type="button" className="proto-filter-badge-remove" onClick={() => onSelectRoute('all')} aria-label="Remove route filter">×</button>
            </span>
          )}
          {evidenceFilter !== 'all' && (
            <span className="proto-filter-badge">
              {isEs ? 'Evidencia' : 'Evidence'}: High/Mod
              <button type="button" className="proto-filter-badge-remove" onClick={() => onSelectEvidence('all')} aria-label="Remove evidence filter">×</button>
            </span>
          )}
          {safetyExclusions.map((ex) => (
            <span key={ex} className="proto-filter-badge is-safety">
              {ex === 'oncology' ? (isEs ? 'Excl: Oncológico' : 'Excl: Oncology') : (isEs ? 'Excl: MEN2/Tiroides' : 'Excl: MEN2/Thyroid')}
              <button type="button" className="proto-filter-badge-remove" onClick={() => onToggleSafetyExclusion(ex)} aria-label="Remove safety exclusion">×</button>
            </span>
          ))}
          {durationFilter !== 'all' && (
            <span className="proto-filter-badge">
              {isEs ? 'Duración' : 'Duration'}: {durationFilter === 'short' ? '≤8w' : durationFilter === 'medium' ? '8–12w' : '>12w'}
              <button type="button" className="proto-filter-badge-remove" onClick={() => onSelectDuration('all')} aria-label="Remove duration filter">×</button>
            </span>
          )}
          {phasesFilter !== 'all' && (
            <span className="proto-filter-badge">
              {isEs ? 'Fases' : 'Phases'}: {phasesFilter === 'single' ? (isEs ? 'Monofásico' : 'Continuous') : (isEs ? 'Titulación' : 'Titration')}
              <button type="button" className="proto-filter-badge-remove" onClick={() => onSelectPhases('all')} aria-label="Remove phases filter">×</button>
            </span>
          )}
          {onlyShortlisted && (
            <span className="proto-filter-badge">
              {isEs ? 'Solo Favoritos' : 'Shortlist Only'}
              <button type="button" className="proto-filter-badge-remove" onClick={onToggleOnlyShortlisted} aria-label="Remove shortlist filter">×</button>
            </span>
          )}
          <button type="button" onClick={onResetFilters} className="proto-clear-all-link">
            {isEs ? 'Limpiar todo' : 'Clear all'}
          </button>
        </div>
      )}

      {/* 5. Unified Scope & View Mode Controls */}
      <div className="proto-scope-bar">
        <div className="proto-scope-count-text">
          {isEs ? 'Mostrando' : 'Showing'} <strong>{filteredCount}</strong> {isEs ? 'de' : 'of'} <strong>{totalCount}</strong>
        </div>

        <div className="proto-scope-controls">
          <div className="proto-view-switcher" role="radiogroup" aria-label="Visual view mode">
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'list'}
              className={`proto-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => {
                triggerHaptic('selection');
                onChangeViewMode('list');
              }}
            >
              <List size={14} />
              <span>{isEs ? 'Lista' : 'List'}</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'cards'}
              className={`proto-view-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
              onClick={() => {
                triggerHaptic('selection');
                onChangeViewMode('cards');
              }}
            >
              <LayoutGrid size={14} />
              <span>{isEs ? 'Tarjetas' : 'Cards'}</span>
            </button>
          </div>

          <button
            type="button"
            className="proto-mobile-filter-floating"
            onClick={() => {
              triggerHaptic('tap');
              onOpenMobileDrawer();
            }}
          >
            <Filter size={13} />
            <span>{isEs ? 'Filtros' : 'Filters'}</span>
            {hasActiveFilters && <span className="proto-filter-dot" />}
          </button>
        </div>
      </div>
    </div>
  );
}

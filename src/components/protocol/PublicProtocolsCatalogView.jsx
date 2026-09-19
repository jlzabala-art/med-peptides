"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Zap,
  Heart,
  Activity,
  Brain,
  Shield,
  ShieldAlert,
  Sparkles,
  Moon,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Copy,
  QrCode,
  Share2,
  X,
  FileText,
  FlaskConical,
  RotateCcw,
  ExternalLink,
  ChevronRight
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import '../../styles/publicProtocolsCatalog.css';

// ── Goal Taxonomy Buckets ───────────────────────────────────────────────────
const GOAL_BUCKETS = [
  { id: 'all', label: 'Todos los Protocolos', icon: FlaskConical, color: '#003666', bg: '#eff6ff' },
  { id: 'fat_loss', label: 'Metabolismo & GLP-1 / GIP', icon: Zap, color: '#ea580c', bg: '#fff7ed' },
  { id: 'longevity', label: 'Longevidad & Anti-Aging', icon: Heart, color: '#0d9488', bg: '#f0fdfa' },
  { id: 'recovery', label: 'Regeneración Tisular & Articular', icon: Activity, color: '#0284c7', bg: '#f0f9ff' },
  { id: 'cognitive', label: 'Neuroplasticidad & Cognición', icon: Brain, color: '#7c3aed', bg: '#faf5ff' },
  { id: 'muscle_growth', label: 'Masa Muscular & Rendimiento', icon: Shield, color: '#16a34a', bg: '#f0fdf4' },
  { id: 'immune', label: 'Inmunidad & Defensa Celular', icon: ShieldAlert, color: '#0891b2', bg: '#ecfeff' },
  { id: 'sexual_health', label: 'Salud Hormonal & Sexual', icon: Sparkles, color: '#db2777', bg: '#fdf2f8' },
  { id: 'sleep', label: 'Sueño & Ritmo Circadiano', icon: Moon, color: '#4338ca', bg: '#eef2ff' },
  { id: 'skin_hair', label: 'Piel, Cabello & Estética', icon: Sparkles, color: '#d97706', bg: '#fffbeb' },
];

/**
 * Maps arbitrary Firestore goal tags to standard bucket IDs
 */
function mapProtocolToGoals(p) {
  const text = [
    ...(Array.isArray(p.goals) ? p.goals : [p.goals]),
    p.goal,
    p.category,
    p.therapeutic_category,
    p.name,
    p.protocol_name,
    p.title,
    p.description
  ].filter(Boolean).join(' ').toLowerCase();

  const matched = new Set(['all']);

  if (text.match(/glp|gip|fat|weight|metabolic|tirzepatide|semaglutide|retatrutide|aod|5-amino|adipotide/i)) {
    matched.add('fat_loss');
  }
  if (text.match(/longevity|aging|epithalon|nad|foxo4|telomere|mitochondr|ghk/i)) {
    matched.add('longevity');
  }
  if (text.match(/recovery|tissue|joint|repair|bpc|tb-500|tb500|kpv|pentosan|collagen|cartilage/i)) {
    matched.add('recovery');
  }
  if (text.match(/cognit|neuro|brain|semax|selank|dihexa|cerebro|memory|focus|anxiety/i)) {
    matched.add('cognitive');
  }
  if (text.match(/muscle|lean|performance|growth|strength|cjc|ipamorelin|sermorelin|tesamorelin|ghrh|ghrp/i)) {
    matched.add('muscle_growth');
  }
  if (text.match(/immune|thymosin|ll-37|ta-1|ta1|inflam|defense|antimicrobial/i)) {
    matched.add('immune');
  }
  if (text.match(/sexual|libido|pt-141|kisspeptin|bremelanotide|hormon|fertility|testosterone/i)) {
    matched.add('sexual_health');
  }
  if (text.match(/sleep|dsip|circadian|insomnia|rest|pineal/i)) {
    matched.add('sleep');
  }
  if (text.match(/skin|hair|ghk-cu|copper|cosmetic|aesthetics|wrinkle/i)) {
    matched.add('skin_hair');
  }

  return Array.from(matched);
}

/**
 * Extracts distinct active compounds for chip rendering
 */
function extractCompounds(p) {
  const list = [];
  const seen = new Set();

  const add = (name, slug) => {
    if (!name) return;
    const clean = String(name).trim();
    const key = clean.toLowerCase();
    if (!seen.has(key) && clean.length > 1) {
      seen.add(key);
      const autoSlug = slug || clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      list.push({ name: clean, slug: autoSlug });
    }
  };

  // 1. From BOM
  if (Array.isArray(p.bom)) {
    p.bom.forEach(b => add(b.name || b.compound || b.product_name, b.slug || b.productId));
  }
  // 2. From Peptides
  if (Array.isArray(p.peptides)) {
    p.peptides.forEach(c => add(c.name || c.compound, c.slug));
  }
  // 3. From Phases
  if (Array.isArray(p.phases)) {
    p.phases.forEach(ph => {
      if (Array.isArray(ph.compounds)) {
        ph.compounds.forEach(c => add(c.name || c.compound, c.slug));
      }
    });
  }

  return list;
}

export default function PublicProtocolsCatalogView({ initialProtocols = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [phasesFilter, setPhasesFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [copiedId, setCopiedId] = useState(null);

  // Keyboard shortcut: ⌘K / Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const el = document.getElementById('protocol-global-search');
        if (el) el.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pre-calculate mapped metadata
  const enrichedProtocols = useMemo(() => {
    return (initialProtocols || []).map(p => {
      const durationWeeks = p.durationWeeks || p.duration_weeks || 
        (typeof p.duration === 'string' ? parseInt(p.duration, 10) || 8 : 8);
      const phasesCount = Array.isArray(p.phases) ? p.phases.length : 1;
      const compounds = extractCompounds(p);
      const mappedGoals = mapProtocolToGoals(p);
      const cleanName = p.name || p.protocol_name || p.title || 'Clinical Protocol';
      const cleanCode = p.protocol_id || p.protocolCode || (p.id ? `PR-${p.id.slice(0, 6).toUpperCase()}` : 'PR-CLIN');
      const cleanSlug = p.slug || p.protocol_slug || p.id;
      const summary = p.overview_summary || p.description || p.executiveSummary || p.clinical_rationale || 
        'Prescription protocol calibrated for cellular receptor adaptation and targeted biomarker outcomes.';

      return {
        ...p,
        cleanName,
        cleanCode,
        cleanSlug,
        durationWeeks,
        phasesCount,
        compounds,
        mappedGoals,
        summary,
      };
    });
  }, [initialProtocols]);

  // Goal counts for badges
  const goalCounts = useMemo(() => {
    const counts = {};
    GOAL_BUCKETS.forEach(g => {
      counts[g.id] = 0;
    });
    enrichedProtocols.forEach(p => {
      p.mappedGoals.forEach(gid => {
        if (counts[gid] !== undefined) counts[gid]++;
      });
    });
    return counts;
  }, [enrichedProtocols]);

  // Filtered and sorted protocols
  const filteredProtocols = useMemo(() => {
    let result = enrichedProtocols.filter(p => {
      // 1. Goal filter
      if (selectedGoal !== 'all' && !p.mappedGoals.includes(selectedGoal)) {
        return false;
      }

      // 2. Duration filter
      if (durationFilter === 'short' && p.durationWeeks > 8) return false;
      if (durationFilter === 'medium' && (p.durationWeeks <= 8 || p.durationWeeks > 12)) return false;
      if (durationFilter === 'long' && p.durationWeeks <= 12) return false;

      // 3. Phases filter
      if (phasesFilter === 'single' && p.phasesCount !== 1) return false;
      if (phasesFilter === 'titration' && p.phasesCount < 2) return false;

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.cleanName.toLowerCase().includes(q);
        const codeMatch = p.cleanCode.toLowerCase().includes(q);
        const summaryMatch = p.summary.toLowerCase().includes(q);
        const compoundMatch = p.compounds.some(c => c.name.toLowerCase().includes(q));
        const goalMatch = p.mappedGoals.some(g => g.toLowerCase().includes(q));

        if (!nameMatch && !codeMatch && !summaryMatch && !compoundMatch && !goalMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'duration-desc') return b.durationWeeks - a.durationWeeks;
      if (sortBy === 'duration-asc') return a.durationWeeks - b.durationWeeks;
      if (sortBy === 'name-asc') return a.cleanName.localeCompare(b.cleanName);
      if (sortBy === 'phases-desc') return b.phasesCount - a.phasesCount;
      // Default: relevance (multi-compound and multi-phase first)
      return (b.compounds.length * 2 + b.phasesCount) - (a.compounds.length * 2 + a.phasesCount);
    });

    return result;
  }, [enrichedProtocols, selectedGoal, durationFilter, phasesFilter, searchQuery, sortBy]);

  const handleCopyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    triggerHaptic('light');
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    triggerHaptic('tap');
    setSearchQuery('');
    setSelectedGoal('all');
    setDurationFilter('all');
    setPhasesFilter('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = searchQuery || selectedGoal !== 'all' || durationFilter !== 'all' || phasesFilter !== 'all';

  return (
    <div className="proto-catalog-container">
      {/* ── 1. Hero Section ── */}
      <header className="proto-catalog-hero">
        <div className="proto-hero-pill">
          <FlaskConical size={14} />
          <span>Ecosystem Clinical Pathways • Single Source of Truth</span>
        </div>
        <h1 className="proto-catalog-title">
          Directorio de Protocolos Clínicos & Péptidos
        </h1>
        <p className="proto-catalog-subtitle">
          Explora los 77 protocolos terapéuticos formulados con el catálogo de grado farmacéutico de Lotusland. 
          Monoterapias y sinergias combinadas con calendarios de dosificación, fases de titulación y biomarcadores de seguridad.
        </p>
      </header>

      {/* ── 2. KPI Metrics Strip (Regla #22) ── */}
      <div className="proto-kpi-strip">
        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#eff6ff', color: '#0284c7' }}>
            <FlaskConical size={22} />
          </div>
          <div>
            <div className="proto-kpi-val">{enrichedProtocols.length}</div>
            <div className="proto-kpi-label">Protocolos Activos</div>
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="proto-kpi-val">{GOAL_BUCKETS.length - 1}</div>
            <div className="proto-kpi-label">Objetivos Terapéuticos</div>
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
            <Layers size={22} />
          </div>
          <div>
            <div className="proto-kpi-val">100%</div>
            <div className="proto-kpi-label">Fórmulas Clínicas SSOT</div>
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="proto-kpi-val">4–28 wks</div>
            <div className="proto-kpi-label">Ciclos de Tratamiento</div>
          </div>
        </div>
      </div>

      {/* ── 3. Search & Goals Engine Card ── */}
      <section className="proto-search-engine-card">
        {/* Search Input */}
        <div className="proto-search-input-wrapper">
          <Search size={20} className="proto-search-icon" />
          <input
            id="protocol-global-search"
            type="text"
            className="proto-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por objetivo (ej: pérdida de peso), compuesto (ej: Tirzepatide), o síntoma... (⌘K)"
          />
          {searchQuery && (
            <button
              type="button"
              className="proto-search-clear-btn"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
              }}
              title="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Goals Ribbon Selector */}
        <div className="proto-goals-ribbon">
          {GOAL_BUCKETS.map(g => {
            const Icon = g.icon;
            const isActive = selectedGoal === g.id;
            const count = goalCounts[g.id] || 0;

            return (
              <button
                key={g.id}
                type="button"
                className={`proto-goal-chip ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedGoal(g.id);
                }}
              >
                <Icon size={14} style={{ color: isActive ? '#ffffff' : g.color }} />
                <span>{g.label}</span>
                <span className="proto-goal-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="proto-controls-row">
          <div className="proto-controls-left">
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              Filtros:
            </span>

            {/* Duration select */}
            <select
              className="proto-select-filter"
              value={durationFilter}
              onChange={(e) => {
                triggerHaptic('light');
                setDurationFilter(e.target.value);
              }}
            >
              <option value="all">Todas las duraciones</option>
              <option value="short">Ciclo Corto (≤ 8 semanas)</option>
              <option value="medium">Ciclo Estándar (9–12 semanas)</option>
              <option value="long">Ciclo Extendido (13+ semanas)</option>
            </select>

            {/* Phases select */}
            <select
              className="proto-select-filter"
              value={phasesFilter}
              onChange={(e) => {
                triggerHaptic('light');
                setPhasesFilter(e.target.value);
              }}
            >
              <option value="all">Cualquier estructura</option>
              <option value="single">Monofásico (1 fase continua)</option>
              <option value="titration">Titulación Progresiva (2+ fases)</option>
            </select>

            {/* Sort select */}
            <select
              className="proto-select-filter"
              value={sortBy}
              onChange={(e) => {
                triggerHaptic('light');
                setSortBy(e.target.value);
              }}
            >
              <option value="relevance">Ordenar: Recomendados</option>
              <option value="duration-desc">Duración: Mayor a menor</option>
              <option value="duration-asc">Duración: Menor a mayor</option>
              <option value="phases-desc">Fases: Mayor complejidad</option>
              <option value="name-asc">Nombre: A – Z</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={13} />
              <span>Restablecer Filtros</span>
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="proto-active-filters-strip">
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Filtros Activos:</span>
            {searchQuery && (
              <span className="proto-filter-badge">
                Búsqueda: "{searchQuery}"
                <span className="proto-filter-badge-remove" onClick={() => setSearchQuery('')}>×</span>
              </span>
            )}
            {selectedGoal !== 'all' && (
              <span className="proto-filter-badge">
                Objetivo: {GOAL_BUCKETS.find(g => g.id === selectedGoal)?.label}
                <span className="proto-filter-badge-remove" onClick={() => setSelectedGoal('all')}>×</span>
              </span>
            )}
            {durationFilter !== 'all' && (
              <span className="proto-filter-badge">
                Duración: {durationFilter}
                <span className="proto-filter-badge-remove" onClick={() => setDurationFilter('all')}>×</span>
              </span>
            )}
            {phasesFilter !== 'all' && (
              <span className="proto-filter-badge">
                Fases: {phasesFilter}
                <span className="proto-filter-badge-remove" onClick={() => setPhasesFilter('all')}>×</span>
              </span>
            )}
          </div>
        )}
      </section>

      {/* ── 4. Scope Bar (Regla #22) ── */}
      <div className="proto-scope-bar">
        <div className="proto-scope-badge">
          <Check size={16} />
          <span>
            Mostrando <strong>{filteredProtocols.length}</strong> de <strong>{enrichedProtocols.length}</strong> protocolos clínicos disponibles
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
          {selectedGoal !== 'all' 
            ? `Filtrado por: ${GOAL_BUCKETS.find(g => g.id === selectedGoal)?.label}` 
            : 'Mostrando Catálogo Completo'}
        </div>
      </div>

      {/* ── 5. Protocol Cards Grid ── */}
      {filteredProtocols.length > 0 ? (
        <div className="proto-cards-grid">
          {filteredProtocols.map(proto => {
            const primaryGoalId = proto.mappedGoals.find(g => g !== 'all') || 'longevity';
            const goalInfo = GOAL_BUCKETS.find(g => g.id === primaryGoalId) || GOAL_BUCKETS[0];

            return (
              <article key={proto.id || proto.cleanSlug} className="proto-card">
                <div className="proto-card-top">
                  {/* Header: Code & Category Pill */}
                  <div className="proto-card-header">
                    <button
                      type="button"
                      className="proto-card-code"
                      onClick={(e) => handleCopyCode(proto.cleanCode, e)}
                      title="Copiar Código de Protocolo"
                    >
                      {copiedId === proto.cleanCode ? '✓ COPIADO' : proto.cleanCode}
                    </button>

                    <span
                      className="proto-card-goal-pill"
                      style={{ background: goalInfo.bg, color: goalInfo.color, border: `1px solid ${goalInfo.color}33` }}
                    >
                      {goalInfo.label.split('&')[0].trim()}
                    </span>
                  </div>

                  {/* Title linking to Public Protocol Page */}
                  <Link href={`/proto/${proto.cleanSlug}`} className="proto-card-title">
                    {proto.cleanName}
                  </Link>

                  {/* Summary */}
                  <p className="proto-card-summary">
                    {proto.summary}
                  </p>

                  {/* Included Active Peptides */}
                  {proto.compounds.length > 0 && (
                    <div>
                      <div className="proto-card-peptides-label">
                        Péptidos Activos ({proto.compounds.length}):
                      </div>
                      <div className="proto-card-peptides-list">
                        {proto.compounds.map((c, cIdx) => (
                          <Link
                            key={cIdx}
                            href={`/p/${c.slug}`}
                            target="_blank"
                            className="proto-compound-chip"
                            title={`Ver monografía técnica de ${c.name}`}
                          >
                            <span>{c.name}</span>
                            <ExternalLink size={10} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline Specs Strip */}
                  <div className="proto-card-specs">
                    <div className="proto-card-spec-item">
                      <Clock size={13} style={{ color: '#0284c7' }} />
                      <span>{proto.durationWeeks} Semanas</span>
                    </div>

                    <div className="proto-card-spec-item">
                      <Layers size={13} style={{ color: '#0d9488' }} />
                      <span>{proto.phasesCount} {proto.phasesCount === 1 ? 'Fase Continua' : 'Fases de Titulación'}</span>
                    </div>

                    <div className="proto-card-spec-item">
                      <Shield size={13} style={{ color: '#16a34a' }} />
                      <span>Clínico</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="proto-card-actions">
                  <Link
                    href={`/proto/${proto.cleanSlug}`}
                    className="proto-card-btn-primary"
                    onClick={() => triggerHaptic('selection')}
                  >
                    <span>Explorar Timeline & Dosificación</span>
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    type="button"
                    className="proto-card-btn-icon"
                    onClick={(e) => handleCopyCode(`https://med-peptides.com/proto/${proto.cleanSlug}`, e)}
                    title="Copiar enlace directo"
                  >
                    {copiedId === `https://med-peptides.com/proto/${proto.cleanSlug}` ? (
                      <Check size={16} style={{ color: '#16a34a' }} />
                    ) : (
                      <Share2 size={16} />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="proto-empty-state">
          <div className="proto-empty-icon">
            <Search size={28} />
          </div>
          <h3 className="proto-empty-title">
            No se encontraron protocolos para esta búsqueda
          </h3>
          <p className="proto-empty-subtitle">
            Prueba ajustando los términos de búsqueda o seleccionando otro objetivo terapéutico en el selector superior.
          </p>
          <button
            type="button"
            className="proto-empty-btn"
            onClick={handleResetFilters}
          >
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* ── 6. Bottom Information Notice ── */}
      <footer style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        fontSize: '0.80rem',
        color: '#64748b',
        lineHeight: 1.5,
        textAlign: 'center'
      }}>
        <strong>Aviso Médico Profesional:</strong> Todos los protocolos clínicos presentados en este directorio están formulados bajo estándares de farmacocinética molecular y guías clínicas internacionales (SURMOUNT, STEP, TRIUMPH). La administración requiere prescripción médica y supervisión por un profesional de la salud debidamente cualificado.
      </footer>
    </div>
  );
}

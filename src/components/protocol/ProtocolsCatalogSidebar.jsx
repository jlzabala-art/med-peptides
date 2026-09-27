"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Filter, 
  RotateCcw, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Sparkles, 
  Award, 
  FlaskConical, 
  Clock, 
  Layers, 
  ArrowDown, 
  Building2, 
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  X
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { GOAL_TRANSLATIONS } from '@/utils/protocolTranslations';

/**
 * ProtocolsCatalogSidebar
 * Persistent Google Cloud Console-inspired Sticky Sidebar for the public protocols directory (/proto).
 * Contains:
 * 1. Clinical Filter Engine (Therapeutic Goals with live counters, Duration, Complexity, Sort)
 * 2. Scannable QR Code & Quick Copy for instant mobile access
 * 3. Quick-jump to Primary Clinical Reference Standards
 * 4. Healthcare Provider & Clinic institutional onboarding card
 */
export default function ProtocolsCatalogSidebar({
  selectedGoal,
  onSelectGoal,
  goalBuckets = [],
  goalCounts = {},
  durationFilter,
  onSelectDuration,
  phasesFilter,
  onSelectPhases,
  sortBy,
  onSelectSort,
  onResetFilters,
  hasActiveFilters,
  lang = 'en',
  t = {},
  publicUrl = 'https://med-peptides.com/proto',
  onOpenInquiry,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const isEs = lang === 'es';

  const handleCopyUrl = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl);
        triggerHaptic('copy');
        setCopiedUrl(true);
        toast.success(isEs ? 'Enlace del compendio copiado al portapapeles ✓' : 'Clinical directory URL copied to clipboard ✓');
        setTimeout(() => setCopiedUrl(false), 2200);
      }
    } catch {
      toast.error('Could not copy URL');
    }
  };

  const QUICK_REFERENCE_STANDARDS = [
    {
      slug: 'bpc-157-tb-500-protocol',
      name: 'BPC-157 + TB-500',
      tag: isEs ? 'Regeneración Tisular' : 'Tissue Regeneration',
      color: '#0284c7',
      bg: '#f0f9ff'
    },
    {
      slug: 'metabolic-retatrutide-motsc-12w',
      name: 'Retatrutide + MOTS-c',
      tag: isEs ? 'Metabolismo & Incretinas' : 'Incretin Metabolism',
      color: '#ea580c',
      bg: '#fff7ed'
    },
    {
      slug: 'nad-cellular-restoration-protocol',
      name: 'Master NAD+ Protocol',
      tag: isEs ? 'Longevidad & Sirtuínas' : 'Longevity & Sirtuins',
      color: '#0d9488',
      bg: '#f0fdfa'
    },
    {
      slug: 'cjc-1295-ipamorelin-synergistic-hgh-optimization',
      name: 'CJC-1295 + Ipamorelin',
      tag: isEs ? 'Eje Somatotrópico' : 'Somatotropic Axis',
      color: '#16a34a',
      bg: '#f0fdf4'
    },
    {
      slug: 'thymosin-alpha-1-immune-resilience',
      name: 'Thymosin Alpha 1',
      tag: isEs ? 'Inmunocompetencia' : 'Immune Resilience',
      color: '#7c3aed',
      bg: '#faf5ff'
    }
  ];

  const sidebarBody = (
    <div className="proto-sidebar-content">
      {/* ── CARD 1: Clinical Filter Engine ── */}
      <div className="proto-sidebar-card">
        {/* Sidebar Header with GCP Active Filter Count & Reset */}
        <div className="proto-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: '#003666' }} />
            <h3 className="proto-sidebar-title">
              {isEs ? 'FILTROS CLÍNICOS' : 'CLINICAL FILTERS'}
            </h3>
            {hasActiveFilters && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                backgroundColor: '#eff6ff',
                color: '#003666',
                border: '1px solid #bfdbfe',
                padding: '1px 6px',
                borderRadius: '999px'
              }}>
                {(selectedGoal !== 'all' ? 1 : 0) + (durationFilter !== 'all' ? 1 : 0) + (phasesFilter !== 'all' ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0)} {isEs ? 'activos' : 'active'}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="proto-sidebar-reset-btn"
              title={isEs ? 'Restablecer todos los filtros' : 'Reset all filters'}
            >
              <RotateCcw size={12} />
              <span>{isEs ? 'Limpiar' : 'Reset'}</span>
            </button>
          )}
        </div>

        {/* 1A. Therapeutic Goal Selector */}
        <div className="proto-sidebar-group">
          <label className="proto-sidebar-label">
            {isEs ? 'Área Terapéutica / Objetivo' : 'Therapeutic Goal'}
          </label>
          <div className="proto-sidebar-goals-list">
            {goalBuckets.map(bucket => {
              const isActive = selectedGoal === bucket.id;
              const count = goalCounts[bucket.id] || 0;
              const IconComp = bucket.icon || FlaskConical;
              const label = GOAL_TRANSLATIONS[bucket.id]?.[lang] || bucket.label;

              return (
                <button
                  key={bucket.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    onSelectGoal(bucket.id);
                  }}
                  className={`proto-sidebar-goal-btn ${isActive ? 'is-active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span 
                      className="proto-sidebar-goal-icon"
                      style={{ 
                        background: isActive ? '#003666' : bucket.bg, 
                        color: isActive ? '#ffffff' : bucket.color 
                      }}
                    >
                      <IconComp size={13} />
                    </span>
                    <span className="proto-sidebar-goal-name">
                      {label}
                    </span>
                  </div>
                  <span className="proto-sidebar-goal-badge">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1B. Duration Filter (GCP Segmented Chip Control) */}
        <div className="proto-sidebar-group" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="proto-sidebar-label" style={{ margin: 0 }}>
              <Clock size={12} style={{ color: '#0284c7' }} />
              <span>{isEs ? 'Duración del Ciclo' : 'Cycle Duration'}</span>
            </label>
            {durationFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectDuration('all')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {isEs ? 'Restablecer' : 'Reset'}
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
            {[
              { id: 'all', label: isEs ? 'Todas' : 'All' },
              { id: 'short', label: isEs ? '≤ 8 Sem (Corto)' : '≤ 8 W (Short)' },
              { id: 'medium', label: isEs ? '8–12 Sem' : '8–12 W' },
              { id: 'long', label: isEs ? '> 12 Sem (Ext)' : '> 12 W (Ext)' }
            ].map((item) => {
              const isSelected = durationFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectDuration(item.id);
                  }}
                  style={{
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 600,
                    borderRadius: '7px',
                    border: isSelected ? '1.5px solid #003666' : '1px solid #cbd5e1',
                    background: isSelected ? '#003666' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,54,102,0.2)' : 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1C. Titration Structure (GCP Segmented Pill Bar) */}
        <div className="proto-sidebar-group" style={{ marginTop: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="proto-sidebar-label" style={{ margin: 0 }}>
              <Layers size={12} style={{ color: '#0d9488' }} />
              <span>{isEs ? 'Estructura de Titulación' : 'Titration Structure'}</span>
            </label>
            {phasesFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectPhases('all')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0d9488',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {isEs ? 'Restablecer' : 'Reset'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: isEs ? 'Todas' : 'All' },
              { id: 'single', label: isEs ? 'Monofásico (1 Fase)' : 'Continuous (1-Ph)' },
              { id: 'titration', label: isEs ? 'Multifásico (2+ Fases)' : 'Titration (2+ Ph)' }
            ].map((item) => {
              const isSelected = phasesFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectPhases(item.id);
                  }}
                  style={{
                    flex: item.id === 'all' ? '0 0 auto' : '1 1 auto',
                    padding: '5px 10px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 600,
                    borderRadius: '7px',
                    border: isSelected ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                    background: isSelected ? '#0d9488' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 1px 4px rgba(13,148,136,0.2)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1D. Sort Criteria (Refined GCP Select with Custom Chevron) */}
        <div className="proto-sidebar-group" style={{ marginTop: '0.85rem' }}>
          <label className="proto-sidebar-label" style={{ marginBottom: '6px' }}>
            <ArrowDown size={12} style={{ color: '#64748b' }} />
            <span>{isEs ? 'Ordenar Resultados' : 'Sort Criteria'}</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="proto-sidebar-select"
              value={sortBy}
              onChange={(e) => {
                triggerHaptic('light');
                onSelectSort(e.target.value);
              }}
              style={{
                paddingRight: '28px',
                appearance: 'none',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#1e293b'
              }}
            >
              <option value="relevance">{t.sortRecommended || (isEs ? 'Relevancia y Referencia Clínica' : 'Clinical Relevance & Reference')}</option>
              <option value="duration-desc">{t.sortDurationDesc || (isEs ? 'Duración: Mayor a menor' : 'Duration: Longest first')}</option>
              <option value="duration-asc">{t.sortDurationAsc || (isEs ? 'Duración: Menor a mayor' : 'Duration: Shortest first')}</option>
              <option value="phases-desc">{isEs ? 'Fases: Mayor complejidad' : 'Phases: Highest complexity'}</option>
              <option value="name-asc">{t.sortNameAsc || (isEs ? 'Nombre: A → Z' : 'Name: A → Z')}</option>
            </select>
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#64748b'
            }}>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>


      {/* ── CARD 3: Quick Jump to Primary Reference Standards ── */}
      <div className="proto-sidebar-card">
        <div className="proto-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={15} style={{ color: '#b45309' }} />
            <h3 className="proto-sidebar-title">
              {isEs ? 'ESTÁNDARES DE REFERENCIA' : 'REFERENCE STANDARDS'}
            </h3>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: '4px' }}>
            TOP 5
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {QUICK_REFERENCE_STANDARDS.map(ref => (
            <Link
              key={ref.slug}
              href={`/proto/${ref.slug}`}
              className="proto-sidebar-ref-item"
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ref.name}
                </div>
                <div style={{ fontSize: '0.66rem', color: ref.color, fontWeight: 600 }}>
                  {ref.tag}
                </div>
              </div>
              <ChevronRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* ── CARD 4: Healthcare Provider & Clinic Onboarding ── */}
      <div className="proto-sidebar-card" style={{ background: 'linear-gradient(135deg, #003666 0%, #0f172a 100%)', color: '#ffffff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Building2 size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {isEs ? 'ACCESO INSTITUCIONAL' : 'CLINICAL PORTAL'}
          </span>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          {isEs
            ? 'Regístrate como prescriptor médico para duplicar pautas dosimétricas en expedientes de pacientes.'
            : 'Register as a licensed prescriber to clone dosimetric blueprints directly into patient charts.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Link
            href="/login?tab=register&role=doctor&redirect=/proto"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '6px',
              background: '#0d9488',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <span>{isEs ? 'Alta Profesional →' : 'Register Provider →'}</span>
          </Link>
          {onOpenInquiry && (
            <button
              type="button"
              onClick={onOpenInquiry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>{isEs ? 'Consulta Institucional' : 'Institutional Inquiry'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (>= 1024px) */}
      <aside className="proto-sidebar-desktop" aria-label="Clinical Directory Filters and Tools">
        {sidebarBody}
      </aside>

      {/* Mobile Slide-Over Drawer (< 1024px) */}
      {isMobileDrawerOpen && (
        <div className="proto-mobile-drawer-backdrop" onClick={onCloseMobileDrawer}>
          <div className="proto-mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="proto-mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="#003666" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Filtros & Herramientas del Directorio' : 'Directory Filters & Tools'}
                </span>
              </div>
              <button
                type="button"
                className="proto-mobile-drawer-close"
                onClick={onCloseMobileDrawer}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <div className="proto-mobile-drawer-body">
              {sidebarBody}
            </div>
            <div className="proto-mobile-drawer-footer">
              <button
                type="button"
                className="proto-mobile-drawer-apply-btn"
                onClick={onCloseMobileDrawer}
              >
                {isEs ? 'Aplicar Filtros' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
        <div className="proto-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: '#003666' }} />
            <h3 className="proto-sidebar-title">
              {isEs ? 'FILTROS CLÍNICOS' : 'CLINICAL FILTERS'}
            </h3>
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

        {/* 1B. Duration Filter */}
        <div className="proto-sidebar-group" style={{ marginTop: '1rem' }}>
          <label className="proto-sidebar-label">
            <Clock size={12} style={{ color: '#0284c7' }} />
            <span>{isEs ? 'Duración del Ciclo' : 'Cycle Duration'}</span>
          </label>
          <select
            className="proto-sidebar-select"
            value={durationFilter}
            onChange={(e) => {
              triggerHaptic('light');
              onSelectDuration(e.target.value);
            }}
          >
            <option value="all">{t.allDurations || (isEs ? 'Todas las duraciones' : 'All Durations')}</option>
            <option value="short">{t.shortCycle || (isEs ? '≤ 8 Semanas (Corto)' : '≤ 8 Weeks (Short)')}</option>
            <option value="medium">{t.standardCycle || (isEs ? '8–12 Semanas (Estándar)' : '8–12 Weeks (Standard)')}</option>
            <option value="long">{t.extendedCycle || (isEs ? '> 12 Semanas (Extendido)' : '> 12 Weeks (Extended)')}</option>
          </select>
        </div>

        {/* 1C. Titration Structure */}
        <div className="proto-sidebar-group" style={{ marginTop: '0.85rem' }}>
          <label className="proto-sidebar-label">
            <Layers size={12} style={{ color: '#0d9488' }} />
            <span>{isEs ? 'Estructura de Titulación' : 'Titration Structure'}</span>
          </label>
          <select
            className="proto-sidebar-select"
            value={phasesFilter}
            onChange={(e) => {
              triggerHaptic('light');
              onSelectPhases(e.target.value);
            }}
          >
            <option value="all">{t.allStructures || (isEs ? 'Todas las estructuras' : 'All Structures')}</option>
            <option value="single">{t.singlePhase || (isEs ? 'Monofásico Continuo' : 'Continuous Protocol')}</option>
            <option value="titration">{t.titrationPhase || (isEs ? 'Titulación Multifásica' : 'Progressive Titration')}</option>
          </select>
        </div>

        {/* 1D. Sort Criteria */}
        <div className="proto-sidebar-group" style={{ marginTop: '0.85rem' }}>
          <label className="proto-sidebar-label">
            <ArrowDown size={12} style={{ color: '#64748b' }} />
            <span>{isEs ? 'Ordenar Resultados' : 'Sort Criteria'}</span>
          </label>
          <select
            className="proto-sidebar-select"
            value={sortBy}
            onChange={(e) => {
              triggerHaptic('light');
              onSelectSort(e.target.value);
            }}
          >
            <option value="relevance">{t.sortRecommended || (isEs ? 'Relevancia y Referencia Clínica' : 'Clinical Relevance & Reference')}</option>
            <option value="duration-desc">{t.sortDurationDesc || (isEs ? 'Duración: Mayor a menor' : 'Duration: Longest first')}</option>
            <option value="duration-asc">{t.sortDurationAsc || (isEs ? 'Duración: Menor a mayor' : 'Duration: Shortest first')}</option>
            <option value="phases-desc">{isEs ? 'Fases: Mayor complejidad' : 'Phases: Highest complexity'}</option>
            <option value="name-asc">{t.sortNameAsc || (isEs ? 'Nombre: A → Z' : 'Name: A → Z')}</option>
          </select>
        </div>
      </div>

      {/* ── CARD 2: Scannable Directory QR Code & Fast Copy ── */}
      <div className="proto-sidebar-card">
        <div className="proto-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={15} style={{ color: '#0d9488' }} />
            <h3 className="proto-sidebar-title">
              {isEs ? 'VERIFICACIÓN DIGITAL & QR' : 'DIGITAL QR VERIFICATION'}
            </h3>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1px 6px', borderRadius: '4px' }}>
            SSOT 2026
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem 0 0.25rem' }}>
          <div style={{
            background: '#ffffff',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            marginBottom: '0.75rem'
          }}>
            <QRCodeSVG value={publicUrl} size={135} level="M" />
          </div>

          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            {isEs ? 'Directorio Público de Protocolos' : 'Public Clinical Directory'}
          </span>
          <span style={{ fontSize: '0.66rem', color: '#64748b', marginBottom: '0.75rem' }}>
            {isEs ? 'Escanear para acceso directo en móvil' : 'Scan for instant mobile lookup'}
          </span>

          <button
            type="button"
            onClick={handleCopyUrl}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: copiedUrl ? '#16a34a' : '#003666',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 4px rgba(0,54,102,0.15)'
            }}
          >
            {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedUrl ? (isEs ? 'Enlace Copiado ✓' : 'Link Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy Directory Link')}</span>
          </button>
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

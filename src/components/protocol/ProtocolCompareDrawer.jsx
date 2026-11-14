"use client";

import React from 'react';
import Link from 'next/link';
import { X, ExternalLink, GitCompare, ShieldAlert, Clock, Layers, Award } from '@/lib/icons';

export default function ProtocolCompareDrawer({
  isOpen,
  onClose,
  protocols = [],
  onRemove,
  onClear,
  lang = 'en',
}) {
  if (!isOpen || protocols.length === 0) return null;
  const isEs = lang === 'es';

  return (
    <div className="proto-compare-overlay" role="dialog" aria-modal="true" aria-label="Protocol Comparison">
      <div className="proto-compare-drawer">
        <div className="proto-compare-header">
          <div className="proto-compare-title-group">
            <GitCompare size={18} />
            <h3>
              {isEs
                ? `Comparador Clínico (${protocols.length}/3)`
                : `Clinical Protocol Comparator (${protocols.length}/3)`}
            </h3>
          </div>
          <div className="proto-compare-header-actions">
            <button type="button" className="proto-compare-clear-btn" onClick={onClear}>
              {isEs ? 'Limpiar' : 'Clear all'}
            </button>
            <button type="button" className="proto-compare-close-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="proto-compare-grid" style={{ gridTemplateColumns: `repeat(${protocols.length}, minmax(240px, 1fr))` }}>
          {protocols.map((p) => (
            <div key={p.cleanSlug} className="proto-compare-col">
              <div className="proto-compare-col-top">
                <span className="proto-compare-code">{p.cleanCode}</span>
                <button
                  type="button"
                  className="proto-compare-remove-btn"
                  onClick={() => onRemove(p.cleanSlug)}
                  aria-label={`Remove ${p.cleanName}`}
                >
                  <X size={14} />
                </button>
              </div>

              <h4 className="proto-compare-name">{p.cleanName}</h4>

              <div className="proto-compare-metrics">
                <div className="proto-compare-row">
                  <span className="proto-compare-label"><Clock size={12} /> {isEs ? 'Duración' : 'Duration'}</span>
                  <strong>{p.durationWeeks} {isEs ? 'sem' : 'wks'}</strong>
                </div>
                <div className="proto-compare-row">
                  <span className="proto-compare-label"><Layers size={12} /> {isEs ? 'Fases' : 'Phases'}</span>
                  <strong>{p.phasesCount}</strong>
                </div>
                <div className="proto-compare-row">
                  <span className="proto-compare-label">{isEs ? 'Vía' : 'Route'}</span>
                  <strong>{p.route}</strong>
                </div>
                <div className="proto-compare-row">
                  <span className="proto-compare-label"><Award size={12} /> {isEs ? 'Evidencia' : 'Evidence'}</span>
                  <strong>{p.evidence_grade}</strong>
                </div>
              </div>

              <div className="proto-compare-section">
                <div className="proto-compare-section-title">{isEs ? 'Compuestos Activos' : 'Active Compounds'}</div>
                <div className="proto-compare-chips">
                  {p.compounds.length > 0 ? (
                    p.compounds.map((c, idx) => (
                      <span key={idx} className="proto-compound-chip">{c.name}</span>
                    ))
                  ) : (
                    <span className="proto-compare-muted">—</span>
                  )}
                </div>
              </div>

              <div className="proto-compare-section">
                <div className="proto-compare-section-title">{isEs ? 'Biomarcadores / Labs' : 'Biomarkers / Labs'}</div>
                <p className="proto-compare-text">
                  {p.biomarkers && p.biomarkers.length > 0 ? p.biomarkers.join(', ') : 'CBC, CMP'}
                </p>
              </div>

              <div className="proto-compare-section">
                <div className="proto-compare-section-title is-safety">
                  <ShieldAlert size={12} /> {isEs ? 'Contraindicaciones' : 'Contraindications'}
                </div>
                <p className="proto-compare-text">
                  {p.contraindications && p.contraindications.length > 0
                    ? p.contraindications.slice(0, 2).join(' · ')
                    : (isEs ? 'Evaluación médica estándar requerida.' : 'Standard clinical screening required.')}
                </p>
              </div>

              <Link href={`/proto/${p.cleanSlug}`} className="proto-expanded-blueprint-btn" style={{ marginTop: 'auto' }}>
                <span>{isEs ? 'Abrir Protocolo' : 'Open Protocol'}</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

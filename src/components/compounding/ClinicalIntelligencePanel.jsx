'use client';

import React from 'react';
import { Sparkles, Layers, Plus, AlertTriangle } from '@/lib/icons';

export default function ClinicalIntelligencePanel({
  lang,
  t,
  activeSynergies,
  chronoWarning,
  overlapWarnings,
  synergySuggestions,
  isSplitProtocol,
  onToggleSplit,
  onAddActive
}) {
  const hasContent =
    activeSynergies.length > 0 ||
    Boolean(chronoWarning) ||
    overlapWarnings.length > 0 ||
    synergySuggestions.length > 0;

  if (!hasContent) return null;

  return (
    <div className="cmp-intel-card">
      <div className="cmp-intel-head">
        <span className="cmp-intel-title">
          <Sparkles size={14} />
          <span>Atlas Clinical Intelligence</span>
        </span>
        {activeSynergies.length > 0 && (
          <span className="cmp-intel-badge">
            {activeSynergies.length} {lang === 'es' ? 'Sinergias' : 'Synergies'}
          </span>
        )}
      </div>

      {/* Active Synergies */}
      {activeSynergies.map((syn, sIdx) => (
        <div key={sIdx} className="cmp-intel-desc">
          <strong>⚡ {syn.title}:</strong> {syn.desc}
        </div>
      ))}

      {/* Chronobiology Conflict */}
      {chronoWarning && (
        <div className="cmp-intel-warn">
          <span>🌓 {chronoWarning}</span>
          {!isSplitProtocol && (
            <button type="button" onClick={onToggleSplit} className="cmp-split-btn">
              <Layers size={12} />
              <span>{t.splitProtocol}</span>
            </button>
          )}
        </div>
      )}

      {/* Overlap / Stacking Warnings */}
      {overlapWarnings.map((warn, wIdx) => (
        <div key={wIdx} className="cmp-intel-overlap">
          <AlertTriangle size={13} />
          <span>{warn}</span>
        </div>
      ))}

      {/* Synergy & Bioavailability Suggestions */}
      {synergySuggestions.map((sug, sgIdx) => (
        <div key={sgIdx} className="cmp-intel-suggest">
          <span>
            <strong>+ {lang === 'es' ? 'Sinergia / Absorción' : 'Synergy / Absorption'}:</strong>{' '}
            {lang === 'es' ? `Añade ${sug.api.name} para potenciar ${sug.pairedWith}` : `Add ${sug.api.name} to amplify ${sug.pairedWith}`} ({sug.reason}).
          </span>
          <button type="button" className="cmp-intel-add-btn" onClick={() => onAddActive(sug.api)}>
            <Plus size={11} />
            <span>{lang === 'es' ? 'Añadir' : 'Add'}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Layers,
  ArrowRight,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  GitCompare,
  Star,
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import {
  GOAL_BUCKETS,
  REFERENCE_TELEMETRY_PILLS,
  resolveDisplayedGoal,
  getGoalBadgeLabel,
} from '../../utils/protocolCatalogTaxonomy';

function getEvidenceTone(grade) {
  const g = String(grade || '').toLowerCase();
  if (g.includes('high')) return { label: 'High Evidence', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
  if (g.includes('moderate')) return { label: 'Moderate Evidence', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  return { label: grade || 'Emerging', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
}

export default function ProtocolListRow({
  proto,
  groupBucketId,
  selectedGoal,
  isExpanded,
  onToggleExpand,
  isCompared,
  onToggleCompare,
  isShortlisted,
  onToggleShortlist,
  onOpenQr,
  onCopyLink,
  copiedId,
  lang = 'en',
  t = {},
}) {
  const isEs = lang === 'es';
  const displayedGoalId = resolveDisplayedGoal(proto, groupBucketId, selectedGoal);
  const goalInfo = GOAL_BUCKETS.find((g) => g.id === displayedGoalId) || GOAL_BUCKETS[0];
  const GoalIcon = goalInfo.icon || Sparkles;
  const localizedGoal = getGoalBadgeLabel(displayedGoalId, lang);
  const protoUrl = `https://www.atlashealth-services.com/proto/${proto.cleanSlug}`;
  const evidenceTone = getEvidenceTone(proto.evidence_grade);

  return (
    <article
      className={`proto-list-item ${proto.is_reference_standard ? 'is-reference-standard' : ''} ${isExpanded ? 'is-expanded' : ''}`}
    >
      {/* Main Compact Row */}
      <div className="proto-list-row">
        <div className="proto-list-left">
          <button
            type="button"
            className="proto-list-expand-btn"
            onClick={() => onToggleExpand(proto.cleanSlug)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${proto.cleanName}` : `Expand ${proto.cleanName}`}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <Link
            href={`/proto/${proto.cleanSlug}`}
            className="proto-list-title"
          >
            {proto.cleanName}
          </Link>

          {proto.is_reference_standard && (
            <>
              <span
                className="proto-list-badge-reference"
                title={isEs ? 'Protocolo de Referencia Clínica' : 'Primary Clinical Reference Standard'}
              >
                <Award size={11} />
                <span>{isEs ? 'Referencia Clínica' : 'Reference Standard'}</span>
              </span>
              {REFERENCE_TELEMETRY_PILLS[proto.cleanSlug] && (
                <span className="proto-telemetry-badge">
                  {REFERENCE_TELEMETRY_PILLS[proto.cleanSlug][lang] || REFERENCE_TELEMETRY_PILLS[proto.cleanSlug].en}
                </span>
              )}
            </>
          )}

          <span
            className="proto-card-goal-pill"
            style={{
              background: goalInfo.bg,
              color: goalInfo.color,
              border: `1px solid ${goalInfo.color}33`,
            }}
          >
            <GoalIcon size={11} style={{ flexShrink: 0 }} />
            <span>{localizedGoal}</span>
          </span>
        </div>

        {/* Clinical Signals: Route, Evidence, Compounds, Duration, Phases */}
        <div className="proto-list-meta">
          <span className="proto-list-chip-route">{proto.route}</span>

          <span
            className="proto-list-chip-evidence"
            style={{
              background: evidenceTone.bg,
              color: evidenceTone.color,
              border: `1px solid ${evidenceTone.border}`,
            }}
          >
            {evidenceTone.label}
          </span>

          {proto.compounds.length > 0 && (
            <span className="proto-list-chip-compounds">
              {proto.compounds.length} {isEs ? 'Péptidos' : 'Peptides'}
            </span>
          )}

          <span className="proto-list-chip-spec">
            <Clock size={12} style={{ color: '#0284c7' }} />
            <span>{proto.durationWeeks}w</span>
          </span>

          <span className="proto-list-chip-spec">
            <Layers size={12} style={{ color: '#0d9488' }} />
            <span>{proto.phasesCount}ph</span>
          </span>
        </div>

        {/* Right Actions — Single CTA when collapsed, clean utilities always */}
        <div className="proto-list-actions">
          {!isExpanded && (
            <Link
              href={`/proto/${proto.cleanSlug}`}
              className="proto-card-btn-primary proto-list-btn-cta"
              onClick={() => triggerHaptic('selection')}
            >
              <span>{t.viewTimeline || (isEs ? 'Ver Protocolo' : 'Explore')}</span>
              <ArrowRight size={13} />
            </Link>
          )}

          <button
            type="button"
            className={`proto-card-btn-icon ${isCompared ? 'is-selected' : ''}`}
            onClick={() => {
              triggerHaptic('selection');
              onToggleCompare(proto.cleanSlug);
            }}
            title={isEs ? 'Comparar lado a lado' : 'Compare side-by-side'}
            aria-pressed={isCompared}
            aria-label={isEs ? 'Comparar protocolo' : 'Compare protocol'}
          >
            <GitCompare size={15} />
          </button>

          <button
            type="button"
            className={`proto-card-btn-icon ${isShortlisted ? 'is-starred' : ''}`}
            onClick={() => {
              triggerHaptic('selection');
              onToggleShortlist(proto.cleanSlug);
            }}
            title={isEs ? 'Guardar en favoritos' : 'Save to shortlist'}
            aria-pressed={isShortlisted}
            aria-label={isEs ? 'Guardar en favoritos' : 'Save to shortlist'}
          >
            <Star size={15} />
          </button>

          <button
            type="button"
            className="proto-card-btn-icon"
            onClick={(e) => onOpenQr(proto, e)}
            title={isEs ? 'Ver Código QR' : 'View QR Code'}
            aria-label="View QR Code"
          >
            <QrCode size={15} style={{ color: '#003666' }} />
          </button>

          <button
            type="button"
            className="proto-card-btn-icon"
            onClick={(e) => onCopyLink(protoUrl, e)}
            title={t.copyProtocolLink || (isEs ? 'Copiar enlace' : 'Copy link')}
            aria-label="Copy protocol link"
          >
            {copiedId === protoUrl ? (
              <Check size={15} style={{ color: '#16a34a' }} />
            ) : (
              <Copy size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Master-Detail Panel */}
      {isExpanded && (
        <div className="proto-list-expanded">
          <div className="proto-expanded-grid">
            <div className="proto-expanded-left">
              <div className="proto-expanded-section-label">
                {isEs ? 'RESUMEN CLÍNICO & INDICACIÓN' : 'CLINICAL SUMMARY & INDICATION'}
              </div>
              <p className="proto-list-expanded-summary">{proto.summary}</p>

              {proto.compounds.length > 0 && (
                <div className="proto-expanded-block">
                  <div className="proto-card-peptides-label">
                    {isEs ? 'Péptidos Activos Incluidos (Monografías):' : 'Included Active Peptides (Monographs):'}
                  </div>
                  <div className="proto-card-peptides-list" style={{ marginBottom: 0 }}>
                    {proto.compounds.map((c, cIdx) => (
                      <Link
                        key={cIdx}
                        href={`/p/${c.slug}`}
                        target="_blank"
                        className="proto-compound-chip"
                        title={`Inspect ${c.name} technical monograph`}
                      >
                        <span>{c.name}</span>
                        <ExternalLink size={10} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {proto.contraindications && proto.contraindications.length > 0 && (
                <div className="proto-expanded-safety-box">
                  <div className="proto-expanded-safety-title">
                    <ShieldAlert size={13} />
                    <span>{isEs ? 'Contraindicaciones Clave' : 'Key Contraindications'}</span>
                  </div>
                  <p className="proto-expanded-safety-text">
                    {proto.contraindications.slice(0, 2).join(' · ')}
                  </p>
                </div>
              )}
            </div>

            <div className="proto-expanded-right">
              <div className="proto-expanded-section-label">
                {isEs ? 'PARÁMETROS & BIOMARCADORES' : 'PARAMETERS & BIOMARKERS'}
              </div>
              <div className="proto-telemetry-specs">
                <div className="proto-telemetry-item">
                  <span className="proto-telemetry-key">{isEs ? 'Vía:' : 'Route:'}</span>
                  <span className="proto-telemetry-val">{proto.route}</span>
                </div>
                <div className="proto-telemetry-item">
                  <span className="proto-telemetry-key">{isEs ? 'Evidencia:' : 'Evidence:'}</span>
                  <span className="proto-telemetry-val">{proto.evidence_grade}</span>
                </div>
                <div className="proto-telemetry-item">
                  <span className="proto-telemetry-key">{isEs ? 'Estructura:' : 'Phases:'}</span>
                  <span className="proto-telemetry-val">
                    {proto.phasesCount} {proto.phasesCount === 1 ? (isEs ? 'Fase' : 'Phase') : (isEs ? 'Fases' : 'Phases')} ({proto.durationWeeks}w)
                  </span>
                </div>
                {proto.biomarkers && proto.biomarkers.length > 0 && (
                  <div className="proto-telemetry-item">
                    <span className="proto-telemetry-key">{isEs ? 'Labs:' : 'Labs:'}</span>
                    <span className="proto-telemetry-val">{proto.biomarkers.slice(0, 3).join(', ')}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '12px' }}>
                <Link
                  href={`/proto/${proto.cleanSlug}`}
                  className="proto-expanded-blueprint-btn"
                  onClick={() => triggerHaptic('selection')}
                >
                  <span>{isEs ? 'Explorar Blueprint Completo (Gantt)' : 'Explore Full Clinical Blueprint (Gantt)'}</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

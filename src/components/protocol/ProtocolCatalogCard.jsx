"use client";

import React from 'react';
import Link from 'next/link';
import {
  Award,
  Clock,
  Layers,
  Shield,
  ArrowRight,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
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

export default function ProtocolCatalogCard({
  proto,
  groupBucketId,
  selectedGoal,
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

  return (
    <article className={`proto-card ${proto.is_reference_standard ? 'is-reference-standard' : ''}`}>
      {proto.is_reference_standard && (
        <div className="proto-card-badge-reference">
          <div className="proto-ref-badge-main">
            <Award size={13} className="proto-ref-icon" />
            <span className="proto-ref-label">
              {isEs
                ? (proto.reference_label_es || 'Protocolo de Referencia Clínica')
                : (proto.reference_label_en || 'Primary Clinical Reference Standard')}
            </span>
          </div>
          <div className="proto-card-ref-pills">
            {REFERENCE_TELEMETRY_PILLS[proto.cleanSlug] && (
              <span className="proto-telemetry-badge">
                {REFERENCE_TELEMETRY_PILLS[proto.cleanSlug][lang] || REFERENCE_TELEMETRY_PILLS[proto.cleanSlug].en}
              </span>
            )}
            <span className="proto-ref-tier-pill">
              {isEs ? 'Ficha Extensa' : 'Extended Monograph'}
            </span>
          </div>
        </div>
      )}

      <div className="proto-card-top">
        <div className="proto-card-header">
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

          <div className="proto-card-header-badges">
            <span className="proto-list-chip-route">{proto.route}</span>
            <button
              type="button"
              className={`proto-card-mini-btn ${isShortlisted ? 'is-starred' : ''}`}
              onClick={() => {
                triggerHaptic('selection');
                onToggleShortlist(proto.cleanSlug);
              }}
              aria-pressed={isShortlisted}
              title={isEs ? 'Guardar en favoritos' : 'Save to shortlist'}
            >
              <Star size={13} />
            </button>
          </div>
        </div>

        <Link href={`/proto/${proto.cleanSlug}`} className="proto-card-title">
          {proto.cleanName}
        </Link>

        <p className="proto-card-summary">{proto.summary}</p>

        {proto.compounds.length > 0 && (
          <div>
            <div className="proto-card-peptides-label">
              {isEs ? 'Péptidos Activos' : 'Active Peptides'} ({proto.compounds.length}):
            </div>
            <div className="proto-card-peptides-list">
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

        {Array.isArray(proto.phases) && proto.phases.length > 0 && (
          <div className="proto-card-phases-stepper">
            {proto.phases.map((ph, phIdx) => (
              <React.Fragment key={ph.id || phIdx}>
                <div
                  className={`proto-phase-pill ${
                    phIdx === 0 ? 'is-start' : phIdx === proto.phases.length - 1 ? 'is-end' : 'is-mid'
                  }`}
                >
                  <span className="proto-phase-pill-name">{ph.name || `Phase ${phIdx + 1}`}</span>
                  <span className="proto-phase-pill-weeks">
                    {ph.durationWeeks || 4}w · Wk {ph.startWeek || 1}–{ph.endWeek || (ph.durationWeeks || 4)}
                  </span>
                </div>
                {phIdx < proto.phases.length - 1 && (
                  <span className="proto-phase-arrow" aria-hidden="true">➔</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="proto-card-specs">
          <div className="proto-card-spec-item">
            <Clock size={13} style={{ color: '#0284c7' }} />
            <span>{proto.durationWeeks} {isEs ? 'Semanas' : 'Weeks'}</span>
          </div>
          <div className="proto-card-spec-item">
            <Layers size={13} style={{ color: '#0d9488' }} />
            <span>
              {proto.phasesCount} {proto.phasesCount === 1 ? (isEs ? 'Fase' : 'Phase') : (isEs ? 'Fases' : 'Phases')}
            </span>
          </div>
          <div className="proto-card-spec-item">
            <Shield size={13} style={{ color: '#16a34a' }} />
            <span>{proto.evidence_grade || (isEs ? 'Clínico' : 'Clinical')}</span>
          </div>
        </div>
      </div>

      <div className="proto-card-actions">
        <Link
          href={`/proto/${proto.cleanSlug}`}
          className="proto-card-btn-primary"
          onClick={() => triggerHaptic('selection')}
        >
          <span>{t.viewTimeline || (isEs ? 'Ver Protocolo' : 'Explore Timeline')}</span>
          <ArrowRight size={14} />
        </Link>

        <button
          type="button"
          className={`proto-card-btn-icon ${isCompared ? 'is-selected' : ''}`}
          onClick={() => {
            triggerHaptic('selection');
            onToggleCompare(proto.cleanSlug);
          }}
          title={isEs ? 'Comparar lado a lado' : 'Compare side-by-side'}
          aria-pressed={isCompared}
        >
          <GitCompare size={16} />
        </button>

        <button
          type="button"
          className="proto-card-btn-icon"
          onClick={(e) => onOpenQr(proto, e)}
          title={isEs ? 'Ver Código QR' : 'View QR Code'}
          aria-label="View QR Code"
        >
          <QrCode size={16} style={{ color: '#003666' }} />
        </button>

        <button
          type="button"
          className="proto-card-btn-icon"
          onClick={(e) => onCopyLink(protoUrl, e)}
          title={t.copyProtocolLink || (isEs ? 'Copiar enlace' : 'Copy link')}
          aria-label="Copy protocol link"
        >
          {copiedId === protoUrl ? (
            <Check size={16} style={{ color: '#16a34a' }} />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
    </article>
  );
}

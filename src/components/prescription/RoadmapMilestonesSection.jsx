"use client";

import React from 'react';
import { Clock, CheckCircle2, RefreshCw, Calendar } from '@/lib/icons';
import { computeRefillSchedule, extractDurationDays, formatShortDate } from '@/utils/refillSchedule';

/**
 * RoadmapMilestonesSection
 *
 * Visual connected treatment timeline showing current day progress,
 * phase cards, and direct refill CTA on the final milestone.
 */
export default function RoadmapMilestonesSection({
  timeline = [],
  isEs = false,
  durationLabel = null,
  rx = null,
  formulations = [],
  onRequestRefill = null,
}) {
  if (!timeline || timeline.length === 0) return null;

  const numericDays = rx ? extractDurationDays(rx, formulations) : null;
  const resolvedDuration =
    durationLabel ||
    (numericDays ? (isEs ? `${numericDays} Días` : `${numericDays} Days`) : (isEs ? '90 Días' : '90 Days'));

  const schedule = rx ? computeRefillSchedule(rx, formulations) : null;
  const totalDays = schedule?.durationDays || numericDays || 30;
  const hasDates = Boolean(schedule?.purchaseDate && schedule?.daysRemaining !== null);
  const elapsedDays = hasDates
    ? Math.max(1, Math.min(totalDays, totalDays - Math.max(0, schedule.daysRemaining)))
    : 1;
  const progressPct = hasDates ? Math.max(6, Math.min(100, Math.round((elapsedDays / totalDays) * 100))) : 12;

  const activeStepIndex =
    progressPct >= 85 ? Math.max(0, timeline.length - 1) : progressPct >= 45 ? Math.min(1, timeline.length - 1) : 0;

  return (
    <div id="milestones-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
      <div
        className="rx-card"
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '1.35rem',
          boxShadow: 'none',
          marginBottom: '0',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
            borderBottom: '1px solid #f1f3f4',
            paddingBottom: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: '#e8f0fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a73e8',
                flexShrink: 0,
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.0rem', fontWeight: 700, color: '#202124' }}>
                {isEs
                  ? `2. Plan de Tratamiento (${resolvedDuration})`
                  : `2. Treatment Plan (${resolvedDuration})`}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#5f6368' }}>
                {isEs
                  ? 'Progreso visual por fases desde tu inicio hasta tu siguiente revisión'
                  : 'Visual phase-by-phase progress from day 1 to your next review'}
              </p>
            </div>
          </div>

          <span
            style={{
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            {isEs ? `Ciclo: ${resolvedDuration}` : `Cycle: ${resolvedDuration}`}
          </span>
        </div>

        {/* Visual Progress Bar ("Where You Are Today") */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', fontSize: '0.76rem' }}>
            <span style={{ fontWeight: 700, color: '#202124', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} color="#1a73e8" />
              {hasDates
                ? (isEs ? `Día ${elapsedDays} de ${totalDays} · Fase ${activeStepIndex + 1} activa` : `Day ${elapsedDays} of ${totalDays} · Phase ${activeStepIndex + 1} active`)
                : (isEs ? `Plan visual de ${resolvedDuration}` : `${resolvedDuration} Visual Roadmap`)}
            </span>
            {schedule?.tentativeRefillDate && (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: schedule.isTwoWeekWarning ? '#b45309' : '#5f6368' }}>
                {isEs
                  ? `Refill estimado: ${formatShortDate(schedule.tentativeRefillDate, true)}`
                  : `Tentative refill: ${formatShortDate(schedule.tentativeRefillDate, false)}`}
              </span>
            )}
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1a73e8 0%, #0d9488 100%)',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Visual Connected Stepper Grid (3 cols desktop, 1 col mobile) */}
        <style>{`
          .atlas-roadmap-3col-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            width: 100%;
          }
          @media (max-width: 640px) {
            .atlas-roadmap-3col-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
          }
        `}</style>
        <div className="atlas-roadmap-3col-grid">
          {timeline.map((tm, idx) => {
            const isCurrent = idx === activeStepIndex;
            const isCompleted = idx < activeStepIndex;
            const isLast = idx === timeline.length - 1;

            return (
              <div
                key={idx}
                style={{
                  background: isCurrent ? '#f8fbff' : '#ffffff',
                  border: isCurrent ? '1.5px solid #1a73e8' : '1px solid #dadce0',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Node + Timeframe */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: isCompleted ? '#16a34a' : isCurrent ? '#1a73e8' : '#e2e8f0',
                          color: isCompleted || isCurrent ? '#ffffff' : '#475569',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: isCurrent ? '#1a73e8' : '#5f6368',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {tm.phase}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isCurrent ? '#e8f0fe' : '#f1f5f9',
                        color: isCurrent ? '#1a73e8' : '#475569',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tm.badge || (isEs ? `Fase ${idx + 1}` : `Phase ${idx + 1}`)}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124', lineHeight: 1.3 }}>
                    {tm.title}
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: '0.80rem', color: '#5f6368', lineHeight: 1.45 }}>
                    {tm.detail || tm.description}
                  </div>
                </div>

                {/* Integrated 1-Click Refill CTA on Final Step */}
                {isLast && onRequestRefill && (
                  <button
                    type="button"
                    onClick={onRequestRefill}
                    style={{
                      marginTop: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #1a73e8',
                      background: '#ffffff',
                      color: '#1a73e8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>{isEs ? 'Solicitar Refill' : 'Request Refill'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

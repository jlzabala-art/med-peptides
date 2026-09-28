"use client";

import React from 'react';
import { CalendarDays, Clock } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';

const DAY_LABELS_ES = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

export default function ProtocolWeeklyRoadmapCard({
  weeklySchedule = [],
  phases = [],
  activeRoadmapPhase = 0,
  setActiveRoadmapPhase,
  lang = 'en'
}) {
  return (
    <PublicSectionCard
      id="weekly-calendar"
      icon={CalendarDays}
      category={lang === 'es' ? 'CRONOGRAMA DE ADMINISTRACIÓN' : 'ADMINISTRATION SCHEDULE'}
      title={lang === 'es' ? 'Calendario Semanal de Administración' : 'Weekly Administration Roadmap'}
      badge={phases[activeRoadmapPhase] ? (phases[activeRoadmapPhase].name || (lang === 'es' ? `Fase ${activeRoadmapPhase + 1}` : `Phase ${activeRoadmapPhase + 1}`)) : (lang === 'es' ? 'Ciclo 7 Días' : '7-Day Regimen')}
      badgeVariant="cyan"
      rightAction={
        phases.length > 1 ? (
          <PublicSegmentedControl
            size="sm"
            items={phases.map((ph, idx) => ({
              id: idx,
              label: lang === 'es' ? `Fase ${idx + 1}` : `Phase ${idx + 1}`
            }))}
            activeId={activeRoadmapPhase}
            onChange={setActiveRoadmapPhase}
          />
        ) : (
          <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 600 }}>
            {lang === 'es' ? 'Pauta Estandarizada' : 'Standardized Cadence'}
          </span>
        )
      }
    >
      {phases[activeRoadmapPhase] && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f766e' }}>
              {phases[activeRoadmapPhase].name} • ({phases[activeRoadmapPhase].durationWeeks || 4} {lang === 'es' ? 'Semanas' : 'Weeks'} · Wk {phases[activeRoadmapPhase].startWeek || 1}–{phases[activeRoadmapPhase].endWeek || (phases[activeRoadmapPhase].durationWeeks || 4)})
            </span>
            {phases[activeRoadmapPhase].transitionCriteria && (
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ {lang === 'es' ? 'Criterio de Progresión:' : 'Progression Criteria:'} {phases[activeRoadmapPhase].transitionCriteria}
              </span>
            )}
          </div>
          {phases[activeRoadmapPhase].objective && (
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#134e4a', lineHeight: 1.45 }}>
              <strong>{lang === 'es' ? 'Objetivo Clínico:' : 'Clinical Objective:'}</strong> {phases[activeRoadmapPhase].objective}
            </p>
          )}
        </div>
      )}

      <div className="proto-roadmap-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
        {weeklySchedule.map((ws, idx) => {
          const isActiveAdmin = !ws.rest;
          const activeBorderColor = ws.badgeColor || '#0284c7';
          const displayDay = lang === 'es' ? (DAY_LABELS_ES[ws.day] || ws.day) : ws.day;
          const displayCompound = (lang === 'es' && ws.compound === 'Receptor Rest & Cellular Assimilation')
            ? 'Descanso Receptorial y Asimilación Celular'
            : ws.compound;
          const displayDose = (lang === 'es' && ws.dose === 'No peptide administration scheduled')
            ? 'Sin administración de péptidos programada'
            : ws.dose;
          const displayTime = (lang === 'es' && ws.time === 'Clinical Rest Window')
            ? 'Ventana de Reposo Clínico'
            : (lang === 'es' && ws.time === 'Morning Administration')
            ? 'Administración Matutina'
            : (lang === 'es' && ws.time === 'Evening Administration')
            ? 'Administración Vespertina'
            : ws.time;
          const displayRoute = (lang === 'es' && ws.route === 'Physiological Reset')
            ? 'Reinicio Fisiológico'
            : ws.route;

          return (
            <div
              key={idx}
              className={`proto-roadmap-row ${isActiveAdmin ? 'is-active' : 'is-rest'}`}
              style={{
                width: '100%',
                background: isActiveAdmin ? '#ffffff' : '#f8fafc',
                border: isActiveAdmin ? `1px solid ${activeBorderColor}40` : '1px solid #e2e8f0',
                borderLeft: `4px solid ${isActiveAdmin ? activeBorderColor : '#cbd5e1'}`,
                borderRadius: '10px',
                padding: '0.85rem 1.15rem',
                boxShadow: isActiveAdmin ? '0 2px 8px -2px rgba(2, 132, 199, 0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Col 1: Day Badge */}
              <div className="proto-roadmap-day-col">
                <div style={{
                  width: '100%',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  background: isActiveAdmin ? `${activeBorderColor}14` : '#f1f5f9',
                  color: isActiveAdmin ? activeBorderColor : '#475569',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  border: `1px solid ${isActiveAdmin ? `${activeBorderColor}30` : '#e2e8f0'}`,
                  boxSizing: 'border-box'
                }}>
                  {displayDay}
                </div>
              </div>

              {/* Col 2: Compound & Dose */}
              <div className="proto-roadmap-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color: isActiveAdmin ? '#0f172a' : '#475569',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap'
                }}>
                  <span>{displayCompound}</span>
                  {isActiveAdmin && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: `${activeBorderColor}18`,
                      color: activeBorderColor,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {lang === 'es' ? 'Administración' : 'Admin'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: isActiveAdmin ? activeBorderColor : '#64748b', fontWeight: 600 }}>
                  {displayDose}
                </div>
              </div>

              {/* Col 3: Timing / Schedule Note */}
              <div className="proto-roadmap-time-col" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#475569', fontWeight: 600, lineHeight: 1.35, minWidth: 0 }}>
                <Clock size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-word' }}>{displayTime}</span>
              </div>

              {/* Col 4: Route & Protocol Mode Tag */}
              <div className="proto-roadmap-route-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0, minWidth: 'max-content' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: isActiveAdmin ? '#eff6ff' : '#f1f5f9',
                  color: isActiveAdmin ? '#1d4ed8' : '#64748b',
                  border: `1px solid ${isActiveAdmin ? '#bfdbfe' : '#e2e8f0'}`,
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}>
                  {displayRoute}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </PublicSectionCard>
  );
}

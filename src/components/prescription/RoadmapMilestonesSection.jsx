"use client";

import React from 'react';
import { Clock } from '@/lib/icons';

/**
 * RoadmapMilestonesSection
 * 
 * 90-day clinical roadmap and biological evolution milestones.
 */
export default function RoadmapMilestonesSection({
  timeline = [],
  isEs = false
}) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div id="milestones-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
      <div className="rx-card" style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #dadce0',
        padding: '1.5rem',
        boxShadow: 'none',
        marginBottom: '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f3f4', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '6px',
              background: '#e8f0fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a73e8'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#202124' }}>
                {isEs ? '2. Pauta de Tratamiento & Evolución Biológica (90 Días)' : '2. Treatment Regimen & Biological Evolution (90 Days)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#5f6368' }}>
                {isEs ? 'Instrucciones paso a paso, administración cronobiológica y evolución clínica esperada' : 'Step-by-step application guidance, daily routine and expected biological pathway'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              background: '#e8f0fe', 
              color: '#1967d2', 
              border: '1px solid #d2e3fc', 
              padding: '3px 10px', 
              borderRadius: '12px', 
              fontSize: '0.72rem', 
              fontWeight: 600 
            }}>
              {isEs ? 'Cronograma Secuencial' : 'Sequential Schedule'}
            </span>
            <span style={{ 
              background: '#f0fdf4', 
              color: '#16a34a', 
              border: '1px solid #bbf7d0', 
              padding: '3px 10px', 
              borderRadius: '12px', 
              fontSize: '0.72rem', 
              fontWeight: 600 
            }}>
              {isEs ? 'Ciclo Completo: 90 Días' : 'Full Cycle: 90 Days'}
            </span>
          </div>
        </div>

        {/* Sequential Milestone Cards (Full-Width GCP Modular Flow, One Below the Other) */}
        <div className="rx-milestones-list" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          width: '100%'
        }}>
          {timeline.map((tm, idx) => (
            <div 
              key={idx}
              className="rx-milestone-item"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #1a73e8',
                borderRadius: '8px',
                padding: '1.15rem 1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                boxShadow: 'none',
                boxSizing: 'border-box',
                width: '100%',
                transition: 'all 0.15s ease'
              }}
            >
              <div className="rx-milestone-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
                <div className="rx-milestone-title-wrap" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <span className="rx-milestone-phase-badge" style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    color: '#1967d2', 
                    background: '#e8f0fe', 
                    border: '1px solid #d2e3fc', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.04em' 
                  }}>
                    {tm.phase}
                  </span>
                  <span className="rx-milestone-title" style={{ fontSize: '0.92rem', fontWeight: 600, color: '#202124', lineHeight: 1.3 }}>
                    {tm.title}
                  </span>
                </div>
                <span className="rx-milestone-month-badge" style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 600, 
                  color: '#ffffff', 
                  background: '#1a73e8', 
                  padding: '3px 9px', 
                  borderRadius: '4px', 
                  whiteSpace: 'nowrap', 
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}>
                  {tm.badge}
                </span>
              </div>

              <p className="rx-milestone-desc" style={{ margin: 0, fontSize: '0.82rem', color: '#3c4043', lineHeight: 1.6 }}>
                {tm.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

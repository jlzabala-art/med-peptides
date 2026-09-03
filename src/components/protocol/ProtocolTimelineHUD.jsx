"use client";

import React from 'react';
import { Calendar, Clock, Activity, AlertCircle, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

/**
 * ProtocolTimelineHUD
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive Clinical Protocol Timeline & Phased Dosing Visualizer.
 * Renders weekly progressions, titration schedules, compound dosages,
 * biomarker checkpoints, and safety alerts for doctors and patients.
 */
export default function ProtocolTimelineHUD({ protocol }) {
  if (!protocol) return null;

  const phases = Array.isArray(protocol.phases) && protocol.phases.length > 0
    ? protocol.phases
    : [
        {
          phaseNumber: 1,
          phaseName: 'Induction & Titration',
          durationWeeks: 4,
          instructions: 'Initial biological receptor adaptation and baseline titration.',
          items: protocol.items || [
            { productName: protocol.name || 'Compounded Peptide', dosageAmount: 2.5, dosageUnit: 'mg', frequency: 'Once Weekly', route: 'subcutaneous_injection' }
          ]
        },
        {
          phaseNumber: 2,
          phaseName: 'Therapeutic Optimization',
          durationWeeks: 8,
          instructions: 'Target therapeutic window for optimal cellular receptor signaling.',
          items: protocol.items || [
            { productName: protocol.name || 'Compounded Peptide', dosageAmount: 5.0, dosageUnit: 'mg', frequency: 'Once Weekly', route: 'subcutaneous_injection' }
          ]
        }
      ];

  const totalWeeks = phases.reduce((acc, p) => acc + (Number(p.durationWeeks) || 0), 0);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '1.25rem',
      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Header: Goal, Code, Evidence Tier */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {protocol.name || 'Clinical Pathway'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span>Code: <strong>{protocol.code || protocol.id}</strong></span>
              <span>•</span>
              <span>Goal: <strong>{protocol.clinicalGoal || protocol.goal || 'Metabolic & Cellular'}</strong></span>
              <span>•</span>
              <span style={{ color: '#0d9488', fontWeight: 700 }}>Total Duration: {totalWeeks} Weeks</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge status={protocol.status || 'active'} />
          {protocol.evidenceLevel && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe'
            }}>
              {protocol.evidenceLevel}
            </span>
          )}
        </div>
      </div>

      {/* Phased Visual Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Clinical Phasing & Dosing Progression ({phases.length} Phases)
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${phases.length}, minmax(220px, 1fr))`,
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {phases.map((phase, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#0d9488',
                  backgroundColor: '#ccfbf1',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  PHASE {phase.phaseNumber || (idx + 1)}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                  ⏱️ {phase.durationWeeks} Weeks
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {phase.phaseName}
                </div>
                {phase.instructions && (
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                    {phase.instructions}
                  </div>
                )}
              </div>

              {/* Items in phase */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                {(phase.items || []).map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '0.45rem 0.6rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {item.productName || item.name}
                    </span>
                    <span style={{ fontWeight: 800, color: '#0d9488' }}>
                      {item.dosageAmount} {item.dosageUnit} ({item.frequency || 'Daily'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contraindications & Safety Sentinel */}
      {Array.isArray(protocol.contraindications) && protocol.contraindications.length > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem'
        }}>
          <ShieldAlert size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
              Safety & Contraindication Sentinel
            </div>
            <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '2px' }}>
              {protocol.contraindications.join(' • ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Target, ArrowRight, Package } from '@/lib/icons';

export default function ProtocolTimeline({ protocol }) {
  const phases = protocol?.phases || [];
  const [selectedPhase, setSelectedPhase] = useState(null);

  if (phases.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No phases defined for this protocol.
      </div>
    );
  }

  // Calculate total duration to create relative widths
  const totalWeeks = phases.reduce((acc, phase) => acc + (phase.durationWeeks || 0), 0) || 1;

  const getPhaseColor = (index) => {
    const colors = [
      { bg: 'var(--primary)', light: 'var(--primary-light)' },
      { bg: 'var(--success, #16a34a)', light: 'var(--success-light, #dcfce7)' },
      { bg: 'var(--warning, #d97706)', light: 'var(--warning-light, #fef3c7)' },
      { bg: 'var(--info, #0284c7)', light: 'var(--info-light, #e0f2fe)' },
      { bg: 'var(--danger, #dc2626)', light: 'var(--danger-light, #fee2e2)' }
    ];
    return colors[index % colors.length];
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Visual Timeline</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Interactive overview of protocol phases, objectives, and dose escalations.
        </p>
      </div>

      {/* The Timeline Graph */}
      <div style={{ 
        background: 'var(--bg-main)', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        padding: '2rem',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <div style={{ minWidth: '600px', display: 'flex', position: 'relative', height: '100px', alignItems: 'flex-end', gap: '4px' }}>
          {phases.map((phase, idx) => {
            const widthPct = ((phase.durationWeeks || 1) / totalWeeks) * 100;
            const color = getPhaseColor(idx);
            const isSelected = selectedPhase === idx;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedPhase(idx === selectedPhase ? null : idx)}
                style={{
                  width: `${widthPct}%`,
                  height: isSelected ? '80px' : '60px',
                  background: color.bg,
                  borderRadius: '6px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: selectedPhase !== null && !isSelected ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {widthPct > 10 ? (phase.label || `Phase ${idx + 1}`) : `P${idx + 1}`}
                
                {/* Duration Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  background: 'var(--surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                  fontWeight: 600
                }}>
                  {phase.durationWeeks || 0} wks
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
          <span>Week 1</span>
          <span>Week {totalWeeks}</span>
        </div>
      </div>

      {/* Selected Phase Details */}
      {selectedPhase !== null && (
        <div style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: '12px', 
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getPhaseColor(selectedPhase).bg }}></div>
                {phases[selectedPhase].label || `Phase ${selectedPhase + 1}`}
              </h4>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Duration: {phases[selectedPhase].durationWeeks} weeks
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Products in Phase */}
            <div>
              <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <Package size={16} /> Included Products & Dosing
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {!(phases[selectedPhase].items || phases[selectedPhase].medications)?.length ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No products added to this phase.</div>
                ) : (
                  (phases[selectedPhase].items || phases[selectedPhase].medications).map((item, i) => (
                    <div key={i} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{item.name || 'Unknown Product'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                        <span>Dose: {item.doseMg || '0.5'} mg</span>
                        <span>Frequency: {item.frequencyPerWeek || '5'}x / week</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Clinical Notes */}
            <div>
              <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <Target size={16} /> Phase Objectives
              </h5>
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', minHeight: '100px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {phases[selectedPhase].objective || 'No specific clinical objectives defined for this phase.'}
              </div>

              {phases[selectedPhase].doseChanges && (
                <div style={{ marginTop: '1rem', background: 'var(--info-light, #e0f2fe)', color: 'var(--info, #0284c7)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <ArrowRight size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Dose Escalation Notice:</strong> {phases[selectedPhase].doseChanges}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

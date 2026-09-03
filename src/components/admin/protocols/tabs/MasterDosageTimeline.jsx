"use client";

import React, { useState } from 'react';
import { Droplet, Clock, ChevronDown, ChevronRight, TestTube, AlertTriangle } from '@/lib/icons';

export default function MasterDosageTimeline({ protocol }) {
  const phases = protocol?.phases || [];

  if (phases.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No phases defined for this protocol.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {phases.map((phase, pIdx) => (
        <PhaseBlock key={pIdx} phase={phase} index={pIdx} protocol={protocol} />
      ))}
    </div>
  );
}

function PhaseBlock({ phase, index, protocol }) {
  const durationWeeks = phase.durationWeeks || 4;
  const items = phase.items || phase.medications || [];
  const [expandedWeek, setExpandedWeek] = useState(0); // Open first week by default
  
  // Find items that need reconstitution
  const vialItems = items.filter(item => (item.diluentMl > 0 || item.vialStrengthMg > 0) && !item.name?.toLowerCase().includes('pen'));

  return (
    <div style={{ 
      background: 'var(--surface)', 
      border: '1px solid var(--border)', 
      borderRadius: '16px', 
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }}>
      {/* Phase Header */}
      <div style={{ 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
        borderBottom: '1px solid var(--border)' 
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            {index + 1}
          </div>
          Phase {index + 1} {phase.name ? `- ${phase.name}` : ''}
        </h3>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginLeft: '3.25rem', fontWeight: 600 }}>
          Duration: {durationWeeks} Weeks
        </div>
      </div>

      {/* Phase Body */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Reconstitution Instructions (if any) */}
        {vialItems.length > 0 && (
          <div style={{ 
            background: '#fff', 
            border: '1px dashed #cbd5e1', 
            borderRadius: '12px', 
            padding: '1.25rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TestTube size={16} color="#64748b" /> Reconstitution Guidelines for Phase {index + 1}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {vialItems.map((item, i) => {
                const vMg = item.vialStrengthMg || 10;
                const dMl = item.diluentMl || 2;
                return (
                  <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                       <Droplet size={14} color="#0284c7" /> {item.name || item.productId || 'Unknown'}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <li>Lyophilized Vial: <strong style={{ color: '#0f172a' }}>{vMg}mg</strong></li>
                      <li>Mix with <strong style={{ color: '#0f172a' }}>{dMl}mL</strong> Bacteriostatic Water</li>
                      <li>Shelf Life: <strong style={{ color: '#0f172a' }}>{item.shelfLifeDays || 30} Days</strong></li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weeks Iteration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: durationWeeks }).map((_, wIdx) => (
            <WeekBlock 
              key={wIdx} 
              weekIndex={wIdx} 
              phaseItems={items} 
              expanded={expandedWeek === wIdx}
              onToggle={() => setExpandedWeek(expandedWeek === wIdx ? null : wIdx)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

function WeekBlock({ weekIndex, phaseItems, expanded, onToggle }) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  
  // Helper to determine if an item is administered on a given day (1-7)
  const getDosesForDay = (dayIndex) => {
    return phaseItems.filter(item => {
      const freq = item.frequencyPerWeek || 5;
      if (freq === 7) return true; // Every day
      if (freq === 5 && dayIndex < 5) return true; // Mon-Fri
      if (freq === 3 && (dayIndex === 0 || dayIndex === 2 || dayIndex === 4)) return true; // Mon/Wed/Fri
      if (freq === 1 && dayIndex === 0) return true; // Mon only
      if (freq === 2 && (dayIndex === 0 || dayIndex === 3)) return true; // Mon/Thu
      return false; 
    });
  };

  return (
    <div style={{ border: expanded ? '2px solid var(--border)' : '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}>
      <button 
        onClick={onToggle}
        style={{ 
          width: '100%', 
          padding: '1rem 1.25rem', 
          background: expanded ? '#f8fafc' : '#fff', 
          border: 'none', 
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ fontWeight: 700, color: expanded ? '#0f172a' : 'var(--text-main)', fontSize: '1.05rem' }}>Week {weekIndex + 1}</div>
        {expanded ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
      </button>

      {expanded && (
        <div style={{ padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {daysOfWeek.map((day, idx) => {
            const doses = getDosesForDay(idx);
            const isRest = doses.length === 0;
            const isToday = idx === currentDayIndex; // We highlight "Today" for all weeks so it stands out

            return (
              <div key={day} style={{ 
                background: isToday ? '#f0fdf4' : '#fff', 
                border: isToday ? '2px solid #22c55e' : '1px solid var(--border)', 
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: isToday ? '0 4px 12px rgba(34, 197, 94, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'stretch',
                transform: isToday ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
                zIndex: isToday ? 10 : 1
              }}>
                {/* Left Sidebar (Day Name) */}
                <div style={{ 
                  width: '90px',
                  flexShrink: 0,
                  background: isToday ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                  borderRight: isToday ? '1px solid #86efac' : '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontWeight: 800, color: isToday ? '#166534' : '#0369a1', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {day}
                  </div>
                  {isToday ? (
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', background: '#16a34a', padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em' }}>TODAY</div>
                  ) : (
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#38bdf8' }}></div>
                  )}
                </div>

                {/* Doses Container */}
                <div style={{ flex: 1, padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  {isRest ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      Rest day. No doses scheduled.
                    </div>
                  ) : (
                    doses.map((item, i) => {
                      const dMg = item.doseMg || parseFloat((item.dose || '').replace(/[^0-9.]/g, '')) || 0.5;
                      const vMg = item.vialStrengthMg || 10; 
                      const dMl = item.diluentMl || 2; 
                      const units = Math.round((dMg / (vMg / dMl)) * 100);
                      const displayDose = item.dose || (item.doseMg ? `${item.doseMg}mg` : '0.5mg');

                      return (
                        <div key={i} style={{ 
                          background: '#fff', 
                          border: '1px solid #bae6fd',
                          borderRadius: '8px', 
                          padding: '0.5rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          boxShadow: '0 2px 4px -1px rgba(2, 132, 199, 0.05)',
                          transition: 'all 0.2s',
                          cursor: 'default'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Droplet size={14} /> {item.name || item.productId || 'Unknown'}
                          </div>
                          <div style={{ width: '1px', height: '16px', background: '#e0f2fe' }}></div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{displayDose}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca', background: '#e0e7ff', padding: '0.15rem 0.5rem', borderRadius: '6px', letterSpacing: '0.02em' }}>
                              {units} U
                            </span>
                          </div>
                          {item.timeOfDay && (
                            <>
                              <div style={{ width: '1px', height: '16px', background: '#e0f2fe' }}></div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                                <Clock size={12} /> {item.timeOfDay}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

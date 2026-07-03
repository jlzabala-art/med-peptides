import React, { useState } from 'react';
import { Calendar, Droplet, Clock } from '@/lib/icons';

export default function ProtocolDosingCalendar({ protocol }) {
  const [selectedPhase, setSelectedPhase] = useState(0);
  const phases = protocol?.phases || [];

  if (phases.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No phases defined for this protocol.
      </div>
    );
  }

  const phase = phases[selectedPhase];
  const items = phase.items || phase.medications || [];
  
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper to determine if an item is administered on a given day (1-7)
  const getDosesForDay = (dayIndex) => {
    return items.filter(item => {
      const freq = item.frequencyPerWeek || 5;
      if (freq === 7) return true; // Every day
      if (freq === 5 && dayIndex < 5) return true; // Mon-Fri
      if (freq === 3 && (dayIndex === 0 || dayIndex === 2 || dayIndex === 4)) return true; // Mon/Wed/Fri
      if (freq === 1 && dayIndex === 0) return true; // Mon only
      if (freq === 2 && (dayIndex === 0 || dayIndex === 3)) return true; // Mon/Thu
      return false; // custom logic would go here
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dosing Calendar</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Typical weekly administration schedule for the selected phase.
          </p>
        </div>
        
        {/* Phase Selector */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {phases.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhase(idx)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: selectedPhase === idx ? 'var(--primary)' : 'var(--surface)',
                color: selectedPhase === idx ? '#fff' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Phase {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          {daysOfWeek.map((day, idx) => (
            <div key={day} style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', borderRight: idx < 6 ? '1px solid var(--border)' : 'none' }}>
              {day}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '150px' }}>
          {daysOfWeek.map((day, idx) => {
            const doses = getDosesForDay(idx);
            
            return (
              <div key={idx} style={{ padding: '1rem', borderRight: idx < 6 ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {doses.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>
                    Rest Day
                  </div>
                ) : (
                  doses.map((dose, dIdx) => (
                    <div key={dIdx} style={{ 
                      background: 'var(--primary-light)', 
                      border: '1px solid rgba(var(--primary-rgb), 0.2)',
                      borderRadius: '8px', 
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Droplet size={12} /> {dose.name || 'Product'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                        {dose.doseMg || '0.5'} mg
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <Clock size={10} /> {dose.timeOfDay || 'Morning'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{ marginTop: '1.5rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Phase {selectedPhase + 1} Administration Guidelines</h4>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Always administer subcutaneously using a 31G insulin syringe unless specified otherwise.</li>
          <li>Rotate injection sites daily to prevent tissue buildup.</li>
          <li>Store reconstituted vials in the refrigerator (2-8°C). Do not freeze.</li>
          <li>If a dose is missed, skip it and continue with the next scheduled dose.</li>
        </ul>
      </div>
    </div>
  );
}

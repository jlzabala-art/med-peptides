import React, { useMemo } from 'react';
import { calculateRequiredVials } from '../../utils/protocolSchemaAdapter';

/**
 * EconomicSummary Component
 * 
 * Provides a high-fidelity, glassmorphic summary of the protocol's 
 * projected costs and procurement requirements.
 */
const EconomicSummary = ({ protocol, phaseId }) => {
  const activePhase = useMemo(() => {
    if (!protocol || !protocol.phases) return null;
    return protocol.phases.find(p => p.phase_id === phaseId) || protocol.phases[0];
  }, [protocol, phaseId]);

  const procurementData = useMemo(() => {
    if (!activePhase) return [];
    
    const durationWeeks = activePhase.end_week - activePhase.start_week + 1;
    
    return activePhase.compounds.map(c => {
      const stats = calculateRequiredVials(c, durationWeeks);
      return {
        ...c,
        ...stats,
        durationWeeks
      };
    });
  }, [activePhase]);

  if (!activePhase) return null;

  return (
    <div style={{ padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', color: 'white' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
        <span style={{ color: 'var(--color-primary, #22d3ee)' }}>📊</span> Acquisition & Stability Summary
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {procurementData.map((item, idx) => (
          <div key={item.peptide_id || idx} style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.3s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
               onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)'}
               onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-info-text, #cffafe)' }}>{item.name}</span>
              <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(34, 211, 238, 0.2)', color: 'var(--color-primary, #67e8f9)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.route_term}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary, #d1d5db)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Requirement:</span>
                <span style={{ color: 'white', fontFamily: 'monospace' }}>{item.totalMgNeeded.toFixed(2)} mg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Suggested Vials:</span>
                <span style={{ color: 'var(--color-primary, #22d3ee)', fontWeight: 'bold' }}>{item.vialCount} units</span>
              </div>
              
              {item.stabilityWarning && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--color-warning, #fbbf24)', fontSize: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>⚠️</span>
                  <span>
                    <strong style={{ fontWeight: 'bold' }}>Stability Advisory:</strong> Vial duration exceeds {item.post_reconstitution_half_life} days. Discarding the remainder is recommended due to clinical degradation.
                  </span>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '10px', color: 'var(--color-text-tertiary, #6b7280)', fontStyle: 'italic' }}>
              * Calculated for {item.durationWeeks} weeks using {item.vial_max_capacity_mg}mg vials.
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, rgba(22, 78, 99, 0.4), rgba(30, 58, 138, 0.4))', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.625', color: 'var(--color-info-text, #cffafe)', margin: 0 }}>
          <strong style={{ fontWeight: 'bold' }}>Efficiency Advisory:</strong> This summary prioritizes the use of maximum capacity vials to reduce the cost per mg, strictly aligning with clinical post-reconstitution stability windows.
        </p>
      </div>
    </div>
  );
};

export default EconomicSummary;

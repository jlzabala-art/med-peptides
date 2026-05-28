 
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
    <div className="economic-summary-container p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-cyan-400">📊</span> Acquisition & Stability Summary
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {procurementData.map((item, idx) => (
          <div key={item.peptide_id || idx} className="vial-card p-4 rounded-xl bg-black/20 border border-white/10 hover:border-cyan-500/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-cyan-100">{item.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs uppercase tracking-wider">
                {item.route_term}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Total Requirement:</span>
                <span className="text-white font-mono">{item.totalMgNeeded.toFixed(2)} mg</span>
              </div>
              <div className="flex justify-between">
                <span>Suggested Vials:</span>
                <span className="text-cyan-400 font-bold">{item.vialCount} units</span>
              </div>
              
              {item.stabilityWarning && (
                <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
                  <span>⚠️</span>
                  <span>
                    <strong>Stability Advisory:</strong> Vial duration exceeds {item.post_reconstitution_half_life} days. Discarding the remainder is recommended due to clinical degradation.
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-gray-500 italic">
              * Calculated for {item.durationWeeks} weeks using {item.vial_max_capacity_mg}mg vials.
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30">
        <p className="text-sm leading-relaxed text-cyan-100">
          <strong>Efficiency Advisory:</strong> This summary prioritizes the use of maximum capacity vials to reduce the cost per mg, strictly aligning with clinical post-reconstitution stability windows.
        </p>
      </div>
      
      <style jsx>{`
        .economic-summary-container {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
        }
        .vial-card {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
};

export default EconomicSummary;

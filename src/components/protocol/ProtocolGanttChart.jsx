import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * ProtocolGanttChart
 * A modular widget that visualizes the timeline of compounds across a protocol's phases.
 * 
 * @param {Array} phases - Array of phase objects, each containing items/compounds.
 * @param {number} durationScale - Scaling factor for the entire protocol (default 1 = 4 weeks).
 */
export default function ProtocolGanttChart({ phases = [], durationScale = 1 }) {
  const baseWeeks = 4;
  const totalWeeks = baseWeeks * durationScale;

  // Derive unique compounds and their active timelines
  const timelineData = useMemo(() => {
    const data = {};
    
    phases.forEach((phase, index) => {
      // Approximate start week based on phase index. In a real scenario, phases might have specific duration fields.
      // For now, we assume each phase is sequential and spans a portion of the total duration.
      // If there's only 1 phase, it spans the whole duration.
      const phaseDuration = totalWeeks / Math.max(phases.length, 1);
      const startWeek = index * phaseDuration;
      const endWeek = startWeek + phaseDuration;

      const items = phase.items || phase.compounds || [];
      items.forEach(item => {
        const name = item.product_name || item.name || 'Unknown';
        if (!data[name]) {
          data[name] = { name, blocks: [] };
        }
        
        // Merge contiguous blocks if possible, or just push
        data[name].blocks.push({ start: startWeek, end: endWeek });
      });
    });

    return Object.values(data);
  }, [phases, totalWeeks]);

  if (timelineData.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
        Add phases and compounds to visualize the timeline.
      </div>
    );
  }

  return (
    <div className="pgc-container" style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Protocol Timeline</h3>
      
      {/* Timeline Header (Weeks) */}
      <div style={{ display: 'flex', marginLeft: '120px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        {Array.from({ length: totalWeeks }).map((_, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            Wk {i + 1}
          </div>
        ))}
      </div>

      {/* Timeline Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {timelineData.map((row, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Label */}
            <div style={{ width: '120px', fontSize: '0.85rem', fontWeight: 500, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>
              {row.name}
            </div>
            
            {/* Tracks */}
            <div style={{ flex: 1, display: 'flex', position: 'relative', height: '24px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              {row.blocks.map((block, bIdx) => {
                const leftPercent = (block.start / totalWeeks) * 100;
                const widthPercent = ((block.end - block.start) / totalWeeks) * 100;
                
                return (
                  <motion.div
                    key={bIdx}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${widthPercent}%`, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

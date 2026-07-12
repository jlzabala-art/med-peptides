import React from 'react';
import { Droplet, ActivitySquare } from '@/lib/icons';
import MasterDosageTimeline from './MasterDosageTimeline';

export default function ProtocolDosage({ protocol, onUpdate }) {
  const phase0 = protocol?.phases?.[0] || {};
  const phaseItems = phase0.items || phase0.medications || [];

  const weeklyVolume = phaseItems.reduce((acc, item) => {
    let doseAmt = item.doseValue || parseFloat((item.dose || '').replace(/[^0-9.]/g, '')) || 0.5;
    let freq = item.frequencyPerWeek || 5;
    return acc + (freq * doseAmt);
  }, 0);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Mini KPIs for Dosage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #fed7aa' }}>
          <div style={{ color: '#c2410c', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phase 1 Volume</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={24} /> {weeklyVolume.toFixed(2)} units/wk
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
          <div style={{ color: '#047857', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phase 1 Compounds</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ActivitySquare size={24} /> {phaseItems.length}
          </div>
        </div>
      </div>

      {/* Master Dosage Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        <MasterDosageTimeline protocol={protocol} />
      </div>

    </div>
  );
}

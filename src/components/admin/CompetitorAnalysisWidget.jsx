import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Minus from "lucide-react/dist/esm/icons/minus";
import React, { useMemo } from 'react';




export default function CompetitorAnalysisWidget({ matchData, selectedTier = 'retail', myPPMs }) {
  if (!matchData || matchData.length === 0) {
    return <div style={{ padding: '1rem', color: '#64748b' }}>No hay datos de competidores.</div>;
  }

  // myPPMs comes from the cache which calculates ppm for each tier: retail, clinic, wholesaler, distributor, master
  const myPPM = myPPMs[selectedTier];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    }}>
      {matchData.map((comp, i) => {
        const compPPM = comp.ppm;
        let isCheaper = false;
        let isExpensive = false;
        let diffPPM = 0;

        if (myPPM && compPPM) {
          diffPPM = Math.abs(compPPM - myPPM);
          if (myPPM < compPPM) isCheaper = true;
          if (myPPM > compPPM) isExpensive = true;
        }

        const isExactMatch = comp.similarity > 0.8;

        return (
          <div key={i} style={{
            background: isCheaper ? 'rgba(16, 185, 129, 0.05)' : isExpensive ? 'rgba(239, 68, 68, 0.05)' : 'rgba(241, 245, 249, 0.5)',
            border: `1px solid ${isCheaper ? 'rgba(16, 185, 129, 0.2)' : isExpensive ? 'rgba(239, 68, 68, 0.2)' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '1rem',
            position: 'relative'
          }}>
            {comp.trend === 'down' && (
              <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#10b981', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem', animation: 'pulse 2s infinite' }}>
                <TrendingDown size={12} /> bajó ${Math.abs(comp.price_diff_vs_yesterday)}
              </div>
            )}
            {comp.trend === 'up' && (
              <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingUp size={12} /> subió ${Math.abs(comp.price_diff_vs_yesterday)}
              </div>
            )}

            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              {comp.competitor_name}
              <span style={{ 
                background: isExactMatch ? '#dcfce7' : '#fef9c3', 
                color: isExactMatch ? '#166534' : '#854d0e',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.65rem'
              }}>
                {isExactMatch ? 'Exact Match' : 'Similar'}
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              {comp.product_name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  ${comp.price_usd}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {comp.dosage_mg ? `${comp.dosage_mg}mg` : 'Dosis desc.'}
                </div>
              </div>
              {compPPM && myPPM && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isCheaper ? '#10b981' : isExpensive ? '#ef4444' : '#64748b' }}>
                    {isCheaper ? 'Mejor Precio' : isExpensive ? 'Más Caro' : 'Igual'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Diff: ${diffPPM.toFixed(2)}/mg
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
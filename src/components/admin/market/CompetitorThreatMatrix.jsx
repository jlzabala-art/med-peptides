import Target from "lucide-react/dist/esm/icons/target";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Minus from "lucide-react/dist/esm/icons/minus";
import React from 'react';





export default function CompetitorThreatMatrix() {
  const competitors = [
    { name: 'UAE Peptides', territory: 'UAE', products: 420, trend: 'down', trendVal: '8%', threat: 'High' },
    { name: 'Saudi Meds', territory: 'KSA', products: 150, trend: 'up', trendVal: '5%', threat: 'Medium' },
    { name: 'EuroPept', territory: 'Europe', products: 850, trend: 'flat', trendVal: '0%', threat: 'Low' },
  ];

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Competitor Threat Matrix</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {competitors.map((comp, idx) => (
          <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>{comp.name}</h4>
              <span style={{ 
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                backgroundColor: comp.threat === 'High' ? '#fee2e2' : comp.threat === 'Medium' ? '#fef3c7' : '#e0f2fe',
                color: comp.threat === 'High' ? '#dc2626' : comp.threat === 'Medium' ? '#d97706' : '#0284c7'
              }}>
                {comp.threat} Threat
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Territory: {comp.territory}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span><Target size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{comp.products} Products</span>
              <span style={{ 
                color: comp.trend === 'down' ? '#16a34a' : comp.trend === 'up' ? '#dc2626' : 'var(--text-muted)',
                fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' 
              }}>
                {comp.trend === 'down' ? <TrendingDown size={14} /> : comp.trend === 'up' ? <TrendingUp size={14} /> : <Minus size={14} />}
                {comp.trendVal}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
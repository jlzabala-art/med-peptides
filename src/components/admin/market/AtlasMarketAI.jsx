import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import React from 'react';


export default function AtlasMarketAI() {
  const insights = [
    "Your pricing is 18% below market average in the peptide category.",
    "Competitor XYZ increased prices 12% this month.",
    "Potential annual revenue uplift by matching market prices: AED 420,000"
  ];

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #c084fc', padding: '1.5rem', marginBottom: '1.5rem', backgroundImage: 'linear-gradient(to right, rgba(168, 85, 247, 0.05), transparent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={20} color="#a855f7" />
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#a855f7' }}>Atlas AI Market Intelligence</h3>
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 1.2rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {insights.map((ins, idx) => (
          <li key={idx}><b>Atlas Insight:</b> {ins}</li>
        ))}
      </ul>
    </div>
  );
}
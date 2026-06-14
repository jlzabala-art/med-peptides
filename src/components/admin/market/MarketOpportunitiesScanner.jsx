import Lightbulb from "lucide-react/dist/esm/icons/lightbulb";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import React from 'react';



export default function MarketOpportunitiesScanner() {
  const opportunities = [
    { type: 'underpriced', product: 'PT-141', market: 120, atlas: 78, marginIncrease: '54%' },
    { type: 'missing', product: 'Retatrutide', market: 250, atlas: null, marginIncrease: 'N/A' }
  ];

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Lightbulb size={20} color="#f59e0b" />
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Opportunities</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {opportunities.map((opp, idx) => (
          <div key={idx} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'linear-gradient(to right, #fffbeb, #ffffff)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                {opp.type === 'underpriced' ? 'Underpriced Product' : 'Missing Catalog Product'}
              </span>
              <button style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Action <ArrowUpRight size={14} />
              </button>
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>{opp.product}</h4>
            {opp.type === 'underpriced' ? (
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Market:</span> <b>${opp.market}</b></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Atlas:</span> <b style={{ color: '#dc2626' }}>${opp.atlas}</b></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Uplift:</span> <b style={{ color: '#16a34a' }}>+{opp.marginIncrease}</b></div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>High demand in UAE. Consider adding to catalog.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
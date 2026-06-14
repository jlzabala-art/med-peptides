import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import React from 'react';
import { Card } from '../../../ui';





export default function ProfitabilityCommandCenter({ products, onSelectProtocol }) {
  // We need to compute mock "protocol" data from the products since the DB only has products
  // A protocol might just be a high-value product or a combination. We'll treat top products as protocols for this view.
  const calculateMargin = (price, cost) => {
    if (!price) return 0;
    return Math.round(((price - (cost || 0)) / price) * 100);
  };

  // Sort products by absolute margin/profit potential
  const sortedProducts = [...products].sort((a, b) => {
    const profitA = (a.price || 0) - (a.costPrice || 0);
    const profitB = (b.price || 0) - (b.costPrice || 0);
    return profitB - profitA;
  });

  const topProtocols = sortedProducts.slice(0, 3).map(p => ({
    id: p.id,
    name: `${p.name || 'Unknown'} Protocol`,
    revenue: (p.price || 0) * 150, // Mock volume
    profit: ((p.price || 0) - (p.costPrice || 0)) * 150,
    margin: calculateMargin(p.price, p.costPrice),
    growth: `+${Math.floor(Math.random() * 15) + 5}%`,
    isTop: true,
    originalProduct: p
  }));

  // Find underperforming (low margin)
  const lowMarginProducts = [...products].sort((a, b) => {
    return calculateMargin(a.price, a.costPrice) - calculateMargin(b.price, b.costPrice);
  }).filter(p => calculateMargin(p.price, p.costPrice) > 0 && calculateMargin(p.price, p.costPrice) < 40);

  const underperforming = lowMarginProducts.slice(0, 2).map(p => ({
    id: p.id,
    name: `${p.name || 'Unknown'} Protocol`,
    margin: calculateMargin(p.price, p.costPrice),
    issue: 'Low Margin',
    isTop: false,
    originalProduct: p
  }));

  const renderProtocolCard = (protocol, index) => (
    <div 
      key={protocol.id} 
      onClick={() => onSelectProtocol(protocol)}
      style={{ 
        padding: '1rem', 
        borderBottom: '1px solid var(--border)', 
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--color-bg-surface)',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {protocol.isTop && (
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{index + 1}</div>
        )}
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{protocol.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            {protocol.isTop ? (
              <>
                <span style={{ color: 'var(--success)' }}>Profit: AED {protocol.profit.toLocaleString()}</span>
                <span>•</span>
                <span>Margin: {protocol.margin}%</span>
              </>
            ) : (
              <span style={{ color: 'var(--color-danger)' }}>Issue: {protocol.issue} ({protocol.margin}% margin)</span>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {protocol.isTop ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
            <TrendingUp size={14} /> {protocol.growth}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 600 }}>
            <TrendingDown size={14} /> Review
          </div>
        )}
        <ArrowRight size={16} color="var(--text-muted)" />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Protocols */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(16,185,129,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} /> Top Profitable Protocols
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {topProtocols.map((p, i) => renderProtocolCard(p, i))}
        </div>
      </Card>

      {/* Underperforming */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(239,68,68,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={18} /> Underperforming Protocols
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {underperforming.length > 0 ? (
            underperforming.map((p, i) => renderProtocolCard(p, i))
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No critical underperforming protocols detected.
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}
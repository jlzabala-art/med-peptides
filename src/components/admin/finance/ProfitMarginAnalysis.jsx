import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { PROTOCOL_BLUEPRINTS } from '../../../data/protocolBlueprints';
import { products as peptides } from '../../../data/products';
import { usePreferences } from '../../../context/PreferencesContext';

export default function ProfitMarginAnalysis() {
  const { formatCurrency } = usePreferences();

  // Compute protocol margins dynamically
  const protocolMargins = useMemo(() => {
    return Object.entries(PROTOCOL_BLUEPRINTS).map(([key, protocol]) => {
      let totalCost = 0;
      let totalValue = 0; // The theoretical selling price if sold as a bundle

      // Base supplies cost per protocol (Water, Syringes, Swabs)
      totalCost += (5.00 * 2); // 2x Bacteriostatic Water
      totalCost += 12.00; // 1x Insulin Syringes
      totalCost += 4.00; // 1x Alcohol Swabs

      const blueprints = protocol.phase_blueprints || protocol.phases || [];
      
      blueprints.forEach(phase => {
        const drugs = phase.medications || phase.drugs || phase.compounds || [];
        drugs.forEach(drug => {
          const name = drug.product_title || drug.name || drug.compound;
          const qty = drug.dose_logic?.vials_required || drug.procurement?.vialCount || 1;
          
          // Find peptide price
          const matchedPeptide = peptides.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
          if (matchedPeptide) {
            const sellPrice = matchedPeptide.price || 150;
            const costPrice = sellPrice * 0.4; // 40% COGS assumed in zohoCategorization
            totalCost += costPrice * qty;
            totalValue += sellPrice * qty;
          } else {
            // Fallback assumptions
            totalCost += 40 * qty;
            totalValue += 100 * qty;
          }
        });
      });

      // Bundled Selling Price (discounted 15% from total components value)
      const bundlePrice = totalValue * 0.85; 
      const grossProfit = bundlePrice - totalCost;
      const marginPercent = ((grossProfit / bundlePrice) * 100).toFixed(1);

      return {
        id: key,
        name: protocol.title || key,
        totalCost,
        bundlePrice,
        grossProfit,
        marginPercent: parseFloat(marginPercent)
      };
    }).sort((a, b) => b.grossProfit - a.grossProfit);
  }, []);

  return (
    <div className="glass-card-premium" style={{ borderTop: '4px solid var(--success)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>
              <Activity style={{ width: '24px', height: '24px', color: 'var(--success)' }} />
              Protocol Profitability Analysis
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Real-time gross margin calculation for Composite Items (Protocols) based on underlying component COGS.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {protocolMargins.slice(0, 6).map(protocol => {
            const isHealthy = protocol.marginPercent >= 50;
            return (
              <div key={protocol.id} style={{ 
                background: 'var(--surface-raised)', 
                padding: '1.5rem', 
                borderRadius: '16px', 
                border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0, paddingRight: '1rem' }}>
                    {protocol.name}
                  </h4>
                  <div style={{ 
                    padding: '0.25rem 0.5rem', 
                    background: isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: isHealthy ? 'var(--success)' : 'var(--warning)',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {isHealthy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {protocol.marginPercent}% Margin
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Bundle Price</div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{formatCurrency(protocol.bundlePrice)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total COGS</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{formatCurrency(protocol.totalCost)}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.25rem' }}>Gross Profit per Kit</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isHealthy ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center' }}>
                    <DollarSign size={20} strokeWidth={3} />
                    {protocol.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

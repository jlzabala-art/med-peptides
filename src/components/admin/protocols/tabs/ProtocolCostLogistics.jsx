import React from 'react';
import { DollarSign, TrendingUp, PackageCheck, Truck } from '@/lib/icons';
import CostSimulation from '../CostSimulation';
import InventoryImpact from '../InventoryImpact';

export default function ProtocolCostLogistics({ protocol, onUpdate }) {
  
  // Dummy data for KPIs (these should ideally be aggregated from the actual protocol pricing)
  const estimatedCost = protocol?.price_b2b || 1200;
  const estimatedRetail = protocol?.price_b2c || 3500;
  const margin = estimatedRetail - estimatedCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header & KPI Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={24} color="var(--primary)" /> Economics & Logistics
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Analyze treatment profitability, configure B2B/B2C pricing, and evaluate supply chain and inventory impacts.
          </p>
        </div>
      </div>

      {/* Premium Mini KPIs for Cost */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #bbf7d0', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.1)' }}>
          <div style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Estimated Profit Margin</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={24} /> ${(margin).toLocaleString()}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #fde68a', boxShadow: '0 4px 15px rgba(217, 119, 6, 0.1)' }}>
          <div style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Supply Chain Risk</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PackageCheck size={24} /> Low
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 15px rgba(100, 116, 139, 0.1)' }}>
          <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Fulfillment</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={24} /> Standard
          </div>
        </div>
      </div>

      {/* Embedded Deep Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <CostSimulation protocol={protocol} />
        </div>
        
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <InventoryImpact protocol={protocol} />
        </div>
      </div>
      
    </div>
  );
}

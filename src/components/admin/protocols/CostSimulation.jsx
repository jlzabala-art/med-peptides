"use client";

import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Download, PieChart, Truck } from '@/lib/icons';
import DataTable from '@/components/ui/DataTable';
import { calculateProtocolCostBreakdown } from '@/services/protocolCostEngine';

export default function CostSimulation({ protocol }) {
  const breakdown = useMemo(() => {
    return calculateProtocolCostBreakdown(protocol);
  }, [protocol]);

  const costs = breakdown.items;

  if (costs.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Add peptides to the protocol to run real-time supplier cost simulations.
      </div>
    );
  }

  const grandTotalCost = breakdown.totalWholesaleCost;
  const grandTotalRetail = breakdown.totalRetailPrice;
  const grandTotalMargin = breakdown.totalMargin;
  const overallMarginPct = breakdown.marginPercentage;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '1rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
            Supplier Cost & Margin Simulation
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            Real-time compounding economics based on lowest supplier wholesale tiers vs recommended patient pricing.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 600 }}>
          <Truck size={14} /> Best Sourcing: {breakdown.cheapestSupplier}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
            <DollarSign size={16} /> Total Clinic Cost (B2B)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            $ {grandTotalCost.toLocaleString()} USD
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Cheapest Wholesale Option
          </div>
        </div>

        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
            <TrendingUp size={16} /> Recommended Retail (B2C)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            $ {grandTotalRetail.toLocaleString()} USD
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Suggested Patient Price
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, var(--color-primary, #003666) 0%, #0284c7 100%)', color: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 8px 20px -6px rgba(0, 54, 102, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
            <PieChart size={16} /> Estimated Gross Profit
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            $ {grandTotalMargin.toLocaleString()} USD
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem' }}>
            {overallMarginPct}% Profit Margin
          </div>
        </div>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Product / Peptide',
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{row.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supplier: {row.supplier}</div>
                </div>
              )
            },
            {
              key: 'quantity',
              header: 'Vials',
              align: 'right',
              render: (row) => <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>{row.quantity}</div>
            },
            {
              key: 'unitCost',
              header: 'Wholesale / Vial',
              align: 'right',
              render: (row) => <div style={{ textAlign: 'right', fontSize: '0.88rem', color: 'var(--text-muted)' }}>${row.unitCost}</div>
            },
            {
              key: 'totalCost',
              header: 'Total Cost',
              align: 'right',
              render: (row) => <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>${row.totalCost}</div>
            },
            {
              key: 'unitRetail',
              header: 'Suggested Retail',
              align: 'right',
              render: (row) => <div style={{ textAlign: 'right', fontSize: '0.88rem', color: 'var(--text-muted)' }}>${row.unitRetail}</div>
            },
            {
              key: 'margin',
              header: 'Est. Margin',
              align: 'right',
              render: (row) => (
                <div style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a', fontSize: '0.9rem' }}>
                  +${row.margin} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({Math.round(row.marginPct)}%)</span>
                </div>
              )
            }
          ]}
          data={costs}
          keyField={(row, idx) => idx.toString()}
        />
      </div>
    </div>
  );
}


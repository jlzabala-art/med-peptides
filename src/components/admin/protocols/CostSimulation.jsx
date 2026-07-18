"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, PieChart } from '@/lib/icons';
import DataTable from '@/components/ui/DataTable';

export default function CostSimulation({ protocol }) {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real scenario, this fetches actual pricing from products collection
    const allItems = protocol?.phases?.reduce((acc, phase) => acc.concat(phase.items || phase.medications || []), []) || [];
    
    // Group by product
    const groupedProducts = allItems.reduce((acc, item) => {
      const key = item.productId || item.name || 'Unknown Product';
      if (!acc[key]) {
        acc[key] = {
          name: item.name || 'Unknown Product',
          vialStrengthMg: item.vialStrengthMg || 10,
          doseMg: item.doseMg || 0.5,
          totalMg: 0,
        };
      }
      const injections = (item.frequencyPerWeek || 5) * (item.durationWeeks || 4);
      acc[key].totalMg += injections * acc[key].doseMg;
      return acc;
    }, {});

    const mockPricingData = Object.values(groupedProducts).map(p => {
      const vialsRequired = Math.ceil(p.totalMg / p.vialStrengthMg);
      
      // Mock Prices
      const pharmacyCostPerVial = 150 + Math.floor(Math.random() * 100);
      const recommendedRetailPerVial = pharmacyCostPerVial * 3; // 3x markup
      
      const totalCost = pharmacyCostPerVial * vialsRequired;
      const totalRetail = recommendedRetailPerVial * vialsRequired;
      
      return {
        ...p,
        vialsRequired,
        pharmacyCostPerVial,
        recommendedRetailPerVial,
        totalCost,
        totalRetail,
        margin: totalRetail - totalCost,
        marginPct: ((totalRetail - totalCost) / totalRetail) * 100
      };
    });

    setCosts(mockPricingData);
    setLoading(false);
  }, [protocol]);

  if (loading) return <div>Loading cost simulations...</div>;
  
  if (costs.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Add products to the protocol to run cost simulations.
      </div>
    );
  }

  const grandTotalCost = costs.reduce((acc, c) => acc + c.totalCost, 0);
  const grandTotalRetail = costs.reduce((acc, c) => acc + c.totalRetail, 0);
  const grandTotalMargin = grandTotalRetail - grandTotalCost;
  const overallMarginPct = (grandTotalMargin / grandTotalRetail) * 100;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Cost & Margin Simulation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Simulate the total cost of the protocol for the clinic vs retail pricing for the patient.
          </p>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Export Quote
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
            <DollarSign size={18} /> Total Clinic Cost
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            AED {grandTotalCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Pharmacy / Wholesale Price
          </div>
        </div>

        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
            <TrendingUp size={18} /> Recommended Patient Price
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            AED {grandTotalRetail.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Suggested MSRP
          </div>
        </div>

        <div style={{ background: 'var(--primary)', color: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(var(--primary-rgb), 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', fontWeight: 600 }}>
            <PieChart size={18} /> Expected Gross Margin
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            AED {grandTotalMargin.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>
            {overallMarginPct.toFixed(1)}% Margin
          </div>
        </div>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Product Breakdown',
              render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{val}</span>
            },
            {
              key: 'vialsRequired',
              header: 'Vials',
              render: (val) => <div style={{ textAlign: 'right', fontSize: '0.95rem' }}>{val}</div>
            },
            {
              key: 'pharmacyCostPerVial',
              header: 'Unit Cost',
              render: (val) => <div style={{ textAlign: 'right', fontSize: '0.95rem', color: 'var(--text-muted)' }}>AED {val}</div>
            },
            {
              key: 'totalCost',
              header: 'Total Cost',
              render: (val) => <div style={{ textAlign: 'right', fontWeight: 600 }}>AED {val}</div>
            },
            {
              key: 'recommendedRetailPerVial',
              header: 'Unit Retail',
              render: (val) => <div style={{ textAlign: 'right', fontSize: '0.95rem', color: 'var(--text-muted)' }}>AED {val}</div>
            },
            {
              key: 'totalRetail',
              header: 'Total Retail',
              render: (val) => <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>AED {val}</div>
            }
          ]}
          data={costs}
          keyField={(row, idx) => idx.toString()}
        />
      </div>
    </div>
  );
}

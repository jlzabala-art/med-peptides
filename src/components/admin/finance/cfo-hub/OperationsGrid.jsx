import Package from "lucide-react/dist/esm/icons/package";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Activity from "lucide-react/dist/esm/icons/activity";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import React, { useState } from 'react';
import { Card } from '../../../ui';






export default function OperationsGrid({ data, products }) {
  const [activeTab, setActiveTab] = useState('suppliers');

  // Supplier computation from live products (approx)
  const supplierStats = products.reduce((acc, p) => {
    const s = p.supplier || 'Unknown';
    if (!acc[s]) acc[s] = { count: 0, revenue: 0, cost: 0 };
    acc[s].count++;
    acc[s].revenue += (p.price || 0) * 10; // mock volume
    acc[s].cost += (p.costPrice || 0) * 10;
    return acc;
  }, {});

  const suppliers = Object.entries(supplierStats)
    .filter(([name]) => name !== 'Unknown')
    .map(([name, stats]) => ({
      name,
      revenue: stats.revenue,
      profit: stats.revenue - stats.cost,
      score: Math.floor(Math.random() * 20) + 80 // Mock score
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  // Inventory Risk computation
  const inventoryRisk = products
    .filter(p => (p.stockCount || 0) < 20 && p.price > 0)
    .map(p => ({
      name: p.name,
      stock: p.stockCount || Math.floor(Math.random() * 10),
      revenueRisk: (p.price || 0) * 15,
      profitRisk: ((p.price || 0) - (p.costPrice || 0)) * 15
    }))
    .sort((a, b) => b.profitRisk - a.profitRisk)
    .slice(0, 3);

  const renderSuppliers = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {suppliers.map((s, i) => (
        <div key={i} style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
              Score: {s.score}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>Revenue: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>AED {s.revenue.toLocaleString()}</span></div>
            <div style={{ color: 'var(--text-muted)' }}>Profit: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>AED {s.profit.toLocaleString()}</span></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInventory = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {inventoryRisk.map((item, i) => (
        <div key={i} style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
            <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>{item.stock} days left</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Profit at Risk</span>
            <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>AED {item.profitRisk.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCashFlow = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expected Revenue (30d)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>AED 420,000</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expected Payables (30d)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-danger)' }}>AED 185,000</div>
        </div>
      </div>
      <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Expected Closing Cash</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>AED 480,600</span>
      </div>
    </div>
  );

  const renderTax = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>VAT Due (Q2)</span>
          <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>AED 42,500</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Corporate Tax Accrued</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>AED 120,000</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Audit Readiness</span>
          <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={14}/> 98%</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--color-bg-surface)' }}>
        <button onClick={() => setActiveTab('suppliers')} style={{ flex: 1, padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'suppliers' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'suppliers' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={16} /> Suppliers
        </button>
        <button onClick={() => setActiveTab('inventory')} style={{ flex: 1, padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'inventory' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'inventory' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> Inventory
        </button>
        <button onClick={() => setActiveTab('cashflow')} style={{ flex: 1, padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'cashflow' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'cashflow' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} /> Cash Flow
        </button>
        <button onClick={() => setActiveTab('tax')} style={{ flex: 1, padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'tax' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'tax' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={16} /> Tax
        </button>
      </div>

      <div style={{ padding: '1.5rem', flex: 1 }}>
        {activeTab === 'suppliers' && renderSuppliers()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'cashflow' && renderCashFlow()}
        {activeTab === 'tax' && renderTax()}
      </div>

    </Card>
  );
}
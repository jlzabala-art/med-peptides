import Globe from "lucide-react/dist/esm/icons/globe";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Package from "lucide-react/dist/esm/icons/package";
import React from 'react';
import { Card } from '../../ui';







export default function GlobalFootprintDashboard({ markets, products, wholesalers, orders }) {
  // Aggregate KPIs
  const activeMarkets = markets.filter(m => m.status === 'Operational').length;
  const pendingMarkets = markets.filter(m => m.status === 'Pending').length;
  const restrictedMarkets = markets.filter(m => m.status === 'Restricted').length;
  const activeDistributors = wholesalers.filter(w => w.status !== 'suspended').length;
  const registeredProducts = products.length; // Could filter by 'approved' if available
  const projectedRevenue = orders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);

  const stats = [
    { label: 'Active Countries', value: activeMarkets, icon: <Globe size={20} />, color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Pending Markets', value: pendingMarkets, icon: <MapPin size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Restricted Markets', value: restrictedMarkets, icon: <AlertTriangle size={20} />, color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Active Distributors', value: activeDistributors, icon: <ShieldCheck size={20} />, color: 'var(--primary)', bg: 'rgba(26,115,232,0.1)' },
    { label: 'Registered Products', value: registeredProducts, icon: <Package size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Total Revenue', value: `AED ${(projectedRevenue / 1000).toFixed(1)}k`, icon: <DollarSign size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {stats.map((s, i) => (
        <Card key={i} style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-bg-surface)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: s.bg, borderRadius: 'var(--radius-md)', color: s.color }}>
            {s.icon}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
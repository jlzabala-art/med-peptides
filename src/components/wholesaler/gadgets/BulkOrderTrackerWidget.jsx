import React from 'react';
import { PackageSearch, ArrowRight, Truck } from 'lucide-react';

export default function BulkOrderTrackerWidget() {
  const mockOrders = [
    { id: 'ORD-892', status: 'En Tránsito', items: '50x BPC-157, 20x TB-500', date: '22 May, 2026' },
    { id: 'ORD-890', status: 'Preparando', items: '100x Jeringas', date: '20 May, 2026' }
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PackageSearch size={18} color="var(--primary)" /> Seguimiento B2B
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockOrders.map(o => (
          <div key={o.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'var(--color-bg-app)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>{o.id}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{o.items}</div>
              </div>
              <span style={{ 
                fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '8px', fontWeight: 800, textTransform: 'uppercase',
                background: o.status === 'En Tránsito' ? '#eff6ff' : '#fef3c7',
                color: o.status === 'En Tránsito' ? 'var(--color-primary)' : '#92400e'
              }}>
                {o.status}
              </span>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={14} color="var(--color-text-secondary)" /> Fecha estimada: {o.date}
            </div>
          </div>
        ))}
        <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', padding: '0.5rem 0', marginTop: '0.5rem' }}>
          Ver todos mis pedidos <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Sparkles, CheckCircle, Package } from 'lucide-react';

export default function PredictiveInventoryAlerts({ products = [] }) {
  const [ordered, setOrdered] = useState(false);

  // We simulate "Predictive Analysis" here for demonstration purposes.
  // In reality, this would use `products` combined with historic sales data.
  const criticalItems = products.filter(p => (p.stock || 0) < 50).slice(0, 2);

  if (criticalItems.length === 0) return null;

  return (
    <div style={{
      padding: '1.5rem',
      background: 'linear-gradient(to right, #fff, #f8fafc)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid rgba(79, 70, 229, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={22} color="#f59e0b" /> 
            Predictive Inventory Alerts
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={14} color="#4f46e5" />
            Atlas AI has detected high sales velocity for the following items.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {criticalItems.map((item, idx) => (
          <div key={item.id || idx} style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '3rem', height: '3rem', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#d97706" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Stock: {item.stock || 0} units</div>
                <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>Estimated depletion: 12 days</div>
              </div>
            </div>
            
            {!ordered ? (
              <button 
                onClick={() => setOrdered(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(79, 70, 229, 0.1)',
                  color: '#4f46e5',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'; e.currentTarget.style.color = '#4f46e5'; }}
              >
                <Package size={16} /> Auto-Order
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle size={18} /> PO Generated
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

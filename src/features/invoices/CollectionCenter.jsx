import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Clock from "lucide-react/dist/esm/icons/clock";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import Users from "lucide-react/dist/esm/icons/users";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import React from 'react';






export default function CollectionCenter({ invoices, onSelect }) {
  // Mock aggregations for the Collection Center based on invoices
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const highRiskCustomers = invoices.filter(i => i.status === 'Overdue' || i.status === 'Partially Paid');
  const topOutstanding = [...invoices]
    .sort((a, b) => ((Number(b.grandTotal) || 0) - (Number(a.grandTotal) || 0)))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Priority Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 600 }}>
            <AlertTriangle size={18} /> Due Today & Overdue
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#991b1b' }}>{overdueInvoices.length}</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#b91c1c' }}>Immediate action required.</p>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 600 }}>
            <ShieldAlert size={18} /> High-Risk Customers
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#92400e' }}>{highRiskCustomers.length}</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309' }}>Customers with worsening behavior.</p>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 600 }}>
            <Clock size={18} /> Collection Promises
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#14532d' }}>3</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>Payments expected this week.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Largest Outstanding */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={18} color="var(--color-text-secondary)" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-primary)' }}>Largest Outstanding Invoices</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {topOutstanding.length === 0 ? (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-tertiary)', margin: 0 }}>No outstanding invoices.</p>
            ) : (
              topOutstanding.map(inv => (
                <div 
                  key={inv.id} 
                  onClick={() => onSelect(inv)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>{inv.documentNumber || inv.id.slice(0,8)}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{inv.customerName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>€{Number(inv.grandTotal || 0).toLocaleString()}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: inv.status === 'Overdue' ? '#dc2626' : 'var(--color-text-secondary)' }}>{inv.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High Risk Customers List */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--color-text-secondary)" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-primary)' }}>High-Risk Accounts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {highRiskCustomers.length === 0 ? (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-tertiary)', margin: 0 }}>No high-risk accounts detected.</p>
            ) : (
              highRiskCustomers.slice(0,5).map(inv => (
                <div 
                  key={`risk-${inv.id}`}
                  onClick={() => onSelect(inv)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{inv.customerName}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Invoice: {inv.documentNumber}</p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Risk: High</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
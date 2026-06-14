import X from "lucide-react/dist/esm/icons/x";
import Globe from "lucide-react/dist/esm/icons/globe";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Package from "lucide-react/dist/esm/icons/package";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Users from "lucide-react/dist/esm/icons/users";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import React from 'react';









export default function CountryDetailDrawer({ market, onClose, products, wholesalers, orders }) {
  if (!market) return null;

  // Aggregate Data specific to this market
  // Products
  const approvedProducts = products.filter(p => p.availability?.includes(market.name) || p.countries?.includes(market.name));
  // Wholesalers (assume they have an array of regions/countries)
  const activeDistributors = wholesalers.filter(w => w.regions?.includes(market.name) || w.geography?.includes(market.name));
  // Orders/Revenue
  const marketOrders = orders.filter(o => o.shippingAddress?.country === market.name || o.country === market.name);
  const totalRevenue = marketOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
  // Zoho Customers (proxy by unique emails in orders for this country)
  const uniqueCustomers = new Set(marketOrders.map(o => o.userEmail || o.email)).size;

  const statusColors = {
    'Operational': 'var(--color-success)',
    'Pending': '#d97706',
    'Opportunity': '#0ea5e9',
    'Distributor Needed': '#ea580c',
    'Restricted': 'var(--color-danger)',
    'Not Configured': 'var(--text-muted)'
  };
  const color = statusColors[market.status] || 'var(--text-main)';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        width: '100%',
        maxWidth: '450px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--color-bg-surface)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>{market.flag || '🏳️'}</div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', color: 'var(--text-main)' }}>{market.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: color }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }}></span>
                {market.status}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={14}/> Products Approved</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{approvedProducts.length}</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={14}/> Distributors</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeDistributors.length}</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={14}/> Revenue</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>AED {(totalRevenue/1000).toFixed(1)}k</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14}/> Zoho Customers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{uniqueCustomers}</div>
            </div>
          </div>

          {/* Details List */}
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Market Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-main)' }}>Products Pending</span>
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-main)' }}>Clinics Accessing</span>
                <span style={{ fontWeight: 600 }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-main)' }}>Average Margin</span>
                <span style={{ fontWeight: 600 }}>N/A</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-main)' }}>Last Update</span>
                <span style={{ fontWeight: 600 }}>Today</span>
              </div>
            </div>
          </div>

          {/* Restrictions Warning */}
          {market.restrictions && market.restrictions.length > 0 && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} /> Shipping & Regulatory Restrictions
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                {market.restrictions.map((r, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{r}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--color-bg-surface)', display: 'flex', gap: '1rem' }}>
          <button className="gcp-btn-secondary" style={{ flex: 1 }}>Configure Market</button>
          <button className="gcp-btn-primary" style={{ flex: 1 }}>Assign Products</button>
        </div>
      </div>
    </div>
  );
}
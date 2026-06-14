import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import React from 'react';
import { Card } from '../../ui';



export default function DistributorTerritoryManager({ wholesalers, orders }) {

  // Calculate revenue per wholesaler from b2b_orders or assigned orders
  // Assuming orders have a `wholesalerId` or `userId` that matches wholesaler
  const getRevenue = (wId) => {
    const wOrders = orders.filter(o => o.wholesalerId === wId || o.userId === wId);
    return wOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} color="var(--primary)" /> Distributor Territories
        </h3>
        <button className="gcp-btn-secondary">Assign Territory</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <tr>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Distributor</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Countries</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Revenue</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {wholesalers.map(w => {
              const rev = getRevenue(w.id);
              const regions = w.regions || w.geography || [];
              const regionsStr = Array.isArray(regions) ? regions.join(', ') : (regions || 'Unassigned');

              return (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{w.displayName || w.companyName || [w.firstName, w.lastName].join(' ')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{w.email}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {regionsStr}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-success)' }}>
                    AED {rev.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: w.status !== 'suspended' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: w.status !== 'suspended' ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {w.status !== 'suspended' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {wholesalers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No distributors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
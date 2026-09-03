import React from 'react';
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import { Card } from '../../ui';
import DataTable from '../../ui/DataTable';
import StatusChip from '../../ui/StatusChip';
import EmptyState from '../../ui/EmptyState';

export default function DistributorTerritoryManager({ wholesalers, orders }) {
  const getRevenue = (wId) => {
    const wOrders = (orders || []).filter(o => o.wholesalerId === wId || o.userId === wId);
    return wOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
  };

  const tableData = (wholesalers || []).map(w => {
    const rev = getRevenue(w.id);
    const regions = w.regions || w.geography || [];
    const regionsStr = Array.isArray(regions) ? regions.join(', ') : (regions || 'Unassigned');
    return { ...w, _rev: rev, _regionsStr: regionsStr };
  });

  const columns = [
    {
      key: 'displayName',
      header: 'Distributor',
      sortKey: 'displayName',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {r.displayName || r.companyName || [r.firstName, r.lastName].join(' ')}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.email}</div>
        </div>
      )
    },
    {
      key: '_regionsStr',
      header: 'Countries',
      render: (r) => (
        <span style={{ maxWidth: '250px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {r._regionsStr}
        </span>
      )
    },
    {
      key: '_rev',
      header: 'Revenue',
      align: 'right',
      sortValue: (r) => r._rev,
      render: (r) => <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>AED {r._rev.toLocaleString()}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusChip status={r.status !== 'suspended' ? 'active' : 'error'} />
    },
    {
      key: '_actions',
      header: '',
      align: 'right',
      render: () => (
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <MoreVertical size={18} />
        </button>
      )
    }
  ];

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} color="var(--primary)" /> Distributor Territories
        </h3>
        <button className="gcp-btn-secondary">Assign Territory</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tableData.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No distributors found" subtitle="Assign a territory to get started." />
        ) : (
          <DataTable
            data={tableData}
            columns={columns}
            keyField="id"
            emptyTitle="No distributors found"
          />
        )}
      </div>
    </Card>
  );
}

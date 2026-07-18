import React from 'react';
import { ShieldAlert, CheckCircle2, Clock, XCircle, AlertTriangle } from '@/lib/icons';
import DataTable from '../../ui/DataTable';

const MATRIX = [
  { product: 'Tirzepatide 15mg', uae: 'Approved', ksa: 'Approved', eu: 'Pending', usa: 'Restricted' },
  { product: 'Retatrutide 10mg', uae: 'Approved', ksa: 'Pending', eu: 'Restricted', usa: 'Restricted' },
  { product: 'BPC-157 5mg', uae: 'Expired', ksa: 'Not Submitted', eu: 'Approved', usa: 'Approved' }
];

const renderStatus = (status) => {
  switch (status) {
    case 'Approved': return <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16}/> {status}</span>;
    case 'Pending': return <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16}/> {status}</span>;
    case 'Restricted': return <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={16}/> {status}</span>;
    case 'Expired': return <span style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={16}/> {status}</span>;
    default: return <span style={{ color: '#94a3b8' }}>{status}</span>;
  }
};

export default function RegulatoryAccessTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldAlert size={24} color="#ef4444" />
        <h2 style={{ fontSize: '20px', margin: 0 }}>Regulatory Access Matrix</h2>
      </div>

      {/* Alerts */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle color="#ef4444" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>BPC-157 UAE Registration Expired</div>
            <div style={{ fontSize: '13px', color: '#7f1d1d' }}>Product is now hidden in UAE. Upload renewed CoA and GMP to restore visibility.</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Clock color="#f59e0b" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#b45309', marginBottom: '4px' }}>Tirzepatide EU Registration Pending</div>
            <div style={{ fontSize: '13px', color: '#92400e' }}>Awaiting Stability Study. 14 days remaining.</div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <DataTable
          data={MATRIX.map((r, i) => ({ ...r, _idx: i }))}
          keyField="_idx"
          emptyTitle="No products"
          columns={[
            { key: 'product', header: 'Product', sortKey: 'product', render: (r) => <span style={{ fontWeight: 600 }}>{r.product}</span> },
            { key: 'uae', header: 'UAE', render: (r) => renderStatus(r.uae) },
            { key: 'ksa', header: 'KSA', render: (r) => renderStatus(r.ksa) },
            { key: 'eu', header: 'EU', render: (r) => renderStatus(r.eu) },
            { key: 'usa', header: 'USA', render: (r) => renderStatus(r.usa) }
          ]}
        />
      </div>
    </div>
  );
}

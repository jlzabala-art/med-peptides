import Database from "lucide-react/dist/esm/icons/database";
import RefreshCcw from "lucide-react/dist/esm/icons/refresh-ccw";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import React from 'react';






export default function ZohoPublishingTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Database size={24} color="#0071bd" />
        <h2 style={{ fontSize: '20px', margin: 0 }}>Zoho Publishing Center</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#64748b' }}>Zoho Books</span>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Synced</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Last sync: 10 mins ago</div>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#64748b' }}>Zoho Inventory</span>
            <AlertCircle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Error</div>
          <div style={{ fontSize: '13px', color: '#ef4444' }}>3 SKU Conflicts</div>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#64748b' }}>Zoho CRM</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Pending</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>12 products waiting</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Publishing Rules</span>
          <button style={{ padding: '8px 16px', background: '#0071bd', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <RefreshCcw size={16} /> Sync All
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>Products are automatically published to Zoho when they meet the following criteria:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { label: 'Product Score > 80', status: true },
              { label: 'Has Approved Pricing', status: true },
              { label: 'Has Assigned Supplier', status: true },
              { label: 'Has Valid CoA', status: true },
              { label: 'Has Main Image', status: true },
              { label: 'Has SKU', status: false }
            ].map((rule, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {rule.status ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
                <span style={{ fontWeight: 500 }}>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import Users from "lucide-react/dist/esm/icons/users";
import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import Tag from "lucide-react/dist/esm/icons/tag";
import React from 'react';





const POLICIES = [
  { segment: 'Public', status: 'Hidden', price: '-' },
  { segment: 'B2C Patient', status: 'Hidden', price: '-' },
  { segment: 'Clinic', status: 'Visible', price: '$320' },
  { segment: 'Doctor', status: 'Visible', price: '$320' },
  { segment: 'Distributor', status: 'Visible', price: '$260' },
  { segment: 'Wholesaler', status: 'Visible', price: '$220' },
  { segment: 'Internal Team', status: 'Visible', price: 'Cost + 5%' }
];

export default function CustomerAccessTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Users size={24} color="#0071bd" />
        <h2 style={{ fontSize: '20px', margin: 0 }}>Customer Type Access & Pricing Walls</h2>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left: Product Selection (Mock) */}
        <div style={{ width: '250px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Products</div>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 600, cursor: 'pointer' }}>Tirzepatide 15mg</div>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b' }}>Retatrutide 10mg</div>
          <div style={{ padding: '16px', cursor: 'pointer', color: '#64748b' }}>BPC-157 5mg</div>
        </div>

        {/* Right: Policy Editor */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Tirzepatide 15mg</h3>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Manage visibility and pricing walls per customer segment.</div>
            </div>
            <button style={{ padding: '8px 16px', background: '#0071bd', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Save Policies</button>
          </div>

          <div style={{ padding: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
              <div>Customer Segment</div>
              <div>Visibility</div>
              <div>Pricing Policy</div>
            </div>

            {POLICIES.map((policy, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 24px', borderBottom: idx < POLICIES.length - 1 ? '1px solid #e2e8f0' : 'none', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{policy.segment}</div>
                <div>
                  {policy.status === 'Visible' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                      <Eye size={14} /> Visible
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                      <EyeOff size={14} /> Hidden
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', width: 'fit-content' }}>
                    <Tag size={14} color="#64748b" />
                    <span style={{ fontWeight: 600 }}>{policy.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
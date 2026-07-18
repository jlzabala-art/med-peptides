import React from 'react';
import { Card } from '../../../ui';
import DataTable from '../../../ui/DataTable';
import { Sparkles } from '@/lib/icons';


export default function PricingTab({ form, setForm }) {
    const pricesList = [
      { label: 'Retail Price (B2C)', key: 'guestVialPrice', margin: marginRetail },
      { label: 'Clinic Price (B2B)', key: 'proVialPrice', margin: marginClinic },
      { label: 'Distributor Price', key: 'distributorPrice', margin: marginDistributor },
      { label: 'Wholesaler Price', key: 'wholesalerPrice', margin: marginWholesaler },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Pricing Dashboard */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Pricing Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Base Cost Box */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              border: '1px solid #374151'
            }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>Internal Unit Cost</label>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #4b5563', paddingBottom: '2px' }}>
                <span style={{ fontSize: '1rem', color: '#94a3b8', marginRight: '4px' }}>$</span>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={e => setForm({...form, costPrice: parseFloat(e.target.value) || 0})}
                  style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '6px' }}>Base cost used for margin calc</span>
            </div>

            {/* Other prices */}
            {pricesList.map((item, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                border: `1px solid ${item.margin < 20 ? '#ef444455' : '#374151'}`
              }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>{item.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #4b5563', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '1rem', color: '#94a3b8', marginRight: '4px' }}>$</span>
                  <input
                    type="number"
                    value={form[item.key]}
                    onChange={e => setForm({...form, [item.key]: parseFloat(e.target.value) || 0})}
                    style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Margin:</span>
                  <strong style={{ fontSize: '0.75rem', color: getMarginColor(item.margin) }}>
                    {item.margin.toFixed(1)}%
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 7. MOQ Pricing Matrix */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>MOQ Pricing Matrix</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Volume tier price grids and margin curves</p>
            </div>
            <button
              onClick={autoGenMoq}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #8b5cf6',
                backgroundColor: '#8b5cf615',
                color: '#c084fc',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={12} /> Auto Generate MOQ with AI
            </button>
          </div>

          <DataTable
            data={[
              { qty: 1, key: 'moq_1' },
              { qty: 10, key: 'moq_10' },
              { qty: 50, key: 'moq_50' },
              { qty: 100, key: 'moq_100' },
              { qty: 500, key: 'moq_500' },
              { qty: 1000, key: 'moq_1000' }
            ].map(tier => {
              const val = form[tier.key] || 0;
              const unitMargin = val > 0 ? ((val - cost) / val) * 100 : 0;
              const discountPercent = retail > 0 ? ((retail - val) / retail) * 100 : 0;
              return { ...tier, val, unitMargin, discountPercent };
            })}
            keyField="key"
            emptyTitle="No tiers"
            columns={[
              { key: 'qty', header: 'MOQ Tier Quantity', sortValue: (r) => r.qty, render: (r) => <span style={{ fontWeight: 600 }}>{r.qty} Unit{r.qty > 1 && 's'}</span> },
              {
                key: 'val',
                header: 'Unit Selling Price ($)',
                render: (r) => (
                  <input
                    type="number"
                    value={r.val}
                    onChange={e => setForm({ ...form, [r.key]: parseFloat(e.target.value) || 0 })}
                    style={{ width: '90px', padding: '4px 8px', border: '1px solid #334155', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.8rem' }}
                  />
                )
              },
              { key: 'unitMargin', header: 'Calculated Profit Margin (%)', sortValue: (r) => r.unitMargin, render: (r) => <span style={{ color: getMarginColor(r.unitMargin), fontWeight: 700 }}>{r.unitMargin.toFixed(1)}%</span> },
              { key: 'discountPercent', header: 'Discount (vs Retail)', sortValue: (r) => r.discountPercent, render: (r) => <span style={{ color: r.discountPercent > 0 ? '#60a5fa' : '#64748b' }}>{r.discountPercent > 0 ? `${r.discountPercent.toFixed(0)}% Off` : 'Base Price'}</span> }
            ]}
          />
        </Card>
      </div>
    );
}

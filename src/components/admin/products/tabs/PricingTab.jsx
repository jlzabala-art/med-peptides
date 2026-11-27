import React, { useState } from 'react';
import { Card } from '../../../ui';
import DataTable from '../../../ui/DataTable';
import { Sparkles, Globe, ChevronDown, ChevronRight } from '@/lib/icons';

const REGIONAL_MARKETS = [
  { id: 'uae', label: 'UAE / GCC', badge: 'AE', defaultCurrency: 'AED' },
  { id: 'qatar', label: 'Qatar', badge: 'QA', defaultCurrency: 'QAR' },
  { id: 'us', label: 'United States', badge: 'US', defaultCurrency: 'USD' },
];

const getMarginColor = (m) => (m >= 40 ? '#34d399' : m >= 20 ? '#f59e0b' : '#f87171');

export default function PricingTab({ form = {}, setForm, autoGenMoq }) {
  const [showRegionalOverrides, setShowRegionalOverrides] = useState(
    () => Boolean(form.byMarket && Object.keys(form.byMarket).length > 0)
  );
  const byMarket = form.byMarket || form.pricing?.byMarket || {};

  const updateMarketField = (marketId, field, rawValue) => {
    const nextMarket = { ...(byMarket[marketId] || {}) };
    if (field === 'currency') {
      nextMarket.currency = rawValue;
    } else {
      const parsed = rawValue === '' ? null : parseFloat(rawValue);
      if (parsed == null || Number.isNaN(parsed) || parsed <= 0) {
        delete nextMarket[field];
      } else {
        nextMarket[field] = parsed;
      }
    }
    const nextByMarket = { ...byMarket, [marketId]: nextMarket };
    // Clean up empty market entries so blank markets inherit Global (15%+15%)
    const hasValues = ['distributor', 'wholesale', 'clinic', 'retail'].some((k) => nextMarket[k] > 0);
    if (!hasValues) delete nextByMarket[marketId];

    setForm({
      ...form,
      byMarket: nextByMarket,
      pricing: {
        ...(form.pricing || {}),
        byMarket: nextByMarket,
      },
    });
  };
  const cost = Number(form.costPrice || form.cost || 0);
  const retail = Number(form.guestVialPrice || form.pricePatient || form.price || 0);
  const clinic = Number(form.proVialPrice || form.priceDoctor || 0);
  const distributor = Number(form.distributorPrice || form.priceWholesale || 0);
  const wholesaler = Number(form.wholesalerPrice || 0);

  const marginRetail = retail > 0 && cost > 0 ? ((retail - cost) / retail) * 100 : 0;
  const marginClinic = clinic > 0 && cost > 0 ? ((clinic - cost) / clinic) * 100 : 0;
  const marginDistributor = distributor > 0 && cost > 0 ? ((distributor - cost) / distributor) * 100 : 0;
  const marginWholesaler = wholesaler > 0 && cost > 0 ? ((wholesaler - cost) / wholesaler) * 100 : 0;

  const pricesList = [
    { label: 'Retail Price (B2C)', key: 'guestVialPrice', margin: marginRetail },
    { label: 'Clinic Price (B2B)', key: 'proVialPrice', margin: marginClinic },
    { label: 'Distributor Price', key: 'distributorPrice', margin: marginDistributor },
    { label: 'Wholesaler Price', key: 'wholesalerPrice', margin: marginWholesaler },
  ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Pricing Dashboard */}
        <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Pricing Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Base Cost Box */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Internal Unit Cost</label>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                <span style={{ fontSize: '1rem', color: '#64748b', marginRight: '4px' }}>$</span>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={e => setForm({...form, costPrice: parseFloat(e.target.value) || 0})}
                  style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '6px' }}>Base cost used for margin calc</span>
            </div>

            {/* Other prices */}
            {pricesList.map((item, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: `1px solid ${item.margin < 20 ? '#fca5a5' : '#e2e8f0'}`
              }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>{item.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '1rem', color: '#64748b', marginRight: '4px' }}>$</span>
                  <input
                    type="number"
                    value={form[item.key]}
                    onChange={e => setForm({...form, [item.key]: parseFloat(e.target.value) || 0})}
                    style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Margin:</span>
                  <strong style={{ fontSize: '0.75rem', color: getMarginColor(item.margin) }}>
                    {item.margin.toFixed(1)}%
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Regional Market Overrides (Progressive Disclosure — Rule #26) */}
        <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button
            type="button"
            onClick={() => setShowRegionalOverrides((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={15} style={{ color: '#003666' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  Regional Market Overrides (byMarket)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.73rem', color: '#64748b' }}>
                  Leave blank to inherit Global rule (Wholeseller = Cost + 15% + 15%). Only enter country exceptions.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '999px' }}>
                {Object.keys(byMarket).length} active
              </span>
              {showRegionalOverrides ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </button>

          {showRegionalOverrides && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {REGIONAL_MARKETS.map((m) => {
                const entry = byMarket[m.id] || {};
                const cur = entry.currency || m.defaultCurrency;
                const hasOverride = Boolean(entry.distributor || entry.wholesale || entry.clinic);
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(120px, 1.1fr) 84px repeat(3, minmax(90px, 1fr))',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: hasOverride ? '#f8fafc' : '#ffffff',
                      border: `1px solid ${hasOverride ? '#cbd5e1' : '#e2e8f0'}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        {m.label} <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.7rem' }}>({m.badge})</span>
                      </div>
                      <div style={{ fontSize: '0.67rem', color: hasOverride ? '#0f766e' : '#94a3b8' }}>
                        {hasOverride ? 'Regional override active' : 'Inherits Global (15%+15%)'}
                      </div>
                    </div>
                    <select
                      value={cur}
                      onChange={(e) => updateMarketField(m.id, 'currency', e.target.value)}
                      style={{ padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontWeight: 600 }}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                      <option value="QAR">QAR</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Dist (+15%)"
                      value={entry.distributor ?? ''}
                      onChange={(e) => updateMarketField(m.id, 'distributor', e.target.value)}
                      style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Wholeseller"
                      value={entry.wholesale ?? ''}
                      onChange={(e) => updateMarketField(m.id, 'wholesale', e.target.value)}
                      style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Clinic"
                      value={entry.clinic ?? ''}
                      onChange={(e) => updateMarketField(m.id, 'clinic', e.target.value)}
                      style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 7. MOQ Pricing Matrix */}
        <Card padding="md" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>MOQ Pricing Matrix</h3>
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
                backgroundColor: '#f3e8ff',
                color: '#7c3aed',
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
                    style={{ width: '90px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.8rem' }}
                  />
                )
              },
              { key: 'unitMargin', header: 'Calculated Profit Margin (%)', sortValue: (r) => r.unitMargin, render: (r) => <span style={{ color: getMarginColor(r.unitMargin), fontWeight: 700 }}>{r.unitMargin.toFixed(1)}%</span> },
              { key: 'discountPercent', header: 'Discount (vs Retail)', sortValue: (r) => r.discountPercent, render: (r) => <span style={{ color: r.discountPercent > 0 ? '#0284c7' : '#64748b' }}>{r.discountPercent > 0 ? `${r.discountPercent.toFixed(0)}% Off` : 'Base Price'}</span> }
            ]}
          />
        </Card>
      </div>
    );
}

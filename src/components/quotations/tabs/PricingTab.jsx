'use client';

import React from 'react';
import { DollarSign, TrendingUp, ShieldCheck, CreditCard, Percent, ArrowUpRight } from 'lucide-react';
import CopyableId from '../../ui/CopyableId';
import DataTable from '../../ui/DataTable';

export default function PricingTab({ quotation, quotationId }) {
  if (!quotation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        No pricing details available.
      </div>
    );
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const currency = quotation.currency || 'USD';
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  let subtotal = 0;
  let totalCost = 0;

  items.forEach(it => {
    const qty = Number(it.quantity || 1);
    const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
    const cost = Number(it.supplierCost || rate * 0.55);
    subtotal += rate * qty;
    totalCost += cost * qty;
  });

  const taxTotal = quotation.taxTotal !== undefined ? Number(quotation.taxTotal) : Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = quotation.grandTotal !== undefined && Number(quotation.grandTotal) > 0
    ? Number(quotation.grandTotal)
    : Math.round((subtotal + taxTotal) * 100) / 100;

  const grossProfit = subtotal - totalCost;
  const marginPercent = subtotal > 0
    ? Math.round((grossProfit / subtotal) * 1000) / 10
    : Number(quotation.marginPercent || 0);

  const tier = (quotation.tier || quotation.tierLevel || quotation.priceTier || 'cost').toUpperCase();
  const paymentTerms = (quotation.paymentTerms || 'due_on_receipt').replace(/_/g, ' ').toUpperCase();

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Subtotal
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
            {items.length} line items
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} />
            Margin %
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>
            {marginPercent}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: 2 }}>
            Gross: {currencySymbol}{grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Estimated Tax
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {currencySymbol}{taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
            5% VAT / Regional
          </div>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Grand Total
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d4ed8', marginTop: 4 }}>
            {currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: 2 }}>
            Billing: {currency}
          </div>
        </div>
      </div>

      {/* 2. Commercial Terms & Tier Info */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Applied Pricing Tier
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
            <Percent size={13} color="var(--color-primary, #003666)" />
            {tier}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Payment Terms
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
            <CreditCard size={13} color="var(--color-primary, #003666)" />
            {paymentTerms}
          </div>
        </div>
      </div>

      {/* 3. Itemized Pricing & Margin Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', padding: '0.75rem' }}>
        <div style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
          Line-Item Margin & Financial Breakdown
        </div>
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Product / Item',
              width: '30%',
              render: (it) => (
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{it.name || it.productName || 'Custom Item'}</div>
                  {it.dosage && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{it.dosage}</div>}
                </div>
              )
            },
            {
              key: 'quantity',
              header: 'Qty',
              width: '10%',
              render: (it) => <div style={{ textAlign: 'center', fontWeight: 600 }}>{Number(it.quantity || 1)}</div>
            },
            {
              key: 'supplierCost',
              header: 'Est. Cost',
              width: '15%',
              minRole: 'admin',
              render: (it) => {
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                const cost = Number(it.supplierCost || rate * 0.55);
                return <div style={{ textAlign: 'right', color: '#64748b' }}>{currencySymbol}{cost.toFixed(2)}</div>;
              }
            },
            {
              key: 'unitPrice',
              header: 'Unit Rate',
              width: '15%',
              render: (it) => {
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                return <div style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{currencySymbol}{rate.toFixed(2)}</div>;
              }
            },
            {
              key: 'total',
              header: 'Total',
              width: '15%',
              render: (it) => {
                const qty = Number(it.quantity || 1);
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                return <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary, #003666)' }}>{currencySymbol}{(rate * qty).toFixed(2)}</div>;
              }
            },
            {
              key: 'margin',
              header: 'Margin',
              width: '15%',
              minRole: 'admin',
              render: (it) => {
                const qty = Number(it.quantity || 1);
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                const cost = Number(it.supplierCost || rate * 0.55);
                const lineTotal = rate * qty;
                const lineCost = cost * qty;
                const itemMargin = lineTotal > 0 ? Math.round(((lineTotal - lineCost) / lineTotal) * 100) : 0;
                return (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: itemMargin >= 40 ? '#f0fdf4' : '#fffbeb',
                      color: itemMargin >= 40 ? '#15803d' : '#b45309',
                    }}>
                      {itemMargin}%
                    </span>
                  </div>
                );
              }
            }
          ]}
          data={items}
          keyField="id"
          emptyTitle="No line items recorded"
        />
      </div>
    </div>
  );
}

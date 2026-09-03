'use client';

import React from 'react';
import { Package, ShieldCheck, Snowflake, FileCheck } from 'lucide-react';
import CopyableId from '../../ui/CopyableId';
import DataTable from '../../ui/DataTable';

export default function ItemsTab({ quotation, quotationId }) {
  if (!quotation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        No items available.
      </div>
    );
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const currency = quotation.currency || 'USD';
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', padding: '0.75rem' }}>
        <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={16} color="var(--color-primary, #003666)" />
            <span>Quotation Line Items ({items.length})</span>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Product / Presentation',
              width: '40%',
              render: (it) => (
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{it.name || it.productName || 'Catalog Product'}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {it.dosage && <span>{it.dosage}</span>}
                    {it.productId && (
                      <>
                        <span>·</span>
                        <span>SKU: <CopyableId value={it.productId} /></span>
                      </>
                    )}
                  </div>
                </div>
              )
            },
            {
              key: 'quantity',
              header: 'Quantity',
              width: '15%',
              render: (it) => (
                <div style={{ textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                  {Number(it.quantity || 1)}
                </div>
              )
            },
            {
              key: 'unitPrice',
              header: 'Unit Rate',
              width: '15%',
              render: (it) => {
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                return (
                  <div style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                    {currencySymbol}{rate.toFixed(2)}
                  </div>
                );
              }
            },
            {
              key: 'total',
              header: 'Total',
              width: '15%',
              render: (it) => {
                const qty = Number(it.quantity || 1);
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                return (
                  <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary, #003666)' }}>
                    {currencySymbol}{(rate * qty).toFixed(2)}
                  </div>
                );
              }
            },
            {
              key: 'compliance',
              header: 'Compliance',
              width: '15%',
              render: () => (
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: '#f0fdfa',
                    color: '#0d9488',
                  }}>
                    <ShieldCheck size={11} />
                    Pharma Spec
                  </span>
                </div>
              )
            }
          ]}
          data={items}
          keyField="id"
          emptyTitle="No line items attached to this quotation"
        />
      </div>
    </div>
  );
}

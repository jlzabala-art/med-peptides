'use client';

import React from 'react';
import { Package, ShieldCheck, Snowflake, FileCheck, FileText, Tag, ExternalLink } from 'lucide-react';
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
              header: 'Product / Presentation & Docs',
              width: '45%',
              render: (it) => {
                const isKit = it.isKit || (it.quantity >= 10 && it.supplierId?.includes('lotusland')) || (it.name && it.name.toLowerCase().includes('kit'));
                const slug = it.slug || (it.productId ? String(it.productId).toLowerCase().replace(/[^a-z0-9]+/g, '-') : (it.name ? String(it.name).toLowerCase().split(' ')[0] : 'peptide'));
                const supplierParam = it.supplierId ? `?supplier=${it.supplierId}` : (quotation.supplierId ? `?supplier=${quotation.supplierId}` : '');

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                        {it.name || it.productName || 'Catalog Product'}
                      </span>
                      {isKit && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          padding: '1px 6px',
                          borderRadius: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}>
                          <Tag size={10} /> Kit 10 Viales
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {it.dosage && <span>{it.dosage}</span>}
                      {it.supplierName && (
                        <>
                          <span>·</span>
                          <span style={{ color: '#0284c7', fontWeight: 600 }}>{it.supplierName}</span>
                        </>
                      )}
                      {it.productId && (
                        <>
                          <span>·</span>
                          <span>SKU: <CopyableId value={it.productId} /></span>
                        </>
                      )}
                    </div>

                    {/* Ficha Técnica & Etiqueta Vial Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <a
                        href={`/p/${slug}${supplierParam}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#0d9488',
                          background: '#f0fdfa',
                          border: '1px solid #ccfbf1',
                          padding: '2px 7px',
                          borderRadius: 4,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <FileText size={11} /> Ficha Técnica ↗
                      </a>

                      <a
                        href={`/api/vial-label/${slug}?format=38x90`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#4338ca',
                          background: '#e0e7ff',
                          border: '1px solid #c7d2fe',
                          padding: '2px 7px',
                          borderRadius: 4,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <Tag size={11} /> Etiqueta 38x90 ↗
                      </a>
                    </div>
                  </div>
                );
              }
            },
            {
              key: 'quantity',
              header: 'Quantity',
              width: '12%',
              render: (it) => (
                <div style={{ textAlign: 'center', fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                  {Number(it.quantity || 1)}
                </div>
              )
            },
            {
              key: 'unitPrice',
              header: 'Unit Rate',
              width: '14%',
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
              width: '14%',
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

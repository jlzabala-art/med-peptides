'use client';

import React from 'react';
import { Lock, Package, CheckCircle2, FileText, DollarSign } from 'lucide-react';
import DocumentViewLayout from '@/components/shared/layouts/DocumentViewLayout';

export default function SharedQuoteDocument({ quote, expirationDate }) {
  const lineColumns = [
    {
      key: 'name',
      header: 'Product / Formulation',
      width: '48%',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{item.name}</div>
          {item.dosage && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Dosage: {item.dosage}</div>}
          {item.sku && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>SKU: {item.sku}</div>}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: '14%',
      align: 'center',
      render: (item) => <span style={{ fontWeight: 600, color: '#334155' }}>{item.quantity}</span>,
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      width: '19%',
      align: 'right',
      render: (item) => (
        <span style={{ fontWeight: 600, color: '#334155' }}>
          {Number(item.unitPrice || 0).toFixed(2)} {quote.currency}
        </span>
      ),
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      width: '19%',
      align: 'right',
      render: (item) => (
        <span style={{ fontWeight: 700, color: '#0f172a' }}>
          {Number(item.subtotal || 0).toFixed(2)} {quote.currency}
        </span>
      ),
    },
  ];

  const channelLabel = quote.channel === 'clinic'
    ? 'Professional Medical Tier'
    : String(quote.channel || 'Institutional').toUpperCase();

  return (
    <DocumentViewLayout
      whiteLabel={true}
      documentType="Institutional Quotation"
      title={`Official Quotation #${quote.quoteId}`}
      subtitle="Verified digital signature (HMAC-SHA256) with locked channel pricing"
      documentCode={quote.quoteId}
      status="active"
      validUntil={expirationDate}
      headerActions={
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          <Lock size={14} /> HMAC-SHA256 Verified
        </div>
      }
      metadataCards={[
        {
          label: 'Prepared For',
          title: quote.clientName || 'Institutional Client',
          lines: [quote.clientEmail].filter(Boolean),
        },
        {
          label: 'Billing Channel',
          title: channelLabel,
          lines: [`Currency: ${quote.currency || 'USD'}`],
        },
        {
          label: 'Price Validity',
          title: expirationDate,
          lines: ['48-hour locked institutional rate'],
        },
      ]}
      summaryMetrics={[
        {
          title: 'Line Items',
          value: quote.items?.length || 0,
          subtitle: 'Formulations quoted',
          icon: FileText,
          color: '#2563eb',
        },
        {
          title: 'Grand Total',
          value: `${Number(quote.grandTotal || 0).toFixed(2)} ${quote.currency}`,
          subtitle: quote.coldChainFee > 0 ? 'Includes priority logistics' : 'Products subtotal',
          icon: DollarSign,
          color: '#16a34a',
        },
      ]}
      lineItems={quote.items || []}
      lineColumns={lineColumns}
      totalsSection={
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '0.875rem', color: '#64748b' }}>
              <span>Products Subtotal:</span>
              <strong style={{ color: '#0f172a' }}>{Number(quote.subtotal || 0).toFixed(2)} {quote.currency}</strong>
            </div>
            {quote.coldChainFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '0.875rem', color: '#0284c7' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={14} /> Priority Logistics:
                </span>
                <strong>{Number(quote.coldChainFee || 0).toFixed(2)} {quote.currency}</strong>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '260px',
                borderTop: '2px solid #0f172a',
                paddingTop: '10px',
                marginTop: '4px',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              <span>Total:</span>
              <span>{Number(quote.grandTotal || 0).toFixed(2)} {quote.currency}</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '18px 22px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>
                Confirm this Purchase Order?
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                Upon confirmation, a formal purchase order will be generated and the pro-forma invoice will be issued.
              </div>
            </div>
            <button
              type="button"
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Accept Quotation &amp; Issue PO</span>
            </button>
          </div>
        </div>
      }
    />
  );
}

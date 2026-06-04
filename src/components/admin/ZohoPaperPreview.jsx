import React from 'react';

// Base style for the A4-proportioned preview card
const paperStyle = {
  background: '#fff',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  minHeight: '1056px', // A4 aspect ratio proportion
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
  padding: '3rem',
  color: '#1e293b',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  border: '1px solid #e2e8f0',
  borderRadius: '8px'
};

const divider = {
  borderBottom: '1px solid #e2e8f0',
  margin: '1.5rem 0'
};

export default function ZohoPaperPreview({
  docType, // 'QUOTATION', 'SALES ORDER', 'INVOICE', 'REQUEST FOR QUOTATION', 'PURCHASE ORDER', 'BILL'
  documentData
}) {
  const {
    documentNumber = 'N/A',
    date = '—',
    dueDate = '—',
    validUntil = '—',
    customerName = '',
    customerEmail = '',
    supplierName = '',
    supplierEmail = '',
    items = [],
    subTotal = 0,
    taxTotal = 0,
    grandTotal = 0,
    notes = '',
    isDropship = false,
    globalDiscount = 0
  } = documentData || {};

  const name = customerName || supplierName || '—';
  const email = customerEmail || supplierEmail || '';

  // Determine currency symbol based on P2P vs O2C
  const isUSD = ['REQUEST FOR QUOTATION', 'PURCHASE ORDER', 'BILL'].includes(docType);
  const currencySymbol = isUSD ? '$' : '€';
  const currencyCode = isUSD ? 'USD' : 'EUR';

  const fmtCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(val || 0);
  };

  // Calculate items subtotal if not pre-provided
  const computedSubtotal = items.reduce((acc, item) => {
    // For RFQ pricing
    const cost = parseFloat(item.supplierUnitCost || item.expectedCost || item.rate || item.unitPrice || 0);
    const disc = parseFloat(item.itemDiscount || 0);
    const rate = Math.max(0, cost - disc);
    const qty = parseInt(item.quantity || 1);
    return acc + (rate * qty);
  }, 0);

  const finalSubtotal = subTotal || computedSubtotal;
  const finalDiscount = parseFloat(globalDiscount || 0);
  const finalTax = taxTotal || (isUSD ? 0 : (finalSubtotal - finalDiscount) * 0.21);
  const finalTotal = grandTotal || (finalSubtotal - finalDiscount + finalTax);

  // Label names for address header depending on P2P / O2C
  const recipientLabel = isUSD ? 'Vendor / Supplier' : 'Bill To / Cliente';
  const dateLabel = isUSD ? 'Date:' : 'Fecha:';
  const expiryLabel = docType === 'QUOTATION' ? 'Válido hasta:' : (isUSD ? 'Due Date:' : 'Vence:');

  return (
    <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', overflowY: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
      <div style={paperStyle}>
        
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Atlas Health</h1>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>Longevity & Peptide Synthesis</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{docType.replace(/_/g, ' ')}</h2>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem', color: '#2563eb' }}># {documentNumber}</p>
            {isDropship && (
              <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: '#fef08a', color: '#854d0e', borderRadius: '4px', fontWeight: 700 }}>
                DROPSHIP Fulfillment
              </span>
            )}
          </div>
        </div>

        <div style={divider}></div>

        {/* Address and metadata info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', lineHeight: 1.5 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{recipientLabel}</h3>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{name}</div>
            {email && <div style={{ color: '#475569', marginTop: '0.15rem' }}>{email}</div>}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
              <span style={{ color: '#64748b' }}>{dateLabel}</span>
              <span style={{ fontWeight: 600, color: '#0f172a', minWidth: '90px' }}>{date}</span>
            </div>
            {((docType === 'QUOTATION') || dueDate !== '—' || validUntil !== '—') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                <span style={{ color: '#64748b' }}>{expiryLabel}</span>
                <span style={{ fontWeight: 600, color: '#0f172a', minWidth: '90px' }}>{validUntil !== '—' ? validUntil : dueDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginTop: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #0f172a' }}>
                <th style={{ padding: '0.75rem', width: '50%', color: '#475569', fontWeight: 700 }}>Item & Description</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#475569', fontWeight: 700 }}>Qty</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#475569', fontWeight: 700 }}>Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#475569', fontWeight: 700 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No items in this document.</td>
                </tr>
              ) : items.map((item, i) => {
                const cost = parseFloat(item.supplierUnitCost || item.expectedCost || item.rate || item.unitPrice || 0);
                const disc = parseFloat(item.itemDiscount || 0);
                const rate = Math.max(0, cost - disc);
                const qty = parseInt(item.quantity || 1);
                
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.itemName || item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {item.unit && `Unit: ${item.unit}`} {item.sku ? `• SKU: ${item.sku}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>{qty}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>
                      {fmtCurrency(cost)}
                      {disc > 0 && <span style={{ display: 'block', fontSize: '0.7rem', color: '#16a34a' }}>-{fmtCurrency(disc)} disc.</span>}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {fmtCurrency(rate * qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.85rem' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
              <span>Subtotal</span>
              <span>{fmtCurrency(finalSubtotal)}</span>
            </div>
            {finalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', color: '#16a34a', fontWeight: 500 }}>
                <span>Global Discount</span>
                <span>-{fmtCurrency(finalDiscount)}</span>
              </div>
            )}
            {finalTax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                <span>Tax</span>
                <span>{fmtCurrency(finalTax)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
              <span>Total</span>
              <span>{fmtCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {notes && (
          <div style={{ marginTop: '3.5rem', fontSize: '0.78rem', color: '#475569' }}>
            <h4 style={{ fontSize: '0.75rem', color: '#0f172a', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Notes / Terms</h4>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, background: '#f8fafc', padding: '0.875rem 1.125rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{notes}</p>
          </div>
        )}

      </div>
    </div>
  );
}

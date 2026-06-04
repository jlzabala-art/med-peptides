import React from 'react';

// Estilos base para el documento A4
const paperStyle = {
  background: '#fff',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  minHeight: '1056px', // Proporción A4
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  padding: '3rem',
  color: '#333',
  fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif'
};

const divider = {
  borderBottom: '1px solid #e5e7eb',
  margin: '2rem 0'
};

export default function ZohoPaperPreview({
  docType, // 'QUOTATION', 'SALES ORDER', 'INVOICE'
  documentData
}) {
  const {
    documentNumber = 'N/A',
    date = '—',
    validUntil = '—',
    customerName = 'Wholesaler / Cliente',
    customerEmail = '',
    items = [],
    subTotal = 0,
    taxTotal = 0,
    grandTotal = 0,
    notes = ''
  } = documentData || {};

  return (
    <div style={{ padding: '2rem', background: 'var(--color-bg-app)', overflowY: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
      <div style={paperStyle}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>REGENPEPT</h1>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Longevity & Peptide Synthesis</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#111', margin: 0, letterSpacing: '0.05em' }}>{docType}</h2>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem', color: '#444' }}># {documentNumber}</p>
          </div>
        </div>

        <div style={divider}></div>

        {/* Info Direcciones y Fechas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Facturar a</h3>
            <div style={{ fontWeight: 600, color: '#111', fontSize: '0.9rem' }}>{customerName}</div>
            <div style={{ color: '#555', marginTop: '0.2rem' }}>{customerEmail}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem' }}>
              <span style={{ color: '#666' }}>Fecha:</span>
              <span style={{ fontWeight: 600, minWidth: '100px' }}>{date}</span>
            </div>
            {docType === 'QUOTATION' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem' }}>
                <span style={{ color: '#666' }}>Válido hasta:</span>
                <span style={{ fontWeight: 600, minWidth: '100px' }}>{validUntil}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div style={{ marginTop: '3rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #333' }}>
                <th style={{ padding: '0.75rem', width: '50%' }}>Artículo & Descripción</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Cant</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Tarifa</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>No hay artículos en este documento.</td>
                </tr>
              ) : items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#111' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.2rem' }}>{item.type?.toUpperCase()} {item.sku ? `• SKU: ${item.sku}` : ''}</div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {item.isApiWithScore ? `€${parseFloat(item.rate).toFixed(2)} (Magistral)` : `€${parseFloat(item.rate).toFixed(2)}`}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                    €{((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee', color: '#555' }}>
              <span>SubTotal</span>
              <span>€{parseFloat(subTotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee', color: '#555' }}>
              <span>Impuestos</span>
              <span>€{parseFloat(taxTotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>
              <span>Total</span>
              <span>€{parseFloat(grandTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notas / Términos */}
        {notes && (
          <div style={{ marginTop: '4rem', fontSize: '0.8rem', color: '#555' }}>
            <h4 style={{ fontSize: '0.8rem', color: '#333', marginBottom: '0.5rem' }}>Notas</h4>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, background: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>{notes}</p>
          </div>
        )}

      </div>
    </div>
  );
}

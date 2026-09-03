import React from 'react';
import { verifySignedQuoteToken } from '@/services/dynamicPricingEngine';
import { 
  ShieldCheck, 
  Clock, 
  FileText, 
  Snowflake, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Lock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: 'Interactive Medical Quote - Atlas Health',
    description: 'Official verified quotation with locked channel pricing.'
  };
}

export default async function SharedQuotePage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token;
  const verification = verifySignedQuoteToken(token);

  if (!verification.valid) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fee2e2',
          padding: '40px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            {verification.expired ? 'Cotización Expirada' : 'Enlace No Válido'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.5', marginBottom: '24px' }}>
            {verification.expired 
              ? 'Esta cotización ha superado su período de validez (48 horas) para proteger las fluctuaciones de costes. Por favor solicita una nueva cotización actualizada.'
              : 'El enlace de cotización proporcionado tiene una firma digital alterada o ha sido revocado.'}
          </p>
        </div>
      </div>
    );
  }

  const quote = verification.payload;
  const expirationDate = new Date(quote.exp).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '32px 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '840px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          backgroundColor: '#003666',
          color: '#ffffff',
          padding: '24px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Building2 size={18} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: '#93c5fd', textTransform: 'uppercase' }}>
                Atlas Health Medical Sourcing
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              Cotización Oficial #{quote.quoteId}
            </h1>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            padding: '8px 14px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Lock size={14} color="#4ade80" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f0fdf4' }}>
              Firma Digital Verificada (HMAC-SHA256)
            </span>
          </div>
        </div>

        {/* Client & Metadata Info */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          backgroundColor: '#fafbfc'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Preparado Para</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{quote.clientName}</div>
            {quote.clientEmail && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{quote.clientEmail}</div>}
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Canal de Facturación</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
              {quote.channel === 'clinic' ? 'Tarifa Profesional Médica' : quote.channel.toUpperCase()}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Vigencia de Precios</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Clock size={14} />
              <span>Hasta {expirationDate}</span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div style={{ padding: '24px 32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Producto / Formulación</th>
                <th style={{ padding: '12px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Cantidad</th>
                <th style={{ padding: '12px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Precio Unitario</th>
                <th style={{ padding: '12px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{item.name}</div>
                    {item.dosage && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Dosis: {item.dosage}</div>}
                    {item.sku && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>SKU: {item.sku}</div>}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                    {item.unitPrice.toFixed(2)} {quote.currency}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {item.subtotal.toFixed(2)} {quote.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary & Totals */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '0.875rem', color: '#64748b' }}>
              <span>Subtotal Productos:</span>
              <strong style={{ color: '#0f172a' }}>{quote.subtotal.toFixed(2)} {quote.currency}</strong>
            </div>

            {quote.coldChainFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '0.875rem', color: '#0284c7' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Snowflake size={14} /> Cadena de Frío:
                </span>
                <strong>{quote.coldChainFee.toFixed(2)} {quote.currency}</strong>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '260px',
              borderTop: '2px solid #0f172a',
              paddingTop: '10px',
              marginTop: '4px',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0f172a'
            }}>
              <span>Total:</span>
              <span>{quote.grandTotal.toFixed(2)} {quote.currency}</span>
            </div>
          </div>

          {/* Action CTA */}
          <div style={{
            marginTop: '32px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>
                ¿Deseas confirmar este pedido?
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                Al confirmar, se generará la orden de compra y se enviará la factura proforma.
              </div>
            </div>

            <button style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}>
              <CheckCircle2 size={18} />
              <span>Aceptar Cotización y Emitir PO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import Package from "lucide-react/dist/esm/icons/package";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import FileText from "lucide-react/dist/esm/icons/file-text";
import React from 'react';




export default function ContextAttachment({ attachment }) {
  if (!attachment) return null;

  if (attachment.type === 'product_card') {
    return (
      <div style={{
        marginTop: '0.5rem',
        padding: '0.75rem',
        background: 'var(--color-bg-app)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '300px'
      }}>
        <div style={{ width: 40, height: 40, background: 'var(--color-bg-surface)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {attachment.image ? (
            <img src={attachment.image} alt={attachment.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
          ) : (
            <Package size={20} color="var(--color-text-tertiary)" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {attachment.name}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
            SKU: {attachment.sku}
          </div>
        </div>
        <a 
          href={`/product/${attachment.slug || attachment.sku}`}
          target="_blank" 
          rel="noopener noreferrer"
          title="Ver Producto"
          style={{ padding: '0.3rem', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }
  if (attachment.type === 'proposal') {
    return (
      <div style={{
        marginTop: '0.5rem',
        padding: '0.75rem',
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '300px'
      }}>
        <div style={{ width: 36, height: 36, background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={18} color="var(--color-primary)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {attachment.title || 'Propuesta Económica'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
            {attachment.amount ? `$${attachment.amount}` : 'Ver detalles'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>
      (Adjunto no soportado: {attachment.type})
    </div>
  );
}
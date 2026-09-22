/**
 * wholesellerColumns.jsx
 *
 * Definición de columnas para la tabla de Wholesellers.
 * Wholesellers = distribuidores/revendedores. DISTINTO de Suppliers.
 *
 * Todas las referencias son por ID (companyName resuelto desde el doc).
 */

import React, { useState } from 'react';
import StatusBadge from '../../ui/StatusBadge';
import CopyableId from '../../ui/CopyableId';
import QuoteQuickActionDropdown from '../../ui/QuoteQuickActionDropdown';
import PricingTierSelectorCell from '../customers/PricingTierSelectorCell';
import { Globe, Mail, Phone, Package, ShoppingBag, Edit2, Check, X, Share2, Eye } from '@/lib/icons';

// ── Inline editable cell ─────────────────────────────────────────────────────
function InlineEditableCell({ value, onSave, placeholder = '—' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value || ''); setEditing(false); };

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          style={{
            flex: 1, border: '1px solid var(--color-primary)', borderRadius: '4px',
            padding: '2px 6px', fontSize: '13px', background: 'var(--surface)',
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
        <button onClick={commit} title="Save" style={{ color: 'var(--color-success)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
          <Check size={14} />
        </button>
        <button onClick={cancel} title="Cancel" style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', minHeight: '24px' }}
      title="Click to edit"
    >
      <span style={{ flex: 1 }}>{value || <span style={{ color: 'var(--text-tertiary)' }}>{placeholder}</span>}</span>
      <Edit2 size={11} style={{ opacity: 0.4, flexShrink: 0 }} />
    </div>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────
export function getWholesellerColumns({ onUpdate, onSharePage, onOpenWorkspace } = {}) {
  return [
    {
      key: 'companyName',
      header: 'Distributor',
      width: '30%',
      sortable: true,
      render: (row) => (
        <div>
          <InlineEditableCell
            value={row.companyName || row.name}
            placeholder="Company name"
            onSave={(val) => onUpdate?.(row.id, { companyName: val })}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <CopyableId value={row.id} />
            {row.country && (
              <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
                • 🌐 {row.country}
              </span>
            )}
            {row.zohoBiginContactId && (
              <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }} title={`Zoho Bigin ID: ${row.zohoBiginContactId}`}>
                Bigin ✓
              </span>
            )}
            {row.zohoContactId && (
              <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }} title={`Zoho Books ID: ${row.zohoContactId} (${row.zohoContactNumber || ''})`}>
                Books ✓
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'pricingTier',
      header: 'Pricing & Currency',
      width: '20%',
      sortable: true,
      render: (row) => {
        const currency = row.currency || (row.country?.toLowerCase().includes('emirates') ? 'AED' : (row.country?.toLowerCase().includes('spain') ? 'EUR' : 'USD'));
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <PricingTierSelectorCell
              customer={row}
              customerType="wholesaler"
              onUpdate={onUpdate}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: '4px',
                backgroundColor: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1'
              }}
              title={`Invoicing Currency: ${currency}`}
            >
              {currency}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      sortable: true,
      render: (row) => <StatusBadge status={row.status || 'active'} />,
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      width: '26%',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onSharePage?.(row)}
            className="gcp-action-thumb-btn thumb-share"
            title="Compartir Catálogo B2B / Datasheet con margen verificado"
          >
            <Share2 size={15} />
          </button>
          <QuoteQuickActionDropdown 
            size="sm" 
            variant="thumbnail" 
            entityContext={{ 
              type: 'wholesaler', 
              recipientType: 'wholesaler', 
              wholesalerId: row.id, 
              wholesalerName: row.companyName || row.name 
            }} 
          />
          <button
            type="button"
            onClick={() => onOpenWorkspace?.(row)}
            className="gcp-action-thumb-btn thumb-profile"
            title="Abrir Perfil 360° Workspace del Distribuidor"
          >
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ];
}

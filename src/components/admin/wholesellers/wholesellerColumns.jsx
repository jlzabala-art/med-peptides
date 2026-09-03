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
import { Globe, Mail, Phone, Package, ShoppingBag, Edit2, Check, X } from '@/lib/icons';

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
export function getWholesellerColumns({ onUpdate } = {}) {
  return [
    {
      key: 'companyName',
      header: 'Distributor',
      width: '25%',
      sortable: true,
      render: (row) => (
        <div>
          <InlineEditableCell
            value={row.companyName || row.name}
            placeholder="Company name"
            onSave={(val) => onUpdate?.(row.id, { companyName: val })}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            <CopyableId value={row.id} />
          </div>
        </div>
      ),
    },
    {
      key: 'contactEmail',
      header: 'Contact',
      width: '20%',
      sortable: true,
      render: (row) => (
        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {(row.contactEmail || row.email) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <Mail size={11} /> {row.contactEmail || row.email}
            </span>
          )}
          {(row.contactPhone || row.phone) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <Phone size={11} /> {row.contactPhone || row.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      width: '12%',
      sortable: true,
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Globe size={11} /> {row.country || '—'}
        </span>
      ),
    },
    {
      key: 'pricingTier',
      header: 'Pricing Tier',
      width: '12%',
      sortable: true,
      render: (row) => (
        <InlineEditableCell
          value={row.pricingTier}
          placeholder="—"
          onSave={(val) => onUpdate?.(row.id, { pricingTier: val })}
        />
      ),
    },
    {
      key: 'catalogAccess',
      header: 'Catalog Access',
      width: '15%',
      sortable: false,
      render: (row) => {
        const hasRestriction = (row.authorizedVariantIds?.length || 0) > 0;
        return (
          <div style={{ fontSize: '12px' }}>
            {hasRestriction ? (
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: 'var(--color-warning-bg, #fffbeb)', color: 'var(--color-warning, #d97706)',
                  borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 500,
                }}>
                  <Package size={10} />
                  {row.authorizedVariantIds.length} variants
                </span>
              </div>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'var(--color-success-bg, #f0fdf4)', color: 'var(--color-success, #16a34a)',
                borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 500,
              }}>
                <ShoppingBag size={10} />
                Full catalog
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      sortable: true,
      render: (row) => <StatusBadge status={row.status || 'active'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '10%',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <QuoteQuickActionDropdown 
            size="sm" 
            variant="icon" 
            entityContext={{ 
              type: 'wholesaler', 
              recipientType: 'wholesaler', 
              wholesalerId: row.id, 
              wholesalerName: row.companyName || row.name 
            }} 
          />
        </div>
      ),
    },
  ];
}

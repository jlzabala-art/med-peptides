"use client";

import React, { useState } from 'react';
import { Edit2, Check, AlertTriangle, ChevronDown, ChevronRight } from '@/lib/icons';
import DataTable from '../ui/DataTable';
import CopyableId from '../ui/CopyableId';
import AppActionGroup from '../ui/AppActionGroup';

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

export default function ProductGrid({ items = [], readOnly = false, onUpdateItem }) {
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});

  const startEdit = (idx, item) => {
    if (readOnly) return;
    setEditingRow(idx);
    setEditValues({ quantity: item.quantity, rate: item.rate });
  };

  const saveEdit = (idx) => {
    if (onUpdateItem) onUpdateItem(idx, editValues);
    setEditingRow(null);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Products</h3>
        {!readOnly && (
          <button style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Row</button>
        )}
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <DataTable
          data={items.map((item, i) => ({ ...item, _idx: i }))}
          keyField="_idx"
          expandableRender={(r) => (
            <div style={{ padding: '1rem', background: '#f8fafc' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Identifiers</div>
                  <div>Variant ID: <span style={{ fontFamily: 'monospace' }}>{r.variantId ? <CopyableId value={r.variantId} /> : 'N/A'}</span></div>
                  <div>Product ID: <span style={{ fontFamily: 'monospace' }}>{r.productId ? <CopyableId value={r.productId} /> : 'N/A'}</span></div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Supplier Specs</div>
                  <div>Supplier ID: <span style={{ fontFamily: 'monospace' }}>{r.supplierId ? <CopyableId value={r.supplierId} /> : 'N/A'}</span></div>
                  <div>Lead Time: {r.leadTime || 'Standard 3-5 days'}</div>
                  <div>Cold Chain: {r.coldChain ? 'Yes ❄️' : 'No'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Cost Breakdown</div>
                  <div>Unit Cost: {fmtCurrency(r.unitCost || 0)}</div>
                  <div>Total COGS: {fmtCurrency(r.quantity * (r.unitCost || 0))}</div>
                </div>
              </div>
            </div>
          )}
          columns={[
            {
              key: 'item',
              header: 'Item',
              render: (r) => <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name || r.itemName}</div>
            },
            {
              key: 'stock',
              header: <div style={{ textAlign: 'center' }}>Stock</div>,
              render: (r) => {
                const qty = editingRow === r._idx ? editValues.quantity : r.quantity;
                const stockWarning = r.stock < qty;
                return stockWarning ? (
                  <div style={{ color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    <AlertTriangle size={12} /> {r.stock || 0}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>{r.stock || '10+'}</div>
                );
              }
            },
            {
              key: 'qty',
              header: <div style={{ textAlign: 'right' }}>Qty</div>,
              render: (r) => {
                const isEditing = editingRow === r._idx;
                const qty = isEditing ? editValues.quantity : r.quantity;
                return (
                  <div style={{ textAlign: 'right', color: '#475569' }}>
                    {isEditing ? (
                      <input type="number" value={editValues.quantity} onChange={e => setEditValues({...editValues, quantity: Number(e.target.value)})} style={{ width: '60px', padding: '0.25rem', textAlign: 'right', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    ) : (
                      <span onClick={() => startEdit(r._idx, r)} style={{ cursor: readOnly ? 'default' : 'pointer', borderBottom: readOnly ? 'none' : '1px dashed #cbd5e1' }}>{qty} {r.unit || 'ea'}</span>
                    )}
                  </div>
                );
              }
            },
            {
              key: 'rate',
              header: <div style={{ textAlign: 'right' }}>Rate</div>,
              render: (r) => {
                const isEditing = editingRow === r._idx;
                const rate = isEditing ? editValues.rate : r.rate;
                return (
                  <div style={{ textAlign: 'right', color: '#475569' }}>
                    {isEditing ? (
                      <input type="number" value={editValues.rate} onChange={e => setEditValues({...editValues, rate: Number(e.target.value)})} style={{ width: '80px', padding: '0.25rem', textAlign: 'right', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    ) : (
                      <span onClick={() => startEdit(r._idx, r)} style={{ cursor: readOnly ? 'default' : 'pointer', borderBottom: readOnly ? 'none' : '1px dashed #cbd5e1' }}>{fmtCurrency(rate)}</span>
                    )}
                  </div>
                );
              }
            },
            {
              key: 'margin',
              header: <div style={{ textAlign: 'right' }}>Margin</div>,
              render: (r) => {
                const isEditing = editingRow === r._idx;
                const qty = isEditing ? editValues.quantity : r.quantity;
                const rate = isEditing ? editValues.rate : r.rate;
                const itemTotal = qty * rate;
                const itemCogs = qty * (r.unitCost || 0);
                const itemMargin = itemTotal > 0 ? ((itemTotal - itemCogs) / itemTotal) * 100 : 0;
                return (
                  <div style={{ textAlign: 'right', fontWeight: 600, color: itemMargin >= 20 ? '#059669' : (itemMargin > 0 ? '#d97706' : '#dc2626') }}>
                    {itemMargin.toFixed(1)}%
                  </div>
                );
              }
            },
            {
              key: 'total',
              header: <div style={{ textAlign: 'right' }}>Total</div>,
              render: (r) => {
                const isEditing = editingRow === r._idx;
                const qty = isEditing ? editValues.quantity : r.quantity;
                const rate = isEditing ? editValues.rate : r.rate;
                const itemTotal = qty * rate;
                return (
                  <div style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {fmtCurrency(itemTotal)}
                  </div>
                );
              }
            },
            ...(!readOnly ? [{
              key: 'actions',
              header: 'Actions',
              render: (r) => {
                const isEditing = editingRow === r._idx;
                return (
                  <div style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
                    {isEditing ? (
                      <AppActionGroup actions={[{ type: 'custom', icon: Check, label: 'Save', onClick: () => saveEdit(r._idx), color: '#059669' }]} />
                    ) : (
                      <AppActionGroup actions={[{ type: 'edit', onClick: () => startEdit(r._idx, r) }]} />
                    )}
                  </div>
                );
              }
            }] : [])
          ]}
        />
      </div>
    </div>
  );
}

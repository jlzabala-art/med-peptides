import React, { useState } from 'react';
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import Check from "lucide-react/dist/esm/icons/check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

export default function ProductGrid({ items = [], readOnly = false, onUpdateItem }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});

  const toggleRow = (idx) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedRows(newSet);
  };

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
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ width: '32px' }}></th>
              <th style={{ textAlign: 'left', padding: '0.5rem 1rem', fontWeight: 600 }}>Item</th>
              <th style={{ textAlign: 'center', padding: '0.5rem 1rem', fontWeight: 600 }}>Stock</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 1rem', fontWeight: 600 }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 1rem', fontWeight: 600 }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 1rem', fontWeight: 600 }}>Margin</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 1rem', fontWeight: 600 }}>Total</th>
              {!readOnly && <th style={{ width: '40px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const isEditing = editingRow === i;
              const isExpanded = expandedRows.has(i);
              
              const qty = isEditing ? editValues.quantity : item.quantity;
              const rate = isEditing ? editValues.rate : item.rate;
              
              const itemTotal = qty * rate;
              const itemCogs = qty * (item.unitCost || 0);
              const itemMargin = itemTotal > 0 ? ((itemTotal - itemCogs) / itemTotal) * 100 : 0;

              const stockWarning = item.stock < qty;

              return (
                <React.Fragment key={i}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: isExpanded ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button onClick={() => toggleRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td style={{ padding: '0.5rem 1rem', fontWeight: 600, color: '#0f172a' }}>{item.name || item.itemName}</td>
                    
                    <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                      {stockWarning ? (
                        <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <AlertTriangle size={12} /> {item.stock || 0}
                        </span>
                      ) : (
                        <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>{item.stock || '10+'}</span>
                      )}
                    </td>

                    <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: '#475569' }}>
                      {isEditing ? (
                        <input type="number" value={editValues.quantity} onChange={e => setEditValues({...editValues, quantity: Number(e.target.value)})} style={{ width: '60px', padding: '0.25rem', textAlign: 'right', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      ) : (
                        <span onClick={() => startEdit(i, item)} style={{ cursor: readOnly ? 'default' : 'pointer', borderBottom: readOnly ? 'none' : '1px dashed #cbd5e1' }}>{qty} {item.unit || 'ea'}</span>
                      )}
                    </td>

                    <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: '#475569' }}>
                      {isEditing ? (
                        <input type="number" value={editValues.rate} onChange={e => setEditValues({...editValues, rate: Number(e.target.value)})} style={{ width: '80px', padding: '0.25rem', textAlign: 'right', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      ) : (
                        <span onClick={() => startEdit(i, item)} style={{ cursor: readOnly ? 'default' : 'pointer', borderBottom: readOnly ? 'none' : '1px dashed #cbd5e1' }}>{fmtCurrency(rate)}</span>
                      )}
                    </td>

                    <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 600, color: itemMargin >= 20 ? '#059669' : (itemMargin > 0 ? '#d97706' : '#dc2626') }}>
                      {itemMargin.toFixed(1)}%
                    </td>

                    <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {fmtCurrency(itemTotal)}
                    </td>

                    {!readOnly && (
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {isEditing ? (
                          <button onClick={() => saveEdit(i)} style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={14} /></button>
                        ) : (
                          <button onClick={() => startEdit(i, item)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={14} /></button>
                        )}
                      </td>
                    )}
                  </tr>

                  {isExpanded && (
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td colSpan={readOnly ? 7 : 8} style={{ padding: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Identifiers</div>
                            <div>Variant ID: <span style={{ fontFamily: 'monospace' }}>{item.variantId || 'N/A'}</span></div>
                            <div>Product ID: <span style={{ fontFamily: 'monospace' }}>{item.productId || 'N/A'}</span></div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Supplier Specs</div>
                            <div>Supplier ID: <span style={{ fontFamily: 'monospace' }}>{item.supplierId || 'N/A'}</span></div>
                            <div>Lead Time: {item.leadTime || 'Standard 3-5 days'}</div>
                            <div>Cold Chain: {item.coldChain ? 'Yes ❄️' : 'No'}</div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Cost Breakdown</div>
                            <div>Unit Cost: {fmtCurrency(item.unitCost || 0)}</div>
                            <div>Total COGS: {fmtCurrency(itemCogs)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

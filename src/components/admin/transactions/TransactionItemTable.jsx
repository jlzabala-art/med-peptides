import React from 'react';
import { Trash2, Box, Info } from '@/lib/icons';
import DataTable from '../../ui/DataTable';

export default function TransactionItemTable({ items, onItemsChange, transactionType }) {
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const qty = newItems[index].quantity || 0;
      const rate = newItems[index].rate || 0;
      newItems[index].amount = qty * rate;
    }
    onItemsChange(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onItemsChange(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div style={{ marginTop: '2rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Item Table</h3>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Item Details',
              render: (val, row, idx) => (
                <div style={{ display: 'inline-flex', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {row.images?.[0] ? (
                      <img src={row.images[0]} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box size={16} color="#94a3b8" />
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 500 }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {row.sku || '-'}</div>
                    <textarea
                      value={row.description || ''}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Add a description..."
                      style={{ marginTop: '4px', width: '100%', padding: '6px', fontSize: '0.8rem', border: '1px solid transparent', borderRadius: '4px', resize: 'vertical', minHeight: '40px', backgroundColor: '#f8fafc' }}
                      onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#cbd5e1'; }}
                      onBlur={(e) => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = 'transparent'; }}
                    />
                  </div>
                </div>
              )
            },
            {
              key: 'quantity',
              header: 'Quantity',
              render: (val, row, idx) => (
                <div style={{ textAlign: 'right' }}>
                  <input
                    type="number"
                    min="1"
                    value={val || 1}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    style={{ width: '80px', textAlign: 'right', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                  />
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    Stock: <strong style={{ color: row.stock > 0 ? '#10b981' : '#ef4444' }}>{row.stock || 0}</strong>
                    <Info size={12} color="#94a3b8" />
                  </div>
                </div>
              )
            },
            {
              key: 'rate',
              header: 'Rate',
              render: (val, row, idx) => (
                <div style={{ textAlign: 'right' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={val || 0}
                    onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                    style={{ width: '100px', textAlign: 'right', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                  />
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#3b82f6', cursor: 'pointer' }}>Apply Price List ⌄</div>
                </div>
              )
            },
            {
              key: 'amount',
              header: 'Amount',
              render: (val) => <span style={{ display: 'block', textAlign: 'right', fontWeight: 600 }}>${(val || 0).toFixed(2)}</span>
            },
            {
              key: 'id',
              header: '',
              render: (val, row, idx) => (
                <button
                  onClick={() => handleRemoveItem(idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              )
            }
          ]}
          data={items}
          keyField={(row, idx) => row.id || idx.toString()}
          emptyMessage="No items added yet."
        />
      </div>

      {/* Footer / Totals */}
      <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
            <span>Sub Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

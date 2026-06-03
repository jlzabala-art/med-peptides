import React, { useState } from 'react';

export default function StockImportTable({ data, onConfirmBatch }) {
  // data: { matched: number, unmatched: number, comparison: Array<{ id, name, fileStock, dbStock, ... }> }
  const [selectedItems, setSelectedItems] = useState(new Set());

  if (!data || !data.comparison) return null;

  const toggleSelect = (id) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const selectAll = () => {
    if (selectedItems.size === data.comparison.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.comparison.map(item => item.id)));
    }
  };

  const handleApply = () => {
    const updates = [];
    selectedItems.forEach(id => {
      const item = data.comparison.find(i => i.id === id);
      if (item && item.matched) {
        updates.push({
          product_id: item.id,
          new_stock: item.fileStock
        });
      }
    });

    if (updates.length > 0 && onConfirmBatch) {
      onConfirmBatch(updates);
    }
  };

  return (
    <div style={{ margin: '1rem 0', borderRadius: '0.75rem', border: '1px solid var(--rp-theme-border)', backgroundColor: 'var(--rp-theme-surface)', overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div style={{ backgroundColor: 'var(--rp-theme-surface-hover)', padding: '0.75rem', borderBottom: '1px solid var(--rp-theme-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--rp-theme-text)', margin: 0 }}>Stock Import Analysis</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--rp-theme-text-muted)', margin: '0.25rem 0 0 0' }}>
            {data.matched} matched, {data.unmatched} unmatched products found.
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '0.875rem', whiteSpace: 'nowrap', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--rp-theme-surface)', position: 'sticky', top: 0, borderBottom: '1px solid var(--rp-theme-border)' }}>
            <tr>
              <th style={{ padding: '0.5rem', width: '2.5rem', textAlign: 'center', borderBottom: '1px solid var(--rp-theme-border)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedItems.size === data.comparison.length && data.comparison.length > 0}
                  onChange={selectAll}
                />
              </th>
              <th style={{ padding: '0.5rem', color: 'var(--rp-theme-text-muted)', fontWeight: '500', borderBottom: '1px solid var(--rp-theme-border)' }}>Status</th>
              <th style={{ padding: '0.5rem', color: 'var(--rp-theme-text-muted)', fontWeight: '500', borderBottom: '1px solid var(--rp-theme-border)' }}>Product</th>
              <th style={{ padding: '0.5rem', color: 'var(--rp-theme-text-muted)', fontWeight: '500', textAlign: 'right', borderBottom: '1px solid var(--rp-theme-border)' }}>File Stock</th>
              <th style={{ padding: '0.5rem', color: 'var(--rp-theme-text-muted)', fontWeight: '500', textAlign: 'right', borderBottom: '1px solid var(--rp-theme-border)' }}>Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.comparison.map((item, idx) => {
              const diff = item.matched && item.dbStock !== undefined ? item.fileStock - item.dbStock : 0;
              const isSelected = selectedItems.has(item.id);
              
              return (
                <tr 
                  key={item.id || idx} 
                  style={{ backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.05)' : 'var(--rp-theme-surface)', transition: 'background-color 0.2s', cursor: 'pointer', borderBottom: '1px solid var(--rp-theme-border)' }}
                  onClick={() => item.matched && toggleSelect(item.id)}
                  onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = 'var(--rp-theme-surface-hover)' }}
                  onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = 'var(--rp-theme-surface)' }}
                >
                  <td style={{ padding: '0.5rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      disabled={!item.matched}
                      checked={isSelected}
                      onChange={() => item.matched && toggleSelect(item.id)}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {item.matched ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success, #10b981)', fontSize: '0.75rem', fontWeight: '500' }}>
                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Match
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-error, #f43f5e)', fontSize: '0.75rem', fontWeight: '500' }}>
                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Unmatched
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <div style={{ color: 'var(--rp-theme-text)', fontWeight: '500' }}>{item.name}</div>
                    {!item.matched && item.rawName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--rp-theme-text-muted)' }}>Raw: {item.rawName}</div>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '500', color: 'var(--color-warning, #f59e0b)' }}>
                    {item.fileStock !== undefined ? item.fileStock : '---'}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    {item.matched ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ color: 'var(--rp-theme-text)' }}>{item.dbStock !== undefined ? item.dbStock : '---'}</span>
                        {diff !== 0 && (
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: diff > 0 ? 'var(--color-success, #34d399)' : 'var(--color-error, #fb7185)' }}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--rp-theme-text-muted)' }}>---</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ backgroundColor: 'var(--rp-theme-surface-hover)', padding: '0.75rem', borderTop: '1px solid var(--rp-theme-border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleApply}
          disabled={selectedItems.size === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '600', borderRadius: '0.5rem', transition: 'background-color 0.2s', backgroundColor: 'var(--color-warning, #f59e0b)', color: 'black', cursor: selectedItems.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedItems.size === 0 ? 0.5 : 1, border: 'none' }}
        >
          <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Update {selectedItems.size} Stock Item{selectedItems.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

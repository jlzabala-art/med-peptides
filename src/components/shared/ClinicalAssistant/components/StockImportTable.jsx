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
    <div className="my-4 rounded-xl border border-[var(--rp-theme-border)] bg-[var(--rp-theme-surface)] overflow-hidden shadow-sm">
      <div className="bg-[var(--rp-theme-surface-hover)] p-3 border-b border-[var(--rp-theme-border)] flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[var(--rp-theme-text)]">Stock Import Analysis</h4>
          <p className="text-xs text-[var(--rp-theme-text-muted)]">
            {data.matched} matched, {data.unmatched} unmatched products found.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[var(--rp-theme-surface)] sticky top-0 border-b border-[var(--rp-theme-border)]">
            <tr>
              <th className="p-2 w-10 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedItems.size === data.comparison.length && data.comparison.length > 0}
                  onChange={selectAll}
                />
              </th>
              <th className="p-2 text-[var(--rp-theme-text-muted)] font-medium">Status</th>
              <th className="p-2 text-[var(--rp-theme-text-muted)] font-medium">Product</th>
              <th className="p-2 text-[var(--rp-theme-text-muted)] font-medium text-right">File Stock</th>
              <th className="p-2 text-[var(--rp-theme-text-muted)] font-medium text-right">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rp-theme-border)]">
            {data.comparison.map((item, idx) => {
              const diff = item.matched && item.dbStock !== undefined ? item.fileStock - item.dbStock : 0;
              const isSelected = selectedItems.has(item.id);
              
              return (
                <tr 
                  key={item.id || idx} 
                  className={`hover:bg-[var(--rp-theme-surface-hover)] transition-colors cursor-pointer ${isSelected ? 'bg-amber-500/5' : ''}`}
                  onClick={() => item.matched && toggleSelect(item.id)}
                >
                  <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      disabled={!item.matched}
                      checked={isSelected}
                      onChange={() => item.matched && toggleSelect(item.id)}
                    />
                  </td>
                  <td className="p-2">
                    {item.matched ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Match
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Unmatched
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="text-[var(--rp-theme-text)] font-medium">{item.name}</div>
                    {!item.matched && item.rawName && (
                      <div className="text-xs text-[var(--rp-theme-text-muted)]">Raw: {item.rawName}</div>
                    )}
                  </td>
                  <td className="p-2 text-right font-medium text-amber-500">
                    {item.fileStock !== undefined ? item.fileStock : '---'}
                  </td>
                  <td className="p-2 text-right">
                    {item.matched ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[var(--rp-theme-text)]">{item.dbStock !== undefined ? item.dbStock : '---'}</span>
                        {diff !== 0 && (
                          <span className={`text-[10px] font-bold ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--rp-theme-text-muted)]">---</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-[var(--rp-theme-surface-hover)] p-3 border-t border-[var(--rp-theme-border)] flex justify-end">
        <button
          onClick={handleApply}
          disabled={selectedItems.size === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Update {selectedItems.size} Stock Item{selectedItems.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

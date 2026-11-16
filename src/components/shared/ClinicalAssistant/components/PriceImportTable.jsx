"use client";

import React, { useState } from 'react';
import DataTable from '@/components/ui/DataTable';

export default function PriceImportTable({ data, onConfirmBatch }) {
  // data: { matched: number, unmatched: number, comparison: Array<{ id, name, filePrice, dbPrice, ... }> }
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [targetTier, setTargetTier] = useState('retail'); // 'retail', 'wholesale', 'clinic', 'master'

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
          tier: targetTier,
          new_price: item.filePrice
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
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--rp-theme-text)', margin: 0 }}>Price Import Analysis</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--rp-theme-text-muted)', margin: '0.25rem 0 0 0' }}>
            {data.matched} matched, {data.unmatched} unmatched products found.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            value={targetTier}
            onChange={(e) => setTargetTier(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.25rem', borderRadius: '0.25rem', backgroundColor: 'var(--rp-theme-background)', border: '1px solid var(--rp-theme-border)', color: 'var(--rp-theme-text)' }}
          >
            <option value="retail">Retail Tier</option>
            <option value="wholesale">Wholesale Tier</option>
            <option value="clinic">Clinic Tier</option>
            <option value="master">Master Tier</option>
          </select>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <DataTable
          columns={[
            {
              key: 'select',
              header: (
                <input
                  type="checkbox"
                  checked={selectedItems.size === data.comparison.length && data.comparison.length > 0}
                  onChange={selectAll}
                />
              ),
              width: '8%',
              align: 'center',
              render: (_, item) => (
                <input
                  type="checkbox"
                  disabled={!item.matched}
                  checked={selectedItems.has(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (item.matched) toggleSelect(item.id);
                  }}
                />
              ),
            },
            {
              key: 'matched',
              header: 'Status',
              width: '16%',
              render: (matched) =>
                matched ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success, #10b981)', fontSize: '0.75rem', fontWeight: 500 }}>
                    Match
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-error, #f43f5e)', fontSize: '0.75rem', fontWeight: 500 }}>
                    Unmatched
                  </span>
                ),
            },
            {
              key: 'name',
              header: 'Product',
              width: '36%',
              render: (_, item) => (
                <div>
                  <div style={{ color: 'var(--rp-theme-text)', fontWeight: 500 }}>{item.name}</div>
                  {!item.matched && item.rawName && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--rp-theme-text-muted)' }}>Raw: {item.rawName}</div>
                  )}
                </div>
              ),
            },
            {
              key: 'filePrice',
              header: 'File Price',
              align: 'right',
              width: '20%',
              render: (val) => (
                <span className="atlas-num" style={{ fontWeight: 500, color: 'var(--color-primary, #60a5fa)' }}>
                  ${val?.toFixed(2) || '---'}
                </span>
              ),
            },
            {
              key: 'dbPrice',
              header: `DB Price (${targetTier})`,
              align: 'right',
              width: '20%',
              render: (_, item) => {
                const diff = item.matched && item.dbPrice ? ((item.filePrice - item.dbPrice) / item.dbPrice) * 100 : 0;
                return item.matched ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className="atlas-num" style={{ color: 'var(--rp-theme-text)' }}>${item.dbPrice?.toFixed(2) || '---'}</span>
                    {Math.abs(diff) > 0.1 && (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: diff > 0 ? 'var(--color-error, #fb7185)' : 'var(--color-success, #34d399)' }}>
                        {diff > 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ color: 'var(--rp-theme-text-muted)' }}>---</span>
                );
              },
            },
          ]}
          data={data.comparison.map((item, idx) => ({ ...item, id: item.id || `pi-${idx}` }))}
          onRowClick={(item) => item.matched && toggleSelect(item.id)}
          pagination={false}
          enableAskAtlas={false}
        />
      </div>

      <div style={{ backgroundColor: 'var(--rp-theme-surface-hover)', padding: '0.75rem', borderTop: '1px solid var(--rp-theme-border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleApply}
          disabled={selectedItems.size === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '600', borderRadius: '0.5rem', transition: 'background-color 0.2s', backgroundColor: 'var(--color-warning, #f59e0b)', color: 'black', cursor: selectedItems.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedItems.size === 0 ? 0.5 : 1, border: 'none' }}
        >
          <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Update {selectedItems.size} Price{selectedItems.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useMemo } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import DataTable from '@/components/ui/DataTable';
import { applyMarkupToCost, applyMarginToCost } from '@/hooks/admin/useDocumentGeneratorState';
import { Search, RotateCcw, Check, X, Edit2 } from 'lucide-react';

export default function VariantPriceEditorModal({
  isOpen,
  onClose,
  variantRows = [],
  onSetOverride,
  onClearAllOverrides,
  isMobile,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMissingOnly, setFilterMissingOnly] = useState(false);
  const [bulkMarkupPct, setBulkMarkupPct] = useState(40);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState('sell'); // 'sell' | 'markup' | 'margin'
  const [editingVal, setEditingVal] = useState('');

  // Filtered rows
  const filteredRows = useMemo(() => {
    return variantRows.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        r.productName.toLowerCase().includes(q) ||
        r.dosage.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q);
      
      const matchesFilter = !filterMissingOnly || r.sell == null || r.sell === 0;
      return matchesSearch && matchesFilter;
    });
  }, [variantRows, searchQuery, filterMissingOnly]);

  const handleStartEdit = (row, field) => {
    setEditingId(row.id);
    setEditingField(field);
    if (field === 'sell') setEditingVal(row.sell != null ? String(row.sell) : String(row.cost || ''));
    if (field === 'markup') setEditingVal(row.markup != null ? String(row.markup.toFixed(1)) : '40');
    if (field === 'margin') setEditingVal(row.margin != null ? String(row.margin.toFixed(1)) : '30');
  };

  const handleSaveEdit = React.useCallback((row) => {
    if (!editingId) return;
    const num = parseFloat(editingVal);
    if (isNaN(num)) {
      setEditingId(null);
      return;
    }

    if (editingField === 'sell') {
      onSetOverride(row.id, num);
    } else if (editingField === 'markup' && row.cost != null) {
      const newSell = applyMarkupToCost(row.cost, num);
      onSetOverride(row.id, newSell);
    } else if (editingField === 'margin' && row.cost != null) {
      const newSell = applyMarginToCost(row.cost, num);
      onSetOverride(row.id, newSell);
    }
    setEditingId(null);
  }, [editingId, editingVal, editingField, onSetOverride]);

  const handleCancelEdit = React.useCallback(() => {
    setEditingId(null);
    setEditingVal('');
  }, []);

  const handleApplyBulkMarkup = (scope = 'unpriced') => {
    filteredRows.forEach(r => {
      const isUnpriced = r.sell == null || (r.cost != null && Math.abs(r.sell - r.cost) < 0.001);
      if ((scope === 'all' || isUnpriced) && r.cost != null && r.cost > 0) {
        const newSell = applyMarkupToCost(r.cost, bulkMarkupPct);
        onSetOverride(r.id, newSell);
      }
    });
  };

  // DataTable columns definition for desktop view
  const columns = useMemo(() => [
    {
      key: 'productName',
      label: 'Product & Dosage',
      width: '32%',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.productName}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.dosage} · {row.format}</div>
        </div>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      width: '18%',
      render: (v) => <span style={{ color: '#475569' }}>{v}</span>,
    },
    {
      key: 'cost',
      label: 'Cost (USD)',
      width: '14%',
      align: 'right',
      render: (v) => <span style={{ color: '#334155', fontWeight: 500 }}>{v != null ? `$${v.toFixed(2)}` : '—'}</span>,
    },
    {
      key: 'sell',
      label: 'Sell Price',
      width: '16%',
      align: 'right',
      render: (v, row) => {
        const isEditing = editingId === row.id && editingField === 'sell';
        if (isEditing) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
              <input
                autoFocus
                type="number"
                value={editingVal}
                onChange={e => setEditingVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(row); if (e.key === 'Escape') handleCancelEdit(); }}
                style={{ width: 62, padding: '2px 4px', fontSize: '0.78rem', textAlign: 'right', border: '1px solid #003666', borderRadius: 4 }}
              />
              <button onClick={() => handleSaveEdit(row)} style={{ border: 'none', background: 'none', color: '#16a34a', cursor: 'pointer', padding: 0 }}><Check size={13} /></button>
              <button onClick={handleCancelEdit} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}><X size={13} /></button>
            </div>
          );
        }
        return (
          <div
            onClick={() => handleStartEdit(row, 'sell')}
            style={{ cursor: 'pointer', fontWeight: 700, color: v != null ? '#16a34a' : '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            title="Click to edit selling price"
          >
            <span>{v != null ? `$${v.toFixed(2)}` : 'No price'}</span>
            <Edit2 size={11} color="#94a3b8" />
          </div>
        );
      },
    },
    {
      key: 'markup',
      label: 'Mark-up',
      width: '10%',
      align: 'right',
      render: (v) => (
        <span style={{ color: v != null ? (v >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8', fontWeight: 600 }}>
          {v != null ? `+${v.toFixed(1)}%` : '—'}
        </span>
      ),
    },
    {
      key: 'margin',
      label: 'Margin',
      width: '10%',
      align: 'right',
      render: (v) => (
        <span style={{ color: v != null ? (v >= 20 ? '#0284c7' : '#d97706') : '#94a3b8', fontWeight: 600 }}>
          {v != null ? `${v.toFixed(1)}%` : '—'}
        </span>
      ),
    },
  ], [editingId, editingField, editingVal, handleSaveEdit, handleCancelEdit]);

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      width={isMobile ? '100%' : '780px'}
      title="Individual Price & Margin Editor"
      subtitle="Adjust selling prices for this export. Changes are ephemeral and do not overwrite Firestore master pricing."
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            type="button"
            onClick={onClearAllOverrides}
            style={{
              padding: '8px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 7,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#dc2626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <RotateCcw size={13} /> Reset to Catalog Prices
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              background: '#003666',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Bulk Applicator Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 12px',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>⚡ Quick Mark-up:</span>
            <input
              type="number"
              value={bulkMarkupPct}
              onChange={e => setBulkMarkupPct(parseFloat(e.target.value) || 0)}
              style={{ width: 48, padding: '3px 6px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, border: '1px solid #cbd5e1', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>%</span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => handleApplyBulkMarkup('unpriced')}
              style={{ padding: '5px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Apply to unpriced
            </button>
            <button
              type="button"
              onClick={() => handleApplyBulkMarkup('all')}
              style={{ padding: '5px 10px', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Apply to all
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by product, dosage or supplier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: 7,
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={filterMissingOnly}
              onChange={e => setFilterMissingOnly(e.target.checked)}
              style={{ accentColor: '#003666' }}
            />
            <span>Missing price only</span>
          </label>
        </div>

        {/* Body: Mobile Cards vs Desktop DataTable */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredRows.map(row => {
              const isEditing = editingId === row.id;
              return (
                <div
                  key={row.id}
                  style={{
                    border: `1px solid ${row.isOverridden ? '#fde68a' : '#e2e8f0'}`,
                    background: row.isOverridden ? '#fefce8' : '#ffffff',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{row.productName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{row.dosage} · {row.format}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {row.supplier}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', padding: '6px 8px', borderRadius: 6, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Cost (USD)</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                        {row.cost != null ? `$${row.cost.toFixed(2)}` : '—'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Selling Price</div>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <input
                            autoFocus
                            type="number"
                            value={editingVal}
                            onChange={e => setEditingVal(e.target.value)}
                            style={{ width: 60, padding: '2px 4px', fontSize: '0.8rem', border: '1px solid #003666', borderRadius: 4 }}
                          />
                          <button onClick={() => handleSaveEdit(row)} style={{ border: 'none', background: 'none', color: '#16a34a', cursor: 'pointer', padding: 0 }}><Check size={14} /></button>
                          <button onClick={handleCancelEdit} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEdit(row, 'sell')}
                          style={{ fontSize: '0.84rem', fontWeight: 700, color: row.sell != null ? '#16a34a' : '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <span>{row.sell != null ? `$${row.sell.toFixed(2)}` : 'No price'}</span>
                          <Edit2 size={11} color="#94a3b8" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                    <span>Mark-up: <strong style={{ color: row.markup != null ? (row.markup >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8' }}>{row.markup != null ? `+${row.markup.toFixed(1)}%` : '—'}</strong></span>
                    <span>Margin: <strong style={{ color: row.margin != null ? (row.margin >= 20 ? '#0284c7' : '#d97706') : '#94a3b8' }}>{row.margin != null ? `${row.margin.toFixed(1)}%` : '—'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <DataTable
            data={filteredRows}
            columns={columns}
            rowKey="id"
            showPagination={filteredRows.length > 20}
            pageSize={20}
          />
        )}
      </div>
    </StandardDrawer>
  );
}

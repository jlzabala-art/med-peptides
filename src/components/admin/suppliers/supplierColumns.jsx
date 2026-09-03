import React, { useState, useRef, useEffect } from 'react';
import StatusBadge from '../../ui/StatusBadge';
import { CopyableId, AppActionGroup } from '../../ui';
import InlineEditableCell from '../../ui/InlineEditableCell';
import Package from 'lucide-react/dist/esm/icons/package';
import Layers from 'lucide-react/dist/esm/icons/layers';
import { Check, X, Edit2, Sparkles } from 'lucide-react';
import { openSupplierAI } from '../../../utils/openModuleAI';

/**
 * CategoryPills — inline display + multi-select editor for supplier categoryIds[].
 * Shows category labels as colored pills. Clicking opens a checklist dropdown.
 */
function CategoryPills({ categoryIds = [], allCategories = [], onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState([...categoryIds]);
  const [isSaving, setIsSaving] = useState(false);
  const wrapRef = useRef(null);

  // Sync when prop changes externally
  useEffect(() => {
    if (!isEditing) setSelected([...categoryIds]);
  }, [categoryIds, isEditing]);

  // Close on outside click
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        // auto-save on blur
        handleSave();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditing, selected]);

  const handleSave = async () => {
    if (arraysEqual(selected, categoryIds)) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(selected);
      setIsEditing(false);
    } catch (err) {
      console.error('CategoryPills save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCat = (catId) => {
    setSelected(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };

  // Pill color palette — cycles through a set of muted accent colors
  const pillColors = [
    { bg: '#eff6ff', fg: '#2563eb' },
    { bg: '#f0fdf4', fg: '#16a34a' },
    { bg: '#fdf4ff', fg: '#a855f7' },
    { bg: '#fffbeb', fg: '#d97706' },
    { bg: '#fef2f2', fg: '#dc2626' },
    { bg: '#f0fdfa', fg: '#0d9488' },
    { bg: '#faf5ff', fg: '#7c3aed' },
  ];

  const getCatLabel = (catId) => {
    const cat = allCategories.find(c => c.id === catId);
    return cat ? (cat.labelEn || cat.label || catId) : catId.replace(/_/g, ' ');
  };

  const getCatIcon = (catId) => {
    const cat = allCategories.find(c => c.id === catId);
    return cat?.icon || '';
  };

  if (isEditing) {
    return (
      <div ref={wrapRef} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        {/* Dropdown checklist */}
        <div style={{
          position: 'absolute', top: 0, left: 0, zIndex: 50,
          background: 'var(--surface-raised, #fff)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: '0.4rem 0',
          minWidth: '220px',
          maxHeight: '260px',
          overflowY: 'auto',
        }}>
          {allCategories.map(cat => {
            const isChecked = selected.includes(cat.id);
            return (
              <label key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: 'var(--text-main)',
                transition: 'background 0.15s',
                background: isChecked ? 'var(--primary-light, #eff6ff)' : 'transparent',
              }}
                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.background = 'var(--surface-hover, #f8fafc)'; }}
                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.background = 'transparent'; else e.currentTarget.style.background = 'var(--primary-light, #eff6ff)'; }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCat(cat.id)}
                  style={{ width: '14px', height: '14px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span>{cat.icon || ''} {cat.labelEn || cat.label}</span>
              </label>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', padding: '0.35rem 0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.25rem' }}>
            {isSaving ? (
              <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
            ) : (
              <>
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
                  style={{ background: 'none', border: 'none', padding: '2px 6px', cursor: 'pointer', color: 'var(--color-success, #16a34a)', display: 'flex', alignItems: 'center', fontSize: '0.72rem', fontWeight: 700, gap: '3px' }}
                  title="Save"
                >
                  <Check size={12} strokeWidth={3} /> Save
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); setSelected([...categoryIds]); setIsEditing(false); }}
                  style={{ background: 'none', border: 'none', padding: '2px 6px', cursor: 'pointer', color: 'var(--color-danger, #dc2626)', display: 'flex', alignItems: 'center', fontSize: '0.72rem', fontWeight: 700, gap: '3px' }}
                  title="Cancel"
                >
                  <X size={12} strokeWidth={3} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View mode — pills
  const displayIds = categoryIds.length > 0 ? categoryIds : [];
  return (
    <div
      className="inline-editable-trigger"
      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', cursor: 'pointer', padding: '2px 0' }}
      title="Click to edit categories"
      onMouseEnter={(e) => { const icon = e.currentTarget.querySelector('.cat-edit-icon'); if (icon) icon.style.opacity = '1'; }}
      onMouseLeave={(e) => { const icon = e.currentTarget.querySelector('.cat-edit-icon'); if (icon) icon.style.opacity = '0.5'; }}
    >
      {displayIds.length === 0 ? (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.6 }}>No categories</span>
      ) : (
        displayIds.slice(0, 3).map((catId, idx) => {
          const color = pillColors[idx % pillColors.length];
          return (
            <span key={catId} style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              padding: '1px 8px', borderRadius: '10px',
              fontSize: '0.68rem', fontWeight: 600,
              background: color.bg, color: color.fg,
              lineHeight: '1.6', whiteSpace: 'nowrap',
            }}>
              {getCatIcon(catId)} {getCatLabel(catId)}
            </span>
          );
        })
      )}
      {displayIds.length > 3 && (
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', padding: '1px 4px' }}>+{displayIds.length - 3}</span>
      )}
      <span className="cat-edit-icon" style={{ opacity: 0.5, transition: 'opacity 0.2s', color: 'var(--primary)', flexShrink: 0, marginLeft: '2px' }}>
        <Edit2 size={11} />
      </span>
    </div>
  );
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sorted1 = [...a].sort();
  const sorted2 = [...b].sort();
  return sorted1.every((v, i) => v === sorted2[i]);
}

export const getSupplierColumns = ({
  sortConfig,
  setSortConfig,
  onAction,
  onUpdateField,
  supplierOptions = [],
  allCategories = [],
}) => {
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  return [
    {
      key: 'companyName',
      width: '28%',
      header: (
        <span onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
          Supplier {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
        </span>
      ),
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InlineEditableCell
            value={row.name || row.companyName || row.displayName || ''}
            type="text"
            onSave={(val) => {
              if (!val || val.trim() === '') return;
              // Write all three aliases so rename cascade fires in handleUpdate
              onUpdateField(row.id, 'name',        val.trim());
              onUpdateField(row.id, 'companyName', val.trim());
              onUpdateField(row.id, 'displayName', val.trim());
            }}
            placeholder="Supplier name"
            style={{ fontWeight: 700 }}
          />
          <CopyableId value={row.id} iconOnly={true} />
        </div>
      ),
    },

    {
      key: 'country',
      width: '13%',
      header: (
        <span onClick={() => handleSort('country')} style={{ cursor: 'pointer' }}>
          Country {sortConfig.key === 'country' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
        </span>
      ),
      render: (row) => (
        <InlineEditableCell
          value={row.country || ''}
          onSave={(val) => onUpdateField(row.id, 'country', val)}
          placeholder="N/A"
        />
      ),
    },

    {
      key: 'categoryIds',
      width: '18%',
      header: 'Categories',
      render: (row) => (
        <CategoryPills
          categoryIds={row.categoryIds || (row.categoryId ? [row.categoryId] : [])}
          allCategories={allCategories}
          onSave={(newIds) => onUpdateField(row.id, 'categoryIds', newIds)}
        />
      ),
    },

    {
      key: 'status',
      width: '18%',
      header: <span>Status</span>,
      render: (row) => (
        <div style={{ display: 'inline-flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>B2B</span>
            <InlineEditableCell
              value={row.statusB2B || 'active'}
              type="select"
              options={[
                { label: 'Active',   value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending',  value: 'pending' },
              ]}
              onSave={(val) => onUpdateField(row.id, 'statusB2B', val)}
              format={(val) => <StatusBadge status={val} />}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>B2C</span>
            <InlineEditableCell
              value={row.statusB2C || 'inactive'}
              type="select"
              options={[
                { label: 'Active',   value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending',  value: 'pending' },
              ]}
              onSave={(val) => onUpdateField(row.id, 'statusB2C', val)}
              format={(val) => <StatusBadge status={val} />}
            />
          </div>
        </div>
      ),
    },

    {
      key: 'variantsSupplied',
      width: '13%',
      header: (
        <span onClick={() => handleSort('variantsSupplied')} style={{ cursor: 'pointer' }}>
          Items {sortConfig.key === 'variantsSupplied' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
        </span>
      ),
      render: (row) => {
        // Phase 7: variants is the atomic unit — show as primary metric
        const variants  = row.variantsSupplied  ?? row.analytics?.totalVariants  ?? null;
        const products  = row.productsSupplied  ?? row.analytics?.totalProducts  ?? 0;

        return (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); onAction?.('view-catalog', row); }}
            title="Click to view catalog"
          >
            {/* Variants — PRIMARY (bold, linked) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{
                fontWeight: 700,
                color: (variants ?? 0) > 0 ? 'var(--primary)' : 'var(--text-muted)',
                textDecoration: (variants ?? 0) > 0 ? 'underline' : 'none',
                fontSize: '0.85rem',
              }}>
                {variants ?? '—'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vars</span>
            </div>

            {/* Products — SECONDARY (muted, smaller) */}
            {products > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Package size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {products}
                </span>
                <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>SKUs</span>
              </div>
            )}
          </div>
        );
      },
    },

    {
      key: 'actions',
      width: '160px',
      header: 'Actions',
      render: (supplier) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', gap: '8px' }}>
          {/* AI Procurement Review */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openSupplierAI({
                id: supplier.id,
                name: supplier.name || supplier.companyName || supplier.displayName,
                country: supplier.country,
                statusB2B: supplier.statusB2B,
                statusB2C: supplier.statusB2C,
                variantsSupplied: supplier.variantsSupplied ?? supplier.analytics?.totalVariants,
                productsSupplied: supplier.productsSupplied ?? supplier.analytics?.totalProducts,
                categoryIds: supplier.categoryIds,
                leadTime: supplier.leadTime,
                minOrder: supplier.minOrder,
                certifications: supplier.certifications,
                rfqCount: supplier.rfqCount ?? supplier.analytics?.rfqCount,
                orderCount: supplier.orderCount ?? supplier.analytics?.orderCount,
                totalSpend: supplier.totalSpend ?? supplier.analytics?.totalSpend,
                reliabilityScore: supplier.reliabilityScore,
              });
            }}
            style={{
              background: 'rgba(124, 58, 237, 0.07)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#7c3aed',
              fontSize: '0.72rem',
              fontWeight: 700,
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.07)'; }}
            title="AI Procurement Intelligence"
          >
            <Sparkles size={13} />
            AI
          </button>
          <AppActionGroup
            actions={[
              {
                label: 'View Catalog',
                type: 'inventory',
                onClick: (e) => { e.stopPropagation(); onAction?.('view-catalog', supplier); },
              },
              {
                label: 'View Details',
                type: 'edit',
                onClick: (e) => { e.stopPropagation(); onAction?.('edit', supplier); },
              },
              supplier.statusB2B === 'active'
                ? { label: 'Suspend B2B', type: 'pause',     danger: true, onClick: (e) => { e.stopPropagation(); onAction?.('suspend-b2b', supplier); } }
                : { label: 'Activate B2B', type: 'activate',               onClick: (e) => { e.stopPropagation(); onAction?.('activate-b2b', supplier); } },
              supplier.statusB2C === 'active'
                ? { label: 'Suspend B2C', type: 'pause',     danger: true, onClick: (e) => { e.stopPropagation(); onAction?.('suspend-b2c', supplier); } }
                : { label: 'Activate B2C', type: 'activate',               onClick: (e) => { e.stopPropagation(); onAction?.('activate-b2c', supplier); } },
            ]}
          />
        </div>
      ),
    },
  ];
};

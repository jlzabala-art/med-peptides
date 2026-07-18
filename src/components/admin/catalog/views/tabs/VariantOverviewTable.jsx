"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';

import { calculateVariantHealthScore } from '../../useVariantHealthScore';
import AppActionGroup from '../../../../ui/AppActionGroup';
import { Sparkles } from '@/lib/icons';
import DataTable from '../../../../ui/DataTable';

const badgeStyle = (isValid) => ({
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '0.7rem',
  backgroundColor:
    isValid === true || isValid === 'Valid' || isValid === 'Active'
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(148, 163, 184, 0.1)',
  color: isValid === true || isValid === 'Valid' || isValid === 'Active' ? '#10b981' : '#64748b',
});

export default function VariantOverviewTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const processedVariants = useMemo(() => {
    return variants.map((v) => {
      const health = calculateVariantHealthScore(v);
      const generateFallbackSku = () => {
        const prodName = parentProduct?.name || parentProduct?.displayName || 'UNK';
        const safeName = prodName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
        const format = (v.format || '').substring(0, 3).toUpperCase();
        const size = (v.size || v.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return ['SKU', safeName, format, size].filter(Boolean).join('-');
      };
      const displaySku = v.sku || generateFallbackSku();
      const supplierName = v.supplier || parentProduct?.supplier || 'Unassigned';
      const typeStr = v.formatLabel || v.format || v.productType || '';
      const dosageStr = v.dosage || v.size || '';
      const unitStr = v.kit?.unit || v.dosage_unit || '';
      let formatSize = '-';
      if (typeStr.toLowerCase().includes('api')) {
        formatSize = `API (Bulk)`;
      } else if (dosageStr) {
        const presentation = unitStr ? unitStr : (typeStr.toLowerCase().includes('lyophilized') ? 'Vial' : typeStr);
        formatSize = `${dosageStr} / ${presentation.charAt(0).toUpperCase() + presentation.slice(1)}`;
      } else {
        formatSize = typeStr || '-';
      }
      const inventory = typeof v.stock === 'object' ? v.stock?.available || 0 : v.stock || 0;
      const regStatus = v.registrationStatus || v.registration || 'Unregistered';
      return { ...v, displaySku, supplierName, formatSize, health, inventory, regStatus };
    });
  }, [variants, parentProduct]);

  const sortedVariants = useMemo(() => {
    let sortableItems = [...processedVariants];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = sortConfig.key === 'health' ? a.health.score : a[sortConfig.key];
        let valB = sortConfig.key === 'health' ? b.health.score : b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      sortableItems.sort((a, b) => {
        const isApiA = (a.productType || a.formatLabel || '').toLowerCase().includes('api');
        const isApiB = (b.productType || b.formatLabel || '').toLowerCase().includes('api');
        if (isApiA && !isApiB) return -1;
        if (!isApiA && isApiB) return 1;
        const getDosageNum = (v) => parseFloat((v.dosage || v.size || '0').toString().replace(/[^0-9.]/g, '')) || 0;
        return getDosageNum(a) - getDosageNum(b);
      });
    }
    return sortableItems;
  }, [processedVariants, sortConfig]);

  const allSelected = variants.length > 0 && variants.every(v => selectedIds.includes(v.id));

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const newIds = new Set([...selectedIds, ...variants.map(v => v.id)]);
      onSelectionChange(Array.from(newIds));
    } else {
      const variantIds = new Set(variants.map(v => v.id));
      onSelectionChange(selectedIds.filter(id => !variantIds.has(id)));
    }
  };

  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;
    if (checked) onSelectionChange([...selectedIds, id]);
    else onSelectionChange(selectedIds.filter(sid => sid !== id));
  };

  const columns = [
    ...(onSelectionChange ? [{
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          style={{ cursor: 'pointer' }}
        />
      ),
      render: (val, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer' }}
        />
      )
    }] : []),
    {
      key: 'displaySku',
      header: <span onClick={() => handleSort('displaySku')} style={{ cursor: 'pointer' }}>SKU{getSortIcon('displaySku')}</span>,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {row.image ? <img src={row.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Img</span>}
          </div>
          <span style={{ fontWeight: 500 }}>{val}</span>
        </div>
      )
    },
    {
      key: 'supplierName',
      header: <span onClick={() => handleSort('supplierName')} style={{ cursor: 'pointer' }}>Supplier{getSortIcon('supplierName')}</span>,
      render: (val, row) => (
        <span
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/wholesellers?search=${encodeURIComponent(val)}&openVariant=${row.id}`); }}
          style={{ cursor: 'pointer', color: 'var(--color-primary, #3b82f6)', fontWeight: 500 }}
          title="View Supplier Profile"
        >
          {val}
        </span>
      )
    },
    {
      key: 'formatSize',
      header: <span onClick={() => handleSort('formatSize')} style={{ cursor: 'pointer' }}>Dosage / Format{getSortIcon('formatSize')}</span>,
      render: (val) => <span>{val}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); if (onAction) onAction('ai_variant', parentProduct, row); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#6366f1', fontSize: '0.75rem', fontWeight: 600 }}
            title="Atlas AI"
          >
            <Sparkles size={12} /> Atlas
          </button>
          <AppActionGroup
            maxVisible={3}
            actions={[
              { type: 'clone', onClick: () => onAction && onAction('clone_variant', parentProduct, row) },
              { type: 'edit', onClick: () => onAction && onAction('edit_variant', parentProduct, row, 'overview') },
              { type: 'delete', onClick: () => onAction && onAction('delete_variant', parentProduct, row) },
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <div className="gcp-table-container">
      <DataTable
        columns={columns}
        data={sortedVariants}
        keyField={(row, idx) => row.id || idx.toString()}
        onRowClick={(row) => onAction && onAction('view_variant', parentProduct, row)}
        rowStyle={(row) => ({
          backgroundColor: selectedIds.includes(row.id) ? 'var(--color-bg-selected)' : 'transparent',
          borderLeft: selectedIds.includes(row.id) ? '4px solid #3b82f6' : '4px solid transparent',
          cursor: 'pointer',
        })}
        emptyMessage="No variants found."
      />
    </div>
  );
}

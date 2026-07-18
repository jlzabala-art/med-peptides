"use client";

import React, { useState, useMemo } from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';
import DataTable from '../../../../ui/DataTable';

export default function VariantCommercialTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
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
    const extractNumber = (val) => {
      if (val && typeof val === 'object') return Number(val.perUnit || val.kit) || 0;
      return Number(val) || 0;
    };

    return variants.map(v => {
      const rawCost = extractNumber(v.cost_per_gram || v.cost || v.unitCost || v.pricing?.master?.perUnit);
      const rawShipping = extractNumber(v.shippingCost || v.shipping);
      const rawWholesale = extractNumber(v.pricing?.wholesale?.perUnit || v.wholesalePrice || v.wholesale);
      const rawClinic = extractNumber(v.pricing?.clinic?.perUnit || v.clinicPrice || v.clinic);
      const rawMsrp = extractNumber(v.pricing?.retail?.perUnit || v.msrp || v.price);

      const generateFallbackSku = () => {
        const prodName = parentProduct?.name || parentProduct?.displayName || 'UNK';
        const safeName = prodName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
        const format = (v.format || '').substring(0, 3).toUpperCase();
        const size = (v.size || v.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return ['SKU', safeName, format, size].filter(Boolean).join('-');
      };

      const typeStr = v.formatLabel || v.format || v.productType || '';
      const dosageStr = v.dosage || v.size || '';
      const unitStr = v.kit?.unit || v.dosage_unit || '';
      let displayDosageFormat = '-';
      if (typeStr.toLowerCase().includes('api')) {
        displayDosageFormat = `API (Bulk)`;
      } else if (dosageStr) {
        const presentation = unitStr ? unitStr : (typeStr.toLowerCase().includes('lyophilized') ? 'Vial' : typeStr);
        displayDosageFormat = `${dosageStr} / ${presentation.charAt(0).toUpperCase() + presentation.slice(1)}`;
      } else {
        displayDosageFormat = typeStr || '-';
      }

      return {
        ...v,
        displayDosageFormat,
        displaySku: v.sku || generateFallbackSku(),
        supplierName: v.supplier || parentProduct?.supplier || 'Unassigned',
        rawCost: Number(rawCost),
        rawWholesale: Number(rawWholesale),
        rawClinic: Number(rawClinic),
        rawMsrp: Number(rawMsrp),
      };
    });
  }, [variants, parentProduct]);

  const sortedVariants = useMemo(() => {
    let sortableItems = [...processedVariants];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
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
      header: <input type="checkbox" checked={allSelected} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />,
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
      key: 'displayDosageFormat',
      header: <span onClick={() => handleSort('displayDosageFormat')} style={{ cursor: 'pointer' }}>Dosage / Format{getSortIcon('displayDosageFormat')}</span>,
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
    },
    {
      key: 'supplierName',
      header: <span onClick={() => handleSort('supplierName')} style={{ cursor: 'pointer' }}>Supplier{getSortIcon('supplierName')}</span>,
      render: (val) => <span>{val}</span>
    },
    {
      key: 'rawCost',
      header: <span onClick={() => handleSort('rawCost')} style={{ cursor: 'pointer' }}>Base Cost{getSortIcon('rawCost')}</span>,
      render: (val) => <span>{val ? `$${val}` : '-'}</span>
    },
    {
      key: 'rawWholesale',
      header: <span onClick={() => handleSort('rawWholesale')} style={{ cursor: 'pointer' }}>Wholesale{getSortIcon('rawWholesale')}</span>,
      render: (val, row) => (
        <span>
          {val ? `$${val}` : '-'}
          {val && row.rawCost ? <span style={{fontSize:'0.75rem', color:'#64748b', marginLeft:'6px'}}>{Math.round(((val - row.rawCost)/val)*100)}%</span> : null}
        </span>
      )
    },
    {
      key: 'rawClinic',
      header: <span onClick={() => handleSort('rawClinic')} style={{ cursor: 'pointer' }}>Clinic{getSortIcon('rawClinic')}</span>,
      render: (val, row) => (
        <span>
          {val ? `$${val}` : '-'}
          {val && row.rawWholesale ? <span style={{fontSize:'0.75rem', color:'#64748b', marginLeft:'6px'}}>{Math.round(((val - row.rawWholesale)/val)*100)}%</span> : null}
        </span>
      )
    },
    {
      key: 'rawMsrp',
      header: <span onClick={() => handleSort('rawMsrp')} style={{ cursor: 'pointer' }}>MSRP{getSortIcon('rawMsrp')}</span>,
      render: (val, row) => (
        <span>
          <b>{val ? `$${val}` : '-'}</b>
          {val && row.rawClinic ? <span style={{fontSize:'0.75rem', color:'#f59e0b', marginLeft:'6px'}}>{Math.round(((val - row.rawClinic)/val)*100)}%</span> : null}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <AppActionGroup
            maxVisible={3}
            actions={[{ type: 'edit', onClick: () => onAction && onAction('edit_variant', parentProduct, row, 'commercial') }]}
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
        onRowClick={(row) => onAction && onAction('edit_variant', parentProduct, row, 'commercial')}
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

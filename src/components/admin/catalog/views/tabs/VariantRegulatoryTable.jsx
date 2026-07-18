"use client";

import React, { useState, useMemo } from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';
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

const PdfModal = ({ url, onClose }) => {
  if (!url) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div style={{ background: 'white', width: '90%', maxWidth: '900px', height: '85vh', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>COA Viewer</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
        </div>
        <div style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
          <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} title="COA PDF Viewer" />
        </div>
      </div>
    </div>
  );
};

export default function VariantRegulatoryTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const processedVariants = useMemo(() => {
    return variants.map(v => {
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
        coa: v.coaAvailable || !!v.coaFileUrl ? 'Valid' : 'Missing',
        coaFileUrl: v.coaFileUrl || null
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
      key: 'coa',
      header: <span onClick={() => handleSort('coa')} style={{ cursor: 'pointer' }}>COA{getSortIcon('coa')}</span>,
      render: (val, row) => (
        row.coaFileUrl ? (
          <span
            onClick={(e) => { e.stopPropagation(); setPdfUrl(row.coaFileUrl); }}
            style={{ ...badgeStyle('Valid'), cursor: 'pointer', textDecoration: 'underline' }}
          >
            View COA
          </span>
        ) : (
          <span style={badgeStyle('Missing')}>Missing</span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <AppActionGroup
            maxVisible={3}
            actions={[{ type: 'edit', onClick: () => onAction && onAction('edit_variant', parentProduct, row, 'regulatory') }]}
          />
        </div>
      )
    }
  ];

  return (
    <>
      <div className="gcp-table-container">
        <DataTable
          columns={columns}
          data={sortedVariants}
          keyField={(row, idx) => row.id || idx.toString()}
          onRowClick={(row) => onAction && onAction('edit_variant', parentProduct, row, 'regulatory')}
          rowStyle={(row) => ({
            backgroundColor: selectedIds.includes(row.id) ? 'var(--color-bg-selected)' : 'transparent',
            borderLeft: selectedIds.includes(row.id) ? '4px solid #3b82f6' : '4px solid transparent',
            cursor: 'pointer',
          })}
          emptyMessage="No variants found."
        />
      </div>
      <PdfModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
    </>
  );
}

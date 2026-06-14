import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Box from "lucide-react/dist/esm/icons/box";
import React, { useState } from 'react';
import { DataTable } from '../../../ui';
import { calculateProductHealthScore } from '../useProductHealthScore';







import AppActionGroup from '../../../ui/AppActionGroup';

export default function CatalogTableView({
  products,
  loading,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  onAction,
  selectedIds,
  onSelectionChange
}) {
  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (row) => (
        <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.images?.length > 0 ? (
            <img src={row.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box size={16} color="#94a3b8" />
          )}
        </div>
      )
    },
    {
      key: 'product',
      header: 'Product',
      sortKey: 'name',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {row.sku || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.category || '-'}</span>
    },
    {
      key: 'coverage',
      header: 'Coverage',
      render: (row) => {
        const variants = row.variants || [];
        const uniqueSuppliers = new Set(variants.map(v => v.supplier).filter(Boolean));
        const count = uniqueSuppliers.size;
        
        let coverageText = 'No Source';
        let color = '#94a3b8'; // gray
        let bg = 'rgba(148, 163, 184, 0.1)';
        
        if (count === 1) {
           coverageText = 'Single Source';
           color = '#f59e0b'; 
           bg = 'rgba(245, 158, 11, 0.1)';
        } else if (count === 2) {
           coverageText = 'Dual Source';
           color = '#3b82f6';
           bg = 'rgba(59, 130, 246, 0.1)';
        } else if (count >= 3) {
           coverageText = 'Multi Source';
           color = '#10b981';
           bg = 'rgba(16, 185, 129, 0.1)';
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
            <div style={{ 
              fontWeight: 600, 
              color: color, 
              fontSize: '0.75rem', 
              background: bg, 
              padding: '2px 8px', 
              borderRadius: '12px' 
            }}>
              {coverageText}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count} Supplier{count !== 1 ? 's' : ''}</div>
          </div>
        );
      }
    },
    {
      key: 'health',
      header: 'Health Score',
      render: (row) => {
        const { score, color, flags } = calculateProductHealthScore(row);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', backgroundColor: color }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{score}</span>
            </div>
            {flags.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {flags[0]} {flags.length > 1 && `+${flags.length - 1}`}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onAction('ai', row); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(168, 85, 247, 0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#a855f7', fontSize: '0.75rem', fontWeight: 600 }}
            title="AI Insights"
          >
            <Sparkles size={12} /> Analyze
          </button>
          <AppActionGroup actions={[
            { type: 'edit', onClick: () => onAction('edit', row) },
            { type: 'delete', onClick: () => onAction('delete', row) }
          ]} />
        </div>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <DataTable
        data={products}
        columns={columns}
        keyField="id"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        onRowClick={onRowClick}
        currentPage={currentPage}
        totalPages={Math.ceil(products.length / rowsPerPage) || 1}
        totalItems={products.length}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        isLoading={loading}
        hideSearch={true} // Search is handled by Hub
        hidePagination={false}
      />
    </div>
  );
}
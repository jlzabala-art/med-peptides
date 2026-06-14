import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Box from 'lucide-react/dist/esm/icons/box';
import React, { useState, useMemo, useEffect } from 'react';
import { DataTable } from '../../../ui';
import { calculateVariantHealthScore } from '../useVariantHealthScore';
import { useAuth } from '../../../../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import AppActionGroup from '../../../ui/AppActionGroup';
import ExpandedProductRow from './ExpandedProductRow';

export default function CatalogTableView({
  products = [],
  variants = [],
  loading,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  onAction,
  selectedIds,
  onSelectionChange,
  matrixViewType = 'grouped',
}) {
  const { user } = useAuth();

  // Transform data based on flat vs grouped
  const displayData = useMemo(() => {
    if (matrixViewType === 'grouped') return products;

    // In flat mode, we can just use the provided variants
    return variants.map((v) => ({
      ...v,
      // Provide compatibility fields for the table renderer
      parentProduct: v.originalProduct,
      name: `${v.parentProductName || v.displayName || 'Unknown'} - ${v.format || ''} ${v.size || ''}`.trim(),
      category: v.originalProduct?.category,
      images: v.images || v.originalProduct?.images,
      isVariantRow: true,
    }));
  }, [products, variants, matrixViewType]);

  const [visibleColumns, setVisibleColumns] = useState([]);
  const [activeSavedView, setActiveSavedView] = useState('Default View');

  const renderSavedViews = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        View:
      </span>
      <select
        value={activeSavedView}
        onChange={(e) => setActiveSavedView(e.target.value)}
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-primary)',
          backgroundColor: 'rgba(99,102,241,0.05)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="Default View">Default View</option>
        <option value="Compact List">Compact List</option>
        <option value="Expanded Details">Expanded Details</option>
      </select>
    </div>
  );

  // Generate columns dynamically based on contextualTab
  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'image',
        header: 'Image',
        render: (row) => (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {row.images?.length > 0 ? (
              <img
                src={row.images[0]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box size={16} color="#94a3b8" />
            )}
          </div>
        ),
      },
      {
        key: 'product',
        header: 'Product / SKU',
        sortKey: 'name',
        render: (row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {row.name || row.displayName}
            </div>
            {row.isVariantRow && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                SKU: {row.sku || 'N/A'}
              </div>
            )}
            {!row.isVariantRow && row.category && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.category}</div>
            )}
          </div>
        ),
      },
    ];

    let contextColumns = [
      {
        key: 'variantCount',
        header: 'Variants',
        render: (row) => {
          if (row.isVariantRow) return <span style={{ fontSize: '0.85rem' }}>-</span>;
          const count = row.variants?.length || 0;
          return (
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-block',
              }}
            >
              {count} {count === 1 ? 'Variant' : 'Variants'}
            </div>
          );
        },
      },
      {
        key: 'supplierCount',
        header: 'Suppliers',
        render: (row) => {
          if (row.isVariantRow)
            return <span style={{ fontSize: '0.85rem' }}>{row.supplier || 'Unassigned'}</span>;

          const uniqueSuppliers = new Set(
            (row.variants || []).map((v) => v.supplier).filter(Boolean)
          );
          const count = uniqueSuppliers.size;

          let coverageText = 'No Source';
          let color = '#94a3b8';
          let bg = 'rgba(148, 163, 184, 0.1)';

          if (count === 1) {
            coverageText = 'Single Source Risk';
            color = '#f59e0b';
            bg = 'rgba(245, 158, 11, 0.1)';
          } else if (count >= 2) {
            coverageText = `${count} Suppliers`;
            color = '#10b981';
            bg = 'rgba(16, 185, 129, 0.1)';
          }

          return (
            <div
              style={{
                fontWeight: 600,
                color: color,
                fontSize: '0.75rem',
                background: bg,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-block',
              }}
            >
              {count === 0 ? '0 Suppliers' : coverageText}
            </div>
          );
        },
      },
      {
        key: 'statusSummary',
        header: 'Status Summary',
        render: (row) => {
          if (row.isVariantRow) {
            const { score, color, status } = calculateVariantHealthScore(row);
            return (
              <span style={{ fontSize: '0.85rem', color, fontWeight: 600 }}>
                {status} ({score})
              </span>
            );
          }

          // Aggregate status for parent product
          let healthyCount = 0;
          let atRiskCount = 0;
          let missingDataCount = 0;

          (row.variants || []).forEach((v) => {
            const { score } = calculateVariantHealthScore(v);
            if (score >= 80) healthyCount++;
            else if (score >= 60) atRiskCount++;
            else missingDataCount++;
          });

          return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {healthyCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                  ✓ {healthyCount} Healthy
                </span>
              )}
              {atRiskCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                  ⚠ {atRiskCount} At Risk
                </span>
              )}
              {missingDataCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                  ✕ {missingDataCount} Issues
                </span>
              )}
              {healthyCount === 0 && atRiskCount === 0 && missingDataCount === 0 && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Variants</span>
              )}
            </div>
          );
        },
      },
    ];

    const actionColumn = {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => {
        const productRef = row.isVariantRow ? row.parentProduct : row;
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.5rem',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction('ai', productRef);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#6366f1',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
              title="Atlas AI"
            >
              <Sparkles size={12} /> Atlas
            </button>
            <AppActionGroup
              actions={[
                { type: 'view', onClick: () => onAction('view', productRef) },
                { type: 'edit', onClick: () => onAction('edit', productRef) },
                { type: 'delete', onClick: () => onAction('delete', productRef) },
              ]}
            />
          </div>
        );
      },
    };

    return [...baseColumns, ...contextColumns, actionColumn];
  }, [onAction]);

  useEffect(() => {
    let isMounted = true;
    if (user?.uid) {
      getDoc(doc(db, `users/${user.uid}/views/catalogProducts_items`)).then((snapshot) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.visibleColumns) {
            setVisibleColumns(data.visibleColumns);
          } else {
            setVisibleColumns(columns.map((c) => c.key));
          }
        } else {
          setVisibleColumns(columns.map((c) => c.key));
        }
      });
    } else {
      Promise.resolve().then(() => {
        if (isMounted) setVisibleColumns(columns.map((c) => c.key));
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user, columns]);

  const handleColumnToggle = async (key, isVisible) => {
    const newCols = isVisible ? [...visibleColumns, key] : visibleColumns.filter((c) => c !== key);
    setVisibleColumns(newCols);
    if (user?.uid) {
      await setDoc(
        doc(db, `users/${user.uid}/views/catalogProducts_items`),
        { visibleColumns: newCols },
        { merge: true }
      );
    }
  };

  const handleExport = () => {
    const exportCols = columns.filter((c) => c.header && c.key !== 'actions' && c.key !== 'image');
    const headers = exportCols.map((c) => c.header);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      displayData
        .map((row) => {
          return exportCols
            .map((c) => {
              return `"${(row[c.key] || '').toString().replace(/"/g, '""')}"`;
            })
            .join(',');
        })
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalog_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVariantRow = (row) => {
    if (matrixViewType === 'flat') return null;
    return <ExpandedProductRow row={row} />;
  };

  const handleRowClick = (row) => {
    // If we click a row, always edit the parent product. The drawer handles variants.
    const productRef = row.isVariantRow ? row.parentProduct : row;
    if (onRowClick) onRowClick(productRef);
    else if (onAction) onAction('edit', productRef);
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <DataTable
        data={displayData}
        columns={columns}
        keyField="id"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        expandableRender={matrixViewType === 'grouped' ? renderVariantRow : undefined}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        totalPages={Math.ceil(displayData.length / rowsPerPage) || 1}
        totalItems={displayData.length}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        isLoading={loading}
        hideSearch={true}
        hidePagination={false}
        enableColumnSelection={true}
        renderCustomFilters={renderSavedViews}
        enableExport={true}
        onExport={handleExport}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        tableId={`catalogProducts_items_${matrixViewType}`}
      />
    </div>
  );
}

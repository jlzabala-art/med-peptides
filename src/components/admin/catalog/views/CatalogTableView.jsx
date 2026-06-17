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
import UnifiedItemWorkspaceDrawer from './UnifiedItemWorkspaceDrawer';
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
  const [drawerProduct, setDrawerProduct] = useState(null);

  // Transform data based on flat vs grouped
  const displayData = useMemo(() => {
    if (matrixViewType === 'grouped') return products;

    // In flat mode, we can just use the provided variants
    return variants.map((v) => ({
      ...v,
      // Provide compatibility fields for the table renderer
      parentProduct: v.originalProduct,
      name: `${v.productName || v.displayName || 'Unknown'} - ${v.format || ''} ${v.size || ''}`.trim(),
      category: v.originalProduct?.category,
      images: v.images || v.originalProduct?.images,
      isVariantRow: true,
    }));
  }, [products, variants, matrixViewType]);

  // Compute selected and indeterminate product IDs for grouped mode
  const { parentSelectedIds, parentIndeterminateIds } = useMemo(() => {
    if (matrixViewType === 'flat') return { parentSelectedIds: selectedIds, parentIndeterminateIds: [] };

    const selectedSet = new Set(selectedIds || []);
    const pSelected = [];
    const pIndeterminate = [];

    products.forEach((p) => {
      if (!p.variants || p.variants.length === 0) return;
      const selectedCount = p.variants.filter((v) => selectedSet.has(v.id)).length;

      if (selectedCount === p.variants.length) {
        pSelected.push(p.id);
      } else if (selectedCount > 0) {
        pIndeterminate.push(p.id);
      }
    });

    return { parentSelectedIds: pSelected, parentIndeterminateIds: pIndeterminate };
  }, [products, selectedIds, matrixViewType]);

  const handleDataTableSelectionChange = (newProductIds) => {
    if (matrixViewType === 'flat') {
      onSelectionChange(newProductIds);
      return;
    }

    // Determine what changed by comparing newProductIds with parentSelectedIds + parentIndeterminateIds
    const oldProductIds = new Set([...parentSelectedIds, ...parentIndeterminateIds]);
    const newProductIdsSet = new Set(newProductIds);

    // If "Select All" was clicked
    if (newProductIds.length === products.length && products.length > 0 && oldProductIds.size < products.length) {
      const allVariantIds = products.flatMap((p) => (p.variants || []).map((v) => v.id));
      onSelectionChange(allVariantIds);
      return;
    }

    // If "Deselect All" was clicked
    if (newProductIds.length === 0 && oldProductIds.size > 0) {
      onSelectionChange([]);
      return;
    }

    // Otherwise, find which specific product was added or removed
    let toggledProductId = null;
    let isAdded = false;

    // Check for additions
    for (const id of newProductIds) {
      if (!oldProductIds.has(id)) {
        toggledProductId = id;
        isAdded = true;
        break;
      }
    }

    // Check for removals
    if (!toggledProductId) {
      for (const id of oldProductIds) {
        if (!newProductIdsSet.has(id)) {
          toggledProductId = id;
          isAdded = false;
          break;
        }
      }
    }

    if (toggledProductId) {
      const product = products.find((p) => p.id === toggledProductId);
      if (!product || !product.variants) return;

      const variantIds = product.variants.map((v) => v.id);
      const newSelectedIds = new Set(selectedIds || []);

      if (isAdded) {
        variantIds.forEach((vid) => newSelectedIds.add(vid));
      } else {
        variantIds.forEach((vid) => newSelectedIds.delete(vid));
      }

      onSelectionChange(Array.from(newSelectedIds));
    }
  };

  const [visibleColumns, setVisibleColumns] = useState(null);

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
        header: 'NAME',
        sortKey: 'name',
        render: (row) => (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (onAction) onAction('edit', row.isVariantRow ? row.parentProduct : row);
            }}
            style={{ 
              fontWeight: 600, 
              color: '#0f172a', // Darker for emphasis
              fontSize: '0.90rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '250px'
            }}
          >
            {row.name || row.displayName}
          </div>
        ),
      },
      {
        key: 'sku',
        header: 'SKU',
        render: (row) => (
          <span style={{ fontSize: '0.80rem', color: '#64748b', fontFamily: 'monospace' }}>
            {row.sku || (row.isVariantRow && row.parentProduct?.sku) || '-'}
          </span>
        )
      },
      {
        key: 'type',
        header: 'TYPE / FORMAT',
        render: (row) => (
          <span style={{ fontSize: '0.85rem', color: '#475569' }}>
            {row.format || row.category || 'Goods'}
          </span>
        )
      }
    ];

    let contextColumns = [
      {
        key: 'variantCount',
        header: 'Variants',
        render: (row) => {
          if (row.isVariantRow) return <div style={{ width: '16px', height: '2px', background: '#e2e8f0', borderRadius: '2px' }} title="Variants only apply to products"></div>;
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
              {count}
            </div>
          );
        },
      },
      {
        key: 'supplierCount',
        header: 'Suppliers',
        render: (row) => {
          if (row.isVariantRow) {
            return row.supplier ? (
              <span style={{ fontSize: '0.85rem' }}>{row.supplier}</span>
            ) : (
              <span style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>Unassigned</span>
            );
          }

          const uniqueSuppliers = new Set(
            (row.variants || []).map((v) => v.supplier).filter(Boolean)
          );
          const count = uniqueSuppliers.size;

          let color = '#94a3b8';
          let bg = 'rgba(148, 163, 184, 0.1)';

          if (count === 1) {
            color = '#f59e0b';
            bg = 'rgba(245, 158, 11, 0.1)';
          } else if (count >= 2) {
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
              {count}
            </div>
          );
        },
      },
      {
        key: 'statusMatrix',
        header: 'Status Matrix',
        render: (row) => {
          if (row.isVariantRow) return null;

          // Compute Inventory Status
          const totalStock = (row.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
          const inventoryStatus = totalStock === 0 ? { label: 'Out of Stock', color: '#ef4444', bg: '#fef2f2' } 
            : totalStock < 50 ? { label: 'Low Stock', color: '#f59e0b', bg: '#fffbeb' }
            : { label: 'In Stock', color: '#10b981', bg: '#ecfdf5' };

          // Compute Supplier Status
          const uniqueSuppliers = new Set((row.variants || []).map((v) => v.supplier).filter(Boolean));
          const supplierStatus = uniqueSuppliers.size === 0 ? { label: 'Missing Supplier', color: '#ef4444', bg: '#fef2f2' }
            : uniqueSuppliers.size === 1 ? { label: 'Single Source Risk', color: '#f59e0b', bg: '#fffbeb' }
            : { label: 'Assigned', color: '#10b981', bg: '#ecfdf5' };

          // Compute Regulatory Status (Mock logic based on variants)
          const missingDocs = (row.variants || []).some(v => v.missingDocs);
          const regStatus = missingDocs ? { label: 'Missing Docs', color: '#ef4444', bg: '#fef2f2' }
            : { label: 'Registered', color: '#10b981', bg: '#ecfdf5' };

          // Compute Commercial Status
          const hasMissingPrice = (row.variants || []).some(v => !(v.price || v.msrp || v.pricing?.retail?.perUnit));
          const commStatus = hasMissingPrice ? { label: 'Price Missing', color: '#ef4444', bg: '#fef2f2' }
            : { label: 'Active', color: '#10b981', bg: '#ecfdf5' };

          const Badge = ({ status }) => (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: status.bg, color: status.color, whiteSpace: 'nowrap' }}>
              {status.label}
            </span>
          );

          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <Badge status={inventoryStatus} />
              <Badge status={supplierStatus} />
              <Badge status={regStatus} />
              <Badge status={commStatus} />
            </div>
          );
        },
      },
    ];

    if (matrixViewType === 'flat') {
      contextColumns = [
        {
          key: 'cost',
          header: 'PURCHASE RATE',
          align: 'right',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
              ${Number(row.cost || row.unitCost || 0).toFixed(2)}
            </span>
          ),
        },
        {
          key: 'supplier',
          header: 'DESCRIPTION (SUPPLIER)',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', display: 'inline-block' }}>
              {row.supplier || row.originalProduct?.supplier || '-'}
            </span>
          ),
        },
        {
          key: 'msrp',
          header: 'RATE',
          align: 'right',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
              ${Number(row.msrp || row.price || 0).toFixed(2)}
            </span>
          ),
        },
        {
          key: 'stock',
          header: 'STOCK ON HAND',
          align: 'right',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
              {row.stock || 0}
            </span>
          ),
        },
        {
          key: 'size',
          header: 'USAGE UNIT',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
              {row.size || 'Unit'}
            </span>
          ),
        },
        {
          key: 'priceHealth',
          header: 'Price Health',
          render: (row) => {
            const margin = ((row.msrp || row.price || 0) - (row.cost || row.unitCost || 0)) / (row.msrp || row.price || 1);
            let status = 'Good';
            let color = '#10b981';
            let bg = 'rgba(16, 185, 129, 0.1)';
            
            if (margin < 0.2 && margin > 0) {
              status = 'Low Margin';
              color = '#f59e0b';
              bg = 'rgba(245, 158, 11, 0.1)';
            } else if (margin <= 0) {
              status = 'Loss Leader';
              color = '#ef4444';
              bg = 'rgba(239, 68, 68, 0.1)';
            } else if ((row.msrp || row.price) > 300) {
              status = 'Premium';
              color = '#6366f1';
              bg = 'rgba(99, 102, 241, 0.1)';
            }

            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  fontWeight: 600,
                  color: color,
                  fontSize: '0.75rem',
                  background: bg,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'inline-block',
                }}>
                  {status}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAction) onAction('optimize_price', row);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title="AI Optimize Price"
                >
                  <Sparkles size={14} />
                </button>
              </div>
            );
          }
        },
        ...contextColumns.filter((c) => c.key === 'supplierCount' || c.key === 'statusMatrix'),
      ];
    }

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
              maxVisible={3}
              actions={[
                { type: 'clone', onClick: () => onAction(row.isVariantRow ? 'clone_variant' : 'clone_product', row) },
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
      getDoc(doc(db, `users/${user.uid}/views/catalogProducts_items`))
        .then((snapshot) => {
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
        })
        .catch((err) => {
          console.error('Error fetching visibleColumns', err);
          if (isMounted) setVisibleColumns(columns.map((c) => c.key));
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
    const currentCols = visibleColumns || columns.map((c) => c.key);
    const newCols = isVisible ? [...currentCols, key] : currentCols.filter((c) => c !== key);
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

  const handleRowClick = (row) => {
    // Open Unified Item Workspace Drawer instead of ExpandedProductRow or default edit
    const productRef = row.isVariantRow ? row.parentProduct : row;
    setDrawerProduct(productRef);
  };

  return (
    <>
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
        selectedIds={matrixViewType === 'grouped' ? parentSelectedIds : selectedIds}
        indeterminateIds={matrixViewType === 'grouped' ? parentIndeterminateIds : []}
        onSelectionChange={handleDataTableSelectionChange}
        expandableRender={matrixViewType === 'grouped' ? (row) => {
          if (!row.variants || row.variants.length === 0) return null;
          return <ExpandedProductRow row={row} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />;
        } : undefined}
        onRowClick={matrixViewType === 'grouped' ? undefined : handleRowClick}
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
        dense={true}
      />
    </div>
    
    {drawerProduct && (
      <UnifiedItemWorkspaceDrawer 
        product={drawerProduct} 
        onClose={() => setDrawerProduct(null)} 
        onAction={onAction} 
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
      />
    )}
    </>
  );
}

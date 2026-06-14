import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Box from 'lucide-react/dist/esm/icons/box';
import React, { useState, useMemo, useEffect } from 'react';
import { DataTable } from '../../../ui';
import { calculateProductHealthScore } from '../useProductHealthScore';
import { useAuth } from '../../../../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import AppActionGroup from '../../../ui/AppActionGroup';

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
  contextualTab = 'general',
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
        header: 'Product / Variant',
        sortKey: 'name',
        render: (row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {row.name || row.displayName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              SKU: {row.sku || 'N/A'}
            </div>
          </div>
        ),
      },
    ];

    let contextColumns = [];

    if (contextualTab === 'general') {
      contextColumns = [
        {
          key: 'category',
          header: 'Category',
          render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.category || '-'}</span>,
        },
        {
          key: 'format',
          header: 'Format',
          render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.format || '-'}</span>,
        },
        {
          key: 'size',
          header: 'Size',
          render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.size || '-'}</span>,
        },
        {
          key: 'coverage',
          header: 'Coverage',
          render: (row) => {
            const variants = row.isVariantRow ? [row] : row.variants || [];
            const uniqueSuppliers = new Set(variants.map((v) => v.supplier).filter(Boolean));
            const count = uniqueSuppliers.size;

            let coverageText = 'No Source';
            let color = '#94a3b8';
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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: color,
                    fontSize: '0.75rem',
                    background: bg,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {count === 0 ? '0 Suppliers' : coverageText}
                </div>
              </div>
            );
          },
        },
        {
          key: 'health',
          header: 'Health Score',
          render: (row) => {
            const productRef = row.isVariantRow ? row.parentProduct : row;
            const { score, color, flags } = calculateProductHealthScore(productRef);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      flex: 1,
                      height: '6px',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
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
          },
        },
      ];
    } else if (contextualTab === 'pricing') {
      contextColumns = [
        {
          key: 'supplier',
          header: 'Supplier',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', color: row.supplier ? '#1e293b' : '#94a3b8' }}>
              {row.supplier || 'Unassigned'}
            </span>
          ),
        },
        {
          key: 'cost',
          header: 'Unit Cost',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>{row.cost ? `$${row.cost}` : '-'}</span>
          ),
        },
        {
          key: 'wholesale',
          header: 'Wholesale',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>
              {row.wholesalePrice ? `$${row.wholesalePrice}` : '-'}
            </span>
          ),
        },
        {
          key: 'clinic',
          header: 'Clinic',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>
              {row.clinicPrice ? `$${row.clinicPrice}` : '-'}
            </span>
          ),
        },
        {
          key: 'msrp',
          header: 'MSRP',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {row.msrp ? `$${row.msrp}` : '-'}
            </span>
          ),
        },
        {
          key: 'margin',
          header: 'Margin',
          render: (row) => {
            if (!row.cost || !row.msrp) return '-';
            const margin = ((row.msrp - row.cost) / row.msrp) * 100;
            return (
              <span style={{ fontSize: '0.85rem', color: margin > 50 ? '#10b981' : '#f59e0b' }}>
                {margin.toFixed(0)}%
              </span>
            );
          },
        },
      ];
    } else if (contextualTab === 'costs') {
      contextColumns = [
        {
          key: 'supplier',
          header: 'Supplier',
          render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.supplier || '-'}</span>,
        },
        {
          key: 'cost',
          header: 'Base Cost',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>{row.cost ? `$${row.cost}` : '-'}</span>
          ),
        },
        {
          key: 'shipping',
          header: 'Shipping/Duty',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>
              {row.shippingCost ? `$${row.shippingCost}` : '-'}
            </span>
          ),
        },
        {
          key: 'landed',
          header: 'Landed Cost',
          render: (row) => (
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {row.cost && row.shippingCost
                ? `$${(Number(row.cost) + Number(row.shippingCost)).toFixed(2)}`
                : '-'}
            </span>
          ),
        },
      ];
    } else if (contextualTab === 'inventory') {
      contextColumns = [
        {
          key: 'stock',
          header: 'Current Stock',
          render: (row) => (
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: (row.stock || 0) < (row.reorderPoint || 20) ? '#ef4444' : '#1e293b',
              }}
            >
              {row.stock || 0} units
            </span>
          ),
        },
        {
          key: 'reorderPoint',
          header: 'Reorder At',
          render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.reorderPoint || 20}</span>,
        },
        {
          key: 'moq',
          header: 'MOQ',
          render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.moq || '-'}</span>,
        },
        {
          key: 'leadTime',
          header: 'Lead Time',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>
              {row.leadTime ? `${row.leadTime} days` : '-'}
            </span>
          ),
        },
        {
          key: 'velocity',
          header: 'Velocity',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>{row.salesStatus || 'Medium'}</span>
          ),
        },
      ];
    } else if (contextualTab === 'regulatory') {
      contextColumns = [
        {
          key: 'gmp',
          header: 'GMP Status',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>{row.gmp ? 'Valid' : 'Missing'}</span>
          ),
        },
        {
          key: 'coa',
          header: 'COA Status',
          render: (row) => (
            <span style={{ fontSize: '0.85rem' }}>{row.coa ? 'Valid' : 'Missing'}</span>
          ),
        },
        {
          key: 'permit',
          header: 'Import Permit',
          render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.importPermit || 'N/A'}</span>,
        },
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
                background: 'rgba(168, 85, 247, 0.1)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#a855f7',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
              title="AI Insights"
            >
              <Sparkles size={12} /> Analyze
            </button>
            <AppActionGroup
              actions={[
                { type: 'edit', onClick: () => onAction('edit', productRef) },
                { type: 'archive', onClick: () => onAction('archive', productRef) },
                { type: 'delete', onClick: () => onAction('delete', productRef) },
              ]}
            />
          </div>
        );
      },
    };

    return [...baseColumns, ...contextColumns, actionColumn];
  }, [contextualTab, onAction]);

  useEffect(() => {
    let isMounted = true;
    if (user?.uid) {
      getDoc(doc(db, `users/${user.uid}/views/catalogProducts_${contextualTab}`)).then(
        (snapshot) => {
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
        }
      );
    } else {
      Promise.resolve().then(() => {
        if (isMounted) setVisibleColumns(columns.map((c) => c.key));
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user, contextualTab, columns]);

  const handleColumnToggle = async (key, isVisible) => {
    const newCols = isVisible ? [...visibleColumns, key] : visibleColumns.filter((c) => c !== key);
    setVisibleColumns(newCols);
    if (user?.uid) {
      await setDoc(
        doc(db, `users/${user.uid}/views/catalogProducts_${contextualTab}`),
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
    link.setAttribute('download', `catalog_export_${contextualTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVariantRow = (row) => {
    // Hide variant rows if we are in flat view (they are already rows themselves)
    if (matrixViewType === 'flat') return null;

    if (!row.variants || row.variants.length === 0) {
      return (
        <div
          style={{
            padding: '16px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
          }}
        >
          No variants defined for this product.
        </div>
      );
    }

    return (
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      >
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          Variants ({row.variants.length})
        </h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr
              style={{
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--color-border)',
                textAlign: 'left',
              }}
            >
              <th style={{ padding: '8px' }}>SKU</th>
              <th style={{ padding: '8px' }}>Format</th>
              <th style={{ padding: '8px' }}>Size</th>
              <th style={{ padding: '8px' }}>Supplier</th>
              <th style={{ padding: '8px' }}>Cost</th>
              <th style={{ padding: '8px' }}>MSRP</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {row.variants.map((v, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: 'transparent',
                }}
              >
                <td style={{ padding: '8px', fontWeight: 500, color: 'var(--text-main)' }}>
                  {v.sku || '-'}
                </td>
                <td style={{ padding: '8px' }}>{v.format || '-'}</td>
                <td style={{ padding: '8px' }}>{v.size || '-'}</td>
                <td style={{ padding: '8px', color: v.supplier ? 'inherit' : 'var(--text-muted)' }}>
                  {v.supplier || 'Unassigned'}
                </td>
                <td style={{ padding: '8px' }}>{v.cost ? `$${v.cost}` : '-'}</td>
                <td style={{ padding: '8px' }}>{v.msrp ? `$${v.msrp}` : '-'}</td>
                <td style={{ padding: '8px' }}>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      backgroundColor:
                        v.status === 'Active'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(148, 163, 184, 0.1)',
                      color: v.status === 'Active' ? '#10b981' : '#64748b',
                    }}
                  >
                    {v.status || 'Draft'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
        enableExport={true}
        onExport={handleExport}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        tableId={`catalogProducts_${contextualTab}_${matrixViewType}`}
      />
    </div>
  );
}

import React, { useMemo } from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import FileWarning from 'lucide-react/dist/esm/icons/file-warning';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import ImageOff from 'lucide-react/dist/esm/icons/image-off';
import Building from 'lucide-react/dist/esm/icons/building';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Search from 'lucide-react/dist/esm/icons/search';
import Settings2 from 'lucide-react/dist/esm/icons/settings-2';

export default function MissingDataCenterView({ variants = [], onAction }) {
  const missingDataItems = useMemo(() => {
    const items = [];
    (variants || []).forEach((v) => {
      const isMissingImage = !v.originalProduct?.images || v.originalProduct.images.length === 0;
      const isMissingCategory = !v.originalProduct?.category;
      const isMissingPrice = !v.price && !v.cost;
      const isMissingSupplier = !v.supplier && !v.vendor;
      const isMissingCOA = !v.coa;

      if (
        isMissingPrice ||
        isMissingSupplier ||
        isMissingCOA ||
        isMissingImage ||
        isMissingCategory
      ) {
        items.push({
          id: v.id,
          productId: v.productId,
          product: v.originalProduct, // Keep reference to full product for editing
          name: `${v.parentProductName || 'Unnamed'} - ${v.format || ''} ${v.size || ''}`.trim(),
          missing: {
            price: isMissingPrice,
            supplier: isMissingSupplier,
            coa: isMissingCOA,
            image: isMissingImage,
            category: isMissingCategory,
          },
        });
      }
    });
    return items;
  }, [variants]);

  const stats = useMemo(() => {
    return {
      price: missingDataItems.filter((i) => i.missing.price).length,
      supplier: missingDataItems.filter((i) => i.missing.supplier).length,
      coa: missingDataItems.filter((i) => i.missing.coa).length,
      image: missingDataItems.filter((i) => i.missing.image).length,
      total: missingDataItems.length,
    };
  }, [missingDataItems]);

  const handleFixNow = (item) => {
    if (onAction) {
      onAction('edit', item.product);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={28} color="#ef4444" />
            Missing Data Center
          </h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            Resolve incomplete product profiles and missing variant data to ensure catalog
            readiness.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>Total Issues</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{stats.total}</div>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
              }}
            >
              <DollarSign size={20} />
            </div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>Missing Pricing</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{stats.price}</div>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#f3e8ff',
                color: '#9333ea',
              }}
            >
              <Building size={20} />
            </div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>Missing Supplier</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>
            {stats.supplier}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
              }}
            >
              <FileWarning size={20} />
            </div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>Missing COA</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{stats.coa}</div>
        </div>
      </div>

      {/* Action Table */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
            Items Requiring Action
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '10px', top: '10px' }}
              />
              <input
                type="text"
                placeholder="Search variants..."
                style={{
                  padding: '8px 16px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#334155',
              }}
            >
              <Settings2 size={16} /> Filter
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th
                  style={{
                    padding: '16px 24px',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Variant / Item
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Missing Data Tags
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {missingDataItems.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                >
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {item.missing.price && (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <DollarSign size={12} /> Pricing
                        </span>
                      )}
                      {item.missing.supplier && (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#f3e8ff',
                            color: '#7e22ce',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Building size={12} /> Supplier
                        </span>
                      )}
                      {item.missing.coa && (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FileWarning size={12} /> COA
                        </span>
                      )}
                      {item.missing.image && (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ImageOff size={12} /> Image
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleFixNow(item)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                    >
                      Fix Now <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {missingDataItems.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}
                  >
                    <CheckCircle
                      size={48}
                      color="#10b981"
                      style={{ opacity: 0.5, margin: '0 auto 16px auto', display: 'block' }}
                    />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                      All items are fully configured!
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

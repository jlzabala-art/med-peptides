'use client';
import React, { useState } from 'react';
import { SlidersHorizontal, Check, Eye } from 'lucide-react';

export default function ContentConfigSection({
  columns,
  toggleColumn,
  categories = [],
  includePrices = true,
  priceSource = 'cost',
  isExWorks = false,
  isMobile,
}) {
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Dynamic price source label reflecting dropdown selection
  const PRICE_LABEL_MAP = {
    cost: 'Master Cost',
    wholeseller: 'Wholesale Price',
    clinic: 'Clinic Price',
    retail: 'Retail Price',
  };
  const basePriceLabel = PRICE_LABEL_MAP[priceSource] || 'Unit Price';
  const dynamicPriceLabel = `${basePriceLabel}${isExWorks ? ' (EXW)' : ''}`;
  const dynamicKitPriceLabel = `Kit Price${isExWorks ? ' (EXW)' : ''}`;

  // Determine if supplies or diagnostic tests are present
  const hasSupplies = categories.some(c => c.includes('suppl') || c.includes('device') || c.includes('insumo'));
  const hasTests = categories.some(c => c.includes('test') || c.includes('diag') || c.includes('lab') || c.includes('genetic'));

  // Active pill list to display compactly
  const activeLabels = [];
  if (columns.product) activeLabels.push('Product');
  if (columns.dosage) activeLabels.push('Dosage');
  if (columns.format) activeLabels.push('Format');
  if (columns.supplier) activeLabels.push('Supplier');
  if (includePrices && columns.price) activeLabels.push(dynamicPriceLabel);
  if (includePrices && columns.kitPrice) activeLabels.push(dynamicKitPriceLabel);
  if (columns.purity) activeLabels.push('Purity');
  if (columns.reconstitution) activeLabels.push('Reconstitution');
  if (hasSupplies && columns.gauge) activeLabels.push('Gauge / Size');
  if (hasSupplies && columns.packSize) activeLabels.push('Pack Size');
  if (hasTests && columns.sampleType) activeLabels.push('Sample Type');
  if (hasTests && columns.biomarkers) activeLabels.push('Biomarkers');
  if (columns.description) activeLabels.push('Description');

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: isMobile ? '14px' : '16px 18px',
      marginBottom: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📄 Document Content & Columns</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 1 }}>
            Select attributes and technical specifications to include in the PDF.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomizing(prev => !prev)}
          style={{
            padding: '5px 10px',
            background: isCustomizing ? '#e0f2fe' : '#f8fafc',
            border: `1px solid ${isCustomizing ? '#0284c7' : '#cbd5e1'}`,
            borderRadius: 7,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isCustomizing ? '#0369a1' : '#334155',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <SlidersHorizontal size={12} />
          {isCustomizing ? 'Hide columns' : 'Customize columns'}
        </button>
      </div>

      {/* Compact Active Columns Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
        {activeLabels.map(label => (
          <span
            key={label}
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              background: '#f1f5f9',
              color: '#334155',
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
            }}
          >
            ✓ {label}
          </span>
        ))}
      </div>

      {/* Expanded Customizer Controls */}
      {isCustomizing && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: 8,
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={columns.product} onChange={() => toggleColumn('product')} style={{ accentColor: '#003666' }} />
            <span>Product Name</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={columns.dosage} onChange={() => toggleColumn('dosage')} style={{ accentColor: '#003666' }} />
            <span>Dosage / Spec</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={columns.format} onChange={() => toggleColumn('format')} style={{ accentColor: '#003666' }} />
            <span>Format (Vial/Pen)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={columns.supplier} onChange={() => toggleColumn('supplier')} style={{ accentColor: '#003666' }} />
            <span>Supplier</span>
          </label>

          {includePrices && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={columns.price} onChange={() => toggleColumn('price')} style={{ accentColor: '#003666' }} />
                <span>{dynamicPriceLabel}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={columns.kitPrice} onChange={() => toggleColumn('kitPrice')} style={{ accentColor: '#003666' }} />
                <span>{dynamicKitPriceLabel}</span>
              </label>
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={columns.purity} onChange={() => toggleColumn('purity')} style={{ accentColor: '#003666' }} />
            <span>Purity / CoA</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={columns.reconstitution} onChange={() => toggleColumn('reconstitution')} style={{ accentColor: '#003666' }} />
            <span>Reconstitution</span>
          </label>

          {hasSupplies && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={columns.gauge} onChange={() => toggleColumn('gauge')} style={{ accentColor: '#003666' }} />
                <span>Gauge / Size</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={columns.packSize} onChange={() => toggleColumn('packSize')} style={{ accentColor: '#003666' }} />
                <span>Pack Quantity</span>
              </label>
            </>
          )}

          {hasTests && (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={columns.sampleType} onChange={() => toggleColumn('sampleType')} style={{ accentColor: '#003666' }} />
                <span>Sample Type</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={columns.biomarkers} onChange={() => toggleColumn('biomarkers')} style={{ accentColor: '#003666' }} />
                <span>Biomarkers</span>
              </label>
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={columns.description} onChange={() => toggleColumn('description')} style={{ accentColor: '#003666' }} />
            <span>Description</span>
          </label>
        </div>
      )}
    </div>
  );
}

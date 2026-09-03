"use client";

import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../components/ui';
import BaseImportTab from './BaseImportTab';
import { db } from '../../../firebase';
import { serverTimestamp } from 'firebase/firestore';
import { useShop } from '../../../context/ShopProvider';
import Fuse from 'fuse.js';
import { CheckCircle, AlertCircle } from '@/lib/icons';
import DataTable from '../../ui/DataTable';
import { createProduct, updateProduct } from '../../../repositories/productRepository';

export default function ImportPriceListsTab() {
  const { products } = useShop();
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      const f = new Fuse(products, { keys: ['name'], threshold: 0.4 });
      setFuse(f);
    }
  }, [products]);

  const handleSave = async (finalData) => {
    const promises = finalData.map(item => {
      const productId = item.mappedProductId;
      if (!productId) return null;
      const finalCost = parseFloat(item.unit_cost);
      if (isNaN(finalCost)) return null;

      if (productId === '__CREATE_NEW__') {
        return createProduct({
          name: item.peptide_name || item.original_text,
          displayName: item.peptide_name || item.original_text,
          type: 'finished_product',
          productType: 'finished_product',
          categoryId: 'peptide',
          category: 'peptide',
          status: 'draft',
          guestVialPrice: finalCost,
          isActive: false,
          source: 'import',
          lastImportedAt: new Date().toISOString()
        }, { strict: false });
      }

      return updateProduct(productId, {
        guestVialPrice: finalCost,
        lastImportedAt: new Date().toISOString()
      }, { strict: false });
    }).filter(Boolean);
    await Promise.all(promises);
  };

  // Row component with local state for fuse mapping
  const Row = ({ item, idx, isChecked, toggleRow, updateRow }) => {
    const [mappedId, setMappedId] = useState(item.mappedProductId || '');

    useEffect(() => {
      if (!item.mappedProductId) {
        if (fuse) {
          const searchStr = item.peptide_name || item.original_text;
          if (searchStr) {
            const results = fuse.search(searchStr);
            if (results.length > 0) {
              item.mappedProductId = results[0].item.id;
              setMappedId(results[0].item.id);
            } else {
              item.mappedProductId = '__CREATE_NEW__';
              setMappedId('__CREATE_NEW__');
            }
          }
        } else {
          item.mappedProductId = '__CREATE_NEW__';
          setMappedId('__CREATE_NEW__');
        }
      }
    }, [fuse, item]);

    const handleSelectChange = (e) => {
      const val = e.target.value;
      updateRow(idx, 'mappedProductId', val);
      setMappedId(val);
    };

    const mappingComplete = mappedId && mappedId !== '__CREATE_NEW__';
    const score = item.confidence_score || 0;
    let confColor = '#10b981';
    if (score < 50) confColor = '#ef4444';
    else if (score < 80) confColor = '#f59e0b';

    return {
      _idx: idx,
      _isChecked: isChecked,
      _mappingComplete: mappingComplete,
      _score: score,
      _confColor: confColor,
      _mappedId: mappedId,
      _handleSelectChange: handleSelectChange,
      _toggleRow: () => toggleRow(idx),
      _updateRow: updateRow,
      ...item
    };
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll, updateRow }) => {
    const tableData = parsedData.map((item, idx) => {
      const score = item.confidence_score || 0;
      const mappedId = item.mappedProductId || '';
      const mappingComplete = mappedId && mappedId !== '__CREATE_NEW__';
      let confColor = '#10b981';
      if (score < 50) confColor = '#ef4444';
      else if (score < 80) confColor = '#f59e0b';
      return { ...item, _idx: idx, _score: score, _confColor: confColor, _mappingComplete: mappingComplete, _mappedId: mappedId };
    });

    const columns = [
      {
        key: '_select',
        header: (
          <Checkbox
            checked={selectedRows.size === parsedData.length}
            onChange={(e) => toggleAll(e.target.checked)}
          />
        ),
        render: (r) => <Checkbox checked={selectedRows.has(r._idx)} onChange={() => toggleRow(r._idx)} />
      },
      {
        key: '_score',
        header: 'AI Confidence',
        sortValue: (r) => r._score,
        render: (r) => <span style={{ fontWeight: 700, color: r._confColor }}>{r._score}%</span>
      },
      {
        key: '_status',
        header: 'Status',
        render: (r) => r._mappingComplete ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
            <CheckCircle size={12} /> Mapped
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
            <AlertCircle size={12} /> {r._mappedId === '__CREATE_NEW__' ? 'Will Create New' : 'Needs Review'}
          </div>
        )
      },
      {
        key: 'peptide_name',
        header: 'Extracted Item',
        render: (r) => (
          <div>
            <strong>{r.peptide_name || r.original_text}</strong>
            {r.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.dosage}</div>}
          </div>
        )
      },
      {
        key: 'moq',
        header: 'MOQ',
        align: 'right',
        render: (r) => (
          <input
            type="number"
            value={r.moq || 1}
            onChange={(e) => updateRow(r._idx, 'moq', parseInt(e.target.value, 10) || 1)}
            style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right' }}
          />
        )
      },
      {
        key: 'unit_cost',
        header: 'Unit Price',
        align: 'right',
        render: (r) => (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            $<input
              type="number"
              step="0.01"
              value={r.unit_cost || 0}
              onChange={(e) => updateRow(r._idx, 'unit_cost', parseFloat(e.target.value) || 0)}
              style={{ width: '80px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right' }}
            />
          </div>
        )
      },
      {
        key: '_mapped',
        header: 'Mapped Catalog Product',
        render: (r) => (
          <select
            value={r._mappedId}
            onChange={(e) => {
              const val = e.target.value;
              updateRow(r._idx, 'mappedProductId', val);
            }}
            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem', width: '100%', maxWidth: '200px' }}
          >
            <option value="">Select product...</option>
            <option value="__CREATE_NEW__">+ Create New Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )
      }
    ];

    return (
      <DataTable
        data={tableData}
        columns={columns}
        keyField="_idx"
        emptyTitle="No price list data"
        emptyDescription="Upload a price list or invoice file to see parsed items."
        rowStyle={(r) => ({
          opacity: selectedRows.has(r._idx) ? 1 : 0.5,
          backgroundColor: r._score < 50 && selectedRows.has(r._idx) ? '#fef2f2' : 'transparent'
        })}
      />
    );
  };

  return (
    <BaseImportTab
      title="Advanced Price Importer"
      description="Upload invoices or price lists in image, PDF, or Excel format. The AI will extract quantities, unit prices, totals and map the products to your catalog using fuzzy matching."
      context="PriceList"
      renderDiffTable={renderDiffTable}
      onSave={handleSave}
    />
  );
}

import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../components/ui';
import BaseImportTab from './BaseImportTab';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useShop } from '../../../context/ShopProvider';
import Fuse from 'fuse.js';

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
        return addDoc(collection(db, 'products'), {
          name: item.peptide_name || item.original_text,
          guestVialPrice: finalCost,
          isActive: false, // Draft by default
          createdAt: serverTimestamp(),
          updatedAt: new Date().toISOString(),
          source: 'import',
          lastImportedAt: new Date().toISOString()
        });
      }

      const productRef = doc(db, 'products', productId);
      return updateDoc(productRef, {
        guestVialPrice: finalCost,
        updatedAt: new Date().toISOString(),
        lastImportedAt: new Date().toISOString()
      });
    }).filter(Boolean);
    
    await Promise.all(promises);
  };

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
    
    let confColor = '#10b981'; // Green
    if (score < 50) confColor = '#ef4444'; // Red
    else if (score < 80) confColor = '#f59e0b'; // Yellow

    return (
      <tr style={{ opacity: isChecked ? 1 : 0.5, backgroundColor: score < 50 && isChecked ? '#fef2f2' : 'transparent', borderBottom: '1px solid var(--border)' }}>
        <td style={{ textAlign: 'center', padding: '0.75rem' }}>
          <Checkbox checked={isChecked} onChange={() => toggleRow(idx)} />
        </td>
        <td style={{ fontWeight: 700, color: confColor }}>
          {score}%
        </td>
        <td>
          {mappingComplete ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
              <CheckCircle size={12} /> Mapped
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
              <AlertCircle size={12} /> {mappedId === '__CREATE_NEW__' ? 'Will Create New' : 'Needs Review'}
            </div>
          )}
        </td>
        <td>
          <strong>{item.peptide_name || item.original_text}</strong>
          {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
        </td>
        <td style={{ textAlign: 'right', fontWeight: 600 }}>
          <input 
            type="number" 
            value={item.moq || 1} 
            onChange={(e) => updateRow(idx, 'moq', parseInt(e.target.value, 10) || 1)}
            style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right' }} 
          />
        </td>
        <td style={{ textAlign: 'right', fontWeight: 600 }}>
          $<input 
            type="number" 
            step="0.01"
            value={item.unit_cost || 0} 
            onChange={(e) => updateRow(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
            style={{ width: '80px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right', marginLeft: '4px' }} 
          />
        </td>
        <td style={{ padding: '0.5rem' }}>
          <select 
            value={mappedId} 
            onChange={handleSelectChange}
            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem', width: '100%', maxWidth: '200px' }}
          >
            <option value="">Select product...</option>
            <option value="__CREATE_NEW__">+ Create New Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </td>
      </tr>
    );
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll, updateRow }) => (
    <table className="gcp-table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
          <th style={{ width: '40px', textAlign: 'center', padding: '0.75rem' }}>
            <Checkbox checked={selectedRows.size === parsedData.length} onChange={(e) => toggleAll(e.target.checked)} />
          </th>
          <th>AI Confidence</th>
          <th>Status</th>
          <th>Extracted Item</th>
          <th style={{ textAlign: 'right' }}>MOQ</th>
          <th style={{ textAlign: 'right' }}>Unit Price</th>
          <th>Mapped Catalog Product</th>
        </tr>
      </thead>
      <tbody>
        {parsedData.map((item, idx) => (
          <Row 
            key={idx} 
            item={item} 
            idx={idx} 
            isChecked={selectedRows.has(idx)} 
            toggleRow={toggleRow}
            updateRow={updateRow}
          />
        ))}
      </tbody>
    </table>
  );

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

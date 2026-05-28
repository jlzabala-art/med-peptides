/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import EditablePriceCell from './EditablePriceCell';
import BulkPriceAdjust from './BulkPriceAdjust';
import './PriceTable.module.css';

/**
 * PriceTable – displays products with editable retail, wholesale and clinic prices.
 * Works on desktop and collapses into an accordion on mobile via CSS.
 */
export default function PriceTable({ products, onRefresh }) {
  const [localProducts, setLocalProducts] = useState([]);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleCellUpdate = async (productId, field, value) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { [`pricing.${field}.perUnit`]: parseFloat(value) });
      // optimistic UI update
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                pricing: {
                  ...p.pricing,
                  [field]: { ...p.pricing[field], perUnit: parseFloat(value) },
                },
              }
            : p
        )
      );
      onRefresh && onRefresh();
    } catch (err) {
      console.error('Price update error:', err);
      alert('Failed to update price.');
    }
  };

  return (
    <div className="price-table-wrapper">
      <BulkPriceAdjust products={localProducts} onRefresh={onRefresh} />
      <table className="gcp-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Retail</th>
            <th>Wholesale</th>
            <th>Clinic</th>
          </tr>
        </thead>
        <tbody>
          {localProducts.map((p) => (
            <tr key={p.id}>
              <td className="mono-data">{p.sku}</td>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td style={{ color: 'var(--text-muted)' }}>{p.category}</td>
              <EditablePriceCell
                productId={p.id}
                field="retail"
                value={p.pricing?.retail?.perUnit}
                onSave={handleCellUpdate}
              />
              <EditablePriceCell
                productId={p.id}
                field="wholesale"
                value={p.pricing?.wholesale?.perUnit}
                onSave={handleCellUpdate}
              />
              <EditablePriceCell
                productId={p.id}
                field="clinic"
                value={p.pricing?.clinic?.perUnit}
                onSave={handleCellUpdate}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

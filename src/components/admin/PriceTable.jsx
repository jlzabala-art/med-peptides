"use client";

/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import EditablePriceCell from './EditablePriceCell';
import BulkPriceAdjust from './BulkPriceAdjust';
import DataTable from '../ui/DataTable';
import './PriceTable.module.css';
import notifier from '../../services/NotificationService';

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
      notifier.info('Failed to update price.');
    }
  };

  return (
    <div className="price-table-wrapper">
      <BulkPriceAdjust products={localProducts} onRefresh={onRefresh} />
      <DataTable
        data={localProducts}
        keyField="id"
        columns={[
          {
            key: 'sku',
            header: 'SKU',
            render: (p) => <div className="mono-data">{p.sku}</div>
          },
          {
            key: 'name',
            header: 'Name',
            render: (p) => <div style={{ fontWeight: 600 }}>{p.name}</div>
          },
          {
            key: 'category',
            header: 'Category',
            render: (p) => <div style={{ color: 'var(--text-muted)' }}>{p.category}</div>
          },
          {
            key: 'retail',
            header: 'Retail',
            render: (p) => (
              <EditablePriceCell
                productId={p.id}
                field="retail"
                value={p.pricing?.retail?.perUnit}
                onSave={handleCellUpdate}
              />
            )
          },
          {
            key: 'wholesale',
            header: 'Wholesale',
            render: (p) => (
              <EditablePriceCell
                productId={p.id}
                field="wholesale"
                value={p.pricing?.wholesale?.perUnit}
                onSave={handleCellUpdate}
              />
            )
          },
          {
            key: 'clinic',
            header: 'Clinic',
            render: (p) => (
              <EditablePriceCell
                productId={p.id}
                field="clinic"
                value={p.pricing?.clinic?.perUnit}
                onSave={handleCellUpdate}
              />
            )
          }
        ]}
      />
    </div>
  );
}

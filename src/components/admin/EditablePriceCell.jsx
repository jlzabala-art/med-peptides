"use client";

import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import InlineEditableCell from '../ui/InlineEditableCell';
import notifier from '../../services/NotificationService';

/**
 * EditablePriceCell – renders a numeric value that can be edited inline.
 * Props:
 *   - value: current numeric value (string or number)
 *   - productId: Firestore document ID for the product
 *   - fieldPath: path within product document (e.g., 'pricing.retail.perUnit')
 *   - field: optional alternative for fieldPath
 *   - onSave: optional callback after save
 */
export default function EditablePriceCell({ value, productId, fieldPath, field, onSave }) {
  const actualFieldPath = fieldPath || `pricing.${field}.perUnit`;

  const handleSave = async (newVal) => {
    const numeric = parseFloat(newVal);
    if (isNaN(numeric)) return;
    
    if (numeric !== Number(value)) {
      try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { [actualFieldPath]: numeric });
        notifier.success('Price updated');
        if (onSave) {
           onSave(productId, field || fieldPath, numeric);
        }
      } catch (err) {
        console.error('Failed to update price cell:', err);
        notifier.error('Failed to update price');
        throw err;
      }
    }
  };

  return (
    <div className="editable-price-display mono-data">
      <InlineEditableCell
        value={value || 0}
        type="number"
        onSave={handleSave}
      />
    </div>
  );
}

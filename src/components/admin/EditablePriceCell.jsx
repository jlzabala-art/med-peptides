 
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * EditablePriceCell – renders a numeric value that can be edited inline.
 * Props:
 *   - value: current numeric value (string or number)
 *   - productId: Firestore document ID for the product
 *   - fieldPath: path within product document (e.g., 'pricing.retail.perUnit')
 */
export default function EditablePriceCell({ value, productId, fieldPath }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  const handleSave = async () => {
    const numeric = parseFloat(temp);
    if (isNaN(numeric)) {
      setTemp(value);
    } else if (numeric !== Number(value)) {
      try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { [fieldPath]: numeric });
      } catch (err) {
        console.error('Failed to update price cell:', err);
        // revert on error
        setTemp(value);
      }
    }
    setEditing(false);
  };

  return editing ? (
    <input
      type="number"
      value={temp}
      autoFocus
      onChange={e => setTemp(e.target.value)}
      onBlur={handleSave}
      onKeyDown={e => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') { setTemp(value); setEditing(false); }
      className="editable-price-input mono-data"
    />
  ) : (
    <span onClick={() => setEditing(true)} className="editable-price-display mono-data" style={{ cursor: 'pointer' }}>
      {value}
    </span>
  );
}

"use client";
import React, { useMemo } from 'react';
import useFirestorePaginatedCollection from '../../hooks/data/useFirestorePaginatedCollection';
import SearchableSelect from './SearchableSelect';

/**
 * SupplierSelect — picks a supplier from Firestore `suppliers` collection.
 *
 * GOLDEN RULE: stores/emits the Firestore doc ID, never a plain name string.
 * If the supplier renames, the label updates automatically everywhere.
 *
 * Props:
 *   value        — the supplierId (Firestore doc ID) currently selected
 *   onChange     — called with (supplierId, supplierName, supplierDoc)
 *   displayValue — optional override for displayed text (resolved live from Firestore)
 */
export default function SupplierSelect({ value, onChange, label, placeholder, required, disabled, displayValue }) {
  // Source of truth: `suppliers` collection (NOT wholesellers — those are B2B clients)
  const { data: suppliers, isLoading: loading } = useFirestorePaginatedCollection('suppliers', { limit: 200 });

  const options = useMemo(() => {
    const mapped = (suppliers || [])
      .map(s => ({
        value: s.id,                                                // ← Firestore doc ID (immutable key)
        label: s.name || s.companyName || s.displayName || s.id,  // ← live name resolves automatically
        hasProducts: (s.productsSupplied || s.analytics?.totalProducts || 0) > 0,
        metadata: s.type || s.category || 'Supplier',
        _doc: s,
      }))
      .filter(o => o.value && o.label !== o.value); // exclude docs missing a human-readable name

    // Sort: suppliers with products first, then alphabetically
    return mapped.sort((a, b) => {
      if (a.hasProducts && !b.hasProducts) return -1;
      if (!a.hasProducts && b.hasProducts) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [suppliers]);

  const handleChange = (selectedId) => {
    const opt = options.find(o => o.value === selectedId);
    onChange(selectedId, opt?.label || selectedId, opt?._doc || null);
  };

  // Resolve display label live from options (so any rename propagates automatically)
  const resolvedDisplayValue = useMemo(() => {
    if (!value) return undefined;
    const opt = options.find(o => o.value === value);
    return opt?.label || displayValue || value;
  }, [value, options, displayValue]);

  return (
    <SearchableSelect
      label={label}
      value={value}
      onChange={handleChange}
      options={options}
      placeholder={loading ? 'Loading suppliers...' : placeholder || 'Search supplier...'}
      disabled={disabled || loading}
      required={required}
      displayValue={resolvedDisplayValue}
    />
  );
}

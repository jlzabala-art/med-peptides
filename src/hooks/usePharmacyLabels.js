'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';

/**
 * usePharmacyLabels
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal hook for generating and previewing EU GMP certified Pharmapolis
 * pharmacy labels across both public portals (/dr, /rx, /agent) and private
 * administration tables (UniversalPrescriptionsTable, Admin Prescriptions).
 *
 * Supports:
 * - Single prescription object (rx)
 * - Array of prescriptions for Bulk generation ([rx1, rx2, ...])
 * - Pre-formatted label objects
 * - Global CustomEvent ('OPEN_PHARMAPOLIS_LABELS') for decoupled table rows
 */
export function usePharmacyLabels(options = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [labels, setLabels] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);

  /**
   * Opens the labels modal for a single rx, array of rxs, or label objects.
   * @param {Object|Array} rxOrArray
   * @param {number} startIndex
   */
  const openLabels = useCallback((rxOrArray, startIndex = 0) => {
    if (!rxOrArray) return;

    let resolved = [];
    if (Array.isArray(rxOrArray)) {
      resolved = rxOrArray.flatMap(item => {
        if (!item) return [];
        // Already a formatted label object
        if (item.productTitle && item.apis && Array.isArray(item.apis)) {
          return [item];
        }
        return getPharmapolisLabelsForPrescription(item);
      });
    } else {
      resolved = getPharmapolisLabelsForPrescription(rxOrArray);
    }

    if (!resolved || resolved.length === 0) {
      console.warn('usePharmacyLabels: No valid labels generated for input', rxOrArray);
      return;
    }

    setLabels(resolved);
    setInitialIndex(Math.max(0, Math.min(startIndex, resolved.length - 1)));
    setIsOpen(true);
  }, []);

  const closeLabels = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Decoupled window event listener for table row quick actions
  useEffect(() => {
    const handleGlobalOpen = (e) => {
      const rx = e.detail?.rx || e.detail?.prescription;
      const rxs = e.detail?.prescriptions || e.detail?.rows || e.detail?.selectedRows;
      const idx = e.detail?.index || 0;

      if (rxs && Array.isArray(rxs) && rxs.length > 0) {
        openLabels(rxs, idx);
      } else if (rx) {
        openLabels(rx, idx);
      }
    };

    window.addEventListener('OPEN_PHARMAPOLIS_LABELS', handleGlobalOpen);
    return () => {
      window.removeEventListener('OPEN_PHARMAPOLIS_LABELS', handleGlobalOpen);
    };
  }, [openLabels]);

  // Self-contained JSX modal wrapper
  const LabelsModal = useMemo(() => {
    return function PharmacyLabelsModalWrapper(modalProps = {}) {
      if (!isOpen || labels.length === 0) return null;
      return (
        <PharmacyLabelsModal
          isOpen={isOpen}
          onClose={closeLabels}
          labels={labels}
          initialLabelIndex={initialIndex}
          isEs={modalProps.isEs ?? options.isEs ?? false}
          {...modalProps}
        />
      );
    };
  }, [isOpen, closeLabels, labels, initialIndex, options.isEs]);

  return {
    isOpen,
    labels,
    initialIndex,
    openLabels,
    closeLabels,
    LabelsModal
  };
}

export default usePharmacyLabels;

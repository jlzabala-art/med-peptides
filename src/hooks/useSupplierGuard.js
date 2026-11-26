'use client';

/**
 * useSupplierGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces the global white-label rule:
 *   ONLY users with `admin` role may see raw supplier/manufacturer identities
 *   (e.g., Pharmapolis, NP Labs, DN Lab, Fagron, BioBlend).
 *   All public visitors and lower-privilege roles (doctor, clinic, patient,
 *   wholesaler, etc.) receive scrubbed/white-labeled labels.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useMemo } from 'react';
import { useRoleAccess } from './useRoleAccess';
import { scrubSupplierText, sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';

export function useSupplierGuard() {
  const { is } = useRoleAccess();
  const canViewSupplier = is('admin');

  return useMemo(
    () => ({
      canViewSupplier,
      maskSupplier: (supplierName, fallback = 'EU GMP Certified Network') => {
        if (canViewSupplier) return supplierName || fallback;
        return fallback;
      },
      scrubText: (text) => {
        if (canViewSupplier || typeof text !== 'string') return text;
        return scrubSupplierText(text);
      },
      sanitizeProduct: (product) =>
        sanitizePublicProductForViewer(product, { isAdmin: canViewSupplier }),
    }),
    [canViewSupplier]
  );
}

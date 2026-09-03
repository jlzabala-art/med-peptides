'use client';
/**
 * hooks/data/usePrescriptionEnriched.js
 *
 * Hook cross-entity: Prescripción + Productos + Suppliers.
 *
 * Enriquece cada línea de prescripción con:
 *   - Datos completos del producto (nombre, imagen, categoría)
 *   - Datos del supplier (nombre, país, logo)
 *
 * Uso en ItemsTab.jsx de una prescripción para mostrar al doctor/admin
 * qué proveedor suministra cada producto.
 *
 * @example
 * const { enrichedLines, isLoading } = usePrescriptionEnriched(prescription);
 * // enrichedLines[0] = { productId, product: {...}, supplier: { name, country }, qty, dose, ... }
 */

import { useQuery } from '@tanstack/react-query';
import { getProductsByIds } from '@/repositories/productRepository';
import { getSuppliersByIds } from '@/repositories/supplierRepository';
import { queryKeys } from './queryKeys';

/**
 * Dado un objeto prescripción con `prescriptionLines[]`, enriquece cada línea
 * con datos de producto y supplier en paralelo (2 batch queries).
 *
 * @param {object|null} prescription — Objeto prescripción con prescriptionLines[]
 * @param {{ enabled?: boolean }} opts
 */
export function usePrescriptionEnriched(prescription, opts = {}) {
  const { enabled = true } = opts;

  const lines = prescription?.prescriptionLines ?? prescription?.items ?? [];
  const productIds = [...new Set(lines.map((l) => l.productId).filter(Boolean))];

  // Query 1: batch de productos
  const productsQuery = useQuery({
    queryKey: [...queryKeys.products.all, 'byIds', productIds.sort()],
    queryFn: () => getProductsByIds(productIds),
    staleTime: 1000 * 60 * 30,
    enabled: enabled && productIds.length > 0,
  });

  const productsMap = productsQuery.data ?? {};

  // Extraer supplierIds de los productos cargados
  const supplierIds = [...new Set(
    Object.values(productsMap)
      .map((p) => p.supplierId || p.supplier?.id)
      .filter(Boolean)
  )];

  // Query 2: batch de suppliers (depende de productsMap)
  const suppliersQuery = useQuery({
    queryKey: [...queryKeys.suppliers.all, 'byIds', supplierIds.sort()],
    queryFn: () => getSuppliersByIds(supplierIds),
    staleTime: 1000 * 60 * 30,
    enabled: enabled && supplierIds.length > 0 && productsQuery.isSuccess,
  });

  const suppliersMap = suppliersQuery.data ?? {};

  // Combinar todo en enrichedLines
  const enrichedLines = lines.map((line) => {
    const product = productsMap[line.productId] ?? null;
    const supplierId = product?.supplierId || product?.supplier?.id;
    const supplier = supplierId ? (suppliersMap[supplierId] ?? null) : null;
    return {
      ...line,
      product,
      supplier,
      // Shortcuts para conveniencia en la UI
      productName: line.productName || product?.name || product?.title || line.productId,
      supplierName: supplier?.name || supplier?.companyName || '—',
      supplierCountry: supplier?.country || supplier?.countryCode || '—',
    };
  });

  return {
    enrichedLines,
    productsMap,
    suppliersMap,
    isLoading: productsQuery.isLoading || suppliersQuery.isLoading,
    isError: productsQuery.isError || suppliersQuery.isError,
    // hasSupplierData: true cuando al menos una línea tiene supplier
    hasSupplierData: enrichedLines.some((l) => l.supplier != null),
  };
}

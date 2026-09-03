'use client';
/**
 * hooks/data/useProtocolProductsSync.js
 *
 * Hook cross-entity que conecta Protocolos ↔ Productos ↔ Prescripciones.
 *
 * Exports:
 *   - useProtocolProducts(protocol)   → productos de un protocolo (batch eficiente)
 *   - useProductProtocols(productId)  → protocolos que usan un producto
 */

import { useQuery } from '@tanstack/react-query';
import { getProductsByIds } from '@/repositories/productRepository';
import { getAllProtocols } from '@/repositories/protocolRepository';
import { queryKeys } from './queryKeys';

// ─── HELPER: extraer productIds de un protocolo ────────────────────────────

function _extractProductIds(protocol) {
  if (!protocol) return [];
  const ids = new Set();

  // Caso 1: productIds[] directo
  (protocol.productIds || []).forEach((id) => ids.add(id));

  // Caso 2: phases[].drugs[].productId
  (protocol.phases || []).forEach((phase) => {
    (phase.drugs || phase.peptides || []).forEach((drug) => {
      if (drug.productId) ids.add(drug.productId);
    });
  });

  // Caso 3: prescriptionLines[].productId
  (protocol.prescriptionLines || []).forEach((line) => {
    if (line.productId) ids.add(line.productId);
  });

  // Caso 4: peptides[].productId (legacy)
  (protocol.peptides || []).forEach((p) => {
    if (p.productId) ids.add(p.productId);
  });

  return [...ids].filter(Boolean);
}

// ─── useProtocolProducts ──────────────────────────────────────────────────────

/**
 * Dado un protocolo, carga todos sus productos asociados como un mapa.
 * Usa getProductsByIds para batch eficiente (sin N+1 queries).
 *
 * @param {object|null} protocol — El objeto protocolo completo
 * @param {{ enabled?: boolean }} opts
 * @returns {{ productsMap: Record<string,object>, productsList: object[], isLoading, error }}
 */
export function useProtocolProducts(protocol, opts = {}) {
  const { enabled = true } = opts;
  const productIds = _extractProductIds(protocol);

  const query = useQuery({
    queryKey: [...queryKeys.products.all, 'byIds', productIds.sort()],
    queryFn: () => getProductsByIds(productIds),
    staleTime: 1000 * 60 * 30, // Productos cambian poco
    enabled: enabled && productIds.length > 0,
  });

  return {
    ...query,
    productsMap: query.data ?? {},
    productsList: Object.values(query.data ?? {}),
    productIds,
  };
}

// ─── useProductProtocols ──────────────────────────────────────────────────────

/**
 * Dado un productId, encuentra todos los protocolos que lo incluyen.
 * Útil en la vista de un producto para mostrar "Protocolos que usan este producto".
 *
 * Nota: carga todos los protocolos del caché (ya existente, TTL 60min) y filtra client-side.
 * No genera queries adicionales si el caché de protocolos está activo.
 *
 * @param {string} productId
 * @param {{ enabled?: boolean }} opts
 */
export function useProductProtocols(productId, opts = {}) {
  const { enabled = true } = opts;

  const query = useQuery({
    queryKey: queryKeys.protocols.all,
    queryFn: () => getAllProtocols(),
    staleTime: 1000 * 60 * 60, // 60 min — misma TTL que protocolRepository
    enabled: enabled && !!productId,
  });

  const relatedProtocols = (query.data || []).filter((protocol) => {
    const ids = _extractProductIds(protocol);
    return ids.includes(productId);
  });

  return {
    ...query,
    protocols: relatedProtocols,
    count: relatedProtocols.length,
  };
}

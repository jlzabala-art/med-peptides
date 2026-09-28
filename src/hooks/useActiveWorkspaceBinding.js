"use client";

import { useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

/**
 * useActiveWorkspaceBinding
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal hook to propagate active workspace context (targetEntity/recipient 
 * and items/variants) across all modals, drawers, and operational screens.
 * 
 * Complies with Golden Rule #12, #13, #14.
 * 
 * @param {Object} options
 * @param {string|null} options.productId Optional target product ID or slug to match specific variants
 * @param {string[]|null} options.allowedEntityTypes Filter allowed recipient types (e.g. ['doctor', 'patient'])
 * 
 * @returns {Object} {
 *   activeWorkspace,
 *   workspaceRecipient,
 *   workspaceItems,
 *   matchingItem,
 *   preferredSupplierId,
 *   preferredFormatId,
 *   preferredStrengthId,
 *   hasRecipient,
 *   hasItems,
 *   pricingTier,
 *   intent,
 *   workspaceName
 * }
 */
export function useActiveWorkspaceBinding({
  productId = null,
  allowedEntityTypes = null,
} = {}) {
  const activeWorkspace = useWorkspaceStore(
    (s) => s.workspaces?.[s.activeWorkspaceId]
  );

  // 1. Normalized Recipient from Active Workspace
  const workspaceRecipient = useMemo(() => {
    const target = activeWorkspace?.targetEntity;
    if (!target || (!target.name && !target.id && !target.displayName)) {
      return null;
    }

    const rawType = target.type || activeWorkspace?.selectedTargetType || 'doctor';
    const type = String(rawType).toLowerCase();

    if (allowedEntityTypes && Array.isArray(allowedEntityTypes) && !allowedEntityTypes.includes(type)) {
      return null;
    }

    return {
      type,
      id: target.id || null,
      name: target.name || target.displayName || '',
      company: target.company || target.clinicName || target.clinic || '',
      email: target.email || '',
      phone: target.phone || target.phoneNumber || target.whatsapp || '',
      notes: target.notes || '',
      source: 'workspace',
      workspaceId: activeWorkspace?.id,
      workspaceName: activeWorkspace?.name || 'Active Workspace',
    };
  }, [activeWorkspace?.targetEntity, activeWorkspace?.selectedTargetType, activeWorkspace?.id, activeWorkspace?.name, allowedEntityTypes]);

  // 2. Normalized Items in Workspace
  const workspaceItems = useMemo(() => {
    return activeWorkspace?.items || [];
  }, [activeWorkspace?.items]);

  // 3. Contextual Product Match (if evaluated in a specific product screen)
  const matchingItem = useMemo(() => {
    if (!productId || !workspaceItems.length) return null;
    const cleanTarget = String(productId).toLowerCase().replace(/[-_\s]+/g, '');
    return workspaceItems.find((it) => {
      const pId = String(it.productId || it.slug || it.id || '').toLowerCase().replace(/[-_\s]+/g, '');
      return pId === cleanTarget || pId.includes(cleanTarget) || cleanTarget.includes(pId);
    }) || null;
  }, [productId, workspaceItems]);

  const preferredSupplierId = useMemo(() => {
    if (!matchingItem) return null;
    return matchingItem.supplierId || matchingItem.supplier || matchingItem.supplierName || null;
  }, [matchingItem]);

  const preferredFormatId = useMemo(() => {
    if (!matchingItem) return null;
    const raw = matchingItem.formatId || matchingItem.format || matchingItem.presentation || '';
    return raw ? raw.toLowerCase().replace(/\s+/g, '_') : null;
  }, [matchingItem]);

  const preferredStrengthId = useMemo(() => {
    if (!matchingItem) return null;
    const raw = matchingItem.strengthId || matchingItem.dose || matchingItem.dosage || matchingItem.strength || '';
    return raw ? raw.toString().toLowerCase().replace(/\s+/g, '_') : null;
  }, [matchingItem]);

  return {
    activeWorkspace,
    workspaceRecipient,
    workspaceItems,
    matchingItem,
    preferredSupplierId,
    preferredFormatId,
    preferredStrengthId,
    hasRecipient: Boolean(workspaceRecipient),
    hasItems: workspaceItems.length > 0,
    pricingTier: activeWorkspace?.pricingTier || 'clinic',
    intent: activeWorkspace?.intent || 'sell',
    operationType: activeWorkspace?.operationType || 'unassigned',
    workspaceName: activeWorkspace?.name || 'Active Workspace',
  };
}

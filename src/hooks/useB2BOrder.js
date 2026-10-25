"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import { resolveProductTierPricing } from '@/components/pricing/TieredPriceShield';

const STORAGE_KEY = 'atlas_b2b_order_v1';
const DRAWER_EVENT = 'open-b2b-order-drawer';
const UPDATE_EVENT = 'atlas-b2b-order-updated';

function loadStoredOrder() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOrder(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { items } }));
  } catch {
    // Fail-safe
  }
}

export function resolveRolePrice(product, role = 'clinic') {
  if (!product) return 0;
  const tiers = resolveProductTierPricing(product);
  if (!tiers) {
    return typeof product.price === 'number' && product.price > 0 ? product.price : 0;
  }
  if (role === 'wholesaler' || role === 'supplier' || role === 'distributor') {
    return tiers.wholesaler || tiers.clinic || 0;
  }
  if (role === 'patient') {
    return tiers.retail || tiers.clinic || 0;
  }
  if (role === 'cost' || role === 'admin_cost') {
    return tiers.cost || tiers.clinic || 0;
  }
  return tiers.clinic || tiers.wholesaler || 0;
}

export function useB2BOrder() {
  const [items, setItems] = useState(loadStoredOrder);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Synchronize state with storage and custom events
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    const handleUpdate = (e) => {
      if (e.detail?.items) {
        setItems(e.detail.items);
      }
    };

    const handleOpenDrawer = () => {
      setIsDrawerOpen(true);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener(DRAWER_EVENT, handleOpenDrawer);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener(DRAWER_EVENT, handleOpenDrawer);
    };
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const addItem = useCallback((product, options = {}) => {
    const {
      variant = null,
      quantity = 1,
      role = 'clinic',
      priceOverride = null,
      brandSlug = 'peptides',
      silent = false
    } = options;

    if (!product) return;

    const vId = variant?.id || 'standard';
    const itemKey = `${product.id || product.slug}::${vId}`;
    const name = product.name || product.title || 'Product';
    const dosage = variant?.name || variant?.strength || variant?.dosage || product.strength || product.dosage || '';
    const presentation = variant?.presentation || variant?.format || product.format || '10R Borosilicate Vial';
    const image = product.image || product.imageUrl || product.image_url || '/images/og-peptides.png';

    // Calculate price based on role or override
    let unitPrice = 0;
    if (typeof priceOverride === 'number' && priceOverride > 0) {
      unitPrice = priceOverride;
    } else if (typeof variant?.price === 'number' && variant.price > 0) {
      unitPrice = variant.price;
    } else {
      unitPrice = resolveRolePrice(product, role);
    }

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemKey);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
          unitPrice: unitPrice > 0 ? unitPrice : updated[idx].unitPrice
        };
      } else {
        updated = [
          ...prev,
          {
            id: itemKey,
            productId: product.id || product.slug,
            variantId: vId,
            name,
            dosage,
            presentation,
            unitPrice,
            quantity: Math.max(1, quantity),
            image,
            brandSlug,
            sku: product.sku || product.code || product.id
          }
        ];
      }
      saveStoredOrder(updated);
      return updated;
    });

    triggerHaptic('success');
    if (!silent) {
      toast.success(`${name} añadido al pedido`, {
        icon: '📦',
        style: {
          borderRadius: '10px',
          background: '#003666',
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: 600
        }
      });
    }
  }, []);

  const updateQty = useCallback((itemKey, delta) => {
    setItems((prev) => {
      const updated = prev
        .map((i) => {
          if (i.id === itemKey) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean);
      saveStoredOrder(updated);
      return updated;
    });
    triggerHaptic('selection');
  }, []);

  const removeItem = useCallback((itemKey) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemKey);
      saveStoredOrder(updated);
      return updated;
    });
    triggerHaptic('medium');
    toast('Producto eliminado del pedido', { icon: '🗑️' });
  }, []);

  const clearOrder = useCallback(() => {
    setItems([]);
    saveStoredOrder([]);
  }, []);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  }, [items]);

  return {
    items,
    totalCount,
    subtotal,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    updateQty,
    removeItem,
    clearOrder
  };
}

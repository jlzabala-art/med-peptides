/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

/**
 * Manages cart state with localStorage persistence, stock validation,
 * guest unit limits, and cart-level metadata (e.g. ClinicalAI tags).
 *
 * @param {Array}   products       – live product list for stock validation
 * @param {boolean} isProfessional – relaxes the 20-unit guest limit when true
 * @param {*}       user           – when this reference changes cart is cleared (login/logout)
 * @returns {{ cart, setCart, cartMetadata, setCartMetadata, cartCount, updateCart }}
 */
export function useCart(products, isProfessional, user) {
  // ── Cart expiration: clear if older than 30 days ────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('mp_cart');
      const meta = localStorage.getItem('mp_cart_meta');
      if (saved && meta) {
        const parsedMeta = JSON.parse(meta);
        const updatedAt = parsedMeta?.updatedAt;
        if (updatedAt) {
          const age = Date.now() - new Date(updatedAt).getTime();
          const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
          if (age > THIRTY_DAYS) {
            localStorage.removeItem('mp_cart');
            localStorage.removeItem('mp_cart_meta');
            return {};
          }
        }
      }
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [cartMetadata, setCartMetadata] = useState(() => {
    try {
      const saved = localStorage.getItem('mp_cart_meta');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // ── Persist on change + stamp ownership metadata ──────────────────────────
  useEffect(() => {
    try { localStorage.setItem('mp_cart', JSON.stringify(cart)); }
    catch (e) { console.warn('Could not save cart:', e); }
  }, [cart]);

  useEffect(() => {
    try {
      const ownerUid  = user?.uid  ?? null;
      const ownerType = user?.uid  ? 'authenticated' : 'guest';
      const stamped   = { ...cartMetadata, ownerUid, ownerType, updatedAt: new Date().toISOString() };
      localStorage.setItem('mp_cart_meta', JSON.stringify(stamped));
    }
    catch (e) { console.warn('Could not save cart metadata:', e); }
  }, [cartMetadata, user]);

  // ── On logout: keep cart, downgrade ownership to guest ───────────────────
  useEffect(() => {
    if (!user) {
      setCartMetadata(prev => ({ ...prev, ownerUid: null, ownerType: 'guest', updatedAt: new Date().toISOString() }));
    }
  }, [user]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const updateCart = (productOrName, delta, metadata = null) => {
    const isObject = typeof productOrName === 'object' && productOrName !== null;
    const productName = isObject ? productOrName.name : productOrName;
    const dosage = isObject ? productOrName.dosage : null;
    const itemKey = dosage ? `${productName} (${dosage})` : productName;

    setCart((prev) => {
      const currentQty = prev[itemKey] || 0;
      const newQty = currentQty + delta;

      // Remove item when qty drops to 0
      if (newQty <= 0) {
        const { [itemKey]: _, ...rest } = prev;
        setCartMetadata((m) => { const { [itemKey]: _m, ...mr } = m; return mr; });
        return rest;
      }

      // Stock validation
      const product = products.find(
        (p) => `${p.name} (${p.dosage})` === itemKey || p.name === itemKey
      );
      if (product && delta > 0 && newQty > (product.stock || 0)) {
        alert(`Sorry, we only have ${product.stock} units of ${productName} in stock.`);
        return prev;
      }



      // Attach metadata if provided
      if (metadata && delta > 0) {
        setCartMetadata((m) => ({ ...m, [itemKey]: metadata }));
      }

      return { ...prev, [itemKey]: newQty };
    });
  };

  return { cart, setCart, cartMetadata, setCartMetadata, cartCount, updateCart };
}

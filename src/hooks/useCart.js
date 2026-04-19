import { useState, useEffect } from 'react';

/**
 * Manages cart state with localStorage persistence, stock validation,
 * guest unit limits, and cart-level metadata (e.g. Protocol Builder tags).
 *
 * @param {Array}   products       – live product list for stock validation
 * @param {boolean} isProfessional – relaxes the 20-unit guest limit when true
 * @param {*}       user           – when this reference changes cart is cleared (login/logout)
 * @returns {{ cart, setCart, cartMetadata, setCartMetadata, cartCount, updateCart }}
 */
export function useCart(products, isProfessional, user) {
  // ── Hydrate from localStorage ─────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('regenpept_cart');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [cartMetadata, setCartMetadata] = useState(() => {
    try {
      const saved = localStorage.getItem('regenpept_cart_meta');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // ── Persist on change ─────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('regenpept_cart', JSON.stringify(cart)); }
    catch (e) { console.warn('Could not save cart:', e); }
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('regenpept_cart_meta', JSON.stringify(cartMetadata)); }
    catch (e) { console.warn('Could not save cart metadata:', e); }
  }, [cartMetadata]);

  // ── Clear cart on auth change (login / logout) ────────────────────────────
  useEffect(() => {
    setCart({});
    setCartMetadata({});
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

      // Guest 20-unit cap
      if (!isProfessional) {
        const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
        if (currentTotal + delta > 20) {
          alert(
            'For security and research compliance, individual guest inquiries are limited to ' +
            '20 units total. Please log in to a Professional account or contact us for bulk ' +
            'institutional requirements.'
          );
          return prev;
        }
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

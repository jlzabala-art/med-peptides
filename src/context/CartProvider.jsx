/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUIStore } from '../stores/uiStore';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { useTenant } from './TenantContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isProfessional, isAdmin } = useAuth();
  const { setActiveModal } = useUIStore();
  const { supplementCatalogue, catalogue } = useFirestoreData();
  const { tenantId, tenant } = useTenant();

  const getCartKey = () => isAdmin ? 'mp_admin_cart_v3' : 'mp_cart_v3';
  const getCartMetaKey = () => isAdmin ? 'mp_admin_cart_metadata_v3' : 'mp_cart_metadata_v3';
  const getCartOwnershipKey = () => isAdmin ? 'mp_admin_cart_ownership_v3' : 'mp_cart_ownership_v3';

  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return {}; // SSR Fix
    try {
      // Intentionally checking default mp_cart_v3 on initial load, effect will sync if isAdmin is true later
      const savedCart = window.localStorage.getItem('mp_cart_v3');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (e) {
      return {};
    }
  });

  const [cartMetadata, setCartMetadata] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = window.localStorage.getItem('mp_cart_metadata_v3');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [cartOwnership, setCartOwnership] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        patientId: null,
        supervisingPhysicianId: null,
        supervisingAdminId: null,
        source: 'patient_selected',
        recommendationId: null,
        tenantId: null,
        ownerType: null,
        ownerId: null,
        sourceDomain: null,
        attributionLocked: false,
      };
    }
    try {
      const saved = window.localStorage.getItem('mp_cart_ownership_v3');
      return saved ? JSON.parse(saved) : {
        patientId: null,
        supervisingPhysicianId: null,
        supervisingAdminId: null,
        source: 'patient_selected',
        recommendationId: null,
        tenantId: null,
        ownerType: null,
        ownerId: null,
        sourceDomain: null,
        attributionLocked: false,
      };
    } catch (e) {
      return {
        patientId: null,
        supervisingPhysicianId: null,
        supervisingAdminId: null,
        source: 'patient_selected',
        recommendationId: null,
        tenantId: null,
        ownerType: null,
        ownerId: null,
        sourceDomain: null,
        attributionLocked: false,
      };
    }
  });

  // Sync tenantId and branding/owner state to cartOwnership
  useEffect(() => {
    setCartOwnership(prev => ({
      ...prev,
      tenantId: tenantId || null,
      ownerType: tenantId ? 'wholesaler' : null,
      ownerId: tenantId ? (tenant?.slug || tenantId) : null,
      sourceDomain: tenantId ? window.location.hostname : null,
      attributionLocked: tenantId ? true : false,
    }));
  }, [tenantId, tenant]);

  // When auth resolves or isAdmin changes, switch context
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedCart = window.localStorage.getItem(getCartKey());
      if (savedCart) setCart(JSON.parse(savedCart));
      else setCart({});

      const savedMeta = window.localStorage.getItem(getCartMetaKey());
      if (savedMeta) setCartMetadata(JSON.parse(savedMeta));
      else setCartMetadata({});

      const savedOwnership = window.localStorage.getItem(getCartOwnershipKey());
      if (savedOwnership) setCartOwnership(JSON.parse(savedOwnership));
      // (If no ownership found, we could reset it, but leaving default is okay)
    } catch (e) {
      console.error('Failed to sync cart keys on admin change', e);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(getCartKey(), JSON.stringify(cart));
      window.localStorage.setItem(getCartMetaKey(), JSON.stringify(cartMetadata));
      window.localStorage.setItem(getCartOwnershipKey(), JSON.stringify(cartOwnership));
    }
  }, [cart, cartMetadata, cartOwnership, isAdmin]);

  const clearCart = useCallback(() => {
    setCart({});
    setCartMetadata({});
    setCartOwnership({
      patientId: null,
      supervisingPhysicianId: null,
      supervisingAdminId: null,
      source: 'patient_selected',
      recommendationId: null,
      tenantId: tenantId || null,
      ownerType: tenantId ? 'wholesaler' : null,
      ownerId: tenantId ? (tenant?.slug || tenantId) : null,
      sourceDomain: tenantId ? (typeof window !== 'undefined' ? window.location.hostname : null) : null,
      attributionLocked: tenantId ? true : false,
    });
  }, [tenantId, tenant]);

  const updateCart = useCallback((productOrName, delta, options = {}) => {
    // Determine the active mode/type (e.g. b2c, wholesale, prescription)
    const cartType = options?.cartType || 'default';
    
    if ((delta && delta > 0) || (typeof productOrName === 'object' && productOrName !== null && Array.isArray(productOrName.items))) {
      // Allow overriding the modal behavior (e.g., in B2B we might not want the cart drawer to pop out immediately)
      if (!options?.silent) {
        setActiveModal('cart');
      }
    }

    if (typeof productOrName === 'object' && productOrName !== null && Array.isArray(productOrName.items)) {
      const { items, bundle } = productOrName;
      setCart(prev => {
        const next = { ...prev };
        items.forEach(item => {
          const key = (item.productId && item.variantId) ? `${item.productId}::${item.variantId}` : (item.label || item.name);
          if (!key) return;
          next[key] = (next[key] || 0) + (item.qty || 1);
        });
        return next;
      });

      if (bundle) {
        setCartMetadata(prev => {
          const next = { ...prev };
          items.forEach(item => {
            const key = (item.productId && item.variantId) ? `${item.productId}::${item.variantId}` : (item.label || item.name);
            if (!key) return;
            next[key] = {
              isProtocol: true,
              protocolId: bundle.id,
              protocolName: bundle.name,
              source: item.source,
              price: item.price ?? null,
              isSupplement: item.isSupplement ?? false,
              name: item.name || item.label,
              dosage: item.dosage,
              productId: item.productId,
              variantId: item.variantId
            };
          });
          const existingBundles = prev.protocolBundles ?? [];
          const bundleExists = existingBundles.some(b => b.id === bundle.id);
          next.protocolBundles = bundleExists
            ? existingBundles.map(b => b.id === bundle.id ? { ...bundle } : b)
            : [...existingBundles, { ...bundle }];
          if (options?.onAdd) options.onAdd();
          return next;
        });
      }
      return;
    }

    const isObject = typeof productOrName === 'object' && productOrName !== null;
    let itemKey = '';

    if (isObject) {
      const pId = productOrName.productId || productOrName.id;
      const vId = productOrName.variantId || productOrName.variant?.id;
      if (pId && vId) {
        itemKey = `${pId}::${vId}`;
      } else if (pId) {
        itemKey = `${pId}::${pId}`;
      } else if (productOrName.name || productOrName.label || productOrName.title) {
        itemKey = productOrName.name || productOrName.label || productOrName.title;
      } else {
        console.error("CartProvider: Missing productId/name in cart item", productOrName);
        toast.error("Cart item is missing product identifier.");
        return;
      }
    } else if (typeof productOrName === 'string' && productOrName.trim()) {
      itemKey = productOrName.trim();
    } else {
      console.error("CartProvider: Invalid cart item format", productOrName);
      toast.error("Invalid cart item format.");
      return;
    }

    setCart(prev => {
      const currentQty = prev[itemKey] || 0;
      const newQty = currentQty + delta;

      const matchesSupplement = supplementCatalogue?.some(
        s => s.id === itemKey.split('::')[0] || s.name?.toLowerCase() === (isObject ? productOrName.name?.toLowerCase() : itemKey.toLowerCase())
      );
      
      // Stock validation (Phase 3)
      let maxStock = Infinity;
      if (isObject) {
        if (productOrName.stock?.quantity !== undefined) {
          maxStock = productOrName.stock.quantity;
        } else if (productOrName.variant?.stock?.quantity !== undefined) {
          maxStock = productOrName.variant.stock.quantity;
        }
      }
      if (delta > 0 && newQty > maxStock) {
         toast(`Sorry, we only have ${maxStock} units of this variant in stock.`);
         return prev;
      }

      if (isObject && productOrName.isSupplement) {
      } else if (matchesSupplement) {
      } else {
        const unitSize = isObject ? (productOrName.size || 1) : 1;
        const proposedUnitsToAdd = delta * unitSize;
        const currentPeptideTotal = Object.entries(prev)
          .filter(([key]) => !supplementCatalogue?.some(s => s.name?.toLowerCase() === key.toLowerCase()))
          .reduce((total, [, qty]) => total + qty, 0);

        // Bypass limits for B2B or Wholesale cart types
        if (cartType !== 'wholesale' && cartType !== 'b2b') {
          if (!isProfessional && (currentPeptideTotal + proposedUnitsToAdd > 10)) {
            toast("For security and research compliance, individual guest peptide inquiries are strictly limited to 10 units max. Please log in to a Professional account or contact us for bulk institutional requests.");
            return prev;
          }
        }
      }

      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      const diff = delta;
      
      // Bypass limits for B2B or Wholesale cart types
      if (cartType !== 'wholesale' && cartType !== 'b2b') {
        if (!isProfessional && (currentTotal + diff > 20)) {
          toast("For security and research compliance, individual guest inquiries are limited to 20 units total. Please log in to a Professional account or contact us for bulk institutional requirements.");
          return prev;
        }
      }

      setCartMetadata(mPrev => {
        const currentMeta = mPrev[itemKey] || {};
        // Phase 3: read from canonical pricing.retail.perUnit, fall back to legacy fields
        const newPrice = isObject
          ? (productOrName.variant?.pricing?.retail?.perUnit
              ?? productOrName.pricing?.retail?.perUnit
              ?? productOrName.retailPrice
              ?? productOrName.price
              ?? productOrName.variant?.price)
          : undefined;
        const mNext = { ...mPrev };
        
        if (newQty <= 0) {
          delete mNext[itemKey];
        } else {
          const resolvedName = isObject ? (productOrName.name || productOrName.title) : (currentMeta.name || itemKey.split('::')[0]);
          const resolvedDosage = isObject ? (productOrName.dosage || productOrName.variant?.dosage || productOrName.variant?.strength) : currentMeta.dosage;

          mNext[itemKey] = {
            ...currentMeta,
            name: resolvedName,
            dosage: resolvedDosage,
            price: newPrice !== undefined ? newPrice : currentMeta.price,
            isSupplement: isObject ? (productOrName.productType === 'supplement' || productOrName.productType === 'diagnostic' || productOrName.isSupplement) : currentMeta.isSupplement,
            productId: isObject ? (productOrName.productId || productOrName.id) : (currentMeta.productId || itemKey.split('::')[0]),
            variantId: isObject ? (productOrName.variantId || productOrName.variant?.id || productOrName.id) : (currentMeta.variantId || itemKey.split('::')[1]),
            supplierId: isObject ? (productOrName.supplierId || productOrName.supplier || null) : currentMeta.supplierId,
            type: isObject ? (productOrName.type || 'product') : currentMeta.type
          };
        }
        return mNext;
      });

      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      }

      return { ...prev, [itemKey]: newQty };
    });
  }, [isProfessional, supplementCatalogue, setActiveModal]);

  const removeProtocolBundle = useCallback((bundleId) => {
    setCartMetadata(prev => {
      const next = { ...prev };
      if (next.protocolBundles) {
        next.protocolBundles = next.protocolBundles.filter(b => b.id !== bundleId);
      }
      return next;
    });
    setCart(prev => {
      const next = { ...prev };
      Object.keys(cartMetadata).forEach(key => {
        if (cartMetadata[key]?.protocolId === bundleId) {
          delete next[key];
        }
      });
      return next;
    });
  }, [cartMetadata]);

  // Phase 2: Add Protocol directly via its BOM
  const addProtocolToCart = useCallback((protocol, fullCatalog) => {
    if (!protocol || !protocol.bom || !Array.isArray(protocol.bom)) {
      toast.error('This protocol lacks a structured Bill of Materials (BOM).');
      return;
    }
    
    // Attempt to map BOM items to catalogue
    const itemsToAdd = [];
    let missingItems = false;
    
    protocol.bom.forEach(bomItem => {
      const product = fullCatalog?.find(p => p.id === bomItem.productId);
      if (!product) { missingItems = true; return; }
      
      const variant = product.variants?.find(v => v.id === bomItem.variantId) || product.defaultVariant || product.variants?.[0];
      if (!variant) { missingItems = true; return; }
      
      const dosageStr = variant.dosage || variant.strength;
      itemsToAdd.push({
        id: product.id,
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        dosage: dosageStr,
        price: variant.pricing?.retail?.perUnit || 0, // Simplified, should use resolved price
        qty: bomItem.quantity || 1,
        isSupplement: product.type === 'supplement'
      });
    });

    if (missingItems) {
      toast.error('Some items in this protocol are currently unavailable.');
    }

    if (itemsToAdd.length === 0) return;

    // Use existing array pattern
    updateCart({
      items: itemsToAdd,
      bundle: {
        id: protocol.id,
        name: protocol.name,
        products: itemsToAdd.map(i => i.name)
      }
    }, 1);

  }, [updateCart]);

  const cartBreakdown = useMemo(() => {
    return Object.entries(cart).reduce((acc, [itemKey, qty]) => {
      if (cartMetadata[itemKey]?.isProtocol) {
        acc.protocols += qty;
      } else if (cartMetadata[itemKey]?.isSupplement) {
        acc.kits += qty;
      } else if (itemKey.includes('Kit')) {
        acc.kits += qty;
      } else {
        acc.peptides += qty;
      }
      return acc;
    }, { protocols: 0, kits: 0, peptides: 0 });
  }, [cart, cartMetadata]);

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  // ── Global Cart Event Listeners ──────────────────────────────────────────
  useEffect(() => {
    const handleAddToCartDirect = (e) => {
      const { product, delta = 1, metadata = {} } = e.detail || {};
      if (!product) return;

      updateCart(product, delta);

      const itemKey = product.name;
      if (Object.keys(metadata).length > 0) {
        setCartMetadata(prev => ({
          ...prev,
          [itemKey]: { ...(prev[itemKey] || {}), ...metadata },
        }));
      }

      const rxId  = product.prescriptionId || metadata.prescriptionId || null;
      const docId = product.doctorId       || metadata.supervisingPhysicianId || null;
      if (rxId || docId) {
        setCartOwnership(prev => ({
          ...prev,
          prescriptionId:         rxId  ?? prev.prescriptionId,
          supervisingPhysicianId: docId ?? prev.supervisingPhysicianId,
          source: 'from_prescription',
        }));
      }
      setActiveModal('cart');
    };
    window.addEventListener('add-to-cart-direct', handleAddToCartDirect);
    return () => window.removeEventListener('add-to-cart-direct', handleAddToCartDirect);
  }, [updateCart, setActiveModal]);

  useEffect(() => {
    const handleRxAddToCart = (e) => {
      const { items = [], prescriptionId, source = 'refill', doctorId } = e.detail || {};
      items.forEach(item => {
        if (!item?.productId) {
          console.error("Missing productId in rx-add-to-cart", item);
          toast.error(`Prescription item missing productId: ${item.name || 'Unknown'}`);
          return;
        }
        updateCart(item, item.quantity || 1);
        const itemKey = `${item.productId}::${item.variantId || item.productId}`;
        setCartMetadata(prev => ({
          ...prev,
          [itemKey]: {
            ...(prev[itemKey] || {}),
            prescriptionId,
            source,
            supervisingPhysicianId: doctorId || item.doctorId || null,
          },
        }));
      });
      if (prescriptionId) {
        setCartOwnership(prev => ({
          ...prev,
          prescriptionId,
          source,
          supervisingPhysicianId: doctorId ?? prev.supervisingPhysicianId,
        }));
      }
    };
    window.addEventListener('rx-add-to-cart', handleRxAddToCart);
    return () => window.removeEventListener('rx-add-to-cart', handleRxAddToCart);
  }, [updateCart]);

  const acceptRecommendation = useCallback((recommendation) => {
    if (!recommendation) return;

    const { id, doctorId, adminId, products: recProducts = [], protocols: recProtocols = [], peptides = [] } = recommendation;

    recProducts.forEach(item => {
      if (!item.productId) {
        console.error("Missing productId in doctor recommendation product", item);
        toast.error(`Recommended product missing productId: ${item.name || 'Unknown'}`);
        return;
      }
      if (item.qty > 0) {
        const itemKey = `${item.productId}::${item.variantId || item.productId}`;
        setCart(prev => ({ ...prev, [itemKey]: (prev[itemKey] || 0) + item.qty }));
        setCartMetadata(prev => ({
          ...prev,
          [itemKey]: { ...(prev[itemKey] || {}), source: 'doctor_recommended', recommendationId: id },
        }));
      }
    });

    peptides.forEach(peptide => {
      // Peptides in recommendations should now also be objects with productId
      if (typeof peptide === 'string' || !peptide.productId) {
        console.error("Legacy string peptide or missing productId in doctor recommendation", peptide);
        toast.error(`Legacy format unsupported in recommendation: ${typeof peptide === 'string' ? peptide : peptide.name}`);
        return;
      }
      
      const itemKey = `${peptide.productId}::${peptide.variantId || peptide.productId}`;
      setCart(prev => ({ ...prev, [itemKey]: (prev[itemKey] || 0) + 1 }));
      setCartMetadata(prev => ({
        ...prev,
        [itemKey]: { ...(prev[itemKey] || {}), source: 'doctor_recommended', recommendationId: id },
      }));
    });

    setCartOwnership(prev => ({
      ...prev,
      supervisingPhysicianId: doctorId ?? prev.supervisingPhysicianId,
      supervisingAdminId: adminId ?? prev.supervisingAdminId,
      source: adminId ? 'admin_recommended' : 'doctor_recommended',
      recommendationId: id ?? null,
    }));

    setActiveModal('cart');
  }, [setActiveModal]);

  return (
    <CartContext.Provider value={{
      cart, setCart,
      cartMetadata, setCartMetadata,
      cartOwnership, setCartOwnership,
      updateCart,
      addProtocolToCart,
      removeProtocolBundle,
      cartBreakdown,
      cartCount,
      acceptRecommendation,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

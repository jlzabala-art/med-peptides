/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUIStore } from '../stores/uiStore';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { useTenant } from './TenantContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isProfessional } = useAuth();
  const { setActiveModal } = useUIStore();
  const { supplementCatalogue } = useFirestoreData();
  const { tenantId, tenant } = useTenant();

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('mp_cart');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (e) {
      return {};
    }
  });

  const [cartMetadata, setCartMetadata] = useState({});

  const [cartOwnership, setCartOwnership] = useState({
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

  useEffect(() => {
    localStorage.setItem('mp_cart', JSON.stringify(cart));
  }, [cart]);

  const updateCart = useCallback((productOrName, delta) => {
    if ((delta && delta > 0) || (typeof productOrName === 'object' && productOrName !== null && Array.isArray(productOrName.items))) {
      setActiveModal('cart');
    }

    if (typeof productOrName === 'object' && productOrName !== null && Array.isArray(productOrName.items)) {
      const { items, bundle } = productOrName;
      setCart(prev => {
        const next = { ...prev };
        items.forEach(item => {
          const key = item.label || item.name;
          if (!key) return;
          next[key] = (next[key] || 0) + (item.qty || 1);
        });
        return next;
      });

      if (bundle) {
        setCartMetadata(prev => {
          const next = { ...prev };
          items.forEach(item => {
            const key = item.label || item.name;
            if (!key) return;
            next[key] = {
              isProtocol: true,
              protocolId: bundle.id,
              protocolName: bundle.name,
              source: item.source,
              price: item.price ?? null,
              isSupplement: item.isSupplement ?? false,
            };
          });
          const existingBundles = prev.protocolBundles ?? [];
          const bundleExists = existingBundles.some(b => b.id === bundle.id);
          next.protocolBundles = bundleExists
            ? existingBundles.map(b => b.id === bundle.id ? { ...bundle } : b)
            : [...existingBundles, { ...bundle }];
          return next;
        });
      }
      return;
    }

    const isObject = typeof productOrName === 'object' && productOrName !== null;
    let itemKey = productOrName;
    
    if (isObject) {
      const productName = productOrName.name || 
                          productOrName.displayName || 
                          productOrName.label || 
                          productOrName.title || 
                          productOrName.productName || 
                          productOrName.product_title ||
                          productOrName.slug ||
                          productOrName.id;
                          
      if (productName) {
        let details = [];
        if (productOrName.dosage) details.push(productOrName.dosage);
        if (productOrName.quantity && (productOrName.productType === 'supplement' || productOrName.isSupplement)) {
          details.push(productOrName.quantity);
        }
        const detailsStr = details.filter(Boolean).join(' / ');
        itemKey = detailsStr ? `${productName} (${detailsStr})` : productName;
      } else {
        itemKey = null;
      }
    }
    
    if (!itemKey) {
      console.warn("[CartProvider] updateCart: key is null or undefined for productOrName:", productOrName);
      return;
    }

    setCart(prev => {
      const currentQty = prev[itemKey] || 0;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemKey];
        setCartMetadata(mPrev => {
          const mNext = { ...mPrev };
          delete mNext[itemKey];
          return mNext;
        });
        return next;
      }

      const matchesSupplement = supplementCatalogue?.some(
        s => s.name?.toLowerCase() === itemKey.toLowerCase()
      );
      if (isObject && productOrName.isSupplement) {
      } else if (matchesSupplement) {
      } else {
        const unitSize = isObject ? (productOrName.size || 1) : 1;
        const proposedUnitsToAdd = delta * unitSize;
        const currentPeptideTotal = Object.entries(prev)
          .filter(([key]) => !supplementCatalogue?.some(s => s.name?.toLowerCase() === key.toLowerCase()))
          .reduce((total, [, qty]) => total + qty, 0);

        if (!isProfessional && (currentPeptideTotal + proposedUnitsToAdd > 10)) {
          alert("For security and research compliance, individual guest peptide inquiries are strictly limited to 10 units max. Please log in to a Professional account or contact us for bulk institutional requests.");
          return prev;
        }
      }

      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      const diff = delta;
      if (!isProfessional && (currentTotal + diff > 20)) {
        alert("For security and research compliance, individual guest inquiries are limited to 20 units total. Please log in to a Professional account or contact us for bulk institutional requirements.");
        return prev;
      }

      if (isObject) {
        setCartMetadata(mPrev => {
          let price = productOrName.price ?? null;
          if (price == null && productOrName.pricing?.retail?.perUnit != null) {
            price = productOrName.pricing.retail.perUnit;
          }
          const currentMeta = mPrev[itemKey] || {};
          const mNext = { ...mPrev };
          mNext[itemKey] = {
            ...currentMeta,
            price: price != null ? price : currentMeta.price,
            isSupplement: productOrName.productType === 'supplement' || productOrName.productType === 'diagnostic' || productOrName.isSupplement,
            productId: productOrName.productId || productOrName.id,
            variantId: productOrName.variantId || productOrName.id,
            supplierId: productOrName.supplierId || productOrName.supplier || null
          };
          return mNext;
        });
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
        if (!item?.name) return;
        updateCart({ name: item.name, id: item.id || item.name }, item.quantity || 1);
        setCartMetadata(prev => ({
          ...prev,
          [item.name]: {
            ...(prev[item.name] || {}),
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
      if (item.name && item.qty > 0) {
        setCart(prev => ({ ...prev, [item.name]: (prev[item.name] || 0) + item.qty }));
        setCartMetadata(prev => ({
          ...prev,
          [item.name]: { ...(prev[item.name] || {}), source: 'doctor_recommended', recommendationId: id },
        }));
      }
    });

    peptides.forEach(peptideName => {
      const name = typeof peptideName === 'string' ? peptideName : peptideName.name;
      if (name) {
        setCart(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
        setCartMetadata(prev => ({
          ...prev,
          [name]: { ...(prev[name] || {}), source: 'doctor_recommended', recommendationId: id },
        }));
      }
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
      removeProtocolBundle,
      cartBreakdown,
      cartCount,
      acceptRecommendation
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

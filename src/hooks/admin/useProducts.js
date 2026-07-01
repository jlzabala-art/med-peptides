import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// ── Module-level shared cache ─────────────────────────────────────────────────
// A single Firestore read is shared across all components that call useProducts().
// Subsequent calls within the same session reuse the cached data immediately.
let _cache = null; // { products: [], lastVisible: snap|null }
let _fetchPromise = null; // Ongoing fetch promise (deduplication)
const _listeners = new Set(); // React setState callbacks to notify

function notifyListeners(products) {
  _listeners.forEach((fn) => fn(products));
}

async function fetchAllProducts() {
  const q = query(collection(db, 'products'), orderBy('name'));
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
  _cache = { products, lastVisible };
  dispatchContextEvent(products);
  notifyListeners(products);
  _fetchPromise = null;
  return products;
}

function dispatchContextEvent(productsList) {
  const lowStock = productsList.filter((p) => (p.stock || 0) < 20);
  const outOfStock = productsList.filter((p) => (p.stock || 0) === 0);
  window.dispatchEvent(
    new CustomEvent('admin-context-update', {
      detail: {
        page: 'products',
        totalProducts: productsList.length,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        categories: [...new Set(productsList.map((p) => p.category).filter(Boolean))],
        lowStockItems: lowStock
          .slice(0, 5)
          .map((p) => ({ name: p.name, sku: p.sku, stock: p.stock })),
        summary: `Product catalog: ${productsList.length} products loaded. ${outOfStock.length} out of stock, ${lowStock.length} with low stock (<20 units).`,
      },
    })
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useProducts(allowedCategories = ['All']) {
  const [products, setProducts] = useState(_cache?.products ?? []);
  const [loading, setLoading] = useState(!_cache);

  // Subscribe to cache updates
  useEffect(() => {
    _listeners.add(setProducts);
    return () => _listeners.delete(setProducts);
  }, []);

  // Trigger fetch if not already cached or in-flight
  useEffect(() => {
    if (_cache) {
      setProducts(_cache.products);
      setLoading(false);
      return;
    }
    if (!_fetchPromise) {
      setLoading(true);
      _fetchPromise = fetchAllProducts().finally(() => setLoading(false));
    }
  }, []); // Only run on mount

  // Allow callers to force-refresh (e.g. after creating a product)
  const fetchProducts = useCallback(async () => {
    _cache = null;
    _fetchPromise = null;
    setLoading(true);
    _fetchPromise = fetchAllProducts().finally(() => setLoading(false));
    return _fetchPromise;
  }, []);

  // Apply category filter if requested (client-side, from the shared cache)
  const filtered = !allowedCategories.includes('All')
    ? products.filter((p) => allowedCategories.includes(p.category))
    : products;

  // setProducts also updates the module cache for full-write operations
  const setProductsAndCache = useCallback((updaterOrProducts) => {
    const next =
      typeof updaterOrProducts === 'function'
        ? updaterOrProducts(_cache?.products ?? [])
        : updaterOrProducts;
    _cache = { ...(_cache || {}), products: next };
    notifyListeners(next);
  }, []);

  return {
    products: filtered,
    setProducts: setProductsAndCache,
    loading,
    fetchProducts,
    hasMore: false,
    lastVisible: _cache?.lastVisible ?? null,
  };
}

/**
 * useProducts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches products from Firestore with proper cursor-based pagination.
 * Built on useFirestorePaginatedCollection — never loads all documents.
 *
 * After loading, dispatches a custom DOM event so the AI context panel
 * knows what's on screen (inventory alerts, categories, etc.)
 *
 * @param {string[]} allowedCategories — Filter to specific categories. ['All'] = no filter.
 */
import { useEffect } from 'react';
import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

function dispatchContextEvent(productsList) {
  if (!productsList || productsList.length === 0) return;
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

export function useProducts(allowedCategories = ['All']) {
  // Build where conditions only when categories are restricted
  const whereConditions =
    allowedCategories.includes('All') || allowedCategories.length === 0
      ? []
      : allowedCategories.length === 1
      ? [['category', '==', allowedCategories[0]]]
      : []; // Multiple categories: filter client-side (Firestore doesn't support OR across != field)

  const {
    data: rawProducts,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchProducts,
  } = useFirestorePaginatedCollection('products', {
    whereConditions,
    orderByFields: [['name', 'asc']],
    pageSize: 50,
    onDataLoaded: (newDocs) => {
      // Dispatch context event when new data arrives
      dispatchContextEvent(newDocs);
    },
  });

  // Client-side filter for multiple allowed categories (can't use Firestore OR efficiently)
  const products =
    !allowedCategories.includes('All') && allowedCategories.length > 1
      ? rawProducts.filter((p) => allowedCategories.includes(p.category))
      : rawProducts;

  // Dispatch on full data load
  useEffect(() => {
    if (!loading && products.length > 0) {
      dispatchContextEvent(products);
    }
  }, [loading, products.length]);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchProducts,
    // Legacy compat: some components expect setProducts
    setProducts: () => {},
    lastVisible: null, // Managed internally by hook
  };
}

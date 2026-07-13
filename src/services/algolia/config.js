export const algoliaConfig = {
  indices: {
    products: 'products',
    orders: 'orders',
    // Future indices can be added here
    // customers: 'customers',
  },
  defaultSearchOptions: {
    hitsPerPage: 20,
    typoTolerance: 'min', // Faster exact-ish matching
    attributesToHighlight: ['name', 'sku', 'supplier', 'category'],
  }
};

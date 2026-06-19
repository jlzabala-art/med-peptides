export const algoliaConfig = {
  indices: {
    products: 'products',
    // Future indices can be added here
    // customers: 'customers',
    // orders: 'orders',
  },
  defaultSearchOptions: {
    hitsPerPage: 20,
    typoTolerance: 'min', // Faster exact-ish matching
    attributesToHighlight: ['name', 'sku', 'supplier', 'category'],
  }
};

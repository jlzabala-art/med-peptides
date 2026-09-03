export const algoliaConfig = {
  indices: {
    products: 'products',
    orders: 'orders',
    // Future indices can be added here
    // customers: 'customers',
  },
  defaultSearchOptions: {
    hitsPerPage: 20,
    typoTolerance: true, 
    attributesToHighlight: ['name', 'sku', 'supplier', 'category'],
  }
};

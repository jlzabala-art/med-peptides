export const algoliaConfig = {
  indices: {
    products: 'products',
    protocols: 'protocols',
    prescriptions: 'prescriptions',
    patients: 'atlas_patients',
    orders: 'orders',
    studies: 'clinical_studies'
  },
  defaultSearchOptions: {
    hitsPerPage: 20,
    typoTolerance: true,
    attributesToHighlight: ['name', 'canonicalName', 'sku', 'supplier', 'category', 'goals', 'fdaStatusLabel'],
    attributesForFaceting: [
      'searchable(category)',
      'searchable(goals)',
      'searchable(supplier)',
      'filterOnly(fdaStatus)',
      'filterOnly(isFda503aRecommended)',
      'filterOnly(isFdaApproved)',
      'filterOnly(stock)',
      'filterOnly(hasCoa)',
      'filterOnly(hasGmp)'
    ]
  },
  recommendModels: {
    relatedProducts: 'related-products',
    boughtTogether: 'bought-together',
    trendingItems: 'trending-items'
  }
};


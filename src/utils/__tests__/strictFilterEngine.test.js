import { describe, it, expect } from 'vitest';
import { filterProductVariantsStrictly } from '../strictFilterEngine.js';

describe('strictFilterEngine — Supplier and Brand Catalogue Filtering', () => {
  const sampleProduct = {
    id: 'cjc-1295-ipamorelin',
    name: 'CJC-1295 + Ipamorelin',
    category: 'peptide',
    supplierId: 'supplier-centrico',
    supplierIds: ['supplier-centrico', 'supplier-lotusland'],
    variants: [
      {
        id: 'lotusland-cjc-1295-5mg-5mg',
        productName: 'CJC-1295 without DAC + Ipamorelin',
        supplier: 'LotusLand',
        supplierId: 'supplier-lotusland',
        catalogBrand: 'RegenPept',
        status: 'published',
        isActive: true
      },
      {
        id: 'centrico-cjc-1295-pen',
        productName: 'CJC-1295 + Ipamorelin Pre-filled Pen',
        supplier: 'Centrico',
        supplierId: 'supplier-centrico',
        catalogBrand: 'CentricoPortfolio',
        status: 'active',
        isActive: true
      }
    ]
  };

  const bulkApiProduct = {
    id: 'lotus-calcitonin-raw-api',
    name: 'Calcitonin Peptide (Bulk API)',
    category: 'peptide',
    supplierId: 'supplier-lotusland',
    supplierIds: ['supplier-lotusland'],
    variants: [
      {
        id: 'lotus-calcitonin-5g',
        productName: 'Calcitonin Bulk API 5g',
        supplier: 'LotusLand',
        supplierId: 'supplier-lotusland',
        catalogBrand: 'LotusRawAPIs',
        status: 'active',
        isActive: true
      }
    ]
  };

  it('strictly isolates RegenPept variants and excludes variants from other brands', () => {
    const matched = filterProductVariantsStrictly(sampleProduct, {
      supplierId: 'supplier-lotusland',
      catalogueFilter: 'RegenPept'
    });

    expect(matched.length).toBe(1);
    expect(matched[0].id).toBe('lotusland-cjc-1295-5mg-5mg');
    expect(matched[0].catalogBrand).toBe('RegenPept');
  });

  it('strictly excludes Bulk APIs when filtering by RegenPept catalogue', () => {
    const matched = filterProductVariantsStrictly(bulkApiProduct, {
      supplierId: 'supplier-lotusland',
      catalogueFilter: 'RegenPept'
    });

    expect(matched.length).toBe(0);
  });

  it('correctly handles category normalization (singular vs plural)', () => {
    const matched = filterProductVariantsStrictly(sampleProduct, {
      categoryFilter: 'Peptides'
    });

    expect(matched.length).toBe(2);
  });
});

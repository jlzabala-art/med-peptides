import { describe, test, expect } from 'vitest';
import { validateCatalog as valCat, emptyCatalog as empCat, CATALOG_STATUS, CATALOG_AUDIENCE } from '../../schemas/catalogSchema';

describe('Catalog Builder Schemas & Verification', () => {
  test('emptyCatalog creates valid default skeleton', () => {
    const catalog = empCat({ title: 'Test Catalog', ownerId: 'owner-123' });
    expect(catalog.title).toBe('Test Catalog');
    expect(catalog.ownerId).toBe('owner-123');
    expect(catalog.status).toBe(CATALOG_STATUS.DRAFT || 'draft');
    expect(catalog.pricingVisible).toBe(false);
    expect(catalog.sections).toEqual([]);
  });

  test('validateCatalog detects missing fields', () => {
    const invalidCatalog = {
      title: 'Invalid Catalog'
      // missing status, ownerId, sections, etc.
    };
    const result = valCat(invalidCatalog);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('Missing field'))).toBe(true);
  });

  test('validateCatalog passes for fully formed catalog', () => {
    const validCatalog = empCat({
      id: 'cat-123',
      slug: 'my-catalog',
      title: 'Valid Catalog',
      ownerId: 'wholesaler-1',
      sections: [
        {
          title: 'Longevity Theme',
          description: 'Cellular health peptides',
          products: ['pep-1', 'pep-2'],
          protocols: ['proto-1']
        }
      ]
    });
    
    const result = valCat(validCatalog);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('validateCatalog fails if sections or products are malformed', () => {
    const malformedCatalog = empCat({
      id: 'cat-123',
      slug: 'my-catalog',
      title: 'Valid Catalog',
      ownerId: 'wholesaler-1',
      sections: [
        {
          title: '', // missing title
          products: 'not-an-array',
          protocols: []
        }
      ]
    });

    const result = valCat(malformedCatalog);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('missing title') || e.includes('must be an array'))).toBe(true);
  });
});

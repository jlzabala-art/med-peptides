import { describe, it, expect } from 'vitest';
import { normalizeProduct } from '../mappers';
import { sanitizePublicProduct, SENSITIVE_FINANCIAL_FIELDS } from '../publicDataSanitizer';

describe('Product Traceability & Zero-Trust Public Sanitization', () => {
  const mockRetatrutideRaw = {
    id: 'prod_retatrutide_lotusland',
    name: 'Retatrutide 10mg / vial',
    canonicalName: 'Retatrutide',
    slug: 'retatrutide',
    status: 'active',
    categoryId: 'peptide',
    supplier: 'Lotusland Limited',
    supplierId: 'sup_lotusland_01',
    batchNumber: 'LOT-LOTUS-RT-2026-04A',
    purity: '≥ 99.4%',
    expirationDate: '2028-02-18',
    coaUrl: 'https://storage.googleapis.com/coa/retatrutide-2026.pdf',
    // Sensitive financial fields (internal Lotusland data)
    supplierCost: 45.0,
    cost: 45.0,
    wholesalePrice: 85.0,
    retailPrice: 160.0,
    margin: 115.0,
    pricing: {
      master: { perUnit: 45.0 },
      wholesale: { perUnit: 85.0 },
      retail: { perUnit: 160.0 },
    },
    cost_tiers: {
      cost_20: 42.0,
      cost_50: 38.0,
    },
    internalNotes: 'Exclusive sourcing agreement with Lotusland lab #4',
  };

  const mockVariants = [
    {
      id: 'var_rt_10mg',
      dosage: '10 mg / vial',
      format: 'vial',
      batchNumber: 'LOT-LOTUS-RT-2026-04A',
      supplierId: 'sup_lotusland_01',
      supplierCost: 45.0,
      price: 160.0,
      internalCustomMarkup: 25.0,
      pricing: {
        retail: { perUnit: 160.0 },
        master: { perUnit: 45.0 },
      },
    }
  ];

  it('1. normalizeProduct enriches Retatrutide with schema v2 scientific facts and knownPeptideData', () => {
    const normalized = normalizeProduct(mockRetatrutideRaw, mockRetatrutideRaw.id);

    // Identity & clean name
    expect(normalized.name).toBe('Retatrutide');
    expect(normalized.originalName).toBe('Retatrutide 10mg / vial');

    // Science enriched via knownPeptideData
    expect(normalized.casNumber).toBe('2381089-83-2');
    expect(normalized.molecularWeight).toBe('4731.33');
    expect(normalized.molecularFormula).toBe('C223H343N53O67');
    expect(normalized.targetSystem).toContain('GLP-1');

    // Traceability fields
    expect(normalized.batchNumber).toBe('LOT-LOTUS-RT-2026-04A');
    expect(normalized.purity).toBe('≥ 99.4%');
    expect(normalized.expirationDate).toBe('2028-02-18');
    expect(normalized.coaUrl).toBe('https://storage.googleapis.com/coa/retatrutide-2026.pdf');
  });

  it('2. sanitizePublicProduct guarantees ZERO leakage of prices, costs or margins for open client link', () => {
    const sanitized = sanitizePublicProduct(mockRetatrutideRaw, mockVariants);

    // Critical: ALL sensitive financial fields must be stripped from root
    for (const field of SENSITIVE_FINANCIAL_FIELDS) {
      expect(sanitized[field]).toBeUndefined();
    }
    expect(sanitized.supplierCost).toBeUndefined();
    expect(sanitized.wholesalePrice).toBeUndefined();
    expect(sanitized.retailPrice).toBeUndefined();
    expect(sanitized.pricing).toBeUndefined();
    expect(sanitized.cost_tiers).toBeUndefined();
    expect(sanitized.internalNotes).toBeUndefined();

    // Critical: ALL sensitive financial fields must be stripped from variants
    expect(sanitized.variants).toHaveLength(1);
    const variant = sanitized.variants[0];
    expect(variant.supplierCost).toBeUndefined();
    expect(variant.price).toBeUndefined();
    expect(variant.pricing).toBeUndefined();
    expect(variant.internalCustomMarkup).toBeUndefined();

    // Traceability and quality MUST be preserved to build customer trust
    expect(sanitized.name).toBe('Retatrutide 10mg / vial');
    expect(sanitized.slug).toBe('retatrutide');
    expect(sanitized.batchNumber).toBe('LOT-LOTUS-RT-2026-04A');
    expect(sanitized.purity).toBe('≥ 99.4%');
    expect(sanitized.expirationDate).toBe('2028-02-18');
    expect(sanitized.coaUrl).toBe('https://storage.googleapis.com/coa/retatrutide-2026.pdf');
  });

  it('3. Universal applicability: works identically for other peptides (e.g. BPC-157, Tirzepatide)', () => {
    const mockBpc = {
      id: 'prod_bpc_157',
      name: 'BPC-157 5mg',
      canonicalName: 'BPC-157',
      slug: 'bpc-157',
      status: 'active',
      batchNumber: 'LOT-BPC-2026-09X',
      supplierCost: 12.0,
      pricing: { retail: { perUnit: 48.0 } },
    };

    const normalized = normalizeProduct(mockBpc, mockBpc.id);
    expect(normalized.casNumber).toBe('137525-51-0');
    expect(normalized.molecularWeight).toBe('1419.53');
    expect(normalized.molecularFormula).toBe('C62H98N16O22');
    expect(normalized.batchNumber).toBe('LOT-BPC-2026-09X');

    const sanitized = sanitizePublicProduct(mockBpc, []);
    expect(sanitized.pricing).toBeUndefined();
    expect(sanitized.supplierCost).toBeUndefined();
    expect(sanitized.batchNumber).toBe('LOT-BPC-2026-09X');
  });
});

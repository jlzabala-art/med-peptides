import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePublicProductForViewer } from '../src/lib/supplierSanitizer.js';

test('Rule #73: sanitizePublicProductForViewer strips all supplier leaks for non-admin viewers', () => {
  const rawPellet = {
    id: 'estradiol-25mg',
    sku: 'SKU-PHARM-PEL-E2-25',
    name: '17β-Estradiol 25 mg Pellet',
    canonicalName: 'Pharmapolis Compounding Pharmacy 17β-Estradiol 25 mg',
    shortDescription: 'Manufactured in Bulgaria by Pharmapolis EU GMP.',
    supplier: 'Pharmapolis',
    supplierName: 'Pharmapolis (Bulgaria)',
    manufacturer: 'Pharmapolis Compounding Pharmacy',
    originCountry: 'Bulgaria',
    costPriceEur: 14.5,
    pricing: {
      costPriceEur: 14.5,
      wholesalePriceEur: 29.0,
    },
  };

  const publicView = sanitizePublicProductForViewer(rawPellet, { isAdmin: false });
  const serialized = JSON.stringify(publicView).toLowerCase();

  assert.equal(publicView.supplier, undefined);
  assert.equal(publicView.supplierName, undefined);
  assert.equal(publicView.manufacturer, undefined);
  assert.equal(publicView.originCountry, undefined);
  assert.equal(publicView.costPriceEur, undefined);
  assert.equal(publicView.pricing.costPriceEur, undefined);
  assert.equal(publicView.pricing.wholesalePriceEur, 29.0);
  assert.equal(publicView.sku, 'SKU-EU-PEL-E2-25');
  assert.equal(serialized.includes('pharmapolis'), false);
  assert.equal(serialized.includes('bulgaria'), false);

  const adminView = sanitizePublicProductForViewer(rawPellet, { isAdmin: true });
  assert.equal(adminView.adminSupplierLabel, 'Pharmapolis (Bulgaria)');
  assert.equal(adminView.sku, 'SKU-PHARM-PEL-E2-25');
});

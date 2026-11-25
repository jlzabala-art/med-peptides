import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { sanitizePublicProductForViewer, scrubSupplierText } from '../src/lib/supplierSanitizer.js';

const ROOT = process.cwd();

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

  assert.equal(
    scrubSupplierText('Compounded by Pharmapolis Bulgaria (NP Labs)').toLowerCase().includes('pharmapolis'),
    false
  );
});

test('Rule #73 CI Guard: public navigation, metadata, guides & PDF generators never expose supplier names', () => {
  const publicFilesToAudit = [
    'src/constants/pricingTaxonomy.js',
    'src/app/pricing/pellets/page.jsx',
    'src/app/pricing/bhrt/page.jsx',
    'src/app/pricing/hormones/page.jsx',
    'src/app/pricing/pens/page.jsx',
    'src/lib/pdf/pelletsPriceSchedulePdf.js',
    'src/app/guides/hormone-pellets-implantation/PelletImplantationGuideClient.jsx',
    'src/components/shared/GlobalBottomStickyBar.jsx',
  ];

  // Strip JS comments and internal import/identifier names before checking visible strings
  const stripComments = (src) =>
    src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/^\s*import\s+.*$/gm, '');

  const forbiddenVisiblePattern = /\b(Pharmapolis\s+Bulgaria|Pharmapolis\s+Compounding\s+Pharmacy|Pharmapolis\s+HRT|NP\s+Lab\s+Hormones|NP\s+LABS\s+Hormones|DNLab\s+Pens\s+Schedule)\b/;

  for (const relPath of publicFilesToAudit) {
    const absPath = path.join(ROOT, relPath);
    const content = stripComments(fs.readFileSync(absPath, 'utf8'));
    assert.equal(
      forbiddenVisiblePattern.test(content),
      false,
      `Supplier leak detected in ${relPath}`
    );
  }
});

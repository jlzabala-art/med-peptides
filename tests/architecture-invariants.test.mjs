import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { resolveProductDomain } from '../src/lib/products/productTypeResolver.js';
import {
  TELSTAR_2027_MODELS,
  TELSTAR_SUPPLIER,
  computeTelstarPricing,
  getAllTelstarEquipment,
  getTelstarEquipmentBySlug,
} from '../src/data/telstarLyophilizersRegistry.js';
import { sanitizePublicProductForViewer } from '../src/lib/supplierSanitizer.js';
import { withApiHandler } from '../src/lib/api/withApiHandler.js';
import { computeQuoteRevisionImprovement, ILAPO_SUPPLIER_PROFILE } from '../src/lib/quotations/supplierQuoteRevisions.js';

const ROOT = process.cwd();

describe('Product Domain Resolver (Pillar 1)', () => {
  it('routes Telstar equipment, pellets, Norma, TeleTest, Eterna, cosmetics, injectables, raw APIs, and peptides cleanly', () => {
    assert.equal(resolveProductDomain({ type: 'lab_equipment', categoryId: 'equipment' }, 'telstar-lyoquest-55').domain, 'lab_equipment');
    assert.equal(resolveProductDomain({}, 'telstar-lyobeta-6pl').isLabEquipment, true);
    assert.equal(resolveProductDomain({ category: 'pellet' }, 'estradiol-12-5mg-pellet').domain, 'pellet');
    assert.equal(resolveProductDomain({ brand: 'Norma Hellas' }, 'testosterone-enanthate-norma-250mg').domain, 'norma');
    assert.equal(resolveProductDomain({ brand: 'TeleTest' }, 'teletest-hla').domain, 'teletest');
    assert.equal(resolveProductDomain({ supplierId: 'eternadx' }, 'eterna-proage').domain, 'eterna');
    assert.equal(resolveProductDomain({ category: 'cosmetics' }, 'colway-colvita').domain, 'cosmetics');
    assert.equal(resolveProductDomain({ primaryType: 'aesthetic_injectable' }, 'juvederm-ultra-3').domain, 'aesthetic');
    assert.equal(resolveProductDomain({ type: 'raw_material' }, 'api-bpc-157').domain, 'raw_api');
    assert.equal(resolveProductDomain({ type: 'finished_product' }, 'bpc-157').domain, 'peptide');
  });
});

describe('Syntegon Telstar 2027 Catalog & Supplier Cost Isolation (Rule #73)', () => {
  it('contains all 14 base freeze dryer models with valid 2027 commercial terms and supplier profile', () => {
    assert.equal(TELSTAR_2027_MODELS.length, 14);
    assert.equal(TELSTAR_SUPPLIER.id, 'supplier-syntegon-telstar');
    assert.equal(TELSTAR_SUPPLIER.commercialTerms2027.standardDiscountPct, 0.3);
    assert.equal(TELSTAR_SUPPLIER.commercialTerms2027.sparesDiscountPct, 0);
  });

  it('fixes the 225€ tariff formula bug on FB644045, FB654213, FB638386 (net = 70% of list) and keeps 0% on spares', () => {
    const mini1p = getTelstarEquipmentBySlug('telstar-lyobeta-mini-1p');
    assert.ok(mini1p);
    const fb1 = mini1p.equipmentSpecs.factoryOptions.find((o) => o.sku === 'FB644045');
    const fb2 = mini1p.equipmentSpecs.factoryOptions.find((o) => o.sku === 'FB654213');
    const fb3 = mini1p.equipmentSpecs.factoryOptions.find((o) => o.sku === 'FB638386');
    assert.equal(fb1.netTransferPriceEur, 1625.4);
    assert.equal(fb2.netTransferPriceEur, 264.6);
    assert.equal(fb3.netTransferPriceEur, 267.4);

    const spares0 = computeTelstarPricing(1900, 0);
    assert.equal(spares0.netTransferPriceEur, 1900);
  });

  it('strips netTransferPriceEur, distributorDiscountPct, and master tier for non-admin viewers', () => {
    const rawAll = getAllTelstarEquipment();
    assert.equal(rawAll.length, 14);
    const lyoquest = rawAll[0];

    const publicView = sanitizePublicProductForViewer(lyoquest, { isAdmin: false });
    assert.equal(publicView.brand, 'Telstar — A Syntegon Company');
    assert.ok(publicView.listPriceEur > 0);
    assert.equal(publicView.costPriceEur, undefined);
    assert.equal(publicView.pricing.master, undefined);
    assert.equal(publicView.equipmentSpecs.netTransferPriceEur, undefined);
    assert.equal(publicView.equipmentSpecs.distributorDiscountPct, undefined);
    assert.equal(publicView.equipmentSpecs.factoryOptions[0].netTransferPriceEur, undefined);
    assert.equal(publicView.variants[0].netTransferPriceEur, undefined);
    assert.equal(publicView.variants[0].pricing.master, undefined);

    const adminView = sanitizePublicProductForViewer(lyoquest, { isAdmin: true });
    assert.ok(adminView.equipmentSpecs.netTransferPriceEur > 0);
    assert.ok(adminView.variants[0].pricing.master.perUnit > 0);
  });
});

describe('Canonical API Wrapper withApiHandler (Pillar 6)', () => {
  it('enforces admin auth (403), requireDb (503), Zod validation (400), and requestId envelope on success', async () => {
    const adminRoute = withApiHandler(
      async ({ body }) => ({ echoed: body.name }),
      {
        auth: 'admin',
        requireDb: true,
        bodySchema: z.object({ name: z.string().min(2) }),
        deps: {
          isAdminServerSession: async () => false,
          getDb: () => ({}),
        },
      }
    );
    const res403 = await adminRoute(new Request('http://localhost/api/test', { method: 'POST', body: '{}' }));
    assert.equal(res403.status, 403);

    const dbMissingRoute = withApiHandler(
      async () => ({ ok: true }),
      {
        auth: 'public',
        requireDb: true,
        deps: { isAdminServerSession: async () => false, getDb: () => null },
      }
    );
    const res503 = await dbMissingRoute(new Request('http://localhost/api/test'));
    assert.equal(res503.status, 503);

    const okRoute = withApiHandler(
      async ({ body }) => ({ echoed: body.name }),
      {
        auth: 'admin',
        requireDb: true,
        bodySchema: z.object({ name: z.string().min(2) }),
        deps: { isAdminServerSession: async () => true, getDb: () => ({ ok: true }) },
      }
    );
    const res400 = await okRoute(new Request('http://localhost/api/test', { method: 'POST', body: JSON.stringify({ name: 'a' }) }));
    assert.equal(res400.status, 400);

    const res200 = await okRoute(new Request('http://localhost/api/test', { method: 'POST', body: JSON.stringify({ name: 'Telstar' }) }));
    assert.equal(res200.status, 200);
    const json = await res200.json();
    assert.equal(json.ok, true);
    assert.equal(json.echoed, 'Telstar');
    assert.ok(json.requestId);
    assert.ok(res200.headers.get('x-request-id'));
  });
});

describe('Canonical Drawer & Product Shell Structural Invariants (Pillars 1 & 3)', () => {
  it('ensures Drawer wrappers delegate to GcpSideDrawer without raw <table> or inline <style>', () => {
    const drawerFiles = [
      'src/components/ui/GcpSideDrawer.jsx',
      'src/components/ui/StandardDrawer.jsx',
      'src/components/ui/HighDensityDrawer.jsx',
      'src/components/admin/GCPSplitDrawer.jsx',
      'src/components/ui/UnifiedFiltersDrawer.jsx',
    ];
    for (const rel of drawerFiles) {
      const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      assert.equal(/<style[\s>]/.test(content), false, `${rel} must not embed inline <style>`);
      assert.equal(/<table[\s>]/.test(content), false, `${rel} must not contain raw <table>`);
      if (rel !== 'src/components/ui/GcpSideDrawer.jsx') {
        assert.match(content, /GcpSideDrawer/, `${rel} must delegate to GcpSideDrawer`);
      }
    }

    const shellFiles = [
      'src/components/product/ProductDetailShell.jsx',
      'src/components/product/layouts/LabEquipmentDetail.jsx',
      'src/components/admin/quotations/AdminSupplierQuotationsTab.jsx',
    ];
    for (const rel of shellFiles) {
      const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      assert.equal(/<table[\s>]/.test(content), false, `${rel} must use <DataTable />, never raw <table>`);
    }
  });
});

describe('ilapo Supplier Quotation Revision & Confidentiality (Rule #73)', () => {
  it('computes exact price improvement between R1 (€54) and R2 (€49) for 500 packs', () => {
    const rev = computeQuoteRevisionImprovement({
      previousUnitPrice: 54,
      currentUnitPrice: 49,
      quantity: 500,
      currency: 'EUR',
    });
    assert.equal(rev.unitDelta, -5);
    assert.equal(rev.totalDelta, -2500);
    assert.equal(rev.improvementPct, -9.26);
    assert.equal(rev.isImproved, true);
    assert.equal(ILAPO_SUPPLIER_PROFILE.id, 'supplier-ilapo-germany');
  });

  it('scrubs ilapo supplier references from non-admin public product payloads', () => {
    const scrubbed = sanitizePublicProductForViewer(
      {
        id: 'cerebrolysin',
        name: 'Cerebrolysin · ilapo',
        supplierName: 'ilapo — Internationale Ludwigs-Arzneimittel GmbH & Co. KG',
        variants: [{ id: 'cerebrolysin-ilapo-056500', sku: '056500', supplierId: 'supplier-ilapo-germany', pricing: { master: { perUnit: 49 } } }],
      },
      { isAdmin: false }
    );
    assert.equal(scrubbed.supplierName, undefined);
    assert.equal(scrubbed.name.toLowerCase().includes('ilapo'), false);
    assert.equal(scrubbed.variants[0].pricing.master, undefined);
  });
});

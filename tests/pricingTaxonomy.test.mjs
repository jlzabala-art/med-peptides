import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRICING_GROUPS,
  findPricingGroupByFormat,
  findPricingGroupById,
} from '../src/constants/pricingTaxonomy.js';

describe('Scalable Clinical Pricing Taxonomy', () => {
  it('defines unique group IDs and unique schedule item IDs across all groups', () => {
    const groupIds = new Set();
    const itemIds = new Set();
    for (const g of PRICING_GROUPS) {
      assert.ok(g.id && g.items.length > 0);
      assert.equal(groupIds.has(g.id), false, `Duplicate group id: ${g.id}`);
      groupIds.add(g.id);
      for (const item of g.items) {
        assert.ok(item.id && (item.href.startsWith('/pricing/') || item.href.startsWith('/pricing?')));
        assert.equal(itemIds.has(item.id), false, `Duplicate schedule id: ${item.id}`);
        itemIds.add(item.id);
      }
    }
  });

  it('resolves parent theme groups for peptides, pellets, genomics, and colway', () => {
    assert.equal(findPricingGroupByFormat('peptides')?.id, 'peptides-hormones');
    assert.equal(findPricingGroupByFormat('pellets')?.id, 'peptides-hormones');
    assert.equal(findPricingGroupByFormat('24genetics')?.id, 'genomics');
    assert.equal(findPricingGroupByFormat('colway-hair')?.id, 'derma-collagen');
    assert.equal(findPricingGroupById('cosmetics')?.id, 'derma-collagen');
  });
});

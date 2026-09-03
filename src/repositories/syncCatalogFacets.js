/**
 * syncCatalogFacets.js
 *
 * Utility to sync single-doc _meta/catalog_facets in Firestore.
 * Call this whenever master products or variants are mutated to keep O(1) reads fresh.
 */

const admin = require('firebase-admin');

import { logger } from '../utils/logger';

export async function syncCatalogFacetsDoc(db) {
  try {
    const pSnap = await db.collection('products').get();
    const vSnap = await db.collectionGroup('variants').get();
    const sSnap = await db.collection('suppliers').get();

    const suppliersMap = {};
    sSnap.forEach(d => {
      const s = d.data();
      suppliersMap[d.id] = s.companyName || s.name || s.displayName || d.id;
    });

    const categoriesCount = {};
    const goalsCount = {};
    const presentationsCount = {};
    const suppliersCount = {};

    pSnap.forEach(d => {
      const p = d.data();
      if (p.category) categoriesCount[p.category] = (categoriesCount[p.category] || 0) + 1;
      if (p.goals && Array.isArray(p.goals)) {
        p.goals.forEach(g => goalsCount[g] = (goalsCount[g] || 0) + 1);
      }
    });

    vSnap.forEach(d => {
      const v = d.data();
      if (v.presentation) presentationsCount[v.presentation] = (presentationsCount[v.presentation] || 0) + 1;
      const sId = v.supplier_id || v.supplierId;
      if (sId) suppliersCount[sId] = (suppliersCount[sId] || 0) + 1;
    });

    const categories = Object.keys(categoriesCount).map(c => ({ id: c, name: c, count: categoriesCount[c] }));
    const goals = Object.keys(goalsCount).map(g => ({ id: g, name: g, count: goalsCount[g] }));
    const presentations = Object.keys(presentationsCount).map(p => ({ id: p, name: p, count: presentationsCount[p] }));
    const suppliers = Object.keys(suppliersCount).map(s => ({ id: s, name: suppliersMap[s] || s, count: suppliersCount[s] }));

    await db.collection('_meta').doc('catalog_facets').set({
      categories,
      goals,
      presentations,
      suppliers,
      totalProducts: pSnap.size,
      totalVariants: vSnap.size,
      updatedAt: new Date().toISOString()
    });

    logger.info('[syncCatalogFacetsDoc] _meta/catalog_facets updated.', { totalProducts: pSnap.size, totalVariants: vSnap.size });
  } catch (err) {
    logger.error('[syncCatalogFacetsDoc] Failed to sync facets', { error: err });
  }
}

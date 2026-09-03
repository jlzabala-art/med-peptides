#!/usr/bin/env node
/**
 * scripts/sync_all_algolia_indices.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-Index Algolia Sync Engine
 *
 * Populates and updates all core Algolia indices from Firestore:
 *   1. `products`   → searchable by name, category, goals, mechanisms, purity
 *   2. `protocols`  → searchable by name, goals, phases, clinical summary
 *   3. `users`      → searchable by name, email, role, clinicIds
 *
 * Usage:
 *   node scripts/sync_all_algolia_indices.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

const admin = require('firebase-admin');
const { algoliasearch } = require('algoliasearch');

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '14102Y4B4O';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || process.env.ALGOLIA_API_KEY;

if (!ADMIN_KEY) {
  console.log('ℹ️ ALGOLIA_ADMIN_KEY not set in environment. Skipping direct live index write.');
  console.log('To run sync, execute with: ALGOLIA_ADMIN_KEY=your_key node scripts/sync_all_algolia_indices.cjs');
  process.exit(0);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

async function syncAll() {
  console.log('\n🚀 Starting Algolia Multi-Index Synchronization...');

  // 1. Sync Products
  try {
    const prodSnap = await db.collection('products').get();
    const products = prodSnap.docs.map((d) => {
      const data = d.data();
      return {
        objectID: d.id,
        id: d.id,
        name: data.name || data.title || '',
        category: data.categoryId || data.category || '',
        type: data.type || '',
        goals: data.goals || [],
        mechanisms: data.mechanisms || [],
        status: data.status || 'draft',
        slug: data.slug || d.id,
      };
    });

    if (products.length > 0) {
      await client.saveObjects({ indexName: 'products', objects: products });
      console.log(`✅ Synced ${products.length} products to Algolia.`);
    }
  } catch (e) {
    console.error('❌ Products sync error:', e.message);
  }

  // 2. Sync Protocols
  try {
    const protoSnap = await db.collection('protocols').get();
    const protocols = protoSnap.docs.map((d) => {
      const data = d.data();
      return {
        objectID: d.id,
        id: d.id,
        name: data.name || data.title || '',
        goals: data.goals || [],
        category: data.categoryId || data.category || '',
        description: data.description || data.overview_summary || '',
        status: data.status || 'active',
        slug: data.protocol_slug || data.slug || d.id,
      };
    });

    if (protocols.length > 0) {
      await client.saveObjects({ indexName: 'protocols', objects: protocols });
      console.log(`✅ Synced ${protocols.length} protocols to Algolia.`);
    }
  } catch (e) {
    console.error('❌ Protocols sync error:', e.message);
  }

  console.log('\n✨ Algolia sync complete.\n');
}

syncAll().catch((err) => {
  console.error('Fatal sync error:', err);
});

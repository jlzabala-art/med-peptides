/**
 * Read-only audit script comparing canonical Firestore collections vs deprecated aliases.
 *
 * Usage:
 *   node scripts/audit-firestore-collections.mjs
 */
import { COLLECTIONS, DEPRECATED_COLLECTION_ALIASES } from '../src/constants/canonicalCollections.js';

async function main() {
  const { adminDb } = await import('../src/lib/firebaseAdmin.js');
  if (!adminDb) {
    console.warn('⚠️  [Firestore Audit] Firebase Admin SDK is not configured in this environment; skipping live count.');
    console.table(
      Object.entries(DEPRECATED_COLLECTION_ALIASES).map(([legacy, canonical]) => ({
        legacy,
        canonical,
        legacyCount: 'N/A (no credentials)',
        canonicalCount: 'N/A (no credentials)',
      }))
    );
    process.exit(0);
  }

  console.log('🔍 [Firestore Audit] Counting canonical collections...');
  const canonicalRows = [];
  for (const [key, name] of Object.entries(COLLECTIONS)) {
    try {
      const agg = await adminDb.collection(name).count().get();
      canonicalRows.push({ key, collection: name, count: agg.data().count });
    } catch (err) {
      canonicalRows.push({ key, collection: name, count: `ERR: ${err.message}` });
    }
  }
  console.table(canonicalRows);

  console.log('🔍 [Firestore Audit] Checking deprecated collection aliases...');
  const aliasRows = [];
  for (const [legacy, canonical] of Object.entries(DEPRECATED_COLLECTION_ALIASES)) {
    try {
      const legacyAgg = await adminDb.collection(legacy).count().get();
      const canonicalAgg = await adminDb.collection(canonical).count().get();
      aliasRows.push({
        legacy,
        canonical,
        legacyCount: legacyAgg.data().count,
        canonicalCount: canonicalAgg.data().count,
      });
    } catch (err) {
      aliasRows.push({
        legacy,
        canonical,
        legacyCount: `ERR: ${err.message}`,
        canonicalCount: '-',
      });
    }
  }
  console.table(aliasRows);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ [Firestore Audit] Unexpected error:', err);
  process.exit(1);
});

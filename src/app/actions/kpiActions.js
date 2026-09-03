"use server";

import { adminDb } from '../../lib/firebaseAdmin';

/**
 * Executes server-side aggregations for a collection.
 * 
 * @param {string} collectionName - the name of the Firestore collection
 * @param {Array} filters - array of conditions: [[field, op, value]]
 * @param {Object} aggregations - map of aggregations, e.g. { totalCount: { type: 'count' }, activeCount: { type: 'count', conditions: [['status', '==', 'active']] } }
 */
export async function getCollectionKPIs(collectionName, filters = [], aggregations = {}) {
  try {
    const results = {};
    const colRef = adminDb.collection(collectionName);

    // Apply base filters
    let baseQuery = colRef;
    filters.forEach(([field, op, value]) => {
      baseQuery = baseQuery.where(field, op, value);
    });

    // We can execute all aggregations in parallel
    const promises = Object.entries(aggregations).map(async ([key, aggDef]) => {
      let q = baseQuery;
      
      // If the aggregation has its own extra conditions
      if (aggDef.conditions) {
        aggDef.conditions.forEach(([f, o, v]) => {
          q = q.where(f, o, v);
        });
      }

      if (aggDef.type === 'count') {
        const snapshot = await q.count().get();
        results[key] = snapshot.data().count;
      } else if (aggDef.type === 'sum') {
        // Requires Firebase Admin Node SDK >= 11 for count/sum
        // But for sum, we'd do:
        const snapshot = await q.aggregate({ total: require('firebase-admin/firestore').AggregateField.sum(aggDef.field) }).get();
        results[key] = snapshot.data().total;
      } else if (aggDef.type === 'average') {
        const snapshot = await q.aggregate({ avg: require('firebase-admin/firestore').AggregateField.average(aggDef.field) }).get();
        results[key] = snapshot.data().avg;
      }
    });

    await Promise.all(promises);
    return results;
  } catch (error) {
    console.error(`Error in getCollectionKPIs for ${collectionName}:`, error);
    // Return safe defaults
    const fallback = {};
    Object.keys(aggregations).forEach(k => fallback[k] = 0);
    return fallback;
  }
}

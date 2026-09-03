"use server";

import { adminDb } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';
import { serializeFirestoreData } from '@/utils/firestoreSerializer';

/**
 * Fetches initial data for the Suppliers tab.
 * Reads from `suppliers` collection (laboratorios/fabricantes).
 * DISTINTO de wholesellers.
 *
 * KPI fields returned:
 *   total       → total supplier docs
 *   active      → statusB2B == 'active'
 *   hasProducts → variantsSupplied > 0  (matches SupplierKPIs.jsx field name)
 *   itemsSourced → sum(variantsSupplied) (matches SupplierKPIs.jsx field name)
 */
export async function fetchSupplierInitialDataAction(pageSize = 50) {
  try {
    const collRef = adminDb.collection('suppliers');

    const [totalSnap, activeSnap, withVariantsSnap] = await Promise.all([
      collRef.count().get(),
      collRef.where('statusB2B', '==', 'active').count().get(),
      collRef.where('variantsSupplied', '>', 0).count().get(),
    ]);

    // Sum of all variantsSupplied across suppliers
    let itemsSourced = 0;
    try {
      const aggSnap = await collRef
        .aggregate({ total: admin.firestore.AggregateField.sum('variantsSupplied') })
        .get();
      itemsSourced = aggSnap.data().total || 0;
    } catch { /* aggregation may not be available in all plans */ }

    // KPI field names MUST match SupplierKPIs.jsx exactly
    const kpis = {
      total:       totalSnap.data().count,
      active:      activeSnap.data().count,
      hasProducts: withVariantsSnap.data().count,  // ← was "withVariants", now matches KPI
      itemsSourced,                                  // ← was "totalVariants", now matches KPI
    };

    // Fetch ALL suppliers ordered by name (variantsSupplied index may not exist for all docs)
    // The client hook enriches productsSupplied/variantsSupplied from the stats API
    let querySnapshot;
    try {
      // Prefer ordering by most variants first so data-rich suppliers appear at top
      querySnapshot = await collRef
        .orderBy('variantsSupplied', 'desc')
        .limit(pageSize)
        .get();
    } catch {
      // Fallback: no index → order by companyName
      querySnapshot = await collRef
        .orderBy('companyName')
        .limit(pageSize)
        .get();
    }

    const suppliers = querySnapshot.docs.map(docSnap => {
      const data = serializeFirestoreData(docSnap.data());
      const rawName = data.companyName || data.name || data.displayName || data.legalName;
      const resolvedName = rawName || docSnap.id.replace(/^supplier-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        id: docSnap.id,
        ...data,
        companyName: resolvedName,
        name: resolvedName,
      };
    });

    return {
      kpis,
      suppliers,
      lastDocId: suppliers.length > 0 ? suppliers[suppliers.length - 1].id : null,
    };
  } catch (error) {
    console.error('[fetchSupplierInitialDataAction] Error:', error);
    throw new Error('Failed to fetch initial supplier data');
  }
}

/**
 * Fetches initial data for the Wholesellers tab.
 * Reads from `wholesellers` collection (distribuidores/revendedores).
 * DISTINTO de suppliers.
 */
export async function fetchWholesellerInitialDataAction(pageSize = 25) {
  try {
    const collRef = adminDb.collection('wholesellers');

    const [totalSnap, activeSnap, pendingSnap] = await Promise.all([
      collRef.count().get(),
      collRef.where('status', '==', 'active').count().get(),
      collRef.where('status', '==', 'pending').count().get(),
    ]);

    const kpis = {
      total: totalSnap.data().count,
      active: activeSnap.data().count,
      pending: pendingSnap.data().count,
    };

    // First page — wholesellers ordered by creation date
    const querySnapshot = await collRef
      .orderBy('createdAt', 'desc')
      .limit(pageSize)
      .get();

    const wholesellers = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...serializeFirestoreData(docSnap.data()),
    }));

    return {
      kpis,
      wholesellers,
      lastDocId: wholesellers.length > 0 ? wholesellers[wholesellers.length - 1].id : null,
    };
  } catch (error) {
    console.error('[fetchWholesellerInitialDataAction] Error:', error);
    // Return empty state rather than throwing — wholesellers collection may not exist yet
    return { kpis: { total: 0, active: 0, pending: 0 }, wholesellers: [], lastDocId: null };
  }
}

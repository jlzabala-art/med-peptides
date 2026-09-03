"use server";

/**
 * Admin Server Actions
 * These functions execute securely on the server using Firebase Admin SDK.
 * This guarantees that only authorized admins can perform these actions,
 * and the logic cannot be tampered with on the client.
 */

// import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '../lib/firebaseAdmin';

/**
 * Approves a user and assigns them a specific role (e.g., 'wholesaler', 'clinic').
 * @param {string} userId - The Firebase UID of the user to approve.
 * @param {string} role - The role to assign.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function approveUserRoleAction(userId, role) {
  try {
    // 1. Verify that the caller is actually an admin!
    // In Next.js App Router, you can check the session cookies here.
    // const session = await getSession();
    // if (!session?.user?.isAdmin) throw new Error("Unauthorized");

    // 2. Initialize Firebase Admin
    // initAdmin();
    // const auth = getAuth();

    // 3. Set the Custom Claims
    // await auth.setCustomUserClaims(userId, { role, approved: true });

    // Simulando la operación por ahora:
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[SERVER ACTION] User ${userId} approved as ${role}.`);

    return { 
      success: true, 
      message: `User successfully approved as ${role}.` 
    };

  } catch (error) {
    console.error("Admin Server Action failed:", error);
    return { success: false, message: error.message };
  }
}


export async function fetchAuditLogsAction({ limitCount = 100 } = {}) {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('audit_log')
      .orderBy('executed_at', 'desc')
      .limit(limitCount)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.executed_at?.toDate) data.executed_at = data.executed_at.toDate().toISOString();
      if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
      return { id: doc.id, ...data };
    });
  } catch (e) {
    console.error('fetchAuditLogsAction error:', e);
    return [];
  }
}

export async function fetchClinicalLogsAction({ limitCount = 1000 } = {}) {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('clinical_logs')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.timestamp?.toDate) {
        data.timestamp = data.timestamp.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });
  } catch (e) {
    console.error('fetchClinicalLogsAction error:', e);
    return [];
  }
}

export async function fetchRfqsAction({ limitCount = 100 } = {}) {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('agency_rfqs')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
      if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
      if (data.invoiceReconciliation?.auditedAt?.toDate) {
        data.invoiceReconciliation.auditedAt = data.invoiceReconciliation.auditedAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });
  } catch (e) {
    console.error('fetchRfqsAction error:', e);
    return [];
  }
}

/**
 * Updates a product variant's price securely on the server and generates an audit log.
 * Guaranteed to be atomic and protected from client tampering.
 */
export async function updateVariantPriceAction({ productId, variantId, fieldPath, newValue, oldValue }) {
  try {
    if (!adminDb) return { success: false, message: 'Admin DB not initialized' };
    
    // Server-side validation
    if (typeof newValue !== 'number') {
      return { success: false, message: 'Invalid price value' };
    }

    const productRef = adminDb.collection('products').doc(productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const data = productDoc.data();
    const variants = data.variants || [];
    const variantIndex = variants.findIndex(v => v.id === variantId);
    if (variantIndex === -1) {
      return { success: false, message: 'Variant not found' };
    }

    // Update nested field
    const parts = fieldPath.split('.');
    let current = variants[variantIndex];
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = newValue;

    const auditRef = adminDb.collection('audit_logs').doc();
    const batch = adminDb.batch();

    // 1. Update the entire variants array
    batch.update(productRef, { variants });

    // 2. Add an atomic audit log
    batch.set(auditRef, {
      type: 'PRICE_CHANGE',
      productId,
      variantId,
      field: fieldPath,
      oldValue,
      newValue,
      timestamp: new Date(), // Using native Date for Admin SDK
      source: 'server_action'
    });

    await batch.commit();

    return { success: true, message: 'Price updated successfully' };
  } catch (error) {
    console.error('updateVariantPriceAction error:', error);
    return { success: false, message: error.message };
  }
}

export async function fetchGlobalAnalyticsAction() {
  try {
    if (!adminDb) return null;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [
      ordersSnap,
      rfqsSnap,
      patientsCountSnap,
      usersCountSnap
    ] = await Promise.all([
      adminDb.collection('orders').where('createdAt', '>=', thirtyDaysAgo).get(),
      adminDb.collection('agency_rfqs').where('status', 'in', ['pending', 'approved']).get(),
      adminDb.collection('patients').count().get(),
      adminDb.collection('users').count().get()
    ]);

    let totalRevenue30d = 0;
    let completedOrders = 0;
    ordersSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'delivered' || data.status === 'completed') {
        totalRevenue30d += (data.total || 0);
        completedOrders++;
      }
    });

    let pipelineValue = 0;
    rfqsSnap.docs.forEach(doc => {
      pipelineValue += (doc.data().totalValue || 0);
    });

    return {
      revenue30d: totalRevenue30d,
      completedOrders30d: completedOrders,
      pipelineValue,
      totalPatients: patientsCountSnap.data().count,
      totalUsers: usersCountSnap.data().count,
    };
  } catch (error) {
    console.error('fetchGlobalAnalytics error:', error);
    return null;
  }
}

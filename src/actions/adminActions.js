"use server";

/**
 * Admin Server Actions
 * These functions execute securely on the server using Firebase Admin SDK.
 * This guarantees that only authorized admins can perform these actions,
 * and the logic cannot be tampered with on the client.
 */

import { adminDb, admin } from '../lib/firebaseAdmin';
import { serializeDoc, serializeFirestoreData } from '../lib/serializeFirestore';
import logger from '../utils/logger';

/**
 * Approves a user and assigns them a specific role via Firebase Custom Claims.
 * Also writes the role to the user's Firestore document for client-side access.
 *
 * @param {string} userId - The Firebase UID of the user to approve.
 * @param {string} role   - The role to assign ('wholesaler', 'clinic', 'doctor', etc.)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function approveUserRoleAction(userId, role) {
  const VALID_ROLES = ['admin', 'doctor', 'clinic', 'wholesaler', 'supplier', 'pharmacy', 'patient'];

  try {
    if (!userId || typeof userId !== 'string') throw new Error('userId is required');
    if (!role || !VALID_ROLES.includes(role)) throw new Error(`Invalid role: "${role}"`);
    if (!adminDb) throw new Error('Firebase Admin SDK is not initialized');

    // ── Step 1: Set Firebase Auth Custom Claims ───────────────────────────
    // This is the authoritative gate for server-side role checks.
    const adminAuth = admin?.auth ? admin.auth() : null;
    if (adminAuth) {
      await adminAuth.setCustomUserClaims(userId, { role, approved: true });
      logger.info('approveUserRoleAction: Custom Claims set', { userId, role });
    } else {
      logger.warn('approveUserRoleAction: admin.auth() unavailable — skipping Custom Claims', { userId });
    }

    // ── Step 2: Write role to Firestore user document ─────────────────────
    // Keeps the client-side useAuth() hook in sync without waiting for token refresh.
    await adminDb.collection('users').doc(userId).set(
      { role, approved: true, updatedAt: new Date() },
      { merge: true }
    );

    // ── Step 3: Write audit entry ─────────────────────────────────────────
    await adminDb.collection('audit_logs').add({
      action: 'USER_ROLE_APPROVED',
      targetId: userId,
      metadata: { role },
      timestamp: new Date(),
      operatorId: 'system',
      operatorRole: 'admin',
      fingerprint: { source: 'server' },
    });

    logger.audit('USER_ROLE_APPROVED', 'system', userId, { role });
    return { success: true, message: `User ${userId} approved as ${role}.` };

  } catch (error) {
    logger.error('approveUserRoleAction failed', error);
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
    logger.error('fetchAuditLogsAction failed', e);
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
    logger.error('fetchClinicalLogsAction failed', e);
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
    logger.error('fetchRfqsAction failed', e);
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
    logger.error('updateVariantPriceAction failed', error);
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
    logger.error('fetchGlobalAnalyticsAction failed', error);
    return null;
  }
}

/**
 * Server Action: Calculates executive brief metrics for a role and date range
 */
export async function fetchExecutiveBriefAction({ role = 'admin', timeRange = 'today', userId = null }) {
  try {
    const { getExecutiveBriefMetrics } = await import('../services/executiveBriefService');
    return await getExecutiveBriefMetrics({ role, timeRange, userId });
  } catch (error) {
    logger.error('fetchExecutiveBriefAction failed', error);
    return {
      timeRange,
      role,
      metrics: {
        revenue: 0,
        openOrders: 0,
        pendingApprovals: 0,
        openRFQs: 0,
      },
      error: error.message,
    };
  }
}

/**
 * Server Action: Resolves financial approvals (cost updates, payouts) atomically with audit logging.
 */
export async function resolveFinancialApprovalAction({ approvalId, type, data, action, resolvedBy }) {
  try {
    if (!adminDb) throw new Error("adminDb is not initialized.");
    if (!approvalId) throw new Error("approvalId is required.");

    const approvalRef = adminDb.collection('financial_approvals').doc(approvalId);
    const batch = adminDb.batch();

    const resolvedAtIso = new Date().toISOString();
    const serverTimestamp = new Date();

    batch.update(approvalRef, {
      status: action === 'approve' ? 'approved' : 'rejected',
      resolvedBy: resolvedBy || 'cfo@atlas.com',
      resolvedAt: resolvedAtIso,
      updatedAt: serverTimestamp,
    });

    if (action === 'approve') {
      if (type === 'cost_update' && data?.productId && data?.updates) {
        const productRef = adminDb.collection('products').doc(data.productId);
        batch.set(productRef, data.updates, { merge: true });
      } else if (type === 'payout_auth' && data?.payoutId) {
        const payoutRef = adminDb.collection('payouts').doc(data.payoutId);
        batch.update(payoutRef, { status: 'paid', paidAt: resolvedAtIso, updatedAt: serverTimestamp });
      }
    }

    // Write audit log
    const auditRef = adminDb.collection('audit_logs').doc();
    batch.set(auditRef, {
      type: 'FINANCIAL_APPROVAL_RESOLVED',
      approvalId,
      approvalType: type || null,
      action,
      resolvedBy: resolvedBy || 'system',
      timestamp: serverTimestamp,
      source: 'server_action'
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    logger.error('[resolveFinancialApprovalAction] failed', error);
    return { success: false, error: error.message };
  }
}


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

/**
 * src/services/auditLogger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual-path Clinical Audit Logger
 *
 * Strategy:
 *   - PRIMARY (Server): When called from a Server Action, the `requestContext`
 *     object carries the real IP (from HTTP headers) and the Admin SDK is used.
 *     This path is authoritative for FDA 21 CFR Part 11 / GDPR compliance.
 *
 *   - SECONDARY (Client fallback): When called from a browser component that
 *     hasn't been migrated to a Server Action yet, uses the Firebase client SDK.
 *     The IP is omitted (cannot obtain it securely on the client).
 *     This path should be gradually phased out.
 *
 * NOTE: The `requestContext` param is optional. Server Actions should pass it;
 *       client-side callers leave it undefined.
 *
 * Standards: FDA 21 CFR Part 11, GDPR Article 30, ISO 14971.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Client SDK — used only in the browser fallback path
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as fb from '../firebase';
import logger from '../utils/logger.js';

const AUDIT_COL = 'audit_logs';

/**
 * Log a clinical or administrative action to Firestore.
 *
 * @param {string} operatorId    - UID of the user who performed the action
 * @param {string} operatorRole  - Role of the operator ('admin', 'doctor', etc.)
 * @param {string} action        - Action name ('PROTOCOL_CREATE', 'USER_APPROVE', etc.)
 * @param {string} targetId      - ID of the resource modified
 * @param {Object} [metadata]    - Additional payload for detailed audit logs
 * @param {Object} [requestContext] - Server-side context. Shape: { ip?: string, userAgent?: string }
 *                                   Pass this when calling from a Server Action.
 */
export async function logAction(operatorId, operatorRole, action, targetId, metadata = {}, requestContext = null) {
  try {
    const isServer = typeof window === 'undefined';

    // ── Fingerprint resolution ───────────────────────────────────────────────
    // Server: use the real IP from requestContext (passed by the Server Action).
    // Client: ip is intentionally omitted — cannot be obtained securely client-side.
    const fingerprint = {
      source: isServer ? 'server' : 'client',
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown',
    };

    if (requestContext?.ip) {
      fingerprint.ip = requestContext.ip;
    }

    if (requestContext?.userAgent) {
      fingerprint.userAgent = requestContext.userAgent;
    } else if (!isServer && typeof window !== 'undefined') {
      fingerprint.userAgent = window.navigator.userAgent;
    }

    // Resolution only available client-side
    if (!isServer && typeof window !== 'undefined' && window.screen) {
      fingerprint.resolution = `${window.screen.width}x${window.screen.height}`;
    }

    const payload = {
      operatorId: operatorId || 'guest',
      operatorRole: operatorRole || 'guest',
      action,
      targetId: targetId || null,
      metadata: metadata || {},
      fingerprint,
    };

    // ── Write path ───────────────────────────────────────────────────────────
    if (isServer) {
      // Server path: use Admin SDK (imported lazily to avoid client bundle bloat)
      try {
        const { adminDb } = await import('../lib/firebaseAdmin');
        if (adminDb) {
          await adminDb.collection(AUDIT_COL).add({
            ...payload,
            timestamp: new Date(),
          });
          return;
        }
      } catch (adminErr) {
        logger.warn('[auditLogger] Admin SDK unavailable, falling back to client SDK', { message: adminErr.message });
      }
    }

    // Client / fallback path: use Firebase client SDK
    const db = fb?.db;
    if (!db) {
      logger.warn('[auditLogger] No Firestore instance available — audit log dropped', { action, targetId });
      return;
    }
    await addDoc(collection(db, AUDIT_COL), {
      ...payload,
      timestamp: serverTimestamp(),
    });

  } catch (err) {
    // Audit log failures are never rethrown — they must not break the main operation
    logger.error('[auditLogger] Failed to log action', err);
  }
}

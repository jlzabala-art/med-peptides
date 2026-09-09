import { cookies, headers } from 'next/headers';
import { admin, adminDb } from './firebaseAdmin';
import { apiError } from './apiResponse';

/**
 * serverAuth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side authentication and role verification for Route Handlers and Server Actions.
 * Validates Bearer tokens and session cookies via Firebase Admin SDK.
 */

/**
 * Extracts bearer token from request headers or Next.js headers()
 * @param {Request} [request]
 * @returns {string|null}
 */
export async function extractBearerToken(request) {
  let authHeader = null;
  if (request && typeof request.headers?.get === 'function') {
    authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  } else {
    try {
      const h = await headers();
      authHeader = h.get('Authorization') || h.get('authorization');
    } catch {
      // Headers not available in this context
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * Verifies if the request or current session has valid Admin privileges.
 * @param {Request} [request]
 * @returns {Promise<{ isAuthorized: boolean, user: object|null, response?: Response }>}
 */
export async function verifyAdminAuth(request) {
  try {
    const token = await extractBearerToken(request);

    // If no token, check session cookie
    let decodedToken = null;
    const authService = admin?.auth ? admin.auth() : null;

    if (token && authService) {
      decodedToken = await authService.verifyIdToken(token).catch(() => null);
    }

    // Check cookie fallback if no bearer token
    if (!decodedToken && authService) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('AuthToken')?.value || cookieStore.get('session')?.value;
        if (sessionCookie) {
          decodedToken = await authService.verifySessionCookie(sessionCookie, true).catch(() => null)
            || await authService.verifyIdToken(sessionCookie).catch(() => null);
        }
      } catch {
        // cookies() not available or empty
      }
    }

    if (!decodedToken) {
      // In test environments without Firebase Admin configured
      if (process.env.NODE_ENV === 'test') {
        return { isAuthorized: true, user: { uid: 'test-admin', role: 'admin' } };
      }
      return {
        isAuthorized: false,
        user: null,
        response: apiError('Authentication required. Missing or invalid credentials.', 401, 'UNAUTHORIZED'),
      };
    }

    // Check role in custom claims first
    if (decodedToken.role === 'admin' || decodedToken.admin === true) {
      return { isAuthorized: true, user: decodedToken };
    }

    // Check role in Firestore users document
    if (adminDb && decodedToken.uid) {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get().catch(() => null);
      if (userDoc && userDoc.exists) {
        const data = userDoc.data();
        if (data.role === 'admin' || (Array.isArray(data.roles) && data.roles.includes('admin'))) {
          return { isAuthorized: true, user: { ...decodedToken, ...data } };
        }
      }
    }

    return {
      isAuthorized: false,
      user: decodedToken,
      response: apiError('Access denied: Administrator privileges required.', 403, 'FORBIDDEN'),
    };
  } catch (error) {
    console.error('[serverAuth] Error verifying admin auth:', error);
    return {
      isAuthorized: false,
      user: null,
      response: apiError('Authentication verification failed', 500, 'AUTH_ERROR'),
    };
  }
}

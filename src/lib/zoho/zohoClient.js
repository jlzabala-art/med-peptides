import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Single source of truth for Zoho OAuth access tokens (server-side only).
 * Credentials come exclusively from environment variables
 * (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN).
 * Tokens are cached in Firestore (zoho_token_cache) and in module memory.
 */

const TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';
const EXPIRY_MARGIN_MS = 5 * 60 * 1000;
const DEFAULT_SCOPE = 'ZohoBooks.fullaccess.all ZohoInventory.fullaccess.all';

let memoryToken = null; // { access_token, expires_at }

function hasFullAccess(data) {
  return !data?.scope || data.scope.includes('fullaccess') || data.scope.includes('settings');
}

/**
 * @param {boolean} [forceRefresh=false] Skip caches and refresh via refresh_token.
 * @returns {Promise<string|null>}
 */
export async function getZohoAccessToken(forceRefresh = false) {
  if (!adminDb) return null;
  try {
    const now = Date.now();

    if (!forceRefresh && memoryToken && memoryToken.expires_at > now + EXPIRY_MARGIN_MS) {
      return memoryToken.access_token;
    }

    const cacheCol = adminDb.collection('zoho_token_cache');
    const snapV2 = await cacheCol.doc('access_token_v2').get();
    const dataV2 = snapV2.exists ? snapV2.data() : null;

    if (!forceRefresh && dataV2?.access_token && (dataV2.expires_at || 0) > now + EXPIRY_MARGIN_MS && hasFullAccess(dataV2)) {
      memoryToken = { access_token: dataV2.access_token, expires_at: dataV2.expires_at };
      return dataV2.access_token;
    }

    const snapV1 = await cacheCol.doc('access_token').get();
    const dataV1 = snapV1.exists ? snapV1.data() : null;

    let creds = null;
    if (!process.env.ZOHO_CLIENT_SECRET || !process.env.ZOHO_CLIENT_ID) {
      const snapCreds = await cacheCol.doc('credentials').get().catch(() => null);
      if (snapCreds?.exists) creds = snapCreds.data();
    }

    const refreshToken = dataV2?.refresh_token || dataV1?.refresh_token || process.env.ZOHO_REFRESH_TOKEN || creds?.refresh_token;
    const clientId = process.env.ZOHO_CLIENT_ID || creds?.client_id;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET || creds?.client_secret;

    if (refreshToken && clientId && clientSecret) {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      });
      const resp = await fetch(TOKEN_URL, { method: 'POST', body: params });
      const refreshed = await resp.json();
      if (refreshed.access_token) {
        const expiresAt = now + (refreshed.expires_in || 3600) * 1000;
        const payload = {
          access_token: refreshed.access_token,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          updated_at: now,
          refreshed_at: now,
          scope: refreshed.scope || DEFAULT_SCOPE,
        };
        await cacheCol.doc('access_token_v2').set(payload, { merge: true });
        await cacheCol.doc('access_token').set(payload, { merge: true });
        memoryToken = { access_token: refreshed.access_token, expires_at: expiresAt };
        return refreshed.access_token;
      }
    } else {
      console.warn('[zohoClient] Missing ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN');
    }

    if (!forceRefresh) return dataV2?.access_token || dataV1?.access_token || null;
  } catch (err) {
    console.warn('[zohoClient] Token error:', err.message);
  }
  return null;
}

/**
 * Fetch the authoritative bill PDF from Zoho Books.
 * @returns {Promise<Response>}
 */
export async function fetchBillPdf(billId, orgId) {
  const accessToken = await getZohoAccessToken();
  if (!accessToken) return null;
  const url = `https://www.zohoapis.com/books/v3/bills/${encodeURIComponent(billId)}?organization_id=${orgId}&accept=pdf`;
  return fetch(url, { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } });
}

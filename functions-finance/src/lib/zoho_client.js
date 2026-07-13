"use strict";
/**
 * zoho_client.js — Zoho Books REST API Client
 *
 * Features:
 *  - OAuth2 token refresh (auto-refresh via Zoho refresh token)
 *  - Access token cache in Firestore (avoids re-fetching < 55 min expiry)
 *  - Rate-limit friendly: exponential backoff on 429
 *  - All org_id injected automatically from zoho_config.js
 *
 * Usage:
 *  const zoho = require("./zoho_client");
 *  const items = await zoho.listItems({ filter_by: "Status.Active", per_page: 200 });
 *  await zoho.updateItem(itemId, { custom_fields: [...] });
 */

// Note: Node 22 has native fetch — no node-fetch import needed
const { getFirestore } = require("firebase-admin/firestore");

const {
  ZOHO_ORG_ID,
  ZOHO_BOOKS_BASE_URL,
  ZOHO_BOOKS_BASE_URL_GLOBAL,
  ZOHO_INVENTORY_BASE_URL,
  ZOHO_INVENTORY_BASE_URL_GLOBAL,
  ZOHO_OAUTH_URL,
  ZOHO_OAUTH_URL_GLOBAL,
  ZOHO_SECRETS,
  ZOHO_FIRESTORE,
} = require("./zoho_config");
// ── Secret loader (lazy — only runs in Cloud Functions env) ──────────────────
let _secrets = null;
async function loadSecrets() {
  if (_secrets) return _secrets;
  // In Cloud Functions, secrets are injected as env vars by Secret Manager
  // .trim() removes any trailing newlines injected by echo pipes during setup
  _secrets = {
    clientId:     (process.env[ZOHO_SECRETS.CLIENT_ID]     || "").trim(),
    clientSecret: (process.env[ZOHO_SECRETS.CLIENT_SECRET] || "").trim(),
    refreshToken: (process.env[ZOHO_SECRETS.REFRESH_TOKEN] || "").trim(),
  };
  if (!_secrets.clientId || !_secrets.clientSecret || !_secrets.refreshToken) {
    throw new Error(
      "Missing Zoho OAuth secrets. Ensure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN are set in Secret Manager."
    );
  }
  return _secrets;
}

// ── Token cache ───────────────────────────────────────────────────────────────
let _memCache     = { token: null, expiresAt: 0 };
let _oauthUrl     = ZOHO_OAUTH_URL;   // starts with ME, may fall back to .com
let _booksUrl     = ZOHO_BOOKS_BASE_URL;
let _inventoryUrl = ZOHO_INVENTORY_BASE_URL;

async function getAccessToken() {
  const now = Date.now();

  // 1. Memory cache (fastest)
  if (_memCache.token && now < _memCache.expiresAt - 60000) {
    return _memCache.token;
  }

  // 2. Firestore cache (survives cold starts)
  const db       = getFirestore();
  const cacheDoc = await db.doc(`${ZOHO_FIRESTORE.TOKEN_CACHE}/access_token_v2`).get();
  if (cacheDoc.exists) {
    const cached = cacheDoc.data();
    if (cached.expires_at > now + 400000) { // Buffer of 6m+
      _memCache = { token: cached.access_token, expiresAt: cached.expires_at };
      // Restore persisted region
      if (cached.oauth_url) _oauthUrl = cached.oauth_url;
      if (cached.books_url) _booksUrl = cached.books_url;
      if (cached.inventory_url) _inventoryUrl = cached.inventory_url;
      return cached.access_token;
    }
  }

  // 3. Fetch new token — try Global first, then ME (.me) as fallback
  const { clientId, clientSecret, refreshToken } = await loadSecrets();
  const params = new URLSearchParams({
    grant_type:    "refresh_token",
    client_id:     clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  let data;
  const urlsToTry = [
    { oauth: ZOHO_OAUTH_URL_GLOBAL, books: ZOHO_BOOKS_BASE_URL_GLOBAL, inv: ZOHO_INVENTORY_BASE_URL_GLOBAL, label: "Global" },
    { oauth: ZOHO_OAUTH_URL,        books: ZOHO_BOOKS_BASE_URL,        inv: ZOHO_INVENTORY_BASE_URL,        label: "ME"     },
  ];

  for (const { oauth, books, inv, label } of urlsToTry) {
    try {
      const resp = await fetch(oauth, { method: "POST", body: params });
      const json = await resp.json();
      if (json.access_token) {
        data = json;
        _oauthUrl = oauth;
        _booksUrl = books;
        _inventoryUrl = inv;
        console.info(`[zoho_client] OAuth OK via ${label} (${oauth})`);
        break;
      }
      console.warn(`[zoho_client] OAuth rejected via ${label}: ${JSON.stringify(json)}`);
    } catch (netErr) {
      console.warn(`[zoho_client] Network error via ${label}: ${netErr.message}`);
    }
  }

  if (!data?.access_token) {
    throw new Error(`Zoho OAuth failed on both ME and global endpoints. Check client credentials.`);
  }

  const expiresAt = now + (data.expires_in || 3600) * 1000;
  _memCache = { token: data.access_token, expiresAt };

  // Persist to Firestore (non-blocking)
  db.doc(`${ZOHO_FIRESTORE.TOKEN_CACHE}/access_token_v2`).set({
    access_token: data.access_token,
    expires_at:   expiresAt,
    refreshed_at: now,
    oauth_url:    _oauthUrl,
    books_url:    _booksUrl,
    inventory_url: _inventoryUrl
  }).catch(() => {/* non-fatal */});

  return data.access_token;
}

// ── Base request (Books) ────────────────────────────────────────────────────────
async function request(method, path, { body, params = {} } = {}, retries = 3) {
  const token  = await getAccessToken();
  const qp     = new URLSearchParams({ organization_id: ZOHO_ORG_ID, ...params });
  const url    = `${_booksUrl}${path}?${qp.toString()}`;

  const options = {
    method,
    headers: {
      "Authorization": `Zoho-oauthtoken ${token}`,
      "Content-Type":  "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const resp = await fetch(url, options);

  // Auto-retry on 429 (rate limit) or 5xx
  if ((resp.status === 429 || resp.status >= 500) && retries > 0) {
    const delay = resp.status === 429 ? 2000 : 1000;
    await new Promise(r => setTimeout(r, delay));
    return request(method, path, { body, params }, retries - 1);
  }

  const data = await resp.json();
  if (!resp.ok || data.code !== 0) {
    throw new Error(`Zoho Books API error [${resp.status}] ${path}: ${JSON.stringify(data)}`);
  }

  return data;
}

// ── Base request (Inventory) ────────────────────────────────────────────────────
async function requestInventory(method, path, { body, params = {} } = {}, retries = 3) {
  const token  = await getAccessToken();
  const qp     = new URLSearchParams({ organization_id: ZOHO_ORG_ID, ...params });
  const url    = `${_inventoryUrl}${path}?${qp.toString()}`;

  const options = {
    method,
    headers: {
      "Authorization": `Zoho-oauthtoken ${token}`,
      "Content-Type":  "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const resp = await fetch(url, options);

  // Auto-retry on 429 (rate limit) or 5xx
  if ((resp.status === 429 || resp.status >= 500) && retries > 0) {
    const delay = resp.status === 429 ? 2000 : 1000;
    await new Promise(r => setTimeout(r, delay));
    return requestInventory(method, path, { body, params }, retries - 1);
  }

  const data = await resp.json();
  if (!resp.ok || data.code !== 0) {
    throw new Error(`Zoho Inventory API error [${resp.status}] ${path}: ${JSON.stringify(data)}`);
  }

  return data;
}

// ── Items API (Uses Inventory) ────────────────────────────────────────────────

async function listAllItems(filters = {}) {
  const allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await requestInventory("GET", "/items", {
      params: { ...filters, page, per_page: 200 },
    });
    allItems.push(...(data.items || []));
    hasMore = data.page_context?.has_more_page === true;
    page++;
  }

  return allItems;
}

async function getItem(itemId) {
  const data = await requestInventory("GET", `/items/${itemId}`);
  return data.item;
}

async function updateItem(itemId, updates) {
  const data = await requestInventory("PUT", `/items/${itemId}`, { body: updates });
  return data.item;
}

async function createItem(itemData) {
  const data = await requestInventory("POST", "/items", { body: itemData });
  return data.item;
}

async function searchItems(name) {
  const data = await requestInventory("GET", "/items", {
    params: { name_contains: name, per_page: 10, filter_by: "Status.All" },
  });
  return data.items || [];
}

// ── Item Groups API (Inventory) ────────────────────────────────────────────────

async function listInventoryItemGroups(filters = {}) {
  const allGroups = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await requestInventory("GET", "/itemgroups", {
      params: { ...filters, page, per_page: 200 },
    });
    allGroups.push(...(data.itemgroups || []));
    hasMore = data.page_context?.has_more_page === true;
    page++;
  }

  return allGroups;
}

async function createInventoryItemGroup(groupData) {
  const data = await requestInventory("POST", "/itemgroups", { body: groupData });
  return data.itemgroup;
}

async function createCompositeItem(itemData) {
  const data = await requestInventory("POST", "/compositeitems", { body: itemData });
  return data.composite_item;
}

// ── Custom Fields ─────────────────────────────────────────────────────────────

async function setItemCustomField(itemId, fieldLabel, value) {
  return updateItem(itemId, {
    custom_fields: [{ label: fieldLabel, value }],
  });
}

// ── Financial & Invoices API ──────────────────────────────────────────────────

async function listInvoices(filters = {}) {
  const data = await request("GET", "/invoices", { params: filters });
  return data.invoices || [];
}

async function listCustomerPayments(filters = {}) {
  const data = await request("GET", "/customerpayments", { params: filters });
  return data.customerpayments || [];
}

async function createInvoice(invoiceData) {
  const data = await request("POST", "/invoices", { body: invoiceData });
  return data.invoice;
}

async function createBill(billData) {
  const data = await request("POST", "/bills", { body: billData });
  return data.bill;
}

// ── Sync audit log ────────────────────────────────────────────────────────────

async function logSyncEvent(event) {
  const db = getFirestore();
  await db.collection(ZOHO_FIRESTORE.SYNC_LOG).add({
    ...event,
    org_id:     ZOHO_ORG_ID,
    created_at: new Date(),
  });
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  listAllItems,
  getItem,
  requestInventory,
  updateItem,
  createItem,
  searchItems,
  listInventoryItemGroups,
  createInventoryItemGroup,
  createCompositeItem,
  setItemCustomField,
  listInvoices,
  listCustomerPayments,
  createInvoice,
  createBill,
  logSyncEvent,
  _request: request,
};

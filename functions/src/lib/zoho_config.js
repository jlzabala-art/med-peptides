"use strict";
/**
 * zoho_config.js — Zoho Books Integration Constants
 *
 * SINGLE SOURCE OF TRUTH for all Zoho credentials and org settings.
 * Import this everywhere — never hardcode org IDs or endpoints.
 *
 * Target entity: MEDILUXE HEALTH SOLUTIONS
 * User ID:       662257014
 * Org ID:        662274409
 * Country:       UAE
 * Currency:      AED
 */

// ── Org Identity ──────────────────────────────────────────────────────────────
const ZOHO_ORG_ID   = "662274409";
const ZOHO_USER_ID  = "662257014";
const ZOHO_CURRENCY = "AED";
const ZOHO_REGION   = "UAE";

// ── API Endpoints ─────────────────────────────────────────────────────────────
// MEDILUXE is UAE org — uses Middle East (.me) regional servers
// If ME fails, zoho_client auto-retries with global (.com)
const ZOHO_BOOKS_BASE_URL      = "https://www.zohoapis.me/books/v3";
const ZOHO_BOOKS_BASE_URL_GLOBAL = "https://www.zohoapis.com/books/v3";
const ZOHO_OAUTH_URL           = "https://accounts.zoho.me/oauth/v2/token";
const ZOHO_OAUTH_URL_GLOBAL    = "https://accounts.zoho.com/oauth/v2/token";

// ── Default request config ────────────────────────────────────────────────────
const ZOHO_DEFAULT_PARAMS = {
  organization_id: ZOHO_ORG_ID,
};

// ── Secret names (Firebase Secret Manager) ───────────────────────────────────
// These must be created in Firebase Console → Functions → Secret Manager
const ZOHO_SECRETS = {
  CLIENT_ID:     "ZOHO_CLIENT_ID",      // Zoho OAuth client ID
  CLIENT_SECRET: "ZOHO_CLIENT_SECRET",  // Zoho OAuth client secret
  REFRESH_TOKEN: "ZOHO_REFRESH_TOKEN",  // Long-lived refresh token
};

// ── Firestore collections ─────────────────────────────────────────────────────
const ZOHO_FIRESTORE = {
  // Bidirectional product mapping: Firebase ↔ Zoho
  SKU_MAPPINGS:     "sku_mappings",
  // Cached Zoho access token (avoids re-fetching on every request)
  TOKEN_CACHE:      "zoho_token_cache",
  // Webhook event log
  WEBHOOK_LOG:      "zoho_webhook_events",
  // Sync audit trail
  SYNC_LOG:         "zoho_sync_log",
};

// ── AED / USD conversion ──────────────────────────────────────────────────────
// Fallback rate if settings/global.exchangeRates.aed is unavailable
const AED_USD_FALLBACK_RATE = 3.67;   // 1 USD ≈ 3.67 AED (fixed peg)

function usdToAed(usd, aedRate = AED_USD_FALLBACK_RATE) {
  return parseFloat((parseFloat(usd) * aedRate).toFixed(2));
}
function aedToUsd(aed, aedRate = AED_USD_FALLBACK_RATE) {
  return parseFloat((parseFloat(aed) / aedRate).toFixed(2));
}

// ── Item custom field label ───────────────────────────────────────────────────
// Must match the label created in Zoho Books → Settings → Custom Fields → Items
const ZOHO_CF_FIREBASE_SKU   = "Firebase SKU";
const ZOHO_CF_FIREBASE_ID    = "Firebase Product ID";

// ── Sync status enum ─────────────────────────────────────────────────────────
const SYNC_STATUS = {
  PENDING:   "pending",
  CONFIRMED: "confirmed",
  REJECTED:  "rejected",
  SYNCED:    "synced",
  ERROR:     "error",
};

// ── Match methods ─────────────────────────────────────────────────────────────
const MATCH_METHOD = {
  AI_AUTO:          "ai_auto",         // AI confidence ≥ 90%
  ADMIN_CONFIRMED:  "admin_confirmed", // Admin approved a suggestion
  MANUAL:           "manual",          // Admin typed in the mapping
};

module.exports = {
  ZOHO_ORG_ID,
  ZOHO_USER_ID,
  ZOHO_CURRENCY,
  ZOHO_REGION,
  ZOHO_BOOKS_BASE_URL,
  ZOHO_BOOKS_BASE_URL_GLOBAL,
  ZOHO_OAUTH_URL,
  ZOHO_OAUTH_URL_GLOBAL,
  ZOHO_DEFAULT_PARAMS,
  ZOHO_SECRETS,
  ZOHO_FIRESTORE,
  AED_USD_FALLBACK_RATE,
  usdToAed,
  aedToUsd,
  ZOHO_CF_FIREBASE_SKU,
  ZOHO_CF_FIREBASE_ID,
  SYNC_STATUS,
  MATCH_METHOD,
};

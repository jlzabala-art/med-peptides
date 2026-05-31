"use strict";

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { listAllItems } = require("../lib/zoho_client");
const { ZOHO_SECRETS } = require("../lib/zoho_config");
const { defineSecret } = require("firebase-functions/params");

const zohoClientId     = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

/**
 * Scheduled function that runs every 30 minutes.
 * It fetches active items from Zoho Books. If an item does not exist in the
 * Firebase 'products' collection (matched by zoho_item_id), it is imported as a 'draft'.
 */
module.exports.syncZohoToFirebase = onSchedule(
  {
    schedule: "every 30 minutes",
    timeZone: "Etc/UTC",
    region: "europe-west1",
    secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken],
  },
  async (event) => {
    const db = getFirestore();
    console.log("[syncZohoToFirebase] Starting auto-discovery of orphaned items...");

    try {
      // We import the 'discover' function directly from ai_sku_sync
      // Note: we require it dynamically or at the top. Let's require it here to avoid circular deps if any.
      const aiSkuSync = require("../http/ai_sku_sync");
      const { AED_USD_FALLBACK_RATE } = require("../lib/zoho_config");

      // Run discovery without AI matching to save costs on the 30-min cron
      // It will still create the orphaned 'zoho_only' and 'firebase_only' mappings.
      const result = await aiSkuSync.discover(db, AED_USD_FALLBACK_RATE, false);
      
      console.log(`[syncZohoToFirebase] Discovery complete: ${result.matched} matched, ${result.auto_confirmed} auto-confirmed, ${result.needs_review} need review.`);
    } catch (err) {
      console.error("[syncZohoToFirebase] Sync failed:", err);
    }
  }
);

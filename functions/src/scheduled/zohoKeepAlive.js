/**
 * zohoKeepAlive.js
 * Scheduled Cloud Function (v2) — Zoho OAuth Keep-Alive
 *
 * Runs every 12 hours to verify Zoho Books credentials, refresh the OAuth token,
 * and save a timestamp log in Firestore. This keeps the refresh_token active
 * and monitors sync channel health.
 */

"use strict";

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const {
  ZOHO_OAUTH_URL,
  ZOHO_OAUTH_URL_GLOBAL,
  ZOHO_SECRETS,
} = require("../lib/zoho_config");

const zohoClientId     = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

// ── Simple Get Access Token Helper ───────────────────────────────────────────
async function getAccessToken(clientId, clientSecret, refreshToken) {
  const urls = [ZOHO_OAUTH_URL, ZOHO_OAUTH_URL_GLOBAL];
  for (const url of urls) {
    try {
      const params = new URLSearchParams({
        grant_type:    "refresh_token",
        client_id:     clientId,
        client_secret: clientSecret.replace(/\n/g, ""),
        refresh_token: refreshToken.replace(/\n/g, ""),
      });
      const res = await fetch(`${url}?${params}`, { 
        method: "POST",
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.access_token) return data.access_token;
    } catch (_) { /* try next */ }
  }
  throw new Error("Could not refresh Zoho OAuth token");
}

module.exports = onSchedule(
  {
    schedule: "every 12 hours",
    timeZone: "Etc/UTC",
    region: "europe-west1",
    secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken],
  },
  async (event) => {
    const db = getFirestore();
    const logRef = db.collection("zoho_sync_logs").doc("keep_alive");

    try {
      console.log("[zohoKeepAlive] Refreshing Zoho Books OAuth token...");
      
      const token = await getAccessToken(
        zohoClientId.value(),
        zohoClientSecret.value(),
        zohoRefreshToken.value()
      );

      const status = {
        lastSuccess: FieldValue.serverTimestamp(),
        status: "healthy",
        error: null,
      };

      await logRef.set(status, { merge: true });
      console.log("[zohoKeepAlive] Zoho connection verified successfully.");
    } catch (err) {
      console.error("[zohoKeepAlive] Keep-alive token refresh failed:", err);
      
      try {
        await logRef.set({
          lastFailure: FieldValue.serverTimestamp(),
          status: "degraded",
          error: err.message,
        }, { merge: true });
      } catch (_) {}
    }
  }
);

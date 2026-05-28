#!/usr/bin/env node
/**
 * zoho_oauth_setup.mjs
 *
 * Helper script to exchange a Zoho "Self Client" authorization code
 * for a long-lived refresh token.
 *
 * Steps:
 *  1. Go to https://api-console.zoho.com → "Self Client"
 *  2. Paste the scope below when asked
 *  3. Copy the generated code (valid 10 minutes)
 *  4. Run: node scripts/zoho_oauth_setup.mjs <code> <client_id> <client_secret>
 *
 * Required scopes (copy exactly):
 *   ZohoBooks.items.READ,ZohoBooks.items.UPDATE,ZohoBooks.settings.READ
 */

import fetch from "node-fetch";

const ZOHO_SCOPES = [
  "ZohoBooks.items.READ",
  "ZohoBooks.items.UPDATE",
  "ZohoBooks.settings.READ",
].join(",");

const [,, code, clientId, clientSecret] = process.argv;

if (!code || !clientId || !clientSecret) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         ZOHO BOOKS OAUTH SETUP — MEDILUXE (662274409)        ║
╚══════════════════════════════════════════════════════════════╝

STEP 1: Go to https://api-console.zoho.com
STEP 2: Click "Self Client" → "Generate Code"
STEP 3: Paste this scope:

  ${ZOHO_SCOPES}

STEP 4: Set duration to "10 minutes"
STEP 5: Click Generate → Copy the code
STEP 6: Also copy your Client ID and Client Secret from that page

STEP 7: Run this command:
  node scripts/zoho_oauth_setup.mjs <CODE> <CLIENT_ID> <CLIENT_SECRET>

Example:
  node scripts/zoho_oauth_setup.mjs 1000.abc123... 1000.XYZ... secretValue
`);
  process.exit(0);
}

console.log("\n🔄 Exchanging authorization code for refresh token...\n");

const params = new URLSearchParams({
  grant_type:    "authorization_code",
  client_id:     clientId,
  client_secret: clientSecret,
  code,
  redirect_uri:  "https://www.zohoapis.com",
});

try {
  const resp = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    body:   params,
  });

  const data = await resp.json();

  if (!data.refresh_token) {
    console.error("❌ Failed to get refresh token:");
    console.error(JSON.stringify(data, null, 2));
    console.error("\nMake sure the code is fresh (valid only 10 min) and the scopes are correct.");
    process.exit(1);
  }

  console.log("✅ SUCCESS — Your Zoho OAuth credentials:\n");
  console.log("┌─────────────────────────────────────────────────────────");
  console.log(`│ REFRESH TOKEN:  ${data.refresh_token}`);
  console.log(`│ ACCESS TOKEN:   ${data.access_token} (expires in ${data.expires_in}s)`);
  console.log("└─────────────────────────────────────────────────────────\n");

  console.log("📋 Now run these commands to save secrets in Firebase:\n");
  console.log(`  firebase functions:secrets:set ZOHO_CLIENT_ID`);
  console.log(`    → paste: ${clientId}\n`);
  console.log(`  firebase functions:secrets:set ZOHO_CLIENT_SECRET`);
  console.log(`    → paste: ${clientSecret}\n`);
  console.log(`  firebase functions:secrets:set ZOHO_REFRESH_TOKEN`);
  console.log(`    → paste: ${data.refresh_token}\n`);

  console.log("✅ Then run: firebase deploy --only functions:skuSyncAgent");

} catch (err) {
  console.error("❌ Request failed:", err.message);
  process.exit(1);
}

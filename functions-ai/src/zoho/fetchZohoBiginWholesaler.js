/**
 * fetchZohoBiginWholesaler.js
 * Cloud Function (v2 HTTP) — Zoho Bigin / Books Wholesaler Lookup
 *
 * Tries to find a wholesaler contact in Zoho Bigin first, falling back to Zoho Books.
 * Search strategies:
 *   1. Search in Bigin by Email.
 *   2. Search in Bigin by Name (Word search).
 *   3. Fallback: Search in Zoho Books by Email.
 *   4. Fallback: Search in Zoho Books by Name.
 */

"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const {
  ZOHO_ORG_ID,
  ZOHO_BOOKS_BASE_URL,
  ZOHO_BOOKS_BASE_URL_GLOBAL,
  ZOHO_OAUTH_URL,
  ZOHO_OAUTH_URL_GLOBAL,
  ZOHO_SECRETS,
} = require("../lib/zoho_config");

const zohoClientId     = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

// Bigin API Regional base endpoints
const BIGIN_BASE_URL_ME = "https://www.zohoapis.me/bigin/v1";
const BIGIN_BASE_URL_COM = "https://www.zohoapis.com/bigin/v1";

// ── OAuth token helper ──
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
      if (!res.ok) throw new Error(`OAuth request failed: ${res.status}`);
      const data = await res.json();
      if (!data.access_token) throw new Error("No access token in response");
      return data.access_token;
    } catch (err) { 
      console.warn(`[Zoho OAuth] Failed for URL ${url}:`, err.message);
    }
  }
  throw new Error("Could not obtain Zoho access token");
}

// ── Bigin API GET ──
async function biginGet(accessToken, path, params = {}) {
  const bases = [BIGIN_BASE_URL_ME, BIGIN_BASE_URL_COM];
  const qs = new URLSearchParams(params);
  
  for (const base of bases) {
    try {
      const url = `${base}${path}?${qs}`;
      const res = await fetch(url, {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        signal: AbortSignal.timeout(8000)
      });
      if (res.status === 404 || res.status === 204) return null; // No content or not found
      if (!res.ok) throw new Error(`Bigin API failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[Bigin API] Request failed for ${base}${path}:`, err.message);
    }
  }
  return null;
}

// ── Zoho Books API GET ──
async function booksGet(accessToken, path, params = {}) {
  const bases = [ZOHO_BOOKS_BASE_URL, ZOHO_BOOKS_BASE_URL_GLOBAL];
  const qs = new URLSearchParams({ organization_id: ZOHO_ORG_ID, ...params });
  
  for (const base of bases) {
    try {
      const url = `${base}${path}?${qs}`;
      const res = await fetch(url, {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        signal: AbortSignal.timeout(8000)
      });
      if (res.status === 404 || res.status === 204) return null;
      if (!res.ok) throw new Error(`Books API failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[Books API] Request failed for ${base}${path}:`, err.message);
    }
  }
  return null;
}

// ── Main Cloud Function ──
exports.fetchZohoBiginWholesaler = onRequest(
  { secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken], cors: true, region: "europe-west1" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const { email, name } = req.body || {};
    if (!email && !name) {
      return res.status(400).json({ error: "At least email or name is required for search" });
    }

    try {
      const accessToken = await getAccessToken(
        zohoClientId.value(),
        zohoClientSecret.value(),
        zohoRefreshToken.value()
      );

      let foundContact = null;
      let source = "";
      let booksContactId = null;

      // ── 1. Search in Zoho Books by Email ──
      if (email) {
        console.log(`[Zoho Books Lookup] Searching Books by email: ${email}`);
        const booksResult = await booksGet(accessToken, "/contacts", { email });
        if (booksResult?.contacts?.length > 0) {
          const contact = booksResult.contacts[0];
          booksContactId = contact.contact_id;
          foundContact = {
            id: contact.contact_id,
            fullName: contact.contact_name || contact.display_name || "",
            email: contact.email || "",
            phone: contact.phone || contact.mobile || "",
            company: contact.company_name || "",
            description: "",
            address: [contact.billing_address?.address, contact.billing_address?.city].filter(Boolean).join(", "),
            city: contact.billing_address?.city || "",
            country: contact.billing_address?.country || ""
          };
          source = "Zoho Books";
        }
      }

      // ── 2. Search in Zoho Books by Name ──
      if (!foundContact && name) {
        console.log(`[Zoho Books Lookup] Searching Books by name: ${name}`);
        const booksResultName = await booksGet(accessToken, "/contacts", { contact_name: name });
        if (booksResultName?.contacts?.length > 0) {
          const contact = booksResultName.contacts[0];
          booksContactId = contact.contact_id;
          foundContact = {
            id: contact.contact_id,
            fullName: contact.contact_name || contact.display_name || "",
            email: contact.email || "",
            phone: contact.phone || contact.mobile || "",
            company: contact.company_name || "",
            description: "",
            address: [contact.billing_address?.address, contact.billing_address?.city].filter(Boolean).join(", "),
            city: contact.billing_address?.city || "",
            country: contact.billing_address?.country || ""
          };
          source = "Zoho Books";
        }
      }

      // Fetch Zoho Books invoices if Books contact ID is resolved
      let booksInvoices = [];
      if (booksContactId) {
        console.log(`[Zoho Books Lookup] Fetching invoices for Books contact ID: ${booksContactId}`);
        const invoicesResult = await booksGet(accessToken, "/invoices", { customer_id: booksContactId });
        if (invoicesResult?.invoices) {
          booksInvoices = invoicesResult.invoices.map(inv => ({
            invoiceId: inv.invoice_id,
            invoiceNumber: inv.invoice_number,
            date: inv.date,
            status: inv.status,
            total: inv.total,
            balance: inv.balance
          }));
        }
      }

      if (foundContact) {
        return res.json({
          found: true,
          source: source,
          contact: foundContact,
          invoices: booksInvoices
        });
      } else {
        return res.json({
          found: false,
          message: "No matching contact found in Zoho Bigin or Zoho Books."
        });
      }

    } catch (err) {
      console.error("[fetchZohoBiginWholesaler] Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

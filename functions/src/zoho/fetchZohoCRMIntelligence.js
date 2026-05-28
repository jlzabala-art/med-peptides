/**
 * fetchZohoCRMIntelligence.js
 * Cloud Function (v2 HTTP) — Zoho Books CRM Intelligence
 *
 * Reads contacts + invoices from Zoho Books, enriches them with:
 *   - private vs corporate classification
 *   - purchase history (products, counts, revenue)
 *   - contact info (email, phone, address)
 * Caches result in Firestore: zoho_crm_cache/intelligence (TTL 6h)
 *
 * Trigger: POST /fetchZohoCRMIntelligence  (admin-only, checks Firebase token)
 */

"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const {
  ZOHO_ORG_ID,
  ZOHO_BOOKS_BASE_URL,
  ZOHO_BOOKS_BASE_URL_GLOBAL,
  ZOHO_OAUTH_URL,
  ZOHO_OAUTH_URL_GLOBAL,
  ZOHO_SECRETS,
  ZOHO_FIRESTORE,
} = require("../lib/zoho_config");

const zohoClientId     = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

// ── Cache TTL: 6 hours ────────────────────────────────────────────────────────
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// ── Retry helper ─────────────────────────────────────────────────────────────
async function retryAsync(fn, attempts = 3, delay = 500) {
  let lastErr;
  let wait = delay;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, wait));
        wait *= 2;
      }
    }
  }
  throw lastErr;
}

// ── Get fresh Zoho access token ───────────────────────────────────────────────
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
      
      const fetchToken = () => fetch(`${url}?${params}`, { 
        method: "POST",
        signal: AbortSignal.timeout(6000)
      }).then(async res => {
        if (!res.ok) throw new Error(`OAuth request failed: ${res.status}`);
        const data = await res.json();
        if (!data.access_token) throw new Error("No access token in response");
        return data.access_token;
      });

      return await retryAsync(fetchToken, 3, 500);
    } catch (err) { 
      console.warn(`[Zoho OAuth] Failed for URL ${url}:`, err.message);
      /* try next url */ 
    }
  }
  throw new Error("Could not obtain Zoho access token after retries");
}

// ── Paginated Zoho API fetch ───────────────────────────────────────────────────
async function zohoGet(accessToken, path, params = {}) {
  const urls = [ZOHO_BOOKS_BASE_URL, ZOHO_BOOKS_BASE_URL_GLOBAL];
  const qs   = new URLSearchParams({ organization_id: ZOHO_ORG_ID, ...params });

  for (const base of urls) {
    try {
      const fetchResource = () => fetch(`${base}${path}?${qs}`, {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        signal: AbortSignal.timeout(8000)
      }).then(async res => {
        if (!res.ok) throw new Error(`Zoho API failed: ${res.status}`);
        return await res.json();
      });

      return await retryAsync(fetchResource, 3, 500);
    } catch (err) {
      console.warn(`[Zoho API] Request failed for base ${base}${path}:`, err.message);
      /* try next */
    }
  }
  return null;
}

// ── Fetch ALL pages of a resource ─────────────────────────────────────────────
async function fetchAll(token, path, key, extraParams = {}) {
  const results = [];
  let page = 1;
  while (true) {
    const data = await zohoGet(token, path, { page, per_page: 200, ...extraParams });
    if (!data) break;
    const items = data[key] || [];
    results.push(...items);
    if (!data.page_context?.has_more_page) break;
    page++;
  }
  return results;
}

// ── Classify contact type ──────────────────────────────────────────────────────
function classifyContact(contact) {
  // Corporate: has a company_name that differs from the person name
  const hasCompany = contact.company_name &&
    contact.company_name.trim() !== "" &&
    contact.company_name.toLowerCase() !== (contact.contact_name || "").toLowerCase();
  return hasCompany ? "corporate" : "private";
}

// ── Extract mobile phone ───────────────────────────────────────────────────────
function extractPhone(contact) {
  // Prefer mobile_phone, fallback to phone
  return contact.mobile || contact.phone || "";
}

// ── Build enriched customer record ────────────────────────────────────────────
function buildCustomerRecord(contact, invoices) {
  const myInvoices = invoices.filter(
    inv => inv.customer_id === contact.contact_id && inv.status !== "void"
  );

  // Revenue
  const totalRevenue = myInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const outstanding  = myInvoices.reduce(
    (sum, inv) => sum + (inv.balance || 0), 0
  );

  // Products from line items (already denormalized in invoice summaries)
  const productCounts = {};
  for (const inv of myInvoices) {
    const items = inv.line_items || [];
    for (const li of items) {
      const name = li.name || li.description || "Unknown";
      productCounts[name] = (productCounts[name] || 0) + (li.quantity || 1);
    }
  }
  const productsSorted = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const lastInvoice = myInvoices
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return {
    contact_id:      contact.contact_id,
    name:            contact.contact_name || contact.display_name || "",
    type:            classifyContact(contact),
    company:         contact.company_name || "",
    email:           contact.email || "",
    phone:           extractPhone(contact),
    address:         [
      contact.billing_address?.address,
      contact.billing_address?.city,
      contact.billing_address?.country,
    ].filter(Boolean).join(", "),
    status:          contact.status || "active",

    // Financial
    total_revenue:   Math.round(totalRevenue * 100) / 100,
    outstanding_balance: Math.round(outstanding * 100) / 100,
    invoice_count:   myInvoices.length,
    last_purchase:   lastInvoice?.date || null,

    // Products
    products_bought: productsSorted.map(([name]) => name),
    top_product:     productsSorted[0]?.[0] || null,
    product_detail:  Object.fromEntries(productsSorted),
  };
}

// ── Main Cloud Function ────────────────────────────────────────────────────────
exports.fetchZohoCRMIntelligence = onRequest(
  { secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken], cors: true, region: "europe-west1" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const db = getFirestore();

    try {
      // ── Check Firestore cache first ─────────────────────────────────────────
      const cacheRef = db.collection("zoho_crm_cache").doc("intelligence");
      const forceRefresh = req.body?.force === true;

      if (!forceRefresh) {
        const cached = await cacheRef.get();
        if (cached.exists) {
          const data = cached.data();
          const age  = Date.now() - (data.cachedAt?.toMillis?.() || 0);
          if (age < CACHE_TTL_MS) {
            return res.json({ source: "cache", ...data });
          }
        }
      }

      // ── Fetch live from Zoho Books ──────────────────────────────────────────
      const token = await getAccessToken(
        zohoClientId.value(),
        zohoClientSecret.value(),
        zohoRefreshToken.value()
      );

      const [contacts, invoices] = await Promise.all([
        fetchAll(token, "/contacts", "contacts", { contact_type: "customer" }),
        fetchAll(token, "/invoices", "invoices"),
      ]);

      // ── Enrich each customer ────────────────────────────────────────────────
      // Filter: only active customers with at least one invoice
      const invoicedIds = new Set(invoices.map(inv => inv.customer_id));
      const customers   = contacts
        .filter(c => c.status !== "inactive" || invoicedIds.has(c.contact_id))
        .map(c => buildCustomerRecord(c, invoices))
        .sort((a, b) => b.total_revenue - a.total_revenue);

      // ── Summary stats ───────────────────────────────────────────────────────
      const corporate = customers.filter(c => c.type === "corporate").length;
      const privateC  = customers.filter(c => c.type === "private").length;
      const totalRev  = customers.reduce((s, c) => s + c.total_revenue, 0);
      const topCustomers = customers.slice(0, 20);

      const result = {
        summary: {
          total_customers:    customers.length,
          corporate,
          private:            privateC,
          total_revenue_aed:  Math.round(totalRev * 100) / 100,
          currency:           "AED",
        },
        top_customers: topCustomers,
        cachedAt: FieldValue.serverTimestamp(),
        source: "live",
      };

      // ── Write to Firestore cache ────────────────────────────────────────────
      await cacheRef.set(result);

      return res.json(result);
    } catch (err) {
      console.error("[fetchZohoCRMIntelligence] Live fetch failed, attempting cache fallback:", err);
      try {
        const cacheRef = db.collection("zoho_crm_cache").doc("intelligence");
        const cached = await cacheRef.get();
        if (cached.exists) {
          const data = cached.data();
          return res.json({ source: "cache_fallback", ...data, warning: "Live sync failed: " + err.message });
        }
      } catch (cacheErr) {
        console.error("[fetchZohoCRMIntelligence] Cache fallback failed:", cacheErr);
      }
      return res.status(500).json({ error: err.message });
    }
  }
);

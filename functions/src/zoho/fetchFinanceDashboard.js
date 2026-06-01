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

const zohoClientId = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

async function getAccessToken(clientId, clientSecret, refreshToken) {
  const urls = [ZOHO_OAUTH_URL, ZOHO_OAUTH_URL_GLOBAL];
  for (const url of urls) {
    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret.replace(/\n/g, ""),
        refresh_token: refreshToken.replace(/\n/g, ""),
      });
      const res = await fetch(`${url}?${params}`, { method: "POST", signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.access_token) return data.access_token;
    } catch (err) {
      console.warn(`[Zoho OAuth] Failed for URL ${url}:`, err.message);
    }
  }
  throw new Error("Could not obtain Zoho access token");
}

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
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Books API failed: ${res.status} ${text}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[Books API] Request failed for ${base}${path}:`, err.message);
    }
  }
  return null;
}

exports.fetchFinanceDashboard = onRequest(
  { secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken], cors: true, region: "europe-west1" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { forceRefresh, fromDate, toDate } = req.body || {};

    const db = getFirestore();
    const cacheRef = db.collection("system").doc("finance_dashboard_cache");

    const isCustomDate = fromDate || toDate;

    if (!forceRefresh && !isCustomDate) {
      const cacheDoc = await cacheRef.get();
      if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        const now = Date.now();
        // 4 hours cache
        if (now - cacheData.timestamp < 4 * 60 * 60 * 1000) {
          return res.json({ cached: true, ...cacheData.payload });
        }
      }
    }

    try {
      const accessToken = await getAccessToken(zohoClientId.value(), zohoClientSecret.value(), zohoRefreshToken.value());

      // 1. P&L
      const date = new Date();
      const firstDay = fromDate || new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = toDate || new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const pnlData = await booksGet(accessToken, "/reports/profitandloss", { from_date: firstDay, to_date: lastDay });
      const profitAndLoss = pnlData?.profitandloss || {};

      // 2. Unpaid Invoices
      const unpaidInvoicesRes = await booksGet(accessToken, "/invoices", { status: "unpaid" });
      const overdueInvoicesRes = await booksGet(accessToken, "/invoices", { status: "overdue" });
      const unpaidInvoices = unpaidInvoicesRes?.invoices || [];
      const overdueInvoices = overdueInvoicesRes?.invoices || [];
      
      // Combine unpaid + overdue and remove duplicates just in case
      const allPendingInvoices = [...unpaidInvoices, ...overdueInvoices];
      const pendingMap = new Map();
      allPendingInvoices.forEach(i => pendingMap.set(i.invoice_id, i));
      const finalPendingInvoices = Array.from(pendingMap.values());

      // 3. Lotusland
      let lotuslandData = { id: null, invoices: [], totalBilled: 0 };
      const lotusContacts = await booksGet(accessToken, "/contacts", { contact_name_contains: "Lotusland" });
      if (lotusContacts?.contacts?.length > 0) {
        const id = lotusContacts.contacts[0].contact_id;
        lotuslandData.id = id;
        const lotusInvoices = await booksGet(accessToken, "/invoices", { customer_id: id });
        lotuslandData.invoices = lotusInvoices?.invoices || [];
        lotuslandData.totalBilled = lotuslandData.invoices.reduce((acc, inv) => acc + inv.total, 0);
      }

      // 4. NPLAB
      let nplabData = { id: null, bills: [], totalPaid: 0 };
      const nplabContacts = await booksGet(accessToken, "/contacts", { contact_name_contains: "NPLAB" });
      if (nplabContacts?.contacts?.length > 0) {
        const id = nplabContacts.contacts[0].contact_id;
        nplabData.id = id;
        const nplabBills = await booksGet(accessToken, "/bills", { vendor_id: id });
        nplabData.bills = nplabBills?.bills || [];
        nplabData.totalPaid = nplabData.bills.reduce((acc, b) => acc + b.total, 0);
      }

      const payload = {
        profitAndLoss,
        pendingInvoices: finalPendingInvoices,
        lotuslandData,
        nplabData,
        monthRange: { from: firstDay, to: lastDay }
      };

      if (!isCustomDate) {
        await cacheRef.set({ timestamp: Date.now(), payload });
      }
      return res.json({ cached: false, ...payload });

    } catch (err) {
      console.error("[fetchFinanceDashboard] Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

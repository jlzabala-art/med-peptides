"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { ZOHO_SECRETS } = require("../lib/zoho_config");
const zoho = require("../lib/zoho_client");

const zohoClientId = defineSecret(ZOHO_SECRETS.CLIENT_ID);
const zohoClientSecret = defineSecret(ZOHO_SECRETS.CLIENT_SECRET);
const zohoRefreshToken = defineSecret(ZOHO_SECRETS.REFRESH_TOKEN);

exports.fetchFinanceDashboard = onCall(
  { secrets: [zohoClientId, zohoClientSecret, zohoRefreshToken], cors: true, region: "europe-west1", memory: "512MiB" },
  async (request) => {
    const { forceRefresh, fromDate, toDate } = request.data || {};

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
          return { cached: true, ...cacheData.payload };
        }
      }
    }

    try {
      // 1. P&L Current Period
      const date = new Date();
      const firstDay = fromDate || new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = toDate || new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const pnlData = await zoho._request("GET", "/reports/profitandloss", { params: { from_date: firstDay, to_date: lastDay } });
      const profitAndLoss = pnlData?.profitandloss || {};

      // 1.5 P&L 2026 by Months
      const pnl2026Data = await zoho._request("GET", "/reports/profitandloss", { 
        params: { 
          filter_by: "CustomDate", 
          from_date: "2026-01-01", 
          to_date: "2026-12-31", 
          compare_by: "Months" 
        } 
      });
      const pnl2026 = pnl2026Data?.profitandloss || {};

      // 2. Unpaid Invoices
      const unpaidInvoices = await zoho.listInvoices({ status: "unpaid" });
      const overdueInvoices = await zoho.listInvoices({ status: "overdue" });
      
      // Combine unpaid + overdue and remove duplicates just in case
      const allPendingInvoices = [...unpaidInvoices, ...overdueInvoices];
      const pendingMap = new Map();
      allPendingInvoices.forEach(i => pendingMap.set(i.invoice_id, i));
      const finalPendingInvoices = Array.from(pendingMap.values());

      // 3. Lotusland
      let lotuslandData = { id: null, invoices: [], totalBilled: 0 };
      const lotusContacts = await zoho._request("GET", "/contacts", { params: { contact_name_contains: "Lotusland" } });
      if (lotusContacts?.contacts?.length > 0) {
        const id = lotusContacts.contacts[0].contact_id;
        lotuslandData.id = id;
        const lotusInvoices = await zoho.listInvoices({ customer_id: id });
        lotuslandData.invoices = lotusInvoices || [];
        lotuslandData.totalBilled = lotuslandData.invoices.reduce((acc, inv) => acc + inv.total, 0);
      }

      // 4. NPLAB
      let nplabData = { id: null, bills: [], totalPaid: 0 };
      const nplabContacts = await zoho._request("GET", "/contacts", { params: { contact_name_contains: "NPLAB" } });
      if (nplabContacts?.contacts?.length > 0) {
        const id = nplabContacts.contacts[0].contact_id;
        nplabData.id = id;
        const nplabBills = await zoho._request("GET", "/bills", { params: { vendor_id: id } });
        nplabData.bills = nplabBills?.bills || [];
        nplabData.totalPaid = nplabData.bills.reduce((acc, b) => acc + b.total, 0);
      }

      const payload = {
        profitAndLoss,
        pnl2026,
        pendingInvoices: finalPendingInvoices,
        lotuslandData,
        nplabData,
        monthRange: { from: firstDay, to: lastDay }
      };

      if (!isCustomDate) {
        await cacheRef.set({ timestamp: Date.now(), payload });
      }
      return { cached: false, ...payload };

    } catch (err) {
      throw new HttpsError('internal', err.message);
    }
  }
);

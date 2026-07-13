const { initializeApp } = require("firebase-admin/app");

// Initialize Firebase Admin
initializeApp();

// ── Finance / CFO Advanced Functions ─────────────────────────────────────────
exports.reconcileSupplierInvoice = require("./src/http/reconcile_supplier_invoice").reconcileSupplierInvoice; 
exports.predictiveCashFlow = require("./src/http/predictiveCashFlow").predictiveCashFlow;
exports.stripeWebhook = require("./src/http/stripe_webhook").stripeWebhook;
exports.monitorMarginHealth = require("./src/triggers/monitorMarginHealth").monitorMarginHealth;
exports.auditSupplierPayouts = require("./src/triggers/auditSupplierPayouts").auditSupplierPayouts;
exports.runMonteCarloSimulations = require("./src/http/runMonteCarloSimulations").runMonteCarloSimulations;

// ── Zoho CRM / Bigin / Books Integrations ────────────────────────────────────
const { fetchZohoCRMIntelligence } = require("./src/zoho/fetchZohoCRMIntelligence");
exports.fetchZohoCRMIntelligence = fetchZohoCRMIntelligence; 
exports.pushZohoInvoice = require("./src/http/push_zoho_invoice").pushZohoInvoice;

const { fetchZohoBiginWholesaler } = require("./src/zoho/fetchZohoBiginWholesaler");
exports.fetchZohoBiginWholesaler = fetchZohoBiginWholesaler;

const { fetchFinanceDashboard } = require("./src/zoho/fetchFinanceDashboard");
exports.fetchFinanceDashboard = fetchFinanceDashboard;

const { searchZohoContactByEmail } = require("./src/zoho/searchZohoContactByEmail");
exports.searchZohoContactByEmail = searchZohoContactByEmail;

const { zohoBooksWebhook } = require("./src/zoho/zohoBooksWebhook");
exports.zohoBooksWebhook = zohoBooksWebhook;

exports.createZohoEstimate = require("./src/http/createZohoEstimate").createZohoEstimate;

// ── Webhooks ────────────────────────────────────────────────────────────────
const zohoWebhooks = require("./src/http/zohoWebhooks");
exports.zohoWebhooks = zohoWebhooks.zohoWebhooks;

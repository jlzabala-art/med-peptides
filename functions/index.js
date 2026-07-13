const { initializeApp } = require("firebase-admin/app");
const { gmailUser, gmailAppPass, ga4PropertyId } = require("./src/config");

// Initialize Firebase Admin
initializeApp();

// ── Triggers ─────────────────────────────────────────────────────────────────
// Moved to functions-triggers
exports.generateImpersonationToken = require("./src/users/impersonate").generateImpersonationToken;


// ── HTTP Handlers ────────────────────────────────────────────────────────────
exports.analyticsOverview = require("./src/http/analytics")(ga4PropertyId);
exports.newsletterSubscribe        = require("./src/http/newsletter_subscribe"); // Public — guest email capture
exports.emailIngestWebhook = require('./src/http/email_ingest_webhook').emailIngestWebhook;

// CRON JOBS
// Moved to functions-cron codebase
const { dailyProtocolReview } = require('./src/cron/updateProtocols');
exports.dailyProtocolReview = dailyProtocolReview;


// TRIGGERS
// Moved to functions-triggers
exports.publicProtocols = require('./src/http/api_protocols').publicProtocols;

exports.acceptInvitation           = require("./src/http/acceptInvitation").acceptInvitation;
exports.enrichProductData          = require("./src/http/enrich_product").enrichProductData; // Secure invitation acceptance
exports.generatePaymentLink        = require("./src/http/generatePaymentLink").generatePaymentLink; // Stripe Payment Links
exports.sendEmail                  = require("./src/http/sendEmail").sendEmail; // Secure EmailJS Backend Dispatch

// ── Zoho CRM Intelligence ────────────────────────────────────────────────────
// Moved to functions-finance

// ── Email / Notifications ────────────────────────────────────────────────────
exports.sendEmail = require("./src/http/sendEmail").sendEmail;

// ── Finance / CFO Advanced Functions ─────────────────────────────────────────
// Moved to functions-finance

// ── Order / Prescription / Bulk Order System ──────────────────────────────────
const { submitBulkOrder } = require("./src/http/submit_bulk_order");
exports.submitBulkOrder = submitBulkOrder; // Wholesaler bulk order submission + aggregation (wholesaler only)

// ── Scheduled Tasks ──────────────────────────────────────────────────────────
// Moved to functions-cron codebase

// ── Calendar & Scheduling ───────────────────────────────────────────────────
const calendarAuth = require("./src/http/calendarAuth");
exports.generateCalendarAuthUrl = calendarAuth.generateAuthUrl;
exports.handleCalendarAuthCallback = calendarAuth.handleAuthCallback;

// ── Calendar Sync Triggers ──────────────────────────────────────────────────
// Moved to functions-triggers

const sendReminders = require("./src/scheduled/sendReminders");
// sendReminders cron moved to functions-cron

// -- Backups --
// scheduledFirestoreExport moved to functions-cron
const backupEndpoints = require('./src/http/backup_endpoints');
exports.triggerManualBackup = backupEndpoints.triggerManualBackup;
exports.logGitBackup = backupEndpoints.logGitBackup;

// -- Archiving --
// archiveOldLogs moved to functions-cron

// -- LinkedIn --
const linkedinAuth = require('./src/http/linkedinAuth');
exports.generateLinkedinAuthUrl = linkedinAuth.generateAuthUrl;
exports.handleLinkedinAuthCallback = linkedinAuth.handleAuthCallback;

// linkedinAutoPost moved to functions-triggers

// -- Trending Topics Blog Cron --
// trendingTopicsBlog moved to functions-cron

// -- LinkedIn Token Refresh Cron --
// linkedinTokenRefresh moved to functions-cron

// ── Purchasing (P2P) Placeholder Functions ───────────────────────────────────
const { onCall } = require('firebase-functions/v2/https');
exports.syncPurchaseOrderToZoho = onCall(async (request) => {
  console.log("Placeholder: Sync PO to Zoho", request.data);
  return { success: true, message: "Placeholder only" };
});
exports.syncSupplierBillToZoho = onCall(async (request) => {
  console.log("Placeholder: Sync Bill to Zoho", request.data);
  return { success: true, message: "Placeholder only" };
});

// createZohoEstimate moved to functions-finance

// ── AI Operations ───────────────────────────────────────────────────────────
// Moved to functions-ai codebase

// ── Webhooks ────────────────────────────────────────────────────────────────
// zohoWebhooks moved to functions-finance
exports.processInboundEmail = require('./src/webhooks/inboundEmail').processInboundEmail;
exports.triggerAiOnEmailWorker = require('./src/webhooks/inboundEmail').triggerAiOnEmailWorker;
exports.reprocessEmail = require('./src/http/reprocessEmail').reprocessEmail;
exports.acceptPrescription = require('./src/http/acceptPrescription').acceptPrescription;

// ── Strategic Upgrade (Phase 2) ─────────────────────────────────────────────
exports.calculateRevenueAttribution = require("./src/http/calculateRevenueAttribution").calculateRevenueAttribution;

// ── Strategic Upgrade (Phase 4) ─────────────────────────────────────────────
// Timeline triggers moved to functions-triggers

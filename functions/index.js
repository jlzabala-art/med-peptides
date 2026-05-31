const { initializeApp } = require("firebase-admin/app");
const { gmailUser, gmailAppPass, ga4PropertyId } = require("./src/config");

// Initialize Firebase Admin
initializeApp();

// ── Triggers ─────────────────────────────────────────────────────────────────
exports.onNewOrder    = require("./src/triggers/orders")(gmailUser, gmailAppPass);
exports.onUserCreated = require("./src/triggers/users")(gmailUser, gmailAppPass);

// ── Prescription triggers ─────────────────────────────────────────────────────
const prescriptionTriggers = require("./src/triggers/prescriptions");
exports.onOrderCreatedForRx   = prescriptionTriggers.onOrderCreatedForRx;   // Notifica al médico cuando el paciente hace checkout
exports.onPrescriptionCreated = prescriptionTriggers.onPrescriptionCreated; // Sella precios desde catálogo (server-side)

// ── Refill Reminder trigger ───────────────────────────────────────────────────
// Fires when order.status → 'delivered'. Creates a refill_reminders doc 30 days out.
exports.onOrderDeliveredRefill = require("./src/triggers/refillReminder");  // Schedules 30-day refill reminder for patient


// ── HTTP Handlers ────────────────────────────────────────────────────────────
exports.analyticsOverview = require("./src/http/analytics")(ga4PropertyId);
exports.clinicalAiAssistant        = require("./src/http/ai");                // Agent 1 — RAG + router
exports.prescriptionAiAssistant    = require("./src/http/ai_prescription");   // Agent 2 — Prescription intake
exports.articleAiAssistant         = require("./src/http/ai_article");        // Agent 4 — Blog article analysis
exports.safetyAiAssistant          = require("./src/http/ai_safety");         // Agent 5 — Compliance Guardrail
exports.personalizationAiAssistant = require("./src/http/ai_personalization");// Agent 6 — Onboarding
exports.doctorAiAssistant          = require("./src/http/ai_doctor");         // Agent 8 — Doctor Protocol Builder
exports.financeAiAssistant         = require("./src/http/ai_finance");        // Agent 7 — Financial Intelligence (admin only)
exports.newsletterAiAssistant      = require("./src/http/ai_newsletter");     // AgentNewsletterDigest — weekly personalized digest
exports.newsletterSubscribe        = require("./src/http/newsletter_subscribe"); // Public — guest email capture
exports.skuSyncAgent               = require("./src/http/ai_sku_sync");         // AgentSkuSync — Zoho↔Firebase SKU coordination (admin only)
exports.refineSemanticAgent        = require("./src/http/ai_semantic_refine");   // AgentSemanticRefine — Semantic metadata builder (admin only)
exports.catalogAiAssistant         = require("./src/http/ai_catalog_builder");   // AgentCatalogBuilder — Dynamic Catalog platform (Vertex AI)
exports.parseCOADocument           = require("./src/http/parse_coa_document").parseCOADocument; // COA PDF parsing AI
exports.parseRFQDocument           = require("./src/http/parse_rfq_document").parseRFQDocument; // RFQ PDF parsing AI
exports.parsePriceListDocument = require('./src/http/parse_price_list').parsePriceListDocument;
exports.parseUniversalDocument = require('./src/http/parse_universal_document').parseUniversalDocument;

// CRON JOBS
exports.checkInventoryLevels = require('./src/cron/check_inventory_levels').checkInventoryLevels; 

// TRIGGERS
exports.scoreNewLead = require('./src/triggers/on_lead_created').scoreNewLead;
exports.onProductCreated = require('./src/triggers/products').onProductCreated;
exports.reconcileSupplierInvoice   = require("./src/http/reconcile_supplier_invoice").reconcileSupplierInvoice; // 3-way invoice matching

exports.acceptInvitation           = require("./src/http/acceptInvitation").acceptInvitation; // Secure invitation acceptance
exports.generatePaymentLink        = require("./src/http/generatePaymentLink").generatePaymentLink; // Stripe Payment Links

// ── Zoho CRM Intelligence ────────────────────────────────────────────────────
const { fetchZohoCRMIntelligence } = require("./src/zoho/fetchZohoCRMIntelligence");
exports.fetchZohoCRMIntelligence = fetchZohoCRMIntelligence; // Zoho Books contacts + invoices → CRM cache (admin only)

const { fetchZohoBiginWholesaler } = require("./src/zoho/fetchZohoBiginWholesaler");
exports.fetchZohoBiginWholesaler = fetchZohoBiginWholesaler;

const { searchZohoContactByEmail } = require("./src/zoho/searchZohoContactByEmail");
exports.searchZohoContactByEmail = searchZohoContactByEmail;

const { zohoBooksWebhook } = require("./src/zoho/zohoBooksWebhook");
exports.zohoBooksWebhook = zohoBooksWebhook;

// ── Order / Prescription / Bulk Order System ──────────────────────────────────
const { submitBulkOrder } = require("./src/http/submit_bulk_order");
exports.submitBulkOrder = submitBulkOrder; // Wholesaler bulk order submission + aggregation (wholesaler only)

// ── Scheduled Tasks ──────────────────────────────────────────────────────────
exports.syncPeptideAnalytics = require("./src/scheduled/analytics_sync")(ga4PropertyId);
exports.keepAliveZoho        = require("./src/scheduled/zohoKeepAlive");
exports.syncZohoToFirebase   = require("./src/scheduled/syncZohoToFirebase").syncZohoToFirebase;
exports.nightlySkuDiscovery  = require("./src/scheduled/nightlySkuDiscovery").nightlySkuDiscovery;
exports.adminDailyDigest     = require("./src/scheduled/adminDailyDigest").adminDailyDigest;

// ── Calendar & Scheduling ───────────────────────────────────────────────────
const calendarAuth = require("./src/http/calendarAuth");
exports.generateCalendarAuthUrl = calendarAuth.generateAuthUrl;
exports.handleCalendarAuthCallback = calendarAuth.handleAuthCallback;

const calendarSync = require("./src/triggers/calendarSync");
exports.syncToGoogleCalendar = calendarSync.syncToGoogleCalendar;
exports.protocolDaySync = calendarSync.protocolDaySync;

const sendReminders = require("./src/scheduled/sendReminders");
exports.sendReminders = sendReminders.sendReminders;


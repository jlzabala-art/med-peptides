const { initializeApp } = require("firebase-admin/app");
const { gmailUser, gmailAppPass } = require("./src/config");

// Initialize Firebase Admin
initializeApp();

// ── User & Auth Triggers ─────────────────────────────────────────────────────
exports.onUserCreated = require("./src/triggers/users")(gmailUser, gmailAppPass);
exports.syncProfileToBigin = require("./src/triggers/users_bigin_sync");

// ── Name Normalization Triggers ────────────────────────────────────────────────
const normalizeNames = require("./src/triggers/normalizeNames");
exports.normalizeUserNames = normalizeNames.normalizeUserNames;
exports.normalizePatientNames = normalizeNames.normalizePatientNames;
exports.normalizePrescriptionNames = normalizeNames.normalizePrescriptionNames;

// ── Order Triggers ───────────────────────────────────────────────────────────
exports.onNewOrder    = require("./src/triggers/orders")(gmailUser, gmailAppPass);

const prescriptionTriggers = require("./src/triggers/prescriptions");
exports.onOrderCreatedForRx   = prescriptionTriggers.onOrderCreatedForRx;   
exports.onPrescriptionCreated = prescriptionTriggers.onPrescriptionCreated; 

exports.onOrderDeliveredRefill = require("./src/triggers/refillReminder");

// ── Physician Denormalized Stats Triggers ────────────────────────────────────
// Maintains patientCount, orderCount, totalRevenue, prescriptionCount directly
// on each physician's user doc. Eliminates N+1 queries from the Admin frontend.
const physicianStats = require('./src/triggers/physicianStats');
exports.onPatientRelationshipWritten      = physicianStats.onPatientRelationshipWritten;
exports.onOrderWrittenForPhysician        = physicianStats.onOrderWrittenForPhysician;
exports.onPrescriptionWrittenForPhysician = physicianStats.onPrescriptionWrittenForPhysician;
exports.recalcPhysicianStats              = physicianStats.recalcPhysicianStats;

// ── CRM & Product Triggers ───────────────────────────────────────────────────
exports.syncProductsSupplied = require("./src/triggers/supplierProductsSync").syncProductsSupplied;
exports.scoreNewLead = require('./src/triggers/on_lead_created').scoreNewLead;
exports.onLeadConverted = require('./src/triggers/onLeadConverted').onLeadConverted;
exports.onProductCreated = require('./src/triggers/products').onProductCreated;
exports.updateCatalogStats = require('./src/triggers/catalogStats').updateCatalogStats;
exports.protocolCompute = require('./src/triggers/protocolCompute').protocolCompute;

// ── Materialized View Triggers (Product Usage) ───────────────────────────────
const productUsage = require('./src/triggers/productUsage');
exports.onProtocolWrittenProductUsage = productUsage.onProtocolWrittenProductUsage;
exports.onPrescriptionWrittenProductUsage = productUsage.onPrescriptionWrittenProductUsage;

// ── Materialized View Triggers (_meta/* documents) ───────────────────────────
// Each trigger writes a pre-computed summary doc so API routes and audit
// scripts can read a single document instead of scanning full collections.
const metaGoalsCoverage = require('./src/triggers/metaGoalsCoverage');
exports.metaGoalsCoverageOnProduct = metaGoalsCoverage.metaGoalsCoverageOnProduct;
exports.metaGoalsCoverageOnVariant = metaGoalsCoverage.metaGoalsCoverageOnVariant;

const metaCatalogFacets = require('./src/triggers/metaCatalogFacets');
exports.metaCatalogFacetsOnProduct = metaCatalogFacets.metaCatalogFacetsOnProduct;
exports.metaCatalogFacetsOnVariant = metaCatalogFacets.metaCatalogFacetsOnVariant;

const metaSupplierCoverage = require('./src/triggers/metaSupplierCoverage');
exports.metaSupplierCoverageOnProduct = metaSupplierCoverage.metaSupplierCoverageOnProduct;
exports.metaSupplierCoverageOnVariant = metaSupplierCoverage.metaSupplierCoverageOnVariant;

// ── Algolia Sync Triggers ────────────────────────────────────────────────────
exports.syncProductToAlgolia = require('./src/triggers/algoliaSync').syncProductToAlgolia;
exports.syncProtocolToAlgolia = require('./src/triggers/algoliaSync').syncProtocolToAlgolia;
exports.syncPatientToAlgolia = require('./src/triggers/algoliaSync').syncPatientToAlgolia;
exports.syncClinicToAlgolia = require('./src/triggers/algoliaSync').syncClinicToAlgolia;
exports.syncPhysicianToAlgolia = require('./src/triggers/algoliaSync').syncPhysicianToAlgolia;

// ── Calendar Sync Triggers ───────────────────────────────────────────────────
const calendarSync = require("./src/triggers/calendarSync");
exports.syncToGoogleCalendar = calendarSync.syncToGoogleCalendar;
exports.protocolDaySync = calendarSync.protocolDaySync;

// ── Social & Timeline Triggers ───────────────────────────────────────────────
exports.linkedinAutoPost = require('./src/triggers/linkedinAutoPost').linkedinAutoPost;

const timelineTriggers = require("./src/triggers/timelineTriggers");
exports.onOrderCreatedForTimeline = timelineTriggers.onOrderCreated;
exports.onPatientCreatedForTimeline = timelineTriggers.onPatientCreated;
exports.onTaskCompletedForTimeline = timelineTriggers.onTaskCompleted;

// ── AI Document Processing Pipeline ─────────────────────────────────────────
// Handles uploaded prescription documents → Gemini extraction → comparison
const inboundEmailHandlers = require('./src/webhooks/inboundEmail');
exports.processInboundEmail     = inboundEmailHandlers.processInboundEmail;      // HTTP webhook (SendGrid)
exports.enqueueManualUpload     = inboundEmailHandlers.enqueueManualUpload;      // Firestore trigger → Task Queue
exports.triggerAiOnEmailWorker  = inboundEmailHandlers.triggerAiOnEmailWorker;   // Task Queue worker → Gemini

// ── Product Counters Triggers ────────────────────────────────────────────────
exports.maintainProductProtocolCounters = require('./src/triggers/productCounters').maintainProductProtocolCounters;

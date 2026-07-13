const { initializeApp } = require("firebase-admin/app");
const { gmailUser, gmailAppPass } = require("./src/config");

// Initialize Firebase Admin
initializeApp();

// ── User & Auth Triggers ─────────────────────────────────────────────────────
exports.onUserCreated = require("./src/triggers/users")(gmailUser, gmailAppPass);
exports.syncProfileToBigin = require("./src/triggers/users_bigin_sync");

// ── Order Triggers ───────────────────────────────────────────────────────────
exports.onNewOrder    = require("./src/triggers/orders")(gmailUser, gmailAppPass);

const prescriptionTriggers = require("./src/triggers/prescriptions");
exports.onOrderCreatedForRx   = prescriptionTriggers.onOrderCreatedForRx;   
exports.onPrescriptionCreated = prescriptionTriggers.onPrescriptionCreated; 

exports.onOrderDeliveredRefill = require("./src/triggers/refillReminder");

// ── CRM & Product Triggers ───────────────────────────────────────────────────
exports.scoreNewLead = require('./src/triggers/on_lead_created').scoreNewLead;
exports.onProductCreated = require('./src/triggers/products').onProductCreated;
exports.updateCatalogStats = require('./src/triggers/catalogStats').updateCatalogStats;
exports.protocolCompute = require('./src/triggers/protocolCompute').protocolCompute;

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

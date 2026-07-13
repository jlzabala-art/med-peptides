const { initializeApp } = require("firebase-admin/app");
const { ga4PropertyId } = require("./src/config");

// Initialize Firebase Admin
initializeApp();

// CRON JOBS
exports.checkInventoryLevels = require('./src/cron/check_inventory_levels').checkInventoryLevels; 
const scrapeCompetitors = require('./src/cron/scrapeCompetitors');
exports.scheduledScrapeCompetitors = scrapeCompetitors.scheduledScrapeCompetitors;
exports.forceScrapeCompetitors = scrapeCompetitors.forceScrapeCompetitors;

const weeklyCompetitorDigest = require('./src/cron/weeklyCompetitorDigest');
exports.weeklyCompetitorDigest = weeklyCompetitorDigest.weeklyCompetitorDigest;

// -- Archiving --
exports.archiveOldLogs = require('./src/cron/archiveLogs').archiveOldLogs;

// -- Trending Topics Blog Cron --
exports.trendingTopicsBlog = require('./src/cron/trendingTopicsBlog').trendingTopicsBlog;

// -- LinkedIn Token Refresh Cron --
exports.linkedinTokenRefresh = require('./src/cron/linkedinTokenRefresh').linkedinTokenRefresh;

// ── Scheduled Tasks ──────────────────────────────────────────────────────────
exports.syncPeptideAnalytics = require("./src/scheduled/analytics_sync")(ga4PropertyId);
exports.keepAliveZoho        = require("./src/scheduled/zohoKeepAlive");
exports.syncZohoToFirebase   = require("./src/scheduled/syncZohoToFirebase").syncZohoToFirebase;
exports.nightlySkuDiscovery  = require("./src/scheduled/nightlySkuDiscovery").nightlySkuDiscovery;
exports.adminDailyDigest     = require("./src/scheduled/adminDailyDigest").adminDailyDigest;

// ── Calendar & Scheduling ───────────────────────────────────────────────────
const sendReminders = require("./src/scheduled/sendReminders");
exports.sendReminders = sendReminders.sendReminders;

// -- Backups --
exports.scheduledFirestoreExport = require('./src/triggers/scheduled_backups').scheduledFirestoreExport;


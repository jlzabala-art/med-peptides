const { initializeApp } = require("firebase-admin/app");

// Initialize Firebase Admin
initializeApp();

// ── Shared Utilities & Config ───────────────────────────────────────────────
const { ga4PropertyId } = require("./src/config");

// ── AI Operations ───────────────────────────────────────────────────────────
exports.clinicalAiAssistant        = require("./src/http/ai");                // Agent 1 — RAG + router
exports.prescriptionAiAssistant    = require("./src/http/ai_prescription");   // Agent 2 — Prescription intake
exports.articleAiAssistant         = require("./src/http/ai_article");        // Agent 4 — Blog article analysis
exports.safetyAiAssistant          = require("./src/http/ai_safety");         // Agent 5 — Compliance Guardrail
exports.personalizationAiAssistant = require("./src/http/ai_personalization");// Agent 6 — Onboarding
exports.doctorAiAssistant          = require("./src/http/ai_doctor");         // Agent 8 — Doctor Protocol Builder
exports.financeAiAssistant         = require("./src/http/ai_finance");        // Agent 7 — Financial Intelligence (admin only)
exports.newsletterAiAssistant      = require("./src/http/ai_newsletter");     // AgentNewsletterDigest — weekly personalized digest
exports.skuSyncAgent               = require("./src/http/ai_sku_sync");         // AgentSkuSync — Zoho↔Firebase SKU coordination (admin only)
exports.refineSemanticAgent        = require("./src/http/ai_semantic_refine");   // AgentSemanticRefine — Semantic metadata builder (admin only)
exports.catalogAiAssistant         = require("./src/http/ai_catalog_builder");   // AgentCatalogBuilder — Dynamic Catalog platform (Vertex AI)

exports.parseCOADocument           = require("./src/http/parse_coa_document").parseCOADocument; // COA PDF parsing AI
exports.parseRFQDocument           = require("./src/http/parse_rfq_document").parseRFQDocument; // RFQ PDF parsing AI
exports.parsePriceListDocument     = require('./src/http/parse_price_list').parsePriceListDocument;
exports.parsePriceListImage        = require('./src/http/parse_price_list_image').parsePriceListImage;
exports.parseUniversalDocument     = require('./src/http/parse_universal_document').parseUniversalDocument;
exports.apiParseDocument           = require('./src/http/api_parse_document').apiParseDocument;
exports.refineImportData           = require('./src/http/refine_import_data').refineImportData;

const aiOperations = require("./src/http/aiOperations");
exports.threeWayMatching = aiOperations.threeWayMatching;
exports.analyzeRFQEndpoint = aiOperations.analyzeRFQEndpoint;

// ── DataTable Semantic Search ─────────────────────────────────────────────────
const tableSearch = require('./src/http/table_semantic_search');
exports.tableSemanticSearch = tableSearch.tableSemanticSearch;

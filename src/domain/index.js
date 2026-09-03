/**
 * @/domain/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Shared Domain Kernel for Atlas Health / RegenPept.
 * 
 * Unifies all multi-portal business rules, clinical knowledge graphs, 
 * dynamic multi-channel pricing, formulation safety checks, and offline sync.
 * 
 * Reusable across Admin, Doctor, Clinic, Pharmacy, Wholesaler and Patient portals.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 1. Clinical Knowledge Graph & Genomics
export {
  GENOMIC_SNP_NODES,
  BIOLOGICAL_PATHWAY_NODES,
  GALENIC_VEHICLE_NODES,
  resolveFormulationForGeneTest,
  findSynergies
} from '@/services/clinicalKnowledgeGraph';

// 2. Dynamic Pricing & Cryptographic Quote Signing
export {
  CHANNEL_MARGIN_CONFIG,
  COLD_CHAIN_SURCHARGE,
  EXCHANGE_RATES,
  calculateChannelPrice,
  generateSignedQuoteToken,
  verifySignedQuoteToken
} from '@/services/dynamicPricingEngine';

// 3. Autonomous AI Clinical Guardian & Incompatibility Engine
export {
  INCOMPATIBILITY_RULES,
  auditCompoundSafety,
  auditCertificateOfAnalysis
} from '@/services/clinicalGuardianEngine';

// 4. Local-First Offline Sync Engine
export {
  getLocalEntity,
  saveLocalEntity,
  enqueueOfflineMutation,
  getOfflineSyncQueue,
  clearOfflineMutation,
  flushOfflineSyncQueue
} from '@/lib/offlineSyncEngine';

// 5. Product Quality & Completeness Engine
export {
  calculateProductCompleteness
} from '@/utils/calculateProductCompleteness';

// 6. Product Normalization & Hierarchy
export {
  normalizeProduct,
  getProductAvailableTypes
} from '@/utils/productNormalizer';

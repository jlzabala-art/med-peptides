/**
 * repositories/mappers.js
 * 
 * Anti-Corruption Layer (Data Mappers)
 * This module ensures that all data coming from Firestore is clean, strict, and predictable
 * before it reaches the UI. It prevents React crashes due to legacy data structures.
 */

function safeString(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (typeof val === 'object') {
    // Try to extract known legacy object properties
    if (val.name && typeof val.name === 'string') return val.name;
    if (val.title && typeof val.title === 'string') return val.title;
    if (val.primary && typeof val.primary === 'string') return val.primary;
    if (val.description && typeof val.description === 'string') return val.description;
    if (val.afterMonths) return `${val.afterMonths} months`;
    // If it's an unrecognized object, don't crash, return fallback
    return fallback;
  }
  return fallback;
}

// ── Status normalization helpers ──────────────────────────────────────────────

/** Normalize any prescription status value to canonical lowercase */
const PRESCRIPTION_STATUS_MAP = {
  Draft: 'draft', draft: 'draft',
  Pending: 'pending', pending: 'pending',
  Approved: 'approved', approved: 'approved',
  Processing: 'processing', processing: 'processing',
  'En Tránsito': 'en tránsito', 'en tránsito': 'en tránsito', 'in transit': 'en tránsito',
  Completed: 'completed', completed: 'completed',
  Cancelled: 'cancelled', cancelled: 'cancelled', Canceled: 'cancelled',
};

/** Normalize any prescription line status to canonical lowercase */
const LINE_STATUS_MAP = {
  Pending: 'pending', pending: 'pending',
  Approved: 'approved', approved: 'approved',
  Rejected: 'rejected', rejected: 'rejected',
};

/** Normalize any user/patient status to canonical lowercase */
const USER_STATUS_MAP = {
  active: 'active', Active: 'active',
  inactive: 'archived', Inactive: 'archived',
  archived: 'archived', Archived: 'archived',
  unverified: 'unverified', New: 'unverified', new: 'unverified',
  suspended: 'suspended',
};

/** Normalize order status to canonical lowercase */
const ORDER_STATUS_MAP = {
  draft: 'draft', Draft: 'draft',
  'awaiting payment': 'awaiting payment', 'Awaiting Payment': 'awaiting payment',
  processing: 'processing', Processing: 'processing',
  'en tránsito': 'en tránsito', 'En Tránsito': 'en tránsito', 'in transit': 'en tránsito',
  delivered: 'delivered', Delivered: 'delivered',
  disputed: 'disputed', Disputed: 'disputed',
  cancelled: 'cancelled', Cancelled: 'cancelled', canceled: 'cancelled',
};

export function normalizePrescription(data, id = null) {
  if (data.protocolName || data.followUpDate || data.type || data.patientName || data.doctorName || data.products) {
    console.warn(`mappers.js: Prescription has legacy fields. Please migrate.`, { id });
  }

  // Normalize status to canonical lowercase
  const rawStatus = safeString(data.status, 'draft');
  const status = PRESCRIPTION_STATUS_MAP[rawStatus] ?? rawStatus.toLowerCase();

  // Normalize prescriptionLines statuses
  const prescriptionLines = Array.isArray(data.prescriptionLines)
    ? data.prescriptionLines.map((line) => {
        const rawLineStatus = line.status;
        const lineStatus = LINE_STATUS_MAP[rawLineStatus] ?? rawLineStatus?.toLowerCase() ?? 'pending';
        return { ...line, status: lineStatus };
      })
    : (Array.isArray(data.items) ? data.items : []);

  return {
    ...data,
    id: id || data.id,
    status,
    diagnosis: safeString(data.diagnosis, '—'),
    protocol: safeString(data.protocol, '—'),
    followUp: safeString(data.followUp, '—'),
    source: safeString(data.source, 'Manual'),
    prescriptionLines,
    // Keep items for legacy compatibility (same array)
    items: prescriptionLines,
    patient: {
      ...data.patient,
      name: safeString(data.patient?.name, 'Unknown Patient'),
    },
    doctor: {
      ...data.doctor,
      name: safeString(data.doctor?.name, '—'),
    },
  };
}

/**
 * Normaliza un documento de protocolo crudo de Firestore al modelo canónico.
 *
 * Campo canónico de nombre: `name`
 * Campos legacy resueltos (en orden de prioridad):
 *   name → protocol_name → title → protocol_title → displayName → canonicalName
 *
 * IMPORTANTE: después de pasar por este mapper, el frontend SIEMPRE debe leer
 * `protocol.name` — nunca `protocol.protocol_name`, `protocol.title`, etc.
 */
export function normalizeProtocol(data, id = null) {
  const resolvedName = safeString(data.name || data.title || data.protocol_name, 'Unnamed Protocol');
  const resolvedCategory = safeString(
    data.category || data.therapeutic_category || data.categoryId || (Array.isArray(data.goals) && data.goals[0]) || data.primary_goal,
    'Regenerative'
  );

  return {
    ...data,
    id: id || data.id,
    name: resolvedName,
    title: resolvedName,
    category: resolvedCategory,
    therapeutic_category: resolvedCategory,
    categoryId: data.categoryId || resolvedCategory,
    description: safeString(data.description, ''),
    primary_goal: safeString(data.primary_goal || data.goal, ''),
    status: safeString(data.status, 'active'),
    version_number: data.version_number || data.protocol_version || data.version || 1,
  };
}

export function normalizePricing(data) {
  const p = data.pricing || {};
  const DEFAULT_TIER = { perUnit: 0, kit: 0, currency: 'USD' };

  return {
    retail:    { ...DEFAULT_TIER, ...p.retail },
    master:    { ...DEFAULT_TIER, ...p.master },
    wholesale: { ...DEFAULT_TIER, ...p.wholesale },
    clinic:    { ...DEFAULT_TIER, ...p.clinic },
  };
}

function cleanProductName(name) {
  if (!name) return name;
  let cleaned = name.replace(/\s*\d+(?:\.\d+)?\s*(?:mg|mcg|iu|ml|g|kg|unit)s?\b/gi, '');
  cleaned = cleaned.replace(/\s*\b(?:vial|vials|drops|pen|capsules?|tablets?|kit|pack|amp|amps)s?\b/gi, '');
  cleaned = cleaned.replace(/\s*-\s*$/, '').trim();
  return cleaned || name;
}

export function normalizeProduct(data, id = null) {
  if ((data.title && !data.name) || (data.displayName && !data.name)) {
    console.warn(`mappers.js: Product has legacy name fields (title/displayName) without canonical 'name'.`, { id });
  }

  const rawName = safeString(data.name, 'Unnamed Product');

  // ── Safe array coercion ──
  const safeArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'string') return [val];
    return [];
  };

  // ── Canonical status resolution ──
  const VALID_STATUSES = ['draft', 'active', 'out of stock', 'hidden', 'archived'];
  let resolvedStatus = safeString(data.status, '');
  if (resolvedStatus === 'published') resolvedStatus = 'active';
  if (!resolvedStatus || !VALID_STATUSES.includes(resolvedStatus)) {
    // Derive from isActive flag if status is missing/invalid
    resolvedStatus = data.isActive === false ? 'hidden' : 'active';
  }

  return {
    ...data,
    // ── Identity ──
    id:            id || data.id,
    name:          cleanProductName(rawName),
    originalName:  rawName,
    displayName:   safeString(data.name, rawName), // Enforce using name

    // ── Taxonomy (categoryId is authoritative — Phase 1 & 3) ──
    primaryType:   safeString(data.primaryType || data.type || data.productType, 'finished_product'),
    availableTypes: Array.isArray(data.availableTypes) && data.availableTypes.length > 0
      ? data.availableTypes
      : [safeString(data.primaryType || data.type || data.productType, 'finished_product')],
    isHybrid:      typeof data.isHybrid === 'boolean'
      ? data.isHybrid
      : (Array.isArray(data.availableTypes) ? data.availableTypes.length > 1 : false),
    type:          safeString(data.primaryType || data.type || data.productType, 'finished_product'),
    productType:   safeString(data.primaryType || data.type || data.productType, 'finished_product'),
    categoryId:    safeString(data.categoryId || data.category, ''),
    category:      safeString(data.categoryId || data.category, ''), // alias for backward compat
    status:        resolvedStatus,
    isActive:      resolvedStatus === 'active',

    // ── Search & Classification (always arrays) ──
    goals:            safeArray(data.goals),
    tags:             safeArray(data.tags),
    mechanisms:       safeArray(data.mechanisms),
    semanticKeywords: safeArray(data.semanticKeywords),
    synonyms:         safeArray(data.synonyms),
    searchAliases:    safeArray(data.searchAliases),
    supplierIds:      safeArray(data.supplierIds),

    // ── Science (always strings) ──
    objective:       safeString(data.objective, ''),
    desc:            safeString(data.desc || data.description, ''),
    scientificName:  safeString(data.scientificName, ''),

    // ── Flags (always boolean) ──
    isProfessional:      typeof data.isProfessional === 'boolean' ? data.isProfessional : false,
    requiresPrescription: typeof data.requiresPrescription === 'boolean' ? data.requiresPrescription : false,

    // ── Pricing (canonical only) ──
    pricing: normalizePricing(data),

    // ── Rich content (nullable objects) ──
    aiContent:    data.aiContent   || null,
    pharmacology: data.pharmacology || null,
  };
}

export function normalizeUser(data, id = null) {
  // Normalize status: maps 'Active', 'Inactive', 'New', etc. → canonical lowercase
  const rawStatus = data.status;
  const status = USER_STATUS_MAP[rawStatus] ?? rawStatus?.toLowerCase() ?? 'unverified';

  return {
    ...data,
    id: id || data.id,
    uid: id || data.uid || data.id,
    firstName: safeString(data.firstName, ''),
    lastName: safeString(data.lastName, ''),
    role: safeString(data.role, 'patient'),
    email: safeString(data.email, ''),
    // Normalized status — guaranteed lowercase canonical value
    status,
    // Computed: normalize clinicId/doctorId legacy fields to arrays
    clinicIds: Array.isArray(data.clinicIds)
      ? data.clinicIds
      : (data.clinicId ? [data.clinicId] : []),
    doctorIds: Array.isArray(data.doctorIds)
      ? data.doctorIds
      : (data.doctorId ? [data.doctorId] : []),
  };
}

/**
 * Normalizes a raw Firestore order document.
 * Ensures status, paymentStatus, and productionStatus are canonical lowercase.
 */
export function normalizeOrder(data, id = null) {
  const rawStatus = safeString(data.status, 'awaiting payment');
  const status = ORDER_STATUS_MAP[rawStatus] ?? rawStatus.toLowerCase();

  const rawPayment = safeString(data.paymentStatus, 'pending');
  const paymentStatus = rawPayment.toLowerCase();

  const rawProduction = safeString(data.productionStatus, 'pending');
  const productionStatus = rawProduction === 'canceled' ? 'cancelled' : rawProduction.toLowerCase();

  return {
    ...data,
    id: id || data.id,
    status,
    paymentStatus,
    productionStatus,
    items: Array.isArray(data.items) ? data.items
      : Array.isArray(data.lineItems) ? data.lineItems
      : Array.isArray(data.products) ? data.products
      : [],
    currency: safeString(data.currency, 'USD'),
    subtotal: Number(data.subtotal) || 0,
    shippingFee: Number(data.shippingFee) || 0,
    total: Number(data.total) || 0,
  };
}


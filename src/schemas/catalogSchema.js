/**
 * catalogSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Catalog and Lead Schema — Atlas Health
 *
 * This file is the single source of truth for Catalog Builder data models.
 * Rules:
 *   - Zero UI imports.
 *   - Zero Firebase imports.
 *   - Pure JS, safe for browser & Node alike.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CATALOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

export const CATALOG_AUDIENCE = Object.freeze({
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  WHOLESALERS: 'wholesalers',
  GENERAL: 'general',
});

export const CATALOG_OWNER_TYPE = Object.freeze({
  ADMIN: 'admin',
  WHOLESALER: 'wholesaler',
  PARTNER: 'partner',
});

export const LEAD_STATUS = Object.freeze({
  NEW: 'new',
  CONTACTED: 'contacted',
  COMPLETED: 'completed',
});

export const CANONICAL_CATALOG_FIELDS = Object.freeze([
  'id',
  'slug',
  'title',
  'ownerId',
  'ownerType',
  'status',
  'goal',
  'audience',
  'territory',
  'pricingVisible',
  'pricingTier',
  'heroTitle',
  'heroSubtitle',
  'heroDescription',
  'sections',
  'faq',
  'upsells',
  'crossSellRecommendations',
  'disclaimer',
  'branding',
  'createdAt',
  'updatedAt',
  'views',
  'leadCaptureCount',
  'visibility',
  'pricingMargin',
  'contactEmail',
  'contactPhone',
]);

/**
 * Validates a catalog document
 * @param {Object} c - Catalog to validate
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateCatalog(c) {
  if (!c || typeof c !== 'object') {
    return { ok: false, errors: ['catalog is null or not an object'] };
  }

  const errors = [];

  for (const field of CANONICAL_CATALOG_FIELDS) {
    if (c[field] === undefined) {
      errors.push(`Missing field: "${field}"`);
    }
  }

  if (c.status && !Object.values(CATALOG_STATUS).includes(c.status)) {
    errors.push(`Invalid status: "${c.status}"`);
  }

  if (c.ownerType && !Object.values(CATALOG_OWNER_TYPE).includes(c.ownerType)) {
    errors.push(`Invalid ownerType: "${c.ownerType}"`);
  }

  if (c.sections && !Array.isArray(c.sections)) {
    errors.push('sections must be an array');
  } else if (c.sections) {
    c.sections.forEach((sec, idx) => {
      if (!sec.title) errors.push(`sections[${idx}] missing title`);
      if (!Array.isArray(sec.products)) errors.push(`sections[${idx}] products must be an array`);
      if (!Array.isArray(sec.protocols)) errors.push(`sections[${idx}] protocols must be an array`);
    });
  }

  const ok = errors.length === 0;
  return { ok, errors };
}

/**
 * Validates a catalog lead request document
 * @param {Object} l - Lead request to validate
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateLeadRequest(l) {
  if (!l || typeof l !== 'object') {
    return { ok: false, errors: ['lead request is null or not an object'] };
  }
  const errors = [];
  const required = ['id', 'catalogId', 'ownerId', 'name', 'email', 'phone', 'status', 'createdAt'];

  for (const field of required) {
    if (!l[field]) {
      errors.push(`Missing field: "${field}"`);
    }
  }

  if (l.status && !Object.values(LEAD_STATUS).includes(l.status)) {
    errors.push(`Invalid status: "${l.status}"`);
  }

  const ok = errors.length === 0;
  return { ok, errors };
}

/**
 * Creates an empty canonical catalog skeleton
 * @param {Partial<Object>} overrides
 * @returns {Object}
 */
export function emptyCatalog(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: '',
    slug: '',
    title: '',
    ownerId: '',
    ownerType: CATALOG_OWNER_TYPE.ADMIN,
    status: CATALOG_STATUS.DRAFT,
    goal: '',
    audience: CATALOG_AUDIENCE.GENERAL,
    territory: 'US',
    pricingVisible: false,
    pricingTier: null,
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    sections: [],
    faq: [],
    upsells: [],
    crossSellRecommendations: [],
    disclaimer: 'For educational and clinical research purposes only. This information has not been evaluated by the FDA.',
    branding: null,
    createdAt: now,
    updatedAt: now,
    views: 0,
    leadCaptureCount: 0,
    visibility: 'private',
    pricingMargin: 0,
    contactEmail: '',
    contactPhone: '',
    ...overrides,
  };
}

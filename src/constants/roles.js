/**
 * src/constants/roles.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Canonical Roles Taxonomy & Hierarchies (AGENTS.md Rule #28 & #14)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ROLE_TIERS = Object.freeze({
  TIER_1_GOVERNANCE: 'governance',
  TIER_2_CLINICAL:   'clinical',
  TIER_3_COMMERCIAL: 'commercial',
  TIER_4_CONSUMER:   'consumer',
});

export const CANONICAL_ROLES = Object.freeze({
  // Tier 1: Governance & Executive
  ADMIN:            'admin',
  MEDICAL_DIRECTOR: 'medical_director',

  // Tier 2: Clinical B2B Prescribers & Facilities
  CLINIC:               'clinic',
  DOCTOR:               'doctor',
  COMPOUNDING_PHARMACY: 'compounding_pharmacy',

  // Tier 3: Commercial B2B & Supply Chain
  WHOLESALER:          'wholesaler',
  SUPPLIER:            'supplier',
  ACCOUNT_MANAGER:     'account_manager',
  SALES_AGENT:         'sales_agent',
  STAFF:               'staff',
  PATIENT_COORDINATOR: 'patient_coordinator',

  // Tier 4: End Patients & Public Guests
  PATIENT: 'patient',
  GUEST:   'guest',
});

/**
 * Normalisation map to handle legacy typos, synonyms and variant spellings.
 */
export const ROLE_ALIASES = Object.freeze({
  wholeseller:          CANONICAL_ROLES.WHOLESALER,
  pharmacy:             CANONICAL_ROLES.COMPOUNDING_PHARMACY,
  medical:              CANONICAL_ROLES.MEDICAL_DIRECTOR,
  physician:            CANONICAL_ROLES.DOCTOR,
  fagron_doctor:        CANONICAL_ROLES.DOCTOR,
  fagron_clinic:        CANONICAL_ROLES.CLINIC,
  doctor_pending:       CANONICAL_ROLES.DOCTOR,
  wholesaler_pending:   CANONICAL_ROLES.WHOLESALER,
  clinic_pending:       CANONICAL_ROLES.CLINIC,
  supplier_pending:     CANONICAL_ROLES.SUPPLIER,
  pharmacy_pending:     CANONICAL_ROLES.COMPOUNDING_PHARMACY,
  professional_pending: CANONICAL_ROLES.GUEST,
  pending:              CANONICAL_ROLES.GUEST,
});

/**
 * Complete metadata descriptor for each canonical role.
 */
export const ROLE_METADATA = Object.freeze({
  [CANONICAL_ROLES.ADMIN]: {
    id: CANONICAL_ROLES.ADMIN,
    label: 'Super Admin',
    tier: ROLE_TIERS.TIER_1_GOVERNANCE,
    badgeColor: '#003666',
    homeRoute: '/admin',
    description: 'Full system access across all clinical, financial and operational workflows.',
    canSimulateRoles: true,
  },
  [CANONICAL_ROLES.MEDICAL_DIRECTOR]: {
    id: CANONICAL_ROLES.MEDICAL_DIRECTOR,
    label: 'Medical Director',
    tier: ROLE_TIERS.TIER_1_GOVERNANCE,
    badgeColor: '#0f766e',
    homeRoute: '/admin',
    description: 'Executive clinical governance, global prescription approvals and patient supervision.',
    canSimulateRoles: true,
  },
  [CANONICAL_ROLES.CLINIC]: {
    id: CANONICAL_ROLES.CLINIC,
    label: 'Clinic / Institution',
    tier: ROLE_TIERS.TIER_2_CLINICAL,
    badgeColor: '#0284c7',
    homeRoute: '/doctor',
    description: 'Medical clinic managing affiliated physicians, staff and shared patient pools.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.DOCTOR]: {
    id: CANONICAL_ROLES.DOCTOR,
    label: 'Physician / Prescriber',
    tier: ROLE_TIERS.TIER_2_CLINICAL,
    badgeColor: '#0d9488',
    homeRoute: '/doctor',
    description: 'Licensed medical practitioner issuing digital prescriptions and monitoring patients.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.COMPOUNDING_PHARMACY]: {
    id: CANONICAL_ROLES.COMPOUNDING_PHARMACY,
    label: 'Compounding Pharmacy',
    tier: ROLE_TIERS.TIER_2_CLINICAL,
    badgeColor: '#7c3aed',
    homeRoute: '/pharmacy',
    description: 'Authorized compounding laboratory fulfilling custom formulations and sterile batches.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.WHOLESALER]: {
    id: CANONICAL_ROLES.WHOLESALER,
    label: 'Wholesaler / Distributor',
    tier: ROLE_TIERS.TIER_3_COMMERCIAL,
    badgeColor: '#c2410c',
    homeRoute: '/wholesaler',
    description: 'Bulk purchasing and B2B commercial distribution portal with volume pricing.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.SUPPLIER]: {
    id: CANONICAL_ROLES.SUPPLIER,
    label: 'Supplier / Manufacturer',
    tier: ROLE_TIERS.TIER_3_COMMERCIAL,
    badgeColor: '#b45309',
    homeRoute: '/supplier',
    description: 'API & raw material supplier responding to purchase quotes, batch COAs and RFQs.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.ACCOUNT_MANAGER]: {
    id: CANONICAL_ROLES.ACCOUNT_MANAGER,
    label: 'Account Manager',
    tier: ROLE_TIERS.TIER_3_COMMERCIAL,
    badgeColor: '#475569',
    homeRoute: '/admin',
    description: 'Manages clinic relationships, wholesale onboarding and quotation negotiations.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.SALES_AGENT]: {
    id: CANONICAL_ROLES.SALES_AGENT,
    label: 'Sales Agent',
    tier: ROLE_TIERS.TIER_3_COMMERCIAL,
    badgeColor: '#64748b',
    homeRoute: '/admin',
    description: 'Tracks client commissions, introductions and sales conversions.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.PATIENT_COORDINATOR]: {
    id: CANONICAL_ROLES.PATIENT_COORDINATOR,
    label: 'Patient Coordinator',
    tier: ROLE_TIERS.TIER_3_COMMERCIAL,
    badgeColor: '#0369a1',
    homeRoute: '/admin',
    description: 'Assists patients with intake forms, lab testing appointments and logistics.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.STAFF]: {
    id: CANONICAL_ROLES.STAFF,
    label: 'Clinical Staff',
    tier: ROLE_TIERS.TIER_3_COMMERCIAL,
    badgeColor: '#6b7280',
    homeRoute: '/doctor',
    description: 'Administrative nurse or clinical assistant managing appointments and inventory.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.PATIENT]: {
    id: CANONICAL_ROLES.PATIENT,
    label: 'Patient',
    tier: ROLE_TIERS.TIER_4_CONSUMER,
    badgeColor: '#9333ea',
    homeRoute: '/patient',
    description: 'End patient viewing prescribed protocols, tracking shipments and progress.',
    canSimulateRoles: false,
  },
  [CANONICAL_ROLES.GUEST]: {
    id: CANONICAL_ROLES.GUEST,
    label: 'Guest / Public B2C',
    tier: ROLE_TIERS.TIER_4_CONSUMER,
    badgeColor: '#94a3b8',
    homeRoute: '/',
    description: 'Unverified public visitor or retail consumer browsing public catalogue.',
    canSimulateRoles: false,
  },
});

/**
 * Normalises any arbitrary string into a canonical role identifier.
 * @param {string} role 
 * @returns {string} canonical role
 */
export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return CANONICAL_ROLES.GUEST;
  const clean = role.trim().toLowerCase();
  if (ROLE_ALIASES[clean]) return ROLE_ALIASES[clean];
  if (ROLE_METADATA[clean]) return clean;
  return CANONICAL_ROLES.GUEST;
}

/**
 * Validates if a role is known in the system.
 */
export function isValidRole(role) {
  if (!role || typeof role !== 'string') return false;
  const clean = role.trim().toLowerCase();
  return Boolean(ROLE_METADATA[clean] || ROLE_ALIASES[clean]);
}

export function isGovernanceRole(role) {
  const meta = ROLE_METADATA[normalizeRole(role)];
  return meta?.tier === ROLE_TIERS.TIER_1_GOVERNANCE;
}

export function isClinicalRole(role) {
  const meta = ROLE_METADATA[normalizeRole(role)];
  return meta?.tier === ROLE_TIERS.TIER_2_CLINICAL;
}

export function isCommercialRole(role) {
  const meta = ROLE_METADATA[normalizeRole(role)];
  return meta?.tier === ROLE_TIERS.TIER_3_COMMERCIAL;
}

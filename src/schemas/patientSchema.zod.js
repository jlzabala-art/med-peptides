// src/schemas/patientSchema.zod.js
import { z } from 'zod';

// ── Status normalizer ─────────────────────────────────────────────────────────
// Maps any legacy capitalization to canonical lowercase (Rule #28)
const STATUS_MAP = {
  active:      'active',
  Active:      'active',
  inactive:    'archived',
  Inactive:    'archived',
  archived:    'archived',
  Archived:    'archived',
  unverified:  'unverified',
  New:         'unverified',
  new:         'unverified',
  suspended:   'suspended',
};

const canonicalStatus = z
  .string()
  .transform((v) => STATUS_MAP[v] ?? v)
  .pipe(z.enum(['unverified', 'active', 'suspended', 'archived']));

// ── Schema ────────────────────────────────────────────────────────────────────
export const PatientSchema = z.object({
  id: z.string().optional(),

  // ── Personal Data ───────────────────────────────────────────────────────
  firstName: z.string().optional().default(''),
  lastName:  z.string().optional().default(''),
  name:      z.string().optional().default(''),
  email:     z
    .string()
    .email('Invalid email address format')
    .optional()
    .or(z.literal(''))
    .default(''),
  phone:       z.string().optional().default(''),
  country:     z.string().optional().default(''),
  dateOfBirth: z.string().optional().nullable().default(null),
  gender:      z.string().optional().nullable().default(null),
  avatarUrl:   z.string().optional().default(''),

  // ── Relational IDs ──────────────────────────────────────────────────────
  linkedUserId:      z.string().optional().nullable().default(null),
  doctorIds:         z.array(z.string()).default([]),
  clinicIds:         z.array(z.string()).default([]),
  supplierIds:       z.array(z.string()).default([]),
  assignedManagerId: z.string().optional().nullable().default(null),

  // ── Program & Tags ──────────────────────────────────────────────────────
  program: z.string().optional().nullable().default(null),
  tags:    z.array(z.string()).default([]),

  // ── Status — normalizes legacy capitalizations ───────────────────────────
  status: canonicalStatus.default('unverified'),

  // ── Clinical / CRM ──────────────────────────────────────────────────────
  notes:         z.string().optional().default(''),
  externalRef:   z.string().optional().nullable().default(null),

  // ── CRM Metrics (auto-maintained by system) ─────────────────────────────
  prescriptionCount:  z.number().int().nonnegative().default(0),
  totalPrescriptions: z.number().int().nonnegative().default(0),
  totalOrders:        z.number().int().nonnegative().default(0),
  ltv:                z.number().nonnegative().default(0),  // Lifetime value USD
  revenue:            z.number().nonnegative().default(0),
  riskScore:          z.string().optional().nullable().default(null),
  lastOrderStatus:    z.string().optional().nullable().default(null),
  lastActivity:       z.any().optional().default(null),

  role: z.literal('patient').default('patient'),
  _schemaVersion: z.number().optional().default(1),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export function validatePatient(data) {
  return PatientSchema.safeParse(data);
}

/**
 * Normalizes raw Firestore patient data to canonical schema.
 * Safe to call without validation — returns best-effort normalized object.
 */
export function normalizePatientData(raw) {
  const result = PatientSchema.safeParse(raw);
  if (result.success) return result.data;
  // Return with status normalized at minimum
  return {
    ...raw,
    status: STATUS_MAP[raw?.status] ?? raw?.status ?? 'unverified',
  };
}

/**
 * clinicalProtocolSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Schema and Validation for Multi-Phased Clinical Protocols & Pathways.
 * Covers induction, titration, maintenance, washout phases, required biomarkers,
 * and safety contraindications.
 *
 * Implements AGENTS.md Rule #2 (Firestore Source of Truth) & Rule #28 (Taxonomy).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

export const PROTOCOL_STATUSES = Object.freeze(['draft', 'active', 'paused', 'archived']);

export const CLINICAL_EVIDENCE_LEVELS = Object.freeze([
  'Tier 1 - Double-Blind RCT',
  'Tier 2 - Clinical Trial / Cohort',
  'Tier 3 - Observational / Expert Consensus',
  'Tier 4 - Preclinical / In-Vitro'
]);

export const ProtocolItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  variantId: z.string().optional(),
  dosageAmount: z.number().positive('Dosage must be positive'),
  dosageUnit: z.enum(['mcg', 'mg', 'IU', 'ml', 'capsule', 'drop', 'spray', 'vial']),
  frequency: z.string().default('daily'), // e.g. 'daily', '5_days_on_2_off', 'once_weekly', 'twice_weekly'
  route: z.enum([
    'subcutaneous_injection',
    'intramuscular_injection',
    'reusable_pen',
    'prefilled_pen',
    'oral',
    'sublingual',
    'nasal',
    'topical',
    'iv_infusion'
  ]).default('subcutaneous_injection'),
  timing: z.string().default('morning_fasted'), // 'morning_fasted', 'pre_bed', 'post_workout'
  notes: z.string().optional()
});

export const ProtocolPhaseSchema = z.object({
  phaseNumber: z.number().int().min(1),
  phaseName: z.string().min(1, 'Phase name is required'), // 'Induction / Titration', 'Active Optimization', 'Maintenance', 'Washout'
  durationWeeks: z.number().int().positive('Duration weeks must be positive'),
  items: z.array(ProtocolItemSchema).min(1, 'At least one compound is required per phase'),
  instructions: z.string().optional(),
  biomarkerCheckpoints: z.array(z.string()).default([])
});

export const BiomarkerRuleSchema = z.object({
  code: z.string(),
  name: z.string(),
  targetRange: z.string(),
  unit: z.string(),
  timingWeeks: z.number().int().default(0) // 0 = baseline, 4 = week 4 re-test
});

export const ClinicalProtocolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3, 'Protocol name must have at least 3 characters'),
  code: z.string().min(2),
  status: z.enum(PROTOCOL_STATUSES).default('draft'),
  clinicalGoal: z.string().min(1, 'Clinical goal is required'),
  evidenceLevel: z.enum(CLINICAL_EVIDENCE_LEVELS).default('Tier 2 - Clinical Trial / Cohort'),
  summary: z.string().min(10, 'Summary is required'),
  totalWeeks: z.number().int().positive().default(12),
  phases: z.array(ProtocolPhaseSchema).min(1, 'At least one phase is required'),
  biomarkers: z.array(BiomarkerRuleSchema).default([]),
  contraindications: z.array(z.string()).default([]),
  synergies: z.array(z.string()).default([]),
  requiresMedicalSupervision: z.boolean().default(true),
  authorDoctorId: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional()
});

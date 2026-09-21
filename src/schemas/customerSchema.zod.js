// src/schemas/customerSchema.zod.js
import { z } from 'zod';

// ── Status Normalizer (Rule #28) ─────────────────────────────────────────────
const STATUS_MAP = {
  active:      'active',
  Active:      'active',
  approved:    'active',
  Approved:    'active',
  pending:     'pending',
  Pending:     'pending',
  unverified:  'unverified',
  Unverified:  'unverified',
  new:         'unverified',
  New:         'unverified',
  suspended:   'suspended',
  Suspended:   'suspended',
  inactive:    'archived',
  Inactive:    'archived',
  archived:    'archived',
  Archived:    'archived',
};

export const canonicalCustomerStatus = z
  .string()
  .transform((v) => STATUS_MAP[v] ?? v?.toLowerCase() ?? 'active')
  .pipe(z.enum(['active', 'pending', 'unverified', 'suspended', 'archived']));

export const CustomerTypeEnum = z.enum(['patient', 'doctor', 'clinic', 'wholesaler']);

// ── Universal Base Customer Schema (Commercial & Zoho Books SSOT) ───────────
export const CustomerBaseSchema = z.object({
  id: z.string(),
  zohoContactId: z.string().optional().nullable().default(null),
  customerType: CustomerTypeEnum.default('patient'),

  // Identity & Names
  name: z.string().min(1, 'Name is required'),
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  companyName: z.string().optional().default(''),
  legalName: z.string().optional().default(''),

  // Contact Details
  email: z.string().email('Invalid email address').optional().or(z.literal('')).default(''),
  phone: z.string().optional().default(''),
  country: z.string().optional().default(''),
  city: z.string().optional().default(''),

  // Address
  billingAddress: z.object({
    street: z.string().optional().default(''),
    city: z.string().optional().default(''),
    state: z.string().optional().default(''),
    zipCode: z.string().optional().default(''),
    country: z.string().optional().default(''),
  }).optional().default({}),

  shippingAddress: z.object({
    street: z.string().optional().default(''),
    city: z.string().optional().default(''),
    state: z.string().optional().default(''),
    zipCode: z.string().optional().default(''),
    country: z.string().optional().default(''),
  }).optional().default({}),

  taxId: z.string().optional().nullable().default(null),

  // Commercial Terms & Pricing Tier
  pricingTier: z.string().default('standard'),
  discountMargin: z.number().default(20),
  currency: z.string().default('USD'),
  paymentTerms: z.string().default('Net 30'),
  creditLimit: z.number().default(50000),

  // Status & CRM
  status: canonicalCustomerStatus.default('active'),
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
  assignedManagerId: z.string().optional().nullable().default(null),

  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ── Role Extensions ─────────────────────────────────────────────────────────

// Patient Clinical Profile
export const PatientProfileSchema = z.object({
  dateOfBirth: z.string().optional().nullable().default(null),
  gender: z.string().optional().nullable().default(null),
  bloodType: z.string().optional().nullable().default(null),
  allergies: z.array(z.string()).default([]),
  currentConditions: z.array(z.string()).default([]),
  assignedDoctorId: z.string().optional().nullable().default(null),
  assignedClinicId: z.string().optional().nullable().default(null),
  activeProtocols: z.array(z.string()).default([]),
  prescriptionsCount: z.number().default(0),
  lastConsultationDate: z.string().optional().nullable().default(null),
  medicalNotes: z.string().optional().default(''),
  externalMedicalRef: z.string().optional().nullable().default(null),
});

// Doctor Professional Profile
export const DoctorProfileSchema = z.object({
  medicalLicenseNumber: z.string().optional().default(''),
  licenseIssuingCountry: z.string().optional().default(''),
  specialty: z.array(z.string()).default([]),
  degrees: z.array(z.string()).default([]),
  authorizedPrescriber: z.boolean().default(true),
  affiliatedClinicIds: z.array(z.string()).default([]),
  physicianCommissionRate: z.number().default(0),
  activePatientsCount: z.number().default(0),
  digitalSignatureUrl: z.string().optional().nullable().default(null),
});

// Clinic Facility Profile
export const ClinicProfileSchema = z.object({
  clinicType: z.string().default('medical_clinic'),
  territory: z.string().default('Global'),
  facilities: z.array(z.string()).default([]),
  assignedPhysicianIds: z.array(z.string()).default([]),
  assignedPhysiciansCount: z.number().default(0),
  operatingHours: z.string().optional().default(''),
});

// Wholesaler Distributor Profile
export const WholesalerProfileSchema = z.object({
  authorizedVariantIds: z.array(z.string()).default([]),
  exclusiveTerritories: z.array(z.string()).default([]),
  resellerCertificateUrl: z.string().optional().nullable().default(null),
});

// ── Composite Schemas (Customer + Role Profile) ──────────────────────────────
export const PatientCustomerSchema = CustomerBaseSchema.extend({
  customerType: z.literal('patient'),
  patientProfile: PatientProfileSchema.default({}),
});

export const DoctorCustomerSchema = CustomerBaseSchema.extend({
  customerType: z.literal('doctor'),
  doctorProfile: DoctorProfileSchema.default({}),
});

export const ClinicCustomerSchema = CustomerBaseSchema.extend({
  customerType: z.literal('clinic'),
  clinicProfile: ClinicProfileSchema.default({}),
});

export const WholesalerCustomerSchema = CustomerBaseSchema.extend({
  customerType: z.literal('wholesaler'),
  wholesalerProfile: WholesalerProfileSchema.default({}),
});

export const AnyCustomerSchema = z.union([
  PatientCustomerSchema,
  DoctorCustomerSchema,
  ClinicCustomerSchema,
  WholesalerCustomerSchema,
  CustomerBaseSchema,
]);

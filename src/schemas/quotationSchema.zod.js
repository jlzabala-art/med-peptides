import { z } from 'zod';

// ── Address Schema ────────────────────────────────────────────────────────────
export const AddressSchema = z.object({
  street:               z.string().optional(),
  city:                 z.string().optional(),
  state:                z.string().optional(),
  postalCode:           z.string().optional(),
  country:              z.string().default('AE'),
  facilityDock:         z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

// ── Compliance Snapshot ───────────────────────────────────────────────────────
export const ComplianceSnapshotSchema = z.object({
  requiresColdChain:   z.boolean().default(true),
  storageCondition:    z.enum(['refrigerated', 'frozen', 'room_temp']).default('refrigerated'),
  batchLotNumber:      z.string().optional(),
  coaUrl:              z.string().url().optional(),
  expirationDate:      z.string().optional(),
  requiresPrescription:z.boolean().default(true),
});

// ── Line Item Schema ──────────────────────────────────────────────────────────
export const QuotationLineItemSchema = z.object({
  productId:    z.string().min(1),
  variantId:    z.string().optional(),
  name:         z.string().min(1),
  dosage:       z.string().optional(),
  supplierId:   z.string().optional(),
  supplierName: z.string().optional(),
  unitPrice:    z.number().nonnegative(),
  supplierCost: z.number().nonnegative().optional(),
  quantity:     z.number().int().positive().default(1),
  totalPrice:   z.number().nonnegative().optional(),
  marginPercent:z.number().optional(),
  compliance:   ComplianceSnapshotSchema.optional(),
});

// ── Channel Context Schema ────────────────────────────────────────────────────
export const ChannelContextSchema = z.object({
  channel:        z.enum(['patient', 'clinic', 'wholesaler']).default('patient'),
  targetId:       z.string().optional(),
  targetName:     z.string().optional(),
  supervisorId:   z.string().optional(),
  supervisorName: z.string().optional(),
  contactPerson:  z.string().optional(),
  contactEmail:   z.string().email().optional(),
  contactPhone:   z.string().optional(),
  taxId:          z.string().optional(),
  billingAddress: AddressSchema.optional(),
  shippingAddress:AddressSchema.optional(),
});

// ── Root Quotation Schema ─────────────────────────────────────────────────────
export const QuotationSchema = z.object({
  quotationNumber: z.string().optional(),
  refNumber:       z.string().optional(),

  // 🔑 Channel Context & Recipient
  // NOTE: 'category' field REMOVED (was duplicate of recipientType).
  // Use 'recipientType' exclusively going forward.
  recipientType: z.enum(['patient', 'clinic', 'wholesaler']).default('patient'),
  channelContext: ChannelContextSchema.optional(),

  // 👤 Patient Direct Fields (B2C)
  patientId:          z.string().nullable().optional(),
  patientName:        z.string().nullable().optional(),
  doctorId:           z.string().nullable().optional(),
  doctorName:         z.string().nullable().optional(),
  rxId:               z.string().nullable().optional(),
  prescriptionNumber: z.string().nullable().optional(),

  // 🏥 Clinic Direct Fields (B2B Stock)
  clinicId:            z.string().nullable().optional(),
  clinicName:          z.string().nullable().optional(),
  clinicContactPerson: z.string().nullable().optional(),
  clinicTaxId:         z.string().nullable().optional(),
  orderType:           z.string().optional(),

  // 🏢 Wholesaler Direct Fields (B2B Bulk)
  wholesalerId:     z.string().nullable().optional(),
  wholesalerName:   z.string().nullable().optional(),
  accountManagerId: z.string().nullable().optional(),
  moqApplied:       z.boolean().default(false),
  // NOTE: 'tierLevel' REMOVED (was duplicate of pricingTier / channelContext tier).

  // 💳 Commercial Terms & Payments
  paymentTerms: z
    .enum(['due_on_receipt', 'net_15', 'net_30', 'net_60', '50_deposit_50_delivery'])
    .default('due_on_receipt'),
  // Renamed from 'tier' → 'pricingTier' for clarity (aligns with PRICING_TIERS in products)
  pricingTier:  z.string().default('retail'),
  currency:     z.string().default('USD'),
  docType:      z.enum(['pricelist', 'catalog', 'quotation']).default('quotation'),
  status:       z
    .enum(['draft', 'pending', 'generated', 'sent', 'accepted', 'approved', 'converted', 'rejected', 'expired', 'cancelled'])
    .default('draft'),

  subtotal:      z.number().nonnegative().default(0),
  taxTotal:      z.number().nonnegative().default(0),
  grandTotal:    z.number().nonnegative().default(0),
  marginPercent: z.number().default(45.0),

  productCount:    z.number().int().nonnegative().default(0),
  filename:        z.string().optional(),
  url:             z.string().url().optional(),
  validUntil:      z.string().nullable().optional(),
  expiresAt:       z.any().optional(),
  commercialNotes: z.string().nullable().optional(),
  items:           z.array(QuotationLineItemSchema).optional(),
  configSnapshot:  z.record(z.string(), z.any()).optional(),

  // 🔒 Security & Client Portal Access
  publicToken:       z.string().optional(),
  priceSnapshot:     z.record(z.string(), z.any()).optional(),
  coldChainSpecs:    ComplianceSnapshotSchema.optional(),
  viewedAt:          z.any().optional(),
  approvedAt:        z.any().optional(),
  approvedBy:        z.string().optional(),
  approvalSignature: z.string().optional(),
  clientNotes:       z.string().optional(),

  _schemaVersion: z.number().optional().default(1),
  createdAt:      z.any().optional(),
  updatedAt:      z.any().optional(),
});

export function validateQuotation(data) {
  return QuotationSchema.safeParse(data);
}

/**
 * Migration helper: maps old field names to new canonical names.
 * Safe to call on existing Firestore documents before re-saving.
 */
export function migrateQuotationFields(raw) {
  const migrated = { ...raw };
  // category → recipientType
  if (migrated.category && !migrated.recipientType) {
    migrated.recipientType = migrated.category;
  }
  delete migrated.category;
  // tier → pricingTier
  if (migrated.tier && !migrated.pricingTier) {
    migrated.pricingTier = migrated.tier;
  }
  delete migrated.tier;
  // tierLevel → removed
  delete migrated.tierLevel;
  return migrated;
}

import { z } from 'zod';

/**
 * apiSchemas.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Zod validation schemas for Next.js Route Handlers.
 */

// ── Catalog Analytics Schema ──────────────────────────────────────────────────
export const catalogAnalyticsSchema = z.object({
  catalogId: z.string().min(1, 'catalogId is required'),
  action: z.enum(['view', 'open_whatsapp', 'download_proforma', 'download_pdf', 'custom']).default('view'),
  recipientName: z.string().optional().default('Client'),
  destination: z.string().optional().default('EXW'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'MXN']).default('USD'),
  cartUnits: z.number().nonnegative().optional().default(0),
  cartTotal: z.number().nonnegative().optional().default(0),
  itemNames: z.array(z.string()).optional().default([]),
});

// ── Generate PDF Schema ───────────────────────────────────────────────────────
export const generatePdfSchema = z.object({
  docType: z.enum(['catalog', 'quotation', 'protocol', 'prescription']).default('catalog'),
  productIds: z.array(z.string()).optional().default([]),
  includePrices: z.boolean().optional().default(true),
  priceTier: z.enum(['cost', 'wholesaler', 'wholeseller', 'clinic', 'retail', 'master', 'wholesale']).optional().default('wholesale'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'MXN']).optional().default('USD'),
  recipientName: z.string().optional().nullable().default('Valued Client'),
  recipientType: z.string().optional().nullable().default('clinic'),
  isExWorks: z.boolean().optional().default(true),
  incoterm: z.string().optional().default('EXW'),
  showKitPrice: z.boolean().optional().default(true),
  kitSize: z.number().positive().optional().default(10),
  showDescription: z.boolean().optional().default(true),
  showSupplier: z.boolean().optional().default(false),
  showDosage: z.boolean().optional().default(true),
  showPresentation: z.boolean().optional().default(true),
  showPurity: z.boolean().optional().default(true),
  shippingNote: z.string().optional().default(''),
  supplierFilter: z.string().optional().nullable().default(null),
  category: z.string().optional().nullable().default(null),
  accountManagerName: z.string().optional().default('Atlas Commercial Desk'),
  accountManagerEmail: z.string().optional().default('commercial@atlashealth.com'),
});

// ── Export Catalog Schema ─────────────────────────────────────────────────────
export const exportCatalogSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx', 'pdf']).default('csv'),
  currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
  category: z.string().optional().default('all'),
  includePrices: z.boolean().optional().default(true),
  priceTier: z.string().optional().default('wholesale'),
});

// ── Share Quote Schema ────────────────────────────────────────────────────────
export const shareQuoteSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(),
      productId: z.string().optional(),
      name: z.string().optional(),
      canonicalName: z.string().optional(),
      dosage: z.string().nullable().optional(),
      sku: z.string().nullable().optional(),
      quantity: z.number().positive().default(1),
      cost: z.number().nonnegative().optional(),
      netCost: z.number().nonnegative().optional(),
      price: z.number().nonnegative().optional(),
      unitPrice: z.number().nonnegative().optional(),
      requiresColdChain: z.boolean().optional().default(false),
    })
  ).min(1, 'Quote items cannot be empty'),
  channel: z.enum(['clinic', 'wholesaler', 'wholeseller', 'retail', 'master', 'direct']).default('clinic'),
  clientName: z.string().optional().default('Valued Partner'),
  clientEmail: z.string().optional().default(''),
  currency: z.enum(['USD', 'EUR', 'GBP', 'MXN']).default('USD'),
  validityHours: z.number().positive().default(48),
  notes: z.string().optional().default(''),
});


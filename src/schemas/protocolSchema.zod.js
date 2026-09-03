import { z } from 'zod';

/**
 * Zod schema for Bill of Materials (BOM) items inside a Protocol
 */
export const ProtocolBomItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  product_name: z.string().min(1, 'Product name is required'),
  variantId: z.string().optional().default(''),
  quantity: z.number().int().min(1).default(1),
  dosage: z.string().optional().default(''),
  frequency: z.string().optional().default(''),
  duration: z.string().optional().default(''),
  sku: z.string().optional().default(''),
});

/**
 * Zod schema for clinical phases
 */
export const ProtocolPhaseSchema = z.object({
  name: z.string().min(1, 'Phase name is required'),
  durationWeeks: z.number().min(1).default(4),
  objective: z.string().optional().default(''),
  items: z.array(z.any()).optional().default([]),
});

/**
 * Canonical Zod schema for a complete Clinical Protocol
 */
export const ProtocolSchemaZod = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Protocol name must be at least 2 characters'),
  primary_goal: z.string().min(1, 'Primary goal is required').default('Tissue Repair & Recovery'),
  goal: z.string().optional(),
  goals: z.array(z.string()).min(1, 'At least one goal is required').default(['Tissue Repair & Recovery']),
  therapeutic_category: z.string().min(1, 'Therapeutic category is required').default('Regenerative'),
  category: z.string().optional().default('Regenerative'),
  categoryId: z.string().optional(),
  description: z.string().optional().default(''),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('active'),
  version_number: z.number().min(1).default(1),
  durationWeeks: z.number().optional().default(6),
  
  // Clinical specifics
  overview_summary: z.string().optional().default(''),
  clinical_rationale: z.string().optional().default(''),
  administration_notes: z.string().optional().default(''),
  monitoring_cadence: z.string().optional().default(''),
  weekly_doses: z.number().optional().default(1),
  
  // Arrays
  bom: z.array(ProtocolBomItemSchema).optional().default([]),
  phases: z.array(ProtocolPhaseSchema).optional().default([]),
  dosage_schedule: z.array(z.string()).optional().default([]),
  contraindications: z.array(z.string()).optional().default([]),
  required_labs: z.array(z.string()).optional().default([]),
  expected_outcomes: z.array(z.string()).optional().default([]),
  ai_enriched_sections: z.array(z.string()).optional().default([]),
  
  // Executive summary cache
  executiveSummary: z.record(z.any()).optional().default({}),
  
  // Audit log
  audit_log: z.array(z.object({
    id: z.string().optional(),
    type: z.string(),
    actor: z.string(),
    ts: z.string(),
    summary: z.string(),
    details: z.record(z.any()).optional(),
  })).optional().default([]),
  
  // Timestamps
  created_at: z.any().optional(),
  createdAt: z.any().optional(),
  updated_at: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const ProtocolCreateSchema = ProtocolSchemaZod.omit({ id: true });
export const ProtocolUpdateSchema = ProtocolSchemaZod.partial();

/**
 * Validate protocol with Zod
 * @param {unknown} data 
 * @param {boolean} [isUpdate=false]
 * @returns {{ success: boolean, data?: any, error?: z.ZodError }}
 */
export function validateProtocolZod(data, isUpdate = false) {
  const schema = isUpdate ? ProtocolUpdateSchema : ProtocolSchemaZod;
  return schema.safeParse(data);
}

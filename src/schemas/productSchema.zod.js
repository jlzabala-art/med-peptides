import { z } from 'zod';

export const VariantPricingTierSchema = z.object({
  base: z.number().nonnegative().nullable().optional(),
  byCountry: z.record(z.string(), z.number().nonnegative()).optional(),
  currency: z.string().default('USD'),
  tiers: z.array(z.object({
    minQty: z.number().positive(),
    price: z.number().nonnegative(),
  })).optional(),
});

// 🏷️ Estructura Autorizada de Precios y Descuentos de Proveedor (Supplier Purchase & Discount Schema)
export const SupplierPricingSchema = z.object({
  listPrice: z.number().nonnegative().default(0),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.number().nonnegative().default(0),
  netCost: z.number().nonnegative().default(0),
  currency: z.string().default('USD'),
  unitOfMeasure: z.string().default('vial'), // 'g', 'mg', 'vial', 'box', 'kit'
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  moq: z.number().nonnegative().optional(),
  agreementNotes: z.string().optional(),
  lastQuotationDate: z.any().optional(),
  quoteDocUrl: z.string().optional(),
});

// 🔬 Metadatos Químicos y Moleculares del Péptido
export const PeptideMolecularInfoSchema = z.object({
  casNumber: z.string().optional(),               // Ej: "137525-51-0" (BPC-157)
  sequence: z.string().optional(),                // Ej: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val"
  molecularFormula: z.string().optional(),        // Ej: "C62H98N16O22"
  molecularWeight: z.number().optional(),         // Ej: 1419.55 (g/mol)
  pubChemId: z.string().optional(),
  uniprotId: z.string().optional(),
  halfLife: z.string().optional(),
  iupacName: z.string().optional()
});

// 🧪 Especificaciones Analíticas y Farmacéuticas (API Grade)
export const PeptideApiSpecsSchema = z.object({
  purityPercentage: z.number().min(0).max(100).default(99.0), // Pureza HPLC (ej. >= 98.5%)
  grade: z.enum(['gmp', 'pharma_compounding', 'research_grade']).default('pharma_compounding'),
  counterIon: z.enum(['acetate', 'tfa', 'hcl', 'free_base']).default('acetate'), // Sal contraión
  appearance: z.string().default('White to off-white lyophilized powder'),
  solubility: z.string().default('Soluble in Bacteriostatic Water / Sterile Water'),
  endotoxins: z.string().optional(),               // Ej: "< 0.5 EU/mg"
  storageConditionLyophilized: z.string().default('-20°C (Dry, Dark)'),
  storageConditionReconstituted: z.string().default('2°C to 8°C'),
  shelfLifeMonthsLyophilized: z.number().int().default(24),
  shelfLifeDaysReconstituted: z.number().int().default(30),
  reconstitutionGuide: z.object({
    diluentRecommended: z.string().default('Bacteriostatic Water (0.9% Benzyl Alcohol)'),
    volumeRecommendedMl: z.number().default(2.0),
    instructions: z.string().default('Inject diluent slowly down vial wall. Swirl gently, do not shake.')
  }).optional()
});

// 🚚 Especificaciones de Servicios Logísticos y Envíos (Cold Chain / Medical Logistics)
export const LogisticsLocationSchema = z.object({
  name: z.string().optional(),                 // Ej: "Magenta Health Dubai" o "KM+ clinic"
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),                // Ej: "Konstitucijos pr. 15"
  city: z.string().optional(),                  // Ej: "Vilnius" o "Dubai"
  state: z.string().optional(),
  postalCode: z.string().optional(),            // Ej: "LT-09319"
  country: z.string().default('AE'),            // Ej: "AE", "LT", "ES", "US"
  countryName: z.string().optional(),           // Ej: "Lithuania", "United Arab Emirates"
  facilityNotes: z.string().optional(),
});

export const PackageDimensionsSchema = z.object({
  lengthCm: z.number().positive().default(20),
  widthCm: z.number().positive().default(15),
  heightCm: z.number().positive().default(10),
  volumeCm3: z.number().positive().optional(),
  volumetricWeightKg: z.number().positive().optional(),
});

export const LogisticsSpecsSchema = z.object({
  serviceType: z.enum([
    'cold_chain_express',      // 2-8°C refrigerated express courier
    'ambient_express',         // Standard express air freight
    'dry_ice_frozen',          // -20°C / -80°C dry ice shipment
    'standard_ground'          // Domestic / regional ground
  ]).default('cold_chain_express'),
  
  origin: LogisticsLocationSchema,
  destination: LogisticsLocationSchema,
  
  packageSpecs: z.object({
    weightKg: z.number().positive().default(1.0),
    weightGrams: z.number().positive().optional(),
    dimensions: PackageDimensionsSchema.optional(),
    totalUnits: z.number().int().positive().default(1),
    cargoDescription: z.string().default('Peptide Prefilled Pens / Biological Supplies'),
  }),
  
  coldChain: z.object({
    required: z.boolean().default(true),
    temperatureRange: z.enum(['2_8_c', 'minus_20_c', 'room_temp']).default('2_8_c'),
    tempLoggerIncluded: z.boolean().default(true),
    validatedHours: z.number().int().default(72),
  }).optional(),

  carrierInfo: z.object({
    carrierName: z.string().default('DHL Express Medical'),
    serviceLevel: z.string().default('Medical Express (Next-Flight-Out)'),
    trackingNumber: z.string().optional(),
    estimatedDays: z.number().int().default(3),
    incoterm: z.enum(['DAP', 'DDP', 'FOB', 'EXW']).default('DAP'),
  }).optional(),
});

// 💉 Definición de Cámara / Cartucho Individual para Plumas
export const CartridgeChamberSchema = z.object({
  chamberIndex: z.number().int().min(1).max(2).default(1), // 1 o 2
  role: z.enum([
    'active_solution',        // Solución activa lista
    'lyophilized_powder',     // Polvo liofilizado activo
    'diluent_reconstitution', // Diluyente (Bacteriostatic Water, etc.)
    'secondary_active'        // Segundo péptido activo (Terapia combinada)
  ]).default('active_solution'),
  substanceName: z.string().optional(),       // Ej: "Semaglutide" o "Bacteriostatic Water"
  strengthMg: z.number().nonnegative().optional(), // Ej: 10 (mg)
  volumeMl: z.number().nonnegative().optional(),   // Ej: 1.5 o 3.0 (ml)
  concentrationMgMl: z.number().nonnegative().optional(),
});

// 🖊️ Configuración Específica de la Pluma (Prefilled & Reusable Pen Specs)
export const PenDeliveryConfigSchema = z.object({
  penType: z.enum([
    'disposable_prefilled',      // Pluma precargada desechable
    'reusable_injector_device'   // Dispositivo inyector reutilizable
  ]).default('disposable_prefilled'),
  cartridgeIncluded: z.boolean().default(true),
  cartridgeType: z.enum([
    'single_cartridge',   // 1 cámara
    'double_cartridge',   // 2 cámaras
    'no_cartridge'        // Dispositivo sin cartucho
  ]).default('single_cartridge'),
  totalVolumeMl: z.number().default(3.0),
  chamberCount: z.number().int().min(1).max(2).default(1),
  chambers: z.array(CartridgeChamberSchema).default([]),
  compatibility: z.object({
    compatibleCartridgeMl: z.array(z.number()).default([3.0]),
    compatibleChambers: z.array(z.number()).default([1]),
    threadStandard: z.string().default('standard_3ml_iso'),
  }).optional(),
  dosingSpecs: z.object({
    clicksPerMl: z.number().default(100),       // Clics estándar por ml
    unitsPerClick: z.number().default(0.01),    // Volumen por clic (0.01 ml / clic)
    maxDosePerInjectionMl: z.number().default(0.6),
    reconstitutionRequired: z.boolean().default(false), // true para Dual-Chamber tipo A
  }).optional(),
});

export const VariantSchema = z.object({
  id: z.string().min(1, 'Variant ID is required'),
  name: z.string().optional(),
  dosage: z.string().optional(),
  dose: z.string().optional(),
  unit: z.string().optional(),
  presentation: z.string().optional(),
  presentationName: z.string().optional(),
  format: z.enum([
    'lyophilized_vial',       // Vial individual liofilizado (5mg, 10mg, 50mg)
    'lyophilized_kit_10x',    // Pack 10x viales
    'bulk_powder_gram',       // Granel en gramos (1g, 5g, 10g, 50g, 100g, 1kg)
    'pre_filled_pen',         // Pluma precargada con cartucho
    'reusable_pen_device',    // Dispositivo inyector reutilizable sin cartucho
    'refill_cartridge',       // Cartucho de recambio (single o double)
    'logistics_service',      // Servicio logístico / Courier médico
    'medical_courier_service',// Envío especializado con control de frío
    'nasal_spray', 
    'capsule',
    'sublingual',
    'topical_cream',
    'clinical_supply'
  ]).optional(),
  penConfig: PenDeliveryConfigSchema.optional(),
  logisticsSpecs: LogisticsSpecsSchema.optional(),
  supplier: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().optional(),
  stock: z.number().int().nonnegative().default(0),
  inStock: z.boolean().default(true),
  purity: z.number().min(0).max(100).optional(),
  moq: z.number().int().default(1),
  reconstitutionGuide: z.string().optional(),
  pricing: z.object({
    masterPrice: VariantPricingTierSchema.optional(),
    retailPrice: VariantPricingTierSchema.optional(),
    clinicPrice: VariantPricingTierSchema.optional(),
    wholesalePrice: VariantPricingTierSchema.optional(),
  }).optional(),
  cost_tiers: z.record(z.string(), z.any()).optional(),
  supplierPricing: SupplierPricingSchema.optional(),
});

export const ProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product Name is required'),
  canonicalName: z.string().optional(),
  
  // 🔑 Clasificación Primaria y Subcategoría
  productType: z.enum([
    'finished_product',    // 💊 Plumas, Sprays, Cápsulas, Soluciones listas
    'raw_material',       // 🧪 APIs Liofilizados, Granel, Diluyentes, Excipientes
    'api_raw_material',   // 🧪 Raw Material / Active Pharmaceutical Ingredient
    'diagnostic',         // 🔬 Diagnostic & Biomarker Tests
    'clinical_supplies',  // 💉 Jeringas, Agujas, Filtros, Accesorios frío
    'service',            // 🛠️ Servicios profesionales / Healthcare services
    'logistics_service'   // 🚚 Servicios de transporte y courier médico
  ]).default('finished_product'),
  
  category: z.string().min(1, 'Category is required'), // ej: "Peptides", "Longevity", "Logistics"
  subcategory: z.string().optional(), // ej: "Cold Chain Logistics", "Medical Courier"
  
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  status: z.enum(['draft', 'active', 'out of stock', 'hidden', 'archived']).default('active'),
  featured: z.boolean().default(false),
  requiresColdChain: z.boolean().default(true),
  requiresPrescription: z.boolean().default(true),
  dosage: z.string().optional(),
  route: z.string().optional(),
  supplier: z.string().optional(),
  supplierPricing: SupplierPricingSchema.optional(),
  protocolCount: z.number().int().nonnegative().default(0),
  
  // 🔬 Bloques API Opcionales (para Raw Materials / APIs Liofilizados)
  molecular: PeptideMolecularInfoSchema.optional(),
  apiSpecs: PeptideApiSpecsSchema.optional(),

  // 🚚 Especificaciones Logísticas Opcionales (para Servicios de Transporte / Courier)
  logisticsSpecs: LogisticsSpecsSchema.optional(),
  
  variants: z.array(VariantSchema).optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const ApiRawMaterialVariantSchema = z.object({
  id: z.string().min(1, 'Variant ID is required'),
  productId: z.string().optional(),
  name: z.string().optional(),
  type: z.literal('raw_material').default('raw_material'),
  productType: z.literal('raw_material').default('raw_material'),
  format: z.enum(['bulk_api', 'powder', 'bulk_powder_gram']).default('bulk_api'),
  presentation: z.string().default('Bulk API Powder'),
  
  // ⚖️ Strict API Mass & Weight Contract
  quantity: z.number().positive({ message: 'API Quantity (mass weight) must be greater than 0' }),
  unit: z.enum(['mg', 'g', 'kg']).default('g'),
  weightGrams: z.number().positive().optional(),
  packageWeight: z.string().optional(),
  
  // 💰 Pricing Metrics ($/g and batch total)
  pricePerGram: z.number().nonnegative().optional(),
  grossPricePerGram: z.number().nonnegative().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  costPrice: z.number().nonnegative().optional(),
  totalBatchCost: z.number().nonnegative().optional(),
  unit_price: z.number().nonnegative().optional(),
  supplierCost: z.number().nonnegative().optional(),
  
  supplier: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  status: z.enum(['draft', 'active', 'out of stock', 'hidden', 'archived']).default('active'),
  isActive: z.boolean().default(true),
});

export function validateProduct(data) {
  return ProductSchema.safeParse(data);
}

export function validateVariant(data) {
  return VariantSchema.safeParse(data);
}

/**
 * 🛡️ Strict Ingestion Guard: Normalizes and Validates Variant Data
 * Enforces the strict dichotomy:
 *   - Raw Materials (APIs): Governed by Mass/Weight (quantity, unit: 'g'|'kg', pricePerGram).
 *   - Finished Products: Governed by Clinical Dosages (e.g. 5mg, 10mg, vials, pens).
 */
export function normalizeAndValidateVariant(rawVariant, productType = 'finished_product') {
  const isRaw = rawVariant?.type === 'raw_material' || 
                rawVariant?.productType === 'raw_material' || 
                rawVariant?.productType === 'api_raw_material' || 
                productType === 'raw_material' || 
                productType === 'api_raw_material' ||
                rawVariant?.format === 'bulk_api';

  if (!isRaw) {
    return {
      success: true,
      data: rawVariant,
      variantType: 'finished_product'
    };
  }

  // 1. Coerce & sanitize Mass/Weight fields
  let quantity = Number(rawVariant.quantity);
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    // Attempt parsing from dose/dosage (e.g. "5g" -> 5)
    const match = String(rawVariant.dosage || rawVariant.dose || '').match(/(\d+(?:\.\d+)?)\s*(?:g|kg|mg)?/i);
    quantity = match ? parseFloat(match[1]) : 1;
  }

  const unit = (rawVariant.unit || 'g').toLowerCase();
  const weightGrams = unit === 'kg' ? quantity * 1000 : (unit === 'mg' ? quantity / 1000 : quantity);
  const packageWeight = `${quantity}${unit}`;

  // 2. Coerce pricing metrics
  const costPrice = Number(rawVariant.costPrice || rawVariant.pricePerGram || rawVariant.unit_price || rawVariant.cost || 0);
  const pricePerGram = Number(rawVariant.pricePerGram || (weightGrams > 0 ? costPrice / weightGrams : costPrice));
  const totalBatchCost = Number(rawVariant.totalBatchCost || (costPrice * quantity) || 0);

  const normalizedRaw = {
    ...rawVariant,
    type: 'raw_material',
    productType: 'raw_material',
    format: 'bulk_api',
    presentation: `${packageWeight} Bulk API Powder`,
    dosage: `${packageWeight} (Bulk API)`,
    quantity,
    unit,
    weightGrams,
    packageWeight,
    pricePerGram,
    costPrice,
    totalBatchCost,
    unit_price: costPrice,
  };

  const validation = ApiRawMaterialVariantSchema.safeParse(normalizedRaw);
  return {
    success: validation.success,
    errors: validation.error?.errors,
    data: normalizedRaw,
    variantType: 'raw_material'
  };
}

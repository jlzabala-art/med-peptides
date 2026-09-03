/**
 * buildSupplierSystemPrompt.js
 *
 * Sistema prompt para el ClinicalAI en modo SUPPLIER (Procurement Intelligence).
 * Se activa cuando moduleMode === 'supplier'.
 *
 * El AI actúa como un Procurement & Supplier Intelligence Advisor, NO como un
 * asesor clínico. Evalúa la relación comercial con el proveedor, su catálogo,
 * cobertura, historial de RFQs y oportunidades de negociación.
 *
 * Capacidades:
 *  1. Análisis de portafolio — ¿Qué cubre vs qué falta? Gaps en el catálogo.
 *  2. Evaluación de confiabilidad — Basada en historial de RFQs, lead times, stock.
 *  3. Comparativa de proveedores — vs otros proveedores del mismo producto/categoría.
 *  4. Oportunidades de negociación — Volumen, exclusividad, condiciones de pago.
 *  5. Compliance & certificaciones — GMP, ISO, HPLC, documentación.
 *  6. Draft de email/RFQ — Generar borrador de solicitud de cotización.
 *  7. Análisis de riesgo — Single-source risk, país de origen, tiempos de entrega.
 */

function buildSupplierDataBlock(supplier) {
  if (!supplier) return '';

  const lines = [];

  // ── Identificación ──────────────────────────────────────────────────────────
  const name = supplier.name || supplier.companyName || supplier.displayName || 'Unknown Supplier';
  lines.push(`SUPPLIER: ${name}`);
  if (supplier.id) lines.push(`ID: ${supplier.id}`);
  if (supplier.country) lines.push(`COUNTRY / ORIGIN: ${supplier.country}`);
  if (supplier.website) lines.push(`WEBSITE: ${supplier.website}`);
  if (supplier.contactEmail || supplier.email) {
    lines.push(`CONTACT: ${supplier.contactEmail || supplier.email}`);
  }

  // ── Estado de la relación ───────────────────────────────────────────────────
  if (supplier.statusB2B || supplier.statusB2C) {
    lines.push(`\nRELATIONSHIP STATUS:`);
    if (supplier.statusB2B) lines.push(`  B2B (Wholesale): ${supplier.statusB2B.toUpperCase()}`);
    if (supplier.statusB2C) lines.push(`  B2C (Retail):    ${supplier.statusB2C.toUpperCase()}`);
  }

  // ── Portafolio de productos ─────────────────────────────────────────────────
  const variants = supplier.variantsSupplied ?? supplier.analytics?.totalVariants ?? null;
  const products = supplier.productsSupplied ?? supplier.analytics?.totalProducts ?? null;
  if (variants != null || products != null) {
    lines.push(`\nPORTFOLIO SIZE:`);
    if (variants != null) lines.push(`  Variants supplied: ${variants}`);
    if (products != null) lines.push(`  Unique SKUs:       ${products}`);
  }

  // ── Categorías que cubre ────────────────────────────────────────────────────
  if (supplier.categoryIds?.length || supplier.categories?.length) {
    const cats = supplier.categoryIds || supplier.categories;
    const catLabels = supplier.categoryLabels || cats;
    lines.push(`\nCATEGORIES COVERED: ${Array.isArray(catLabels) ? catLabels.join(', ') : catLabels}`);
  }

  // ── Condiciones comerciales ─────────────────────────────────────────────────
  if (supplier.leadTime || supplier.lead_time) {
    lines.push(`\nCOMMERCIAL TERMS:`);
    lines.push(`  Lead time: ${supplier.leadTime || supplier.lead_time}`);
  }
  if (supplier.minOrder || supplier.min_order) {
    lines.push(`  Min. order: ${supplier.minOrder || supplier.min_order}`);
  }
  if (supplier.paymentTerms || supplier.payment_terms) {
    lines.push(`  Payment terms: ${supplier.paymentTerms || supplier.payment_terms}`);
  }
  if (supplier.incoterms) lines.push(`  Incoterms: ${supplier.incoterms}`);
  if (supplier.currency) lines.push(`  Currency: ${supplier.currency}`);

  // ── Certificaciones y compliance ────────────────────────────────────────────
  const certs = supplier.certifications || supplier.certificates || [];
  if (certs.length) {
    lines.push(`\nCERTIFICATIONS: ${certs.join(', ')}`);
  }
  if (supplier.gmpCertified != null) {
    lines.push(`GMP Certified: ${supplier.gmpCertified ? '✅ Yes' : '❌ No'}`);
  }
  if (supplier.hplcAvailable != null) {
    lines.push(`HPLC/CoA Available: ${supplier.hplcAvailable ? '✅ Yes' : '❌ No'}`);
  }

  // ── Historial de RFQs y pedidos ─────────────────────────────────────────────
  const rfqCount = supplier.rfqCount ?? supplier.analytics?.rfqCount ?? null;
  const orderCount = supplier.orderCount ?? supplier.analytics?.orderCount ?? null;
  const totalSpend = supplier.totalSpend ?? supplier.analytics?.totalSpend ?? null;
  if (rfqCount != null || orderCount != null || totalSpend != null) {
    lines.push(`\nBUSINESS HISTORY:`);
    if (rfqCount != null) lines.push(`  RFQs sent: ${rfqCount}`);
    if (orderCount != null) lines.push(`  Orders placed: ${orderCount}`);
    if (totalSpend != null) lines.push(`  Total spend: $${Number(totalSpend).toLocaleString()}`);
  }

  // ── Métricas de calidad ─────────────────────────────────────────────────────
  if (supplier.reliabilityScore || supplier.rating) {
    lines.push(`\nQUALITY METRICS:`);
    if (supplier.reliabilityScore) lines.push(`  Reliability score: ${supplier.reliabilityScore}/100`);
    if (supplier.rating) lines.push(`  Rating: ${supplier.rating}/5`);
  }

  // ── Notas internas ──────────────────────────────────────────────────────────
  if (supplier.notes || supplier.internalNotes) {
    lines.push(`\nINTERNAL NOTES:\n${supplier.notes || supplier.internalNotes}`);
  }

  return lines.join('\n');
}

/**
 * Construye el system prompt para el ClinicalAI en modo SUPPLIER.
 *
 * @param {object} supplier — Objeto proveedor de Firestore
 * @param {object} opts
 * @param {boolean} opts.forceEnglish
 * @returns {string}
 */
export function buildSupplierSystemPrompt(supplier, opts = {}) {
  const { forceEnglish = true } = opts;
  const supplierName = supplier?.name || supplier?.companyName || supplier?.displayName || 'this supplier';
  const supplierId = supplier?.id || '';
  const dataBlock = buildSupplierDataBlock(supplier);

  return `You are AtlasAI, a Procurement & Supplier Intelligence Advisor for Atlas Health.

You are analyzing a specific supplier relationship. Your role is to provide commercial intelligence — portfolio coverage analysis, pricing strategy, reliability assessment, risk evaluation, and negotiation opportunities. This is a B2B procurement context.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPPLIER DATA FROM ATLAS (PRIMARY SOURCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dataBlock || `Supplier: ${supplierName}\n[No additional data available — provide general supplier evaluation guidance.]`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVAILABLE ANALYSIS CAPABILITIES:

**A. Portfolio Coverage Analysis**
Review the supplier's catalog coverage. Identify:
- Which product categories they cover vs. Atlas catalog needs
- Gaps or underrepresented categories
- Overlap with other suppliers (redundancy risk or healthy competition)

**B. Reliability & Risk Assessment**
Evaluate single-source risk, geographic risk (country of origin), lead time variability.
If only one supplier covers a critical product — flag it as a supply chain risk.

**C. Supplier Comparison**
Compare this supplier against others in the same category.
Rank by: price competitiveness, lead time, certifications, minimum order flexibility.

**D. Negotiation Opportunities**
Based on order history and portfolio size, identify:
- Volume discount opportunities
- Exclusivity / preferred supplier agreements
- Payment term improvements (Net 30 → Net 60)
- Consignment or VMI (Vendor Managed Inventory) options

**E. Compliance Gap Analysis**
Identify missing certifications (GMP, ISO, HPLC/CoA) and their business impact.
Prioritize which certifications to request first.

**F. Draft RFQ / Email**
Generate a professional Request for Quotation (RFQ) or commercial email to this supplier.
Include: product list, quantities, delivery requirements, quality specifications.

**G. Strategic Recommendation**
Provide a 3-point strategic recommendation for this supplier relationship:
- Grow, maintain, or reduce dependency?
- Key actions for the next 90 days?
- KPIs to track?

MANDATORY RESPONSE FORMAT:

## ${supplierName} — Procurement Intelligence

### Summary
[2-3 lines: supplier profile, relationship status, key metrics]

### [Answer to User's Specific Request]
[Detailed, structured commercial analysis]

### ⚠️ Risk Flags
[Supply chain risks, compliance gaps, single-source dependencies]

### Recommendations
[3 specific, actionable procurement recommendations]

### Next Actions
- [View ${supplierName} Catalog](/admin/suppliers/${supplierId})
- [Send RFQ to ${supplierName}](/admin/rfq/new?supplier=${supplierId})
- [Compare with Other Suppliers](/admin/suppliers?compare=${supplierId})

MANDATORY RULES:
- ${forceEnglish ? 'ALWAYS respond in ENGLISH regardless of the language the user writes in.' : ''}
- This is a COMMERCIAL context, not clinical. Focus on procurement, not pharmacology.
- Use business/supply chain terminology: lead times, MOQ, incoterms, vendor consolidation, etc.
- Be direct and actionable — procurement decisions are time-sensitive.
- NEVER discuss clinical dosages or patient data in this mode.
- Always close with: *Analysis based on available Atlas data. Verify directly with supplier for current pricing and availability.*
`;
}

/**
 * Prompt de auto-generación para modo supplier.
 * Genera un resumen ejecutivo del proveedor al abrir el AI.
 *
 * @param {object} supplier
 * @returns {string}
 */
export function buildAutoSupplierPrompt(supplier) {
  const name = supplier?.name || supplier?.companyName || 'this supplier';
  const variants = supplier?.variantsSupplied ?? supplier?.analytics?.totalVariants ?? null;
  const country = supplier?.country ? ` (${supplier.country})` : '';

  return `Provide a Procurement Intelligence summary for ${name}${country}. Cover: (1) portfolio overview${variants ? ` — ${variants} variants` : ''}, (2) relationship status and key commercial terms, (3) top 3 risks or opportunities, and (4) recommended next action for this supplier relationship.`;
}

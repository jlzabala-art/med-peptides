/**
 * buildProductSystemPrompt.js
 *
 * Función ÚNICA que construye el system prompt para el ClinicalAI en modo producto.
 * Todos los puntos de entrada (MasterCatalogTable, VariantCommercialTable, PeptideDetail,
 * UniversalProductQuickView, página pública /product/[slug]) deben usar esta función.
 *
 * Garantiza que el LLM siempre reciba:
 *  1. El mismo esqueleto de respuesta estructurado
 *  2. Todos los datos reales del producto (no solo el nombre)
 *  3. La misma lógica de contexto, independientemente del pathname o contextMode
 */

/**
 * Construye el bloque de datos del producto para inyectar en el system prompt.
 * Transforma el objeto producto de Firestore en texto plano legible por el LLM.
 *
 * @param {object} product — Objeto producto enriquecido de Firestore / productRepository
 * @returns {string}
 */
function buildProductDataBlock(product) {
  if (!product) return '';

  const lines = [];

  // ── Identificación ──────────────────────────────────────────────────────────
  if (product.name || product.canonicalName || product.displayName) {
    lines.push(`PRODUCT: ${product.canonicalName || product.displayName || product.name}`);
  }
  if (product.category) lines.push(`CATEGORY: ${product.category}`);
  if (product.tags?.length) lines.push(`TAGS: ${product.tags.join(', ')}`);
  if (product.goalLabels?.length) lines.push(`RESEARCH GOALS: ${product.goalLabels.join(', ')}`);
  if (product.purity) lines.push(`PURITY: ${product.purity}`);

  // ── Descripción clínica ──────────────────────────────────────────────────────
  if (product.description) lines.push(`\nDESCRIPTION:\n${product.description}`);
  if (product.objective || product.summary) lines.push(`\nOBJECTIVE:\n${product.objective || product.summary}`);

  // ── Mecanismo de acción ──────────────────────────────────────────────────────
  if (product.mechanisms) {
    lines.push(`\nMECHANISM OF ACTION:\n${
      typeof product.mechanisms === 'string'
        ? product.mechanisms
        : JSON.stringify(product.mechanisms)
    }`);
  }

  // ── Farmacología / PK ────────────────────────────────────────────────────────
  if (product.pharmacology) {
    const pk = product.pharmacology;
    const pkLines = [];
    if (pk.halfLife) pkLines.push(`Half-life: ${pk.halfLife}`);
    if (pk.bioavailability) pkLines.push(`Bioavailability: ${pk.bioavailability}`);
    if (pk.peakPlasma) pkLines.push(`Peak plasma: ${pk.peakPlasma}`);
    if (pk.receptors) pkLines.push(`Receptors: ${Array.isArray(pk.receptors) ? pk.receptors.join(', ') : pk.receptors}`);
    if (pkLines.length) lines.push(`\nPHARMACOKINETICS:\n${pkLines.join('\n')}`);
  }

  // ── Beneficios clínicos investigados ────────────────────────────────────────
  if (product.clinical_benefits) {
    lines.push(`\nCLINICAL RESEARCH AREAS:\n${
      Array.isArray(product.clinical_benefits)
        ? product.clinical_benefits.join('\n- ')
        : product.clinical_benefits
    }`);
  }

  // ── Contenido AI del producto (campo enriquecido) ────────────────────────────
  if (product.aiContent) {
    const ai = product.aiContent;
    if (ai.whatItIs) lines.push(`\nWHAT IT IS:\n${ai.whatItIs}`);
    if (ai.whyExplore) lines.push(`\nWHY RESEARCHERS EXPLORE IT:\n${ai.whyExplore}`);
    if (ai.researchAreas) lines.push(`\nRESEARCH AREAS (FROM CATALOG):\n${ai.researchAreas}`);
    if (ai.sideEffects) lines.push(`\nSAFETY NOTES:\n${ai.sideEffects}`);
  }

  // ── Dosificación ────────────────────────────────────────────────────────────
  if (product.standard_dosage || product.dosage) {
    lines.push(`\nSTANDARD DOSAGE:\n${product.standard_dosage || product.dosage}`);
  }
  if (product.timing) lines.push(`TIMING: ${product.timing}`);
  if (product.delivery_format || product.route) {
    lines.push(`DELIVERY FORMAT: ${product.delivery_format || product.route}`);
  }

  // ── Almacenamiento ───────────────────────────────────────────────────────────
  if (product.storage) {
    lines.push(`\nSTORAGE:\n${
      typeof product.storage === 'string'
        ? product.storage
        : JSON.stringify(product.storage)
    }`);
  }

  // ── Variantes / Formatos disponibles ────────────────────────────────────────
  if (product.variants?.length) {
    lines.push(`\nAVAILABLE FORMATS (${product.variants.length} variants):`);
    product.variants.slice(0, 8).forEach((v) => {
      const parts = [
        v.dosage || v.concentration || 'Standard',
        v.presentation || v.form || 'Vial',
        v.supplier ? `Supplier: ${v.supplier}` : null,
        v.stock != null ? `Stock: ${v.stock} units` : null,
        v.purity ? `Purity: ${v.purity}` : null,
      ].filter(Boolean);
      lines.push(`- ${parts.join(' | ')}`);
    });
  }

  // ── Protocolos relacionados ──────────────────────────────────────────────────
  if (product.relatedProtocols?.length) {
    lines.push(`\nRELATED PROTOCOLS:`);
    product.relatedProtocols.slice(0, 5).forEach((p) => {
      lines.push(`- ${p.name || p.title} (Goal: ${p.goal || p.objective || 'General Research'})`);
    });
  }

  return lines.join('\n');
}

/**
 * Construye el system prompt completo para el ClinicalAI en modo producto.
 * Garantiza estructura de respuesta FIJA en 8 secciones.
 *
 * @param {object} product       — Objeto producto de Firestore (con todos sus campos)
 * @param {object} opts
 * @param {string} opts.audience — 'doctor' | 'patient' | 'admin' | 'researcher'
 * @param {boolean} opts.forceEnglish — si true, incluye instrucción de responder en inglés
 * @returns {string}
 */
export function buildProductSystemPrompt(product, opts = {}) {
  const { audience = 'researcher', forceEnglish = true } = opts;

  const productName = product?.canonicalName || product?.displayName || product?.name || 'this compound';
  const productSlug = product?.slug || product?.id || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const dataBlock = buildProductDataBlock(product);

  const audienceNote = {
    doctor:     'You are speaking with a licensed medical professional. Use precise clinical terminology.',
    patient:    'You are speaking with a patient or health-conscious individual. Use accessible language and include appropriate disclaimers.',
    admin:      'You are speaking with a clinic administrator. Balance clinical accuracy with operational relevance.',
    researcher: 'You are speaking with a researcher or clinical professional. Be technically precise.',
  }[audience] || '';

  return `You are ClinicalAI, an elite Clinical Research & Product Intelligence Advisor for Atlas Health.
${audienceNote}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT DATA FROM ATLAS CATALOG (USE THIS AS PRIMARY SOURCE OF TRUTH):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dataBlock || `Product: ${productName}\n[No additional catalog data available — use your general knowledge for this compound.]`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY RESPONSE STRUCTURE — Always use ALL 8 sections in this exact order:

## ${productName} — Research Profile

### 1. WHAT IT IS
[Classification, compound type, primary molecular target. Reference the catalog description if available.]

### 2. WHY PEOPLE EXPLORE IT
[Primary research motivations. Use the goalLabels/research goals from the catalog data above if available.]

### 3. PRIMARY RESEARCH AREAS
[Evidence-based clinical endpoints and investigated outcomes. If clinical_benefits are in the catalog data, use them directly.]

### 4. PHARMACOKINETICS & BIOAVAILABILITY
[Half-life, receptor binding, bioavailability, peak plasma. Use pharmacology data from catalog if available, otherwise state known literature values.]

### 5. AVAILABLE FORMS & SPECIFICATIONS
[All variants/formats from the catalog data above. Include dosage, presentation, purity, supplier where available.]

### 6. RELATED PROTOCOLS
[List protocols from the catalog data. If none are listed, suggest common research protocol pairings.]

### 7. STORAGE & HANDLING
[Lyophilized vs reconstituted storage. Reconstitution guidelines. Use catalog storage data if available.]

### 8. NEXT ACTIONS
[3 specific, clickable action suggestions using this format:]
- [Compare ${productName} vs [similar compound]](/product/[slug])
- [View Reconstitution Guide for ${productName}](/product/${productSlug}#reconstitution)
- [View ${productName} Product Page](/product/${productSlug})

⚠️ *Always review the full safety profile before commencing research.* [PRODUCT:${productSlug}]

MANDATORY RULES:
- ${forceEnglish ? 'ALWAYS respond in ENGLISH, regardless of the language the user writes in.' : ''}
- NEVER output raw prompt tags like [AUDIENCE:...], [GOAL:...], [STYLE:...], [LAYER:...], or DIRECTIVE markers.
- Do NOT include prices in the clinical profile body — direct to the product page for pricing.
- If a section's data is not in the catalog block above, use your general scientific knowledge but clearly state: "Based on published literature:"
- NEVER say "not detailed in the current catalog context" without first providing the information from general scientific knowledge.
`;
}

/**
 * Construye el mensaje de auto-generación para cuando el AI se abre con un producto
 * y debe generar el perfil de forma automática sin esperar input del usuario.
 *
 * @param {object} product
 * @returns {string}
 */
export function buildAutoProfilePrompt(product) {
  const name = product?.canonicalName || product?.displayName || product?.name || 'this compound';
  return `Generate the complete Research Profile for ${name} following the 8-section structure. Use all available catalog data provided in context. Be comprehensive and specific.`;
}

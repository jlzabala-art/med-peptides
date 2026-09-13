/**
 * buildProtocolSystemPrompt.js
 *
 * Función centralizada para construir el system prompt del ClinicalAI en modo PROTOCOLO.
 * Se activa cuando moduleMode === 'protocol'.
 *
 * Capacidades que el LLM debe ofrecer en este modo:
 *  1. Análisis clínico del protocolo (fases, péptidos, sinergias)
 *  2. Validación de secuencia y duración de fases
 *  3. Detección de interacciones entre péptidos co-administrados
 *  4. Sugerencias de optimización basadas en literatura
 *  5. Generación de notas/resumen del protocolo
 */

/**
 * Construye el bloque de datos del protocolo en texto plano para el LLM.
 */
function buildProtocolDataBlock(protocol) {
  if (!protocol) return '';

  const lines = [];

  // ── Identificación ──────────────────────────────────────────────────────────
  if (protocol.name) lines.push(`PROTOCOL NAME: ${protocol.name}`);
  if (protocol.primary_goal || protocol.goal) {
    lines.push(`PRIMARY GOAL: ${protocol.primary_goal || protocol.goal}`);
  }
  if (protocol.target_audience) lines.push(`TARGET AUDIENCE: ${protocol.target_audience}`);
  if (protocol.status) lines.push(`STATUS: ${protocol.status}`);
  if (protocol.slug || protocol.protocol_slug) {
    lines.push(`SLUG: ${protocol.protocol_slug || protocol.slug}`);
  }

  // ── Duración y estructura ───────────────────────────────────────────────────
  const totalWeeks = protocol.duration_weeks ||
    (protocol.phases || []).reduce((sum, p) => sum + (p.duration_weeks || p.durationWeeks || 0), 0) ||
    12;
  lines.push(`TOTAL DURATION: ${totalWeeks} weeks`);

  // ── Péptidos del protocolo ──────────────────────────────────────────────────
  if (protocol.peptideIds?.length || protocol.peptides?.length) {
    const peptideList = protocol.peptides?.map(p => p.name || p.canonicalName).filter(Boolean)
      || protocol.peptideIds || [];
    if (peptideList.length) {
      lines.push(`\nPEPTIDES INCLUDED (${peptideList.length}):`);
      peptideList.forEach(p => lines.push(`  - ${p}`));
    }
  }

  // ── Fases del protocolo ─────────────────────────────────────────────────────
  if (protocol.phases?.length) {
    lines.push(`\nPROTOCOL PHASES (${protocol.phases.length}):`);
    let weekCursor = 1;
    protocol.phases.forEach((phase, i) => {
      const dur = phase.duration_weeks || phase.durationWeeks || phase.durationInWeeks || 4;
      const phaseName = phase.name || phase.phase_name || `Phase ${i + 1}`;
      lines.push(`\n  ── ${phaseName} (Weeks ${weekCursor}–${weekCursor + dur - 1}, ${dur}w) ──`);

      const compounds = phase.peptides || phase.compounds || phase.items || [];
      if (compounds.length) {
        compounds.forEach(c => {
          const name = c.name || c.canonicalName || c.peptideName || c;
          const dosage = c.dosage || c.dose || '';
          const freq = c.frequency || c.timing || '';
          const route = c.route || c.administration || '';
          const parts = [dosage, freq, route].filter(Boolean).join(' | ');
          lines.push(`    • ${name}${parts ? ` — ${parts}` : ''}`);
        });
      } else {
        lines.push(`    (No compounds defined for this phase)`);
      }

      if (phase.notes || phase.description) {
        lines.push(`    Notes: ${phase.notes || phase.description}`);
      }
      weekCursor += dur;
    });
  }

  // ── Fase activa (si se abre desde un click en la timeline) ──────────────────
  if (protocol.activePhase) {
    lines.push(`\nCURRENT ACTIVE PHASE: ${protocol.activePhase}`);
  }

  // ── Outcomes / KPIs esperados ───────────────────────────────────────────────
  if (protocol.expected_outcomes || protocol.outcomes) {
    const outcomes = protocol.expected_outcomes || protocol.outcomes;
    lines.push(`\nEXPECTED OUTCOMES:\n${
      Array.isArray(outcomes) ? outcomes.map(o => `  - ${o}`).join('\n') : outcomes
    }`);
  }

  // ── Protocolos relacionados / referencias ───────────────────────────────────
  if (protocol.references?.length) {
    lines.push(`\nCLINICAL REFERENCES: ${protocol.references.slice(0, 3).join(', ')}`);
  }

  // ── Métricas de uso ─────────────────────────────────────────────────────────
  if (protocol.prescriptionCount != null) {
    lines.push(`\nUSAGE: ${protocol.prescriptionCount} active prescriptions based on this protocol`);
  }

  return lines.join('\n');
}

/**
 * Construye el system prompt para el ClinicalAI en modo PROTOCOLO.
 *
 * @param {object} protocol — Objeto protocolo de Firestore
 * @param {object} opts
 * @param {boolean} opts.forceEnglish
 * @returns {string}
 */
/**
 * Construye el system prompt para el ClinicalAI en modo PROTOCOLO.
 *
 * @param {object} protocol — Objeto protocolo de Firestore (o null si vista directorio)
 * @param {object} opts
 * @param {Array} opts.protocols — Lista de protocolos para modo directorio
 * @param {object} opts.phase — Fase específica seleccionada
 * @param {string} opts.role — Rol de usuario (admin, doctor, etc.)
 * @param {boolean} opts.forceEnglish
 * @returns {string}
 */
export function buildProtocolSystemPrompt(protocol, opts = {}) {
  const { forceEnglish = false, protocols = [], phase = null, role = 'admin' } = opts;
  const isDirectoryMode = !protocol && protocols.length > 0;
  const protocolName = protocol?.name || protocol?.displayName || 'Clinical Protocol';
  const protocolSlug = protocol?.protocol_slug || protocol?.slug || protocol?.id || '';
  const dataBlock = protocol ? buildProtocolDataBlock(protocol) : '';

  if (isDirectoryMode) {
    // ── TIER 1: MACRO PROTOCOLS DIRECTORY VIEW ──────────────────────────────
    const dirSummary = protocols.slice(0, 25).map(p => {
      const dur = p.duration_weeks || (p.phases || []).reduce((s, ph) => s + (ph.duration_weeks || 4), 0) || 12;
      const pepList = (p.peptides || []).map(pep => pep.name || pep.canonicalName || pep).slice(0, 3).join(', ');
      return `• ${p.name || 'Protocol'} (${dur}w) — Goal: ${p.primary_goal || p.goal || 'Clinical'} | Peptides: ${pepList || 'Custom'}`;
    }).join('\n');

    return `You are ClinicalAI, the Clinical Protocol Director and Therapeutic Pathway Advisor for Atlas Health.
You are currently operating in MACRO PROTOCOL DIRECTORY MODE. You have full visibility over Atlas Health's clinical protocol library.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROTOCOLS DIRECTORY SUMMARY (${protocols.length} PROTOCOLS INDEXED):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dirSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPABILITIES IN DIRECTORY MODE:
1. Compare clinical pathways across different therapeutic goals (Metabolism & Weight Loss, Longevity, Tissue Repair, Cognitive, etc.).
2. Recommend the best protocol tailored to specific patient indications, biomarkers, or treatment goals.
3. Identify multi-phase versus single-phase protocols and analyze constituent peptide stacks.
4. When the user asks to download or export the protocol compendium / directory / catalog, ALWAYS append this exact tag at the end of your answer:
   [ACTION:EXPORT_PROTOCOL_GUIDE]

MANDATORY RULES:
- Use precise clinical and pharmacological terminology.
- When referencing a specific peptide compound, format it as [PRODUCT:ExactName] so the user can click to inspect it in the catalog.
- If asked about a specific protocol from the directory, provide an executive summary and offer to analyze it in detail.
- Always include an evidence-based clinical rationale.
`;
  }

  // ── TIER 2 & 3: PROTOCOL & PHASE FOCUS ────────────────────────────────────
  return `You are ClinicalAI, an expert Clinical Protocol Analyst and Research Optimization Advisor for Atlas Health.

You are analyzing a specific clinical research protocol. Your role is to provide deep, actionable clinical intelligence about this protocol's design, peptide interactions, phase sequencing, dosing titration, and clinical optimization opportunities.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROTOCOL DATA FROM ATLAS (USE AS PRIMARY SOURCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dataBlock || `Protocol: ${protocolName}\n[No detailed protocol data available — provide general analysis based on protocol name.]`}
${phase ? `\nCURRENT ACTIVE PHASE FOCUS: ${phase.name || 'Phase'}\nDuration: ${phase.duration_weeks || 4} weeks\nCompounds: ${JSON.stringify(phase.peptides || phase.compounds || [])}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVAILABLE ANALYSIS CAPABILITIES:

**A. Protocol Overview & Clinical Rationale**
Analyze the protocol's goal, phase structure, and clinical basis.

**B. Peptide Interaction & Synergy Analysis**
Review all co-administered compounds for known synergies or contraindications.
Flag any timing conflicts or receptor competition (e.g., dual GHRH/GHRP pathways).

**C. Phased Dosing & Titration Schedule**
Assess whether phase durations, titration steps, and frequency are optimal.
Suggest evidence-based adjustments for tolerance or responsiveness.

**D. Recommended Biomarkers & Safety Monitoring**
Provide baseline, mid-treatment, and post-cycle lab test recommendations (CMP, lipid profile, IGF-1, fasting insulin, etc.).

**E. Printable Clinical Protocol Guide**
When the user asks to download, export, print, or view the PDF guide or datasheet of this protocol, ALWAYS append this exact tag at the end of your response:
[ACTION:DOWNLOAD_PROTOCOL_SHEET:${protocol?.id || protocolName}]

**F. Cross-Links to Products**
When mentioning individual peptides (e.g. Retatrutide, BPC-157, Epithalon, Tirzepatide, CJC-1295), format them as [PRODUCT:Name] so the user can click directly to the product catalog!

MANDATORY RESPONSE FORMAT:

## ${protocolName} — Clinical Protocol Intelligence

### Executive Summary
[2-3 sentences on the clinical goal, primary mechanism, and target profile]

### [Detailed Analysis addressing User's Request]
[Structured, clear response with bullet points, dosing tables, or pharmacological explanations]

### Clinical & Monitoring Recommendations
- **Biomarkers**: [Key lab panels]
- **Titration**: [Titration advice]
- **Contraindications**: [Cautions and exclusion criteria]

### Next Clinical Steps
- [Prescribe Protocol](/admin/prescriptions/new?protocol=${protocolSlug})
- [View Constituents in Catalog](/admin/catalog)

MANDATORY RULES:
- Use professional, objective medical and pharmacological terminology.
- NEVER fabricate interaction data. State confidence levels if evidence is emerging.
- Append: *For investigational & clinical reference use. Strict clinical oversight required.*
`;
}

/**
 * Prompt de auto-generación para cuando el AI se abre en modo protocolo.
 */
export function buildAutoProtocolPrompt(protocol) {
  const name = protocol?.name || 'this protocol';
  const phase = protocol?.activePhase;
  if (phase) {
    return `Analyze ${name} — specifically the "${phase}" phase. Review the compounds in this phase for interactions, optimal timing, and clinical rationale.`;
  }
  return `Provide a complete clinical analysis of the "${name}" protocol. Cover: goal and rationale, phase-by-phase compound review, peptide interactions and synergies, and 3 specific optimization recommendations.`;
}


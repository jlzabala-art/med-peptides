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
export function buildProtocolSystemPrompt(protocol, opts = {}) {
  const { forceEnglish = true } = opts;
  const protocolName = protocol?.name || 'this protocol';
  const protocolSlug = protocol?.protocol_slug || protocol?.slug || protocol?.id || '';
  const dataBlock = buildProtocolDataBlock(protocol);

  return `You are ClinicalAI, an expert Clinical Protocol Analyst and Research Optimization Advisor for Atlas Health.

You are analyzing a specific clinical research protocol. Your role is to provide deep, actionable clinical intelligence about this protocol's design, peptide interactions, phase sequencing, and optimization opportunities.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROTOCOL DATA FROM ATLAS (USE AS PRIMARY SOURCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dataBlock || `Protocol: ${protocolName}\n[No detailed protocol data available — provide general analysis based on protocol name.]`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVAILABLE ANALYSIS CAPABILITIES — You can perform any of the following:

**A. Protocol Overview & Clinical Rationale**
Analyze the protocol's goal, phase structure, and clinical basis.

**B. Peptide Interaction Analysis**
Review all co-administered compounds for known synergies or contraindications.
Flag any timing conflicts (e.g., two compounds that compete for the same receptor).

**C. Phase Optimization**
Assess whether the phase duration, sequencing, and compound selection are optimal.
Suggest evidence-based adjustments.

**D. Compound Deep-Dive**
Provide detailed clinical profile for any specific compound in the protocol.
Compare compounds within the same phase.

**E. Protocol Variants**
Suggest conservative (reduced) or aggressive (enhanced) variants of the protocol.

**F. Clinical Note Generation**
Generate a structured clinical summary suitable for medical documentation.

**G. Prescription Creation Guidance**
Identify the steps to convert this protocol into a prescription for a specific patient.

MANDATORY RESPONSE FORMAT:

## ${protocolName} — Protocol Analysis

### Quick Summary
[2-3 sentences on what this protocol does and who it's for]

### [Answer to User's Specific Question]
[Detailed, structured response]

### Clinical Recommendations
[Specific, actionable recommendations]

### Next Actions
- [Optimize Phase X](/protocol/${protocolSlug})
- [Create Prescription from Protocol](/admin/prescriptions/new?protocol=${protocolSlug})
- [View Compound Details](/)

MANDATORY RULES:
- ${forceEnglish ? 'ALWAYS respond in ENGLISH regardless of the language the user writes in.' : ''}
- Use precise clinical terminology. This is a professional medical/research context.
- When identifying potential interactions, be specific about the mechanism (e.g., "Both BPC-157 and TB-500 upregulate VEGF — concurrent use may amplify angiogenic effects").
- NEVER fabricate peptide interaction data. If uncertain, state: "Based on limited published data:" and provide what is known.
- Do NOT include prices. Direct to the product pages for pricing.
- Append: *For research purposes only. Consult a licensed healthcare provider before clinical application.*
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

/**
 * buildPrescriptionSystemPrompt.js
 *
 * Función centralizada para construir el system prompt del ClinicalAI en modo PRESCRIPCIÓN.
 * Se activa cuando moduleMode === 'prescription'.
 *
 * Capacidades del AI en este modo:
 *  1. Revisión de seguridad — interacciones entre péptidos co-prescritos
 *  2. Validación de dosis — rango terapéutico vs literatura
 *  3. Draft de nota clínica — borrador médico estructurado
 *  4. Match con protocolos — detectar si la Rx coincide con un protocolo existente
 *  5. Análisis de historial del paciente — patrones entre prescripciones
 */

/**
 * Construye el bloque de datos de la prescripción para el LLM.
 */
function buildPrescriptionDataBlock(rx) {
  if (!rx) return '';

  const lines = [];

  // ── Identificación ──────────────────────────────────────────────────────────
  if (rx.id) lines.push(`PRESCRIPTION ID: ${rx.id}`);
  if (rx.status) lines.push(`STATUS: ${rx.status}`);
  if (rx.createdAt) {
    const date = rx.createdAt?.toDate?.() || (typeof rx.createdAt === 'string' ? new Date(rx.createdAt) : null);
    if (date) lines.push(`DATE: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  }

  // ── Paciente ────────────────────────────────────────────────────────────────
  if (rx.patientName || rx.patient?.name) {
    lines.push(`\nPATIENT: ${rx.patientName || rx.patient?.name}`);
  }
  if (rx.patient?.age || rx.patientAge) {
    lines.push(`PATIENT AGE: ${rx.patient?.age || rx.patientAge} years`);
  }
  if (rx.patient?.weight || rx.patientWeight) {
    lines.push(`PATIENT WEIGHT: ${rx.patient?.weight || rx.patientWeight} kg`);
  }
  if (rx.patient?.goals || rx.patientGoals) {
    const goals = rx.patient?.goals || rx.patientGoals;
    lines.push(`PATIENT GOALS: ${Array.isArray(goals) ? goals.join(', ') : goals}`);
  }
  if (rx.patient?.conditions || rx.patientConditions) {
    const conditions = rx.patient?.conditions || rx.patientConditions;
    lines.push(`RELEVANT CONDITIONS: ${Array.isArray(conditions) ? conditions.join(', ') : conditions}`);
  }
  if (rx.patient?.allergies || rx.patientAllergies) {
    const allergies = rx.patient?.allergies || rx.patientAllergies;
    lines.push(`⚠️ KNOWN ALLERGIES: ${Array.isArray(allergies) ? allergies.join(', ') : allergies}`);
  }

  // ── Doctor prescriptor ──────────────────────────────────────────────────────
  if (rx.doctorName || rx.doctor?.name) {
    lines.push(`\nPRESCRIBING DOCTOR: ${rx.doctorName || rx.doctor?.name}`);
  }
  if (rx.doctorSpecialty || rx.doctor?.specialty) {
    lines.push(`SPECIALTY: ${rx.doctorSpecialty || rx.doctor?.specialty}`);
  }

  // ── Protocolo de origen ─────────────────────────────────────────────────────
  if (rx.protocolId || rx.protocol?.name) {
    lines.push(`\nBASED ON PROTOCOL: ${rx.protocol?.name || rx.protocolId}`);
  }

  // ── Ítems prescritos ────────────────────────────────────────────────────────
  const items = rx.items || rx.products || rx.compounds || [];
  if (items.length) {
    lines.push(`\nPRESCRIPTION ITEMS (${items.length}):`);
    items.forEach((item, i) => {
      const name = item.productName || item.canonicalName || item.name || `Item ${i + 1}`;
      const dosage = item.dosage || item.dose || '';
      const frequency = item.frequency || item.timing || item.schedule || '';
      const duration = item.duration || item.durationWeeks ? `${item.durationWeeks || item.duration} weeks` : '';
      const route = item.route || item.deliveryMethod || item.administration || '';
      const qty = item.quantity || item.units || '';

      const details = [dosage, frequency, duration, route, qty ? `${qty} units` : '']
        .filter(Boolean).join(' | ');

      lines.push(`  ${i + 1}. ${name}${details ? `\n     ${details}` : ''}`);

      if (item.purity) lines.push(`     Purity: ${item.purity}`);
      if (item.supplierId || item.supplier) {
        lines.push(`     Supplier: ${item.supplier || item.supplierId}`);
      }
      if (item.notes) lines.push(`     Notes: ${item.notes}`);
    });
  }

  // ── Instrucciones generales ─────────────────────────────────────────────────
  if (rx.instructions || rx.generalNotes || rx.clinicalNotes) {
    lines.push(`\nCLINICAL NOTES:\n${rx.instructions || rx.generalNotes || rx.clinicalNotes}`);
  }

  // ── Total / Pricing ─────────────────────────────────────────────────────────
  // No incluimos precios en el prompt por política — el LLM no debe discutir precios

  return lines.join('\n');
}

/**
 * Construye el system prompt para el ClinicalAI en modo PRESCRIPCIÓN.
 *
 * @param {object} rx      — Objeto prescripción de Firestore
 * @param {object} opts
 * @param {boolean} opts.forceEnglish
 * @returns {string}
 */
export function buildPrescriptionSystemPrompt(rx, opts = {}) {
  const { forceEnglish = true } = opts;
  const patientName = rx?.patientName || rx?.patient?.name || 'the patient';
  const rxId = rx?.id || 'this prescription';
  const dataBlock = buildPrescriptionDataBlock(rx);

  return `You are ClinicalAI, acting as a Clinical Safety & Prescription Intelligence Advisor for Atlas Health.

You are reviewing a specific patient prescription. Your role is to support the prescribing doctor and admin team with clinical intelligence — safety analysis, dosing validation, clinical note drafting, and protocol matching.

⚠️ IMPORTANT: You are supporting a licensed healthcare professional. Provide precise, evidence-based clinical analysis. Do NOT replace clinical judgment — complement it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRESCRIPTION DATA (PRIMARY SOURCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dataBlock || `Prescription: ${rxId} for ${patientName}\n[Detailed prescription data not available — provide general guidance.]`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVAILABLE ANALYSIS CAPABILITIES:

**A. Safety Review — Compound Interactions**
Analyze all co-prescribed compounds for:
- Receptor competition (e.g., two GH secretagogues competing for GHRH)
- Synergistic or antagonistic effects
- Timing conflicts (should not be administered simultaneously)
- Cumulative risk flags

**B. Dosing Validation**
Compare each compound's prescribed dose against published research ranges.
Flag doses that exceed or fall below typical research parameters.

**C. Draft Clinical Note**
Generate a structured clinical note suitable for medical documentation:
- Patient summary, treatment rationale, compound list with dosing, monitoring parameters, follow-up schedule

**D. Protocol Match Analysis**
Check if this prescription aligns with any known Atlas protocols.
Suggest the closest matching protocol if available.

**E. Monitoring Plan**
Recommend biomarkers and clinical endpoints to monitor during the prescription period.

**F. Reconstitution & Administration Guide**
For each compound, provide reconstitution instructions, administration route, and storage conditions.

MANDATORY RESPONSE FORMAT:

## Prescription Review: ${rxId}
**Patient:** ${patientName} | **Status:** ${rx?.status || 'Unknown'}

### [Answer to User's Specific Request]
[Detailed, structured clinical analysis]

### ⚠️ Clinical Flags
[Any safety concerns, interactions, or dosing anomalies — use RED flags for high risk, YELLOW for moderate]

### Recommendations
[Specific, actionable clinical recommendations for the prescribing doctor]

### Next Actions
- [View Full Prescription Details](/admin/prescriptions/${rxId})
- [Edit Prescription](/admin/prescriptions/${rxId}/edit)
- [Generate Clinical Report](/admin/prescriptions/${rxId}/report)

MANDATORY RULES:
- ${forceEnglish ? 'ALWAYS respond in ENGLISH regardless of the language the user writes in.' : ''}
- CLINICAL ACCURACY IS PARAMOUNT. Only cite compound interactions supported by published research. State uncertainty explicitly.
- Use a safety-first approach: if in doubt, flag it.
- NEVER suggest stopping or changing a prescription without recommending the doctor review the change.
- Do NOT include or discuss pricing.
- Always close with: *Clinical AI analysis is advisory only. Final clinical decisions rest with the prescribing healthcare provider.*
`;
}

/**
 * Prompt de auto-generación para modo prescripción.
 * No auto-genera por defecto — es más seguro esperar la pregunta específica del doctor.
 * Pero si se llama explícitamente, genera una revisión de seguridad inicial.
 */
export function buildAutoPrescriptionPrompt(rx) {
  const patientName = rx?.patientName || rx?.patient?.name || 'the patient';
  const items = rx?.items || rx?.products || rx?.compounds || [];
  const compoundList = items.map(i => i.productName || i.canonicalName || i.name).filter(Boolean);

  if (!compoundList.length) {
    return `Perform an initial safety review of this prescription for ${patientName}. Summarize the clinical rationale, identify any potential interactions, and recommend monitoring parameters.`;
  }

  return `Perform a compound interaction and safety review for this prescription for ${patientName}. Compounds prescribed: ${compoundList.join(', ')}. Analyze: (1) any known receptor interactions or antagonisms, (2) timing conflicts, (3) dosing appropriateness, and (4) recommended monitoring biomarkers.`;
}

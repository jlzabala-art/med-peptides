/**
 * publicAiPresets.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized registry of contextual prompts and categories for Atlas AI
 * across all public pages and clinical touchpoints.
 *
 * Adheres to GCP architecture standards:
 * - Single source of truth for public AI contextual queries.
 * - Standardized bilingual support (English / Spanish).
 * - Decouples page presentation logic from AI prompt engineering.
 */

export const AI_PAGE_PRESETS = {
  PRODUCT: 'product',
  RAW_API: 'raw_api',
  COSMETIC: 'cosmetic',
  PROTOCOL: 'protocol',
  PROTOCOLS_DIRECTORY: 'protocols_directory',
  COLLECTION: 'collection',
  DOCTOR_PORTAL: 'doctor_portal',
  RX_INTAKE: 'rx_intake',
  PRESCRIPTION: 'prescription',
  BATCH_VERIFY: 'batch_verify',
  QUOTATION: 'quotation',
  CALCULATOR: 'calculator',
  EDUCATION: 'education',
  GENERAL: 'general'
};

/**
 * Returns a standardized AI context query and category based on page preset.
 *
 * @param {Object} options
 * @param {string} options.type - One of AI_PAGE_PRESETS (e.g. 'product', 'protocol', 'calculator')
 * @param {string} [options.title] - Resource title or product name
 * @param {string} [options.category] - Clinical category or therapeutic area
 * @param {string} [options.lang='en'] - 'en' | 'es'
 * @param {Object} [options.meta] - Additional contextual metadata (e.g. { batchCode, doctorName, rxCode })
 * @returns {{ query: string, category: string }}
 */
export function getPublicAiPreset({
  type = AI_PAGE_PRESETS.GENERAL,
  title = '',
  category = '',
  lang = 'en',
  meta = {}
}) {
  const isEs = lang === 'es';
  const name = title || (isEs ? 'este recurso' : 'this resource');

  switch (type) {
    case AI_PAGE_PRESETS.PRODUCT:
      return {
        category: category || (isEs ? 'Monografía Técnica' : 'Technical Monograph'),
        query: isEs
          ? `¿Cuáles son las especificaciones técnicas, control de pureza RP-HPLC y posología clínica de ${name}?`
          : `What are the technical specifications, RP-HPLC purity control, and clinical posology for ${name}?`
      };

    case AI_PAGE_PRESETS.RAW_API:
      return {
        category: category || (isEs ? 'Materia Prima Grado Farmacopea' : 'Pharmacopeial Grade Raw API'),
        query: isEs
          ? `¿Cuáles son las pautas de solubilidad, compatibilidad de excipientes y filtración estéril para ${name}?`
          : `What are the solubility guidelines, excipient compatibility, and sterile filtration parameters for ${name}?`
      };

    case AI_PAGE_PRESETS.COSMETIC:
      return {
        category: category || (isEs ? 'Dermocosmética Avanzada' : 'Advanced Cosmeceuticals'),
        query: isEs
          ? `¿Cuáles son los mecanismos de absorción transdérmica, pauta de aplicación y sinergia dérmica de ${name}?`
          : `What are the transdermal absorption mechanisms, application regimen, and dermal synergies for ${name}?`
      };

    case AI_PAGE_PRESETS.PROTOCOL:
      return {
        category: category || (isEs ? 'Protocolo Clínico' : 'Clinical Protocol'),
        query: isEs
          ? `¿Cuáles son las fases de titulación, biomarcadores de seguimiento y cronobiología del protocolo ${name}?`
          : `What are the titration phases, surveillance biomarkers, and chronobiology of the ${name} protocol?`
      };

    case AI_PAGE_PRESETS.PROTOCOLS_DIRECTORY:
      return {
        category: category || (isEs ? 'Directorio de Protocolos' : 'Protocols Directory'),
        query: isEs
          ? '¿Qué protocolo clínico es el más adecuado según el objetivo terapéutico y los biomarcadores basales del paciente?'
          : 'Which clinical protocol is most suitable according to the therapeutic endpoint and patient baseline biomarkers?'
      };

    case AI_PAGE_PRESETS.COLLECTION:
      return {
        category: category || (isEs ? 'Colección Terapéutica' : 'Therapeutic Collection'),
        query: isEs
          ? `¿Cuáles son las sinergias clínicas y criterios de selección para las formulaciones de la colección ${name}?`
          : `What are the clinical synergies and selection criteria for formulations in the ${name} collection?`
      };

    case AI_PAGE_PRESETS.DOCTOR_PORTAL:
      return {
        category: category || (isEs ? 'Portal Médico' : 'Doctor Portal'),
        query: isEs
          ? `¿Cuáles son las especialidades clínicas, protocolos recomendados y vías de consulta con ${name || 'el doctor'}?`
          : `What are the clinical specialties, recommended protocols, and consultation pathways with ${name || 'the physician'}?`
      };

    case AI_PAGE_PRESETS.RX_INTAKE:
      return {
        category: category || (isEs ? 'Digitalización de Prescripciones' : 'Prescription Digitization'),
        query: isEs
          ? '¿Cómo verifica Atlas AI la precisión de dosificación y concordancia de formulaciones al digitalizar prescripciones médicas y analíticas?'
          : 'How does Atlas AI verify dosage accuracy and formulation concordance when digitizing medical prescriptions and lab reports?'
      };

    case AI_PAGE_PRESETS.PRESCRIPTION:
      return {
        category: category || (isEs ? 'Guía de Tratamiento' : 'Treatment Guide'),
        query: isEs
          ? `¿Cuáles son las instrucciones de administración, conservación en frío y pautas de seguimiento para la prescripción ${meta.rxCode || name}?`
          : `What are the administration instructions, cold-chain storage, and monitoring guidelines for prescription ${meta.rxCode || name}?`
      };

    case AI_PAGE_PRESETS.BATCH_VERIFY:
      return {
        category: category || (isEs ? 'Certificado de Análisis (CoA)' : 'Certificate of Analysis (CoA)'),
        query: isEs
          ? `¿Cuáles son los parámetros analíticos de pureza cromatográfica, endotoxinas bacterianas y conformidad del lote ${meta.batchCode || name}?`
          : `What are the analytical parameters for chromatographic purity, bacterial endotoxins, and batch release conformity for lot ${meta.batchCode || name}?`
      };

    case AI_PAGE_PRESETS.QUOTATION:
      return {
        category: category || (isEs ? 'Cotización Institucional' : 'Institutional Quotation'),
        query: isEs
          ? '¿Cuáles son los tiempos de entrega, embalaje y condiciones institucionales de esta cotización?'
          : 'What are the packaging standards, delivery lead times, and institutional conditions for this quotation?'
      };

    case AI_PAGE_PRESETS.CALCULATOR:
      return {
        category: category || (isEs ? 'Calculadora de Reconstitución' : 'Reconstitution Calculator'),
        query: isEs
          ? '¿Cómo se calcula el volumen exacto de agua bacteriostática (BAC) y las unidades en jeringa U-100 para una dosis prescrita?'
          : 'How do you calculate the exact bacteriostatic water (BAC) volume and U-100 syringe ticks for a prescribed dose?'
      };

    case AI_PAGE_PRESETS.EDUCATION:
      return {
        category: category || (isEs ? 'Academia de Péptidos' : 'Peptide Science Academy'),
        query: isEs
          ? '¿Qué son los péptidos bioreguladores, cómo actúan a nivel de señalización celular y cuáles son sus aplicaciones en medicina regenerativa?'
          : 'What are bioregulator peptides, how do they signal at the cellular level, and what are their applications in regenerative medicine?'
      };

    case AI_PAGE_PRESETS.GENERAL:
    default:
      return {
        category: category || (isEs ? 'Asistente Clínico' : 'Clinical Copilot'),
        query: isEs
          ? `¿Qué aplicaciones clínicas, evidencia y pautas tiene ${name}?`
          : `What are the clinical applications, evidence, and guidelines for ${name}?`
      };
  }
}

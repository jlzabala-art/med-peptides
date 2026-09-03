/**
 * openModuleAI.js
 *
 * Helper centralizado para invocar el ClinicalAI desde cualquier módulo.
 * Reemplaza los 40+ `window.dispatchEvent(new CustomEvent('open-clinical-ai', ...))` esparcidos.
 *
 * El `moduleMode` determina el system prompt que recibirá el LLM:
 *   'product'      → Product Intelligence (8 secciones clínicas)
 *   'protocol'     → Protocol Analysis (fases, sinergias, optimización)
 *   'prescription' → Prescription Review (seguridad, dosis, nota clínica)
 *   'admin'        → Admin Operations (modo genérico, último recurso)
 *   'general'      → Research general (sin contexto de módulo)
 *
 * @example
 * // Desde catálogo de productos:
 * openModuleAI('product', productData, { autoGenerate: true });
 *
 * // Desde editor de protocolo:
 * openModuleAI('protocol', { name, phases, goal, peptideIds }, { autoGenerate: true });
 *
 * // Desde tabla de prescripciones:
 * openModuleAI('prescription', { id, patientName, items, status, doctorName });
 */

/**
 * @param {'product'|'protocol'|'prescription'|'admin'|'general'} moduleMode
 * @param {object} entityData   — Datos del contexto (producto, protocolo, prescripción)
 * @param {object} opts
 * @param {boolean} [opts.autoGenerate=false]    — Si true, auto-genera el análisis al abrir
 * @param {boolean} [opts.clearHistory=true]     — Limpiar historial al abrir
 * @param {boolean} [opts.autoSend=true]         — Auto-enviar el prompt inicial
 * @param {string}  [opts.displayText]           — Texto del header del chat
 * @param {string}  [opts.initialPrompt]         — Prompt personalizado (sobreescribe el auto)
 */
export function openModuleAI(moduleMode, entityData = {}, opts = {}) {
  const {
    autoGenerate = false,
    clearHistory = true,
    autoSend = true,
    displayText,
    initialPrompt,
  } = opts;

  const isProduct      = moduleMode === 'product';
  const isProtocol     = moduleMode === 'protocol';
  const isPrescription = moduleMode === 'prescription';

  const defaultDisplayText = {
    product:      `Clinical Profile: ${entityData.canonicalName || entityData.name || 'Product'}`,
    protocol:     `Protocol Analysis: ${entityData.name || entityData.protocol_name || 'Protocol'}`,
    prescription: `Prescription Review: ${entityData.id || entityData.patientName || 'Prescription'}`,
    admin:        'Admin Intelligence',
    general:      'Clinical Research',
  }[moduleMode] || 'ClinicalAI';

  const entityName = {
    product:      entityData.canonicalName || entityData.name,
    protocol:     entityData.name || entityData.protocol_name,
    prescription: entityData.patientName || entityData.id,
    admin:        entityData.label || entityData.title,
    general:      entityData.name,
  }[moduleMode] || entityData.name;

  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
    detail: {
      // ── Modo del módulo (máxima prioridad sobre contextMode del panel) ──────
      moduleMode,
      // Retrocompatibilidad con flags anteriores
      productMode:      isProduct,
      autoGenerate:     autoGenerate && !initialPrompt,
      // ── Metadata del dispatch ─────────────────────────────────────────────
      action:           'ask_about_entity',
      entityName,
      displayText:      displayText || defaultDisplayText,
      autoSend,
      clearHistory,
      // ── Prompt personalizado (si se pasa, sobreescribe autoGenerate) ──────
      ...(initialPrompt ? { message: initialPrompt } : {}),
      // ── Contexto completo del módulo ──────────────────────────────────────
      context: {
        ...entityData,
        moduleMode,
        // Flags de navegación para compatibilidad con lógica existente
        isProductPage:      isProduct,
        isProtocolPage:     isProtocol,
        isPrescriptionPage: isPrescription,
      },
    },
  }));
}

/**
 * Versiones especializadas por módulo — API más ergonómica.
 */

/** Abre el AI en modo Product Intelligence */
export const openProductAI = (product, opts = {}) =>
  openModuleAI('product', product, { autoGenerate: true, ...opts });

/** Abre el AI en modo Protocol Analysis */
export const openProtocolAI = (protocol, opts = {}) =>
  openModuleAI('protocol', protocol, { autoGenerate: true, ...opts });

/** Abre el AI en modo Prescription Review */
export const openPrescriptionAI = (prescription, opts = {}) =>
  openModuleAI('prescription', prescription, { autoGenerate: false, ...opts });

/** Abre el AI en modo Supplier Procurement Intelligence */
export const openSupplierAI = (supplier, opts = {}) =>
  openModuleAI('supplier', supplier, { autoGenerate: true, ...opts });

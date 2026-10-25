/**
 * shareTemplates.js
 * 
 * Centralized, bilingual (ES/EN) message generator for shared assets across Atlas Health & Atlas Solutions.
 * Unifies WhatsApp and Email copy for:
 * - Doctors (Clinical Portal 1-Tap Access)
 * - Patients (Nominal Rx & Posology Dossier)
 * - Wholesalers / Distributors (B2B Vials Catalog & Price Margins)
 * - Prescriptions (Digital Rx verification)
 * - Custom / Generic links
 */

/**
 * Generate official WhatsApp message text
 * 
 * @param {Object} params
 * @param {'doctor'|'patient'|'wholesaler'|'prescription'|'custom'} params.entityType
 * @param {string} params.name Recipient name
 * @param {string} params.url Target or tracked short URL (/c/SH-...)
 * @param {string} [params.id] Entity ID or code (e.g. Rx code, Doctor slug)
 * @param {'es'|'en'} [params.lang='es'] Language preference
 * @returns {string} Clean formatted WhatsApp text
 */
export function generateShareWhatsAppMessage({
  entityType = 'custom',
  name = 'Usuario',
  url = 'https://www.atlashealth-services.com',
  id = '',
  lang = 'es',
}) {
  const isEn = lang === 'en';

  switch (entityType) {
    case 'doctor':
      if (isEn) {
        return (
          `🩺 *Atlas Health Services — 1-Tap Clinical Access*\n\n` +
          `Dear Dr. ${name},\n\n` +
          `You can securely access your verified physician portal, nominal patient files, and clinical protocols here:\n\n` +
          `👉 ${url}\n\n` +
          `_Atlas Health Services — Clinical Operations_`
        );
      }
      return (
        `🩺 *Atlas Health Services — Acceso Clínico 1-Tap*\n\n` +
        `Estimado/a Dr. ${name},\n\n` +
        `Puede acceder a su portal médico verificado, expedientes nominales y protocolos clínicos en el siguiente enlace:\n\n` +
        `👉 ${url}\n\n` +
        `_Atlas Health Services — Operaciones Clínicas_`
      );

    case 'patient':
      if (isEn) {
        return (
          `🏥 *Atlas Clinical Platform — Medical Dossier*\n\n` +
          `Dear ${name},\n\n` +
          `You can securely view your active posology, clinical instructions, and digital prescription here:\n\n` +
          `👉 ${url}\n\n` +
          `🔒 _Confidential Atlas Health Services portal._`
        );
      }
      return (
        `🏥 *Atlas Clinical Platform — Expediente de Paciente*\n\n` +
        `Estimado/a ${name},\n\n` +
        `Puede acceder a su expediente clínico digitalizado, posología activa y prescripción médica en el siguiente enlace:\n\n` +
        `👉 ${url}\n\n` +
        `🔒 _Portal confidencial Atlas Health Services._`
      );

    case 'wholesaler':
      if (isEn) {
        return (
          `📦 *Atlas Solutions — B2B Wholesale Catalog*\n\n` +
          `Dear ${name},\n\n` +
          `Here is your verified access to the vials catalog with your wholesale distribution margins linked:\n\n` +
          `👉 ${url}\n\n` +
          `_Atlas Solutions B2B Operations_`
        );
      }
      return (
        `📦 *Atlas Solutions — Catálogo Mayorista B2B*\n\n` +
        `Estimado/a ${name},\n\n` +
        `Adjuntamos su acceso verificado al catálogo de viales con márgenes de distribución vinculados:\n\n` +
        `👉 ${url}\n\n` +
        `_Atlas Solutions B2B Operations_`
      );

    case 'prescription': {
      const rxLabel = id ? `#${id}` : '';
      if (isEn) {
        return (
          `📋 *Atlas Clinical Platform — Digital Prescription ${rxLabel}*\n\n` +
          `Dear ${name},\n\n` +
          `You can view your dosage instructions and verified medical prescription here:\n\n` +
          `👉 ${url}\n\n` +
          `_Atlas Clinical Services_`
        );
      }
      return (
        `📋 *Atlas Clinical Platform — Prescripción Digital ${rxLabel}*\n\n` +
        `Estimado/a ${name},\n\n` +
        `Puede consultar su pauta de dosificación y verificación clínica en:\n\n` +
        `👉 ${url}\n\n` +
        `_Atlas Clinical Services_`
      );
    }

    default:
      if (isEn) {
        return (
          `🔗 *Atlas Health Services*\n\n` +
          `Dear ${name}, here is your official link:\n\n` +
          `👉 ${url}`
        );
      }
      return (
        `🔗 *Atlas Health Services*\n\n` +
        `Estimado/a ${name}, le compartimos el siguiente enlace oficial:\n\n` +
        `👉 ${url}`
      );
  }
}

/**
 * Generate official Email Subject & Body
 */
export function generateShareEmailContent({
  entityType = 'custom',
  name = 'Usuario',
  url = 'https://www.atlashealth-services.com',
  id = '',
  lang = 'es',
}) {
  const isEn = lang === 'en';

  let subject;
  let body;

  switch (entityType) {
    case 'doctor':
      subject = isEn 
        ? `Atlas Health Services — Clinical Portal Access (Dr. ${name})`
        : `Atlas Health Services — Acceso a Portal Clínico (Dr. ${name})`;
      body = generateShareWhatsAppMessage({ entityType, name, url, id, lang });
      break;

    case 'patient':
      subject = isEn
        ? `Atlas Clinical Platform — Your Medical Dossier & Prescription`
        : `Atlas Clinical Platform — Su Expediente Clínico y Prescripción`;
      body = generateShareWhatsAppMessage({ entityType, name, url, id, lang });
      break;

    case 'wholesaler':
      subject = isEn
        ? `Atlas Solutions B2B — Wholesale Catalog Access`
        : `Atlas Solutions B2B — Acceso a Catálogo Mayorista`;
      body = generateShareWhatsAppMessage({ entityType, name, url, id, lang });
      break;

    case 'prescription':
      subject = isEn
        ? `Atlas Clinical — Digital Prescription ${id ? '#' + id : ''}`
        : `Atlas Clinical — Prescripción Digital ${id ? '#' + id : ''}`;
      body = generateShareWhatsAppMessage({ entityType, name, url, id, lang });
      break;

    default:
      subject = isEn ? `Atlas Health Services — Shared Link` : `Atlas Health Services — Enlace Compartido`;
      body = generateShareWhatsAppMessage({ entityType, name, url, id, lang });
      break;
  }

  return { subject, body };
}

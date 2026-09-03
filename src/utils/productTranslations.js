/**
 * productTranslations.js
 * Internationalization dictionaries and helpers for public clinical datasheets.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'DE', name: 'Deutsch', flag: '🇩🇪' },
];

export const SUPPORTED_LANGS = SUPPORTED_LANGUAGES;

export const UI_I18N = {
  en: {
    brandName: 'RegenPept',
    datasheetBadge: 'Product Information Sheet',
    prescriptionRequired: '℞ Prescription Required',
    copyLink: 'Copy link',
    copied: 'Copied!',
    printPdf: 'Print / PDF',
    shareWhatsapp: 'Share on WhatsApp',
    downloadPdf: 'Download Datasheet (PDF)',
    whatsappText: 'Clinical Information Sheet',
    scannedForGuide: 'View clinical guide',
    mechanism: 'Mechanism of Action',
    dosage: 'Dosage & Presentations',
    reconstitution: 'Reconstitution Guide',
    storage: 'Storage Conditions',
    contraindications: 'Contraindications & Warnings',
    format: 'Format',
    purity: 'Purity',
    route: 'Route',
  },
  es: {
    brandName: 'RegenPept',
    datasheetBadge: 'Ficha de Información de Producto',
    prescriptionRequired: '℞ Requiere Prescripción',
    copyLink: 'Copiar enlace',
    copied: '¡Copiado!',
    printPdf: 'Imprimir / PDF',
    shareWhatsapp: 'Compartir en WhatsApp',
    downloadPdf: 'Descargar Ficha (PDF)',
    whatsappText: 'Ficha de Información Clínica',
    scannedForGuide: 'Ver guía clínica',
    mechanism: 'Mecanismo de Acción',
    dosage: 'Dosificación y Presentaciones',
    reconstitution: 'Guía de Reconstitución',
    storage: 'Condiciones de Almacenamiento',
    contraindications: 'Contraindicaciones y Advertencias',
    format: 'Formato',
    purity: 'Pureza',
    route: 'Vía',
  },
  fr: {
    brandName: 'RegenPept',
    datasheetBadge: 'Fiche d\'Information Produit',
    prescriptionRequired: '℞ Prescription Requise',
    copyLink: 'Copier le lien',
    copied: 'Copié !',
    printPdf: 'Imprimer / PDF',
    shareWhatsapp: 'Partager sur WhatsApp',
    downloadPdf: 'Télécharger la Fiche (PDF)',
    whatsappText: 'Fiche d\'Information Clinique',
    scannedForGuide: 'Consulter le guide clinique',
    mechanism: 'Mécanisme d\'Action',
    dosage: 'Posologie et Présentations',
    reconstitution: 'Guide de Reconstitution',
    storage: 'Conditions de Stockage',
    contraindications: 'Contre-indications et Avertissements',
    format: 'Format',
    purity: 'Pureté',
    route: 'Voie',
  },
  de: {
    brandName: 'RegenPept',
    datasheetBadge: 'Produktinformationsblatt',
    prescriptionRequired: '℞ Verschreibungspflichtig',
    copyLink: 'Link kopieren',
    copied: 'Kopiert!',
    printPdf: 'Drucken / PDF',
    shareWhatsapp: 'Auf WhatsApp teilen',
    downloadPdf: 'Datenblatt herunterladen (PDF)',
    whatsappText: 'Klinisches Informationsblatt',
    scannedForGuide: 'Klinischen Leitfaden ansehen',
    mechanism: 'Wirkungsmechanismus',
    dosage: 'Dosierung & Darreichungsformen',
    reconstitution: 'Rekonstitutionsanleitung',
    storage: 'Lagerungsbedingungen',
    contraindications: 'Kontraindikationen & Warnhinweise',
    format: 'Format',
    purity: 'Reinheit',
    route: 'Verabreichungsweg',
  }
};

export function getTranslations(lang = 'en') {
  return UI_I18N[lang] || UI_I18N.en;
}

export function getLocalizedField(product, field, lang = 'en') {
  if (!product) return '';
  const translations = product.aiContent?.translations?.[lang] || product.translations?.[lang] || {};
  return translations[field] || product[`${field}_${lang}`] || product[field] || '';
}

export function getLocalizedProduct(product, lang = 'en') {
  if (!product) return product;
  const translations = product.aiContent?.translations?.[lang] || product.translations?.[lang] || {};

  return {
    ...product,
    displayName: translations.name || product[`name_${lang}`] || product.name || product.displayName,
    description: translations.description || product[`description_${lang}`] || product.description || product.desc,
    desc: translations.description || product[`description_${lang}`] || product.desc || product.description,
    objective: translations.objective || product[`objective_${lang}`] || product.objective,
    mechanisms: translations.mechanisms || product[`mechanisms_${lang}`] || product.mechanisms,
  };
}

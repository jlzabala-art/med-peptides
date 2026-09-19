/**
 * catalogI18n.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Translations for the Shared Catalog view (/c/[id] and /shared/catalog/[token]).
 *
 * Default language: English ('en').
 * Alternate:        Spanish  ('es').
 *
 * Usage:
 *   import { useI18n } from './catalogI18n';
 *   const { t, lang, setLang } = useI18n();
 *   <span>{t('catalog.validUntil')}</span>
 */

export const CATALOG_TRANSLATIONS = {
  en: {
    // ── Header / branding ─────────────────────────────────────────────────
    'header.exclusive'      : 'Exclusive Portfolio',
    'header.poweredBy'      : 'Powered by',
    'header.validUntil'     : 'Valid until',
    'header.expires'        : 'Expires',
    'header.requestedFor'   : 'Prepared for',
    'header.viewExpired'    : 'This catalog has expired.',
    'header.invalid'        : 'This catalog link is invalid or has been revoked.',
    'header.verifiedBy'     : 'Verified by Atlas Health',

    // ── Navigation / actions ──────────────────────────────────────────────
    'nav.downloadPDF'       : 'Download PDF',
    'nav.requestOrder'      : 'Request Order',
    'nav.viewAll'           : 'View All',
    'nav.search'            : 'Search products…',
    'nav.filter'            : 'Filter',
    'nav.sortBy'            : 'Sort by',
    'nav.category'          : 'Category',
    'nav.supplier'          : 'Supplier',
    'nav.clearFilters'      : 'Clear filters',
    'nav.backToTop'         : 'Back to top',
    'nav.contactUs'         : 'Contact Us',

    // ── Product card ──────────────────────────────────────────────────────
    'product.strength'      : 'Strength',
    'product.purity'        : 'Purity',
    'product.format'        : 'Format',
    'product.storage'       : 'Storage',
    'product.reconstitution': 'Reconstitution',
    'product.cas'           : 'CAS',
    'product.supplier'      : 'Supplier',
    'product.price'         : 'Price',
    'product.unitPrice'     : 'Unit Price',
    'product.margin'        : 'Margin',
    'product.availability'  : 'Availability',
    'product.inStock'       : 'In Stock',
    'product.onDemand'      : 'On Demand',
    'product.outOfStock'    : 'Out of Stock',
    'product.addToOrder'    : 'Add to Order',
    'product.viewDetails'   : 'View Details',
    'product.moreInfo'      : 'More info',
    'product.researchOnly'  : 'For research use only',
    'product.leadTime'      : 'Lead time',
    'product.viewSDS'       : 'View SDS / COA',
    'product.molecular'     : 'Molecular Weight',
    'product.officialMonograph': 'Official Monograph (Atlas Services) ↗',
    'product.protocolDilution': 'Protocol & Dilution ↗',

    // ── Order / cart ──────────────────────────────────────────────────────
    'order.title'           : 'Your Order Request',
    'order.empty'           : 'No products added yet.',
    'order.subtotal'        : 'Subtotal',
    'order.send'            : 'Send Order Request',
    'order.sending'         : 'Sending…',
    'order.sent'            : 'Order request sent!',
    'order.error'           : 'Failed to send. Please try again.',
    'order.notes'           : 'Notes for the supplier',
    'order.notesPlaceholder': 'Special instructions, delivery notes…',
    'order.qty'             : 'Qty',
    'order.remove'          : 'Remove',
    'order.confirmSend'     : 'Confirm & Send',

    // ── States / misc ─────────────────────────────────────────────────────
    'state.loading'         : 'Loading catalog…',
    'state.noProducts'      : 'No products found.',
    'state.noMatch'         : 'No products match your search.',
    'state.trySearch'       : 'Try a different search term.',
    'state.errorTitle'      : 'Could not load catalog',
    'state.errorSub'        : 'Please check your connection and try again.',

    // ── Footer / legal ────────────────────────────────────────────────────
    'footer.research'       : 'All products are for research purposes only.',
    'footer.confidential'   : 'This catalog is confidential and intended solely for the recipient.',
    'footer.contact'        : 'Contact',
    'footer.terms'          : 'Terms of Use',
  },

  es: {
    // ── Header / branding ─────────────────────────────────────────────────
    'header.exclusive'      : 'Portafolio Exclusivo',
    'header.poweredBy'      : 'Desarrollado por',
    'header.validUntil'     : 'Válido hasta',
    'header.expires'        : 'Vence el',
    'header.requestedFor'   : 'Preparado para',
    'header.viewExpired'    : 'Este catálogo ha caducado.',
    'header.invalid'        : 'Este enlace de catálogo es inválido o ha sido revocado.',
    'header.verifiedBy'     : 'Verificado por Atlas Health',

    // ── Navigation / actions ──────────────────────────────────────────────
    'nav.downloadPDF'       : 'Descargar PDF',
    'nav.requestOrder'      : 'Solicitar Pedido',
    'nav.viewAll'           : 'Ver Todo',
    'nav.search'            : 'Buscar productos…',
    'nav.filter'            : 'Filtrar',
    'nav.sortBy'            : 'Ordenar por',
    'nav.category'          : 'Categoría',
    'nav.supplier'          : 'Proveedor',
    'nav.clearFilters'      : 'Limpiar filtros',
    'nav.backToTop'         : 'Volver arriba',
    'nav.contactUs'         : 'Contacto',

    // ── Product card ──────────────────────────────────────────────────────
    'product.strength'      : 'Concentración',
    'product.purity'        : 'Pureza',
    'product.format'        : 'Presentación',
    'product.storage'       : 'Almacenamiento',
    'product.reconstitution': 'Reconstitución',
    'product.cas'           : 'CAS',
    'product.supplier'      : 'Proveedor',
    'product.price'         : 'Precio',
    'product.unitPrice'     : 'Precio unitario',
    'product.margin'        : 'Margen',
    'product.availability'  : 'Disponibilidad',
    'product.inStock'       : 'En Stock',
    'product.onDemand'      : 'Bajo Pedido',
    'product.outOfStock'    : 'Sin Stock',
    'product.addToOrder'    : 'Añadir al Pedido',
    'product.viewDetails'   : 'Ver Detalles',
    'product.moreInfo'      : 'Más información',
    'product.researchOnly'  : 'Solo para uso en investigación',
    'product.leadTime'      : 'Tiempo de entrega',
    'product.viewSDS'       : 'Ver FDS / COA',
    'product.molecular'     : 'Peso Molecular',
    'product.officialMonograph': 'Monografía Oficial (Atlas Services) ↗',
    'product.protocolDilution': 'Protocolo & Dilución ↗',

    // ── Order / cart ──────────────────────────────────────────────────────
    'order.title'           : 'Tu Solicitud de Pedido',
    'order.empty'           : 'Sin productos añadidos aún.',
    'order.subtotal'        : 'Subtotal',
    'order.send'            : 'Enviar Solicitud',
    'order.sending'         : 'Enviando…',
    'order.sent'            : '¡Solicitud enviada con éxito!',
    'order.error'           : 'Error al enviar. Inténtalo de nuevo.',
    'order.notes'           : 'Notas para el proveedor',
    'order.notesPlaceholder': 'Instrucciones especiales, notas de entrega…',
    'order.qty'             : 'Cant.',
    'order.remove'          : 'Eliminar',
    'order.confirmSend'     : 'Confirmar y Enviar',

    // ── States / misc ─────────────────────────────────────────────────────
    'state.loading'         : 'Cargando catálogo…',
    'state.noProducts'      : 'Sin productos.',
    'state.noMatch'         : 'Ningún producto coincide con la búsqueda.',
    'state.trySearch'       : 'Prueba con otro término.',
    'state.errorTitle'      : 'No se pudo cargar el catálogo',
    'state.errorSub'        : 'Comprueba tu conexión y vuelve a intentarlo.',

    // ── Footer / legal ────────────────────────────────────────────────────
    'footer.research'       : 'Todos los productos son exclusivamente para investigación.',
    'footer.confidential'   : 'Este catálogo es confidencial y está destinado únicamente al destinatario.',
    'footer.contact'        : 'Contacto',
    'footer.terms'          : 'Términos de Uso',
  },
};

/** Supported language codes */
export const SUPPORTED_LANGS = ['en', 'es'];

/** Default language */
export const DEFAULT_LANG = 'en';

/** localStorage key for persisting language preference */
const LS_KEY = 'atlas_catalog_lang';

/**
 * Build a `t()` translator function for the given language.
 * Falls back to `key` if no translation is found.
 */
export function buildTranslator(lang) {
  const dict = CATALOG_TRANSLATIONS[lang] || CATALOG_TRANSLATIONS[DEFAULT_LANG];
  return (key, fallback) => dict[key] ?? fallback ?? key;
}

/**
 * Read the persisted language preference from localStorage.
 * Safe to call in browser context only.
 */
export function getPersistedLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  const stored = localStorage.getItem(LS_KEY);
  return SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
}

/**
 * Persist language preference to localStorage.
 */
export function persistLang(lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, lang);
}

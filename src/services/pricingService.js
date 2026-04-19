import wholesaleData from '../data/wholesale_parsed.json';

/**
 * MEJORAS APLICADAS:
 * 1. Singleton Pattern: El mapa normalizado se crea una sola vez al cargar el módulo, no en cada ejecución.
 * 2. Rendimiento O(1): Se prioriza el acceso directo por llave antes de intentar búsquedas parciales.
 * 3. Robustez Mobile: Normalización agresiva para manejar variaciones de teclado y espacios.
 */

const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

/**
 * Normaliza un string de dosage/strength para comparación de precios.
 * Extrae solo la parte numérica + unidad, ignorando sufijos como "/vial", "/kit".
 * Ejemplos: "5mg/vial" → "5mg", "10 mg" → "10mg", "2 IU/vial" → "2iu"
 */
const normalizeDosage = (str) => {
    if (!str) return '';
    // Extraer solo la primera parte antes de "/" si existe
    const cleaned = str.split('/')[0].trim();
    return normalizeString(cleaned);
};

// Se genera el mapa una sola vez (Singleton) para ahorrar ciclos de CPU
const WHOLESALE_MAP = Object.entries(wholesaleData).reduce((acc, [key, strengths]) => {
    acc[normalizeString(key)] = strengths;
    return acc;
}, {});

/**
 * Obtiene el precio mayorista con lógica de coincidencia inteligente.
 * @param {string} productName - Nombre del compuesto.
 * @param {string} strength - Concentración (ej. '10mg').
 */
export const getWholesalePrice = (productName, strength) => {
    if (!productName || !strength) return null;

    const normName = normalizeString(productName);
    const normStrength = normalizeDosage(strength);

    // 1. Acceso Directo (Máxima eficiencia)
    let family = WHOLESALE_MAP[normName];

    // 2. Búsqueda Parcial (Fallback para variaciones de nombre)
    if (!family) {
        const matchingKey = Object.keys(WHOLESALE_MAP).find(key =>
            normName.includes(key) || key.includes(normName)
        );
        family = WHOLESALE_MAP[matchingKey];
    }

    if (!family) return null;

    // 3. Búsqueda de Concentración Exacta
    const exactMatch = family.find(s => normalizeDosage(s.strength) === normStrength);

    if (exactMatch) {
        return {
            vialPrice: exactMatch.unit_price,
            kitPrice: exactMatch.kit_price,
            isExactMatch: true,
            displayStrength: exactMatch.strength // Añadido para feedback visual
        };
    }

    // 4. Búsqueda Flexible (Fuzzy Match para mobile)
    const flexibleMatch = family.find(s => {
        const sNorm = normalizeDosage(s.strength);
        return sNorm.includes(normStrength) || normStrength.includes(sNorm);
    });

    if (flexibleMatch) {
        return {
            vialPrice: flexibleMatch.unit_price,
            kitPrice: flexibleMatch.kit_price,
            isExactMatch: false,
            displayStrength: flexibleMatch.strength
        };
    }

    return null;
};
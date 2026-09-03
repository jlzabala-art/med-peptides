/**
 * storageQuotaGuard.js
 * 
 * Protege contra 'QuotaExceededError: The quota has been exceeded' en el navegador.
 * Este error ocurre cuando bibliotecas o cachés locales llenan el límite de 5MB de window.localStorage,
 * lo que provoca que Firestore (persistentMultipleTabManager) falle al intentar sincronizar pestañas.
 * 
 * Acciones:
 * 1. Poda preventiva de cachés sobredimensionadas (catálogos, listas masivas de proveedores, cachés expiradas).
 * 2. Protección de localStorage.setItem para auto-recuperar espacio y evitar caídas no controladas.
 */

export function pruneHeavyCaches() {
  if (typeof window === 'undefined') return;
  try {
    // 1. Claves conocidas que acumulan payloads masivos
    const heavyKeys = [
      '__rg_catalog_cache',
      '__rg_suppliers_cache',
      '__rg_wholesellers_cache',
      'regenpept_recent_imported',
      'cmd-palette-recent'
    ];

    for (const key of heavyKeys) {
      try {
        const item = localStorage.getItem(key);
        // Si la clave supera los 150KB en localStorage, se purga
        if (item && item.length > 150000) {
          localStorage.removeItem(key);
          console.info(`[StorageQuotaGuard] Purged oversized localStorage key "${key}" (${Math.round(item.length / 1024)} KB)`);
        }
      } catch (e) {}
    }

    // 2. Claves de capa de caché expiradas (cache:*)
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cache:')) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.expiresAt && parsed.expiresAt < now) {
              localStorage.removeItem(k);
            }
          }
        } catch (e) {
          localStorage.removeItem(k);
        }
      }
    }
  } catch (e) {}
}

export function pruneAggressive() {
  if (typeof window === 'undefined') return;
  try {
    // Claves críticas esenciales que nunca deben borrarse (sesión, idioma, tema, carrito)
    const preservedPrefixes = [
      'firebase:authUser',
      'language',
      'theme',
      'atlas_sidebar_expanded',
      'mp_cart',
      'mp_region'
    ];

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k) continue;
      const isPreserved = preservedPrefixes.some((p) => k.startsWith(p));
      if (!isPreserved && (k.startsWith('cache:') || k.startsWith('__rg_') || k.startsWith('regenpept_') || k.includes('cache'))) {
        try {
          localStorage.removeItem(k);
        } catch (e) {}
      }
    }
  } catch (e) {}
}

let isGuardInitialized = false;

export function initStorageQuotaGuard() {
  if (typeof window === 'undefined' || isGuardInitialized) return;
  isGuardInitialized = true;

  // Ejecutar limpieza preventiva inmediata
  pruneHeavyCaches();

  try {
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

    window.localStorage.setItem = function (key, value) {
      try {
        originalSetItem(key, value);
      } catch (err) {
        const isQuota =
          err &&
          (err.name === 'QuotaExceededError' ||
            err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            err.code === 22 ||
            err.code === 1014 ||
            String(err.message || '').toLowerCase().includes('quota'));

        if (isQuota) {
          console.warn(`[StorageQuotaGuard] Quota exceeded writing "${key}". Auto-recovering space...`);
          pruneHeavyCaches();

          try {
            originalSetItem(key, value);
          } catch (retryErr) {
            // Poda agresiva de cachés no esenciales
            pruneAggressive();
            try {
              originalSetItem(key, value);
            } catch (finalErr) {
              // Si aún no cabe y es una sincronización interna de Firestore o una caché secundaria,
              // evitamos que lance una excepción no capturada que rompa el loop de eventos.
              console.warn(`[StorageQuotaGuard] Suppressed localStorage QuotaExceededError for "${key}"`);
            }
          }
        } else {
          throw err;
        }
      };
    };
  } catch (e) {
    console.warn('[StorageQuotaGuard] Could not attach localStorage interceptor:', e);
  }
}

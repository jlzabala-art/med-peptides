import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Hook universal para DataModules que sincroniza el estado de los filtros y 
 * búsquedas tanto en los parámetros de la URL (Deep-linking) como en LocalStorage
 * para persistencia de la sesión del usuario.
 */
export default function useDataModuleState(namespace) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Actualiza un parámetro en la URL y lo guarda en LocalStorage.
   * Usado para búsqueda (q), filtros (status), y ordenamiento.
   */
  const updateUrlParam = (key, val) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    
    // Save to local storage for persistence (Memoria de usuario)
    if (namespace && typeof window !== 'undefined') {
      try {
        const currentPrefs = JSON.parse(localStorage.getItem(`regenpept-${namespace}-prefs`) || '{}');
        currentPrefs[key] = val;
        localStorage.setItem(`regenpept-${namespace}-prefs`, JSON.stringify(currentPrefs));
      } catch (err) {
        console.warn('Could not save data module prefs', err);
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /**
   * Lee un parámetro priorizando la URL. Si no existe en la URL, 
   * verifica si el usuario lo tenía guardado en su última sesión (LocalStorage).
   */
  const getUrlParam = (key, defaultValue = '') => {
    if (typeof window === 'undefined') return defaultValue; // Server-side rendering fallback

    const urlVal = searchParams.get(key);
    if (urlVal !== null) return urlVal;

    if (namespace) {
      try {
        const saved = JSON.parse(localStorage.getItem(`regenpept-${namespace}-prefs`) || '{}');
        if (saved[key] !== undefined) return saved[key];
      } catch (err) {
        console.warn('Could not read data module prefs', err);
      }
    }

    return defaultValue;
  };

  /**
   * Sincronizar el searchTerm con debounce
   */
  const updateSearchTerm = (term) => {
    updateUrlParam('q', term);
  };

  return {
    searchParams,
    updateUrlParam,
    getUrlParam,
    updateSearchTerm,
    searchTerm: getUrlParam('q', ''),
  };
}

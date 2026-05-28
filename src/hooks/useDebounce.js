 
import { useState, useEffect } from 'react';

/**
 * useDebounce — retrasa la actualización de un valor.
 * @param {*}      value  - valor a debouncear
 * @param {number} delay  - ms de espera (default 300)
 * @returns el valor debounceado
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

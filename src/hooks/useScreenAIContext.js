"use client";

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { resolveScreenAIContext } from '../utils/screenAIResolver';

/**
 * useScreenAIContext
 * React hook that returns the tailored AI Persona, Scope Key, and Suggested Prompts
 * based strictly on the active screen / route.
 */
export function useScreenAIContext(customPathname) {
  const currentPath = usePathname();
  const path = customPathname || currentPath || '/';

  return useMemo(() => {
    return resolveScreenAIContext(path);
  }, [path]);
}

export { resolveScreenAIContext } from '../utils/screenAIResolver';
export default useScreenAIContext;

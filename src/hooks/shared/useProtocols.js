import { useState, useEffect } from 'react';
import { getPublicProtocols, getAllProtocols } from '../../services/protocolStorage.js';

let cachedPublic = null;
let cachedAll = null;

/**
 * Shared hook to fetch protocols (Public for B2C, All for B2B)
 * with a simple in-memory cache to avoid redundant reads.
 */
export function useProtocols({ publicOnly = true, forceRefresh = false } = {}) {
  const [protocols, setProtocols] = useState(
    forceRefresh ? [] : (publicOnly ? cachedPublic || [] : cachedAll || [])
  );
  const [loading, setLoading] = useState(
    forceRefresh ? true : (publicOnly ? !cachedPublic : !cachedAll)
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Use cache if available and not forcing refresh
    if (!forceRefresh) {
      if (publicOnly && cachedPublic) return;
      if (!publicOnly && cachedAll) return;
    }

    setLoading(true);
    
    const fetcher = publicOnly ? getPublicProtocols : getAllProtocols;
    
    fetcher()
      .then(docs => {
        if (cancelled) return;
        if (publicOnly) cachedPublic = docs;
        else cachedAll = docs;
        
        setProtocols(docs);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[useProtocols] Failed to fetch protocols:', err);
        setError(err);
        setLoading(false);
      });
      
    return () => { cancelled = true; };
  }, [publicOnly, forceRefresh]);
  
  return { protocols, loading, error };
}

import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// In-memory singleton cache to persist data across component remounts
let financeCache = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function useFinanceData() {
  const [data, setData] = useState(financeCache);
  const [loading, setLoading] = useState(!financeCache);
  const [error, setError] = useState(null);

  const fetchFinancials = useCallback(async (force = false) => {
    const now = Date.now();
    
    // If not forcing, and cache is valid, use it
    if (!force && financeCache && cacheTimestamp && (now - cacheTimestamp < CACHE_TTL_MS)) {
      setData(financeCache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchDashboard = httpsCallable(functions, 'fetchFinanceDashboard');
      const res = await fetchDashboard();
      
      const dashboardData = res.data;
      
      // Compute total balance based on P&L data or simply mock if not available in Zoho payload yet
      // In the future this should come from Zoho Bank feeds, using 245600.50 for now
      const newData = {
        dashboardData,
        totalBalance: 245600.50,
        activeSubs: 150
      };

      financeCache = newData;
      cacheTimestamp = Date.now();
      
      setData(newData);
    } catch(err) {
      console.error('Error fetching financial data:', err);
      setError(err);
      
      // Fallback in case of error
      const fallbackData = {
        dashboardData: null,
        totalBalance: 245600.50,
        activeSubs: 150
      };
      
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancials(false);
  }, [fetchFinancials]);

  const forceRefresh = () => fetchFinancials(true);

  return { data, loading, error, forceRefresh };
}

import { useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useFinanceData() {
  const queryClient = useQueryClient();

  const fetchFinancials = async () => {
    const fetchDashboard = httpsCallable(functions, 'fetchFinanceDashboard');
    const res = await fetchDashboard();
    
    const dashboardData = res.data;
    
    // Compute total balance based on P&L data or simply mock if not available in Zoho payload yet
    // In the future this should come from Zoho Bank feeds, using 245600.50 for now
    return {
      dashboardData,
      totalBalance: 245600.50,
      activeSubs: 150
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['financeDashboardData'],
    queryFn: fetchFinancials,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on every window focus to save Zoho API limits
    retry: 1,
  });

  const forceRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Fallback data structure if query hasn't run or errored out completely without cached data
  const safeData = data || {
    dashboardData: null,
    totalBalance: 245600.50,
    activeSubs: 150
  };

  return { data: safeData, loading: isLoading, error, forceRefresh };
}

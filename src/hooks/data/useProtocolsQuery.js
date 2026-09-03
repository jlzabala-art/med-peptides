'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllProtocols, invalidateProtocolCache } from '@/repositories/protocolRepository';
import { queryKeys } from './queryKeys';

export function useProtocolsQuery(options = {}) {
  const queryClient = useQueryClient();
  const { category = null, search = '', forceRefresh = false, enabled = true } = options;

  const query = useQuery({
    queryKey: queryKeys.protocols.list({ category, search }),
    queryFn: async () => {
      return await getAllProtocols({ forceRefresh });
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,    // 1 hour
    enabled,
  });

  const filteredProtocols = (query.data || []).filter(p => {
    if (category && (p.category || '').toLowerCase() !== category.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = (p.name || p.title || '').toLowerCase().includes(q);
      const matchObjective = (p.objective || p.summary || '').toLowerCase().includes(q);
      return matchName || matchObjective;
    }
    return true;
  });

  const invalidate = () => {
    invalidateProtocolCache();
    queryClient.invalidateQueries({ queryKey: queryKeys.protocols.all });
  };

  return {
    ...query,
    protocols: filteredProtocols,
    allProtocols: query.data || [],
    invalidate,
  };
}

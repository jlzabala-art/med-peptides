import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { prescriptionRepository } from '../../repositories/prescriptionRepository';
import logger from '../../utils/logger';

/**
 * Hook estandarizado para obtener prescripciones utilizando React Query y Repositorios.
 * Implementa las 4 capas de la Golden Rule de rendimiento.
 */
export default function usePrescriptions(filters = {}, options = {}) {
  const queryClient = useQueryClient();
  const pageSize = options.pageSize || 50;
  const realtime = options.realtime !== undefined ? options.realtime : true;
  const orderByDesc = options.orderByDesc !== undefined ? options.orderByDesc : true;
  
  // Serializamos el queryKey para garantizar un caché robusto
  const filterStr = JSON.stringify(filters);
  const queryKey = ['prescriptions', filters, pageSize, orderByDesc];
  const cacheKey = `__rg_prescriptions_cache_${filterStr}_${pageSize}_${orderByDesc}`;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = null }) => 
      prescriptionRepository.getPrescriptionsPage({ filters, pageSize, pageParam, orderByDesc }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: null,
    staleTime: 5 * 60 * 1000, // 5 minutos de stale time (Capa 3 - RAM)
    initialData: () => {
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.ts < 30 * 60 * 1000) { // 30 min TTL
              return {
                pages: [{ data: parsed.data, lastDoc: null, hasMore: parsed.hasMore, fromCache: true }],
                pageParams: [null]
              };
            }
          }
        } catch (e) {
          logger.warn('[usePrescriptions] Failed to read cached initial data from localStorage:', e);
        }
      }
      return undefined;
    }
  });

  // Suscripción en tiempo real (Capa 4 - Sync Activo) y Persistencia en LocalStorage
  useEffect(() => {
    // Si obtenemos datos frescos del servidor en la página 0, los guardamos en localStorage
    if (infiniteData?.pages?.[0] && !infiniteData.pages[0].fromCache && typeof window !== 'undefined') {
      try {
        const firstPage = infiniteData.pages[0];
        localStorage.setItem(cacheKey, JSON.stringify({
          data: firstPage.data,
          hasMore: firstPage.hasMore,
          ts: Date.now()
        }));
      } catch (e) {
        logger.warn('[usePrescriptions] Failed to persist page cache in localStorage:', e);
      }
    }

    if (!realtime) return;
    
    const q = prescriptionRepository.buildQuery(filters, pageSize, null, orderByDesc);
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Actualizar solo la primera página para mantener la paginación estable
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          data,
          lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
          hasMore: snap.docs.length === pageSize,
          fromCache: false
        };
        return { ...oldData, pages: newPages };
      });
    }, (err) => {
      logger.error('[usePrescriptions] Error in realtime sync:', err);
    });

    return () => unsub();
  }, [filterStr, pageSize, realtime, orderByDesc, queryClient, infiniteData, cacheKey]);

  // Aplanar las páginas de React Query para mantener compatibilidad hacia atrás
  const flatData = infiniteData?.pages.flatMap(page => page.data) || [];

  return {
    data: flatData,
    loading: isLoading,
    error,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetching
  };
}

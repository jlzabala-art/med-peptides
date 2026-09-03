/**
 * speculativePrefetch.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Speculatively prefetches data into the React Query cache and browser memory
 * when the user hovers over navigation links (SideNav, TopBar, QuickLinks).
 * Eliminates fetch lag and spinner flashes upon page transition.
 */

const prefetchedModules = new Set();

export async function prefetchModuleData(moduleId, queryClient, role = 'admin') {
  if (!moduleId || !queryClient || typeof window === 'undefined') return;

  const cacheKey = `${moduleId}_${role}`;
  if (prefetchedModules.has(cacheKey)) return;
  prefetchedModules.add(cacheKey);

  try {
    switch (moduleId) {
      case 'products':
      case 'catalog':
      case 'catalog-builder': {
        // 1. Prefetch API JSON routes
        fetch('/api/catalog/facets').catch(() => {});
        fetch('/api/catalog/summary?limit=50&offset=0').catch(() => {});

        // 2. Prefetch React Query keys
        queryClient.prefetchQuery({
          queryKey: ['catalog-facets'],
          queryFn: () => fetch('/api/catalog/facets').then(r => r.json()),
          staleTime: 1000 * 60 * 15,
        });
        break;
      }

      case 'quotations':
      case 'quotes': {
        queryClient.prefetchQuery({
          queryKey: ['quotations', 'list', { effectiveRole: role }],
          queryFn: async () => {
            const { collection, getDocs, limit, query } = await import('firebase/firestore');
            const { db } = await import('@/firebase');
            const snap = await getDocs(query(collection(db, 'quotations'), limit(50)));
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
          },
          staleTime: 1000 * 60 * 10,
        });
        break;
      }

      case 'orders':
      case 'purchase-orders': {
        queryClient.prefetchQuery({
          queryKey: ['purchase-orders', 'list'],
          queryFn: async () => {
            const { collection, getDocs, limit, query } = await import('firebase/firestore');
            const { db } = await import('@/firebase');
            const snap = await getDocs(query(collection(db, 'purchase-orders'), limit(50)));
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
          },
          staleTime: 1000 * 60 * 10,
        });
        break;
      }

      case 'patients': {
        import('@/repositories/patientRepository').then((mod) => {
          const fetchPatients = mod.getAllPatients || mod.getPatients || mod.default?.getAll;
          if (fetchPatients) {
            queryClient.prefetchQuery({
              queryKey: ['patients', 'list', { effectiveRole: role }],
              queryFn: () => fetchPatients(),
              staleTime: 1000 * 60 * 15,
            });
          }
        }).catch(() => {});
        break;
      }

      case 'prescriptions':
      case 'prescription-intake': {
        import('@/repositories/prescriptionRepository').then(({ getAllPrescriptions }) => {
          if (getAllPrescriptions) {
            queryClient.prefetchQuery({
              queryKey: ['prescriptions', 'list', { effectiveRole: role }],
              queryFn: () => getAllPrescriptions(),
              staleTime: 1000 * 60 * 15,
            });
          }
        }).catch(() => {});
        break;
      }

      case 'protocols': {
        import('@/repositories/protocolRepository').then(({ getAllProtocols }) => {
          if (getAllProtocols) {
            queryClient.prefetchQuery({
              queryKey: ['protocols', 'list', { effectiveRole: role }],
              queryFn: () => getAllProtocols(),
              staleTime: 1000 * 60 * 15,
            });
          }
        }).catch(() => {});
        break;
      }

      case 'suppliers':
      case 'procurement': {
        import('@/repositories/supplierRepository').then(({ getAllSuppliers }) => {
          if (getAllSuppliers) {
            queryClient.prefetchQuery({
              queryKey: ['suppliers', 'list'],
              queryFn: () => getAllSuppliers(),
              staleTime: 1000 * 60 * 15,
            });
          }
        }).catch(() => {});
        break;
      }

      case 'finance':
      case 'finance-overview':
      case 'analytics':
      case 'dashboard': {
        fetch('/api/analytics-overview').catch(() => {});
        fetch('/api/kpis').catch(() => {});
        break;
      }

      default:
        break;
    }
  } catch (e) {
    // Non-fatal: speculative prefetch should never throw or break UI
    console.debug('Speculative prefetch skipped for', moduleId, e);
  }
}

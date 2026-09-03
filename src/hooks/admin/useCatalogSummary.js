import { useInfiniteQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

// ── Fetch function (outside component — no stale-closure issues) ──────────────
async function fetchCatalogSummary(options, offset = 0) {
  const params = new URLSearchParams();
  params.set('limit', String(options.limit || 50));
  params.set('offset', String(offset));

  const ser = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val.filter(Boolean).join(',') || null;
    return val !== 'all' ? val : null;
  };

  const pType = ser(options.productType);
  const cat   = ser(options.category);
  const goals = ser(options.goals);
  const fmt   = ser(options.formatId);
  const pres  = ser(options.presentation);
  const sup   = ser(options.supplier);
  const stat  = ser(options.status);
  const tag   = ser(options.tag || options.tags);
  const tagMode = options.tagMode || null;
  const pri   = ser(options.priority);
  const tf    = options.timeframe && options.timeframe !== 'all' ? options.timeframe : null;
  const avail = options.availability || null;

  if (options.q)               params.set('q',              options.q);
  if (pType)                   params.set('productType',    pType);
  if (cat)                     params.set('category',       cat);
  if (goals)                   params.set('goals',          goals);
  if (fmt)                     params.set('formatId',       fmt);
  if (pres)                    params.set('presentation',   pres);
  if (sup)                     params.set('supplier',       sup);
  if (stat)                    params.set('status',         stat);
  if (tag)                     params.set('tag',            tag);
  if (tagMode)                 params.set('tagMode',        tagMode);
  if (pri)                     params.set('priority',       pri);
  if (tf)                      params.set('timeframe',      tf);
  if (avail)                   params.set('availability',   avail);
  if (options.includeInactive) params.set('includeInactive', 'true');

  const res = await fetch(`/api/catalog/summary?${params.toString()}`);

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const err = new Error(errBody.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// ── Stable query key — every param that changes the response must be included ─
function catalogQueryKey(options) {
  const sort = (v) => (Array.isArray(v) ? [...v].sort() : v);
  return [
    'catalog-summary',
    sort(options.productType)  ?? null,
    sort(options.category)     ?? null,
    sort(options.goals)        ?? null,
    sort(options.formatId)     ?? null,
    sort(options.presentation) ?? null,
    sort(options.supplier)     ?? null,
    sort(options.status)       ?? null,
    sort(options.tag || options.tags) ?? null,
    options.tagMode            ?? null,
    options.priority           ?? null,
    options.timeframe          ?? null,
    options.availability       ?? null,
    options.q                  ?? null,
    options.limit              ?? 50,
    options.includeInactive    ?? false,
  ];
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCatalogSummary(options = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    isPlaceholderData
  } = useInfiniteQuery({
    queryKey: catalogQueryKey(options),
    queryFn: ({ pageParam = 0 }) => fetchCatalogSummary(options, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length * (options.limit || 50);
      }
      return undefined;
    },
    // Only use initialData if we actually have items and don't have active filters.
    // Otherwise, active filters would briefly show unfiltered initial products, or an empty initialData would prevent fetching.
    initialData: (
      options.initialData && 
      Array.isArray(options.initialData.items) &&
      options.initialData.items.length > 0 &&
      !options.q && 
      (!options.category || options.category.length === 0) && 
      (!options.goals || options.goals.length === 0) && 
      (!options.formatId || options.formatId.length === 0) && 
      (!options.presentation || options.presentation.length === 0) && 
      (!options.supplier || options.supplier.length === 0) &&
      (!options.productType || options.productType.length === 0) &&
      (!options.status || options.status.length === 0 || (options.status.length === 1 && options.status[0] === 'active'))
    ) ? {
      pages: [options.initialData],
      pageParams: [0]
    } : undefined,

    // 5 min staleTime: data stays fresh — zero re-fetch when switching tabs back and forth.
    staleTime: 5 * 60 * 1000,

    // 30 min in-memory cache: navigating back to previous views is 100% instant (0ms).
    gcTime: 30 * 60 * 1000,

    placeholderData: keepPreviousData,

    // Retry up to 3x on Firebase 503 (connection errors) with backoff
    retry: (failCount, err) => failCount < 3 && err?.status === 503,
    retryDelay: (attempt) => attempt * 2000, // 2s, 4s, 6s
  });

  // Allow mutations (create/edit/delete) to bust the cache and force a refresh.
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['catalog-summary'] });

  // Flatten the pages into a single items array, deduplicating by ID to prevent duplicate React keys
  const rawItems = data?.pages?.flatMap(page => page.items || []) || [];
  const items = (() => {
    const seen = new Set();
    const unique = [];
    for (const item of rawItems) {
      if (item && item.id) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      } else if (item) {
        unique.push(item);
      }
    }
    return unique;
  })();
  // Use KPIs from the first page since they represent global context
  const firstPageKpis = data?.pages?.[0]?.kpis || null;

  return {
    data:               items,
    kpis:               firstPageKpis,
    goalFacets:         firstPageKpis?.goalFacets         || {},
    categoryFacets:     firstPageKpis?.categoryFacets     || {},
    presentationFacets: firstPageKpis?.presentationFacets || {},
    supplierFacets:     firstPageKpis?.supplierFacets     || {},

    // loading=true ONLY on the very first load (no cached data yet) → show skeleton
    loading: isLoading,

    // isFetching=true during any background refetch → show subtle progress indicator
    isFetching,

    // isStale=true while the previous filter data is shown as placeholder
    isStale: isPlaceholderData,

    // Pagination
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,

    error,
    isConnectionError: error?.status === 503,
    refresh,
  };
}

import Activity from "lucide-react/dist/esm/icons/activity";
import Search from "lucide-react/dist/esm/icons/search";
import Star from "lucide-react/dist/esm/icons/star";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";
import FilterX from "lucide-react/dist/esm/icons/filter-x";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';








import { getUserProtocols, updateProtocol } from '../services/protocolStorage';
import { useDebounce } from '../hooks/useDebounce';
import ProtocolItem from '../components/common/ProtocolItem';
import ProtocolSkeleton from '../components/common/ProtocolSkeleton';
import FilterDrawer from '../components/common/FilterDrawer';
import ProtocolErrorBoundary from '../components/common/ProtocolErrorBoundary';
import { ToastContainer } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { deleteProtocol } from '../services/protocolStorage';

/* ─────────────────────────────────────────────
   PHASE 4 — ProtocolHistory
   3.1 · Filter persistence in localStorage
   3.2 · Dynamic Empty State (3 variants)
   3.3 · Error Boundary + robust error handling
         for Firestore/Firebase
   4   · Optimistic UI + Toast Notifications
───────────────────────────────────────────── */

// ── Persistence keys (unique with namespace)
const LS_STATUS_KEY   = 'ph_filter_status';
const LS_FAVORITE_KEY = 'ph_filter_favorite';

// ── Lazy initializers: run only on first render
const initStatus   = () => localStorage.getItem(LS_STATUS_KEY)   ?? 'all';
const initFavorite = () => localStorage.getItem(LS_FAVORITE_KEY) === 'true';

const parseDate = (d) => {
  if (!d) return 0;
  if (typeof d.toDate === 'function') return d.toDate().getTime();
  if (d.seconds) return d.seconds * 1000;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

export default function ProtocolHistory() {
  const navigate = useNavigate();

  // ── State (lazy init from localStorage)
  const [protocols, setProtocols]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);   // PHASE 3.3
  const [retryKey, setRetryKey]             = useState(0);      // PHASE 3.3
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterFavorite, setFilterFavorite] = useState(initFavorite);
  const [statusFilter, setStatusFilter]     = useState(initStatus);
  const [drawerOpen, setDrawerOpen]         = useState(false);

  // ── Toast (PHASE 4)
  const { toasts, toast } = useToast();

  // ── Persist filters in localStorage when they change
  useEffect(() => {
    localStorage.setItem(LS_STATUS_KEY, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem(LS_FAVORITE_KEY, String(filterFavorite));
  }, [filterFavorite]);

  // ── Search input debounce
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ── Initial load — with explicit error handling (PHASE 3.3)
  useEffect(() => {
    let cancelled = false;
    const fetchProtocols = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProtocols();
        if (!cancelled) {
          setProtocols(data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[ProtocolHistory] fetch error:', err);
          setError(err);
          // PHASE 4: inform user via toast as well
          toast.error(
            err?.code === 'unavailable'
              ? 'Network unavailable — check your connection.'
              : 'Could not load protocols. Tap Retry to try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProtocols();
    return () => { cancelled = true; };
  }, [retryKey]); // re-runs when the user clicks "Retry"

  // ── Memoized filtering
  const filteredProtocols = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return protocols.filter((p) => {
      const matchesSearch   = !term || p.primaryCondition?.toLowerCase().includes(term);
      const matchesFavorite = !filterFavorite || p.isFavorite;
      const matchesStatus   = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesFavorite && matchesStatus;
    });
  }, [protocols, debouncedSearch, filterFavorite, statusFilter]);

  // ── Stable handlers
  const handleNavigate = useCallback((id) => {
    // Navigating to the consolidated protocol view
    navigate(`/protocol/${id}`);
  }, [navigate]);

  // PHASE 4: Optimistic favorite toggle — instant UI, Firestore in background
  const handleToggleFavorite = useCallback(async (id, currentFav) => {
    // 1. Optimistic update
    setProtocols((prev) =>
      prev.map((p) => p.id === id ? { ...p, isFavorite: !currentFav } : p)
    );
    // 2. Toast feedback immediately
    toast.success(currentFav ? 'Removed from favorites' : 'Added to favorites ⭐');

    // 3. Persist to Firebase
    try {
      const success = await updateProtocol(id, { isFavorite: !currentFav });
      if (!success) throw new Error('updateProtocol returned false');
    } catch {
      // 4. Rollback on failure
      setProtocols((prev) =>
        prev.map((p) => p.id === id ? { ...p, isFavorite: currentFav } : p)
      );
      toast.error('Could not update favorite — change reversed.');
    }
  }, [toast]);

  // PHASE 4: Optimistic delete — instant UI removal, Firestore in background
  const handleDelete = useCallback(async (id) => {
    // 1. Snapshot for rollback
    const snapshot = protocols.find((p) => p.id === id);

    // 2. Optimistic remove
    setProtocols((prev) => prev.filter((p) => p.id !== id));
    toast.info('Protocol deleted');

    // 3. Persist to Firebase
    try {
      await deleteProtocol(id);
    } catch {
      // 4. Rollback — re-insert at original position
      if (snapshot) {
        setProtocols((prev) => {
          // Insert back maintaining order by createdAt
          const next = [...prev, snapshot].sort((a, b) => {
            const timeA = parseDate(a.createdAt || a.created_at);
            const timeB = parseDate(b.createdAt || b.created_at);
            return timeB - timeA;
          });
          return next;
        });
      }
      toast.error('Could not delete protocol — it has been restored.');
    }
  }, [protocols, toast]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterFavorite(false);
    setStatusFilter('all');
  }, []);

  // ── Retry handler for ErrorBoundary (PHASE 3.3)
  const handleRetry = useCallback(() => {
    setError(null);
    setRetryKey((k) => k + 1);
  }, []);

  // ── UI derivatives
  const hasActiveFilters      = filterFavorite || statusFilter !== 'all' || searchTerm.trim() !== '';
  const activeFilterCount     = [filterFavorite, statusFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="ph-root template-root">
      <ProtocolErrorBoundary onRetry={handleRetry}>
      <div className="ph-inner">

        {/* ── Header ── */}
        <header className="ph-header">
          <div>
            <button
              className="ph-back-btn"
              onClick={() => navigate('/')}
              aria-label="Back to Knowledge Hub"
            >
              <ArrowLeft size={16} /> Back to Hub
            </button>
            <h1 className="ph-title">Protocol Archives</h1>
          </div>
          <div className="ph-header__icon" aria-hidden="true">
            <Activity size={28} />
          </div>
        </header>

        {/* ── Filter bar (desktop) ── */}
        {/* Desktop: search + select + favorites inline */}
        {/* Mobile: search + "Filters" button that opens Bottom Sheet Drawer */}
        <div className="ph-filters" role="search" aria-label="Filter protocols">

          {/* Search — visible en todos los breakpoints */}
          <div className="ph-filters__search">
            <Search size={16} className="ph-filters__search-icon" aria-hidden="true" />
            <input
              type="search"
              className="ph-filters__input"
              placeholder="Search by condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search protocols by condition"
            />
          </div>

          {/* ── DESKTOP: inline controls ── */}
          <div className="ph-filters__desktop-controls">
            <select
              className="ph-filters__select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pass">Validated</option>
              <option value="warning">With Warning</option>
              <option value="blocked">Rejected</option>
              <option value="generated">Generated</option>
            </select>

            <button
              className={`ph-filters__fav-btn${filterFavorite ? ' is-active' : ''}`}
              onClick={() => setFilterFavorite((v) => !v)}
              aria-pressed={filterFavorite}
              aria-label="Show favorites only"
            >
              <Star size={16} fill={filterFavorite ? 'currentColor' : 'transparent'} />
              Favorites
            </button>

            {hasActiveFilters && (
              <button
                className="ph-filters__clear-btn"
                onClick={clearFilters}
                aria-label="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>

          {/* ── MOBILE: "Filters" button that opens Bottom Sheet ── */}
          <button
            className={`ph-filters__drawer-btn${activeFilterCount > 0 ? ' has-badge' : ''}`}
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            data-count={activeFilterCount > 0 ? activeFilterCount : undefined}
          >
            <SlidersHorizontal size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ph-filters__drawer-btn-badge" aria-hidden="true">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── PHASE 2: FilterDrawer (Mobile Bottom Sheet) ── */}
        <FilterDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          filterFavorite={filterFavorite}
          onFavoriteToggle={() => setFilterFavorite((v) => !v)}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* ── Content ── */}
        {loading && <ProtocolSkeleton count={5} />}

        {/* Fetch error (async — non-render phase): shown inline */}
        {!loading && error && (
          <div className="ph-fetch-error" role="alert">
            <AlertCircle size={32} className="ph-fetch-error__icon" aria-hidden="true" />
            <div>
              <p className="ph-fetch-error__title">Failed to load protocols</p>
              <p className="ph-fetch-error__desc">
                {error?.code === 'unavailable'
                  ? 'Network unavailable. Check your connection.'
                  : 'Could not reach the database. Please try again.'}
              </p>
            </div>
            <button
              className="btn btn-primary ph-fetch-error__retry"
              onClick={handleRetry}
            >
              <span aria-hidden="true">↺</span> Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredProtocols.length === 0 && (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            searchOnly={debouncedSearch.trim() !== '' && !filterFavorite && statusFilter === 'all'}
            onClear={clearFilters}
            onBuild={() => navigate('/')}
          />
        )}

        {!loading && !error && filteredProtocols.length > 0 && (
          <div className="ph-list" role="list" aria-label="Protocol list">
            {filteredProtocols.map((p) => (
              <ProtocolItem
                key={p.id}
                protocol={p}
                onNavigate={handleNavigate}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── PHASE 4: Toast Notifications (fixed overlay) */}
      <ToastContainer toasts={toasts} onDismiss={toast.dismiss} />

      </ProtocolErrorBoundary>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PHASE 3.2 — EmptyState
   Internal component: three contextual variants
   1. searchOnly → search without results
   2. hasActiveFilters → active drawer filters
   3. actual empty → no saved protocols
───────────────────────────────────────────── */
function EmptyState({ hasActiveFilters, searchOnly, onClear, onBuild }) {
  const config = searchOnly
    ? {
        icon: <Search size={36} aria-hidden="true" />,
        variant: 'ph-empty--search',
        title: 'No results found',
        desc: 'Try a different search term or clear the search to see all protocols.',
        cta: { label: 'Clear search', action: onClear },
      }
    : hasActiveFilters
    ? {
        icon: <FilterX size={36} aria-hidden="true" />,
        variant: 'ph-empty--filtered',
        title: 'No protocols match',
        desc: 'Your active filters are hiding all results. Adjust or clear them to continue.',
        cta: { label: 'Clear all filters', action: onClear },
      }
    : {
        icon: <BookOpen size={36} aria-hidden="true" />,
        variant: 'ph-empty--blank',
        title: 'No protocols yet',
        desc: "You haven't saved any protocols. Build your first one to see it here.",
        cta: { label: 'Build New Protocol', action: onBuild },
      };

  return (
    <div className={`ph-empty ${config.variant}`} role="status" aria-live="polite">
      <div className="ph-empty__icon-wrap" aria-hidden="true">
        {config.icon}
      </div>
      <h3 className="ph-empty__title">{config.title}</h3>
      <p className="ph-empty__desc">{config.desc}</p>
      <button
        className="btn btn-primary ph-empty__action"
        onClick={config.cta.action}
      >
        {config.cta.label}
      </button>
    </div>
  );
}
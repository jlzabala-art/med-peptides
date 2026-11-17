'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRecentPrescriptions, RECENT_KEY, sanitizeRecentCode, RX_SYNC_CHANNEL } from '../utils/labelHelpers';

export function useLabelsWorklist() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [worklistTab, setWorklistTab] = useState('unprinted'); // 'unprinted' | 'pending_approval' | 'printed' | 'reprint' | 'all'

  const [labelsKpis, setLabelsKpis] = useState({
    totalPrescriptions: 339,
    totalPrintedA4Count: 0,
    totalPrintedLabelsCount: 0,
    uploadedThisWeek: 0
  });
  const [printCountsMap, setPrintCountsMap] = useState({});
  const [printDetailsMap, setPrintDetailsMap] = useState({});
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refreshWorklist = useCallback(() => {
    setRefreshNonce((n) => n + 1);
  }, []);

  const updateWorklistItem = useCallback((code, patch = {}) => {
    if (!code) return;
    const cleanTarget = sanitizeRecentCode(code).toUpperCase();
    setSearchResults((prev) =>
      prev.map((item) => {
        const itemClean = sanitizeRecentCode(item.code || item.id).toUpperCase();
        if (itemClean === cleanTarget || String(item.code || '').toUpperCase() === String(code).toUpperCase()) {
          const nextCount = patch.partsCount != null
            ? patch.partsCount
            : (Array.isArray(patch.labels) ? patch.labels.length : item.partsCount);
          return {
            ...item,
            ...patch,
            partsCount: nextCount,
            pharmacyLabels: patch.labels || patch.pharmacyLabels || item.pharmacyLabels,
            parts: patch.parts || item.parts,
            removedParts: patch.removedParts || item.removedParts,
          };
        }
        return item;
      })
    );
  }, []);

  const updateWorklistItemStatus = useCallback((code, nextStatus, nextAxes = {}) => {
    if (!code) return;
    const cleanTarget = sanitizeRecentCode(code).toUpperCase();
    setSearchResults((prev) =>
      prev.map((item) => {
        const itemClean = sanitizeRecentCode(item.code || item.id).toUpperCase();
        if (itemClean === cleanTarget || String(item.code || '').toUpperCase() === String(code).toUpperCase()) {
          const finalStatus = nextStatus || item.status;
          return {
            ...item,
            status: finalStatus,
            state: finalStatus,
            approvalStatus: finalStatus,
            isSigned: finalStatus === 'approved' ? true : item.isSigned,
            clinicalStatus: nextAxes.clinicalStatus || (finalStatus === 'approved' ? 'approved' : item.clinicalStatus),
            paymentStatus: nextAxes.paymentStatus || item.paymentStatus,
            productionStatus: nextAxes.productionStatus || item.productionStatus,
            labelStatus: nextAxes.labelStatus || item.labelStatus,
            logisticsStatus: nextAxes.logisticsStatus || item.logisticsStatus,
          };
        }
        return item;
      })
    );
  }, []);

  useEffect(() => {
    setRecentPrescriptions(getRecentPrescriptions());
  }, []);

  // Load KPIs and per-prescription print counters + audit details
  useEffect(() => {
    let isMounted = true;
    const fetchKpis = () => {
      fetch('/api/labels/kpis')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.success) {
            setLabelsKpis(data.kpis || data);
            if (data.printCountsByCode) setPrintCountsMap(data.printCountsByCode);
            if (data.printDetailsByCode) setPrintDetailsMap(data.printDetailsByCode);
          }
        })
        .catch((err) => console.warn('Could not load labels KPIs:', err));
    };

    fetchKpis();

    const handleLabelPrinted = (e) => {
      const code = e.detail?.code;
      const count = e.detail?.count;
      const updatedMap = e.detail?.printCountsByCode;
      const updatedDetails = e.detail?.printDetailsByCode;
      setPrintCountsMap((prev) => {
        const next = { ...prev };
        if (updatedMap) Object.assign(next, updatedMap);
        if (code) {
          const upper = String(code).toUpperCase();
          next[upper] = count || (next[upper] || 0) + 1;
        }
        return next;
      });
      if (updatedDetails) {
        setPrintDetailsMap((prev) => ({ ...prev, ...updatedDetails }));
      }
      setLabelsKpis((prev) => ({
        ...prev,
        totalPrintedA4Count: (prev.totalPrintedA4Count || 0) + 1
      }));
    };

    const handlePartsUpdated = (e) => {
      const detail = e.detail;
      if (!detail?.code) return;
      updateWorklistItem(detail.code, detail);
    };

    const handleStatusUpdated = (e) => {
      const detail = e.detail;
      if (!detail?.code) return;
      updateWorklistItemStatus(detail.code, detail.status || detail.newStatus, detail.axes || detail);
    };

    let broadcastChannel;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel(RX_SYNC_CHANNEL);
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'PARTS_UPDATED' && event.data?.detail?.code) {
            updateWorklistItem(event.data.detail.code, event.data.detail);
          } else if (event.data?.type === 'STATUS_UPDATED' && event.data?.detail?.code) {
            updateWorklistItemStatus(
              event.data.detail.code,
              event.data.detail.status || event.data.detail.newStatus,
              event.data.detail.axes || event.data.detail
            );
          }
        };
      }
    } catch {
      // non-fatal
    }

    let lastFocusRefresh = 0;
    const handleWindowFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchKpis();
        const now = Date.now();
        if (now - lastFocusRefresh > 4000) {
          lastFocusRefresh = now;
          refreshWorklist();
        }
      }
    };

    window.addEventListener('rx:label-printed', handleLabelPrinted);
    window.addEventListener('rx:parts-updated', handlePartsUpdated);
    window.addEventListener('rx:status-updated', handleStatusUpdated);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleWindowFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('rx:label-printed', handleLabelPrinted);
      window.removeEventListener('rx:parts-updated', handlePartsUpdated);
      window.removeEventListener('rx:status-updated', handleStatusUpdated);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleWindowFocus);
      try {
        broadcastChannel?.close();
      } catch {
        // non-fatal
      }
    };
  }, [updateWorklistItem, updateWorklistItemStatus, refreshWorklist]);

  // Debounced search (and initial worklist fetch when query is empty)
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/labels/search?q=${encodeURIComponent(searchQuery.trim())}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('Search error:', e);
        }
      } finally {
        setIsSearching(false);
      }
    }, searchQuery.trim() ? 220 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, refreshNonce]);

  const handleClearRecent = useCallback((e) => {
    e?.stopPropagation?.();
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch { /* ignore */ }
    setRecentPrescriptions([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchOpen,
    setSearchOpen,
    highlightedIndex,
    setHighlightedIndex,
    recentPrescriptions,
    setRecentPrescriptions,
    worklistTab,
    setWorklistTab,
    labelsKpis,
    setLabelsKpis,
    printCountsMap,
    setPrintCountsMap,
    printDetailsMap,
    setPrintDetailsMap,
    handleClearRecent,
    refreshWorklist,
    updateWorklistItem,
    updateWorklistItemStatus
  };
}

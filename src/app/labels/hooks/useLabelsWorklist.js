'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRecentPrescriptions, RECENT_KEY } from '../utils/labelHelpers';

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

    const handleWindowFocus = () => {
      if (document.visibilityState === 'visible') fetchKpis();
    };

    window.addEventListener('rx:label-printed', handleLabelPrinted);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleWindowFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('rx:label-printed', handleLabelPrinted);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleWindowFocus);
    };
  }, []);

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
  }, [searchQuery]);

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
    handleClearRecent
  };
}

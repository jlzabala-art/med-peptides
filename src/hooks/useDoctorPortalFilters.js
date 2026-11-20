"use client";

import { useState, useEffect, useRef } from 'react';
import { safeReplaceState } from '@/hooks/useSafeUrlState';

/**
 * useDoctorPortalFilters
 *
 * Encapsulates search, filter, tab navigation, and bidirectional URL searchParam
 * synchronization (Golden Rule #24) for the Doctor Public Portal.
 */
export function useDoctorPortalFilters({ initialTab = 'overview', initialSearchParams = {} } = {}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchParams?.q || '');
  const [statusFilter, setStatusFilter] = useState(initialSearchParams?.status || 'all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState(initialSearchParams?.task || 'all');
  const [temporalFilter, setTemporalFilter] = useState(initialSearchParams?.time || 'all');
  const [scopeMode, setScopeMode] = useState('global');
  const [quickRxFilter, setQuickRxFilter] = useState(initialSearchParams?.filter || 'all');
  const [patientFilterMode, setPatientFilterMode] = useState(initialSearchParams?.pmode || 'all');
  const [activeAnchor, setActiveAnchorState] = useState(
    initialTab || (initialSearchParams?.task ? 'tasks' : initialSearchParams?.tab) || 'overview'
  );
  const [previousAnchor, setPreviousAnchor] = useState(null);

  const setActiveAnchor = (nextTab) => {
    setActiveAnchorState((prev) => {
      if (nextTab && prev && nextTab !== prev) {
        setPreviousAnchor(prev);
      }
      return nextTab;
    });
  };

  const isFirstSyncRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const s = params.get('status');
      const f = params.get('filter');
      const pmode = params.get('pmode');
      const t = params.get('task');
      const tab = params.get('tab');
      const time = params.get('time');
      if (q !== null) setSearchQuery(q);
      if (s !== null) setStatusFilter(s);
      if (f !== null) setQuickRxFilter(f);
      if (pmode !== null) setPatientFilterMode(pmode);
      if (t) {
        setTaskFilter(t);
        setActiveAnchor('tasks');
      } else if (tab) {
        setActiveAnchor(tab);
      } else {
        setActiveAnchor('overview');
      }
      if (time !== null) setTemporalFilter(time);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (quickRxFilter !== 'all') params.set('filter', quickRxFilter);
    if (patientFilterMode !== 'all') params.set('pmode', patientFilterMode);
    if (taskFilter !== 'all') params.set('task', taskFilter);
    if (temporalFilter !== 'all') params.set('time', temporalFilter);
    if (activeAnchor !== 'overview') params.set('tab', activeAnchor);
    const newSearch = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== newSearch) {
      safeReplaceState(`${window.location.pathname}${newSearch}`);
    }
  }, [searchQuery, statusFilter, quickRxFilter, patientFilterMode, taskFilter, temporalFilter, activeAnchor]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    patientFilter,
    setPatientFilter,
    taskFilter,
    setTaskFilter,
    temporalFilter,
    setTemporalFilter,
    scopeMode,
    setScopeMode,
    quickRxFilter,
    setQuickRxFilter,
    patientFilterMode,
    setPatientFilterMode,
    activeAnchor,
    setActiveAnchor,
    previousAnchor,
    clearPreviousAnchor: () => setPreviousAnchor(null)
  };
}

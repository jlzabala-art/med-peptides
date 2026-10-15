"use client";

import { useSyncExternalStore } from 'react';
import {
  getActiveContext,
  setActiveDoctor,
  setActivePatient,
  setActiveSupplier,
  clearActiveDoctor,
  clearActivePatient,
  clearActiveSupplier,
  clearAllActiveContext,
  setDockMinimized,
  setDockClosed,
  reopenDock,
  subscribeToActiveContext
} from '../services/activeContextService';

const SERVER_SNAPSHOT = {
  doctor: null,
  patient: null,
  supplier: null,
  isDockClosed: false,
  isDockMinimized: false
};

/**
 * Idiomatic React 18/19 Hook for Active Operations Context (Atlas Hub)
 * Uses useSyncExternalStore for zero hydration mismatch, zero tearing, and instant reactive updates.
 *
 * @example
 * const { doctor, patient, supplier, setActiveDoctor, clearActiveDoctor } = useActiveOperationsContext();
 */
export function useActiveOperationsContext() {
  const context = useSyncExternalStore(
    subscribeToActiveContext,
    getActiveContext,
    () => SERVER_SNAPSHOT
  );

  return {
    ...context,
    setActiveDoctor,
    setActivePatient,
    setActiveSupplier,
    clearActiveDoctor,
    clearActivePatient,
    clearActiveSupplier,
    clearAllActiveContext,
    setDockMinimized,
    setDockClosed,
    reopenDock
  };
}

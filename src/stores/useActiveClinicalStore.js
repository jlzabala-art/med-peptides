'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useActiveClinicalStore
 * ─────────────────────────────────────────────────────────────────────────────
 * Global cross-module clinical context (Rx, Patient, Doctor, Formula) persisted
 * in localStorage so navigating between Labels Studio, Rx Intake, Compounding Lab,
 * Reconstitution Calculator, and Catalog feels like a single continuous app.
 */
export const useActiveClinicalStore = create(
  persist(
    (set) => ({
      activeRxCode: '',
      patientName: '',
      doctorName: '',
      formulaTitle: '',
      updatedAt: null,

      setActiveClinicalResource: (payload = {}) =>
        set((state) => ({
          activeRxCode: payload.activeRxCode ?? state.activeRxCode,
          patientName: payload.patientName ?? state.patientName,
          doctorName: payload.doctorName ?? state.doctorName,
          formulaTitle: payload.formulaTitle ?? state.formulaTitle,
          updatedAt: Date.now()
        })),

      clearActiveClinicalResource: () =>
        set({
          activeRxCode: '',
          patientName: '',
          doctorName: '',
          formulaTitle: '',
          updatedAt: null
        })
    }),
    {
      name: 'atlas_active_clinical_context'
    }
  )
);

/**
 * clinicalContextStore.js
 * 
 * Zustand store for the "Active Clinical Context" — the currently pinned
 * Patient, Doctor, and Account Manager that apply to new prescriptions
 * and clinical workflows across the admin panel.
 *
 * Persisted to localStorage with an 8-hour TTL.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function isExpired(timestamp) {
  if (!timestamp) return true;
  return Date.now() - timestamp > TTL_MS;
}

export const useClinicalContextStore = create(
  persist(
    (set, get) => ({
      // Active entities
      activePatient: null,   // { id, name, email, age, gender, clinic, status }
      activeDoctor: null,    // { id, name, email, specialty }
      activeManager: null,   // { id, name, email }
      // Timestamps for TTL
      _patientSetAt: null,
      _doctorSetAt: null,
      _managerSetAt: null,

      // ─── Setters ────────────────────────────────────────────────────────
      setActivePatient: (patient) => set({
        activePatient: patient ? { id: patient.id || patient.objectID, name: patient.name || patient.displayName, email: patient.email, age: patient.age, gender: patient.gender, clinic: patient.clinic, status: patient.status } : null,
        _patientSetAt: patient ? Date.now() : null,
      }),

      setActiveDoctor: (doctor) => set({
        activeDoctor: doctor ? { id: doctor.id || doctor.objectID, name: doctor.name || doctor.displayName, email: doctor.email, specialty: doctor.specialty } : null,
        _doctorSetAt: doctor ? Date.now() : null,
      }),

      setActiveManager: (manager) => set({
        activeManager: manager ? { id: manager.id || manager.objectID, name: manager.name || manager.displayName, email: manager.email } : null,
        _managerSetAt: manager ? Date.now() : null,
      }),

      // ─── Clear ──────────────────────────────────────────────────────────
      clearActivePatient: () => set({ activePatient: null, _patientSetAt: null }),
      clearActiveDoctor: () => set({ activeDoctor: null, _doctorSetAt: null }),
      clearActiveManager: () => set({ activeManager: null, _managerSetAt: null }),
      clearAll: () => set({
        activePatient: null, activeDoctor: null, activeManager: null,
        _patientSetAt: null, _doctorSetAt: null, _managerSetAt: null,
      }),

      // ─── TTL validation (called on mount) ───────────────────────────────
      validateTTL: () => {
        const state = get();
        const updates = {};
        if (isExpired(state._patientSetAt)) {
          updates.activePatient = null;
          updates._patientSetAt = null;
        }
        if (isExpired(state._doctorSetAt)) {
          updates.activeDoctor = null;
          updates._doctorSetAt = null;
        }
        if (isExpired(state._managerSetAt)) {
          updates.activeManager = null;
          updates._managerSetAt = null;
        }
        if (Object.keys(updates).length > 0) set(updates);
      },

      // ─── Computed helpers ────────────────────────────────────────────────
      hasActiveContext: () => {
        const { activePatient, activeDoctor, activeManager } = get();
        return !!(activePatient || activeDoctor || activeManager);
      },
    }),
    {
      name: 'clinical-context-v1',
      // Only persist the entity objects and timestamps
      partialize: (state) => ({
        activePatient: state.activePatient,
        activeDoctor: state.activeDoctor,
        activeManager: state.activeManager,
        _patientSetAt: state._patientSetAt,
        _doctorSetAt: state._doctorSetAt,
        _managerSetAt: state._managerSetAt,
      }),
    }
  )
);

// Convenience selector hooks
export const useActivePatient = () => useClinicalContextStore(s => s.activePatient);
export const useActiveDoctor = () => useClinicalContextStore(s => s.activeDoctor);
export const useActiveManager = () => useClinicalContextStore(s => s.activeManager);

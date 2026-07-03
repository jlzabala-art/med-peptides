import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ALL_ROLES — The 11 roles supported by Atlas Health.
 * Each role maps to a specific view of the sidebar and Quick Create actions.
 */
export const ALL_ROLES = [
  { id: 'admin',            label: 'Admin',             emoji: '🛡️',  color: '#6366f1' },
  { id: 'ceo',              label: 'CEO',               emoji: '👔',  color: '#0ea5e9' },
  { id: 'medical_director', label: 'Medical Director',  emoji: '🩺',  color: '#10b981' },
  { id: 'doctor',           label: 'Doctor',            emoji: '👨‍⚕️', color: '#14b8a6' },
  { id: 'clinic_manager',   label: 'Clinic Manager',    emoji: '🏥',  color: '#8b5cf6' },
  { id: 'pharmacist',       label: 'Pharmacist',        emoji: '💊',  color: '#f59e0b' },
  { id: 'sales',            label: 'Sales',             emoji: '📈',  color: '#ef4444' },
  { id: 'operations',       label: 'Operations',        emoji: '⚙️',  color: '#64748b' },
  { id: 'finance',          label: 'Finance',           emoji: '💰',  color: '#22c55e' },
  { id: 'supplier',         label: 'Supplier',          emoji: '🏭',  color: '#f97316' },
  { id: 'patient',          label: 'Patient',           emoji: '🧬',  color: '#ec4899' },
];

/**
 * useSimulationStore
 * Zustand store persisted in localStorage.
 * Allows an Admin to simulate any role without logging out.
 * `simulatedRole === null` means "use your real role" (Admin view).
 */
export const useSimulationStore = create(
  persist(
    (set) => ({
      simulatedRole: null, // string id like 'doctor' | null

      setSimulatedRole: (roleId) => set({ simulatedRole: roleId }),

      exitSimulation: () => set({ simulatedRole: null }),
    }),
    {
      name: 'atlas-role-simulation', // localStorage key
    }
  )
);

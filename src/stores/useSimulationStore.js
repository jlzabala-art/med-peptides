import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ALL_ROLES — The 11 roles supported by Atlas Health.
 * Each role maps to a specific view of the sidebar and Quick Create actions.
 */
export const ALL_ROLES = [
  { id: 'admin',            label: 'Admin',             emoji: '🛡️',  color: '#003666', bg: '#e0f2fe' },
  { id: 'ceo',              label: 'CEO',               emoji: '👔',  color: '#0ea5e9', bg: '#e0f2fe' },
  { id: 'medical_director', label: 'Medical Director',  emoji: '🩺',  color: '#10b981', bg: '#ccfbf1' },
  { id: 'doctor',           label: 'Doctor',            emoji: '👨‍⚕️', color: '#0d9488', bg: '#ccfbf1' },
  { id: 'clinic_manager',   label: 'Clinic Manager',    emoji: '🏥',  color: '#8b5cf6', bg: '#ede9fe' },
  { id: 'pharmacist',       label: 'Pharmacist',        emoji: '💊',  color: '#f59e0b', bg: '#ffedd5' },
  { id: 'sales',            label: 'Sales',             emoji: '📈',  color: '#ef4444', bg: '#fee2e2' },
  { id: 'operations',       label: 'Operations',        emoji: '⚙️',  color: '#64748b', bg: '#f1f5f9' },
  { id: 'finance',          label: 'Finance',           emoji: '💰',  color: '#22c55e', bg: '#dcfce7' },
  { id: 'wholesaler',       label: 'Wholesaler',        emoji: '🏭',  color: '#c2410c', bg: '#ffedd5' },
  { id: 'supplier',         label: 'Supplier',          emoji: '🏭',  color: '#c2410c', bg: '#ffedd5' },
  { id: 'patient',          label: 'Patient',           emoji: '🧬',  color: '#7c3aed', bg: '#ede9fe' },
  { id: 'guest',            label: 'Guest',             emoji: '👤',  color: '#475569', bg: '#f1f5f9' },
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

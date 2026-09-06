/**
 * createOrderClinicalSlice.js
 * 
 * Atomic slice for Clinical Rules Engine integration and patient clinical context.
 */
import { runClinicalRules } from '../../engine/clinicalRulesEngine';

export const createOrderClinicalSlice = (set, get) => ({
  clinicalAlerts: { errors: [], warnings: [], info: [], all: [] },
  patientContext: {},

  setPatientContext: (ctx) => {
    set({ patientContext: ctx });
    // Re-run rules against current active cart items if present
    const { activeTargetId, carts } = get();
    if (activeTargetId && carts[activeTargetId]) {
      const items = carts[activeTargetId].draftItems || [];
      const clinicalAlerts = runClinicalRules(items, ctx);
      set({ clinicalAlerts });
    }
  },

  runRulesEngine: (items, context) => {
    return runClinicalRules(items, context);
  },
});

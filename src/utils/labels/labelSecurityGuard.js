/**
 * labelSecurityGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central security & capability guard for compounding pharmacy label operations.
 *
 * Guarantees that:
 * 1. Buttons that cannot perform an action (due to permissions, missing identifiers,
 *    read-only status, locked documents, or offline status) are STRICTLY DISABLED.
 * 2. No false success messages ("Saved ✓") are ever displayed when an action
 *    cannot be performed or persistence is unconfirmed.
 * 3. Clear, non-confusing reasons are presented to the operator via tooltips and badges.
 *
 * Golden Rules Compliance:
 * - AGENTS.md Rule #14: useRoleAccess hook integration
 * - AGENTS.md Rule #25: Idempotent & non-blocking UI states
 * - Anti-ambiguity: Buttons must be disabled upfront when action is not executable
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const REASON_CODES = Object.freeze({
  OK: 'OK',
  READ_ONLY: 'READ_ONLY',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  MISSING_ID: 'MISSING_ID',
  ARCHIVED: 'ARCHIVED',
  OFFLINE: 'OFFLINE',
  SAVING: 'SAVING',
  NO_DATA: 'NO_DATA',
  OVERRIDE_DISABLED: 'OVERRIDE_DISABLED'
});

/**
 * Validates whether label modifications can be saved to Firestore and master prescription.
 *
 * @param {Object} params
 * @param {string|null} params.rawId - Resolved document ID or code
 * @param {Object|null} params.currentItem - Active label item
 * @param {Object|null} params.sourceRx - Clinical prescription object
 * @param {boolean} params.readOnly - Explicit read-only mode flag
 * @param {boolean|null} params.canSaveOverride - Optional explicit override
 * @param {string} params.role - User canonical role from useRoleAccess
 * @param {Function} params.can - Action-based permission check from useRoleAccess
 * @param {boolean} params.isSaving - In-flight save status
 * @param {boolean} params.isOnline - Network connectivity status
 * @param {boolean} params.isEs - Active language
 * @returns {{
 *   canSave: boolean,
 *   canApprove: boolean,
 *   canEdit: boolean,
 *   reason: string,
 *   approveReason: string,
 *   editReason: string,
 *   reasonCode: string
 * }}
 */
export function verifyLabelSaveSecurity({
  rawId = null,
  currentItem = null,
  sourceRx = null,
  readOnly = false,
  canSaveOverride = null,
  role = 'guest',
  can = null,
  isSaving = false,
  isOnline = true,
  isEs = false
} = {}) {
  // 1. Explicit caller override
  if (canSaveOverride !== null && canSaveOverride !== undefined) {
    const allowed = Boolean(canSaveOverride);
    return {
      canSave: allowed,
      canApprove: allowed,
      canEdit: allowed,
      reason: allowed
        ? (isEs ? 'Guardar y actualizar prescripción maestra' : 'Save and synchronize edits with master prescription record')
        : (isEs ? 'Guardado desactivado por configuración' : 'Saving disabled by configuration'),
      approveReason: allowed
        ? (isEs ? 'Cambiar estado de aprobación clínica' : 'Change clinical approval status')
        : (isEs ? 'Aprobación desactivada por configuración' : 'Approval disabled by configuration'),
      editReason: allowed
        ? (isEs ? 'Editar campos de la etiqueta' : 'Edit label fields')
        : (isEs ? 'Edición desactivada por configuración' : 'Editing disabled by configuration'),
      reasonCode: allowed ? REASON_CODES.OK : REASON_CODES.OVERRIDE_DISABLED
    };
  }

  // 2. Explicit Read-Only Mode
  if (readOnly) {
    return {
      canSave: false,
      canApprove: false,
      canEdit: false,
      reason: isEs
        ? 'Guardado desactivado: La vista se encuentra en modo de solo lectura.'
        : 'Save disabled: View is in read-only mode.',
      approveReason: isEs
        ? 'Aprobación desactivada: Modo de solo lectura.'
        : 'Approval disabled: Read-only mode.',
      editReason: isEs
        ? 'Edición desactivada: Modo de solo lectura.'
        : 'Editing disabled: Read-only mode.',
      reasonCode: REASON_CODES.READ_ONLY
    };
  }

  // 3. User Role & Permissions (AGENTS.md Rule #14)
  // If user is authenticated with a non-guest role, enforce that their role has 'edit:prescriptions' permission.
  // Restricted roles like 'patient', 'wholesaler', 'supplier' cannot edit prescriptions.
  if (role && role !== 'guest' && typeof can === 'function' && !can('edit:prescriptions')) {
    return {
      canSave: false,
      canApprove: false,
      canEdit: false,
      reason: isEs
        ? 'Guardado desactivado: Tu cuenta no tiene permisos para modificar prescripciones.'
        : 'Save disabled: Your user account lacks permission to modify prescriptions.',
      approveReason: isEs
        ? 'Aprobación desactivada: Permisos insuficientes.'
        : 'Approval disabled: Insufficient permissions.',
      editReason: isEs
        ? 'Edición desactivada: Permisos insuficientes.'
        : 'Editing disabled: Insufficient permissions.',
      reasonCode: REASON_CODES.PERMISSION_DENIED
    };
  }

  // 4. Prescription Status / Locked
  const rxStatus = String(sourceRx?.status || currentItem?.status || '').toLowerCase().trim();
  const isLocked = ['archived', 'cancelled', 'anulada', 'archivada', 'purgada'].includes(rxStatus);
  if (isLocked) {
    return {
      canSave: false,
      canApprove: false,
      canEdit: false,
      reason: isEs
        ? `Guardado desactivado: La prescripción está bloqueada (${rxStatus}).`
        : `Save disabled: Prescription record is locked (${rxStatus}).`,
      approveReason: isEs
        ? 'Aprobación desactivada: La prescripción está archivada o cancelada.'
        : 'Approval disabled: Prescription is archived or cancelled.',
      editReason: isEs
        ? 'Edición desactivada: Prescripción archivada.'
        : 'Editing disabled: Archived prescription.',
      reasonCode: REASON_CODES.ARCHIVED
    };
  }

  // 5. Missing Prescription Document Identifier
  const cleanId = String(rawId || '').trim();
  if (!cleanId || cleanId === 'undefined' || cleanId === 'null') {
    return {
      canSave: false,
      canApprove: false,
      canEdit: true, // Local preview editing still allowed in studio, but saving to DB is blocked
      reason: isEs
        ? 'Guardado desactivado: No se ha detectado el identificador de la prescripción en la base de datos.'
        : 'Save disabled: Missing prescription document identifier in database.',
      approveReason: isEs
        ? 'Aprobación desactivada: Falta el identificador de la prescripción.'
        : 'Approval disabled: Missing prescription identifier.',
      editReason: isEs ? 'Editar campos de la etiqueta' : 'Edit label fields',
      reasonCode: REASON_CODES.MISSING_ID
    };
  }

  // 6. Network Connectivity
  if (isOnline === false) {
    return {
      canSave: false,
      canApprove: false,
      canEdit: true,
      reason: isEs
        ? 'Guardado desactivado: Sin conexión a internet. Revisa tu red para guardar.'
        : 'Save disabled: No internet connection. Check your network to save.',
      approveReason: isEs
        ? 'Aprobación desactivada: Sin conexión a internet.'
        : 'Approval disabled: Offline mode.',
      editReason: isEs ? 'Editar campos de la etiqueta' : 'Edit label fields',
      reasonCode: REASON_CODES.OFFLINE
    };
  }

  // 7. In-Flight Operation (Anti-duplicate click guard)
  if (isSaving) {
    return {
      canSave: false,
      canApprove: false,
      canEdit: true,
      reason: isEs ? 'Guardando cambios en la prescripción...' : 'Saving changes in progress...',
      approveReason: isEs ? 'Guardando...' : 'Saving in progress...',
      editReason: isEs ? 'Guardando...' : 'Saving in progress...',
      reasonCode: REASON_CODES.SAVING
    };
  }

  // 8. Normal Active State: All checks passed
  const canApproveRole = ['admin', 'doctor', 'medical_director', 'clinic', 'account_manager', 'guest'].includes(role);
  return {
    canSave: true,
    canApprove: canApproveRole,
    canEdit: true,
    reason: isEs
      ? 'Guardar y actualizar prescripción maestra'
      : 'Save and synchronize edits with master prescription record',
    approveReason: canApproveRole
      ? (isEs ? 'Cambiar estado de aprobación clínica' : 'Change clinical approval status')
      : (isEs ? 'Aprobación restringida a personal médico o farmacia' : 'Approval restricted to medical or pharmacy staff'),
    editReason: isEs ? 'Editar campos de la etiqueta' : 'Edit label fields',
    reasonCode: REASON_CODES.OK
  };
}

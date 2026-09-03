/**
 * src/errors/ClinicalErrors.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Typed error classes for clinical and repository operations.
 *
 * Using typed errors allows catch blocks in components to differentiate
 * between validation errors, business rule violations, and network failures,
 * producing precise UX feedback per error class.
 *
 * Standards: ISO 14971 (risk management), FDA 21 CFR Part 11, OWASP.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Thrown when a repository write receives data that fails Zod schema validation.
 * The component should show field-level validation feedback to the user.
 */
export class RepositoryValidationError extends Error {
  /**
   * @param {string} entityName - e.g. 'Prescription', 'Order', 'Patient'
   * @param {import('zod').ZodIssue[]} zodErrors
   */
  constructor(entityName, zodErrors = []) {
    const summary = zodErrors.map((e) => `${e.path.join('.')}: ${e.message}`).join(' | ');
    super(`[${entityName}] Datos inválidos: ${summary}`);
    this.name = 'RepositoryValidationError';
    this.code = 'REPO_VALIDATION_FAILED';
    this.entityName = entityName;
    this.details = zodErrors;
  }
}

/**
 * Thrown when a state transition is not allowed by the clinical state machine.
 * Prevents illegal status jumps (e.g. draft → completed) on regulated entities.
 * Standards: FDA 21 CFR Part 11, HL7 workflow compliance.
 */
export class ClinicalStateTransitionError extends Error {
  /**
   * @param {string} entityType - 'prescription' | 'sales_order' | 'purchase_order' | 'quotation'
   * @param {string} fromStatus
   * @param {string} toStatus
   */
  constructor(entityType, fromStatus, toStatus) {
    super(
      `[${entityType}] Transición de estado ilegal: "${fromStatus}" → "${toStatus}". ` +
        `Consulta el flujo clínico permitido en transactionalStateMachine.js`
    );
    this.name = 'ClinicalStateTransitionError';
    this.code = 'CLINICAL_INVALID_TRANSITION';
    this.entityType = entityType;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}

/**
 * Thrown when an actor lacks permission to access Protected Health Information.
 * Standards: HIPAA §164.312(a)(1), NOM-024-SSA3-2010.
 */
export class PHIAccessDeniedError extends Error {
  /**
   * @param {string} resource - Collection or document path being accessed
   * @param {string} actorId  - UID of the actor attempting access
   */
  constructor(resource, actorId) {
    super(`[PHI] Acceso denegado al recurso "${resource}" por actor "${actorId}"`);
    this.name = 'PHIAccessDeniedError';
    this.code = 'PHI_ACCESS_DENIED';
    this.resource = resource;
    this.actorId = actorId;
  }
}

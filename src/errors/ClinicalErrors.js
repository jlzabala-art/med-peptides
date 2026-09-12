/**
 * src/errors/ClinicalErrors.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Typed error classes for clinical, repository, and API operations.
 *
 * Using typed errors allows catch blocks in components to differentiate
 * between validation errors, business rule violations, network failures,
 * and configuration issues — producing precise UX feedback per error class.
 *
 * Standards: ISO 14971 (risk management), FDA 21 CFR Part 11, OWASP.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Repository & Domain Errors
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// API & Infrastructure Errors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thrown when a required external resource (document, entity) is not found.
 * Maps to HTTP 404. Use in repositories and API routes for explicit not-found states.
 */
export class NotFoundError extends Error {
  /**
   * @param {string} resourceType - e.g. 'Patient', 'Product', 'Protocol'
   * @param {string} id - The identifier that was not found
   */
  constructor(resourceType, id) {
    super(`[${resourceType}] No se encontró el recurso con identificador "${id}"`);
    this.name = 'NotFoundError';
    this.code = 'RESOURCE_NOT_FOUND';
    this.resourceType = resourceType;
    this.resourceId = id;
  }
}

/**
 * Thrown when a network or external service call fails (Firestore, Gemini, external APIs).
 * Provides structured context for retry logic and circuit breakers.
 */
export class NetworkError extends Error {
  /**
   * @param {string} service - Name of the service that failed (e.g. 'Firestore', 'Gemini', 'Stripe')
   * @param {string} operation - The operation being performed (e.g. 'read', 'write', 'generateContent')
   * @param {Error} [cause] - Original underlying error
   */
  constructor(service, operation, cause) {
    super(`[${service}] Fallo en operación "${operation}"${cause ? `: ${cause.message}` : ''}`);
    this.name = 'NetworkError';
    this.code = 'NETWORK_ERROR';
    this.service = service;
    this.operation = operation;
    this.cause = cause || null;
  }
}

/**
 * Thrown when an IP or user has exceeded the configured request rate limit.
 * Maps to HTTP 429. Provides retryAfter hint for exponential backoff on the client.
 */
export class RateLimitError extends Error {
  /**
   * @param {string} tier - The rate limit tier/endpoint name
   * @param {number} retryAfterSeconds - Seconds until the window resets
   */
  constructor(tier, retryAfterSeconds) {
    super(`[RateLimit] Límite de solicitudes excedido en "${tier}". Reintentar en ${retryAfterSeconds}s.`);
    this.name = 'RateLimitError';
    this.code = 'RATE_LIMIT_EXCEEDED';
    this.tier = tier;
    this.retryAfter = retryAfterSeconds;
  }
}

/**
 * Thrown when a required environment variable or configuration value is missing.
 * Prevents silent failures during server startup or API initialization.
 * Standards: Twelve-Factor App (Config factor).
 */
export class ConfigurationError extends Error {
  /**
   * @param {string} variableName - The name of the missing env var or config key
   * @param {string} [context] - Context where the variable is needed
   */
  constructor(variableName, context = '') {
    super(`[Config] Variable requerida faltante: "${variableName}"${context ? ` (necesaria en ${context})` : ''}`);
    this.name = 'ConfigurationError';
    this.code = 'CONFIGURATION_ERROR';
    this.variableName = variableName;
  }
}

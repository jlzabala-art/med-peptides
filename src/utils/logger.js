/**
 * logger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Structured Logging & Telemetry Layer.
 * Compatible with Google Cloud Logging / GCP stdout format.
 *
 * Features:
 *   - Severity levels: DEBUG, INFO, WARN, ERROR, AUDIT
 *   - Automatic ISO-8601 timestamps & execution context
 *   - Automatic PII & sensitive token redaction (passwords, auth tokens, cards)
 *   - Safe JSON serialization without circular reference crashes
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  AUDIT: 4,
};

const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'creditcard',
  'cardnumber',
  'cvv',
  'ssn',
  'bearer',
]);

/**
 * Deeply sanitizes sensitive fields from log payloads
 */
export function sanitizeLogPayload(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return '[Circular Reference]';
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeLogPayload(item, seen));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogPayload(value, seen);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatLog(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const sanitizedContext = sanitizeLogPayload(context);

  const entry = {
    timestamp,
    severity: level,
    message,
    ...sanitizedContext,
  };

  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }
  return `[${timestamp}] [${level}] ${message} ${Object.keys(sanitizedContext).length ? JSON.stringify(sanitizedContext) : ''}`.trim();
}

export const logger = {
  debug(message, context) {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(formatLog('DEBUG', message, context));
    }
  },

  info(message, context) {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.info(formatLog('INFO', message, context));
    }
  },

  warn(message, context) {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(formatLog('WARN', message, context));
    }
  },

  error(message, errorOrContext, context = {}) {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      const errContext = errorOrContext instanceof Error
        ? { error: errorOrContext.message, stack: errorOrContext.stack, ...context }
        : { ...errorOrContext, ...context };
      console.error(formatLog('ERROR', message, errContext));
    }
  },

  audit(action, actor, targetResource, metadata = {}) {
    // Audit logs are ALWAYS printed regardless of environment level
    const auditContext = {
      action,
      actor: typeof actor === 'object' ? { uid: actor.uid, email: actor.email, role: actor.role } : actor,
      targetResource,
      metadata,
    };
    console.info(formatLog('AUDIT', `AUDIT: [${action}] by [${typeof actor === 'object' ? actor.uid : actor}]`, auditContext));
  },
};

export default logger;

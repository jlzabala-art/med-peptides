/**
 * apiValidator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight, Fail-Fast Request Payload Validation Engine for Next.js API Routes.
 * Returns structured validation errors without heavy runtime dependencies.
 */



/**
 * Validates a request payload against a field definition schema.
 *
 * @param {Object} payload - The incoming JSON payload.
 * @param {Object.<string, { type?: string, required?: boolean, minLength?: number, min?: number, enum?: Array }>} schema
 * @returns {{ valid: boolean, errors?: Array<{ field: string, message: string }> }}
 */
export function validatePayload(payload, schema) {
  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Payload must be a valid JSON object' }],
    };
  }

  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const val = payload[field];

    // 1. Required Check
    if (rules.required && (val === undefined || val === null || val === '')) {
      errors.push({ field, message: `Field '${field}' is required.` });
      continue;
    }

    // Skip further checks if value is optional and absent
    if (val === undefined || val === null) continue;

    // 2. Type Check
    if (rules.type) {
      if (rules.type === 'array') {
        if (!Array.isArray(val)) {
          errors.push({ field, message: `Field '${field}' must be an array.` });
        }
      } else if (rules.type === 'number') {
        if (typeof val !== 'number' || isNaN(val)) {
          errors.push({ field, message: `Field '${field}' must be a valid number.` });
        }
      } else if (typeof val !== rules.type) {
        errors.push({ field, message: `Field '${field}' must be of type ${rules.type}.` });
      }
    }

    // 3. String Length Check
    if (typeof val === 'string' && rules.minLength !== undefined) {
      if (val.trim().length < rules.minLength) {
        errors.push({ field, message: `Field '${field}' must have at least ${rules.minLength} characters.` });
      }
    }

    // 4. Numeric Bounds
    if (typeof val === 'number' && rules.min !== undefined) {
      if (val < rules.min) {
        errors.push({ field, message: `Field '${field}' must be at least ${rules.min}.` });
      }
    }

    // 5. Enum Check
    if (rules.enum && Array.isArray(rules.enum)) {
      if (!rules.enum.includes(val)) {
        errors.push({ field, message: `Field '${field}' must be one of: [${rules.enum.join(', ')}].` });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Standardized HTTP 400 Bad Request JSON Response Helper
 */
export function badRequestResponse(errors) {
  return Response.json(
    {
      error: 'Invalid Request Payload',
      validationErrors: Array.isArray(errors) ? errors : [{ message: String(errors) }],
    },
    { status: 400 }
  );
}

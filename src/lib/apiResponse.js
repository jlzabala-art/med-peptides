import { NextResponse } from 'next/server';

/**
 * apiResponse.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Standardized API Response utilities for Next.js Route Handlers.
 */

/**
 * Return standard JSON success response
 * @param {any} data
 * @param {number} status
 * @param {Record<string, string>} headers
 */
export function apiSuccess(data = {}, status = 200, headers = {}) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers,
    }
  );
}

/**
 * Return standard JSON validation error response (400)
 * @param {import('zod').ZodError | Array<{ path: string, message: string }>} zodOrIssues
 * @param {string} [customMessage]
 */
export function apiValidationError(zodOrIssues, customMessage = 'Invalid request payload') {
  let issues = [];
  if (zodOrIssues && Array.isArray(zodOrIssues.errors)) {
    issues = zodOrIssues.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (Array.isArray(zodOrIssues)) {
    issues = zodOrIssues;
  }

  return NextResponse.json(
    {
      success: false,
      error: customMessage,
      code: 'VALIDATION_ERROR',
      issues,
    },
    { status: 400 }
  );
}

/**
 * Return standard JSON error response
 * @param {string} message
 * @param {number} status
 * @param {string} [code]
 */
export function apiError(message = 'Internal server error', status = 500, code = 'INTERNAL_ERROR') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status }
  );
}

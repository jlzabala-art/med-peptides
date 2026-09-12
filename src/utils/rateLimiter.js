/**
 * rateLimiter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * High-performance, in-memory sliding window rate limiter for Next.js API routes.
 * Protects critical endpoints (AI inference, document extraction, PDF export)
 * against abuse, brute force, and quota exhaustion without third-party services.
 */

import { NextResponse } from 'next/server';

const rateLimitStore = new Map();

// Periodic prune to prevent memory leaks in sustained serverless/server environments
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Extract client IP from Next.js Request headers safely
 * @param {Request} req 
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Checks whether an incoming request exceeds the configured rate limit.
 * 
 * @param {Request} req - The incoming Next.js API request.
 * @param {Object} [options]
 * @param {number} [options.limit=60] - Maximum allowed requests in the time window.
 * @param {number} [options.windowMs=60000] - Window size in milliseconds (default: 1 minute).
 * @param {string} [options.tier='default'] - Tier prefix for separate bucket per endpoint class.
 * @returns {{ allowed: boolean, limit: number, remaining: number, reset: number, retryAfter: number }}
 */
export function checkRateLimit(req, options = {}) {
  const { limit = 60, windowMs = 60 * 1000, tier = 'default' } = options;
  const ip = getClientIp(req);
  const key = `${tier}:${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || record.resetTime <= now) {
    // New or expired window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
      retryAfter: 0,
    };
  }

  // Active window
  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const reset = Math.ceil(record.resetTime / 1000);
  const retryAfter = Math.ceil((record.resetTime - now) / 1000);

  return {
    allowed: record.count <= limit,
    limit,
    remaining,
    reset,
    retryAfter: record.count > limit ? Math.max(1, retryAfter) : 0,
  };
}

/**
 * Returns a standardized HTTP 429 Too Many Requests response with standard rate-limit headers.
 * 
 * @param {Object} rateInfo
 * @returns {NextResponse}
 */
export function rateLimitExceededResponse(rateInfo) {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait before retrying.',
      retryAfterSeconds: rateInfo.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(rateInfo.retryAfter),
        'X-RateLimit-Limit': String(rateInfo.limit),
        'X-RateLimit-Remaining': String(rateInfo.remaining),
        'X-RateLimit-Reset': String(rateInfo.reset),
      },
    }
  );
}

/**
 * Decorates a successful response with rate-limit headers for transparency.
 * 
 * @param {NextResponse} response
 * @param {Object} rateInfo
 * @returns {NextResponse}
 */
export function applyRateLimitHeaders(response, rateInfo) {
  response.headers.set('X-RateLimit-Limit', String(rateInfo.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateInfo.remaining));
  response.headers.set('X-RateLimit-Reset', String(rateInfo.reset));
  return response;
}

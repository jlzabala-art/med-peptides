/**
 * @fileoverview Atlas Resilient Gemini Model Router & Auto-Fallback Engine
 *
 * Protects the entire platform against Google Gemini model deprecations,
 * regional availability shifts, rate limits (429/503), and SDK/REST changes.
 *
 * Architecture (Golden Rule #2 compliant):
 *  - Layer 1: In-Memory Circuit Breaker & Health Registry (0ms overhead).
 *             Memorizes which model is currently healthy and quarantines
 *             deprecated (404) or rate-limited (429/503) models automatically.
 *  - Layer 2: Environment Variable Overrides (`GEMINI_PRIMARY_MODEL`,
 *             `GEMINI_MODEL_FAST`, `GEMINI_MODEL_REASONING`, `GEMINI_MODEL_LITE`).
 *  - Layer 3: Firestore Dynamic Configuration (`_config/ai_models`) cached in
 *             RAM for 30 minutes so models can be hot-swapped without redeploying.
 *  - Layer 4: Multi-Model Waterfall + Rolling Google Aliases (`gemini-flash-latest`,
 *             `gemini-pro-latest`, `gemini-flash-lite-latest`) + REST API fallback.
 */

import { GoogleGenAI } from '@google/genai';

export const AI_TIER = {
  FAST: 'fast',
  REASONING: 'reasoning',
  LITE: 'lite'
};

/**
 * Default ordered waterfall per semantic tier.
 * Includes current generation models AND Google's official rolling `-latest` aliases
 * so if a numbered version is retired by Google, the rolling alias continues working.
 */
const DEFAULT_TIER_WATERFALLS = {
  [AI_TIER.FAST]: [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ],
  [AI_TIER.REASONING]: [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ],
  [AI_TIER.LITE]: [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest'
  ]
};

// ── Layer 1: In-Memory Circuit Breaker & Dynamic Config Cache ───────────────
const MODEL_HEALTH_MAP = new Map(); // modelName -> { unhealthyUntil: number, reason: string }
const LAST_WORKING_MODEL_BY_TIER = new Map(); // tier -> modelName

let cachedFirestoreConfig = null;
let cachedFirestoreConfigAt = 0;
const FIRESTORE_CONFIG_TTL_MS = 30 * 60 * 1000; // 30 minutes

const DEPRECATION_QUARANTINE_MS = 60 * 60 * 1000; // 1 hour quarantine for 404 / retired models
const CAPACITY_COOLDOWN_MS = 90 * 1000; // 90 seconds cooldown for 429 / 503 overload

/**
 * Invalidates the in-memory AI model configuration and circuit breaker cache.
 * Exposed per Golden Rule #2 so Admin Panel updates apply immediately.
 */
export function invalidateAiModelConfigCache() {
  cachedFirestoreConfig = null;
  cachedFirestoreConfigAt = 0;
  MODEL_HEALTH_MAP.clear();
  LAST_WORKING_MODEL_BY_TIER.clear();
}

/**
 * Loads optional hot-swappable model configuration from Firestore `_config/ai_models`.
 * Non-blocking and safe if Firestore Admin is not initialized in the current context.
 */
async function getDynamicFirestoreModelConfig() {
  if (typeof window !== 'undefined') {
    return null;
  }
  const now = Date.now();
  if (cachedFirestoreConfig && now - cachedFirestoreConfigAt < FIRESTORE_CONFIG_TTL_MS) {
    return cachedFirestoreConfig;
  }

  try {
    const { adminDb } = await import(/* webpackIgnore: true */ '@/lib/firebaseAdmin');
    if (!adminDb) return null;
    const snap = await adminDb.collection('_config').doc('ai_models').get();
    if (snap.exists) {
      cachedFirestoreConfig = snap.data() || {};
    } else {
      cachedFirestoreConfig = {};
    }
    cachedFirestoreConfigAt = now;
    return cachedFirestoreConfig;
  } catch {
    cachedFirestoreConfig = {};
    cachedFirestoreConfigAt = now;
    return null;
  }
}

/**
 * Checks whether a model is currently healthy according to the circuit breaker.
 */
function isModelHealthy(modelName) {
  const entry = MODEL_HEALTH_MAP.get(modelName);
  if (!entry) return true;
  if (Date.now() >= entry.unhealthyUntil) {
    MODEL_HEALTH_MAP.delete(modelName);
    return true;
  }
  return false;
}

/**
 * Records a model failure and places it in quarantine (404/deprecated) or cooldown (429/503).
 */
function markModelFailure(modelName, error) {
  const msg = String(error?.message || error || '');
  const isDeprecatedOrNotFound =
    /404|NOT_FOUND|not found|not supported|deprecated|retired|does not exist|invalid model/i.test(msg);
  const isOverloadedOrQuota =
    /429|503|UNAVAILABLE|ResourceExhausted|quota|overloaded|high demand|rate limit/i.test(msg);

  const durationMs = isDeprecatedOrNotFound
    ? DEPRECATION_QUARANTINE_MS
    : isOverloadedOrQuota
      ? CAPACITY_COOLDOWN_MS
      : 30 * 1000;

  MODEL_HEALTH_MAP.set(modelName, {
    unhealthyUntil: Date.now() + durationMs,
    reason: msg.slice(0, 180)
  });
}

/**
 * Resolves the ordered list of candidate models to try for a given tier.
 */
export async function resolveCandidateModels({
  tier = AI_TIER.FAST,
  preferredModels = []
} = {}) {
  const normalizedTier = DEFAULT_TIER_WATERFALLS[tier] ? tier : AI_TIER.FAST;
  const fsConfig = await getDynamicFirestoreModelConfig();

  const envPrimary =
    process.env.GEMINI_PRIMARY_MODEL ||
    (normalizedTier === AI_TIER.REASONING
      ? process.env.GEMINI_MODEL_REASONING
      : normalizedTier === AI_TIER.LITE
        ? process.env.GEMINI_MODEL_LITE
        : process.env.GEMINI_MODEL_FAST);

  const fsPrimary =
    fsConfig?.primaryModel ||
    (normalizedTier === AI_TIER.REASONING
      ? fsConfig?.reasoningModel
      : normalizedTier === AI_TIER.LITE
        ? fsConfig?.liteModel
        : fsConfig?.fastModel);

  const fsWaterfall = Array.isArray(fsConfig?.waterfalls?.[normalizedTier])
    ? fsConfig.waterfalls[normalizedTier]
    : [];

  const lastWorking = LAST_WORKING_MODEL_BY_TIER.get(normalizedTier);

  // Merge candidates in priority order without duplicates
  const rawList = [
    ...(fsPrimary ? [fsPrimary] : []),
    ...(envPrimary ? [envPrimary] : []),
    ...(lastWorking ? [lastWorking] : []),
    ...(Array.isArray(preferredModels) ? preferredModels : []),
    ...fsWaterfall,
    ...(DEFAULT_TIER_WATERFALLS[normalizedTier] || DEFAULT_TIER_WATERFALLS[AI_TIER.FAST])
  ]
    .map((m) => String(m || '').trim())
    .filter(Boolean);

  const uniqueModels = Array.from(new Set(rawList));

  // Place healthy models first, unhealthy models at the end as last-resort
  const healthy = uniqueModels.filter(isModelHealthy);
  const unhealthy = uniqueModels.filter((m) => !isModelHealthy(m));

  return [...healthy, ...unhealthy];
}

/**
 * Normalizes `contents` into a format accepted by the REST v1beta fallback endpoint.
 */
function normalizeContentsForRest(contents) {
  if (typeof contents === 'string') {
    return [{ role: 'user', parts: [{ text: contents }] }];
  }
  if (Array.isArray(contents)) {
    // Could be an array of turn objects [{ role, parts }] or an array of parts [prompt, { inlineData }]
    const first = contents[0];
    if (first && typeof first === 'object' && Array.isArray(first.parts)) {
      return contents;
    }
    const parts = contents.map((item) => {
      if (typeof item === 'string') return { text: item };
      return item;
    });
    return [{ role: 'user', parts }];
  }
  if (contents && typeof contents === 'object' && Array.isArray(contents.parts)) {
    return [contents];
  }
  return [{ role: 'user', parts: [{ text: String(contents || '') }] }];
}

/**
 * Executes a Gemini generation request with automatic multi-model waterfall fallback,
 * circuit-breaker health tracking, and direct REST v1beta backup.
 *
 * Drop-in replacement for `ai.models.generateContent({ model, contents, config })`.
 *
 * @param {Object} options
 * @param {string} [options.tier='fast'] - Semantic tier ('fast' | 'reasoning' | 'lite')
 * @param {any} options.contents - Prompt string, parts array, or conversation turns
 * @param {Object} [options.config={}] - Generation config (temperature, responseMimeType, responseSchema, systemInstruction, etc.)
 * @param {string} [options.apiKey] - Optional explicit API key (defaults to process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY)
 * @param {Object} [options.aiClient] - Optional pre-instantiated GoogleGenAI client
 * @param {string[]} [options.preferredModels=[]] - Optional extra candidate models
 * @returns {Promise<{ text: string, modelUsed: string, response: any, attemptedModels: string[] }>}
 */
export async function generateWithResilientGemini({
  tier = AI_TIER.FAST,
  contents,
  config = {},
  apiKey,
  aiClient,
  preferredModels = []
} = {}) {
  const resolvedKey =
    apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (!resolvedKey && !aiClient) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = aiClient || new GoogleGenAI({ apiKey: resolvedKey });
  const candidates = await resolveCandidateModels({ tier, preferredModels });
  const attemptedModels = [];
  let lastError = null;

  // 1. Primary path: GoogleGenAI SDK across candidate waterfall
  for (const modelName of candidates) {
    attemptedModels.push(modelName);
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config
      });

      const extractedText =
        response?.text ||
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        '';

      if (extractedText) {
        LAST_WORKING_MODEL_BY_TIER.set(tier, modelName);
        return {
          text: extractedText,
          modelUsed: modelName,
          response: {
            ...response,
            text: extractedText,
            modelUsed: modelName
          },
          attemptedModels
        };
      }
    } catch (sdkErr) {
      lastError = sdkErr;
      markModelFailure(modelName, sdkErr);
      console.warn(
        `[GeminiModelRouter] Model "${modelName}" failed (${sdkErr?.message || sdkErr}). Automatic fallback to next candidate...`
      );
    }
  }

  // 2. Secondary path: Direct Google Generative Language REST API fallback using current available models
  if (resolvedKey) {
    const restFallbackModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest'
    ];
    for (const restModel of restFallbackModels) {
      if (!attemptedModels.includes(`rest:${restModel}`)) {
        attemptedModels.push(`rest:${restModel}`);
      }
      try {
        const restBody = {
          contents: normalizeContentsForRest(contents),
          generationConfig: {
            ...(config.temperature !== undefined ? { temperature: config.temperature } : {}),
            ...(config.maxOutputTokens !== undefined ? { maxOutputTokens: config.maxOutputTokens } : {}),
            ...(config.responseMimeType ? { responseMimeType: config.responseMimeType } : {}),
            ...(config.responseSchema ? { responseSchema: config.responseSchema } : {})
          }
        };

        if (config.systemInstruction) {
          restBody.systemInstruction =
            typeof config.systemInstruction === 'string'
              ? { parts: [{ text: config.systemInstruction }] }
              : config.systemInstruction;
        }

        const restRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${resolvedKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(restBody)
          }
        );

        if (restRes.ok) {
          const restJson = await restRes.json();
          const restText = restJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (restText) {
            LAST_WORKING_MODEL_BY_TIER.set(tier, restModel);
            return {
              text: restText,
              modelUsed: restModel,
              response: {
                ...restJson,
                text: restText,
                modelUsed: restModel
              },
              attemptedModels
            };
          }
        }
      } catch (restErr) {
        lastError = restErr;
      }
    }
  }

  throw (
    lastError ||
    new Error(`All Gemini candidate models failed (${attemptedModels.join(', ')})`)
  );
}

/**
 * Returns a live diagnostic snapshot of the AI Model Router health & active waterfalls.
 */
export async function getGeminiRouterHealthSnapshot() {
  const fastCandidates = await resolveCandidateModels({ tier: AI_TIER.FAST });
  const reasoningCandidates = await resolveCandidateModels({ tier: AI_TIER.REASONING });
  const liteCandidates = await resolveCandidateModels({ tier: AI_TIER.LITE });

  const quarantined = {};
  for (const [model, info] of MODEL_HEALTH_MAP.entries()) {
    if (Date.now() < info.unhealthyUntil) {
      quarantined[model] = {
        unhealthyUntil: new Date(info.unhealthyUntil).toISOString(),
        reason: info.reason
      };
    }
  }

  return {
    lastWorkingByTier: Object.fromEntries(LAST_WORKING_MODEL_BY_TIER.entries()),
    activeCandidates: {
      [AI_TIER.FAST]: fastCandidates,
      [AI_TIER.REASONING]: reasoningCandidates,
      [AI_TIER.LITE]: liteCandidates
    },
    quarantinedModels: quarantined
  };
}

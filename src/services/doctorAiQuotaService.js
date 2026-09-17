/**
 * services/doctorAiQuotaService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized service to track and enforce monthly AI quotas for physicians.
 *
 * Rules:
 *  - Basic (Free / Starter) Tier: 5 AI queries per calendar month (YYYY-MM).
 *  - Advanced Pro Tier: Unlimited queries (limit = Infinity).
 *
 * Implements Golden Rule #2 (Multi-tier caching):
 *  - Tier 2 (Local): localStorage for immediate, zero-latency feedback.
 *  - Tier 4 (Firestore): Async update on doctor's user document (users/{doctorId}).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const BASIC_AI_MONTHLY_LIMIT = 5;

/**
 * Returns current year-month key (e.g. "2026-09")
 */
export function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Storage key for localStorage cache
 */
function getStorageKey(doctorId, monthKey) {
  const cleanId = doctorId || 'dr-hanieh-erdmann';
  return `atlas_ai_quota_${cleanId}_${monthKey}`;
}

/**
 * Resolves whether a given subscription tier is considered Pro
 */
export function isProTier(tier) {
  if (!tier) return false;
  const clean = String(tier).toLowerCase().trim();
  return clean === 'advanced' || clean === 'pro' || clean === 'enterprise';
}

/**
 * Retrieves the current AI usage and quota stats for a doctor.
 * @param {string} doctorId - Doctor identifier
 * @param {string} subscriptionTier - 'basic' | 'advanced' | 'pro'
 * @returns {object} { used, limit, remaining, isPro, canUse, isExceeded, monthKey }
 */
export function getDoctorQuota(doctorId, subscriptionTier = 'basic') {
  const monthKey = getCurrentMonthKey();
  const isPro = isProTier(subscriptionTier);

  if (isPro) {
    return {
      used: 0,
      limit: Infinity,
      remaining: Infinity,
      isPro: true,
      canUse: true,
      isExceeded: false,
      monthKey,
    };
  }

  // Basic tier: read from local cache
  let used = 0;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(getStorageKey(doctorId, monthKey));
      if (stored !== null) {
        used = parseInt(stored, 10) || 0;
      }
    } catch (e) {
      console.warn('[doctorAiQuotaService] LocalStorage read error:', e);
    }
  }

  const limit = BASIC_AI_MONTHLY_LIMIT;
  const remaining = Math.max(0, limit - used);
  const isExceeded = used >= limit;
  const canUse = !isExceeded;

  return {
    used,
    limit,
    remaining,
    isPro: false,
    canUse,
    isExceeded,
    monthKey,
  };
}

/**
 * Synchronizes quota from Firestore asynchronously.
 * Useful on initial mount to ensure multi-device consistency.
 */
export async function syncDoctorQuotaFromFirestore(doctorId, subscriptionTier = 'basic') {
  if (!doctorId || isProTier(subscriptionTier) || typeof window === 'undefined') {
    return getDoctorQuota(doctorId, subscriptionTier);
  }

  const monthKey = getCurrentMonthKey();
  try {
    const docRef = doc(db, 'users', doctorId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const firestoreUsed = data?.aiMonthlyUsage?.[monthKey];
      if (typeof firestoreUsed === 'number') {
        localStorage.setItem(getStorageKey(doctorId, monthKey), String(firestoreUsed));
        const updated = getDoctorQuota(doctorId, subscriptionTier);
        notifyQuotaChanged(updated);
        return updated;
      }
    }
  } catch (err) {
    // Non-blocking fallback to local cache if offline or permission restricted
    console.warn('[doctorAiQuotaService] Firestore sync non-blocking fallback:', err?.message);
  }

  return getDoctorQuota(doctorId, subscriptionTier);
}

/**
 * Records a consumed AI query (e.g. Clinical Scribe or SOAP Generation).
 * Increments local counter and updates Firestore asynchronously.
 *
 * @param {string} doctorId - Doctor identifier
 * @param {string} subscriptionTier - 'basic' | 'advanced' | 'pro'
 * @returns {object} Updated quota info
 */
export async function consumeAiQuery(doctorId, subscriptionTier = 'basic') {
  const monthKey = getCurrentMonthKey();
  const isPro = isProTier(subscriptionTier);

  if (isPro) {
    const quota = {
      used: 0,
      limit: Infinity,
      remaining: Infinity,
      isPro: true,
      canUse: true,
      isExceeded: false,
      monthKey,
    };
    notifyQuotaChanged(quota);
    return quota;
  }

  // Increment local
  let currentUsed = 0;
  const key = getStorageKey(doctorId, monthKey);
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) currentUsed = parseInt(stored, 10) || 0;
      currentUsed += 1;
      localStorage.setItem(key, String(currentUsed));
    } catch (e) {
      console.warn('[doctorAiQuotaService] LocalStorage write error:', e);
      currentUsed += 1;
    }
  } else {
    currentUsed += 1;
  }

  const limit = BASIC_AI_MONTHLY_LIMIT;
  const remaining = Math.max(0, limit - currentUsed);
  const updatedQuota = {
    used: currentUsed,
    limit,
    remaining,
    isPro: false,
    canUse: currentUsed < limit,
    isExceeded: currentUsed >= limit,
    monthKey,
  };

  notifyQuotaChanged(updatedQuota);

  // Asynchronously sync to Firestore if doctorId is present
  if (doctorId && typeof window !== 'undefined') {
    (async () => {
      try {
        const docRef = doc(db, 'users', doctorId);
        await updateDoc(docRef, {
          [`aiMonthlyUsage.${monthKey}`]: currentUsed,
          lastAiUsageAt: new Date().toISOString(),
        }).catch(async (updateErr) => {
          if (updateErr?.code === 'not-found') {
            await setDoc(docRef, {
              aiMonthlyUsage: { [monthKey]: currentUsed },
              lastAiUsageAt: new Date().toISOString(),
            }, { merge: true });
          }
        });
      } catch (e) {
        console.warn('[doctorAiQuotaService] Firestore async save warning:', e?.message);
      }
    })();
  }

  return updatedQuota;
}

/**
 * Resets quota count for testing or administrative resets.
 */
export function resetDoctorAiQuota(doctorId, monthKey = getCurrentMonthKey()) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getStorageKey(doctorId, monthKey));
  }
  const quota = getDoctorQuota(doctorId, 'basic');
  notifyQuotaChanged(quota);
  return quota;
}

/**
 * Dispatches an event across the window so all components update immediately.
 */
function notifyQuotaChanged(quotaInfo) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('doctor-ai-quota-changed', { detail: quotaInfo }));
  }
}

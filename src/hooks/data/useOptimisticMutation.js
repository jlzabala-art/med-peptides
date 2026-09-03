"use client";

import { useState, useCallback } from 'react';
import notifier from '../../services/NotificationService';

/**
 * useOptimisticMutation
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides 0ms perceived latency for data mutations with automatic rollback
 * on network or backend failure.
 *
 * Implements AGENTS.md Rule #25 (Non-blocking UI & Idempotency) and Rule #27 (Explicit Toasts).
 *
 * @param {Function} asyncMutationFn - The asynchronous function that persists to Firestore / API.
 * @param {Object} options
 * @param {string} [options.successMessage] - Toast message on success.
 * @param {string} [options.errorMessage] - Toast message on failure.
 * @param {Function} [options.onRollback] - Callback executed when rollback occurs.
 */
export function useOptimisticMutation(asyncMutationFn, options = {}) {
  const [isMutating, setIsMutating] = useState(false);

  const mutateOptimistically = useCallback(async ({
    currentData,
    optimisticData,
    setData,
    mutationArgs = []
  }) => {
    // 1. Snapshot previous state for rollback
    const previousSnapshot = currentData;

    // 2. Apply optimistic update to UI immediately (0ms)
    setData(optimisticData);
    setIsMutating(true);

    try {
      // 3. Perform backend mutation asynchronously in background
      const result = await asyncMutationFn(...mutationArgs);

      if (options.successMessage) {
        notifier.success(options.successMessage);
      }

      return { success: true, result };
    } catch (error) {
      console.error('[useOptimisticMutation] Mutation failed, rolling back:', error);

      // 4. Automatic Rollback to previous snapshot
      setData(previousSnapshot);
      if (options.onRollback) {
        options.onRollback(previousSnapshot, error);
      }

      notifier.error(options.errorMessage || `Action failed: ${error.message || 'Network error'}. Changes reverted.`);
      return { success: false, error };
    } finally {
      setIsMutating(false);
    }
  }, [asyncMutationFn, options]);

  return {
    mutateOptimistically,
    isMutating
  };
}

export default useOptimisticMutation;

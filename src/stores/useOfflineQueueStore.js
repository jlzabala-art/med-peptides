/**
 * useOfflineQueueStore.js
 * 
 * Zustand store for queuing offline mutations and synchronizing them
 * with Firestore / backend APIs upon network reconnection.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

export const useOfflineQueueStore = create(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      lastSyncedAt: null,

      enqueueMutation: (action, payload) => {
        const item = {
          id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          action,
          payload,
          timestamp: Date.now(),
          retries: 0,
          status: 'pending',
        };
        set((state) => ({
          queue: [...state.queue, item],
        }));
        return item.id;
      },

      dequeueMutation: (id) => {
        set((state) => ({
          queue: state.queue.filter((m) => m.id !== id),
        }));
      },

      updateMutationStatus: (id, status, error = null) => {
        set((state) => ({
          queue: state.queue.map((m) => {
            if (m.id === id) {
              return {
                ...m,
                status,
                retries: status === 'failed' ? m.retries + 1 : m.retries,
                lastError: error ? error.message || String(error) : null,
              };
            }
            return m;
          }),
        }));
      },

      clearQueue: () => set({ queue: [], isSyncing: false }),

      setSyncing: (val) => set({ isSyncing: val, lastSyncedAt: val ? get().lastSyncedAt : Date.now() }),
    }),
    {
      name: 'regenpept_offline_queue_v1',
      partialize: (state) => ({
        queue: state.queue,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// ─── Granular Selectors ────────────────────────────────────────────────────
export const useOfflineQueueStatus = () =>
  useOfflineQueueStore(
    useShallow((s) => ({
      queueLength: s.queue.length,
      hasPendingMutations: s.queue.some((m) => m.status === 'pending'),
      isSyncing: s.isSyncing,
      lastSyncedAt: s.lastSyncedAt,
    }))
  );

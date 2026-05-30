import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../firebase';
import {
  subscribeToCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../api/calendarApi';

// Re-export so existing consumers that import from this file keep working
export { EVENT_COLORS, detectConflicts } from '../api/calendarApi';

/**
 * Hook: subscribes to `calendar_events` for the authenticated user.
 * Returns FC-compatible event objects enriched with conflict flags.
 *
 * Uses React Query for cache management and mutations.
 */
export function useCalendarEvents() {
  const queryClient = useQueryClient();
  const uid = auth.currentUser?.uid;

  // ─── Real-time subscription via useQuery + onSnapshot ────────────────────
  const { data: events = [], isLoading: loading, error } = useQuery({
    queryKey: ['calendarEvents', uid],
    // Provide a no-op queryFn — data is seeded by onSnapshot below
    queryFn: () => queryClient.getQueryData(['calendarEvents', uid]) ?? [],
    enabled: !!uid,
    // Keep data fresh via the Firestore listener; no need for refetch
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!uid) return;

    const unsub = subscribeToCalendarEvents(
      uid,
      (newEvents) => {
        queryClient.setQueryData(['calendarEvents', uid], newEvents);
      },
      (err) => {
        // Surface the snapshot error through React Query's error state
        queryClient.setQueryDefaults(['calendarEvents', uid], { meta: { snapshotError: err } });
        queryClient.invalidateQueries({ queryKey: ['calendarEvents', uid] });
      }
    );

    return () => unsub();
  }, [uid, queryClient]);

  // ─── Mutations ───────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (eventData) => createCalendarEvent(eventData),
    // onSnapshot will automatically push the new data into the cache
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateCalendarEvent(id, patch),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCalendarEvent(id),
  });

  // ─── Stable wrappers matching the original public API ────────────────────

  const createEvent = useCallback(
    (eventData) => createMutation.mutateAsync(eventData),
    [createMutation]
  );

  const updateEvent = useCallback(
    (id, patch) => updateMutation.mutateAsync({ id, patch }),
    [updateMutation]
  );

  const deleteEvent = useCallback(
    (id) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  return { events, loading, error, createEvent, updateEvent, deleteEvent };
}

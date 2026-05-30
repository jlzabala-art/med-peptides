import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Maps event type → FullCalendar backgroundColor */
export const EVENT_COLORS = {
  prescription: '#3b82f6',
  shipping:     '#10b981',
  marketing:    '#8b5cf6',
  order:        '#f59e0b',
  protocol:     '#ec4899',
  default:      '#64748b',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Detects time-overlap conflicts within a list of events.
 * Returns the same list with a `conflict: true` flag on affected events.
 */
export function detectConflicts(events) {
  const sorted = [...events].sort((a, b) =>
    new Date(a.start) - new Date(b.start)
  );
  const flagged = new Set();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const aEnd = sorted[i].end ? new Date(sorted[i].end) : new Date(new Date(sorted[i].start).getTime() + 3600000);
      const bStart = new Date(sorted[j].start);
      if (bStart < aEnd) {
        flagged.add(sorted[i].id);
        flagged.add(sorted[j].id);
      } else {
        break;
      }
    }
  }
  return events.map(e => ({ ...e, conflict: flagged.has(e.id) }));
}

// ─── Firestore snapshot → FC-compatible event mapper ─────────────────────────

function mapSnapshotToEvents(snap) {
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || 'Untitled',
      start: data.start instanceof Timestamp ? data.start.toDate().toISOString() : data.start,
      end: data.end
        ? data.end instanceof Timestamp
          ? data.end.toDate().toISOString()
          : data.end
        : null,
      allDay: !!data.allDay,
      backgroundColor: EVENT_COLORS[data.type] ?? EVENT_COLORS.default,
      borderColor: 'transparent',
      extendedProps: {
        type: data.type || 'default',
        description: data.description || '',
        timezone: data.timezone || 'UTC',
        reminderSent: data.reminderSent || false,
        reminderChannels: data.reminderChannels || [],
        recurrence: data.recurrence || null,
        googleEventId: data.googleEventId || null,
        protocolId: data.protocolId || null,
        ownerIds: data.ownerIds || [],
        createdAt: data.createdAt,
      },
    };
  });
}

// ─── Subscription ────────────────────────────────────────────────────────────

/**
 * Sets up a real-time Firestore listener for `calendar_events` owned by `uid`.
 *
 * @param {string}   uid       – the authenticated user's UID
 * @param {Function} callback  – called with the mapped & conflict-flagged events array
 * @param {Function} onError   – called when the snapshot listener errors
 * @returns {Function} unsubscribe – call to tear down the listener
 */
export function subscribeToCalendarEvents(uid, callback, onError) {
  const q = query(
    collection(db, 'calendar_events'),
    where('ownerIds', 'array-contains', uid),
    orderBy('start', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const raw = mapSnapshotToEvents(snap);
      callback(detectConflicts(raw));
    },
    (err) => {
      console.error('[calendarApi] onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Creates a new calendar event document.
 * @param {Object} eventData – fields to store (title, start, end, type, …)
 * @returns {Promise<string>} the new document ID
 */
export async function createCalendarEvent(eventData) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const ref = await addDoc(collection(db, 'calendar_events'), {
    ...eventData,
    ownerIds: [uid],
    reminderSent: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Updates an existing calendar event document.
 * @param {string} id    – the document ID
 * @param {Object} patch – fields to merge
 */
export async function updateCalendarEvent(id, patch) {
  await updateDoc(doc(db, 'calendar_events', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a calendar event document.
 * @param {string} id – the document ID
 */
export async function deleteCalendarEvent(id) {
  await deleteDoc(doc(db, 'calendar_events', id));
}

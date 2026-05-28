/**
 * useRefillReminders.js
 *
 * Queries /refill_reminders for the current user's pending reminders.
 * Adapts automatically to the caller's role:
 *
 *   patient    → where('patientId', '==', uid)
 *   doctor     → where('doctorId', '==', uid)
 *   wholesaler → where('wholesalerIds', 'array-contains', uid)
 *   admin      → no filter (sees all) — queries recent 50
 *
 * Reminder is "pending" when:
 *   - remindAt <= now
 *   - notified[role] == false
 *
 * Returns:
 *   pendingReminders  — array ready to display
 *   dismissReminder   — marks reminder as notified for this role
 *   loading
 *
 * Usage:
 *   const { pendingReminders, dismissReminder } = useRefillReminders('patient');
 *   const { pendingReminders, dismissReminder } = useRefillReminders('doctor');
 *   const { pendingReminders, dismissReminder } = useRefillReminders('wholesaler');
 *   const { pendingReminders, dismissReminder } = useRefillReminders('admin');
 */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// How many reminders to show per role at a time
const LIMIT_BY_ROLE = { patient: 10, doctor: 30, wholesaler: 30, admin: 50 };

export function useRefillReminders(role) {
  const { user } = useAuth();
  const [pendingReminders, setPendingReminders] = useState([]);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    if (!user?.uid || !role) {
      setPendingReminders([]);
      setLoading(false);
      return;
    }

    const uid = user.uid;
    const now  = Timestamp.now();
    const col  = collection(db, 'refill_reminders');
    const lim  = LIMIT_BY_ROLE[role] ?? 20;

    let q;
    if (role === 'patient') {
      q = query(col,
        where('patientId', '==', uid),
        limit(lim)
      );
    } else if (role === 'doctor') {
      q = query(col,
        where('doctorId', '==', uid),
        limit(lim)
      );
    } else if (role === 'wholesaler') {
      q = query(col,
        where('wholesalerIds', 'array-contains', uid),
        limit(lim)
      );
    } else if (role === 'admin') {
      // Admins see all recent reminders
      q = query(col,
        limit(lim)
      );
    } else {
      setPendingReminders([]);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const reminders = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          // Filter in memory for remindAt to avoid composite indexes
          .filter(r => {
            if (!r.remindAt) return false;
            // Support firestore Timestamp structure or raw date
            const remindDate = r.remindAt.toDate ? r.remindAt.toDate() : new Date(r.remindAt);
            return remindDate <= new Date() && !r.notified?.[role];
          })
          .sort((a, b) => {
            const dateA = a.remindAt.toDate ? a.remindAt.toDate() : new Date(a.remindAt);
            const dateB = b.remindAt.toDate ? b.remindAt.toDate() : new Date(b.remindAt);
            return dateB - dateA;
          });

        setPendingReminders(reminders);
        setLoading(false);
      },
      (err) => {
        // For wholesaler query the index may not exist yet — fail silently
        console.warn(`[useRefillReminders:${role}] Query error:`, err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [user?.uid, role]);

  /**
   * dismissReminder(reminderId)
   * Marks the reminder as notified for this specific role.
   * Firestore rules allow updating notified/notifiedAt fields only.
   */
  const dismissReminder = useCallback(async (reminderId) => {
    if (!reminderId || !role) return;
    try {
      await updateDoc(doc(db, 'refill_reminders', reminderId), {
        [`notified.${role}`]:   true,
        [`notifiedAt.${role}`]: Timestamp.now(),
      });
    } catch (err) {
      console.error(`[useRefillReminders:${role}] Failed to dismiss ${reminderId}:`, err);
    }
  }, [role]);

  return { pendingReminders, dismissReminder, loading };
}

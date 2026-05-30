import { useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase'; // verify path

export function useCalendarSync() {
  const syncEvent = useCallback(async (eventData) => {
    try {
      if (!auth.currentUser) return null;
      const eventsRef = collection(db, 'calendar_events');
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        ownerIds: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error syncing event to calendar:', error);
      return null;
    }
  }, []);

  return { syncEvent };
}

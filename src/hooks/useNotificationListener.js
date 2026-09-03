import { useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, writeBatch, or } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNotificationStore } from '../stores/notificationStore';

export function useNotificationListener() {
  const { user } = useAuth();
  const { setNotifications, clearNotifications } = useNotificationStore();

  useEffect(() => {
    if (!user) {
      clearNotifications();
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      or(
        where('userId', '==', user.uid),
        where('targetRoles', 'array-contains', user.role || 'unknown')
      ),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      let unread = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notifs.push({ id: docSnap.id, ...data });
        if (!data.read) unread++;
      });
      setNotifications(notifs, unread);
    });

    return () => unsubscribe();
  }, [user, setNotifications, clearNotifications]);

  const markAsRead = async (notificationId) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  };

  const markAllAsRead = async () => {
    const notifications = useNotificationStore.getState().notifications;
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        if (!n.read) {
          batch.update(doc(db, 'notifications', n.id), { read: true });
        }
      });
      await batch.commit();
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  return { markAsRead, markAllAsRead };
}

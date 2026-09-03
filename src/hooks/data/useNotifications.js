/**
 * hooks/data/useNotifications.js
 *
 * Repository hook for current user notifications.
 * Encapsulates Firestore real-time listener so NotificationBell remains a pure UI component.
 *
 * @returns {{
 *   notifications: Array,
 *   unreadCount: number,
 *   markAsRead: (id: string) => Promise<void>,
 *   markAllAsRead: () => Promise<void>,
 * }}
 */
'use client';

import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, doc, updateDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const NOTIFICATIONS_COL = 'notifications';
const MAX_NOTIFS = 20;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const q = query(
      collection(db, NOTIFICATIONS_COL),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(MAX_NOTIFS)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    }, (err) => {
      console.error('[useNotifications] listener error:', err);
    });

    return () => {
      unsubscribe();
      setNotifications([]);
      setUnreadCount(0);
    };
  }, [user?.uid]);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, NOTIFICATIONS_COL, id), { read: true });
    } catch (err) {
      console.error('[useNotifications] markAsRead error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications
        .filter(n => !n.read)
        .forEach(n => batch.update(doc(db, NOTIFICATIONS_COL, n.id), { read: true }));
      await batch.commit();
    } catch (err) {
      console.error('[useNotifications] markAllAsRead error:', err);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

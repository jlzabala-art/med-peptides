"use client";

import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import notifier from '../services/NotificationService';

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'BM2vO10FmYl7V1sZ0D3sE697qBwW2m7B3X9pTq6wL9jT2wT8hL9wR4yH5fM1yN3jQ7oP8vX1mG7eK8rL4xN9mU1tV2sF0eZ9uI3r'; // Placeholder, replace with actual

export function usePushNotifications() {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const messaging = getMessagingInstance();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      notifier.info(payload.notification?.title, payload.notification?.body);
    });

    return () => unsubscribe();
  }, []);

  const requestPermission = async () => {
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        const messaging = getMessagingInstance();
        if (messaging) {
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (currentToken) {
            setToken(currentToken);
            if (user) {
              await updateDoc(doc(db, 'users', user.uid), {
                fcmToken: currentToken
              });
            }
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  return { token, permission, requestPermission };
}

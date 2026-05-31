import { useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, runTransaction, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to track how much time a user spends actively connected to the application.
 * It sends a 'heartbeat' ping every 60 seconds if the browser tab is visible.
 */
export default function useSessionTracking() {
  const { user } = useAuth();
  const pingIntervalRef = useRef(null);

  useEffect(() => {
    // If no user is logged in, clean up and exit
    if (!user || !user.uid) {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      return;
    }

    const sendPing = async () => {
      // Only ping if the document is visible (user is actively looking at the tab)
      if (document.visibilityState !== 'visible') {
        return;
      }

      try {
        const sessionRef = doc(db, 'user_sessions', user.uid);
        
        await setDoc(sessionRef, {
          total_seconds: increment(60),
          last_ping: serverTimestamp(),
          role: user.role || 'user',
          displayName: user.displayName || user.email || 'Unknown',
          email: user.email || ''
        }, { merge: true });

        // Console log for debugging, can be removed in production
        // console.log('[Session Tracking] Ping sent.');
      } catch (err) {
        console.error('[Session Tracking] Failed to send ping:', err);
      }
    };

    // Send an immediate ping on mount
    sendPing();

    // Schedule pings every 60 seconds
    pingIntervalRef.current = setInterval(sendPing, 60000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [user]); // Re-run if user changes (e.g. login/logout)
}

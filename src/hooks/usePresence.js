import { useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp, onDisconnect } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export function usePresence() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const userPresenceRef = doc(db, 'presence', user.uid);

    const updatePresence = async (isOnline) => {
      try {
        await setDoc(userPresenceRef, {
          userId: user.uid,
          email: user.email,
          role: user.role || 'user',
          isOnline: isOnline,
          lastActiveAt: serverTimestamp(),
          currentPath: location.pathname
        }, { merge: true });
      } catch (e) {
        console.error("Error updating presence:", e);
      }
    };

    // Mark online on mount/route change
    updatePresence(true);

    // Ping every 2 minutes
    const interval = setInterval(() => {
      updatePresence(true);
    }, 120000);

    // Handle visibility change (tab backgrounding)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // We could mark them away, but let's just update last active
        updatePresence(true); 
      }
    };

    // Handle unload (closing tab)
    const handleBeforeUnload = () => {
      // Beacon is better for unload but setDoc might work if fast enough
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Mark offline on unmount (e.g. logout)
      updatePresence(false);
    };
  }, [user, location.pathname]);
}

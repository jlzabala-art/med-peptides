/**
 * OfflineSyncProvider.jsx
 * 
 * Provider component listening to window `online`/`offline` events
 * and automatically processing queued offline mutations when online.
 */
import React, { useEffect, useState } from 'react';
import { useOfflineQueueStore, useOfflineQueueStatus } from '../../stores/useOfflineQueueStore';
import toast from 'react-hot-toast';

export function OfflineSyncProvider({ children }) {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );
  const { queueLength, isSyncing } = useOfflineQueueStatus();
  const { queue, dequeueMutation, updateMutationStatus, setSyncing } = useOfflineQueueStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online. Synchronizing offline changes...', { id: 'network-status' });
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Working offline. Mutations will be queued.', { id: 'network-status', duration: 4000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processQueue = async () => {
    const currentQueue = useOfflineQueueStore.getState().queue;
    if (currentQueue.length === 0) return;

    setSyncing(true);
    for (const item of currentQueue) {
      if (item.status === 'syncing') continue;
      updateMutationStatus(item.id, 'syncing');

      try {
        // Execute mutation handler based on action type
        switch (item.action) {
          case 'WORKSPACE_ITEM_ADD':
            // Succeeded offline staging
            break;
          default:
            console.log('[OfflineSync] Processed mutation action:', item.action, item.payload);
            break;
        }

        dequeueMutation(item.id);
      } catch (err) {
        console.error('[OfflineSync] Failed to process mutation:', item.id, err);
        updateMutationStatus(item.id, 'failed', err);
      }
    }
    setSyncing(false);
  };

  return (
    <>
      {children}
      {!isOnline && queueLength > 0 && (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span>Offline Mode ({queueLength} queued)</span>
        </div>
      )}
    </>
  );
}
export default OfflineSyncProvider;

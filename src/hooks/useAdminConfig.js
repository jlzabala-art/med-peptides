 
/**
 * useAdminConfig
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads global administrative settings from Firestore: config/admin.
 *
 * Shape in Firestore:
 *   config/admin {
 *     isGlobalRegistrationClosed: boolean,
 *     updatedAt: serverTimestamp
 *   }
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_CONFIG = {
  isGlobalRegistrationClosed: false
};

export function useAdminConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = doc(db, 'config', 'admin');

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setConfig(snap.data());
        } else {
          // First run — seed the document
          setDoc(ref, { ...DEFAULT_CONFIG, updatedAt: serverTimestamp() }).catch(console.error);
          setConfig(DEFAULT_CONFIG);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useAdminConfig] Firestore error:', err);
        setError(err);
        setLoading(false);
        setConfig(DEFAULT_CONFIG);
      }
    );

    return unsub;
  }, []);

  const updateAdminConfig = async (newFields) => {
    const ref = doc(db, 'config', 'admin');
    await updateDoc(ref, { ...newFields, updatedAt: serverTimestamp() });
  };

  return { config, loading, error, updateAdminConfig };
}

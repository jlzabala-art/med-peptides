/**
 * usePatientAIProfile.js
 *
 * Reads the AI-generated interest profile from Firestore and returns
 * ranked compound interests, inferred goals, and loading state.
 *
 * Firestore path: users/{uid}/ai_profile/interests
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * @param {string|null} uid  Firebase auth UID
 * @returns {{
 *   interests: Array<{name,slug,category,emoji,score,lastMentioned}>,
 *   topGoals:  string[],
 *   loading:   boolean,
 *   hasProfile: boolean
 * }}
 */
export function usePatientAIProfile(uid) {
  const [interests, setInterests] = useState([]);
  const [topGoals, setTopGoals]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const ref = doc(db, 'users', uid, 'ai_profile', 'interests');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setInterests(data.interests || []);
        setTopGoals(data.topGoals   || []);
      } else {
        setInterests([]);
        setTopGoals([]);
      }
      setLoading(false);
    }, () => {
      // Permission error or offline — degrade gracefully
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return {
    interests,
    topGoals,
    loading,
    hasProfile: interests.length > 0,
  };
}

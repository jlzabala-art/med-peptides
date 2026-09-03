import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export function useFirestoreDocument(collectionName, documentId, options = {}) {
  const { realtime = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, collectionName, documentId);

    if (realtime) {
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData({ id: snapshot.id, ...snapshot.data() });
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error(`[useFirestoreDocument] Error listening to ${collectionName}/${documentId}:`, err);
          setError(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      getDoc(docRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setData({ id: snapshot.id, ...snapshot.data() });
          } else {
            setData(null);
          }
        })
        .catch((err) => {
          console.error(`[useFirestoreDocument] Error fetching ${collectionName}/${documentId}:`, err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [collectionName, documentId, realtime]);

  return { data, loading, error };
}

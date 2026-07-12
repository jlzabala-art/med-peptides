import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

export function useProtocolBySlug(slug) {
  const [protocol, setProtocol] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProtocol() {
      if (!slug) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const targetSlug = slug.toLowerCase().trim();

        // 1. Try exact doc ID match
        let docRef = doc(db, 'protocols', targetSlug);
        let docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProtocol({ protocol_id: docSnap.id, id: docSnap.id, ...docSnap.data() });
          return;
        }

        // 2. Try 'slug' field match (or objective ID match for protocols)
        const q1 = query(collection(db, 'protocols'), where('slug', '==', targetSlug));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          setProtocol({ protocol_id: snap1.docs[0].id, id: snap1.docs[0].id, ...snap1.docs[0].data() });
          return;
        }

        setProtocol(null);
        setError(new Error('Protocol not found'));

      } catch (err) {
        console.error('Error fetching protocol by slug:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProtocol();
  }, [slug]);

  return { protocol, isLoading, error };
}

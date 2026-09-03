import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * usePatientBiomarkers
 * Subscribes in real-time to `patients/{patientId}/biomarkers`
 * Returns sorted biomarker entries grouped by marker name for charting.
 */
export function usePatientBiomarkers(patientId, limitCount = 50) {
  const [biomarkers, setBiomarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', patientId, 'biomarkers'),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBiomarkers(docs);
      setLoading(false);
    }, (err) => {
      console.error('[usePatientBiomarkers]', err);
      setLoading(false);
    });

    return () => unsub();
  }, [patientId, limitCount]);

  // Group by marker name for easy chart rendering
  const byMarker = biomarkers.reduce((acc, entry) => {
    const key = entry.marker; // e.g. 'testosterone', 'hba1c', 'igf1'
    if (!acc[key]) acc[key] = [];
    const dateObj = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
    acc[key].push({ date: dateObj, value: entry.value, unit: entry.unit });
    return acc;
  }, {});

  // Sort each series chronologically
  Object.keys(byMarker).forEach(k => {
    byMarker[k].sort((a, b) => a.date - b.date);
  });

  return { biomarkers, byMarker, loading };
}

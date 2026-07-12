import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, startAfter } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

/**
 * Hook estandarizado para obtener pacientes.
 * Implementa la Golden Rule de paginación o límite estricto.
 *
 * @param {Object} filters - Filtros de la consulta (ej. { doctorId: '123' })
 * @param {Object} options - Opciones de configuración
 * @param {number} options.pageSize - Límite de documentos por página (default: 50)
 * @param {boolean} options.realtime - Si es true, usa onSnapshot; si es false, usa getDocs (default: true)
 * @param {boolean} options.orderByDesc - Ordenar por createdAt desc (default: true)
 */
export default function usePatients(filters = {}, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const pageSize = options.pageSize || 50;
  const realtime = options.realtime !== undefined ? options.realtime : true;
  const orderByDesc = options.orderByDesc !== undefined ? options.orderByDesc : true;

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    setLoading(true);
    let unsub = () => {};

    try {
      const colRef = collection(db, 'users');
      const constraints = [];
      
      // Filter out only patient role
      constraints.push(where('role', '==', 'patient'));

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          constraints.push(where(key, '==', value));
        }
      });

      if (orderByDesc) {
        constraints.push(orderBy('createdAt', 'desc'));
      }
      
      constraints.push(limit(pageSize));

      const q = query(colRef, ...constraints);

      if (realtime) {
        unsub = onSnapshot(
          q,
          (snap) => {
            const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setData(results);
            setLastDoc(snap.docs[snap.docs.length - 1]);
            setHasMore(snap.docs.length === pageSize);
            setLoading(false);
          },
          (err) => {
            console.error('Error in usePatients:', err);
            setError(err);
            setLoading(false);
          }
        );
      } else {
        getDocs(q).then((snap) => {
          const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setData(results);
          setLastDoc(snap.docs[snap.docs.length - 1]);
          setHasMore(snap.docs.length === pageSize);
          setLoading(false);
        }).catch((err) => {
          console.error('Error in usePatients (getDocs):', err);
          setError(err);
          setLoading(false);
        });
      }
    } catch (err) {
      console.error('Error building query in usePatients:', err);
      setError(err);
      setLoading(false);
    }

    return () => unsub();
  }, [filterKey, pageSize, realtime, orderByDesc]);

  const loadMore = async () => {
    if (!hasMore || !lastDoc || loading) return;
    setLoading(true);

    try {
      const colRef = collection(db, 'users');
      const constraints = [];

      constraints.push(where('role', '==', 'patient'));

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          constraints.push(where(key, '==', value));
        }
      });

      if (orderByDesc) {
        constraints.push(orderBy('createdAt', 'desc'));
      }
      
      constraints.push(startAfter(lastDoc));
      constraints.push(limit(pageSize));

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      
      const newResults = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      setData((prev) => [...prev, ...newResults]);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === pageSize);
    } catch (err) {
      console.error('Error loading more patients:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, loadMore, hasMore };
}

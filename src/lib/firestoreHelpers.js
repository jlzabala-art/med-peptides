import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetch all hormone pellet products from Firestore.
 * Assumes each product document has a `category` field set to "Hormone Pellets".
 */
export async function getHormonePellets() {
  const q = query(
    collection(db, 'products'),
    where('category', '==', 'Hormone Pellets')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch a single hormone pellet (or product) by its document ID from Firestore.
 */
export async function getPelletById(id) {
  if (!id) return null;
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

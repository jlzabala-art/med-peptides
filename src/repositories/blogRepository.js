/**
 * repositories/blogRepository.js
 *
 * Data-access layer for the Firestore `blogPosts` collection.
 * 
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 * Usa siempre las funciones de este módulo.
 */

import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'blogPosts';

/**
 * Obtiene los artículos del blog acotados con límite seguro (Golden Rule #1).
 * @param {number} [limitCount=50]
 * @returns {Promise<object[]>}
 */
export async function getAllBlogPosts(limitCount = 50) {
  const q = query(collection(db, COLLECTION), limit(limitCount));
  const snapshot = await getDocs(q);
  const fetchedPosts = [];
  snapshot.forEach(doc => {
    fetchedPosts.push({ slug: doc.id, ...doc.data() });
  });
  return fetchedPosts;
}

const blogRepository = {
  getAllBlogPosts,
};

export default blogRepository;

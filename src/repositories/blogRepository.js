/**
 * repositories/blogRepository.js
 *
 * Data-access layer for the Firestore `blogPosts` collection.
 * 
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 * Usa siempre las funciones de este módulo.
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'blogPosts';

/**
 * Obtiene todos los artículos del blog.
 * @returns {Promise<object[]>}
 */
export async function getAllBlogPosts() {
  const q = collection(db, COLLECTION);
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

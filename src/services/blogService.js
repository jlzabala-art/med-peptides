 
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import * as fb from '../firebase';
const db = fb?.db;
import logger from '../utils/logger.js';

/**
 * Add a blog post to Firestore `blogPosts` collection.
 * @param {object} post - Blog post object adhering to the shape used in blogData.js
 */
export const addBlogPost = async (post) => {
  try {
    const docRef = await addDoc(collection(db, 'blogPosts'), post);
    logger.info('[blogService] Blog post added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error('[blogService] Error adding blog post:', error);
    throw error;
  }
};

/**
 * Retrieve blog posts from Firestore with safe limit.
 * @param {number} [limitCount=50]
 */
export const getBlogPosts = async (limitCount = 50) => {
  const q = query(collection(db, 'blogPosts'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

 
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Add a blog post to Firestore `blogPosts` collection.
 * @param {object} post - Blog post object adhering to the shape used in blogData.js
 */
export const addBlogPost = async (post) => {
  try {
    const docRef = await addDoc(collection(db, 'blogPosts'), post);
    console.log('Blog post added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding blog post:', error);
    throw error;
  }
};

/**
 * Retrieve all blog posts from Firestore.
 */
export const getBlogPosts = async () => {
  const snapshot = await db.collection('blogPosts').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

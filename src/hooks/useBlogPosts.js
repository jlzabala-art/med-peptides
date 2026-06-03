import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import localBlogPosts from '../data/blogData';

export function useBlogPosts(includeDrafts = false) {
  // Inicializamos con localBlogPosts para que el usuario no vea un salto o pantalla en blanco (FCP)
  const [posts, setPosts] = useState(localBlogPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = collection(db, 'blogPosts');
        const snapshot = await getDocs(q);
        
        const fetchedPosts = [];
        snapshot.forEach(doc => {
          fetchedPosts.push({ slug: doc.id, ...doc.data() });
        });
        
        // Filtrar borradores si includeDrafts es false
        const filtered = includeDrafts 
          ? fetchedPosts 
          : fetchedPosts.filter(p => p.status !== 'draft');
        
        // Ordenar por fecha de publicación descendente
        filtered.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        if (filtered.length > 0) {
          setPosts(filtered);
        }
      } catch (err) {
        console.error("Error fetching blog posts from Firestore:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPosts();
  }, [includeDrafts]);

  return { posts, loading, error };
}

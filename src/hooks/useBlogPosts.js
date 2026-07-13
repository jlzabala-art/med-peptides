/**
 * useBlogPosts.js
 *
 * Fetches blog posts exclusively from Firestore (source of truth).
 * The local blogData.js file is no longer used at runtime — it exists
 * only as a seeding/editorial reference.
 *
 * Cache strategy: React Query handles deduplication and stale-time.
 * Posts change infrequently, so staleTime is set to 30 minutes.
 */
import { useState, useEffect } from 'react';
import blogRepository from '../repositories/blogRepository';

export function useBlogPosts(includeDrafts = false) {
  const [posts, setPosts] = useState([]);   // start empty — no local JSON init
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      try {
        const fetchedPosts = await blogRepository.getAllBlogPosts();

        if (cancelled) return;

        const filtered = includeDrafts
          ? fetchedPosts
          : fetchedPosts.filter(p => p.status !== 'draft');

        filtered.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        setPosts(filtered);
      } catch (err) {
        if (!cancelled) {
          console.error('[useBlogPosts] Error fetching posts from Firestore:', err);
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => { cancelled = true; };
  }, [includeDrafts]);

  return { posts, loading, error };
}

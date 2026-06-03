 
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '../hooks/useBlogPosts';
import BlogCard from '../components/blog/BlogCard';
import { ArrowRight, BookOpen } from 'lucide-react';
import './LatestArticles.css';

export default function LatestArticles() {
  const { posts: blogPosts } = useBlogPosts();

  const latestPosts = useMemo(() => {
    return [...blogPosts]
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, 2);
  }, [blogPosts]);

  if (latestPosts.length === 0) return null;

  return (
    <div className="latest-articles-section">
      <div className="latest-articles__header">
        <div className="latest-articles__eyebrow-wrapper">
          <span className="latest-articles__eyebrow">
            <BookOpen size={13} aria-hidden="true" />
            Academy Insights
          </span>
        </div>
        <h2 className="latest-articles__title">Latest Research & Insights</h2>
        <p className="latest-articles__subtitle">
          Explore peer-reviewed scientific articles, physiological mechanisms, and clinical insights from our research team.
        </p>
      </div>

      <div className="latest-articles__grid">
        {latestPosts.map((post) => (
          <div key={post.slug} className="latest-articles__card-wrapper">
            <BlogCard post={post} />
          </div>
        ))}
      </div>

      <div className="latest-articles__actions">
        <Link to="/blog" className="latest-articles__cta-btn">
          Explore All Articles
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

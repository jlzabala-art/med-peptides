import Link from 'next/link';
 
import React from 'react';
import './BlogCard.css';
import warmBlogImg from '../../assets/images/warm_blog_image.png';

/**
 * BlogCard – a premium, modern card modeled after the clarity and elegance of EternaDX.
 * Displays a top image with category overlay, reading time metadata, corporate accents,
 * and a cohesive clinical design.
 */
export default function BlogCard({ post }) {
  const { 
    slug, 
    title, 
    excerpt, 
    category, 
    publishDate, 
    readTime, 
    heroImageUrl, 
    imageTitle, 
    imageAlt 
  } = post;

  const formattedDate = publishDate 
    ? new Date(publishDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'May 20, 2026';

  return (
    <Link href={`/blog/${slug}`} className="blog-card-link" aria-label={`Read blog post: ${title}`}>
      <article className="blog-card">
        <div className="blog-card__image-wrapper">
          <img 
            src={heroImageUrl || warmBlogImg} 
            alt={imageAlt || title} 
            title={imageTitle || title}
            className="blog-card__image" 
            loading="lazy"
          />
          {category && <span className="blog-card__category">{category}</span>}
          <div className="blog-card__image-overlay" />
        </div>
        
        <div className="blog-card__content">
          <div className="blog-card__metadata">
            <span className="blog-card__meta-item">
              <i className="bi bi-calendar3"></i>
              <span>{formattedDate}</span>
            </span>
            <span className="blog-card__meta-separator">•</span>
            <span className="blog-card__meta-item">
              <i className="bi bi-clock"></i>
              <span>{readTime || 7} min read</span>
            </span>
          </div>
          
          <h2 className="blog-card__title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 'clamp(1rem, 2vw, 1.15rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.4rem' }}>
            {title}
          </h2>
          <p className="blog-card__excerpt" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem' }}>
            {excerpt}
          </p>
          
          <div className="blog-card__footer" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              {formattedDate} · {readTime || 6} min read
            </span>
            <span className="blog-card__cta" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary, #003666)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Read article</span>
              <i className="bi bi-arrow-right"></i>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}


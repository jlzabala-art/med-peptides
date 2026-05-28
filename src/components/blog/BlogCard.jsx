 
import React from 'react';
import { Link } from 'react-router-dom';
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
    <Link to={`/blog/${slug}`} className="blog-card-link" aria-label={`Read blog post: ${title}`}>
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
          
          <h2 className="blog-card__title">{title}</h2>
          <p className="blog-card__excerpt">{excerpt}</p>
          
          <div className="blog-card__footer">
            <div className="blog-card__author">
              <div className="blog-card__avatar">MP</div>
              <span className="blog-card__author-name">Med-Peptides Team</span>
            </div>
            <span className="blog-card__cta">
              <span>Read article</span>
              <i className="bi bi-arrow-right"></i>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}


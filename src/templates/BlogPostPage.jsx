/* eslint-disable no-unused-vars */
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { trackBlogView } from '../utils/analytics';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Share2, 
  Sparkles, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  Check,
  Copy,
  X as XIcon,
  Link as LinkIcon,
  Plus,
  ShoppingCart
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import blogPosts from '../data/blogData';
import { products } from '../data/products';
import { supplements } from '../data/supplements';
import { PROTOCOL_BLUEPRINTS } from '../data/protocolBlueprints';
import '../styles/blog.css';

// TipTool component: shows tooltip for complex words and opens ClinicAI on click
const TipTool = ({ word }) => {
  const handleClick = () => {
    // Dispatch the same event used for the "Ask ClinicAI" button with the word as query
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: word, autoSend: true },
      })
    );
  };
  return (
    <span
      style={{
        textDecoration: 'underline dotted',
        cursor: 'pointer',
        color: 'var(--primary)',
      }}
      title="Click for AI explanation"
      onClick={handleClick}
    >
      {word}
    </span>
  );
};

// Helper to render paragraph content with TipTools for complicated words
const renderParagraph = (text, complicatedWords = []) => {
  if (!text) return null;
  // Split preserving spaces
  const words = text.split(/(\s+)/);
  return words.map((w, i) => {
    const clean = w.trim();
    const isComplicated = (complicatedWords && complicatedWords.includes(clean)) || clean.length > 12;
    if (isComplicated && clean) {
      return <TipTool key={i} word={clean} />;
    }
    return w;
  });
};

// InteractiveResourceCard component: renders a detailed card for products, supplements or protocols
const InteractiveResourceCard = ({ link, accentColor, bgColor }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  // Extract slug from URL
  const slug = link.url ? link.url.split('/').pop() : '';
  const isProduct = link.url?.startsWith('/product');
  const isSupplement = link.url?.startsWith('/supplement') || link.url?.includes('supplement');
  const isProtocol = link.url?.startsWith('/protocol');

  // Lookup data
  let item = null;
  let priceStr = '';
  let detailStr = '';
  let categoryLabel = '';

  if (isProduct) {
    item = products.find(p => p.slug === slug);
    if (item) {
      categoryLabel = item.category;
      detailStr = `${item.dosage} • ${item.quantity}`;
      const kitPrice = item.variants?.[0]?.pricing?.retail?.kit;
      const unitPrice = item.variants?.[0]?.pricing?.retail?.perUnit;
      const billingUnit = item.variants?.[0]?.pricing?.retail?.kitBillingUnit || 'kit';
      priceStr = kitPrice ? `$${kitPrice}/${billingUnit}` : unitPrice ? `$${unitPrice}/vial` : '';
    }
  } else if (isSupplement) {
    item = supplements.find(s => s.slug === slug);
    if (item) {
      categoryLabel = item.category;
      detailStr = `${item.dosage} • ${item.quantity}`;
      const price = item.pricing?.retail?.perUnit;
      priceStr = price ? `$${price}` : '';
    }
  } else if (isProtocol) {
    // Look up protocol title and details from PROTOCOL_BLUEPRINTS
    const key = Object.keys(PROTOCOL_BLUEPRINTS).find(
      k => k.toLowerCase() === slug.replace(/[^a-zA-Z]/g, '').toLowerCase() || 
           PROTOCOL_BLUEPRINTS[k].title.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase())
    );
    if (key) {
      item = PROTOCOL_BLUEPRINTS[key];
      categoryLabel = 'Clinical Protocol';
      detailStr = item.summary?.duration || 'Multi-phase';
      priceStr = item.expectedResults?.weightLoss || item.expectedResults?.metric || '';
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item) return;

    const target = {
      ...item,
      productType: isProduct ? 'peptide' : 'supplement',
      selectedVariant: item.variants?.[0] || { variantId: item.slug + '-default', label: item.dosage, pricing: item.pricing },
      selectedQuantity: 1
    };

    window.dispatchEvent(
      new CustomEvent('add-to-cart-direct', {
        detail: { product: target, delta: 1 },
      })
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!item) {
    // Fallback to simple link card if data not found
    return (
      <Link
        to={link.url}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: bgColor,
          border: `1px solid ${accentColor}22`,
          borderRadius: '10px',
          textDecoration: 'none',
          color: 'var(--text-main)',
          transition: 'all 0.18s ease'
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.transform = 'translateX(3px)'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = `${accentColor}22`; e.currentTarget.style.transform = 'none'; }}
      >
        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-main)' }}>{link.label}</span>
        <ChevronRight size={15} style={{ color: accentColor, flexShrink: 0 }} />
      </Link>
    );
  }

  return (
    <div
      style={{
        borderRadius: '14px',
        border: '1px solid var(--border)',
        background: 'var(--color-bg-surface)',
        padding: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            color: accentColor,
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '0.15rem'
          }}>
            {categoryLabel}
          </span>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '750',
            color: 'var(--text-main)',
            margin: 0,
            lineHeight: '1.25'
          }}>
            <Link to={link.url} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.color = accentColor} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
              {isProtocol ? item.title : item.name}
            </Link>
          </h4>
        </div>
        {item.image && !isProtocol && (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0, borderRadius: '6px', background: 'var(--background)', padding: '2px', border: '1px solid var(--border)' }}
          />
        )}
      </div>

      <p style={{
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        margin: 0,
        lineHeight: '1.35',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {isProtocol ? item.summary?.goal : item.desc}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '0.15rem',
        borderTop: '1px solid var(--border)',
        paddingTop: '0.6rem',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {detailStr && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              {detailStr}
            </span>
          )}
          {priceStr && (
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', marginTop: '1px' }}>
              {priceStr}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {!isProtocol ? (
            <button
              onClick={handleAddToCart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem 0.7rem',
                borderRadius: '6px',
                border: 'none',
                background: added ? 'var(--color-success)' : 'var(--primary)',
                color: 'var(--color-bg-surface)',
                fontWeight: '700',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                gap: '3px',
                boxShadow: '0 2px 5px rgba(0,54,102,0.1)'
              }}
            >
              {added ? (
                <>
                  <Check size={11} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus size={11} />
                  <span>Order</span>
                </>
              )}
            </button>
          ) : null}

          <Link
            to={link.url}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--text-main)',
              transition: 'all 0.15s',
              height: '28px',
              width: '28px'
            }}
            title={isProtocol ? "View Protocol Blueprint" : "Read Monograph"}
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Find current post
  const post = useMemo(() => {
    return blogPosts.find(p => p.slug === slug);
  }, [slug]);
useEffect(() => {
  if (slug) {
    trackBlogView(slug);
  }
}, [slug]);

  // Find related posts from slugs
  const relatedPosts = useMemo(() => {
    if (!post || !post.relatedPosts) return [];
    return blogPosts.filter(p => post.relatedPosts.includes(p.slug));
  }, [post]);

  // Handle page meta & structured data for SEO
  usePageMeta(
    post
      ? {
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          image: post.heroImageUrl,
          structuredData: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.heroImageUrl,
            "datePublished": post.publishDate,
            "author": {
              "@type": "Person",
              "name": post.author || "Med-Peptides Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Med-Peptides",
              "logo": {
                "@type": "ImageObject",
                "url": "https://Med-Peptides.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://Med-Peptides.com/blog/${post.slug}`
            }
          }
        }
      : {
          title: 'Article Not Found',
          description: 'The requested research article could not be found.',
          path: '/blog'
        }
  );

  const [shareToast, setShareToast] = useState(null); // null | 'copied' | 'shared'
  const [showSharePanel, setShowSharePanel] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = encodeURIComponent(post?.title || 'Article');
  const shareText = encodeURIComponent(post?.excerpt || 'Check out this scientific article.');
  const shareUrl = encodeURIComponent(currentUrl);

  const showToast = (type) => {
    setShareToast(type);
    setTimeout(() => setShareToast(null), 2800);
  };

  // Main button: native sheet on mobile, panel on desktop
  const handleShare = useCallback(async () => {
    const shareData = {
      title: post?.title || 'Article',
      text: post?.excerpt || 'Check out this scientific article.',
      url: currentUrl,
    };
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('shared');
      } catch (err) {
        if (err.name !== 'AbortError') setShowSharePanel(true);
      }
    } else {
      // Desktop — open the share panel
      setShowSharePanel(prev => !prev);
    }
  }, [post, currentUrl]);

  const copyLink = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => { showToast('copied'); setShowSharePanel(false); })
        .catch(() => showToast('error'));
    } else {
      const el = document.createElement('textarea');
      el.value = currentUrl;
      el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast('copied');
      setShowSharePanel(false);
    }
  }, [currentUrl]);

  const shareToWhatsApp = () => { window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`, '_blank', 'noopener'); setShowSharePanel(false); };
  const shareToTwitter  = () => { window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank', 'noopener'); setShowSharePanel(false); };
  const shareToLinkedIn = () => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'noopener'); setShowSharePanel(false); };

  // Reusable style for share panel channel buttons
  const shareBtnStyle = (accentColor) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    width: '100%',
    padding: '0.6rem 0.875rem',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: accentColor,
    transition: 'background 0.15s ease, border-color 0.15s ease',
    textAlign: 'left'
  });

  if (!post) {
    return (
      <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Article Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The longevity research paper you are looking for does not exist or has been moved.</p>
          <button 
            onClick={() => navigate('/blog')}
            className="tag-pill" 
            style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '1rem', border: '1px solid var(--primary)' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Research Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Dynamic Header / Hero Area */}
      <section 
        className="blog-hero" 
        style={{ 
          background: post.heroGradient || 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '6rem 0 5rem 0',
          color: 'var(--color-bg-surface)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Dark overlay to guarantee white text contrast regardless of heroGradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        {/* Radial light accent */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          <Link 
            to="/blog" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              color: 'rgba(255,255,255,0.85)', 
              textDecoration: 'none',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-bg-surface)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Research Database
          </Link>

          <span 
            style={{ 
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}
          >
            {post.category}
          </span>

          <h1 
            style={{ 
              fontSize: 'clamp(1.75rem, 4vw, 3.25rem)', 
              fontWeight: '800', 
              lineHeight: '1.18', 
              marginBottom: '1.25rem',
              maxWidth: '860px',
              color: 'var(--color-bg-surface)',
              textShadow: '0 2px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.5)',
              letterSpacing: '-0.01em'
            }}
          >
            {post.title}
          </h1>

          <p 
            style={{ 
              fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', 
              lineHeight: '1.6', 
              color: 'rgba(255,255,255,0.9)', 
              maxWidth: '750px',
              marginBottom: '2rem'
            }}
          >
            {post.excerpt}
          </p>

          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1.5rem', 
              fontSize: '0.875rem', 
              color: 'rgba(255,255,255,0.8)',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '1.5rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} />
              {new Date(post.publishDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} />
              {post.readTime} min read
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} />
              By {post.author}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="page-container" style={{ marginTop: '3.5rem', marginBottom: '6rem' }}>
        <div className="grid-2-sidebar">
          
          {/* Article Body */}
          <article style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
            
            {/* Featured Image with SEO metadata title & alt */}
            {post.heroImageUrl && (
              <div className="blog-post__featured-image-wrapper" style={{
                width: '100%',
                maxHeight: '440px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '2.5rem',
                boxShadow: '0 12px 30px rgba(0, 54, 102, 0.06)',
                border: '1px solid rgba(0, 54, 102, 0.08)'
              }}>
                <img 
                  src={post.heroImageUrl} 
                  alt={post.imageAlt || post.title} 
                  title={post.imageTitle || post.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '440px',
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                  loading="eager"
                />
              </div>
            )}

            {post.body.map((section, idx) => {
              switch (section.type) {
                case 'heading':
                  const TagHeading = `h${section.level || 2}`;
                  return (
                    <TagHeading 
                      key={idx} 
                      style={{ 
                        color: 'var(--primary)', 
                        marginTop: '2.5rem', 
                        marginBottom: '1rem',
                        fontWeight: '700',
                        fontSize: section.level === 3 ? '1.5rem' : '1.85rem'
                      }}
                    >
                      {section.content}
                    </TagHeading>
                  );
                case 'paragraph':
                  return (
                    <p key={idx} style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                      {renderParagraph(section.content, post?.complicatedWords)}
                    </p>
                  );
                case 'list':
                  const ListTag = section.ordered ? 'ol' : 'ul';
                  return (
                    <ListTag key={idx} style={{ paddingLeft: '2rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                      {section.items.map((item, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                      ))}
                    </ListTag>
                  );
                default:
                  return null;
              }
            })}

            {/* ClinicAI Q&A Interactive Chips */}
            {post.clinicalAIQuestions && post.clinicalAIQuestions.length > 0 && (
              <div 
                className="blog-post__clinical-ai-qa"
                style={{
                  marginTop: '3.5rem',
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(232, 246, 252, 0.4) 0%, rgba(26, 94, 168, 0.04) 100%)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 15px rgba(26, 94, 168, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'var(--color-bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>
                      Ask ClinicAI about this topic
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Click any question below to get an instant clinical synthesis from our AI assistant.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {post.clinicalAIQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('open-clinical-ai', {
                            detail: { query: question, autoSend: true },
                          })
                        );
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        background: 'var(--color-bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        width: '100%',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.01)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-light)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(26, 94, 168, 0.08)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.01)';
                      }}
                    >
                      <span style={{ marginRight: '1rem' }}>{question}</span>
                      <ArrowRight size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Share Bar + Panel ── */}
            <div style={{ marginTop: '4rem', position: 'relative' }}>
              <div
                style={{
                  padding: '1.75rem 2rem',
                  borderRadius: '16px',
                  background: 'rgba(var(--primary-rgb), 0.03)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h4 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem' }}>Found this article useful?</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Share it with colleagues, friends, or your health network.</p>
                </div>
                <button
                  onClick={handleShare}
                  aria-label="Share this article"
                  aria-expanded={showSharePanel}
                  className="share-btn-main"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.65rem 1.3rem',
                    background: shareToast === 'copied' || shareToast === 'shared' ? 'var(--color-success)' : 'var(--primary)',
                    color: 'var(--color-bg-surface)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'background 0.25s ease, transform 0.15s ease',
                    transform: showSharePanel ? 'scale(0.97)' : 'scale(1)',
                    boxShadow: '0 2px 8px rgba(0,54,102,0.15)'
                  }}
                >
                  {shareToast === 'copied' || shareToast === 'shared' ? <Check size={16} /> : <Share2 size={16} />}
                  {shareToast === 'copied' ? 'Link Copied!' : shareToast === 'shared' ? 'Shared!' : 'Share Article'}
                </button>
              </div>

              {/* ── Share Panel Dropdown (desktop / fallback) ── */}
              {showSharePanel && (
                <div
                  role="dialog"
                  aria-label="Share options"
                  className="share-panel-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 'calc(100% + 10px)',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    padding: '1rem',
                    minWidth: '240px',
                    zIndex: 100,
                    animation: 'sharePanel-in 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)' }}>Share via</span>
                    <button
                      onClick={() => setShowSharePanel(false)}
                      aria-label="Close share panel"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* WhatsApp */}
                    <button onClick={shareToWhatsApp} style={shareBtnStyle('#25d366')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </button>
                    {/* X / Twitter */}
                    <button onClick={shareToTwitter} style={shareBtnStyle('#000000')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      X (Twitter)
                    </button>
                    {/* LinkedIn */}
                    <button onClick={shareToLinkedIn} style={shareBtnStyle('#0077b5')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </button>
                    {/* Copy Link */}
                    <button onClick={copyLink} style={shareBtnStyle('var(--primary)')}>
                      <LinkIcon size={18} />
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              {/* ── Close panel on outside click ── */}
              {showSharePanel && (
                <div
                  onClick={() => setShowSharePanel(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* ── Toast notification ── */}
            {shareToast && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: shareToast === 'copied' || shareToast === 'shared' ? 'var(--color-success)' : 'var(--color-danger)',
                  color: 'var(--color-bg-surface)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '999px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  zIndex: 9999,
                  animation: 'toastIn 0.3s ease'
                }}
              >
                <Check size={16} />
                {shareToast === 'copied' ? 'Link copied to clipboard' : 'Article shared!'}
              </div>
            )}
          </article>


          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Interactive ClinicAI Integration Widget */}
            <div 
              className="card" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(0, 54, 102, 0.03) 0%, rgba(0, 150, 204, 0.03) 100%)', 
                borderColor: 'rgba(0, 54, 102, 0.12)', 
                borderRadius: '16px',
                padding: '1.75rem',
                borderLeft: '4px solid var(--primary)',
                boxShadow: '0 4px 20px rgba(0, 54, 102, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                <Sparkles size={18} />
                <h4 style={{ fontWeight: '700', margin: 0 }}>Consult ClinicAI</h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Get an AI-powered summary of this article plus personalised recommendations for peptides, protocols and supplements.
              </p>
              <button 
                onClick={() => {
                  // Build a rich context query using the article's aiContent
                  const articleContext = post.aiContent
                    ? `\n\n---\nARTICLE KNOWLEDGE BASE:\n${post.aiContent.slice(0, 2000)}`
                    : '';

                  const relatedLinksContext = post.relatedLinks && post.relatedLinks.length > 0
                    ? `\n\nARTICLE LINKS: ${post.relatedLinks.map(l => `${l.label} (${l.url})`).join(', ')}`
                    : '';

                  const query = `[ARTICLE_ANALYSIS] Please do the following for the article titled "${post.title}":

1. **SUMMARY**: Give a concise 3-sentence summary of the key scientific findings.
2. **RECOMMENDED PEPTIDES**: List 1-3 peptides from our catalog most relevant to this article's topic.
3. **RECOMMENDED PROTOCOLS**: Suggest 1-2 clinical protocols that apply the science discussed.
4. **SUPPLEMENTS**: Mention any relevant supplements that synergize with the article's subject.

Use the article context below to ground your recommendations:${articleContext}${relatedLinksContext}`;

                  window.dispatchEvent(
                    new CustomEvent('open-clinical-ai', {
                      detail: { query, autoSend: true },
                    })
                  );
                }}
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                  color: 'var(--color-bg-surface)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(0, 54, 102, 0.1)'
                }}
              >
                <span>Ask ClinicAI Expert</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Scientific disclaimer widget */}
            <div 
              className="card" 
              style={{ 
                background: 'var(--surface-light)', 
                borderColor: 'var(--border)', 
                borderRadius: '16px',
                padding: '1.5rem',
                borderLeft: '4px solid var(--secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                <Sparkles size={18} style={{ color: 'var(--secondary)' }} />
                <h4 style={{ fontWeight: '700', margin: 0 }}>Research Standards</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                This material is presented for informational and educational purposes only. Med-Peptides supports precision science and peer-reviewed biological pathways.
              </p>
            </div>

            {/* ── Related Resources: Protocols / Peptides / Supplements / Testing ── */}
            {post.relatedLinks && post.relatedLinks.length > 0 && (() => {
              const protocols   = post.relatedLinks.filter(l => l.url?.startsWith('/protocol'));
              const peptides    = post.relatedLinks.filter(l => l.url?.startsWith('/product'));
              const supplements = post.relatedLinks.filter(l => l.url?.startsWith('/supplement') || l.url?.includes('supplement'));
              const testing     = post.relatedLinks.filter(l => l.url?.startsWith('/test') || l.url?.includes('testing') || l.url?.includes('diagnostics'));

              const SidebarSection = ({ title, icon, links, accentColor, bgColor }) => (
                links.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: accentColor, margin: 0 }}>{title}</h3>
                      <span style={{ marginLeft: 'auto', background: bgColor, color: accentColor, fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>{links.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {links.map((link, idx) => (
                        <InteractiveResourceCard
                          key={idx}
                          link={link}
                          accentColor={accentColor}
                          bgColor={bgColor}
                        />
                      ))}
                    </div>
                  </div>
                )
              );
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  <SidebarSection title="Protocols" icon="📋" links={protocols}   accentColor="var(--primary)"       bgColor="rgba(0,54,102,0.04)" />
                  <SidebarSection title="Peptides"  icon="⚗️"  links={peptides}    accentColor="var(--secondary)"     bgColor="rgba(0,150,204,0.04)" />
                  <SidebarSection title="Supplements" icon="💊" links={supplements} accentColor="#7c3aed"              bgColor="rgba(124,58,237,0.04)" />
                  <SidebarSection title="Testing"   icon="🧪"  links={testing}     accentColor="var(--color-success)"              bgColor="rgba(5,150,105,0.04)" />
                </div>
              );
            })()}


            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  Subject Areas
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {post.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="tag-pill" 
                      style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section style={{ marginTop: '5rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '2.5rem', textAlign: 'center' }}>
              Further Research & Reading
            </h2>
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {relatedPosts.map(relPost => (
                <article 
                  key={relPost.slug} 
                  className="card card--hover"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%', 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    padding: 0
                  }}
                >
                  {/* Hero background decoration */}
                  <div 
                    style={{ 
                      height: '8px', 
                      background: relPost.heroGradient || 'linear-gradient(to right, var(--primary), var(--secondary))' 
                    }} 
                  />
                  <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span 
                      style={{ 
                        alignSelf: 'flex-start',
                        fontSize: '0.7rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        color: relPost.accentColor || 'var(--secondary)',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem'
                      }}
                    >
                      {relPost.category}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                      <Link to={`/blog/${relPost.slug}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {relPost.title}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>
                      {relPost.excerpt}
                    </p>
                    <Link 
                      to={`/blog/${relPost.slug}`} 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        color: 'var(--primary)', 
                        textDecoration: 'none', 
                        fontWeight: '600', 
                        fontSize: '0.9rem',
                        marginTop: 'auto'
                      }}
                    >
                      Read full article
                      <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

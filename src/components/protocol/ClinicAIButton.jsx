import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState } from 'react';



import './ClinicAIButton.css';
import BlogCard from '../blog/BlogCard';
import { useBlogPosts } from '../../hooks/useBlogPosts';

/**
 * ClinicAIButton – now displays a modal with a related blog post card
 * Props:
 *   protocol: object containing at least { slug, title }
 *   variant: 'hero' | 'sidebar' (default 'sidebar')
 *   style: optional inline style for the button
 */
export default function ClinicAIButton({ protocol, variant = 'sidebar', style = {} }) {
  const [showModal, setShowModal] = useState(false);
  const [relatedPost, setRelatedPost] = useState(null);
  const { posts: blogPosts } = useBlogPosts();

  const handleOpenClinicAI = () => {
    // Find a blog post that references this protocol via `relatedPosts`
    const match = blogPosts.find(p => p.relatedPosts?.includes(protocol.slug));
    // Fallback to the first post if none match
    setRelatedPost(match || blogPosts[0]);
    setShowModal(true);
    console.log('Opening ClinicAI with Full Canonical Model Context:', protocol);
  };

  const handleClose = () => setShowModal(false);

  // ---------- Render ----------
  if (variant === 'hero') {
    return (
      <button
        onClick={handleOpenClinicAI}
        title="Ask ClinicAI about this protocol"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          color: 'var(--color-bg-surface)',
          fontSize: '0.88rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s/ease',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
          ...style,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.4)';
        }}
      >
        <Sparkles size={18} />
        <span>Ask ClinicAI</span>
      </button>
    );
  }

  return (
    <>
      <button
        className="proto-sidebar-cta proto-sidebar-cta--ai"
        onClick={handleOpenClinicAI}
        title="Ask ClinicAI about this protocol"
        style={style}
      >
        <div className="proto-sidebar-cta__icon">
          <Sparkles size={16} />
        </div>
        <span className="proto-sidebar-cta__text">Ask ClinicAI</span>
        <MessageSquare size={14} className="proto-sidebar-cta__arrow" />
      </button>

      {showModal && relatedPost && (
        <div className="clinic-ai-modal" role="dialog" aria-modal="true">
          <div className="clinic-ai-modal__overlay" onClick={handleClose} />
          <div className="clinic-ai-modal__content">
            <button className="clinic-ai-modal__close" onClick={handleClose} aria-label="Close">
              <X size={20} />
            </button>
            <BlogCard post={relatedPost} />
          </div>
        </div>
      )}
    </>
  );
}


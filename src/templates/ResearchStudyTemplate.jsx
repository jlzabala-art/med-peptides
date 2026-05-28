/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/common/Breadcrumbs';

/**
 * ResearchStudyTemplate — route handler for /research/:slug
 *
 * Placeholder for future research study detail pages.
 * Renders a clean not-found / coming-soon state when no study matches.
 */
export default function ResearchStudyTemplate({
  region,
  isProfessional,
  cart,
  updateCart,
  setRegion,
}) {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Research', path: '/faq' },
    { label: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Study' },
  ];

  return (
    <div
      className="research-study-page"
      style={{ minHeight: '60vh', backgroundColor: 'var(--bg, #020e1c)', color: 'white' }}
    >
      <div
        className="container"
        style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}
      >
        <Breadcrumbs items={breadcrumbItems} />

        <div
          style={{
            marginTop: '3rem',
            textAlign: 'center',
            padding: '4rem 2rem',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1.5rem',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
          <h1
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            {slug
              ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
              : 'Research Study'}
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '1rem',
              maxWidth: '480px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            This research study page is currently being prepared. Check back soon for the full
            clinical data, references, and protocol recommendations.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              ← Go Back
            </button>
            <button
              onClick={() => navigate('/faq')}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--primary, #3b82f6)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              Browse Knowledge Base
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

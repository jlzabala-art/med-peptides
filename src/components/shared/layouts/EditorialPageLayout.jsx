'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';

const VARIANT_MAX_WIDTH = {
  legal: '820px',
  article: '920px',
  faq: '980px',
  landing: '1240px',
};

/**
 * EditorialPageLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout estándar para páginas institucionales, blog, FAQ y documentación legal:
 *  - /about, /company, /compounding, /what-are-peptides
 *  - /blog, /blog/[slug], /faq/[[...topic]]
 *  - /regulatory, /privacy, /terms
 */
export default function EditorialPageLayout({
  variant = 'article', // 'legal' | 'article' | 'faq' | 'landing'
  whiteLabel = false,
  partnerName = '',
  breadcrumbs = [],
  badge = '',
  title = '',
  subtitle = '',
  metaInfo = '', // ej. "Last updated: Nov 2026" o "5 min read"
  heroExtra = null,
  toc = null, // Índice lateral opcional en desktop
  children,
}) {
  const maxWidth = VARIANT_MAX_WIDTH[variant] || '920px';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
      }}
    >
      <PublicUnifiedHeader whiteLabel={whiteLabel} partnerName={partnerName} />

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth,
          margin: '0 auto',
          padding: 'clamp(1.25rem, 3vw, 2.25rem) clamp(1rem, 3vw, 2rem) 4rem',
        }}
      >
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {(title || subtitle || badge) && (
          <header
            style={{
              marginBottom: '1.75rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {badge && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.22rem 0.65rem',
                  borderRadius: '999px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  marginBottom: '0.6rem',
                }}
              >
                {badge}
              </span>
            )}
            {title && (
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.18,
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                style={{
                  margin: '0.6rem 0 0',
                  fontSize: '1.02rem',
                  lineHeight: 1.55,
                  color: '#475569',
                }}
              >
                {subtitle}
              </p>
            )}
            {metaInfo && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>
                {metaInfo}
              </div>
            )}
            {heroExtra}
          </header>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
          <SectionErrorBoundary sectionName={title || 'Editorial Content'}>
            <article
              style={{
                flex: '999 1 560px',
                minWidth: 0,
                background: variant === 'landing' ? 'transparent' : '#ffffff',
                border: variant === 'landing' ? 'none' : '1px solid #e2e8f0',
                borderRadius: variant === 'landing' ? 0 : '16px',
                padding: variant === 'landing' ? 0 : 'clamp(1.25rem, 3vw, 2rem)',
              }}
            >
              {children}
            </article>
          </SectionErrorBoundary>

          {toc && (
            <aside
              style={{
                flex: '1 1 240px',
                position: 'sticky',
                top: '5.5rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
              }}
            >
              {toc}
            </aside>
          )}
        </div>
      </main>

      <PublicUnifiedFooter whiteLabel={whiteLabel} />
    </div>
  );
}

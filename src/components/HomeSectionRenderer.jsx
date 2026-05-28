 
import React, { Suspense, useRef } from 'react';
import { HOME_SECTIONS } from '../config/homeLayoutRegistry';
import SectionErrorBoundary from './SectionErrorBoundary';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import SectionWrapper from './shared/SectionWrapper';

/**
 * Standard Skeleton for Home Sections while they lazy-load
 */
function SectionSkeleton({ minHeight = 420 }) {
  return (
    <div style={{
      minHeight,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '0.75rem', padding: '4rem 1rem',
      background: 'var(--surface)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--primary)', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Loading…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Maps a visibility value to a CSS class name for device targeting.
 *
 *  'all'     → no class  (always visible)
 *  'desktop' → rp-desktop-only  (hidden on mobile)
 *  'mobile'  → rp-mobile-only   (hidden on desktop)
 *
 * The actual media-query rules live in index.css so every section
 * benefits from a single source of truth.
 */
const VISIBILITY_CLASS = {
  desktop: 'rp-desktop-only',
  mobile:  'rp-mobile-only',
};

/**
 * Renders a specific section based on its ID from the master registry.
 */
/**
 * RevealWrapper — thin div that holds the reveal ref + classes.
 * Extracted so the hook can safely call useRef at the top level.
 */
function RevealWrapper({ index, children }) {
  const ref = useRef(null);
  // Hero (index 0) has its own entrance animation — skip the reveal
  const isHero = index === 0;
  useRevealOnScroll(ref, { skip: isHero });

  // Tiny stagger: 40ms per section, capped at 120ms
  const delay = isHero ? 0 : Math.min(index * 40, 120);

  return (
    <div
      ref={ref}
      className={isHero ? undefined : 'section-reveal'}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export default function HomeSectionRenderer({ id, index = 0, visibility = 'all', props }) {
  const sectionConfig = HOME_SECTIONS[id];
  
  if (!sectionConfig) {
    console.warn(`HomeSectionRenderer: Section "${id}" not found in registry.`);
    return null;
  }

  const { component: Component, defaultProps = {}, isLazy } = sectionConfig;

  // Merge defaultProps from registry with runtime props from the parent Home component
  const content = <Component {...defaultProps} {...props} />;

  // Variant detection: sections at even indices get 'light' background for visual rhythm
  const defaultVariant = index === 0 ? 'none' : (index % 2 === 0 ? 'light' : 'default');
  const variant = sectionConfig.variant || defaultVariant;
  const isHero = index === 0;

  const wrappedContent = (
    <SectionWrapper
      id={id}
      variant={variant}
      noPadding={isHero}
      fullWidth={isHero}
      className={sectionConfig.sectionClass || ''}
      withTransition={!!sectionConfig.withTransition}
    >
      {isLazy ? (
        <Suspense fallback={<SectionSkeleton minHeight={420} />}>
          {content}
        </Suspense>
      ) : content}
    </SectionWrapper>
  );

  // Wrap in a container only when a device filter is needed
  const cssClass = VISIBILITY_CLASS[visibility];
  const filtered = cssClass ? <div className={cssClass}>{wrappedContent}</div> : wrappedContent;

  return (
    <SectionErrorBoundary sectionId={id}>
      <RevealWrapper index={index}>
        {filtered}
      </RevealWrapper>
    </SectionErrorBoundary>
  );
}

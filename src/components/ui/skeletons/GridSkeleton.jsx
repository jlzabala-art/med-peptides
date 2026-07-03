import React from 'react';
import Skeleton from '../Skeleton';

/**
 * GridSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a shimmering grid of card skeletons.
 * Used while card/grid data is loading from Firestore.
 *
 * @param {number} cards       — Number of skeleton cards. Default: 6
 * @param {string} cardHeight  — Height of each card. Default: '200px'
 * @param {number} minCardWidth — Min width for auto-fit grid. Default: 300
 *
 * @example
 * {isLoading ? (
 *   <GridSkeleton cards={8} cardHeight="220px" />
 * ) : (
 *   products.map(p => <ProductGridCard key={p.id} product={p} />)
 * )}
 */
export default function GridSkeleton({ cards = 6, cardHeight = '200px', minCardWidth = 300 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
        gap: '1.5rem',
      }}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border, #e2e8f0)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg-app, #fff)',
            height: cardHeight,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Skeleton
              width="36px"
              height="36px"
              style={{ borderRadius: '8px', flexShrink: 0 }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="11px" style={{ opacity: 0.6 }} />
            </div>
            <Skeleton width="20px" height="20px" style={{ borderRadius: '50%' }} />
          </div>

          {/* Card body */}
          <div
            style={{
              padding: '1rem 1.25rem',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Skeleton width="60px" height="22px" style={{ borderRadius: '4px' }} />
              <Skeleton width="50px" height="22px" style={{ borderRadius: '4px' }} />
            </div>
            <Skeleton width="100%" height="12px" />
            <Skeleton width="85%" height="12px" />
            <Skeleton width="70%" height="12px" />
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width="70px" height="24px" style={{ borderRadius: '6px' }} />
              <Skeleton width="70px" height="24px" style={{ borderRadius: '6px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

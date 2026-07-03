import React from 'react';
import Skeleton from '../Skeleton';

/**
 * DataTableSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a shimmering table skeleton that matches the real DataTable structure.
 * Used while data is loading from Firestore.
 *
 * @param {number} rows      — Number of skeleton rows. Default: 8
 * @param {number} columns   — Number of skeleton columns. Default: 5
 * @param {boolean} hasSelect — Show a checkbox column. Default: true
 * @param {boolean} hasExpand — Show an expand chevron column. Default: false
 *
 * @example
 * {isLoading ? (
 *   <DataTableSkeleton rows={10} columns={6} />
 * ) : (
 *   <DataTable data={products} columns={columns} />
 * )}
 */
export default function DataTableSkeleton({
  rows = 8,
  columns = 5,
  hasSelect = true,
  hasExpand = false,
}) {
  return (
    <div
      style={{
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 'var(--radius-md, 8px)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-app, #fff)',
      }}
    >
      {/* Toolbar skeleton */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-surface, #f8fafc)',
        }}
      >
        <Skeleton width="240px" height="34px" style={{ borderRadius: '8px' }} />
        <Skeleton width="120px" height="34px" style={{ borderRadius: '8px' }} />
        <Skeleton width="100px" height="34px" style={{ borderRadius: '8px' }} />
        <div style={{ flex: 1 }} />
        <Skeleton width="80px" height="34px" style={{ borderRadius: '8px' }} />
      </div>

      {/* Header row skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: '40px',
          borderBottom: '2px solid var(--border, #e2e8f0)',
          backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
          gap: '16px',
        }}
      >
        {hasSelect && <Skeleton width="16px" height="16px" style={{ borderRadius: '4px', flexShrink: 0 }} />}
        {hasExpand && <Skeleton width="16px" height="16px" style={{ borderRadius: '50%', flexShrink: 0 }} />}
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === 0 ? '25%' : `${Math.floor(60 / (columns - 1))}%`}
            height="14px"
          />
        ))}
      </div>

      {/* Data rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            height: '64px',
            borderBottom: rowIdx < rows - 1 ? '1px solid var(--border, #e2e8f0)' : 'none',
            gap: '16px',
            animationDelay: `${rowIdx * 0.05}s`,
          }}
        >
          {hasSelect && (
            <Skeleton width="16px" height="16px" style={{ borderRadius: '4px', flexShrink: 0 }} />
          )}
          {hasExpand && (
            <Skeleton width="16px" height="16px" style={{ borderRadius: '50%', flexShrink: 0 }} />
          )}
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              style={{ flex: colIdx === 0 ? 2 : 1, display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <Skeleton
                width={colIdx === 0 ? '70%' : `${50 + Math.random() * 30}%`}
                height="14px"
              />
              {colIdx === 0 && (
                <Skeleton width="40%" height="11px" style={{ opacity: 0.6 }} />
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Footer skeleton */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-surface, #f8fafc)',
        }}
      >
        <Skeleton width="120px" height="14px" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width="32px" height="32px" style={{ borderRadius: '6px' }} />
          <Skeleton width="32px" height="32px" style={{ borderRadius: '6px' }} />
          <Skeleton width="32px" height="32px" style={{ borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );
}

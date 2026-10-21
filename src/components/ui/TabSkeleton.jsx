import React from 'react';
import Skeleton from './Skeleton';
import DataTableSkeleton from './skeletons/DataTableSkeleton';

/**
 * TabSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant unified Page Skeleton.
 * Matches the structural layout of Admin, Doctor, and Wholesaler data tabs:
 * 1. Fixed PageHeader (Title, subtitle, actions)
 * 2. 4-Card KPI metric row
 * 3. Toolbar (Search input, filter chips)
 * 4. DataTable skeleton (columns, rows, pagination)
 * 
 * Prevents Layout Shift (CLS) and screen flickering during page/tab navigation.
 */
export default function TabSkeleton() {
  return (
    <div style={{ padding: '1.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* 1. Page Header Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border, #e2e8f0)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="140px" height="12px" style={{ borderRadius: '4px' }} />
          <Skeleton width="220px" height="28px" style={{ borderRadius: '6px' }} />
          <Skeleton width="340px" height="14px" style={{ borderRadius: '4px', opacity: 0.7 }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Skeleton width="100px" height="36px" style={{ borderRadius: '6px' }} />
          <Skeleton width="120px" height="36px" style={{ borderRadius: '6px' }} />
        </div>
      </div>

      {/* 2. 4-Card KPI Metric Row (Golden Rule #22) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {[0, 1, 2, 3].map((cardIdx) => (
          <div
            key={cardIdx}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--color-bg-app, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Skeleton width="55%" height="13px" style={{ borderRadius: '4px' }} />
              <Skeleton width="24px" height="24px" style={{ borderRadius: '6px' }} />
            </div>
            <Skeleton width="70px" height="26px" style={{ borderRadius: '4px' }} />
            <Skeleton width="45%" height="11px" style={{ borderRadius: '4px', opacity: 0.6 }} />
          </div>
        ))}
      </div>

      {/* 3. DataTable Skeleton (Columns, Shimmer Rows, Pagination) */}
      <DataTableSkeleton rows={7} columns={5} hasSelect={true} hasExpand={false} />
    </div>
  );
}

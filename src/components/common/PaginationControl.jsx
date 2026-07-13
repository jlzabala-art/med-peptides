import React from 'react';
import { ChevronDown } from '@/lib/icons';

export default function PaginationControl({ 
  hitsPerPage, 
  setHitsPerPage, 
  onLoadMore, 
  hasMore, 
  totalHits, 
  loadedHits,
  isLoading
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '2rem 0',
      width: '100%',
      borderTop: '1px solid var(--border)'
    }}>
      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="col-card-btn col-card-btn--ghost"
          style={{ 
            padding: '0.75rem 2rem', 
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontWeight: 600,
            cursor: isLoading ? 'wait' : 'pointer'
          }}
        >
          {isLoading ? 'Loading...' : 'Load More Results'}
        </button>
      )}

      {/* Progress & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {Math.min(loadedHits, totalHits)} of {totalHits} results
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Show per page:</span>
          <div style={{ position: 'relative' }}>
            <select
              value={hitsPerPage}
              onChange={(e) => setHitsPerPage(Number(e.target.value))}
              style={{
                appearance: 'none',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem 2rem 0.4rem 0.8rem',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

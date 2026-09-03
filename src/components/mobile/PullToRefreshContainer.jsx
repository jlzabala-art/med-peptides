'use client';

import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader, ArrowDown } from '@/lib/icons';

/**
 * PullToRefreshContainer
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders an elastic pull-to-refresh spinner at the top of the mobile screen.
 */
export default function PullToRefreshContainer({ onRefresh, children }) {
  const { pullDistance, isRefreshing } = usePullToRefresh(onRefresh);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Elastic Spinner Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{
            position: 'fixed',
            top: `${Math.max(12, Math.min(pullDistance, 70))}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9990,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            transition: isRefreshing ? 'none' : 'top 0.1s ease-out'
          }}
        >
          {isRefreshing ? (
            <Loader size={18} color="var(--color-primary, #003666)" style={{ animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <ArrowDown
              size={18}
              color="var(--color-primary, #003666)"
              style={{
                transform: `rotate(${Math.min(pullDistance * 2.5, 180)}deg)`,
                transition: 'transform 0.1s ease'
              }}
            />
          )}
        </div>
      )}

      {children}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * usePullToRefresh
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook to detect downward drag gestures on mobile screens
 * and trigger a full data revalidation/refresh.
 */
export function usePullToRefresh(onRefresh, options = {}) {
  const { threshold = 75, resistance = 2.5 } = options;
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && window.scrollY === 0) {
      const distance = Math.min(diff / resistance, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      // Trigger light haptic feedback if available
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate(15); } catch {}
      }

      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          // Global data refresh event
          window.dispatchEvent(new Event('REFRESH_ALL_DATA'));
          await new Promise((r) => setTimeout(r, 600));
        }
      } catch (err) {
        console.error('[PullToRefresh error]:', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing };
}

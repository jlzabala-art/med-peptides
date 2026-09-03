"use client";
/**
 * usePullToRefresh
 * ─────────────────────────────────────────────────────────────────────────────
 * Attaches touch-gesture pull-to-refresh to a scrollable container.
 *
 * Usage:
 *   const { isPulling, pullProgress, isRefreshing } = usePullToRefresh(containerRef, onRefresh);
 *
 * containerRef — ref to the scrollable div
 * onRefresh    — async function called when user releases after full pull
 * threshold    — px of pull required to trigger refresh (default 72)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export default function usePullToRefresh(containerRef, onRefresh, threshold = 72) {
  const [state, setState] = useState({
    isPulling: false,
    pullProgress: 0,   // 0-1
    isRefreshing: false,
  });

  const startY = useRef(null);
  const currentY = useRef(0);
  const animFrame = useRef(null);

  const handleTouchStart = useCallback((e) => {
    // Only start pull if scrolled to top
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  }, [containerRef]);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) {
      startY.current = null;
      return;
    }

    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) return;

    // Prevent native scroll when pulling
    e.preventDefault();

    currentY.current = delta;
    const progress = Math.min(delta / threshold, 1);

    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(() => {
      setState(prev => ({ ...prev, isPulling: true, pullProgress: progress }));
    });
  }, [containerRef, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    const delta = currentY.current;
    startY.current = null;
    currentY.current = 0;

    if (delta >= threshold && typeof onRefresh === 'function') {
      setState({ isPulling: false, pullProgress: 1, isRefreshing: true });
      try {
        await onRefresh();
      } catch (_) {
        // silent
      }
      setState({ isPulling: false, pullProgress: 0, isRefreshing: false });
    } else {
      setState({ isPulling: false, pullProgress: 0, isRefreshing: false });
    }
  }, [threshold, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animFrame.current);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return state;
}

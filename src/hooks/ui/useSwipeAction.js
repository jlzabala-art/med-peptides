import { useState, useEffect, useRef } from 'react';

/**
 * useSwipeAction
 * Hook to add swipe-to-reveal or swipe-to-action functionality to list items/rows on touch devices.
 *
 * @param {Object} options
 * @param {Function} options.onSwipeLeft - Callback fired when swiped left beyond threshold
 * @param {Function} options.onSwipeRight - Callback fired when swiped right beyond threshold
 * @param {Number} options.threshold - Minimum distance (px) required to trigger action (default: 75)
 */
export function useSwipeAction(options = {}) {
  const { onSwipeLeft, onSwipeRight, threshold = 75 } = options;

  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentOffsetRef = useRef(0);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // If scrolling vertically more than horizontally, cancel swipe
    if (Math.abs(diffY) > Math.abs(diffX)) {
      setIsSwiping(false);
      setOffset(0);
      currentOffsetRef.current = 0;
      return;
    }

    // Only allow swipe in directions that have a callback
    if ((diffX < 0 && !onSwipeLeft) || (diffX > 0 && !onSwipeRight)) {
      return;
    }

    // Add resistance
    const resistantOffset = diffX * 0.5;

    // Cap max swipe distance
    const maxSwipe = 120;
    const clampedOffset = Math.max(Math.min(resistantOffset, maxSwipe), -maxSwipe);

    setOffset(clampedOffset);
    currentOffsetRef.current = clampedOffset;
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    const finalOffset = currentOffsetRef.current;

    if (finalOffset < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (finalOffset > threshold && onSwipeRight) {
      onSwipeRight();
    }

    // Reset position smoothly
    setOffset(0);
    currentOffsetRef.current = 0;
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    offset,
    isSwiping,
    // Style to apply to the swiping element
    style: {
      transform: `translateX(${offset}px)`,
      transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  };
}

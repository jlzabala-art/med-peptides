"use client";
/**
 * SwipeableCard
 * ─────────────────────────────────────────────────────────────────────────────
 * HOC wrapper that adds swipe-to-reveal action buttons to any card.
 * 
 * Swipe LEFT  → reveals actions on the right (typically Archive/Delete)
 * Swipe RIGHT → reveals action on the left  (typically View/Approve)
 *
 * Usage in DataTable (via swipeActions prop on the card wrapper):
 *   <SwipeableCard
 *     leftAction={{ label: 'View', icon: Eye, color: '#003666', onAction: () => {} }}
 *     rightActions={[
 *       { label: 'Archive', icon: Archive, color: '#d97706', onAction: () => {} },
 *       { label: 'Delete',  icon: Trash2,  color: '#dc2626', onAction: () => {} },
 *     ]}
 *   >
 *     <YourCard ... />
 *   </SwipeableCard>
 */

import React, { useRef, useState, useCallback } from 'react';

const SWIPE_THRESHOLD = 60;      // px to trigger reveal
const MAX_SWIPE       = 140;     // px max reveal
const VELOCITY_THRESH = 0.4;     // px/ms fast swipe

export default function SwipeableCard({ children, leftAction = null, rightActions = [] }) {
  const [offset, setOffset] = useState(0);      // current translateX
  const [revealed, setRevealed] = useState(null); // 'left' | 'right' | null
  const startX = useRef(null);
  const startT = useRef(null);
  const currentX = useRef(0);
  const isAnimating = useRef(false);

  const snapTo = useCallback((target, cb) => {
    isAnimating.current = true;
    setOffset(target);
    setTimeout(() => {
      isAnimating.current = false;
      cb?.();
    }, 220);
  }, []);

  const close = useCallback(() => {
    setRevealed(null);
    snapTo(0);
  }, [snapTo]);

  /* ── Touch handlers ──────────────────────────────────────────── */
  const onTouchStart = useCallback((e) => {
    if (isAnimating.current) return;
    startX.current = e.touches[0].clientX;
    startT.current = Date.now();
    currentX.current = offset;
  }, [offset]);

  const onTouchMove = useCallback((e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const raw = currentX.current + dx;

    // Clamp: left swipe → negative, right swipe → positive
    const clamped = Math.max(
      rightActions.length > 0 ? -MAX_SWIPE : 0,
      Math.min(leftAction ? MAX_SWIPE : 0, raw)
    );
    setOffset(clamped);
  }, [leftAction, rightActions]);

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dt = Date.now() - startT.current;
    const velocity = Math.abs(dx) / dt;
    startX.current = null;

    const isFast = velocity > VELOCITY_THRESH;

    if (dx < -SWIPE_THRESHOLD || (dx < -20 && isFast)) {
      // Swiped left → reveal right actions
      if (rightActions.length > 0) {
        const revealWidth = Math.min(rightActions.length * 70, MAX_SWIPE);
        snapTo(-revealWidth, () => setRevealed('right'));
      } else {
        snapTo(0);
      }
    } else if (dx > SWIPE_THRESHOLD || (dx > 20 && isFast)) {
      // Swiped right → reveal left action
      if (leftAction) {
        snapTo(70, () => setRevealed('left'));
      } else {
        snapTo(0);
      }
    } else {
      // Not enough swipe → snap back
      snapTo(0, () => setRevealed(null));
    }
  }, [leftAction, rightActions, snapTo]);

  const handleActionClick = useCallback((action) => {
    close();
    action.onAction?.();
  }, [close]);

  const rightRevealWidth = Math.min(rightActions.length * 70, MAX_SWIPE);

  return (
    <div
      className="swc-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Left action button (swipe right to reveal) */}
      {leftAction && (
        <div
          className="swc-left-action"
          style={{ opacity: Math.min(1, Math.max(0, offset / 70)) }}
          aria-hidden={revealed !== 'left'}
        >
          <button
            className="swc-action-btn"
            style={{ background: leftAction.color || '#003666' }}
            onClick={() => handleActionClick(leftAction)}
            aria-label={leftAction.label}
          >
            {leftAction.icon && React.createElement(leftAction.icon, { size: 18 })}
            <span>{leftAction.label}</span>
          </button>
        </div>
      )}

      {/* Card content — slides horizontally */}
      <div
        className="swc-card-content"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isAnimating.current ? 'transform 0.22s cubic-bezier(0.32,0.72,0,1)' : 'none',
          zIndex: 1,
        }}
        onClick={() => { if (revealed) { close(); } }}
      >
        {children}
      </div>

      {/* Right action buttons (swipe left to reveal) */}
      {rightActions.length > 0 && (
        <div
          className="swc-right-actions"
          style={{
            width: rightRevealWidth,
            opacity: Math.min(1, Math.max(0, -offset / 70)),
          }}
          aria-hidden={revealed !== 'right'}
        >
          {rightActions.map((action, i) => (
            <button
              key={i}
              className="swc-action-btn"
              style={{ background: action.color || '#64748b' }}
              onClick={() => handleActionClick(action)}
              aria-label={action.label}
            >
              {action.icon && React.createElement(action.icon, { size: 18 })}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

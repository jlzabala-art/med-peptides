"use client";
/**
 * MobileCardSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Shimmer skeleton that matches the visual shape of all custom mobile cards.
 * Shown in DataTable while data is loading on mobile, replacing the generic spinner.
 *
 * One universal skeleton works for all card types:
 *   left circle/square (avatar or icon) + 3 text lines + right pill
 */

import React from 'react';

export default function MobileCardSkeleton({ count = 5, variant = 'default' }) {
  return (
    <div className="mcs-list" aria-busy="true" aria-label="Loading items">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mcs-card" style={{ animationDelay: `${i * 0.07}s` }}>
          {/* Left: avatar / icon placeholder */}
          <div
            className={`mcs-avatar${variant === 'protocol' ? ' mcs-avatar--square' : ''}`}
          />

          {/* Body lines */}
          <div className="mcs-body">
            <div className="mcs-line mcs-line--title" />
            <div className="mcs-line mcs-line--sub" />
            <div className="mcs-tags-row">
              <div className="mcs-tag-pill" />
              <div className="mcs-tag-pill mcs-tag-pill--sm" />
            </div>
          </div>

          {/* Right: status pill */}
          <div className="mcs-right">
            <div className="mcs-badge-pill" />
          </div>
        </div>
      ))}
    </div>
  );
}

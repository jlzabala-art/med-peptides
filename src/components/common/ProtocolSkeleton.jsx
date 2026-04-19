import React from 'react';

/**
 * ProtocolSkeleton — imita la estructura de ProtocolItem durante la carga.
 * Muestra `count` filas animadas con shimmer.
 */
export default function ProtocolSkeleton({ count = 5 }) {
  return (
    <div className="ph-skeleton-list" aria-busy="true" aria-label="Loading protocols">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="ph-skeleton-item">
          {/* Status icon placeholder */}
          <div className="ph-skeleton-box ph-skeleton-icon" />

          {/* Text block */}
          <div className="ph-skeleton-body">
            <div className="ph-skeleton-box ph-skeleton-title" />
            <div className="ph-skeleton-meta">
              <div className="ph-skeleton-box ph-skeleton-chip" />
              <div className="ph-skeleton-box ph-skeleton-chip ph-skeleton-chip--wide" />
            </div>
          </div>

          {/* Status label */}
          <div className="ph-skeleton-status">
            <div className="ph-skeleton-box ph-skeleton-chip" />
            <div className="ph-skeleton-box ph-skeleton-chip ph-skeleton-chip--sm" />
          </div>

          {/* Action buttons */}
          <div className="ph-skeleton-box ph-skeleton-btn" />
          <div className="ph-skeleton-box ph-skeleton-btn" />
        </div>
      ))}
    </div>
  );
}

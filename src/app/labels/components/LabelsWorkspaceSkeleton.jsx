'use client';

import React from 'react';

/**
 * LabelsWorkspaceSkeleton — Golden Rule #4 & #20
 * Pulsing workspace skeleton displayed while prescription & compounding data loads.
 */
export default function LabelsWorkspaceSkeleton({ isEs = false }) {
  return (
    <div className="pls-skeleton-workspace" role="status" aria-live="polite">
      <div className="pls-skeleton-header-bar">
        <div className="pls-skeleton-pill" style={{ width: 140 }} />
        <div className="pls-skeleton-pill" style={{ width: 100 }} />
        <div className="pls-skeleton-pill" style={{ width: 80 }} />
      </div>

      <div className="pls-skeleton-canvas-wrapper">
        <div className="pls-skeleton-label" />
      </div>

      <div className="pls-skeleton-controls">
        <div className="pls-skeleton-btn" />
        <div className="pls-skeleton-btn" />
        <div className="pls-skeleton-btn" />
      </div>

      <p className="pls-skeleton-caption">
        {isEs ? 'Cargando datos de prescripción y formulación magistral...' : 'Loading prescription & compounding formulations...'}
      </p>
    </div>
  );
}

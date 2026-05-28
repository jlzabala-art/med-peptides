/**
 * BreadcrumbBar — Shared header bar for all portal dashboards
 * Shows: ← Back  [GroupEmoji GroupName] › [Current Page]  [optional actions]
 */
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './AppSidebar/AppSidebar.css'; // reuses .breadcrumb-bar styles

export default function BreadcrumbBar({ groups = [], activeId, onBack, actions }) {
  const activeGroup = groups.find(g => g.items?.some(i => i.id === activeId));
  const activeItem  = activeGroup?.items?.find(i => i.id === activeId);

  return (
    <div className="breadcrumb-bar">
      {/* Back button */}
      {onBack && (
        <button className="breadcrumb-back" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={15} />
          Back
        </button>
      )}

      {/* Group › Page trail */}
      {activeGroup && (
        <>
          <span className="breadcrumb-group">
            {activeGroup.emoji} {activeGroup.label}
          </span>
          {activeItem && (
            <>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-page">{activeItem.label}</span>
            </>
          )}
        </>
      )}

      {/* Right-side actions */}
      {actions && <div className="breadcrumb-actions">{actions}</div>}
    </div>
  );
}

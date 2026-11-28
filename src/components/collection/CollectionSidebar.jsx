import React from 'react';

/**
 * Shared sidebar for filtering navigation in public collections.
 * Uses unified Google Cloud Console rail styles (src/styles/gcp-sidebar.css).
 */
export default function CollectionSidebar({ children, className = '' }) {
  return (
    <aside className={`gcp-sb-rail ${className}`.trim()}>
      <div className="gcp-sb-card">
        <div className="gcp-sb-card-body">{children}</div>
      </div>
    </aside>
  );
}

/**
 * Helper component for collapsible/labeled sections inside CollectionSidebar.
 */
export function SidebarSection({ title, children }) {
  return (
    <div className="gcp-sb-section">
      {title && <h3 className="gcp-sb-section-title gcp-sb-section-title--static">{title}</h3>}
      <div style={{ padding: '0 0.5rem' }}>{children}</div>
    </div>
  );
}

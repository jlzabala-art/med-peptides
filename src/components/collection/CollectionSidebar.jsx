 
import React from 'react';

/**
 * Shared sidebar for filtering navigation. 
 * Expected to be used within the `.col-layout` grid.
 */
export default function CollectionSidebar({ children }) {
  return (
    <aside className="col-sidebar">
      {children}
    </aside>
  );
}

/**
 * Helper component for sections inside the sidebar.
 */
export function SidebarSection({ title, children }) {
  return (
    <div className="col-sidebar-section">
      {title && <h3 className="col-sidebar-title">{title}</h3>}
      {children}
    </div>
  );
}

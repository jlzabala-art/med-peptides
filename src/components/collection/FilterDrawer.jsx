import X from "lucide-react/dist/esm/icons/x";
import React, { useEffect } from 'react';


/**
 * Mobile responsive drawer for filters.
 * Replaces the sidebar on smaller screens.
 */
export default function FilterDrawer({ 
  isOpen, 
  onClose, 
  title = "Filters", 
  children 
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="col-drawer-overlay" onClick={onClose}>
      <div className="col-drawer-content" onClick={e => e.stopPropagation()}>
        <div className="col-drawer-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="col-drawer-close">
            <X size={24} />
          </button>
        </div>
        <div className="col-drawer-body">
          {children}
        </div>
      </div>
      <style>{`
        .col-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fade-in 0.2s ease;
        }
        .col-drawer-content {
          background: var(--surface, #FFFFFF);
          width: 85%;
          max-width: 400px;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border-light, #EBF2F8);
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
          animation: slide-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .col-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-light, #EBF2F8);
        }
        .col-drawer-header h3 {
          margin: 0;
          font-family: var(--font-heading);
          font-size: 1.25rem;
          color: var(--text-main, #0D1B2E);
        }
        .col-drawer-close {
          background: transparent;
          border: none;
          color: var(--text-muted, #4A6080);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s, color 0.2s;
        }
        .col-drawer-close:hover {
          background: var(--section-alt, #EEF4FA);
          color: var(--text-main, #0D1B2E);
        }
        .col-drawer-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
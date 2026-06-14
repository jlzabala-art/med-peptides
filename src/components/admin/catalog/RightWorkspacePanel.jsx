import X from "lucide-react/dist/esm/icons/x";
import React, { useEffect, useState } from 'react';


/**
 * Unified right-side workspace panel system for Atlas Health.
 * Used for Categories, Filters, Saved Views, etc.
 */
export default function RightWorkspacePanel({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  badge,
  headerActions,
  footer,
  children 
}) {
  const [shouldRender, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        @keyframes rwpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rwpFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes rwpSlideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes rwpSlideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes rwpSlideUpBottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes rwpSlideDownBottom {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        .rwp-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 9998;
          animation: rwpFadeIn 0.3s ease-out forwards;
        }
        .rwp-overlay.rwp-closing {
          animation: rwpFadeOut 0.3s ease-in forwards;
        }
        .rwp-container {
          position: fixed;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 40px rgba(0, 0, 0, 0.12);
        }

        .rwp-mobile-drag-handle {
          display: none;
        }

        /* Desktop */
        @media (min-width: 768px) {
          .rwp-container {
            top: var(--header-height, 56px); 
            right: 0; 
            bottom: 0;
            width: 440px;
            animation: rwpSlideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            border-left: 1px solid rgba(226, 232, 240, 0.8);
          }
          .rwp-container.rwp-closing {
            animation: rwpSlideOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }

        /* Mobile */
        @media (max-width: 767px) {
          .rwp-container {
            bottom: 0; left: 0; right: 0;
            height: 85vh; /* Never full screen */
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            animation: rwpSlideUpBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            overscroll-behavior-y: contain;
            border-top: 1px solid rgba(226, 232, 240, 0.8);
          }
          .rwp-container.rwp-closing {
            animation: rwpSlideDownBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .rwp-mobile-drag-handle {
            display: block;
            width: 44px;
            height: 5px;
            background: rgba(0,0,0,0.15);
            border-radius: 4px;
            margin: 14px auto 0;
          }
        }

        .rwp-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .rwp-title {
          margin: 0;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-main, #1e293b);
          font-weight: 600;
        }

        .rwp-close-btn {
          background: rgba(0,0,0,0.05);
          border: none;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: var(--text-main, #1e293b);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .rwp-close-btn:hover {
          background: rgba(0,0,0,0.1);
        }

        .rwp-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .rwp-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          background: var(--bg-subtle, #f8fafc);
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }
      `}</style>

      <div 
        className={`rwp-overlay ${!isOpen ? 'rwp-closing' : ''}`} 
        onClick={onClose} 
      />
      <div 
        className={`rwp-container ${!isOpen ? 'rwp-closing' : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="rwp-mobile-drag-handle" />

        {/* Header */}
        <div className="rwp-header">
          <h2 className="rwp-title">
            {icon}
            {title}
            {badge && (
              <span style={{ 
                fontSize: '0.85rem', 
                background: 'var(--color-primary, #6366f1)', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px',
                fontWeight: 700 
              }}>
                {badge}
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {headerActions}
            <button className="rwp-close-btn" onClick={onClose}>
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="rwp-content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="rwp-footer">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
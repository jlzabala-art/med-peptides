import X from 'lucide-react/dist/esm/icons/x';
import React, { useEffect } from 'react';

/**
 * StandardDrawer
 *
 * A universal side-drawer component for detail views and edit forms across all portals.
 * Replaces heavy modals and page jumps.
 *
 * @param {boolean} isOpen - Whether the drawer is visible
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Header title
 * @param {string} subtitle - Optional header subtitle
 * @param {node} children - Drawer content
 * @param {node} footer - Optional footer actions
 * @param {string} width - Drawer width (default '500px')
 */
export default function StandardDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  actions,
  width = '500px',
  bodyPadding = '1.5rem',
  fullWorkspace = false,
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999, // Above almost everything
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
        animation: 'drawerFadeIn 0.2s ease-out',
      }}
    >
      {/* Backdrop click layer */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className={fullWorkspace ? 'drawer-full-workspace' : ''}
        style={{
          position: 'relative',
          width: fullWorkspace ? undefined : width,
          maxWidth: '100%',
          backgroundColor: 'var(--background, #fff)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-text, #111)',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <div
                style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-tertiary, #666)',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {actions && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{actions}</div>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                margin: '-0.5rem',
                color: 'var(--color-text-secondary, #444)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f3f4f6)')
              }
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: bodyPadding,
            backgroundColor: 'var(--color-bg-app, #f9fafb)',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color, #e5e7eb)',
              backgroundColor: 'var(--bg-secondary, #fafafa)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-full-workspace {
          width: calc(100vw - 260px);
        }
        @media (max-width: 768px) {
          .drawer-full-workspace {
            width: 100vw;
          }
        }
      `}</style>
    </div>
  );
}

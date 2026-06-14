import X from "lucide-react/dist/esm/icons/x";
import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';


/**
 * Modal — accessible dialog rendered via portal.
 * Standardized across Atlas Health.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md', // 'sm', 'md', 'lg', 'full'
  maxWidth, // optional override
  children,
  footer = null,
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  /* ── Escape key ──────────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  /* ── Lock body scroll & trap focus ───────────────────────── */
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus the dialog container
    requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = original;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    full: '100%',
  };
  const mw = maxWidth || sizeMap[size] || '600px';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(32,33,36,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      onKeyDown={handleKeyDown}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        className="gcp-card"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        style={{ 
          width: '100%', 
          maxWidth: mw, 
          backgroundColor: '#fff',
          display: 'flex', 
          flexDirection: 'column',
          maxHeight: '90vh',
          boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        {title && (
          <div className="gcp-header">
            {title}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', 
                color: 'var(--gcp-text-muted)', display: 'flex', alignItems: 'center' 
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && <div style={{ padding: '1.25rem', borderTop: '1px solid var(--gcp-border)' }}>{footer}</div>}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>,
    document.body,
  );
}
"use client";


import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/lib/icons';


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
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      onKeyDown={handleKeyDown}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        className="gcp-card modal-container"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        style={{ maxWidth: mw }}
      >
        {/* Header */}
        {title && (
          <div className="gcp-header modal-header">
            {title}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="modal-close-btn"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(32,33,36,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-container {
          width: 100%;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2);
        }
        .modal-header {
          padding: max(1.25rem, env(safe-area-inset-top)) 1.25rem 1.25rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-close-btn {
          background: none; border: none; cursor: pointer; 
          color: var(--gcp-text-muted); display: flex; align-items: center;
        }
        .modal-body {
          padding: 1.25rem;
          overflow-y: auto;
        }
        .modal-footer {
          padding: 1.25rem;
          border-top: 1px solid var(--gcp-border);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Mobile specific styles (Bottom Sheet) */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0;
            align-items: flex-end;
          }
          .modal-container {
            max-width: 100% !important;
            max-height: 95vh;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>,
    document.body,
  );
}
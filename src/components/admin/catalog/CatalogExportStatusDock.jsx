'use client';

import React, { useEffect, useState } from 'react';
import { Loader, CheckCircle2, AlertCircle, ExternalLink, Copy, Check, X } from 'lucide-react';

/**
 * CatalogExportStatusDock
 * 
 * Floating, non-blocking operation dock providing real-time feedback for PDF generation
 * and Web Share links. Optimized for both mobile devices (touch targets, direct action to avoid
 * popup blockers) and laptops/desktops.
 */
export default function CatalogExportStatusDock({
  status, // null | { id, type, title, variantCount, markupPercent, state: 'loading' | 'success' | 'error', stepMessage, resultUrl, errorMessage }
  onDismiss
}) {
  const [copied, setCopied] = useState(false);

  // Auto-dismiss on success after 12s
  useEffect(() => {
    if (status?.state === 'success') {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [status?.state, onDismiss]);

  if (!status) return null;

  const isLoading = status.state === 'loading';
  const isSuccess = status.state === 'success';
  const isError   = status.state === 'error';

  const handleCopy = () => {
    if (!status.resultUrl) return;
    navigator.clipboard.writeText(status.resultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpen = () => {
    if (!status.resultUrl) return;
    window.open(status.resultUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(540px, calc(100vw - 28px))',
        zIndex: 99999,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: isError
          ? '1.5px solid #fca5a5'
          : isSuccess
          ? '1.5px solid #86efac'
          : '1.5px solid #bae6fd',
        boxShadow: '0 16px 40px -6px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        padding: '14px 18px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animation: 'slideUpFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translate(-50%, 18px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes pulseProgress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Status Icon */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              backgroundColor: isError
                ? '#fef2f2'
                : isSuccess
                ? '#f0fdf4'
                : '#f0f9ff',
              color: isError
                ? '#dc2626'
                : isSuccess
                ? '#16a34a'
                : '#0284c7'
            }}
          >
            {isLoading && <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />}
            {isSuccess && <CheckCircle2 size={20} />}
            {isError   && <AlertCircle size={20} />}
          </div>

          {/* Title & Badges */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 750,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {status.title || 'Exporting Catalog'}
              </span>

              {status.variantCount != null && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  whiteSpace: 'nowrap'
                }}>
                  {status.variantCount} variants
                </span>
              )}

              {status.markupPercent != null && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  whiteSpace: 'nowrap'
                }}>
                  EXW {status.markupPercent > 0 ? `+${status.markupPercent}%` : '0%'}
                </span>
              )}
            </div>

            {/* Subtitle / Step Message */}
            <div style={{
              fontSize: '0.78rem',
              color: isError ? '#b91c1c' : '#64748b',
              marginTop: '2px',
              lineHeight: 1.3
            }}>
              {isError
                ? (status.errorMessage || 'Export failed. Please try again.')
                : isSuccess
                ? (status.type === 'pdf'
                    ? 'Catalog PDF generated! Tap below to view or print.'
                    : 'Interactive Web Share link generated and active for 30 days.')
                : (status.stepMessage || 'Compiling catalogue and building document…')}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title="Dismiss status"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar for Loading State */}
      {isLoading && (
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e0f2fe',
          borderRadius: '9999px',
          marginTop: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '40%',
            background: 'linear-gradient(90deg, #0284c7, #38bdf8, #0284c7)',
            borderRadius: '9999px',
            animation: 'pulseProgress 1.4s ease-in-out infinite'
          }} />
        </div>
      )}

      {/* Action Buttons for Success State (Crucial on mobile to bypass popup blockers) */}
      {isSuccess && status.resultUrl && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '10px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={handleOpen}
            style={{
              flex: 1,
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 14px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
            }}
          >
            <ExternalLink size={15} />
            <span>{status.type === 'pdf' ? 'Open PDF Catalog' : 'Open Shared Portfolio'}</span>
          </button>

          {status.type === 'web' && (
            <button
              type="button"
              onClick={handleCopy}
              style={{
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: copied ? '#f0fdf4' : '#f8fafc',
                color: copied ? '#16a34a' : '#334155',
                border: copied ? '1px solid #86efac' : '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 14px'
              }}
            >
              {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDismiss}
            style={{
              minHeight: '40px',
              padding: '8px 12px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

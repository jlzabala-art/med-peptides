'use client';

import React, { useEffect } from 'react';
import { X, ExternalLink, Package } from 'lucide-react';
import { trackProductView } from '@/services/algoliaInsights';

/**
 * ProductQuickViewDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * In-app slide-over drawer to preview any product monograph (/p/[slug])
 * without leaving the current workspace or opening extra browser tabs.
 */
export default function ProductQuickViewDrawer({
  isOpen = false,
  slug = '',
  title = '',
  isEs = false,
  onClose = null
}) {
  useEffect(() => {
    if (!isOpen || !slug) return undefined;
    trackProductView({ indexName: 'products', objectID: slug, eventName: 'Product QuickView Opened' });
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, slug, onClose]);

  if (!isOpen || !slug) return null;

  const targetUrl = `/p/${encodeURIComponent(slug)}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(15, 23, 42, 0.48)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || slug}
        style={{
          width: 'min(920px, 94vw)',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-12px 0 36px rgba(15, 23, 42, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={16} color="#0d9488" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              {title || (isEs ? 'Ficha de Producto' : 'Product Monograph')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.74rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>{isEs ? 'Abrir pestaña' : 'New tab'}</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label={isEs ? 'Cerrar' : 'Close'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <iframe
          src={targetUrl}
          title={title || slug}
          style={{
            flex: 1,
            width: '100%',
            border: 'none',
            background: '#ffffff'
          }}
        />
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, QrCode } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import UniversalQrCard from '@/components/ui/UniversalQrCard';

/**
 * GlobalQrModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Standardized QR Share modal triggered from FloatingActionDock (or any
 * `open-global-qr-modal` event). Guarantees every public page has a consistent,
 * canonical QR code with 1-click Copy Link and PNG Download.
 */
export default function GlobalQrModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [qrOverride, setQrOverride] = useState(null);
  const { screenContext, lang } = useAtlasContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEs = lang === 'es';

  useEffect(() => {
    const handleOpen = (e) => {
      if (e?.detail && (e.detail.url || e.detail.title || e.detail.subtitle)) {
        setQrOverride(e.detail);
      } else {
        setQrOverride(null);
      }
      setIsOpen(true);
    };
    window.addEventListener('open-global-qr-modal', handleOpen);
    return () => window.removeEventListener('open-global-qr-modal', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQrOverride(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const shareUrl = useMemo(() => {
    if (qrOverride?.url) return qrOverride.url;
    if (screenContext?.canonicalUrl) return screenContext.canonicalUrl;
    if (screenContext?.contextAnchor?.url) return screenContext.contextAnchor.url;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (lang === 'es' || lang === 'en') {
        url.searchParams.set('lang', lang);
      }
      return url.toString();
    }
    const qs = searchParams?.toString();
    return `https://www.atlashealth-services.com${pathname || '/'}${qs ? `?${qs}` : ''}`;
  }, [qrOverride, screenContext, pathname, searchParams, lang]);

  if (!isOpen) return null;

  const pageTitle =
    qrOverride?.title ||
    screenContext?.title ||
    screenContext?.contextAnchor?.sectionTitle ||
    (typeof document !== 'undefined' ? document.title.split('|')[0].trim() : '') ||
    'Atlas Health Services';

  const pageSubtitle =
    qrOverride?.subtitle ||
    screenContext?.subtitle ||
    (isEs ? 'Escanea o copia el enlace directo de esta página' : 'Scan or copy the direct link for this page');

  return (
    <div
      className="no-print"
      role="dialog"
      aria-modal="true"
      aria-label={isEs ? 'Compartir código QR' : 'Share QR Code'}
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <QrCode size={16} color="#003666" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {isEs ? 'Compartir Página (QR)' : 'Share Page (QR)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={isEs ? 'Cerrar' : 'Close'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          <UniversalQrCard
            value={shareUrl}
            title={pageTitle}
            subtitle={pageSubtitle}
            size={180}
            lang={lang}
            showCopyButton={true}
          />
        </div>
      </div>
    </div>
  );
}

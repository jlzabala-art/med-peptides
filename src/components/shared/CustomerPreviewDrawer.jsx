'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, RefreshCw, Copy, Check, Smartphone, Monitor } from '@/lib/icons';

export default function CustomerPreviewDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('/');
  const [title, setTitle] = useState('Public Storefront Preview');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleOpen(event) {
      const url = event?.detail?.url || '/';
      const heading = event?.detail?.title || 'Public Storefront Preview';
      setPreviewUrl(url);
      setTitle(heading);
      setIsOpen(true);
    }

    window.addEventListener('open-customer-preview', handleOpen);
    return () => {
      window.removeEventListener('open-customer-preview', handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${previewUrl}` : previewUrl;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: isMobileMode ? '430px' : '72vw',
          maxWidth: '1200px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Drawer Header ── */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          {/* Title & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: '#e0f2fe',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Customer View
            </span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Viewport switcher: Desktop vs Mobile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#e2e8f0',
                borderRadius: '6px',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setIsMobileMode(false)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: !isMobileMode ? '#ffffff' : 'transparent',
                  color: !isMobileMode ? '#0f172a' : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: !isMobileMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <Monitor size={13} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMode(true)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isMobileMode ? '#ffffff' : 'transparent',
                  color: isMobileMode ? '#0f172a' : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: isMobileMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <Smartphone size={13} /> Mobile
              </button>
            </div>

            {/* Refresh iframe */}
            <button
              type="button"
              onClick={() => setKey((k) => k + 1)}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
              }}
              title="Reload preview"
            >
              <RefreshCw size={13} />
            </button>

            {/* Copy link */}
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: copied ? '#f0fdf4' : '#ffffff',
                color: copied ? '#16a34a' : '#0f172a',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Copy shareable link"
            >
              {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {/* Open in external tab */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.74rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ExternalLink size={13} /> Open Tab
            </a>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
              title="Close preview (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Sub-header URL Bar ── */}
        <div
          style={{
            padding: '6px 18px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            fontSize: '0.72rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontWeight: 600, color: '#94a3b8' }}>URL:</span>
          <span
            style={{
              backgroundColor: '#f8fafc',
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              color: '#0f172a',
            }}
          >
            {fullUrl}
          </span>
        </div>

        {/* ── Iframe Container ── */}
        <div style={{ flex: 1, backgroundColor: '#f1f5f9', position: 'relative' }}>
          <iframe
            key={key}
            src={previewUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#ffffff',
            }}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

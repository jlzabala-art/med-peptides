"use client";

import React, { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

export default function ImageModal({ isOpen, onClose, imageSrc, altText }) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsZoomed(false);
      const lockId = lockScroll();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        unlockScroll(lockId);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={altText || 'Expanded product image'}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        cursor: 'zoom-out',
        animation: 'fadeInModal 0.25s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-product-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 16px;
          padding: 1.5rem;
          max-width: min(92vw, 560px);
          max-height: 80vh;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15);
          cursor: default;
          overflow: hidden;
          margin: auto;
          transition: transform 0.25s ease;
        }
        .modal-product-img {
          width: 100%;
          max-height: 68vh;
          object-fit: contain;
          margin: 0 auto;
          display: block;
          transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
          cursor: zoom-in;
          transform-origin: center center;
          user-select: none;
        }
        .modal-product-img.zoomed {
          transform: scale(1.65);
          cursor: zoom-out;
        }
        @media (max-width: 640px) {
          .modal-product-stage {
            padding: 1rem;
            max-height: 76vh;
            border-radius: 12px;
          }
          .modal-product-img {
            max-height: 64vh;
          }
          .modal-product-img.zoomed {
            transform: scale(2);
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          padding: '0 0.25rem',
          color: '#ffffff'
        }}
      >
        <div style={{ minWidth: 0, paddingRight: '1rem' }}>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {altText || 'High-Resolution Inspection'}
          </div>
          <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '2px' }}>
            Tap image to {isZoomed ? 'zoom out' : 'magnify'} • ESC to close
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          type="button"
          aria-label="Close image modal"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background-color 0.15s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.85)';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Centered Presentation Stage */}
      <div 
        className="modal-product-stage"
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(prev => !prev);
        }}
      >
        <img 
          src={imageSrc} 
          alt={altText || 'Product inspection view'} 
          className={`modal-product-img ${isZoomed ? 'zoomed' : ''}`}
          draggable={false}
        />

        {/* Floating Zoom Indicator Pill */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          borderRadius: '99px',
          padding: '4px 10px',
          fontSize: '0.68rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {isZoomed ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
          <span>{isZoomed ? '100%' : 'Tap to Zoom'}</span>
        </div>
      </div>
    </div>
  );
}
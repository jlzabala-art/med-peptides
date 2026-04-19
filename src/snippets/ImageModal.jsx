import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

export default function ImageModal({ isOpen, onClose, imageSrc, altText }) {
  useEffect(() => {
    if (isOpen) {
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out',
        animation: 'fadeInModal 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .zoom-image-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          alignItems: center;
          justifyContent: center;
          padding: 1rem;
          overflow: auto;
        }
        .zoom-image {
          max-width: 95%;
          max-height: 95%;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: zoom-in;
          background-color: white; /* Ensure visibility if image has transparency */
        }
        .zoom-image.zoomed {
          transform: scale(1.5);
          cursor: zoom-out;
        }
        @media (max-width: 768px) {
          .zoom-image.zoomed {
            transform: scale(2);
          }
        }
      `}</style>
      
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10000,
          transition: 'all 0.2s ease'
        }}
      >
        <X size={24} />
      </button>
      
      <div 
        className="zoom-image-container"
        onClick={(e) => {
          e.stopPropagation();
          const img = e.currentTarget.querySelector('.zoom-image');
          if (img) img.classList.toggle('zoomed');
        }}
      >
        <img 
          src={imageSrc} 
          alt={altText} 
          className="zoom-image"
        />
      </div>
    </div>
  );
}

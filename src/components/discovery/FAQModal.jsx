import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import X from "lucide-react/dist/esm/icons/x";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React, { useEffect } from 'react';



import FAQAccordion from './FAQAccordion';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

export default function FAQModal({ isOpen, onClose, faqItems, loading = false, product, relatedProducts, onProductClick }) {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9998, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.3s ease-out'
        }} 
      />
      <div 
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '95%', maxWidth: '800px', maxHeight: '85vh', backgroundColor: 'white', zIndex: 9999,
          borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', 
          animation: 'modalFadeIn 0.3s ease-out', overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfdfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(0,163,224,0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)', fontWeight: 800 }}>Scientific FAQ</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product?.name} Research Reference</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => {
              if (e.currentTarget) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={22} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#fcfdfe' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: 'var(--primary)' }}>
              <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-muted)' }}>Loading scientific references...</p>
            </div>
          ) : (
            <FAQAccordion 
              faqItems={faqItems} 
              relatedProducts={relatedProducts} 
              onProductClick={onProductClick} 
            />
          )}
        </div>

        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--color-bg-app)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          This information is for research purposes only and based on curated clinical literature profiles. 
          Consult relevant peer-reviewed studies for specific research designs.
        </div>
      </div>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.98); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

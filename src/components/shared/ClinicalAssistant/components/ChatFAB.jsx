import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

export default function ChatFAB({ isOpen, setIsOpen, hasNewActivity, isProductPage }) {
  if (isProductPage) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => setIsOpen(!isOpen)}
      className="ca-fab-btn ca-fab-mobile-lift"
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '2rem',
        height: '56px',
        width: isOpen ? '56px' : 'auto',
        minWidth: isOpen ? '56px' : '180px',
        borderRadius: isOpen ? '50%' : '28px',
        background: isOpen
          ? 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)'
          : 'linear-gradient(135deg, #0078d7 0%, var(--primary, #004b87) 55%, #002f5c 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'center' : 'flex-start',
        gap: '0.6rem',
        paddingLeft: isOpen ? 0 : '1rem',
        paddingRight: isOpen ? 0 : '1.25rem',
        border: '1px solid rgba(255,255,255,0.18)',
        cursor: 'pointer',
        zIndex: 9999,
        overflow: 'hidden',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Shine sweep */}
      {!isOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '40%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          animation: 'ca-shine-pill 3.5s ease-in-out 2s infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Icon */}
      <div className="ca-fab-icon" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: isOpen ? 'transparent' : 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(4px)',
        flexShrink: 0,
      }}>
        <AnimatePresence mode='wait'>
          {isOpen
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={20} /></motion.div>
            : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Sparkles size={18} /></motion.div>
          }
        </AnimatePresence>
      </div>

      {/* Label (only when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="ca-fab-text-hide"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              Ask Atlas Health AI
            </span>
            <span style={{ fontSize: '0.62rem', opacity: 0.7, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Neural Link Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity dot */}
      {!isOpen && hasNewActivity && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', zIndex: 10 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            backgroundColor: '#ff4757',
            animation: 'ca-dot-ping 1.5s cubic-bezier(0,0,0.2,1) infinite'
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            backgroundColor: '#ff4757',
            border: '1.5px solid white'
          }} />
        </div>
      )}
    </motion.button>
  );
}

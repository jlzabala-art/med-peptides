import BookOpen from "lucide-react/dist/esm/icons/book-open";
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


export default function GlossaryTooltip({ term, definition }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      <span style={{
        color: 'var(--primary)',
        fontWeight: 700,
        textDecoration: 'underline dotted',
        textUnderlineOffset: '4px',
        cursor: 'help',
        padding: '0 2px'
      }}>
        {term}
      </span>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '10px',
              width: '220px',
              padding: '0.85rem',
              backgroundColor: 'var(--color-text-primary)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '0.72rem',
              lineHeight: 1.5,
              zIndex: 10000,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', opacity: 0.8 }}>
              <BookOpen size={12} />
              <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Definition</span>
            </div>
            {definition}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1e293b'
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
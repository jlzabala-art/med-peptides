import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import X from "lucide-react/dist/esm/icons/x";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';


import { useCopilot } from '../../context/CopilotContext';

export default function FloatingLauncher() {
  const { isOpen, toggleCopilot } = useCopilot();

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '1rem'
    }}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCopilot}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 54, 102, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Shimmer effect */}
            <div style={{
              position: 'absolute',
              top: 0, left: '-100%', width: '50%', height: '100%',
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
              transform: 'skewX(-20deg)',
              animation: 'shimmer 3s infinite'
            }} />
            <Sparkles size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
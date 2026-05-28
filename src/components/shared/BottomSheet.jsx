/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import '../../styles/bottom_sheet.css';

export const BottomSheet = ({ isOpen, onClose, children, title }) => {
  const [isDragging, setIsDragging] = useState(false);
  const controls = useDragControls();

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="bottom-sheet-backdrop"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
              setIsDragging(false);
              if (info.offset.y > 150) onClose();
            }}
            className="bottom-sheet-container"
          >
            {/* Grab Handle */}
            <div className="bottom-sheet-handle-wrapper">
              <div className="bottom-sheet-handle" />
            </div>

            {/* Header */}
            {title && (
              <div className="bottom-sheet-header">
                <h3 className="bottom-sheet-title">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="bottom-sheet-content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;

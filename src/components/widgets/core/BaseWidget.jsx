import React from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal, X } from '@/lib/icons';

export default function BaseWidget({ 
  id,
  title, 
  icon: Icon, 
  children, 
  isDraggable = false,
  dragListeners,
  dragAttributes,
  onRemove,
  className = "" 
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 54, 102, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '280px',
      }}
    >
      {/* Header del Widget */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.15rem',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDraggable && (
            <button 
              {...dragListeners} 
              {...dragAttributes}
              style={{ cursor: 'grab', background: 'none', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '2px' }}
              title="Drag to reorder"
            >
              <GripHorizontal size={16} />
            </button>
          )}
          
          {Icon && <Icon size={17} style={{ color: '#003666' }} />}
          <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
        </div>

        {onRemove && (
          <button 
            onClick={() => onRemove(id)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }}
            title="Remove widget"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Contenido del Widget */}
      <div style={{ flex: 1, padding: '1rem 1.15rem', overflowY: 'auto' }}>
        {children}
      </div>
    </motion.div>
  );
}

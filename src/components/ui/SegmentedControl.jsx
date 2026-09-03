import React, { useId } from 'react';
import { motion } from 'framer-motion';

export default function SegmentedControl({ 
  value, 
  onChange, 
  options = [], 
  layoutIdPrefix 
}) {
  const defaultId = useId();
  const safePrefix = layoutIdPrefix || `segmented-${defaultId}`;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: 'var(--color-bg-muted, #f1f5f9)',
      padding: '4px',
      borderRadius: '10px',
      gap: '2px',
      position: 'relative'
    }}>
      {options.map((option) => {
        const isSelected = value === option.value || value === option.id;
        const optValue = option.value || option.id;
        
        return (
          <button
            key={optValue}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(optValue);
            }}
            style={{
              position: 'relative',
              padding: '6px 12px',
              fontSize: '0.8125rem', // 13px
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? 'var(--text-main, #0f172a)' : 'var(--text-muted, #64748b)',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.2s ease',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {isSelected && (
              <motion.div
                layoutId={`${safePrefix}-active-pill`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#ffffff',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
                  zIndex: -1
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 2 }}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

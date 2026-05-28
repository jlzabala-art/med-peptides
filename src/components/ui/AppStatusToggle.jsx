import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AppStatusToggle({ isActive, onToggle, activeLabel = 'Active', inactiveLabel = 'Hidden' }) {
  // If isActive is strictly false, it's hidden. Otherwise (true or undefined), it's active.
  const isHidden = isActive === false;
  
  return (
    <button 
      onClick={(e) => { 
        e.stopPropagation(); 
        onToggle(isHidden); // If currently hidden, toggle means we want to set it to true (active)
      }}
      title={`Click to ${isHidden ? 'show' : 'hide'}`}
      style={{ 
        background: isHidden ? 'var(--color-bg-hover)' : 'var(--color-success-bg)', 
        border: `1px solid ${isHidden ? 'var(--color-border)' : 'rgba(16,185,129,0.3)'}`, 
        cursor: 'pointer', 
        color: isHidden ? 'var(--color-text-secondary)' : 'var(--color-success)',
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.4rem', 
        fontWeight: 700,
        fontSize: '0.75rem',
        padding: '0.3rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        transition: 'all 0.2s',
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = 'brightness(0.95)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'none';
      }}
    >
      {isHidden ? <><EyeOff size={14} /> {inactiveLabel}</> : <><Eye size={14} /> {activeLabel}</>}
    </button>
  );
}

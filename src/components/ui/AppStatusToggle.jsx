import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import React from 'react';



export default function AppStatusToggle({ isActive, isLocked = false, onToggle, activeLabel = 'Active', inactiveLabel = 'Hidden', lockedLabel = 'Disabled' }) {
  // If isActive is strictly false, it's hidden. Otherwise (true or undefined), it's active.
  const isHidden = isActive === false;
  return (
    <button 
      onClick={(e) => { 
        e.stopPropagation(); 
        if (!isLocked) onToggle(isHidden); 
      }}
      title={isLocked ? 'Locked by Administrator' : `Click to ${isHidden ? 'show' : 'hide'}`}
      style={{ 
        background: isLocked ? '#f1f5f9' : isHidden ? 'var(--color-bg-hover)' : 'var(--color-success-bg)', 
        border: `1px solid ${isLocked ? '#cbd5e1' : isHidden ? 'var(--color-border)' : 'rgba(16,185,129,0.3)'}`, 
        cursor: isLocked ? 'not-allowed' : 'pointer', 
        color: isLocked ? '#64748b' : isHidden ? 'var(--color-text-secondary)' : 'var(--color-success)',
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
      {isLocked ? <><EyeOff size={14} /> {lockedLabel}</> : isHidden ? <><EyeOff size={14} /> {inactiveLabel}</> : <><Eye size={14} /> {activeLabel}</>}
    </button>
  );
}
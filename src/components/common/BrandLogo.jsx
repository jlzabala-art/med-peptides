import React from 'react';

export default function BrandLogo({ variant = 'dark', showText = true, size = 'default', style = {} }) {
  // variant: 'dark', 'light' (white), 'primary'
  // size: 'default' (desktop), 'compact' (mobile)
  
  const isLight = variant === 'light' || variant === 'white';
  
  const primaryColor = isLight ? '#FFFFFF' : '#1B3A5B';
  const secondaryColor = isLight ? 'rgba(255, 255, 255, 0.7)' : '#6B7C8F';
  
  const iconSize = size === 'compact' ? 26 : 34;
  const fontSize = size === 'compact' ? '1.25rem' : '1.5rem';
  const gap = size === 'compact' ? '0.5rem' : '0.75rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: gap, ...style }}>
      {/* Icon: Minimal DNA-inspired symbol (Two curves, 3 nodes) */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Smooth DNA Helix Curves */}
        <path d="M9 7 C21 7, 19 33, 31 33" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M31 7 C19 7, 21 33, 9 33" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* 3 Intersecting Node Points */}
        <circle cx="20" cy="20" r="3.5" fill={primaryColor} />
        <circle cx="20" cy="11.5" r="2.5" fill={secondaryColor} />
        <circle cx="20" cy="28.5" r="2.5" fill={secondaryColor} />
      </svg>
      
      {showText && (
        <span style={{ 
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          letterSpacing: '0.04em',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'baseline'
        }}>
          <span style={{ fontWeight: 800, color: primaryColor, fontSize }}>ReGen</span>
          <span style={{ fontWeight: 500, color: secondaryColor, fontSize, marginLeft: '0.25em' }}>PEPT</span>
        </span>
      )}
    </div>
  );
}

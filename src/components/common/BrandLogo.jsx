 
import React from 'react';

export default function BrandLogo({ variant = 'dark', showText = true, size = 'default', style = {} }) {
  // variant: 'dark', 'light' (white), 'primary'
  // size: 'default' (desktop), 'compact' (mobile)
  
  const isLight = variant === 'light' || variant === 'white';
  
  const primaryColor = isLight ? '#FFFFFF' : '#001A35'; // Deep Medical Navy
  const secondaryColor = isLight ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-primary)'; // Clinical Blue
  const accentColor = '#10B981'; // Laboratory Green
  
  const iconSize = size === 'compact' ? 28 : 36;
  const fontSize = size === 'compact' ? '1.15rem' : '1.35rem';
  const gap = size === 'compact' ? '0.4rem' : '0.6rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: gap, ...style }}>
      {/* Icon: Modern Medical Cross + Molecular Bond Hybrid */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Molecular Bond Helix */}
        <path 
          d="M12 12 C18 12, 22 28, 28 28" 
          stroke={primaryColor} 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M28 12 C22 12, 18 28, 12 28" 
          stroke={secondaryColor} 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        
        {/* Central Professional Cross Node */}
        <circle cx="20" cy="20" r="4.5" fill={primaryColor} />
        <circle cx="20" cy="20" r="2.5" fill={accentColor} />
        
        {/* Connection Points */}
        <circle cx="15.5" cy="15.5" r="2" fill={secondaryColor} />
        <circle cx="24.5" cy="24.5" r="2" fill={secondaryColor} />
        <circle cx="15.5" cy="24.5" r="2" fill={primaryColor} />
        <circle cx="24.5" cy="15.5" r="2" fill={primaryColor} />
      </svg>
      
      {showText && (
        <span style={{ 
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: '-0.01em',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 800, color: primaryColor, fontSize }}>Med-</span>
          <span style={{ fontWeight: 500, color: secondaryColor, fontSize }}>Peptides</span>
        </span>
      )}
    </div>
  );
}


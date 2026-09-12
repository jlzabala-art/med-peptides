import React from 'react';
import AtlasHealthLogo from '../brand/AtlasHealthLogo';

export default function BrandLogo({ variant = 'dark', showText = true, size = 'default', style = {} }) {
  // variant: 'dark', 'light' (white), 'primary'
  // size: 'default' (desktop), 'compact' (mobile)
  
  const isLight = variant === 'light' || variant === 'white';
  
  const primaryColor = isLight ? '#FFFFFF' : '#003666';
  const secondaryColor = isLight ? '#38bdf8' : '#0284c7';
  
  const iconSize = size === 'compact' ? 28 : 34;
  const fontSize = size === 'compact' ? '1.1rem' : '1.3rem';
  const gap = size === 'compact' ? '0.45rem' : '0.65rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: gap, ...style }}>
      <AtlasHealthLogo size={iconSize} />
      
      {showText && (
        <span style={{ 
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: '-0.02em',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontWeight: 800, color: primaryColor, fontSize }}>Atlas</span>
          <span style={{ fontWeight: 600, color: secondaryColor, fontSize }}>Services</span>
        </span>
      )}
    </div>
  );
}


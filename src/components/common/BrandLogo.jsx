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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: gap, whiteSpace: 'nowrap', flexShrink: 0, ...style }}>
      <AtlasHealthLogo size={iconSize} variant={isLight ? 'light' : 'dark'} />
      
      {showText && (
        <span style={{ 
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: '-0.02em',
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          <span style={{ fontWeight: 800, color: primaryColor, fontSize, whiteSpace: 'nowrap' }}>Atlas Health</span>
          <span style={{ fontWeight: 600, color: secondaryColor, fontSize, whiteSpace: 'nowrap' }}>Services</span>
        </span>
      )}
    </div>
  );
}


import React from 'react';

/**
 * StackLayout
 * A simple flexible flexbox container that uses our spacing tokens.
 * Supports horizontal or vertical stacking.
 */
export default function StackLayout({ 
  children, 
  direction = 'column', 
  spacing = 'md', // sm, md, lg
  align = 'stretch',
  justify = 'flex-start',
  className = '', 
  style = {} 
}) {
  const gapClass = `stack-layout--${spacing}`;
  
  return (
    <div 
      className={`stack-layout ${gapClass} ${className}`} 
      style={{
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        ...style
      }}
    >
      {children}
    </div>
  );
}

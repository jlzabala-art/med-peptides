import React, { useState } from 'react';

export default function TooltipWrapper({ text, children, position = 'bottom' }) {
  const [show, setShow] = useState(false);

  // Position styles mapping
  const positions = {
    bottom: {
      tooltip: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 6,
      },
      arrow: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderTopColor: '#202124'
      }
    },
    top: {
      tooltip: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 6,
      },
      arrow: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderBottomColor: '#202124'
      }
    }
  };

  const posStyle = positions[position] || positions.bottom;

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div style={{
          position: 'absolute',
          ...posStyle.tooltip,
          padding: '6px 10px',
          background: '#202124',
          color: '#fff',
          fontSize: 11,
          borderRadius: 4,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 9999,
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            ...posStyle.arrow,
            border: '4px solid transparent'
          }} />
        </div>
      )}
    </div>
  );
}

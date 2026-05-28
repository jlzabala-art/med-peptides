import React from 'react';
import '../../styles/gcp-theme.css';

export default function GcpButton({ 
  children, 
  variant = 'primary', // 'primary', 'secondary', 'danger'
  className = '', 
  ...props 
}) {
  const btnClass = `gcp-btn-${variant} ${className}`;
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}

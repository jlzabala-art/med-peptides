import React from 'react';
import '../../styles/gcp-theme.css';

export default function GcpCard({ children, className = '', style = {}, noPadding = false }) {
  return (
    <div className={`gcp-card ${className}`} style={{ padding: noPadding ? '0' : '1.25rem', ...style }}>
      {children}
    </div>
  );
}

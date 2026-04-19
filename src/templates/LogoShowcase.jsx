import React from 'react';
import BrandLogo from '../components/common/BrandLogo';

export default function LogoShowcase() {
  return (
    <div style={{ padding: '4rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '2rem' }}>ReGen PEPT Logo Showcase (SVG)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Primary Horizontal */}
        <div style={{ border: '1px solid #ddd', padding: '2rem', borderRadius: '12px', background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '1rem', color: '#64748b' }}>1. Primary Horizontal</h3>
          <BrandLogo variant="dark" />
        </div>

        {/* White Version */}
        <div style={{ border: '1px solid #1e293b', padding: '2rem', borderRadius: '12px', background: '#0f172a' }}>
          <h3 style={{ marginBottom: '1rem', color: '#94a3b8' }}>2. White Version (Dark BG)</h3>
          <BrandLogo variant="white" />
        </div>

        {/* Icon Only */}
        <div style={{ border: '1px solid #ddd', padding: '2rem', borderRadius: '12px', background: '#ffffff' }}>
          <h3 style={{ marginBottom: '1rem', color: '#64748b' }}>3. Icon Only</h3>
          <BrandLogo variant="dark" showText={false} />
        </div>

        {/* Mobile Compact */}
        <div style={{ border: '1px solid #ddd', padding: '2rem', borderRadius: '12px', background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '1rem', color: '#64748b' }}>4. Mobile Compact</h3>
          <BrandLogo variant="dark" size="compact" />
        </div>

      </div>
    </div>
  );
}

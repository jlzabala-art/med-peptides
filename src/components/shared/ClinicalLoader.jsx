import React from 'react';
import AtlasHealthLogo from '../brand/AtlasHealthLogo';

export default function ClinicalLoader() {
  return (
    <div
      style={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div style={{ animation: 'atlas-pulse 1.8s ease-in-out infinite' }}>
        <AtlasHealthLogo size={52} />
      </div>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, margin: 0 }}>Loading…</p>
      <div
        style={{
          width: 100,
          height: 3,
          borderRadius: 99,
          background: 'rgba(0,54,102,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 99,
            background: 'linear-gradient(90deg,#003666,#00BCD4)',
            animation: 'atlas-shimmer 1.4s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes atlas-pulse { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
        @keyframes atlas-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}

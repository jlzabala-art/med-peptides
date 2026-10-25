'use client';

import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <div style={{ position: 'relative' }}>
          <AtlasHealthLogo size={54} animate={true} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '1.20rem',
              fontWeight: 800,
              color: '#003666',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
            }}
          >
            <span>Atlas Health</span>
            <span style={{ color: '#0284c7', fontWeight: 600 }}>Services</span>
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: '#64748b',
              marginTop: '4px',
              fontWeight: 500,
            }}
          >
            Clinical & Healthcare Intelligence
          </div>
        </div>

        {/* Shimmer loading progress bar */}
        <div
          style={{
            width: '180px',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden',
            marginTop: '8px',
          }}
        >
          <div className="atlas-loading-bar" />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loadingShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .atlas-loading-bar {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, #0284c7, transparent);
          animation: loadingShimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

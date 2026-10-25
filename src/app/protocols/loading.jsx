import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function ProtocolsDirectoryLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          height: '56px',
          backgroundColor: '#003666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AtlasHealthLogo size={28} variant="light" />
          <div style={{ width: '160px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} className="pds-shimmer" />
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ width: '130px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '11px' }} className="pds-shimmer" />
        <div style={{ width: '60%', height: '36px', backgroundColor: '#cbd5e1', borderRadius: '8px' }} className="pds-shimmer" />

        {/* Protocols Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ height: '240px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }} className="pds-shimmer" />
          <div style={{ height: '240px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }} className="pds-shimmer" />
          <div style={{ height: '240px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }} className="pds-shimmer" />
          <div style={{ height: '240px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }} className="pds-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes pdsShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .pds-shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
          background-size: 200% 100%;
          animation: pdsShimmer 1.4s ease infinite;
        }
      `}</style>
    </div>
  );
}

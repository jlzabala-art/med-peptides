import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function VerifyBatchLoading() {
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
          <div style={{ width: '140px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} className="pds-shimmer" />
        </div>
      </div>

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '32px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Certificate Card Skeleton */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e2e8f0' }} className="pds-shimmer" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ width: '220px', height: '24px', backgroundColor: '#cbd5e1', borderRadius: '4px' }} className="pds-shimmer" />
              <div style={{ width: '140px', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ height: '64px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
            <div style={{ height: '64px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
            <div style={{ height: '64px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
          </div>

          {/* Chromatogram / HPLC Chart Placeholder Skeleton */}
          <div style={{ height: '260px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px' }} className="pds-shimmer" />
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

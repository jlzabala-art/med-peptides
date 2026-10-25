import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function DoctorPortalLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Header */}
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
          <div style={{ width: '130px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} className="pds-shimmer" />
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Doctor Profile Hero Skeleton */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              flexShrink: 0,
            }}
            className="pds-shimmer"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div style={{ width: '120px', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
            <div style={{ width: '280px', height: '32px', backgroundColor: '#cbd5e1', borderRadius: '6px' }} className="pds-shimmer" />
            <div style={{ width: '200px', height: '16px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
          </div>
          <div style={{ width: '160px', height: '42px', backgroundColor: '#e2e8f0', borderRadius: '8px' }} className="pds-shimmer" />
        </div>

        {/* Clinical Protocols Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ height: '220px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }} className="pds-shimmer" />
          <div style={{ height: '220px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }} className="pds-shimmer" />
          <div style={{ height: '220px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }} className="pds-shimmer" />
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

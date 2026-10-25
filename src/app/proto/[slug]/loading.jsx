import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function ProtocolLoading() {
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
          <div style={{ width: '140px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} className="pds-shimmer" />
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px 16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Breadcrumb Skeleton */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ width: '60px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} className="pds-shimmer" />
          <span style={{ color: '#cbd5e1' }}>/</span>
          <div style={{ width: '90px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} className="pds-shimmer" />
          <span style={{ color: '#cbd5e1' }}>/</span>
          <div style={{ width: '150px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} className="pds-shimmer" />
        </div>

        {/* Header Banner Skeleton */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '110px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '9999px' }} className="pds-shimmer" />
            <div style={{ width: '80px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '9999px' }} className="pds-shimmer" />
          </div>
          <div style={{ width: '70%', height: '38px', backgroundColor: '#cbd5e1', borderRadius: '8px', marginBottom: '1rem' }} className="pds-shimmer" />
          <div style={{ width: '90%', height: '16px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} className="pds-shimmer" />
          <div style={{ width: '65%', height: '16px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
        </div>

        {/* Content Blocks Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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

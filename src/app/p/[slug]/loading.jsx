import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function ProductLoading() {
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
          <div style={{ width: '80px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} className="pds-shimmer" />
          <span style={{ color: '#cbd5e1' }}>/</span>
          <div style={{ width: '120px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} className="pds-shimmer" />
        </div>

        {/* Main 2-Column Hero Skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
            marginBottom: '2rem',
          }}
        >
          {/* Left: Visual Card Skeleton */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              minHeight: '380px',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '180px',
                height: '240px',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
              }}
              className="pds-shimmer"
            />
            <div
              style={{
                width: '140px',
                height: '24px',
                backgroundColor: '#e2e8f0',
                borderRadius: '9999px',
              }}
              className="pds-shimmer"
            />
          </div>

          {/* Right: Info / Details Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Badge */}
            <div style={{ width: '130px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '9999px' }} className="pds-shimmer" />

            {/* Title */}
            <div style={{ width: '75%', height: '36px', backgroundColor: '#cbd5e1', borderRadius: '8px' }} className="pds-shimmer" />

            {/* Subtitle / Chemical name */}
            <div style={{ width: '50%', height: '18px', backgroundColor: '#f1f5f9', borderRadius: '6px' }} className="pds-shimmer" />

            {/* Key Specs Row */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1, height: '64px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
              <div style={{ flex: 1, height: '64px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
              <div style={{ flex: 1, height: '64px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
            </div>

            {/* Paragraph Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ width: '100%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
              <div style={{ width: '95%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
              <div style={{ width: '85%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
            </div>

            {/* Button CTA Skeleton */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ width: '160px', height: '44px', backgroundColor: '#003666', opacity: 0.15, borderRadius: '10px' }} className="pds-shimmer" />
              <div style={{ width: '140px', height: '44px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
            </div>
          </div>
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

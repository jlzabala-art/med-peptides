import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function NutritionistPortalLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Top Header with Clinical Green Accent */}
      <div
        style={{
          height: '56px',
          backgroundColor: '#15803d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AtlasHealthLogo size={28} variant="light" />
          <div
            style={{
              width: '180px',
              height: '16px',
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderRadius: '4px'
            }}
            className="pds-shimmer"
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '24px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Hero Card Skeleton */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0'
            }}
            className="pds-shimmer"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ width: '240px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} className="pds-shimmer" />
            <div style={{ width: '380px', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
          </div>
        </div>

        {/* 4 KPIs Grid Skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: '88px',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '16px'
              }}
              className="pds-shimmer"
            />
          ))}
        </div>

        {/* Table Skeleton */}
        <div
          style={{
            height: '360px',
            backgroundColor: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px'
          }}
          className="pds-shimmer"
        />
      </div>
    </div>
  );
}


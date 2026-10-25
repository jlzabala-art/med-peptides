import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';
import GridSkeleton from '../../../components/ui/skeletons/GridSkeleton';

export default function CollectionLoading() {
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
          <div style={{ width: '150px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} className="pds-shimmer" />
        </div>
      </div>

      <div style={{ padding: '24px 16px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ width: '220px', height: '36px', marginBottom: '24px', backgroundColor: '#cbd5e1', borderRadius: '8px' }} className="pds-shimmer" />
        <GridSkeleton cards={8} cardHeight="320px" />
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

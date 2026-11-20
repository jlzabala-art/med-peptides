import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';
import './DoctorPublicPortal.css';

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

      {/* Matches .gcp-portal-layout + .gcp-clinical-sidebar to prevent layout shift */}
      <div className="gcp-portal-layout">
        <aside className="gcp-clinical-sidebar" aria-hidden="true" style={{ padding: '16px 14px', gap: '10px', justifyContent: 'flex-start' }}>
          {[140, 120, 150, 110, 135, 125].map((w, idx) => (
            <div key={idx} style={{ width: `${w}px`, height: '18px', borderRadius: '4px', marginBottom: '6px' }} className="pds-shimmer" />
          ))}
        </aside>

        <div className="gcp-portal-main" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0 }} className="pds-shimmer" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '220px' }}>
              <div style={{ width: '120px', height: '18px', borderRadius: '10px' }} className="pds-shimmer" />
              <div style={{ width: '260px', height: '28px', borderRadius: '6px' }} className="pds-shimmer" />
              <div style={{ width: '190px', height: '14px', borderRadius: '4px' }} className="pds-shimmer" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ height: '180px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} className="pds-shimmer" />
            <div style={{ height: '180px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} className="pds-shimmer" />
            <div style={{ height: '180px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} className="pds-shimmer" />
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

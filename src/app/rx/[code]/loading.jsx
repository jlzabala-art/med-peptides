import React from 'react';
import AtlasHealthLogo from '@/components/brand/AtlasHealthLogo';

export default function PrescriptionLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Header Bar */}
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
          <div style={{ width: '120px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} className="pds-shimmer" />
        </div>
        <div style={{ width: '90px', height: '24px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} className="pds-shimmer" />
      </div>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '24px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Prescription Header Dossier Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '140px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '11px' }} className="pds-shimmer" />
              <div style={{ width: '280px', height: '28px', backgroundColor: '#cbd5e1', borderRadius: '6px' }} className="pds-shimmer" />
              <div style={{ width: '180px', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} className="pds-shimmer" />
            </div>
            <div style={{ width: '120px', height: '36px', backgroundColor: '#e2e8f0', borderRadius: '8px' }} className="pds-shimmer" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
            <div style={{ height: '70px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
            <div style={{ height: '70px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
            <div style={{ height: '70px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} className="pds-shimmer" />
          </div>
        </div>

        {/* Prescription Medication Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ width: '220px', height: '20px', backgroundColor: '#cbd5e1', borderRadius: '4px' }} className="pds-shimmer" />
          <div style={{ height: '140px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }} className="pds-shimmer" />
          <div style={{ height: '140px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }} className="pds-shimmer" />
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

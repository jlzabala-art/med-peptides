import React from 'react';

export default function ProtocolLoading() {
  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ width: '60px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
        <span style={{ color: '#cbd5e1' }}>/</span>
        <div style={{ width: '90px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
        <span style={{ color: '#cbd5e1' }}>/</span>
        <div style={{ width: '150px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
      </div>

      {/* Header Banner */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '100px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '9999px' }} />
          <div style={{ width: '80px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '9999px' }} />
        </div>
        <div style={{ width: '70%', height: '38px', backgroundColor: '#cbd5e1', borderRadius: '8px', marginBottom: '1rem' }} />
        <div style={{ width: '90%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '0.5rem' }} />
        <div style={{ width: '65%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
      </div>

      {/* Content Blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ height: '220px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
        <div style={{ height: '220px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
        <div style={{ height: '220px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

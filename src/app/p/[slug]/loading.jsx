import React from 'react';

export default function ProductLoading() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Breadcrumb Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ width: '60px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
        <span style={{ color: '#cbd5e1' }}>/</span>
        <div style={{ width: '80px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
        <span style={{ color: '#cbd5e1' }}>/</span>
        <div style={{ width: '120px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
      </div>

      {/* Main 2-Column Hero Skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start',
        marginBottom: '3rem'
      }}>
        {/* Left: Image / Visual Card Skeleton */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          minHeight: '380px',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '180px',
            height: '240px',
            backgroundColor: '#e2e8f0',
            borderRadius: '12px'
          }} />
          <div style={{
            width: '140px',
            height: '24px',
            backgroundColor: '#e2e8f0',
            borderRadius: '9999px'
          }} />
        </div>

        {/* Right: Info / Details Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Badge */}
          <div style={{ width: '130px', height: '22px', backgroundColor: '#e2e8f0', borderRadius: '9999px' }} />

          {/* Title */}
          <div style={{ width: '75%', height: '36px', backgroundColor: '#e2e8f0', borderRadius: '8px' }} />
          
          {/* Subtitle / Chemical name */}
          <div style={{ width: '50%', height: '18px', backgroundColor: '#f1f5f9', borderRadius: '6px' }} />

          {/* Key Specs Row */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ flex: 1, height: '60px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
            <div style={{ flex: 1, height: '60px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
            <div style={{ flex: 1, height: '60px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
          </div>

          {/* Paragraph Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ width: '100%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
            <div style={{ width: '95%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
            <div style={{ width: '85%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
          </div>

          {/* Button CTA Skeleton */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ width: '160px', height: '44px', backgroundColor: '#cbd5e1', borderRadius: '10px' }} />
            <div style={{ width: '140px', height: '44px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

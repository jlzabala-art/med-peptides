import React from 'react';

export default function TabSkeleton() {
  return (
    <div style={{ padding: '2rem' }}>
      <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.25rem', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '1.5rem', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: 240, borderRadius: 12, backgroundColor: '#e2e8f0' }} />
    </div>
  );
}

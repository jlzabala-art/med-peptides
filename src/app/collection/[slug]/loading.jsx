import React from 'react';
import GridSkeleton from '../../../components/ui/skeletons/GridSkeleton';

export default function Loading() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ width: '200px', height: '40px', marginBottom: '2rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }} className="skeleton" />
      <GridSkeleton cards={8} cardHeight="350px" />
    </div>
  );
}

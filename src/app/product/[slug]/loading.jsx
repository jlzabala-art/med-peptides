import React from 'react';
import Skeleton from '../../../components/ui/Skeleton';

export default function Loading() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4rem', flexDirection: 'row' }}>
      {/* Image Skeleton */}
      <div style={{ flex: 1 }}>
         <Skeleton width="100%" height="500px" style={{ borderRadius: '16px' }} />
      </div>
      {/* Content Skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '2rem' }}>
         <Skeleton width="80%" height="48px" />
         <Skeleton width="30%" height="32px" style={{ marginBottom: '1rem' }} />
         
         <Skeleton width="100%" height="16px" />
         <Skeleton width="100%" height="16px" />
         <Skeleton width="90%" height="16px" />
         <Skeleton width="60%" height="16px" style={{ marginBottom: '2rem' }} />

         <div style={{ display: 'flex', gap: '1rem' }}>
           <Skeleton width="150px" height="56px" style={{ borderRadius: '8px' }} />
           <Skeleton width="200px" height="56px" style={{ borderRadius: '8px' }} />
         </div>
      </div>
    </div>
  );
}

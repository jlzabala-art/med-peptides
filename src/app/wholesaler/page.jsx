'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardEngine from '../../engine/DashboardEngine';

export default function WholesalerRootPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <DashboardEngine role="wholesaler" dataContext={{}} />
    </div>
  );
}
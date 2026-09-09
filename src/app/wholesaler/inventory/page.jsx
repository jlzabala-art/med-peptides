"use client";

import React from 'react';
import RealTimeStockManagerWidget from '../../../components/wholesaler/gadgets/RealTimeStockManagerWidget';

export default function InventoryPage() {
  return (
    <div style={{ padding: '0.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <RealTimeStockManagerWidget />
    </div>
  );
}

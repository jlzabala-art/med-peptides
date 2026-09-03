"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const Calculator = dynamic(() => import('../../templates/Calculator'), { 
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
      Loading Precision Calculator...
    </div>
  )
});

export default function CalculatorRoute() {
  return <Calculator />;
}

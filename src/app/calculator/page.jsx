"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { ToolWorkspaceLayout } from '@/components/shared/layouts';
import { Calculator as CalculatorIcon } from '@/lib/icons';

const Calculator = dynamic(() => import('../../templates/Calculator'), { 
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
      Loading Precision Calculator...
    </div>
  )
});

export default function CalculatorRoute() {
  return (
    <ToolWorkspaceLayout
      title="Peptide Reconstitution & Dosing Calculator"
      subtitle="Precision clinical calculation for lyophilized vials, bacteriostatic water, and syringe units"
      icon={CalculatorIcon}
      showPublicHeader={false}
    >
      <Calculator />
    </ToolWorkspaceLayout>
  );
}

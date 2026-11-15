"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { ToolWorkspaceLayout } from '@/components/shared/layouts';
import { Calculator as CalculatorIcon } from '@/lib/icons';
import TemplateSkeleton from '@/components/shared/public/TemplateSkeleton';

const Calculator = dynamic(() => import('../../templates/Calculator'), {
  ssr: false,
  loading: () => <TemplateSkeleton variant="detail" />,
});

export default function CalculatorClient() {
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

import React from 'react';
import CalculatorClient from './CalculatorClient';

export const metadata = {
  title: 'Peptide Reconstitution & Dosing Calculator • Atlas Health Services',
  description: 'Precision clinical calculation for lyophilized vials, bacteriostatic water, and syringe units.',
};

export default function CalculatorRoute() {
  return <CalculatorClient />;
}

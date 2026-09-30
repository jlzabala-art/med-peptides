import React from 'react';
import PublicPrescriptionIntakeClient from '../rx/intake/PublicPrescriptionIntakeClient';

export const metadata = {
  title: 'Prescription & Fagron Genomics Intake Portal | Atlas Clinical Platform',
  description: 'Public clinical portal for multimodal AI digitization, compounded formula extraction, and verification of medical prescriptions and Fagron Genomics reports (TrichoTest, NutriGen).',
};

export default function IntakeAliasPage() {
  return <PublicPrescriptionIntakeClient />;
}

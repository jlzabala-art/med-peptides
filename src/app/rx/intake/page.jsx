import React from 'react';
import PublicPrescriptionIntakeClient from './PublicPrescriptionIntakeClient';

export const metadata = {
  title: 'Prescription & Fagron Genomics Intake Portal | Atlas Clinical Platform',
  description: 'Public clinical portal for multimodal AI digitization, compounded formula extraction, and verification of medical prescriptions and Fagron Genomics reports (TrichoTest, NutriGen).',
  openGraph: {
    title: 'Prescription & Fagron Genomics Intake Portal | Atlas Clinical',
    description: 'Upload prescriptions or genetic reports for instant clinical digitization and electronic prescription generation with zero registration.',
    type: 'website',
  }
};

export default function PublicPrescriptionIntakePage() {
  return <PublicPrescriptionIntakeClient />;
}

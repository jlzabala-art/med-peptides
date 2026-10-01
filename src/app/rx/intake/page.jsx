import React from 'react';
import PublicPrescriptionIntakeClient from './PublicPrescriptionIntakeClient';

export const metadata = {
  title: 'Autonomous Clinical Prescription Intake Engine | Atlas System',
  description: 'Public clinical portal for multimodal AI digitization, compounded formula extraction, and verification of medical prescriptions, pharmacopeia standards, and pharmacogenomic reports with Atlas System.',
  openGraph: {
    title: 'Autonomous Clinical Prescription Intake Engine | Atlas System',
    description: 'Upload prescriptions or medical reports for instant clinical digitization and electronic prescription generation powered by Atlas System.',
    type: 'website',
  }
};

export default function PublicPrescriptionIntakePage() {
  return <PublicPrescriptionIntakeClient />;
}

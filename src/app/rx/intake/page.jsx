import React from 'react';
import PublicPrescriptionIntakeClient from './PublicPrescriptionIntakeClient';

export const metadata = {
  title: 'Digitalización de Prescripciones & Fagron Genomics | Atlas Clinical Platform',
  description: 'Portal público para la digitalización, extracción multimodal con IA y verificación clínica de recetas médicas e informes Fagron Genomics (TrichoTest, NutriGen).',
  openGraph: {
    title: 'Digitalización de Prescripciones & Fagron Genomics | Atlas Clinical',
    description: 'Suba recetas o informes genéticos para su digitalización y validación clínica inmediata sin necesidad de registro.',
    type: 'website',
  }
};

export default function PublicPrescriptionIntakePage() {
  return <PublicPrescriptionIntakeClient />;
}

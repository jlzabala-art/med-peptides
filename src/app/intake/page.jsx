import React from 'react';
import PublicPrescriptionIntakeClient from '../rx/intake/PublicPrescriptionIntakeClient';

export const metadata = {
  title: 'Digitalización de Prescripciones & Fagron Genomics | Atlas Clinical Platform',
  description: 'Portal público para la digitalización, extracción multimodal con IA y verificación clínica de recetas médicas e informes Fagron Genomics (TrichoTest, NutriGen).',
};

export default function IntakeAliasPage() {
  return <PublicPrescriptionIntakeClient />;
}

import React from 'react';
import { notFound } from 'next/navigation';
import { getPrescriptionData } from '@/lib/prescriptionFetcher';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import RxLabelsStandaloneClient from './RxLabelsStandaloneClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const code = resolvedParams?.code || '';
  const rx = await getPrescriptionData(code);

  const patientName = rx?.patient?.name || rx?.patientName || 'Patient';
  const rxCode = rx?.fileNumber || rx?.code || code;
  const isEditing = resolvedSearchParams?.edit === 'true' || resolvedSearchParams?.edit === '1';

  const title = `${isEditing ? 'Editor de Etiquetas' : 'Etiquetas Oficiales'} • #${rxCode} (${patientName}) • Pharmapolis Compounding`;
  const description = `Editor interactivo y generador de etiquetas de formulación magistral EU GMP para la prescripción #${rxCode}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/rx/${code}/labels`,
      siteName: 'Pharmapolis Compounding Pharmacy',
      type: 'website'
    },
    robots: { index: false, follow: false }
  };
}

export default async function RxLabelsStandalonePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const code = resolvedParams?.code;
  const initialEditMode = resolvedSearchParams?.edit === 'true' || resolvedSearchParams?.edit === '1';
  const initialPhaseIdx = Number(resolvedSearchParams?.phase) ? Math.max(0, Number(resolvedSearchParams.phase) - 1) : 0;

  const rx = await getPrescriptionData(code);

  if (!rx) {
    notFound();
  }

  // Derive compounding labels for this prescription
  const labels = getPharmapolisLabelsForPrescription(rx);

  return (
    <RxLabelsStandaloneClient
      rx={rx}
      labels={labels}
      code={code}
      initialEditMode={initialEditMode}
      initialLabelIndex={initialPhaseIdx}
    />
  );
}

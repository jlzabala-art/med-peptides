import React from 'react';
import { getPrescriptionData } from '@/lib/prescriptionFetcher';
import { getPharmapolisLabelsForPrescription, PHARMAPOLIS_LABELS_REGISTRY } from '@/data/pharmapolisLabelsMap';
import PublicLabelsAppClient from './PublicLabelsAppClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasExplicitParam = Boolean(resolvedSearchParams?.rx || resolvedSearchParams?.code);
  const code = hasExplicitParam ? (resolvedSearchParams?.rx || resolvedSearchParams?.code || '').trim() : '';
  const isEs = String(resolvedSearchParams?.lang || '').toLowerCase() === 'es';

  const rxCode = code;

  const title = isEs
    ? (rxCode
        ? `Prescripciones y Estudio de Etiquetas • #${rxCode} • Atlas Health`
        : `Prescripciones y Estudio de Etiquetas • Atlas Health`)
    : (rxCode
        ? `Prescriptions & Label Studio • #${rxCode} • Atlas Health`
        : `Prescriptions & Label Studio • Atlas Health`);

  const description = isEs
    ? `Estación clínica de prescripciones magistrales, gestión de refills y diseño de etiquetas farmacéuticas EU GMP (PDF vectorial, pliegos A4 y ZPL térmico).`
    : `Clinical compounding prescriptions hub, refill management, and EU GMP vector pharmaceutical label studio (Vector PDF, A4 Sheets, Zebra thermal).`;

  const canonicalUrl = `${BASE_URL}/labels${code ? `?rx=${encodeURIComponent(code)}` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Atlas Health · Prescriptions & Label Studio',
      locale: isEs ? 'es_ES' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/api/og-card?title=${encodeURIComponent('Compounding Label Studio')}&subtitle=${encodeURIComponent(rxCode ? `Prescription #${rxCode}` : 'EU GMP Vector Printing')}`,
          width: 1200,
          height: 630,
          alt: 'Compounding Label Studio Preview'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@AtlasHealth'
    },
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function PublicLabelsPage({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasExplicitParam = Boolean(resolvedSearchParams?.rx || resolvedSearchParams?.code);
  const rawCodesParam = (resolvedSearchParams?.rx || resolvedSearchParams?.code || '').trim();
  const codes = rawCodesParam.split(',').map(c => c.trim()).filter(Boolean);
  const primaryCode = codes[0] || '';
  const initialEditMode = resolvedSearchParams?.edit === 'true' || resolvedSearchParams?.edit === '1';
  const initialPhaseIdx = Number(resolvedSearchParams?.phase) ? Math.max(0, Number(resolvedSearchParams.phase) - 1) : 0;
  const initialLang = resolvedSearchParams?.lang === 'es' ? 'es' : 'en';

  const initialQueue = [];

  if (hasExplicitParam && codes.length > 0) {
    const settled = await Promise.allSettled(
      codes.map(async (c) => {
        let itemRx = await getPrescriptionData(c);
        if (!itemRx) {
          const regMatch = PHARMAPOLIS_LABELS_REGISTRY.find(item => item.fileNumber === c);
          if (regMatch) {
            itemRx = {
              id: regMatch.fileNumber || c,
              fileNumber: regMatch.fileNumber || c,
              code: regMatch.fileNumber || c,
              patientName: regMatch.patientName || 'Patient',
              patient: { name: regMatch.patientName || 'Patient' },
              doctorName: regMatch.doctorName || 'Treating Physician',
              clinicName: regMatch.clinicName || 'Atlas Partner Clinic',
              treatmentTitle: regMatch.productTitle || regMatch.productName || 'Compounded Protocol',
              status: 'approved'
            };
          }
        }
        if (!itemRx) return null;
        const itemLabels = getPharmapolisLabelsForPrescription(itemRx);
        return {
          code: c,
          rx: itemRx,
          labels: itemLabels || []
        };
      })
    );

    settled.forEach((res, idx) => {
      if (res.status === 'fulfilled' && res.value) {
        initialQueue.push(res.value);
      } else if (res.status === 'rejected') {
        console.warn(`[PublicLabelsPage] Error loading rx code ${codes[idx]}:`, res.reason?.message || res.reason);
      }
    });
  }

  const primaryItem = initialQueue[0] || null;

  return (
    <PublicLabelsAppClient
      initialRx={primaryItem?.rx || null}
      initialLabels={primaryItem?.labels || []}
      initialCode={primaryItem?.code || primaryCode || ''}
      initialQueue={initialQueue}
      initialEditMode={initialEditMode}
      initialLabelIndex={initialPhaseIdx}
      initialLang={initialLang}
    />
  );
}

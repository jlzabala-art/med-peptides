import React from 'react';
import { getPrescriptionData } from '@/lib/prescriptionFetcher';
import { getPharmapolisLabelsForPrescription, PHARMAPOLIS_LABELS_REGISTRY } from '@/data/pharmapolisLabelsMap';
import PublicLabelsAppClient from './PublicLabelsAppClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const code = (resolvedSearchParams?.rx || resolvedSearchParams?.code || '51812').trim();
  const isEditing = resolvedSearchParams?.edit === 'true' || resolvedSearchParams?.edit === '1';
  const lang = resolvedSearchParams?.lang || 'en';
  const isEs = lang === 'es';

  let patientName = '';
  let rxCode = code;

  // Try to load basic info for attractive metadata
  try {
    const rx = await getPrescriptionData(code);
    if (rx) {
      patientName = rx.patient?.name || rx.patientName || '';
      rxCode = rx.fileNumber || rx.code || code;
    } else {
      const regMatch = PHARMAPOLIS_LABELS_REGISTRY.find(item => item.fileNumber === code);
      if (regMatch) {
        patientName = regMatch.patientName || '';
        rxCode = regMatch.fileNumber || code;
      }
    }
  } catch (err) {
    // fallback
  }

  const title = patientName 
    ? `Compounding Label Studio • #${rxCode} (${patientName}) • Pharmapolis & Atlas Health`
    : `Compounding Label Studio • Pharmapolis & Atlas Health`;

  const description = `Professional EU GMP vector compounding label designer & pharmacy print studio. Search patients, customize formulas, and export high-resolution pharmaceutical labels (300 DPI, Vector PDF, A4 Sheets, Zebra thermal).`;

  const canonicalUrl = `${BASE_URL}/labels${code ? `?rx=${encodeURIComponent(code)}` : ''}`;

  return {
    title,
    description,
    keywords: [
      'compounding pharmacy labels',
      'EU GMP labels',
      'pharma label studio',
      'formulación magistral',
      'vector label designer',
      'Zebra thermal pharmacy label',
      'A4 label sheet print',
      'Pharmapolis',
      'Atlas Health'
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Pharmapolis Compounding Pharmacy • Atlas Health',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/api/og-card?title=${encodeURIComponent('Compounding Label Studio')}&subtitle=${encodeURIComponent(patientName ? `#${rxCode} · ${patientName}` : 'EU GMP Vector Printing')}`,
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
      index: true,
      follow: true
    }
  };
}

export default async function PublicLabelsPage({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawCodesParam = (resolvedSearchParams?.rx || resolvedSearchParams?.code || '51812').trim();
  const codes = rawCodesParam.split(',').map(c => c.trim()).filter(Boolean);
  const primaryCode = codes[0] || '51812';
  const initialEditMode = resolvedSearchParams?.edit === 'true' || resolvedSearchParams?.edit === '1';
  const initialPhaseIdx = Number(resolvedSearchParams?.phase) ? Math.max(0, Number(resolvedSearchParams.phase) - 1) : 0;
  const initialLang = resolvedSearchParams?.lang || 'en';

  const initialQueue = [];

  for (const c of codes) {
    try {
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
      if (itemRx) {
        const itemLabels = getPharmapolisLabelsForPrescription(itemRx);
        initialQueue.push({
          code: c,
          rx: itemRx,
          labels: itemLabels || []
        });
      }
    } catch (err) {
      console.warn(`[PublicLabelsPage] Error loading rx code ${c}:`, err.message);
    }
  }

  // Fallback to default registry if empty
  if (initialQueue.length === 0 && PHARMAPOLIS_LABELS_REGISTRY.length > 0) {
    const regDefault = PHARMAPOLIS_LABELS_REGISTRY[0];
    const defaultRx = {
      id: regDefault.fileNumber || '51812',
      fileNumber: regDefault.fileNumber || '51812',
      code: regDefault.fileNumber || '51812',
      patientName: regDefault.patientName || 'Patient',
      patient: { name: regDefault.patientName || 'Patient' },
      doctorName: regDefault.doctorName || 'Treating Physician',
      clinicName: regDefault.clinicName || 'Atlas Partner Clinic',
      treatmentTitle: regDefault.productTitle || 'Compounded Pharmaceutical Protocol',
      status: 'approved'
    };
    initialQueue.push({
      code: regDefault.fileNumber || '51812',
      rx: defaultRx,
      labels: getPharmapolisLabelsForPrescription(defaultRx)
    });
  }

  const primaryItem = initialQueue[0] || {};

  return (
    <PublicLabelsAppClient
      initialRx={primaryItem.rx}
      initialLabels={primaryItem.labels || []}
      initialCode={primaryItem.code || primaryCode}
      initialQueue={initialQueue}
      initialEditMode={initialEditMode}
      initialLabelIndex={initialPhaseIdx}
      initialLang={initialLang}
    />
  );
}

import React, { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
import PublicPrescriptionClient from './PublicPrescriptionClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

import { getPrescriptionData, invalidateRxCache } from '@/lib/prescriptionFetcher';
export { invalidateRxCache };


export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code || '';
  const rx = await getPrescriptionData(code);

  const patientName = rx?.patient?.name || rx?.patientName || 'Patient';
  const treatingDocName = typeof rx?.treatingDoctor === 'string' ? rx.treatingDoctor : rx?.treatingDoctor?.name;
  const doctor = treatingDocName || rx?.doctor?.name || rx?.doctorName || rx?.prescribingDoctor || null;
  const treatingDocClinic = typeof rx?.treatingDoctor === 'object' ? rx?.treatingDoctor?.clinic : null;
  let clinic = treatingDocClinic || rx?.doctor?.clinic || rx?.clinic || 'Atlas Health Services';
  if (clinic.toLowerCase().includes('mediluxe') || clinic.toLowerCase().includes('bedaya')) {
    clinic = 'Atlas Health Services';
  }

  // 1. Build dynamic quick explanation for WhatsApp
  let formulaSummary = '';
  const rawItems = rx?.items || rx?.compounds || [];
  if (rawItems.length > 0) {
    const activeItems = rawItems
      .filter(i => i && i.itemType !== 'vehicle_base' && i.itemType !== 'consumable')
      .map(i => {
        const itemName = i.name || i.productName || i.activeIngredient || '';
        const conc = i.concentration || i.dosage || '';
        if (!itemName) return conc || '';
        return `${itemName}${conc && !itemName.includes(conc) ? ` ${conc}` : ''}`;
      })
      .filter(Boolean);
    const vehicle = rawItems.find(i => i && i.itemType === 'vehicle_base');
    const vehicleName = vehicle?.name || vehicle?.productName || vehicle?.activeIngredient || '';
    const activeStr = activeItems.length > 0 
      ? activeItems.join(' + ') 
      : rawItems.map(i => i?.name || i?.productName || i?.activeIngredient || '').filter(Boolean).join(' + ');
    formulaSummary = vehicleName ? `${activeStr} in ${vehicleName}` : activeStr;
  } else if (rx?.formulaName || rx?.title) {
    formulaSummary = rx.formulaName || rx.title;
  }

  const rawPos = rx?.structuredPosology?.summary || rx?.posology || rx?.dosageSchedule || '';
  const posologySummary = typeof rawPos === 'object' ? (rawPos.regimen || rawPos.summary || rawPos.timing || rawPos.notes || '') : String(rawPos || '');
  const packSummary = rx?.structuredPosology?.packLabel || '';

  let description = '';
  if (formulaSummary) {
    description = `Formula: ${formulaSummary}${packSummary ? ` (${packSummary})` : ''}. `;
    if (posologySummary) {
      description += `Posology: ${posologySummary}. `;
    }
    description += doctor ? `Prescribed by ${doctor} • Atlas Health Services.` : `Atlas Health Services.`;
  } else {
    description = doctor 
      ? `Official datasheet and posology protocol for ${patientName}. Prescribed by ${doctor} (${clinic}). Atlas Health Services.`
      : `Official datasheet and posology protocol for ${patientName}. Atlas Health Services.`;
  }

  // Clamped to WhatsApp's optimal preview length
  if (description.length > 200) {
    description = description.slice(0, 197).trim() + '...';
  }

  const title = `Medical Prescription #${code} • Atlas Health Services`;
  const ogLogoUrl = `${BASE_URL}/atlas-health-logo-wa.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/rx/${code}`,
      siteName: 'Atlas Health Services',
      type: 'article',
      images: [
        {
          url: ogLogoUrl,
          width: 400,
          height: 400,
          type: 'image/png',
          alt: 'Atlas Health Services'
        }
      ]
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [ogLogoUrl]
    },
    other: {
      'og:image': ogLogoUrl,
      'og:image:secure_url': ogLogoUrl,
      'og:image:type': 'image/png',
      'og:image:width': '400',
      'og:image:height': '400',
      'og:image:alt': 'Atlas Health Services',
      'whatsapp:title': title,
      'whatsapp:description': description,
      'whatsapp:image': ogLogoUrl
    },
    robots: { index: false, follow: true }
  };
}

export default async function PublicPrescriptionPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const code = resolvedParams?.code;
  const initialView = resolvedSearchParams?.view || resolvedSearchParams?.mode || null;

  if (code?.toLowerCase() === 'intake') {
    redirect('/rx/intake');
  }

  const rx = await getPrescriptionData(code);

  if (!rx) {
    notFound();
  }

  return <PublicPrescriptionClient rx={rx} initialView={initialView} />;
}

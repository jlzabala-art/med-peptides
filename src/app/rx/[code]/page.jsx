import React, { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { serverConfig } from '@/authConfig';
import { adminDb } from '@/lib/firebaseAdmin';
import PublicPrescriptionClient from './PublicPrescriptionClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

import { 
  getPrescriptionData, 
  invalidateRxCache,
  sanitizePrescriptionCode,
  hasPatientSlugInCode,
  sanitizePrescriptionPayload
} from '@/lib/prescriptionFetcher';
import { getAuthoritativeClinicalData } from '@/data/pharmapolisLabelsMap';
export { invalidateRxCache };

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const lang = String(resolvedSearch?.lang || '').toLowerCase() === 'es' ? 'es' : 'en';
  const isEs = lang === 'es';
  const isPatientView = String(resolvedSearch?.view || resolvedSearch?.mode || '').toLowerCase() === 'patient';
  const urlLot = resolvedSearch?.lot ? String(resolvedSearch.lot).trim() : '';
  const urlBud = resolvedSearch?.bud ? String(resolvedSearch.bud).trim() : '';
  const rawCode = resolvedParams?.code || '';
  const cleanCode = sanitizePrescriptionCode(rawCode);
  const rx = await getPrescriptionData(cleanCode || rawCode);

  // 1. Build formula summary without any personal or doctor PII
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
  const storageSummary = rx?.storage ? String(rx.storage).trim() : '';
  const lotSummary = urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode || '';
  const budSummary = urlBud || rx?.expDate || rx?.bud || '';

  let title = isEs
    ? `Expediente de Prescripción Clínica #${cleanCode} • Atlas Health Services`
    : `Clinical Prescription Dossier #${cleanCode} • Atlas Health Services`;

  let description = isEs
    ? 'Monografía verificada de formulación clínica y protocolo de posología farmacéutica. Verificación médica autorizada • Atlas Health Services.'
    : 'Verified clinical formulation monograph and pharmaceutical posology protocol. Authorized medical verification • Atlas Health Services.';

  if (isPatientView) {
    const cleanTreatmentName = rx?.treatmentTitle || formulaSummary || '';
    title = cleanTreatmentName
      ? `${cleanTreatmentName} · ${isEs ? 'Guía de Tratamiento' : 'Treatment Guide'}`
      : (isEs ? `Tu Guía de Tratamiento (#${cleanCode})` : `Your Treatment Guide (#${cleanCode})`);

    const patientParts = [];
    if (posologySummary) patientParts.push(posologySummary);
    if (storageSummary) patientParts.push(storageSummary);
    if (budSummary) patientParts.push(`${isEs ? 'Usar antes del' : 'Use before'}: ${budSummary}`);
    else if (lotSummary) patientParts.push(`Lot: ${lotSummary}`);

    description = patientParts.length > 0
      ? patientParts.join(' · ')
      : (isEs
          ? 'Consulta cómo tomar tu tratamiento, conservación y registro diario de dosis.'
          : 'View how to take your treatment, storage instructions, and your daily dose log.');
  } else if (formulaSummary) {
    description = `${isEs ? 'Fórmula' : 'Formula'}: ${formulaSummary}${packSummary ? ` (${packSummary})` : ''}. `;
    if (posologySummary) {
      description += `${isEs ? 'Posología' : 'Posology'}: ${posologySummary}. `;
    }
    description += isEs ? 'Atlas Health Services · Atención Médica Clínica.' : 'Atlas Health Services · Medical Practice Care.';
  }

  if (description.length > 200) {
    description = description.slice(0, 197).trim() + '...';
  }

  const ogLogoUrl = `${BASE_URL}/atlas-health-logo-wa.png`;
  const ogUrl = isPatientView
    ? `${BASE_URL}/rx/${encodeURIComponent(cleanCode)}?view=patient`
    : `${BASE_URL}/rx/${encodeURIComponent(cleanCode)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: ogUrl,
      siteName: isPatientView
        ? (isEs ? 'Guía de Tratamiento' : 'Treatment Guide')
        : (isEs ? 'Atlas Health Services · Formulario Clínico' : 'Atlas Health Services · Clinical Formulary'),
      locale: isEs ? 'es_ES' : 'en_US',
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
    robots: { index: false, follow: false, noarchive: true, nocache: true }
  };
}

export default async function PublicPrescriptionPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawCode = resolvedParams?.code;
  const initialView = resolvedSearchParams?.view || resolvedSearchParams?.mode || null;

  if (rawCode?.toLowerCase() === 'intake') {
    redirect('/rx/intake');
  }

  // 1. Strict HIPAA/DHA De-identification: Detect trailing patient names in URL
  const cleanCode = sanitizePrescriptionCode(rawCode);
  if (rawCode && cleanCode && rawCode.toLowerCase() !== cleanCode.toLowerCase()) {
    const qs = initialView ? `?view=${encodeURIComponent(initialView)}` : '';
    redirect(`/rx/${encodeURIComponent(cleanCode)}${qs}`);
  }

  const rx = await getPrescriptionData(cleanCode || rawCode);

  if (!rx) {
    notFound();
  }

  // 2. Server Authentication Verification (Admin, Doctor, Medical Director, Clinic)
  let isAuthorized = false;
  try {
    const cookieStore = await cookies();
    if (cookieStore.has(serverConfig.cookieName)) {
      const tokens = await getTokens(cookieStore, {
        apiKey: serverConfig.firebaseApiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
      });
      const role = String(tokens?.decodedToken?.role || '').toLowerCase();
      const email = String(tokens?.decodedToken?.email || '').toLowerCase().trim();
      if (
        ['admin', 'medical_director', 'doctor', 'clinic', 'account_manager', 'fagron_clinic', 'patient_coordinator'].includes(role) ||
        tokens?.decodedToken?.admin === true ||
        ['jlzabala@gmail.com', 'admin@atlashealth-services.com'].includes(email)
      ) {
        isAuthorized = true;
      }
    }
  } catch {
    // cookies not accessible or invalid, client-side auth will hydrate
  }

  // 3. Zero-Trust Server Sanitization: Strip nominal PII from SSR payload ONLY for unauthenticated public viewers
  const sanitizedRx = sanitizePrescriptionPayload(rx, { isAuthorized });

  return <PublicPrescriptionClient rx={sanitizedRx} initialView={initialView} />;
}

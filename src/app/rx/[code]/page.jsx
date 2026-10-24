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

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
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

  let description = 'Verified clinical formulation monograph and pharmaceutical posology protocol. Authorized medical verification • Atlas Health Services.';
  if (formulaSummary) {
    description = `Formula: ${formulaSummary}${packSummary ? ` (${packSummary})` : ''}. `;
    if (posologySummary) {
      description += `Posology: ${posologySummary}. `;
    }
    description += 'Atlas Health Services · Medical Practice Care.';
  }

  if (description.length > 200) {
    description = description.slice(0, 197).trim() + '...';
  }

  const title = `Clinical Prescription Dossier #${cleanCode} • Atlas Health Services`;
  const ogLogoUrl = `${BASE_URL}/atlas-health-logo-wa.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/rx/${encodeURIComponent(cleanCode)}`,
      siteName: 'Atlas Health Services · Clinical Formulary',
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

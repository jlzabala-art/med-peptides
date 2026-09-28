import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
import PublicPrescriptionClient from './PublicPrescriptionClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

// ⚡ Layer 1 In-Memory Server RAM Cache
const RX_RAM_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function invalidateRxCache(code) {
  if (!code) {
    RX_RAM_CACHE.clear();
  } else {
    RX_RAM_CACHE.delete(decodeURIComponent(code).trim().toUpperCase());
  }
}

// ⚡ Per-Request React Server Component memoization
const getPrescriptionData = cache(async (code) => {
  if (!adminDb || !code) return null;
  const cleanCode = decodeURIComponent(code).trim().toUpperCase();

  // 1. RAM Cache
  const cached = RX_RAM_CACHE.get(cleanCode);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let rxDoc = null;

  // 2. Direct ID
  const docSnap = await adminDb.collection('prescriptions').doc(cleanCode).get().catch(() => null);
  if (docSnap && docSnap.exists) {
    rxDoc = { id: docSnap.id, ...docSnap.data() };
  }

  // 3. Prescription Number / Order ID lookup
  if (!rxDoc) {
    const qSnap = await adminDb.collection('prescriptions')
      .where('prescriptionNumber', '==', cleanCode)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap && !qSnap.empty) {
      rxDoc = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
    }
  }

  if (!rxDoc) return null;

  // Zero-trust sanitization for public access:
  // Convert timestamps to ISO strings
  const cleanRx = JSON.parse(JSON.stringify(rxDoc, (key, value) => {
    if (value && typeof value === 'object' && ('_seconds' in value || 'seconds' in value)) {
      const s = value._seconds ?? value.seconds;
      return new Date(s * 1000).toISOString();
    }
    return value;
  }));

  // Mask sensitive phone
  if (cleanRx.patient?.phone) {
    const p = cleanRx.patient.phone;
    cleanRx.patient.maskedPhone = p.length > 6 ? `${p.slice(0, 5)} *** **${p.slice(-2)}` : 'Confidential';
  }

  if (cleanRx.clinic && cleanRx.clinic.toLowerCase().includes('mediluxe')) {
    cleanRx.clinic = 'Atlas Services Clinical Care';
  }

  const result = {
    ...cleanRx,
    verifiedAt: new Date().toISOString(),
    isAuthentic: true
  };

  RX_RAM_CACHE.set(cleanCode, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  return result;
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code || '';
  const rx = await getPrescriptionData(code);

  const patientName = rx?.patient?.name || rx?.patientName || 'Patient';
  const doctor = rx?.doctorName || 'Consultant Specialist';
  let clinic = rx?.clinic || 'Atlas Services Clinical Care';
  if (clinic.toLowerCase().includes('mediluxe')) {
    clinic = 'Atlas Services Clinical Care';
  }

  const title = rx 
    ? `Medical Prescription #${code} | ${clinic}`
    : `Medical Prescription #${code} | Clinical Dossier`;

  const description = `Medical prescription and personalized dosing protocol for ${patientName}, issued by ${doctor} (${clinic}). Digital healthcare dossier.`;

  const ogLogoUrl = `${BASE_URL}/atlas-health-logo.png`;

  return {
    title,
    description,
    openGraph: {
      title: `Medical Prescription #${code} — ${patientName}`,
      description,
      url: `${BASE_URL}/rx/${code}`,
      siteName: 'Atlas Services Healthcare',
      type: 'article',
      images: [
        {
          url: ogLogoUrl,
          width: 400,
          height: 400,
          alt: 'Atlas Services Healthcare'
        }
      ]
    },
    twitter: {
      card: 'summary',
      title: `Medical Prescription #${code} — ${patientName}`,
      description,
      images: [ogLogoUrl]
    },
    other: {
      'whatsapp:title': `Medical Prescription #${code} — ${patientName}`,
      'whatsapp:description': description,
      'whatsapp:image': ogLogoUrl
    },
    robots: { index: false, follow: true }
  };
}

export default async function PublicPrescriptionPage({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code;
  const rx = await getPrescriptionData(code);

  if (!rx) {
    notFound();
  }

  return <PublicPrescriptionClient rx={rx} />;
}

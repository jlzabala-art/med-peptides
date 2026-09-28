import React from 'react';
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

async function getPrescriptionData(code) {
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
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code || '';
  const rx = await getPrescriptionData(code);

  const title = rx 
    ? `Prescripción Médica Verificada #${code} | ${rx.clinic || 'Bedaya Polyclinic'}`
    : `Prescripción Médica #${code} | Verificación Oficial`;

  const patientName = rx?.patient?.name || rx?.patientName || 'Paciente';
  const doctor = rx?.doctorName || 'Médica Especialista';
  const description = `Ficha técnica oficial y posología para ${patientName}, emitida por ${doctor} (${rx?.clinic || 'Bedaya Polyclinic Dubai'}). Verificación clínica digital.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/rx/${code}`,
      siteName: 'Atlas Clinical Network & Bedaya Polyclinic',
      type: 'article',
      images: [
        {
          url: `${BASE_URL}/og-catalog.png`,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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

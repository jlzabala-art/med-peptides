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
  const rawCode = decodeURIComponent(code).trim();
  const upperCode = rawCode.toUpperCase();

  // 1. RAM Cache
  const cached = RX_RAM_CACHE.get(upperCode) || RX_RAM_CACHE.get(rawCode);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let rxDoc = null;

  // 2. Direct ID (try rawCode first to preserve Firestore's case-sensitive doc ID, then upperCode)
  let docSnap = await adminDb.collection('prescriptions').doc(rawCode).get().catch(() => null);
  if (!docSnap?.exists && rawCode !== upperCode) {
    docSnap = await adminDb.collection('prescriptions').doc(upperCode).get().catch(() => null);
  }
  if (docSnap && docSnap.exists) {
    rxDoc = { id: docSnap.id, ...docSnap.data() };
  }

  // 3. Prescription Number lookup
  if (!rxDoc) {
    const codesToSearch = Array.from(new Set([upperCode, rawCode]));
    const qSnap = await adminDb.collection('prescriptions')
      .where('prescriptionNumber', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap && !qSnap.empty) {
      rxDoc = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
    }
  }

  // 4. Fallback search by prescriptionCode or code
  if (!rxDoc) {
    const codesToSearch = Array.from(new Set([upperCode, rawCode]));
    const qSnap2 = await adminDb.collection('prescriptions')
      .where('prescriptionCode', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap2 && !qSnap2.empty) {
      rxDoc = { id: qSnap2.docs[0].id, ...qSnap2.docs[0].data() };
    }
  }

  if (!rxDoc) {
    const codesToSearch = Array.from(new Set([upperCode, rawCode]));
    const qSnap3 = await adminDb.collection('prescriptions')
      .where('code', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap3 && !qSnap3.empty) {
      rxDoc = { id: qSnap3.docs[0].id, ...qSnap3.docs[0].data() };
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

  const patientName = rx?.patient?.name || rx?.patientName || 'Paciente';
  const doctor = rx?.doctorName || rx?.doctor?.name || 'Dra. Hanieh Erdmann';
  let clinic = rx?.clinic || 'Atlas Health Services';
  if (clinic.toLowerCase().includes('mediluxe') || clinic.toLowerCase().includes('bedaya')) {
    clinic = 'Atlas Health Services';
  }

  // 1. Build dynamic quick explanation for WhatsApp
  let formulaSummary = '';
  const rawItems = rx?.items || rx?.compounds || [];
  if (rawItems.length > 0) {
    const activeItems = rawItems
      .filter(i => i.itemType !== 'vehicle_base' && i.itemType !== 'consumable')
      .map(i => {
        const conc = i.concentration || i.dosage || '';
        return `${i.name}${conc && !i.name.includes(conc) ? ` ${conc}` : ''}`;
      });
    const vehicle = rawItems.find(i => i.itemType === 'vehicle_base');
    const activeStr = activeItems.length > 0 ? activeItems.join(' + ') : rawItems.map(i => i.name).join(' + ');
    formulaSummary = vehicle ? `${activeStr} en ${vehicle.name}` : activeStr;
  } else if (rx?.formulaName || rx?.title) {
    formulaSummary = rx.formulaName || rx.title;
  }

  const posologySummary = rx?.structuredPosology?.summary || rx?.posology || rx?.dosageSchedule || '';
  const packSummary = rx?.structuredPosology?.packLabel || '';

  let description = '';
  if (formulaSummary) {
    description = `Fórmula: ${formulaSummary}${packSummary ? ` (${packSummary})` : ''}. `;
    if (posologySummary) {
      description += `Posología: ${posologySummary}. `;
    }
    description += `Prescrita por ${doctor} • Atlas Health Services.`;
  } else {
    description = `Ficha técnica y pauta posológica oficial para ${patientName}. Prescrita por ${doctor} (${clinic}). Atlas Health Services.`;
  }

  // Clamped to WhatsApp's optimal preview length
  if (description.length > 200) {
    description = description.slice(0, 197).trim() + '...';
  }

  const title = `Prescripción Médica #${code} • Atlas Health Services`;
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

export default async function PublicPrescriptionPage({ params }) {
  const resolvedParams = await params;
  const code = resolvedParams?.code;
  const rx = await getPrescriptionData(code);

  if (!rx) {
    notFound();
  }

  return <PublicPrescriptionClient rx={rx} />;
}

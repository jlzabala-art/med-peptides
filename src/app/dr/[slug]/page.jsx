import React from 'react';
import DoctorPublicPortalClient from './DoctorPublicPortalClient';
import { getDoctorPortalData } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

import { KNOWN_DOCTORS_DIRECTORY } from '@/services/doctorDirectoryService';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || '').trim().toLowerCase();

  let doctorName = 'Treating Physician Clinical Portal';
  let clinic = 'Clinical Practice & Dispensary';
  let specialty = 'Regenerative Medicine & Nutrigenomics';
  let canonicalSlug = cleanSlug;

  // 1. Instant Synchronous Resolution from Known Directory (0ms - Golden Rule #2)
  const known = KNOWN_DOCTORS_DIRECTORY.find(d => {
    const s = cleanSlug.replace(/^dr[-.]?/, '');
    const idMatch = d.id.toLowerCase() === cleanSlug || d.id.toLowerCase().replace(/^dr[-.]?/, '') === s;
    const nameSlug = (d.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanNoHyphens = cleanSlug.replace(/[^a-z0-9]/g, '');
    const nameMatch = nameSlug.includes(cleanNoHyphens) || cleanNoHyphens.includes(nameSlug.replace('dr', ''));
    const aliasMatch = (d.aliases || []).some(a => a.toLowerCase() === cleanSlug || a.toLowerCase().replace(/^dr[-.]?/, '') === s);
    return idMatch || nameMatch || aliasMatch;
  });

  if (known) {
    doctorName = known.name || doctorName;
    clinic = known.clinic || known.clinicName || clinic;
    specialty = known.specialty || specialty;
  }

  // 2. Layer 2 Firestore / Cache Enrichment
  try {
    const portalData = await getDoctorPortalData(cleanSlug);
    if (portalData?.doctor) {
      const doc = portalData.doctor;
      doctorName = doc.name || doctorName;
      clinic = doc.clinic || clinic;
      specialty = doc.specialty || specialty;
      canonicalSlug = doc.opaqueCode || cleanSlug;
    }
  } catch (e) {
    console.warn('Doctor metadata fetch error', e);
  }

  const shareTitle = `${doctorName} | Clinical Prescriptions & Patient Dossier`;
  const shareDesc = `Official digital clinical prescription & medical portal for ${doctorName} (${specialty} at ${clinic}). View prescribed therapies, patient posology regimens, and personalized medical care dossiers.`;
  const pageUrl = `${BASE_URL}/dr/${canonicalSlug}`;

  return {
    title: shareTitle,
    description: shareDesc,
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      title: shareTitle,
      description: shareDesc,
      url: pageUrl,
      siteName: `${doctorName} · Clinical Practice`,
      locale: 'en_US',
      type: 'profile',
      images: [
        {
          url: `${BASE_URL}/og-card.png`,
          secureUrl: `${BASE_URL}/og-card.png`,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: doctorName
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDesc,
      images: [`${BASE_URL}/og-card.png`]
    }
  };
}

export default async function DoctorPublicPage({ params }) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || '').trim();

  // ⚡ Preload data on server with Layer 1 RAM cache (0ms delay for instant FCP)
  let initialData = null;
  try {
    initialData = await getDoctorPortalData(cleanSlug);
  } catch (err) {
    console.error('Error preloading doctor portal data:', err);
  }

  return <DoctorPublicPortalClient slug={cleanSlug} initialData={initialData} />;
}

import React from 'react';
import DoctorPublicPortalClient from './DoctorPublicPortalClient';
import { getDoctorPortalData } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || '').trim();

  let doctorName = 'Physician Clinical Portal';
  let clinic = 'Atlas Clinical Partner';
  let specialty = 'Regenerative Medicine & Nutrigenomics';
  let canonicalSlug = cleanSlug;

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

  const shareTitle = `${doctorName} | Clinical Prescriptions & Patient Portal`;
  const shareDesc = `Official digital prescription & clinical dossier for ${doctorName} (${specialty} at ${clinic}). View posology regimens, active compounded treatments, and patient care management.`;
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
      siteName: 'Atlas Clinical Services',
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

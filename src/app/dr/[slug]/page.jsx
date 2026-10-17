import React from 'react';
import { redirect } from 'next/navigation';
import DoctorPublicPortalClient from './DoctorPublicPortalClient';
import { getDoctorPortalData } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

/**
 * DHA / UAE Health Data Law / HIPAA De-identification Compliance (Golden Rule)
 * Metadata must NOT expose doctor name, clinic name, or any medical PII to public crawlers.
 * Strictly blocks search engine indexing with noindex, nofollow, noarchive.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || '').trim().toLowerCase();

  let canonicalSlug = cleanSlug;

  try {
    const portalData = await getDoctorPortalData(cleanSlug);
    if (portalData?.doctor?.opaqueCode) {
      canonicalSlug = portalData.doctor.opaqueCode;
    }
  } catch (e) {
    console.warn('Doctor metadata fetch error', e);
  }

  const shareTitle = 'Clinical Practice Portal | Atlas Health Services';
  const shareDesc = 'Secure, authenticated clinical dispensary & medical prescription management portal. Authorized medical practitioners can sign in to view dossiers.';
  const pageUrl = `${BASE_URL}/dr/${canonicalSlug}`;

  return {
    title: shareTitle,
    description: shareDesc,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
      googleBot: {
        index: false,
        follow: false,
        'max-video-preview': -1,
        'max-image-preview': 'none',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      title: shareTitle,
      description: shareDesc,
      url: pageUrl,
      siteName: 'Atlas Health Services · Clinical Practice Portal',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og-card.png`,
          secureUrl: `${BASE_URL}/og-card.png`,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: 'Atlas Clinical Practice Portal'
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

  // DHA / UAE Health Data Law / HIPAA Double Codification:
  // If navigated via nominal name (e.g. /dr/khalid-shukri), automatically 307-redirect
  // to the opaque codified URL (e.g. /dr/DR-SSEJV9MC) so the URL bar contains zero PII.
  if (initialData?.doctor?.opaqueCode) {
    const targetCode = initialData.doctor.opaqueCode;
    const isAlreadyOpaque = cleanSlug.toUpperCase() === targetCode.toUpperCase();
    if (!isAlreadyOpaque) {
      redirect(`/dr/${targetCode}`);
    }
  }

  return <DoctorPublicPortalClient slug={cleanSlug} initialData={initialData} />;
}

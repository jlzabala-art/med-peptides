import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DoctorPublicPortalClient from './DoctorPublicPortalClient';
import { getDoctorPortalData } from '@/lib/doctorCache';
import { anonymizeDoctorPortalData } from '@/lib/doctorPortalAnonymizer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

/**
 * DHA / UAE Health Data Law / HIPAA De-identification Compliance (Golden Rule)
 * Metadata must NOT expose doctor name, clinic name, or any medical PII to public crawlers.
 * Strictly blocks search engine indexing with noindex, nofollow, noarchive.
 */
export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const lang = String(resolvedSearch?.lang || '').toLowerCase() === 'es' ? 'es' : 'en';
  const isEs = lang === 'es';
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

  const shareTitle = isEs
    ? 'Portal Clínico Médico | Atlas Health Services'
    : 'Clinical Practice Portal | Atlas Health Services';
  const shareDesc = isEs
    ? 'Portal clínico seguro y autenticado de dispensación y gestión de prescripciones médicas. Los facultativos autorizados pueden iniciar sesión para consultar expedientes.'
    : 'Secure, authenticated clinical dispensary & medical prescription management portal. Authorized medical practitioners can sign in to view dossiers.';
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
      siteName: isEs ? 'Atlas Health Services · Portal Clínico Médico' : 'Atlas Health Services · Clinical Practice Portal',
      locale: isEs ? 'es_ES' : 'en_US',
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

export default async function DoctorPublicPage({ params, searchParams }) {
  const { slug } = await params;
  const sParams = await searchParams;
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
      const qs = sParams ? new URLSearchParams(sParams).toString() : '';
      redirect(`/dr/${targetCode}${qs ? `?${qs}` : ''}`);
    }
  }

  const initialTab = sParams?.tab || (sParams?.task ? 'tasks' : 'overview');

  // Server-Side DHA/HIPAA Privacy Guard:
  // If no verified workstation cookie, auth session cookie, or magic/auth token is present,
  // anonymize nominal patient PII before serializing initialData into SSR HTML.
  const cookieStore = await cookies();
  const hasServerAuthCookie = Boolean(
    cookieStore.get('atlas_workstation_session')?.value ||
    cookieStore.get('session')?.value ||
    cookieStore.get('firebase_token')?.value ||
    cookieStore.get('atlas_session')?.value
  );
  const hasUrlToken = Boolean(sParams?.magic_token || sParams?.auth_token);
  const safeInitialData = (initialData && !hasServerAuthCookie && !hasUrlToken)
    ? anonymizeDoctorPortalData(initialData)
    : initialData;

  return (
    <DoctorPublicPortalClient
      slug={cleanSlug}
      initialData={safeInitialData}
      initialTab={initialTab}
      initialSearchParams={sParams || {}}
    />
  );
}

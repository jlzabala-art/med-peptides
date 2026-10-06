import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import DoctorPublicPortalClient from './DoctorPublicPortalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/i, '')
    .replace(/^dr[a]?\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || '').trim().toLowerCase();

  let doctorName = 'Physician Portal';
  let clinic = 'Atlas Clinical Network';
  let specialty = 'Regenerative Medicine';

  if (adminDb && cleanSlug) {
    try {
      const snap = await adminDb.collection('users').get();
      snap.forEach((doc) => {
        const d = doc.data();
        const dName = d.displayName || d.name || `${d.firstName || ''} ${d.lastName || ''}`;
        if (doc.id.toLowerCase() === cleanSlug || slugify(dName) === cleanSlug) {
          doctorName = dName;
          clinic = d.clinicName || d.clinic || clinic;
          specialty = d.specialty || specialty;
        }
      });
    } catch (e) {
      console.warn('Metadata fetch error', e);
    }
  }

  return {
    title: `${doctorName} | Clinical Prescriptions & Patient Portal`,
    description: `Official digital prescription portal for ${doctorName} (${specialty} at ${clinic}). View posology regimens, active compounded treatments, and patient care management.`,
    openGraph: {
      title: `${doctorName} — Clinical Prescriptions & Patient Portal`,
      description: `Official digital clinical dossier for ${doctorName}. Posology regimens, compounded formulations, and patient care management.`,
      url: `${BASE_URL}/dr/${cleanSlug}`,
      siteName: 'Atlas Clinical Services',
      images: [
        {
          url: `${BASE_URL}/og-card.png`,
          width: 1200,
          height: 630,
          alt: doctorName
        }
      ],
      type: 'profile'
    }
  };
}

export default async function DoctorPublicPage({ params }) {
  const { slug } = await params;
  return <DoctorPublicPortalClient slug={slug} />;
}

import React from 'react';
import PublicPrescriptionIntakeClient from './PublicPrescriptionIntakeClient';
import { KNOWN_DOCTORS_DIRECTORY } from '@/services/doctorDirectoryService';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const refDoctor = (resolvedParams?.refDoctor || resolvedParams?.doc || '').trim();

  let doctorName = null;
  let clinic = null;

  if (refDoctor) {
    const cleanRef = decodeURIComponent(refDoctor).toLowerCase().replace(/^dr[-.]?/, '');
    const matched = KNOWN_DOCTORS_DIRECTORY.find(d => {
      const dId = (d.id || '').toLowerCase().replace(/^dr[-.]?/, '');
      const dName = (d.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const refClean = cleanRef.replace(/[^a-z0-9]/g, '');
      return dId === cleanRef || 
             dName.includes(refClean) || 
             refClean.includes(dName.replace('dr', '')) ||
             (d.aliases || []).some(a => a.toLowerCase().includes(cleanRef));
    });

    if (matched) {
      doctorName = matched.name;
      clinic = matched.clinic || matched.clinicName || 'Clinical Practice';
    }
  }

  if (doctorName) {
    const title = `${doctorName} | Patient Prescription & Clinical Intake`;
    const description = `Official patient prescription submission and medical record intake portal for ${doctorName} (${clinic}). Submit prescriptions, lab diagnostics, and treatment requests securely for clinical review and electronic dispensation.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/rx/intake?refDoctor=${encodeURIComponent(refDoctor)}`,
        siteName: `${doctorName} · Clinical Practice`,
        type: 'website',
        images: [
          {
            url: `${BASE_URL}/og-card.png`,
            width: 1200,
            height: 630,
            alt: `${doctorName} Patient Intake Portal`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${BASE_URL}/og-card.png`]
      }
    };
  }

  const defaultTitle = 'Patient Prescription Submission & Clinical Intake | Atlas Health';
  const defaultDesc = 'Official digital clinical intake portal. Submit medical prescriptions, physician authorizations, and diagnostic lab reports for rapid clinical validation and certified pharmaceutical dispensation.';

  return {
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `${BASE_URL}/rx/intake`,
      siteName: 'Atlas Clinical Practice',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og-card.png`,
          width: 1200,
          height: 630,
          alt: 'Atlas Health Patient Intake'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDesc,
      images: [`${BASE_URL}/og-card.png`]
    }
  };
}

export default function PublicPrescriptionIntakePage() {
  return <PublicPrescriptionIntakeClient />;
}

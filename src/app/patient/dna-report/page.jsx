import React from 'react';
import PatientDnaPortalClient from './PatientDnaPortalClient';
import { evaluateNutrigenomicProfile } from '@/data/genomics/clinicalNutrigenomicEngine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = 'https://www.atlashealth-services.com';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const sample = sp?.sample || '24G-QA-90421';
  const isWafa = sample === 'G000943568';
  const patient = sp?.patient || (isWafa ? 'Ms. Wafa Burud' : 'Hossam Ahmed');

  const title = `Genomic Nutrition & Formulation Report · ${patient}`;
  const description = `Confidential CE-IVD DNA Analysis & Magistral Compounded Prescription (Sample #${sample}). Issued by Atlas Health Services.`;
  const shareUrl = `${BASE_URL}/patient/dna-report?patient=${encodeURIComponent(patient)}&sample=${encodeURIComponent(sample)}`;
  const imageUrl = `${BASE_URL}/og-preview.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'Atlas Health Services · Precision Genomics',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Personal Genomic Report for ${patient}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl]
    }
  };
}

export default async function PatientDnaReportPage({ searchParams }) {
  const sp = await searchParams;
  const sampleCode = sp?.sample || '24G-QA-90421';
  const isWafa = sampleCode === 'G000943568';
  const patientName = sp?.patient || (isWafa ? 'Ms. Wafa Burud' : 'Hossam Ahmed');
  const clinic = sp?.clinic || (isWafa ? 'Dr. Sajid Burud Medical Practice' : 'Ryhanh Medical Company · Doha');
  const doctor = sp?.doctor || (isWafa ? 'Dr. Sajid Burud' : 'Clinical Genomic Director');

  // Rule #21: Server-side evaluation of clinical nutrigenomics profile
  const initialProfile = evaluateNutrigenomicProfile({
    patientName,
    sampleCode,
    clinic,
    doctor
  });

  return (
    <PatientDnaPortalClient
      initialPatientName={patientName}
      initialSampleCode={sampleCode}
      initialClinic={clinic}
      initialDoctor={doctor}
      initialProfile={initialProfile}
    />
  );
}


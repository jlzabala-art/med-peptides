import React from 'react';
import PatientDnaPortalClient from './PatientDnaPortalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const patient = sp?.patient || 'Patient';
  const sample = sp?.sample || '24G-QA-90421';

  return {
    title: `Personal Genomic Wellness & Nutrition Guide • Atlas Health Services`,
    description: `Private genomic nutrition & clinical recommendations for ${patient} (Sample #${sample}). Verified digital health dossier.`,
    openGraph: {
      title: `Personal Genomic Wellness Guide · ${patient}`,
      description: `Secure 1-Click Access to Clinical DNA Recommendations & Compounding Prescription.`,
      url: `${BASE_URL}/patient/dna-report`,
      siteName: 'Atlas Health Services · Patient Care',
      images: [
        {
          url: `${BASE_URL}/og-card.png`,
          width: 1200,
          height: 630,
          alt: 'Atlas Health Genomic Report'
        }
      ]
    }
  };
}

export default async function PatientDnaReportPage({ searchParams }) {
  const sp = await searchParams;
  const patientName = sp?.patient || 'Hossam Ahmed';
  const sampleCode = sp?.sample || '24G-QA-90421';
  const clinic = sp?.clinic || 'Ryhanh Medical Company · Doha';
  const doctor = sp?.doctor || 'Clinical Genomic Director';

  return (
    <PatientDnaPortalClient
      initialPatientName={patientName}
      initialSampleCode={sampleCode}
      initialClinic={clinic}
      initialDoctor={doctor}
    />
  );
}


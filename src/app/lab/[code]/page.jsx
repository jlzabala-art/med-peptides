import React from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
import PublicLabResultClient from './PublicLabResultClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

async function getLabResultData(code) {
  if (!code || !adminDb) return null;
  const cleanCode = String(code).trim();

  // Try direct doc ID LAB-{code}-NAD
  let doc = await adminDb.collection('lab_results').doc(cleanCode).get();
  if (doc.exists) return { id: doc.id, ...doc.data() };

  // Try document ID: LAB-{code}-NAD
  doc = await adminDb.collection('lab_results').doc(`LAB-${cleanCode}-NAD`).get();
  if (doc.exists) return { id: doc.id, ...doc.data() };

  // Query by code field
  const qCode = await adminDb.collection('lab_results').where('code', '==', cleanCode).limit(1).get();
  if (!qCode.empty) {
    const d = qCode.docs[0];
    return { id: d.id, ...d.data() };
  }

  // Query by protocolNumber
  const qProto = await adminDb.collection('lab_results').where('protocolNumber', '==', cleanCode).limit(1).get();
  if (!qProto.empty) {
    const d = qProto.docs[0];
    return { id: d.id, ...d.data() };
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const labData = await getLabResultData(code);

  if (!labData) {
    return {
      title: 'Laboratory Diagnostic Result | Bloodo & LifeLab1',
      description: 'Official clinical diagnostic biomarker report.'
    };
  }

  const testName = labData.testName || 'NAD+ Quantitative Test';
  const val = `${labData.value} ${labData.unit || 'µmol/L'}`;
  const patient = labData.patientName || 'Verified Patient';
  const doctor = labData.doctorName || 'Attending Physician';

  const shareTitle = `${testName} (${val}) · ${patient} | Bloodo & LifeLab1`;
  const shareDesc = `Official LifeLab1 quantitative diagnostic report. Result: ${val} (${labData.zoneLabel || 'Insufficient range'}). Prescribed under ${doctor}. Accredited ISO 15189 / EU IVDR.`;
  const pageUrl = `${BASE_URL}/lab/${code}`;

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
      siteName: 'Bloodo Diagnostic & Longevity Biomarkers',
      locale: 'en_US',
      type: 'article'
    }
  };
}

export default async function LabResultPage({ params }) {
  const { code } = await params;
  const labData = await getLabResultData(code);

  if (!labData) {
    notFound();
  }

  return <PublicLabResultClient initialData={labData} code={code} />;
}

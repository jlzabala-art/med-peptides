import { notFound, redirect } from 'next/navigation';
import { 
  getPrescriptionData, 
  sanitizePrescriptionCode, 
  sanitizePrescriptionPayload 
} from '@/lib/prescriptionFetcher';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import RxLabelsStandaloneClient from './RxLabelsStandaloneClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawCode = resolvedParams?.code || '';
  const cleanCode = sanitizePrescriptionCode(rawCode);
  const rxCode = cleanCode || rawCode;
  const isEditing = resolvedSearchParams?.edit === 'true' || resolvedSearchParams?.edit === '1';
  const lang = resolvedSearchParams?.lang || 'en';
  const isEs = lang === 'es';

  const title = isEs 
    ? `${isEditing ? 'Editor de Etiquetas' : 'Etiquetas Oficiales'} • #${rxCode} • Pharmapolis Compounding`
    : `${isEditing ? 'Label Editor' : 'Official Labels'} • #${rxCode} • Pharmapolis Compounding`;
  const description = isEs
    ? `Editor interactivo y generador de etiquetas de formulación magistral EU GMP para la prescripción #${rxCode}.`
    : `Interactive vector editor and EU GMP compounding label generator for prescription #${rxCode}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/rx/${encodeURIComponent(rxCode)}/labels`,
      siteName: 'Pharmapolis Compounding Pharmacy',
      type: 'website'
    },
    robots: { index: false, follow: false, noarchive: true, nocache: true }
  };
}

export default async function RxLabelsStandalonePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawCode = resolvedParams?.code;
  const cleanCode = sanitizePrescriptionCode(rawCode);

  if (rawCode && cleanCode && rawCode.toLowerCase() !== cleanCode.toLowerCase()) {
    const editQ = resolvedSearchParams?.edit ? `?edit=${encodeURIComponent(resolvedSearchParams.edit)}` : '';
    redirect(`/rx/${encodeURIComponent(cleanCode)}/labels${editQ}`);
  }

  const initialEditMode = resolvedSearchParams?.edit === 'true' || resolvedSearchParams?.edit === '1';
  const initialPhaseIdx = Number(resolvedSearchParams?.phase) ? Math.max(0, Number(resolvedSearchParams.phase) - 1) : 0;
  const initialLang = resolvedSearchParams?.lang || 'en';

  const rx = await getPrescriptionData(cleanCode || rawCode);

  if (!rx) {
    notFound();
  }

  const sanitizedRx = sanitizePrescriptionPayload(rx, { isAuthorized: false });
  const finalCode = cleanCode || rawCode;

  // Derive compounding labels for this prescription
  const rawLabels = getPharmapolisLabelsForPrescription(sanitizedRx);
  const labels = (rawLabels || []).map((l) => ({
    ...l,
    patientName: sanitizedRx.patientName || 'Patient',
    doctorName: 'Licensed Clinical Practice',
    physician: 'Licensed Clinical Practice'
  }));

  return (
    <RxLabelsStandaloneClient
      rx={sanitizedRx}
      labels={labels}
      code={finalCode}
      initialEditMode={initialEditMode}
      initialLabelIndex={initialPhaseIdx}
      initialLang={initialLang}
    />
  );
}

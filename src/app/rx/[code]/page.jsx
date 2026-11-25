import React, { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { serverConfig } from '@/authConfig';
import { adminDb } from '@/lib/firebaseAdmin';
import PublicPrescriptionClient from './PublicPrescriptionClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

import { 
  getPrescriptionData, 
  invalidateRxCache,
  sanitizePrescriptionCode,
  hasPatientSlugInCode,
  sanitizePrescriptionPayload
} from '@/lib/prescriptionFetcher';
import { getAuthoritativeClinicalData } from '@/data/pharmapolisLabelsMap';
export { invalidateRxCache };

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const lang = String(resolvedSearch?.lang || '').toLowerCase() === 'es' ? 'es' : 'en';
  const isEs = lang === 'es';
  const isPatientView = String(resolvedSearch?.view || resolvedSearch?.mode || '').toLowerCase() === 'patient';
  const urlLot = resolvedSearch?.lot ? String(resolvedSearch.lot).trim() : '';
  const urlBud = resolvedSearch?.bud ? String(resolvedSearch.bud).trim() : '';
  const rawCode = resolvedParams?.code || '';
  const cleanCode = sanitizePrescriptionCode(rawCode);
  const rx = await getPrescriptionData(cleanCode || rawCode);

  // 1. Build formula summary without any personal or doctor PII
  let formulaSummary = '';
  const rawItems = rx?.items || rx?.compounds || [];
  if (rawItems.length > 0) {
    const activeItems = rawItems
      .filter(i => i && i.itemType !== 'vehicle_base' && i.itemType !== 'consumable')
      .map(i => {
        const itemName = i.name || i.productName || i.activeIngredient || '';
        const conc = i.concentration || i.dosage || '';
        if (!itemName) return conc || '';
        return `${itemName}${conc && !itemName.includes(conc) ? ` ${conc}` : ''}`;
      })
      .filter(Boolean);
    const vehicle = rawItems.find(i => i && i.itemType === 'vehicle_base');
    const vehicleName = vehicle?.name || vehicle?.productName || vehicle?.activeIngredient || '';
    const activeStr = activeItems.length > 0 
      ? activeItems.join(' + ') 
      : rawItems.map(i => i?.name || i?.productName || i?.activeIngredient || '').filter(Boolean).join(' + ');
    formulaSummary = vehicleName ? `${activeStr} in ${vehicleName}` : activeStr;
  } else if (rx?.formulaName || rx?.title) {
    formulaSummary = rx.formulaName || rx.title;
  }

  const rawPos = rx?.structuredPosology?.summary || rx?.posology || rx?.dosageSchedule || '';
  const posologySummary = typeof rawPos === 'object' ? (rawPos.regimen || rawPos.summary || rawPos.timing || rawPos.notes || '') : String(rawPos || '');
  const packSummary = rx?.structuredPosology?.packLabel || '';
  const storageSummary = rx?.storage ? String(rx.storage).trim() : '';
  const lotSummary = urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode || '';
  const budSummary = urlBud || rx?.expDate || rx?.bud || '';

  let title = isEs
    ? `Expediente de Prescripción Clínica #${cleanCode} • Atlas Health Services`
    : `Clinical Prescription Dossier #${cleanCode} • Atlas Health Services`;

  let description = isEs
    ? 'Monografía verificada de formulación clínica y protocolo de posología farmacéutica. Verificación médica autorizada • Atlas Health Services.'
    : 'Verified clinical formulation monograph and pharmaceutical posology protocol. Authorized medical verification • Atlas Health Services.';

  let patientOgImage = null;

  if (isPatientView) {
    const corpus = [
      rx?.treatmentTitle,
      rx?.title,
      rx?.dispensingForm,
      rx?.regimenCategory,
      rx?.diagnosis,
      formulaSummary,
      ...(Array.isArray(rawItems) ? rawItems.map((i) => `${i?.name || ''} ${i?.productName || ''} ${i?.form || ''}`) : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const daysVal = Number(rx?.durationDays) > 0 ? Number(rx.durationDays) : null;
    const isHair = /\b(trichotest|trichosol|trichooil|trichowash|trichofoam|minoxidil|dutasteride|finasteride|latanoprost|hair|scalp|follicular)\b/i.test(corpus);
    const isHormone = /\b(bhrt|trt|estradiol|estriol|steriol|progesterone|testosterone|dhea|pregnenolone|pellet|hormone|menopause|enclomiphene)\b/i.test(corpus);
    const isPen = rx?.dispensingForm === 'prefilled_pen' || /\b(pre-?filled\s*pen|pluma|bioblend|glutathione\s*pen)\b/i.test(corpus);
    const isNasal = !isHair && (rx?.dispensingForm === 'nasal_spray' || /\b(nasal|intranasal|selank|semax)\b/i.test(corpus));
    const isMetabolic = /\b(retatrutide|tirzepatide|semaglutide|glp-?1|glp-?3|nutrigen|weight|metabolic)\b/i.test(corpus);
    const isSleep = /\b(sleep|insomnia|dsip|melatonin|magnesium|l-theanine|gaba|calm|stress)\b/i.test(corpus);
    const isLongevity = /\b(telotest|epithalon|epitalon|mots-c|nad\+?|ubiquinol|pqq|cycloastragenol|longevity)\b/i.test(corpus);
    const isOral = rx?.dispensingForm === 'oral_capsules' || /\b(capsule|caps|oral|tablet)\b/i.test(corpus);

    if (isHair) {
      title = isEs ? 'Tu Guía de Tratamiento Capilar · Atlas Health' : 'Your Hair Care Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/topical_serum.jpg`;
    } else if (isHormone) {
      title = isEs ? 'Tu Guía de Equilibrio Hormonal · Atlas Health' : 'Your Hormone Balance Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/topical_serum.jpg`;
    } else if (isPen) {
      title = isEs ? 'Tu Guía de Tratamiento en Pluma · Atlas Health' : 'Your Pen Treatment Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/pen_single_cartridge.jpg`;
    } else if (isNasal) {
      title = isEs ? 'Tu Guía de Spray Nasal · Atlas Health' : 'Your Nasal Spray Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/nasal_spray.jpg`;
    } else if (isMetabolic) {
      title = isEs ? 'Tu Guía de Cuidado Metabólico · Atlas Health' : 'Your Metabolic Care Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/vial_single.jpg`;
    } else if (isSleep) {
      title = isEs ? 'Tu Guía de Sueño y Bienestar · Atlas Health' : 'Your Sleep & Calm Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/capsules_bottle.jpg`;
    } else if (isLongevity) {
      title = isEs ? 'Tu Guía de Longevidad Celular · Atlas Health' : 'Your Cellular Longevity Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/capsules_bottle.jpg`;
    } else if (isOral) {
      title = isEs ? 'Tu Guía de Tratamiento Oral · Atlas Health' : 'Your Daily Supplement Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/capsules_bottle.jpg`;
    } else {
      title = isEs ? 'Tu Guía Personal de Tratamiento · Atlas Health' : 'Your Personal Treatment Guide · Atlas Health';
      patientOgImage = `${BASE_URL}/images/clinical/vial_single.jpg`;
    }

    const planText = daysVal
      ? (isEs ? ` para tu plan de ${daysVal} días` : ` for your ${daysVal}-day plan`)
      : '';
    description = isEs
      ? `Instrucciones paso a paso, conservación y refill en 1 clic${planText}. Toca para abrir tu guía privada.`
      : `Simple step-by-step routine, storage tips & 1-click refill${planText}. Tap to open your private guide.`;
  } else if (formulaSummary) {
    description = `${isEs ? 'Fórmula' : 'Formula'}: ${formulaSummary}${packSummary ? ` (${packSummary})` : ''}. `;
    if (posologySummary) {
      description += `${isEs ? 'Posología' : 'Posology'}: ${posologySummary}. `;
    }
    description += isEs ? 'Atlas Health Services · Atención Médica Clínica.' : 'Atlas Health Services · Medical Practice Care.';
  }

  if (description.length > 200) {
    description = description.slice(0, 197).trim() + '...';
  }

  const ogLogoUrl = (isPatientView && patientOgImage) ? patientOgImage : `${BASE_URL}/atlas-health-logo-wa.png`;
  const ogImageType = ogLogoUrl.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  const ogImageWidth = ogLogoUrl.endsWith('.jpg') ? 1200 : 400;
  const ogImageHeight = ogLogoUrl.endsWith('.jpg') ? 630 : 400;
  const ogUrl = isPatientView
    ? `${BASE_URL}/rx/${encodeURIComponent(cleanCode)}?view=patient`
    : `${BASE_URL}/rx/${encodeURIComponent(cleanCode)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: ogUrl,
      siteName: isPatientView
        ? (isEs ? 'Guía de Tratamiento · Atlas Health' : 'Treatment Guide · Atlas Health')
        : (isEs ? 'Atlas Health Services · Formulario Clínico' : 'Atlas Health Services · Clinical Formulary'),
      locale: isEs ? 'es_ES' : 'en_US',
      type: 'article',
      images: [
        {
          url: ogLogoUrl,
          width: ogImageWidth,
          height: ogImageHeight,
          type: ogImageType,
          alt: title
        }
      ]
    },
    twitter: {
      card: isPatientView ? 'summary_large_image' : 'summary',
      title,
      description,
      images: [ogLogoUrl]
    },
    other: {
      'og:image': ogLogoUrl,
      'og:image:secure_url': ogLogoUrl,
      'og:image:type': ogImageType,
      'og:image:width': String(ogImageWidth),
      'og:image:height': String(ogImageHeight),
      'og:image:alt': title,
      'whatsapp:title': title,
      'whatsapp:description': description,
      'whatsapp:image': ogLogoUrl
    },
    robots: { index: false, follow: false, noarchive: true, nocache: true }
  };
}

export default async function PublicPrescriptionPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawCode = resolvedParams?.code;
  const initialView = resolvedSearchParams?.view || resolvedSearchParams?.mode || null;

  if (rawCode?.toLowerCase() === 'intake') {
    redirect('/rx/intake');
  }

  // 1. Strict HIPAA/DHA De-identification: Detect trailing patient names in URL
  const cleanCode = sanitizePrescriptionCode(rawCode);
  if (rawCode && cleanCode && rawCode.toLowerCase() !== cleanCode.toLowerCase()) {
    const qs = initialView ? `?view=${encodeURIComponent(initialView)}` : '';
    redirect(`/rx/${encodeURIComponent(cleanCode)}${qs}`);
  }

  const rx = await getPrescriptionData(cleanCode || rawCode);

  if (!rx) {
    notFound();
  }

  // 2. Server Authentication Verification (Admin, Doctor, Medical Director, Clinic)
  let isAuthorized = false;
  try {
    const cookieStore = await cookies();
    if (cookieStore.has(serverConfig.cookieName)) {
      const tokens = await getTokens(cookieStore, {
        apiKey: serverConfig.firebaseApiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
      });
      const role = String(tokens?.decodedToken?.role || '').toLowerCase();
      const email = String(tokens?.decodedToken?.email || '').toLowerCase().trim();
      if (
        ['admin', 'medical_director', 'doctor', 'clinic', 'account_manager', 'fagron_clinic', 'patient_coordinator'].includes(role) ||
        tokens?.decodedToken?.admin === true ||
        ['jlzabala@gmail.com', 'admin@atlashealth-services.com', 'kasia@mediluxeme.com', 'business@mediluxeme.com'].includes(email)
      ) {
        isAuthorized = true;
      }
    }
  } catch {
    // cookies not accessible or invalid, client-side auth will hydrate
  }

  // 3. Zero-Trust Server Sanitization: Strip nominal PII from SSR payload ONLY for unauthenticated public viewers
  const sanitizedRx = sanitizePrescriptionPayload(rx, { isAuthorized });

  return <PublicPrescriptionClient rx={sanitizedRx} initialView={initialView} />;
}

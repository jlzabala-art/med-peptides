import React from 'react';
import { adminDb } from '../../lib/firebaseAdmin';
import { sanitizePublicProtocol } from '../../repositories/publicDataSanitizer';
import PublicProtocolsCatalogView from '../../components/protocol/PublicProtocolsCatalogView';

export const revalidate = 3600; // ⚡ Multi-Tier ISR (1 hour Edge Cache)

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';

export const metadata = {
  title: 'Directorio de Protocolos Clínicos & Vías Terapéuticas de Péptidos | Atlas Clinical',
  description: 'Catálogo público de 77 protocolos terapéuticos formulados con péptidos de grado farmacéutico: GLP-1/GIP, Longevidad, Regeneración Tisular, Neuroplasticidad y Salud Celular.',
  alternates: {
    canonical: `${BASE_URL}/proto`,
  },
  openGraph: {
    title: 'Directorio de Protocolos Clínicos & Péptidos | Atlas Clinical Directory',
    description: 'Explora protocolos y dosificaciones clínicas basadas en evidencia con péptidos bioactivos de Lotusland.',
    url: `${BASE_URL}/proto`,
    siteName: 'Atlas Health Technologies',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Directorio de Protocolos Clínicos & Péptidos | Atlas Clinical',
    description: '77 protocolos clínicos con calendarios de titulación, biomarcadores y sinergias farmacológicas.',
  },
};

/**
 * Fetches all authorized active/published clinical protocols from Firestore Single Source of Truth
 */
async function getAllProtocols() {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('protocols')
      .where('status', 'in', ['active', 'published'])
      .limit(100)
      .get();

    let docs = snap.docs;
    // Fallback if status isn't matched or if less than 10
    if (!docs || docs.length < 10) {
      const allSnap = await adminDb.collection('protocols').limit(100).get();
      docs = allSnap.docs;
    }

    const protocols = docs.map(d => {
      const data = d.data();
      const sanitized = sanitizePublicProtocol(data);
      return {
        ...sanitized,
        id: d.id,
        name: sanitized.name || data.name || data.title || data.protocol_name,
        slug: sanitized.slug || data.slug || data.protocol_slug || d.id,
        duration: sanitized.duration || data.duration || `${data.durationWeeks || data.duration_weeks || 8} Weeks`,
        durationWeeks: sanitized.durationWeeks || data.durationWeeks || data.duration_weeks || 8,
        phases: sanitized.phases || data.phases || [],
        bom: sanitized.bom || data.bom || [],
        goals: sanitized.goals || data.goals || [data.goal || data.category || 'Healthy Aging'],
        overview_summary: sanitized.overview_summary || data.overview_summary || data.description || '',
      };
    });

    return protocols;
  } catch (err) {
    console.error('Error in getAllProtocols Server Component:', err);
    return [];
  }
}

export default async function PublicProtocolsPage() {
  const protocols = await getAllProtocols();

  // Structured Clinical Schema (Schema.org MedicalWebPage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'Directorio de Protocolos Clínicos de Péptidos',
    description: 'Catálogo de protocolos terapéuticos basados en evidencia para regeneración tisular, metabolismo, longevidad y cognición.',
    url: `${BASE_URL}/proto`,
    provider: {
      '@type': 'Organization',
      name: 'Atlas Health Technologies',
      url: BASE_URL,
    },
    about: protocols.slice(0, 15).map(p => ({
      '@type': 'MedicalTherapy',
      name: p.name,
      description: p.overview_summary || `Protocolo terapéutico de ${p.durationWeeks} semanas.`,
      url: `${BASE_URL}/proto/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicProtocolsCatalogView initialProtocols={protocols} />
    </>
  );
}

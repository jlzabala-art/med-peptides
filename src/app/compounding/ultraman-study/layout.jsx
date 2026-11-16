import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  return buildBilingualMetadata({
    lang,
    path: '/compounding/ultraman-study',
    siteName: 'Atlas Compounding Intelligence',
    en: {
      title: 'Compounding Formulation & Cost Study | Atlas Health Services',
      description: 'Comparative pharmaceutical compounding analysis: active ingredient breakdown, dosage standardization, and unit cost benchmarks.',
    },
    es: {
      title: 'Estudio de Formulación Magistral y Costes | Atlas Health Services',
      description: 'Análisis comparativo de formulación magistral farmacéutica: desglose de principios activos, estandarización de dosis y costes unitarios.',
    },
    robots: { index: false, follow: false },
  });
}

export default function UltramanStudyLayout({ children }) {
  return children;
}

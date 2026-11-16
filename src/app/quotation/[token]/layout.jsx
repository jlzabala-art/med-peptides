import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const token = resolvedParams?.token || '';

  return buildBilingualMetadata({
    lang,
    path: `/quotation/${token}`,
    siteName: 'Atlas Health Services',
    en: {
      title: 'Official Institutional Quotation | Atlas Health Services',
      description: 'Verified institutional quotation with locked channel pricing, pharmaceutical specifications, and quality assurance documentation.',
    },
    es: {
      title: 'Cotización Institucional Oficial | Atlas Health Services',
      description: 'Cotización institucional verificada con precios de canal, especificaciones farmacéuticas y documentación de garantía de calidad.',
    },
    robots: { index: false, follow: false },
  });
}

export default function QuotationTokenLayout({ children }) {
  return children;
}

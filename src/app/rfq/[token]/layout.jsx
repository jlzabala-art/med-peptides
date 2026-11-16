import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const token = resolvedParams?.token || '';

  return buildBilingualMetadata({
    lang,
    path: `/rfq/${token}`,
    siteName: 'Atlas Health Procurement',
    en: {
      title: 'Supplier Request for Quotation (RFQ) | Atlas Health Services',
      description: 'Secure pharmaceutical procurement portal for authorized suppliers to review specifications and submit verified quotations.',
    },
    es: {
      title: 'Solicitud de Cotización a Proveedores (RFQ) | Atlas Health Services',
      description: 'Portal seguro de compras farmacéuticas para proveedores autorizados: revisión de especificaciones y envío de cotizaciones verificadas.',
    },
    robots: { index: false, follow: false },
  });
}

export default function RfqTokenLayout({ children }) {
  return children;
}

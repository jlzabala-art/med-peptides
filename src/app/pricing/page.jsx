import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import UnifiedPriceHub from '@/components/pricing/UnifiedPriceHub';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import './colway/ColwayPriceList.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  return buildBilingualMetadata({
    lang,
    path: '/pricing',
    siteName: 'Atlas Health Services',
    en: {
      title: 'Unified B2B Price Hub • Atlas Health Services',
      description: 'Centralized directory and real-time price hub for clinical peptides, 24Genetics genomic panels, Colway collagen, diagnostics, and wellness lines with role-based pricing.',
    },
    es: {
      title: 'Centro Unificado de Tarifas B2B • Atlas Health Services',
      description: 'Directorio centralizado y tarifas en tiempo real para péptidos clínicos, paneles genómicos 24Genetics, colágeno Colway, diagnósticos y líneas clínicas.',
    },
  });
}

export default function PricingDirectoryPage() {
  return (
    <div className="colway-price-root atlas-page-bg">
      <PublicUnifiedHeader
        brandHref="/"
        loginRedirect="/pricing"
        hideCurrencySelector={true}
        hideAccountManager={true}
        breadcrumb={[
          { label: 'B2B Portal', href: '/' },
          { label: 'Unified Price Hub' },
        ]}
      />

      <main className="atlas-page-shell">
        <Breadcrumb items={[
          { label: 'B2B Portal', href: '/' },
          { label: 'Unified Price Hub' }
        ]} />

        <div style={{ marginTop: '1.25rem' }}>
          <UnifiedPriceHub />
        </div>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}

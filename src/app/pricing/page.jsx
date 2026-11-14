import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/common/BrandLogo';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import GcpUserBadge from '@/components/shared/GcpUserBadge';
import UnifiedPriceHub from '@/components/pricing/UnifiedPriceHub';
import './colway/ColwayPriceList.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  return {
    title: 'Unified B2B Price Hub • Atlas Health Services',
    description: 'Centralized directory and real-time price hub for clinical peptides, 24Genetics genomic panels, Colway collagen, diagnostics, and wellness lines with role-based pricing.',
    openGraph: {
      title: 'Unified B2B Price Hub',
      description: 'Verified clinical and wholesale price lists.',
      url: `${appUrl}/pricing`
    }
  };
}

export default function PricingDirectoryPage() {
  return (
    <div className="colway-price-root">
      <header className="screen-nav-bar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} title="Atlas Health Services">
              <BrandLogo variant="light" size="compact" />
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-current">Unified B2B Price Hub</span>
          </div>

          <div className="nav-actions">
            <GcpUserBadge
              variant="dark"
              loginRedirect="/pricing"
            />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>
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

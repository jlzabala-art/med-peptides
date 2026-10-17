import React from 'react';
import AtlasExecutiveOverview from '../../templates/AtlasExecutiveOverview';

export const revalidate = 86400; // 24h CDN static cache

export const metadata = {
  title: 'Atlas Health Services | Advanced Pharmaceutical Compounding, Peptide Therapeutics & Clinical AI OS',
  description:
    'Official Executive Overview of Atlas Health Services. Connecting European GMP pharmaceutical compounding, 580+ peptide & BHRT formulations, AI-assisted clinical protocols, and digital Rx infrastructure across UAE, EU, US, and Hong Kong.',
  alternates: {
    canonical: 'https://www.atlashealth-services.com/atlas',
  },
  openGraph: {
    title: 'Atlas Health Services — Advanced Compounding & Precision Medicine OS',
    description:
      'GMP sterile compounding, 580+ peptide & bioidentical hormone formulations, 200+ clinical protocols, and end-to-end digital Rx infrastructure across UAE (HQ), EU, US & HK.',
    url: 'https://www.atlashealth-services.com/atlas',
    siteName: 'Atlas Health Services',
    images: [
      {
        url: 'https://www.atlashealth-services.com/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'Atlas Health Services — Executive Overview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas Health Services — Advanced Compounding & Precision Medicine OS',
    description:
      'GMP sterile compounding, 580+ peptide & BHRT formulations, 200+ clinical protocols, and digital Rx workflows across UAE, EU, US & HK.',
    images: ['https://www.atlashealth-services.com/og-preview.png'],
  },
};

export default function AtlasOverviewPage() {
  return <AtlasExecutiveOverview />;
}

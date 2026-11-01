import React from 'react';
import QatarGenomicsPriceClient from './QatarGenomicsPriceClient';

export const revalidate = 60;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = '24Genetics Clinical DNA & Nutrigenomics • Official Qatar Distributor Price Schedule (Ryhanh Medical Company)';
  const description = 'Exclusive B2B price schedule and Atlas AI™ genomic translation engine for 24Genetics CE-IVD saliva testing kits in Qatar. Authorized Distributor: Ryhanh Medical Company (Ryhanh Group, Doha, Qatar). Contact: Hossam Ahmed.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${appUrl}/pricing/24genomics-qatar`
    }
  };
}

export default function QatarGenomicsPricingPage() {
  return <QatarGenomicsPriceClient />;
}


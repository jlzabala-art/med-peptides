import React from 'react';
import QatarGenomicsPriceClient from './QatarGenomicsPriceClient';

export const revalidate = 60;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = '24Genetics Clinical DNA & Nutrigenomics • Official Qatar Distributor Price Schedule (Hossam)';
  const description = 'Exclusive B2B price schedule for 24Genetics CE-IVD saliva testing kits and Nutrigenetics (Nutrigen) in Qatar. Partner: Hossam / The Masters Medical Center.';

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

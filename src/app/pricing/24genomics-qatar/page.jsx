import React from 'react';
import QatarGenomicsPriceClient from './QatarGenomicsPriceClient';

export const revalidate = 60;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = '24Genomics Nutrition • Clinical DNA, Precision Nutrigenomics & Compounding Schedule';
  const description = 'Official B2B schedule for 24Genomics Nutrition saliva DNA testing kits, clinical nutrition reports, personalized 3-capsule compounding protocols and ongoing WhatsApp clinical consultations.';

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


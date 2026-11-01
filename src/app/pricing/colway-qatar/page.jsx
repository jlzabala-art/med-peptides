import React from 'react';
import QatarColwayPriceClient from './QatarColwayPriceClient';

export const revalidate = 60;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = 'Colway Trichology Hair Care • Official Qatar Distributor Price Schedule (Hossam)';
  const description = 'Exclusive B2B commercial schedule and landed cost breakdown for Colway Hair Strengthening Shampoo & Conditioner in Qatar. Partner: Hossam / The Masters Medical Center.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${appUrl}/pricing/colway-qatar`
    }
  };
}

export default function QatarColwayPricingPage() {
  return <QatarColwayPriceClient />;
}

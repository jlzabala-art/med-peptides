import React from 'react';
import QatarColwayPriceClient from './QatarColwayPriceClient';

export const revalidate = 60;

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = 'Colway Trichology Hair Care • Official Qatar Distributor Price Schedule (Ryhanh Medical Company)';
  const description = 'Exclusive B2B commercial schedule and landed cost breakdown for Colway Hair Strengthening Shampoo & Conditioner in Qatar. Authorized Distributor: Ryhanh Medical Company (Ryhanh Group, Doha, Qatar). Contact: Hossam Ahmed.';

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


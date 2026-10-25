import React from 'react';
import CompoundingPage from '../../templates/CompoundingPage';

export const revalidate = 86400; // 24h CDN static cache (client handles interactivity)

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

export const metadata = {
  title: 'Custom Compounding & Personalized Capsules | Atlas Health',
  description:
    'Design a personalized compounded formula in acid-resistant vegan HPMC capsules. 118 pharmacopeial-grade actives, automatic capsule sizing and EU GMP batch production in 48–72h.',
  keywords: [
    'custom compounding',
    'personalized capsules',
    'compounded nutraceuticals',
    'formulación magistral',
    'suplementos personalizados',
    'EU GMP compounding pharmacy',
    'vegan HPMC capsules'
  ],
  alternates: { canonical: `${BASE_URL}/compounding` },
  openGraph: {
    title: 'Atlas Custom Compounding Lab',
    description: 'Build your own compounded formula in 3 steps. EU GMP · Vegan HPMC · 48–72h batch release.',
    url: `${BASE_URL}/compounding`,
    siteName: 'Atlas Health Services',
    type: 'website',
    images: [{ url: `${BASE_URL}/og-card.png`, width: 1200, height: 630, alt: 'Atlas Custom Compounding Lab' }]
  }
};

export default function CompoundingRoute() {
  return <CompoundingPage />;
}

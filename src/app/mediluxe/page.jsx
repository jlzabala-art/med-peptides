import MediluxeCompanyProfile from '../../templates/MediluxeCompanyProfile';

export const revalidate = 86400; // 24h CDN static cache

export const metadata = {
  title: 'MediLuxe Medical Supplies | Caring for Health (Official Company Profile)',
  description: 'Established in 2011 in Abu Dhabi & Dubai. 14+ years pioneering personalized medicine, European certified DNA diagnostics, and advanced compounding pharmacy solutions across UAE, Qatar, Kuwait & Saudi Arabia.',
  alternates: {
    canonical: 'https://www.atlashealth-services.com/mediluxe',
  },
  openGraph: {
    title: 'MediLuxe — Caring for Health | Official Company Profile',
    description: 'GCC leader in personalized healthcare, genomic diagnostics, and custom compounding therapies. Licensed in Abu Dhabi (HQ) & Dubai (2024).',
    url: 'https://www.atlashealth-services.com/mediluxe',
    siteName: 'Atlas Health & MediLuxe Medical Supplies',
    images: [
      {
        url: 'https://www.atlashealth-services.com/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'MediLuxe Medical Supplies L.L.C. - Company Profile',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediLuxe — Caring for Health | Official Company Profile',
    description: 'GCC leader in personalized healthcare, genomic diagnostics, and custom compounding therapies. Licensed in Abu Dhabi (HQ) & Dubai (2024).',
    images: ['https://www.atlashealth-services.com/og-preview.png'],
  },
};

export default function MediluxePage() {
  return <MediluxeCompanyProfile />;
}

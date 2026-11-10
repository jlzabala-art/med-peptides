import React from 'react';

/**
 * Metadata configuration for B2B Payables Statements.
 * Enforces total discretion:
 *  - 100% anonymous & discrete OpenGraph / Twitter previews (no amounts, no vendor names in snippet).
 *  - Noindex / nofollow robots directive so search engines never index or archive settlement data.
 *  - Zero references to internal suppliers or Mediluxe.
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token;
  const canonicalUrl = `https://www.atlashealth-services.com/b2b/payables/${token || ''}`;

  return {
    metadataBase: new URL('https://www.atlashealth-services.com'),
    title: 'B2B Commercial Settlement · Atlas Health Services',
    description: 'Confidential B2B commercial settlement statement. Authenticated partner access only.',
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        'max-video-preview': -1,
        'max-image-preview': 'none',
        'max-snippet': -1
      }
    },
    openGraph: {
      title: 'Commercial Settlement Document · Atlas Health Services',
      description: 'Confidential commercial account statement. Verified partner access required.',
      url: canonicalUrl,
      siteName: 'Atlas Health Services',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/icon.svg',
          width: 512,
          height: 512,
          alt: 'Atlas Health Services Commercial Document'
        }
      ]
    },
    twitter: {
      card: 'summary',
      title: 'Commercial Settlement Document · Atlas Health Services',
      description: 'Confidential commercial account statement. Verified partner access required.',
      images: ['/icon.svg']
    }
  };
}

export default function PayablesLayout({ children }) {
  return <>{children}</>;
}


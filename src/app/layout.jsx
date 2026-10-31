/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import '../index.css';
import NextProviders from './NextProviders';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { serverConfig } from '../authConfig';
import GlobalClientWrapper from './GlobalClientWrapper';
import { Suspense } from 'react';


export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com'),
  title: {
    default: 'Atlas — Precision Peptide & Clinical Protocol Intelligence',
    template: '%s | Atlas Health'
  },
  description: 'Atlas is the institutional medical intelligence platform for evidence-based peptide protocols, compounding pharmacy supply, and certified bulk active pharmaceutical ingredients (APIs).',
  applicationName: 'Atlas Health',
  keywords: [
    'Atlas Health',
    'Atlas Peptides',
    'clinical peptide protocol directory',
    'compounding pharmacy API supplier',
    'BPC-157 clinical blueprint',
    'Semax and Selank protocols',
    'Tirzepatide bulk active pharmaceutical ingredient',
    'high-purity HPLC peptides UAE Saudi Arabia',
    'longevity medicine clinical database',
    'physician peptide prescribing platform'
  ],
  authors: [{ name: 'Atlas Clinical Advisory Board', url: 'https://www.atlashealth-services.com' }],
  creator: 'Atlas Health Intelligence',
  publisher: 'Atlas Health Intelligence',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Atlas — Precision Peptide & Clinical Protocol Intelligence',
    description: 'Standardized clinical blueprints, HPLC-certified peptides, and bulk active ingredients for licensed physicians and compounding facilities.',
    url: 'https://www.atlashealth-services.com',
    siteName: 'Atlas Health Platform',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas — Precision Peptide & Clinical Protocol Intelligence',
    description: 'Evidence-based clinical protocols and certified bulk APIs for regenerative medicine and longevity.',
  },
  alternates: {
    canonical: 'https://www.atlashealth-services.com',
    languages: {
      'en-US': 'https://www.atlashealth-services.com',
      'ar-SA': 'https://www.atlashealth-services.com/ar',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

const medicalOrgSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'Atlas Health',
  alternateName: 'Atlas Peptide & Protocol Intelligence Platform',
  url: 'https://www.atlashealth-services.com',
  logo: 'https://www.atlashealth-services.com/icon-512.png',
  medicalSpecialty: [
    'Endocrinology',
    'Dermatology',
    'SportsMedicine',
    'Geriatrics'
  ],
  knowsAbout: [
    'Peptide Therapeutics',
    'BPC-157',
    'Semax',
    'Selank',
    'Active Pharmaceutical Ingredients',
    'Compounding Formulations',
    'Longevity Medicine'
  ]
};

async function AuthWrapper({ children }) {
  let serverUser = null;
  try {
    const cookieStore = await cookies();
    if (cookieStore.has(serverConfig.cookieName)) {
      const tokens = await getTokens(cookieStore, {
        apiKey: serverConfig.firebaseApiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
      });
      serverUser = tokens ? tokens.decodedToken : null;
    }
  } catch (err) {
    if (err?.digest?.startsWith('DYNAMIC_SERVER_USAGE') || err?.message?.includes('Dynamic server usage')) {
      throw err;
    }
    serverUser = null;
  }

  return (
    <NextProviders serverUser={serverUser}>
      <GlobalClientWrapper>
        {children}
      </GlobalClientWrapper>
    </NextProviders>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var host = window.location.hostname;
                  if (host && (host.indexOf('med-peptides-app') !== -1 || host.indexOf('med-peptides') !== -1)) {
                    var canonicalUrl = 'https://www.atlashealth-services.com' + window.location.pathname + window.location.search + window.location.hash;
                    window.location.replace(canonicalUrl);
                  }
                } catch(e) {}
              })();
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalOrgSchema) }}
        />
        <style>{`
          :root {
            --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            font-family: var(--font-sans);
          }
          .global-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #e2e8f0;
            border-top-color: #003666;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 0.8s linear infinite;
          }
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
            background-color: #f8fafc;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <div id="root">
          <Suspense fallback={<div className="spinner-container"><span className="global-spinner"></span></div>}>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </Suspense>
        </div>
      </body>
    </html>
  );
}


/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import '../index.css';
import NextProviders from './NextProviders';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { serverConfig } from '../authConfig';
import GlobalClientWrapper from './GlobalClientWrapper';
import { Suspense } from 'react';

export const metadata = {
  title: 'Atlas App',
  description: 'Atlas Health — Precision Peptide & Protocol Intelligence',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=3' },
    ],
    shortcut: '/favicon.svg?v=3',
    apple: '/favicon.svg?v=3',
  },
};

async function AuthWrapper({ children }) {
  let serverUser = null;
  try {
    const cookieStore = await cookies();
    const tokens = await getTokens(cookieStore, {
      apiKey: serverConfig.firebaseApiKey,
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: serverConfig.cookieSignatureKeys,
      serviceAccount: serverConfig.serviceAccount,
    });
    serverUser = tokens ? tokens.decodedToken : null;
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
        <link rel="alternate icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=3" />
        <style>{`
          .global-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #334155;
            border-bottom-color: #3b82f6;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
          }
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            background-color: #0f172a;
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


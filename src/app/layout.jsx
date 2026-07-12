import '../index.css';
import NextProviders from './NextProviders';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { serverConfig } from '../authConfig';
import GlobalClientWrapper from './GlobalClientWrapper';

export const metadata = {
  title: 'RegenPept Web',
  description: 'RegenPept Web Application',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const tokens = await getTokens(cookieStore, {
    apiKey: serverConfig.firebaseApiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  const serverUser = tokens ? tokens.decodedToken : null;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/regenpept_logo_favicon.svg" />
      </head>
      <body>
        <div id="root">
          <NextProviders serverUser={serverUser}>
            <GlobalClientWrapper>
              {children}
            </GlobalClientWrapper>
          </NextProviders>
        </div>
      </body>
    </html>
  );
}


export const serverConfig = {
  useSecureCookies: process.env.NODE_ENV === 'production',
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  serviceAccount: process.env.FIREBASE_PRIVATE_KEY ? {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  } : undefined,
  cookieName: 'AuthToken',
  cookieSignatureKeys: process.env.COOKIE_SIGNATURE_KEYS ? process.env.COOKIE_SIGNATURE_KEYS.split(',') : ['secret-key-for-dev'],
  cookieSerializeOptions: {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 24, // 12 days
  },
};

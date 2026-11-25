import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { serverConfig } from '@/lib/authConfig';

const ADMIN_EMAILS = ['jlzabala@gmail.com', 'admin@atlashealth-services.com'];

/**
 * Checks on the server whether the current request belongs to an authenticated Admin.
 * Returns false for unauthenticated visitors, doctors, patients, wholesalers, or competitors.
 */
export async function isAdminServerSession() {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.has(serverConfig.cookieName)) return false;

    const tokens = await getTokens(cookieStore, {
      apiKey: serverConfig.firebaseApiKey,
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: serverConfig.cookieSignatureKeys,
      serviceAccount: serverConfig.serviceAccount,
    });

    const role = String(tokens?.decodedToken?.role || '').toLowerCase().trim();
    const email = String(tokens?.decodedToken?.email || '').toLowerCase().trim();
    return (
      role === 'admin' ||
      tokens?.decodedToken?.admin === true ||
      ADMIN_EMAILS.includes(email)
    );
  } catch {
    return false;
  }
}

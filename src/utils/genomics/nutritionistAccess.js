import crypto from 'crypto';

const DEFAULT_SECRET = 'atlas-genomics-nutritionist-portal-key-2026';

function getSecret() {
  return process.env.GENOMICS_NUTRITIONIST_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
}

/**
 * Generates a deterministic 16-char HMAC token scoped to a genomic sampleCode.
 * Used to authorize the Nutritionist QR & URL without exposing raw secrets.
 */
export function computeNutritionistToken(sampleCode) {
  const cleanSample = String(sampleCode || '').trim().toUpperCase();
  if (!cleanSample) return '';
  return crypto
    .createHmac('sha256', getSecret())
    .update(`nutritionist:${cleanSample}`)
    .digest('hex')
    .slice(0, 16);
}

/**
 * Constant-time check for a nutritionist token against a sampleCode.
 */
export function verifyNutritionistToken(sampleCode, token) {
  if (!sampleCode || !token) return false;
  const expected = computeNutritionistToken(sampleCode);
  const provided = String(token).trim();
  if (expected.length !== provided.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

/**
 * Builds canonical Patient and Nutritionist portal URLs.
 */
export function buildDnaPortalUrls({ baseUrl = 'https://www.atlashealth-services.com', patientName, sampleCode, clinic, doctor, includeNutritionist = false }) {
  const params = new URLSearchParams();
  if (patientName) params.set('patient', patientName);
  if (sampleCode) params.set('sample', sampleCode);
  if (clinic) params.set('clinic', clinic);
  if (doctor) params.set('doctor', doctor);

  const patientUrl = `${baseUrl}/patient/dna-report?${params.toString()}`;
  if (!includeNutritionist) {
    return { patientUrl, nutritionistUrl: null };
  }

  const nutParams = new URLSearchParams(params.toString());
  nutParams.set('view', 'nutritionist');
  nutParams.set('nt', computeNutritionistToken(sampleCode));
  const nutritionistUrl = `${baseUrl}/patient/dna-report?${nutParams.toString()}`;

  return { patientUrl, nutritionistUrl };
}

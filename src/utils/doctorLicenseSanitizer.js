/**
 * Normalizes any physician license/credential string so regulatory abbreviations
 * (DHA, DOH, MOH, etc.) are never exposed in labels, prescriptions, or UI.
 * Always returns "Certified Doctor" (or "Médico Certificado" when isEs=true).
 */
export function sanitizeDoctorLicense(rawLicense, isEs = false) {
  const fallback = isEs ? 'Médico Certificado' : 'Certified Doctor';
  if (!rawLicense) return fallback;
  const str = String(rawLicense).trim();
  if (!str) return fallback;

  if (/\b(DHA|DOH|MOH)\b/i.test(str) || /DHA[-_\s]*\d+/i.test(str)) {
    return fallback;
  }

  return str;
}

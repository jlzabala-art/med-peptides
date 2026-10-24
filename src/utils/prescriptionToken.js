/**
 * prescriptionToken.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX Zero-Friction Patient Access Token Utility.
 * Allows doctors to share one-click WhatsApp links that securely authenticate
 * the patient session in read & request mode without requiring a password.
 */

export function generatePatientAccessKey(rxId, salt = 'atlas_rx_secure_2026') {
  if (!rxId) return '';
  const cleanId = String(rxId).trim().toUpperCase();
  let hash = 0;
  const str = `${cleanId}:${salt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex.slice(0, 8);
}

export function verifyPatientAccessKey(rxId, token) {
  if (!rxId || !token) return false;
  const expected = generatePatientAccessKey(rxId);
  return expected.toLowerCase() === String(token).toLowerCase().trim();
}

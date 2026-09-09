/**
 * src/services/quotationRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Proxy / Bridge file for backward compatibility.
 * All quotation, RFQ, and purchase order Firestore repository operations
 * have been unified in src/repositories/quotationRepository.js (Golden Rule #2).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export * from '../repositories/quotationRepository';
export { default } from '../repositories/quotationRepository';

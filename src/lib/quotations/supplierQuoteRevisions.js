/**
 * supplierQuoteRevisions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure domain helpers for supplier quotation revision tracking (e.g., ilapo
 * SQ212214 R1 €54 -> R2 €49) and canonical ilapo Germany profile.
 */

export const ILAPO_SUPPLIER_PROFILE = Object.freeze({
  id: 'supplier-ilapo-germany',
  companyName: 'ilapo — Internationale Ludwigs-Arzneimittel GmbH & Co. KG',
  legalName: 'Internationale Ludwigs-Arzneimittel GmbH & Co. KG',
  displayName: 'ilapo (Germany)',
  slug: 'ilapo-germany',
  type: 'PHARMA_WHOLESALER_EU',
  category: 'Pharmaceutical Wholesale & Import/Export (§73.3 AMG)',
  country: 'Germany',
  city: 'Munich',
  originCountry: 'Germany',
  address: 'Friedenheimer Brücke 21, 80639 München, Germany',
  vatId: 'DE 814 409 583',
  commercialRegister: 'HRA München 78768 · HRB München 139021',
  website: 'https://www.ilapo.de',
  email: 'info@ilapo.de',
  phone: '+49 89 189 40-300',
  fax: '+49 89 189 40-333',
  certifications: ['ISO 9001', '§73.3 AMG Wholesale Authorization (22.04.2024 · Regierung von Oberbayern)'],
  customerReferenceCode: '66796',
  status: 'active',
  statusB2B: 'approved',
  contacts: [
    {
      name: 'Jan-Luca Bade',
      role: 'Salesperson / Export Account Manager',
      email: 'info@ilapo.de',
      phone: '+49 89 189 40-300',
    },
  ],
  commercialTerms: {
    incoterm: 'FCA (Incoterms 2020), Friedenheimer Brücke 21, 80639 München',
    paymentTerms: 'Vorkasse / Prepayment',
    currency: 'EUR',
    returnsPolicy: 'Return for foreign goods not possible according to §73 AMG and §25 TAM',
    bank: 'Postbank (Deutsche Bank AG) · IBAN DE 22 7601 0085 0604 6428 59 · BIC PBNKDEFFXXX',
  },
});

export function computeQuoteRevisionImprovement({
  previousUnitPrice,
  currentUnitPrice,
  quantity = 1,
  currency = 'EUR',
}) {
  const prev = Number(previousUnitPrice);
  const curr = Number(currentUnitPrice);
  const qty = Number(quantity) || 1;
  if (!Number.isFinite(prev) || prev <= 0 || !Number.isFinite(curr)) {
    return null;
  }

  const unitDelta = Number((curr - prev).toFixed(2));
  const totalDelta = Number((unitDelta * qty).toFixed(2));
  const improvementPct = Number((((curr - prev) / prev) * 100).toFixed(2));

  return {
    previousUnitPrice: prev,
    currentUnitPrice: curr,
    unitDelta,
    totalDelta,
    improvementPct,
    isImproved: curr < prev,
    currency,
  };
}

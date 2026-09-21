/**
 * src/scripts/seedUaeCompanySetup.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed UAE Corporate Setup & Residency Service into Firestore products collection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../lib/firebaseAdmin.js';

export const UAE_COMPANY_SETUP_PRODUCT = {
  id: 'uae-company-setup-dubai',
  docId: 'uae-company-setup-dubai',
  slug: 'uae-company-setup-dubai',
  name: 'UAE Corporate Setup & Residency (Dubai / Abu Dhabi)',
  canonicalName: 'UAE Company Formation, Golden Visa & Banking Concierge',
  displayName: 'UAE Business Setup & Residency Concierge',
  title: 'UAE Corporate Setup & Residency (Dubai / Abu Dhabi)',
  type: 'service',
  productType: 'service',
  product_type: 'service',
  category: 'corporate_services',
  categoryId: 'corporate_services',
  therapeutic_category: 'Corporate Structuring & International Residency',
  status: 'published',
  isActive: true,
  currency: 'AED',
  purity: '100% Regulatory Compliance (UAE Ministry of Economy)',
  targetSystem: 'Corporate Structuring, UAE Residency & Banking Infrastructure',
  target: 'Corporate Structuring, UAE Residency & Banking Infrastructure',
  targetAxis: 'Corporate Structuring, UAE Residency & Banking Infrastructure',
  casNumber: 'DED / Free Zone Authority Regulated',
  molecularWeight: 'N/A (Corporate Legal Service)',
  molecularFormula: 'IFZA / Meydan / DMCC / DED Mainland',
  description: 'Turnkey UAE corporate incorporation and residency concierge service for international entrepreneurs, clinic owners, medical practitioners, and investors. Comprehensive structuring across premier Dubai Free Zones (IFZA, Meydan, DMCC) and UAE Mainland (DED). Features guaranteed 100% foreign ownership, 0% personal income tax, expedited VIP residency visas (Investor / Partner / Golden Visa), expedited Emirates ID biometrics, and dedicated corporate banking onboarding (Wio, Emirates NBD, Mashreq). Includes annual registered agent compliance, corporate tax registration, and VAT advisory.',
  clinicalOverview: 'Turnkey UAE corporate incorporation and residency concierge service for international entrepreneurs, clinic owners, medical practitioners, and investors. Comprehensive structuring across premier Dubai Free Zones (IFZA, Meydan, DMCC) and UAE Mainland (DED). Features guaranteed 100% foreign ownership, 0% personal income tax, expedited VIP residency visas (Investor / Partner / Golden Visa), expedited Emirates ID biometrics, and dedicated corporate banking onboarding (Wio, Emirates NBD, Mashreq). Includes annual registered agent compliance, corporate tax registration, and VAT advisory.',
  isService: true,
  isCorporateService: true,
  jurisdictions: ['IFZA Dubai', 'Meydan Free Zone', 'DMCC Dubai', 'DED Mainland Dubai', 'ADGM Abu Dhabi'],
  taxBenefits: [
    '0% Personal Income Tax on all individual income and capital gains',
    '100% Foreign Ownership (No local Emirati sponsor required)',
    '100% Repatriation of Capital and Profits with zero currency exchange restrictions',
    '9% Corporate Tax with 0% Qualifying Free Zone Person (QFZP) exemptions',
    'Access to 140+ UAE Double Tax Avoidance Treaties (DTTs)'
  ],
  timelineDays: '4 to 12 Business Days (Fast-Track Turnkey)',
  variants: [
    {
      id: 'uae-setup-freezone-starter',
      name: 'Freezone Commercial License (0 Visas)',
      dosage: 'License Only',
      dose: 'License Only',
      format: 'package',
      presentation: 'Digital & Legal Package',
      presentationName: 'Freezone Commercial License',
      type: 'service',
      unitOfMeasure: 'package',
      unitCost: 8500.00,
      costPrice: 8500.00,
      cost: 8500.00,
      price: 12500.00,
      price_aed: 12500.00,
      price_usd: 3400.00,
      currency: 'AED',
      costCurrency: 'AED',
      supplier: 'Atlas Corporate Advisory',
      supplierName: 'Atlas Corporate Advisory',
      supplierId: 'supplier-atlas-corporate',
      status: 'active',
      inStock: true,
      deliverables: [
        'Official Trade License (1 Year Validity)',
        'Memorandum of Association (MoA) & Articles of Incorporation',
        'Registered Address & Virtual Flexi-Desk Lease Agreement',
        'Certificate of Incorporation & Share Registry',
        'Federal Tax Authority (FTA) Corporate Tax Registration',
        'Digital Certificate of Good Standing'
      ]
    },
    {
      id: 'uae-setup-investor-residency',
      name: 'Executive Investor Package (1 Visa + Emirates ID)',
      dosage: '1 Investor Visa',
      dose: '1 Investor Visa',
      format: 'package',
      presentation: 'Turnkey Residency Package',
      presentationName: 'Executive Investor Residency',
      type: 'service',
      unitOfMeasure: 'package',
      unitCost: 14900.00,
      costPrice: 14900.00,
      cost: 14900.00,
      price: 21900.00,
      price_aed: 21900.00,
      price_usd: 5960.00,
      currency: 'AED',
      costCurrency: 'AED',
      supplier: 'Atlas Corporate Advisory',
      supplierName: 'Atlas Corporate Advisory',
      supplierId: 'supplier-atlas-corporate',
      status: 'active',
      inStock: true,
      deliverables: [
        'Commercial Trade License (1 Year Validity)',
        'Immigration Establishment Card (ICP / GDRFA)',
        'E-Channel Government Portal Registration',
        '2-Year UAE Investor / Partner Residency Visa (Entry Permit Included)',
        'VIP Fast-Track Medical Fitness Blood & X-Ray Examination',
        'VIP Emirates ID Biometrics Appointment & Express Delivery',
        'Corporate Bank Account Assistance (Wio Bank Business / Emirates NBD)',
        'Dedicated Corporate Concierge Specialist'
      ]
    },
    {
      id: 'uae-setup-medical-clinic',
      name: 'Healthcare & Longevity Clinic Setup (DHA / MOHAP)',
      dosage: 'Medical Facility',
      dose: 'Medical Facility',
      format: 'package',
      presentation: 'Healthcare Facility Package',
      presentationName: 'Healthcare Facility Setup',
      type: 'service',
      unitOfMeasure: 'package',
      unitCost: 34000.00,
      costPrice: 34000.00,
      cost: 34000.00,
      price: 48000.00,
      price_aed: 48000.00,
      price_usd: 13000.00,
      currency: 'AED',
      costCurrency: 'AED',
      supplier: 'Atlas Corporate Advisory',
      supplierName: 'Atlas Corporate Advisory',
      supplierId: 'supplier-atlas-corporate',
      status: 'active',
      inStock: true,
      deliverables: [
        'DHA (Dubai Health Authority) / MOHAP Initial Regulatory Approval',
        'Healthcare Commercial Trade License Setup',
        'Clinic Floor Plan Layout Regulatory Vetting & Civil Defense Compliance',
        'Medical Director & Clinical Personnel Licensing Assistance',
        'Healthcare Waste Management & Pharmacy Permitting Advisory',
        'Medical Malpractice Insurance & Local Healthcare Compliance Framework'
      ]
    },
    {
      id: 'uae-setup-holding-trading',
      name: 'International Trading & Holding Structure (Multi-Currency)',
      dosage: 'Holding & Trading',
      dose: 'Holding & Trading',
      format: 'package',
      presentation: 'Corporate Holding Structure',
      presentationName: 'Holding & Trading Structure',
      type: 'service',
      unitOfMeasure: 'package',
      unitCost: 22000.00,
      costPrice: 22000.00,
      cost: 22000.00,
      price: 32000.00,
      price_aed: 32000.00,
      price_usd: 8700.00,
      currency: 'AED',
      costCurrency: 'AED',
      supplier: 'Atlas Corporate Advisory',
      supplierName: 'Atlas Corporate Advisory',
      supplierId: 'supplier-atlas-corporate',
      status: 'active',
      inStock: true,
      deliverables: [
        'International Holding & General Trading Dual-Activity License',
        'Dubai Customs Registration & Importer/Exporter Code',
        '2 UAE Investor Residency Visas (2 Years)',
        'Tier-1 Corporate Banking Multi-Currency Setup (AED, USD, EUR, GBP)',
        'Transfer Pricing & Economic Substance Regulations (ESR) Review',
        'Annual Corporate Secretarial & Registered Agent Service'
      ]
    }
  ],
  updatedAt: new Date().toISOString()
};

async function seed() {
  console.log('Seeding UAE Company Setup product into Firestore...');
  const docRef = adminDb.collection('products').doc(UAE_COMPANY_SETUP_PRODUCT.id);
  await docRef.set(UAE_COMPANY_SETUP_PRODUCT, { merge: true });
  console.log('✔ Successfully seeded uae-company-setup-dubai into Firestore!');
}

seed().catch(err => {
  console.error('Failed to seed:', err);
  process.exit(1);
});

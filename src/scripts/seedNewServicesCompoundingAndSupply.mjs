/**
 * src/scripts/seedNewServicesCompoundingAndSupply.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed two institutional services into Firestore products collection:
 * 1. European Pharmaceutical Compounding Service (compounding-services)
 * 2. B2B Peptide Supply & Inventory Management Service (peptide-supply-management)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../lib/firebaseAdmin.js';

export const COMPOUNDING_SERVICE_PRODUCT = {
  id: 'pharmaceutical-compounding-service',
  docId: 'pharmaceutical-compounding-service',
  slug: 'pharmaceutical-compounding-service',
  name: 'European Pharmaceutical Compounding & Custom Formulation Service',
  canonicalName: 'European Pharmaceutical Compounding & Custom Formulation Service (EU GMP Certified)',
  displayName: 'European Pharmaceutical Compounding',
  title: 'European Pharmaceutical Compounding & Custom Formulation Service',
  type: 'service',
  productType: 'service',
  product_type: 'service',
  category: 'corporate_services',
  categoryId: 'corporate_services',
  therapeutic_category: 'Pharmaceutical Compounding & Custom Manufacturing',
  status: 'published',
  isActive: true,
  supplier: 'Mediluxe Health Solutions',
  supplierId: 'supplier-mediluxe',
  supplierName: 'Mediluxe Health Solutions',
  supplierIds: ['supplier-mediluxe'],
  suppliers: ['supplier-mediluxe'],
  currency: 'EUR',
  purity: 'EU Ph. Eur. / GMP Certified European Compounding Pharmacy',
  targetSystem: 'Personalized Clinical Prescriptions & Sterile Compounding',
  target: 'Personalized Clinical Prescriptions & Sterile Compounding',
  targetAxis: 'Custom Formulation, Sterile Vials, Lyophilization & Precision Dosing',
  casNumber: 'EU GMP Compounding / Custom Formulation',
  molecularWeight: 'Custom Prescription Matrix (Compounded Formulation)',
  molecularFormula: 'Active Pharmaceutical Ingredients (API) + Sterile Diluent',
  description: 'Specialized formulation and manufacturing of custom pharmaceutical compounds and prescription medications in licensed European compounding laboratories. Designed for medical practices requiring tailored concentrations, custom peptide blends, and specialized delivery formats. Provides two flexible invoicing pathways (Clinic B2B Wholesale vs Direct Patient RRP) and dual cold-chain shipping options (direct to clinic or patient dropship). Turnaround time is 5–7 working days from European compounding pharmacies with free shipping on orders of 10+ units.',
  clinicalOverview: 'Accredited European compounding pharmacy partnership facilitating bespoke physician-prescribed therapeutics. All compounding operations comply with Good Manufacturing Practices (GMP) and European Pharmacopoeia (Ph. Eur.) monographs. The workflow incorporates complete end-to-end cold-chain logistics from Europe to clinics or patient residences in the UAE, GCC, and internationally.',
  isService: true,
  isCorporateService: true,
  serviceSubtype: 'compounding',
  jurisdiction: 'European Union / International Distribution',
  turnaroundTime: '5 – 7 Working Days (Preparation + European Cold-Chain Shipping)',
  orderChannels: [
    {
      name: 'Dedicated Mobile Application',
      description: 'Select products, upload prescriptions, and track manufacturing and delivery via our dedicated mobile app.'
    },
    {
      name: 'Clinical Prescription Desk',
      description: 'Submit formal doctor prescriptions directly to our clinical compounding desk at kasia@mediluxeme.com or business@med-peptides.com.'
    }
  ],
  pricingRules: {
    clinicPayer: 'Wholesale Clinical Price List applied (Clinic retains commercial markup)',
    patientPayer: 'Recommended Patient Price (RRP) applied (Direct settlement without clinic billing burden)',
    shippingCost: '200 to 400 AED (approx. 50–100 EUR / 55–110 USD)',
    freeShippingThreshold: 'Complimentary shipping on orders of 10 or more units',
    paymentMethods: ['European Bank Transfer (SEPA / IBAN)', 'Secure Online Payment Link (Credit / Debit Cards)'],
    baseCurrency: 'EUR (Converted to AED based on invoice issuance date)'
  },
  keyAdvantages: [
    'Certified European Compounding Pharmacy: Formulated under strict European GMP and Ph. Eur. quality standards',
    'Custom Concentrations & Combinations: Tailored dosing matrices unavailable in standard commercial formulations',
    'Dual Order Channels: Order via dedicated Mobile App or direct email to kasia@mediluxeme.com',
    'Flexible Invoicing: Invoice issued to Clinic at Wholesale Price OR directly to Patient at Recommended Retail Price (RRP)',
    'Dual Destination Shipping: Direct cold-chain dispatch to the Clinic OR dropshipped to the Patient residence',
    'Reliable 5–7 Day Turnaround: Full documentation, compounding, and international temperature-controlled transit',
    'Free Shipping on 10+ Units: Standard 200–400 AED shipping fee waived on orders of 10 or more items',
    'Multi-Currency Payment Options: European SEPA wire or secure email payment link in EUR/AED'
  ],
  variants: [
    {
      id: 'compounding-clinic-direct',
      name: 'Clinic Invoiced & Clinic Delivery (B2B Bulk Fulfillment)',
      dosage: 'B2B Clinical Order',
      dose: 'Clinic B2B Price',
      format: 'package',
      presentation: 'European GMP Compounding Package',
      presentationName: 'Clinic Invoiced & Delivered',
      supplier: 'Mediluxe Health Solutions',
      supplierId: 'supplier-mediluxe',
      supplierName: 'Mediluxe Health Solutions',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Custom prescription manufacturing in certified European compounding lab',
        'Clinical B2B Wholesale Pricing applied to commercial invoice',
        'Direct bulk cold-chain dispatch to clinic address',
        'Full Certificate of Analysis (COA) & Batch Compounding Record included',
        'Consolidated invoice for clinic accounting and margin capture'
      ]
    },
    {
      id: 'compounding-patient-direct',
      name: 'Patient Invoiced & Patient Delivery (Direct Patient Dropship)',
      dosage: 'Patient Direct Fulfillment',
      dose: 'Patient RRP Price',
      format: 'package',
      presentation: 'Patient Direct Compounding Package',
      presentationName: 'Patient Invoiced & Delivered',
      supplier: 'Mediluxe Health Solutions',
      supplierId: 'supplier-mediluxe',
      supplierName: 'Mediluxe Health Solutions',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Custom prescription compounding based on physician upload',
        'Direct patient invoicing at Recommended Patient Price (RRP)',
        'Secure instant payment link sent directly to patient email/SMS',
        'Discreet temperature-controlled insulated home delivery',
        'Zero billing collection overhead or inventory risk for the clinic'
      ]
    },
    {
      id: 'compounding-custom-batch',
      name: 'Institutional High-Volume Batch (10+ Units · Complimentary Shipping)',
      dosage: 'Institutional Batch',
      dose: 'Volume Tier Pricing',
      format: 'package',
      presentation: 'High-Volume Compounding Batch',
      presentationName: '10+ Units Free Shipping',
      supplier: 'Mediluxe Health Solutions',
      supplierId: 'supplier-mediluxe',
      supplierName: 'Mediluxe Health Solutions',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Dedicated custom batch compounding with priority queue',
        'Complimentary international cold-chain air freight (0 AED / 0 EUR)',
        'Flexible destination splitting (part to clinic, part to patient residences)',
        'Dual-language patient administration guides included',
        'Dedicated clinical liaison coordination'
      ]
    }
  ],
  faqs: [
    {
      q: 'How do we submit a compounding request?',
      a: 'You can submit requests through our dedicated mobile application or by emailing physician prescriptions and required quantities to kasia@mediluxeme.com or business@med-peptides.com.'
    },
    {
      q: 'How does flexible invoicing work between the clinic and the patient?',
      a: 'You choose who receives the invoice. If the clinic pays, our preferential Clinical Wholesale Price list is applied, allowing you to charge your patient according to your practice rates. If you prefer the patient to pay directly, we issue the invoice directly to the patient at the Recommended Patient Price (RRP).'
    },
    {
      q: 'Can shipments be delivered directly to the patient?',
      a: 'Yes. The importer organizes temperature-controlled shipment directly from Europe to either your clinic receiving department or directly to the patient’s home address.'
    },
    {
      q: 'What are the shipping costs and delivery timelines?',
      a: 'Shipping typically costs between 200 and 400 AED (approximately 50–100 EUR or 55–110 USD). Orders of 10 or more products qualify for free complimentary shipping. The total timeline from compounding to delivery is 5 to 7 working days.'
    },
    {
      q: 'What payment options are accepted?',
      a: 'Payments can be made via direct wire transfer to the Importer’s European bank account (SEPA/IBAN) or through a secure payment link sent by email (accepting major debit/credit cards). All invoices are based in Euros, with exchange rates to UAE Dirhams applied as of the invoice issuance date.'
    }
  ],
  updatedAt: new Date().toISOString()
};

export const PEPTIDE_SUPPLY_PRODUCT = {
  id: 'peptide-supply-management',
  docId: 'peptide-supply-management',
  slug: 'peptide-supply-management',
  name: 'B2B Peptide Supply Chain & Dedicated Inventory Management Service',
  canonicalName: 'B2B Peptide Supply Chain Management, Dedicated Account Concierge & Cold-Chain Logistics',
  displayName: 'B2B Peptide Supply & Account Concierge',
  title: 'B2B Peptide Supply Chain & Dedicated Inventory Management Service',
  type: 'service',
  productType: 'service',
  product_type: 'service',
  category: 'corporate_services',
  categoryId: 'corporate_services',
  therapeutic_category: 'Biopharmaceutical Supply Chain & Peptide Distribution',
  status: 'published',
  isActive: true,
  supplier: 'Mediluxe Health Solutions',
  supplierId: 'supplier-mediluxe',
  supplierName: 'Mediluxe Health Solutions',
  supplierIds: ['supplier-mediluxe'],
  suppliers: ['supplier-mediluxe'],
  currency: 'EUR',
  purity: '≥ 99.0% (HPLC & Mass Spectrometry Certified In-Stock Inventory)',
  targetSystem: 'Ready-to-Ship Cold-Chain Stock & Dedicated Account Concierge',
  target: 'Ready-to-Ship Cold-Chain Stock & Dedicated Account Concierge',
  targetAxis: 'Zero Manufacturing Delay, Dedicated Account Manager, Dual Billing & Dual Shipping',
  casNumber: 'B2B Wholesale / Supply Management / Cold-Chain Logistics',
  molecularWeight: 'In-Stock Lyophilized Peptide Portfolio',
  molecularFormula: 'Sterile Vacuum-Sealed Vials / Cold-Chain Insulated Kits',
  description: 'Comprehensive B2B peptide procurement and inventory supply management designed specifically for medical clinics, longevity centers, and aesthetic practices. Unlike compounding which requires 5–7 days of custom compounding, our peptide supply draws from pre-certified, analytical HPLC ≥99% verified warehouse stock dispatched within 24 to 48 hours. Every subscribing clinic is assigned a Dedicated Account Manager as a personal concierge for batch reservations, custom volume quotas, and logistics tracking. Full flexibility in both invoicing (clinic wholesale billing vs direct patient billing) and delivery destinations (clinic bulk delivery vs patient home dropship).',
  clinicalOverview: 'Institutional peptide distribution framework ensuring consistent batch availability and stringent cold-chain compliance. Designed to eliminate clinic stockouts and cold-chain liabilities. Each clinic is paired with an Account Manager who manages lot locking (ensuring identical peptide batches across multi-month patient cycles), certificate of analysis verification, and automated reorder alerts.',
  isService: true,
  isCorporateService: true,
  serviceSubtype: 'peptide_supply',
  jurisdiction: 'European Union / UAE / GCC / International',
  turnaroundTime: '24 – 48 Hours Dispatch (In-Stock Certified Inventory)',
  dedicatedAccountManager: {
    role: 'Clinical Account Concierge',
    responsibilities: [
      'Personal point of contact for batch allocations and reservations',
      'Instant quote generation with tailored commercial wholesale discounts',
      'Batch Certificate of Analysis (COA) and RP-HPLC / MS verification delivery',
      'Real-time temperature monitor tracking during air freight transit',
      'Assistance with split deliveries between clinic facilities and patient residences'
    ]
  },
  keyAdvantages: [
    'Zero Manufacturing Delay: Pre-certified lyophilized inventory ready for 24–48h express dispatch',
    'Dedicated Account Manager: Personal concierge assigned to oversee batch allocations, pricing, and orders',
    'Dual Invoicing Flexibility: Choose whether the Clinic is billed at B2B wholesale or the Patient is billed directly at RRP',
    'Dual Delivery Destinations: Ship bulk inventory directly to the Clinic or dropship individual vials to Patient homes',
    'Batch Reservation & Lot Locking: Reserve specific peptide lot numbers for patient multi-cycle therapeutic consistency',
    'Continuous Cold-Chain Assurance: Shipped in validated isothermal boxes with calibrated digital data loggers',
    'Free Shipping on 10+ Vials: Complimentary international priority cold freight on orders of 10 or more items',
    'Seamless Integration: Order via Account Manager WhatsApp, dedicated Mobile App, or online catalog portal'
  ],
  variants: [
    {
      id: 'supply-clinic-direct-wholesale',
      name: 'Clinic Wholesale Stock Allocation (Billed to Clinic · Delivered to Clinic)',
      dosage: 'Clinic Wholesale Stock',
      dose: 'B2B Wholesale Rate',
      format: 'package',
      presentation: 'Clinical Inventory Supply Package',
      presentationName: 'Clinic Invoiced & Delivered',
      supplier: 'Mediluxe Health Solutions',
      supplierId: 'supplier-mediluxe',
      supplierName: 'Mediluxe Health Solutions',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Immediate allocation from EU / UAE stock holding within 24-48 hours',
        'B2B Wholesale Price tier applied to clinic commercial invoice',
        'Consolidated delivery to clinic pharmacy / refrigeration receiving',
        'Single monthly or per-order invoicing for clinic accounting',
        'Assigned Dedicated Account Manager oversight'
      ]
    },
    {
      id: 'supply-patient-dropship-service',
      name: 'Direct Patient Dropship Program (Billed to Patient · Delivered to Patient)',
      dosage: 'Patient Dropship',
      dose: 'Patient RRP Rate',
      format: 'package',
      presentation: 'Patient Direct Dropship Package',
      presentationName: 'Patient Invoiced & Delivered',
      supplier: 'Mediluxe Health Solutions',
      supplierId: 'supplier-mediluxe',
      supplierName: 'Mediluxe Health Solutions',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Immediate dispatch directly to the patient’s home address',
        'Direct patient billing at Recommended Patient Price (RRP) via secure link',
        'Clinic margin credited or remitted per monthly partnership agreement',
        'Insulated medical packaging with clear patient administration instructions',
        'Zero capital tied up in clinic physical inventory'
      ]
    },
    {
      id: 'supply-hybrid-managed-allotment',
      name: 'Hybrid Managed Allotment (Batch Reserved · Split Delivery · 10+ Units Free Shipping)',
      dosage: 'Managed Allotment',
      dose: 'Custom Volume Allotment',
      format: 'package',
      presentation: 'Reserved Batch Managed Allotment',
      presentationName: 'Hybrid Batch Allocation',
      supplier: 'Mediluxe Health Solutions',
      supplierId: 'supplier-mediluxe',
      supplierName: 'Mediluxe Health Solutions',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Locked batch reservation of 10+ vials ensuring identical analytical profiles',
        'Complimentary international cold-chain priority freight (0 AED / 0 EUR)',
        'Split fulfillment: ship what you need to clinic, dropship balance to patients',
        'Dedicated Account Manager with VIP 24/7 direct WhatsApp hotline',
        'Priority access to newly released research and longevity peptides'
      ]
    }
  ],
  faqs: [
    {
      q: 'How does Peptide Supply Management differ from Pharmaceutical Compounding?',
      a: 'Pharmaceutical Compounding involves bespoke formulation and manufacturing of custom prescription medications in a European lab, which takes 5–7 working days. In contrast, Peptide Supply Management provides access to pre-certified, ready-to-ship lyophilized inventory with verified HPLC ≥99% purity, dispatched within 24–48 hours with no compounding waiting period.'
    },
    {
      q: 'What is the role of the Dedicated Account Manager?',
      a: 'Each clinic is assigned a dedicated Account Manager who acts as your direct operational liaison. Your Account Manager coordinates batch allocations, ensures lot consistency across long-term treatment protocols, issues custom volume quotes, provides batch COAs, and tracks cold-chain logistics in real time.'
    },
    {
      q: 'Can we bill the patient directly while having the product delivered to their home?',
      a: 'Yes. Our platform offers complete flexibility. You can choose to have the invoice billed directly to the patient at the Recommended Patient Price (RRP) with home delivery, freeing your clinic from collecting payments, managing cold inventory, or packing shipments. Alternatively, you can buy at wholesale prices, bill the patient yourself, and receive the stock at your clinic.'
    },
    {
      q: 'What are the delivery times and shipping costs?',
      a: 'Because products are already manufactured and stocked, orders are dispatched within 24 to 48 hours. Orders of 10 or more products receive 100% complimentary free shipping. Standard shipping for smaller orders is 200 to 400 AED (50–100 EUR).'
    },
    {
      q: 'How do you guarantee cold-chain integrity during transport?',
      a: 'All peptides are packaged in certified isothermal containers with medical-grade refrigerant packs. Shipments include digital temperature-logging devices to ensure continuous thermal validation from our temperature-controlled facility to your clinic or patient.'
    }
  ],
  updatedAt: new Date().toISOString()
};

async function seed() {
  console.log('Seeding Compounding Service into Firestore...');
  await adminDb.collection('products').doc(COMPOUNDING_SERVICE_PRODUCT.id).set(COMPOUNDING_SERVICE_PRODUCT, { merge: true });
  console.log('✔ Successfully seeded pharmaceutical-compounding-service into Firestore!');

  console.log('Seeding Peptide Supply Management Service into Firestore...');
  await adminDb.collection('products').doc(PEPTIDE_SUPPLY_PRODUCT.id).set(PEPTIDE_SUPPLY_PRODUCT, { merge: true });
  console.log('✔ Successfully seeded peptide-supply-management into Firestore!');
}

seed().then(() => {
  console.log('All new services successfully seeded!');
  process.exit(0);
}).catch(err => {
  console.error('Failed to seed services:', err);
  process.exit(1);
});

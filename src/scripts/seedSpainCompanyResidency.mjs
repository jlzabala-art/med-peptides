/**
 * src/scripts/seedSpainCompanyResidency.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed Spanish Corporate Acquisition & Law 14/2013 Entrepreneur Residence
 * Service into Firestore products collection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../lib/firebaseAdmin.js';

export const SPAIN_COMPANY_RESIDENCY_PRODUCT = {
  id: 'spain-company-acquisition-residency',
  docId: 'spain-company-acquisition-residency',
  slug: 'spain-company-acquisition-residency',
  name: 'Spanish Corporate Acquisition & Entrepreneur Residence Program (Law 14/2013)',
  canonicalName: '100% Spanish Company Acquisition, ENISA Fast-Track & Entrepreneur Residence (Law 14/2013)',
  displayName: 'Spanish Corporate Acquisition & Law 14/2013 Residency',
  title: 'Spanish Corporate Acquisition & Entrepreneur Residence Program',
  type: 'service',
  productType: 'service',
  product_type: 'service',
  category: 'corporate_services',
  categoryId: 'corporate_services',
  therapeutic_category: 'Corporate Structuring & European Residency',
  status: 'published',
  isActive: true,
  currency: 'EUR',
  purity: '100% Spanish Statutory & Immigration Compliance (Law 14/2013)',
  targetSystem: 'Corporate Acquisition, UGE-CE Fast-Track & Schengen Mobility',
  target: 'Corporate Acquisition, UGE-CE Fast-Track & Schengen Mobility',
  targetAxis: 'Corporate Acquisition, UGE-CE Fast-Track & Schengen Mobility',
  casNumber: 'Law 14/2013 / UGE-CE / ENISA Regulated',
  molecularWeight: 'N/A (Corporate & Legal Mobility Service)',
  molecularFormula: 'Spanish S.L. / 100% Share Capital / Schengen Residence',
  description: 'Turnkey acquisition of 100% of the shares of an existing Spanish Limited Liability Company (Sociedad Limitada - S.L.) combined with accelerated residence authorization under Spanish Entrepreneur Law 14/2013. Bypasses the 6-to-9 month backlog of incorporating from scratch by utilizing an active legal entity with existing tax identification (NIF/CIF), corporate history, and immediate banking eligibility. Includes notarial share purchase, commercial registry filings, D-1A foreign investment registration, tailored ENISA business plan accreditation, and expedited 3-year residence processing before the Large Business and Strategic Groups Unit (UGE-CE) with full work rights and Schengen visa-free mobility.',
  clinicalOverview: 'Structured legal and corporate mobility pathway under Spanish Law 14/2013 of September 27, supporting international entrepreneurs and high-net-worth investors. The vehicle involves the complete acquisition (100% equity) of an operational Spanish S.L. with clean balance sheets and regulatory clearances (AEAT/TGSS). The strategy combines notarial corporate restructuring with a fast-track business plan presented to ENISA and simultaneous residency filing before the UGE-CE, granting a 3-year initial residence and work permit with Schengen mobility and flexible physical presence requirements.',
  isService: true,
  isCorporateService: true,
  ownershipPercentage: '100% of Share Capital',
  legalFramework: 'Spanish Law 14/2013 on Entrepreneur Support & Internationalization',
  competentAuthorities: ['UGE-CE (Ministry of Inclusion, Social Security and Migration)', 'ENISA (Ministry of Industry and Tourism)', 'Spanish Commercial Registry (Registro Mercantil)'],
  jurisdiction: 'Spain (Kingdom of Spain / European Union)',
  keyAdvantages: [
    'Immediate Operational Vehicle: 100% acquisition of an existing Spanish S.L. with active NIF/CIF, avoiding 6+ month startup delays',
    'Expedited 3-Year Residence Permit: Direct 3-year initial authorization issued by UGE-CE (renewable for 2-year periods toward permanent 5-year EU residency)',
    'Full Work Authorization: Grants immediate rights to conduct business and work as an entrepreneur or executive throughout Spain',
    'Schengen Area Mobility: Unrestricted travel across all 29 European Schengen member states without consular tourist visas',
    'Concurrent Family Coverage: Legal residence simultaneously covers spouse/civil partner and dependent children',
    'Flexible Physical Presence: Exemption from the standard 183-day physical presence rule provided the Spanish corporate entity maintains active economic substance',
    'Pathway to Spanish & EU Citizenship: Residence counts toward legal EU residency and subsequent citizenship applications'
  ],
  timelineWeeks: '8 to 14 Weeks (Complete Turnkey Execution)',
  variants: [
    {
      id: 'spain-corp-100-acquisition',
      name: 'Turnkey 100% S.L. Corporate Acquisition & Restructuring',
      dosage: 'Corporate Acquisition',
      dose: '100% Shares',
      format: 'package',
      presentation: 'Corporate Transfer & Governance Package',
      presentationName: '100% S.L. Corporate Acquisition',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Complete acquisition of 100% of company shares via public notarial deed (Escritura Pública)',
        'Official registration with the Spanish Commercial Registry (Registro Mercantil)',
        'Certified Tax & Social Security Good Standing Clearance Certificates (AEAT & TGSS)',
        'Updated Notarial Declaration of Beneficial Ownership (Acta de Titularidad Real)',
        'Mandatory Spanish Foreign Investment Declaration (Modelo D-1A)',
        'Appointment of new Sole Administrator / Governance restructuring',
        'Direct transfer of active corporate NIF/CIF and registered office'
      ]
    },
    {
      id: 'spain-turnkey-residence-program',
      name: 'Full Turnkey Program: 100% S.L. Acquisition + ENISA + UGE 3-Year Residence',
      dosage: 'Corporate + Immigration',
      dose: '100% S.L. + 3-Year Residency',
      format: 'package',
      presentation: 'Comprehensive Investor Residency Package',
      presentationName: 'Turnkey 100% Acquisition & Residence',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Complete acquisition of 100% of shares of an existing Spanish S.L. with clean balance sheet',
        'All notarial deeds, Commercial Registry inscriptions, and D-1A foreign investment filings',
        'Comprehensive 3-to-5 Year Business Plan tailored to ENISA innovation & economic substance standards',
        'Direct submission, tracking, and strategic response handling via the ENISA digital platform',
        'Expedited residence application filing before the UGE-CE (Unidad de Grandes Empresas)',
        'Dedicated legal coordination with independent immigration specialists',
        'Official 3-Year Spanish Residence & Work Authorization resolution for the primary applicant',
        'Full biometric appointment (TIE card fingerprinting) concierge in Spain'
      ]
    },
    {
      id: 'spain-residence-syndicate-4investors',
      name: 'Syndicated Investor Structure (100% S.L. + Up to 4 Co-Founders / Investors)',
      dosage: 'Multi-Investor Setup',
      dose: '100% S.L. + Up to 4 Investors',
      format: 'package',
      presentation: 'Multi-Founder Corporate & Residency Structure',
      presentationName: 'Syndicated 4-Investor Program',
      type: 'service',
      unitOfMeasure: 'package',
      status: 'active',
      inStock: true,
      deliverables: [
        'Complete 100% corporate share acquisition distributed across up to 4 qualifying co-investors',
        'Multi-shareholder notarial deed, governance agreement, and registry filings',
        'Unified ENISA Business Plan highlighting multi-founder operational roles and technological substance',
        'Simultaneous UGE-CE residence application packages for all 4 qualifying applicants',
        'Coordination of individual Foreigner Identity Numbers (NIE) for all shareholders',
        'Family reunification accompaniment for direct family members across all investors'
      ]
    }
  ],
  complianceRequirements: [
    'Valid Passport with at least 1 year validity',
    'Apostilled and sworn-translated Police Clearance / Criminal Record Certificates (last 5 years of residence)',
    'Comprehensive Private Health Insurance operating in Spain with no co-payments or waiting periods',
    'Proof of sufficient financial means for applicant maintenance (standard IPREM-indexed funds)',
    'Maintenance of real operational substance and commercial activity in Spain post-acquisition'
  ],
  faqs: [
    {
      q: 'What is the statutory legal foundation of this residence program?',
      a: 'The program is regulated under Spanish Law 14/2013 of September 27 on Support for Entrepreneurs and their Internationalization (Articles 68 to 72). Applications are adjudicated directly by the Large Business and Strategic Groups Unit (UGE-CE) under the Ministry of Inclusion, Social Security and Migration, in coordination with ENISA (Ministry of Industry and Tourism).'
    },
    {
      q: 'Why acquire 100% of an existing company rather than incorporating a new one?',
      a: 'Forming a new Spanish entity typically requires 6 to 9 months before an immigration file can be lodged, due to preliminary bank account hurdles, tax identification backlogs, and theoretical business plan vetting. Acquiring 100% of an existing, compliant S.L. allows immediate execution of the share purchase deed, instant transfer of an active NIF/CIF, and immediate filing before ENISA and UGE-CE.'
    },
    {
      q: 'Do I obtain 100% ownership of the acquired company?',
      a: 'Yes. 100% of the share capital (participaciones sociales) is formally transferred to the investor (or structured across qualifying co-investors) through a public notarial deed (Escritura Pública) and recorded in the Spanish Commercial Registry (Registro Mercantil).'
    },
    {
      q: 'How is the company verified to be debt-free and compliant?',
      a: 'Comprehensive pre-acquisition due diligence is performed. The transaction includes official certificates of good standing and zero tax debt from the Spanish Tax Agency (AEAT) and Social Security Treasury (TGSS), verified commercial registry filings, and notarial guarantees of clean balance sheets.'
    },
    {
      q: 'What is the duration of the initial residence authorization, and how is it renewed?',
      a: 'Under Law 14/2013, the initial residence authorization is issued for 3 full years (unlike standard 1-year general immigration visas). It is renewable for successive 2-year periods provided the company remains operational. After 5 continuous years of legal residence, applicants are eligible for Permanent EU Long-Term Residency and subsequent citizenship.'
    },
    {
      q: 'Am I authorized to work in Spain under this permit?',
      a: 'Yes. The residence permit explicitly authorizes gainful employment and self-employment (por cuenta propia y por cuenta ajena) across all economic sectors throughout the entire Spanish territory.'
    },
    {
      q: 'Does this residence permit provide Schengen Zone mobility?',
      a: 'Yes. Holders of the Spanish Foreigner Identity Card (TIE) enjoy visa-free mobility across all 29 member nations of the European Schengen Area for up to 90 days in any 180-day period without border checks.'
    },
    {
      q: 'Can family members be included in the application?',
      a: 'Yes. Spouses, legally recognized civil partners, minor children, and economically dependent adult children or ascendants can be included simultaneously in the initial application or joined at a later stage.'
    },
    {
      q: 'Is there a strict requirement to reside in Spain for 183 days per year?',
      a: 'No. Unlike standard residency regimes, Law 14/2013 provides significant physical presence flexibility. Entrepreneurs and executives are not required to spend 183 days in Spain to renew their residence permit, as long as the business project maintains genuine operational substance and fulfills Spanish corporate obligations. This allows international founders to travel freely to manage overseas assets.'
    },
    {
      q: 'Can multiple investors or business partners obtain residency through one company?',
      a: 'Yes. The corporate structure can be syndicated among up to 3–4 qualifying co-founders/partners who hold significant equity and executive roles, enabling coordinated residency applications supported by a unified ENISA business plan.'
    },
    {
      q: 'What are the post-acquisition obligations to maintain the company active?',
      a: 'The company must maintain genuine economic substance (such as management consulting, international trade, or services), conduct recurring invoicing, file timely corporate tax returns (IVA / Impuesto de Sociedades), and register its director under the appropriate Social Security regime.'
    },
    {
      q: 'Can the entire acquisition and initial filing be executed remotely?',
      a: 'Yes. Initial procedures—including obtaining the Foreigner Identity Number (NIE), executing the notarial share purchase, and filing before ENISA and UGE-CE—can be completed via a specific consular or apostilled Power of Attorney. The investor only needs to travel to Spain for the physical biometric fingerprint appointment to collect the residency card (TIE).'
    }
  ],
  updatedAt: new Date().toISOString()
};

async function seed() {
  console.log('Seeding Spanish Corporate Acquisition & Residence Product into Firestore...');
  const docRef = adminDb.collection('products').doc(SPAIN_COMPANY_RESIDENCY_PRODUCT.id);
  await docRef.set(SPAIN_COMPANY_RESIDENCY_PRODUCT, { merge: true });
  console.log('✔ Successfully seeded spain-company-acquisition-residency into Firestore!');
}

seed().catch(err => {
  console.error('Failed to seed:', err);
  process.exit(1);
});

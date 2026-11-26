import { NextResponse } from 'next/server';
import { fetchCollectionProductsAction } from '@/actions/vialsCatalogActions';
import { sanitizePublicProductForViewer, scrubSupplierText } from '@/lib/supplierSanitizer';

export const revalidate = 3600;

export async function GET() {
  let peptideLines = [];
  try {
    const raw = await fetchCollectionProductsAction('vials', 'CAT-RX-7482');
    const items = Array.isArray(raw)
      ? raw.map((p) => sanitizePublicProductForViewer(p, { isAdmin: false })).slice(0, 45)
      : [];
    peptideLines = items.map((p) => {
      const name = scrubSupplierText(p.name || p.title || '');
      const sku = scrubSupplierText(p.sku || p.id || '');
      const dose = scrubSupplierText(p.dosage || p.strength || '');
      const slug = p.slug || p.id || '';
      return `- **${name}** (${sku}${dose ? ` · ${dose}` : ''}) — [Monograph](https://www.atlashealth-services.com/p/${encodeURIComponent(slug)})`;
    });
  } catch {
    peptideLines = ['- Full peptide catalog available at https://www.atlashealth-services.com/pricing/peptides'];
  }

  const md = `# Atlas Health Services — Full Clinical & B2B Knowledge Base

> Canonical machine-readable reference for AI search engines (ChatGPT Search, Perplexity, Claude) and clinical assistants.

## Overview
Atlas Health Services supplies licensed clinics, longevity physicians, and medical distributors across Europe, the US, and the UAE/GCC with cGMP / EU-GMP bioidentical hormone pellets, sterile lyophilized 10R peptide vials (≥99.0% HPLC purity), 3 mL pre-filled multi-dose peptide pens (≥99.2% HPLC purity), CE-IVDR capillary dried blood spot (DBS) diagnostics (Bloodo™), precision genomics (24Genetics), and CE-marked dermal fillers. Multi-currency pricing is published in EUR, USD, and AED in English and Spanish.

## 1. Peptide Reconstitution & U-100 Syringe Reference
Standard U-100 insulin syringes equal 100 units (IU) per 1.0 mL (10 units = 0.10 mL).
- **5 mg Vial + 1.0 mL BAC**: 5,000 mcg/mL -> 10 units = 500 mcg | 5 units = 250 mcg
- **5 mg Vial + 2.0 mL BAC**: 2,500 mcg/mL -> 10 units = 250 mcg | 5 units = 125 mcg
- **10 mg Vial + 2.0 mL BAC**: 5,000 mcg/mL -> 10 units = 500 mcg | 5 units = 250 mcg
- **10 mg Vial + 3.0 mL BAC**: 3,333 mcg/mL -> 10 units = 333 mcg | 5 units = 167 mcg
- **15 mg Vial + 3.0 mL BAC**: 5,000 mcg/mL -> 10 units = 500 mcg | 5 units = 250 mcg
- **30 mg Vial + 3.0 mL BAC**: 10,000 mcg/mL -> 10 units = 1,000 mcg (1 mg) | 5 units = 500 mcg
- **50 mg Vial (e.g. GHK-Cu) + 3.0 mL BAC**: 16,667 mcg/mL -> 10 units = 1,667 mcg | 5 units = 833 mcg
- **Stability**: Refrigerate reconstituted vials at 2°C–8°C protected from light; use within 28 days.

## 2. Pre-Filled 3 mL Multi-Dose Peptide Pens (100 clicks = 1 mL, 300 clicks/pen)
- **BPC-157 / TB-500 10 mg (3 mL)**: 33.3 mcg/click (15 clicks = 500 mcg)
- **MOTS-c 30 mg (3 mL)**: 100 mcg/click (50 clicks = 5 mg)
- **SS-31 30 mg (3 mL)**: 100 mcg/click (40 clicks = 4 mg)
- **GHK-Cu 60 mg (3 mL)**: 200 mcg/click (10 clicks = 2 mg)
- **NAD+ 750 mg (3 mL)**: 2.5 mg/click (20 clicks = 50 mg)

## 3. Clinical Peptide Vials Directory
${peptideLines.join('\n')}

## 4. Bioidentical Hormone Pellets (EU GMP)
- Subcutaneous fused crystalline Testosterone (12.5 mg to 200 mg) & 17β-Estradiol / Bi-Est pellets, 3.5–6 month zero-order release.
- Trocar sizing: 3.2 mm disposable stainless-steel trocar (Estradiol & female Testosterone ≤50 mg), 4.5 mm trocar (100 mg & 200 mg Testosterone).
- Live schedule: https://www.atlashealth-services.com/pricing/pellets

## 5. Capillary Blood Diagnostics (Bloodo™ CE-IVDR) & Genomics (24Genetics)
- **Bloodo™ DBS (ISO 15189 LC-MS/MS, 48–72h TAT)**: Intracellular NAD+/NADH, Total & Free Testosterone+, Diurnal Cortisol, HbA1c, Omega-3/6 Ratio, Vitamin D3. Schedule: https://www.atlashealth-services.com/pricing/bloodo
- **24Genetics Panels**: Pharmacogenetics, Nutrigenetics, Longevity, Dermatology, Sports, WGS/WES. Schedule: https://www.atlashealth-services.com/pricing/24genetics

## 6. Interactive Tools, Guides & OpenAPI for AI Agents
- Interactive Reconstitution & Click-Dial Calculator: https://www.atlashealth-services.com/tools/peptide-calculator
- Peptide Reconstitution & Dosing Guide: https://www.atlashealth-services.com/guides/peptide-reconstitution-dosing
- Peptide Protocols Comparison Guide: https://www.atlashealth-services.com/guides/peptide-protocols-comparison
- Hormone Pellets Implantation Guide: https://www.atlashealth-services.com/guides/hormone-pellets-implantation
- OpenAPI 3.1.0 Spec: https://www.atlashealth-services.com/openapi-atlas-peptides.json
- Peptide Calculator API: https://www.atlashealth-services.com/api/public/peptide-calculator
- Protocols Directory API: https://www.atlashealth-services.com/api/public/protocols-directory
- UAE Import Partner Dossier: https://www.atlashealth-services.com/import-partner
`;

  return new NextResponse(md, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const revalidate = 3600;

const FALLBACK_LLMS_TXT = `# Atlas Health Services

> Clinical Longevity, Bioidentical Hormone Replacement Therapy (BHRT), Sterile Peptide Formularies, Capillary Blood Diagnostics, and Precision Genomics B2B Catalogs.

Atlas Health Services provides licensed clinics, physicians, and medical distributors across Europe, the US, and the UAE/GCC with cGMP / EU-GMP compounded therapies, sterile lyophilized peptides, pre-filled multi-dose pens, CE-IVDR dried blood spot diagnostics, CE-marked aesthetic injectables, and clinical genomics panels. Multi-currency schedules are available in EUR, USD, and AED in English and Spanish.

## Public B2B Pricing & Clinical Schedules

- [Bioidentical Hormone Pellets Schedule](https://www.atlashealth-services.com/pricing/pellets)
- [Clinical Lyophilized Peptides Schedule](https://www.atlashealth-services.com/pricing/peptides)
- [Clinical Peptide Vials & Specialty Formularies](https://www.atlashealth-services.com/vials)
- [Pre-filled Multi-Dose Peptide Pens](https://www.atlashealth-services.com/pricing/pens)
- [EU GMP Bioidentical HRT (BHRT)](https://www.atlashealth-services.com/pricing/bhrt)
- [Compounded Hormones (TRT & BHRT)](https://www.atlashealth-services.com/pricing/hormones)
- [Bloodo™ Capillary Blood Diagnostics](https://www.atlashealth-services.com/pricing/bloodo)
- [24Genetics Precision Genomics Panels](https://www.atlashealth-services.com/pricing/24genetics)
- [Dermal Fillers & Skin Boosters](https://www.atlashealth-services.com/pricing/fillers)
- [UAE Import & Medical Warehouse Partner Dossier](https://www.atlashealth-services.com/import-partner)
- [Clinical Protocols Directory](https://www.atlashealth-services.com/proto)
- [XML Sitemap](https://www.atlashealth-services.com/sitemap.xml)
`;

export async function GET() {
  let content = FALLBACK_LLMS_TXT;
  try {
    content = readFileSync(join(process.cwd(), 'public', 'llms.txt'), 'utf8');
  } catch {
    // Use embedded fallback in standalone container
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

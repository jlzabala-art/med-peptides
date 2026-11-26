import { NextResponse } from 'next/server';

export const revalidate = 86400;

export async function GET() {
  return NextResponse.json(
    {
      schema_version: 'v1',
      name_for_human: 'Atlas Health Clinical Peptides',
      name_for_model: 'atlas_health_clinical_peptides',
      description_for_human:
        'Search cGMP clinical peptide vials, pre-filled multi-dose pens, clinical longevity protocols, and exact U-100 / click-dial reconstitution dosing.',
      description_for_model:
        'Use this plugin to look up clinical peptide vials, 3 mL click-dial pens, evidence-based longevity/metabolic protocols, and deterministic U-100 reconstitution math from Atlas Health Services.',
      auth: { type: 'none' },
      api: {
        type: 'openapi',
        url: 'https://www.atlashealth-services.com/openapi-atlas-peptides.json',
      },
      logo_url: 'https://www.atlashealth-services.com/og-catalog.png',
      contact_email: 'jose@mediluxeme.com',
      legal_info_url: 'https://www.atlashealth-services.com',
    },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
}

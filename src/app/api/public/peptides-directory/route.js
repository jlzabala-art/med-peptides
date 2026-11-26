import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fetchCollectionProductsAction } from '@/actions/vialsCatalogActions';
import { sanitizePublicProductForViewer, scrubSupplierText } from '@/lib/supplierSanitizer';

export const revalidate = 3600;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('format') === 'openapi') {
    try {
      const spec = JSON.parse(readFileSync(join(process.cwd(), 'public', 'openapi-atlas-peptides.json'), 'utf8'));
      return NextResponse.json(spec, {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' },
      });
    } catch {
      return NextResponse.json({ openapi: '3.1.0', info: { title: 'Atlas Health Peptides API', version: '1.0.0' } });
    }
  }
  const query = String(searchParams.get('q') || '').trim().toLowerCase();
  const specialty = String(searchParams.get('specialty') || '').trim().toLowerCase();
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 30), 1), 60);

  try {
    const raw = await fetchCollectionProductsAction('vials', 'CAT-RX-7482');
    let items = Array.isArray(raw)
      ? raw.map((p) => sanitizePublicProductForViewer(p, { isAdmin: false }))
      : [];

    if (query) {
      items = items.filter((p) => {
        const hay = `${p.name || ''} ${p.slug || ''} ${p.sku || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
        return hay.includes(query);
      });
    }

    if (specialty) {
      items = items.filter((p) => {
        const hay = `${p.category || ''} ${(p.specialties || []).join(' ')} ${p.description || ''}`.toLowerCase();
        return hay.includes(specialty);
      });
    }

    const formatted = items.slice(0, limit).map((p) => ({
      name: scrubSupplierText(p.name || p.title || ''),
      sku: scrubSupplierText(p.sku || p.id || ''),
      slug: p.slug || p.id || '',
      category: scrubSupplierText(p.category || 'Clinical Peptide'),
      dosage: scrubSupplierText(p.dosage || p.strength || ''),
      presentation: '10R Sterile Lyophilized Vial (cGMP, ≥99.0% HPLC)',
      wholesalePriceEur: p.wholesalePriceEur ?? p.pricing?.wholesale ?? null,
      clinicPriceEur: p.clinicPriceEur ?? p.pricing?.clinic ?? null,
      url: `https://www.atlashealth-services.com/p/${encodeURIComponent(p.slug || p.id || '')}`,
    }));

    return NextResponse.json(
      {
        provider: 'Atlas Health Services',
        website: 'https://www.atlashealth-services.com',
        schedules: {
          peptides: 'https://www.atlashealth-services.com/pricing/peptides',
          vials: 'https://www.atlashealth-services.com/vials',
          pens: 'https://www.atlashealth-services.com/pricing/pens',
          pellets: 'https://www.atlashealth-services.com/pricing/pellets',
          reconstitutionGuide: 'https://www.atlashealth-services.com/guides/peptide-reconstitution-dosing',
        },
        count: formatted.length,
        items: formatted,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to load directory' }, { status: 500 });
  }
}

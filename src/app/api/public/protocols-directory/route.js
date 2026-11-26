import { NextResponse } from 'next/server';
import { protocolRepository } from '@/repositories/protocolRepository';
import { sanitizePublicProtocol } from '@/repositories/publicDataSanitizer';
import { scrubSupplierText } from '@/lib/supplierSanitizer';

export const revalidate = 3600;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get('q') || '').trim().toLowerCase();
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 25), 1), 50);

  try {
    const rawProtocols = await protocolRepository.getAllProtocols();
    let list = Array.isArray(rawProtocols)
      ? rawProtocols
          .filter((p) => !p.status || p.status === 'active' || p.status === 'published')
          .map((p) => sanitizePublicProtocol(p))
      : [];

    if (q) {
      list = list.filter((p) => {
        const hay = `${p.name || ''} ${p.slug || ''} ${p.categoryId || ''} ${p.overview_summary || ''} ${(p.goals || []).join(' ')}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const items = list.slice(0, limit).map((p) => {
      const slug = p.protocol_slug || p.slug || p.id;
      return {
        name: scrubSupplierText(p.name || ''),
        slug,
        category: scrubSupplierText(p.categoryId || p.category || 'Longevity'),
        durationWeeks: p.durationWeeks || p.duration_weeks || 8,
        summary: scrubSupplierText(p.overview_summary || p.description || '').slice(0, 240),
        url: `https://www.atlashealth-services.com/proto/${encodeURIComponent(slug)}`,
      };
    });

    return NextResponse.json(
      {
        provider: 'Atlas Health Services',
        directoryUrl: 'https://www.atlashealth-services.com/proto',
        count: items.length,
        items,
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
    return NextResponse.json({ error: err.message || 'Failed to load protocols' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { protocolRepository } from '../../../repositories/protocolRepository';

export const revalidate = 3600; // Cache 1 hour

export async function GET(request) {
  const host = request.headers.get('host') || 'www.atlashealth-services.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    let products = [];
    if (adminDb) {
      const snap = await adminDb.collection('products').limit(500).get().catch(() => null);
      if (snap && !snap.empty) {
        products = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.status !== 'archived' && p.status !== 'hidden');
      }
    }

    let protocols = [];
    try {
      protocols = await protocolRepository.getAllProtocols();
    } catch {
      protocols = [];
    }

    const staticRoutes = [
      '',
      '/proto',
      '/protocol-finder',
      '/guides/hormone-pellets-implantation',
      '/pricing/pellets',
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    staticRoutes.forEach((route) => {
      xml += `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    });

    // Public Products (/p/[slug])
    (products || []).forEach((p) => {
      const slug = p.slug || p.id;
      if (slug) {
        xml += `  <url>\n    <loc>${baseUrl}/p/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    });

    // Public Protocols (/proto/[slug])
    (protocols || []).forEach((proto) => {
      const slug = proto.protocol_slug || proto.slug || proto.id;
      if (slug) {
        xml += `  <url>\n    <loc>${baseUrl}/proto/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

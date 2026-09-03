import { NextResponse } from 'next/server';
import { catalogRepository } from '../../../repositories/catalogRepository';
import { protocolRepository } from '../../../repositories/protocolRepository';

export const revalidate = 3600; // Cache 1 hour

export async function GET(request) {
  const host = request.headers.get('host') || 'regenpept.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const [products, protocols] = await Promise.all([
      catalogRepository.getAllProducts(),
      protocolRepository.getAllProtocols(),
    ]);

    const staticRoutes = [
      '',
      '/protocol-finder',
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

import { NextResponse } from 'next/server';
import { getCountryByCode } from '@/data/countries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const headers = request.headers;

    // 1. Direct Cloud Edge Headers (Vercel, Cloudflare, Google Cloud, Firebase App Hosting)
    let countryCode = 
      headers.get('cf-ipcountry') ||
      headers.get('x-vercel-ip-country') ||
      headers.get('x-appengine-country') ||
      headers.get('x-country-code') ||
      null;

    // Google Cloud client-geo-location: format "country=ES,city=Madrid,lat=..."
    if (!countryCode) {
      const gcpGeo = headers.get('x-client-geo-location');
      if (gcpGeo && gcpGeo.includes('country=')) {
        const match = gcpGeo.match(/country=([A-Za-z]{2})/i);
        if (match && match[1]) {
          countryCode = match[1].toUpperCase();
        }
      }
    }

    // 2. Resolve via client IP if no edge header was attached
    if (!countryCode) {
      const clientIp = 
        headers.get('x-forwarded-for')?.split(',')[0].trim() || 
        headers.get('x-real-ip');

      const isLocalhost = !clientIp || 
        clientIp === '::1' || 
        clientIp === '127.0.0.1' || 
        clientIp.startsWith('192.168.') || 
        clientIp.startsWith('10.') ||
        clientIp.startsWith('172.16.');

      if (!isLocalhost && clientIp) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,countryCode,country`, {
            signal: controller.signal,
            next: { revalidate: 86400 }
          });
          clearTimeout(timeoutId);

          if (geoRes.ok) {
            const data = await geoRes.json();
            if (data.status === 'success' && data.countryCode) {
              countryCode = data.countryCode;
            }
          }
        } catch {
          // IP-API timeout or network error; proceed to fallback
        }
      }
    }

    // 3. Fallback based on accept-language header if still undetermined
    if (!countryCode) {
      const acceptLang = headers.get('accept-language') || '';
      if (acceptLang.includes('es-ES') || acceptLang.includes('es')) {
        countryCode = 'ES';
      } else if (acceptLang.includes('en-GB')) {
        countryCode = 'GB';
      } else if (acceptLang.includes('en-US')) {
        countryCode = 'US';
      } else if (acceptLang.includes('ar-AE') || acceptLang.includes('ar')) {
        countryCode = 'AE';
      } else {
        countryCode = 'ES'; // Atlas / MediLuxe primary headquarters fallback
      }
    }

    const matchedCountry = getCountryByCode(countryCode) || getCountryByCode('es');

    return NextResponse.json({
      success: true,
      countryCode: matchedCountry?.code?.toUpperCase() || 'ES',
      dialCode: matchedCountry?.dial_code || '+34',
      countryName: matchedCountry?.name || 'Spain',
      flag: matchedCountry?.flag || '🇪🇸'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      countryCode: 'ES',
      dialCode: '+34',
      countryName: 'Spain',
      flag: '🇪🇸',
      error: error.message
    });
  }
}

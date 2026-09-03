import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fallbackCity = searchParams.get('city');

    // 1. Determine IP Address
    // Next.js exposes headers
    const headers = request.headers;
    let clientIp = 
      headers.get('cf-connecting-ip') || 
      headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      headers.get('x-real-ip');

    let lat, lon;
    let detectedCity, detectedCountry;

    const isLocalhost = !clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');

    // 2. Resolve IP to Location if possible
    if (!isLocalhost && clientIp) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}`, {
          // Internal fetch, don't cache aggressively as IPs change, but ip-api is rate limited
          next: { revalidate: 3600 } 
        });
        const geoData = await geoResponse.json();

        if (geoData.status === 'success') {
          lat = geoData.lat;
          lon = geoData.lon;
          detectedCity = geoData.city;
          detectedCountry = geoData.countryCode;
        }
      } catch (e) {
        console.warn('IP Geolocation failed:', e);
      }
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      console.error('OPENWEATHER_API_KEY is not configured');
      return NextResponse.json({ error: 'Weather service unavailable' }, { status: 503 });
    }

    let weatherResponse;

    // 3. Fetch Weather from OpenWeather
    if (lat && lon) {
      weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${API_KEY}`,
        { next: { revalidate: 900 } }
      );
    } else {
      // Fallback to city search
      const queryCity = fallbackCity || 'Madrid,ES';
      weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(queryCity)}&units=metric&lang=en&appid=${API_KEY}`,
        { next: { revalidate: 900 } }
      );
    }

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('OpenWeather API error:', weatherResponse.status, errorText);
      return NextResponse.json({ error: 'Weather service unavailable' }, { status: 502 });
    }

    const weatherData = await weatherResponse.json();

    // 4. Normalize response to hide API details
    const normalizedResponse = {
      location: {
        city: weatherData.name || detectedCity || fallbackCity || 'Unknown',
        country: weatherData.sys?.country || detectedCountry || 'Unknown'
      },
      weather: {
        temperatureC: Math.round(weatherData.main.temp),
        feelsLikeC: Math.round(weatherData.main.feels_like),
        condition: weatherData.weather[0]?.main || 'Unknown', // e.g. "Clear"
        description: weatherData.weather[0]?.description || '', // e.g. "clear sky"
        icon: weatherData.weather[0]?.icon || '01d',
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed
      },
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(normalizedResponse);

  } catch (error) {
    console.error('Weather API Uncaught Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

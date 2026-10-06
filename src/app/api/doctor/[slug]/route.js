import { getDoctorPortalData } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/doctor/[slug]
 * Resolves doctor profile, clinical prescriptions, operational KPIs, and patient-centric tasks.
 * Backed by Layer 1 in-memory RAM cache (0ms latency).
 */
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const data = await getDoctorPortalData(cleanSlug);

    if (!data || !data.success) {
      return Response.json({ success: false, error: 'Physician profile not found' }, { status: 404 });
    }

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('API /api/doctor/[slug] error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

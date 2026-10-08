import { getDoctorPortalData, updateDoctorProfile } from '@/lib/doctorCache';

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
    console.error('API GET /api/doctor/[slug] error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/doctor/[slug]
 * Updates physician profile in Firestore and invalidates cache.
 */
export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();
    const body = await request.json();

    const updatedData = await updateDoctorProfile(cleanSlug, body);

    if (!updatedData || !updatedData.success) {
      return Response.json({ success: false, error: 'Failed to update physician profile' }, { status: 400 });
    }

    return Response.json(updatedData, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('API PUT /api/doctor/[slug] error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

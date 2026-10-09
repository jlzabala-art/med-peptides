import { getDoctorsWithPrescriptions } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/prescriptions/doctors-list
 * Returns list of doctors who have active prescriptions in the system.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const doctors = await getDoctorsWithPrescriptions({ forceRefresh });

    return Response.json({
      success: true,
      count: doctors.length,
      doctors
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('API GET /api/prescriptions/doctors-list error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

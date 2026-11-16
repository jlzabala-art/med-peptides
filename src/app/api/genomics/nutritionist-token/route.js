import { NextResponse } from 'next/server';
import { computeNutritionistToken } from '@/utils/genomics/nutritionistAccess';

export const dynamic = 'force-dynamic';

/**
 * Issues a sample-scoped Nutritionist QR token after specialist login in the DNA portal.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const sampleCode = String(body?.sampleCode || '').trim();
    const email = String(body?.email || '').trim();

    if (!sampleCode || !email) {
      return NextResponse.json(
        { error: 'sampleCode and specialist email are required.' },
        { status: 400 }
      );
    }

    const token = computeNutritionistToken(sampleCode);
    return NextResponse.json({ token, sampleCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to issue nutritionist access token', details: error.message },
      { status: 500 }
    );
  }
}

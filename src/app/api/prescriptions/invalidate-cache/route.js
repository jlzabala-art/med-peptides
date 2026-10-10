import { NextResponse } from 'next/server';
import { invalidateRxCache } from '@/lib/rxCache';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = body?.code || body?.id || body?.rxId;
    invalidateRxCache(code);
    return NextResponse.json({
      success: true,
      invalidated: code || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API invalidate-cache] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

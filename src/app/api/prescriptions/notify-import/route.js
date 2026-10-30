import { NextResponse } from 'next/server';
import { notifyPrescriptionImported } from '@/lib/prescriptionImportNotifier';

export const dynamic = 'force-dynamic';

/**
 * POST /api/prescriptions/notify-import
 * Sends an automated email notification to jose@mediluxeme.com whenever a
 * prescription is imported from the Admin Portal, Doctor Portal, or Label Studio.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const list = Array.isArray(body?.prescriptions)
      ? body.prescriptions
      : (body?.rxData || body?.prescription ? [{ id: body.prescriptionId || body.id, rxData: body.rxData || body.prescription }] : []);

    if (list.length === 0) {
      return NextResponse.json({ success: false, error: 'No prescription data provided' }, { status: 400 });
    }

    const importChannel = body?.importChannel || 'portal_import_modal';
    const results = [];

    for (const item of list) {
      const prescriptionId = item.id || item.prescriptionId || item.rxData?.id || null;
      const rxData = item.rxData || item;
      const res = await notifyPrescriptionImported({
        prescriptionId,
        rxData,
        importChannel
      });
      results.push(res);
    }

    return NextResponse.json({
      success: true,
      recipient: 'jose@mediluxeme.com',
      notifiedCount: results.length,
      results
    });
  } catch (error) {
    console.error('[api/prescriptions/notify-import] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


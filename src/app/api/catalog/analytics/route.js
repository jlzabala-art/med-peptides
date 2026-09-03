import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { catalogAnalyticsSchema } from '@/schemas/apiSchemas';
import { apiSuccess, apiValidationError, apiError } from '@/lib/apiResponse';

export async function POST(request) {
  try {
    const rawBody = await request.json();
    const parseResult = catalogAnalyticsSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error, 'Invalid catalog analytics payload');
    }

    const {
      catalogId,
      action,
      recipientName,
      destination,
      currency,
      cartUnits,
      cartTotal,
      itemNames,
    } = parseResult.data;

    const telemetryRef = adminDb.collection('shared_catalog_telemetry').doc(catalogId);
    
    await telemetryRef.set({
      catalogId,
      recipientName,
      lastAction: action,
      lastActiveAt: FieldValue.serverTimestamp(),
      latestDestination: destination,
      latestCurrency: currency,
      latestCartUnits: cartUnits,
      latestCartTotal: cartTotal,
      latestItems: itemNames,
      viewCount: FieldValue.increment(action === 'view' ? 1 : 0),
      orderInquiryCount: FieldValue.increment(action === 'open_whatsapp' ? 1 : 0),
      proFormaDownloadCount: FieldValue.increment(action === 'download_proforma' ? 1 : 0),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return apiSuccess({ recorded: true, catalogId, action });
  } catch (error) {
    console.warn('[Telemetry] Error recording catalog interaction:', error.message);
    return apiError(error.message, 500, 'TELEMETRY_RECORD_ERROR');
  }
}

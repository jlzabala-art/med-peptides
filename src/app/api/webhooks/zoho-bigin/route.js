import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { importBiginWholesalerAction } from '@/actions/crmWholesalerActions';

/**
 * GET /api/webhooks/zoho-bigin
 * Endpoint healthcheck and verification for Zoho webhook configuration.
 */
export async function GET(request) {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/zoho-bigin',
    timestamp: new Date().toISOString()
  });
}

/**
 * POST /api/webhooks/zoho-bigin
 * Inbound webhook receiver for Zoho Bigin.
 * Handles real-time contact creation, updates, and auto-provisioning of wholesalers.
 */
export async function POST(request) {
  const now = new Date().toISOString();

  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // 1. Optional Secret Verification
    const secret = process.env.BIGIN_WEBHOOK_SECRET;
    if (secret) {
      const authHeader = request.headers.get('authorization') || '';
      const secretHeader = request.headers.get('x-bigin-secret') || '';
      const urlSecret = new URL(request.url).searchParams.get('secret');

      const provided = authHeader.replace(/^Bearer\s+/i, '') || secretHeader || urlSecret;
      if (provided !== secret) {
        return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
      }
    }

    // 2. Parse request body (JSON or Form URL Encoded)
    const contentType = request.headers.get('content-type') || '';
    let payload = {};

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    } else {
      try {
        payload = await request.json();
      } catch {
        const text = await request.text();
        payload = { raw: text };
      }
    }

    // 3. Log webhook audit entry
    const webhookEventRef = adminDb.collection('webhook_events').doc();
    await webhookEventRef.set({
      source: 'zoho-bigin',
      contentType,
      payload,
      status: 'received',
      receivedAt: now
    });

    // 4. Normalize Contact Data from various Zoho Bigin webhook formats
    let rawContact = payload;
    if (Array.isArray(payload.data) && payload.data.length > 0) {
      rawContact = payload.data[0];
    } else if (Array.isArray(payload.Contacts) && payload.Contacts.length > 0) {
      rawContact = payload.Contacts[0];
    } else if (payload.contact && typeof payload.contact === 'object') {
      rawContact = payload.contact;
    }

    const contactId = rawContact.id || rawContact.contact_id || rawContact.Contact_ID || rawContact.ID;
    const email = rawContact.Email || rawContact.email || rawContact.Email_Address;
    const firstName = rawContact.First_Name || rawContact.firstName || '';
    const lastName = rawContact.Last_Name || rawContact.lastName || '';
    const name = rawContact.Full_Name || rawContact.name || `${firstName} ${lastName}`.trim();
    const phone = rawContact.Mobile || rawContact.Phone || rawContact.phone || rawContact.mobile || '';
    
    let companyName = '';
    let accountId = '';
    if (typeof rawContact.Account_Name === 'object' && rawContact.Account_Name !== null) {
      companyName = rawContact.Account_Name.name || '';
      accountId = rawContact.Account_Name.id || '';
    } else if (typeof rawContact.Account_Name === 'string') {
      companyName = rawContact.Account_Name;
    } else {
      companyName = rawContact.companyName || rawContact.Company || '';
    }

    const description = rawContact.Description || rawContact.notes || '';

    // If no email or contact ID present, acknowledge receipt without provisioning
    if (!email || !contactId) {
      await webhookEventRef.update({
        status: 'skipped_no_identity',
        reason: 'Missing contact ID or email in webhook payload'
      });
      return NextResponse.json({
        success: true,
        message: 'Webhook logged, but skipped provisioning: missing email or contact ID.',
        webhookId: webhookEventRef.id
      });
    }

    // Auto-detect currency and markup from custom fields or default to UAE/AED
    let currency = 'AED';
    const rawCountry = (rawContact.Mailing_Country || rawContact.country || '').toLowerCase();
    if (rawCountry.includes('spain') || rawCountry.includes('españa') || rawCountry.includes('eu')) {
      currency = 'EUR';
    } else if (rawContact.Currency === 'USD' || rawContact.currency === 'USD') {
      currency = 'USD';
    }

    const customMarkup = Number(rawContact.Markup || rawContact.Commercial_Markup || 20) || 20;

    // 5. Auto-provision or Synchronize Wholesaler using existing server action
    const syncResult = await importBiginWholesalerAction({
      contact: {
        id: String(contactId),
        name: name || companyName || 'Wholesaler Partner',
        firstName,
        lastName,
        email,
        phone,
        companyName: companyName || name,
        accountId: String(accountId),
        description
      },
      customMarkup,
      currency
    });

    if (syncResult.success) {
      await webhookEventRef.update({
        status: 'processed',
        wholesalerId: syncResult.wholesaler?.id,
        processedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Wholesaler successfully synchronized from Zoho Bigin webhook',
        webhookId: webhookEventRef.id,
        wholesaler: syncResult.wholesaler
      });
    } else {
      await webhookEventRef.update({
        status: 'failed',
        error: syncResult.error,
        processedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: false,
        error: syncResult.error,
        webhookId: webhookEventRef.id
      }, { status: 422 });
    }

  } catch (error) {
    console.error('[/api/webhooks/zoho-bigin] Error handling webhook:', error);
    return NextResponse.json({
      error: error.message || 'Internal webhook error'
    }, { status: 500 });
  }
}

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

    // 5. Intelligent Routing: Check if Contact is a Doctor/Physician vs Wholesaler
    const titleLower = String(rawContact.Title || '').toLowerCase();
    const specLower = String(rawContact.Speciality || '').toLowerCase();
    const descLower = String(description).toLowerCase();
    const isDoctorContact = titleLower.includes('dr') || 
      titleLower.includes('doctor') || 
      titleLower.includes('surgeon') || 
      titleLower.includes('physician') || 
      titleLower.includes('md') || 
      specLower.length > 0 || 
      descLower.includes('dha license') ||
      descLower.includes('surgeon');

    if (isDoctorContact) {
      // Find existing user in Firestore by zohoContactId or email
      let userDocRef = null;
      let existingData = {};
      const userByBigin = await adminDb.collection('users').where('zohoContactId', '==', String(contactId)).limit(1).get();
      if (!userByBigin.empty) {
        userDocRef = userByBigin.docs[0].ref;
        existingData = userByBigin.docs[0].data() || {};
      } else {
        const userByEmail = await adminDb.collection('users').where('email', '==', email).limit(1).get();
        if (!userByEmail.empty) {
          userDocRef = userByEmail.docs[0].ref;
          existingData = userByEmail.docs[0].data() || {};
        }
      }

      const street = rawContact.Mailing_Street || '';
      const city = rawContact.Mailing_City || '';
      const country = rawContact.Mailing_Country || '';
      const fullAddress = [street, city, country].filter(Boolean).join(', ');

      // Extract DHA license from description if present
      let licenseNumber = existingData.license || '';
      const licMatch = description.match(/DHA\s*(?:License|Licence)?[:\s-]*([A-Z0-9-]+)/i);
      if (licMatch) licenseNumber = licMatch[1];

      const cleanDocName = name.startsWith('Dr.') ? name : (rawContact.Title ? `${rawContact.Title} ${name}` : `Dr. ${name}`);

      const doctorData = {
        name: cleanDocName,
        displayName: cleanDocName,
        title: rawContact.Title || existingData.title || 'Dr.',
        specialty: rawContact.Speciality || (titleLower.includes('surgeon') ? rawContact.Title : (existingData.specialty || 'Specialist Physician')),
        clinic: companyName || existingData.clinic || '',
        clinicName: companyName || existingData.clinicName || '',
        address: fullAddress || existingData.address || '',
        city: city || existingData.city || 'Dubai',
        country: country || existingData.country || 'United Arab Emirates',
        phone: rawContact.Phone || phone || existingData.phone || '',
        clinicPhone: rawContact.Phone || phone || existingData.clinicPhone || '',
        mobile: rawContact.Mobile || phone || existingData.mobile || '',
        email,
        secondaryEmail: rawContact.Secondary_Email || existingData.secondaryEmail || '',
        description,
        zohoContactId: String(contactId),
        role: 'doctor',
        isDoctor: true,
        updatedAt: new Date().toISOString()
      };
      if (licenseNumber) {
        doctorData.license = licenseNumber;
        doctorData.licenseNumber = licenseNumber;
      }

      if (userDocRef) {
        await userDocRef.set(doctorData, { merge: true });
      } else {
        const newDoc = adminDb.collection('users').doc();
        await newDoc.set({ ...doctorData, createdAt: new Date().toISOString() });
      }

      // Also cascade updates to any existing prescriptions where this doctor is referenced
      try {
        const rxSnap = await adminDb.collection('prescriptions')
          .where('treatingDoctor.zohoContactId', '==', String(contactId))
          .get();

        for (const doc of rxSnap.docs) {
          await doc.ref.update({
            doctorName: doctorData.name,
            doctorSpecialty: doctorData.specialty,
            clinic: doctorData.clinic,
            clinicName: doctorData.clinicName,
            'treatingDoctor.name': doctorData.name,
            'treatingDoctor.clinic': doctorData.clinic,
            'treatingDoctor.clinicName': doctorData.clinicName,
            'treatingDoctor.specialty': doctorData.specialty,
            'treatingDoctor.address': doctorData.address,
            'treatingDoctor.phone': doctorData.phone,
            'treatingDoctor.mobile': doctorData.mobile,
            'treatingDoctor.email': doctorData.email,
            'treatingDoctor.license': doctorData.license || '',
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('[/api/webhooks/zoho-bigin] Prescription cascade notice:', err);
      }

      await webhookEventRef.update({
        status: 'processed_doctor',
        doctorName: doctorData.name,
        clinicName: doctorData.clinicName,
        processedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Doctor profile and associated prescriptions synchronized from Zoho Bigin',
        webhookId: webhookEventRef.id,
        doctor: doctorData
      });
    }

    // 6. Auto-provision or Synchronize Wholesaler using existing server action
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

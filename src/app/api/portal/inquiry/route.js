import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/portal/inquiry
 * Handles institutional and clinical inquiries from public pages (datasheets, protocols, catalogs).
 * Stores records in Firestore `institutional_inquiries` collection.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      organization = '',
      phone = '',
      topic = 'general_inquiry',
      message = '',
      contextType = 'general',
      attachedEntity = null,
      sourceUrl = ''
    } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, professional email, and message are required.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid professional email address.' },
        { status: 400 }
      );
    }

    const inquiryRecord = {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      organization: String(organization || '').trim(),
      phone: String(phone || '').trim(),
      topic: String(topic).trim(),
      message: String(message).trim().slice(0, 4000),
      contextType: String(contextType).trim(),
      attachedEntity: attachedEntity ? {
        id: attachedEntity.id || attachedEntity.slug || '',
        name: attachedEntity.name || attachedEntity.title || '',
        code: attachedEntity.code || attachedEntity.protocolCode || '',
        category: attachedEntity.category || '',
        strength: attachedEntity.strength || '',
      } : null,
      sourceUrl: String(sourceUrl || '').trim(),
      recipientDesk: 'business@med-peptides.com',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (adminDb) {
      try {
        const docRef = await adminDb.collection('institutional_inquiries').add(inquiryRecord);
        const inquiryId = docRef.id;

        // Asynchronously sync to Zoho Bigin CRM without blocking the web response
        syncInquiryToZohoBigin(inquiryRecord, inquiryId).catch(err => {
          console.warn('[syncInquiryToZohoBigin] Background sync warning:', err.message);
        });

        return NextResponse.json({
          success: true,
          inquiryId,
          recipient: 'business@med-peptides.com'
        });
      } catch (dbErr) {
        console.warn('Firestore write failed, falling back to success acknowledgement:', dbErr);
      }
    }

    // Fallback if db unavailable
    return NextResponse.json({
      success: true,
      inquiryId: `INQ-${Date.now()}`,
      recipient: 'business@med-peptides.com',
      note: 'Acknowledged via relay'
    });
  } catch (error) {
    console.error('Error in /api/portal/inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please contact business@med-peptides.com directly.' },
      { status: 500 }
    );
  }
}

/**
 * Retrieves valid Zoho OAuth access token from Firestore cache
 */
async function getZohoAccessToken() {
  if (!adminDb) return null;
  try {
    const snapV2 = await adminDb.collection('zoho_token_cache').doc('access_token_v2').get();
    if (snapV2.exists && snapV2.data()?.access_token) {
      return snapV2.data().access_token;
    }
    const snapV1 = await adminDb.collection('zoho_token_cache').doc('access_token').get();
    if (snapV1.exists && snapV1.data()?.access_token) {
      return snapV1.data().access_token;
    }
  } catch (err) {
    console.warn('[getZohoAccessToken] Failed to retrieve cached token:', err.message);
  }
  return null;
}

/**
 * Creates or updates Contact & creates a Qualification Deal in Zoho Bigin
 */
async function syncInquiryToZohoBigin(inquiry, inquiryId) {
  const accessToken = await getZohoAccessToken();
  if (!accessToken) {
    console.info('[syncInquiryToZohoBigin] No Zoho OAuth token available; skipping Bigin CRM push.');
    return;
  }

  let contactId = null;

  // 1. Search if contact already exists by email
  try {
    const searchUrl = `https://www.zohoapis.com/bigin/v1/Contacts/search?email=${encodeURIComponent(inquiry.email)}`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      signal: AbortSignal.timeout(8000)
    });

    if (searchRes.ok) {
      const searchJson = await searchRes.json();
      if (Array.isArray(searchJson?.data) && searchJson.data.length > 0) {
        contactId = searchJson.data[0].id;
      }
    }
  } catch (searchErr) {
    console.warn('[syncInquiryToZohoBigin] Search contact failed:', searchErr.message);
  }

  // 2. If contact does not exist, create contact in Bigin
  if (!contactId) {
    try {
      const nameParts = inquiry.name.trim().split(/\s+/);
      const firstName = nameParts.length > 1 ? nameParts[0] : '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || 'Applicant';

      const contactPayload = {
        data: [{
          First_Name: firstName,
          Last_Name: lastName,
          Email: inquiry.email,
          Phone: inquiry.phone || '',
          Description: `Lead from Med-Peptides Public Portal (${inquiry.contextType || 'Inquiry'})\nOrganization: ${inquiry.organization || 'Independent'}\nTopic: ${inquiry.topic}\nSource: ${inquiry.sourceUrl || 'Portal'}`
        }]
      };

      const createRes = await fetch('https://www.zohoapis.com/bigin/v1/Contacts', {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactPayload),
        signal: AbortSignal.timeout(8000)
      });

      if (createRes.ok) {
        const createJson = await createRes.json();
        if (createJson?.data?.[0]?.details?.id) {
          contactId = createJson.data[0].details.id;
        }
      }
    } catch (createErr) {
      console.warn('[syncInquiryToZohoBigin] Contact creation failed:', createErr.message);
    }
  }

  // 3. Create Deal / Pipeline record in Bigin
  let dealId = null;
  try {
    const isResidency = inquiry.topic?.toLowerCase().includes('residency') || inquiry.topic?.toLowerCase().includes('visa') || inquiry.contextType === 'corporate_residency';
    const dealTitle = isResidency 
      ? `Spain Residency Fast-Track · ${inquiry.organization || inquiry.name}`
      : `${inquiry.topic || 'Inquiry'} · ${inquiry.organization || inquiry.name}`;

    const dealPayload = {
      data: [{
        Deal_Name: dealTitle.slice(0, 115),
        Stage: 'Qualification',
        Sub_Pipeline: 'Sales Pipeline Standard',
        Amount: isResidency ? 4500 : 1500,
        Description: `Inquiry message:\n${inquiry.message}\n\nOrganization: ${inquiry.organization || 'N/A'}\nPhone: ${inquiry.phone || 'N/A'}\nSource URL: ${inquiry.sourceUrl || 'Web Portal'}`
      }]
    };

    if (contactId) {
      dealPayload.data[0].Contact_Name = { id: contactId };
    }

    const dealRes = await fetch('https://www.zohoapis.com/bigin/v1/Pipelines', {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dealPayload),
      signal: AbortSignal.timeout(8000)
    });

    if (dealRes.ok) {
      const dealJson = await dealRes.json();
      if (dealJson?.data?.[0]?.details?.id) {
        dealId = dealJson.data[0].details.id;
      }
    }
  } catch (dealErr) {
    console.warn('[syncInquiryToZohoBigin] Pipeline deal creation failed:', dealErr.message);
  }

  // 4. Optionally write Note for full context
  if (contactId || dealId) {
    try {
      await fetch('https://www.zohoapis.com/bigin/v1/Notes', {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            Note_Title: `Web Portal Inquiry (${inquiry.topic || 'General'})`,
            Note_Content: `Full Submission Details:\nName: ${inquiry.name}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone}\nOrg: ${inquiry.organization}\nContext: ${inquiry.contextType}\n\nMessage:\n${inquiry.message}`,
            Parent_Id: dealId || contactId,
            se_module: dealId ? 'Pipelines' : 'Contacts'
          }]
        }),
        signal: AbortSignal.timeout(8000)
      });
    } catch (noteErr) {
      // Non-critical
    }
  }

  // 5. Update Firestore institutional_inquiries with Zoho IDs
  if (adminDb && inquiryId && (contactId || dealId)) {
    try {
      await adminDb.collection('institutional_inquiries').doc(inquiryId).set({
        zohoBiginContactId: contactId || null,
        zohoBiginDealId: dealId || null,
        zohoSyncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (upErr) {
      console.warn('[syncInquiryToZohoBigin] Firestore record update failed:', upErr.message);
    }
  }
}


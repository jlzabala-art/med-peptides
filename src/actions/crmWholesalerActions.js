"use server";

import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

/**
 * Retrieves valid Zoho OAuth access token from Firestore cache
 */
async function getZohoAccessToken() {
  if (!adminDb) throw new Error("Firebase Admin DB not initialized");
  const snapV2 = await adminDb.collection('zoho_token_cache').doc('access_token_v2').get();
  if (snapV2.exists && snapV2.data().access_token) {
    return snapV2.data().access_token;
  }
  const snapV1 = await adminDb.collection('zoho_token_cache').doc('access_token').get();
  if (snapV1.exists && snapV1.data().access_token) {
    return snapV1.data().access_token;
  }
  throw new Error("No active Zoho OAuth access token found in system cache");
}

/**
 * Searches Zoho Bigin contacts by email, phone, or word
 */
export async function searchBiginWholesalersAction(query) {
  if (!query || String(query).trim().length < 2) {
    return { success: false, error: "Search query must be at least 2 characters." };
  }

  try {
    const accessToken = await getZohoAccessToken();
    const cleanQuery = String(query).trim();
    let contacts = [];

    const isEmail = cleanQuery.includes('@');
    const isPhone = cleanQuery.startsWith('+') || /^\d+$/.test(cleanQuery.replace(/[\s-]/g, ''));

    let paramKey = 'word';
    let paramVal = cleanQuery;

    if (isEmail) {
      paramKey = 'email';
      paramVal = cleanQuery.toLowerCase();
    } else if (isPhone) {
      paramKey = 'phone';
      paramVal = cleanQuery.replace(/[^\d+]/g, '');
    }

    const url = `https://www.zohoapis.com/bigin/v1/Contacts/search?${paramKey}=${encodeURIComponent(paramVal)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      signal: AbortSignal.timeout(10000)
    });

    if (res.status === 204 || res.status === 404) {
      return { success: true, contacts: [] };
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[searchBiginWholesalersAction] Zoho Bigin search returned status', res.status, errText);
      return { success: false, error: `Zoho Bigin search failed with status ${res.status}` };
    }

    const json = await res.json();
    const rawList = Array.isArray(json?.data) ? json.data : [];

    contacts = rawList.map(c => ({
      id: c.id,
      name: c.Full_Name || `${c.First_Name || ''} ${c.Last_Name || ''}`.trim(),
      firstName: c.First_Name || '',
      lastName: c.Last_Name || '',
      email: c.Email || '',
      phone: c.Mobile || c.Phone || '',
      companyName: c.Account_Name?.name || '',
      accountId: c.Account_Name?.id || '',
      description: c.Description || ''
    }));

    return { success: true, contacts };
  } catch (error) {
    console.error('[searchBiginWholesalersAction] Error:', error);
    return { success: false, error: error.message || "Failed to search Zoho Bigin contacts." };
  }
}

/**
 * Imports or synchronizes a Zoho Bigin contact into Firestore as a Wholesaler
 */
export async function importBiginWholesalerAction({ contact, customMarkup = 20, currency = 'AED' }) {
  if (!contact || !contact.id) {
    return { success: false, error: "Missing required contact data" };
  }

  try {
    const email = String(contact.email || '').trim().toLowerCase();
    const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Wholesaler Partner';
    const company = contact.companyName || name;
    const phone = contact.phone || '';
    const now = new Date().toISOString();

    if (!email) {
      return { success: false, error: "Contact must have a valid email address to create wholesaler account." };
    }

    // 1. Firebase Auth user management
    let authUser;
    try {
      authUser = await adminAuth.getUserByEmail(email);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        const createPayload = {
          email,
          displayName: name,
          emailVerified: true
        };
        const cleanE164 = phone.replace(/[^\d+]/g, '');
        if (cleanE164.startsWith('+') && cleanE164.length >= 10) {
          createPayload.phoneNumber = cleanE164;
        }
        authUser = await adminAuth.createUser(createPayload);
      } else {
        throw err;
      }
    }

    // 2. Set Custom User Claims
    await adminAuth.setCustomUserClaims(authUser.uid, {
      role: 'wholesaler',
      approved: true,
      admin: false
    });

    // 3. Derive semantic document ID for wholesellers collection
    const slugBase = company.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const wholesellerDocId = slugBase.length > 2 ? slugBase : authUser.uid;

    const country = currency === 'EUR' ? 'Spain' : 'United Arab Emirates';
    const city = currency === 'EUR' ? 'Madrid' : 'Dubai';
    const markupNum = Number(customMarkup) || 20;

    // 4. Update 'wholesellers' collection
    await adminDb.collection('wholesellers').doc(wholesellerDocId).set({
      id: wholesellerDocId,
      name,
      displayName: `${company} · ${name}`,
      companyName: company,
      contactName: name,
      contactEmail: email,
      email,
      phone,
      mobile: phone.replace(/[^\d+]/g, ''),
      country,
      city,
      currency,
      status: 'active',
      type: 'wholeseller',
      commercialMarkup: markupNum,
      markup: markupNum,
      discountMargin: markupNum,
      zohoBiginContactId: contact.id,
      zohoBiginAccountId: contact.accountId || '',
      uid: authUser.uid,
      notes: contact.description || 'Imported and linked from Zoho Bigin',
      categories: ['Peptides', 'Aesthetic Medicine'],
      updatedAt: now
    }, { merge: true });

    // 5. Update 'users' collection
    await adminDb.collection('users').doc(authUser.uid).set({
      id: authUser.uid,
      uid: authUser.uid,
      email,
      fullName: name,
      firstName: contact.firstName || name.split(' ')[0] || '',
      lastName: contact.lastName || name.split(' ').slice(1).join(' ') || '',
      displayName: name,
      companyName: company,
      institution: company,
      phone,
      mobile: phone.replace(/[^\d+]/g, ''),
      role: 'wholesaler',
      roles: ['wholesaler', 'wholeseller'],
      type: 'wholeseller',
      priceTier: 'wholesale',
      pricingChannel: 'wholesale',
      commercialMarkup: markupNum,
      markup: markupNum,
      customMarkupPct: markupNum,
      discountMargin: markupNum,
      currency,
      approved: true,
      professionalStatus: 'approved',
      status: 'active',
      shippingCountry: country,
      shippingCity: city,
      shippingAddress: { company, city, country },
      billingAddress: { company, city, country },
      zohoBiginContactId: contact.id,
      zohoBiginAccountId: contact.accountId || '',
      permissions: {
        canBulkOrder: true,
        canAccessAcademy: true,
        customSynthesis: true,
        trackCommission: true,
        canAccessCalculator: true,
        canAccessClinicalAI: false,
        canAccessCustomSynthesis: true,
        canAccessDoctorDashboard: false,
        clinicalLogs: false,
        canAccessAdminDashboard: false,
        manageStaff: false,
        canRecommend: false
      },
      updatedAt: now
    }, { merge: true });

    // 6. Update 'customers' collection
    await adminDb.collection('customers').doc(authUser.uid).set({
      id: authUser.uid,
      email,
      name,
      firstName: contact.firstName || name.split(' ')[0] || '',
      lastName: contact.lastName || name.split(' ').slice(1).join(' ') || '',
      companyName: company,
      legalName: company,
      phone,
      customerType: 'wholesaler',
      pricingTier: 'wholesale',
      commercialMarkup: markupNum,
      markup: markupNum,
      discountMargin: markupNum,
      currency,
      country,
      city,
      status: 'active',
      paymentTerms: 'Due on Receipt',
      creditLimit: 50000,
      tags: ['wholesaler', country.toLowerCase(), 'bigin'],
      wholesalerProfile: {
        exclusiveTerritories: [country],
        authorizedVariantIds: [],
        resellerCertificateUrl: null
      },
      shippingAddress: { street: '', city, state: '', zipCode: '', country },
      billingAddress: { street: '', city, state: '', zipCode: '', country },
      zohoBiginContactId: contact.id,
      zohoBiginAccountId: contact.accountId || '',
      updatedAt: now
    }, { merge: true });

    // 7. Add confirmation note in Bigin
    try {
      const accessToken = await getZohoAccessToken();
      await fetch('https://www.zohoapis.com/bigin/v1/Notes', {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            Note_Title: 'Registered as Wholesaler on Med-Peptides',
            Note_Content: `Registered as Wholesaler on Med-Peptides platform (UID: ${authUser.uid}, Doc ID: ${wholesellerDocId}). Commercial Markup: ${markupNum}%, Currency: ${currency}.`,
            Parent_Id: contact.id,
            se_module: 'Contacts'
          }]
        })
      });
    } catch (noteErr) {
      console.warn('[importBiginWholesalerAction] Note creation in Bigin failed (non-fatal):', noteErr.message);
    }

    return {
      success: true,
      wholesaler: {
        id: wholesellerDocId,
        uid: authUser.uid,
        name,
        company,
        email,
        phone,
        currency,
        commercialMarkup: markupNum
      }
    };
  } catch (error) {
    console.error('[importBiginWholesalerAction] Error:', error);
    return { success: false, error: error.message || "Failed to import wholesaler from Zoho Bigin." };
  }
}

import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

/**
 * GET /api/catalog/clients?q=searchTerm&limit=50
 *
 * Returns a merged, deduplicated list of potential PDF quotation recipients:
 *   - Wholesellers collection
 *   - Users with role doctor / clinic / wholeseller
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').toLowerCase().trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    const results = [];
    const seen = new Set();

    // ── 1. Wholesellers ───────────────────────────────────────────────────
    const wsSnap = await adminDb.collection('wholesellers').limit(limit).get().catch(() => ({ docs: [] }));
    const wholesellers = [];
    wsSnap.docs.forEach(doc => {
      const d = doc.data();
      const name = d.displayName || d.companyName || d.name || d.businessName || '';
      const email = d.email || d.contactEmail || '';
      if (!name && !email) return;
      const key = email || doc.id;
      if (seen.has(key)) return;
      seen.add(key);
      const item = {
        id: doc.id,
        name: name || email,
        email,
        type: 'wholeseller',
        country: d.country || d.location || '',
        phone: d.phone || d.mobile || '',
      };
      results.push(item);
      wholesellers.push(item);
    });

    // ── 1b. Customers (Wholesalers, Clinics, Doctors) ──────────────────────
    const custSnap = await adminDb.collection('customers')
      .where('customerType', 'in', ['wholesaler', 'wholeseller', 'clinic', 'doctor'])
      .limit(limit)
      .get()
      .catch(() => ({ docs: [] }));
    custSnap.docs.forEach(doc => {
      const d = doc.data();
      const name = d.displayName || d.companyName || d.legalName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim();
      const email = d.email || '';
      if (!name && !email) return;
      const key = email || doc.id;
      if (seen.has(key)) return;
      seen.add(key);
      const normType = (d.customerType === 'wholesaler' || d.customerType === 'wholeseller') ? 'wholeseller' : d.customerType;
      const item = {
        id: doc.id,
        name: name || email,
        email,
        type: normType,
        country: d.country || '',
        phone: d.phone || '',
      };
      results.push(item);
      if (normType === 'wholeseller') wholesellers.push(item);
      if (normType === 'clinic') clinics.push(item);
      if (normType === 'doctor') doctors.push(item);
    });

    // ── 2. Clinics ────────────────────────────────────────────────────────
    const clinicSnap = await adminDb.collection('clinics').limit(limit).get().catch(() => ({ docs: [] }));
    const clinics = [];
    clinicSnap.docs.forEach(doc => {
      const d = doc.data();
      const name = d.name || d.clinicName || '';
      const email = d.email || d.contactEmail || '';
      if (!name && !email) return;
      const key = `clinic_${doc.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      const item = {
        id: doc.id,
        name: name || email,
        email,
        type: 'clinic',
        country: d.country || d.location || '',
        phone: d.phone || '',
      };
      results.push(item);
      clinics.push(item);
    });

    // ── 3. Users with relevant roles ──────────────────────────────────────
    const roleSnap = await adminDb
      .collection('users')
      .where('role', 'in', ['doctor', 'clinic', 'wholeseller', 'wholesaler', 'admin', 'manager', 'sales', 'superadmin'])
      .limit(limit)
      .get()
      .catch(() => ({ docs: [] }));

    const managers = [
      { id: 'desk', name: 'Atlas Commercial Desk', email: 'orders@atlas-solutions.com', role: 'desk' },
    ];
    const doctors = [];

    roleSnap.docs.forEach(doc => {
      const d = doc.data();
      const name = d.displayName || d.companyName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.email;
      const email = d.email || '';
      if (!name && !email) return;

      if (['admin', 'manager', 'sales', 'superadmin'].includes(d.role)) {
        if (!managers.some(m => m.email === email)) {
          managers.push({
            id: doc.id,
            name: name || email,
            email,
            role: d.role,
          });
        }
      }

      const key = email || doc.id;
      if (!seen.has(key)) {
        seen.add(key);
        const normRole = (d.role === 'wholesaler' || d.role === 'wholeseller') ? 'wholeseller' : d.role;
        const item = {
          id: doc.id,
          name: name || email,
          email,
          type: normRole || 'user',
          country: d.country || d.shippingCountry || '',
          phone: d.phone || d.mobile || '',
        };
        results.push(item);
        if (normRole === 'doctor') doctors.push(item);
        if (normRole === 'wholeseller') wholesellers.push(item);
        if (normRole === 'clinic') clinics.push(item);
      }
    });

    // ── 4. Patients ──────────────────────────────────────────────────────
    const patientSnap = await adminDb.collection('patients').limit(limit).get().catch(() => ({ docs: [] }));
    const patients = [];
    patientSnap.docs.forEach(doc => {
      const d = doc.data();
      const name = d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.email;
      const email = d.email || '';
      if (!name && !email) return;
      const key = `patient_${doc.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        const item = {
          id: doc.id,
          name: name || email,
          email,
          type: 'patient',
          country: d.country || '',
          phone: d.phone || '',
        };
        results.push(item);
        patients.push(item);
      }
    });

    // ── 5. Local filter if q or type provided ─────────────────────────────
    const reqType = (searchParams.get('type') || '').toLowerCase().trim();
    let filtered = results;
    if (reqType && reqType !== 'all') {
      const isWs = reqType === 'wholeseller' || reqType === 'wholesaler';
      filtered = filtered.filter(r => {
        const t = (r.type || '').toLowerCase();
        if (isWs) return t === 'wholeseller' || t === 'wholesaler';
        return t === reqType;
      });
    }
    if (q) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.country || '').toLowerCase().includes(q) ||
        (r.phone || '').includes(q)
      );
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      items: filtered,
      total: filtered.length,
      managers,
      wholesellers,
      clinics,
      doctors,
      patients,
    });
  } catch (err) {
    console.error('[/api/catalog/clients GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/catalog/clients
 * Creates a new client/recipient entity (clinic, doctor, wholeseller, patient)
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }
    const body = await request.json();
    const { type = 'clinic', name, email = '', phone = '', country = '' } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    const cleanCountry = (country || '').trim();
    const now = new Date().toISOString();

    let createdItem = null;

    if (type === 'clinic') {
      const docRef = await adminDb.collection('clinics').add({
        name: cleanName,
        email: cleanEmail,
        contactEmail: cleanEmail,
        phone: cleanPhone,
        country: cleanCountry,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      createdItem = { id: docRef.id, name: cleanName, email: cleanEmail, phone: cleanPhone, country: cleanCountry, type: 'clinic' };
    } else if (type === 'wholeseller') {
      const docRef = await adminDb.collection('wholesellers').add({
        companyName: cleanName,
        name: cleanName,
        email: cleanEmail,
        contactEmail: cleanEmail,
        phone: cleanPhone,
        country: cleanCountry,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      createdItem = { id: docRef.id, name: cleanName, email: cleanEmail, phone: cleanPhone, country: cleanCountry, type: 'wholeseller' };
    } else if (type === 'doctor') {
      const docRef = await adminDb.collection('users').add({
        displayName: cleanName,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        country: cleanCountry,
        role: 'doctor',
        status: 'approved',
        createdAt: now,
        updatedAt: now,
      });
      createdItem = { id: docRef.id, name: cleanName, email: cleanEmail, phone: cleanPhone, country: cleanCountry, type: 'doctor' };
    } else if (type === 'patient') {
      const docRef = await adminDb.collection('patients').add({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        country: cleanCountry,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      createdItem = { id: docRef.id, name: cleanName, email: cleanEmail, phone: cleanPhone, country: cleanCountry, type: 'patient' };
    } else {
      createdItem = { id: `custom_${Date.now()}`, name: cleanName, email: cleanEmail, phone: cleanPhone, country: cleanCountry, type: type || 'general' };
    }

    return NextResponse.json({ success: true, item: createdItem });
  } catch (err) {
    console.error('[/api/catalog/clients POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

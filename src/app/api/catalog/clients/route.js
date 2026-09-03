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
    const wsSnap = await adminDb.collection('wholesellers').limit(limit).get();
    const wholesellers = [];
    wsSnap.docs.forEach(doc => {
      const d = doc.data();
      const name = d.companyName || d.name || d.businessName || '';
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
        phone: d.phone || '',
      };
      results.push(item);
      wholesellers.push(item);
    });

    // ── 2. Clinics ────────────────────────────────────────────────────────
    const clinicSnap = await adminDb.collection('clinics').limit(limit).get();
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
      .where('role', 'in', ['doctor', 'clinic', 'wholeseller', 'admin', 'manager', 'sales', 'superadmin'])
      .limit(limit)
      .get();

    const managers = [
      { id: 'desk', name: 'Atlas Commercial Desk', email: 'orders@atlas-solutions.com', role: 'desk' },
    ];
    const doctors = [];

    roleSnap.docs.forEach(doc => {
      const d = doc.data();
      const name = d.displayName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.email;
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
        const item = {
          id: doc.id,
          name: name || email,
          email,
          type: d.role || 'user',
          country: d.country || '',
          phone: d.phone || '',
        };
        results.push(item);
        if (d.role === 'doctor') doctors.push(item);
      }
    });

    // ── 4. Local filter if q provided ─────────────────────────────────────
    const filtered = q
      ? results.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.country || '').toLowerCase().includes(q)
        )
      : results;

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      items: filtered,
      total: filtered.length,
      managers,
      wholesellers,
      clinics,
      doctors,
    });
  } catch (err) {
    console.error('[/api/catalog/clients] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

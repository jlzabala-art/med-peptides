import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/shares/recipients?type=doctor|patient|wholeseller|supplier&q=term&limit=25
 * 
 * Lightweight, lazy search endpoint to find recipients by role without loading 
 * the entire user database. Complies with Golden Rule #1 & #2.
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'doctor';
    const q = (searchParams.get('q') || '').toLowerCase().trim();
    const limitNum = Math.min(parseInt(searchParams.get('limit') || '25', 10), 50);

    let items = [];

    if (type === 'supplier') {
      const snap = await adminDb.collection('suppliers').limit(limitNum).get();
      items = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || d.displayName || d.companyName || doc.id,
          company: d.companyName || d.name || '',
          email: d.email || d.contactEmail || '',
          phone: d.phone || d.whatsapp || '',
          type: 'supplier',
          role: 'supplier',
          flag: d.flag || d.country || null,
        };
      });
    } else if (type === 'all') {
      const [usersSnap, suppSnap, patSnap] = await Promise.all([
        adminDb.collection('users').limit(limitNum).get(),
        adminDb.collection('suppliers').limit(15).get(),
        adminDb.collection('patients').limit(25).get()
      ]);
      const userItems = usersSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.displayName || d.name || d.fullName || d.email || 'Unnamed',
          company: d.company || d.clinic || d.clinicName || '',
          email: d.email || '',
          phone: d.phone || d.phoneNumber || d.whatsapp || '',
          type: d.role || 'doctor',
          role: d.role || 'doctor',
        };
      });
      const suppItems = suppSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || d.displayName || d.companyName || doc.id,
          company: d.companyName || d.name || '',
          email: d.email || d.contactEmail || '',
          phone: d.phone || d.whatsapp || '',
          type: 'supplier',
          role: 'supplier',
          flag: d.flag || d.country || null,
        };
      });
      const patItems = patSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || d.fullName || 'Patient',
          alias: d.alias || d.whatsappName || '',
          company: d.clinicName || d.clinic || (d.physician ? `Dr. ${d.physician}` : ''),
          email: d.email || '',
          phone: d.phone || d.mobile || d.whatsapp || '',
          type: 'patient',
          role: 'patient',
          physicianId: d.physicianId || d.doctorId || null,
          physicianName: d.physician || d.doctorName || null,
        };
      });
      items = [...userItems, ...patItems, ...suppItems];
    } else if (type === 'patient') {
      const [usersSnap, patSnap] = await Promise.all([
        adminDb.collection('users').where('role', '==', 'patient').limit(limitNum).get(),
        adminDb.collection('patients').limit(limitNum).get(),
      ]);
      const userItems = usersSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.displayName || d.name || d.fullName || 'Patient',
          company: d.company || d.clinic || '',
          email: d.email || '',
          phone: d.phone || d.whatsapp || '',
          type: 'patient',
          role: 'patient',
        };
      });
      const patItems = patSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || d.fullName || 'Patient',
          alias: d.alias || d.whatsappName || '',
          company: d.clinicName || d.clinic || (d.physician ? `Dr. ${d.physician}` : ''),
          email: d.email || '',
          phone: d.phone || d.mobile || d.whatsapp || '',
          type: 'patient',
          role: 'patient',
          physicianId: d.physicianId || d.doctorId || null,
          physicianName: d.physician || d.doctorName || null,
        };
      });
      items = [...userItems, ...patItems];
    } else {
      // Query users collection by role
      let query = adminDb.collection('users');
      if (type && type !== 'external') {
        query = query.where('role', '==', type);
      }
      const snap = await query.limit(limitNum).get();
      items = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.displayName || d.name || d.fullName || d.email || 'Unnamed',
          company: d.company || d.clinic || d.clinicName || '',
          email: d.email || '',
          phone: d.phone || d.phoneNumber || d.whatsapp || '',
          type: d.role || type,
          role: d.role || type,
        };
      });
    }

    // Filter in-memory by query if provided
    if (q) {
      const cleanDigitsQ = q.replace(/\D/g, '');
      items = items.filter(item => 
        (item.name || '').toLowerCase().includes(q) ||
        (item.alias || '').toLowerCase().includes(q) ||
        (item.company || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (cleanDigitsQ.length >= 3 && (item.phone || '').replace(/\D/g, '').includes(cleanDigitsQ))
      );
    }

    return NextResponse.json({
      items,
      count: items.length,
      type
    });
  } catch (err) {
    console.error('[/api/shares/recipients] Error:', err);
    return NextResponse.json({ error: err.message, items: [] }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { verifyAdminAuth } from '../../../../lib/serverAuth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/regularize-customers
 * ─────────────────────────────────────────────────────────────────────────────
 * Idempotent migration endpoint that establishes `customers` as the Single
 * Source of Truth (SSOT). Consolidates:
 *   1. `patients` -> `customers` (customerType: 'patient') + patientProfile
 *   2. `clinics` -> `customers` (customerType: 'clinic') + clinicProfile
 *   3. `wholesellers` -> `customers` (customerType: 'wholesaler') + wholesalerProfile
 *   4. `users` (doctors) -> `customers` (customerType: 'doctor') + doctorProfile
 *
 * Query params: ?dryRun=true (simulates without writing)
 */
export async function POST(request) {
  try {
    const authCheck = await verifyAdminAuth(request);
    if (!authCheck.isAuthorized) {
      return authCheck.response;
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore Admin DB is not initialized.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dryRun') === 'true';

    const stats = {
      patientsProcessed: 0,
      clinicsProcessed: 0,
      wholesalersProcessed: 0,
      doctorsProcessed: 0,
      totalCommitted: 0,
      errors: [],
    };

    const batches = [];
    let currentBatch = adminDb.batch();
    let currentBatchCount = 0;

    const queueWrite = (ref, data) => {
      if (dryRun) return;
      currentBatch.set(ref, data, { merge: true });
      currentBatchCount++;
      if (currentBatchCount >= 450) {
        batches.push(currentBatch);
        currentBatch = adminDb.batch();
        currentBatchCount = 0;
      }
    };

    const now = new Date().toISOString();

    // ── 1. Migrate Patients ─────────────────────────────────────────────────
    const patientsSnap = await adminDb.collection('patients').get();
    for (const doc of patientsSnap.docs) {
      const p = doc.data();
      const customerRef = adminDb.collection('customers').doc(doc.id);

      const fullName = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unnamed Patient';

      const customerData = {
        id: doc.id,
        customerType: 'patient',
        name: fullName,
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        email: p.email || '',
        phone: p.phone || '',
        country: p.country || '',
        city: p.city || '',
        pricingTier: p.pricingTier || p.tier || 'retail',
        discountMargin: typeof p.discountMargin === 'number' ? p.discountMargin : 0,
        currency: p.currency || 'USD',
        paymentTerms: p.paymentTerms || 'Due on Receipt',
        creditLimit: typeof p.creditLimit === 'number' ? p.creditLimit : 5000,
        status: p.status === 'archived' || p.status === 'inactive' ? 'archived' : (p.status === 'unverified' ? 'unverified' : 'active'),
        notes: p.notes || '',
        tags: Array.isArray(p.tags) ? p.tags : [],
        assignedManagerId: p.assignedManagerId || null,
        createdAt: p.createdAt || now,
        updatedAt: now,
        patientProfile: {
          dateOfBirth: p.dateOfBirth || null,
          gender: p.gender || null,
          bloodType: p.bloodType || null,
          allergies: Array.isArray(p.allergies) ? p.allergies : [],
          currentConditions: Array.isArray(p.currentConditions) ? p.currentConditions : [],
          assignedDoctorId: (Array.isArray(p.doctorIds) && p.doctorIds[0]) || p.assignedDoctorId || null,
          assignedClinicId: (Array.isArray(p.clinicIds) && p.clinicIds[0]) || p.assignedClinicId || null,
          activeProtocols: Array.isArray(p.activeProtocols) ? p.activeProtocols : [],
          prescriptionsCount: typeof p.prescriptionsCount === 'number' ? p.prescriptionsCount : 0,
          medicalNotes: p.medicalNotes || p.notes || '',
        },
      };

      queueWrite(customerRef, customerData);
      stats.patientsProcessed++;
    }

    // ── 2. Migrate Clinics ──────────────────────────────────────────────────
    const clinicsSnap = await adminDb.collection('clinics').get();
    for (const doc of clinicsSnap.docs) {
      const c = doc.data();
      const customerRef = adminDb.collection('customers').doc(doc.id);

      const customerData = {
        id: doc.id,
        customerType: 'clinic',
        name: c.name || c.legalName || 'Unnamed Clinic',
        companyName: c.name || '',
        legalName: c.legalName || '',
        email: c.email || '',
        phone: c.phone || '',
        country: c.country || '',
        city: c.city || '',
        pricingTier: c.pricingTier || c.tier || 'clinic_partner',
        discountMargin: typeof c.discountMargin === 'number' ? c.discountMargin : 25,
        currency: c.currency || 'USD',
        paymentTerms: c.paymentTerms || 'Net 30',
        creditLimit: typeof c.creditLimit === 'number' ? c.creditLimit : 50000,
        status: c.status === 'inactive' ? 'archived' : 'active',
        notes: c.notes || '',
        tags: Array.isArray(c.tags) ? c.tags : [],
        createdAt: c.createdAt || now,
        updatedAt: now,
        clinicProfile: {
          clinicType: c.type || 'medical_clinic',
          territory: c.territory || c.country || 'Global',
          facilities: Array.isArray(c.facilities) ? c.facilities : [],
          assignedPhysicianIds: Array.isArray(c.assignedPhysicianIds) ? c.assignedPhysicianIds : [],
          assignedPhysiciansCount: c.assignedPhysiciansCount || (c.assignedPhysicianIds ? c.assignedPhysicianIds.length : 0),
        },
      };

      queueWrite(customerRef, customerData);
      stats.clinicsProcessed++;
    }

    // ── 3. Migrate Wholesalers ──────────────────────────────────────────────
    const wholesalersSnap = await adminDb.collection('wholesellers').get();
    for (const doc of wholesalersSnap.docs) {
      const w = doc.data();
      const customerRef = adminDb.collection('customers').doc(doc.id);

      const customerData = {
        id: doc.id,
        customerType: 'wholesaler',
        name: w.companyName || w.name || 'Unnamed Wholesaler',
        companyName: w.companyName || w.name || '',
        email: w.contactEmail || w.email || '',
        phone: w.contactPhone || w.phone || '',
        country: w.country || '',
        city: w.city || '',
        pricingTier: w.pricingTier || w.tier || 'tier_b2b_clinic',
        discountMargin: typeof w.discountMargin === 'number' ? w.discountMargin : 25,
        currency: w.currency || 'USD',
        paymentTerms: w.paymentTerms || 'Net 30',
        creditLimit: typeof w.creditLimit === 'number' ? w.creditLimit : 50000,
        status: w.status === 'archived' ? 'archived' : (w.status === 'pending' ? 'pending' : 'active'),
        notes: w.notes || '',
        tags: Array.isArray(w.tags) ? w.tags : [],
        createdAt: w.createdAt || now,
        updatedAt: now,
        wholesalerProfile: {
          authorizedVariantIds: Array.isArray(w.authorizedVariantIds) ? w.authorizedVariantIds : [],
          exclusiveTerritories: Array.isArray(w.exclusiveTerritories) ? w.exclusiveTerritories : [],
          resellerCertificateUrl: w.resellerCertificateUrl || null,
        },
      };

      queueWrite(customerRef, customerData);
      stats.wholesalersProcessed++;
    }

    // ── 4. Migrate Doctors (from users where role is doctor/physician) ───────
    const doctorsSnap = await adminDb.collection('users')
      .where('role', 'in', ['doctor', 'physician'])
      .get();

    for (const doc of doctorsSnap.docs) {
      const d = doc.data();
      const customerRef = adminDb.collection('customers').doc(doc.id);

      const fullName = d.displayName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Dr. Practitioner';

      const customerData = {
        id: doc.id,
        customerType: 'doctor',
        name: fullName,
        firstName: d.firstName || '',
        lastName: d.lastName || '',
        email: d.email || '',
        phone: d.phoneNumber || d.phone || '',
        country: d.country || '',
        city: d.city || '',
        pricingTier: d.pricingTier || 'clinic_partner',
        discountMargin: typeof d.discountMargin === 'number' ? d.discountMargin : 25,
        currency: d.currency || 'USD',
        paymentTerms: d.paymentTerms || 'Net 30',
        creditLimit: typeof d.creditLimit === 'number' ? d.creditLimit : 25000,
        status: d.status === 'inactive' ? 'archived' : 'active',
        notes: d.notes || '',
        tags: Array.isArray(d.tags) ? d.tags : [],
        createdAt: d.createdAt || now,
        updatedAt: now,
        doctorProfile: {
          medicalLicenseNumber: d.medicalLicenseNumber || d.licenseNumber || '',
          licenseIssuingCountry: d.licenseIssuingCountry || d.country || '',
          specialty: Array.isArray(d.specialty) ? d.specialty : (d.specialty ? [d.specialty] : ['General Practice']),
          degrees: Array.isArray(d.degrees) ? d.degrees : ['M.D.'],
          authorizedPrescriber: d.authorizedPrescriber !== false,
          affiliatedClinicIds: Array.isArray(d.affiliatedClinicIds) ? d.affiliatedClinicIds : [],
          physicianCommissionRate: typeof d.commissionRate === 'number' ? d.commissionRate : 0,
          activePatientsCount: typeof d.assignedPatientsCount === 'number' ? d.assignedPatientsCount : 0,
        },
      };

      queueWrite(customerRef, customerData);
      stats.doctorsProcessed++;
    }

    // Commit remaining batch
    if (!dryRun && currentBatchCount > 0) {
      batches.push(currentBatch);
    }

    if (!dryRun) {
      for (const b of batches) {
        await b.commit();
      }
      stats.totalCommitted = stats.patientsProcessed + stats.clinicsProcessed + stats.wholesalersProcessed + stats.doctorsProcessed;
    }

    return NextResponse.json({
      success: true,
      dryRun,
      stats,
      message: dryRun
        ? `Dry run completed. ${stats.patientsProcessed + stats.clinicsProcessed + stats.wholesalersProcessed + stats.doctorsProcessed} total customer records projected.`
        : `Successfully consolidated ${stats.totalCommitted} customers into the authoritative customers collection.`,
    });
  } catch (error) {
    console.error('[POST /api/admin/regularize-customers] Error:', error);
    return NextResponse.json({ error: error.message || 'Customer regularization failed' }, { status: 500 });
  }
}

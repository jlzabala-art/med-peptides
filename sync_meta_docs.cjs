/**
 * sync_meta_docs.cjs
 *
 * Computes and writes `_meta/dashboard_summary` to Firestore.
 * This is the O(1) read source for AdminOverviewTab — one document
 * replaces 12 parallel count() queries at dashboard load time.
 *
 * Run manually after bulk data changes, or trigger from write guards.
 *
 * Usage:
 *   node sync_meta_docs.cjs
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

async function countWhere(collection, field, op, value) {
  try {
    const snap = await db.collection(collection).where(field, op, value).count().get();
    return snap.data().count || 0;
  } catch { return 0; }
}

async function countAll(collection) {
  try {
    const snap = await db.collection(collection).count().get();
    return snap.data().count || 0;
  } catch { return 0; }
}

async function main() {
  console.log('\n' + '='.repeat(56));
  console.log('  Syncing _meta/dashboard_summary...');
  console.log('='.repeat(56));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    // Entity totals
    totalPatients,
    totalPrescriptions,
    totalOrders,
    totalLeads,
    totalClinics,
    totalProducts,

    // Patient status breakdown
    patientsActive,
    patientsUnverified,
    patientsSuspended,
    patientsNew30d,

    // Prescription status breakdown
    rxPending,
    rxApproved,
    rxProcessing,
    rxCompleted,
    rxCancelled,

    // Order status breakdown
    ordersAwaitingPayment,
    ordersProcessing,
    ordersDelivered,
    ordersDisputed,

    // Lead stats
    leadsNew30d,
    leadsConverted,

  ] = await Promise.all([
    countAll('patients'),
    countAll('prescriptions'),
    countAll('orders'),
    countAll('leads'),
    countAll('clinics'),
    countAll('products'),

    countWhere('patients', 'status', '==', 'active'),
    countWhere('patients', 'status', '==', 'unverified'),
    countWhere('patients', 'status', '==', 'suspended'),
    (() => db.collection('patients').where('createdAt', '>=', thirtyDaysAgo).count().get()
       .then(s => s.data().count || 0).catch(() => 0))(),

    countWhere('prescriptions', 'status', '==', 'pending'),
    countWhere('prescriptions', 'status', '==', 'approved'),
    countWhere('prescriptions', 'status', '==', 'processing'),
    countWhere('prescriptions', 'status', '==', 'completed'),
    countWhere('prescriptions', 'status', '==', 'cancelled'),

    countWhere('orders', 'status', '==', 'awaiting payment'),
    countWhere('orders', 'status', '==', 'processing'),
    countWhere('orders', 'status', '==', 'delivered'),
    countWhere('orders', 'status', '==', 'disputed'),

    (() => db.collection('leads').where('createdAt', '>=', thirtyDaysAgo).count().get()
       .then(s => s.data().count || 0).catch(() => 0))(),
    countWhere('leads', 'status', '==', 'won'),
  ]);

  const now = new Date().toISOString();

  const summary = {
    kpis: {
      patients:      totalPatients,
      prescriptions: totalPrescriptions,
      orders:        totalOrders,
      leads:         totalLeads,
      clinics:       totalClinics,
      products:      totalProducts,
    },
    alerts: {
      pendingPrescriptions:  rxPending,
      awaitingPaymentOrders: ordersAwaitingPayment,
      unverifiedPatients:    patientsUnverified,
      newLeads30d:           leadsNew30d,
      disputedOrders:        ordersDisputed,
    },
    patients: {
      total:      totalPatients,
      active:     patientsActive,
      unverified: patientsUnverified,
      suspended:  patientsSuspended,
      newLast30d: patientsNew30d,
    },
    prescriptions: {
      total:      totalPrescriptions,
      pending:    rxPending,
      approved:   rxApproved,
      processing: rxProcessing,
      completed:  rxCompleted,
      cancelled:  rxCancelled,
    },
    orders: {
      total:          totalOrders,
      awaitingPayment: ordersAwaitingPayment,
      processing:     ordersProcessing,
      delivered:      ordersDelivered,
      disputed:       ordersDisputed,
    },
    leads: {
      total:     totalLeads,
      newLast30d: leadsNew30d,
      converted: leadsConverted,
    },
    updatedAt: now,
    ttlSeconds: 60,  // consumers should re-sync after this many seconds
  };

  await db.collection('_meta').doc('dashboard_summary').set(summary);

  console.log('\n  ✅ _meta/dashboard_summary written:');
  console.log(`     Patients:      ${totalPatients} (${patientsActive} active, ${patientsUnverified} unverified)`);
  console.log(`     Prescriptions: ${totalPrescriptions} (${rxPending} pending)`);
  console.log(`     Orders:        ${totalOrders} (${ordersAwaitingPayment} awaiting payment)`);
  console.log(`     Leads:         ${totalLeads} (${leadsNew30d} new 30d)`);
  console.log(`     Clinics:       ${totalClinics}`);
  console.log(`     Products:      ${totalProducts}`);
  console.log(`\n     Updated at: ${now}`);
  console.log('='.repeat(56) + '\n');
}

main().catch(console.error).finally(() => process.exit(0));

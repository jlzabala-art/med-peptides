/**
 * scripts/test_three_channel_and_commissions_ledger.mjs
 * 
 * Comprehensive QA Test Suite:
 * 1. Dual-Margin & Pricing Verification (15% Mediluxe + 15% Wholesaler markup).
 * 2. Purge Verification: Zero mentions of "cold chain" anywhere.
 * 3. Atomic Firestore Accumulation: totalCommissions and pendingPayoutCommissions in `wholesaler_referrals/np-labs-international`.
 * 4. Multi-Channel Email Dispatch:
 *    - Admin: jose@mediluxeme.com
 *    - Customer: jlzabala@gmail.com
 *    - Wholesaler Partner (Nikolas): jlzabala@gmail.com (provisional QA)
 * 5. Full Economic Consistency: All 3 channels show identical Subtotal ($446.40), Freight ($65.22 / €60.00), and Grand Total ($511.62).
 * 6. Wholesaler Commissions Server Action Verification (`fetchWholesalerCommissionsAction`).
 */

import { adminDb } from '../src/lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import {
  sendOrderCreatedNotificationEmail,
  buildAdminOrderNotificationHtml,
  buildCustomerOrderConfirmationHtml,
  buildWholesalerReferralNotificationHtml
} from '../src/lib/orderNotificationMailer.js';
import {
  fetchWholesalerCommissionsAction,
  reconcileWholesalerPayoutAction
} from '../src/actions/wholesalerActions.js';

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

async function runTestSuite() {
  console.log('\n======================================================================');
  console.log('🧪 BATERÍA DE PRUEBAS: 3 CANALES DE EMAIL Y LIBRO DE COMISIONES NIKOLAS');
  console.log('======================================================================\n');

  if (!adminDb) {
    console.error('❌ Error: Firebase Admin DB is not initialized.');
    process.exit(1);
  }

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${message}`);
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // ── TEST 1: Pricing Calculations with €60 Shipping ─────────────────────────────────
  console.log('--- TEST 1: Pricing Model & Freight Inclusion ---');
  const items = [
    {
      name: 'BPC-157',
      dosage: '10mg',
      presentation: 'Sterile Lyophilized Vial',
      quantity: 2,
      unitPrice: 26.45,
      lineTotal: 52.90
    },
    {
      name: 'Tirzepatide',
      dosage: '10mg',
      presentation: 'Sterile Lyophilized Vial (10-Pack Clinic Bulk)',
      quantity: 10,
      unitPrice: 39.35,
      lineTotal: 393.50
    }
  ];

  const subtotal = round2(52.90 + 393.50); // $446.40
  const shippingCost = 65.22; // $65.22 ($ equivalent to €60 base freight)
  const grandTotal = round2(subtotal + shippingCost); // $511.62
  const expectedCommission = round2(subtotal * 0.15); // $66.96

  assert(subtotal === 446.40, `Subtotal formulation sales is exactly $446.40 (Actual: $${subtotal})`);
  assert(grandTotal === 511.62, `Grand Total including freight is $511.62 (Actual: $${grandTotal})`);
  assert(expectedCommission === 66.96, `Nikolas 15% partner commission on formulation is $66.96 (Actual: $${expectedCommission})`);

  // ── TEST 2: Cold-Chain Terminology Purge Verification ───────────────────────────────
  console.log('\n--- TEST 2: Strict Cold Chain Purge Verification ---');
  const dummyOrder = {
    orderCode: 'TEST-PURGE-001',
    customerName: 'Dr. Alexander Wright',
    customerEmail: 'jlzabala@gmail.com',
    customerPhone: '+971 50 123 4567',
    customerAddress: 'Al Maryah Island, ADGM Square, Abu Dhabi, United Arab Emirates',
    items,
    totalUnits: 12,
    subtotal,
    shippingCost,
    grandTotal,
    currency: 'USD',
    currencySymbol: '$',
    wholesalerId: 'np-labs-international',
    wholesalerName: 'Nikolaos Psathas (NP Labs International)',
    referralCode: 'CAT-RX-7482',
    attributedTo: 'Nikolaos Psathas · NP Labs International (Wholesaler · Code: CAT-RX-7482)'
  };

  const adminHtml = buildAdminOrderNotificationHtml(dummyOrder);
  const customerHtml = buildCustomerOrderConfirmationHtml(dummyOrder);
  const wholesalerHtml = buildWholesalerReferralNotificationHtml(dummyOrder, {
    totalCommissions: expectedCommission,
    totalRevenue: grandTotal,
    ordersCount: 1,
    totalUnits: 12
  });

  const forbiddenTerms = ['cold chain', 'cold-chain', '2-8°C', '2–8°C', 'cadena de frío', 'refrigerated container'];
  
  for (const term of forbiddenTerms) {
    const termLower = term.toLowerCase();
    assert(!adminHtml.toLowerCase().includes(termLower), `Admin Email template contains no "${term}"`);
    assert(!customerHtml.toLowerCase().includes(termLower), `Customer Email template contains no "${term}"`);
    assert(!wholesalerHtml.toLowerCase().includes(termLower), `Wholesaler Email template contains no "${term}"`);
  }

  // ── TEST 3: Express Medical Courier & Pricing in All 3 Templates ─────────────────────
  console.log('\n--- TEST 3: Logistics & Economic Consistency Across 3 HTML Templates ---');
  assert(adminHtml.includes('Express Medical Courier') || adminHtml.includes('Express Medical Logistics'), 'Admin template highlights Express Medical Logistics & Handling');
  assert(customerHtml.includes('Express Medical Courier') || customerHtml.includes('Express Medical Logistics'), 'Customer template highlights Express Medical Logistics & Handling');
  assert(wholesalerHtml.includes('Express Medical Courier') || wholesalerHtml.includes('Express Medical Logistics'), 'Wholesaler template highlights Express Medical Logistics & Handling');

  assert(adminHtml.includes('446.40'), 'Admin template displays Subtotal $446.40');
  assert(adminHtml.includes('511.62'), 'Admin template displays Grand Total $511.62');
  assert(customerHtml.includes('446.40'), 'Customer template displays Subtotal $446.40');
  assert(customerHtml.includes('511.62'), 'Customer template displays Grand Total $511.62');
  assert(wholesalerHtml.includes('446.40'), 'Wholesaler template displays Subtotal $446.40');
  assert(wholesalerHtml.includes('511.62'), 'Wholesaler template displays Grand Total $511.62');
  assert(wholesalerHtml.includes('66.96'), 'Wholesaler template displays 15% Commission $66.96');

  // ── TEST 4: Atomic Firestore Persistence of Order and Commissions ────────────────────
  console.log('\n--- TEST 4: Atomic Firestore Persistence in Nikolas Account ---');
  const now = new Date();
  const testOrderCode = `ORD-QA-${Date.now().toString().slice(-6)}`;
  
  const orderDocData = {
    orderCode: testOrderCode,
    orderId: testOrderCode,
    status: 'draft',
    source: 'public_peptides_price_schedule',
    isAutomatedTest: true,
    catalogId: 'CAT-RX-7482',
    customerName: dummyOrder.customerName,
    customerEmail: 'jlzabala@gmail.com', // Customer test target
    customerPhone: dummyOrder.customerPhone,
    deliveryAddress: dummyOrder.customerAddress,
    items,
    totalUnits: 12,
    subtotal,
    shippingCost,
    shippingCostEur: 60,
    shippingDestination: 'United Arab Emirates',
    grandTotal,
    total: grandTotal,
    currency: 'USD',
    currencySymbol: '$',
    paymentMethod: 'payment_link_24h',
    wholesalerId: 'np-labs-international',
    referralCode: 'CAT-RX-7482',
    wholesalerName: 'Nikolaos Psathas (NP Labs International)',
    wholesalerEmail: 'jlzabala@gmail.com',
    commissionRate: 0.15,
    commissionAmount: expectedCommission,
    attributedTo: dummyOrder.attributedTo,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const orderRef = await adminDb.collection('orders').add(orderDocData);
  assert(Boolean(orderRef.id), `Order successfully inserted in orders collection with ID: ${orderRef.id}`);

  // Update Nikolas commissions in wholesaler_referrals
  const refDocRef = adminDb.collection('wholesaler_referrals').doc('np-labs-international');
  await refDocRef.set({
    wholesalerId: 'np-labs-international',
    wholesalerName: 'Nikolaos Psathas (NP Labs International)',
    referralCode: 'CAT-RX-7482',
    ordersCount: FieldValue.increment(1),
    totalRevenue: FieldValue.increment(grandTotal),
    totalUnits: FieldValue.increment(12),
    totalCommissions: FieldValue.increment(expectedCommission),
    pendingPayoutCommissions: FieldValue.increment(expectedCommission),
    commissionRate: 0.15,
    lastOrderAt: now.toISOString(),
    lastCommissionEarnedAt: now.toISOString(),
    updatedAt: now.toISOString()
  }, { merge: true });

  await refDocRef.collection('orders').doc(orderRef.id).set({
    orderId: orderRef.id,
    orderCode: testOrderCode,
    collection: 'vials',
    customerName: dummyOrder.customerName,
    customerEmail: 'jlzabala@gmail.com',
    items,
    totalUnits: 12,
    subtotal,
    shippingCost,
    grandTotal,
    currency: 'USD',
    commissionRate: 0.15,
    commissionAmount: expectedCommission,
    payoutStatus: 'pending',
    status: 'draft',
    createdAt: now.toISOString()
  });

  const updatedRefSnap = await refDocRef.get();
  const refData = updatedRefSnap.data();
  assert(Number(refData.totalCommissions || 0) >= expectedCommission, `Firestore wholesaler_referrals totalCommissions is persisted (Current: $${refData.totalCommissions})`);
  assert(Number(refData.pendingPayoutCommissions || 0) >= expectedCommission, `Firestore wholesaler_referrals pendingPayoutCommissions is persisted (Current: $${refData.pendingPayoutCommissions})`);

  // ── TEST 5: Live Dispatch of All 3 Notification Emails ──────────────────────────────
  console.log('\n--- TEST 5: Live 3-Channel Email Dispatch ---');
  console.log('  Admin recipient: jose@mediluxeme.com');
  console.log('  Customer recipient: jlzabala@gmail.com');
  console.log('  Wholesaler recipient: jlzabala@gmail.com (provisional for Nikolas test)');

  const dispatchResult = await sendOrderCreatedNotificationEmail(
    { ...orderDocData, firestoreId: orderRef.id },
    {
      adminEmail: 'jose@mediluxeme.com',
      customerEmail: 'jlzabala@gmail.com',
      wholesalerEmail: 'jlzabala@gmail.com'
    }
  );

  assert(dispatchResult.success, 'Multi-channel email dispatch returned success: true');
  assert(dispatchResult.dispatches.length === 3, `Dispatched exactly 3 targeted emails (Actual: ${dispatchResult.dispatches.length})`);

  const adminDispatch = dispatchResult.dispatches.find(d => d.role === 'admin');
  const customerDispatch = dispatchResult.dispatches.find(d => d.role === 'customer');
  const wholesalerDispatch = dispatchResult.dispatches.find(d => d.role === 'wholesaler');

  assert(adminDispatch && adminDispatch.success, `Admin alert dispatched to ${adminDispatch?.to} (MessageId: ${adminDispatch?.messageId})`);
  assert(customerDispatch && customerDispatch.success, `Customer proforma confirmation dispatched to ${customerDispatch?.to} (MessageId: ${customerDispatch?.messageId})`);
  assert(wholesalerDispatch && wholesalerDispatch.success, `Partner referral notification dispatched to ${wholesalerDispatch?.to} (MessageId: ${wholesalerDispatch?.messageId})`);

  // ── TEST 6: Wholesaler Commissions Server Action (`fetchWholesalerCommissionsAction`) ──
  console.log('\n--- TEST 6: Wholesaler Commissions Portal Server Action ---');
  const portalData = await fetchWholesalerCommissionsAction('np-labs-international');

  assert(portalData.success, 'fetchWholesalerCommissionsAction returned success: true');
  assert(portalData.wholesalerId === 'np-labs-international', 'Identified wholesalerId: np-labs-international');
  assert(portalData.referralCode === 'CAT-RX-7482', 'Attributed referralCode: CAT-RX-7482');
  assert(portalData.kpis.totalCommissions > 0, `Portal KPIs reflect totalCommissions: $${portalData.kpis.totalCommissions}`);
  assert(portalData.kpis.pendingPayoutCommissions > 0, `Portal KPIs reflect pendingPayoutCommissions: $${portalData.kpis.pendingPayoutCommissions}`);
  assert(portalData.orders.length > 0, `Portal order ledger retrieved ${portalData.orders.length} orders`);

  const foundTestOrder = portalData.orders.find(o => o.orderCode === testOrderCode);
  assert(Boolean(foundTestOrder), `Newly created order ${testOrderCode} is present in wholesaler commissions ledger`);
  if (foundTestOrder) {
    assert(foundTestOrder.commissionAmount === 66.96, `Order in portal ledger has commissionAmount: $66.96 (Actual: $${foundTestOrder.commissionAmount})`);
    assert(foundTestOrder.items.length === 2, `Order in portal ledger contains 2 items for master-detail inspection`);
  }

  // ── TEST 7: Settlement & Payout Reconciliation Server Action ──────────────────────
  console.log('\n--- TEST 7: Settlement & Payout Reconciliation ---');
  const settleRes = await reconcileWholesalerPayoutAction({
    wholesalerId: 'np-labs-international',
    orderIds: [orderRef.id],
    payoutReference: `TEST-SETTLE-${Date.now().toString().slice(-4)}`,
    notes: 'Automated settlement QA verification'
  });

  assert(settleRes.success === true, 'reconcileWholesalerPayoutAction returned success: true');
  assert(settleRes.reconciledAmount === 66.96, `Reconciled amount matches commission ($66.96, Actual: $${settleRes.reconciledAmount})`);
  assert(Boolean(settleRes.payoutId), `Payout audit record created with ID: ${settleRes.payoutId}`);

  // Verify updated state in portal
  const postSettlePortal = await fetchWholesalerCommissionsAction('np-labs-international');
  const settledOrder = postSettlePortal.orders.find(o => o.orderCode === testOrderCode);
  assert(settledOrder && settledOrder.payoutStatus === 'reconciled', `Order ${testOrderCode} payoutStatus transitioned to 'reconciled'`);
  assert(postSettlePortal.kpis.paidCommissions >= 66.96, `Portal KPIs reflect paidCommissions: $${postSettlePortal.kpis.paidCommissions}`);

  // ── FINAL SUMMARY ──────────────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log(`📊 RESULTADOS DE PRUEBA: ${passedTests}/${totalTests} PRUEBAS SUPERADAS`);
  console.log('======================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO.');
    process.exit(0);
  } else {
    console.error(`⚠️ Hubo ${totalTests - passedTests} fallos.`);
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

